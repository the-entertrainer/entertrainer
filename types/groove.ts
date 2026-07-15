import type { Pattern } from '~/utils/groove/audio'

export type GvView =
  | 'title'
  | 'objectives'
  | 'menu'
  | 'lesson'
  | 'hands-on'
  | 'assessment'
  | 'thank-you'

export interface AssessmentAttempt {
  answers: number[]
  score: number
  passed: boolean
  at: string
}

export interface GrooveResult {
  pattern: Pattern
  matchScore: number
}
