import { EMBED_BINS, dct8, idct8, jpegQuantTable, qimEmbed, qimExtract, rgbToYcbcr, ycbcrToRgb } from "./dct";
import { ECC_COPIES, PicTuneError, QIM_DELTA, SYNC_BITS, WATERMARK_H } from "./protocol";
import { barker16, protect, recover } from "./ecc";

export function usableHeight(height: number): number {
  return Math.max(8, height - WATERMARK_H);
}

export function blockGrid(width: number, height: number): { cols: number; rows: number } {
  return { cols: Math.floor(width / 8), rows: Math.floor(usableHeight(height) / 8) };
}

export function capacityBits(width: number, height: number): number {
  const { cols, rows } = blockGrid(width, height);
  return Math.max(0, cols * rows * EMBED_BINS.length - SYNC_BITS);
}

export function protectedBytesFor(payload: number): number {
  return 4 + (4 + payload) * ECC_COPIES;
}

export function capacityBytes(width: number, height: number): number {
  const bytes = Math.floor(capacityBits(width, height) / 8);
  return Math.max(0, Math.floor((bytes - 4 - 4 * ECC_COPIES) / ECC_COPIES));
}

function readBlock(rgba: Uint8ClampedArray | Uint8Array, width: number, bx: number, by: number, yBlock: Float64Array, cb: Float64Array, cr: Float64Array) {
  const x0 = bx * 8;
  const y0 = by * 8;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const o = ((y0 + y) * width + (x0 + x)) * 4;
      const [Y, Cb, Cr] = rgbToYcbcr(rgba[o]!, rgba[o + 1]!, rgba[o + 2]!);
      yBlock[y * 8 + x] = Y - 128;
      cb[y * 8 + x] = Cb;
      cr[y * 8 + x] = Cr;
    }
  }
}

function writeBlock(rgba: Uint8ClampedArray, width: number, bx: number, by: number, yBlock: Float64Array, cb: Float64Array, cr: Float64Array) {
  const x0 = bx * 8;
  const y0 = by * 8;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const o = ((y0 + y) * width + (x0 + x)) * 4;
      const [r, g, b] = ycbcrToRgb(yBlock[y * 8 + x]! + 128, cb[y * 8 + x]!, cr[y * 8 + x]!);
      rgba[o] = r;
      rgba[o + 1] = g;
      rgba[o + 2] = b;
    }
  }
}

function walkSlots(width: number, height: number) {
  const { cols, rows } = blockGrid(width, height);
  const slots: Array<{ bx: number; by: number; bin: number }> = [];
  for (let by = 0; by < rows; by++) {
    for (let bx = 0; bx < cols; bx++) {
      for (const bin of EMBED_BINS) slots.push({ bx, by, bin });
    }
  }
  return slots;
}

export function embedPayload(rgba: Uint8ClampedArray, width: number, height: number, payload: Uint8Array): void {
  const protectedBytes = protect(payload, ECC_COPIES);
  const bits: number[] = [...barker16()];
  for (let i = 0; i < protectedBytes.length; i++) {
    const v = protectedBytes[i]!;
    for (let b = 7; b >= 0; b--) bits.push((v >> b) & 1);
  }
  const slots = walkSlots(width, height);
  if (slots.length < bits.length) throw new PicTuneError("this photo is too small for that take.");

  const spatial = new Float64Array(64);
  const coeff = new Float64Array(64);
  const cb = new Float64Array(64);
  const cr = new Float64Array(64);
  let lastBx = -1;
  let lastBy = -1;

  const flush = (bx: number, by: number) => {
    idct8(coeff, spatial);
    writeBlock(rgba, width, bx, by, spatial, cb, cr);
  };

  for (let i = 0; i < bits.length; i++) {
    const s = slots[i]!;
    if (s.bx !== lastBx || s.by !== lastBy) {
      if (lastBx >= 0) flush(lastBx, lastBy);
      readBlock(rgba, width, s.bx, s.by, spatial, cb, cr);
      dct8(spatial, coeff);
      lastBx = s.bx;
      lastBy = s.by;
    }
    coeff[s.bin] = qimEmbed(coeff[s.bin]!, bits[i]!, QIM_DELTA);
  }
  if (lastBx >= 0) flush(lastBx, lastBy);
}

function bitsToBytes(bits: number[]): Uint8Array {
  const n = Math.floor(bits.length / 8);
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    let v = 0;
    for (let b = 0; b < 8; b++) v = (v << 1) | bits[i * 8 + b]!;
    out[i] = v;
  }
  return out;
}

export function extractPayload(rgba: Uint8ClampedArray | Uint8Array, width: number, height: number): Uint8Array {
  const slots = walkSlots(width, height);
  const spatial = new Float64Array(64);
  const coeff = new Float64Array(64);
  const cb = new Float64Array(64);
  const cr = new Float64Array(64);
  const bits: number[] = [];
  let lastBx = -1;
  let lastBy = -1;
  for (const s of slots) {
    if (s.bx !== lastBx || s.by !== lastBy) {
      readBlock(rgba, width, s.bx, s.by, spatial, cb, cr);
      dct8(spatial, coeff);
      lastBx = s.bx;
      lastBy = s.by;
    }
    bits.push(qimExtract(coeff[s.bin]!, QIM_DELTA));
  }
  const sync = barker16();
  let ok = 0;
  for (let i = 0; i < SYNC_BITS; i++) if (bits[i] === sync[i]) ok++;
  if (ok < 12) throw new PicTuneError("this photo isn't a pictune.");
  const recovered = recover(bitsToBytes(bits.slice(SYNC_BITS)), ECC_COPIES);
  if (!recovered) throw new PicTuneError("couldn't hear this pictune — send the original file, or a screenshot of it.");
  return recovered;
}

export function jpegDisturb(rgba: Uint8ClampedArray, width: number, height: number, quality: number): Uint8ClampedArray {
  const table = jpegQuantTable(quality);
  const out = rgba.slice();
  const spatial = new Float64Array(64);
  const coeff = new Float64Array(64);
  const cb = new Float64Array(64);
  const cr = new Float64Array(64);
  const cols = Math.floor(width / 8);
  const rows = Math.floor(height / 8);
  for (let by = 0; by < rows; by++) {
    for (let bx = 0; bx < cols; bx++) {
      readBlock(out, width, bx, by, spatial, cb, cr);
      dct8(spatial, coeff);
      for (let i = 0; i < 64; i++) {
        const q = table[i]!;
        coeff[i] = Math.round(coeff[i]! / q) * q;
      }
      idct8(coeff, spatial);
      writeBlock(out, width, bx, by, spatial, cb, cr);
    }
  }
  return out;
}
