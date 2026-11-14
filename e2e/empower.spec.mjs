import { expect, test } from '@playwright/test'
import { PDFDocument, StandardFonts } from 'pdf-lib'

const TOOLS = [
  ['/empower/plain-speak', 'plain-speak'],
  ['/empower/goal-shaper', 'goal-shaper'],
  ['/empower/talk-track', 'talk-track'],
  ['/empower/snap-to-text', 'snap-to-text'],
  ['/empower/pdf-kit', 'pdf-kit'],
  ['/empower/access-check', 'access-check'],
  ['/empower/recall-cards', 'recall-cards'],
  ['/empower/decision-matrix', 'decision-matrix'],
]

async function blockExternal(page) {
  const blocked = []
  await page.route('**/*', route => {
    const url = route.request().url()
    let host = ''
    try { host = new URL(url).hostname } catch { /* ignore */ }
    if (host === '127.0.0.1' || host === 'localhost') return route.continue()
    blocked.push(url)
    return route.abort()
  })
  return blocked
}

async function ready(page, slug) {
  await page.waitForFunction(expected => document.documentElement.dataset.empowerRecent === expected, slug)
}

test.beforeEach(async ({ page }) => {
  await blockExternal(page)
})

test('hub lists all 8 tools, groups, search, and offline state', async ({ page }) => {
  await page.goto('/empower')
  await ready(page, 'hub')
  await expect(page.getByRole('heading', { level: 1, name: 'Empower' })).toBeVisible()
  await expect(page.getByText('Everyday tools for clearer thinking and work.')).toBeVisible()
  await expect(page.locator('.em-pill')).toHaveText(/Needs download|Ready offline|Offline — limited/)
  for (const [href] of TOOLS) {
    await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible()
  }
  for (const group of ['Write', 'Read', 'Decide', 'Learn']) {
    await expect(page.getByRole('heading', { name: group })).toBeVisible()
  }
  await expect(page.locator('a[href="/empower/goal-shaper?mode=learning"]')).toBeVisible()
  await expect(page.locator('a[href="/tools/cadence"]')).toBeVisible()
  await expect(page.locator('a[href="/tools/storygen"]')).toBeVisible()

  await page.getByLabel('Search tools').fill('matrix')
  await expect(page.locator('a[href="/empower/decision-matrix"]')).toBeVisible()
  await expect(page.locator('a[href="/empower/plain-speak"]')).toHaveCount(0)
  await page.getByLabel('Search tools').fill('no-such-tool')
  await expect(page.getByText('No tools match that search.')).toBeVisible()
})

test('plain-speak scores a draft with the network off', async ({ page }) => {
  await page.goto('/empower/plain-speak')
  await ready(page, 'plain-speak')
  await page.context().setOffline(true)
  const draft = 'In order to leverage our stakeholders and utilize a robust paradigm, we will facilitate a holistic deep dive that operationalizes the deliverables and circles back with the team so that we can align on the value-add going forward with a best practice.'
  await page.getByLabel('Draft').fill(draft)
  await expect(page.getByText('Long sentence').first()).toBeVisible()
  await expect(page.getByText(/Try: use/).first()).toBeVisible()
  await expect(page.locator('.em-score')).toContainText(/Clarity \d+/)
  await expect(page.locator('.em-score')).toContainText('out of 100')
  await expect(page.getByLabel('Plain rewrite')).not.toHaveValue(/utilize/i)
  await expect(page.getByLabel('Plain rewrite')).toHaveValue(/use/i)
})

test('goal shaper builds a learning objective offline', async ({ page }) => {
  await page.goto('/empower/goal-shaper?mode=learning')
  await ready(page, 'goal-shaper')
  await page.context().setOffline(true)
  await page.getByLabel('Goal').fill('learn spanish')
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByRole('radio', { name: 'Learning' })).toBeChecked()
  await expect(page.getByText(/Bloom/)).toBeVisible()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByLabel('Audience').fill('new hires')
  await page.getByRole('button', { name: 'See the plan' }).click()
  const plan = page.locator('.em-plan')
  await expect(plan).toContainText(/new hires/)
  await expect(plan).toContainText(/explain spanish/i)
  await expect(plan).toContainText(/Understand/)
})

test('talk track turns an outline into notes offline', async ({ page }) => {
  await page.goto('/empower/talk-track')
  await ready(page, 'talk-track')
  await page.context().setOffline(true)
  await page.getByLabel('Outline').fill('# Welcome\nSay hello to the room.\n\n# The point\n- One idea only\n- Say why it matters\n')
  await expect(page.getByLabel('Notes for Welcome')).toHaveValue(/Start with: Welcome/)
  await page.getByRole('button', { name: 'The point' }).click()
  await expect(page.getByLabel('Notes for The point')).toHaveValue(/One idea only/)
  await expect(page.getByRole('complementary', { name: 'Timing' })).toContainText(/Total seat time/)
  await expect(page.getByRole('complementary', { name: 'Timing' })).toContainText(/\d+ sec|\d+ min/)
})

test('snap-to-text reads a photo without leaving the origin', async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto('/empower/snap-to-text')
  await ready(page, 'snap-to-text')
  const png = await page.evaluate(async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1100
    canvas.height = 280
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 120px Arial'
    ctx.fillText('HELLO', 60, 180)
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    const bytes = new Uint8Array(await blob.arrayBuffer())
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary)
  })
  await page.setInputFiles('#snap-file', {
    name: 'hello.png',
    mimeType: 'image/png',
    buffer: Buffer.from(png, 'base64'),
  })
  await expect(page.getByRole('img', { name: 'Source photo' })).toBeVisible()
  await page.getByRole('button', { name: 'Read the photo' }).click()
  await expect(page.getByLabel('Recognized text')).toHaveValue(/HELLO/i, { timeout: 90_000 })
})

test('pdf kit rewrites a PDF in the browser', async ({ page }) => {
  const doc = await PDFDocument.create()
  const pageRef = doc.addPage([300, 200])
  const font = await doc.embedFont(StandardFonts.Helvetica)
  pageRef.drawText('Hello workshop', { x: 40, y: 100, size: 24, font })
  const bytes = await doc.save()

  await page.goto('/empower/pdf-kit')
  await ready(page, 'pdf-kit')
  await page.setInputFiles('#pdf-files', {
    name: 'note.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(bytes),
  })
  await expect(page.locator('.em-issues')).toContainText('note.pdf')
  await page.getByRole('tab', { name: 'Compress' }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download compressed PDF' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('compressed.pdf')
  const file = await download.path()
  const fs = await import('node:fs')
  const buf = fs.readFileSync(file)
  expect(buf.subarray(0, 5).toString()).toBe('%PDF-')
})

test('access check reports heuristic issues for a PDF', async ({ page }) => {
  const doc = await PDFDocument.create()
  const pageRef = doc.addPage([300, 200])
  const font = await doc.embedFont(StandardFonts.Helvetica)
  pageRef.drawText('Hello workshop', { x: 40, y: 100, size: 24, font })
  const bytes = await doc.save()

  await page.goto('/empower/access-check')
  await ready(page, 'access-check')
  await expect(page.getByText('not a full WCAG audit certificate')).toBeVisible()
  await page.setInputFiles('#access-file', {
    name: 'note.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(bytes),
  })
  await expect(page.getByRole('list', { name: 'Issues' })).toContainText(/title|tagged|language/i)
  await expect(page.getByText('serious', { exact: true }).first()).toBeVisible()
})

test('recall cards makes a deck and reveals an answer offline', async ({ page }) => {
  await page.goto('/empower/recall-cards')
  await ready(page, 'recall-cards')
  await page.context().setOffline(true)
  await page.getByLabel('Notes').fill('Mitochondria: the part of the cell that makes energy')
  await page.getByRole('button', { name: 'Make cards' }).click()
  await page.getByRole('button', { name: 'Study' }).click()
  const study = page.getByRole('region', { name: 'Study session' })
  await expect(study).toContainText('Mitochondria')
  await expect(study).not.toContainText('makes energy')
  await page.getByRole('button', { name: 'Reveal' }).click()
  await expect(study).toContainText('makes energy')
  await page.getByRole('button', { name: 'Good' }).click()
  await expect(study).toContainText(/Reviewed 1|Nothing left/)
})

test('decision matrix names a winner offline', async ({ page }) => {
  await page.goto('/empower/decision-matrix')
  await ready(page, 'decision-matrix')
  await page.context().setOffline(true)
  await page.getByLabel('Name of option 1').fill('Train')
  await page.getByLabel('Name of option 2').fill('Bus')
  await page.getByLabel('Train on Cost, 0 to 10').fill('2')
  await page.getByLabel('Train on Quality, 0 to 10').fill('9')
  await page.getByLabel('Bus on Cost, 0 to 10').fill('9')
  await page.getByLabel('Bus on Quality, 0 to 10').fill('3')
  await expect(page.locator('.em-winner')).toContainText('Bus wins with 60 points.')
})

test('recently used records a tool on this device', async ({ page }) => {
  await page.goto('/empower/plain-speak')
  await ready(page, 'plain-speak')
  await page.goto('/empower')
  await ready(page, 'hub')
  await expect(page.getByRole('region', { name: 'Recently used' })).toContainText('Plain-Speak Meter')
})
