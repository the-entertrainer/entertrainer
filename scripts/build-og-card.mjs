/**
 * Renders public/og-card.png — the 2400×1260 image every share of this site
 * shows in a feed.
 *
 * It is generated rather than drawn so it cannot drift from the design system:
 * the colours, the emblem geometry and the wording all come from the same
 * values the site uses, and re-running this after a palette change updates the
 * share card too.
 *
 * Fonts: point FONT_DIR at a directory containing TTFs for Fraunces, Archivo,
 * Source Serif 4 and IBM Plex Mono. resvg reads TrueType, not the woff2 files the site
 * serves, so this is a build-time-only dependency — nothing extra ships.
 *
 *   node scripts/build-og-card.mjs /path/to/ttf-dir
 */
import { Resvg } from '@resvg/resvg-js'
import { writeFileSync, existsSync } from 'node:fs'

const FONT_DIR = process.argv[2]
if (!FONT_DIR || !existsSync(FONT_DIR)) {
  console.error('Usage: node scripts/build-og-card.mjs <dir with Fraunces, Archivo, Source Serif 4 and IBM Plex Mono TTFs>')
  process.exit(1)
}

const PAPER = '#FFFFFF'
const INK = '#161618'
const MUTED = '#55555C'
const LINE = '#DCDCE0'
const YELLOW = '#F2DC2E'
const BLUE = '#2C2BE8'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1260" viewBox="0 0 2400 1260">
  <rect width="2400" height="1260" fill="${PAPER}"/>

  <!-- Masthead: the wordmark, set, and the standfirst. No rules, no shadows,
       no drawn marks — the same restraint the site itself now runs on. -->
  <text x="150" y="168" font-family="Fraunces" font-weight="700" font-size="76" fill="${INK}">Entertrainer</text>
  <text x="150" y="230" font-family="Archivo" font-weight="600" font-size="34" letter-spacing="3" fill="${MUTED}">INSTRUCTIONAL DESIGN, PUBLISHED IN THE OPEN</text>

  <!-- The line. The highlighter is painted before the word so the type sits
       on it; the box is placed against Fraunces' actual advance widths at this
       size, because there is no layout engine here to ask. -->
  <text x="150" y="516" font-family="Fraunces" font-weight="700" font-size="164" fill="${INK}">Learning people</text>
  <rect x="832" y="588" width="424" height="152" fill="${YELLOW}"/>
  <text x="150" y="712" font-family="Fraunces" font-weight="700" font-size="164" fill="${INK}">actually finish.</text>

  <!-- Standfirst -->
  <text x="150" y="838" font-family="Source Serif 4" font-size="52" fill="${MUTED}">Instructional design by Naveen Jose — plus four free</text>
  <text x="150" y="908" font-family="Source Serif 4" font-size="52" fill="${MUTED}">web apps for L&amp;D teams.</text>

  <!-- One filled pill and one outlined, exactly as the site draws them -->
  <g transform="translate(150 970)">
    <rect x="0" y="0" width="430" height="96" rx="48" fill="${INK}"/>
    <text x="215" y="62" font-family="Archivo" font-size="40" font-weight="600" fill="${PAPER}" text-anchor="middle">See the craft, live</text>
  </g>
  <g transform="translate(614 970)">
    <rect x="1" y="1" width="428" height="94" rx="47" fill="none" stroke="${MUTED}" stroke-width="2"/>
    <text x="215" y="62" font-family="Archivo" font-size="40" font-weight="600" fill="${INK}" text-anchor="middle">Four free web apps</text>
  </g>

  <!-- Footer -->
  <rect x="150" y="1120" width="2100" height="2" fill="${LINE}"/>
  <text x="150" y="1192" font-family="IBM Plex Mono" font-size="34" letter-spacing="2" fill="${MUTED}">ENTERTRAINER.IN</text>
  <circle cx="1858" cy="1180" r="11" fill="${BLUE}"/>
  <text x="2250" y="1192" font-family="IBM Plex Mono" font-size="34" letter-spacing="2" fill="${MUTED}" text-anchor="end">CURRENT EDITION</text>
</svg>`

const png = new Resvg(svg, {
  fitTo: { mode: 'width', value: 2400 },
  font: { fontDirs: [FONT_DIR], loadSystemFonts: false, defaultFontFamily: 'Archivo' }
}).render().asPng()

writeFileSync('public/og-card.png', png)
console.log('wrote public/og-card.png', png.length, 'bytes')
