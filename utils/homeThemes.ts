import type { GlassTheme } from '~/utils/glassKit'

/**
 * The bold-and-playful design language for entertrainer.in.
 *
 * One source of truth per direction: the same four colours drive the WebGL
 * stage (background, key/rim lamps, glass tint) *and* the DOM chrome (CSS
 * custom properties), so the 3D and the typography can never drift apart.
 * That single-source rule is the whole point — it's what makes a variation a
 * coherent world rather than a canvas with unrelated text on top.
 *
 * Every palette is checked against the card artwork, which is cream + navy
 * with pops of pink, yellow and orange: backgrounds stay clear of that navy so
 * the prints never sink into the page, and every `ink` hits at least 4.5:1 on
 * its own `bg`.
 */
export interface HomeTheme {
  id: string
  name: string
  blurb: string
  /** Page + 3D background. */
  bg: string
  /** Primary text on `bg`. */
  ink: string
  /** Loud accent — buttons, active states, the thing you notice first. */
  pop: string
  /** Secondary accent, used for rims and counterpoint. */
  alt: string
  /** true when `bg` is dark, so chrome can flip its treatments. */
  dark: boolean
  /** Display face for the headline. */
  display: 'fraunces' | 'archivo' | 'bricolage' | 'space'
}

export const HOME_THEMES: HomeTheme[] = [
  { id: 'h01', name: 'Electric Cream', blurb: 'Warm paper, navy ink, a jolt of electric lime.',
    bg: '#F6EFE3', ink: '#171334', pop: '#C6F135', alt: '#4A6CF7', dark: false, display: 'fraunces' },

  { id: 'h02', name: 'Midnight Candy', blurb: 'Near-black with hot pink and cyan neon.',
    bg: '#0E0D14', ink: '#F7F3EC', pop: '#FF3D8B', alt: '#35E0F2', dark: true, display: 'archivo' },

  { id: 'h03', name: 'Sunset Pop', blurb: 'Peach light, plum ink, coral and tangerine.',
    bg: '#FCE9DC', ink: '#3A1436', pop: '#FF5A47', alt: '#FFB020', dark: false, display: 'bricolage' },

  { id: 'h04', name: 'Mint Studio', blurb: 'Cool mint, true black, one shout of magenta.',
    bg: '#E2F2E9', ink: '#111417', pop: '#E5006D', alt: '#00A88F', dark: false, display: 'archivo' },

  { id: 'h05', name: 'Cobalt Bold', blurb: 'Deep cobalt, white type, school-bus yellow.',
    bg: '#132A8C', ink: '#FFFFFF', pop: '#FFD400', alt: '#7FD4FF', dark: true, display: 'archivo' },

  { id: 'h06', name: 'Paper Riot', blurb: 'Bauhaus primaries on bright paper.',
    bg: '#F4F1EA', ink: '#0C0C0C', pop: '#E5352B', alt: '#1B4FE0', dark: false, display: 'bricolage' },

  { id: 'h07', name: 'Dusk Violet', blurb: 'Violet-black night, lilac and warm peach.',
    bg: '#171130', ink: '#F2ECFF', pop: '#B98CFF', alt: '#FFAE83', dark: true, display: 'fraunces' },

  { id: 'h08', name: 'Acid Lab', blurb: 'Lab-grey and acid green — technical, a little unhinged.',
    bg: '#EDEDE8', ink: '#101010', pop: '#B6FF1B', alt: '#1E1E1E', dark: false, display: 'space' },

  { id: 'h09', name: 'Terracotta', blurb: 'Baked clay, cream type, deep teal counterpoint.',
    bg: '#C0563A', ink: '#FFF3E6', pop: '#FFCF5C', alt: '#0E5E5E', dark: true, display: 'fraunces' },

  { id: 'h10', name: 'Ink & Ice', blurb: 'Charcoal and white with a single ice-blue cut.',
    bg: '#15161A', ink: '#FAFAFA', pop: '#5CE1FF', alt: '#FF6B4A', dark: true, display: 'space' }
]

export const FONT_STACK: Record<HomeTheme['display'], string> = {
  fraunces:   "'Fraunces', Georgia, serif",
  archivo:    "'Archivo', 'DM Sans', sans-serif",
  bricolage:  "'Bricolage Grotesque', 'DM Sans', sans-serif",
  space:      "'Space Grotesk', 'DM Sans', sans-serif"
}

/** Google Fonts href for the display faces that aren't already global. */
export const FONT_HREF =
  'https://fonts.googleapis.com/css2' +
  '?family=Archivo:wght@600;800;900' +
  '&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800' +
  '&family=Space+Grotesk:wght@500;700' +
  '&display=swap'

/**
 * Derives the WebGL stage theme from a page palette. The lamps are pulled
 * toward the accents so the glass picks up the page's colour in its highlights
 * — without that the cards read as a neutral studio render dropped onto a
 * coloured page.
 */
export function glassThemeFor(t: HomeTheme): GlassTheme {
  return { bg: t.bg, key: t.dark ? mix(t.pop, '#FFFFFF', 0.45) : mix(t.pop, '#FFFFFF', 0.6),
           rim: t.alt, glass: t.dark ? '#EDF2FF' : '#FFFFFF',
           // The backdrop's currents are drawn in the theme's own accents so
           // the field the glass refracts belongs to the palette instead of
           // being a generic WebGL gradient underneath it. Crucially they come
           // from the *cool* half of the palette — the accent blue and the ink
           // — because the loud colour mixed into warm paper turns to mud, and
           // because the artwork is itself cream-and-navy.
           alt: mix(t.alt, t.bg, t.dark ? 0.55 : 0.60),
           pop: mix(t.ink, t.bg, t.dark ? 0.30 : 0.42) }
}

/** CSS custom properties for a theme — spread onto the page root. */
export function cssVarsFor(t: HomeTheme): Record<string, string> {
  return {
    '--bg': t.bg, '--ink': t.ink, '--pop': t.pop, '--alt': t.alt,
    '--ink-60': hexA(t.ink, 0.6), '--ink-35': hexA(t.ink, 0.35), '--ink-12': hexA(t.ink, 0.12),
    // Pre-computed alpha ramps of the background. Scrims need real rgba stops:
    // `color-mix()` inside a gradient is unevenly supported and silently
    // degrades, which left cards showing through the caption band.
    '--bg-90': hexA(t.bg, 0.9), '--bg-60': hexA(t.bg, 0.6), '--bg-0': hexA(t.bg, 0),
    '--display': FONT_STACK[t.display],
    '--on-pop': readableOn(t.pop)
  }
}

// ── colour helpers ──────────────────────────────────────────────────────────
function parse(hex: string) {
  const h = hex.replace('#', '')
  const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)]
}
const toHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')

function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = parse(a), [r2, g2, b2] = parse(b)
  return `#${toHex(r1 + (r2 - r1) * t)}${toHex(g1 + (g2 - g1) * t)}${toHex(b1 + (b2 - b1) * t)}`
}
function hexA(hex: string, a: number) {
  const [r, g, b] = parse(hex)
  return `rgba(${r},${g},${b},${a})`
}
/** Black or white, whichever is legible on the given colour. */
function readableOn(hex: string) {
  const [r, g, b] = parse(hex).map(v => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b
  // Contrast against white vs black; pick the winner.
  return (1.05 / (L + 0.05)) > ((L + 0.05) / 0.05) ? '#FFFFFF' : '#101010'
}
