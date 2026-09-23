<script setup lang="ts">
definePageMeta({ layout: false })
/**
 * STACK — portrait WebGL arcade for Engage.
 * Real Three.js orthographic stacker (Ketchapp-class): alternating X/Z,
 * overlap trim, falling overhangs, soft shadows, cream/ink/yellow DNA.
 */
import { useThemeStore } from '~/stores/theme'
import type { StackEngine, StackPhase } from '~/composables/stack/useStackEngine'

useSeoMeta({
  title: 'Stack · Engage',
  description: 'Tap to drop. Only the overlap stays. A stacking arcade on Entertrainer.',
  ogUrl: 'https://entertrainer.in/engage/stack',
})

const BEST_KEY = 'entertrainer-stack-best'

const theme = useThemeStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const phase = ref<StackPhase>('title')
const score = ref(0)
const best = ref(0)
const lastPerfect = ref(false)
const newBest = ref(false)

let engine: StackEngine | null = null
let audioCtx: AudioContext | null = null
let stopWatch: (() => void) | null = null

let STACK_PALETTE_LIGHT: { paper: string; paperDeep: string; ink: string; yellow: string; cream: string; creamBlock: string }
let STACK_PALETTE_DARK: typeof STACK_PALETTE_LIGHT
let createStackEngine: typeof import('~/composables/stack/useStackEngine').createStackEngine

function activePalette() {
  return theme.isDark ? STACK_PALETTE_DARK : STACK_PALETTE_LIGHT
}

function ensureAudio() {
  if (audioCtx) return audioCtx
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  audioCtx = new AC()
  return audioCtx
}

function tone(freq: number, dur = 0.06, type: OscillatorType = 'square', gain = 0.04) {
  const ctx = ensureAudio()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume()
  const t0 = ctx.currentTime
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.connect(g)
  g.connect(ctx.destination)
  o.start(t0)
  o.stop(t0 + dur + 0.02)
}

function burstNoise(ctx: AudioContext, t0: number, dur: number, gain: number) {
  const n = Math.max(1, Math.floor(ctx.sampleRate * dur))
  const buf = ctx.createBuffer(1, n, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < n; i++) {
    const env = 1 - i / n
    data[i] = (Math.random() * 2 - 1) * env * env
  }
  const src = ctx.createBufferSource()
  src.buffer = buf
  const g = ctx.createGain()
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.01)
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 600
  src.connect(hp)
  hp.connect(g)
  g.connect(ctx.destination)
  src.start(t0)
  src.stop(t0 + dur + 0.02)
}

function speakerHaptic(kind: 'drop' | 'perfect' | 'miss' | 'over') {
  const ctx = ensureAudio()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume()
  const t0 = ctx.currentTime

  if (kind === 'drop') {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(180, t0)
    o.frequency.exponentialRampToValueAtTime(55, t0 + 0.045)
    g.gain.setValueAtTime(0.07, t0)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05)
    o.connect(g)
    g.connect(ctx.destination)
    o.start(t0)
    o.stop(t0 + 0.06)
    burstNoise(ctx, t0, 0.012, 0.045)
    return
  }

  if (kind === 'perfect') {
    burstNoise(ctx, t0, 0.01, 0.055)
    const o1 = ctx.createOscillator()
    const g1 = ctx.createGain()
    o1.type = 'triangle'
    o1.frequency.setValueAtTime(920, t0)
    g1.gain.setValueAtTime(0.05, t0)
    g1.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.04)
    o1.connect(g1)
    g1.connect(ctx.destination)
    o1.start(t0)
    o1.stop(t0 + 0.05)
    const o2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    o2.type = 'square'
    o2.frequency.setValueAtTime(620, t0 + 0.028)
    g2.gain.setValueAtTime(0.0001, t0)
    g2.gain.setValueAtTime(0.038, t0 + 0.028)
    g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08)
    o2.connect(g2)
    g2.connect(ctx.destination)
    o2.start(t0 + 0.028)
    o2.stop(t0 + 0.09)
    return
  }

  if (kind === 'miss') {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(90, t0)
    o.frequency.exponentialRampToValueAtTime(38, t0 + 0.12)
    g.gain.setValueAtTime(0.08, t0)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14)
    o.connect(g)
    g.connect(ctx.destination)
    o.start(t0)
    o.stop(t0 + 0.15)
    burstNoise(ctx, t0, 0.03, 0.035)
    return
  }

  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(70, t0)
  o.frequency.exponentialRampToValueAtTime(28, t0 + 0.18)
  g.gain.setValueAtTime(0.09, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2)
  o.connect(g)
  g.connect(ctx.destination)
  o.start(t0)
  o.stop(t0 + 0.22)
  burstNoise(ctx, t0, 0.04, 0.03)
}

function haptic(kind: 'drop' | 'perfect' | 'miss' | 'over' | 'start', vibratePattern?: number | number[]) {
  speakerHaptic(kind === 'start' ? 'drop' : kind)
  if (vibratePattern !== undefined) {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(vibratePattern)
      }
    } catch { /* ignore */ }
  }
}

function resize() {
  const c = canvasRef.value
  if (!c || !engine) return
  const parent = c.parentElement
  const cssW = parent?.clientWidth || window.innerWidth
  const cssH = parent?.clientHeight || window.innerHeight
  engine.setSize(cssW, cssH)
}

function syncTheme() {
  engine?.applyTheme(activePalette(), theme.isDark)
}

onMounted(async () => {
  theme.init()
  best.value = Number(localStorage.getItem(BEST_KEY) || 0) || 0

  const c = canvasRef.value
  if (!c) return

  const mod = await import('~/composables/stack/useStackEngine')
  createStackEngine = mod.createStackEngine
  STACK_PALETTE_LIGHT = mod.STACK_PALETTE_LIGHT
  STACK_PALETTE_DARK = mod.STACK_PALETTE_DARK

  engine = createStackEngine(c, {
    onScore(n, perfect) {
      score.value = n
      phase.value = 'playing'
      if (perfect) {
        lastPerfect.value = true
        window.setTimeout(() => { lastPerfect.value = false }, 480)
      } else {
        lastPerfect.value = false
      }
    },
    onPlace(perfect) {
      if (perfect) {
        const combo = engine?.getCombo() ?? 1
        haptic('perfect', [8, 30, 16])
        tone(520 + Math.min(combo, 8) * 40, 0.07, 'square', 0.045)
        tone(780 + Math.min(combo, 8) * 30, 0.09, 'triangle', 0.03)
      } else {
        haptic('drop', 18)
        tone(140, 0.08, 'sawtooth', 0.035)
      }
    },
    onMiss() {
      haptic('miss', [30, 40, 50])
    },
    onGameOver(n) {
      score.value = n
      phase.value = 'over'
      const beat = n > best.value
      newBest.value = beat
      if (beat) {
        best.value = n
        localStorage.setItem(BEST_KEY, String(best.value))
        haptic('perfect', [20, 40, 20, 40, 40])
        tone(660, 0.12, 'square', 0.04)
      } else {
        haptic('over', [30, 40, 50])
        tone(90, 0.18, 'sawtooth', 0.04)
      }
    },
  })

  syncTheme()
  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('orientationchange', resize)

  stopWatch = watch(
    () => theme.theme,
    () => syncTheme(),
  )
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  window.removeEventListener('orientationchange', resize)
  stopWatch?.()
  engine?.dispose()
  engine = null
  if (audioCtx) {
    void audioCtx.close().catch(() => {})
    audioCtx = null
  }
})

function onPointer() {
  ensureAudio()
  if (!engine) return
  const prev = engine.getPhase()
  const action = engine.onPointer()
  phase.value = engine.getPhase()
  score.value = engine.getScore()
  if (action === 'start' || action === 'again') {
    newBest.value = false
    lastPerfect.value = false
    haptic('start', 12)
    tone(180, 0.05, 'triangle', 0.03)
  }
  // game-over / place feedback handled via hooks
  void prev
}

function onThemeToggle(e: Event) {
  e.stopPropagation()
  theme.toggle()
}
</script>

<template>
  <div class="st" :data-phase="phase" :data-st-theme="theme.theme">
    <NuxtLink
      to="/engage"
      class="st__iconbtn st__back"
      aria-label="Back to Engage"
      @pointerdown.stop
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
    </NuxtLink>

    <button
      type="button"
      class="st__iconbtn st__theme"
      :aria-label="`Switch to ${theme.theme === 'dark' ? 'light' : 'dark'} mode`"
      @pointerdown.stop.prevent="onThemeToggle"
      @click.stop.prevent="onThemeToggle"
    >
      <EdSignalIcon :name="theme.theme === 'dark' ? 'sun' : 'moon'" />
    </button>

    <div
      class="st__hud"
      :class="{ 'st__hud--on': phase === 'playing' }"
      aria-live="polite"
    >
      <strong class="st__score">{{ score }}</strong>
      <span class="st__bestpill">Best · {{ best }}</span>
    </div>

    <div class="st__stage" @pointerdown.prevent="onPointer">
      <canvas ref="canvasRef" class="st__canvas" role="img" aria-label="Stack game board" />
      <div class="st__vignette" aria-hidden="true" />

      <div v-if="phase === 'title'" class="st__overlay st__overlay--title">
        <p class="st__eyebrow st__anim" style="--i:0">Engage</p>
        <h1 class="st__title st__anim" style="--i:1">STACK</h1>
        <p class="st__lede st__anim" style="--i:2">Tap to drop. Only the overlap stays.</p>
        <button class="st__cta st__anim st__cta--pulse" style="--i:3" type="button">Play</button>
      </div>

      <div v-else-if="phase === 'over'" class="st__overlay st__overlay--over">
        <p v-if="newBest" class="st__badge st__anim" style="--i:0">Best</p>
        <h1 class="st__overscore st__anim st__score-pop" style="--i:1">{{ score }}</h1>
        <p class="st__lede st__anim" style="--i:2">Best · {{ best }}</p>
        <button class="st__cta st__anim" style="--i:3" type="button">Again</button>
      </div>

      <p v-else-if="lastPerfect" class="st__perfect" key="perfect">PERFECT</p>
    </div>
  </div>
</template>

<style scoped>
.st {
  --st-paper: #fbf8ef;
  --st-ink: #161618;
  --st-yellow: #ffd43b;
  --ink: var(--st-ink);
  --accent: var(--st-yellow);
  position: relative;
  width: 100%;
  height: 100svh;
  height: 100dvh;
  max-height: 100dvh;
  background: var(--st-paper);
  color: var(--st-ink);
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 280ms ease, color 280ms ease;
}
.st[data-st-theme='dark'] {
  --st-paper: #121214;
  --st-ink: #ede6d6;
  --st-yellow: #e8c547;
}

.st__stage {
  position: absolute;
  inset: 0;
  cursor: pointer;
  touch-action: none;
}

.st__canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
}

.st__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 80% 72% at 50% 42%,
    transparent 58%,
    color-mix(in srgb, var(--st-ink) 5%, transparent) 100%
  );
}
.st[data-st-theme='dark'] .st__vignette {
  background: radial-gradient(
    ellipse 80% 72% at 50% 42%,
    transparent 52%,
    color-mix(in srgb, #000 22%, transparent) 100%
  );
}

.st__iconbtn {
  position: absolute;
  z-index: 6;
  top: max(10rem, env(safe-area-inset-top));
  width: 44rem;
  height: 44rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: color-mix(in srgb, var(--st-paper) 55%, transparent);
  color: color-mix(in srgb, var(--st-ink) 70%, transparent);
  text-decoration: none;
  cursor: pointer;
  appearance: none;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: color 160ms ease, background 160ms ease, transform 120ms ease;
}
.st__iconbtn:hover,
.st__iconbtn:focus-visible {
  color: var(--st-ink);
  background: color-mix(in srgb, var(--st-paper) 82%, transparent);
}
.st__iconbtn:active {
  transform: scale(0.94);
}

.st__back {
  left: max(10rem, env(safe-area-inset-left));
}
.st__back svg {
  width: 20rem;
  height: 20rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.25;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.st__theme {
  right: max(10rem, env(safe-area-inset-right));
}
.st__theme :deep(svg) {
  width: 18rem;
  height: 18rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.st__hud {
  position: absolute;
  top: max(58rem, calc(env(safe-area-inset-top) + 48rem));
  left: 0;
  right: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rem;
  pointer-events: none;
  opacity: 0;
  transform: translateY(-8rem);
  transition: opacity 280ms ease, transform 280ms ease;
}
.st__hud--on {
  opacity: 1;
  transform: none;
}
.st__score {
  font: 700 clamp(56rem, 16vw, 88rem)/0.9 var(--font-display);
  letter-spacing: -0.06em;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 1rem 0 color-mix(in srgb, var(--st-paper) 60%, transparent);
}
.st__bestpill {
  font: 700 11rem/1 var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 6rem 12rem;
  border-radius: 999px;
  color: color-mix(in srgb, var(--st-ink) 62%, transparent);
  background: color-mix(in srgb, var(--st-paper) 70%, transparent);
  backdrop-filter: blur(4px);
}

.st__overlay {
  position: absolute;
  inset: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 12rem;
  padding: 28rem 24rem;
  padding-top: max(28rem, env(safe-area-inset-top));
  padding-bottom: max(28rem, env(safe-area-inset-bottom));
  text-align: center;
  background: color-mix(in srgb, var(--st-paper) 55%, transparent);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  animation: st-overlay-in 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
  pointer-events: none;
}
.st__overlay .st__cta { pointer-events: auto; }

.st__eyebrow {
  margin: 0;
  font: 800 11rem/1 var(--font-mono);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  opacity: 0.72;
}

.st__title {
  margin: 0;
  font: 700 clamp(80rem, 24vw, 128rem)/0.82 var(--font-display);
  letter-spacing: -0.07em;
  text-transform: uppercase;
}

.st__overscore {
  margin: 0;
  font: 700 clamp(88rem, 26vw, 140rem)/0.82 var(--font-display);
  letter-spacing: -0.07em;
  font-variant-numeric: tabular-nums;
}

.st__lede {
  margin: 0 0 6rem;
  font-size: 15rem;
  line-height: 1.4;
  max-width: 24ch;
  letter-spacing: 0.01em;
  opacity: 0.82;
}

.st__badge {
  margin: 0;
  font: 800 10rem/1 var(--font-mono);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 6rem 10rem;
  border-radius: 999px;
  background: var(--st-ink);
  color: var(--st-yellow);
}

.st__cta {
  appearance: none;
  border: none;
  background: var(--st-yellow);
  color: #161618;
  font: 800 15rem/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 18rem 36rem;
  border-radius: 999px;
  cursor: pointer;
  box-shadow:
    0 1rem 0 color-mix(in srgb, #161618 12%, transparent),
    0 8rem 20rem color-mix(in srgb, var(--st-ink) 10%, transparent);
  transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
}
.st__cta:active {
  transform: translateY(2rem) scale(0.98);
  box-shadow:
    0 0 0 transparent,
    0 2rem 8rem color-mix(in srgb, var(--st-ink) 8%, transparent);
}

.st__anim {
  animation: st-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 65ms + 30ms);
}

.st__score-pop {
  animation:
    st-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both,
    st-score-pop 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 65ms + 30ms);
}

.st__cta--pulse {
  animation:
    st-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both,
    st-cta-pulse 2.6s ease-in-out 650ms infinite;
  animation-delay: calc(var(--i, 0) * 65ms + 30ms), 650ms;
}

.st__perfect {
  position: absolute;
  left: 50%;
  top: 20%;
  transform: translateX(-50%);
  margin: 0;
  padding: 7rem 14rem;
  background: var(--st-ink);
  color: var(--st-yellow);
  font: 800 12rem/1 var(--font-mono);
  letter-spacing: 0.22em;
  border-radius: 3rem;
  pointer-events: none;
  animation: st-pop 0.48s ease-out both;
}

@keyframes st-overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes st-rise {
  from { opacity: 0; transform: translateY(12rem); }
  to { opacity: 1; transform: none; }
}
@keyframes st-score-pop {
  0% { transform: scale(0.88); }
  55% { transform: scale(1.03); }
  100% { transform: scale(1); }
}
@keyframes st-cta-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.025); }
}
@keyframes st-pop {
  0% { opacity: 0; transform: translateX(-50%) translateY(6rem) scale(0.94); }
  22% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-10rem) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .st__overlay,
  .st__anim,
  .st__score-pop,
  .st__cta--pulse,
  .st__perfect,
  .st__hud {
    animation: none !important;
    transition: none !important;
  }
  .st__hud { opacity: 0; transform: none; }
  .st__hud--on { opacity: 1; }
  .st__anim,
  .st__score-pop,
  .st__cta--pulse { opacity: 1; transform: none; }
  .st { transition: none; }
}
</style>
