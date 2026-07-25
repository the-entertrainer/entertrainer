import pw from '/opt/node22/lib/node_modules/playwright/index.js'
const { chromium } = pw

/**
 * Exposure gate for the card artwork.
 *
 * Eyeballing a screenshot and calling it "better" is exactly how a blown-out
 * card shipped. This measures it: crop the focused card, build a luminance
 * histogram, and fail on clipping. A print is overexposed when a meaningful
 * area of it has been crushed to pure white and lost all detail.
 *
 * Budget: clipped (L >= 250) must be under 0.5% of the card, and near-clipped
 * (L >= 242) under 4%. Also reports p99 and mean so a change can be compared
 * rather than argued about.
 */
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader'] })
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: 'dark' })
const page = await ctx.newPage()
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForTimeout(16000)

// The focused card sits centred; crop its inner print, clear of the glass mat.
const CLIP = { x: 380, y: 150, width: 680, height: 400 }
// Every card, not just the first. The four prints have very different tonal
// makeups — one is mostly pale paper, another mostly flat colour — so a ramp
// tuned against a single one can quietly crush the others.
const shots = []
for (let i = 0; i < 4; i++) {
  shots.push(await page.screenshot({ clip: CLIP }))
  await page.keyboard.press('ArrowDown')
  await page.waitForTimeout(9000)
}
await ctx.close()

const p2 = await (await b.newContext()).newPage()
const measure = async (shot) => {
await p2.setContent(`<img id="i" src="data:image/png;base64,${shot.toString('base64')}">`)
await p2.waitForFunction(() => document.getElementById('i')?.complete)
return p2.evaluate(() => {
  const img = document.getElementById('i')
  const c = document.createElement('canvas')
  c.width = img.naturalWidth; c.height = img.naturalHeight
  const g = c.getContext('2d'); g.drawImage(img, 0, 0)
  const d = g.getImageData(0, 0, c.width, c.height).data
  const hist = new Array(256).fill(0)
  let n = 0, sum = 0
  for (let i = 0; i < d.length; i += 4) {
    const l = Math.round(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2])
    hist[l]++; n++; sum += l
  }
  const pct = (from) => { let s = 0; for (let l = from; l < 256; l++) s += hist[l]; return (s / n) * 100 }
  let acc = 0, p99 = 255
  for (let l = 0; l < 256; l++) { acc += hist[l]; if (acc >= n * 0.99) { p99 = l; break } }
  return { clipped: +pct(250).toFixed(2), near: +pct(242).toFixed(2), bright: +pct(230).toFixed(2), mean: +(sum / n).toFixed(1), p99 }
})
}

let pass = true
for (let i = 0; i < shots.length; i++) {
  const s = await measure(shots[i])
  const ok = s.clipped < 0.5 && s.near < 4
  if (!ok) pass = false
  console.log(`card ${i + 1}  clipped(>=250) ${String(s.clipped).padStart(5)}%  near(>=242) ${String(s.near).padStart(5)}%  bright(>=230) ${String(s.bright).padStart(5)}%  mean ${s.mean}  p99 ${s.p99}  ${ok ? 'ok' : 'CRUSHED'}`)
}
await b.close()

console.log(pass ? 'PASS — every card retains detail in the highlights'
                 : 'FAIL — highlights are crushed; a print has lost detail')
process.exit(pass ? 0 : 1)
