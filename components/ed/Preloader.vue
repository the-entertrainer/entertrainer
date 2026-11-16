<!--
  One intro, about 1.6s from mount. The film's order, compressed into a
  single gesture: still point, straightedge, first circle, vesica, then the
  yellow seal and the e. The construction fades and the favicon mark stays.
  GSAP animates transform and opacity only. Tap, Skip, or any key leaves
  early. Reduced motion holds the finished frame. A 2.2s cap in app.vue
  clears `inert` if this script never finishes.
-->
<script setup lang="ts">
import gsap from 'gsap'
import { eMark } from '~/utils/sacredGeometry'
import { openingSoundSrc } from '~/composables/useSiteSettings'
import { playIdentWithGraph, fadeIdentWithEcho, releaseIdentOnUnmount } from '~/utils/identAudioTrail'

const emit = defineEmits<{ release: []; complete: [] }>()
const { settings, prefersReducedMotion, hydrate } = useSiteSettings()

const M = eMark(50, 50, 50)
const r = M.r
const f = (n: number) => +n.toFixed(3)
const SQ3 = Math.sqrt(3)
const vx = f(50 + r / 2)
const vt = f(50 - (r * SQ3) / 2)
const vb = f(50 + (r * SQ3) / 2)
const vesica = `M${vx} ${vt}A${f(r)} ${f(r)} 0 0 1 ${vx} ${vb}A${f(r)} ${f(r)} 0 0 1 ${vx} ${vt}Z`

const root = ref<HTMLElement | null>(null)
const leaving = ref(false)
const reduced = ref(false)
let tl: gsap.core.Timeline | undefined
let doneTimer: number | undefined
let finished = false

function finish() {
  if (finished) return
  finished = true
  emit('complete')
}

function leave(fast = false) {
  if (leaving.value) return
  leaving.value = true
  tl?.kill()
  fadeIdentWithEcho()
  emit('release')
  doneTimer = window.setTimeout(finish, fast ? 140 : 200)
}

const onKey = () => leave(true)

onMounted(async () => {
  hydrate()
  reduced.value = prefersReducedMotion()
    || document.documentElement.dataset.reduceMotion === 'on'
  try { sessionStorage.setItem('entertrainer.preloader-done', '1') } catch { /* ignore */ }
  const src = openingSoundSrc(settings.value.openingSound)
  if (src && !reduced.value) { try { playIdentWithGraph(src) } catch { /* ignore */ } }
  window.addEventListener('keydown', onKey, { once: true })

  await nextTick()
  if (reduced.value) {
    doneTimer = window.setTimeout(() => leave(false), 420)
    return
  }

  const started = Number(document.documentElement.dataset.plT || Date.now())
  const budget = 1900 - (Date.now() - started)
  if (budget < 650) {
    reduced.value = true
    await nextTick()
    leave(true)
    return
  }

  const svg = root.value?.querySelector('svg')
  const word = root.value?.querySelector('.preloader__word-in')
  const point = svg?.querySelector('.pl-point')
  const edge = svg?.querySelector('.pl-edge')
  const bowl = svg?.querySelector('.pl-bowl')
  const partner = svg?.querySelector('.pl-partner')
  const ves = svg?.querySelector('.pl-vesica')
  const seal = svg?.querySelector('.pl-seal')
  const e = svg?.querySelector('.pl-e')
  const build = svg?.querySelector('.pl-build')
  if (!word || !point || !edge || !bowl || !partner || !ves || !seal || !e || !build) {
    leave(true)
    return
  }

  tl = gsap.timeline()
  tl.fromTo(point, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.16, ease: 'power2.out' }, 0)
  tl.fromTo(edge, { opacity: 0, scaleX: 0 }, { opacity: 0.8, scaleX: 1, duration: 0.22, ease: 'power2.out' }, 0.08)
  tl.fromTo(bowl, { opacity: 0, scale: 0.15 }, { opacity: 0.85, scale: 1, duration: 0.32, ease: 'power2.out' }, 0.16)
  tl.fromTo(partner, { opacity: 0, scale: 0.4 }, { opacity: 0.55, scale: 1, duration: 0.26, ease: 'power2.out' }, 0.32)
  tl.fromTo(ves, { opacity: 0, scale: 0.72 }, { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' }, 0.46)
  tl.fromTo(seal, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' }, 0.58)
  tl.to(build, { opacity: 0, duration: 0.24, ease: 'power2.in' }, 0.86)
  tl.fromTo(e, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.26, ease: 'power2.out' }, 0.94)
  tl.fromTo(word, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.24, ease: 'power2.out' }, 1.08)
  tl.call(() => leave(false), [], 1.38)

  const naturalMs = 1580
  if (budget < naturalMs) tl.timeScale(naturalMs / budget)
})

onBeforeUnmount(() => {
  if (doneTimer) window.clearTimeout(doneTimer)
  tl?.kill()
  window.removeEventListener('keydown', onKey)
  releaseIdentOnUnmount()
})
</script>

<template>
  <div
    ref="root"
    class="preloader"
    :class="{ 'preloader--leaving': leaving, 'preloader--still': reduced }"
    @click="leave(true)"
  >
    <div class="preloader__figure" aria-hidden="true">
      <svg class="preloader__svg" viewBox="0 0 100 100" focusable="false">
        <g class="pl-build">
          <line class="pl-edge" :x1="f(50 - r)" y1="50" :x2="f(50 + r)" y2="50" />
          <circle class="pl-bowl" cx="50" cy="50" :r="r" />
          <circle class="pl-partner" :cx="f(50 + r)" cy="50" :r="r" />
          <path class="pl-vesica" :d="vesica" />
          <circle class="pl-point" cx="50" cy="50" r="1.7" />
        </g>
        <circle class="pl-seal" cx="50" cy="50" r="50" />
        <path class="pl-e" :d="M.e" :stroke-width="M.stroke" />
      </svg>
      <p class="preloader__word"><span class="preloader__word-in">entertrainer</span></p>
    </div>
    <button type="button" class="preloader__skip" @click.stop="leave(true)">Skip</button>
    <span class="sr-only" role="status">Opening Entertrainer</span>
  </div>
</template>

<style scoped>
.preloader {
  --pl-paper: #F7F1E4;
  --pl-ink: #0B0B0C;
  --pl-yellow: #FFD43B;
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: grid;
  place-items: center;
  background: var(--pl-paper);
  color: var(--pl-ink);
  cursor: pointer;
  transition: opacity 200ms ease-in;
  contain: strict;
  animation: pl-retire 1ms linear 2200ms forwards;
}
.preloader--leaving { opacity: 0; pointer-events: none; }

.preloader__figure {
  position: relative;
  width: min(46vmin, 280px);
}
.preloader__svg { display: block; width: 100%; height: auto; overflow: visible; }

.pl-edge, .pl-bowl, .pl-partner, .pl-vesica, .pl-point, .pl-seal, .pl-e {
  transform-box: fill-box;
  transform-origin: center;
}
.pl-edge, .pl-bowl, .pl-partner {
  fill: none;
  stroke: var(--pl-ink);
  stroke-width: 0.8;
  opacity: 0;
}
.pl-vesica { fill: var(--pl-yellow); opacity: 0; }
.pl-point { fill: var(--pl-ink); opacity: 0; }
.pl-seal { fill: var(--pl-yellow); opacity: 0; }
.pl-e {
  fill: none;
  stroke: #161618;
  stroke-linejoin: miter;
  stroke-linecap: butt;
  opacity: 0;
}

.preloader__word {
  margin: 0.85rem 0 0;
  text-align: center;
}
.preloader__word-in {
  display: inline-block;
  font-family: var(--font-ui);
  font-weight: 720;
  font-size: clamp(1.125rem, 4.5vmin, 1.625rem);
  letter-spacing: -0.055em;
  color: var(--pl-ink);
  opacity: 0;
}

.preloader__skip {
  position: absolute;
  left: 50%;
  bottom: max(1rem, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  min-height: 2.75rem;
  min-width: 2.75rem;
  padding: 0.5rem 0.75rem;
  color: var(--pl-ink);
  background: transparent;
  font: 500 0.75rem/1 var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: underline;
  text-underline-offset: 0.2em;
  cursor: pointer;
}
.preloader__skip:focus-visible {
  outline: 2px solid var(--pl-ink);
  outline-offset: 3px;
}

@keyframes pl-retire { to { opacity: 0; visibility: hidden; pointer-events: none; } }

.preloader--still .pl-build { opacity: 0; }
.preloader--still .pl-seal,
.preloader--still .pl-e,
.preloader--still .preloader__word-in { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
  .preloader { animation: none; transition: none; }
  .pl-build { opacity: 0; }
  .pl-seal, .pl-e, .preloader__word-in { opacity: 1; transform: none; }
}
</style>

<style>
html[data-theme="dark"] .preloader {
  --pl-paper: #16140F;
  --pl-ink: #F7F1E4;
}
html[data-preloader="done"] .preloader { display: none; }
html[data-reduce-motion="on"] .preloader { animation: none; transition: none; }
html[data-reduce-motion="on"] .preloader .pl-build { opacity: 0; }
html[data-reduce-motion="on"] .preloader .pl-seal,
html[data-reduce-motion="on"] .preloader .pl-e,
html[data-reduce-motion="on"] .preloader .preloader__word-in { opacity: 1; transform: none; }
</style>
