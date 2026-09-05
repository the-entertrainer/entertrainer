import { BLOG_POSTS } from '~/content/blogs'
import { composedToBlogPost, getPublishedComposedPosts } from '~/content/composed'
import { readComposedStore } from '../utils/composed-store'

const SITE_URL = 'https://entertrainer.in'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default defineEventHandler((event) => {
  setResponseHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  setResponseHeader(event, 'cache-control', 'public, max-age=300, s-maxage=300')

  const seen = new Set(BLOG_POSTS.map((post) => post.slug))
  let composedPublished = getPublishedComposedPosts()
  try {
    composedPublished = readComposedStore().filter((post) => post.status === 'published')
  } catch {
    // fall back to committed JSON import
  }

  const listing = [
    ...BLOG_POSTS.filter((post) => post.status === 'published'),
    ...composedPublished.filter((post) => !seen.has(post.slug)).map(composedToBlogPost)
  ]

  const items = listing
    .map((post) => {
      const url = `${SITE_URL}/elevate/${post.slug}`
      const description = `${post.dek} Read time: ${post.minutes} minutes.`
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <category>${escapeXml(post.category)}</category>
      <description>${escapeXml(description)}</description>
      <media:content url="${SITE_URL}${post.hero}" medium="image" />
      <media:thumbnail url="${SITE_URL}${post.hero}" />
    </item>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Elevate · The Entertrainer Blogs</title>
    <link>${SITE_URL}/elevate</link>
    <description>Articles about work, learning, technology, and the questions that stay with you.</description>
    <language>en</language>
    <image>
      <url>${SITE_URL}/og-card.png</url>
      <title>Elevate · The Entertrainer Blogs</title>
      <link>${SITE_URL}/elevate</link>
    </image>${items}
  </channel>
</rss>`
})
