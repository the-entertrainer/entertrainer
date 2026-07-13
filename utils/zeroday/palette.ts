// ============================================================
// DOOMBOX — the single source of truth for colour.
// ============================================================
//
// The officers are PURPLE (antispam/antivirus). The server world is a cold
// blue-black machine hall. Threats glow toxic — spam green and virus red —
// so the eye finds them the way it should. The HUD borrows the CRT amber of
// a terminal that has been running too long.

export const OFFICER = '#7C4DFF' // the purple antispam/antivirus officer
export const OFFICER_DARK = '#4A2FA8'

export const SPAM = '#39FF88' // toxic spam green (threat glow)
export const VIRUS = '#FF3B5C' // virus red (threat glow)

export const WALL_A = '#20304A' // server-rack wall, lit face
export const WALL_B = '#16223A' // server-rack wall, shaded face
export const FLOOR = '#0C1220'
export const CEIL = '#080B14'
export const BG = '#05060B' // the void behind everything

export const HUD = '#FFB627' // CRT amber
export const HUD_DIM = '#8A6410'
export const INK = '#E8ECF5' // loud text
export const INK_QUIET = '#8792AB' // body text

// --- helpers -------------------------------------------------

/** '#rrggbb' -> [r,g,b] in 0..255. */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

/** Multiply an rgb triple toward black by f (0..1). Cheap distance shading. */
export function shade(rgb: [number, number, number], f: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n * f)))
  return `rgb(${c(rgb[0])},${c(rgb[1])},${c(rgb[2])})`
}
