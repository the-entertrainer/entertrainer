/**
 * Rasterize Elevate-DNA tool icons from SVG sources under public/icons/.
 *
 *   node scripts/build-tool-icons.mjs
 *
 * Writes:
 *   - public/{name}-icon-192.png / -512.png  (app / PWA / list tiles)
 *   - public/{editorial}.png                 (16:9 card thumbs)
 *   - public/{name}-icon.svg                 (root alias for StoryGen + others)
 *   - public/dialogue/icons/*                (Dialogue PWA set)
 */
import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const iconsDir = join(root, 'public', 'icons')

const CREAM = '#F7F1E4'
const INK = '#0B0B0C'

const TOOLS = [
  {
    id: 'storygen',
    svg: 'storygen-icon.svg',
    pngBase: 'storygen-icon',
    editorial: 'storygen.png',
    rootSvg: true,
  },
  {
    id: 'cadence',
    svg: 'cadence-icon.svg',
    pngBase: 'cadence-icon',
    editorial: 'training-cal-gen.png',
  },
  {
    id: 'easymcq',
    svg: 'easymcq-icon.svg',
    pngBase: 'easymcq-icon',
    editorial: 'easymcq.png',
  },
  {
    id: 'draftly',
    svg: 'draftly-icon.svg',
    pngBase: 'draftly-icon',
    editorial: 'better-emails.png',
  },
]

const DIALOGUE = {
  svg: 'dialogue-icon.svg',
  sizes: [
    ['icon-192.png', 192],
    ['icon-512.png', 512],
    ['apple-touch-icon.png', 180],
    ['maskable-512.png', 512],
  ],
}

function raster(svg, size) {
  return new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: 'rgba(0,0,0,0)',
  }).render().asPng()
}

function editorialCard(iconSvg, w = 1672, h = 941) {
  // 16:9 cream board with the squircle icon centered — matches .card__art.
  const icon = 560
  const x = Math.round((w - icon) / 2)
  const y = Math.round((h - icon) / 2)
  const wrapped = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${CREAM}"/>
  <rect x="48" y="48" width="${w - 96}" height="${h - 96}" rx="28" fill="none" stroke="${INK}" stroke-width="3" opacity="0.08"/>
  <svg x="${x}" y="${y}" width="${icon}" height="${icon}" viewBox="0 0 512 512">
    ${iconSvg.replace(/<\?xml[^>]*>/, '').replace(/<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')}
  </svg>
</svg>`
  return new Resvg(wrapped, {
    fitTo: { mode: 'width', value: w },
  }).render().asPng()
}

const out = []

for (const tool of TOOLS) {
  const svgPath = join(iconsDir, tool.svg)
  const svg = await readFile(svgPath, 'utf8')

  for (const size of [192, 512]) {
    const dest = join(root, 'public', `${tool.pngBase}-${size}.png`)
    await writeFile(dest, raster(svg, size))
    out.push(dest)
  }

  // Root SVG alias (source of truth also lives in public/icons/)
  await writeFile(join(root, 'public', `${tool.pngBase}.svg`), svg)
  out.push(join(root, 'public', `${tool.pngBase}.svg`))

  if (tool.editorial) {
    const dest = join(root, 'public', tool.editorial)
    await writeFile(dest, editorialCard(svg))
    out.push(dest)
  }
}

// Dialogue PWA / apple-touch set
const dialogueSvg = await readFile(join(iconsDir, DIALOGUE.svg), 'utf8')
await writeFile(join(root, 'public', 'dialogue-icon.svg'), dialogueSvg)
const dialogueDir = join(root, 'public', 'dialogue', 'icons')
await mkdir(dialogueDir, { recursive: true })
for (const [name, size] of DIALOGUE.sizes) {
  const dest = join(dialogueDir, name)
  await writeFile(dest, raster(dialogueSvg, size))
  out.push(dest)
}
// Also mirror apple-touch at dialogue root (legacy path)
await copyFile(join(dialogueDir, 'apple-touch-icon.png'), join(root, 'public', 'dialogue', 'apple-touch-icon.png'))
// Keep d-mark.svg in sync as a simplified mark
await writeFile(join(dialogueDir, 'd-mark.svg'), dialogueSvg)

console.log(`Built ${out.length} icon assets.`)
for (const p of out) console.log(' ·', p.replace(root + '/', ''))
