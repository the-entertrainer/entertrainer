import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

/**
 * Paper Signal guardrail.
 *
 * The approved visual system allows brand marks and controlled inline Paper
 * Signal SVGs. It rejects Unicode emoji in rendered source and ordinary `<img>`
 * elements everywhere else. The named exceptions use assets documented in the
 * provenance register: real instructional evidence, author-owned project work,
 * and image previews with a Paper Signal fallback.
 */
const root = process.cwd()
const sourceRoots = ['pages', 'components', 'app', 'content', 'assets']
const allowedImageFiles = new Set([
  'pages/courses/ai-atlas.vue',
  'pages/instructional-design/index.vue',
  'pages/index.vue',
  'components/ed/Card.vue',
  'pages/my-work/sewa-chronicles.vue',
  'components/ed/BookReader.vue'
])
const emoji = /[\u{1F000}-\u{1FAFF}]/u
const issues = []

async function collect(directory) {
  const absolute = join(root, directory)
  const entries = await readdir(absolute, { withFileTypes: true }).catch(() => [])
  const files = []
  for (const entry of entries) {
    const path = join(absolute, entry.name)
    if (entry.isDirectory()) files.push(...await collect(relative(root, path)))
    if (entry.isFile() && /\.(vue|ts|html|css)$/.test(entry.name)) files.push(path)
  }
  return files
}

for (const directory of sourceRoots) {
  for (const file of await collect(directory)) {
    const text = await readFile(file, 'utf8')
    const path = relative(root, file)
    if (emoji.test(text)) issues.push(`${path}: Unicode emoji is prohibited in interface source.`)
    if (/<img\b/.test(text) && !allowedImageFiles.has(path)) issues.push(`${path}: rendered <img> elements must be replaced by Paper Signal components.`)
  }
}

if (issues.length) {
  console.error('Paper Signal compliance check failed:\n' + issues.map(issue => `- ${issue}`).join('\n'))
  process.exitCode = 1
} else {
  console.log('Paper Signal compliance check passed: no Unicode emoji and no uncontrolled rendered image elements.')
}
