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
    hero: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/aQLfZtFcKJUyNvVk.jpg',
    heroAlt: 'A person reflected in a city bus window',
    status: 'published'
  }
]

export const FEATURED_BLOG = BLOG_POSTS[0]
