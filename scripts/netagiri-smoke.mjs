import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
import serverlessChromium from '@sparticuz/chromium'

const base = process.env.NETAGIRI_BASE_URL || 'http://127.0.0.1:4173'
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_EXECUTABLE || await serverlessChromium.executablePath(),
  args: serverlessChromium.args,
  headless: true
})
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${base}/engage/netagiri`)
  const frame = await (await page.waitForSelector('iframe.netagiri-game')).contentFrame()
  await frame.waitForSelector('#start')
  await frame.evaluate(() => Promise.all(Object.values(ART).map(src => new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve()
    image.onerror = () => reject(new Error(`Image failed: ${src}`))
    image.src = src
  }))))
  await frame.click('#start')
  assert.equal(await frame.locator('[data-choice]').count(), 4)
  assert.equal(await frame.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  await frame.click('[data-choice="0"]')
  assert.deepEqual(await frame.evaluate(() => [state.week, !!state.receipt, state.ended]), [1, true, null])
  await page.reload()
  const resumed = await (await page.waitForSelector('iframe.netagiri-game')).contentFrame()
  await resumed.waitForSelector('#continue')
  assert.deepEqual(await resumed.evaluate(() => [state.week, !!state.receipt]), [1, true])
  await resumed.click('#continue')
  assert.equal(await resumed.locator('.paper h1').textContent(), 'Put money behind it')
  await resumed.click('[data-tab="mandate"]')
  assert.match(await resumed.locator('.sheet-title').textContent(), /second term/)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await resumed.click('[data-tab="desk"]')
  assert.equal(await resumed.locator('.talk').evaluate(el => getComputedStyle(el).animationName), 'none')
  const paths = await resumed.evaluate(() => {
    render = () => {}
    save = () => {}
    const results = []
    for (let target = 0; target < 4; target++) {
      state = fresh()
      state.started = true
      let prematureWin = false
      for (let week = 0; week < 260 && !state.ended; week++) {
        const card = current()
        let best = -Infinity, choice = 0
        for (let c = 0; c < 3; c++) {
          const option = card.options[c]
          const predicted = state.stats.map((n, i) => clamp(n + option.effect[i]))
          let score = predicted.reduce((sum, n) => sum + Math.log(n + 1) * 20, 0)
          const route = ROUTES[target].key
          score += option.route === route && state.counts[route] < (target < 2 ? 16 : 14) ? 2.5 : 0
          score += predicted[target] * .012
          if (score > best) { best = score; choice = c }
        }
        resolve(choice)
        state.receipt = null
        if (state.ended?.type === 'win' && state.week < 260) prematureWin = true
      }
      results.push({ target: ROUTES[target].name, week: state.week, end: state.ended, prematureWin })
    }
    state = fresh(); state.started = true; state.week = 259
    resolve(0)
    results.push({ noRecord: state.ended.type })
    state = fresh(); state.started = true; state.stats[0] = 1
    resolve(1)
    results.push({ zeroPillar: state.ended.type })
    return results
  })
  for (const path of paths.slice(0, 4)) {
    assert.equal(path.week, 260)
    assert.equal(path.end.type, 'win')
    assert.equal(path.prematureWin, false)
    assert.ok(path.end.routes.includes(path.target))
  }
  assert.equal(paths[4].noRecord, 'loss')
  assert.equal(paths[5].zeroPillar, 'collapse')
  assert.deepEqual(errors, [])
  console.log('PASS: route, artwork, mobile layout, save/resume, reduced motion, four complete winning routes, premature-win guard, election loss and collapse.')
} finally {
  await browser.close()
}
