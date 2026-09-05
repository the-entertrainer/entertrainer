/** Structured Elevate posts created via the /compose authoring page. */

export type ComposedBlockType =
  | 'lead'
  | 'paragraph'
  | 'heading'
  | 'blockquote'
  | 'callout'
  | 'figure'
  | 'list'
  | 'closing'

export interface ComposedBlock {
  id: string
  type: ComposedBlockType
  /** Primary text for lead/paragraph/heading/blockquote/callout/closing */
  text?: string
  /** Callout eyebrow label (e.g. "One useful idea.") */
  label?: string
  /** Figure image path or URL */
  src?: string
  alt?: string
  caption?: string
  /** Unordered list items */
  items?: string[]
}

export interface ComposedReference {
  id: number
  title: string
  source: string
  href: string
}

export interface ComposedMarginNote {
  label: string
  body: string
}

export interface ComposedPost {
  slug: string
  title: string
  dek: string
  category: string
  minutes: number
  hero: string
  heroAlt: string
  status: 'draft' | 'published'
  publishedAt: string
  updatedAt: string
  marginNote?: ComposedMarginNote
  blocks: ComposedBlock[]
  references?: ComposedReference[]
}

export function emptyComposedPost(partial?: Partial<ComposedPost>): ComposedPost {
  const now = new Date().toISOString()
  return {
    slug: '',
    title: '',
    dek: '',
    category: 'Mind & meaning',
    minutes: 5,
    hero: '',
    heroAlt: '',
    status: 'draft',
    publishedAt: now,
    updatedAt: now,
    marginNote: { label: 'One useful idea.', body: '' },
    blocks: [
      { id: newBlockId(), type: 'lead', text: '' },
      { id: newBlockId(), type: 'paragraph', text: '' }
    ],
    references: [],
    ...partial
  }
}

export function newBlockId() {
  return `b_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
