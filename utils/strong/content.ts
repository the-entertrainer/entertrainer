export interface Objective { verb: string; text: string }

export const OBJECTIVES: Objective[] = [
  { verb: 'Read', text: 'a password as bits of entropy, and explain where that number comes from.' },
  { verb: 'Show', text: 'why length beats added symbols, using the search-space math.' },
  { verb: 'Judge', text: 'crack time against the attacker, and why a guessable password is weak whatever it looks like.' }
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
    id: 'entropy',
    prompt: 'A password\'s entropy, measured in bits, is:',
    options: [
      'The number of characters it contains',
      'The base-2 logarithm of how many passwords are possible',
      'How many symbols and capitals it uses',
      'The time in seconds it takes to type'
    ],
    correctIndex: 1,
    because: 'Entropy is log2 of the search space. Each extra bit doubles the number of passwords an attacker must try.'
  },
  {
    id: 'length',
    prompt: 'Which is harder to brute-force: eight characters using all four character types, or sixteen characters of only lowercase letters?',
    options: [
      'The eight-character one, because it has symbols and capitals',
      'The sixteen lowercase one, because length is an exponent',
      'They are identical',
      'Neither can be brute-forced'
    ],
    correctIndex: 1,
    because: 'Eight all-types is about 52 bits; sixteen lowercase is about 75. Length multiplies the search space, so it wins by a wide margin.'
  },
  {
    id: 'attacker',
    prompt: 'The same password shows "centuries" against one attacker and "instantly" against another. What changed?',
    options: [
      'The password got weaker over time',
      'How fast the attacker can guess, set by the hash and any rate limits',
      'The number of characters in the password',
      'The password\'s entropy in bits'
    ],
    correctIndex: 1,
    because: 'Crack time is search space divided by guess rate. A slow salted hash allows thousands of guesses per second; a leaked fast hash allows billions.'
  },
  {
    id: 'dictionary',
    prompt: 'Why is "P@ssw0rd" weak despite mixing capitals, a symbol, and a digit?',
    options: [
      'It is too short to matter',
      'It is a dictionary word with substitutions that crackers apply automatically',
      'Symbols make passwords weaker',
      'It has too many character types'
    ],
    correctIndex: 1,
    because: 'Crackers run wordlists with leetspeak and trailing-digit rules first. The naive character-mix math overstates its real strength.'
  },
  {
    id: 'passphrase',
    prompt: 'Six words chosen at random from a word list can be easy to remember and very hard to crack because:',
    options: [
      'The words are rare and unusual',
      'The strength comes from the huge number of possible word combinations',
      'Words are longer than symbols',
      'A cracker cannot guess real words'
    ],
    correctIndex: 1,
    because: 'Each random word adds about log2(list size) bits. Six words reach strong entropy while staying a memorable phrase. Crackers know the words; they cannot cheaply try every combination of them.'
  }
]

export const PASS_MARK = 0.8

// The lab's practice target: reach this in EFFECTIVE bits, not naive bits.
export const TARGET_BITS = 60

export function strengthRemark(bits: number): string {
  if (bits >= 80) return 'Very strong. Even a GPU on a leaked fast hash would run out of time long before it found this.'
  if (bits >= 60) return 'Strong. This holds up against offline cracking on all but the most extreme setups.'
  if (bits >= 40) return 'Fair. Fine against online guessing, but a leaked fast hash could still fall to it.'
  if (bits >= 28) return 'Weak. A determined attacker with a leaked hash cracks this without much effort.'
  return 'Very weak. This falls in seconds. Add length, or use a random passphrase.'
}
