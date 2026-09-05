/**
 * Enrich figure blocks with CC0 / Public Domain images from Wikimedia Commons.
 * Falls back to Openverse when Commons yields nothing useful.
 */

export interface ImageHit {
  src: string
  credit: string
  license: string
  title?: string
}

const UA = 'EntertrainerComposeBot/1.0 (https://entertrainer.in; elevate-composer)'

function isLikelyFree(license: string): boolean {
  const l = license.toLowerCase()
  return (
    l.includes('public domain') ||
    l.includes('cc0') ||
    l.includes('pdm') ||
    l.includes('cc-zero') ||
    l === 'pd' ||
    l.includes('no rights reserved') ||
    l.includes('creativecommons.org/publicdomain')
  )
}

function stableCommonsUrl(url: string): string {
  // Prefer upload.wikimedia.org HTTPS URLs as returned by the API.
  try {
    const u = new URL(url)
    if (u.protocol === 'http:') u.protocol = 'https:'
    return u.toString()
  } catch {
    return url
  }
}

async function searchCommons(query: string, limit = 6): Promise<ImageHit[]> {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '6',
    gsrlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|mime|size',
    iiurlwidth: '1600',
    format: 'json',
    origin: '*'
  })

  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' }
  })
  if (!res.ok) return []

  const data = await res.json() as any
  const pages = data?.query?.pages
  if (!pages) return []

  const hits: ImageHit[] = []
  for (const page of Object.values(pages) as any[]) {
    const info = page?.imageinfo?.[0]
    if (!info) continue
    const mime = String(info.mime || '')
    if (!mime.startsWith('image/') || mime.includes('svg')) continue

    const meta = info.extmetadata || {}
    const license = String(
      meta.LicenseShortName?.value ||
      meta.License?.value ||
      meta.UsageTerms?.value ||
      ''
    )
    // Prefer free; still accept CC-BY if labeled clearly — Elevate captions credit.
    const freeEnough =
      isLikelyFree(license) ||
      /cc[- ]?by/i.test(license) ||
      /creative commons/i.test(license) ||
      !license

    if (!freeEnough) continue

    const src = stableCommonsUrl(String(info.thumburl || info.url || ''))
    if (!src) continue

    const artist = String(meta.Artist?.value || '')
      .replace(/<[^>]+>/g, '')
      .trim()
    const creditParts = [artist || 'Wikimedia Commons', license || 'see source'].filter(Boolean)

    hits.push({
      src,
      credit: creditParts.join(' · '),
      license: license || 'Unknown',
      title: String(page.title || '').replace(/^File:/, '')
    })
  }
  return hits
}

async function searchOpenverse(query: string, limit = 4): Promise<ImageHit[]> {
  const params = new URLSearchParams({
    q: query,
    license: 'cc0,pdm',
    page_size: String(limit)
  })
  try {
    const res = await fetch(`https://api.openverse.org/v1/images/?${params}`, {
      headers: { 'User-Agent': UA, Accept: 'application/json' }
    })
    if (!res.ok) return []
    const data = await res.json() as any
    const results = Array.isArray(data?.results) ? data.results : []
    return results
      .filter((r: any) => r?.url && String(r.url).startsWith('https://'))
      .map((r: any) => ({
        src: String(r.url),
        credit: [r.creator || r.provider || 'Openverse', r.license || 'CC0/PDM'].filter(Boolean).join(' · '),
        license: String(r.license || 'CC0'),
        title: String(r.title || '')
      }))
  } catch {
    return []
  }
}

export async function findTopicImages(topic: string, count = 4): Promise<ImageHit[]> {
  const cleaned = topic.replace(/[^\w\s-]/g, ' ').trim().slice(0, 80)
  const queries = [
    cleaned,
    `${cleaned} science diagram`,
    `${cleaned} illustration`
  ]

  const collected: ImageHit[] = []
  const seen = new Set<string>()

  for (const q of queries) {
    if (collected.length >= count) break
    try {
      const hits = await searchCommons(q, 8)
      for (const hit of hits) {
        if (seen.has(hit.src)) continue
        seen.add(hit.src)
        collected.push(hit)
        if (collected.length >= count) break
      }
    } catch {
      /* continue */
    }
  }

  if (collected.length < count) {
    try {
      const more = await searchOpenverse(cleaned, count - collected.length)
      for (const hit of more) {
        if (seen.has(hit.src)) continue
        seen.add(hit.src)
        collected.push(hit)
      }
    } catch {
      /* ignore */
    }
  }

  return collected.slice(0, count)
}

export function applyImagesToFigures(
  blocks: Array<{ type: string; src?: string; alt?: string; caption?: string }>,
  images: ImageHit[]
) {
  let i = 0
  for (const block of blocks) {
    if (block.type !== 'figure') continue
    const hit = images[i++]
    if (!hit) {
      // Leave placeholder so author can fill.
      if (!block.src) block.src = ''
      if (block.caption && !/credit|license|wikimedia|cc0|public domain/i.test(block.caption)) {
        block.caption = `${block.caption} (add image credit when you pick a file)`
      }
      continue
    }
    block.src = hit.src
    const baseCaption = (block.caption || block.alt || hit.title || 'Illustration').trim()
    block.caption = `${baseCaption} — ${hit.credit}`
    if (!block.alt) block.alt = hit.title || baseCaption
  }
}
