/**
 * A small phrase, not a drone.
 *
 * Each section is eight bars of 4/4: a motif, a repeat, an answer,
 * a sequence, then a cadence (fifth, then tonic). Long notes sit on
 * chord tones. Short notes may pass. That is ordinary tonal writing,
 * and it is also what harmonic-expectation research describes: the ear
 * predicts the next chord, and a resolved cadence is the event it was
 * waiting for (Koelsch and colleagues on the ERAN).
 *
 * Two levers come from tempo/mode studies, which line up with the axes
 * EEG work measures — they are not a claim that this page reads anyone's
 * brain, and there are no binaural beats:
 *   tempo and note density follow energy (Husain, Thompson & Schellenberg, 2002)
 *   the just major third is withheld until pleasantness rises (mode → valence)
 * A clear meter is used because a pulse, not a wash, is what attention locks to
 * (Thaut, rhythm and auditory-motor coupling).
 */

import type { ScaleNote } from "./tunings"

export type Voice = "melody" | "alto" | "harmony" | "bass"

export type ScoreEvent = {
  /** Beats from the start of this section. */
  beat: number
  duration: number
  /** 0–6 inside the tuning. */
  degree: number
  octave: number
  voice: Voice
  velocity: number
  root: number
}

export type SectionScore = {
  events: ScoreEvent[]
  beats: number
  motif: number[]
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

function pick<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length) % items.length]
}

function chordTones(root: number, allowThird: boolean): number[] {
  const third = (root + 2) % 7
  const fifth = (root + 4) % 7
  return allowThird ? [root % 7, third, fifth] : [root % 7, fifth]
}

function takeRhythm(pattern: readonly number[], beats: number): number[] {
  const out: number[] = []
  let left = beats
  let i = 0
  while (left > 0.049 && i < 24) {
    let d = pattern[i % pattern.length]
    if (d > left) d = left
    if (left - d < 0.2 && left - d > 0.001) d = left
    out.push(Math.round(d * 1000) / 1000)
    left = Math.round((left - d) * 1000) / 1000
    i++
  }
  return out
}

function motifOf(rng: () => number, valence: number, arousal: number): number[] {
  const calm = [
    [0, 2, 1, 0],
    [0, 4, 2, 0],
    [0, 1, 2, 4],
    [0, 2, 4, 2],
    [2, 0, 1, 0],
    [0, 2, 0, 4],
    [0, 1, 3, 2],
  ]
  const bright = [
    [0, 2, 4, 5, 4],
    [2, 4, 5, 4, 2],
    [0, 4, 2, 4, 5],
    [4, 2, 0, 2, 4],
    [0, 2, 1, 2, 4],
    [5, 4, 2, 4, 5],
    [0, 4, 5, 4, 2],
  ]
  const bank = valence > 0.12 || arousal > 0.18 ? bright : calm
  const motif = pick(bank, rng).slice()
  if (rng() < 0.4) {
    const i = 1 + Math.floor(rng() * (motif.length - 2))
    motif[i] = clamp(motif[i] + (rng() < 0.5 ? -1 : 1), 0, 6)
  }
  return motif
}

function shift(motif: readonly number[], by: number): number[] {
  const up = motif.map((n) => n + by)
  if (up.every((n) => n >= 0 && n <= 6)) return up
  const down = motif.map((n) => n - by)
  if (down.every((n) => n >= 0 && n <= 6)) return down
  return motif.map((n) => ((n + by) % 7 + 7) % 7)
}

function vary(motif: readonly number[], rng: () => number): number[] {
  const next = motif.slice()
  const i = 1 + Math.floor(rng() * Math.max(1, next.length - 2))
  next[i] = clamp(next[i] + (rng() < 0.5 ? -1 : 1), 0, 6)
  if (rng() < 0.5 && next.length > 3) {
    const j = next.length - 2
    next[j] = clamp(next[j] + (rng() < 0.5 ? -1 : 1), 0, 6)
  }
  return next
}

function rhythmFor(len: number, moving: boolean, rng: () => number): number[] {
  const bank: Record<number, number[][]> = {
    3: [
      [1, 1, 2],
      [2, 1, 1],
      [1.5, 0.5, 2],
    ],
    4: moving
      ? [
          [1, 1, 1, 1],
          [1.5, 0.5, 1, 1],
          [1, 0.5, 0.5, 2],
          [0.5, 0.5, 1, 2],
        ]
      : [
          [1, 1, 1, 1],
          [1.5, 0.5, 1, 1],
          [1, 1, 0.5, 1.5],
        ],
    5: [
      [0.5, 0.5, 1, 1, 1],
      [1, 0.5, 0.5, 1, 1],
      [0.5, 0.5, 0.5, 0.5, 2],
      [1, 1, 0.5, 0.5, 1],
    ],
  }
  const options = bank[len] ?? bank[4]
  return pick(options, rng).slice()
}

function sing(motif: readonly number[], lockLast?: number, lockPrev?: number): number[] {
  const out = motif.slice()
  if (lockPrev !== undefined && out.length > 1) out[out.length - 2] = lockPrev
  if (lockLast !== undefined) out[out.length - 1] = lockLast
  return out
}

const OPEN = [
  [0, 0, 3, 4, 0, 3, 4, 0],
  [0, 3, 0, 4, 0, 3, 4, 0],
  [0, 0, 4, 3, 0, 4, 4, 0],
] as const

const FULL = [
  [0, 5, 3, 4, 0, 3, 4, 0],
  [0, 3, 5, 4, 1, 3, 4, 0],
  [0, 4, 5, 3, 0, 5, 4, 0],
  [5, 3, 0, 4, 0, 3, 4, 0],
] as const

function progression(allowThird: boolean, rng: () => number): number[] {
  const bank = allowThird ? FULL : OPEN
  const row = pick(bank, rng).slice()
  // A period: tonic, half cadence, answer home, then a real cadence.
  row[0] = 0
  row[1] = 4
  row[3] = 0
  row[6] = 4
  row[7] = 0
  return row
}

function arch(bar: number): number {
  const x = bar / 7
  return 0.74 + Math.sin(x * Math.PI) * 0.4
}

function push(
  events: ScoreEvent[],
  beat: number,
  duration: number,
  degree: number,
  octave: number,
  voice: Voice,
  velocity: number,
  root: number,
) {
  if (duration < 0.05) return
  events.push({
    beat: Math.round(beat * 1000) / 1000,
    duration: Math.round(duration * 1000) / 1000,
    degree: ((degree % 7) + 7) % 7,
    octave,
    voice,
    velocity: clamp(velocity, 0.05, 1),
    root: ((root % 7) + 7) % 7,
  })
}

/**
 * Eight-bar period. `motif` null starts a new idea; otherwise the idea returns,
 * then moves. `scale` is accepted so callers can keep the tuning next to the score.
 */
export function nextSection(
  _scale: readonly ScaleNote[],
  valence: number,
  arousal: number,
  rng: () => number,
  sectionIndex: number,
  motifIn: readonly number[] | null,
): SectionScore {
  const allowThird = valence > 0.06 || sectionIndex >= 2
  const roots = progression(allowThird, rng)
  const theme = motifIn && motifIn.length ? motifIn.slice() : motifOf(rng, valence, arousal)
  const motif =
    sectionIndex % 3 === 1 ? shift(theme, 1) : sectionIndex % 3 === 2 ? vary(theme, rng) : theme.slice()
  const moving = arousal > 0.12 || sectionIndex >= 2
  const rhythm = rhythmFor(motif.length, moving, rng)
  const events: ScoreEvent[] = []

  for (let bar = 0; bar < 8; bar++) {
    const root = roots[bar]
    const start = bar * 4
    const vel = arch(bar)
    const tones = chordTones(root, allowThird)
    const lift = (valence > 0.15 || sectionIndex >= 2) && (bar === 4 || bar === 5)

    let durations: number[]
    let degrees: number[]
    if (bar === 6) {
      durations = takeRhythm([1, 1, 2], 4)
      degrees = durations.map((_, i) => {
        if (i === durations.length - 1) return allowThird ? 6 : 4
        if (allowThird && i === durations.length - 2) return 5
        return 4
      })
    } else if (bar === 7) {
      durations = [3.5]
      degrees = [0]
    } else if (bar === 0 || bar === 2) {
      durations = rhythm
      degrees = sing(motif)
    } else if (bar === 1) {
      durations = rhythm
      degrees = sing(shift(motif, 2), 4)
    } else if (bar === 3) {
      durations = rhythm
      degrees = sing(motif, 0, allowThird ? 6 : 4)
    } else {
      durations = rhythm
      degrees = sing(shift(motif, bar === 5 ? 3 : 2))
    }

    let beat = start
    degrees.forEach((degree, i) => {
      const dur = durations[i]
      const breath = i === degrees.length - 1 && (bar % 2 === 1 || bar >= 6)
      push(events, beat, dur * (breath ? 0.78 : 0.97), degree, lift ? 3 : 2, "melody", 0.9 * vel, root)
      beat += dur
    })

    // Bass on the downbeat, and a fifth halfway through once the music is awake.
    push(events, start, arousal > 0.2 ? 1.85 : 3.6, root, 1, "bass", 0.55 * vel, root)
    if (arousal > 0.18) {
      push(events, start + 2, 1.7, tones[tones.length - 1], 1, "bass", 0.36 * vel, root)
    }

    if (arousal > 0.22 && sectionIndex > 0) {
      tones.forEach((tone, i) => {
        push(events, start + i, 0.85, tone, 2, "harmony", 0.28 * vel, root)
      })
      if (tones.length < 4) {
        push(events, start + tones.length, 0.85, tones[0], 2, "harmony", 0.24 * vel, root)
      }
    } else {
      const order = allowThird ? [0, 2, 1] : [0, 1, 0]
      order.forEach((index, i) => {
        const tone = tones[Math.min(index, tones.length - 1)]
        push(events, start + i * 0.09, 3.2, tone, 2, "harmony", 0.3 * vel * (1 - i * 0.18), root)
      })
    }

    if (sectionIndex > 0 && bar !== 6) {
      const melodyStart = degrees[0]
      const altoTone = tones.slice().sort((a, b) => Math.abs(b - melodyStart) - Math.abs(a - melodyStart))[0]
      push(events, start, bar === 7 ? 3.4 : 1.8, altoTone, 2, "alto", 0.32 * vel, root)
      if (bar !== 7 && arousal > -0.05) {
        const second = tones.find((t) => t !== altoTone) ?? altoTone
        push(events, start + 2, 1.6, second, 2, "alto", 0.26 * vel, root)
      }
    }
  }

  events.sort((a, b) => a.beat - b.beat || a.octave - b.octave)
  return { events, beats: 32, motif: theme }
}

/** Beats per minute from energy, eased a little by pleasantness. */
export function bpmFor(valence: number, arousal: number): number {
  const energy = clamp((arousal + 1) / 2, 0, 1)
  let bpm = 58 + energy * 48
  if (valence < 0) bpm -= 4
  if (valence > 0.4) bpm += 2
  return Math.round(clamp(bpm, 56, 112))
}
