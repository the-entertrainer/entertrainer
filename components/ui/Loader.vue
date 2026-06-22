<script setup lang="ts">
import gsap from 'gsap'
import { useExperienceStore } from '~/stores/experience'
import SoundEngine from '~/experience/SoundEngine'

const emit = defineEmits<{ (e: 'entered'): void }>()

const experienceStore = useExperienceStore()
const isReady         = computed(() => experienceStore.isReady)

const loaderEl = ref<HTMLElement | null>(null)
const textEl   = ref<HTMLElement | null>(null)
const dotEl    = ref<HTMLElement | null>(null)
const anchorEl = ref<HTMLElement | null>(null)

// Clip path sweeps the wordmark text in/out (right edge moves).
// Negative top/bottom/left preserves italic overhang and descenders.
const CLIP_HIDDEN = 'inset(-25% 100% -25% -3%)'
const CLIP_SHOWN  = 'inset(-25% 0% -25% -3%)'

// The dot is always 48px × 48px (= --chrome-size).
// PERIOD_SCALE shrinks it down to look like a trailing period in the wordmark.
const DOT_PX       = 48
const PERIOD_SCALE = 0.44   // 48 × 0.44 ≈ 21px visual period size

const reduceMotion = import.meta.client &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Saved period position (screen-centre-relative) for use in the exit phase.
let periodX = 0
let periodY = 0

let introTl:    gsap.core.Timeline | null = null
let introDone   = false
let pendingExit = false
let exitQueued  = false
let exiting     = false

onMounted(async () => {
  if (import.meta.client && (document as any).fonts?.ready) {
    try { await (document as any).fonts.ready } catch {}
  }
  await nextTick()
  startIntro()
})

onUnmounted(() => { introTl?.kill() })

function startIntro() {
  if (!dotEl.value || !textEl.value) return

  // Where should the dot land as the trailing period?
  // Measure after font load so the text width is accurate.
  const tr     = textEl.value.getBoundingClientRect()
  const winCX  = window.innerWidth  / 2
  const winCY  = window.innerHeight / 2
  const dotVis = DOT_PX * PERIOD_SCALE        // visual size at period scale
  // Centre of the dot when acting as the period: right after text + small gap
  periodX = tr.right + 4 + dotVis / 2 - winCX
  periodY = tr.top + tr.height / 2 - winCY

  // Place dot at screen centre, hidden. GSAP xPercent/yPercent centre it on the fixed point.
  gsap.set(dotEl.value,  { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 })
  gsap.set(textEl.value, { clipPath: CLIP_HIDDEN })

  if (reduceMotion) {
    gsap.set(dotEl.value,  { x: periodX, y: periodY, scale: PERIOD_SCALE, opacity: 1 })
    gsap.set(textEl.value, { clipPath: CLIP_SHOWN })
    introDone = true
    if (pendingExit) queueExit()
    return
  }

  introTl = gsap.timeline({
    onComplete: () => { introDone = true; if (pendingExit) queueExit() }
  })

  introTl
    // 1) ET mark pops at screen centre
    .to(dotEl.value, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.4)' }, 0)
    // 2) flows right, shrinking to period size as "entertrainer" writes in behind it
    .to(dotEl.value, { x: periodX, y: periodY, scale: PERIOD_SCALE, duration: 0.85, ease: 'power3.inOut' }, 0.5)
    .to(textEl.value, { clipPath: CLIP_SHOWN, duration: 0.8, ease: 'power2.out' }, 0.62)
}

watch(isReady, (ready) => { if (ready) queueExit() })

// Hold the wordmark for a beat before exiting.
// Guarded so a fast-ready signal still waits for the intro to finish.
function queueExit() {
  if (exitQueued || exiting) return
  if (!introDone) { pendingExit = true; return }
  exitQueued = true
  setTimeout(runExit, 1000)
}

function runExit() {
  if (exiting || !anchorEl.value || !dotEl.value) return
  exiting = true

  SoundEngine.init()
  SoundEngine.getInstance()?.unlock()

  const winCX = window.innerWidth  / 2
  const winCY = window.innerHeight / 2
  const a     = anchorEl.value.getBoundingClientRect()
  // Corner: centre of the anchor element, expressed as offset from screen centre
  const cornerX = a.left + a.width  / 2 - winCX
  const cornerY = a.top  + a.height / 2 - winCY

  if (reduceMotion) {
    experienceStore.setHasEntered()
    gsap.timeline({ onComplete: () => emit('entered') })
      .to(textEl.value,   { clipPath: CLIP_HIDDEN, duration: 0.35, ease: 'power2.in' }, 0)
      .to(dotEl.value,    { opacity: 0, duration: 0.3 }, 0.15)
      .to(loaderEl.value, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.4 }, 0.1)
    return
  }

  const tl = gsap.timeline({ onComplete: () => emit('entered') })

  // 1) dot retreats to centre at full size; wordmark wipes back
  tl.to(dotEl.value,  { x: 0, y: 0, scale: 1, duration: 0.7, ease: 'power3.inOut' }, 0)
    .to(textEl.value, { clipPath: CLIP_HIDDEN, duration: 0.55, ease: 'power2.in' }, 0.05)

  // 2) heartbeat emphasis at centre
    .to(dotEl.value, { scale: 1.38, duration: 0.2,  ease: 'power2.out'   }, 0.8)
    .to(dotEl.value, { scale: 1,    duration: 0.24, ease: 'power2.inOut' }, 1.0)

  // 3) flies to the corner at its natural 48px size (= the real menu button)
    .to(dotEl.value, { x: cornerX, y: cornerY, duration: 0.72, ease: 'power3.inOut' }, 1.3)

  // 4) reveal experience beneath the loader
    .add(() => {
      experienceStore.setHasEntered()
      gsap.to(loaderEl.value, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.55, ease: 'power2.out' })
    }, 2.0)

  // 5) fade the overlay dot out — the identical real button takes over
    .to(dotEl.value, { opacity: 0, duration: 0.35, ease: 'power2.in' }, 2.35)
}
</script>

<template>
  <div ref="loaderEl" class="eloader">
    <!-- "entertrainer" wordmark: "enter" italic + "trainer" bold -->
    <div class="wm">
      <span ref="textEl" class="wm-text"><em>enter</em><b>trainer</b></span>
    </div>

    <!-- ET mark — the hero dot. Starts at screen centre, flows to period
         position, retreats, pulses, then flies to become the corner button. -->
    <span ref="dotEl" class="wm-dot">
      <img src="/et-mark.svg" class="et-img" alt="" aria-hidden="true" />
    </span>

    <!-- Invisible anchor mirroring the corner button for landing calculation -->
    <span ref="anchorEl" class="eanchor"></span>
  </div>
</template>

<style scoped>
.eloader {
  position: fixed;
  inset: 0;
  z-index: var(--z-loader);
  background: var(--color-bg);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Wordmark ── */
.wm {
  display: inline-flex;
  align-items: baseline;
  font-size: clamp(40px, 11vw, 84px);
  font-weight: 400;
  letter-spacing: -0.045em;
  line-height: 1;
  color: var(--color-text);
  white-space: nowrap;
}
.wm-text {
  display: inline-block;
  clip-path: inset(-25% 100% -25% -3%);
}
.wm-text em { font-style: italic; font-weight: 400; }
.wm-text b  { font-style: normal; font-weight: 700; }

/* ── ET mark hero dot ── */
.wm-dot {
  position: fixed;
  left: 50%;
  top: 50%;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  will-change: transform, opacity;
}
.et-img {
  width: 100%;
  height: 100%;
  display: block;
  filter: var(--et-mark-filter, none);
}

/* ── Corner anchor ── */
.eanchor {
  position: fixed;
  right: calc(var(--chrome-offset) + var(--safe-right));
  top: calc(var(--chrome-offset) + var(--safe-top));
  width: var(--chrome-size);
  height: var(--chrome-size);
  opacity: 0;
  pointer-events: none;
}
</style>
