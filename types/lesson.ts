export type BlockType =
  | 'heading'
  | 'text'
  | 'statement'
  | 'quote'
  | 'image'
  | 'process'
  | 'knowledgeCheck'
  | 'flashcards'
  | 'accordion'
  | 'reflection'
  | 'sources'

export interface BaseBlock {
  id: string
  type: BlockType
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading'
  text: string
  level?: 2 | 3
}

export interface TextBlock extends BaseBlock {
  type: 'text'
  content: string
  lead?: boolean
}

export interface StatementBlock extends BaseBlock {
  type: 'statement'
  text: string
  style?: 'callout' | 'warning' | 'insight'
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote'
  text: string
  attribution?: string
}

export interface ImageBlock extends BaseBlock {
  type: 'image'
  src: string
  alt: string
  caption?: string
  credit?: string
}

export interface ProcessStep {
  label: string
  detail?: string
  bad?: boolean
  note?: string
}

export interface ProcessBlock extends BaseBlock {
  type: 'process'
  title?: string
  steps: ProcessStep[]
}

export interface KnowledgeCheckOption {
  id: string
  text: string
}

export interface KnowledgeCheckBlock extends BaseBlock {
  type: 'knowledgeCheck'
  question: string
  options: KnowledgeCheckOption[]
  correctId: string
  feedback: { correct: string; incorrect: string }
}

export interface Flashcard {
  id: string
  front: string
  back: string
}

export interface FlashcardsBlock extends BaseBlock {
  type: 'flashcards'
  title?: string
  cards: Flashcard[]
}

export interface AccordionItem {
  title: string
  content: string
}

export interface AccordionBlock extends BaseBlock {
  type: 'accordion'
  title?: string
  items: AccordionItem[]
}

export interface ReflectionBlock extends BaseBlock {
  type: 'reflection'
  prompt: string
  placeholder?: string
}

export interface SourcesBlock extends BaseBlock {
  type: 'sources'
  items: { id: number; title: string; source: string; href: string }[]
}

export type Block =
  | HeadingBlock
  | TextBlock
  | StatementBlock
  | QuoteBlock
  | ImageBlock
  | ProcessBlock
  | KnowledgeCheckBlock
  | FlashcardsBlock
  | AccordionBlock
  | ReflectionBlock
  | SourcesBlock

export interface Lesson {
  id: string
  slug: string
  title: string
  objective: string
  dek: string
  category: string
  minutes: number
  hero?: string
  heroAlt?: string
  blocks: Block[]
}

/** Course Studio document contract. Bump when the lesson shape changes. */
export const LESSON_SCHEMA_VERSION = 1 as const

export type LessonSchemaVersion = typeof LESSON_SCHEMA_VERSION

/**
 * Versioned lesson file. Export always writes this shape.
 * Import also accepts a bare Lesson (no wrapper) from earlier hand-written files.
 */
export interface LessonDocument {
  schemaVersion: LessonSchemaVersion
  lesson: Lesson
}

export const LESSON_PACKAGE_FORMATS = ['scorm12', 'scorm2004', 'xapi'] as const

export type LessonPackageFormat = (typeof LESSON_PACKAGE_FORMATS)[number]

/**
 * TODO: SCORM 1.2, SCORM 2004, and xAPI (Tin Can) packaging.
 * An exporter reads a LessonDocument and returns a package blob.
 * Do not scrape the lesson player DOM — this document is the contract.
 */
export interface LessonPackageExporter {
  readonly format: LessonPackageFormat
  exportPackage(document: LessonDocument): Promise<Blob>
}
