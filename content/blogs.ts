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
    dek: 'You make the tea hot. You look away. The cup is ordinary again — and the heat did not disappear.',
    socialHook: 'Hot tea cools. Phones die. Same boring physics. Rest isn’t a moral failure — it’s the universe preferring things spread out.',
    socialTitle: 'Hot tea cools. Phones die. Rest isn’t a moral failure.',
    category: 'Universe',
    tags: ['science', 'physics', 'everyday'],
    minutes: 8,
    hero: '/blog/entropy-laziness/hero.jpg',
    heroAlt: 'A steaming teacup at the center of concentric black and cobalt-blue rings, dissolving outward into scattered dots and dashes as the warmth spreads and fades.',
    status: 'published',
    publishedAt: '2026-08-23T22:14:08+00:00'
  },
  {
    slug: 'why-isnt-the-moon-moonly',
    title: 'Why isn’t the Moon moonly?',
    dek: 'Friend becomes friendly. Love becomes lovely. English builds that ending freely — then quietly refuses it for the Moon.',
    socialHook: 'Friend, friendly. Love, lovely. Moon… English builds adjectives freely, then quietly refuses. The reason is older than English.',
    socialTitle: 'Friend, friendly. Love, lovely. Why isn’t the Moon moonly?',
    category: 'Mind',
    tags: ['language', 'linguistics', 'literature'],
    minutes: 7,
    hero: '/blog/moonly/hero.jpg',
    heroAlt: 'The word MOONLY struck through in black, with the word LUNAR in bold cobalt blue beneath it and a small crescent moon in the corner.',
    status: 'published',
    publishedAt: '2026-08-28T12:54:49+00:00'
  },
  {
    slug: 'jamais-vu-why-words-stop-meaning-anything',
    title: 'When a word stops being a word',
    dek: 'Stare at a familiar word long enough and the letters stay — but the meaning walks out of the room.',
    socialHook: 'I stared at “door” until it stopped looking like English. That glitch has a name, an Ig Nobel Prize, and stranger cousins.',
    socialTitle: 'Stare at a word long enough — it stops being a word.',
    category: 'Mind',
    tags: ['cognition', 'memory', 'language'],
    minutes: 9,
    hero: '/blog/jamais-vu/hero-word-fade.jpg',
    heroAlt: 'The word DOOR repeated five times, each repetition fragmenting further into loose black and cobalt-blue shapes, as if the word is dissolving.',
    status: 'published',
    publishedAt: '2026-08-29T22:10:40+00:00'
  },
  {
    slug: 'the-midpoint-of-your-life-isnt-40-its-18',
    title: 'The middle of your life is not 40',
    dek: 'A clock year and a felt year are not the same object. Change when memory starts, or how long you expect to live, and the “middle” moves.',
    socialHook: 'A video claimed your life’s midpoint isn’t 40 — it’s 18. The maths is real, two centuries old, and shakier than the voiceover.',
    socialTitle: 'Your life’s midpoint isn’t 40. The maths says it’s 18.',
    category: 'Mind',
    tags: ['cognition', 'time', 'perception'],
    minutes: 8,
    hero: '/blog/life-midpoint/hero.jpg',
    heroAlt: 'The number 40 struck through in black, with the number 18 in bold cobalt blue beneath it and a small hourglass icon with unevenly pooled sand.',
    status: 'published',
    publishedAt: '2026-08-31T20:00:14+00:00'
  },
  {
    slug: 'you-only-find-out-when-you-have-to-explain-it',
    title: 'You find out when you have to explain it',
    dek: 'You can work a zip in the dark. Ask what the slider does to the teeth — and the feeling of knowing goes dark too.',
    socialHook: 'The feeling of knowing arrives first, and cheaply. Ask someone to explain the zip — and the lighting goes out.',
    socialTitle: 'You only find out you don’t know it when you explain it.',
    category: 'Mind',
    tags: ['cognition', 'psychology', 'metacognition'],
    minutes: 9,
    hero: '/blog/feeling-of-knowing/hero.jpg',
    heroAlt: 'A black ink silhouette of a head in profile on cream paper; a zipper opens across the mind and reveals only empty dashed lines, with one cobalt-blue pull-tab.',
    status: 'published',
    publishedAt: '2026-09-13T10:15:00+00:00'
  },
  {
    slug: 'tajjalan',
    title: 'The cup stays. The tea does not.',
    dek: 'You pour the tea. It shows up, it sits, it is gone. The cup never left. Sit with that look before you name it.',
    socialHook: 'You pour the tea. It shows up, it sits, it is gone. The cup never left. An old word is only the name for that look.',
    socialTitle: 'The cup stays. The tea does not.',
    category: 'Mind',
    tags: ['upanishad', 'consciousness', 'philosophy'],
    minutes: 7,
    hero: '/blog/tajjalan/hero.jpg',
    heroAlt: 'A cream editorial drawing of a simple cup with a cobalt stream flowing into a dark textured ground — appearance rising, living, and returning in one field.',
    status: 'published',
    publishedAt: '2026-09-22T08:24:00+00:00'
  },
  {
    slug: 'your-mouth-can-be-sure-for-reasons-your-eyes-never-had',
    title: 'How many of you is inside you?',
    dek: 'One hand picks a shovel for a snow scene the mouth never saw. Speech invents a chicken shed anyway — and feels sure.',
    socialHook: 'They flashed a key to one half of a split brain. Speech said nothing. The left hand still found the key — then later invents a chicken-shed story for a shovel.',
    socialTitle: 'How many of you is actually inside you?',
    category: 'Mind',
    tags: ['cognition', 'neuroscience', 'consciousness'],
    minutes: 10,
    hero: '/blog/your-mouth-can-be-sure-for-reasons-your-eyes-never-had/hero.jpg',
    heroAlt: 'Cream-paper ink drawing: two heads divided by a cobalt seam, a hand finding a key on one side, a speaking mouth on the other.',
    status: 'published',
    publishedAt: '2026-09-22T15:45:00+00:00'
  },
  {
    slug: 'stomach-ulcers-are-an-infection',
    title: 'Stomach ulcers are an infection',
    dek: 'Robin Warren kept finding a thin blue line on stomach biopsies in Perth. Colleagues said the stomach was sterile.',
    socialHook: 'In 1984 Barry Marshall swallowed a culture from a Perth stomach biopsy. The illness was gastritis. The chronic ulcer was never his.',
    socialTitle: 'He drank the stomach bacteria. He did not grow an ulcer.',
    category: 'Science',
    tags: ['medicine', 'microbiology', 'history'],
    minutes: 10,
    hero: '/blog/stomach-ulcers-are-an-infection/hero.jpg',
    heroAlt: 'Cream paper, a black-ink petri dish with a few colonies, and one cobalt spiral — a curved bacterium, not a person.',
    status: 'published',
    publishedAt: '2026-10-04T15:15:00+00:00'
  },
]

export const ENTROPY_BLOG = BLOG_POSTS[0]
export const MOONLY_BLOG = BLOG_POSTS[1]
export const JAMAIS_VU_BLOG = BLOG_POSTS[2]
export const LIFE_MIDPOINT_BLOG = BLOG_POSTS[3]
export const KNOWING_BLOG = BLOG_POSTS[4]
export const TAJJALAN_BLOG = BLOG_POSTS[5]
export const SPLIT_BRAIN_BLOG = BLOG_POSTS[6]
export const ULCER_BLOG = BLOG_POSTS[7]
export const FEATURED_BLOG = ENTROPY_BLOG
