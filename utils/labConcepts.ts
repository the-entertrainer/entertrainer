/**
 * The Lab is now five *spatial systems*, not five skins.
 *
 * The original spiral proved the idea: a portfolio can be a space you move
 * through rather than a page you scroll. What it never explored is that the
 * geometry itself is a design decision — a drum, a press bed, a whirlpool, a
 * twisted band and a morphing lattice each imply a different way of reading
 * the same four sections, and each therefore implies a different way of
 * setting a page.
 *
 * So every concept here fixes four things together, and they have to agree:
 *   geometry  — where the cards live in space
 *   motion    — what your input does to them
 *   material  — what the card is made of
 *   page      — how an inner page is typeset once you're inside one
 *
 * Tools (/tools/*) are deliberately excluded from all of this: they are
 * working software with their own conventions, and dressing a form in ink
 * bleed or scanlines would cost usability for nothing.
 */
import navigation from '~/content/navigation.json'
import type { NavItem } from '~/types/nav'

export const LAB_ITEMS = navigation.home as NavItem[]

export interface LabConcept {
  n: string
  slug: string
  name: string
  /** The one-line thesis. */
  thesis: string
  geometry: string
  motion: string
  material: string
  page: string
}

export const LAB_CONCEPTS: LabConcept[] = [
  {
    n: '01',
    slug: 'signal',
    name: 'Signal',
    thesis: 'The work is a broadcast you have to tune into.',
    geometry: 'Cards wrap the inside of a drum that turns around you.',
    motion: 'Scrolling rotates the drum; a card only resolves as it reaches centre.',
    material: 'Holographic — scanlines, RGB split, tearing, flicker. Off-centre cards are literally static.',
    page: 'HUD: mono type, bracketed labels, corner ticks, cyan on near-black.'
  },
  {
    n: '02',
    slug: 'press',
    name: 'Press',
    thesis: 'The portfolio as a stack of freshly printed sheets.',
    geometry: 'Sheets stacked in depth on a press bed, the top one facing you.',
    motion: 'Flick up — the top sheet hinges over your head and the next is already printed.',
    material: 'True halftone screening. Black ink, bone paper, registration marks. No colour at all.',
    page: 'Broadsheet: condensed masthead, hairline rules, columns, folio numbers.'
  },
  {
    n: '03',
    slug: 'bleed',
    name: 'Bleed',
    thesis: 'Ink finding its way through wet paper.',
    geometry: 'A flat spiral lying on tilted paper — cards wind inward and sink.',
    motion: 'Press and hold: ink floods from your finger until the page gives way.',
    material: 'Ink blots with ragged, feathered, bleeding edges. Paper fibre underneath.',
    page: 'Ink on paper: deep indigo, generous margins, drop caps, bleeding rules.'
  },
  {
    n: '04',
    slug: 'fold',
    name: 'Fold',
    thesis: 'One surface, two sides, no seam.',
    geometry: 'A Möbius band — a half twist means the strip has only one side.',
    motion: 'Travel along the band and cards rotate through the twist, showing their printed backs.',
    material: 'Matte card stock with a crease highlight. Front is the work; back is the index.',
    page: 'Folded paper: diagonal creases, asymmetric columns, recto/verso pairing.'
  },
  {
    n: '05',
    slug: 'assembly',
    name: 'Assembly',
    thesis: 'The same four things, re-formed into whatever shape answers your question.',
    geometry: 'A formation that morphs: grid → ring → helix → column, wired by a live lattice.',
    motion: 'Scroll doesn’t move the cards past you — it rebuilds the shape they are standing in.',
    material: 'Technical: near-white stock, thin rules, coordinate labels, drafting lines.',
    page: 'Systematic: visible modular grid, annotated margins, everything on the same lattice.'
  }
]

// ── Real content, for the inner pages ────────────────────────────────────────
// Every word below already exists on the site (content/navigation.json and
// the About page's chapters). Nothing is invented.

export interface LabSection {
  id: string
  label: string
  eyebrow: string
  lead: string
  body: string
  rows: Array<[string, string]>
}

const CAREER =
  'I studied hotel management in Chennai, started on the hotel floor, moved into ' +
  'L&D at Club Mahindra, drew a comic about guest service that changed my mind ' +
  'about everything, ran certification programs at Courtyard by Marriott, got ' +
  'certified as an instructional designer, started building the tools I couldn’t ' +
  'find, shipped four of them, and now turn operational detail into e-learning ' +
  'for teams around the world at Concentrix.'

export const LAB_SECTIONS: Record<string, LabSection> = {
  'about': {
    id: 'about',
    label: 'About Me',
    eyebrow: 'Story',
    lead: 'I work with teams who need training people will actually finish — and I build the tools that make it, when the tools don’t already exist.',
    body: CAREER,
    rows: [
      ['Certified', 'Instructional Design Specialist'],
      ['Now', 'Concentrix — Training-as-a-Service'],
      ['Before', 'Courtyard by Marriott — L&D Specialist'],
      ['Before', 'Club Mahindra — L&D, The SEWA Chronicles'],
      ['Started', 'Hotel management, Chennai']
    ]
  },
  'instructional-design': {
    id: 'instructional-design',
    label: 'Instructional Design',
    eyebrow: 'Practice',
    lead: 'What gets designed when no one’s watching?',
    body: 'The craft behind training that lands: how operational detail becomes something a person can actually finish, remember, and use on shift the next morning.',
    rows: [
      ['Method', 'Operational detail → e-learning'],
      ['Scale', 'Teams around the world'],
      ['Tools', 'Storyline · Nuxt · Three.js']
    ]
  },
  'my-work': {
    id: 'my-work',
    label: 'My Work',
    eyebrow: 'Projects',
    lead: 'Proof it wasn’t all talk.',
    body: 'Case studies, a comic, and the projects behind them — the things that shipped and what they were actually for.',
    rows: [
      ['Comic · Club Mahindra', 'The SEWA Chronicles — true guest-service stories that teach hospitality values in panels, not policy documents.']
    ]
  },
  'tools': {
    id: 'tools',
    label: 'Web Apps',
    eyebrow: 'Free tools',
    lead: 'The toolkit that powers impactful learning.',
    body: 'Four tools built because they didn’t exist yet. These pages keep their own plain, utilitarian design — a form should never be an art direction.',
    rows: [
      ['EasyMCQ', 'Give a question and answer, and AI generates the wrong options.'],
      ['Cadence', 'Turn a list of topics into a ready-to-present monthly training calendar.'],
      ['Draftly', 'Turn messy drafts into polished, professional emails.'],
      ['StoryGen', 'Design storyboards on an infinite canvas: cards, flows, Word export.']
    ]
  }
}
