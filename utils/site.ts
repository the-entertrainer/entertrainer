/**
 * Canonical site origin.
 *
 * Production serves https://www.entertrainer.in. The apex host 308-redirects
 * there, so canonical, sitemap, robots, and social URLs use this origin.
 */
export const SITE_URL = 'https://www.entertrainer.in'

/** Absolute URL on the canonical host. The root stays `SITE_URL + '/'`. */
export function absoluteUrl(path = '/'): string {
  const value = String(path || '/')
  if (/^https?:\/\//i.test(value)) return value
  const normalized = value.startsWith('/') ? value : `/${value}`
  return `${SITE_URL}${normalized}`
}

const SITEMAP: { path: string; priority: string }[] = [
  { path: '/', priority: '1.0' },
  { path: '/elevate', priority: '0.9' },
  { path: '/empower', priority: '0.9' },
  { path: '/engage', priority: '0.8' },
  { path: '/engage/stack', priority: '0.7' },
  { path: '/engage/read-my-mind', priority: '0.7' },
  { path: '/engage/astroclock', priority: '0.7' },
  { path: '/learn', priority: '0.8' },
  { path: '/work', priority: '0.8' },
  { path: '/about', priority: '0.8' },
  { path: '/archive', priority: '0.4' },
  { path: '/archive/downloads', priority: '0.4' },
  { path: '/instructional-design', priority: '0.8' },
  { path: '/work/sewa-chronicles', priority: '0.8' },
  { path: '/work/strong', priority: '0.8' },
  { path: '/tools/storygen', priority: '0.7' },
  { path: '/tools/cadence', priority: '0.7' },
  { path: '/colophon', priority: '0.5' },
  { path: '/elevate/you-are-not-lazy-you-are-helping-the-universe-extend-its-life', priority: '0.7' },
  { path: '/elevate/why-isnt-the-moon-moonly', priority: '0.7' },
  { path: '/elevate/jamais-vu-why-words-stop-meaning-anything', priority: '0.7' },
  { path: '/elevate/the-midpoint-of-your-life-isnt-40-its-18', priority: '0.7' },
  { path: '/elevate/you-only-find-out-when-you-have-to-explain-it', priority: '0.7' },
  { path: '/elevate/tajjalan', priority: '0.7' },
  { path: '/elevate/your-mouth-can-be-sure-for-reasons-your-eyes-never-had', priority: '0.7' },
  { path: '/elevate/what-each-sacred-frequency-is-for', priority: '0.7' },
  { path: '/elevate/one-equals-two-lets-break-maths', priority: '0.7' },
]

export function renderSitemapXml(): string {
  const urls = SITEMAP
    .map((entry) => `  <url><loc>${absoluteUrl(entry.path)}</loc><priority>${entry.priority}</priority></url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export function renderRobotsTxt(): string {
  return `User-agent: *
Allow: /
Disallow: /glass-lab
Disallow: /compose
Disallow: /lab
Disallow: /api/test-groq
Disallow: /api/test-error
Disallow: /api/ping

Sitemap: ${absoluteUrl('/sitemap.xml')}
`
}
