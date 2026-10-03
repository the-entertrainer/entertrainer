<script setup lang="ts">
definePageMeta({ layout: false })
/**
 * THE GATEWAY — one-tap hemi-sync for Engage.
 * Same cream / ink / yellow shell as Stack and The Mind Reader.
 * Web Audio only: 100 Hz left, 100→107 Hz right (7 Hz beat), quiet pink bed.
 */
import { useThemeStore } from '~/stores/theme'

useSeoMeta({
  title: 'The Gateway · Engage',
  description: 'Headphones on. One tap. The tone does the work.',
  ogUrl: 'https://entertrainer.in/engage/gateway',
})

const TONE_GAIN = 0.2
const NOISE_GAIN = 0.05
const FADE_IN = 1.5
const DRIFT = 12
const FADE_OUT = 2

type Phase = 'land' | 'hold' | 'leaving'

type Graph = {
  left: OscillatorNode
  right: OscillatorNode
  noise: AudioBufferSourceNode
  master: GainNode
  nodes: AudioNode[]
}

const theme = useThemeStore()
const phase = ref<Phase>('land')
const volume = ref(0.7)
const elapsed = ref(0)

const clock = computed(() => {
  const s = elapsed.value
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
})

let audioCtx: AudioContext | null = null
let graph: Graph | null = null
let generation = 0
let leaveTimer = 0
let clockTimer = 0
let startedAt = 0

function audioContextCtor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & { webkitAudioContext?: typeof AudioContext }
  return window.AudioContext || w.webkitAudioContext || null
}

function pinkBuffer(ctx: AudioContext, seconds = 4) {
  const length = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let b0 = 0
  let b1 = 0
  let b2 = 0
  let b3 = 0
  let b4 = 0
  let b5 = 0
  let b6 = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.96900 * b2 + white * 0.1538520
    b3 = 0.86650 * b3 + white * 0.3104856
    b4 = 0.55000 * b4 + white * 0.5329522
    b5 = -0.7616 * b5 - white * 0.0168980
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
    b6 = white * 0.115926
  }
  return buffer
}

function ensureContext() {
  const AC = audioContextCtor()
  if (!AC) return null
  if (!audioCtx || audioCtx.state === 'closed') audioCtx = new AC()
  if (audioCtx.state === 'suspended') void audioCtx.resume()
  return audioCtx
}

function stopClock() {
  if (clockTimer) window.clearInterval(clockTimer)
  clockTimer = 0
}

function startClock() {
  stopClock()
  startedAt = performance.now()
  elapsed.value = 0
  clockTimer = window.setInterval(() => {
    elapsed.value = Math.floor((performance.now() - startedAt) / 1000)
  }, 250)
}

function clearLeave() {
  if (leaveTimer) window.clearTimeout(leaveTimer)
  leaveTimer = 0
}

function teardownGraph() {
  const g = graph
  graph = null
  if (!g) return
  try { g.left.stop() } catch { /* already stopped */ }
  try { g.right.stop() } catch { /* already stopped */ }
  try { g.noise.stop() } catch { /* already stopped */ }
  for (const node of g.nodes) {
    try { node.disconnect() } catch { /* already disconnected */ }
  }
}

function applyVolume(next: number) {
  if (!audioCtx || !graph || phase.value !== 'hold') return
  const t = audioCtx.currentTime
  const gain = graph.master.gain
  gain.cancelScheduledValues(t)
  gain.setTargetAtTime(next, t, 0.04)
}

watch(volume, (next) => applyVolume(next))

function enter() {
  if (phase.value === 'hold') return
  generation += 1
  clearLeave()
  teardownGraph()

  const ctx = ensureContext()
  if (!ctx) return

  const t = ctx.currentTime
  const master = ctx.createGain()
  master.gain.setValueAtTime(volume.value, t)

  const merger = ctx.createChannelMerger(2)

  const leftGain = ctx.createGain()
  const rightGain = ctx.createGain()
  leftGain.gain.setValueAtTime(0, t)
  rightGain.gain.setValueAtTime(0, t)
  leftGain.gain.linearRampToValueAtTime(TONE_GAIN, t + FADE_IN)
  rightGain.gain.linearRampToValueAtTime(TONE_GAIN, t + FADE_IN)
  leftGain.connect(merger, 0, 0)
  rightGain.connect(merger, 0, 1)

  const left = ctx.createOscillator()
  const right = ctx.createOscillator()
  left.type = 'sine'
  right.type = 'sine'
  left.frequency.setValueAtTime(100, t)
  right.frequency.setValueAtTime(100, t)
  right.frequency.exponentialRampToValueAtTime(107, t + DRIFT)
  left.connect(leftGain)
  right.connect(rightGain)

  const noise = ctx.createBufferSource()
  noise.buffer = pinkBuffer(ctx)
  noise.loop = true
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(400, t)
  filter.Q.setValueAtTime(0.707, t)
  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0, t)
  noiseGain.gain.linearRampToValueAtTime(NOISE_GAIN, t + FADE_IN)
  noise.connect(filter)
  filter.connect(noiseGain)

  merger.connect(master)
  noiseGain.connect(master)
  master.connect(ctx.destination)

  left.start(t)
  right.start(t)
  noise.start(t)

  graph = {
    left,
    right,
    noise,
    master,
    nodes: [left, right, leftGain, rightGain, merger, noise, filter, noiseGain, master],
  }
  phase.value = 'hold'
  startClock()
}

function finishLeave(gen: number) {
  if (gen !== generation) return
  teardownGraph()
  stopClock()
  phase.value = 'land'
}

function leave() {
  if (phase.value !== 'hold' || !audioCtx || !graph) return
  const gen = generation
  phase.value = 'leaving'
  const ctx = audioCtx
  const master = graph.master
  const t = ctx.currentTime
  const current = master.gain.value
  master.gain.cancelScheduledValues(t)
  master.gain.setValueAtTime(Math.max(current, 0.0001), t)
  master.gain.exponentialRampToValueAtTime(0.0001, t + FADE_OUT)
  clearLeave()
  leaveTimer = window.setTimeout(() => finishLeave(gen), FADE_OUT * 1000 + 40)
}

function onThemeToggle(e: Event) {
  e.stopPropagation()
  e.preventDefault()
  theme.toggle()
}

onMounted(() => {
  theme.init()
})

onBeforeUnmount(() => {
  generation += 1
  clearLeave()
  stopClock()
  teardownGraph()
  if (audioCtx && audioCtx.state !== 'closed') {
    void audioCtx.close().catch(() => {})
  }
  audioCtx = null
})
</script>

<template>
  <div class="gw" :data-phase="phase" :data-gw-theme="theme.theme">
    <NuxtLink
      to="/engage"
      class="gw__iconbtn gw__back"
      aria-label="Back to Engage"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
    </NuxtLink>

    <button
      type="button"
      class="gw__iconbtn gw__theme"
      :aria-label="`Switch to ${theme.theme === 'dark' ? 'light' : 'dark'} mode`"
      @click.stop.prevent="onThemeToggle"
    >
      <EdSignalIcon :name="theme.theme === 'dark' ? 'sun' : 'moon'" />
    </button>

    <div v-if="phase === 'land'" class="gw__land">
      <p class="gw__eyebrow gw__anim" style="--i:0">Engage</p>
      <h1 class="gw__title gw__anim" style="--i:1">The Gateway</h1>
      <p class="gw__lede gw__anim" style="--i:2">Headphones on. One tap. The tone does the work.</p>
      <button
        class="gw__cta gw__anim gw__cta--pulse"
        style="--i:3"
        type="button"
        @click="enter"
      >
        Enter
      </button>
      <p class="gw__fine">An experiential listening guide. Not a medical device.</p>
    </div>

    <div v-else class="gw__hold" :class="{ 'gw__hold--leaving': phase === 'leaving' }">
      <div class="gw__orb" aria-hidden="true" />
      <p class="gw__time">{{ clock }}</p>
      <p class="gw__hint">Headphones</p>
      <label class="gw__vol">
        <span>Volume</span>
        <input
          v-model.number="volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          :disabled="phase === 'leaving'"
          aria-label="Volume"
        >
      </label>
      <button
        class="gw__leave"
        type="button"
        :disabled="phase === 'leaving'"
        @click="leave"
      >
        Leave
      </button>
      <p class="gw__fine">An experiential listening guide. Not a medical device.</p>
    </div>
  </div>
</template>

<style scoped>
.gw {
  --gw-paper: #fbf8ef;
  --gw-ink: #161618;
  --gw-yellow: #ffd43b;
  --ink: var(--gw-ink);
  --accent: var(--gw-yellow);
  position: relative;
  width: 100%;
  height: 100svh;
  height: 100dvh;
  max-height: 100dvh;
  background: var(--gw-paper);
  color: var(--gw-ink);
  overflow: hidden;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 280ms ease, color 280ms ease;
}

.gw[data-gw-theme='dark'] {
  --gw-paper: #121214;
  --gw-ink: #ede6d6;
  --gw-yellow: #e8c547;
}

.gw__iconbtn {
  position: absolute;
  z-index: 20;
  top: max(10rem, env(safe-area-inset-top));
  width: 44rem;
  height: 44rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: color-mix(in srgb, var(--gw-paper) 55%, transparent);
  color: color-mix(in srgb, var(--gw-ink) 70%, transparent);
  text-decoration: none;
  cursor: pointer;
  appearance: none;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: color 160ms ease, background 160ms ease, transform 120ms ease;
}
.gw__iconbtn:hover,
.gw__iconbtn:focus-visible {
  color: var(--gw-ink);
  background: color-mix(in srgb, var(--gw-paper) 82%, transparent);
}
.gw__iconbtn:focus-visible {
  outline: 2rem solid var(--gw-yellow);
  outline-offset: 2rem;
}
.gw__iconbtn:active {
  transform: scale(0.94);
}

.gw__back { left: max(10rem, env(safe-area-inset-left)); }
.gw__back svg {
  width: 20rem;
  height: 20rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.25;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.gw__theme { right: max(10rem, env(safe-area-inset-right)); }
.gw__theme :deep(svg) {
  width: 18rem;
  height: 18rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.gw__land,
.gw__hold {
  position: absolute;
  inset: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 12rem;
  padding: 28rem 24rem;
  padding-top: max(72rem, calc(env(safe-area-inset-top) + 56rem));
  padding-bottom: max(64rem, calc(env(safe-area-inset-bottom) + 48rem));
  text-align: center;
}

.gw__eyebrow {
  margin: 0;
  font: 800 11rem/1 var(--font-mono);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  opacity: 0.72;
}

.gw__title {
  margin: 0;
  font: 700 clamp(52rem, 14vw, 104rem)/0.86 var(--font-display);
  letter-spacing: -0.06em;
  text-wrap: balance;
}

.gw__lede {
  margin: 0 0 6rem;
  font-size: 15rem;
  line-height: 1.4;
  max-width: 28ch;
  letter-spacing: 0.01em;
  opacity: 0.82;
}

.gw__cta {
  appearance: none;
  border: none;
  background: var(--gw-yellow);
  color: #161618;
  font: 800 15rem/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  min-height: 44rem;
  padding: 18rem 36rem;
  border-radius: 999px;
  cursor: pointer;
  box-shadow:
    0 1rem 0 color-mix(in srgb, #161618 12%, transparent),
    0 8rem 20rem color-mix(in srgb, var(--gw-ink) 10%, transparent);
  transition: transform 160ms ease, box-shadow 160ms ease;
}
.gw__cta:hover,
.gw__cta:focus-visible {
  transform: translateY(-1rem);
}
.gw__cta:focus-visible {
  outline: 2rem solid var(--gw-ink);
  outline-offset: 3rem;
}
.gw__cta:active {
  transform: translateY(2rem) scale(0.98);
  box-shadow:
    0 0 0 transparent,
    0 2rem 8rem color-mix(in srgb, var(--gw-ink) 8%, transparent);
}

.gw__anim {
  animation: gw-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 65ms + 30ms);
}

.gw__cta--pulse {
  animation:
    gw-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both,
    gw-cta-pulse 2.6s ease-in-out 650ms infinite;
  animation-delay: calc(var(--i, 0) * 65ms + 30ms), 650ms;
}

.gw__orb {
  width: min(46vw, 220rem);
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    radial-gradient(circle at 38% 34%, #fff8d6 0%, var(--gw-yellow) 36%, color-mix(in srgb, var(--gw-yellow) 28%, transparent) 62%, transparent 72%);
  box-shadow:
    0 0 48rem color-mix(in srgb, var(--gw-yellow) 42%, transparent),
    0 0 120rem color-mix(in srgb, var(--gw-yellow) 22%, transparent);
  animation: gw-breathe 8s ease-in-out infinite;
}

.gw__time {
  margin: 8rem 0 0;
  font: 700 clamp(40rem, 10vw, 64rem)/0.9 var(--font-display);
  letter-spacing: -0.05em;
  font-variant-numeric: tabular-nums;
}

.gw__hint {
  margin: 0;
  font: 700 11rem/1 var(--font-mono);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.42;
}

.gw__vol {
  display: grid;
  gap: 8rem;
  width: min(240rem, 72vw);
  margin-top: 8rem;
  color: color-mix(in srgb, var(--gw-ink) 62%, transparent);
  font: 700 10rem/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.gw__vol input {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 44rem;
  margin: 0;
  background: transparent;
  cursor: pointer;
}
.gw__vol input:disabled { cursor: default; opacity: 0.5; }
.gw__vol input::-webkit-slider-runnable-track {
  height: 3rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--gw-ink) 28%, transparent);
}
.gw__vol input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18rem;
  height: 18rem;
  margin-top: -7.5rem;
  border-radius: 50%;
  border: none;
  background: var(--gw-yellow);
  box-shadow: 0 0 0 6rem color-mix(in srgb, var(--gw-yellow) 0%, transparent);
}
.gw__vol input::-moz-range-track {
  height: 3rem;
  border: none;
  border-radius: 999px;
  background: color-mix(in srgb, var(--gw-ink) 28%, transparent);
}
.gw__vol input::-moz-range-thumb {
  width: 18rem;
  height: 18rem;
  border: none;
  border-radius: 50%;
  background: var(--gw-yellow);
}

.gw__leave {
  appearance: none;
  min-width: 44rem;
  min-height: 44rem;
  margin-top: 4rem;
  padding: 12rem 22rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: color-mix(in srgb, var(--gw-ink) 70%, transparent);
  font: 800 12rem/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
}
.gw__leave:hover,
.gw__leave:focus-visible {
  color: var(--gw-ink);
}
.gw__leave:focus-visible {
  outline: 2rem solid var(--gw-yellow);
  outline-offset: 3rem;
}
.gw__leave:disabled {
  cursor: default;
  opacity: 0.45;
}

.gw__hold--leaving .gw__orb {
  opacity: 0.35;
  transition: opacity 2s linear;
}

.gw__fine {
  position: absolute;
  left: max(20rem, env(safe-area-inset-left));
  right: max(20rem, env(safe-area-inset-right));
  bottom: max(14rem, env(safe-area-inset-bottom));
  margin: 0;
  font-size: 11rem;
  line-height: 1.35;
  letter-spacing: 0.01em;
  opacity: 0.42;
}

@keyframes gw-rise {
  from { opacity: 0; transform: translateY(12rem); }
  to { opacity: 1; transform: none; }
}
@keyframes gw-cta-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.025); }
}
@keyframes gw-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.045); }
}

@media (prefers-reduced-motion: reduce) {
  .gw,
  .gw__anim,
  .gw__cta--pulse,
  .gw__orb,
  .gw__hold--leaving .gw__orb {
    animation: none !important;
    transition: none !important;
  }
  .gw__anim,
  .gw__cta--pulse { opacity: 1; transform: none; }
}
</style>
