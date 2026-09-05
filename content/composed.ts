import type { BlogPost } from '~/content/blogs'
import type { ComposedPost } from '~/types/composed'
import composedPosts from '~/content/composed-posts.json'

/** All composed posts committed to the repo (drafts + published). */
export function getComposedPosts(): ComposedPost[] {
  return (composedPosts as ComposedPost[]) ?? []
}

/** Published composed posts only — safe for public listing/RSS/routes. */
export function getPublishedComposedPosts(): ComposedPost[] {
  return getComposedPosts().filter((post) => post.status === 'published')
}

export function getPublishedComposedPost(slug: string): ComposedPost | undefined {
  return getPublishedComposedPosts().find((post) => post.slug === slug)
}

/** Map a composed post onto the shared BlogPost listing shape. */
export function composedToBlogPost(post: ComposedPost): BlogPost {
  return {
    slug: post.slug,
    title: post.title,
    dek: post.dek,
    category: post.category,
    minutes: post.minutes,
    hero: post.hero,
    heroAlt: post.heroAlt,
    status: 'published',
    publishedAt: post.publishedAt
  }
}

/**
 * Elevate index + RSS feed: hand-authored catalog first, then any published
 * composed posts that are not already represented by a static page slug.
 */
export function getElevateListing(handAuthored: BlogPost[]): BlogPost[] {
  const seen = new Set(handAuthored.map((post) => post.slug))
  const extras = getPublishedComposedPosts()
    .filter((post) => !seen.has(post.slug))
    .map(composedToBlogPost)
  return [...handAuthored, ...extras]
}
