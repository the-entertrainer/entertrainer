import { expect, test } from '@playwright/test'
import fs from 'node:fs'

const VENDOR = [
  '/dialogue/vendor/konva-10.9.1.min.js',
  '/dialogue/vendor/dexie-4.4.7.js',
  '/dialogue/vendor/jszip-3.10.1.min.js',
  '/dialogue/vendor/jspdf-2.5.1.umd.min.js',
  '/dialogue/vendor/filesaver-2.0.5.min.js',
]

function trackConsole(page) {
  const errors = []
  page.on('pageerror', (err) => errors.push(err.message))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  return errors
}

function trackVendors(page) {
  const seen = new Map()
  page.on('response', (res) => {
    const url = new URL(res.url())
    if (VENDOR.includes(url.pathname)) seen.set(url.pathname, res.status())
  })
  return seen
}

test('index.html redirects to /dialogue in one hop', async ({ request }) => {
  for (const path of ['/dialogue/index.html', '/dialogue/index.html/']) {
    const res = await request.get(path, { maxRedirects: 0 })
    expect(res.status(), path).toBe(301)
    const location = res.headers().location || ''
    expect(location.endsWith('/dialogue'), location).toBe(true)
    expect(location.includes('index.html'), location).toBe(false)
    const next = await request.get(location, { maxRedirects: 0 })
    expect(next.status(), location).toBe(200)
  }
})

test('dialogue canvas renders with vendored libraries and no load error', async ({ page }) => {
  const errors = trackConsole(page)
  const vendors = trackVendors(page)

  await page.goto('/dialogue')
  await expect(page.locator('.dlg-load-error')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '＋ New comic' })).toBeVisible()

  await page.getByRole('button', { name: '＋ New comic' }).click()
  await page.getByRole('button', { name: 'Create' }).click()
  await page.waitForURL(/\/dialogue\/c\//)
  await expect(page.locator('.dlg-load-error')).toHaveCount(0)
  await expect(page.locator('canvas').first()).toBeVisible()

  for (const src of VENDOR) {
    expect(vendors.get(src), src).toBe(200)
  }
  expect(errors).toEqual([])

  await page.getByRole('button', { name: 'Export' }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'PDF' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  const file = await download.path()
  const buf = fs.readFileSync(file)
  expect(buf.subarray(0, 5).toString()).toBe('%PDF-')
  expect(buf.length).toBeGreaterThan(100)
  await expect(page.locator('#export-sheet p')).toHaveText('Done')
})

test('retry after a failed load runs the loader again', async ({ page }) => {
  let failedOnce = false
  await page.route('**/dialogue/vendor/dexie-4.4.7.js', async (route) => {
    if (!failedOnce) {
      failedOnce = true
      await route.abort()
      return
    }
    await route.continue()
  })

  await page.goto('/dialogue/new')
  await page.getByRole('button', { name: 'Create' }).click()
  await expect(page.locator('.dlg-load-error')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()

  await page.getByRole('button', { name: 'Retry' }).click()
  await page.waitForURL(/\/dialogue\/c\//)
  await expect(page.locator('.dlg-load-error')).toHaveCount(0)
  await expect(page.locator('canvas').first()).toBeVisible()
})
