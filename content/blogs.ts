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
    dek: 'You pour tea, answer one message, and the tea is cold. The heat left the cup and spread into the room, where it no longer warms the drink.',
    socialHook: 'Hot tea cools because the heat leaves the cup and spreads into the room. The same spread is why a phone battery runs down, and why rest is not a moral failure.',
    socialTitle: 'Hot tea cools because the heat leaves the cup.',
    category: 'Universe',
    tags: ['science', 'physics', 'everyday'],
    minutes: 6,
    hero: '/blog/entropy-laziness/hero.jpg',
    heroAlt: 'A diagram of a teacup in cross section. Cobalt arrows leave the liquid and spread into the air, showing where the heat goes.',
    status: 'published',
    publishedAt: '2026-08-23T22:14:08+00:00'
  },
  {
    slug: 'why-isnt-the-moon-moonly',
    title: 'Why isn’t the Moon moonly?',
    dek: 'Friend becomes friendly, and love becomes lovely. Moon does not become moonly, because English took the adjective from Latin.',
    socialHook: 'A child says moonly mountains, and adults correct the child. The adjective is lunar, from Latin, not built from the English word moon.',
    socialTitle: 'Why the Moon is lunar, not moonly',
    category: 'Mind',
    tags: ['language', 'linguistics', 'literature'],
    minutes: 5,
    hero: '/blog/moonly/hero.jpg',
    heroAlt: 'A diagram pairing a black-ink crescent moon with a cobalt oil lamp, to show the English word and the Latin word are not the same family.',
    status: 'published',
    publishedAt: '2026-08-28T12:54:49+00:00'
  },
  {
    slug: 'jamais-vu-why-words-stop-meaning-anything',
    title: 'When a word stops being a word',
    dek: 'If you look at a familiar word for long enough, the letters stay on the page and the meaning drops out.',
    socialHook: 'Staring at the word door can make it stop feeling like a word. A lab had people copy words until that happened, and the effect has a name.',
    socialTitle: 'A familiar word can stop feeling like a word',
    category: 'Mind',
    tags: ['cognition', 'memory', 'language'],
    minutes: 5,
    hero: '/blog/jamais-vu/hero-word-fade.jpg',
    heroAlt: 'A diagram of an eye looking at five repeated marks. Each mark breaks into more separate strokes, and the last mark is only loose dots.',
    status: 'published',
    publishedAt: '2026-08-29T22:10:40+00:00'
  },
  {
    slug: 'the-midpoint-of-your-life-isnt-40-its-18',
    title: 'The middle of your life is not 40',
    dek: 'One clock puts the middle of a life at 40. An old print puts it at 50. An 1877 rule puts the felt middle near 18.',
    socialHook: 'In 1877 Paul Janet argued that each year feels shorter than the year before. His rule places the felt middle of a life near 18, not 40.',
    socialTitle: 'The felt middle of a life is not always 40',
    category: 'Mind',
    tags: ['cognition', 'time', 'perception'],
    minutes: 5,
    hero: '/blog/life-midpoint/hero.jpg',
    heroAlt: 'A diagram of one lifeline with three midpoint marks. The earliest mark is cobalt, and the two later marks are black.',
    status: 'published',
    publishedAt: '2026-08-31T20:00:14+00:00'
  },
  {
    slug: 'you-only-find-out-when-you-have-to-explain-it',
    title: 'You find out when you have to explain it',
    dek: 'You can use a zip in the dark. When you try to explain how the zip works, the explanation usually stops early.',
    socialHook: 'Yale volunteers first rated how well they understood a zip. After they had to explain the mechanism, the ratings fell.',
    socialTitle: 'You learn the gap when you have to explain it',
    category: 'Mind',
    tags: ['cognition', 'psychology', 'metacognition'],
    minutes: 6,
    hero: '/blog/feeling-of-knowing/hero.jpg',
    heroAlt: 'An exploded diagram of a zipper. The rows of teeth and the slider are black ink, and the small wedge inside the slider is cobalt.',
    status: 'published',
    publishedAt: '2026-09-13T10:15:00+00:00'
  },
  {
    slug: 'tajjalan',
    title: 'The cup stays. The tea does not.',
    dek: 'A clay cup stays where you set it. The tea arrives, stays, and leaves. One word in the Chandogya Upanishad names that kind of watching.',
    socialHook: 'The cup stays and the tea does not. Tajjalan, a word in the Chandogya Upanishad, names arrival, staying, and leaving.',
    socialTitle: 'The cup stays and the tea leaves',
    category: 'Mind',
    tags: ['upanishad', 'consciousness', 'philosophy'],
    minutes: 6,
    hero: '/blog/tajjalan/hero.jpg',
    heroAlt: 'A diagram of three cups in a row. A cobalt stream fills the first cup, the second cup is full, and the third cup is empty.',
    status: 'published',
    publishedAt: '2026-09-22T08:24:00+00:00'
  },
  {
    slug: 'your-mouth-can-be-sure-for-reasons-your-eyes-never-had',
    title: 'One half explained what it did not see',
    dek: 'Surgeons cut the bridge between the two halves of a brain to stop seizures. One half then saw a picture the speaking half had not seen.',
    socialHook: 'One half of a split brain saw snow and chose a shovel. The speaking half did not see the snow, and still gave a reason.',
    socialTitle: 'One brain half saw it. The other explained it.',
    category: 'Mind',
    tags: ['cognition', 'neuroscience', 'consciousness'],
    minutes: 6,
    hero: '/blog/your-mouth-can-be-sure-for-reasons-your-eyes-never-had/hero.jpg',
    heroAlt: 'A diagram of a brain split down the middle. A snow picture reaches one side, and a cobalt path leads to a hand holding a shovel. The speaking side is separate.',
    status: 'published',
    publishedAt: '2026-09-22T15:45:00+00:00'
  },
  {
    slug: 'what-each-sacred-frequency-is-for',
    title: 'What each sacred frequency is for',
    dek: 'Nine tones, from 174 hertz to 963 hertz, each with a use people claim for it. The list records those claims. It is not a test result.',
    socialHook: 'Nine tones from 174 hertz to 963 hertz are each given a job, from ease at the low end to a sense of unity at the high end. The list is claimed use, not a trial result.',
    socialTitle: 'What people say each of the nine tones is for',
    category: 'Mind',
    tags: ['sound', 'healing', 'practice'],
    minutes: 8,
    hero: '/blog/sacred-frequencies/hero.jpg',
    heroAlt: 'A diagram of nine sound waves, slow at the bottom and fast at the top. The middle wave is cobalt, and a tuning fork sits at the left.',
    status: 'published',
    publishedAt: '2026-10-04T19:40:00+00:00'
  },
  {
    slug: 'one-equals-two-lets-break-maths',
    title: 'How a school proof gets 2 equals 1',
    dek: 'A school proof starts from a equals b and, after a hidden division by zero, concludes that 2 equals 1.',
    socialHook: 'Start with a equals b. Five lines of school algebra later, 2 equals 1. The hidden step divides by zero, which the rules do not allow.',
    socialTitle: 'The school proof that 2 equals 1 hides a bad step',
    category: 'Universe',
    tags: ['maths', 'pi', 'philosophy'],
    minutes: 7,
    hero: '/blog/one-equals-two/hero.jpg',
    heroAlt: 'A diagram of a circle unrolled into a line a little longer than three diameters, beside two equal bars and a cobalt slash through an empty gap.',
    status: 'published',
    publishedAt: '2026-10-06T16:45:00+00:00'
  },
  {
    slug: 'you-are-absolutely-right',
    title: 'You are absolutely right',
    dek: 'You send an unfinished plan from a bus stop. The chat agrees before you have checked the weak step.',
    socialHook: 'Chat models often agree with the user. A 2023 study, a 2025 product rollback, and a 2026 preprint show when that agreement happens.',
    socialTitle: 'The chat agreed before you checked the plan',
    category: 'Mind',
    tags: ['ai', 'thinking', 'habits'],
    minutes: 7,
    hero: '/blog/you-are-absolutely-right/hero.jpg',
    heroAlt: 'A diagram of a phone beside a page. A cobalt check sits on the first line only, and the next two lines still have empty boxes.',
    status: 'published',
    publishedAt: '2026-11-28T04:30:00+00:00'
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
export const ABSOLUTELY_RIGHT_BLOG = BLOG_POSTS[9]
export const FEATURED_BLOG = ENTROPY_BLOG
