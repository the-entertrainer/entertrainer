/**
 * Aether Lyre — sexagesimal string-length harmonics.
 *
 * Source of truth is integer string lengths from the tablet-style column
 * L = [60, 54, 48, 45, 40, 36, 32, 30]. Frequency relative to the longest
 * string is hz = baseHz * (60 / L), always computed as a simplified rational
 * (never a hard-coded float table as authority).
 *
 * The seven named tunings (Ishartum … Nishturim) each pick a different
 * degree of that column as tonic, then octave-reduce the remaining degrees
 * relative to it — the same arithmetic used to rotate a fixed string set
 * through the heptatonic cycle in Mesopotamian lyre lists.
 */

export type Ratio = { n: number; d: number }

export type ScaleNote = {
  degree: number
  /** Absolute column string length for this degree. */
  length: number
  ratio: Ratio
  hz: number
  /** e.g. "L40 · 3/2" */
  label: string
}

export type TuningId =
  | 'ishartum'
  | 'embubum'
  | 'nidqablum'
  | 'qablitum'
  | 'kitmum'
  | 'pidum'
  | 'nishturim'

export type TuningMeta = {
  id: TuningId
  name: string
  short: string
  /** Index into STRING_LENGTHS_HEPTA used as tonic (0–6). */
  tonicIndex: number
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a))
  let y = Math.abs(Math.trunc(b))
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

export function simplify(r: Ratio): Ratio {
  const g = gcd(r.n, r.d)
  const n = r.n / g
  const d = r.d / g
  return d < 0 ? { n: -n, d: -d } : { n, d }
}

export function mulRatio(a: Ratio, b: Ratio): Ratio {
  return simplify({ n: a.n * b.n, d: a.d * b.d })
}

export function divRatio(a: Ratio, b: Ratio): Ratio {
  return simplify({ n: a.n * b.d, d: a.d * b.n })
}

/** Fold ratio into [1, 2). */
export function octaveReduce(r: Ratio): Ratio {
  let out = simplify(r)
  while (out.n / out.d >= 2) out = simplify({ n: out.n, d: out.d * 2 })
  while (out.n / out.d < 1) out = simplify({ n: out.n * 2, d: out.d })
  return out
}

export function ratioToFloat(r: Ratio): number {
  return r.n / r.d
}

export function formatRatio(r: Ratio): string {
  return `${r.n}/${r.d}`
}

/** Cents relative to unison (diagnostic only — not used for pitch). */
export function centsFromRatio(r: Ratio): number {
  return 1200 * Math.log2(r.n / r.d)
}

/**
 * Full sexagesimal string-length column (including the octave string L30).
 * Ratios = simplify(60 / L): 1/1, 10/9, 5/4, 4/3, 3/2, 5/3, 15/8, 2/1.
 */
export const STRING_LENGTHS: readonly number[] = [60, 54, 48, 45, 40, 36, 32, 30]

/** Seven sounding degrees within one octave (excludes L30 = 2/1). */
export const STRING_LENGTHS_HEPTA: readonly number[] = [60, 54, 48, 45, 40, 36, 32]

/**
 * Positive divisors of 60 — the only allowed harmonic partial multipliers.
 * Voice timbre uses a quiet subset of these (never arbitrary inharmonics as pitch).
 */
export const SEXAGESIMAL_PARTIALS: readonly number[] = [
  1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60,
]

/** Default voice partial stack (all divisors of 60). */
export const VOICE_PARTIALS: readonly number[] = [1, 2, 3, 4, 5, 6]

/**
 * Sexagesimal-clean base frequencies: 60 * {1/2, 1, 3/2, 2, 3}.
 * (Dropped 112.5 — not a small sexagesimal multiple of 60.)
 */
export const BASE_HZ_OPTIONS = [30, 60, 90, 120, 180] as const

/** Absolute ratio of a column length against L60: simplify(60/L). */
export function ratioFromLength(L: number): Ratio {
  return simplify({ n: 60, d: L })
}

/** Absolute column table (length → ratio → float), for docs / smoke tests. */
export function columnTable(): { length: number; ratio: Ratio; float: number }[] {
  return STRING_LENGTHS.map((length) => {
    const ratio = ratioFromLength(length)
    return { length, ratio, float: ratioToFloat(ratio) }
  })
}

export const TUNINGS: readonly TuningMeta[] = [
  {
    id: 'ishartum',
    name: 'Ishartum',
    short: 'Tonic on L60 (1/1). First string of the sexagesimal column as reference.',
    tonicIndex: 0,
  },
  {
    id: 'embubum',
    name: 'Embubum',
    short: 'Tonic on L54 (10/9). Column rotated so the 10/9 string is the open degree.',
    tonicIndex: 1,
  },
  {
    id: 'nidqablum',
    name: 'Nidqablum',
    short: 'Tonic on L48 (5/4). Third degree of the length column as tonic.',
    tonicIndex: 2,
  },
  {
    id: 'qablitum',
    name: 'Qablitum',
    short: 'Tonic on L45 (4/3). Middle of the heptatonic string set.',
    tonicIndex: 3,
  },
  {
    id: 'kitmum',
    name: 'Kitmum',
    short: 'Tonic on L40 (3/2). Fifth of the absolute column as the new 1/1.',
    tonicIndex: 4,
  },
  {
    id: 'pidum',
    name: 'Pidum',
    short: 'Tonic on L36 (5/3). Sixth length degree as tonic.',
    tonicIndex: 5,
  },
  {
    id: 'nishturim',
    name: 'Nishturim',
    short: 'Tonic on L32 (15/8). Seventh degree; closes the rotation cycle.',
    tonicIndex: 6,
  },
]

/**
 * Lattice / layer intervals drawn only from the length column
 * (plus octave). Labels use colon form for compact UI nodes.
 */
export const JUST_INTERVALS: readonly { id: string; name: string; ratio: Ratio; length?: number }[] = [
  { id: '1:1', name: 'L60 unison', ratio: { n: 1, d: 1 }, length: 60 },
  { id: '10:9', name: 'L54', ratio: { n: 10, d: 9 }, length: 54 },
  { id: '5:4', name: 'L48', ratio: { n: 5, d: 4 }, length: 48 },
  { id: '4:3', name: 'L45', ratio: { n: 4, d: 3 }, length: 45 },
  { id: '3:2', name: 'L40', ratio: { n: 3, d: 2 }, length: 40 },
  { id: '5:3', name: 'L36', ratio: { n: 5, d: 3 }, length: 36 },
  { id: '15:8', name: 'L32', ratio: { n: 15, d: 8 }, length: 32 },
  { id: '2:1', name: 'L30 octave', ratio: { n: 2, d: 1 }, length: 30 },
]

/** Preferred melodic leaps (and inversions) — all sexagesimal column ratios. */
export const PREFERRED_LEAPS: readonly Ratio[] = [
  { n: 3, d: 2 },
  { n: 4, d: 3 },
  { n: 5, d: 4 },
  { n: 10, d: 9 },
  { n: 5, d: 3 },
  { n: 2, d: 3 },
  { n: 3, d: 4 },
  { n: 4, d: 5 },
  { n: 9, d: 10 },
  { n: 3, d: 5 },
  { n: 8, d: 15 },
  { n: 15, d: 8 },
]

export function getTuning(id: TuningId): TuningMeta {
  return TUNINGS.find((t) => t.id === id) ?? TUNINGS[0]
}

function noteLabel(length: number, ratio: Ratio): string {
  return `L${length} · ${formatRatio(ratio)}`
}

/**
 * Mode with tonicIndex i: treat STRING_LENGTHS_HEPTA[i] as tonic,
 * then octave-reduce every other hepta degree against it.
 * All pitches remain length-derived rationals — no ET intermediates.
 */
export function getScale(tuningId: TuningId, baseHz: number): ScaleNote[] {
  const meta = getTuning(tuningId)
  const i = meta.tonicIndex
  const abs = STRING_LENGTHS_HEPTA.map((L) => ({
    length: L,
    ratio: ratioFromLength(L),
  }))
  const tonic = abs[i].ratio
  const notes: ScaleNote[] = []
  for (let j = 0; j < 7; j++) {
    const src = abs[(i + j) % 7]
    const ratio = octaveReduce(divRatio(src.ratio, tonic))
    notes.push({
      degree: j,
      length: src.length,
      ratio,
      hz: baseHz * ratioToFloat(ratio),
      label: noteLabel(src.length, ratio),
    })
  }
  return notes
}

export function hzFromRatio(baseHz: number, ratio: Ratio): number {
  return baseHz * ratioToFloat(ratio)
}

function intervalFloat(from: ScaleNote, to: ScaleNote): number {
  return to.hz / from.hz
}

function isPreferredLeap(from: ScaleNote, to: ScaleNote): boolean {
  if (from.degree === to.degree) return false
  const f = intervalFloat(from, to)
  // Also accept octave-equivalent leap (×2 / ÷2) within the set
  for (const leap of PREFERRED_LEAPS) {
    const target = leap.n / leap.d
    if (Math.abs(f - target) < 0.012) return true
    if (Math.abs(f - target * 2) < 0.012) return true
    if (Math.abs(f - target / 2) < 0.012) return true
  }
  return false
}

/**
 * Evolving melody that walks only sexagesimal scale degrees,
 * preferring leaps of 3/2, 4/3, 5/4, 10/9, 5/3 (and inversions).
 * Never random chromatic motion.
 */
export function buildSequencePath(
  notes: ScaleNote[],
  steps = 16,
): { hz: number[]; labels: string[]; lengths: number[] } {
  if (!notes.length) return { hz: [], labels: [], lengths: [] }

  const hz: number[] = []
  const labels: string[] = []
  const lengths: number[] = []
  let idx = 0
  let prevIdx = -1

  for (let s = 0; s < steps; s++) {
    const cur = notes[idx]
    hz.push(cur.hz)
    labels.push(cur.label)
    lengths.push(cur.length)

    const preferred = notes
      .map((n, i) => i)
      .filter((i) => i !== idx && isPreferredLeap(cur, notes[i]))

    let candidates = preferred.length ? preferred : notes.map((_, i) => i).filter((i) => i !== idx)

    // Mild anti-retrace: avoid bouncing straight back when alternatives exist
    if (prevIdx >= 0 && candidates.length > 1) {
      const filtered = candidates.filter((i) => i !== prevIdx)
      if (filtered.length) candidates = filtered
    }

    // Bias toward forward motion along the column early, then allow returns
    const forward = candidates.filter((i) => i > idx)
    const pool =
      s < steps * 0.55 && forward.length
        ? forward
        : candidates

    prevIdx = idx
    // Deterministic walk (no Math.random) so sequences feel composed, not noisy
    const pick = pool[(s * 3 + idx * 2 + 1) % pool.length]
    idx = pick
  }

  return { hz, labels, lengths }
}

/** Layer stack ratios — all present in the length column. */
export const LAYER_RATIOS: readonly { id: string; ratio: Ratio; length: number }[] = [
  { id: '1:1', ratio: { n: 1, d: 1 }, length: 60 },
  { id: '3:2', ratio: { n: 3, d: 2 }, length: 40 },
  { id: '4:3', ratio: { n: 4, d: 3 }, length: 45 },
  { id: '5:4', ratio: { n: 5, d: 4 }, length: 48 },
]
