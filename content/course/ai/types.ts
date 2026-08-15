/**
 * The course content model.
 *
 * A course is data, not markup. Every screen the learner sees is a `Block`
 * rendered by a component that knows how to draw that block type — which means
 * the whole 10-module pathway can be reviewed, reordered, counted, estimated
 * and progress-tracked without touching a template.
 *
 * The rule the model enforces: **nothing asserts a fact without a place to put
 * its evidence.** Claims carry a confidence label, videos and resources carry a
 * verification date, and speculation is a block type of its own so it can never
 * be mistaken for reporting.
 */

/* ── Evidence ─────────────────────────────────────────────────────────────
   The four-level scale the brief asks for, used on any claim that a
   reasonable person might want to check. `speculative` is deliberately not a
   weaker kind of fact — it is a different thing, and the UI labels it so. */
export type Confidence = 'high' | 'medium' | 'low' | 'speculative'

export interface Video {
  id: string
  /** YouTube video id. */
  yt: string
  /** Exact title as YouTube returns it. Never paraphrased. */
  title: string
  /** Exact channel name as YouTube returns it. */
  channel: string
  /** Runtime as listed by YouTube, "M:SS" or "H:MM:SS". */
  length: string
  /** Where to start, for anything long enough to need it. Seconds. */
  start?: number
  /** What the learner should be doing while they watch. */
  watchFor: string
  /** Why this video, in this place. */
  purpose: string
  /** Notes on captions, visual dependence, language. */
  access: string
  /** The id of another video covering the same ground if this one dies. */
  backup?: string
  /** ISO date the link was last confirmed to resolve. */
  checked: string
}

export interface Resource {
  id: string
  title: string
  url: string
  kind: 'paper' | 'archive' | 'article' | 'interactive' | 'reference' | 'course' | 'policy' | 'tool'
  /** Rough reading/using time, minutes. */
  minutes: number
  level: 'beginner' | 'intermediate' | 'advanced'
  purpose: string
  /** True when the core one-day pathway does not depend on it. */
  optional: boolean
  /** Free to open, sign-in required, paywalled. */
  access: 'open' | 'account' | 'paywalled'
  checked: string
}

export interface Source {
  id: string
  title: string
  url?: string
  publisher: string
  kind: 'primary' | 'secondary' | 'video' | 'reference'
  /** Publication date as printed by the publisher, when one is stated. */
  published?: string
  /** What this source is being used to support. */
  supports: string
  confidence: Confidence
  checked: string
}

/* ── Questions ────────────────────────────────────────────────────────────
   One shape for every kind of check. `answer` is a list of option indices, so
   single-choice, multiple-response and true/false are the same object with
   different option counts and answer lengths. */
export interface Question {
  id: string
  kind: 'mcq' | 'mrq' | 'tf'
  stem: string
  options: string[]
  /** Indices into `options`. More than one makes it a multiple-response. */
  answer: number[]
  /** Why the right answer is right. Shown after the learner commits. */
  rationale: string
  /** Per-option feedback for the wrong ones, keyed by option index. */
  distractors?: Record<number, string>
  difficulty: 'easy' | 'moderate' | 'hard'
  /** Which course objective this question is evidence for. */
  objective: string
}

/* ── Blocks ───────────────────────────────────────────────────────────────
   The vocabulary a lesson is written in. Every one of these has a renderer in
   components/course/. Adding a block type means adding a renderer — which is
   the point: a content type nobody can draw should not be authorable. */
export type Block =
  | { type: 'text'; body: string[]; lead?: boolean }
  | { type: 'heading'; text: string }
  | { type: 'quote'; text: string; attribution: string; source?: string }
  | { type: 'takeaway'; title?: string; body: string }
  | { type: 'evidence'; confidence: Confidence; claim: string; basis: string; sourceId?: string }
  | { type: 'accordion'; title?: string; items: { q: string; a: string }[] }
  | { type: 'tabs'; items: { label: string; body: string }[] }
  | { type: 'flashcards'; title?: string; cards: { front: string; back: string }[] }
  | { type: 'timeline'; items: { year: string; label: string; body: string }[] }
  | { type: 'compare'; caption?: string; columns: string[]; rows: string[][] }
  | { type: 'labeled'; caption: string; parts: { label: string; body: string }[] }
  | { type: 'video'; videoId: string }
  | { type: 'resource'; resourceIds: string[]; title?: string }
  | { type: 'check'; questions: Question[]; title?: string }
  | { type: 'sort'; prompt: string; buckets: string[]; items: { text: string; bucket: number; why: string }[] }
  | { type: 'reflect'; prompt: string; hint?: string; minWords?: number }
  | { type: 'scenario'; setup: string; question: string; choices: { text: string; verdict: 'best' | 'workable' | 'poor'; feedback: string }[] }
  | { type: 'practice'; title: string; steps: string[]; output: string }

export interface Lesson {
  id: string
  title: string
  /** One sentence on what this lesson is for. Shown in the outline. */
  summary: string
  /** Estimated minutes, derived from the block content rather than guessed. */
  minutes: number
  blocks: Block[]
  /** What has to happen before the lesson counts as done. */
  completion: 'read' | 'check' | 'activity'
}

export interface Module {
  id: string
  /** Printed index, "01".."10". */
  n: string
  title: string
  /** Plain-language introduction, shown on the module cover. */
  intro: string
  /** "By the end of this module, you will be able to:" */
  objectives: string[]
  /** The accent this module wears. A CSS custom property name. */
  accent: string
  lessons: Lesson[]
  /** Optional extension content, never required for completion. */
  extension?: { title: string; body: string; resourceIds?: string[] }
}

export interface GlossaryTerm {
  term: string
  short: string
  full: string
  /** Module ids where the term is introduced or used. */
  seenIn: string[]
}

export interface CourseMeta {
  title: string
  subtitle: string
  description: string
  audience: string
  promise: string
  prerequisites: string
  level: string
  /** Total estimated minutes across modules and assessments. */
  minutes: number
  /** "By the end of this course, you will be able to:" — the required format. */
  objectives: string[]
  whyThisMatters: string[]
  /** The date the factual content was last reviewed. Printed on the course. */
  currentAsOf: string
}
