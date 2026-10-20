<!--
  The opening: the Flower of Life is constructed with a compass, the e-mark
  resolves out of it, then the page is revealed. 2.0 s total, once per tab
  session, skippable (tap or any key), static under reduced motion (OS
  setting or html[data-reduce-motion="on"]). Only opacity, transform and
  stroke-dashoffset animate. Geometry: utils/sacredGeometry.ts.

  r = the e's bowl radius = R/φ (R = seal radius 50). Every centre sits on the
  hexagonal lattice at 60° steps, exactly r (or r·√3, 2r) from the still point.
  Times are 1000ms · φ^-n (618, 382, 236, 146, 90, 56, 34).

  0      the still point; the first circle (the bowl) sweeps out
  236    Seed of Life: six circles on its rim, 60° apart, 56ms apart
  382    the vesica piscis (bowl ∩ right circle) is traced in cobalt; its lower
         tip is exactly where the e's stroke ends
  618    Flower of Life: the twelve circles of the second ring, 34ms apart
  854    Metatron's hexagram joins the six 2r centres
  1000   the yellow seal opens from the centre
  1146   the e is drawn: crossbar, then the long way round to the vesica tip
  1236   construction fades; the word arrives
  1760   the page is revealed (240ms fade)
-->
<script setup lang="ts">
import { eMark, circlePath } from '~/utils/sacredGeometry'
import { openingSoundSrc } from '~/composables/useSiteSettings'
import { playIdentWithGraph, fadeIdentWithEcho, releaseIdentOnUnmount } from '~/utils/identAudioTrail'

const emit = defineEmits<{ complete: [] }>()
const { settings, prefersReducedMotion, hydrate } = useSiteSettings()

const M = eMark(50, 50, 50)
const r = M.r
const f = (n: number) => +n.toFixed(3)
const at = (dist: number, deg: number) => ({ cx: 50 + dist * Math.cos(deg * Math.PI / 180), cy: 50 + dist * Math.sin(deg * Math.PI / 180), r })
const SQ3 = Math.sqrt(3)
/** Seed: six centres on the bowl's rim at 0°, 60° … 300° (0° is the e's right vesica partner). */
const seed = [0, 1, 2, 3, 4, 5].map(k => circlePath(at(r, 60 * k)))
/** Flower, second ring: 2r on the axes and r·√3 on the bisectors, interleaved around the dial. */
const outer = [0, 1, 2, 3, 4, 5].flatMap(k => [circlePath(at(2 * r, 60 * k)), circlePath(at(r * SQ3, 60 * k + 30))])
/** Metatron's hexagram over the six 2r centres: two triangles. */
const hex = [0, 1, 2, 3, 4, 5].map(k => at(2 * r, 60 * k))
const tri = (a: number[]) => 'M' + a.map(i => `${f(hex[i]!.cx)} ${f(hex[i]!.cy)}`).join('L') + 'Z'
const metatron = [tri([0, 2, 4]), tri([1, 3, 5])]
/** Vesica piscis of the bowl and its right partner; tips at x = 50 + r/2, y = 50 ± r·√3/2. */
const vx = f(50 + r / 2), vt = f(50 - r * SQ3 / 2), vb = f(50 + r * SQ3 / 2)
const vesica = `M${vx} ${vt}A${f(r)} ${f(r)} 0 0 1 ${vx} ${vb}A${f(r)} ${f(r)} 0 0 1 ${vx} ${vt}Z`
const construction = { bowl: circlePath(M.bowl), seed, outer, metatron, vesica }

/** Total time on screen, normal motion; the reveal fade is the last 240ms. */
const TOTAL_MS = 2000
const REDUCED_MS = 650
const FADE_MS = 240

const root = ref<HTMLElement | null>(null)
const leaving = ref(false)
const reduced = ref(false)
let leaveTimer: number | undefined
let doneTimer: number | undefined
let finished = false

function finish() {
  if (finished) return
  finished = true
  emit('complete')
}

function leave(fast = false) {
  if (leaving.value) return
  if (leaveTimer) window.clearTimeout(leaveTimer)
  leaving.value = true
  fadeIdentWithEcho()
  doneTimer = window.setTimeout(finish, fast ? 160 : FADE_MS)
}

const onKey = () => leave(true)

onMounted(() => {
  hydrate()
  reduced.value = prefersReducedMotion()
  try { sessionStorage.setItem('entertrainer.preloader-done', '1') } catch { /* ignore */ }
  const src = openingSoundSrc(settings.value.openingSound)
  // Without a tap the browser usually refuses; that is fine and silent.
  if (src && !reduced.value) { try { playIdentWithGraph(src) } catch { /* ignore */ } }
  // The CSS timeline starts when the styles first apply (SSR paint), not at
  // mount: read how far it has already run and only wait for what is left.
  let elapsed = 0
  try {
    const a = root.value?.getAnimations?.().find(x => (x as CSSAnimation).animationName === 'pl-retire')
    elapsed = Number(a?.currentTime ?? 0)
  } catch { /* older browsers: start the clock now */ }
  const left = (reduced.value ? REDUCED_MS : TOTAL_MS) - FADE_MS - elapsed
  leaveTimer = window.setTimeout(() => leave(), Math.max(reduced.value ? 300 : 120, left))
  window.addEventListener('keydown', onKey, { once: true })
})

onBeforeUnmount(() => {
  if (leaveTimer) window.clearTimeout(leaveTimer)
  if (doneTimer) window.clearTimeout(doneTimer)
  window.removeEventListener('keydown', onKey)
  releaseIdentOnUnmount()
})
</script>

<template>
  <div
    ref="root"
    class="preloader"
    :class="{ 'preloader--leaving': leaving, 'preloader--still': reduced }"
    role="presentation"
    @click="leave(true)"
  >
    <div class="preloader__figure">
      <svg class="preloader__svg" viewBox="-30 -30 160 160" aria-hidden="true" focusable="false">
        <!-- The mark (stays) -->
        <circle class="pl-seal" cx="50" cy="50" r="50" />
        <path class="pl-e" :d="M.e" :stroke-width="M.stroke" pathLength="1" />
        <!-- Construction, drawn over the seal so the vesica reads through it; fades away -->
        <g class="pl-build">
          <path v-for="(d, i) in construction.metatron" :key="'m' + i" class="pl-line pl-line--meta" :style="{ '--t': `${854 + 90 * i}ms` }" :d="d" pathLength="1" />
          <path v-for="(d, i) in construction.outer" :key="'o' + i" class="pl-line pl-line--outer" :style="{ '--t': `${618 + 34 * i}ms` }" :d="d" pathLength="1" />
          <path v-for="(d, i) in construction.seed" :key="'s' + i" class="pl-line pl-line--seed" :style="{ '--t': `${236 + 56 * i}ms` }" :d="d" pathLength="1" />
          <path class="pl-line pl-line--bowl" :d="construction.bowl" pathLength="1" />
          <path class="pl-line pl-line--vesica" :d="construction.vesica" pathLength="1" />
          <circle class="pl-point" cx="50" cy="50" r="1.4" />
        </g>
      </svg>
      <span class="preloader__word">entertrainer</span>
    </div>
    <span class="sr-only" role="status">Opening Entertrainer</span>
  </div>
</template>

<style scoped>
.preloader {
  --pl-paper: #F7F1E4;
  --pl-ink: #0B0B0C;
  --pl-cobalt: #2F5BD8;
  --pl-ease: cubic-bezier(.65, 0, .35, 1);
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: grid;
  place-items: center;
  background: var(--pl-paper);
  color: var(--pl-ink);
  cursor: pointer;
  transition: opacity 240ms ease-out;
  contain: strict;
  /* Never block if scripts fail: the overlay retires itself. */
  animation: pl-retire 1ms linear 3200ms forwards;
}
.preloader--leaving { opacity: 0; pointer-events: none; }

.preloader__figure {
  position: relative;
  width: min(56vmin, 320px);
  aspect-ratio: 1;
}
.preloader__svg { display: block; width: 100%; height: 100%; overflow: visible; }

/* Construction: hairlines, ~1-1.5px at the drawn size (0.75 of 160 units). */
.pl-line {
  fill: none;
  stroke: var(--pl-ink);
  stroke-width: .75;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  visibility: hidden;
  opacity: .7;
  animation: pl-draw var(--d, 420ms) var(--pl-ease) var(--t, 0ms) forwards;
}
.pl-line--bowl   { --t: 0ms;   --d: 382ms; }
.pl-line--seed   { --d: 382ms; opacity: .55; }
.pl-line--vesica { --t: 382ms; --d: 382ms; stroke: var(--pl-cobalt); stroke-width: 1; opacity: 1; }
.pl-line--outer  { --d: 236ms; opacity: .3; }
.pl-line--meta   { --d: 382ms; opacity: .35; }
.pl-point {
  fill: var(--pl-ink);
  transform-box: fill-box;
  transform-origin: center;
  opacity: 0;
  animation: pl-pop 146ms var(--pl-ease) 0ms forwards;
}
.pl-build { animation: pl-fade 236ms ease-in 1236ms forwards; }

.pl-seal {
  fill: #FFD43B;
  transform-box: fill-box;
  transform-origin: center;
  transform: scale(0);
  animation: pl-seal 382ms cubic-bezier(.2, .8, .2, 1) 1000ms forwards;
}
.pl-e {
  fill: none;
  stroke: #161618;
  stroke-linejoin: miter;
  stroke-linecap: butt;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  visibility: hidden;
  animation: pl-draw 382ms var(--pl-ease) 1146ms forwards;
}
.preloader__word {
  position: absolute;
  left: 50%;
  top: calc(100% * 130 / 160 + 18rem);
  font-family: var(--font-ui);
  font-weight: 720;
  font-size: clamp(18rem, 5vmin, 26rem);
  letter-spacing: -.055em;
  opacity: 0;
  transform: translate(-50%, 6rem);
  animation: pl-word 236ms var(--pl-ease) 1236ms forwards;
}

/* visibility keeps butt-cap slivers from showing before a stroke starts */
@keyframes pl-draw { from { stroke-dashoffset: 1; visibility: visible; } to { stroke-dashoffset: 0; visibility: visible; } }
@keyframes pl-pop { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }
@keyframes pl-fade { to { opacity: 0; } }
@keyframes pl-retire { to { opacity: 0; visibility: hidden; pointer-events: none; } }
@keyframes pl-seal { to { transform: scale(1); } }
@keyframes pl-word { to { opacity: 1; transform: translate(-50%, 0); } }

/* Reduced motion: one still frame — the finished mark and word — then a short fade. */
.preloader--still *, .preloader--still { animation: none !important; }
.preloader--still .pl-build { opacity: 0; }
.preloader--still .pl-seal { transform: none; }
.preloader--still .pl-e { stroke-dashoffset: 0; visibility: visible; }
.preloader--still .preloader__word { opacity: 1; transform: translate(-50%, 0); }
@media (prefers-reduced-motion: reduce) {
  .preloader *, .preloader { animation: none !important; }
  .pl-build { opacity: 0; }
  .pl-seal { transform: none; }
  .pl-e { stroke-dashoffset: 0; visibility: visible; }
  .preloader__word { opacity: 1; transform: translate(-50%, 0); }
}
</style>

<style>
/* Unscoped on purpose: Vue's :global(a) b drops b. */
html[data-theme="dark"] .preloader { --pl-paper: #0B0B0C; --pl-ink: #F7F1E4; --pl-cobalt: #5B7FE6; }
html[data-preloader="done"] .preloader { display: none; }
html[data-reduce-motion="on"] .preloader, html[data-reduce-motion="on"] .preloader * { animation: none !important; }
html[data-reduce-motion="on"] .preloader .pl-build { opacity: 0; }
html[data-reduce-motion="on"] .preloader .pl-seal { transform: none; }
html[data-reduce-motion="on"] .preloader .pl-e { stroke-dashoffset: 0; visibility: visible; }
html[data-reduce-motion="on"] .preloader .preloader__word { opacity: 1; transform: translate(-50%, 0); }
</style>
