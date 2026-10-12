/**
 * Whatto news feed: merges public crypto RSS feeds into one JSON list.
 * Browsers cannot read these feeds directly (no CORS), so this route fetches
 * them server-side, caches for 2 minutes, and returns plain items. Scoring
 * happens client-side in utils/whatto/sentiment.ts so it is visible and testable.
 */

const FEEDS = [
  { source: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
  { source: 'Cointelegraph', url: 'https://cointelegraph.com/rss' },
  { source: 'Decrypt', url: 'https://decrypt.co/feed' },
  { source: 'The Block', url: 'https://www.theblock.co/rss.xml' },
]

const UA = 'Entertrainer-Whatto/1.0 (+https://entertrainer.in/engage/whatto)'
const TTL_MS = 120_000

interface Item { id: string; source: string; title: string; summary: string; url: string; publishedAt: number }

let cache: { at: number; items: Item[]; sources: { source: string; ok: boolean; count: number }[] } | null = null

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'))
  return m ? decode(m[1]) : ''
}

async function fetchFeed(source: string, url: string): Promise<Item[]> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 8000)
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/xml, text/xml' }, signal: ctrl.signal, redirect: 'follow' })
    if (!res.ok) return []
    const xml = await res.text()
    const items: Item[] = []
    for (const m of xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)) {
      const block = m[0]
      const title = tag(block, 'title')
      const link = tag(block, 'link') || tag(block, 'guid')
      const pub = Date.parse(tag(block, 'pubDate') || tag(block, 'dc:date'))
      if (!title || !Number.isFinite(pub)) continue
      items.push({ id: `${source}:${link || title}`, source, title, summary: tag(block, 'description').slice(0, 400), url: /^https?:\/\//.test(link) ? link : '', publishedAt: pub })
    }
    return items
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}

export default defineEventHandler(async (event) => {
  // Plain Node response on purpose: see server/api/social-card/[key].png.ts for the h3 version clash.
  event.node.res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300')
  if (cache && Date.now() - cache.at < TTL_MS) return { fetchedAt: cache.at, sources: cache.sources, items: cache.items }
  const results = await Promise.all(FEEDS.map(f => fetchFeed(f.source, f.url)))
  const sources = FEEDS.map((f, i) => ({ source: f.source, ok: results[i].length > 0, count: results[i].length }))
  const seen = new Set<string>()
  const items = results.flat()
    .filter(i => Date.now() - i.publishedAt < 48 * 3600_000)
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .filter(i => { const k = i.title.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true })
    .slice(0, 80)
  if (!items.length && cache) return { fetchedAt: cache.at, sources, items: cache.items, stale: true }
  if (!items.length) {
    throw createError({ statusCode: 502, statusMessage: 'No news feed answered' })
  }
  cache = { at: Date.now(), items, sources }
  return { fetchedAt: cache.at, sources, items }
})
