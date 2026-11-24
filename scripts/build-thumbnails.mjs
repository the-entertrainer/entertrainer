/**
 * Generates every card thumbnail on the site.
 *
 *   node scripts/build-thumbnails.mjs <dir with Fraunces/Archivo/SourceSerif4/IBMPlexMono TTFs>
 *
 * ── Why these are set, not drawn ─────────────────────────────────────────
 * The previous thumbnails were collage posters — torn paper, hand-drawn
 * arrows, doodled asterisks — made for the warm-paper identity this site no
 * longer has. Replacing them with better doodles was not the answer: a drawing
 * made by someone who is not an illustrator reads as exactly that, at any
 * level of effort. Type set properly does not have that failure mode.
 *
 * So each cover is one arresting line from the piece, in Fraunces, with one
 * word of it in the section's accent; a mono eyebrow above a hairline and a
 * mono colophon below one. No shapes, no icons, no ornament.
 *
 * ── The three things that make that work rather than look empty ──────────
 *  1. The card supplies the colour. `.card__art` paints the category accent,
 *     insets the sheet and gives it a hairline border, so a white cover reads
 *     as a page mounted on colour — not as a blank rectangle.
 *  2. The line is never the title. The card prints the title in HTML directly
 *     underneath, so repeating it here would waste the only line there is.
 *     These are pull-quotes and product names instead.
 *  3. Nothing is positioned by eye. Line width comes from the font's own hmtx
 *     table (scripts/lib/font-metrics.mjs), so the size is fitted to the
 *     measure, and the block is centred on its real ink extents — cap height
 *     to descender — rather than on its baselines. Covers with one line, two
 *     lines, or a line plus a standfirst all sit on the same optical centre,
 *     which is what makes the grid look even.
 *
 * ── Colour ───────────────────────────────────────────────────────────────
 * The card panel and the cover type use different values of the same hue. A
 * panel is a large field and can be bright; the same bright green as *text* on
 * white measures about 2:1 and is unreadable. Each accent therefore has an ink
 * variant here, measured to clear 4.5:1 on white.
 *
 * ── Fonts ────────────────────────────────────────────────────────────────
 * resvg has no variable-axis support, so the TTFs in <ttf-dir> must be static
 * instances cut at the axis values assets/css/main.css uses in the browser
 * (Fraunces wght 700 / SOFT 24 / WONK 1 / opsz 96, Archivo wght 600), each
 * carrying the plain family name — "Fraunces", not "Fraunces Bold". A face
 * whose name table says otherwise silently falls back to another family, which
 * is a mistake this file has already made once: every eyebrow rendered in a
 * serif because the mono's family name was "IBM Plex Mono Medium".
 */
import { Resvg } from '@resvg/resvg-js'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { loadFont } from './lib/font-metrics.mjs'

const FONT_DIR = process.argv[2]
if (!FONT_DIR || !existsSync(FONT_DIR)) {
  console.error('Usage: node scripts/build-thumbnails.mjs <ttf-dir>')
  process.exit(1)
}

const display = loadFont(join(FONT_DIR, 'Fraunces-Bold.ttf'))
const mono = loadFont(join(FONT_DIR, 'IBMPlexMono-Medium.ttf'))

/* ── Canvas ───────────────────────────────────────────────────────────────
   16:9 to match .card__art's aspect-ratio exactly, so `object-fit: contain`
   letterboxes nothing and the margins below are the margins on screen. */
const W = 1672, H = 941, M = 104
const MEASURE = W - M * 2

const PAPER = '#FFFFFF'
const INK = '#161618'
const MUTED = '#55555C'
const RULE = '#DCDCE0'

/* Text-safe accents, contrast measured against PAPER:
   blue 8.0 · red 4.6 · green 5.1 · purple 5.9 · cyan 4.8 */
const ACCENT = {
  practice: '#2C2BE8',
  projects: '#E02D18',
  tools: '#07793F',
  story: '#8B34D4',
  notes: '#0B7E9B'
}

/* Type scale. Every cover is set as large as its own words allow — bounded by
   the measure and by the band, whichever binds first — so a two-line quote
   fills its page as completely as a three-line one. The ceilings only stop a
   four-word line from setting half again as large as everything else and
   breaking the evenness of the grid. */
const PHRASE_MAX = 200
const EYEBROW = 26, EYEBROW_TRACK = 2.4
const LEADING = 1.06          // display type, tight

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/* A line may mark one run for the accent with pipes: "or a |century.|" — the
   turn the sentence takes, or the thing the piece is actually about. One run
   per cover; two accents in one line is a pattern, and a pattern stops being
   emphasis. */
const strip = (s) => s.replace(/\|/g, '')

function tspans(text, accent) {
  return text.split('|').map((p, i) =>
    p === '' ? '' : `<tspan${i % 2 ? ` fill="${accent}"` : ''}>${esc(p)}</tspan>`
  ).join('')
}

/* Rules sit a fixed distance in from the top and bottom; the display block is
   centred in the band between them. */
const BAND_TOP = M + 74
const BAND_BOTTOM = H - 132
/* Optical, not geometric: a block centred by arithmetic reads low, because the
   eye weights the space under a line more heavily than the space above it. */
const OPTICAL_CENTRE = BAND_TOP + (BAND_BOTTOM - BAND_TOP) * 0.475
/* How much of the band the display block may occupy. The remainder is the air
   that keeps the rules from feeling crowded by the type. */
const BAND_FILL = 0.84

/** Height of the set block at `size`, cap height down to descender. */
const inkHeight = (size, lineCount) =>
  size * display.capRatio
  + (lineCount - 1) * Math.round(size * LEADING)
  + size * display.descRatio

function cover({ accent, eyebrow, lines, meta }) {
  const a = ACCENT[accent]
  const plain = lines.map(strip)

  // Two constraints, and the smaller wins: the longest line has to clear the
  // measure, and the whole block has to clear the band between the rules.
  const band = (BAND_BOTTOM - BAND_TOP) * BAND_FILL
  let size = display.fit(plain, PHRASE_MAX, MEASURE)
  while (size > 8 && inkHeight(size, lines.length) > band) size--

  const leading = Math.round(size * LEADING)

  // Centre on the ink, not on the baselines: cap height above the first
  // baseline down to the descender below the last line.
  const capH = size * display.capRatio
  const firstBaseline = Math.round(
    OPTICAL_CENTRE - inkHeight(size, lines.length) / 2 + capH
  )

  const setLines = lines.map((l, i) =>
    `  <text x="${M}" y="${firstBaseline + i * leading}" font-family="Fraunces" font-weight="700" font-size="${size}" fill="${INK}">${tspans(l, a)}</text>`
  ).join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>

  <circle cx="${M + 9}" cy="${M + 34}" r="9" fill="${a}"/>
  <text x="${M + 32}" y="${M + 43}" font-family="IBM Plex Mono" font-size="${EYEBROW}" letter-spacing="${EYEBROW_TRACK}" fill="${MUTED}">${esc(eyebrow)}</text>
  <rect x="${M}" y="${BAND_TOP}" width="${MEASURE}" height="1.5" fill="${RULE}"/>

${setLines}

  <rect x="${M}" y="${BAND_BOTTOM}" width="${MEASURE}" height="1.5" fill="${RULE}"/>
  <text x="${M}" y="${H - 78}" font-family="IBM Plex Mono" font-size="${EYEBROW}" letter-spacing="${EYEBROW_TRACK}" fill="${MUTED}">${esc(meta)}</text>
  <text x="${W - M}" y="${H - 78}" font-family="IBM Plex Mono" font-size="${EYEBROW}" letter-spacing="${EYEBROW_TRACK}" fill="${MUTED}" text-anchor="end">ENTERTRAINER</text>
</svg>`
}

/* ── The covers ───────────────────────────────────────────────────────────
   Every line below is a phrase that already appears in the piece it fronts, or
   the product's own name. Nothing here is a claim invented for a cover, and
   the accent on each matches the category its card paints behind it. */
const COVERS = [
  { file: 'public/instructional-design.png', accent: 'practice',
    eyebrow: 'PRACTICE · INTERACTIVE',
    lines: ['Most of that work', 'is |subtraction.|'],
    meta: '4 MIN · PLAY IT IN THE PAGE' },

  { file: 'public/work-01.png', accent: 'projects',
    eyebrow: 'PROJECTS · COMIC',
    lines: ['True stories from', 'the |resort floor.|'],
    meta: '16 PAGES · CLUB MAHINDRA · 2023' },

  { file: 'public/strong.png', accent: 'projects',
    eyebrow: 'PROJECTS · INTERACTIVE',
    lines: ['A second,', 'or a |century.|'],
    meta: 'THE REAL MATH OF PASSWORD STRENGTH' },

  { file: 'public/work/ai-course-cover.png', accent: 'projects',
    eyebrow: 'PROJECTS · FREE COURSE',
    lines: ['Two collapses, and', 'one way to |read| the', 'next |announcement.|'],
    meta: '10 MODULES · A FULL DAY · NO SIGN-UP' },

  { file: 'public/about-me.png', accent: 'story',
    eyebrow: 'STORY · ESSAY',
    lines: ['Hotel floors to', '|learning design.|'],
    meta: 'FIVE STOPS · NAVEEN JOSE' },

  /* The four web apps take a line about what the app does, not the app's name.
     An earlier pass set the wordmark here — StoryGen at 240px — and the result
     was a card that said "StoryGen" in the picture, "StoryGen" in the title
     directly underneath, and its one-line description twice as well. The card
     already carries the name and the dek in HTML; the only thing the artwork
     can add is the proposition. */
  { file: 'public/storygen.png', accent: 'tools',
    eyebrow: 'WEB APP · STORYBOARDING',
    lines: ['An infinite canvas,', 'then a |Word file.|'],
    meta: 'FREE · NOTHING LEAVES YOUR BROWSER' },

  { file: 'public/training-cal-gen.png', accent: 'tools',
    eyebrow: 'WEB APP · PLANNING',
    lines: ['A list of topics in.', 'A |calendar| out.'],
    meta: 'FREE · NOTHING LEAVES YOUR BROWSER' },

  { file: 'public/easymcq.png', accent: 'tools',
    eyebrow: 'WEB APP · ASSESSMENT',
    lines: ['You write the right answer.', 'It writes the |wrong ones.|'],
    meta: 'FREE · NOTHING LEAVES YOUR BROWSER' },

  { file: 'public/better-emails.png', accent: 'tools',
    eyebrow: 'WEB APP · WRITING',
    lines: ['Messy draft in.', '|Sendable| email out.'],
    meta: 'FREE · NOTHING LEAVES YOUR BROWSER' }
]

/* The display line steps itself down to fit, but the colophon is set at a
   fixed size and would silently run under the wordmark on the right. Fail the
   build rather than ship a cover with two lines of mono overlapping. */
for (const c of COVERS) {
  const metaW = mono.advance(c.meta, EYEBROW, EYEBROW_TRACK)
  const markW = mono.advance('ENTERTRAINER', EYEBROW, EYEBROW_TRACK)
  if (metaW + markW + 60 > MEASURE) {
    console.error(`${c.file}: colophon line collides with the wordmark`)
    process.exit(1)
  }
}

mkdirSync('public/work', { recursive: true })
for (const c of COVERS) {
  const png = new Resvg(cover(c), {
    fitTo: { mode: 'width', value: W },
    font: { fontDirs: [FONT_DIR], loadSystemFonts: false, defaultFontFamily: 'Archivo' }
  }).render().asPng()
  writeFileSync(c.file, png)
  console.log(`${c.file.padEnd(38)} ${(png.length / 1024).toFixed(0)}KB`)
}
