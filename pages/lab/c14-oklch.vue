<script setup lang="ts">
import { LAB_NAV, CONCEPTS } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: '14 Colour That Behaves', robots: 'noindex' })
const C = CONCEPTS[13]

/**
 * OKLCH is perceptually uniform: hold L constant and every hue keeps the same
 * apparent lightness, which HSL emphatically does not — HSL yellow at 50%
 * lightness is far brighter than HSL blue at 50%. That property is what makes
 * a palette systematic instead of hand-tuned.
 *
 * Scrub the hue and watch: in the OKLCH row the contrast ratio barely moves; in
 * the HSL row it swings wildly. Contrast is computed live with the WCAG 2.1
 * relative-luminance formula, so the claim is checkable, not asserted.
 */
const hue = ref(255)
const L = 0.62, Ch = 0.16

// ── OKLCH → sRGB (Björn Ottosson's Oklab, then linear sRGB → gamma) ─────────
function oklchToRgb(l: number, c: number, hDeg: number): [number, number, number] {
  const h = (hDeg * Math.PI) / 180
  const a = c * Math.cos(h), b = c * Math.sin(h)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b
  const L3 = l_ ** 3, M3 = m_ ** 3, S3 = s_ ** 3
  const lin = [
    +4.0767416621 * L3 - 3.3077115913 * M3 + 0.2309699292 * S3,
    -1.2684380046 * L3 + 2.6097574011 * M3 - 0.3413193965 * S3,
    -0.0041960863 * L3 - 0.7034186147 * M3 + 1.7076147010 * S3
  ]
  return lin.map(v => {
    const cl = Math.max(0, Math.min(1, v))
    return Math.round(255 * (cl <= 0.0031308 ? 12.92 * cl : 1.055 * Math.pow(cl, 1 / 2.4) - 0.055))
  }) as [number, number, number]
}
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0), f(8), f(4)].map(v => Math.round(v * 255)) as [number, number, number]
}
/** WCAG 2.1 relative luminance. */
function lum([r, g, b]: [number, number, number]) {
  const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const ratio = (c: [number, number, number]) => {
  const a = lum(c), b = lum([255, 255, 255])
  return ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05))
}
const hex = (c: [number, number, number]) => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('')

const swatches = computed(() => LAB_NAV.map((it, i) => {
  const h = (hue.value + i * 32) % 360
  const ok = oklchToRgb(L, Ch, h)
  const hs = hslToRgb(h, 0.62, 0.52)
  return { it, h, ok, hs, okR: ratio(ok), hsR: ratio(hs), okHex: hex(ok), hsHex: hex(hs) }
}))
// Spread of contrast ratios across the row — the smaller, the more systematic.
const spread = (vals: number[]) => (Math.max(...vals) - Math.min(...vals)).toFixed(2)
const okSpread = computed(() => spread(swatches.value.map(s => s.okR)))
const hsSpread = computed(() => spread(swatches.value.map(s => s.hsR)))
</script>

<template>
  <LabShell bg="#111214" ink="#EDEEF0" pop="#8BE9FD" display="'Space Grotesk','DM Sans',sans-serif" :law="C.law">
    <div class="o">
      <header class="o__head">
        <h1 class="o__h1">Systems, not swatches.</h1>
        <p class="o__sub">Both rows rotate through the same hues. One holds its perceived lightness; the other doesn't. Drag the slider.</p>
        <label class="o__slider">
          <span>hue {{ Math.round(hue) }}°</span>
          <input type="range" min="0" max="359" v-model.number="hue" aria-label="Hue">
        </label>
      </header>

      <section class="o__row">
        <div class="o__rowhead"><b>OKLCH</b><span>L fixed at {{ L }} · C {{ Ch }}</span>
          <em>contrast spread <b>{{ okSpread }}</b></em></div>
        <ul class="o__sw">
          <li v-for="s in swatches" :key="'o' + s.it.href">
            <NuxtLink :to="s.it.href" :style="{ background: s.okHex }" class="o__chip">
              <span>{{ s.it.label }}</span>
              <em>{{ s.okR.toFixed(2) }}:1</em>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <section class="o__row">
        <div class="o__rowhead"><b>HSL</b><span>L fixed at 52%</span>
          <em>contrast spread <b class="bad">{{ hsSpread }}</b></em></div>
        <ul class="o__sw">
          <li v-for="s in swatches" :key="'h' + s.it.href">
            <div :style="{ background: s.hsHex }" class="o__chip o__chip--dead">
              <span>{{ s.it.label }}</span>
              <em>{{ s.hsR.toFixed(2) }}:1</em>
            </div>
          </li>
        </ul>
      </section>

      <p class="o__note">Ratios are against white, using the WCAG 2.1 relative-luminance formula. A smaller spread means the palette behaves the same whatever hue you reach for — which is the difference between a system and a set of favourites.</p>
    </div>
  </LabShell>
</template>

<style scoped>
.o { position: absolute; inset: 0; overflow-y: auto; padding: 60rem clamp(18rem, 4vw, 56rem) 76rem; display: grid; align-content: center; gap: 22rem; }
.o__head { max-width: 58ch; }
.o__h1 { margin: 0; font-size: clamp(28rem, 4.6vw, 50rem); line-height: 1.04; letter-spacing: -0.03em; font-weight: 600; }
.o__sub { margin: 12rem 0 16rem; font-family: 'DM Sans', sans-serif; font-size: 13rem; line-height: 1.55; color: var(--ink-70); }
.o__slider { display: flex; align-items: center; gap: 14rem; font-family: 'DM Sans', sans-serif; font-size: 12rem; color: var(--pop); }
.o__slider span { width: 74rem; font-variant-numeric: tabular-nums; }
.o__slider input { flex: 1; max-width: 380rem; accent-color: var(--pop); height: 26rem; }
.o__slider input:focus-visible { outline: 2px solid var(--pop); outline-offset: 3px; }

.o__row { display: grid; gap: 8rem; max-width: 960rem; }
.o__rowhead { display: flex; flex-wrap: wrap; align-items: baseline; gap: 12rem; font-family: 'DM Sans', sans-serif; font-size: 11.5rem; color: var(--ink-45); }
.o__rowhead b { color: var(--ink); font-size: 14rem; letter-spacing: 0.04em; }
.o__rowhead em { font-style: normal; margin-left: auto; }
.o__rowhead em b { color: var(--pop); }
.o__rowhead em b.bad { color: #FF6B6B; }

.o__sw { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8rem; }
.o__chip { display: grid; gap: 4rem; align-content: end; min-height: 96rem; padding: 12rem; border-radius: 12rem; text-decoration: none; color: #0B0B0C; }
.o__chip span { font-size: 13rem; font-weight: 700; line-height: 1.15; }
.o__chip em { font-style: normal; font-family: 'DM Sans', sans-serif; font-size: 10.5rem; opacity: 0.7; font-variant-numeric: tabular-nums; }
.o__chip:focus-visible { outline: 2px solid var(--pop); outline-offset: 3px; }
.o__chip--dead { cursor: default; }

.o__note { margin: 0; max-width: 76ch; font-family: 'DM Sans', sans-serif; font-size: 11.5rem; line-height: 1.6; color: var(--ink-45); }

@media (max-width: 640px) { .o__sw { grid-template-columns: repeat(2, 1fr); } }
</style>
