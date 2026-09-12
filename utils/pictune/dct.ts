/** JPEG-style 8×8 DCT-II (separable) plus luma QIM helpers. */

const N = 8;
const C = new Float64Array(N * N);
const TMP = new Float64Array(64);
const A0 = 1 / Math.SQRT2;

(function init() {
  for (let k = 0; k < N; k++) {
    const a = k === 0 ? A0 : 1;
    for (let n = 0; n < N; n++) C[k * N + n] = a * Math.cos(((2 * n + 1) * k * Math.PI) / 16);
  }
})();

export function dct8(block: Float64Array, out: Float64Array): void {
  for (let y = 0; y < N; y++) {
    const row = y * N;
    for (let u = 0; u < N; u++) {
      let s = 0;
      const crow = u * N;
      for (let x = 0; x < N; x++) s += block[row + x]! * C[crow + x]!;
      TMP[y * N + u] = s;
    }
  }
  for (let v = 0; v < N; v++) {
    const crow = v * N;
    for (let u = 0; u < N; u++) {
      let s = 0;
      for (let y = 0; y < N; y++) s += TMP[y * N + u]! * C[crow + y]!;
      out[v * N + u] = s * 0.25;
    }
  }
}

export function idct8(coeff: Float64Array, out: Float64Array): void {
  for (let v = 0; v < N; v++) {
    const row = v * N;
    for (let x = 0; x < N; x++) {
      let s = 0;
      for (let u = 0; u < N; u++) s += coeff[row + u]! * C[u * N + x]!;
      TMP[v * N + x] = s;
    }
  }
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let s = 0;
      for (let v = 0; v < N; v++) s += TMP[v * N + x]! * C[v * N + y]!;
      out[y * N + x] = s * 0.25;
    }
  }
}

const LUMA_Q50 = [
  16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99,
];

export function jpegQuantTable(quality: number): Float64Array {
  const q = Math.max(1, Math.min(100, quality));
  const s = q < 50 ? 5000 / q : 200 - q * 2;
  const out = new Float64Array(64);
  for (let i = 0; i < 64; i++) {
    out[i] = Math.max(1, Math.min(255, Math.floor((LUMA_Q50[i]! * s + 50) / 100)));
  }
  return out;
}

export function qimEmbed(c: number, bit: number, delta: number): number {
  let q = Math.round(c / delta);
  if ((q & 1) !== bit) q += c >= q * delta ? 1 : -1;
  return q * delta;
}

export function qimExtract(c: number, delta: number): number {
  return Math.round(c / delta) & 1;
}

export const EMBED_BINS = [10, 17, 18, 25, 11];

export function rgbToYcbcr(r: number, g: number, b: number): [number, number, number] {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return [y, cb, cr];
}

export function ycbcrToRgb(y: number, cb: number, cr: number): [number, number, number] {
  const r = y + 1.402 * (cr - 128);
  const g = y - 0.344136 * (cb - 128) - 0.714136 * (cr - 128);
  const b = y + 1.772 * (cb - 128);
  return [
    Math.max(0, Math.min(255, r)),
    Math.max(0, Math.min(255, g)),
    Math.max(0, Math.min(255, b)),
  ];
}
