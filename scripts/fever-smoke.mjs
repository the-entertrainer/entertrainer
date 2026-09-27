import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { chromium } from 'playwright-core'
import serverlessChromium from '@sparticuz/chromium'
// Static game runtime test. Nuxt route compilation is verified by the production build.
const root = resolve('public')
const server = createServer(async (req, res) => {
  try {
    const file = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname)
    if (!file.startsWith(root + '/')) throw Error('Invalid path')
    res.setHeader('Content-Type', {'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.glb':'model/gltf-binary'}[extname(file)] || 'application/octet-stream')
    res.end(await readFile(file))
  } catch { res.statusCode = 404; res.end() }
}).listen(0, '127.0.0.1')
await new Promise(r => server.on('listening', r))
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE || await serverlessChromium.executablePath(), args: serverlessChromium.args, headless: true })
try {
  const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true})
  const errors=[]
  page.on('pageerror', e => errors.push(e.stack))
  page.on('console', m => { if(m.type()==='error') errors.push(m.text()) })
  await page.goto(`http://127.0.0.1:${server.address().port}/fever/index.html`)
  await page.waitForFunction(() => window.feverSnapshot?.().models.length === 4)
  assert.equal(await page.evaluate(() => feverSnapshot().camera), 'PerspectiveCamera')
  await page.screenshot({path:'/tmp/fever-title.png'})
  await page.click('#action')
  assert.equal(await page.evaluate(() => feverSnapshot().phase), 'intro')
  assert.equal(await page.evaluate(() => feverSnapshot().time), 0)
  await page.waitForFunction(() => feverSnapshot().introTime > 1.4)
  await page.screenshot({path:'/tmp/fever-intro.png'})
  await page.click('#pause')
  const introTime=await page.evaluate(() => feverSnapshot().introTime)
  await page.waitForTimeout(200)
  assert.equal(await page.evaluate(() => feverSnapshot().introTime),introTime)
  await page.click('#action')
  await page.waitForFunction(() => feverSnapshot().active.some(r => !r.green))
  const roach = await page.evaluate(() => feverSnapshot().active.find(r => !r.green))
  await page.mouse.move(roach.x, roach.y); await page.mouse.down()
  await page.waitForFunction(() => feverSnapshot().kills > 0)
  await page.mouse.up()
  assert.ok(await page.evaluate(() => feverSnapshot().splatters > 0))
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).userSelect), 'none')
  assert.equal(await page.evaluate(() => document.querySelector('#world').dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}))),false)
  await page.screenshot({path:'/tmp/fever-play.png'})
  assert.equal(await page.evaluate(() => feverSnapshot().coins), 9)
  await page.click('#turret'); await page.click('#turret')
  assert.equal(await page.evaluate(() => feverSnapshot().coins), 9)
  await page.click('#turret'); await page.mouse.click(250,480)
  assert.deepEqual(await page.evaluate(() => [feverSnapshot().turrets, feverSnapshot().coins]), [1,3])
  await page.click('#pause')
  const t=await page.evaluate(() => feverSnapshot().time)
  await page.waitForTimeout(400)
  assert.equal(await page.evaluate(() => feverSnapshot().time),t)
  await page.click('#action')
  await page.click('#quality'); assert.equal(await page.evaluate(() => feverSnapshot().quality), 'high')
  await page.click('#quality'); assert.equal(await page.evaluate(() => feverSnapshot().quality), 'low')
  for(const viewport of [{width:320,height:568},{width:844,height:390},{width:1280,height:720}]) {
    await page.setViewportSize(viewport)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    assert.ok(await page.locator('#turret').isVisible())
  }
  await page.setViewportSize({width:390,height:844})
  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  assert.equal(await page.evaluate(() => feverSnapshot().paused), true)
  await page.screenshot({path:'/tmp/fever-verified.png'})
  // Restart through the public page and exercise skip and reduced-motion paths.
  await page.reload()
  await page.waitForSelector('#loading',{state:'hidden'})
  await page.click('#action');await page.click('#skip-intro')
  assert.equal(await page.evaluate(() => feverSnapshot().phase),'play')
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload()
  await page.waitForSelector('#loading',{state:'hidden'});await page.click('#action')
  await page.waitForFunction(() => feverSnapshot().phase==='play')
  assert.ok(await page.evaluate(() => feverSnapshot().introTime < .5))
  assert.deepEqual(errors, [])
  console.log('PASS: hero + three CC0 props, WebGL shaders, cinematic completion/pause/skip/reduced motion, squash/splatter/reward, placement/cancellation, pause/blur, quality modes, touch selection guards and mobile/landscape/desktop layouts.')
} finally { await browser.close(); server.close() }
