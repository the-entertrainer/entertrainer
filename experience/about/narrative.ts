// ============================================================================
//  FIELD NOTES ON LEARNING — locked narrative
//
//  The TEXT in this file is final and must not be edited, reworded, shortened,
//  or expanded. Only the *treatment* metadata (size, accent, fx, gif keywords,
//  alignment) is authored here — that is visual direction, which is open.
//
//  Each quoted line in the brief is one `beat`. The brief's "Pause." markers are
//  the gaps between beats and are expressed through scroll pacing, never text.
// ============================================================================

export type BeatTone =
  | 'sm'      // quiet aside
  | 'md'      // body
  | 'lg'      // statement
  | 'xl'      // bold declaration
  | 'hero'    // single monumental word
  | 'deva'    // devanagari
  | 'sig'     // signature line

export type BeatFx =
  | 'none'
  | 'scatter'   // letters break apart and drift off (impermanence)
  | 'strike'    // rough-notation strike-through then removed
  | 'keep'      // the survivor — settles + underlined
  | 'pairFrom'  // antithesis: the "unreal" side, fades back
  | 'pairTo'    // antithesis: the "real" side, resolves in Pi Blue

export interface Beat {
  text: string
  tone?: BeatTone
  accent?: boolean   // render in Pi Blue
  fx?: BeatFx
}

export type SceneSpecial =
  | 'none'
  | 'reveal'      // generic cinematic beat reveal (default)
  | 'converge'    // scene 04 — everything points back to one place
  | 'cut'         // scene 08 — Matter.js editing / removal
  | 'antithesis'  // scene 09 — from X to Y pairs
  | 'signature'   // scene 10 — thesis + CTA

export interface SceneGif {
  keywords: string[]
  // 0..1 viewport-relative anchor for the thought cluster
  anchor: { x: number; y: number }
  density: number   // how many gifs to pull
  scale?: number
}

export interface Scene {
  id: number
  label: string         // eyebrow, e.g. "01"
  title: string         // short scene name (screen-reader / nav only)
  align: 'left' | 'center'
  beats: Beat[]
  special: SceneSpecial
  gif?: SceneGif
}

export const SCENES: Scene[] = [
  // ── 01 ────────────────────────────────────────────────────────────────────
  {
    id: 1,
    label: '01',
    title: 'Not supposed to be here',
    align: 'left',
    special: 'reveal',
    gif: { keywords: ['towel animal', 'towel monkey', 'hotel housekeeping'], anchor: { x: 0.74, y: 0.32 }, density: 3, scale: 1.1 },
    beats: [
      { text: 'I wasn’t supposed to end up here.', tone: 'xl' },
      { text: 'I studied hotel management.', tone: 'lg' },
      { text: 'My first job?', tone: 'lg' },
      { text: 'HOUSEKEEPER.', tone: 'hero', accent: true },
      { text: 'Yes.', tone: 'lg' },
      { text: 'I know how to clean a hotel room.', tone: 'md' },
      { text: 'And yes…', tone: 'md' },
      { text: 'I can make a towel monkey hanging by the shower.', tone: 'lg' },
    ],
  },

  // ── 02 ────────────────────────────────────────────────────────────────────
  {
    id: 2,
    label: '02',
    title: 'Fascinated by people',
    align: 'left',
    special: 'reveal',
    gif: { keywords: ['curious mind', 'thinking brain', 'human psychology'], anchor: { x: 0.72, y: 0.6 }, density: 2 },
    beats: [
      { text: 'I wasn’t fascinated by rooms.', tone: 'lg' },
      { text: 'I was fascinated by people.', tone: 'xl' },
      { text: 'Especially the human mind.', tone: 'lg', accent: true },
      { text: 'Why do some ideas stay forever…', tone: 'lg', fx: 'keep' },
      { text: '…while others disappear by lunch?', tone: 'lg', fx: 'scatter' },
    ],
  },

  // ── 03 ────────────────────────────────────────────────────────────────────
  {
    id: 3,
    label: '03',
    title: 'L&D found me',
    align: 'left',
    special: 'reveal',
    gif: { keywords: ['comic book', 'storytelling', 'illustration'], anchor: { x: 0.75, y: 0.35 }, density: 3 },
    beats: [
      { text: 'I didn’t choose Learning & Development.', tone: 'lg' },
      { text: 'It found me.', tone: 'xl' },
      { text: 'My first real exposure?', tone: 'md' },
      { text: 'SEWA Chronicles.', tone: 'hero', accent: true, fx: 'keep' },
      { text: 'Turns out…', tone: 'md' },
      { text: 'I loved turning information into stories.', tone: 'lg' },
    ],
  },

  // ── 04 ────────────────────────────────────────────────────────────────────
  {
    id: 4,
    label: '04',
    title: 'Everything points back',
    align: 'center',
    special: 'converge',
    beats: [
      { text: 'The deeper I looked…', tone: 'lg' },
      { text: '…the more everything pointed back to the same place.', tone: 'lg' },
      { text: 'The human mind.', tone: 'hero', accent: true },
    ],
  },

  // ── 05 ────────────────────────────────────────────────────────────────────
  {
    id: 5,
    label: '05',
    title: 'Raising my hand',
    align: 'left',
    special: 'reveal',
    gif: { keywords: ['brilliant idea', 'teamwork', 'lightbulb moment'], anchor: { x: 0.74, y: 0.5 }, density: 2 },
    beats: [
      { text: 'I kept raising my hand.', tone: 'lg' },
      { text: 'Taking on bigger challenges.', tone: 'lg' },
      { text: 'More responsibility.', tone: 'lg' },
      { text: 'More questions.', tone: 'lg' },
      { text: 'That journey led me to Marriott International.', tone: 'xl', accent: true },
      { text: 'And to some incredibly brilliant minds.', tone: 'lg' },
    ],
  },

  // ── 06 ────────────────────────────────────────────────────────────────────
  {
    id: 6,
    label: '06',
    title: 'Clarity',
    align: 'left',
    special: 'reveal',
    gif: { keywords: ['organized', 'clean design', 'aha moment'], anchor: { x: 0.76, y: 0.28 }, density: 2 },
    beats: [
      { text: 'Instructional Design.', tone: 'xl' },
      { text: 'At first…', tone: 'md' },
      { text: 'I thought it was a subject.', tone: 'lg' },
      { text: 'I was wrong.', tone: 'lg' },
      { text: 'It was a discipline.', tone: 'lg' },
      { text: 'It gave a name to something I had already been chasing.', tone: 'md' },
      { text: 'CLARITY.', tone: 'hero', accent: true },
      { text: 'Turning noisy information…', tone: 'lg', fx: 'scatter' },
      { text: '…into clean, useful brain food.', tone: 'lg', fx: 'keep' },
    ],
  },

  // ── 07 ────────────────────────────────────────────────────────────────────
  {
    id: 7,
    label: '07',
    title: 'The work',
    align: 'left',
    special: 'reveal',
    gif: { keywords: ['movie director', 'clapperboard', 'film editing'], anchor: { x: 0.73, y: 0.62 }, density: 3 },
    beats: [
      { text: 'Imagine someone hands you this.', tone: 'lg' },
      { text: 'And expects a new employee to understand it on Day One.', tone: 'md' },
      { text: 'What would you do?', tone: 'lg' },
      { text: 'That’s the work.', tone: 'xl', accent: true },
      { text: 'Break it down.', tone: 'lg' },
      { text: 'Find the patterns.', tone: 'lg' },
      { text: 'Build the story.', tone: 'lg' },
      { text: 'Make it memorable.', tone: 'lg' },
      { text: 'More movie director than trainer.', tone: 'xl' },
      { text: 'Except.', tone: 'md' },
      { text: 'The audience is the brain.', tone: 'xl', accent: true },
    ],
  },

  // ── 08 ────────────────────────────────────────────────────────────────────
  {
    id: 8,
    label: '08',
    title: 'We cut',
    align: 'center',
    special: 'cut',
    beats: [
      { text: 'We cut.', tone: 'xl', fx: 'strike' },
      { text: 'We simplify.', tone: 'xl', fx: 'strike' },
      { text: 'We rearrange.', tone: 'xl', fx: 'strike' },
      { text: 'We remove what doesn’t matter.', tone: 'xl', fx: 'strike' },
      { text: 'We keep what helps people understand.', tone: 'xl', accent: true, fx: 'keep' },
    ],
  },

  // ── 09 ────────────────────────────────────────────────────────────────────
  {
    id: 9,
    label: '09',
    title: 'Asatoma sadgamaya',
    align: 'center',
    special: 'antithesis',
    beats: [
      { text: 'असतो मा सद्गमय', tone: 'deva', accent: true },
      { text: 'From the unreal…', tone: 'lg', fx: 'pairFrom' },
      { text: '…to the real.', tone: 'lg', fx: 'pairTo' },
      { text: 'Learning is the same journey.', tone: 'md' },
      { text: 'We move from assumptions…', tone: 'lg', fx: 'pairFrom' },
      { text: '…to understanding.', tone: 'lg', fx: 'pairTo' },
      { text: 'From confusion…', tone: 'lg', fx: 'pairFrom' },
      { text: '…to clarity.', tone: 'lg', fx: 'pairTo' },
      { text: 'From noise…', tone: 'lg', fx: 'pairFrom' },
      { text: '…to meaning.', tone: 'lg', fx: 'pairTo' },
    ],
  },

  // ── 10 ────────────────────────────────────────────────────────────────────
  {
    id: 10,
    label: '10',
    title: 'The moment',
    align: 'center',
    special: 'signature',
    beats: [
      { text: 'I still believe the most powerful transformation', tone: 'lg' },
      { text: 'isn’t in a hotel room.', tone: 'lg' },
      { text: 'isn’t in a classroom.', tone: 'lg' },
      { text: 'It’s in the moment someone finally understands.', tone: 'xl', accent: true },
      { text: 'I design for that moment.', tone: 'xl' },
      { text: '— Naveen Jose', tone: 'sig' },
    ],
  },
]

// CTA — wording locked. Continues the story into the Instructional Design page.
export const CTA = {
  text: 'Instructional Design →',
  to: '/instructional-design',
}
