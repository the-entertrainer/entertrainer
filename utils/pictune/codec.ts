import {
  HEADER_BYTES,
  PicTuneError,
  WATERMARK_H,
  mulberry32,
  packHeader,
  pcmCrc,
  seedFromSize,
  unpackHeader,
  type PicTuneHeader,
} from "./protocol";
import { bilinearResize, capacityBytes, fitCanvas, psnrRgb, usableHeight } from "./image";
import { encodePngRgb } from "./png";

export interface EncodeInput {
  rgba: Uint8ClampedArray;
  width: number;
  height: number;
  pcm: Int16Array;
  sampleRate: number;
  stampWatermark?: boolean;
}

export interface EncodeOutput {
  png: Uint8Array;
  rgba: Uint8ClampedArray;
  width: number;
  height: number;
  header: PicTuneHeader;
  psnr: number;
}

export interface DecodeOutput {
  pcm: Int16Array;
  header: PicTuneHeader;
  width: number;
  height: number;
  crcOk: boolean;
  rgba: Uint8ClampedArray;
}

function shuffledOrder(width: number, height: number): Uint32Array {
  const n = width * usableHeight(height);
  const idx = new Uint32Array(n);
  for (let i = 0; i < n; i++) idx[i] = i;
  const rng = mulberry32(seedFromSize(width, height));
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = idx[i]!;
    idx[i] = idx[j]!;
    idx[j] = t;
  }
  return idx;
}

function setLsbMatch(value: number, bit: number, rand: number): number {
  if ((value & 1) === bit) return value;
  if (value === 0) return 1;
  if (value === 255) return 254;
  return value + (rand < 0.5 ? -1 : 1);
}

function embedBits(rgba: Uint8ClampedArray, width: number, height: number, payload: Uint8Array): void {
  const order = shuffledOrder(width, height);
  const rng = mulberry32(seedFromSize(width, height) ^ 0x9e3779b9);
  let bitI = 0;
  const totalBits = payload.length * 8;
  for (let p = 0; p < order.length && bitI < totalBits; p++) {
    const pix = order[p]!;
    const o = pix * 4;
    for (let c = 0; c < 3 && bitI < totalBits; c++) {
      const byte = payload[bitI >> 3]!;
      const bit = (byte >> (7 - (bitI & 7))) & 1;
      rgba[o + c] = setLsbMatch(rgba[o + c]!, bit, rng());
      bitI++;
    }
  }
  if (bitI < totalBits) throw new PicTuneError("this photo is too small for that take.");
}

function extractBits(rgba: Uint8ClampedArray | Uint8Array, width: number, height: number, nBytes: number): Uint8Array {
  const order = shuffledOrder(width, height);
  const out = new Uint8Array(nBytes);
  let bitI = 0;
  const totalBits = nBytes * 8;
  for (let p = 0; p < order.length && bitI < totalBits; p++) {
    const pix = order[p]!;
    const o = pix * 4;
    for (let c = 0; c < 3 && bitI < totalBits; c++) {
      const bit = rgba[o + c]! & 1;
      out[bitI >> 3] |= bit << (7 - (bitI & 7));
      bitI++;
    }
  }
  return out;
}

function dimWatermarkBand(rgba: Uint8ClampedArray, width: number, height: number): void {
  const y0 = Math.max(0, height - WATERMARK_H);
  for (let y = y0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      rgba[o] = Math.round(rgba[o]! * 0.22);
      rgba[o + 1] = Math.round(rgba[o + 1]! * 0.22);
      rgba[o + 2] = Math.round(rgba[o + 2]! * 0.22);
      rgba[o + 3] = 255;
    }
  }
}

export function pngFromRgba(
  rgba: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  const rgb = new Uint8Array(width * height * 3);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    rgb[j] = rgba[i]!;
    rgb[j + 1] = rgba[i + 1]!;
    rgb[j + 2] = rgba[i + 2]!;
  }
  return encodePngRgb(width, height, rgb, {
    Software: "pictune",
    "PT-Magic": "PICTUNE1",
  });
}

export function encodePicTune(input: EncodeInput): EncodeOutput {
  const payloadPcm = new Uint8Array(input.pcm.length * 2);
  for (let i = 0; i < input.pcm.length; i++) {
    const s = input.pcm[i]!;
    payloadPcm[i * 2] = s & 0xff;
    payloadPcm[i * 2 + 1] = (s >> 8) & 0xff;
  }
  const header = packHeader({
    sampleRate: input.sampleRate,
    channels: 1,
    frameCount: input.pcm.length,
    crc32: pcmCrc(input.pcm),
    durationMs: Math.round((input.pcm.length / input.sampleRate) * 1000),
  });
  const blob = new Uint8Array(HEADER_BYTES + payloadPcm.length);
  blob.set(header, 0);
  blob.set(payloadPcm, HEADER_BYTES);

  const need = blob.length;
  const fitted = fitCanvas(input.width, input.height, need);
  let rgba =
    fitted.width === input.width && fitted.height === input.height
      ? input.rgba.slice()
      : bilinearResize(input.rgba, input.width, input.height, fitted.width, fitted.height);
  const original = rgba.slice();
  if (capacityBytes(fitted.width, fitted.height) < need) {
    throw new PicTuneError("this take is too long for that photo.");
  }
  embedBits(rgba, fitted.width, fitted.height, blob);
  if (input.stampWatermark !== false) dimWatermarkBand(rgba, fitted.width, fitted.height);
  const parsed = unpackHeader(header);
  const psnr = psnrRgb(original, rgba, fitted.width, fitted.height);
  const png = pngFromRgba(rgba, fitted.width, fitted.height);
  return { png, rgba, width: fitted.width, height: fitted.height, header: parsed, psnr };
}

export function decodePicTune(
  rgba: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
): DecodeOutput {
  const head = extractBits(rgba, width, height, HEADER_BYTES);
  const header = unpackHeader(head);
  const payloadBytes = header.frameCount * 2;
  if (capacityBytes(width, height) < HEADER_BYTES + payloadBytes) {
    throw new PicTuneError("this pictune looks cropped.");
  }
  const all = extractBits(rgba, width, height, HEADER_BYTES + payloadBytes);
  const pcmBytes = all.subarray(HEADER_BYTES);
  const pcm = new Int16Array(header.frameCount);
  for (let i = 0; i < header.frameCount; i++) {
    let v = pcmBytes[i * 2]! | (pcmBytes[i * 2 + 1]! << 8);
    if (v & 0x8000) v |= ~0xffff;
    pcm[i] = v;
  }
  const crcOk = pcmCrc(pcm) === header.crc32;
  const copy = rgba instanceof Uint8ClampedArray ? rgba : new Uint8ClampedArray(rgba);
  return { pcm, header, width, height, crcOk, rgba: copy };
}

export function rgbaFromRgb(rgb: Uint8Array, width: number, height: number): Uint8ClampedArray {
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let i = 0, j = 0; i < rgb.length; i += 3, j += 4) {
    rgba[j] = rgb[i]!;
    rgba[j + 1] = rgb[i + 1]!;
    rgba[j + 2] = rgb[i + 2]!;
    rgba[j + 3] = 255;
  }
  return rgba;
}
