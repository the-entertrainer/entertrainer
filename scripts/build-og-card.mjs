/**
 * Renders public/og-card.png and public/og-card-2026.png — 1200×630 share cards.
 *
 * Cream paper, ink type, thin yellow accent only. No CTA pills, no listicle
 * chrome, no “CURRENT EDITION” / “published in the open” slogans.
 *
 *   node scripts/build-og-card.mjs /path/to/ttf-dir
 */
import { Resvg } from '@resvg/resvg-js'
import { writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const FONT_DIR = process.argv[2]
if (!FONT_DIR || !existsSync(FONT_DIR)) {
  console.error('Usage: node scripts/build-og-card.mjs <dir with Fraunces, Archivo, IBM Plex Mono TTFs>')
  process.exit(1)
}

const PAPER = '#F7F1E4'
const INK = '#15120F'
const YELLOW = '#FFD43B'

const W = 1200
const H = 630

const rings = Array.from({ length: 10 }, (_, i) => {
  const r = 70 + i * 52
  return `<circle cx="1020" cy="290" r="${r}" fill="none" stroke="${INK}" stroke-opacity="0.09" stroke-width="2"/>`
}).join('\n  ')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  ${rings}
  <rect x="68" y="52" width="72" height="6" fill="${YELLOW}"/>
  <text x="68" y="118" font-family="Fraunces" font-weight="700" font-size="48" fill="${INK}">entertrainer</text>
  <text x="68" y="250" font-family="Fraunces" font-weight="700" font-size="88" fill="${INK}">Elevate.</text>
  <rect x="68" y="262" width="110" height="4" fill="${YELLOW}"/>
  <text x="68" y="344" font-family="Fraunces" font-weight="700" font-size="88" fill="${INK}">Empower.</text>
  <text x="68" y="438" font-family="Fraunces" font-weight="700" font-size="88" fill="${INK}">Engage.</text>
  <text x="68" y="512" font-family="Archivo" font-weight="400" font-size="24" fill="${INK}">by Naveen Jose</text>
  <text x="68" y="576" font-family="IBM Plex Mono" font-weight="600" font-size="20" fill="${INK}">entertrainer.in</text>
</svg>`

const png = new Resvg(svg, {
  fitTo: { mode: 'width', value: W },
  font: { fontDirs: [FONT_DIR], loadSystemFonts: false, defaultFontFamily: 'Archivo' }
}).render().asPng()

writeFileSync('public/og-card.png', png)
writeFileSync('public/og-card-2026.png', png)
console.log('wrote public/og-card.png and public/og-card-2026.png', png.length, 'bytes')
