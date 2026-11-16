import { expect, test } from '@playwright/test'

const UNLISTED = [
  '/elevate/tajjalan',
  '/elevate/are-72-432-and-25920-clues-or-just-numbers-we-learned-to-notice',
  '/empower/plain-speak',
  '/empower/decision-matrix',
  '/tools/cadence',
  '/tools/storygen',
  '/tools/id-workflow',
  '/engage/read-my-mind',
  '/engage/astroclock',
  '/engage/whatto',
]

test('Elevate index keeps a single listed essay', async ({ page }) => {
  await page.goto('/elevate')
  await expect(page.getByRole('heading', { level: 1, name: 'Elevate' })).toBeVisible()
  await expect(page.getByRole('link', { name: /1=2: Let’s break maths/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Why hot tea goes cold/ })).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Are we in a simulation/ })).toHaveCount(0)
  await expect(page.locator('.elevate__list--solo')).toBeVisible()
  await expect(page.locator('.elevate__row')).toHaveCount(1)
})

test('Empower hub is one Course Studio card', async ({ page }) => {
  await page.goto('/empower')
  await expect(page.getByRole('heading', { level: 1, name: 'Empower' })).toBeVisible()
  const studio = page.locator('a[href="/tools/elearn-author"]')
  await expect(studio).toBeVisible()
  await expect(studio).toContainText('Course Studio')
  await expect(page.locator('.em-solo')).toBeVisible()
  await expect(page.locator('.em-groups a')).toHaveCount(0)
})

test('Engage hub lists Stack only', async ({ page }) => {
  await page.goto('/engage')
  await expect(page.getByRole('heading', { level: 1, name: 'Engage' })).toBeVisible()
  await expect(page.locator('a[href="/engage/stack"]')).toBeVisible()
  await expect(page.getByRole('link', { name: /The Mind Reader/ })).toHaveCount(0)
  await expect(page.getByRole('link', { name: /AstroClock/ })).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Whatto/ })).toHaveCount(0)
  await expect(page.locator('.engage__step')).toHaveCount(1)
  await expect(page.locator('.engage__step-no')).toHaveCount(0)
})

test('Learn index hides the unlisted workflow', async ({ page }) => {
  await page.goto('/learn')
  await expect(page.locator('a[href="/instructional-design"]')).toBeVisible()
  await expect(page.locator('a[href="/learn/one-equals-two"]')).toBeVisible()
  await expect(page.locator('a[href="/courses/ai-atlas"]')).toBeVisible()
  await expect(page.locator('a[href="/work/strong"]')).toBeVisible()
  await expect(page.locator('a[href="/tools/id-workflow"]')).toHaveCount(0)
})

test('Course Studio has its own title and stays indexable', async ({ page }) => {
  await page.goto('/tools/elearn-author')
  await expect(page).toHaveTitle(/Course Studio/)
  await expect(page.getByRole('heading', { level: 1, name: 'Course Studio' })).toBeVisible()
  const robots = await page.locator('meta[name="robots"]').getAttribute('content')
  expect(robots ?? '').not.toMatch(/noindex/i)
  const description = await page.locator('meta[name="description"]').getAttribute('content')
  expect(description).toMatch(/lesson as JSON/i)
})

test('unlisted catalog URLs answer and carry noindex', async ({ page, request }) => {
  test.setTimeout(120_000)
  for (const path of UNLISTED) {
    const res = await request.get(path, { maxRedirects: 0 })
    expect(res.status(), path).toBe(200)
    expect(res.headers()['x-robots-tag'] || '', path).toMatch(/noindex/i)
    const html = await res.text()
    expect(html, path).toMatch(/noindex/i)
  }
  await page.goto('/elevate/tajjalan')
  const robots = await page.locator('meta[name="robots"]').first().getAttribute('content')
  expect(robots || '').toMatch(/noindex/i)
})

test('sitemap and RSS follow the listed flag', async ({ request }) => {
  const sitemapRes = await request.get('/sitemap.xml')
  expect(sitemapRes.status()).toBe(200)
  const sitemap = await sitemapRes.text()
  expect(sitemap).toContain('/tools/elearn-author')
  expect(sitemap).toContain('/engage/stack')
  expect(sitemap).toContain('/elevate/one-equals-two-lets-break-maths')
  expect(sitemap).not.toContain('/tools/cadence')
  expect(sitemap).not.toContain('/tools/storygen')
  expect(sitemap).not.toContain('/engage/astroclock')
  expect(sitemap).not.toContain('/engage/read-my-mind')
  expect(sitemap).not.toContain('/elevate/tajjalan')
  expect(sitemap).not.toContain('are-72-432-and-25920')

  const rss = await (await request.get('/api/elevate-rss')).text()
  expect(rss).toContain('/elevate/one-equals-two-lets-break-maths')
  expect(rss).not.toContain('/elevate/tajjalan')
  expect(rss).not.toContain('are-72-432-and-25920')
  const items = rss.match(/<item>/g) ?? []
  expect(items).toHaveLength(1)
})
