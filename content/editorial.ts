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
  stamp: string
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
  { id: 'practice', label: 'Practice', accent: 'var(--cat-practice)', onAccent: 'var(--on-cat-practice)',
    blurb: 'The craft itself, demonstrated rather than described.' },
  { id: 'projects', label: 'Projects', accent: 'var(--cat-projects)', onAccent: 'var(--on-cat-projects)',
    blurb: 'Work that shipped, opened up — including the decisions underneath it.' },
  { id: 'tools', label: 'Web apps', accent: 'var(--cat-tools)', onAccent: 'var(--on-cat-tools)',
    blurb: 'Free tools for instructional designers. No sign-up, nothing leaves your browser.' },
  { id: 'story', label: 'Story', accent: 'var(--cat-story)', onAccent: 'var(--on-cat-story)',
    blurb: 'Hotel floors to learning design, in five stops.' },
  { id: 'lab', label: 'Lab', accent: 'var(--cat-lab)', onAccent: 'var(--on-cat-lab)',
    blurb: 'Experiments kept in public because the failures are the interesting part.' },
  { id: 'notes', label: 'Notes', accent: 'var(--cat-notes)', onAccent: 'var(--on-cat-notes)',
    blurb: 'How the work is made, in enough detail to check.' }
]

export const ITEMS: EditorialItem[] = [
  {
    id: 'instructional-design',
    title: 'What gets designed when no one is watching',
    dek: 'A subject expert can already do the thing. Instructional design is turning what they know into something another person can learn — and most of that work is subtraction. Take a badly written instruction apart yourself.',
    category: 'practice',
    media: 'interactive',
    href: '/instructional-design',
    image: '/instructional-design.png',
    alt: 'Cover artwork for the instructional design demonstration',
    stamp: 'Play it in the page',
    minutes: 4,
    featured: true
  },
  {
    id: 'sewa-chronicles',
    title: 'The SEWA Chronicles',
    dek: 'Sixteen pages of true stories from the resort floor, drawn as comic strips and handed back to the teams they came from.',
    category: 'projects',
    media: 'case study',
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
    dek: 'Why the same password takes a second or a century to crack, depending entirely on who is doing the cracking. A full module you can finish in ten minutes.',
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
    dek: 'A guided journey from AI’s long history to modern prediction, models, capabilities, and responsible use.',
    category: 'projects',
    media: 'interactive',
    href: '/courses/ai-atlas',
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/zByMCffPaXYvFeor.jpg',
    alt: 'An editorial illustration mapping the history of artificial intelligence',
    stamp: 'Interactive course',
    minutes: 95,
    size: 'wide'
  },
  {
    id: 'storygen',
    title: 'StoryGen',
    dek: 'Storyboard on an infinite canvas — cards, flows, and a Word export at the end of it.',
    category: 'tools',
    media: 'web app',
    href: '/tools/storygen',
    image: '/storygen.png',
    alt: 'StoryGen storyboard canvas',
    stamp: 'Free · Storyboarding'
  },
  {
    id: 'cadence',
    title: 'Cadence',
    dek: 'Turn a list of topics into a monthly training calendar you can actually present.',
    category: 'tools',
    media: 'web app',
    href: '/tools/cadence',
    image: '/training-cal-gen.png',
    alt: 'Cadence training calendar',
    stamp: 'Free · Planning'
  },
  {
    id: 'easymcq',
    title: 'EasyMCQ',
    dek: 'Write the question and the right answer; the AI writes the wrong ones.',
    category: 'tools',
    media: 'web app',
    href: '/tools/easymcq',
    image: '/easymcq.png',
    alt: 'EasyMCQ distractor generator',
    stamp: 'Free · Assessment'
  },
  {
    id: 'better-emails',
    title: 'Draftly',
    dek: 'Paste a messy draft, get an email you would actually send.',
    category: 'tools',
    media: 'web app',
    href: '/tools/better-emails',
    image: '/better-emails.png',
    alt: 'Draftly email polisher',
    stamp: 'Free · Writing'
  },
  {
    id: 'about',
    title: 'Hospitality to L&D, in five stops',
    dek: 'I studied hotel management and started on the floor. The comic I drew at Club Mahindra is where design stopped being a side interest.',
    category: 'story',
    media: 'essay',
    href: '/about',
    image: '/about-me.png',
    alt: 'Portrait of Naveen Jose',
    stamp: 'About the person',
    minutes: 4,
    size: 'wide'
  },
  {
    id: 'colophon',
    title: 'How this site is built',
    dek: 'I claim I design learning and build the tools that deliver it. This is the working, in enough detail to check.',
    category: 'notes',
    media: 'essay',
    href: '/colophon',
    stamp: 'Colophon',
    minutes: 6
  },
  {
    id: 'lab',
    title: 'Fifteen homepages, one sheet of glass',
    dek: 'Fifteen art directions over the same hand-written refraction shader. Kept in public, unlisted, because the discarded ones are the interesting part.',
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
  { label: 'Practice', href: '/instructional-design' },
  { label: 'Projects', href: '/my-work' },
  { label: 'Web apps', href: '/tools' },
  { label: 'Story', href: '/about' },
  { label: 'Colophon', href: '/colophon' }
]
