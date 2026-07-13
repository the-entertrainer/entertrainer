// Data model for "The Confidence Trap" (/my-work/confidence-trap). Every
// screen writes real, timestamped state here — nothing on the final chart
// is fabricated or hardcoded; it is a direct read of what the learner
// actually did in the Lesson and the Hands-On gauntlet.

export type CtView = 'title' | 'objectives' | 'menu' | 'lesson' | 'hands-on' | 'assessment' | 'thank-you'

export interface LessonRating {
  sectionId: string
  rating: number // 1-5, self-reported understanding confidence
  at: string
}

export interface GauntletQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
}

export interface GauntletResponse {
  questionId: string
  confidence: number // 0-100, set before answering
  chosenIndex: number
  correct: boolean
  at: string
}

export interface AssessmentQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
}

export interface AssessmentAttempt {
  answers: number[] // chosenIndex per question, in question order
  score: number // 0-1
  passed: boolean
  at: string
}
