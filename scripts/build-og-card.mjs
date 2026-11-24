/**
 * Renders public/og-card.png / og-card-2026*.png — 1200×630 share cards.
 * Right: e-mark only (3 yellow rings + ink e), optically centered in the rings.
 *   node scripts/build-og-card.mjs /path/to/ttf-dir
 */
import { Resvg } from '@resvg/resvg-js'
import { writeFileSync, existsSync } from 'node:fs'

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

const faintRings = Array.from({ length: 10 }, (_, i) => {
  const r = 90 + i * 46
  return `<circle cx="980" cy="315" r="${r}" fill="none" stroke="${INK}" stroke-opacity="${i % 2 ? 0.06 : 0.1}" stroke-width="2"/>`
}).join('\n  ')

/* Mark centered at (980,315). SVG text y tuned for Archivo optical center (~dy -6). */
const logoMark = `
  <g transform="translate(810 145)">
    <circle cx="170" cy="170" r="133" fill="none" stroke="${YELLOW}" stroke-width="25"/>
    <circle cx="170" cy="170" r="88" fill="none" stroke="${YELLOW}" stroke-width="25"/>
    <circle cx="170" cy="170" r="42" fill="none" stroke="${YELLOW}" stroke-width="25"/>
    <text x="170" y="170" dy="0.28em" text-anchor="middle" font-family="Archivo" font-weight="900" font-size="168" fill="${INK}" letter-spacing="-0.08em">e</text>
  </g>`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  ${faintRings}
  ${logoMark}
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
writeFileSync('public/og-card-2026c.png', png)
console.log('wrote og cards', png.length)
