// Renders the Entertrainer mark (utils/sacredGeometry.ts → eMark) into every
// static icon: favicon.svg, favicon PNGs + .ico, apple-touch, PWA, mstile,
// and the Safari pinned-tab silhouette. Run: node scripts/build-mark-icons.mjs
import { writeFileSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

const PHI = 1.6180339887
const YELLOW = '#FFD43B'
const INK = '#161618'
const CREAM = '#F7F1E4'
const f = (n) => +n.toFixed(3)

/** Same construction as eMark(): bowl r = R/φ, stroke r/φ², aperture at the vesica cut (60°). */
function e(cx, cy, R, strokeScale = 1) {
  const r = R / PHI
  const sw = (r / (PHI * PHI)) * strokeScale
  const ex = cx + r * Math.cos(Math.PI / 3), ey = cy + r * Math.sin(Math.PI / 3)
  return `<path d="M${f(cx - r)} ${f(cy)}H${f(cx + r)}A${f(r)} ${f(r)} 0 1 0 ${f(ex)} ${f(ey)}" fill="none" stroke="${INK}" stroke-width="${f(sw)}" stroke-linejoin="miter" stroke-linecap="butt"/>`
}

/** Seal only: yellow disk filling the box. strokeScale thickens for tiny sizes. */
const seal = (strokeScale = 1, title = true) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${title ? '<title>Entertrainer</title>' : ''}<circle cx="50" cy="50" r="50" fill="${YELLOW}"/>${e(50, 50, 50, strokeScale)}</svg>`

/** Tile: cream paper, seal inside the maskable safe zone (radius 0.4 · size). */
const tile = (R = 30) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${CREAM}"/><circle cx="50" cy="50" r="${R}" fill="${YELLOW}"/>${e(50, 50, R)}</svg>`

const png = (svg, size) => new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng()

const out = (p, d) => writeFileSync(new URL('../public/' + p, import.meta.url), d)
out('favicon.svg', seal(1) + '\n')
const p16 = png(seal(1.25, false), 16)
const p32 = png(seal(1.1, false), 32)
const p48 = png(seal(1, false), 48)
out('favicon-16x16.png', p16)
out('favicon-32x32.png', p32)
out('apple-touch-icon.png', png(tile(34), 180))
out('pwa-192.png', png(tile(34), 192))
out('pwa-512.png', png(tile(30), 512))
out('mstile-150x150.png', png(tile(34), 150))
// Pinned tab: one colour, the e knocked out of the disk.
{
  const R = 50, r = R / PHI, sw = r / (PHI * PHI)
  out('safari-pinned-tab.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><mask id="m"><circle cx="50" cy="50" r="50" fill="#fff"/>${e(50, 50, 50).replace(`stroke="${INK}"`, 'stroke="#000"')}</mask><circle cx="50" cy="50" r="50" fill="#000" mask="url(#m)"/></svg>\n`)
}
// favicon.ico: PNG-in-ICO with 16, 32, 48.
{
  const imgs = [[16, p16], [32, p32], [48, p48]]
  const head = Buffer.alloc(6 + 16 * imgs.length)
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(imgs.length, 4)
  let off = head.length
  imgs.forEach(([s, b], i) => {
    const o = 6 + i * 16
    head.writeUInt8(s, o); head.writeUInt8(s, o + 1); head.writeUInt16LE(1, o + 4); head.writeUInt16LE(32, o + 6)
    head.writeUInt32LE(b.length, o + 8); head.writeUInt32LE(off, o + 12); off += b.length
  })
  out('favicon.ico', Buffer.concat([head, ...imgs.map(([, b]) => b)]))
}
console.log('icons written')
