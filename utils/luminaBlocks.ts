import type {
  LuminaBlock, LuminaBlockKind, LuminaCanvasId, LuminaCourse, LuminaFontId,
  LuminaLesson, LuminaPair, LuminaTheme
} from '~/types/lumina'

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

// Every font choice is a system stack, so exported courses stay one
// self-contained file with nothing to download and no layout shift.
export const LUMINA_FONTS: Record<LuminaFontId, { label: string; stack: string }> = {
  sans:      { label: 'Modern sans',   stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` },
  humanist:  { label: 'Humanist sans', stack: `Seravek, 'Gill Sans Nova', Ubuntu, Calibri, 'DejaVu Sans', Verdana, sans-serif` },
  geometric: { label: 'Geometric',     stack: `'Avenir Next', Avenir, Futura, 'Century Gothic', 'Trebuchet MS', sans-serif` },
  serif:     { label: 'Editorial serif', stack: `'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif` },
  classic:   { label: 'Classic serif', stack: `Charter, 'Bitstream Charter', Cambria, Georgia, 'Times New Roman', serif` },
  mono:      { label: 'Typewriter',    stack: `ui-monospace, 'Cascadia Code', 'SF Mono', Menlo, Consolas, monospace` }
}
export const LUMINA_FONT_ORDER: LuminaFontId[] = ['sans', 'humanist', 'geometric', 'serif', 'classic', 'mono']

// Page palettes. Each pairs paper (page), panel (cards) and ink (text),
// chosen so body text clears WCAG AA contrast on both surfaces.
export const LUMINA_CANVASES: Record<LuminaCanvasId, { label: string; paper: string; panel: string; ink: string; dark: boolean }> = {
  ivory:    { label: 'Ivory',    paper: '#FAF7F2', panel: '#FFFFFF', ink: '#221D16', dark: false },
  snow:     { label: 'Snow',     paper: '#FFFFFF', panel: '#F6F7F8', ink: '#17181A', dark: false },
  mist:     { label: 'Mist',     paper: '#EFF2F6', panel: '#FFFFFF', ink: '#1B2430', dark: false },
  sand:     { label: 'Sand',     paper: '#F5EEDE', panel: '#FFFCF5', ink: '#2A2118', dark: false },
  charcoal: { label: 'Charcoal', paper: '#232120', panel: '#2D2A28', ink: '#F1EDE7', dark: true },
  midnight: { label: 'Midnight', paper: '#111419', panel: '#1B2028', ink: '#E8ECF2', dark: true }
}
export const LUMINA_CANVAS_ORDER: LuminaCanvasId[] = ['ivory', 'snow', 'mist', 'sand', 'charcoal', 'midnight']

export const LUMINA_SCALES: Record<LuminaTheme['scale'], { label: string; px: number }> = {
  compact: { label: 'Compact', px: 15.5 },
  cozy:    { label: 'Cozy',    px: 17 },
  large:   { label: 'Large',   px: 19 }
}

export const LUMINA_CORNERS: Record<LuminaTheme['corners'], { label: string; r: number; rs: number }> = {
  round: { label: 'Round', r: 18, rs: 12 },
  soft:  { label: 'Soft',  r: 10, rs: 8 },
  sharp: { label: 'Sharp', r: 4,  rs: 3 }
}

export const LUMINA_MOTIONS: Record<LuminaTheme['motion'], { label: string; hint: string }> = {
  lively: { label: 'Lively', hint: 'Blocks rise into view as learners scroll' },
  calm:   { label: 'Calm',   hint: 'Gentle fades only' },
  off:    { label: 'Still',  hint: 'No animation at all' }
}

export function defaultTheme(): LuminaTheme {
  return { accent: '#F5A623', canvas: 'ivory', headingFont: 'sans', bodyFont: 'sans', scale: 'cozy', corners: 'round', motion: 'lively' }
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

// Rough reading time at 200 words per minute, counting every text field a
// learner will actually read. Shown on the shelf, the editor and the
// exported cover.
export function courseReadingMinutes(course: LuminaCourse): number {
  let words = 0
  const count = (s: string) => { words += s.split(/\s+/).filter(Boolean).length }
  for (const lesson of course.lessons) {
    count(lesson.title)
    for (const b of lesson.blocks) {
      count(b.title); count(b.body); count(b.caption); count(b.feedback)
      b.items.forEach(count)
      b.options.forEach(count)
      b.pairs.forEach(p => { count(p.title); count(p.body) })
    }
  }
  return Math.max(1, Math.round(words / 200))
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
    if (LUMINA_CANVASES[theme.canvas as LuminaCanvasId]) course.theme.canvas = theme.canvas
    if (LUMINA_FONTS[theme.headingFont as LuminaFontId]) course.theme.headingFont = theme.headingFont
    if (LUMINA_FONTS[theme.bodyFont as LuminaFontId]) course.theme.bodyFont = theme.bodyFont
    if (LUMINA_SCALES[theme.scale as LuminaTheme['scale']]) course.theme.scale = theme.scale
    if (LUMINA_CORNERS[theme.corners as LuminaTheme['corners']]) course.theme.corners = theme.corners
    if (LUMINA_MOTIONS[theme.motion as LuminaTheme['motion']]) course.theme.motion = theme.motion
    // Courses saved before the theme had font pairs carried a single
    // 'font' switch. Honor it.
    if (theme.font === 'serif' && !theme.bodyFont) {
      course.theme.headingFont = 'serif'
      course.theme.bodyFont = 'serif'
    }
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
