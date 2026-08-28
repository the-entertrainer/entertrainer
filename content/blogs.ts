export interface BlogPost {
  slug: string
  title: string
  dek: string
  category: string
  minutes: number
  hero: string
  heroAlt: string
  status: 'published' | 'upcoming'
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'you-are-not-lazy-you-are-helping-the-universe-extend-its-life',
    title: 'You Are Not Lazy. You Are Helping the Universe Extend Its Life.',
    dek: 'A small physics story about rest, hot tea, batteries, deleted files, and why the universe likes to spread things out.',
    category: 'Physics & everyday life',
    minutes: 8,
    hero: 'https://entertrainer.in/api/social-card/entropy-laziness.png',
    heroAlt: 'A yellow Entertrainer editorial card for an article about entropy, rest, and useful energy.',
    status: 'published'
  },
  {
    slug: 'if-you-are-intelligent-life-might-not-be-easy',
    title: 'If you are an intelligent person, life might not be easy for you. Here’s why',
    dek: 'Not because intelligence is a curse. Because a mind that can model more possibilities can also get stuck living in the model.',
    category: 'Mind & meaning',
    minutes: 9,
    hero: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/aQLfZtFcKJUyNvVk.jpg',
    heroAlt: 'A person reflected in a city bus window',
    status: 'published'
  },
  {
    slug: 'why-isnt-the-moon-moonly',
    title: 'Friend, friendly. Love, lovely. So why isn’t the Moon moonly?',
    dek: 'English will build an adjective out of almost any noun, then quietly refuse for the Moon, the Sun and your own teeth. The reason is older than English.',
    category: 'Language & meaning',
    minutes: 7,
    hero: 'https://entertrainer.in/api/social-card/moon-moonly.png',
    heroAlt: 'A yellow Entertrainer editorial card for an article about collateral adjectives in English.',
    status: 'published'
  }
]

export const ENTROPY_BLOG = BLOG_POSTS[0]
export const INTELLIGENCE_BLOG = BLOG_POSTS[1]
export const MOONLY_BLOG = BLOG_POSTS[2]
export const FEATURED_BLOG = ENTROPY_BLOG
