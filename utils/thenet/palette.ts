// ============================================================
// "The Net" — the single source of truth for colour.
// ============================================================
//
// The credibility of the whole module rests on ONE fact: every orange is
// rendered from the same base colour — the identical constant, read by the
// material that draws all six fruit, by the proof panels, and by every demo
// canvas. Change the fruit colour HERE and nowhere else. Nothing downstream
// is allowed to invent its own orange.
//
// The value is deliberately ambiguous: a pale, slightly washed orange that a
// shopper would hesitate over in open air. That hesitation is the raw
// material; the net supplies the confidence.
export const BASE_ORANGE = '#D28C3E'

// The mesh bag. A hot, saturated red-orange — the industry's colour of
// "ripe". Assimilation drags every pixel of pale peel toward it.
export const NET_ORANGE = '#E8471A'

// Alternate net colours for the "in the wild" scene. GREEN pushes the same
// peel the other way — toward "not ready yet".
export const NET_GREEN = '#3E7A3A'

// The world. Near-black with warmth, never pure black.
export const BG = '#14110F'

// Neutral grey the proof swatches sit on, so nothing around a sample can
// tint the reading.
export const PROOF_GREY = '#7C7873'

// Type contrast rungs.
export const TEXT_QUIET = '#8A8480' // body / low-contrast copy
export const TEXT_LOUD = '#F1ECE6' // key lines only

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
