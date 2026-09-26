/**
 * Logic bridge: a color estimate becomes a musical plan.
 *
 * Iso principle (Altshuler, 1948; Starcke & von Georgi, 2023): meet the
 * current state, then move. Already-pleasant readings are amplified, not
 * replaced. Agitation is settled — the pulse slows — rather than sped up.
 * A heavy reading starts low and slow, then a later phrase may step up by a just fifth.
 */

import { estimate, type Affect, type Swatch } from "./survey"
import { getTuning, type TuningId } from "./tunings"

export type Instrument = "flute" | "violin"

export type Quadrant = "heavy" | "stirred" | "open" | "bright"

export type Strategy = "lift" | "settle" | "amplify"

export type SessionPlan = {
  affect: Affect
  start: { valence: number; arousal: number }
  target: { valence: number; arousal: number }
  quadrant: Quadrant
  strategy: Strategy
  instrument: Instrument
  tuningId: TuningId
  phrase: string
  intent: string
  tentative: boolean
  seed: number
  journeySec: number
}

export function quadrantOf(valence: number, arousal: number): Quadrant {
  if (valence >= 0.12 && arousal >= 0.22) return "bright"
  if (valence >= 0.12) return "open"
  if (arousal >= 0.18) return "stirred"
  return "heavy"
}

export function targetFor(valence: number, arousal: number): { valence: number; arousal: number; strategy: Strategy } {
  if (valence >= 0.12) {
    return {
      valence: clamp(valence + 0.2, 0.38, 0.82),
      arousal: arousal >= 0.22 ? clamp(arousal * 0.9, 0.18, 0.62) : clamp(arousal + 0.06, -0.2, 0.2),
      strategy: "amplify",
    }
  }
  if (arousal >= 0.18) {
    return { valence: 0.28, arousal: -0.16, strategy: "settle" }
  }
  return { valence: 0.38, arousal: -0.02, strategy: "lift" }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

export function smoothstep(x: number): number {
  const t = clamp(x, 0, 1)
  return t * t * (3 - 2 * t)
}

/** Audible base among sexagesimal-clean frequencies: 60, 90, 120. */
export function baseHzFor(valence: number, arousal: number): number {
  if (valence < 0.06 && arousal < 0.2) return 60
  if (valence >= 0.42 && arousal >= 0.28) return 120
  return 90
}

/** Slow, irregular breaths — never a jig. Still → about 5s, stirred → about 2.4s. */
export function noteSeconds(arousal: number): number {
  const t = (arousal + 1) / 2
  return 5.05 + (2.35 - 5.05) * t
}

const RATIO_WEIGHTS: { r: number; w: (v: number, a: number) => number }[] = [
  { r: 1, w: () => 1.55 },
  { r: 10 / 9, w: (v) => 1.05 - smoothstep(v) * 0.6 },
  { r: 5 / 4, w: (v) => 0.08 + smoothstep((v + 0.12) / 0.85) * 1.6 },
  { r: 4 / 3, w: () => 1.2 },
  { r: 3 / 2, w: () => 1.4 },
  { r: 5 / 3, w: (v) => 0.22 + smoothstep(v) * 1.2 },
  { r: 15 / 8, w: (v, a) => 0.1 + Math.max(0, a) * 0.7 },
]

export function degreeWeight(ratio: number, valence: number, arousal: number): number {
  let rr = ratio
  while (rr >= 2) rr /= 2
  while (rr < 1) rr *= 2
  let best = RATIO_WEIGHTS[0]
  let bestD = Infinity
  for (const step of RATIO_WEIGHTS) {
    const d = Math.abs(Math.log(rr / step.r))
    if (d < bestD) {
      bestD = d
      best = step
    }
  }
  return Math.max(0.02, best.w(valence, arousal))
}

const COPY: Record<Quadrant, { phrase: string; intent: string; tuningId: TuningId }> = {
  heavy: {
    phrase: "Quiet weight",
    intent: "Slow phrases on open fifths. The major third arrives only as it lifts.",
    tuningId: "ishartum",
  },
  stirred: {
    phrase: "Stirred",
    intent: "More motion at first. Then the phrases lengthen and settle.",
    tuningId: "qablitum",
  },
  open: {
    phrase: "Clear and still",
    intent: "A clear tune, unhurried, warming as it repeats.",
    tuningId: "embubum",
  },
  bright: {
    phrase: "Bright",
    intent: "Violin, already lifted, opening a little further.",
    tuningId: "nidqablum",
  },
}

export function pleasantnessWord(valence: number): string {
  if (valence > 0.4) return "clearly pleasant"
  if (valence > 0.12) return "mildly pleasant"
  if (valence > -0.1) return "mixed"
  return "low in pleasantness"
}

export function energyWord(arousal: number): string {
  if (arousal > 0.4) return "high energy"
  if (arousal > 0.12) return "raised energy"
  if (arousal > -0.12) return "quiet energy"
  return "very still"
}

export function strategyText(strategy: Strategy): string {
  switch (strategy) {
    case "amplify":
      return "The reading is already pleasant, so the music stays with it and lets a pure major third bloom. It does not yank you somewhere else."
    case "settle":
      return "Raised energy with low pleasantness is treated as agitation. The first phrases move, then the pulse eases and the lines get longer. Settling, not speeding up."
    case "lift":
      return "Low pleasantness and low energy are met with a slow tune on open fifths. Later phrases allow the major third and may step up by a just fifth, 3/2."
  }
}

export function buildPlan(history: readonly Swatch[], seed: number): SessionPlan {
  const affect = estimate(history) ?? {
    valence: 0,
    arousal: 0,
    confidence: 0.3,
    rounds: history.length,
  }
  const quadrant = quadrantOf(affect.valence, affect.arousal)
  const copy = COPY[quadrant]
  const target = targetFor(affect.valence, affect.arousal)
  const instrument: Instrument = affect.valence >= 0.2 && affect.arousal >= 0.22 ? "violin" : "flute"
  const tuning = getTuning(copy.tuningId)
  return {
    affect,
    start: { valence: affect.valence, arousal: affect.arousal },
    target: { valence: target.valence, arousal: target.arousal },
    quadrant,
    strategy: target.strategy,
    instrument,
    tuningId: tuning.id,
    phrase: copy.phrase,
    intent: copy.intent,
    tentative: affect.confidence < 0.48,
    seed,
    journeySec: 96,
  }
}

export function affectAt(
  start: { valence: number; arousal: number },
  target: { valence: number; arousal: number },
  p: number,
): { valence: number; arousal: number } {
  const k = smoothstep(p)
  return {
    valence: start.valence + (target.valence - start.valence) * k,
    arousal: start.arousal + (target.arousal - start.arousal) * k,
  }
}
