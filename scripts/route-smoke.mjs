#!/usr/bin/env node
/**
 * Route smoke test for every public route the redesign must keep.
 *
 * Visits each route at 390, 768 and 1440 wide in light, dark and reduced
 * motion. For each visit it checks the HTTP status (or the redirect target),
 * collects console errors (hydration mismatches included), measures horizontal
 * overflow, and saves a screenshot.
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 npm run smoke:routes
 *   npm run smoke:routes -- --quick        (390 + 1440, light only)
 *   npm run smoke:routes -- --only=/,/elevate
 *   SMOKE_OUT=docs/redesign/after npm run smoke:routes
 *
 * Uses playwright-core (already a dependency). Set CHROME_PATH when no
 * Playwright browser is installed; otherwise it tries the system Chrome.
 */
import { chromium } from 'playwright-core'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const OUT = process.env.SMOKE_OUT || 'artifacts/route-smoke'
const args = process.argv.slice(2)
const quick = args.includes('--quick')
const noShots = args.includes('--no-shots')
const onlyArg = args.find(a => a.startsWith('--only='))
const only = onlyArg ? onlyArg.slice(7).split(',') : null

const ESSAYS = [
  'jamais-vu-why-words-stop-meaning-anything',
  'one-equals-two-lets-break-maths',
  'tajjalan',
  'the-midpoint-of-your-life-isnt-40-its-18',
  'what-each-sacred-frequency-is-for',
  'why-isnt-the-moon-moonly',
  'you-are-absolutely-right',
  'you-are-not-lazy-you-are-helping-the-universe-extend-its-life',
  'you-only-find-out-when-you-have-to-explain-it',
  'your-mouth-can-be-sure-for-reasons-your-eyes-never-had'
]

/** [path, expected status, expected final path (for redirects)] */
const ROUTES = [
  ['/', 200],
  ['/elevate', 200],
  ...ESSAYS.map(s => [`/elevate/${s}`, 200]),
  ['/empower', 200],
  ['/engage', 200],
  ['/about', 200],
  ['/colophon', 200],
  ['/lessons', 200],
  ['/lab', 200],
  ['/compose', 200],
  ['/tools/easymcq', 200],
  ['/tools/better-emails', 200],
  ['/tools/cadence', 200],
  ['/tools/storygen', 200],
  ['/downloads/templates', 200],
  ['/dialogue/', 200],
  ['/dialogue/library', 200],
  ['/lab/g01', 200],
  ['/lab/g15', 200],
  ['/glass-lab', 200],
  ['/my-work/strong', 200],
  ['/my-work/sewa-chronicles', 200],
  ['/courses/ai-atlas', 200],
  ['/instructional-design', 200],
  ['/empower/aim', 200],
  ['/empower/plain', 200],
  ['/empower/cue', 200],
  ['/engage/ladder', 200],
  ['/engage/pairs', 200],
  ['/engage/steps', 200],
  ['/engage/stack', 200],
  ['/engage/read-my-mind', 200],
  ['/engage/astroclock', 200],
  ['/engage/whatto', 200],
  // Redirects
  ['/my-work', 200, '/about'],
  ['/downloads', 200, '/'],
  ['/blogs', 200, '/elevate'],
  ['/tools', 200, '/empower'],
  ['/games', 200, '/engage'],
  ['/engage/squash', 200, '/engage'],
  ['/tools/training-cal-gen', 200, '/tools/cadence'],
  ['/elevate/the-sacred-frequencies-are-not-a-scale', 200, '/elevate/what-each-sacred-frequency-is-for'],
  // Expected 404s
  ['/tools/not-a-tool', 404],
  ['/this-page-does-not-exist', 404]
]

const WIDTHS = quick ? [390, 1440] : [390, 768, 1440]
const MODES = quick ? ['light'] : ['light', 'dark', 'reduced']

/* Console noise that is not ours: third-party fetches that fail offline,
   and the service worker in a throwaway profile. Everything else counts. */
const IGNORE = [
  /Failed to load resource: the server responded with a status of 404/, // expected-404 routes
  /net::ERR_(INTERNET_DISCONNECTED|NAME_NOT_RESOLVED|CONNECTION_REFUSED|BLOCKED_BY_CLIENT|ABORTED)/,
  /api\.dictionaryapi\.dev|giphy|binance|fonts\.gstatic/i,
  /Failed to load resource: net::/,
  /\[vite-plugin-pwa\]|service ?worker/i,
  /AudioContext was not allowed to start/
]

function launchOpts() {
  const candidates = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']
  const exe = candidates.find(p => p && existsSync(p))
  return exe ? { executablePath: exe, headless: true } : { headless: true }
}

async function visit(browser, [path, status, finalPath], width, mode) {
  const ctx = await browser.newContext({
    viewport: { width, height: width < 600 ? 844 : width < 1000 ? 1024 : 900 },
    colorScheme: mode === 'dark' ? 'dark' : 'light',
    reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference',
    deviceScaleFactor: 1
  })
  // Skip the home preloader: it has its own check (it is the opening, not a route).
  await ctx.addInitScript(() => { try { sessionStorage.setItem('entertrainer.preloader-done', '1') } catch {} })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => {
    if (m.type() !== 'error' && !(m.type() === 'warning' && /hydrat/i.test(m.text()))) return
    const t = m.text()
    if (IGNORE.some(r => r.test(t))) return
    errors.push(`${m.type()}: ${t.slice(0, 300)}`)
  })
  page.on('pageerror', e => errors.push(`pageerror: ${String(e.message).slice(0, 300)}`))
  // Vercel serves /dialogue/ from public/dialogue/index.html; the local
  // node-server preset 308s it in a loop, so ask for the file directly there.
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(BASE)
  const target = isLocal && path === '/dialogue/' ? '/dialogue/index.html' : path
  const res = await page.goto(BASE + target, { waitUntil: 'load', timeout: 60000 }).catch(e => ({ err: e }))
  const code = res?.err ? 0 : res.status()
  await page.waitForTimeout(1500)
  const url = new URL(page.url())
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth).catch(() => -1)
  let shot = null
  if (!noShots) {
    const dir = join(OUT, mode, String(width))
    mkdirSync(dir, { recursive: true })
    shot = join(dir, (path === '/' ? 'home' : path.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '__')) + '.png')
    await page.screenshot({ path: shot, fullPage: false }).catch(() => { shot = null })
  }
  await ctx.close()
  const problems = []
  if (code !== status) problems.push(`status ${code} != ${status}`)
  if (finalPath && url.pathname.replace(/\/$/, '') !== finalPath.replace(/\/$/, '')) problems.push(`landed on ${url.pathname}, expected ${finalPath}`)
  if (overflow > 1) problems.push(`horizontal overflow ${overflow}px`)
  if (status === 200 && errors.length) problems.push(`${errors.length} console error(s)`)
  return { path, width, mode, code, final: url.pathname, overflow, errors, shot, ok: problems.length === 0, problems }
}

async function main() {
  const browser = await chromium.launch(launchOpts())
  const routes = only ? ROUTES.filter(r => only.includes(r[0])) : ROUTES
  const jobs = []
  for (const r of routes) for (const w of WIDTHS) for (const m of MODES) jobs.push([r, w, m])
  const results = []
  const CONC = Number(process.env.SMOKE_CONCURRENCY || 4)
  let i = 0
  await Promise.all(Array.from({ length: CONC }, async () => {
    while (i < jobs.length) {
      const [r, w, m] = jobs[i++]
      const out = await visit(browser, r, w, m).catch(e => ({ path: r[0], width: w, mode: m, ok: false, problems: [String(e.message || e)], errors: [] }))
      results.push(out)
      process.stdout.write(`${out.ok ? 'ok  ' : 'FAIL'} ${String(w).padStart(4)} ${m.padEnd(7)} ${r[0]}${out.ok ? '' : '  -> ' + out.problems.join('; ')}\n`)
      if (!out.ok) for (const e of out.errors || []) process.stdout.write(`       ${e}\n`)
    }
  }))
  await browser.close()
  mkdirSync(OUT, { recursive: true })
  writeFileSync(join(OUT, 'report.json'), JSON.stringify(results, null, 2))
  const failed = results.filter(r => !r.ok)
  console.log(`\n${results.length - failed.length}/${results.length} visits passed. Report: ${join(OUT, 'report.json')}`)
  process.exit(failed.length ? 1 : 0)
}

main().catch(e => { console.error(e); process.exit(1) })
