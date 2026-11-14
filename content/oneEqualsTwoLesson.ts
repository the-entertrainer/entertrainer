import type { Lesson } from '~/types/lesson'

export const oneEqualsTwoLesson: Lesson = {
  id: 'one-equals-two',
  slug: 'one-equals-two-lets-break-maths',
  title: '1=2: Let’s break maths',
  objective: 'See where a tidy school proof fails, and why the failure is the interesting part.',
  dek: 'As a schoolboy I told my mother maths was the truth. Then pi refused to end, and five lines of algebra proved that 2 equals 1.',
  category: 'Universe',
  minutes: 8,
  hero: '/blog/one-equals-two/hero.jpg',
  heroAlt: 'Cream-paper ink drawing of an old balance scale holding one stone on one pan and two on the other, sitting level, with a thin cobalt crack running down its post.',
  blocks: [
    {
      id: 'lead',
      type: 'text',
      lead: true,
      content: 'I was still in school, sitting on the kitchen floor one evening with a notebook full of long division, when my mother said the thing she always said. She was stirring a pot and not really looking at me. “The only thing that exists,” she said, “the only truth there is, is God himself.”'
    },
    {
      id: 'reply',
      type: 'text',
      content: 'I put my pencil down like a lawyer about to win the case. “No ma. Maths exists. It’s the truth.”'
    },
    {
      id: 'statement-1',
      type: 'statement',
      style: 'insight',
      text: 'Every ruler starts at a zero somebody chose.'
    },
    {
      id: 'h-ten',
      type: 'heading',
      text: 'Ten fingers'
    },
    {
      id: 'ten-text',
      type: 'text',
      content: 'We count in tens because that is what we had on us when we started counting goats. The Babylonians counted in sixties. The Maya counted in twenties. Three civilisations, three rulers, and each felt natural to the people holding it.'
    },
    {
      id: 'img-calandri',
      type: 'image',
      src: '/blog/one-equals-two/calandri-finger-counting-1491.jpg',
      alt: 'An open fifteenth-century printed book with woodcut hands on both pages, each hand bending its fingers into a different number.',
      caption: 'Filippo Calandri, De Arithmetica, 1491. Two pages showing how to hold numbers on your hands.',
      credit: 'Public Domain / The Metropolitan Museum of Art'
    },
    {
      id: 'h-pi',
      type: 'heading',
      text: 'The point that will not be pinned'
    },
    {
      id: 'pi-text',
      type: 'text',
      content: 'Take any circle. Measure all the way round it, divide by the distance straight across, and you always get a little more than three. The digits of pi never fall into a repeating pattern. In any whole-number base they refuse to settle. It is a point that refuses to be located.'
    },
    {
      id: 'acc-pi',
      type: 'accordion',
      title: 'What we know about pi',
      items: [
        { title: 'Irrational and transcendental', content: 'Lambert proved in the 1760s that pi cannot be written as one whole number divided by another. Lindemann showed in 1882 that it is transcendental: no polynomial with whole-number coefficients has pi as its root.' },
        { title: 'How far we have calculated', content: 'In November 2025 a server ran for 110 days and produced 314 trillion digits. NASA notes that 37 decimal places are enough to measure the circumference of the observable universe to within the width of a hydrogen atom.' },
        { title: 'Your number is already in there', content: 'Every possible string of thirteen digits has been found inside those 314 trillion. Your mobile number is sitting quietly between strangers. If pi is normal, so is everything that has ever been written.' }
      ]
    },
    {
      id: 'h-proof',
      type: 'heading',
      text: 'The night 2 became 1'
    },
    {
      id: 'process-proof',
      type: 'process',
      title: 'Follow the five lines',
      steps: [
        { label: 'a = b', detail: 'Start with two equal numbers.' },
        { label: 'a² = ab', detail: 'Multiply both sides by a.' },
        { label: 'a² − b² = ab − b²', detail: 'Subtract b² from both sides.' },
        { label: '(a + b)(a − b) = b(a − b)', detail: 'Factorise both sides.' },
        { label: 'a + b = b', detail: 'Cross out (a − b) on each side.', bad: true, note: 'Here. a = b, so a − b is zero. Crossing it out means dividing by zero. That door is locked.' },
        { label: '1 + 1 = 1', detail: 'Let a = b = 1.' },
        { label: '2 = 1', detail: 'The result that should not exist.' }
      ]
    },
    {
      id: 'check-zero',
      type: 'knowledgeCheck',
      question: 'Why does the proof collapse?',
      options: [
        { id: 'a', text: 'Because we used base ten.' },
        { id: 'b', text: 'Because we divided by zero.' },
        { id: 'c', text: 'Because factorising is illegal.' }
      ],
      correctId: 'b',
      feedback: {
        correct: 'Yes. a − b is zero. Dividing both sides by zero is the step arithmetic refuses. The same crack appears in any base.',
        incorrect: 'Not quite. The crack is the moment we cancel (a − b). Since a = b, that term is zero. Dividing by zero lets you walk out with any answer you like.'
      }
    },
    {
      id: 'statement-map',
      type: 'statement',
      style: 'insight',
      text: 'Maths is real the way a map is real. A good map gets you home. But somebody drew it, and at the edges it simply stops.'
    },
    {
      id: 'reflection',
      type: 'reflection',
      prompt: 'Where have you met a rule that stopped answering? A measurement that would not settle, a division that refused, a map that ended.',
      placeholder: 'A few lines is enough…'
    },
    {
      id: 'closing',
      type: 'quote',
      text: 'Perhaps the truth was never on the map at all, only waiting at its edges, where pi keeps walking and zero will not open the door.',
      attribution: 'The closing line'
    },
    {
      id: 'sources',
      type: 'sources',
      items: [
        { id: 1, title: 'Babylonian numerals', source: 'MacTutor History of Mathematics. Base sixty, inherited from the Sumerians.', href: 'https://mathshistory.st-andrews.ac.uk/HistTopics/Babylonian_numerals/' },
        { id: 2, title: 'Mayan mathematics', source: 'MacTutor History of Mathematics. A counting system built on twenties.', href: 'https://mathshistory.st-andrews.ac.uk/HistTopics/Mayan_mathematics/' },
        { id: 3, title: 'Proof that π is irrational', source: 'Wikipedia. Lambert’s proof and Lindemann’s transcendental proof.', href: 'https://en.wikipedia.org/wiki/Proof_that_pi_is_irrational' },
        { id: 8, title: 'Mathematical fallacy: division by zero', source: 'Wikipedia. The classic 2 = 1 proof and the line where it divides by zero.', href: 'https://en.wikipedia.org/wiki/Mathematical_fallacy#Division_by_zero' }
      ]
    }
  ]
}
