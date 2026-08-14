/**
 * Renders public/og-card.png — the 2400×1260 image every share of this site
 * shows in a feed.
 *
 * It is generated rather than drawn so it cannot drift from the design system:
 * the colours, the emblem geometry and the wording all come from the same
 * values the site uses, and re-running this after a palette change updates the
 * share card too.
 *
 * Fonts: point FONT_DIR at a directory containing Bangers-Regular.ttf and a
 * Space Grotesk TTF. resvg reads TrueType, not the woff2 files the site
 * serves, so this is a build-time-only dependency — nothing extra ships.
 *
 *   node scripts/build-og-card.mjs /path/to/ttf-dir
 */
import { Resvg } from '@resvg/resvg-js'
import { writeFileSync, existsSync } from 'node:fs'

const FONT_DIR = process.argv[2]
if (!FONT_DIR || !existsSync(FONT_DIR)) {
  console.error('Usage: node scripts/build-og-card.mjs <dir with Bangers.ttf and SpaceGrotesk.ttf>')
  process.exit(1)
}

const PAPER = '#FFFDF7'
const INK = '#171717'
const SUN = '#F6C945'
const CORAL = '#F36B5F'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1260" viewBox="0 0 2400 1260">
  <rect width="2400" height="1260" fill="${PAPER}"/>

  <!-- Masthead rule -->
  <rect x="0" y="0" width="2400" height="14" fill="${INK}"/>

  <!-- Emblem, same geometry as public/favicon.svg -->
  <g transform="translate(150 120) scale(1.9)">
    <path d="M8 6h48a4 4 0 0 1 4 4v12a10 10 0 0 0 0 20v12a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V42a10 10 0 0 0 0-20V10a4 4 0 0 1 4-4Z"
          fill="${SUN}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M17 20h22M17 44h22" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <path d="M18 26.5 32 32l-14 5.5z" fill="${INK}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  </g>
  <text x="300" y="215" font-family="Bangers" font-size="104" fill="${INK}">ENTERTRAINER</text>

  <!-- The line. The highlighter is drawn before the text so the word sits on
       top of it, and its box is positioned by hand against Bangers' actual
       advance widths at this size — the marker has to land on the word, and
       there is no layout engine here to ask. -->
  <text x="150" y="450" font-family="Bangers" font-size="188" fill="${INK}">LEARNING PEOPLE</text>
  <rect x="762" y="475" width="410" height="142" fill="${SUN}"/>
  <text x="150" y="610" font-family="Bangers" font-size="188" fill="${INK}">ACTUALLY FINISH.</text>

  <!-- Standfirst -->
  <text x="150" y="742" font-family="Space Grotesk" font-size="56" fill="#6D6A63">Instructional design by Naveen Jose —</text>
  <text x="150" y="818" font-family="Space Grotesk" font-size="56" fill="#6D6A63">plus four free web apps for L&amp;D teams.</text>

  <!-- Tickets -->
  <g transform="translate(150 900)">
    <rect x="6" y="8" width="470" height="106" rx="53" fill="${INK}"/>
    <rect x="0" y="0" width="470" height="106" rx="53" fill="${CORAL}" stroke="${INK}" stroke-width="6"/>
    <text x="235" y="70" font-family="Space Grotesk" font-size="44" font-weight="700" fill="${INK}" text-anchor="middle">See the craft, live</text>
  </g>
  <g transform="translate(660 900)">
    <rect x="6" y="8" width="430" height="106" rx="53" fill="${INK}"/>
    <rect x="0" y="0" width="430" height="106" rx="53" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>
    <text x="215" y="70" font-family="Space Grotesk" font-size="44" font-weight="700" fill="${INK}" text-anchor="middle">Four free web apps</text>
  </g>

  <!-- Footer rule + domain -->
  <rect x="150" y="1070" width="2100" height="4" fill="#D8D1C4"/>
  <text x="150" y="1160" font-family="Space Grotesk" font-size="42" fill="#6D6A63">entertrainer.in</text>
  <text x="2250" y="1160" font-family="Space Grotesk" font-size="42" fill="#6D6A63" text-anchor="end">Instructional design, published in the open</text>
</svg>`

const png = new Resvg(svg, {
  fitTo: { mode: 'width', value: 2400 },
  font: { fontDirs: [FONT_DIR], loadSystemFonts: false, defaultFontFamily: 'Space Grotesk' }
}).render().asPng()

writeFileSync('public/og-card.png', png)
console.log('wrote public/og-card.png', png.length, 'bytes')
