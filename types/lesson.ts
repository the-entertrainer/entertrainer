export type BlockType =
  | 'heading'
  | 'text'
  | 'statement'
  | 'quote'
  | 'image'
  | 'process'
  | 'knowledgeCheck'
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
