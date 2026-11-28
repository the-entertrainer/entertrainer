<script setup lang="ts">
/**
 * The colophon's live specimen: the type axes, colour tokens and motion
 * tokens the site actually uses, read from the stylesheet at runtime so the
 * page can't drift from the build.
 */
interface Axis { tag: string; label: string; min: number; max: number; step: number; value: number }
interface Face { id: string; name: string; job: string; family: string; sample: string; axes: Axis[]; size: string }

const faces = reactive<Face[]>([
  { id: 'fraunces', name: 'Fraunces', job: 'Display', family: 'var(--font-display)', sample: 'Entertrainer', size: 'clamp(48px, 7vw, 104px)',
    axes: [
      { tag: 'opsz', label: 'Optical size', min: 9, max: 144, step: 1, value: 144 },
      { tag: 'wght', label: 'Weight', min: 100, max: 900, step: 1, value: 400 },
      { tag: 'SOFT', label: 'Soft', min: 0, max: 100, step: 1, value: 40 },
      { tag: 'WONK', label: 'Wonk', min: 0, max: 1, step: 1, value: 1 }
    ] },
  { id: 'archivo', name: 'Archivo', job: 'Interface', family: 'var(--font-body)', sample: 'Open the tool', size: 'clamp(32px, 4vw, 56px)',
    axes: [
      { tag: 'wght', label: 'Weight', min: 100, max: 900, step: 1, value: 700 },
      { tag: 'wdth', label: 'Width', min: 62, max: 125, step: 1, value: 100 }
    ] },
  { id: 'serif', name: 'Source Serif 4', job: 'Reading', family: 'var(--font-reading)', sample: 'A paragraph meant to be read.', size: 'clamp(24px, 2.6vw, 36px)',
    axes: [
      { tag: 'opsz', label: 'Optical size', min: 8, max: 60, step: 1, value: 20 },
      { tag: 'wght', label: 'Weight', min: 200, max: 900, step: 1, value: 400 }
    ] }
])
const fvs = (f: Face) => f.axes.map(a => `"${a.tag}" ${a.value}`).join(', ')

const COLOURS = [
  { token: '--paper', name: 'Paper' },
  { token: '--paper-2', name: 'Paper 2' },
  { token: '--ink', name: 'Ink' },
  { token: '--accent', name: 'Signal yellow (fill)' },
  { token: '--accent-text', name: 'Signal on paper (text)' },
  { token: '--muted', name: 'Muted' }
]
const resolved = ref<Record<string, { hex: string; ratio: string }>>({})

function parse(c: string): [number, number, number] | null {
  const m = c.match(/rgba?\(([^)]+)\)/)
  if (m) { const [r, g, b] = m[1]!.split(/[ ,/]+/).map(Number); return [r!, g!, b!] }
  const h = c.trim().replace('#', '')
  if (/^[0-9a-f]{6}$/i.test(h)) return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)) as [number, number, number]
  return null
}
const lum = ([r, g, b]: [number, number, number]) => {
  const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const hex = (c: [number, number, number]) => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()

function measure() {
  const probe = document.createElement('span')
  document.body.appendChild(probe)
  const out: Record<string, { hex: string; ratio: string }> = {}
  probe.style.color = 'var(--paper)'
  const paper = parse(getComputedStyle(probe).color)
  for (const c of COLOURS) {
    probe.style.color = `var(${c.token})`
    const rgb = parse(getComputedStyle(probe).color)
    if (!rgb || !paper) continue
    const a = lum(rgb), b = lum(paper)
    out[c.token] = { hex: hex(rgb), ratio: ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2) }
  }
  probe.remove()
  resolved.value = out
}

const MOTION = [
  { token: '--ease-ink', dur: '--dur-slow', name: 'Ink', use: 'Text and rules arriving' },
  { token: '--ease-stamp', dur: '--dur-mid', name: 'Stamp', use: 'Badges, the sun, results' },
  { token: '--ease-sun', dur: '--dur-slow', name: 'Sun', use: 'Slow rises and glides' },
  { token: '--ease-exit', dur: '--dur-fast', name: 'Exit', use: 'Leaving, always quicker' }
]
const played = ref<string | null>(null)
let t: ReturnType<typeof setTimeout> | undefined
function play(name: string) {
  played.value = null
  requestAnimationFrame(() => { played.value = name })
  clearTimeout(t)
  t = setTimeout(() => { played.value = null }, 1600)
}

let mo: MutationObserver | undefined
onMounted(() => {
  measure()
  mo = new MutationObserver(measure)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] })
})
onBeforeUnmount(() => { mo?.disconnect(); clearTimeout(t) })
</script>

<template>
  <div class="sp">
    <section class="sp__block" aria-labelledby="sp-type">
      <h3 id="sp-type" class="sp__h t-mono">Type, with the axes left unlocked</h3>
      <div v-for="f in faces" :key="f.id" class="sp__face">
        <p class="sp__meta t-mono"><b>{{ f.name }}</b> · {{ f.job }}</p>
        <p class="sp__sample" :style="{ fontFamily: f.family, fontVariationSettings: fvs(f), fontSize: f.size }" contenteditable="plaintext-only" spellcheck="false">{{ f.sample }}</p>
        <div class="sp__axes">
          <label v-for="a in f.axes" :key="a.tag" class="sp__axis">
            <span class="t-mono">{{ a.label }} <output>{{ a.value }}</output></span>
            <input v-model.number="a.value" type="range" :min="a.min" :max="a.max" :step="a.step">
          </label>
        </div>
      </div>
    </section>

    <section class="sp__block" aria-labelledby="sp-colour">
      <h3 id="sp-colour" class="sp__h t-mono">Colour, measured against paper</h3>
      <ul class="sp__swatches">
        <li v-for="c in COLOURS" :key="c.token" class="sp__swatch">
          <span class="sp__chip" :style="{ background: `var(${c.token})` }" aria-hidden="true" />
          <span class="sp__sw-name">{{ c.name }}</span>
          <code class="t-mono">{{ c.token }} {{ resolved[c.token]?.hex || '' }}</code>
          <span v-if="resolved[c.token]" class="sp__ratio t-mono" :class="{ 'is-pass': Number(resolved[c.token]!.ratio) >= 4.5 }">{{ resolved[c.token]!.ratio }}:1</span>
        </li>
      </ul>
      <p class="sp__note">The ratio is read live from this page, so it follows the theme switch. Yellow is a fill, never text on paper.</p>
    </section>

    <section class="sp__block" aria-labelledby="sp-motion">
      <h3 id="sp-motion" class="sp__h t-mono">Motion, the four press curves</h3>
      <ul class="sp__motion">
        <li v-for="m in MOTION" :key="m.name">
          <button type="button" class="sp__curve" :class="{ 'is-on': played === m.name }" :style="{ '--e': `var(${m.token})`, '--d': `var(${m.dur})` }" @click="play(m.name)">
            <span class="sp__track" aria-hidden="true"><i /></span>
            <span class="sp__c-name">{{ m.name }}</span>
            <span class="sp__c-use">{{ m.use }}</span>
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.sp { display: grid; gap: clamp(34rem, 5vw, 55rem); }
.sp__h { margin: 0 0 var(--space-21); padding-bottom: 12rem; border-bottom: var(--stroke) solid var(--line); color: var(--muted); }
.sp__face { padding: var(--space-21) 0; border-bottom: var(--stroke) solid var(--line); }
.sp__meta { margin: 0; color: var(--muted); }
.sp__meta b { color: var(--ink); font-weight: 600; }
.sp__sample { margin: var(--space-13) 0; line-height: 1; letter-spacing: -.02em; overflow-wrap: anywhere; outline-offset: 6rem; }
.sp__axes { display: grid; grid-template-columns: repeat(auto-fit, minmax(170rem, 1fr)); gap: var(--space-13) var(--space-21); }
.sp__axis { display: grid; gap: 6rem; }
.sp__axis span { display: flex; justify-content: space-between; color: var(--muted); }
.sp__axis output { color: var(--ink); }
.sp__axis input { width: 100%; accent-color: var(--ink); }

.sp__swatches { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(200rem, 1fr)); gap: var(--space-13); }
.sp__swatch { display: grid; grid-template-columns: 44rem 1fr; grid-template-rows: auto auto auto; column-gap: var(--space-13); align-items: center; padding: var(--space-13); border: var(--stroke) solid var(--line); border-radius: var(--radius-m, 10rem); background: var(--paper); }
.sp__chip { grid-row: 1 / span 3; width: 44rem; height: 44rem; border-radius: 50%; box-shadow: inset 0 0 0 1px var(--line-strong); }
.sp__sw-name { font-weight: 600; font-size: 15rem; }
.sp__swatch code { font-size: 12rem; color: var(--muted); }
.sp__ratio { font-size: 12rem; color: var(--muted); }
.sp__ratio.is-pass { color: var(--ink); }
.sp__ratio.is-pass::after { content: ' passes AA'; }
.sp__note { margin: var(--space-13) 0 0; font: 400 15rem/1.5 var(--font-reading); color: var(--muted); max-width: 60ch; }

.sp__motion { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(220rem, 1fr)); gap: var(--space-13); }
.sp__curve { width: 100%; display: grid; gap: 6rem; justify-items: start; text-align: left; padding: var(--space-13) var(--space-13) var(--space-21); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m, 10rem); background: var(--paper); color: var(--ink); cursor: pointer; font: inherit; }
.sp__curve:hover { background: var(--paper-2); }
.sp__track { position: relative; width: 100%; height: 22rem; margin-bottom: 6rem; border-bottom: 2px solid var(--ink); }
.sp__track i { position: absolute; left: 0; bottom: -7rem; width: 12rem; height: 12rem; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 2px var(--ink); transform: translateX(0); }
.sp__curve.is-on .sp__track i { left: calc(100% - 12rem); transition: left var(--d) var(--e); }
.sp__c-name { font: 600 var(--type-card, 20rem)/1.1 var(--font-display); }
.sp__c-use { font-size: 14rem; color: var(--muted); }
@media (prefers-reduced-motion: reduce) { .sp__curve.is-on .sp__track i { transition: none; } }
html[data-reduce-motion="on"] .sp__curve.is-on .sp__track i { transition: none; }
</style>
