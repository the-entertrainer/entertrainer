export type SgView =
  | 'title'
  | 'objectives'
  | 'menu'
  | 'lesson'
  | 'hands-on'
  | 'assessment'
  | 'thank-you'

export interface Measurement {
  stationId: string
  spSeconds: number   // what the learner measured
  distanceKm: number  // derived via the rule of thumb
  ok: boolean         // within tolerance of the true gap
}

export interface Placement {
  x: number
  y: number
  errorKm: number
}

export interface AssessmentAttempt {
  answers: number[]
  score: number
  passed: boolean
  at: string
}
