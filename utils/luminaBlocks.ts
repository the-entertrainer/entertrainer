import type { LuminaBlock, LuminaBlockKind, LuminaCourse, LuminaLesson, LuminaPair, LuminaTheme } from '~/types/lumina'

export interface LuminaKindMeta {
  label: string
  hint: string
  color: string
  group: 'content' | 'media' | 'interactive'
}

// The block palette in canonical order. Colors are per-kind identity dots,
// mirroring StoryGen's card-kind colors.
export const LUMINA_KINDS: Record<LuminaBlockKind, LuminaKindMeta> = {
  hero:       { label: 'Heading',     hint: 'Big statement or lesson opener',        color: '#F5A623', group: 'content' },
  text:       { label: 'Paragraph',   hint: 'Body copy, blank line = new paragraph', color: '#8B7CF6', group: 'content' },
  list:       { label: 'List',        hint: 'Bullets, numbers or checkmarks',        color: '#5B8DEF', group: 'content' },
  quote:      { label: 'Quote',       hint: 'Pull-quote with attribution',           color: '#2DD4BF', group: 'content' },
  callout:    { label: 'Callout',     hint: 'Note, tip or warning panel',            color: '#F08C4A', group: 'content' },
  divider:    { label: 'Divider',     hint: 'Line, dots or breathing space',         color: '#9AA3AE', group: 'content' },
  image:      { label: 'Image',       hint: 'Upload with alt text and caption',      color: '#E15B8F', group: 'media' },
  video:      { label: 'Video',       hint: 'YouTube, Vimeo or MP4 link',            color: '#C084FC', group: 'media' },
  accordion:  { label: 'Accordion',   hint: 'Tap-to-expand panels',                  color: '#34C3A2', group: 'interactive' },
  tabs:       { label: 'Tabs',        hint: 'Switchable panes, swipeable on phones', color: '#4FA8E8', group: 'interactive' },
  flashcards: { label: 'Flashcards',  hint: 'Tap-to-flip study cards',               color: '#F6C444', group: 'interactive' },
  quiz:       { label: 'Knowledge check', hint: 'Question with instant feedback',    color: '#FF7A6B', group: 'interactive' },
  cta:        { label: 'Button',      hint: 'Link out or mark a milestone',          color: '#7FD07F', group: 'interactive' }
}

export const LUMINA_KIND_ORDER: LuminaBlockKind[] = [
  'hero', 'text', 'list', 'quote', 'callout', 'divider',
  'image', 'video',
  'accordion', 'tabs', 'flashcards', 'quiz', 'cta'
]

export function luminaId(prefix = 'b') {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export function createPair(title = '', body = ''): LuminaPair {
  return { id: luminaId('p'), title, body }
}

const DEFAULT_VARIANT: Partial<Record<LuminaBlockKind, string>> = {
  list: 'bullet',
  callout: 'note',
  divider: 'line',
  image: 'inset',
  hero: 'accent',
  cta: 'accent'
}

export function createBlock(kind: LuminaBlockKind): LuminaBlock {
  const block: LuminaBlock = {
    id: luminaId('b'),
    kind,
    title: '',
    body: '',
    items: [],
    pairs: [],
    src: '',
    alt: '',
    caption: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    feedback: '',
    variant: DEFAULT_VARIANT[kind] || ''
  }
  // Interactive collections start with two empty slots so the canvas shows
  // their real shape instead of a bare placeholder.
  if (kind === 'accordion' || kind === 'tabs' || kind === 'flashcards') {
    block.pairs = [createPair(), createPair()]
  }
  if (kind === 'list') block.items = ['', '']
  return block
}

export function createLesson(title = 'New lesson'): LuminaLesson {
  return { id: luminaId('l'), title, blocks: [] }
}

export const LUMINA_ACCENTS = ['#F5A623', '#E15B8F', '#8B7CF6', '#2DD4BF', '#5B8DEF', '#FF7A6B', '#34A853', '#243F6A']

export function defaultTheme(): LuminaTheme {
  return { accent: '#F5A623', font: 'sans', corners: 'round' }
}

export function createCourse(title = 'Untitled Course'): LuminaCourse {
  return {
    version: '1.0',
    title,
    description: '',
    updated: new Date().toISOString(),
    theme: defaultTheme(),
    lessons: [createLesson('Lesson 1')]
  }
}

// A one-line summary of what a block holds — used by the canvas for empty
// states and by the audit sheet to name a block.
export function blockPreview(block: LuminaBlock): string {
  const first = (s: string) => s.trim().split('\n')[0]?.slice(0, 60) || ''
  switch (block.kind) {
    case 'hero': return first(block.title)
    case 'text': return first(block.body)
    case 'list': return block.items.find(i => i.trim()) || ''
    case 'quote': return first(block.body)
    case 'callout': return first(block.title) || first(block.body)
    case 'divider': return LUMINA_KINDS.divider.label
    case 'image': return first(block.caption) || first(block.alt)
    case 'video': return first(block.caption) || first(block.src)
    case 'accordion':
    case 'tabs':
    case 'flashcards': return block.pairs.find(p => p.title.trim())?.title || ''
    case 'quiz': return first(block.title)
    case 'cta': return first(block.title)
  }
}

// ── Import normalization ─────────────────────────────────────────
// Accepts any parsed .lumina JSON (or hand-edited file) and returns a
// course every editor code path can trust: all fields present, all ids
// strings, quiz indexes clamped — same defensive posture as StoryGen's
// normalizeProject.
export function normalizeCourse(data: any): LuminaCourse {
  const course = createCourse(String(data?.title || 'Untitled Course'))
  course.description = String(data?.description || '')
  const theme = data?.theme
  if (theme && typeof theme === 'object') {
    if (typeof theme.accent === 'string' && /^#[0-9a-f]{6}$/i.test(theme.accent)) course.theme.accent = theme.accent
    if (theme.font === 'serif') course.theme.font = 'serif'
    if (theme.corners === 'sharp') course.theme.corners = 'sharp'
  }
  const lessons = Array.isArray(data?.lessons) ? data.lessons : []
  course.lessons = lessons.map((l: any, li: number): LuminaLesson => ({
    id: String(l?.id || luminaId('l')),
    title: String(l?.title || `Lesson ${li + 1}`),
    blocks: (Array.isArray(l?.blocks) ? l.blocks : []).map((b: any): LuminaBlock => {
      const kind: LuminaBlockKind = LUMINA_KINDS[b?.kind as LuminaBlockKind] ? b.kind : 'text'
      const base = createBlock(kind)
      const options = Array.isArray(b?.options) ? b.options.slice(0, 4).map(String) : base.options
      while (options.length < 4) options.push('')
      return {
        ...base,
        title: String(b?.title || ''),
        body: String(b?.body || ''),
        items: Array.isArray(b?.items) ? b.items.map(String) : base.items,
        pairs: Array.isArray(b?.pairs)
          ? b.pairs.map((p: any) => ({ id: String(p?.id || luminaId('p')), title: String(p?.title || ''), body: String(p?.body || '') }))
          : base.pairs,
        src: String(b?.src || ''),
        alt: String(b?.alt || ''),
        caption: String(b?.caption || ''),
        options,
        correctIndex: Math.max(0, Math.min(3, Number(b?.correctIndex) || 0)),
        feedback: String(b?.feedback || ''),
        variant: typeof b?.variant === 'string' ? b.variant : base.variant,
        id: String(b?.id || base.id)
      }
    })
  }))
  if (!course.lessons.length) course.lessons = [createLesson('Lesson 1')]
  return course
}
