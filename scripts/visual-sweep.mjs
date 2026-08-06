/**
 * Visual regression sweep.
 *
 * Loads every real route across the full width ladder in both themes,
 * screenshots each, and asserts the things a screenshot alone will not tell you:
 * horizontal overflow, elements escaping the viewport, sub-44px touch targets,
 * and images whose CSS box discards most of their source frame.
 *
 * That last check exists because the About hero spent a long time forcing a 16:9
 * source into a 4:5 frame — throwing away well over half the image, lettering
 * included — and no amount of looking at screenshots caught it. The earlier
 * version of this script checked three widths for overflow only, and reported
 * PASS the entire time.
 *
 * Usage:  npm run dev            (in another shell)
 *         npm run sweep          (or: node scripts/visual-sweep.mjs [outDir])
 *         SWEEP_QUICK=1 npm run sweep     — three widths, light theme only
 */
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const OUT = process.argv[2] || '.sweep'
const BASE = process.env.SWEEP_BASE || 'http://localhost:3000'
const EXEC = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const QUICK = !!process.env.SWEEP_QUICK

const ROUTES = [
  ['home', '/'], ['about', '/about'], ['id', '/instructional-design'],
  ['my-work', '/my-work'], ['sewa', '/my-work/sewa-chronicles'], ['strong', '/my-work/strong'],
  ['tools', '/tools'], ['easymcq', '/tools/easymcq'], ['cadence', '/tools/cadence'],
  ['draftly', '/tools/better-emails'], ['storygen', '/tools/storygen'],
  ['lab', '/lab'], ['404', '/this-route-does-not-exist']
]

/** [tag, width, height, isPhone]. The landscape entries are the ones that catch
 *  short-viewport bugs — a landscape phone is not a narrow screen, and every
 *  max-width breakpoint in the codebase misses it. */
const VIEWPORTS = QUICK
  ? [['p390', 390, 844, true], ['t768', 768, 1024, false], ['d1440', 1440, 900, false]]
  : [
      ['p320', 320, 568, true],   // the floor: iPhone SE / small Android
      ['p360', 360, 780, true],
      ['p390', 390, 844, true],
      ['p430', 430, 932, true],
      ['l844', 844, 390, true],   // landscape phone
      ['l926', 926, 428, true],   // landscape phone, above the 900 collapse
      ['t768', 768, 1024, false],
      ['t834', 834, 1112, false],
      ['t1024', 1024, 1366, false],
      ['d1280', 1280, 800, false],
      ['d1440', 1440, 900, false],
      ['d1680', 1680, 1050, false],
      ['w1920', 1920, 1080, false],
      ['w2560', 2560, 1440, false]
    ]
const THEMES = QUICK ? ['light'] : ['light', 'dark']

/** Runs in the page. Returns every assertion failure it can see. */
const AUDIT = () => {
  const problems = []
  const vw = document.documentElement.clientWidth

  const overflow = document.documentElement.scrollWidth - vw
  if (overflow > 0) problems.push(`h-overflow ${overflow}px`)

  const name = (el) => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim()
    ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '')

  /** Painted at all — including because of an ancestor. The menu hides its links
   *  with `gsap.set(items, { opacity: 0 })` on a panel that is still laid out,
   *  so checking the element alone reports invisible controls as real ones. */
  const isPainted = (el) => {
    for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a)
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false
    }
    return true
  }

  /**
   * The rect a user can actually see.
   *
   * getBoundingClientRect() reports geometry regardless of whether an ancestor
   * clips it, so a closed menu panel (48px circle, overflow:hidden) full of
   * full-width links, or a visually-hidden skip-nav, both look like they are
   * hanging off the edge of the screen when nothing is painted there at all.
   * Intersecting with every clipping ancestor is what makes this check
   * trustworthy — without it the sweep cries wolf on every page and stops
   * being read.
   */
  const visibleRect = (el) => {
    let r = el.getBoundingClientRect()
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a)
      const clips = cs.overflow !== 'visible' || cs.clipPath !== 'none' || cs.contain.includes('paint')
      if (!clips) continue
      const ar = a.getBoundingClientRect()
      const left = Math.max(r.left, ar.left), right = Math.min(r.right, ar.right)
      const top = Math.max(r.top, ar.top), bottom = Math.min(r.bottom, ar.bottom)
      if (right <= left || bottom <= top) return null
      r = { left, right, top, bottom, width: right - left, height: bottom - top }
    }
    return r
  }

  // Anything sticking out past an edge, named so it is findable.
  const escapees = []
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)
    if (!isPainted(el)) continue
    if (cs.pointerEvents === 'none' && cs.position === 'fixed') continue  // decorative backdrops
    const r = visibleRect(el)
    if (!r || r.width < 1 || r.height < 1) continue
    if (r.right > vw + 1 || r.left < -1) {
      const id = name(el)
      if (!escapees.includes(id)) escapees.push(id)
    }
  }
  if (escapees.length) problems.push(`escapes viewport: ${escapees.slice(0, 5).join(', ')}`)

  // Touch targets, only where a coarse pointer is plausible.
  if (matchMedia('(pointer: coarse)').matches) {
    const small = []
    for (const el of document.querySelectorAll('a[href], button, [role="button"], [role="switch"], input, select, summary')) {
      if (!isPainted(el)) continue
      const r = visibleRect(el)
      if (!r || r.width < 1 || r.height < 1) continue
      if (r.height < 44 || r.width < 24) {
        const entry = `${name(el)} ${Math.round(r.width)}x${Math.round(r.height)}`
        if (!small.includes(entry)) small.push(entry)
      }
    }
    if (small.length) problems.push(`touch<44: ${small.slice(0, 6).join(', ')}`)
  }

  // Images whose rendered box throws away a large share of the source frame.
  const cropped = []
  for (const img of document.querySelectorAll('img')) {
    if (!img.naturalWidth || !img.naturalHeight) continue
    const r = img.getBoundingClientRect()
    if (r.width < 40 || r.height < 40) continue
    if (getComputedStyle(img).objectFit !== 'cover') continue
    const srcAR = img.naturalWidth / img.naturalHeight
    const boxAR = r.width / r.height
    // Share of the source still visible once `cover` has cropped it.
    const visible = srcAR > boxAR ? boxAR / srcAR : srcAR / boxAR
    if (visible < 0.62) {
      cropped.push(`${img.getAttribute('src')?.split('/').pop()} shows ${Math.round(visible * 100)}%`)
    }
  }
  if (cropped.length) problems.push(`over-cropped: ${cropped.slice(0, 4).join(', ')}`)

  return problems
}

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({
  executablePath: EXEC,
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox']
})

let failures = 0
let checked = 0
for (const theme of THEMES) {
  for (const [vp, width, height, isPhone] of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width, height }, colorScheme: theme,
      isMobile: isPhone, hasTouch: isPhone
    })
    for (const [name, route] of ROUTES) {
      const page = await ctx.newPage()
      const errors = []
      page.on('pageerror', e => errors.push(e.message))
      try {
        await page.goto(BASE + route, { waitUntil: 'load', timeout: 30000 })
        await page.waitForTimeout(name === 'home' ? 7000 : 1500)
        await page.screenshot({ path: `${OUT}/${theme}-${vp}-${name}.png` })
        const problems = await page.evaluate(AUDIT)
        if (errors.length) problems.push(`js: ${errors[0]}`)
        checked++
        if (problems.length) {
          failures++
          console.log(`FAIL ${theme}/${vp}/${name.padEnd(9)} ${problems.join(' | ')}`)
        }
      } catch (err) {
        failures++
        console.log(`FAIL ${theme}/${vp}/${name.padEnd(9)} ${err.message.split('\n')[0]}`)
      }
      await page.close()
    }
    console.log(`  done ${theme}/${vp}`)
    await ctx.close()
  }
}
await browser.close()
console.log(failures
  ? `\n${failures} of ${checked} combinations have problems`
  : `\nall ${checked} combinations clean`)
process.exit(failures ? 1 : 0)
