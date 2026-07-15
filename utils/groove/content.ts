export interface Objective { verb: string; text: string }

export const OBJECTIVES: Objective[] = [
  { verb: 'Place', text: 'a steady pulse and a backbeat on the step grid.' },
  { verb: 'Build', text: 'a full groove from kick, snare, and hats, and hear it play.' },
  { verb: 'Recreate', text: 'a target groove by matching where each hit lands.' }
]

export interface Question {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  because: string
}

export const ASSESSMENT: Question[] = [
  {
    id: 'downbeats',
    prompt: 'A bar here has 16 steps. The four steady beats you would tap your foot to fall on steps:',
    options: ['1, 2, 3, 4', '1, 5, 9, 13', '2, 4, 6, 8', 'Every step'],
    correctIndex: 1,
    because: 'The answer was 1, 5, 9, 13. Each beat is four sixteenth-steps wide, so the beats land every fourth step.'
  },
  {
    id: 'backbeat',
    prompt: 'The snare hit that makes people nod, the backbeat, usually lands on beats:',
    options: ['1 and 3', '2 and 4', 'Every beat', 'The offbeats'],
    correctIndex: 1,
    because: 'The answer was 2 and 4. The snare on the second and fourth beats is the backbeat.'
  },
  {
    id: 'four-floor',
    prompt: 'A groove is called four-on-the-floor when the kick plays on:',
    options: ['Only beat 1', 'Every beat', 'The offbeats only', 'Beats 2 and 4'],
    correctIndex: 1,
    because: 'The answer was every beat. A kick on all four beats is four-on-the-floor, the engine of house and disco.'
  },
  {
    id: 'placement',
    prompt: 'Using the same kick, snare, and hat sounds, what mainly turns a rock beat into a house or breakbeat groove?',
    options: [
      'Making the sounds louder',
      'Where the hits are placed in the bar',
      'Changing the pitch of the drums',
      'Adding more drum sounds'
    ],
    correctIndex: 1,
    because: 'The answer was placement. The same three sounds become different genres purely by where they sit in the bar.'
  },
  {
    id: 'hats',
    prompt: 'Filling the hat lane with hits on every step mostly adds a sense of:',
    options: ['Lower pitch', 'Drive and subdivision', 'Slower tempo', 'A different key'],
    correctIndex: 1,
    because: 'The answer was drive and subdivision. Busy hats fill the space between beats and push the groove forward.'
  }
]

export const PASS_MARK = 0.8

export function matchRemark(score: number): string {
  const pct = Math.round(score * 100)
  if (pct === 100) return 'A perfect copy. Every hit landed where the target had it.'
  if (pct >= 94) return 'Close enough to lock in. Your groove matched the target almost cell for cell.'
  if (pct >= 80) return 'Most of the groove was right. A few hits sat in the wrong place.'
  return 'The shape was different from the target. Re-listening beat by beat would close the gap.'
}
