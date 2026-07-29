/**
 * Canvas helpers shared by the concept `face()` painters.
 *
 * Type is drawn into the card's own canvas rather than composited in the
 * shader, because a shader can warp, screen and tear a typeset surface far
 * more convincingly than it can invent one — the halftone in Press and the
 * signal tearing in Signal both operate on real set type this way.
 */

/** Draw an image cropped to fill a box, never stretched. */
export function cover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number
) {
  const ir = img.naturalWidth / img.naturalHeight
  const br = w / h
  let sw = img.naturalWidth, sh = img.naturalHeight, sx = 0, sy = 0
  if (ir > br) { sw = img.naturalHeight * br; sx = (img.naturalWidth - sw) / 2 }
  else { sh = img.naturalWidth / br; sy = (img.naturalHeight - sh) / 2 }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

/** Draw an image whole inside a box, letterboxed, never cropped. */
export function contain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number
) {
  const ir = img.naturalWidth / img.naturalHeight
  let dw = w, dh = w / ir
  if (dh > h) { dh = h; dw = h * ir }
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
}

export function tracked(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number, spacing: number
) {
  let cx = x
  for (const ch of text) {
    ctx.fillText(ch, cx, y)
    cx += ctx.measureText(ch).width + spacing
  }
}

export function trackedWidth(ctx: CanvasRenderingContext2D, text: string, spacing: number) {
  let w = 0
  for (const ch of text) w += ctx.measureText(ch).width + spacing
  return w - spacing
}

/** Wrap text to a width, returning the lines. */
export function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w }
    else line = test
  }
  if (line) lines.push(line)
  return lines
}

export const MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace'
export const SANS = '"Archivo", "DM Sans", "Helvetica Neue", Arial, sans-serif'
export const SERIF = '"Instrument Serif", Georgia, "Times New Roman", serif'
