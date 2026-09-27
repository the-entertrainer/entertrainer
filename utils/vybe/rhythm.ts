/** Generative tactile patterns. Pure timing — no audio, no actuator. */

export type VybeStyle = 'pulse' | 'surge' | 'sync' | 'sub'

export type RhythmInput = {
  now: number
  phase: number
  rms: number
  sub: number
  bass: number
  high: number
  flux: number
  divergence: number
  ceiling: number
  style: VybeStyle
}

export type RhythmSnap = {
  pulses: number[]
  level: number
}

const MAX_ON_MS = 260

export function createRhythm() {
  let prevPhase = 0
  let lastWave = 0
  let swell = 0
  let rising = 0
  const budget: { t: number; ms: number }[] = []

  return {
    step(input: RhythmInput): RhythmSnap {
      const energy = Math.max(input.rms, input.bass * 1.15, input.sub)
      swell = energy > swell ? swell * 0.55 + energy * 0.45 : swell * 0.92 + energy * 0.08
      rising = energy > swell * 0.92 ? Math.min(1, rising + 0.08) : Math.max(0, rising - 0.05)

      const marks = marksFor(input.style, input.divergence)
      const wrapped = input.phase < prevPhase
      const jumped = wrapped ? (1 - prevPhase) + input.phase > 0.35 : input.phase - prevPhase > 0.35
      const hits: number[] = []

      if (!jumped) {
        for (const mark of marks) {
          if (crossed(prevPhase, input.phase, mark)) hits.push(mark)
        }
      }

      if (input.style === 'sub' && input.sub > 0.04 && input.now - lastWave > 110 - input.divergence * 30) {
        hits.push(-1)
        lastWave = input.now
      }
      if (input.style === 'surge' && rising > 0.35 && input.now - lastWave > 240 - rising * 160) {
        hits.push(-1)
        lastWave = input.now
      }

      const pulses: number[] = []
      for (const hit of hits) {
        const weight = hit < 0
          ? input.style === 'sub' ? input.sub : swell
          : 0.35 + energy * 0.65 + (input.style === 'sync' ? input.flux * 0.4 : input.bass * 0.25)
        const raw = (input.style === 'sub' ? 36 : input.style === 'surge' ? 18 + rising * 28 : 14) * weight
        const asked = Math.round(8 + raw * input.ceiling * 2.2)
        const granted = grant(budget, input.now, asked)
        if (granted >= 8) pulses.push(granted)
      }

      prevPhase = input.phase
      const level = Math.min(1, swell * (0.55 + input.ceiling * 0.6) + (pulses.length ? 0.22 : 0))
      return { pulses, level }
    }
  }
}

export function marksFor(style: VybeStyle, divergence: number): number[] {
  const d = clamp(divergence, 0, 1)
  if (style === 'sync') {
    const marks = [1 / 3, 2 / 3]
    if (d > 0.45) marks.push(1 / 6, 5 / 6)
    if (d < 0.25) marks.unshift(0)
    return marks
  }
  if (style === 'sub') return d > 0.5 ? [0, 0.5] : [0]
  if (style === 'surge') return d > 0.55 ? [0, 0.5] : [0]
  const marks = [0]
  if (d > 0.28) marks.push(0.5)
  if (d > 0.62) marks.push(0.25, 0.75)
  if (d > 0.84) marks.push(1 / 3, 2 / 3)
  return marks
}

function crossed(prev: number, next: number, mark: number) {
  if (next < prev) return mark >= prev || mark < next
  return mark >= prev && mark < next
}

function grant(budget: { t: number; ms: number }[], now: number, asked: number) {
  for (let i = budget.length - 1; i >= 0; i--) {
    if (now - budget[i].t > 1000) budget.splice(i, 1)
  }
  const used = budget.reduce((sum, item) => sum + item.ms, 0)
  const given = Math.max(0, Math.min(asked, MAX_ON_MS - used, 80))
  if (given >= 8) budget.push({ t: now, ms: given })
  return given
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}
