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
    title: 'Hot Tea, Dead Phones, and Why Rest Is Not a Moral Failure',
    dek: 'A small physics story about rest, hot tea, batteries, deleted files, and why the universe likes to spread things out.',
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
    slug: 'if-you-are-intelligent-life-might-not-be-easy',
    title: 'The Bus Is Late. Your Brain Opens Ten Windows.',
    dek: 'A mind that can model more possibilities can also get stuck living in the model. The research is less cinematic than the myth.',
    socialHook: 'Bus is six minutes late. Your skull opens ten windows and won’t close them. The research is less flattering than the myth.',
    socialTitle: 'Bus late. Your skull opens ten windows and won’t close them.',
    category: 'Mind',
    tags: ['cognition', 'psychology'],
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
    slug: 'does-ai-understand-you',
    title: 'Does AI Understand You? Bloom’s Taxonomy Says Otherwise',
    dek: 'An instructional designer walks the word “understand” through Bloom’s Taxonomy, and finds a very fast, very fluent machine that never quite arrives at the state the word describes.',
    socialHook: 'You type a half-finished rant. The reply is so on-point you whisper “it gets me.” Bloom’s Taxonomy says it never quite arrives.',
    socialTitle: 'Does AI understand you? Bloom’s Taxonomy says otherwise.',
    category: 'Technology',
    tags: ['learning design', 'AI', 'teaching'],
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
    title: "The Midpoint of Your Life Isn't 40. It's 18.",
    dek: 'A video I watched claimed the real midpoint of an 81-year life is age 18, not 40. The maths behind it is genuine, two centuries old — and shakier than the confident voiceover made it sound.',
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
    slug: 'how-to-lie-perfectly',
    title: 'What It Would Take to Lie Perfectly',
    dek: 'Perfect lying sounds like calm eyes and a locked story. Cognitive science suggests it is mostly a bandwidth problem — and that many imperfect lies succeed because listeners start in truth-default.',
    socialHook: 'Perfect lying looks like calm eyes. Cognitive science keeps calling it a bandwidth problem — and listeners who start by believing you.',
    socialTitle: 'What it would take to lie perfectly — mostly bandwidth.',
    category: 'Mind',
    tags: ['cognition', 'psychology'],
    minutes: 9,
    hero: '/blog/how-to-lie-perfectly/hero.jpg',
    heroAlt: 'A black silhouette of a head in profile on a cream background; tangled black dashed-road speech paths swirl from the mouth while one straight cobalt-blue path runs forward, with a small cobalt crossed-fingers icon between them.',
    status: 'published',
    publishedAt: '2026-09-05T20:57:02+00:00'
  },
  {
    slug: 'the-voice-in-your-head-is-not-the-whole-of-you',
    title: 'The Press Secretary in Your Head',
    dek: 'That running commentary can rehearse a conversation, hold a phone number, and talk you out of sending a message. Useful. Not in charge.',
    socialHook: 'That running commentary rehearses the text, holds the number, talks you out of sending it. Useful. Not the CEO of you.',
    socialTitle: 'The press secretary in your head is useful. Not the CEO.',
    category: 'Mind',
    tags: ['cognition', 'language', 'inner speech'],
    minutes: 9,
    hero: '/blog/inner-speech/hero.jpg',
    heroAlt: 'A black ink silhouette of an adult head with a tiny press-secretary desk inside it, notes stacked around a lamp, and one cobalt-blue path leaving the mouth.',
    status: 'published',
    publishedAt: '2026-09-05T12:00:00+00:00'
  },
  {
    slug: 'you-are-the-centre-of-the-universe',
    title: 'The Sky Runs Away From Everyone',
    dek: 'Space gets bigger between the galaxies — they are not walking. Hold anyone still and the sky runs away from them. Same for everyone.',
    socialHook: 'Hold still. The sky runs away from you. Hold anyone else still — same thing. Expanding space doesn’t pick a favourite.',
    socialTitle: 'Hold still. The sky runs away from you — and everyone.',
    category: 'Universe',
    tags: ['cosmology', 'expansion', 'science'],
    minutes: 9,
    hero: '/blog/centre-universe/hero.jpg',
    heroAlt: 'Cream field of galaxy dots: faint yesterday under bold today, soft dashed rays from a yellow-held centre where one person’s two photos stack.',
    status: 'published',
    publishedAt: '2026-09-09T19:06:00+00:00'
  },
  {
    slug: 'you-only-find-out-when-you-have-to-explain-it',
    title: 'You Only Find Out You Don’t Know It When You Have to Explain It',
    dek: 'The feeling of knowing arrives first, and cheaply. A zip, a policy, a search bar — they all sell you a working model. The model is often just a label with good lighting.',
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
    title: 'Tajjalan',
    dek: 'An old word from the Chāndogya Upaniṣad: whatever shows up is born from That, lives in That, and returns into That.',
    socialHook: 'There’s an old Chāndogya word for a pressure: whatever shows up rises from That, lives in That, and returns into That.',
    socialTitle: 'Tajjalan — born from That, lives in That, returns into That.',
    category: 'Mind',
    tags: ['upanishad', 'consciousness', 'philosophy'],
    minutes: 7,
    hero: '/blog/tajjalan/hero.jpg',
    heroAlt: 'A cream editorial drawing of a simple cup with a cobalt stream flowing into a dark textured ground — appearance rising, living, and returning in one field.',
    status: 'published',
    publishedAt: '2026-09-22T08:24:00+00:00'
  }
]


export const ENTROPY_BLOG = BLOG_POSTS[0]
export const INTELLIGENCE_BLOG = BLOG_POSTS[1]
export const MOONLY_BLOG = BLOG_POSTS[2]
export const AI_UNDERSTAND_BLOG = BLOG_POSTS[3]
export const JAMAIS_VU_BLOG = BLOG_POSTS[4]
export const LIFE_MIDPOINT_BLOG = BLOG_POSTS[5]
export const LIE_PERFECTLY_BLOG = BLOG_POSTS[6]
export const INNER_SPEECH_BLOG = BLOG_POSTS[7]
export const CENTRE_UNIVERSE_BLOG = BLOG_POSTS[8]
export const KNOWING_BLOG = BLOG_POSTS[9]
export const TAJJALAN_BLOG = BLOG_POSTS[10]
export const FEATURED_BLOG = ENTROPY_BLOG
