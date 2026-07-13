// Small, dependency-free color helpers shared by state generation and the
// neumorphism/glass style builders. Everything works in HSL because the
// state transforms (lighten on hover, darken on press...) are much more
// predictable there than nudging raw RGB channels.

export interface Rgb { r: number; g: number; b: number }
export interface Hsl { h: number; s: number; l: number }

export function parseColor(input: string): Rgb {
  const s = input.trim()
  if (s.startsWith('#')) return hexToRgb(s)
  const m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i)
  if (m) return { r: +m[1], g: +m[2], b: +m[3] }
  return { r: 128, g: 128, b: 128 }
}

export function hexToRgb(hex: string): Rgb {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  const num = parseInt(h, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  const d = max - min
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r: h = 60 * (((g - b) / d) % 6); break
      case g: h = 60 * ((b - r) / d + 2); break
      default: h = 60 * ((r - g) / d + 4)
    }
  }
  if (h < 0) h += 360
  return { h, s, l }
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x } else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x } else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c } else { r = c; b = x }
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }
}

export function hexToHsl(hex: string): Hsl {
  return rgbToHsl(parseColor(hex))
}

export function hslToHex(hsl: Hsl): string {
  return rgbToHex(hslToRgb(hsl))
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

/** amount in 0..1 — moves lightness toward 1 (white) */
export function lighten(hex: string, amount: number): string {
  const hsl = hexToHsl(hex)
  hsl.l = clamp(hsl.l + amount * (1 - hsl.l), 0, 1)
  return hslToHex(hsl)
}

/** amount in 0..1 — moves lightness toward 0 (black) */
export function darken(hex: string, amount: number): string {
  const hsl = hexToHsl(hex)
  hsl.l = clamp(hsl.l * (1 - amount), 0, 1)
  return hslToHex(hsl)
}

/** amount in 0..1 — pulls saturation toward 0 (gray) */
export function desaturate(hex: string, amount: number): string {
  const hsl = hexToHsl(hex)
  hsl.s = clamp(hsl.s * (1 - amount), 0, 1)
  return hslToHex(hsl)
}

/** rotates hue toward `targetHue` by `amount` (0..1) — used for the "visited" accent shift */
export function hueShiftTowards(hex: string, targetHue: number, amount: number): string {
  const hsl = hexToHsl(hex)
  let diff = targetHue - hsl.h
  diff = ((diff + 540) % 360) - 180 // shortest angular distance
  hsl.h = (hsl.h + diff * amount + 360) % 360
  return hslToHex(hsl)
}

export function mix(hexA: string, hexB: string, amount: number): string {
  const a = parseColor(hexA), b = parseColor(hexB)
  return rgbToHex({
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount
  })
}

/**
 * Mirrors CSS `filter: brightness()` — a straight RGB channel multiply.
 * Used (instead of the real CSS filter) so state colors bake identically
 * into the live preview and the offscreen PNG export: html2canvas has no
 * support for the `filter` CSS property, so exported states would silently
 * lose their hover/press/disabled treatment if we relied on it.
 */
export function adjustBrightness(hex: string, factor: number): string {
  const { r, g, b } = parseColor(hex)
  return rgbToHex({ r: r * factor, g: g * factor, b: b * factor })
}

/** Mirrors CSS `filter: saturate()` in HSL space — factor 1 = unchanged, 0 = gray, >1 = more vivid. */
export function adjustSaturation(hex: string, factor: number): string {
  const hsl = hexToHsl(hex)
  hsl.s = factor <= 1 ? clamp(hsl.s * factor, 0, 1) : clamp(hsl.s + (factor - 1) * (1 - hsl.s), 0, 1)
  return hslToHex(hsl)
}

/** Mirrors CSS `filter: hue-rotate()` — an additive rotation in degrees. */
export function rotateHue(hex: string, degrees: number): string {
  if (!degrees) return hex
  const hsl = hexToHsl(hex)
  hsl.h = (hsl.h + degrees + 360) % 360
  return hslToHex(hsl)
}

export function toRgba(hex: string, alpha: number): string {
  const { r, g, b } = parseColor(hex)
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${clamp(alpha, 0, 1)})`
}

/** Perceived luminance, 0 (black) - 1 (white) — used to decide light/dark shadow pairing for neumorphism. */
export function luminance(hex: string): number {
  const { r, g, b } = parseColor(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export function isLight(hex: string): boolean {
  return luminance(hex) > 0.6
}
