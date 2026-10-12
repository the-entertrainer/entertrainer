/**
 * Renders public/og-card.png / og-card-2026*.png — 1200×630 share cards.
 * Right: the compass-built e-mark on its seal, with its construction as hairlines.
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

/* The mark (utils/sacredGeometry.ts → eMark): seal R, bowl r = R/φ, stroke r/φ²,
   aperture cut by the vesica at 60°. Its construction stays as faint hairlines. */
const PHI = 1.6180339887
const CX = 960, CY = 315, R = 150
const r = R / PHI, sw = r / (PHI * PHI)
const f = (n) => +n.toFixed(2)
const ex = CX + r * Math.cos(Math.PI / 3), ey = CY + r * Math.sin(Math.PI / 3)
const faintRings = [
  `<line x1="640" y1="${CY}" x2="1200" y2="${CY}" stroke="${INK}" stroke-opacity=".16" stroke-width="1.5"/>`,
  ...[CX - r, CX + r].map((x) => `<circle cx="${f(x)}" cy="${CY}" r="${f(r)}" fill="none" stroke="${INK}" stroke-opacity=".16" stroke-width="1.5"/>`),
  `<circle cx="${CX}" cy="${CY}" r="${f(R * PHI)}" fill="none" stroke="${INK}" stroke-opacity=".08" stroke-width="1.5"/>`
].join('\n  ')

const logoMark = `
  <circle cx="${CX}" cy="${CY}" r="${R}" fill="${YELLOW}"/>
  <path d="M${f(CX - r)} ${CY}H${f(CX + r)}A${f(r)} ${f(r)} 0 1 0 ${f(ex)} ${f(ey)}" fill="none" stroke="#161618" stroke-width="${f(sw)}" stroke-linejoin="miter"/>
  ${[CX - r, CX, CX + r].map((x) => `<circle cx="${f(x)}" cy="${CY}" r="3" fill="${INK}" fill-opacity=".35"/>`).join('')}`

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

writeFileSync('public/og-card-2026e.png', png)
console.log('wrote og cards', png.length)
