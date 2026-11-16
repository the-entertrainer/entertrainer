#!/usr/bin/env node
/**
 * Canonical host is https://www.entertrainer.in (utils/site.ts).
 * robots.txt is generated from that module.
 * /sitemap.xml is generated from the catalogs (content/visibility.ts) and
 * must use absoluteUrl() so it cannot drift onto the apex host.
 * SEO surfaces must not publish the apex host.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE_URL, renderRobotsTxt } from '../utils/site.ts'
import { assertAboutRedirects } from './about-redirect.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const APEX = 'https://entertrainer.in'
const errors = []

function fail(message) {
  errors.push(message)
}

function read(path) {
  const file = path.startsWith(root) ? path : join(root, path)
  return readFileSync(file, 'utf8')
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, out)
    else out.push(path)
  }
  return out
}

if (SITE_URL !== 'https://www.entertrainer.in') {
  fail(`SITE_URL is ${SITE_URL}`)
}

const robots = read('public/robots.txt')
if (robots !== renderRobotsTxt()) fail('public/robots.txt drifted from renderRobotsTxt()')
if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) fail('robots sitemap line')

if (existsSync(join(root, 'public/sitemap.xml'))) {
  fail('public/sitemap.xml must not exist; /sitemap.xml comes from the catalog route')
}
const visibility = read('content/visibility.ts')
const sitemapRoute = read('server/routes/sitemap.xml.ts')
if (!visibility.includes("import { absoluteUrl } from '~/utils/site'")) {
  fail('content/visibility.ts must build sitemap locs with absoluteUrl()')
}
if (!visibility.includes('absoluteUrl(page.loc)')) fail('sitemapXml must call absoluteUrl(page.loc)')
if (!sitemapRoute.includes('sitemapXml()')) fail('server/routes/sitemap.xml.ts must return sitemapXml()')
if (read('utils/site.ts').includes('renderSitemapXml')) {
  fail('utils/site.ts must not keep a second sitemap generator')
}

const seoFiles = [
  'app.vue',
  'content/social-previews.ts',
  'content/visibility.ts',
  'server/api/elevate-rss.get.ts',
  'server/routes/sitemap.xml.ts',
  'public/robots.txt',
  'public/elevate.xml',
  'nuxt.config.ts',
  ...walk(join(root, 'pages')).filter((path) => path.endsWith('.vue')),
]
for (const file of seoFiles) {
  const text = read(file)
  if (text.includes(APEX)) fail(`${file.replace(root + '/', '')} still publishes ${APEX}`)
}

const nuxtConfig = read('nuxt.config.ts')
if (!nuxtConfig.includes('siteUrl: SITE_URL')) fail('runtimeConfig.public.siteUrl must copy SITE_URL')

const vercel = JSON.parse(read('vercel.json'))
try {
  assertAboutRedirects(vercel.redirects)
} catch (error) {
  fail(error.message)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`site url ok: ${SITE_URL}`)
