/**
 * Home knowledge lines — authentic English quotes on knowledge / wisdom / learning / truth.
 * Mix of traditions. Attributions are authentic; do not invent paraphrases or sources.
 */

export type KnowledgeQuote = {
  text: string
  attribution: string
}

export const KNOWLEDGE_QUOTES: readonly KnowledgeQuote[] = [
  { text: 'Truth alone triumphs.', attribution: 'Mundaka Upanishad' },
  { text: 'Lead me from darkness to light.', attribution: 'Bṛhadāraṇyaka Upanishad' },
  { text: 'Lead me from the unreal to the real.', attribution: 'Bṛhadāraṇyaka Upanishad' },
  { text: 'There is nothing in this world so purifying as knowledge.', attribution: 'Bhagavad Gita 4.38' },
  { text: 'The faithful one who is devoted and has mastered the senses gains knowledge.', attribution: 'Bhagavad Gita 4.39' },
  { text: 'Knowledge gives humility.', attribution: 'Hitopadeśa' },
  { text: 'Wisdom is the principal thing; therefore get wisdom.', attribution: 'Proverbs 4:7' },
  { text: 'The heart of the prudent getteth knowledge.', attribution: 'Proverbs 18:15' },
  { text: 'You will know the truth, and the truth will make you free.', attribution: 'John 8:32' },
  {
    text: 'When you know a thing, to hold that you know it; and when you do not know a thing, to allow that you do not know it—this is knowledge.',
    attribution: 'Confucius, Analects'
  },
  {
    text: 'Learning without thought is labor lost; thought without learning is perilous.',
    attribution: 'Confucius, Analects'
  },
  { text: 'The unexamined life is not worth living.', attribution: 'Plato, Apology' },
  {
    text: 'Knowledge which is acquired under compulsion obtains no hold on the mind.',
    attribution: 'Plato, Republic'
  },
  { text: 'All men by nature desire to know.', attribution: 'Aristotle, Metaphysics' },
  {
    text: 'A fool who knows his foolishness is wise at least to that extent.',
    attribution: 'Dhammapada'
  },
  {
    text: 'Hatred is never appeased by hatred in this world. By non-hatred alone is hatred appeased. This is an eternal law.',
    attribution: 'Dhammapada'
  },
  { text: 'To know that you do not know is best.', attribution: 'Tao Te Ching' },
  { text: 'Who is wise? One who learns from every person.', attribution: 'Pirkei Avot' },
  {
    text: 'The shy person cannot learn, and the impatient person cannot teach.',
    attribution: 'Pirkei Avot'
  },
  { text: 'Read in the name of your Lord who created.', attribution: 'Qur\'an 96:1' },
  { text: 'Knowledge itself is power.', attribution: 'Francis Bacon' },
  {
    text: 'If I have seen further it is by standing on the shoulders of Giants.',
    attribution: 'Isaac Newton'
  },
  {
    text: 'Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.',
    attribution: 'Albert Einstein'
  },
  {
    text: 'Somewhere, something incredible is waiting to be known.',
    attribution: 'Carl Sagan'
  },
  {
    text: 'The wound is the place where the Light enters you.',
    attribution: 'Rūmī'
  },
  {
    text: 'Ignorance is the curse of God; knowledge is the wing wherewith we fly to heaven.',
    attribution: 'Shakespeare, Henry VI Part 2'
  },
  {
    text: 'It is in your power to withdraw into yourself whenever you choose.',
    attribution: 'Marcus Aurelius, Meditations'
  },
  { text: 'Much learning does not teach understanding.', attribution: 'Heraclitus' },
  {
    text: 'Arise, awake, and learn by approaching the wise.',
    attribution: 'Kaṭha Upanishad'
  },
  {
    text: 'Wisdom is a defence, and money is a defence: but the excellency of knowledge is, that wisdom giveth life to them that have it.',
    attribution: 'Ecclesiastes 7:12'
  }
] as const

export function pickKnowledgeQuote(seed?: number): KnowledgeQuote {
  const fallback: KnowledgeQuote = { text: '', attribution: '' }
  if (!KNOWLEDGE_QUOTES.length) return fallback
  const i = seed == null
    ? Math.floor(Math.random() * KNOWLEDGE_QUOTES.length)
    : Math.abs(Math.floor(seed)) % KNOWLEDGE_QUOTES.length
  return KNOWLEDGE_QUOTES[i]!
}
