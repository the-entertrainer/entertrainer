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
import { chromium } from 'playwright-core'

const probe = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e', `
import { tierAfterProbe } from './composables/world/classifyTier.ts'
import { routeFor, WORLD_ZONE_LINKS } from './composables/world/worldRoutes.ts'
const fail = (m) => { console.error(m); process.exit(1) }
if (routeFor('dialogue') !== '/dialogue') fail('dialogue route must be /dialogue')
if (WORLD_ZONE_LINKS.some((l) => l.route.endsWith('/') && l.route !== '/')) fail('trailing slash in WORLD_ZONE_LINKS')
const labels = WORLD_ZONE_LINKS.map((l) => l.label).join(',')
if (labels !== 'Nexus,Elevate,Empower,Engage,Learn,Work,Dialogue,About,Archive') fail('ZoneLinks order ' + labels)
const pinned = tierAfterProbe(3, 40, true)
if (pinned.tier !== 3) fail('pinned tier 3 must stay')
const post = tierAfterProbe(3, 40.5, false)
if (post.tier !== 2) fail('tier 3 at 40fps must drop to 2, got ' + post.tier)
const ok = tierAfterProbe(3, 60, false)
if (ok.tier !== 3) fail('tier 3 at 60fps must stay')
const low = tierAfterProbe(2, 20, false)
if (low.tier !== 1) fail('under 28fps must drop one tier')
console.log('tier and ZoneLinks checks ok')
`], { stdio: 'inherit' })
if (probe.status !== 0) process.exit(probe.status ?? 1)

const base = process.env.BASE_URL || 'http://127.0.0.1:3000'
const browser = await chromium.launch({
  executablePath: process.env.CHROME || '/usr/bin/google-chrome',
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
})

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
if (focused.errors.length || timeout.errors.length || restore.errors.length) {
  console.error('page errors', restore.errors, timeout.errors, focused.errors)
  process.exit(1)
}
await browser.close()
console.log('world-context-loss ok')
