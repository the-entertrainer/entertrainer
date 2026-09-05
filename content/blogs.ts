export interface BlogPost {
  slug: string
  title: string
  dek: string
  category: string
  minutes: number
  hero: string
  heroAlt: string
  status: 'published' | 'upcoming'
  publishedAt: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'you-are-not-lazy-you-are-helping-the-universe-extend-its-life',
    title: 'You Are Not Lazy. You Are Helping the Universe Extend Its Life.',
    dek: 'A small physics story about rest, hot tea, batteries, deleted files, and why the universe likes to spread things out.',
    category: 'Physics & everyday life',
    minutes: 8,
    hero: '/blog/entropy-laziness/hero.jpg',
    heroAlt: 'A steaming teacup at the center of concentric black and cobalt-blue rings, dissolving outward into scattered dots and dashes as the warmth spreads and fades.',
    status: 'published',
    publishedAt: '2026-08-23T22:14:08+00:00'
  },
  {
    slug: 'if-you-are-intelligent-life-might-not-be-easy',
    title: 'If you are an intelligent person, life might not be easy for you. Here’s why',
    dek: 'Not because intelligence is a curse. Because a mind that can model more possibilities can also get stuck living in the model.',
    category: 'Mind & meaning',
    minutes: 9,
    hero: '/blog/intelligence/hero.jpg',
    heroAlt: 'A black silhouette of a head in profile with a tangled maze of branching paths spilling out from it, one single path breaking free in cobalt blue and running straight off the edge of the frame.',
    status: 'published',
    publishedAt: '2026-08-23T23:02:40+00:00'
  },
  {
    slug: 'why-isnt-the-moon-moonly',
    title: 'Friend, friendly. Love, lovely. So why isn’t the Moon moonly?',
    dek: 'English will build an adjective out of almost any noun, then quietly refuse for the Moon, the Sun and your own teeth. The reason is older than English.',
    category: 'Language & meaning',
    minutes: 7,
    hero: '/blog/moonly/hero.jpg',
    heroAlt: 'The word MOONLY struck through in black, with the word LUNAR in bold cobalt blue beneath it and a small crescent moon in the corner.',
    status: 'published',
    publishedAt: '2026-08-28T12:54:49+00:00'
  },
  {
    slug: 'does-ai-understand-you',
    title: 'Does AI Understand You? Bloom’s Taxonomy Says Otherwise',
    dek: 'An instructional designer walks the word “understand” through Bloom’s Taxonomy, and finds a very fast, very fluent machine that never quite arrives at the state the word describes.',
    category: 'Learning design & AI',
    minutes: 10,
    hero: '/blog/ai-understand/hero.jpg',
    heroAlt: 'Two head silhouettes facing each other, one filled with an organic black brain shape, the other with a rigid cobalt-blue circuit-grid pattern, with small square tiles floating between them.',
    status: 'published',
    publishedAt: '2026-08-28T15:44:02+00:00'
  },
  {
    slug: 'jamais-vu-why-words-stop-meaning-anything',
    title: 'Why Staring at a Word Long Enough Can Make It Stop Being a Word',
    dek: 'One evening at work I stared at the word "door" until it stopped looking like English. That glitch has a name, an Ig Nobel Prize, and a family of stranger cousins.',
    category: 'Mind & memory',
    minutes: 9,
    hero: '/blog/jamais-vu/hero-word-fade.jpg',
    heroAlt: 'The word DOOR repeated five times, each repetition fragmenting further into loose black and cobalt-blue shapes, as if the word is dissolving.',
    status: 'published',
    publishedAt: '2026-08-29T22:10:40+00:00'
  },
  {
    slug: 'the-midpoint-of-your-life-isnt-40-its-18',
    title: "The Midpoint of Your Life Isn't 40. It's 18.",
    dek: 'A video I watched claimed the real midpoint of an 81-year life is age 18, not 40. The maths behind it is genuine, two centuries old — and shakier than the confident voiceover made it sound.',
    category: 'Mind & time',
    minutes: 8,
    hero: '/blog/life-midpoint/hero.jpg',
    heroAlt: 'The number 40 struck through in black, with the number 18 in bold cobalt blue beneath it and a small hourglass icon with unevenly pooled sand.',
    status: 'published',
    publishedAt: '2026-08-31T20:00:14+00:00'
  },
  {
    slug: 'how-to-lie-perfectly',
    title: 'What It Would Take to Lie Perfectly',
    dek: 'Perfect lying sounds like calm eyes and a locked story. Cognitive science suggests it is mostly a bandwidth problem — and that many imperfect lies succeed because listeners start in truth-default.',
    category: 'Mind & meaning',
    minutes: 9,
    hero: '/blog/how-to-lie-perfectly/hero.jpg',
    heroAlt: 'A black silhouette of a head in profile on a cream background; tangled black dashed-road speech paths swirl from the mouth while one straight cobalt-blue path runs forward, with a small cobalt crossed-fingers icon between them.',
    status: 'published',
    publishedAt: '2026-09-05T20:57:02+00:00'
  }
]


export const ENTROPY_BLOG = BLOG_POSTS[0]
export const INTELLIGENCE_BLOG = BLOG_POSTS[1]
export const MOONLY_BLOG = BLOG_POSTS[2]
export const AI_UNDERSTAND_BLOG = BLOG_POSTS[3]
export const JAMAIS_VU_BLOG = BLOG_POSTS[4]
export const LIFE_MIDPOINT_BLOG = BLOG_POSTS[5]
export const LIE_PERFECTLY_BLOG = BLOG_POSTS[6]
export const FEATURED_BLOG = ENTROPY_BLOG
