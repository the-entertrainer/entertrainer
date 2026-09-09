/**
 * Renders public/og-card.png and public/og-card-2026.png — 1200×630 share cards.
 *
 * Cream paper, ink type, thin yellow accent. Right side: e-mark logo only
 * (rings + e) — no wordmark text on the right, no CTA pills / listicle chrome.
 *
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
  const r = 70 + i * 52
  return `<circle cx="980" cy="300" r="${r}" fill="none" stroke="${INK}" stroke-opacity="0.09" stroke-width="2"/>`
}).join('\n  ')

/** Site wordmark mark: three yellow rings + ink e (viewBox 0 0 240 240). */
const logoMark = `
  <g transform="translate(840 160)">
    <circle cx="120" cy="120" r="94" fill="none" stroke="${YELLOW}" stroke-width="18"/>
    <circle cx="120" cy="120" r="62" fill="none" stroke="${YELLOW}" stroke-width="18"/>
    <circle cx="120" cy="120" r="30" fill="none" stroke="${YELLOW}" stroke-width="18"/>
    <text x="120" y="158" text-anchor="middle" font-family="Archivo" font-weight="900" font-size="144" fill="${INK}" letter-spacing="-0.1em">e</text>
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
console.log('wrote public/og-card.png and public/og-card-2026.png', png.length, 'bytes')
