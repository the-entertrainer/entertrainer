// ============================================================
// "The Net" — the single source of truth for colour.
// ============================================================
//
// The credibility of this whole module rests on ONE fact: every orange is
// rendered from the same base colour. Not "colours that look close" — the
// identical constant, read by the material that draws all six fruit and by
// the proof panel's peel swatch. If you want to change the fruit colour,
// change it HERE and nowhere else. Nothing downstream is allowed to invent
// its own orange.
export const BASE_ORANGE = '#C67A38'

// The mesh bag. A hotter, redder orange than the fruit — this is the colour
// that does the lying. Assimilation drags the neutral peel toward it, so a
// fruit under dense netting reads riper than the same fruit in the open.
export const NET_ORANGE = '#E24E12'

// The world. Near-black, never pure black.
export const BG = '#14110F'

// Neutral grey the proof swatches sit on, so nothing around the sample can
// tint the reading.
export const PROOF_GREY = '#7C7873'

// Type contrast rungs.
export const TEXT_QUIET = '#8A8480' // body / low-contrast copy
export const TEXT_LOUD = '#F1ECE6' // the revealed line only

// --- helpers -------------------------------------------------

/** '#rrggbb' -> [r,g,b] in 0..255. */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16)
  ]
}

/** [r,g,b] 0..255 -> '#RRGGBB' (upper-case, canvas-eyedropper friendly). */
export function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.round(n).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase()
}
