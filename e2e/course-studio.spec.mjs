import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

async function addBlock(page, name) {
  await page.getByRole('button', { name: 'Add block' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add a block' })
  await dialog.getByRole('button', { name, exact: true }).click()
  await expect(dialog).toBeHidden()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/tools/elearn-author')
  await expect(page.getByRole('heading', { name: 'Course Studio' })).toBeVisible()
  await page.getByRole('button', { name: 'New lesson' }).click()
  await expect(page.getByRole('listbox', { name: 'Lesson blocks' }).getByRole('option')).toHaveCount(1)
})

test('adds a block to the outline', async ({ page }) => {
  await addBlock(page, 'Text')
  const options = page.getByRole('listbox', { name: 'Lesson blocks' }).getByRole('option')
  await expect(options).toHaveCount(2)
  await expect(options.nth(0)).toHaveText(/Heading/)
  await expect(options.nth(1)).toHaveText(/^Text/)
})

test('reorders a block from the keyboard', async ({ page }) => {
  await addBlock(page, 'Text')
  const list = page.getByRole('listbox', { name: 'Lesson blocks' })
  await list.focus()
  await page.keyboard.press('Alt+ArrowUp')
  const options = list.getByRole('option')
  await expect(options.nth(0)).toHaveText(/^Text/)
  await expect(options.nth(1)).toHaveText(/Heading/)
  await expect(options.nth(0)).toHaveAttribute('aria-selected', 'true')
})

test('deletes the selected block', async ({ page }) => {
  await addBlock(page, 'Text')
  await page.getByRole('button', { name: 'Delete block' }).click()
  const options = page.getByRole('listbox', { name: 'Lesson blocks' }).getByRole('option')
  await expect(options).toHaveCount(1)
  await expect(options.first()).toHaveText(/Heading/)
})

test('undo removes the block that was just added', async ({ page }) => {
  await addBlock(page, 'Quote')
  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByRole('listbox', { name: 'Lesson blocks' }).getByRole('option')).toHaveCount(1)
})

test('persists the lesson in this browser', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Lesson title' }).fill('Persist check')
  await page.getByRole('textbox', { name: 'Lesson title' }).blur()
  await page.waitForFunction(() => {
    const raw = localStorage.getItem('entertrainer.course-studio.v1')
    if (!raw) return false
    try {
      return JSON.parse(raw).lesson.title === 'Persist check'
    } catch {
      return false
    }
  })
  await expect(page.getByRole('status')).toHaveText('Saved')
  await page.reload()
  await expect(page.getByRole('textbox', { name: 'Lesson title' })).toHaveValue('Persist check')
  await expect(page.getByRole('listbox', { name: 'Lesson blocks' }).getByRole('option')).toHaveCount(1)
  const stored = await page.evaluate(() => localStorage.getItem('entertrainer.course-studio.v1'))
  const document = JSON.parse(stored)
  expect(document.schemaVersion).toBe(1)
  expect(document.lesson.blocks).toHaveLength(1)
})

test('exports versioned lesson JSON', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Lesson title' }).fill('Export check')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export JSON' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('untitled-lesson.json')
  const path = await download.path()
  expect(path).toBeTruthy()
  const json = JSON.parse(await readFile(path, 'utf8'))
  expect(json.schemaVersion).toBe(1)
  expect(json.lesson.title).toBe('Export check')
  expect(json.lesson.slug).toBe('untitled-lesson')
  expect(json.lesson.blocks.map(block => block.type)).toEqual(['heading'])
})

test('previews the lesson at mobile width', async ({ page }) => {
  await page.getByRole('button', { name: 'Preview' }).click()
  await page.getByRole('button', { name: 'Mobile' }).click()
  const frame = page.locator('[data-device="mobile"]')
  await expect(frame).toBeVisible()
  const box = await frame.boundingBox()
  expect(box?.width).toBeLessThanOrEqual(400)
  await expect(frame.getByRole('heading', { level: 1, name: 'Untitled lesson' })).toBeVisible()
})

test('adds a knowledge check and flashcards', async ({ page }) => {
  await addBlock(page, 'Knowledge check')
  await addBlock(page, 'Flashcards')
  const list = page.getByRole('listbox', { name: 'Lesson blocks' })
  await expect(list.getByRole('option', { name: 'Knowledge check' })).toBeVisible()
  await expect(list.getByRole('option', { name: 'Flashcards' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Question' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add card' })).toBeVisible()
  await list.getByRole('option', { name: 'Knowledge check' }).click()
  await expect(page.getByRole('radio', { name: 'Option 1' })).toBeChecked()
})
