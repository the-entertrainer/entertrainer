/**
 * The home page's index of work and apps.
 *
 * Copy is drawn from content/navigation.json and tightened for the editorial
 * layer — the descriptions there were written to sit under a card, and this
 * page sets them at reading size next to a headline, which is a different job.
 * Nothing is invented: every entry maps to a route that already exists.
 *
 * `hash` is the catalogue code. The reference labels every project
 * `#3vva-0000/34`, and the effect is out of all proportion to the effort: a
 * running count and a fixed-width code make a small list read as an archive
 * rather than a portfolio. They are stable strings rather than generated ones
 * so a given piece keeps its number between visits.
 */
export interface IndexEntry {
  id: string
  label: string
  desc: string
  meta: string
  href: string
  img: string
  hash: string
}

export const WORK: IndexEntry[] = [
  {
    id: 'sewa-chronicles',
    label: 'The SEWA Chronicles',
    desc: 'A service-culture comic for Club Mahindra — true guest stories that teach hospitality values in panels, not policy documents.',
    meta: 'Comic · Club Mahindra',
    href: '/my-work/sewa-chronicles',
    img: '/work-01.png',
    hash: 'sewa'
  },
  {
    id: 'strong',
    label: 'Strong',
    desc: 'The real math of password strength: entropy in bits, why length beats symbols, and why the same password is instant or eternal depending on who is guessing.',
    meta: 'Interactive explainer',
    href: '/my-work/strong',
    img: '/strong.png',
    hash: 'strg'
  }
]

export const APPS: IndexEntry[] = [
  {
    id: 'storygen',
    label: 'StoryGen',
    desc: 'Storyboards on an infinite canvas. Cards, flows, and a Word export your SME will actually open.',
    meta: 'Storyboarding',
    href: '/tools/storygen',
    img: '/storygen.png',
    hash: 'stgn'
  },
  {
    id: 'cadence',
    label: 'Cadence',
    desc: 'A list of topics in. A ready-to-present monthly training calendar out.',
    meta: 'Planning',
    href: '/tools/cadence',
    img: '/training-cal-gen.png',
    hash: 'cdnc'
  },
  {
    id: 'easymcq',
    label: 'EasyMCQ',
    desc: 'Give it a question and the right answer. It writes the wrong ones — the plausible kind.',
    meta: 'Assessment',
    href: '/tools/easymcq',
    img: '/easymcq.png',
    hash: 'emcq'
  },
  {
    id: 'better-emails',
    label: 'Draftly',
    desc: 'Messy draft in. An email you would be happy to send out.',
    meta: 'Writing',
    href: '/tools/better-emails',
    img: '/better-emails.png',
    hash: 'drft'
  }
]

/**
 * The single catalogue the pinned Work stage runs through.
 *
 * The original files everything under one "Work" heading — client pieces and
 * side projects in one sequence, ordered for visual rhythm rather than sorted
 * by kind. Following that here means the four apps sit in the same index as the
 * two case studies, which is also the honest shape: they are all things Naveen
 * made, and splitting them was a taxonomy the page didn't need.
 */
export const INDEX: IndexEntry[] = [WORK[0], APPS[0], WORK[1], APPS[1], APPS[2], APPS[3]]

/** Where the rest of the site lives — the footer's index. */
export const ELSEWHERE = [
  { label: 'Instructional Design', desc: 'The practice, and the frameworks behind it', href: '/instructional-design' },
  { label: 'The Lab', desc: '15 WebGL experiments that had no business existing', href: '/lab' },
  { label: 'Downloads', desc: 'Templates, frameworks and curated L&D resources', href: '/downloads' },
  { label: 'About', desc: 'The longer story, in five stops', href: '/about' }
]
