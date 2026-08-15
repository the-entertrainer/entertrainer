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
  console.error('Usage: node scripts/build-course-cover.mjs <dir with Fraunces, Archivo, Source Serif 4 and IBM Plex Mono TTFs>')
  process.exit(1)
}

const PAPER = '#FFFFFF'
const INK = '#161618'
const MUTED = '#55555C'
const LINE = '#DCDCE0'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 941">
  <rect width="1672" height="941" fill="${PAPER}"/>

  <text x="96" y="120" font-family="IBM Plex Mono" font-size="26" letter-spacing="3" fill="${MUTED}">A FREE ONE-DAY COURSE · ENTERTRAINER</text>

  <text x="96" y="270" font-family="Fraunces" font-weight="700" font-size="112" fill="${INK}">Artificial Intelligence</text>
  <text x="96" y="412" font-family="Fraunces" font-weight="700" font-size="112" fill="${INK}">from its origins</text>
  <text x="96" y="536" font-family="Fraunces" font-weight="700" font-size="112" fill="${INK}">to the frontier</text>

  <text x="96" y="624" font-family="Source Serif 4" font-size="38" fill="${MUTED}">Two collapses, one method for telling evidence from announcement.</text>

  <g transform="translate(96 700)">
    <rect x="0" y="0" width="222" height="56" rx="28" fill="none" stroke="#A9A9B1" stroke-width="2"/>
    <circle cx="26" cy="28" r="9" fill="#2C2BE8"/>
    <text x="46" y="37" font-family="IBM Plex Mono" font-size="24" letter-spacing="1.5" fill="#55555C">PRACTICE</text>
  </g>
  <g transform="translate(334 700)">
    <rect x="0" y="0" width="222" height="56" rx="28" fill="none" stroke="#A9A9B1" stroke-width="2"/>
    <circle cx="26" cy="28" r="9" fill="#E02D18"/>
    <text x="46" y="37" font-family="IBM Plex Mono" font-size="24" letter-spacing="1.5" fill="#55555C">PROJECTS</text>
  </g>
  <g transform="translate(572 700)">
    <rect x="0" y="0" width="222" height="56" rx="28" fill="none" stroke="#A9A9B1" stroke-width="2"/>
    <circle cx="26" cy="28" r="9" fill="#1FD07A"/>
    <text x="46" y="37" font-family="IBM Plex Mono" font-size="24" letter-spacing="1.5" fill="#55555C">WEB APPS</text>
  </g>
  <g transform="translate(810 700)">
    <rect x="0" y="0" width="156" height="56" rx="28" fill="none" stroke="#A9A9B1" stroke-width="2"/>
    <circle cx="26" cy="28" r="9" fill="#8B34D4"/>
    <text x="46" y="37" font-family="IBM Plex Mono" font-size="24" letter-spacing="1.5" fill="#55555C">STORY</text>
  </g>
  <g transform="translate(982 700)">
    <rect x="0" y="0" width="112" height="56" rx="28" fill="none" stroke="#A9A9B1" stroke-width="2"/>
    <circle cx="26" cy="28" r="9" fill="#F2DC2E"/>
    <text x="46" y="37" font-family="IBM Plex Mono" font-size="24" letter-spacing="1.5" fill="#55555C">LAB</text>
  </g>
  <g transform="translate(1110 700)">
    <rect x="0" y="0" width="156" height="56" rx="28" fill="none" stroke="#A9A9B1" stroke-width="2"/>
    <circle cx="26" cy="28" r="9" fill="#22B8D8"/>
    <text x="46" y="37" font-family="IBM Plex Mono" font-size="24" letter-spacing="1.5" fill="#55555C">NOTES</text>
  </g>

  <rect x="96" y="820" width="1480" height="2" fill="${LINE}"/>
  <text x="96" y="884" font-family="IBM Plex Mono" font-size="26" letter-spacing="2" fill="${MUTED}">10 MODULES · 39 LESSONS</text>
  <text x="1576" y="884" font-family="IBM Plex Mono" font-size="26" letter-spacing="2" fill="${MUTED}" text-anchor="end">NO SIGN-UP · NOTHING LEAVES YOUR BROWSER</text>
</svg>`

const png = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1672 },
  font: { fontDirs: [FONT_DIR], loadSystemFonts: false, defaultFontFamily: 'Archivo' }
}).render().asPng()

mkdirSync('public/work', { recursive: true })
writeFileSync('public/work/ai-course-cover.png', png)
console.log('wrote public/work/ai-course-cover.png', png.length, 'bytes')
