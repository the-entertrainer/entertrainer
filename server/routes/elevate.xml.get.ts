import { BLOG_POSTS } from '~/content/blogs'
import { composedToBlogPost, getPublishedComposedPosts } from '~/content/composed'

const SITE_URL = 'https://entertrainer.in'

function escapeXml(value: string) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function absoluteAsset(path: string) {
  const raw = String(path || '').trim()
  if (!raw) return `${SITE_URL}/og-card.png`
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  if (raw.startsWith('data:')) return `${SITE_URL}/og-card.png`
  return `${SITE_URL}${raw.startsWith('/') ? raw : `/${raw}`}`
}

function safePubDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return new Date().toUTCString()
  return d.toUTCString()
}

export default defineEventHandler((event) => {
  setResponseHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  setResponseHeader(event, 'cache-control', 'public, max-age=300, s-maxage=300')

  try {
    const seen = new Set(BLOG_POSTS.map((post) => post.slug))
    const composedPublished = getPublishedComposedPosts()

    const listing = [
      ...BLOG_POSTS.filter((post) => post.status === 'published'),
      ...composedPublished.filter((post) => !seen.has(post.slug)).map(composedToBlogPost)
    ]

    const items = listing
      .map((post) => {
        const url = `${SITE_URL}/elevate/${post.slug}`
        const description = `${post.dek || ''} Read time: ${post.minutes || 1} minutes.`
        const hero = absoluteAsset(post.hero)
        return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${safePubDate(post.publishedAt)}</pubDate>
      <category>${escapeXml(post.category || 'Elevate')}</category>
      <description>${escapeXml(description)}</description>
      <media:content url="${escapeXml(hero)}" medium="image" />
      <media:thumbnail url="${escapeXml(hero)}" />
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
  } catch {
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Elevate · The Entertrainer Blogs</title>
    <link>${SITE_URL}/elevate</link>
    <description>Articles about work, learning, technology, and the questions that stay with you.</description>
    <language>en</language>
  </channel>
</rss>`
  }
})
