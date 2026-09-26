/**
 * Color → affect bridge.
 *
 * Pleasantness tracks brightness; energy tracks saturation, with a smaller
 * warmth term from hue. That is the pattern in Valdez & Mehrabian (1994),
 * not a claim that a single swatch diagnoses anyone. Several choices are
 * averaged, later ones weighted more, and later rounds tighten around the
 * running estimate while keeping one distant foil.
 */

export type Swatch = {
  id: string
  name: string
  hex: string
  h: number
  s: number
  l: number
  valence: number
  arousal: number
}

export type Affect = {
  valence: number
  arousal: number
  /** 0–1, lower when the choices disagree. */
  confidence: number
  rounds: number
}

const RAW: readonly [string, string][] = [
  ["Parchment", "#F3E6C8"],
  ["Honey", "#E4B84A"],
  ["Marigold", "#F0C43A"],
  ["Apricot", "#E8A06A"],
  ["Clay", "#D06A45"],
  ["Cinnabar", "#C44536"],
  ["Wine", "#7A2E38"],
  ["Rose", "#E4B3B0"],
  ["Blush", "#F0D2CB"],
  ["Sage", "#8FA888"],
  ["Moss", "#3E6B52"],
  ["Pine", "#1C3D32"],
  ["Sky", "#C5D8E8"],
  ["River", "#7EADD0"],
  ["Lapis", "#3D5A80"],
  ["Deep water", "#1A2740"],
  ["Lilac", "#D4C6DE"],
  ["Iris", "#7D6A92"],
  ["Plum", "#3A2C40"],
  ["Stone", "#D4CDC2"],
  ["Ash", "#8E887E"],
  ["Soot", "#2A2825"],
  ["Ink", "#14171C"],
  ["Mist", "#E4EEE8"],
  ["Spring", "#B7CFA8"],
  ["Brass", "#C6A15A"],
  ["Ember", "#A33B24"],
  ["Fog", "#B7C3CE"],
  ["Slate", "#5C6E80"],
  ["Cream", "#F7F1E6"],
  ["Lemon", "#F3E7A1"],
  ["Coral", "#E48B78"],
  ["Crimson", "#9E2438"],
  ["Cobalt", "#2452D6"],
]

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

function hexParts(hex: string): { h: number; s: number; l: number; chroma: number } {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const chroma = max - min
  const d = chroma
  let h = 0
  let s = 0
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r:
        h = ((g - b) / d) % 6
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
        break
    }
    h *= 60
    if (h < 0) h += 360
  }
  return { h, s, l, chroma }
}

/**
 * Pleasantness follows brightness. Energy follows chroma (max−min), not HSL
 * saturation — pastels have high HSL saturation and low chroma, and they
 * do not feel agitated. Warmth (hue near orange) is a smaller term.
 * Valdez & Mehrabian, 1994: brightness → pleasure, saturation → arousal.
 */
export function affectFromHsl(
  h: number,
  _s: number,
  l: number,
  chroma: number,
): { valence: number; arousal: number } {
  const warm = Math.cos(((h - 36) * Math.PI) / 180)
  const valence = clamp((l - 0.47) * 1.72 + warm * 0.05 * chroma, -1, 1)
  let arousal = (chroma - 0.22) * 1.65 + warm * 0.28 * Math.max(chroma, 0.12)
  if (l < 0.18) arousal -= (0.18 - l) * 1.1
  return { valence, arousal: clamp(arousal, -1, 1) }
}

function slug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-")
}

export const SWATCHES: readonly Swatch[] = RAW.map(([name, hex]) => {
  const { h, s, l, chroma } = hexParts(hex)
  const affect = affectFromHsl(h, s, l, chroma)
  return { id: slug(name), name, hex, h, s, l, ...affect }
})

export function stdev(xs: number[]): number {
  if (xs.length < 2) return 0
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length
  const v = xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (xs.length - 1)
  return Math.sqrt(v)
}

export function estimate(history: readonly Swatch[]): Affect | null {
  if (!history.length) return null
  let wv = 0
  let wa = 0
  let w = 0
  history.forEach((swatch, i) => {
    const k = i + 1
    wv += swatch.valence * k
    wa += swatch.arousal * k
    w += k
  })
  const valence = wv / w
  const arousal = wa / w
  const spread = stdev(history.map((s) => s.valence))
  const confidence = clamp(1 - spread / 0.62, 0.2, 0.94) * clamp(history.length / 5, 0.55, 1)
  return { valence, arousal, confidence, rounds: history.length }
}

export function settled(history: readonly Swatch[]): boolean {
  const n = history.length
  if (n < 4) return false
  if (n >= 7) return true
  const recent = history.slice(-3)
  const rV = stdev(recent.map((s) => s.valence))
  const rA = stdev(recent.map((s) => s.arousal))
  const allV = stdev(history.map((s) => s.valence))
  if (n >= 4 && rV < 0.2 && rA < 0.24 && allV < 0.38) return true
  if (n >= 5 && rV < 0.28 && rA < 0.32) return true
  if (n >= 6 && rV < 0.36 && rA < 0.4) return true
  return false
}

function hueDist(a: Swatch, b: Swatch): number {
  const d = Math.abs(a.h - b.h)
  return Math.min(d, 360 - d)
}

function affectDist(a: { valence: number; arousal: number }, b: { valence: number; arousal: number }): number {
  return Math.hypot(a.valence - b.valence, a.arousal - b.arousal)
}

function lookDist(a: Swatch, b: Swatch): number {
  return Math.hypot((a.valence - b.valence) * 1.15, a.arousal - b.arousal, hueDist(a, b) / 140)
}

function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = out[i]
    out[i] = out[j]
    out[j] = tmp
  }
  return out
}

function spread(pool: Swatch[], count: number, rng: () => number): Swatch[] {
  if (pool.length <= count) return shuffle(pool, rng)
  const first = pool[Math.floor(rng() * pool.length)]
  const chosen: Swatch[] = [first]
  while (chosen.length < count) {
    let best: Swatch | null = null
    let bestScore = -1
    for (const candidate of pool) {
      if (chosen.includes(candidate)) continue
      const nearest = Math.min(...chosen.map((k) => lookDist(candidate, k)))
      const score = nearest + rng() * 0.03
      if (score > bestScore) {
        bestScore = score
        best = candidate
      }
    }
    if (!best) break
    chosen.push(best)
  }
  return shuffle(chosen, rng)
}

/** Early rounds cover the plane. Later rounds zoom in, plus one distant foil. */
export function nextChoices(history: readonly Swatch[], rng: () => number): Swatch[] {
  const recent = new Set(history.slice(-6).map((s) => s.id))
  let pool = SWATCHES.filter((s) => !recent.has(s.id))
  if (pool.length < 8) {
    const last = new Set(history.slice(-2).map((s) => s.id))
    pool = SWATCHES.filter((s) => !last.has(s.id))
  }
  const round = history.length
  const count = round >= 2 && rng() > 0.42 ? 5 : 4
  const est = estimate(history)
  if (!est || round < 2) return spread(pool, count, rng)

  const ranked = pool.slice().sort((a, b) => affectDist(a, est) - affectDist(b, est))
  const near: Swatch[] = []
  for (const swatch of ranked) {
    if (near.length >= count - 1) break
    if (near.every((n) => hueDist(n, swatch) > 16 && lookDist(n, swatch) > 0.16)) near.push(swatch)
  }
  for (const swatch of ranked) {
    if (near.length >= count - 1) break
    if (!near.includes(swatch)) near.push(swatch)
  }
  const foil = pool
    .filter((s) => !near.includes(s))
    .sort((a, b) => affectDist(b, est) - affectDist(a, est))
    .find((s) => near.every((n) => hueDist(n, s) > 20))
  const chosen = foil ? [...near.slice(0, count - 1), foil] : near.slice(0, count)
  return shuffle(chosen, rng)
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
