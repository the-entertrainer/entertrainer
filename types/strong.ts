export type StView =
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

export interface LabResult {
  // Effective (realistic) bits reached in the lab, and how it was built.
  effBits: number
  naiveBits: number
  length: number
  usedPassphrase: boolean
}
