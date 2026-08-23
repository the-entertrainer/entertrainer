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
    slug: 'if-you-are-intelligent-life-might-not-be-easy',
    title: 'If you are an intelligent person, life might not be easy for you. Here’s why',
    dek: 'Not because intelligence is a curse. Because a mind that can model more possibilities can also get stuck living in the model.',
    category: 'Mind & meaning',
    minutes: 9,
    hero: '/manus-storage/blog-intelligence-hero_3af246a1.png',
    heroAlt: 'An editorial illustration of a person at a bus stop with warm yellow concentric circles and branching paths behind them',
    status: 'published'
  }
]

export const FEATURED_BLOG = BLOG_POSTS[0]
