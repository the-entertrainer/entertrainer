#!/usr/bin/env node
/**
 * Proves spec §10.5 on a running / with ?tier=2&measure=1:
 *   1. lose + restore resumes the same scene and announces recovery
 *   2. lose without restore swaps to WorldFallbackPoster and removes the canvas
 *   3. a focused zone control is moved onto that anchor's poster link
 *
 *   BASE_URL=http://127.0.0.1:3000 node scripts/world-context-loss.mjs
 *
 * Tier-probe math (no browser) runs first.
 */
import { spawnSync } from 'node:child_process'

const probe = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e', `
import { probeFollowUp } from './composables/world/classifyTier.ts'
import { routeFor, WORLD_ZONE_LINKS } from './composables/world/worldRoutes.ts'
const fail = (m) => { console.error(m); process.exit(1) }
if (routeFor('dialogue') !== '/dialogue') fail('dialogue route must be /dialogue')
if (WORLD_ZONE_LINKS.some((l) => l.route.endsWith('/') && l.route !== '/')) fail('trailing slash in WORLD_ZONE_LINKS')
const labels = WORLD_ZONE_LINKS.map((l) => l.label).join(',')
if (labels !== 'Nexus,Elevate,Empower,Engage,Learn,Work,Dialogue,About,Archive') fail('ZoneLinks order ' + labels)
function chain(start, fps) {
  let tier = start
  let probing = true
  const steps = []
  while (probing && steps.length < 6) {
    const next = probeFollowUp(tier, fps, false)
    steps.push(next.tier)
    tier = next.tier
    probing = next.probing
  }
  return steps.join(',')
}
if (probeFollowUp(3, 10, true).tier !== 3 || probeFollowUp(3, 10, true).probing) fail('pinned tier must stay and not re-arm')
if (chain(3, 40) !== '2,2') fail('40fps should stop at tier 2 after one re-probe, got ' + chain(3, 40))
if (chain(3, 20) !== '2,1,0') fail('20fps should fall 3 to 2 to 1 to 0, got ' + chain(3, 20))
console.log('tier and ZoneLinks checks ok')
`], { stdio: 'inherit' })
if (probe.status !== 0) process.exit(probe.status ?? 1)

let chromium
try {
  ;({ chromium } = await import('playwright-core'))
} catch (error) {
  console.error('playwright-core is required. Install it as a devDependency.', error)
  process.exit(1)
}

const base = process.env.BASE_URL || 'http://127.0.0.1:3000'
let browser
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROME || '/usr/bin/google-chrome',
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  })
} catch (error) {
  console.error('Could not launch the browser. This script does not skip.', error)
  process.exit(1)
}

async function open() {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  const errors = []
  page.on('pageerror', (err) => errors.push(String(err)))
  await page.goto(`${base}/?tier=2&measure=1`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForSelector('[data-loop="running"]', { timeout: 20000 })
  const notNow = page.getByRole('button', { name: 'Not now' })
  if (await notNow.count()) await notNow.click()
  return { page, errors }
}

function state(page) {
  return page.evaluate(() => {
    const stage = document.querySelector('.world-shell')
    const canvas = document.querySelector('canvas')
    return {
      tier: stage?.dataset.tier,
      context: stage?.dataset.context,
      loop: stage?.dataset.loop,
      zone: stage?.dataset.zone,
      status: document.getElementById('world-status')?.textContent?.trim() || '',
      note: document.querySelector('.fallback__note')?.textContent?.trim() || '',
      canvas: canvas ? getComputedStyle(canvas).display : 'removed',
      focus: document.activeElement?.getAttribute('data-zone-link')
        || document.activeElement?.id
        || document.activeElement?.tagName,
    }
  })
}

const restore = await open()
await restore.page.evaluate(() => window.__satya.lose())
await restore.page.waitForTimeout(80)
await restore.page.evaluate(() => window.__satya.restore())
await restore.page.waitForFunction(() => document.getElementById('world-status')?.textContent?.includes('back'), { timeout: 4000 })
const restored = await state(restore.page)
if (restored.tier === '0' || restored.canvas === 'none' || restored.canvas === 'removed') {
  console.error('restore did not keep the scene', restored)
  process.exit(1)
}
if (!restored.status.includes('The 3D view is back.')) {
  console.error('missing restore announcement', restored)
  process.exit(1)
}
console.log('restore ok', restored)
await restore.page.close()

const timeout = await open()
await timeout.page.evaluate(() => window.__satya.lose())
await timeout.page.waitForFunction(() => document.querySelector('.world-shell')?.dataset.tier === '0', { timeout: 4000 })
const lost = await state(timeout.page)
if (lost.canvas !== 'removed' && lost.canvas !== 'none') {
  console.error('canvas still in the page', lost)
  process.exit(1)
}
if (!lost.note.includes('The 3D view stopped.')) {
  console.error('poster copy', lost)
  process.exit(1)
}
if (lost.focus !== 'nexus-motto') {
  console.error('expected poster heading focus', lost)
  process.exit(1)
}
console.log('timeout teardown ok', lost)
await timeout.page.close()

const focused = await open()
await focused.page.getByRole('button', { name: 'Engage', exact: true }).focus()
await focused.page.evaluate(() => window.__satya.lose())
await focused.page.waitForFunction(() => document.querySelector('.world-shell')?.dataset.tier === '0', { timeout: 4000 })
const kept = await state(focused.page)
if (kept.focus !== 'engage') {
  console.error('expected Engage poster link focused', kept)
  process.exit(1)
}
console.log('anchor focus ok', kept)

async function dismissMotion(page) {
  const notNow = page.getByRole('button', { name: 'Not now' })
  if (await notNow.count()) await notNow.click()
}

async function spoofFlagship(page) {
  await page.addInitScript(() => {
    try {
      Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, get: () => 16 })
    } catch { /* already exposed */ }
    try {
      Object.defineProperty(navigator, 'deviceMemory', { configurable: true, get: () => 8 })
    } catch { /* already exposed */ }
    const orig = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, attrs) {
      const gl = orig.call(this, type, attrs)
      if (!gl || gl.__satyaSpoof || (type !== 'webgl' && type !== 'webgl2')) return gl
      const getParameter = gl.getParameter.bind(gl)
      const ext = gl.getExtension('WEBGL_debug_renderer_info')
      gl.getParameter = (pname) => {
        const renderer = ext ? ext.UNMASKED_RENDERER_WEBGL : 0x9246
        const vendor = ext ? ext.UNMASKED_VENDOR_WEBGL : 0x9245
        if (pname === renderer) return 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)'
        if (pname === vendor) return 'Google Inc. (NVIDIA)'
        return getParameter(pname)
      }
      gl.__satyaSpoof = true
      return gl
    }
  })
}

function track(page) {
  const errors = []
  page.on('pageerror', (err) => errors.push(String(err)))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  return errors
}

async function liveFrame(page, tier) {
  await page.waitForFunction((want) => {
    const stage = document.querySelector('.world-shell')
    const canvas = stage?.querySelector('canvas')
    const gl = canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    return stage?.dataset.tier === want
      && stage.dataset.loop === 'running'
      && Number(stage.dataset.calls) > 0
      && canvas
      && gl
      && !gl.isContextLost()
  }, tier, { timeout: 20000 })
}

async function flagshipPage(path) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
  const errors = track(page)
  const client = await page.context().newCDPSession(page)
  await client.send('Emulation.setHardwareConcurrencyOverride', { hardwareConcurrency: 16 })
  await spoofFlagship(page)
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle', timeout: 60000 })
  await dismissMotion(page)
  return { page, errors }
}

try {
  const map = await open()
  await map.page.getByRole('button', { name: 'Map', exact: true }).click()
  await map.page.waitForSelector('#satya-map-title')
  await map.page.keyboard.press('Escape')
  await map.page.waitForFunction(() => document.activeElement?.hasAttribute('data-map-button'))
  await map.page.getByRole('button', { name: 'Map', exact: true }).click()
  await map.page.waitForSelector('#satya-map-title')
  await map.page.getByRole('button', { name: 'Close', exact: true }).click()
  await map.page.waitForFunction(() => document.activeElement?.hasAttribute('data-map-button'))
  console.log('map focus returns to the Map button')

  const redirects = []
  map.page.on('response', (res) => {
    const status = res.status()
    if (status >= 300 && status < 400 && res.url().includes('/dialogue')) {
      redirects.push({ status, url: res.url(), location: res.headers()['location'] || '' })
    }
  })
  await map.page.getByRole('button', { name: 'Dialogue', exact: true }).click()
  await map.page.waitForURL((url) => url.pathname === '/dialogue', { timeout: 20000 })
  if (redirects.length) {
    console.error('Dialogue link redirected', redirects)
    process.exit(1)
  }
  console.log('dialogue link ok', map.page.url())
  await map.page.close()

  const probe = await flagshipPage('/?measure=1')
  const started = await state(probe.page)
  if (started.tier !== '2') {
    console.error('spoofed flagship should start at tier 2', started)
    process.exit(1)
  }
  await liveFrame(probe.page, '2')
  await probe.page.evaluate(() => window.__satya.applyProbe(20))
  await liveFrame(probe.page, '1')
  await probe.page.waitForFunction(() => {
    const stage = document.querySelector('.world-shell')
    const canvas = stage?.querySelector('canvas')
    const gl = canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    return stage?.dataset.tier === '1'
      && stage.dataset.probing === 'false'
      && Number(stage.dataset.fps) >= 28
      && stage.dataset.loop === 'running'
      && Number(stage.dataset.calls) > 0
      && gl
      && !gl.isContextLost()
  }, { timeout: 20000 })
  await liveFrame(probe.page, '1')
  if (probe.errors.length) {
    console.error('probe drop 2 to 1 logged errors', probe.errors)
    process.exit(1)
  }
  console.log('probe drop 2 to 1 rendered', await state(probe.page))
  await probe.page.close()

  const quality = await flagshipPage('/')
  await liveFrame(quality.page, '2')
  await quality.page.getByRole('button', { name: 'Quality: Standard' }).click()
  await liveFrame(quality.page, '3')
  await quality.page.waitForFunction(() => {
    const stage = document.querySelector('.world-shell')
    const canvas = stage?.querySelector('canvas')
    const gl = canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    const tier = stage?.dataset.tier
    return (tier === '2' || tier === '3')
      && stage?.dataset.probing === 'false'
      && stage?.dataset.loop === 'running'
      && Number(stage?.dataset.calls) > 0
      && stage?.dataset.fps !== ''
      && gl
      && !gl.isContextLost()
  }, { timeout: 20000 })
  const end = await quality.page.evaluate(() => {
    const stage = document.querySelector('.world-shell')
    const canvas = stage?.querySelector('canvas')
    const gl = canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    return {
      tier: stage?.dataset.tier,
      loop: stage?.dataset.loop,
      calls: Number(stage?.dataset.calls || 0),
      fps: stage?.dataset.fps,
      lost: !gl || gl.isContextLost(),
    }
  })
  if (end.tier === '0' || end.loop !== 'running' || end.calls < 1 || end.lost) {
    console.error('quality toggle did not keep a rendering frame', end)
    process.exit(1)
  }
  if (quality.errors.length) {
    console.error('quality toggle logged errors', quality.errors)
    process.exit(1)
  }
  console.log('quality toggle 2 to 3 rendered', end)
  await quality.page.close()

  const api = await browser.newContext()
  const bare = await api.request.get(`${base}/dialogue`, { maxRedirects: 0 })
  const bareLocation = bare.headers()['location'] || ''
  if (bare.status() !== 200 || bareLocation) {
    console.error('GET /dialogue should be 200 with no redirect', bare.status(), bareLocation)
    process.exit(1)
  }
  const slash = await api.request.get(`${base}/dialogue/`, { maxRedirects: 0 })
  const slashLocation = slash.headers()['location'] || ''
  if (slash.status() !== 301 || new URL(slashLocation, base).pathname !== '/dialogue') {
    console.error('GET /dialogue/ should be a single 301 to /dialogue', slash.status(), slashLocation)
    process.exit(1)
  }
  console.log('dialogue document routes ok')
  await api.close()

  if (focused.errors.length || timeout.errors.length || restore.errors.length || map.errors.length) {
    console.error('page errors', restore.errors, timeout.errors, focused.errors, map.errors)
    process.exit(1)
  }
  console.log('world-context-loss ok')
} catch (error) {
  console.error('world-context-loss failed', error)
  process.exitCode = 1
} finally {
  await browser.close()
}
process.exit(process.exitCode || 0)
