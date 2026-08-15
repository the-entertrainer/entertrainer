/**
 * Renders public/work/ai-course-cover.png — the card artwork for the AI course.
 *
 * Generated from the design tokens rather than drawn, for the same reason as
 * the share card: it cannot drift from the palette, and re-running it after a
 * colour change updates it. 1672×941 to match the other card artwork on the
 * site, so the grid does not have to special-case it.
 *
 *   node scripts/build-course-cover.mjs /path/to/ttf-dir
 */
import { Resvg } from '@resvg/resvg-js'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'

const FONT_DIR = process.argv[2]
if (!FONT_DIR || !existsSync(FONT_DIR)) {
  console.error('Usage: node scripts/build-course-cover.mjs <dir with Bangers.ttf and SpaceGrotesk.ttf>')
  process.exit(1)
}

const PAPER = '#FFFDF7', INK = '#171717', SUN = '#F6C945', CORAL = '#F36B5F'
const COBALT = '#2A66DE', MINT = '#76D7C4', VIOLET = '#B36BE8', ORANGE = '#E98C2E'

/* The ten module markers, in module order, using each module's own accent.
   A row of ten ticks that literally is the course structure. */
const ACCENTS = [COBALT, VIOLET, ORANGE, '#6D6A63', MINT, CORAL, SUN, COBALT, VIOLET, INK]

const ticks = ACCENTS.map((c, i) => {
  const x = 96 + i * 150
  return `<g transform="translate(${x} 640)">
    <rect x="0" y="0" width="118" height="118" rx="14" fill="${c}" stroke="${INK}" stroke-width="7"/>
    <text x="59" y="78" font-family="Bangers" font-size="56" fill="${c === INK || c === COBALT || c === VIOLET ? PAPER : INK}" text-anchor="middle">${String(i + 1).padStart(2, '0')}</text>
  </g>`
}).join('\n')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 941">
  <rect width="1672" height="941" fill="${PAPER}"/>

  <!-- Registration rule across the top, the way the site's cards are ruled -->
  <rect x="0" y="0" width="1672" height="12" fill="${INK}"/>

  <!-- Eyebrow -->
  <text x="96" y="112" font-family="Space Grotesk" font-size="30" font-weight="700" letter-spacing="4" fill="#6D6A63">A FREE ONE-DAY COURSE · ENTERTRAINER</text>

  <!-- Title -->
  <text x="96" y="248" font-family="Bangers" font-size="132" fill="${INK}">ARTIFICIAL</text>
  <text x="96" y="376" font-family="Bangers" font-size="132" fill="${INK}">INTELLIGENCE</text>

  <!-- The line, with the frontier highlighted -->
  <rect x="658" y="428" width="390" height="82" fill="${SUN}"/>
  <text x="96" y="492" font-family="Bangers" font-size="82" fill="${INK}">FROM ITS ORIGINS TO THE FRONTIER</text>

  <!-- Standfirst -->
  <text x="96" y="580" font-family="Space Grotesk" font-size="34" fill="#6D6A63">Two collapses, one method for telling evidence from announcement.</text>

  ${ticks}

  <!-- Footer rule -->
  <rect x="96" y="824" width="1480" height="3" fill="#D8D1C4"/>
  <text x="96" y="888" font-family="Space Grotesk" font-size="30" font-weight="700" fill="#6D6A63">10 MODULES</text>
  <text x="1576" y="888" font-family="Space Grotesk" font-size="30" font-weight="700" fill="#6D6A63" text-anchor="end">NO SIGN-UP · NOTHING LEAVES YOUR BROWSER</text>
</svg>`

const png = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1672 },
  font: { fontDirs: [FONT_DIR], loadSystemFonts: false, defaultFontFamily: 'Space Grotesk' }
}).render().asPng()

mkdirSync('public/work', { recursive: true })
writeFileSync('public/work/ai-course-cover.png', png)
console.log('wrote public/work/ai-course-cover.png', png.length, 'bytes')
