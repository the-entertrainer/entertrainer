import { expect, test } from '@playwright/test'

const ZONES = [
  ['Nexus', '/'],
  ['Elevate', '/elevate'],
  ['Empower', '/empower'],
  ['Engage', '/engage'],
  ['Learn', '/learn'],
  ['Work', '/work'],
  ['Dialogue', '/dialogue'],
  ['About', '/about'],
  ['Archive', '/archive'],
]

test('unknown URL returns 404 with RmError and working zone links', async ({ page, request }) => {
  const direct = await request.get('/this-dock-is-not-on-the-map', { maxRedirects: 0 })
  expect(direct.status()).toBe(404)

  const res = await page.goto('/this-dock-is-not-on-the-map')
  expect(res?.status()).toBe(404)

  const error = page.locator('[data-rm-error]')
  await expect(error).toBeVisible()
  await expect(error).toHaveAttribute('data-status', '404')
  await expect(page.getByRole('heading', { level: 1, name: 'This dock is empty.' })).toBeVisible()
  await expect(page.getByText('That address is not on the map.')).toBeVisible()
  await expect(page.locator('a[href="#main"]')).toHaveCount(1)
  await expect(page.locator('#main')).toBeVisible()

  for (const [label, href] of ZONES) {
    const link = page.getByRole('link', { name: label, exact: true })
    await expect(link).toHaveAttribute('href', href)
    expect(href === '/' || !href.endsWith('/'), href).toBe(true)
  }
  await expect(page.getByRole('link', { name: 'Open map', exact: true })).toHaveAttribute('href', '/')

  await page.getByRole('link', { name: 'Elevate', exact: true }).click()
  await expect(page).toHaveURL(/\/elevate$/)
  await expect(page.locator('[data-reading-layout]')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Back to world' })).toHaveAttribute('href', '/?at=elevate')
})

test('an essay renders in Reading Mode', async ({ page }) => {
  const res = await page.goto('/elevate/tajjalan')
  expect(res?.status()).toBe(200)
  const frame = page.locator('[data-reading-layout]')
  await expect(frame).toBeVisible()
  await expect(frame).toHaveAttribute('data-reading-anchor', 'elevate')
  await expect(frame).toHaveAttribute('data-measure', '66ch')
  await expect(page.getByRole('link', { name: 'Back to world' })).toHaveAttribute('href', '/?at=elevate')
  await expect(page.locator('#main')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('a[href$="/dialogue/"]')).toHaveCount(0)
})

test('a tool renders in Reading Mode', async ({ page }) => {
  const res = await page.goto('/tools/cadence')
  expect(res?.status()).toBe(200)
  const frame = page.locator('[data-reading-layout]')
  await expect(frame).toBeVisible()
  await expect(frame).toHaveAttribute('data-reading-anchor', 'empower')
  await expect(page.getByRole('link', { name: 'Back to world' })).toHaveAttribute('href', '/?at=empower')
  await expect(page.locator('#main')).toBeVisible()
  await expect(page.getByText('Cadence', { exact: true })).toBeVisible()
  await expect(page).toHaveURL(/\/tools\/cadence$/)
})
