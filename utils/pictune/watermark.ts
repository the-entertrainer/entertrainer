import { WATERMARK_H } from "./protocol";

export function paintWatermark(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const y0 = height - WATERMARK_H;
  ctx.save();
  ctx.fillStyle = "rgba(11,11,12,0.42)";
  ctx.fillRect(0, y0, width, WATERMARK_H);

  const pad = 12;
  const y = y0 + WATERMARK_H / 2;
  const x = width - pad;

  ctx.fillStyle = "#F2F2F4";
  ctx.font = "500 11px Archivo, Helvetica, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText("pictune", x, y);

  const markX = x - ctx.measureText("pictune").width - 24;
  const s = 16;
  ctx.fillStyle = "#FFD43B";
  roundRectPath(ctx, markX, y - s / 2, s * 0.22, s, 2);
  ctx.fill();
  roundRectPath(ctx, markX, y - s / 2, s, s * 0.22, 2);
  ctx.fill();
  ctx.strokeStyle = "#FFD43B";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(markX + s * 0.62, y + 1, s * 0.28, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function roundRectPath(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
