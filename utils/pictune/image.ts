import { HEADER_BYTES, MAX_SIDE, MIN_SIDE, TARGET_RATE, WATERMARK_H } from "./protocol";

export function usableHeight(height: number): number {
  return Math.max(8, height - WATERMARK_H);
}

export function capacityBytes(width: number, height: number): number {
  return Math.floor((width * usableHeight(height) * 3) / 8);
}

export function holdableSeconds(width: number, height: number, rate = TARGET_RATE): number {
  return Math.max(0, capacityBytes(width, height) - HEADER_BYTES) / (2 * rate);
}

export function psnrRgb(
  a: Uint8ClampedArray | Uint8Array,
  b: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  channels = 4,
  skipBottom = WATERMARK_H,
): number {
  const rows = Math.max(1, height - skipBottom);
  let sse = 0;
  let n = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * channels;
      for (let c = 0; c < 3; c++) {
        const d = (a[o + c] ?? 0) - (b[o + c] ?? 0);
        sse += d * d;
        n++;
      }
    }
  }
  if (n === 0) return 0;
  const mse = sse / n;
  if (mse < 1e-12) return 99;
  return 10 * Math.log10((255 * 255) / mse);
}

export function bilinearResize(
  src: Uint8ClampedArray,
  sw: number,
  sh: number,
  dw: number,
  dh: number,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(dw * dh * 4);
  const xRatio = (sw - 1) / Math.max(1, dw - 1);
  const yRatio = (sh - 1) / Math.max(1, dh - 1);
  for (let y = 0; y < dh; y++) {
    const fy = y * yRatio;
    const y0 = Math.floor(fy);
    const y1 = Math.min(sh - 1, y0 + 1);
    const wy = fy - y0;
    for (let x = 0; x < dw; x++) {
      const fx = x * xRatio;
      const x0 = Math.floor(fx);
      const x1 = Math.min(sw - 1, x0 + 1);
      const wx = fx - x0;
      const o = (y * dw + x) * 4;
      for (let c = 0; c < 4; c++) {
        const p00 = src[(y0 * sw + x0) * 4 + c]!;
        const p10 = src[(y0 * sw + x1) * 4 + c]!;
        const p01 = src[(y1 * sw + x0) * 4 + c]!;
        const p11 = src[(y1 * sw + x1) * 4 + c]!;
        const top = p00 * (1 - wx) + p10 * wx;
        const bot = p01 * (1 - wx) + p11 * wx;
        out[o + c] = Math.round(top * (1 - wy) + bot * wy);
      }
    }
  }
  return out;
}

export function fitCanvas(width: number, height: number, needBytes: number): { width: number; height: number } {
  let w = Math.max(MIN_SIDE, width);
  let h = Math.max(MIN_SIDE, height);
  const aspect = width / Math.max(1, height);
  while (capacityBytes(w, h) < needBytes) {
    w = Math.min(MAX_SIDE, w + 64);
    h = Math.min(MAX_SIDE, Math.round(w / aspect));
    if (h < MIN_SIDE) h = MIN_SIDE;
    if (w >= MAX_SIDE && capacityBytes(w, h) < needBytes) {
      h = Math.min(MAX_SIDE, h + 64);
    }
    if (w >= MAX_SIDE && h >= MAX_SIDE) break;
  }
  return { width: w, height: h };
}

export function makeDemoPhoto(width = 960, height = 720): Uint8ClampedArray {
  const out = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const v = y / height;
      const r = Math.hypot(u - 0.38, v - 0.42);
      const glow = Math.max(0, 1 - r * 1.7);
      const lamp = Math.max(0, 1 - Math.hypot(u - 0.72, v - 0.28) * 3.4);
      const grain = ((x * 374761 + y * 668265) >>> 0) % 17;
      const R = Math.round(14 + glow * 210 + lamp * 40 + grain);
      const G = Math.round(12 + glow * 118 + (1 - v) * 28 + grain * 0.4);
      const B = Math.round(22 + (1 - glow) * 70 + v * 36);
      const o = (y * width + x) * 4;
      out[o] = Math.min(255, R);
      out[o + 1] = Math.min(255, G);
      out[o + 2] = Math.min(255, B);
      out[o + 3] = 255;
    }
  }
  return out;
}
