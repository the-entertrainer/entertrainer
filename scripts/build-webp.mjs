/**
 * Convert the site's large source PNGs to WebP.
 *
 * The card artwork ships at 1.4–2.4 MB per file as 1920-wide PNG. Those same
 * files are both the /my-work and /tools card plates and the textures the home
 * spiral decodes into GPU memory, so every byte is paid for twice. At 1400px /
 * q0.82 they land around 100 KB with the torn-paper edges and hand lettering
 * intact — a ~95% saving.
 *
 * There is deliberately no `sharp` / `cwebp` / ImageMagick dependency here:
 * Chromium is already installed for the Playwright-based visual checks, and its
 * canvas encoder does the job. One less native build in the toolchain.
 *
 * Usage:
 *   node scripts/build-webp.mjs           # convert, keep originals
 *   node scripts/build-webp.mjs --check   # report what would change, write nothing
 */
import { chromium } from 'playwright-core'
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, basename } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(ROOT, 'public')
const CHECK = process.argv.includes('--check')

const MAX_WIDTH = 1400
const QUALITY = 0.82

/** Every PNG that is rendered as artwork somewhere. Orphans are not listed. */
const SOURCES = [
  'about-me.png', 'instructional-design.png', 'my-work.png', 'web-apps.png',
  'easymcq.png', 'storygen.png', 'training-cal-gen.png', 'better-emails.png',
  'work-01.png', 'work-02.png', 'work-03.png',
  'templates.png', 'frameworks.png', 'resources.png', 'downloads.png'
]

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium',
  args: ['--no-sandbox']
})
const page = await browser.newPage()

let savedBytes = 0
let converted = 0

for (const name of SOURCES) {
  const src = join(PUBLIC, name)
  if (!existsSync(src)) { console.log(`skip   ${name} (missing)`); continue }
  const dest = src.replace(/\.png$/, '.webp')

  const srcSize = statSync(src).size
  const b64 = readFileSync(src).toString('base64')

  const out = await page.evaluate(async ({ b64, quality, maxWidth }) => {
    const img = new Image()
    img.src = 'data:image/png;base64,' + b64
    await img.decode()
    const scale = Math.min(1, maxWidth / img.width)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return {
      data: canvas.toDataURL('image/webp', quality).split(',')[1],
      w: canvas.width, h: canvas.height
    }
  }, { b64, quality: QUALITY, maxWidth: MAX_WIDTH })

  const buf = Buffer.from(out.data, 'base64')
  const pct = (100 - (buf.length / srcSize) * 100).toFixed(1)
  savedBytes += srcSize - buf.length
  converted++

  if (!CHECK) writeFileSync(dest, buf)
  console.log(
    `${CHECK ? 'would ' : ''}write ${basename(dest).padEnd(28)} ` +
    `${out.w}x${out.h}  ${(srcSize / 1048576).toFixed(2)} MB -> ${(buf.length / 1024).toFixed(0)} KB  (-${pct}%)`
  )
}

await browser.close()
console.log(`\n${converted} file(s), ${(savedBytes / 1048576).toFixed(1)} MB saved`)
