/**
 * Aether Lyre — pure just / Pythagorean ratios only (never equal temperament).
 * Seven Sumerian/Akkadian mode names as rotations of a fifths-built heptatonic.
 */

export type Ratio = { n: number; d: number }

export type ScaleNote = {
  degree: number
  ratio: Ratio
  hz: number
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
  /** Index into the Pythagorean diatonic cycle used as tonic (0–6). */
  rotation: number
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

/** Cents relative to unison (1200 * log2(n/d)). */
export function centsFromRatio(r: Ratio): number {
  return 1200 * Math.log2(r.n / r.d)
}

/** Sexagesimal calm registers — UI may label 112.5 as "112.5 Hz". */
export const BASE_HZ_OPTIONS = [60, 72, 80, 90, 112.5, 120] as const

/**
 * Pythagorean diatonic heptatonic from stacked fifths (3/2),
 * reduced into one octave from the tonic.
 */
export const PYTH_DEGREES: readonly Ratio[] = [
  { n: 1, d: 1 },
  { n: 9, d: 8 },
  { n: 81, d: 64 },
  { n: 4, d: 3 },
  { n: 3, d: 2 },
  { n: 27, d: 16 },
  { n: 243, d: 128 },
]

export const TUNINGS: readonly TuningMeta[] = [
  {
    id: 'ishartum',
    name: 'Ishartum',
    short: 'First of the heptatonic cycle; tonic on the opening string degree.',
    rotation: 0,
  },
  {
    id: 'embubum',
    name: 'Embubum',
    short: 'Second rotation; named for the reed-pipe mode in the cycle.',
    rotation: 1,
  },
  {
    id: 'nidqablum',
    name: 'Nidqablum',
    short: 'Third rotation; “fall of the middle” in the seven-string set.',
    rotation: 2,
  },
  {
    id: 'qablitum',
    name: 'Qablitum',
    short: 'Fourth rotation; the middle mode of the Pythagorean cycle.',
    rotation: 3,
  },
  {
    id: 'kitmum',
    name: 'Kitmum',
    short: 'Fifth rotation; the “closed” counterpart in tablet lists.',
    rotation: 4,
  },
  {
    id: 'pidum',
    name: 'Pidum',
    short: 'Sixth rotation; the “open” mode opposite Kitmum.',
    rotation: 5,
  },
  {
    id: 'nishturim',
    name: 'Nishturim',
    short: 'Seventh rotation; closes the cycle before returning to Ishartum.',
    rotation: 6,
  },
]

/** Common just intervals for the harmonic lattice UI. */
export const JUST_INTERVALS: readonly { id: string; name: string; ratio: Ratio }[] = [
  { id: '1:1', name: 'Unison', ratio: { n: 1, d: 1 } },
  { id: '9:8', name: 'Major second', ratio: { n: 9, d: 8 } },
  { id: '6:5', name: 'Minor third', ratio: { n: 6, d: 5 } },
  { id: '5:4', name: 'Major third', ratio: { n: 5, d: 4 } },
  { id: '4:3', name: 'Fourth', ratio: { n: 4, d: 3 } },
  { id: '3:2', name: 'Fifth', ratio: { n: 3, d: 2 } },
  { id: '8:5', name: 'Minor sixth', ratio: { n: 8, d: 5 } },
  { id: '5:3', name: 'Major sixth', ratio: { n: 5, d: 3 } },
  { id: '2:1', name: 'Octave', ratio: { n: 2, d: 1 } },
]

export function getTuning(id: TuningId): TuningMeta {
  return TUNINGS.find((t) => t.id === id) ?? TUNINGS[0]
}

/**
 * Mode i uses Pythagorean degree i as tonic.
 * Returns 7 notes: degree 0..6 relative to that tonic, Hz = base * n/d.
 */
export function getScale(tuningId: TuningId, baseHz: number): ScaleNote[] {
  const meta = getTuning(tuningId)
  const i = meta.rotation
  const tonic = PYTH_DEGREES[i]
  const notes: ScaleNote[] = []
  for (let j = 0; j < 7; j++) {
    const abs = PYTH_DEGREES[(i + j) % 7]
    const ratio = octaveReduce(divRatio(abs, tonic))
    notes.push({
      degree: j,
      ratio,
      hz: baseHz * ratioToFloat(ratio),
      label: formatRatio(ratio),
    })
  }
  return notes
}

export function hzFromRatio(baseHz: number, ratio: Ratio): number {
  return baseHz * ratioToFloat(ratio)
}
