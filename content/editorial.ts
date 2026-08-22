/**
 * The publication's index.
 *
 * Every card on the front page, every section listing and every "read next"
 * rail is generated from this one array. Before, the same four tools were
 * described in navigation.json, again in the PWA manifest, and a third time in
 * prose on /tools — so a description could be updated in one place and stay
 * wrong in two others.
 *
 * A deliberate omission: there are no invented publication dates. This is a
 * portfolio, not a dated feed, and stamping "12 Mar 2025" on a case study
 * because the layout has a slot for a date would be making up a record. What
 * each entry carries instead is true: the year where a year is known, the
 * format, and a reading estimate derived from the actual word count of the
 * page it points at.
 */

export type Category = 'practice' | 'projects' | 'tools' | 'story' | 'lab' | 'notes'
export type Media = 'essay' | 'case study' | 'interactive' | 'web app' | 'course' | 'index'

export interface EditorialItem {
  id: string
  /** The headline. Sentence case — see the type notes in assets/css/main.css. */
  title: string
  /** One sentence on why it matters. Never a repeat of the title. */
  dek: string
  category: Category
  media: Media
  href: string
  /** Artwork. Every card must still make sense when this fails to load. */
  image?: string
  alt?: string
  /** Honest metadata: a year, a format, a status. Never an invented date. */
  stamp?: string
  /** Reading estimate, minutes. Omitted for anything you operate rather than read. */
  minutes?: number
  /** The lead. Exactly one item should carry this. */
  featured?: boolean
  /** Second-tier prominence in the story field. */
  size?: 'wide' | 'tall' | 'standard'
}

export interface CategoryMeta {
  id: Category
  label: string
  /** The CSS custom property carrying this category's accent. */
  accent: string
  onAccent: string
  /** Shown on the section index, under the title. */
  blurb: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'practice', label: 'Lessons', accent: 'var(--cat-practice)', onAccent: 'var(--on-cat-practice)',
    blurb: 'Short lessons for turning confusing instructions into something people can actually follow.' },
  { id: 'projects', label: 'Projects', accent: 'var(--cat-projects)', onAccent: 'var(--on-cat-projects)',
    blurb: 'Courses, comics, and interactive explainers built from real work.' },
  { id: 'tools', label: 'Tools', accent: 'var(--cat-tools)', onAccent: 'var(--on-cat-tools)',
    blurb: 'Free browser tools for writing, planning, making quizzes, and catching an idea before it disappears.' },
  { id: 'story', label: 'Story', accent: 'var(--cat-story)', onAccent: 'var(--on-cat-story)',
    blurb: 'How I went from hotel floors to making learning design. The route was not exactly linear.' },
  { id: 'lab', label: 'Experiments', accent: 'var(--cat-lab)', onAccent: 'var(--on-cat-lab)',
    blurb: 'Small design experiments for seeing what happens when one idea is pushed further.' },
  { id: 'notes', label: 'Documentation', accent: 'var(--cat-notes)', onAccent: 'var(--on-cat-notes)',
    blurb: 'How the site, tools, and artwork are built. Less mystery, more moving parts.' }
]

export const ITEMS: EditorialItem[] = [
  {
    id: 'instructional-design',
    title: 'How to make instructions people can actually follow',
    dek: 'Take an instruction that makes people stop and reread it, then turn it into something they can use.',
    category: 'practice',
    media: 'interactive',
    href: '/instructional-design',
    image: '/instructional-design.png',
    alt: 'Cover artwork for the instructional design demonstration',
    stamp: 'Try the lesson',
    minutes: 4,
    featured: true
  },
  {
    id: 'sewa-chronicles',
    title: 'The SEWA Chronicles',
    dek: 'Sixteen true stories from the resort floor, drawn as comic strips and returned to the teams they came from. Real work, now with panels.',
    category: 'projects',
    media: 'project story',
    href: '/my-work/sewa-chronicles',
    image: '/work-01.png',
    alt: 'The SEWA Chronicles comic cover',
    stamp: 'Club Mahindra · 2023',
    minutes: 5,
    size: 'wide'
  },
  {
    id: 'strong',
    title: 'Strong',
    dek: 'The same password can take a second or a century to crack, depending entirely on who is doing the cracking. A ten-minute module about that uncomfortable gap.',
    category: 'projects',
    media: 'interactive',
    href: '/my-work/strong',
    image: '/strong.png',
    alt: 'Title card for the Strong password module',
    stamp: 'Interactive explainer',
    minutes: 10,
    size: 'tall'
  },
  {
    id: 'ai-atlas',
    title: 'From No AI to Know AI',
    dek: 'Where AI came from, how prediction works, and why its use matters. No magic fog, just the machinery underneath.',
    category: 'projects',
    media: 'interactive',
    href: '/courses/ai-atlas',
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/zByMCffPaXYvFeor.jpg',
    alt: 'An editorial illustration mapping the history of artificial intelligence',
    minutes: 95,
    size: 'wide'
  },
  {
    id: 'storygen',
    title: 'StoryGen',
    dek: 'Plan visual stories on an infinite canvas with cards, connections, and Word export. Put the chaos somewhere useful.',
    category: 'tools',
    media: 'free tool',
    href: '/tools/storygen',
    image: '/storygen.png',
    alt: 'StoryGen storyboard canvas',
    stamp: 'Free · Plan a story'
  },
  {
    id: 'cadence',
    title: 'Cadence',
    dek: 'Turn your topic list into a monthly training calendar. The blank page can take a day off.',
    category: 'tools',
    media: 'free tool',
    href: '/tools/cadence',
    image: '/training-cal-gen.png',
    alt: 'Cadence training calendar',
    stamp: 'Free · Make a calendar'
  },
  {
    id: 'easymcq',
    title: 'EasyMCQ',
    dek: 'Write a question and answer; get three plausible wrong options. The distractors do the awkward part.',
    category: 'tools',
    media: 'free tool',
    href: '/tools/easymcq',
    image: '/easymcq.png',
    alt: 'EasyMCQ distractor generator',
    stamp: 'Free · Make a quiz'
  },
  {
    id: 'better-emails',
    title: 'Draftly',
    dek: 'Paste in a rough email and fix the tone, grammar, and structure in one go. Your first draft does not have to become public history.',
    category: 'tools',
    media: 'free tool',
    href: '/tools/better-emails',
    image: '/better-emails.png',
    alt: 'Draftly email polisher',
    stamp: 'Free · Improve an email'
  },
  {
    id: 'about',
    title: 'How I went from hospitality to learning design',
    dek: 'I studied hotel management and started on the floor. The comic I drew at Club Mahindra was where design stopped being a side interest and started asking for its own chair.',
    category: 'story',
    media: 'essay',
    href: '/about',
    image: '/about-me.png',
    alt: 'Portrait of Naveen Jose',
    stamp: 'About Naveen',
    minutes: 4,
    size: 'wide'
  },
  {
    id: 'colophon',
    title: 'How this site is built',
    dek: 'How this site, its tools, and its artwork are built. The nice surface has a wiring diagram underneath.',
    category: 'notes',
    media: 'essay',
    href: '/colophon',
    stamp: 'Colophon',
    minutes: 6
  },
  {
    id: 'lab',
    title: 'Homepage design experiments',
    dek: 'Fifteen visual experiments made from the same interactive glass effect. One material, fifteen ways to make it misbehave.',
    category: 'lab',
    media: 'interactive',
    href: '/lab',
    stamp: 'Unlisted · WebGL',
    minutes: 2
  }
]

/* ── Derived views ─────────────────────────────────────────────────────── */

export const FEATURED = ITEMS.find(i => i.featured) as EditorialItem
export const REST = ITEMS.filter(i => !i.featured)

export function byCategory(id: Category): EditorialItem[] {
  return ITEMS.filter(i => i.category === id)
}

export function categoryMeta(id: Category): CategoryMeta {
  return CATEGORIES.find(c => c.id === id) as CategoryMeta
}

/** The two or three things worth reading after this one. Same category first. */
export function readNext(id: string, count = 3): EditorialItem[] {
  const self = ITEMS.find(i => i.id === id)
  if (!self) return ITEMS.slice(0, count)
  const near = ITEMS.filter(i => i.id !== id && i.category === self.category)
  const far = ITEMS.filter(i => i.id !== id && i.category !== self.category)
  return [...near, ...far].slice(0, count)
}

/** The masthead's primary navigation. */
export const NAV = [
  { label: 'Lessons', href: '/lessons' },
  { label: 'Projects', href: '/my-work' },
  { label: 'Free tools', href: '/tools' },
  { label: 'About', href: '/about' }
]
