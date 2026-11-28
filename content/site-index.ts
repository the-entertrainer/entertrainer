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
  { id: 'p-empower', kind: 'Page', title: 'Empower', hint: 'Free apps for people who train people', href: '/empower', keywords: 'tools ai' },
  { id: 'p-engage', kind: 'Page', title: 'Engage', hint: 'Games about how we learn', href: '/engage', keywords: 'games play' },
  { id: 'p-about', kind: 'Page', title: 'About me', hint: 'Naveen Jose: the longer route behind Entertrainer', href: '/about', keywords: 'naveen story kerala marriott club mahindra concentrix' },
  { id: 'p-colophon', kind: 'Page', title: 'Colophon', hint: 'How this site is built: type, colour, motion', href: '/colophon', keywords: 'design system fonts tokens' },
  { id: 'p-lessons', kind: 'Page', title: 'Lessons', hint: 'Short lessons', href: '/lessons' }
]

// The current family (content/family.ts). Older tools and games stay at their
// URLs but are unlisted, so they are not offered here.
const TOOLS: IndexEntry[] = [
  { id: 't-aim', kind: 'Tool', title: 'Aim', hint: 'Write a learning objective you can measure', href: '/empower/aim', keywords: 'objective bloom verb abcd outcome' },
  { id: 't-plain', kind: 'Tool', title: 'Plain', hint: 'See where an instruction will trip people', href: '/empower/plain', keywords: 'clarity readability plain language sop' },
  { id: 't-cue', kind: 'Tool', title: 'Cue', hint: 'Plan a session minute by minute', href: '/empower/cue', keywords: 'session plan gagne agenda run of show' }
]

const GAMES: IndexEntry[] = [
  { id: 'g-ladder', kind: 'Game', title: 'Ladder', hint: 'Put each verb on the right rung of Bloom’s ladder', href: '/engage/ladder', keywords: 'bloom game verbs' },
  { id: 'g-pairs', kind: 'Game', title: 'Pairs', hint: 'A memory game where the cards are ideas', href: '/engage/pairs', keywords: 'memory match learning science' },
  { id: 'g-steps', kind: 'Game', title: 'Steps', hint: 'Shuffled steps. Put them back in order.', href: '/engage/steps', keywords: 'sequence order procedure puzzle' }
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
