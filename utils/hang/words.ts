// Curated word bank with ready clues, for the "surprise me" option and for solo
// play. The Executioner can always type a custom word + clues instead.

export interface WordCard { word: string; clues: [string, string, string] }

export const WORD_BANK: WordCard[] = [
  { word: 'GALLOWS', clues: ['Where this whole thing takes place', 'Wooden, tall, and not built for comfort', 'Rhymes with a bird that follows'] },
  { word: 'PENDULUM', clues: ['It swings, and so might you', 'Keeps time in an old clock', 'Physics loves this word'] },
  { word: 'ROPE', clues: ['The hero of this little drama', 'Made of twisted fibres', 'You skip with it, or worse'] },
  { word: 'GRAVITY', clues: ['The thing that never lets go', 'An apple taught a man about it', 'Currently working against you'] },
  { word: 'TRAPDOOR', clues: ['The floor that betrays you', 'A sudden way down', 'Two words squashed into one'] },
  { word: 'MIDNIGHT', clues: ['A dramatic hour for a deed', 'When one day hands over to the next', 'Cinderella fears it'] },
  { word: 'RIDDLE', clues: ['A puzzle wrapped in words', 'A sphinx asks them', 'You are inside one now'] },
  { word: 'SILHOUETTE', clues: ['A shape with no detail, only edge', 'What you become against the fog', 'A French word for a dark outline'] },
  { word: 'GUILLOTINE', clues: ['A rival to the rope, but tidier', 'A revolutionary invention', 'Ends with a clean drop too'] },
  { word: 'SUSPENSE', clues: ['The feeling right before the drop', 'Thrillers run on it', 'Hangs in the air'] },
  { word: 'KNOT', clues: ['Tie one and you are committed', 'A sailor knows thirteen of them', 'Not, but with a K'] },
  { word: 'VERDICT', clues: ['The word that decides your fate', 'A jury returns it', 'Guilty or not'] },
  { word: 'WHISKERS', clues: ['A cat has them, and so might a villain', 'Fine hairs near the mouth', 'Close shave removes them'] },
  { word: 'LANTERN', clues: ['A small light in a dark scene', 'Carried on a pole at night', 'A pumpkin becomes one in October'] },
  { word: 'CROWBAR', clues: ['A tool for prying things open', 'Bent iron, very persuasive', 'A bird plus a place to drink'] },
  { word: 'MARIONETTE', clues: ['A puppet on strings', 'Dances when you pull', 'Also dangles, come to think of it'] },
  { word: 'ECLIPSE', clues: ['When one thing hides another', 'The sun goes briefly dark', 'A dramatic sky event'] },
  { word: 'PARADOX', clues: ['A statement at war with itself', 'This sentence is false', 'Logic ties itself in a knot'] },
  { word: 'THRESHOLD', clues: ['The line you step over', 'A doorway has one', 'The point where things tip'] },
  { word: 'MURMUR', clues: ['A very quiet sound', 'A heart can have one', 'The crowd does it before the verdict'] },
  { word: 'CIPHER', clues: ['A secret code', 'Spies love it', 'A zero, in older English'] },
  { word: 'DRIZZLE', clues: ['Light, moody rain', 'Perfect weather for this scene', 'Less than a downpour'] },
  { word: 'FULCRUM', clues: ['The pivot of a lever', 'Balance depends on it', 'Where a seesaw turns'] },
  { word: 'OMINOUS', clues: ['A word that means bad is coming', 'Dark clouds are this', 'Sets the mood here perfectly'] }
]

export function randomCard(): WordCard {
  return WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]
}
