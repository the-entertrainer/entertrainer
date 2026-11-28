/**
 * The site index for the command palette (Ctrl/Cmd+K or "/").
 * Built only from data that already exists: the Elevate posts, the editorial
 * items, and the fixed list of games, studios and pages below.
 */
import { BLOG_POSTS } from '~/content/blogs'
import { normalizeElevateCategory } from '~/content/elevate-categories'

export type IndexKind = 'Essay' | 'Tool' | 'Game' | 'Course' | 'Studio' | 'Page'

export interface IndexEntry {
  id: string
  kind: IndexKind
  title: string
  hint: string
  href: string
  /** Extra words that should match, never shown. */
  keywords?: string
}

const PAGES: IndexEntry[] = [
  { id: 'p-home', kind: 'Page', title: 'Front page', hint: 'Elevate, Empower, Engage', href: '/' },
  { id: 'p-elevate', kind: 'Page', title: 'Elevate', hint: 'Plain-language essays: Mind, Universe, Science, Technology', href: '/elevate', keywords: 'blog essays reading must' },
  { id: 'p-empower', kind: 'Page', title: 'Empower', hint: 'Free tools for L&D work', href: '/empower', keywords: 'tools ai' },
  { id: 'p-engage', kind: 'Page', title: 'Engage', hint: 'Small games and detours', href: '/engage', keywords: 'games play' },
  { id: 'p-about', kind: 'Page', title: 'About me', hint: 'Naveen Jose: the longer route behind Entertrainer', href: '/about', keywords: 'naveen story kerala marriott club mahindra concentrix' },
  { id: 'p-colophon', kind: 'Page', title: 'Colophon', hint: 'How this site is built: type, colour, motion', href: '/colophon', keywords: 'design system fonts tokens' },
  { id: 'p-lessons', kind: 'Page', title: 'Lessons', hint: 'Short lessons', href: '/lessons' }
]

const TOOLS: IndexEntry[] = [
  { id: 't-easymcq', kind: 'Tool', title: 'EasyMCQ', hint: 'Three believable wrong options for a quiz question', href: '/tools/easymcq', keywords: 'mcq quiz distractor question moodle gift aiken' },
  { id: 't-draftly', kind: 'Tool', title: 'Draftly', hint: 'Turn a rough email into a clear one', href: '/tools/better-emails', keywords: 'email polish rewrite better emails' },
  { id: 't-cadence', kind: 'Studio', title: 'Cadence', hint: 'Plan a month of training sessions', href: '/tools/cadence', keywords: 'calendar training schedule pptx ics' },
  { id: 't-storygen', kind: 'Studio', title: 'StoryGen', hint: 'Storyboard a course on an open canvas', href: '/tools/storygen', keywords: 'storyboard canvas course design word excel' },
  { id: 't-dialogue', kind: 'Studio', title: 'Dialogue', hint: 'Make a vertical comic in the browser', href: '/dialogue/', keywords: 'comic webtoon panels' }
]

const GAMES: IndexEntry[] = [
  { id: 'g-stack', kind: 'Game', title: 'Stack', hint: 'Tap to drop. Only the overlap stays.', href: '/engage/stack', keywords: 'game tower blocks' },
  { id: 'g-mind', kind: 'Game', title: 'The Mind Reader', hint: 'A digit-sum trick, and how it works', href: '/engage/read-my-mind', keywords: 'magic trick maths number' },
  { id: 'g-astro', kind: 'Game', title: 'AstroClock', hint: 'Birth place and time. A live dial.', href: '/engage/astroclock', keywords: 'astrology sky clock zodiac' }
]

const COURSES: IndexEntry[] = [
  { id: 'c-id', kind: 'Course', title: 'How to make instructions people can actually follow', hint: 'Instructional design, in four minutes', href: '/instructional-design', keywords: 'instructional design lesson' },
  { id: 'c-atlas', kind: 'Course', title: 'From No AI to Know AI', hint: 'Where AI came from and how prediction works', href: '/courses/ai-atlas', keywords: 'ai atlas course machine learning' },
  { id: 'c-strong', kind: 'Course', title: 'Strong', hint: 'A ten-minute module on password strength', href: '/my-work/strong', keywords: 'password entropy security' },
  { id: 'c-sewa', kind: 'Course', title: 'The SEWA Chronicles', hint: 'Sixteen true stories from the resort floor, as comics', href: '/my-work/sewa-chronicles', keywords: 'comic club mahindra case study' }
]

export function siteIndex(): IndexEntry[] {
  const essays: IndexEntry[] = BLOG_POSTS
    .filter(p => p.status === 'published')
    .map(p => ({
      id: `e-${p.slug}`,
      kind: 'Essay' as const,
      title: p.title,
      hint: `${normalizeElevateCategory(p.category)} · ${p.minutes} min`,
      href: `/elevate/${p.slug}`,
      keywords: `${p.dek} ${(p.tags || []).join(' ')}`
    }))
  return [...PAGES, ...TOOLS, ...essays, ...GAMES, ...COURSES]
}

/** Small fuzzy score: whole-word and prefix hits beat scattered letters. */
export function scoreEntry(e: IndexEntry, q: string): number {
  const query = q.trim().toLowerCase()
  if (!query) return 1
  const title = e.title.toLowerCase()
  const rest = `${e.hint} ${e.keywords || ''} ${e.kind}`.toLowerCase()
  let score = 0
  for (const word of query.split(/\s+/)) {
    if (title.startsWith(word)) score += 10
    else if (new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(title)) score += 7
    else if (title.includes(word)) score += 5
    else if (rest.includes(word)) score += 2
    else return 0
  }
  return score
}
