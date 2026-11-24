export interface BlogPost {
  slug: string
  title: string
  /** On-page standfirst — shown under the title on Elevate. */
  dek: string
  /**
   * LinkedIn / Open Graph / Twitter card description ONLY.
   * Not a copy of `dek`. Target ~100–150 chars (safe truncate ~160); front-load the hook.
   * Fail closed: required, must exist, must not equal `dek`. Pair with `socialTitle`
   * (LinkedIn mobile often hides this description). See docs/blog-social-hook.md
   * and `.claude/skills/blog-social-hook/SKILL.md`. Run `npm run check:social-hooks`.
   */
  socialHook: string
  /**
   * LinkedIn / Open Graph / Twitter card title ONLY.
   * LinkedIn mobile often hides og:description — this must carry the pull alone.
   * Target ~40–60 chars (hard check 20–70); front-load curiosity. Prefer ≠ one-word title.
   * See docs/blog-social-hook.md. Run `npm run check:social-hooks`.
   */
  socialTitle: string
  category: string
  /** Optional topical tags for filtering / chips. */
  tags?: string[]
  minutes: number
  hero: string
  heroAlt: string
  status: 'published' | 'upcoming'
  publishedAt: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'you-are-not-lazy-you-are-helping-the-universe-extend-its-life',
    title: 'Why hot tea goes cold',
    dek: 'You pour the tea, answer one message, and it has gone cold. The heat did not vanish. It went somewhere it can no longer do much.',
    socialHook: 'Your tea didn’t fail you. It finished a sentence the universe started. Plus: why fourteen open tabs feel more respectable than a nap.',
    socialTitle: 'Hot tea cools. Phones die. Rest isn’t a moral failure.',
    category: 'Universe',
    tags: ['science', 'physics', 'everyday'],
    minutes: 6,
    hero: '/blog/entropy-laziness/hero.jpg',
    heroAlt: 'A steaming teacup at the center of concentric black and cobalt-blue rings, dissolving outward into scattered dots and dashes as the warmth spreads and fades.',
    status: 'published',
    publishedAt: '2026-08-23T22:14:08+00:00'
  },
  {
    slug: 'why-isnt-the-moon-moonly',
    title: 'Why isn’t the Moon moonly?',
    dek: 'Friend becomes friendly, love becomes lovely, and the Moon gets a word from another family. Blame a very old guest list.',
    socialHook: 'A kid says the Moon has “moonly mountains” and four adults correct him. None can say why. The answer involves a clock, a lamp, and 1066.',
    socialTitle: 'Friend, friendly. Love, lovely. Why isn’t the Moon moonly?',
    category: 'Mind',
    tags: ['language', 'linguistics', 'literature'],
    minutes: 5,
    hero: '/blog/moonly/hero.jpg',
    heroAlt: 'The word MOONLY struck through in black, with the word LUNAR in bold cobalt blue beneath it and a small crescent moon in the corner.',
    status: 'published',
    publishedAt: '2026-08-28T12:54:49+00:00'
  },
  {
    slug: 'jamais-vu-why-words-stop-meaning-anything',
    title: 'When a word stops being a word',
    dek: 'Stare at a familiar word long enough and the letters stay, but the feeling that they mean something packs a bag and leaves.',
    socialHook: 'I stared at “door” until it stopped looking like English. That glitch has a name, an Ig Nobel Prize, and stranger cousins.',
    socialTitle: 'Stare at a word long enough and it stops being a word.',
    category: 'Mind',
    tags: ['cognition', 'memory', 'language'],
    minutes: 5,
    hero: '/blog/jamais-vu/hero-word-fade.jpg',
    heroAlt: 'The word DOOR repeated five times, each repetition fragmenting further into loose black and cobalt-blue shapes, as if the word is dissolving.',
    status: 'published',
    publishedAt: '2026-08-29T22:10:40+00:00'
  },
  {
    slug: 'the-midpoint-of-your-life-isnt-40-its-18',
    title: 'The middle of your life is not 40',
    dek: 'The clock says forty. An old staircase print says fifty. A French philosopher’s rule says eighteen. The middle depends on the ruler.',
    socialHook: 'In 1877 a philosopher accused his years of getting shorter. His rule puts your life’s midpoint at 18. Here is why that number moves.',
    socialTitle: 'Your life’s midpoint isn’t 40. One old rule says 18.',
    category: 'Mind',
    tags: ['cognition', 'time', 'perception'],
    minutes: 5,
    hero: '/blog/life-midpoint/hero.jpg',
    heroAlt: 'The number 40 struck through in black, with the number 18 in bold cobalt blue beneath it and a small hourglass icon with unevenly pooled sand.',
    status: 'published',
    publishedAt: '2026-08-31T20:00:14+00:00'
  },
  {
    slug: 'you-only-find-out-when-you-have-to-explain-it',
    title: 'You find out when you have to explain it',
    dek: 'You can zip a jacket in the dark. Try explaining how the zip works, and watch the lights go out in a room you thought you knew.',
    socialHook: 'Yale volunteers rated how well they understood a zip. Then they had to explain it. The feeling of knowing is a receipt, not the item.',
    socialTitle: 'You only find out you don’t know it when you explain it.',
    category: 'Mind',
    tags: ['cognition', 'psychology', 'metacognition'],
    minutes: 6,
    hero: '/blog/feeling-of-knowing/hero.jpg',
    heroAlt: 'A black ink silhouette of a head in profile on cream paper; a zipper opens across the mind and reveals only empty dashed lines, with one cobalt-blue pull-tab.',
    status: 'published',
    publishedAt: '2026-09-13T10:15:00+00:00'
  },
  {
    slug: 'tajjalan',
    title: 'The cup stays. The tea does not.',
    dek: 'A clay cup of chai on a Varanasi step, and a four-part word from the Upaniṣads for watching anything arrive, stay, and go.',
    socialHook: 'An old man watches his chai go cold on a ghat. One small word from the Chāndogya Upaniṣad names exactly that kind of looking.',
    socialTitle: 'The cup stays. The tea does not.',
    category: 'Mind',
    tags: ['upanishad', 'consciousness', 'philosophy'],
    minutes: 6,
    hero: '/blog/tajjalan/hero.jpg',
    heroAlt: 'A cream editorial drawing of a simple cup with a cobalt stream flowing into a dark textured ground, appearance rising, living, and returning in one field.',
    status: 'published',
    publishedAt: '2026-09-22T08:24:00+00:00'
  },
  {
    slug: 'your-mouth-can-be-sure-for-reasons-your-eyes-never-had',
    title: 'How many of you is inside you?',
    dek: 'Surgeons cut the bridge between a man’s brain halves to stop his seizures. Later, one half picked a shovel and the other invented why.',
    socialHook: 'One half of a split brain saw snow and picked a shovel. The talking half never saw the snow, and calmly invented a chicken shed.',
    socialTitle: 'How many of you is actually inside you?',
    category: 'Mind',
    tags: ['cognition', 'neuroscience', 'consciousness'],
    minutes: 6,
    hero: '/blog/your-mouth-can-be-sure-for-reasons-your-eyes-never-had/hero.jpg',
    heroAlt: 'Cream-paper ink drawing: two heads divided by a cobalt seam, a hand finding a key on one side, a speaking mouth on the other.',
    status: 'published',
    publishedAt: '2026-09-22T15:45:00+00:00'
  },
  {
    slug: 'what-each-sacred-frequency-is-for',
    title: 'What each sacred frequency is for',
    dek: 'Nine pure tones, nine jobs, from comfort at 174 hertz to oneness at 963. The tricky part is admitting which one you need.',
    socialHook: 'One tuning fork for fear, one for love. Guess which sells. What each of the nine sacred frequencies is said to do, and how to pick.',
    socialTitle: 'Nobody buys the fear tone first. What all nine do',
    category: 'Mind',
    tags: ['sound', 'healing', 'practice'],
    minutes: 8,
    hero: '/blog/sacred-frequencies/hero.jpg',
    heroAlt: 'Cream paper, a hatched ink ground, nine evenly spaced ticks, and one cobalt sine wave above them.',
    status: 'published',
    publishedAt: '2026-10-04T19:40:00+00:00'
  },
  {
    slug: 'one-equals-two-lets-break-maths',
    title: '1=2: Let’s break maths',
    dek: 'As a schoolboy I told my mother maths was the truth. Then pi refused to end, and five lines of algebra proved that 2 equals 1.',
    socialHook: 'Start with a = b. Five tidy lines of school algebra later, 2 = 1. One quiet step is hiding a door that maths will not walk through.',
    socialTitle: 'Five lines of school algebra that prove 2 = 1',
    category: 'Universe',
    tags: ['maths', 'pi', 'philosophy'],
    minutes: 7,
    hero: '/blog/one-equals-two/hero.jpg',
    heroAlt: 'Cream paper, a hatched ink wheel on a ruler, and one cobalt line where the wheel unrolls once, stopping just past the third mark and scattering into dots.',
    status: 'published',
    publishedAt: '2026-10-06T16:45:00+00:00'
  },
]

export const ENTROPY_BLOG = BLOG_POSTS[0]
export const MOONLY_BLOG = BLOG_POSTS[1]
export const JAMAIS_VU_BLOG = BLOG_POSTS[2]
export const LIFE_MIDPOINT_BLOG = BLOG_POSTS[3]
export const KNOWING_BLOG = BLOG_POSTS[4]
export const TAJJALAN_BLOG = BLOG_POSTS[5]
export const SPLIT_BRAIN_BLOG = BLOG_POSTS[6]
export const SACRED_FREQUENCIES_BLOG = BLOG_POSTS[7]
export const ONE_EQUALS_TWO_BLOG = BLOG_POSTS[8]
export const FEATURED_BLOG = ENTROPY_BLOG
