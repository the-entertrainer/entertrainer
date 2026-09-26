/**
 * Sexagesimal string-length harmonics.
 *
 * Column L = [60, 54, 48, 45, 40, 36, 32, 30].
 * hz = baseHz * (60 / L), kept as a simplified rational.
 * Seven tunings rotate which degree is the tonic — the Mesopotamian
 * retuning cycle (Ishartum … Nishturim).
 * Partials are positive divisors of 60 only.
 */

export type Ratio = { n: number; d: number }

export type ScaleNote = {
  degree: number
  length: number
  ratio: Ratio
  label: string
}

export type TuningId =
  | "ishartum"
  | "embubum"
  | "nidqablum"
  | "qablitum"
  | "kitmum"
  | "pidum"
  | "nishturim"

export type TuningMeta = {
  id: TuningId
  name: string
  tonicIndex: number
  /** What the rotation does, in one line. */
  line: string
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

function divRatio(a: Ratio, b: Ratio): Ratio {
  return simplify({ n: a.n * b.d, d: a.d * b.n })
}

/** Fold into [1, 2). */
export function octaveReduce(r: Ratio): Ratio {
  let out = simplify(r)
  while (out.n / out.d >= 2) out = simplify({ n: out.n, d: out.d * 2 })
  while (out.n / out.d < 1) out = simplify({ n: out.n * 2, d: out.d })
  return out
}

export function formatRatio(r: Ratio): string {
  return `${r.n}/${r.d}`
}

export const STRING_LENGTHS_HEPTA: readonly number[] = [60, 54, 48, 45, 40, 36, 32]

/** Positive divisors of 60 — the only partial multipliers. */
export const SEXAGESIMAL_PARTIALS: readonly number[] = [1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60]

export const TUNINGS: readonly TuningMeta[] = [
  {
    id: "ishartum",
    name: "Ishartum",
    tonicIndex: 0,
    line: "Tonic on the longest string, L60, ratio 1/1.",
  },
  {
    id: "embubum",
    name: "Embubum",
    tonicIndex: 1,
    line: "Tonic rotated onto L54, the 10/9 tone.",
  },
  {
    id: "nidqablum",
    name: "Nidqablum",
    tonicIndex: 2,
    line: "Tonic rotated onto L48, the 5/4 third.",
  },
  {
    id: "qablitum",
    name: "Qablitum",
    tonicIndex: 3,
    line: "Tonic rotated onto L45, the 4/3 fourth.",
  },
  {
    id: "kitmum",
    name: "Kitmum",
    tonicIndex: 4,
    line: "Tonic rotated onto L40, the 3/2 fifth.",
  },
  {
    id: "pidum",
    name: "Pidum",
    tonicIndex: 5,
    line: "Tonic rotated onto L36, the 5/3 sixth.",
  },
  {
    id: "nishturim",
    name: "Nishturim",
    tonicIndex: 6,
    line: "Tonic rotated onto L32, the 15/8 seventh.",
  },
]

export function getTuning(id: TuningId): TuningMeta {
  return TUNINGS.find((t) => t.id === id) ?? TUNINGS[0]
}

function ratioFromLength(length: number): Ratio {
  return simplify({ n: 60, d: length })
}

export function getScale(tuningId: TuningId): ScaleNote[] {
  const meta = getTuning(tuningId)
  const abs = STRING_LENGTHS_HEPTA.map((length) => ({
    length,
    ratio: ratioFromLength(length),
  }))
  const tonic = abs[meta.tonicIndex].ratio
  return abs.map((src, j) => {
    const from = abs[(meta.tonicIndex + j) % 7]
    const ratio = octaveReduce(divRatio(from.ratio, tonic))
    return {
      degree: j,
      length: from.length,
      ratio,
      label: `L${from.length} · ${formatRatio(ratio)}`,
    }
  })
}
