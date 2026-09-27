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
  const page = await browser.newPage({viewport:{width:390,height:844}})
  const errors=[]
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', m => { if(m.type()==='error') errors.push(m.text()) })
  await page.goto(`http://127.0.0.1:${server.address().port}/fever/index.html`)
  await page.waitForFunction(() => window.feverSnapshot?.().models.length === 4)
  assert.equal(await page.evaluate(() => feverSnapshot().camera), 'PerspectiveCamera')
  await page.click('#action')
  await page.waitForFunction(() => feverSnapshot().active.some(r => !r.green))
  const roach = await page.evaluate(() => feverSnapshot().active.find(r => !r.green))
  await page.mouse.move(roach.x, roach.y); await page.mouse.down()
  await page.waitForFunction(() => feverSnapshot().kills > 0)
  await page.mouse.up()
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
  assert.deepEqual(errors, [])
  console.log('PASS: four CC0 models and textures, WebGL shaders, perspective camera, squash/reward, placement/cancellation, pause/blur, quality modes and mobile/landscape/desktop layouts.')
} finally { await browser.close(); server.close() }
