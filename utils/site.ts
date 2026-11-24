/**
 * Canonical site origin.
 *
 * Production serves https://www.entertrainer.in. The apex host 308-redirects
 * there, so canonical, robots, and social URLs use this origin.
 * The sitemap is the catalog route at /sitemap.xml, which calls absoluteUrl().
 */
export const SITE_URL = 'https://www.entertrainer.in'

/** Absolute URL on the canonical host. The root stays `SITE_URL + '/'`. */
export function absoluteUrl(path = '/'): string {
  const value = String(path || '/')
  if (/^https?:\/\//i.test(value)) return value
  const normalized = value.startsWith('/') ? value : `/${value}`
  return `${SITE_URL}${normalized}`
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
