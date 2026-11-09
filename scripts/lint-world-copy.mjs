#!/usr/bin/env node
/**
 * Flags pointer-only words in Satya Space copy.
 * Event handlers, CSS, and media queries are ignored.
 */
import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const root = join(process.cwd(), 'components/world')
const word = /\b(click|clicks|clicked|hover|hovers|hovered|tap|taps|tapped|drag|drags|dragged)\b/i

async function files(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...await files(path))
    else if (/\.(vue|ts)$/.test(entry.name)) out.push(path)
  }
  return out
}

function copyOf(source) {
  const bits = []
  const template = source.match(/<template[^>]*>([\s\S]*?)<\/template>/)
  if (template) {
    bits.push(template[1].replace(/<[^>]+>/g, '\n'))
    for (const attr of template[1].matchAll(/\b(?:aria-label|title|alt|placeholder)="([^"]*)"/g)) {
      bits.push(attr[1])
    }
  }
  const script = source.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  const code = script ? script[1] : source
  for (const literal of code.matchAll(/`([^`\\]*(?:\\.[^`\\]*)*)`|'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)"/g)) {
    bits.push(literal[1] ?? literal[2] ?? literal[3] ?? '')
  }
  return bits.join('\n')
}

const issues = []
for (const file of await files(root)) {
  const text = copyOf(await readFile(file, 'utf8'))
  const lines = text.split('\n')
  lines.forEach((line, index) => {
    if (word.test(line)) issues.push(`${relative(process.cwd(), file)}:${index + 1}: ${line.trim()}`)
  })
}

if (issues.length) {
  console.error('lint:copy failed. Use select, open, or choose.\n' + issues.map((issue) => `- ${issue}`).join('\n'))
  process.exit(1)
}
console.log('lint:copy ok')
