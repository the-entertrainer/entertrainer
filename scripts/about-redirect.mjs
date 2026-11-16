/**
 * Vercel compiles redirect sources with path-to-regexp (`strict: true`).
 * `:path*` is zero-or-more, so `/about/:path*` matches `/about` and 301s it
 * to itself. These sources require an extensionless segment, which is what
 * `@vercel/routing-utils` `sourceToRegex` emits for them.
 */
export const ABOUT_REDIRECTS = [
  {
    source: '/about/:path((?:[^./]+/)*[^./]+)',
    destination: '/about',
    pattern: /^\/about(?:\/((?:[^./]+\/)*[^./]+))$/,
  },
  {
    source: '/about/:path((?:[^./]+/)*[^./]+)/',
    destination: '/about',
    pattern: /^\/about(?:\/((?:[^./]+\/)*[^./]+))\/$/,
  },
]

export function assertAboutRedirects(redirects) {
  const about = redirects.filter((rule) => rule.source.startsWith('/about'))
  const expected = ABOUT_REDIRECTS.map((rule) => rule.source)
  const actual = about.map((rule) => rule.source)
  if (actual.join('\n') !== expected.join('\n')) {
    throw new Error(`about redirects changed\nexpected:\n${expected.join('\n')}\nactual:\n${actual.join('\n')}`)
  }
  for (const rule of about) {
    if (rule.destination !== '/about' || rule.statusCode !== 301) {
      throw new Error(`${rule.source} must 301 to /about`)
    }
  }
  for (const rule of redirects) {
    if (rule.source.includes(':path*') && rule.destination === '/about') {
      throw new Error(`${rule.source} matches /about itself`)
    }
    const optional = rule.source.match(/^(.*)\/:path\*$/)
    if (optional && rule.destination === optional[1]) {
      throw new Error(`${rule.source} redirects ${optional[1]} to itself`)
    }
  }

  const cases = [
    ['/about', false],
    ['/about/', false],
    ['/about/old-slug', true],
    ['/about/nested/slug', true],
    ['/about/naveen-portrait.jpg', false],
    ['/about/gifs/s1.gif', false],
  ]
  for (const [path, should] of cases) {
    const hit = ABOUT_REDIRECTS.some((rule) => rule.pattern.test(path))
    if (hit !== should) {
      throw new Error(`${path} match=${hit}, expected ${should}`)
    }
  }
  if (!ABOUT_REDIRECTS[1].pattern.test('/about/old-slug/')) {
    throw new Error('/about/old-slug/ should redirect')
  }
  if (ABOUT_REDIRECTS[0].pattern.test('/about/old-slug/')) {
    throw new Error('/about/old-slug/ should use the trailing-slash rule only')
  }
}
