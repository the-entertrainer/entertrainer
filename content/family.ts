/**
 * The Entertrainer family: the apps under Empower and the games under Engage.
 * Every member shares the sun mark (components/brand/Mark.vue), the shell
 * (components/brand/AppShell.vue) and the voice: short, plain, a bit playful.
 * The older tools and games still live at their URLs, unlisted.
 */
export interface FamilyMember {
  id: string
  name: string
  /** One line, what it does for you. */
  line: string
  /** Longer, for the hub row. */
  dek: string
  href: string
  kind: 'app' | 'game'
  /** Three-step "how it works". */
  steps: [string, string, string]
  /** Short status chip. */
  meta: string
}

export const APPS: FamilyMember[] = [
  {
    id: 'aim',
    name: 'Aim',
    line: 'Write a learning objective you can actually measure.',
    dek: 'Pick who, the verb, the condition and the bar. Aim checks the verb against Bloom’s levels and flags the fuzzy ones, like “understand”.',
    href: '/empower/aim',
    kind: 'app',
    steps: ['Say who it is for', 'Choose a verb you can see', 'Set the condition and the bar'],
    meta: 'Objectives · Free'
  },
  {
    id: 'plain',
    name: 'Plain',
    line: 'Paste an instruction. See where people will trip.',
    dek: 'Plain reads your text the way a tired new joiner would: long sentences, passive voice, jargon, steps hiding inside paragraphs. All in your browser.',
    href: '/empower/plain',
    kind: 'app',
    steps: ['Paste the text', 'Read the flags', 'Fix, and watch the score move'],
    meta: 'Clarity check · Free'
  },
  {
    id: 'cue',
    name: 'Cue',
    line: 'Plan a training session minute by minute.',
    dek: 'Set the length and the topic. Cue lays out Gagné’s nine events as a run of show you can stretch, trim, reorder and print.',
    href: '/empower/cue',
    kind: 'app',
    steps: ['Set topic and minutes', 'Stretch or trim each beat', 'Print the run of show'],
    meta: 'Session planner · Free'
  }
]

export const GAMES: FamilyMember[] = [
  {
    id: 'ladder',
    name: 'Ladder',
    line: 'Put each verb on the right rung of Bloom’s ladder.',
    dek: 'Verbs drop in one by one. Send each to remember, understand, apply, analyse, evaluate or create before the clock runs out.',
    href: '/engage/ladder',
    kind: 'game',
    steps: ['Read the verb', 'Tap its rung', 'Keep the streak alive'],
    meta: '60 seconds'
  },
  {
    id: 'pairs',
    name: 'Pairs',
    line: 'A memory game where the cards are ideas.',
    dek: 'Match each learning-science term to what it means. Every miss teaches you where a card sits. That is retrieval practice, wearing a game.',
    href: '/engage/pairs',
    kind: 'game',
    steps: ['Turn two cards', 'Match term to meaning', 'Clear the board in fewer moves'],
    meta: '12 cards'
  },
  {
    id: 'steps',
    name: 'Steps',
    line: 'Shuffled steps. Put them back in order.',
    dek: 'A procedure has been knocked over: making chai, a fire drill, ADDIE. Drag the steps back into place. Fewer checks, better score.',
    href: '/engage/steps',
    kind: 'game',
    steps: ['Pick a procedure', 'Drag steps into order', 'Check when you are sure'],
    meta: '5 puzzles'
  }
]

export const FAMILY = [...APPS, ...GAMES]
