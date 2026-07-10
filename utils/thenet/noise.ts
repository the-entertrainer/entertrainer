// ============================================================
// Deterministic noise for "The Net".
// ============================================================
//
// Every visual in this module must render identically on every load — the
// argument only holds if there is no "well, that one just happened to look
// riper" wiggle room. So all randomness is seeded here. No Math.random().

/** mulberry32 — tiny, fast, deterministic PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash3(ix: number, iy: number, iz: number, seed: number): number {
  let h = seed >>> 0
  h = Math.imul(h ^ (ix | 0), 0x27d4eb2f)
  h = Math.imul(h ^ (iy | 0), 0x85ebca6b)
  h = Math.imul(h ^ (iz | 0), 0xc2b2ae35)
  h ^= h >>> 15
  return (h >>> 0) / 4294967296
}

const fade = (t: number) => t * t * (3 - 2 * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Value noise in 3D, range ~0..1, seeded and repeatable. */
export function valueNoise3(x: number, y: number, z: number, seed = 1): number {
  const x0 = Math.floor(x), y0 = Math.floor(y), z0 = Math.floor(z)
  const fx = fade(x - x0), fy = fade(y - y0), fz = fade(z - z0)

  const c000 = hash3(x0, y0, z0, seed)
  const c100 = hash3(x0 + 1, y0, z0, seed)
  const c010 = hash3(x0, y0 + 1, z0, seed)
  const c110 = hash3(x0 + 1, y0 + 1, z0, seed)
  const c001 = hash3(x0, y0, z0 + 1, seed)
  const c101 = hash3(x0 + 1, y0, z0 + 1, seed)
  const c011 = hash3(x0, y0 + 1, z0 + 1, seed)
  const c111 = hash3(x0 + 1, y0 + 1, z0 + 1, seed)

  const x00 = lerp(c000, c100, fx)
  const x10 = lerp(c010, c110, fx)
  const x01 = lerp(c001, c101, fx)
  const x11 = lerp(c011, c111, fx)
  const y0v = lerp(x00, x10, fy)
  const y1v = lerp(x01, x11, fy)
  return lerp(y0v, y1v, fz)
}

/** Fractal (a few octaves) 3D noise, range ~0..1. */
export function fbm3(x: number, y: number, z: number, seed = 1, octaves = 4): number {
  let sum = 0
  let amp = 0.5
  let freq = 1
  let norm = 0
  for (let o = 0; o < octaves; o++) {
    sum += amp * valueNoise3(x * freq, y * freq, z * freq, seed + o * 101)
    norm += amp
    amp *= 0.5
    freq *= 2
  }
  return sum / norm
}
