// Deterministic seismogram synthesis. Real seismograms are a quiet noisy
// baseline (microseisms), a sharp higher-frequency P arrival, a larger
// lower-frequency S arrival, and a slowly decaying coda. We build exactly
// that shape from a seeded PRNG so every render of a given station is
// identical (no flicker, reproducible screenshots) yet each station looks
// distinct. This is the subject's real artifact, authored rather than
// stock: the trace IS the data the learner reads.

function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface WaveletParams {
  seed: number
  windowS: number
  pArrivalS: number
  sArrivalS: number
}

// A tapered oscillatory wavelet centred at t0 (seconds), amplitude amp,
// dominant frequency freq (Hz), envelope width w (seconds).
function wavelet(t: number, t0: number, amp: number, freq: number, w: number, rise: number): number {
  const dt = t - t0
  if (dt < -rise) return 0
  // asymmetric envelope: fast rise, slow decay
  const env = dt < 0
    ? Math.exp(-(dt * dt) / (2 * rise * rise))
    : Math.exp(-dt / w)
  return amp * env * Math.sin(2 * Math.PI * freq * dt)
}

/**
 * Returns `count` amplitude samples in the range roughly [-1, 1] across the
 * time window. The caller maps them to pixels.
 */
export function sampleTrace(params: WaveletParams, count: number): number[] {
  const { seed, windowS, pArrivalS, sArrivalS } = params
  const rand = mulberry32(seed)
  // Pre-generate a smooth noise field (value noise) for the microseism floor.
  const noiseNodes = 220
  const nodes: number[] = Array.from({ length: noiseNodes }, () => rand() * 2 - 1)
  const smoothNoise = (u: number) => {
    const x = u * (noiseNodes - 1)
    const i = Math.floor(x)
    const f = x - i
    const a = nodes[i] ?? 0
    const b = nodes[i + 1] ?? a
    const s = f * f * (3 - 2 * f)
    return a + (b - a) * s
  }

  const out: number[] = new Array(count)
  for (let k = 0; k < count; k++) {
    const u = k / (count - 1)
    const t = u * windowS
    let v = smoothNoise(u) * 0.06                       // microseism floor
    v += smoothNoise(u * 5.3 + 11) * 0.02                // finer jitter
    // P: sharp, higher frequency, moderate amplitude
    v += wavelet(t, pArrivalS, 0.42, 1.6, 3.2, 0.35)
    // S: larger, lower frequency
    v += wavelet(t, sArrivalS, 0.92, 0.9, 6.5, 0.5)
    // surface-wave coda after S: long, low, decaying
    v += wavelet(t, sArrivalS + 4, 0.3, 0.45, 14, 1.2)
    out[k] = Math.max(-1, Math.min(1, v))
  }
  return out
}

/** Builds an SVG polyline `points` string for a trace inside a box. */
export function tracePolyline(
  samples: number[],
  width: number,
  height: number,
  padY = 4
): string {
  const mid = height / 2
  const amp = mid - padY
  const n = samples.length
  let s = ''
  for (let k = 0; k < n; k++) {
    const x = (k / (n - 1)) * width
    const y = mid - samples[k] * amp
    s += `${k === 0 ? '' : ' '}${x.toFixed(1)},${y.toFixed(1)}`
  }
  return s
}
