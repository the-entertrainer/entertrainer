// ============================================================================
//  25-scene About narrative — copy is final, do not edit text.
//  Visual treatment (tone, accent, special) is authored here.
// ============================================================================

export type Tone = 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'deva' | 'sig'

export type SceneSpecial =
  | 'default'      // sequential beat reveals
  | 'scaleUp'      // 01 — text grows from almost-nothing
  | 'converge'     // 05 — floating words converge → L&D.
  | 'nodeGraph'    // 07 — canvas knowledge graph
  | 'glitch'       // 11 — glitch distortion → CLARITY
  | 'diagram'      // 12 — fake technical diagram SVG
  | 'cut'          // 15 — strikethrough + Matter.js fall
  | 'transform'    // 18, 23 — sentence pairs crossfade
  | 'montage'      // 20 — cycling GIF backgrounds
  | 'payoff'       // 22 — single massive reveal
  | 'photoReveal'  // 24 — portrait blur → sharp
  | 'cta'          // 25 — call to action

export interface Beat {
  text: string
  tone: Tone
  accent?: boolean
  strike?: boolean   // Scene 15: crossed-out before physics fall
  fx?: string        // kept for typography.ts compat (scatter handling)
}

export interface Scene {
  id: number
  label: string
  title: string
  align: 'left' | 'center'
  special: SceneSpecial
  beats: Beat[]
  hasGif: boolean
  montageSceneIds?: number[]   // Scene 20 only: which scenes' GIFs to cycle
}

export const SCENES: Scene[] = [
  // ── 01 — Opening hook ──────────────────────────────────────────────────────
  {
    id: 1,
    label: '01',
    title: 'Not supposed to end up here',
    align: 'center',
    special: 'scaleUp',
    hasGif: false,
    beats: [
      { text: "I wasn't supposed to end up here.", tone: 'xl' },
    ],
  },

  // ── 02 — Hotel management ──────────────────────────────────────────────────
  {
    id: 2,
    label: '02',
    title: 'Hotel management',
    align: 'left',
    special: 'default',
    hasGif: true,
    beats: [
      { text: 'I studied hotel management.', tone: 'lg' },
      { text: 'My first job?', tone: 'lg' },
      { text: 'HOUSEKEEPER.', tone: 'hero', accent: true },
    ],
  },

  // ── 03 — Towel monkey ──────────────────────────────────────────────────────
  {
    id: 3,
    label: '03',
    title: 'Towel monkey',
    align: 'left',
    special: 'default',
    hasGif: true,
    beats: [
      { text: 'Yes.', tone: 'xl' },
      { text: 'I know how to clean a hotel room.', tone: 'lg' },
      { text: 'And yes…', tone: 'md' },
      { text: 'I can make a towel monkey hanging by the shower.', tone: 'lg' },
    ],
  },

  // ── 04 — Fascinated by people ──────────────────────────────────────────────
  {
    id: 4,
    label: '04',
    title: 'Fascinated by people',
    align: 'left',
    special: 'default',
    hasGif: true,
    beats: [
      { text: "I wasn't fascinated by rooms.", tone: 'lg' },
      { text: 'I was fascinated by people.', tone: 'xl' },
      { text: 'Especially the human mind.', tone: 'lg', accent: true },
      { text: 'Why do some ideas stay forever…', tone: 'lg' },
      { text: '…while others disappear by lunch?', tone: 'lg' },
    ],
  },

  // ── 05 — L&D found me ──────────────────────────────────────────────────────
  {
    id: 5,
    label: '05',
    title: 'L&D found me',
    align: 'center',
    special: 'converge',
    hasGif: false,
    beats: [
      { text: "I didn't choose Learning & Development.", tone: 'lg' },
      { text: 'It found me.', tone: 'xl', accent: true },
    ],
  },

  // ── 06 — SEWA Chronicles ───────────────────────────────────────────────────
  {
    id: 6,
    label: '06',
    title: 'SEWA Chronicles',
    align: 'left',
    special: 'default',
    hasGif: true,
    beats: [
      { text: 'My first real exposure?', tone: 'md' },
      { text: 'SEWA Chronicles.', tone: 'hero', accent: true },
      { text: 'Turns out…', tone: 'md' },
      { text: 'I loved turning information into stories.', tone: 'xl' },
    ],
  },

  // ── 07 — Everything points back ────────────────────────────────────────────
  {
    id: 7,
    label: '07',
    title: 'Everything points back',
    align: 'center',
    special: 'nodeGraph',
    hasGif: true,
    beats: [
      { text: 'The deeper I looked…', tone: 'md' },
      { text: '…the more everything pointed back to the same place.', tone: 'lg' },
      { text: 'Different words.', tone: 'lg' },
      { text: 'Same fascination.', tone: 'xl', accent: true },
    ],
  },

  // ── 08 — Raising my hand ───────────────────────────────────────────────────
  {
    id: 8,
    label: '08',
    title: 'Raising my hand',
    align: 'left',
    special: 'default',
    hasGif: true,
    beats: [
      { text: 'I kept raising my hand.', tone: 'lg' },
      { text: 'Taking on bigger challenges.', tone: 'lg' },
      { text: 'More responsibility.', tone: 'md' },
      { text: 'More questions.', tone: 'md' },
    ],
  },

  // ── 09 — Marriott ──────────────────────────────────────────────────────────
  {
    id: 9,
    label: '09',
    title: 'Marriott International',
    align: 'left',
    special: 'default',
    hasGif: true,
    beats: [
      { text: 'That journey led me to Marriott International.', tone: 'xl', accent: true },
      { text: 'And to some incredibly brilliant minds.', tone: 'lg' },
      { text: 'The more I learned,', tone: 'md' },
      { text: 'the more I realised I was asking the same question from different angles.', tone: 'md' },
      { text: 'How do people understand?', tone: 'lg', accent: true },
      { text: 'How do they remember?', tone: 'lg' },
      { text: 'How do they change?', tone: 'lg' },
    ],
  },

  // ── 10 — Instructional Design ──────────────────────────────────────────────
  {
    id: 10,
    label: '10',
    title: 'Instructional Design',
    align: 'center',
    special: 'default',
    hasGif: false,
    beats: [
      { text: 'Instructional Design.', tone: 'hero', accent: true },
      { text: 'At first…', tone: 'md' },
      { text: 'I thought it was a subject.', tone: 'lg' },
      { text: 'I was wrong.', tone: 'xl' },
      { text: 'It was a discipline.', tone: 'xl', accent: true },
      { text: 'It gave a name to something I had already been chasing.', tone: 'md' },
    ],
  },

  // ── 11 — CLARITY (glitch) ──────────────────────────────────────────────────
  {
    id: 11,
    label: '11',
    title: 'Clarity',
    align: 'center',
    special: 'glitch',
    hasGif: false,
    beats: [
      { text: 'CLARITY.', tone: 'hero', accent: true },
    ],
  },

  // ── 12 — Technical diagram ─────────────────────────────────────────────────
  {
    id: 12,
    label: '12',
    title: 'Technical diagram',
    align: 'left',
    special: 'diagram',
    hasGif: false,
    beats: [
      { text: 'Imagine someone hands you a technical diagram.', tone: 'lg' },
      { text: 'A complicated one.', tone: 'md' },
      { text: 'The kind that makes people stare at it for a few minutes before pretending they understand it.', tone: 'sm' },
      { text: 'Now imagine your client expects a new employee to grasp it on Day One.', tone: 'lg' },
      { text: 'What would you do?', tone: 'xl', accent: true },
    ],
  },

  // ── 13 — That's the work ───────────────────────────────────────────────────
  {
    id: 13,
    label: '13',
    title: "That's the work",
    align: 'left',
    special: 'default',
    hasGif: false,
    beats: [
      { text: "That's the work.", tone: 'xl', accent: true },
      { text: 'Break it down.', tone: 'lg' },
      { text: 'Find the patterns.', tone: 'lg' },
      { text: 'Separate it into meaningful chunks.', tone: 'md' },
      { text: 'Build the story.', tone: 'lg' },
      { text: 'Make it memorable.', tone: 'xl' },
    ],
  },

  // ── 14 — Movie director ────────────────────────────────────────────────────
  {
    id: 14,
    label: '14',
    title: 'Movie director',
    align: 'center',
    special: 'default',
    hasGif: true,
    beats: [
      { text: 'More movie director than trainer.', tone: 'xl', accent: true },
      { text: 'Except…', tone: 'md' },
      { text: 'The audience is the brain.', tone: 'hero' },
    ],
  },

  // ── 15 — We cut ────────────────────────────────────────────────────────────
  {
    id: 15,
    label: '15',
    title: 'We cut',
    align: 'center',
    special: 'cut',
    hasGif: false,
    beats: [
      { text: 'We cut.', tone: 'xl', strike: true },
      { text: 'We simplify.', tone: 'xl', strike: true },
      { text: 'We rearrange.', tone: 'xl', strike: true },
      { text: "We remove what doesn't matter.", tone: 'lg', strike: true },
      { text: 'Sometimes we even censor a few things.', tone: 'md', strike: true },
      { text: "Not because they aren't important.", tone: 'md' },
      { text: "Because they're not important yet.", tone: 'lg', accent: true },
    ],
  },

  // ── 16 — We keep ───────────────────────────────────────────────────────────
  {
    id: 16,
    label: '16',
    title: 'We keep',
    align: 'center',
    special: 'default',
    hasGif: false,
    beats: [
      { text: "We keep what helps people understand.", tone: 'lg', accent: true },
      { text: "We keep what helps people remember.", tone: 'lg', accent: true },
      { text: "We keep what helps people learn.", tone: 'xl', accent: true },
    ],
  },

  // ── 17 — Asatoma ───────────────────────────────────────────────────────────
  {
    id: 17,
    label: '17',
    title: 'Asatoma sadgamaya',
    align: 'center',
    special: 'default',
    hasGif: false,
    beats: [
      { text: 'असतो मा सद्गमय', tone: 'deva', accent: true },
      { text: 'From the unreal…', tone: 'lg' },
      { text: '…to the real.', tone: 'lg', accent: true },
    ],
  },

  // ── 18 — Same journey ──────────────────────────────────────────────────────
  {
    id: 18,
    label: '18',
    title: 'Learning is the same journey',
    align: 'left',
    special: 'transform',
    hasGif: false,
    beats: [
      { text: 'Learning is the same journey.', tone: 'lg' },
      { text: 'We move from assumptions…', tone: 'lg' },
      { text: '…to understanding.', tone: 'xl', accent: true },
      { text: 'From confusion…', tone: 'lg' },
      { text: '…to clarity.', tone: 'xl', accent: true },
      { text: 'From noise…', tone: 'lg' },
      { text: '…to meaning.', tone: 'xl', accent: true },
    ],
  },

  // ── 19 — Every meaningful experience ───────────────────────────────────────
  {
    id: 19,
    label: '19',
    title: 'Every meaningful experience',
    align: 'center',
    special: 'default',
    hasGif: false,
    beats: [
      { text: 'And every meaningful learning experience', tone: 'lg' },
      { text: 'is an attempt to make that journey', tone: 'lg' },
      { text: 'a little easier.', tone: 'xl', accent: true },
    ],
  },

  // ── 20 — Memory montage ────────────────────────────────────────────────────
  {
    id: 20,
    label: '20',
    title: 'Memory montage',
    align: 'left',
    special: 'montage',
    hasGif: true,
    montageSceneIds: [2, 3, 6, 7, 14],
    beats: [
      { text: "I've had good days.", tone: 'lg' },
      { text: 'Bad days.', tone: 'lg' },
      { text: 'Mediocre days.', tone: 'md' },
      { text: 'But every day brought a new challenge.', tone: 'lg' },
      { text: 'A new puzzle.', tone: 'lg' },
      { text: 'A new story waiting to be told.', tone: 'xl', accent: true },
    ],
  },

  // ── 21 — Setup for transformation ──────────────────────────────────────────
  {
    id: 21,
    label: '21',
    title: 'After all these years',
    align: 'center',
    special: 'default',
    hasGif: false,
    beats: [
      { text: 'And after all these years,', tone: 'md' },
      { text: 'I still believe the most powerful transformation', tone: 'lg' },
      { text: "isn't in a hotel room.", tone: 'xl' },
      { text: "isn't in a classroom.", tone: 'xl' },
    ],
  },

  // ── 22 — Payoff ────────────────────────────────────────────────────────────
  {
    id: 22,
    label: '22',
    title: 'The moment',
    align: 'center',
    special: 'payoff',
    hasGif: false,
    beats: [
      { text: "It's in the moment", tone: 'xl' },
      { text: 'someone finally understands.', tone: 'hero', accent: true },
    ],
  },

  // ── 23 — Transformations ───────────────────────────────────────────────────
  {
    id: 23,
    label: '23',
    title: 'Transformations',
    align: 'center',
    special: 'transform',
    hasGif: false,
    beats: [
      { text: 'The moment a complicated idea', tone: 'lg' },
      { text: 'becomes simple.', tone: 'xl', accent: true },
      { text: 'The moment information', tone: 'lg' },
      { text: 'becomes meaning.', tone: 'xl', accent: true },
      { text: 'The moment learning', tone: 'lg' },
      { text: 'becomes change.', tone: 'xl', accent: true },
    ],
  },

  // ── 24 — Photo reveal ──────────────────────────────────────────────────────
  {
    id: 24,
    label: '24',
    title: 'I design for that moment',
    align: 'center',
    special: 'photoReveal',
    hasGif: false,
    beats: [
      { text: "I design for that moment.", tone: 'hero' },
      { text: '— Naveen Jose', tone: 'sig', accent: true },
    ],
  },

  // ── 25 — CTA ───────────────────────────────────────────────────────────────
  {
    id: 25,
    label: '25',
    title: 'Instructional Design',
    align: 'center',
    special: 'cta',
    hasGif: false,
    beats: [
      { text: 'Instructional Design →', tone: 'xl' },
    ],
  },
]

// Supplementary data for special scenes
export const CONVERGE_WORDS = ['TRAINING', 'LEARNING', 'PEOPLE', 'STORIES', 'DESIGN', 'PSYCHOLOGY']

export const GRAPH_NODES: Array<{ label: string; x: number; y: number }> = [
  { label: 'Psychology',   x: 0.50, y: 0.25 },
  { label: 'Memory',       x: 0.25, y: 0.40 },
  { label: 'Attention',    x: 0.72, y: 0.38 },
  { label: 'Motivation',   x: 0.20, y: 0.62 },
  { label: 'Storytelling', x: 0.55, y: 0.58 },
  { label: 'Design',       x: 0.80, y: 0.60 },
  { label: 'Learning',     x: 0.42, y: 0.74 },
  { label: 'People',       x: 0.65, y: 0.78 },
]

export const GRAPH_EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4],
  [1, 6], [2, 5], [3, 6], [4, 7],
  [4, 5], [5, 6], [5, 7], [6, 7],
]

export const GLITCH_WORDS = ['NOISE', 'PROCESS', 'SYSTEM', 'WORKFLOW', 'FRAMEWORK', 'PROCEDURE', 'INFORMATION']

export const CTA = {
  text: 'Instructional Design →',
  to: '/instructional-design',
}
