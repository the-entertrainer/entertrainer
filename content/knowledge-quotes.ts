/**
 * Home knowledge lines — authentic English quotes on knowledge / wisdom / learning / truth.
 * Mix of traditions; each entry has a source comment. Do not invent paraphrases.
 */

export const KNOWLEDGE_QUOTES: readonly string[] = [
  // Mundaka Upanishad 3.1.6 (satyam eva jayate)
  'Truth alone triumphs.',
  // Bṛhadāraṇyaka Upanishad 1.3.28 (tamaso mā jyotir gamaya)
  'Lead me from darkness to light.',
  // Bṛhadāraṇyaka Upanishad 1.3.28 (asato mā sad gamaya)
  'Lead me from the unreal to the real.',
  // Bhagavad Gita 4.38
  'There is nothing in this world so purifying as knowledge.',
  // Bhagavad Gita 4.39
  'The faithful one who is devoted and has mastered the senses gains knowledge.',
  // Hitopadeśa / traditional (vidyā dadāti vinayam)
  'Knowledge gives humility.',
  // Proverbs 4:7 (KJV)
  'Wisdom is the principal thing; therefore get wisdom.',
  // Proverbs 18:15 (KJV)
  'The heart of the prudent getteth knowledge.',
  // John 8:32 (RSV)
  'You will know the truth, and the truth will make you free.',
  // Confucius, Analects 2.17
  'When you know a thing, to hold that you know it; and when you do not know a thing, to allow that you do not know it—this is knowledge.',
  // Confucius, Analects 2.15
  'Learning without thought is labor lost; thought without learning is perilous.',
  // Plato, Apology (Socrates)
  'The unexamined life is not worth living.',
  // Plato, Republic (on forced learning)
  'Knowledge which is acquired under compulsion obtains no hold on the mind.',
  // Aristotle, Metaphysics I.1
  'All men by nature desire to know.',
  // Dhammapada 63
  'A fool who knows his foolishness is wise at least to that extent.',
  // Dhammapada 5
  'Hatred is never appeased by hatred in this world. By non-hatred alone is hatred appeased. This is an eternal law.',
  // Tao Te Ching 71 (Laozi)
  'To know that you do not know is best.',
  // Pirkei Avot 4:1
  'Who is wise? One who learns from every person.',
  // Pirkei Avot 2:5
  'The shy person cannot learn, and the impatient person cannot teach.',
  // Qur'an 96:1
  'Read in the name of your Lord who created.',
  // Francis Bacon, Meditationes Sacrae (1597)
  'Knowledge itself is power.',
  // Isaac Newton, letter to Robert Hooke (1675)
  'If I have seen further it is by standing on the shoulders of Giants.',
  // Albert Einstein, interview with G.S. Viereck (1929)
  'Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.',
  // Carl Sagan (Cosmos / related talks; widely attested)
  'Somewhere, something incredible is waiting to be known.',
  // Jalāl al-Dīn Rūmī (Masnavi tradition; widely attested English rendering)
  'The wound is the place where the Light enters you.',
  // William Shakespeare, Henry VI, Part 2, Act 4 Scene 7
  'Ignorance is the curse of God; knowledge is the wing wherewith we fly to heaven.',
  // Marcus Aurelius, Meditations 4.3 (standard English rendering)
  'It is in your power to withdraw into yourself whenever you choose.',
  // Heraclitus (DK B40; standard English)
  'Much learning does not teach understanding.',
  // Kaṭha Upanishad 1.3.14 (uttiṣṭhata jāgrata — common English rendering)
  'Arise, awake, and learn by approaching the wise.',
  // Ecclesiastes 7:12 (KJV)
  'Wisdom is a defence, and money is a defence: but the excellency of knowledge is, that wisdom giveth life to them that have it.',
] as const

export function pickKnowledgeQuote(seed?: number): string {
  if (!KNOWLEDGE_QUOTES.length) return ''
  const i = seed == null
    ? Math.floor(Math.random() * KNOWLEDGE_QUOTES.length)
    : Math.abs(Math.floor(seed)) % KNOWLEDGE_QUOTES.length
  return KNOWLEDGE_QUOTES[i]!
}
