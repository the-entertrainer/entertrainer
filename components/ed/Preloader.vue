<!--
  The opening: the mark is constructed with compass and straightedge, then the
  page is revealed. ~1.6 s, once per tab session, skippable (tap or any key),
  static under reduced motion. Only opacity, transform and stroke-dashoffset
  animate. Geometry: utils/sacredGeometry.ts → eMark.

  0      the still point
  80     the straightedge (the line the crossbar will sit on)
  140    the first circle — the bowl — sweeps out
  400    two circles on its rim make the vesica; the right one (cobalt) is the cut
  760    the yellow seal opens from the centre
  860    the e is drawn: crossbar, then the long way round to the vesica cut
  1120   construction lines fade; the word arrives
  1360   the page is revealed
-->
<script setup lang="ts">
import { eMark, circlePath } from '~/utils/sacredGeometry'
import { openingSoundSrc } from '~/composables/useSiteSettings'
import { playIdentWithGraph, fadeIdentWithEcho, releaseIdentOnUnmount } from '~/utils/identAudioTrail'

const emit = defineEmits<{ complete: [] }>()
const { settings, prefersReducedMotion, hydrate } = useSiteSettings()

const M = eMark(50, 50, 50)
const construction = {
  bowl: circlePath(M.bowl),
  left: circlePath(M.left),
  right: circlePath(M.right),
  line: `M${-22} 50H${122}`
}

/** Total time on screen, normal motion; the reveal fade is the last 240ms. */
const TOTAL_MS = 1520
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
          <path class="pl-line pl-line--edge" :d="construction.line" pathLength="1" />
          <path class="pl-line pl-line--bowl" :d="construction.bowl" pathLength="1" />
          <path class="pl-line pl-line--left" :d="construction.left" pathLength="1" />
          <path class="pl-line pl-line--right" :d="construction.right" pathLength="1" />
          <circle class="pl-point" cx="50" cy="50" r="1.4" />
          <circle class="pl-point pl-point--l" cx="19.098" cy="50" r="1.1" />
          <circle class="pl-point pl-point--r" cx="80.902" cy="50" r="1.1" />
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
.pl-line--edge  { --t: 80ms;  --d: 520ms; opacity: .4; }
.pl-line--bowl  { --t: 140ms; --d: 460ms; }
.pl-line--left  { --t: 400ms; --d: 400ms; opacity: .4; }
.pl-line--right { --t: 440ms; --d: 400ms; stroke: var(--pl-cobalt); opacity: 1; }
.pl-point {
  fill: var(--pl-ink);
  transform-box: fill-box;
  transform-origin: center;
  opacity: 0;
  animation: pl-pop 220ms var(--pl-ease) var(--t, 0ms) forwards;
}
.pl-point--l { --t: 380ms; }
.pl-point--r { --t: 420ms; fill: var(--pl-cobalt); }
.pl-build { animation: pl-fade 280ms ease-in 1080ms forwards; }

.pl-seal {
  fill: #FFD43B;
  transform-box: fill-box;
  transform-origin: center;
  transform: scale(0);
  animation: pl-seal 380ms cubic-bezier(.2, .8, .2, 1) 760ms forwards;
}
.pl-e {
  fill: none;
  stroke: #161618;
  stroke-linejoin: miter;
  stroke-linecap: butt;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  visibility: hidden;
  animation: pl-draw 360ms var(--pl-ease) 860ms forwards;
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
  animation: pl-word 320ms var(--pl-ease) 1040ms forwards;
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
</style>
