export type LuminaBlockKind =
  | 'hero'
  | 'text'
  | 'list'
  | 'image'
  | 'video'
  | 'quote'
  | 'callout'
  | 'divider'
  | 'accordion'
  | 'tabs'
  | 'flashcards'
  | 'quiz'
  | 'cta'

// A titled pair used by every "collection" block: accordion panels, tab
// panes, and flashcard front/back all share this shape so the inspector
// can edit them with one control.
export interface LuminaPair {
  id: string
  title: string   // panel heading / tab label / card front
  body: string    // panel body / tab body / card back
}

// One block = one row of the lesson. Like StoryCard, fields are flat and
// non-optional (empty defaults) so editing code never branches on
// undefined; the kind decides which fields the inspector exposes and how
// the canvas/player render them.
export interface LuminaBlock {
  id: string
  kind: LuminaBlockKind
  title: string        // hero heading / callout title / quiz question…
  body: string         // paragraphs (blank-line separated) / quote text / CTA sub
  items: string[]      // list block bullet lines
  pairs: LuminaPair[]  // accordion / tabs / flashcards
  src: string          // image data-URL or URL / video URL / CTA href
  alt: string          // image alt text
  caption: string      // image or video caption / quote attribution
  // Quiz fields (same conventions as StoryGen MCQ cards)
  options: string[]
  correctIndex: number
  feedback: string
  // Presentation switches, meaning varies by kind:
  //  list: 'bullet' | 'number' | 'check'
  //  callout: 'note' | 'tip' | 'warning'
  //  divider: 'line' | 'space' | 'dots'
  //  image: 'inset' | 'full'
  //  hero: 'plain' | 'accent'
  //  cta: 'accent' | 'outline'
  variant: string
}

export interface LuminaLesson {
  id: string
  title: string
  blocks: LuminaBlock[]
}

export type LuminaFontId = 'sans' | 'humanist' | 'geometric' | 'serif' | 'classic' | 'mono'
export type LuminaCanvasId = 'ivory' | 'snow' | 'mist' | 'sand' | 'charcoal' | 'midnight'

// Theme travels with the course and drives both the editor canvas and the
// exported player through the same CSS custom properties, so what authors
// see while editing is exactly what learners get.
export interface LuminaTheme {
  accent: string             // any hex color: headings, buttons, quiz UI
  canvas: LuminaCanvasId     // page palette: paper, panel and ink colors
  headingFont: LuminaFontId
  bodyFont: LuminaFontId
  scale: 'compact' | 'cozy' | 'large'      // base reading size
  corners: 'round' | 'soft' | 'sharp'
  motion: 'lively' | 'calm' | 'off'        // how much the course moves
}

export interface LuminaCourse {
  version: string
  title: string
  description: string
  updated: string
  theme: LuminaTheme
  lessons: LuminaLesson[]
}

// One finding from the pre-export gatekeeper. Errors block export until
// fixed; warnings can be consciously overridden.
export interface LuminaAuditIssue {
  level: 'error' | 'warning'
  lessonId: string
  blockId: string | null
  message: string
  fix: string
}
