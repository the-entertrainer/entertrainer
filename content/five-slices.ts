/**
 * 5 Slices — short vertical stories.
 * Copy lives here, not in the overlay template.
 *
 * Story `your-mouth-can-be-sure-for-reasons-your-eyes-never-had` is five frames
 * drawn only from the Elevate essay of that slug
 * ("How many of you is inside you?", published 2026-09-22).
 * No numbers or studies were added that the essay does not already state.
 */

export interface SliceFrame {
  kicker: string
  headline: string
  dek?: string
  body?: string
  labels?: string[]
  badge?: string
  foot?: string
  close?: string
  /** Illustration id. Drawn in FiveSlicesArt. No text in the SVG. */
  art: string
}

export interface SliceStory {
  id: string
  title: string
  /** ISO date, YYYY-MM-DD. Newest opens first. */
  date: string
  frames: SliceFrame[]
}

export const SLICE_STORIES: SliceStory[] = [
  {
    id: 'hologram',
    title: 'Are we living in a hologram?',
    date: '2026-10-04',
    frames: [
      {
        kicker: '5-SLICES • 01',
        headline: 'ARE WE LIVING IN A HOLOGRAM?',
        dek: '5 slices on the holographic principle',
        art: 'shell'
      },
      {
        kicker: '5-SLICES • 02',
        headline: 'BLACK HOLES HINT AT SOMETHING WEIRD',
        body: 'A black hole’s information capacity appears to scale with its surface area, not its volume. That surprising clue inspired the holographic principle.',
        labels: ['FILLED VOLUME', 'OUTER SURFACE', 'SURFACE AREA > VOLUME?'],
        foot: 'SWIPE UP TO CONTINUE',
        art: 'surface'
      },
      {
        kicker: '5-SLICES • 03',
        headline: 'THE EDGE COULD ENCODE THE INSIDE',
        body: 'The holographic principle suggests that all the information in a region of space might be describable by data on its boundary, like a cosmic recipe written on the edge.',
        labels: ['boundary data', 'interior world'],
        art: 'boundary'
      },
      {
        kicker: '5-SLICES • 04',
        headline: 'NOT A COSMIC MOVIE SCREEN',
        body: 'Holographic does not mean fake, flat, or projected into ordinary space. It means two mathematical descriptions may encode the same physics.',
        badge: 'different description × less real',
        foot: 'SWIPE UP TO CONTINUE',
        art: 'not-screen'
      },
      {
        kicker: '5-SLICES • 05',
        headline: 'WHY PHYSICISTS CARE',
        labels: ['QUANTUM MECHANICS', 'GRAVITY'],
        body: 'The idea may connect quantum mechanics with gravity. A famous example, called holographic duality, lets physicists study one difficult theory through another that is easier to calculate.',
        badge: 'powerful idea, not a confirmed description of our universe',
        foot: 'SWIPE UP TO EXPLORE',
        art: 'duality'
      },
      {
        kicker: '5-SLICES • 06',
        headline: 'SO... ARE WE HOLOGRAPHIC?',
        dek: 'Maybe, but we don’t know yet.',
        labels: ['UNKNOWN—FOR NOW', 'EVIDENCE', 'OPEN QUESTION'],
        body: 'The holographic principle is a powerful theoretical idea, not proof that our universe is a hologram. The mystery is still open, and that is what makes it fascinating.',
        close: 'Keep asking bigger questions.',
        art: 'open-sky'
      }
    ]
  },
  {
    id: 'your-mouth-can-be-sure-for-reasons-your-eyes-never-had',
    title: 'How many of you is inside you?',
    date: '2026-09-22',
    frames: [
      {
        kicker: '5-SLICES • 01',
        headline: 'HOW MANY OF YOU IS INSIDE YOU?',
        dek: '5 slices on a mouth that can feel sure',
        art: 'split-head'
      },
      {
        kicker: '5-SLICES • 02',
        headline: 'THE HANDS PICKED BOTH',
        body: 'They flashed a chicken claw to one half of a split brain and a snow scene to the other. The hands picked both. Speech invented a chicken shed for the shovel — and felt sure.',
        labels: ['CHICKEN CLAW', 'SNOW SCENE', 'CHICKEN SHED?'],
        foot: 'SWIPE UP TO CONTINUE',
        art: 'claw-shovel'
      },
      {
        kicker: '5-SLICES • 03',
        headline: 'NOT TWO PEOPLE ARGUING',
        body: 'Nobody removed half a brain. The cut was the corpus callosum, the fibre bridge between the halves, so a seizure would have a harder time crossing. Everyday chat could still look normal. The odd results showed up when the lab sent a fact to only one side.',
        labels: ['one bridge', 'one-sided flash'],
        badge: 'not a personality poster',
        art: 'cut-bridge'
      },
      {
        kicker: '5-SLICES • 04',
        headline: 'SPEECH SAYS NOTHING. THE HAND MOVES.',
        body: 'Flash a picture where only one half receives it. Speech can often name what the speaking half got, and say nothing about the other — while the left hand still picks the match. Asked why, speech builds a reason after the hands have already moved.',
        labels: ['ACTION FIRST', 'STORY AFTER'],
        foot: 'SWIPE UP TO CONTINUE',
        art: 'hand-mouth'
      },
      {
        kicker: '5-SLICES • 05',
        headline: 'SO... HOW MANY OF YOU?',
        dek: 'The lab trick is real. The count is not settled.',
        labels: ['ONE AGENT?', 'SPLIT PERCEPTION', 'OPEN QUESTION'],
        body: 'Later work argued for one conscious agent with split perception, not Hollywood dual persons. A review said we still lack enough evidence to settle the first-person question. Feeling sure is not a perfect meter of what caused the answer.',
        close: 'Sit with the shovel. The shed was invented later.',
        art: 'unsettled'
      }
    ]
  }
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Newest first. Date-only ISO strings sort lexicographically. */
export function slicesNewestFirst(stories: SliceStory[] = SLICE_STORIES): SliceStory[] {
  return [...stories].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

export function formatSliceDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  const m = Number(month)
  const d = Number(day)
  if (!year || !m || !d) return iso
  return `${d} ${MONTHS[m - 1]} ${year}`
}
