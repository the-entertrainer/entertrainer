import { BLOG_POSTS } from '~/content/blogs'
import { ENGAGE_ITEMS } from '~/content/engage'
import { LEARN_ITEMS } from '~/content/learn'
import { getPublishedComposedPosts } from '~/content/composed'
import { EMPOWER_TOOLS, MORE_TOOLS } from '~/utils/empower/catalog'
import { isListed } from '~/utils/listed'
import { absoluteUrl } from '~/utils/site'

/** Hub and other pages that are not themselves catalog rows. */
const SITEMAP_PAGES: { loc: string; priority: string }[] = [
  { loc: '/', priority: '1.0' },
  { loc: '/elevate', priority: '0.9' },
  { loc: '/empower', priority: '0.9' },
  { loc: '/engage', priority: '0.8' },
  { loc: '/engage/stack', priority: '0.7' },
  { loc: '/engage/read-my-mind', priority: '0.7' },
  { loc: '/engage/astroclock', priority: '0.7' },
  { loc: '/learn', priority: '0.8' },
  { loc: '/work', priority: '0.8' },
  { loc: '/about', priority: '0.8' },
  { loc: '/archive', priority: '0.4' },
  { loc: '/archive/downloads', priority: '0.4' },
  { loc: '/instructional-design', priority: '0.8' },
  { loc: '/work/sewa-chronicles', priority: '0.8' },
  { loc: '/work/strong', priority: '0.8' },
  { loc: '/tools/storygen', priority: '0.7' },
  { loc: '/tools/cadence', priority: '0.7' },
  { loc: '/colophon', priority: '0.5' },
  { loc: '/elevate/you-are-not-lazy-you-are-helping-the-universe-extend-its-life', priority: '0.7' },
  { loc: '/elevate/why-isnt-the-moon-moonly', priority: '0.7' },
  { loc: '/elevate/jamais-vu-why-words-stop-meaning-anything', priority: '0.7' },
  { loc: '/elevate/the-midpoint-of-your-life-isnt-40-its-18', priority: '0.7' },
  { loc: '/elevate/you-only-find-out-when-you-have-to-explain-it', priority: '0.7' },
  { loc: '/elevate/tajjalan', priority: '0.7' },
  { loc: '/elevate/your-mouth-can-be-sure-for-reasons-your-eyes-never-had', priority: '0.7' },
  { loc: '/elevate/what-each-sacred-frequency-is-for', priority: '0.7' },
  { loc: '/elevate/one-equals-two-lets-break-maths', priority: '0.7' },
]

export function catalogPath(path: string): string {
  const bare = String(path || '/').split('?')[0].split('#')[0]
  if (bare.length > 1) return bare.replace(/\/+$/, '')
  return bare || '/'
}

export interface CatalogRow {
  href: string
  listed: boolean
}

/** One row per public URL. Listed wins if two catalogs mention the same path. */
export function publicCatalog(): CatalogRow[] {
  const rows: CatalogRow[] = [
    ...BLOG_POSTS.filter((post) => post.status === 'published').map((post) => ({
      href: `/elevate/${post.slug}`,
      listed: isListed(post),
    })),
    ...getPublishedComposedPosts().map((post) => ({
      href: `/elevate/${post.slug}`,
      listed: isListed(post),
    })),
    ...EMPOWER_TOOLS.map((tool) => ({
      href: catalogPath(tool.href),
      listed: isListed(tool),
    })),
    ...MORE_TOOLS.map((tool) => ({
      href: catalogPath(tool.href),
      listed: isListed(tool),
    })),
    ...ENGAGE_ITEMS.map((item) => ({
      href: catalogPath(item.href),
      listed: isListed(item),
    })),
    ...LEARN_ITEMS.map((item) => ({
      href: catalogPath(item.href),
      listed: isListed(item),
    })),
  ]

  const merged = new Map<string, boolean>()
  for (const row of rows) {
    merged.set(row.href, merged.get(row.href) === true || row.listed)
  }
  return [...merged.entries()].map(([href, listed]) => ({ href, listed }))
}

/** True only when this path is a catalog item and every row for it is unlisted. */
export function isUnlistedCatalogPath(path: string): boolean {
  const clean = catalogPath(path)
  const hits = publicCatalog().filter((row) => row.href === clean)
  return hits.length > 0 && hits.every((row) => !row.listed)
}

export function sitemapEntries(): { loc: string; priority: string }[] {
  const catalog = publicCatalog()
  const unlisted = new Set(catalog.filter((row) => !row.listed).map((row) => row.href))
  const pages = SITEMAP_PAGES.filter((page) => !unlisted.has(page.loc))
  const have = new Set(pages.map((page) => page.loc))
  for (const row of catalog) {
    if (!row.listed || have.has(row.href)) continue
    pages.push({ loc: row.href, priority: '0.7' })
    have.add(row.href)
  }
  return pages
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function sitemapXml(): string {
  const urls = sitemapEntries()
    .map((page) => `  <url><loc>${escapeXml(absoluteUrl(page.loc))}</loc><priority>${page.priority}</priority></url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}
