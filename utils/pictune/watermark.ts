import { WATERMARK_H } from "./protocol";

export function paintWatermark(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const y0 = height - WATERMARK_H;
  ctx.save();
  ctx.fillStyle = "#0A0A0C";
  ctx.fillRect(0, y0, width, WATERMARK_H);
  ctx.fillStyle = "#CCFF00";
  ctx.fillRect(0, y0, width, 2);

  const pad = 14;
  const mid = y0 + WATERMARK_H / 2;

  drawNote(ctx, pad + 10, mid, 11);
  ctx.fillStyle = "#F2F4F0";
  ctx.font = "600 13px Outfit, Archivo, Helvetica, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("PicTune", pad + 28, mid);
  ctx.fillStyle = "#8A8F86";
  ctx.font = "500 12px Outfit, Archivo, Helvetica, sans-serif";
  const labelW = ctx.measureText("PicTune").width;
  ctx.fillText("|  pictune.in", pad + 36 + labelW, mid);

  paintBarcode(ctx, width, y0, width, height);
  ctx.restore();
}

function drawNote(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
) {
  ctx.fillStyle = "#CCFF00";
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.28, s * 0.38, s * 0.26, -0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x + s * 0.28, y - s * 0.72, 2, s);
  ctx.beginPath();
  ctx.moveTo(x + s * 0.28, y - s * 0.72);
  ctx.quadraticCurveTo(x + s * 0.9, y - s * 0.55, x + s * 0.7, y - s * 0.15);
  ctx.lineTo(x + s * 0.28, y - s * 0.22);
  ctx.closePath();
  ctx.fill();
}

function paintBarcode(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  imgW: number,
  y0: number,
  width: number,
  height: number,
) {
  const bits: number[] = [];
  push16(bits, imgW);
  push16(bits, height);
  let parity = 0;
  for (const b of bits) parity ^= b;
  bits.push(parity);
  const cell = 4;
  const barW = bits.length * cell;
  let x = width - 12 - barW;
  const y = y0 + 16;
  for (const b of bits) {
    ctx.fillStyle = b ? "#CCFF00" : "#1A1C16";
    ctx.fillRect(x, y, cell - 1, 20);
    x += cell;
  }
}

function push16(bits: number[], n: number) {
  for (let i = 15; i >= 0; i--) bits.push((n >> i) & 1);
}

export function readSizeBarcode(
  rgba: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
): { width: number; height: number } | null {
  const bitsN = 33;
  const cell = 4;
  const barW = bitsN * cell;
  const x0 = width - 12 - barW;
  const y = height - WATERMARK_H + 16 + 10;
  if (x0 < 0 || y < 0 || y >= height) return null;
  const bits: number[] = [];
  for (let i = 0; i < bitsN; i++) {
    const x = Math.min(width - 1, x0 + i * cell + 1);
    const o = (y * width + x) * 4;
    const g = 0.299 * (rgba[o] ?? 0) + 0.587 * (rgba[o + 1] ?? 0) + 0.114 * (rgba[o + 2] ?? 0);
    bits.push(g > 80 ? 1 : 0);
  }
  let parity = 0;
  for (let i = 0; i < 32; i++) parity ^= bits[i]!;
  if (parity !== bits[32]) return null;
  let w = 0;
  let h = 0;
  for (let i = 0; i < 16; i++) w = (w << 1) | bits[i]!;
  for (let i = 16; i < 32; i++) h = (h << 1) | bits[i]!;
  if (w < 64 || h < 64 || w > 4096 || h > 4096) return null;
  return { width: w, height: h };
}
