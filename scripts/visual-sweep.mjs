/**
 * Visual regression sweep.
 *
 * Loads every real route in both themes at three widths, screenshots each, and
 * fails on page errors or horizontal overflow. This exists because the site has
 * no tests: "it looked fine when I checked" is how a white-on-cream hamburger
 * shipped on every tool page for months.
 *
 * Usage:  npm run dev   (in another shell)
 *         node scripts/visual-sweep.mjs [outDir]
 */
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const OUT = process.argv[2] || '.sweep'
const BASE = process.env.SWEEP_BASE || 'http://localhost:3000'
const EXEC = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'

const ROUTES = [
  ['home', '/'], ['about', '/about'], ['id', '/instructional-design'],
  ['my-work', '/my-work'], ['sewa', '/my-work/sewa-chronicles'], ['strong', '/my-work/strong'],
  ['tools', '/tools'], ['easymcq', '/tools/easymcq'], ['cadence', '/tools/cadence'],
  ['draftly', '/tools/better-emails'], ['storygen', '/tools/storygen'],
  ['lab', '/lab'], ['404', '/this-route-does-not-exist']
]
const VIEWPORTS = [['m', 390, 844], ['t', 768, 1024], ['d', 1440, 900]]
const THEMES = ['light', 'dark']

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({
  executablePath: EXEC,
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox']
})

let failures = 0
for (const theme of THEMES) {
  for (const [vp, width, height] of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width, height }, colorScheme: theme,
      isMobile: vp === 'm', hasTouch: vp === 'm'
    })
    for (const [name, route] of ROUTES) {
      const page = await ctx.newPage()
      const errors = []
      page.on('pageerror', e => errors.push(e.message))
      try {
        await page.goto(BASE + route, { waitUntil: 'load', timeout: 30000 })
        // The home spiral needs its loader to melt and the helix to settle.
        await page.waitForTimeout(name === 'home' ? 7000 : 1800)
        await page.screenshot({ path: `${OUT}/${theme}-${vp}-${name}.png` })
        const overflow = await page.evaluate(() =>
          document.documentElement.scrollWidth - document.documentElement.clientWidth)
        const bad = errors.length > 0 || overflow > 0
        if (bad) {
          failures++
          console.log(`FAIL ${theme}/${vp}/${name.padEnd(9)} overflow=${overflow} ${errors.join(' | ')}`)
        }
      } catch (err) {
        failures++
        console.log(`FAIL ${theme}/${vp}/${name.padEnd(9)} ${err.message.split('\n')[0]}`)
      }
      await page.close()
    }
    console.log(`done ${theme}/${vp}`)
    await ctx.close()
  }
}
await browser.close()
console.log(failures ? `\n${failures} failing combination(s)` : '\nall combinations clean')
process.exit(failures ? 1 : 0)
