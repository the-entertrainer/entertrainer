<script setup lang="ts">
definePageMeta({ layout: false })
/**
 * BRAINWAVE — a binaural beat you tune, in hertz.
 * Same cream / ink / yellow shell as The Gateway and The Mind Reader.
 * Web Audio only. No samples. Nothing plays before Begin.
 */
import { useThemeStore } from '~/stores/theme'
import {
  CARRIER_HZ,
  RAMP_FLOOR,
  bandLabel,
  clampBeat,
  rightFrequency,
  safeRamp,
} from '~/utils/brainwave-math.mjs'

useSeoMeta({
  title: 'Brainwave · Engage',
  description: 'A beat you tune, in hertz. Clearest in headphones.',
  ogUrl: 'https://entertrainer.in/engage/brainwave',
})

const MASTER_GAIN = 0.16
const CHANNEL_GAIN = 0.45
const DRONE_HZ = 110
const DRONE_GAIN = 0.045
const DRONE_BREATH_HZ = 0.05
const DRONE_BREATH_DEPTH = 0.012
const FADE_IN = 2
const FADE_OUT = 2
const RETUNE = 0.15

type Phase = 'land' | 'hold' | 'leaving'

type Graph = {
  left: OscillatorNode
  right: OscillatorNode
  drone: OscillatorNode
  breath: OscillatorNode
  master: GainNode
  nodes: AudioNode[]
}

const theme = useThemeStore()
const phase = ref<Phase>('land')
const beatHz = ref(clampBeat(10))

const band = computed(() => bandLabel(beatHz.value))
const hzLabel = computed(() => {
  const n = beatHz.value
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
})

let audioCtx: AudioContext | null = null
let graph: Graph | null = null
let generation = 0
let leaveTimer = 0

function audioContextCtor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & { webkitAudioContext?: typeof AudioContext }
  return window.AudioContext || w.webkitAudioContext || null
}

function ensureContext() {
  const AC = audioContextCtor()
  if (!AC) return null
  if (!audioCtx || audioCtx.state === 'closed') audioCtx = new AC()
  if (audioCtx.state === 'suspended') void audioCtx.resume()
  return audioCtx
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
  try { g.drone.stop() } catch { /* already stopped */ }
  try { g.breath.stop() } catch { /* already stopped */ }
  for (const node of g.nodes) {
    try { node.disconnect() } catch { /* already disconnected */ }
  }
}

function setBeat(value: number) {
  const beat = clampBeat(value)
  beatHz.value = beat
  if (phase.value !== 'hold' || !audioCtx || !graph) return
  const t = audioCtx.currentTime
  const freq = graph.right.frequency
  freq.cancelScheduledValues(t)
  freq.setValueAtTime(safeRamp(freq.value), t)
  freq.exponentialRampToValueAtTime(safeRamp(rightFrequency(beat)), t + RETUNE)
}

function onSlider(e: Event) {
  setBeat(Number((e.target as HTMLInputElement).value))
}

function onTyped(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  if (raw.trim() === '' || raw === '-' || raw === '.' || raw === '-.') return
  const n = Number(raw)
  if (!Number.isFinite(n)) return
  setBeat(n)
}

function begin() {
  if (phase.value === 'hold') return
  generation += 1
  clearLeave()
  teardownGraph()

  const beat = clampBeat(beatHz.value)
  beatHz.value = beat

  const ctx = ensureContext()
  if (!ctx) return

  const t = ctx.currentTime
  const master = ctx.createGain()
  master.gain.setValueAtTime(RAMP_FLOOR, t)
  master.gain.exponentialRampToValueAtTime(safeRamp(MASTER_GAIN), t + FADE_IN)

  const merger = ctx.createChannelMerger(2)
  const leftGain = ctx.createGain()
  const rightGain = ctx.createGain()
  leftGain.gain.setValueAtTime(CHANNEL_GAIN, t)
  rightGain.gain.setValueAtTime(CHANNEL_GAIN, t)
  leftGain.connect(merger, 0, 0)
  rightGain.connect(merger, 0, 1)

  const left = ctx.createOscillator()
  const right = ctx.createOscillator()
  left.type = 'sine'
  right.type = 'sine'
  left.frequency.setValueAtTime(CARRIER_HZ, t)
  right.frequency.setValueAtTime(safeRamp(rightFrequency(beat)), t)
  left.connect(leftGain)
  right.connect(rightGain)

  const drone = ctx.createOscillator()
  drone.type = 'sine'
  drone.frequency.setValueAtTime(DRONE_HZ, t)
  const droneGain = ctx.createGain()
  droneGain.gain.setValueAtTime(DRONE_GAIN, t)
  const breath = ctx.createOscillator()
  breath.type = 'sine'
  breath.frequency.setValueAtTime(DRONE_BREATH_HZ, t)
  const breathDepth = ctx.createGain()
  breathDepth.gain.setValueAtTime(DRONE_BREATH_DEPTH, t)
  breath.connect(breathDepth)
  breathDepth.connect(droneGain.gain)
  drone.connect(droneGain)

  merger.connect(master)
  droneGain.connect(master)
  master.connect(ctx.destination)

  left.start(t)
  right.start(t)
  drone.start(t)
  breath.start(t)

  graph = {
    left,
    right,
    drone,
    breath,
    master,
    nodes: [left, right, leftGain, rightGain, merger, drone, droneGain, breath, breathDepth, master],
  }
  phase.value = 'hold'
}

function finishLeave(gen: number) {
  if (gen !== generation) return
  teardownGraph()
  phase.value = 'land'
}

function leave() {
  if (phase.value !== 'hold' || !audioCtx || !graph) return
  const gen = generation
  phase.value = 'leaving'
  const master = graph.master
  const t = audioCtx.currentTime
  master.gain.cancelScheduledValues(t)
  master.gain.setValueAtTime(safeRamp(master.gain.value), t)
  master.gain.exponentialRampToValueAtTime(RAMP_FLOOR, t + FADE_OUT)
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
  teardownGraph()
  if (audioCtx && audioCtx.state !== 'closed') {
    void audioCtx.close().catch(() => {})
  }
  audioCtx = null
})
</script>

<template>
  <div class="bw" :data-phase="phase" :data-bw-theme="theme.theme">
    <NuxtLink
      to="/engage"
      class="bw__iconbtn bw__back"
      aria-label="Back to Engage"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
    </NuxtLink>

    <button
      type="button"
      class="bw__iconbtn bw__theme"
      :aria-label="`Switch to ${theme.theme === 'dark' ? 'light' : 'dark'} mode`"
      @click.stop.prevent="onThemeToggle"
    >
      <EdSignalIcon :name="theme.theme === 'dark' ? 'sun' : 'moon'" />
    </button>

    <div v-if="phase === 'land'" class="bw__land">
      <p class="bw__eyebrow bw__anim" style="--i:0">Engage</p>
      <h1 class="bw__title bw__anim" style="--i:1">Brainwave</h1>
      <p class="bw__lede bw__anim" style="--i:2">A beat you tune, in hertz.</p>
      <div class="bw__tune bw__anim" style="--i:3">
        <div class="bw__tune-head">
          <span class="bw__hz">{{ hzLabel }} Hz</span>
          <span class="bw__band">{{ band }}</span>
        </div>
        <input
          class="bw__slider"
          type="range"
          min="0.5"
          max="40"
          step="0.5"
          :value="beatHz"
          aria-label="Beat frequency in hertz"
          @input="onSlider"
        >
        <label class="bw__type">
          <span>Hertz</span>
          <input
            type="number"
            inputmode="decimal"
            min="0.5"
            max="40"
            step="0.5"
            :value="beatHz"
            aria-label="Type a beat frequency in hertz"
            @input="onTyped"
            @change="onTyped"
          >
        </label>
      </div>
      <p class="bw__phones bw__anim" style="--i:4">The beat is clearest in headphones.</p>
      <button
        class="bw__cta bw__anim bw__cta--pulse"
        style="--i:5"
        type="button"
        @click="begin"
      >
        Begin
      </button>
      <p class="bw__fine">A listening piece, not a medical device. It does not treat, entrain, or diagnose anything.</p>
    </div>

    <div v-else class="bw__hold" :class="{ 'bw__hold--leaving': phase === 'leaving' }">
      <div class="bw__orb" aria-hidden="true" />
      <p class="bw__time">{{ hzLabel }} <span>Hz</span></p>
      <p class="bw__band bw__band--hold">{{ band }}</p>
      <div class="bw__tune">
        <input
          class="bw__slider"
          type="range"
          min="0.5"
          max="40"
          step="0.5"
          :value="beatHz"
          :disabled="phase === 'leaving'"
          aria-label="Beat frequency in hertz"
          @input="onSlider"
        >
        <label class="bw__type">
          <span>Hertz</span>
          <input
            type="number"
            inputmode="decimal"
            min="0.5"
            max="40"
            step="0.5"
            :value="beatHz"
            :disabled="phase === 'leaving'"
            aria-label="Type a beat frequency in hertz"
            @input="onTyped"
            @change="onTyped"
          >
        </label>
      </div>
      <p class="bw__phones">The beat is clearest in headphones.</p>
      <button
        class="bw__leave"
        type="button"
        :disabled="phase === 'leaving'"
        @click="leave"
      >
        Leave
      </button>
      <p class="bw__fine">A listening piece, not a medical device. It does not treat, entrain, or diagnose anything.</p>
    </div>
  </div>
</template>

<style scoped>
.bw {
  --bw-paper: #fbf8ef;
  --bw-ink: #161618;
  --bw-yellow: #ffd43b;
  --ink: var(--bw-ink);
  --accent: var(--bw-yellow);
  position: relative;
  width: 100%;
  height: 100svh;
  height: 100dvh;
  max-height: 100dvh;
  background: var(--bw-paper);
  color: var(--bw-ink);
  overflow: hidden;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 280ms ease, color 280ms ease;
}

.bw[data-bw-theme='dark'] {
  --bw-paper: #121214;
  --bw-ink: #ede6d6;
  --bw-yellow: #e8c547;
}

.bw__iconbtn {
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
  background: color-mix(in srgb, var(--bw-paper) 55%, transparent);
  color: color-mix(in srgb, var(--bw-ink) 70%, transparent);
  text-decoration: none;
  cursor: pointer;
  appearance: none;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: color 160ms ease, background 160ms ease, transform 120ms ease;
}
.bw__iconbtn:hover,
.bw__iconbtn:focus-visible {
  color: var(--bw-ink);
  background: color-mix(in srgb, var(--bw-paper) 82%, transparent);
}
.bw__iconbtn:focus-visible {
  outline: 2rem solid var(--bw-yellow);
  outline-offset: 2rem;
}
.bw__iconbtn:active {
  transform: scale(0.94);
}

.bw__back { left: max(10rem, env(safe-area-inset-left)); }
.bw__back svg {
  width: 20rem;
  height: 20rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.25;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.bw__theme { right: max(10rem, env(safe-area-inset-right)); }
.bw__theme :deep(svg) {
  width: 18rem;
  height: 18rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.bw__land,
.bw__hold {
  position: absolute;
  inset: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 12rem;
  padding: 28rem 24rem;
  padding-top: max(72rem, calc(env(safe-area-inset-top) + 56rem));
  padding-bottom: max(72rem, calc(env(safe-area-inset-bottom) + 56rem));
  text-align: center;
}

.bw__eyebrow {
  margin: 0;
  font: 800 11rem/1 var(--font-mono);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  opacity: 0.72;
}

.bw__title {
  margin: 0;
  font: 700 clamp(52rem, 14vw, 104rem)/0.86 var(--font-display);
  letter-spacing: -0.06em;
  text-wrap: balance;
}

.bw__lede {
  margin: 0;
  font-size: 15rem;
  line-height: 1.4;
  max-width: 28ch;
  letter-spacing: 0.01em;
  opacity: 0.82;
}

.bw__tune {
  display: grid;
  gap: 8rem;
  width: min(320rem, 86vw);
  justify-items: stretch;
}

.bw__tune-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12rem;
}

.bw__hz {
  font: 700 28rem/1 var(--font-display);
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}

.bw__band {
  font: 700 11rem/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.55;
}
.bw__band--hold { margin: 0; }

.bw__slider {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 44rem;
  margin: 0;
  background: transparent;
  cursor: pointer;
}
.bw__slider:disabled { cursor: default; opacity: 0.5; }
.bw__slider::-webkit-slider-runnable-track {
  height: 3rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bw-ink) 28%, transparent);
}
.bw__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22rem;
  height: 22rem;
  margin-top: -9.5rem;
  border-radius: 50%;
  border: none;
  background: var(--bw-yellow);
}
.bw__slider::-moz-range-track {
  height: 3rem;
  border: none;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bw-ink) 28%, transparent);
}
.bw__slider::-moz-range-thumb {
  width: 22rem;
  height: 22rem;
  border: none;
  border-radius: 50%;
  background: var(--bw-yellow);
}
.bw__slider:focus-visible {
  outline: 2rem solid var(--bw-yellow);
  outline-offset: 2rem;
}

.bw__type {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 10rem;
  min-height: 44rem;
  color: color-mix(in srgb, var(--bw-ink) 62%, transparent);
  font: 700 10rem/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.bw__type input {
  appearance: none;
  width: 100%;
  min-height: 44rem;
  margin: 0;
  padding: 0 12rem;
  border: 1.5rem solid color-mix(in srgb, var(--bw-ink) 28%, transparent);
  border-radius: 999px;
  background: transparent;
  color: var(--bw-ink);
  font: 700 16rem/1 var(--font-mono);
  letter-spacing: 0;
  text-transform: none;
  text-align: center;
  font-variant-numeric: tabular-nums;
  user-select: text;
  -webkit-user-select: text;
}
.bw__type input:focus-visible {
  outline: 2rem solid var(--bw-yellow);
  outline-offset: 2rem;
}
.bw__type input:disabled { opacity: 0.5; }

.bw__phones {
  margin: 0;
  font-size: 13rem;
  line-height: 1.35;
  opacity: 0.62;
}

.bw__cta {
  appearance: none;
  border: none;
  background: var(--bw-yellow);
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
    0 8rem 20rem color-mix(in srgb, var(--bw-ink) 10%, transparent);
  transition: transform 160ms ease, box-shadow 160ms ease;
}
.bw__cta:hover,
.bw__cta:focus-visible {
  transform: translateY(-1rem);
}
.bw__cta:focus-visible {
  outline: 2rem solid var(--bw-ink);
  outline-offset: 3rem;
}
.bw__cta:active {
  transform: translateY(2rem) scale(0.98);
  box-shadow:
    0 0 0 transparent,
    0 2rem 8rem color-mix(in srgb, var(--bw-ink) 8%, transparent);
}

.bw__anim {
  animation: bw-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 65ms + 30ms);
}

.bw__cta--pulse {
  animation:
    bw-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both,
    bw-cta-pulse 2.6s ease-in-out 650ms infinite;
  animation-delay: calc(var(--i, 0) * 65ms + 30ms), 650ms;
}

.bw__orb {
  width: min(42vw, 200rem);
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    radial-gradient(circle at 38% 34%, #fff8d6 0%, var(--bw-yellow) 36%, color-mix(in srgb, var(--bw-yellow) 28%, transparent) 62%, transparent 72%);
  box-shadow:
    0 0 48rem color-mix(in srgb, var(--bw-yellow) 42%, transparent),
    0 0 120rem color-mix(in srgb, var(--bw-yellow) 22%, transparent);
  animation: bw-breathe 8s ease-in-out infinite;
}

.bw__time {
  margin: 4rem 0 0;
  font: 700 clamp(40rem, 10vw, 64rem)/0.9 var(--font-display);
  letter-spacing: -0.05em;
  font-variant-numeric: tabular-nums;
}
.bw__time span {
  font: 700 14rem/1 var(--font-mono);
  letter-spacing: 0.12em;
  opacity: 0.55;
}

.bw__leave {
  appearance: none;
  min-width: 44rem;
  min-height: 44rem;
  margin-top: 4rem;
  padding: 12rem 22rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: color-mix(in srgb, var(--bw-ink) 70%, transparent);
  font: 800 12rem/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
}
.bw__leave:hover,
.bw__leave:focus-visible {
  color: var(--bw-ink);
}
.bw__leave:focus-visible {
  outline: 2rem solid var(--bw-yellow);
  outline-offset: 3rem;
}
.bw__leave:disabled {
  cursor: default;
  opacity: 0.45;
}

.bw__hold--leaving .bw__orb {
  opacity: 0.35;
  transition: opacity 2s linear;
}

.bw__fine {
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

@keyframes bw-rise {
  from { opacity: 0; transform: translateY(12rem); }
  to { opacity: 1; transform: none; }
}
@keyframes bw-cta-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.025); }
}
@keyframes bw-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.045); }
}

@media (prefers-reduced-motion: reduce) {
  .bw,
  .bw__anim,
  .bw__cta--pulse,
  .bw__orb,
  .bw__hold--leaving .bw__orb {
    animation: none !important;
    transition: none !important;
  }
  .bw__anim,
  .bw__cta--pulse { opacity: 1; transform: none; }
}
</style>
