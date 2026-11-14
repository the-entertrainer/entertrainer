import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const matrix = JSON.parse(readFileSync(new URL('../content/redirects.json', import.meta.url), 'utf8'))
const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))

function locationPath(value) {
  if (!value) return ''
  try {
    const url = new URL(value, 'http://127.0.0.1')
    return url.pathname + url.search + url.hash
  } catch {
    return value
  }
}

test('vercel.json mirrors the redirect matrix as 301, never 308', () => {
  expect(vercel.trailingSlash).toBe(false)
  const text = JSON.stringify(vercel)
  expect(text.includes('"permanent"')).toBe(false)
  for (const row of matrix.exact) {
    const hit = vercel.redirects.find((item) => item.source === row.from)
    expect(hit, row.from).toMatchObject({ destination: row.to, statusCode: 301 })
    const slashed = vercel.redirects.find((item) => item.source === `${row.from}/`)
    expect(slashed, `${row.from}/`).toMatchObject({ destination: row.to, statusCode: 301 })
  }
  for (const row of vercel.redirects) {
    expect(row.statusCode).toBe(301)
  }
})

test('each §5.2 redirect is one 301 hop to the final target', async ({ request }) => {
  test.setTimeout(180_000)
  const cases = []
  for (const row of matrix.exact) {
    cases.push({ from: row.from, to: row.to })
    cases.push({ from: `${row.from}/`, to: row.to })
  }
  cases.push({ from: '/lessons/not-a-real-page', to: '/learn/not-a-real-page' })
  cases.push({ from: '/my-work/missing', to: '/work/missing' })
  cases.push({ from: '/downloads/missing', to: '/archive/downloads/missing' })
  cases.push({ from: '/about/missing', to: '/about' })
  cases.push({ from: '/educate/foo', to: '/' })
  cases.push({ from: '/tools/easymcq/extra', to: '/empower' })
  cases.push({ from: '/dialogue/', to: '/dialogue' })
  cases.push({ from: '/games/pictune/', to: '/engage' })
  cases.push({ from: '/downloads/', to: '/archive/downloads' })

  for (const item of cases) {
    const res = await request.get(item.from, { maxRedirects: 0 })
    expect(res.status(), item.from).toBe(301)
    const location = locationPath(res.headers().location || '')
    expect(location, item.from).toBe(item.to)
    const next = await request.get(location, { maxRedirects: 0 })
    expect([301, 302, 303, 307, 308].includes(next.status()), `${item.from} -> ${location} (${next.status()})`).toBe(false)
  }
})

test('kept routes answer without a redirect', async ({ request }) => {
  for (const path of ['/learn', '/work', '/work/sewa-chronicles', '/archive', '/archive/downloads', '/dialogue', '/empower', '/about', '/elevate', '/tools/cadence']) {
    const res = await request.get(path, { maxRedirects: 0 })
    expect(res.status(), path).toBe(200)
  }
})
