import { normalizeElevateCategory } from '~/content/elevate-categories'
import type { BlogPost } from '~/content/blogs'
import type { ComposedPost } from '~/types/composed'
import composedPosts from '~/content/composed-posts.json'
import { isListed } from '~/utils/listed'

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
    socialHook: post.socialHook || post.dek,
    socialTitle: post.socialTitle || post.title,
    category: normalizeElevateCategory(post.category),
    tags: post.tags,
    minutes: post.minutes,
    hero: post.hero,
    heroAlt: post.heroAlt,
    status: 'published',
    publishedAt: post.publishedAt,
    listed: post.listed
  }
}

/**
 * Elevate index + RSS: listed hand-authored posts, then listed published
 * composed posts that are not already a static page slug.
 */
export function mergeElevateListing(handAuthored: BlogPost[], composed: ComposedPost[]): BlogPost[] {
  const seen = new Set(handAuthored.map((post) => post.slug))
  const extras = composed
    .filter((post) => post.status === 'published' && !seen.has(post.slug) && isListed(post))
    .map(composedToBlogPost)
  return [...handAuthored.filter((post) => isListed(post)), ...extras]
}

export function getElevateListing(handAuthored: BlogPost[]): BlogPost[] {
  return mergeElevateListing(handAuthored, getPublishedComposedPosts())
}
