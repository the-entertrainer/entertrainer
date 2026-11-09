#!/usr/bin/env node
/**
 * Flags pointer-only words in Satya Space copy.
 * Event handlers, CSS, and media queries are ignored.
 * Line numbers are source lines, not offsets in the extracted text.
 */
import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const word = /\b(click|clicks|clicked|hover|hovers|hovered|tap|taps|tapped|drag|drags|dragged|swipe|swipes|swiped|press|presses|pressed|scroll|scrolls|scrolled)\b/i

const roots = [
  join(process.cwd(), 'components/world'),
  join(process.cwd(), 'error.vue'),
  join(process.cwd(), 'pages/index.vue'),
]

async function files(path) {
  const stat = await readdir(path, { withFileTypes: true }).catch(() => null)
  if (!stat) return [path]
  const out = []
  for (const entry of stat) {
    const next = join(path, entry.name)
    if (entry.isDirectory()) out.push(...await files(next))
    else if (/\.(vue|ts)$/.test(entry.name)) out.push(next)
  }
  return out
}

function lineOf(source, index) {
  return source.slice(0, index).split('\n').length
}

const keyboardHint = /\bpress(?:es|ed)?\s+(?:enter|esc|escape|space)\b/gi

function flagged(text) {
  const spoken = text.replace(keyboardHint, ' ')
  return word.test(spoken)
}

function scan(source) {
  const hits = []
  const seen = new Set()
  const note = (index, text) => {
    const trimmed = text.replace(/\s+/g, ' ').trim()
    const spoken = trimmed.replace(/^['"]+|['"]+$/g, '')
    if (!spoken || !flagged(spoken)) return
    const key = `${lineOf(source, index)}:${spoken}`
    if (seen.has(key)) return
    seen.add(key)
    hits.push({ line: lineOf(source, index), text: spoken.slice(0, 160) })
  }

  const template = source.match(/<template[^>]*>[\s\S]*?<\/template>/)
  if (template) {
    const start = template.index ?? 0
    const text = />([^<]+)</g
    let match
    while ((match = text.exec(template[0]))) note(start + match.index, match[1])
    const attr = /\b(?:aria-label|title|alt|placeholder)="([^"]*)"/g
    while ((match = attr.exec(template[0]))) note(start + match.index, match[1])
    const bound = /\b(?:aria-label|title|alt|placeholder)="'([^']*)'"/g
    while ((match = bound.exec(template[0]))) note(start + match.index, match[1])
  }

  const script = source.match(/<script[^>]*>[\s\S]*?<\/script>/)
  const region = script
    ? { start: script.index ?? 0, code: script[0] }
    : template
      ? null
      : { start: 0, code: source }
  if (region) {
    const literal = /`([^`\\]*(?:\\.[^`\\]*)*)`|'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)"/g
    let match
    while ((match = literal.exec(region.code))) {
      note(region.start + match.index, match[1] ?? match[2] ?? match[3] ?? '')
    }
  }
  return hits
}

const issues = []
for (const root of roots) {
  for (const file of await files(root)) {
    const source = await readFile(file, 'utf8')
    for (const hit of scan(source)) {
      issues.push(`${relative(process.cwd(), file)}:${hit.line}: ${hit.text}`)
    }
  }
}

const sample = `<template>
  <button :title="'Scrolled past'" :aria-label="'Press Esc'" aria-label="Scroll the map">Press Esc</button>
  <p>Press the poster</p>
</template>`
const sampleHits = scan(sample).map((hit) => hit.text)
const scrolled = sampleHits.filter((hit) => hit === 'Scrolled past')
if (scrolled.length !== 1 || sampleHits.some((hit) => /\bpress esc\b/i.test(hit)) || !sampleHits.includes('Scroll the map') || !sampleHits.includes('Press the poster')) {
  console.error('lint:copy self-check failed', sampleHits)
  process.exit(1)
}

if (issues.length) {
  console.error('lint:copy failed. Use select, open, or choose.\n' + issues.map((issue) => `- ${issue}`).join('\n'))
  process.exit(1)
}
console.log('lint:copy ok')
