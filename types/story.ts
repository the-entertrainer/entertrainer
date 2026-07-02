export type CardKind =
  | 'title'
  | 'objectives'
  | 'divider'
  | 'text-image'
  | 'video'
  | 'mcq'
  | 'summary'
  | 'thankyou'

// One card = one screen in the course. Every kind shares the storyboard
// columns (narration, notes, duration); the kind decides which of the
// content fields the inspector exposes and how the node previews it.
export interface StoryCard {
  id: string
  kind: CardKind
  stage: string       // stage id within the project's instructional design model ('' = unassigned)
  title: string
  body: string        // on-screen text / objectives (one per line) / key points / message
  visual: string      // visual, image, or video direction for the developer
  narration: string   // audio script
  notes: string       // developer & navigation notes
  duration: number    // seconds
  status: string
  x: number
  y: number
  // MCQ-only fields — kept non-optional (empty defaults) so editing is simple
  question: string
  options: string[]
  correctIndex: number
  feedback: string
}

export interface Connection {
  id: string
  from: string
  to: string
}

export interface StoryGenProject {
  version: string
  title: string
  model: string       // instructional design model id (see utils/idModels.ts)
  updated: string
  cards: StoryCard[]
  connections: Connection[]
}

export const CARD_STATUSES = ['Draft', 'In Review', 'Approved', 'Final'] as const
