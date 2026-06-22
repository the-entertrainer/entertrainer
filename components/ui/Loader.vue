<script setup lang="ts">
import gsap from 'gsap'
import { useExperienceStore } from '~/stores/experience'
import SoundEngine from '~/experience/SoundEngine'

const emit = defineEmits<{ (e: 'entered'): void }>()

const experienceStore = useExperienceStore()
const isReady         = computed(() => experienceStore.isReady)

const loaderEl = ref<HTMLElement | null>(null)
const textEl   = ref<HTMLElement | null>(null)  // "entertrainer" wordmark (clip-revealed)
const dotEl    = ref<HTMLElement | null>(null)  // the hero period — also morphs into the mid E-bar
const barTopEl = ref<HTMLElement | null>(null)  // sprouts above the dot during the corner morph
const barBotEl = ref<HTMLElement | null>(null)  // sprouts below
const anchorEl = ref<HTMLElement | null>(null)  // mirrors the live e-btn corner for landing

// Wordmark reveal clip. Negative top/bottom/left keep italic overhang and
// ascenders/descenders from being shaved; the right inset is what animates.
const CLIP_HIDDEN = 'inset(-25% 100% -25% -3%)'
const CLIP_SHOWN  = 'inset(-25% 0% -25% -3%)'

const reduceMotion = import.meta.client &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Dot's natural (resting) screen-centre, measured once before any transform.
let dotNatCX = 0
let dotNatCY = 0
let startX   = 0          // x offset that parks the dot at screen centre for the pop

let introTl:    gsap.core.Timeline | null = null
let introDone   = false
let pendingExit = false
let exitQueued  = false
let exiting     = false

onMounted(async () => {
  // Wait for the variable font so the wordmark is measured at its true width.
  if (import.meta.client && (document as any).fonts?.ready) {
    try { await (document as any).fonts.ready } catch {}
  }
  await nextTick()
  startIntro()
})

onUnmounted(() => { introTl?.kill() })

function startIntro() {
  if (!dotEl.value || !textEl.value) return

  // Measure the dot's resting position (it sits as the trailing period) before
  // we apply any transform, then work out the offset back to screen centre.
  const dr  = dotEl.value.getBoundingClientRect()
  dotNatCX  = dr.left + dr.width  / 2
  dotNatCY  = dr.top  + dr.height / 2
  startX    = window.innerWidth / 2 - dotNatCX

  gsap.set([barTopEl.value, barBotEl.value], { xPercent: -50, yPercent: -50, opacity: 0, width: 0 })

  if (reduceMotion) {
    gsap.set(textEl.value, { clipPath: CLIP_SHOWN })
    gsap.set(dotEl.value,  { opacity: 1, scale: 1 })
    introDone = true
    if (pendingExit) queueExit()
    return
  }

  // Seed hidden state (CSS already hides them to avoid a first-frame flash).
  gsap.set(textEl.value, { clipPath: CLIP_HIDDEN })
  gsap.set(dotEl.value,  { x: startX, scale: 0, opacity: 0, transformOrigin: '50% 50%' })

  introTl = gsap.timeline({
    onComplete: () => { introDone = true; if (pendingExit) queueExit() }
  })

  introTl
    // 1) the dot pops up at centre
    .to(dotEl.value, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.4)' }, 0)
    // 2) it flows to the right, settling as the period…
    .to(dotEl.value, { x: 0, duration: 0.85, ease: 'power3.inOut' }, 0.5)
    // …while "entertrainer" writes itself in behind it
    .to(textEl.value, { clipPath: CLIP_SHOWN, duration: 0.8, ease: 'power2.out' }, 0.62)
}

watch(isReady, (ready) => { if (ready) queueExit() })

// Hold the finished wordmark for a beat, then run the exit. Guarded so a fast
// ready signal still gets the full intro plus a moment of stillness.
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
  const acx   = a.left + a.width  / 2
  const acy   = a.top  + a.height / 2

  // Targets. Centred bar elements use offsets from screen centre; the in-flow
  // dot uses offsets from its own natural centre. Both resolve to the same
  // left-aligned E formation as the live button (mid bar shifted left by 4).
  const coX   = acx - winCX
  const coY   = acy - winCY
  const dotTX = (acx - 4) - dotNatCX
  const dotTY = acy - dotNatCY

  const root     = getComputedStyle(document.documentElement)
  const barColor = root.getPropertyValue('--color-text').trim() || '#F4F1EC'

  // Reduced motion: no fly. Wipe the wordmark, reveal the experience, cross-fade.
  if (reduceMotion) {
    experienceStore.setHasEntered()
    gsap.timeline({ onComplete: () => emit('entered') })
      .to(textEl.value, { clipPath: CLIP_HIDDEN, duration: 0.35, ease: 'power2.in' }, 0)
      .to(dotEl.value,  { opacity: 0, duration: 0.3 }, 0.15)
      .to(loaderEl.value, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.4 }, 0.1)
    return
  }

  const tl = gsap.timeline({ onComplete: () => emit('entered') })

  // 1) the dot retreats to centre, wiping the wordmark back as it goes
  tl.to(dotEl.value,  { x: startX, duration: 0.7, ease: 'power3.inOut' }, 0)
    .to(textEl.value, { clipPath: CLIP_HIDDEN, duration: 0.55, ease: 'power2.in' }, 0.05)

  // 2) a heartbeat of emphasis at centre
    .to(dotEl.value, { scale: 1.4, duration: 0.2,  ease: 'power2.out'   }, 0.8)
    .to(dotEl.value, { scale: 1,   duration: 0.24, ease: 'power2.inOut' }, 1.0)

  // 3) the dot flies to the corner and flattens into the middle E-bar
    .to(dotEl.value, { x: dotTX, y: dotTY, duration: 0.72, ease: 'power3.inOut' }, 1.3)
    .to(dotEl.value, {
      width: '14rem', height: '2.5rem', borderRadius: '1.5rem',
      backgroundColor: barColor, duration: 0.36, ease: 'power2.inOut'
    }, 1.78)

  // 4) the top and bottom bars sprout from the dot to complete the E
    .add(() => {
      gsap.set([barTopEl.value, barBotEl.value], {
        x: coX, y: coY, width: 0, height: '2.5rem', opacity: 1, backgroundColor: barColor
      })
    }, 1.8)
    .to(barTopEl.value, { x: coX, y: coY - 8.5, width: '22rem', duration: 0.36, ease: 'power2.out' }, 1.82)
    .to(barBotEl.value, { x: coX, y: coY + 8.5, width: '22rem', duration: 0.36, ease: 'power2.out' }, 1.82)

  // 5) reveal the WebGL experience beneath, fade the loader background away
    .add(() => {
      experienceStore.setHasEntered()
      gsap.to(loaderEl.value, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.55, ease: 'power2.out' })
    }, 2.16)

  // 6) cross-fade the morph overlay out — the identical live button remains
    .to([dotEl.value, barTopEl.value, barBotEl.value], { opacity: 0, duration: 0.35, ease: 'power2.in' }, 2.55)
}
</script>

<template>
  <div ref="loaderEl" class="eloader">
    <!-- entertrainer wordmark: "enter" italic + "trainer" bold + the hero dot -->
    <div class="wm">
      <span ref="textEl" class="wm-text"><em>enter</em><b>trainer</b></span>
      <span ref="dotEl" class="wm-dot"></span>
    </div>

    <!-- bars that sprout when the dot morphs into the corner E -->
    <span ref="barTopEl" class="ebar"></span>
    <span ref="barBotEl" class="ebar"></span>

    <!-- invisible anchor mirroring the e-btn corner for the landing calc -->
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
  position: relative;
  display: inline-flex;
  align-items: baseline;
  gap: 0.05em;
  font-size: clamp(40px, 11vw, 84px);
  font-weight: 400;
  letter-spacing: -0.045em;
  line-height: 1;
  color: var(--color-text);
  white-space: nowrap;
}
.wm-text {
  display: inline-block;
  /* Hidden on the first frame to avoid a flash before GSAP takes over */
  clip-path: inset(-25% 100% -25% -3%);
}
.wm-text em { font-style: italic; font-weight: 400; }
.wm-text b  { font-style: normal; font-weight: 700; }
.wm-dot {
  display: inline-block;
  width: 0.2em;
  height: 0.2em;
  border-radius: 50%;
  background: var(--color-text);
  opacity: 0;
  will-change: transform, width, height;
}

/* ── Morph bars (top/bottom of the corner E) ── */
.ebar {
  position: absolute;
  left: 50%;
  top: 50%;
  height: 2.5rem;
  border-radius: 1.5rem;
  background: var(--color-text);
  opacity: 0;
  will-change: transform, width;
  pointer-events: none;
}

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
