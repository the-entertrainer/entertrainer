<script setup lang="ts">
definePageMeta({ layout: false })
/**
 * THIRD EYE — twelve breaths, a hold, then a quieter pair.
 * Same cream / ink / yellow shell as The Gateway.
 * The live mark is one cobalt ring. No camera, no glow.
 * 40 Hz light only when this screen can sample the square.
 */
import { useThemeStore } from '~/stores/theme'
import {
  BREATH_IN_MS,
  BREATH_OUT_MS,
  CYCLES,
  HOLD_CAP_MS,
  IGNITION_LEFT,
  IGNITION_RIGHT,
  THETA_LEFT,
  THETA_RIGHT,
  breathPhase,
  strobeOn,
  frameCanSampleStrobe,
} from '~/utils/third-eye-math.mjs'

useSeoMeta({
  title: 'Third Eye · Engage',
  description: 'Headphones on, screen bright. Twelve breaths, then a tone.',
  ogUrl: 'https://entertrainer.in/engage/third-eye',
})

const TONE_GAIN = 0.08
const TONE_FADE = 0.4
const DRIFT = 8
const STROBE_FADE = 2
const FADE_OUT = 2
const SAMPLE_FRAMES = 20
const TICK_PEAK = 0.04
const CYCLE_MS = BREATH_IN_MS + BREATH_OUT_MS

const TICKS: number[] = []
for (let i = 0; i < CYCLES; i++) {
  TICKS.push(i * CYCLE_MS)
  TICKS.push(i * CYCLE_MS + BREATH_IN_MS)
}

type Phase = 'land' | 'breath' | 'hold' | 'field' | 'leaving'

type Graph = {
  left: OscillatorNode
  right: OscillatorNode
  leftGain: GainNode
  rightGain: GainNode
  master: GainNode
  nodes: AudioNode[]
}

type Tick = { osc: OscillatorNode, gain: GainNode }

const theme = useThemeStore()
const phase = ref<Phase>('land')
const volume = ref(0.75)
const elapsed = ref(0)
const countLabel = ref('1')
const breathWord = ref('Inhale')
const steadyNote = ref(false)

const clock = computed(() => {
  const s = elapsed.value
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
})

const lightOn = computed(() => phase.value === 'hold' || phase.value === 'field' || phase.value === 'leaving')

const ringEl = ref<SVGSVGElement | null>(null)
const flashEl = ref<HTMLElement | null>(null)

let audioCtx: AudioContext | null = null
let graph: Graph | null = null
let generation = 0
let leaveTimer = 0
let clockTimer = 0
let startedAt = 0
let breathT0 = 0
let holdT0 = 0
let nextTick = 0
let fadeAt = 0
let strobeLive = false
const wantFlash = ref(false)
let raf = 0
let measureRaf = 0
const ticks = new Set<Tick>()

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

function stopLoop() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}

function cancelMeasure() {
  if (measureRaf) cancelAnimationFrame(measureRaf)
  measureRaf = 0
}

function stopTicks() {
  for (const tick of ticks) {
    tick.osc.onended = null
    try { tick.osc.stop() } catch { /* already stopped */ }
    try { tick.osc.disconnect() } catch { /* already disconnected */ }
    try { tick.gain.disconnect() } catch { /* already disconnected */ }
  }
  ticks.clear()
}

function teardownGraph() {
  const g = graph
  graph = null
  if (!g) return
  try { g.left.stop() } catch { /* already stopped */ }
  try { g.right.stop() } catch { /* already stopped */ }
  for (const node of g.nodes) {
    try { node.disconnect() } catch { /* already disconnected */ }
  }
}

/**
 * Exponential ramps throw if they start at or cross 0.
 * Floor the current value, then ramp to a positive target.
 */
function expTo(param: AudioParam, value: number, when: number, now: number) {
  const target = Math.max(value, 0.0001)
  param.cancelScheduledValues(now)
  param.setValueAtTime(Math.max(param.value, 0.0001), now)
  param.exponentialRampToValueAtTime(target, when)
}

function breathScale(elapsedMs: number) {
  const p = breathPhase(elapsedMs)
  const min = 0.72
  const max = 1
  if (p.done) return min
  const within = elapsedMs - p.index * CYCLE_MS
  if (p.inhale) {
    const u = Math.min(1, Math.max(0, within / BREATH_IN_MS))
    const e = 0.5 - 0.5 * Math.cos(Math.PI * u)
    return min + (max - min) * e
  }
  const u = Math.min(1, Math.max(0, (within - BREATH_IN_MS) / BREATH_OUT_MS))
  const e = 0.5 - 0.5 * Math.cos(Math.PI * u)
  return max - (max - min) * e
}

function syncBreathText(elapsedMs: number) {
  const p = breathPhase(elapsedMs)
  const n = String(p.index + 1)
  const w = p.inhale ? 'Inhale' : 'Exhale'
  if (countLabel.value !== n) countLabel.value = n
  if (breathWord.value !== w) breathWord.value = w
}

function blip() {
  if (!audioCtx || !graph) return
  const ctx = audioCtx
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(392, t)
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(TICK_PEAK, t + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
  osc.connect(gain)
  gain.connect(graph.master)
  const tick: Tick = { osc, gain }
  ticks.add(tick)
  osc.onended = () => {
    try { osc.disconnect() } catch { /* already disconnected */ }
    try { gain.disconnect() } catch { /* already disconnected */ }
    ticks.delete(tick)
  }
  osc.start(t)
  osc.stop(t + 0.08)
}

function catchTicks(elapsedMs: number) {
  let crossed = 0
  while (nextTick < TICKS.length && elapsedMs >= TICKS[nextTick]) {
    nextTick += 1
    crossed += 1
  }
  if (crossed) blip()
}

function buildSilentTones(ctx: AudioContext) {
  const t = ctx.currentTime
  const master = ctx.createGain()
  master.gain.setValueAtTime(volume.value, t)

  const merger = ctx.createChannelMerger(2)
  const leftGain = ctx.createGain()
  const rightGain = ctx.createGain()
  leftGain.gain.setValueAtTime(0, t)
  rightGain.gain.setValueAtTime(0, t)
  leftGain.connect(merger, 0, 0)
  rightGain.connect(merger, 0, 1)

  const left = ctx.createOscillator()
  const right = ctx.createOscillator()
  left.type = 'sine'
  right.type = 'sine'
  left.frequency.setValueAtTime(IGNITION_LEFT, t)
  right.frequency.setValueAtTime(IGNITION_RIGHT, t)
  left.connect(leftGain)
  right.connect(rightGain)

  merger.connect(master)
  master.connect(ctx.destination)
  left.start(t)
  right.start(t)

  graph = {
    left,
    right,
    leftGain,
    rightGain,
    master,
    nodes: [left, right, leftGain, rightGain, merger, master],
  }
}

function rampToneIn() {
  if (!audioCtx || !graph) return
  const t = audioCtx.currentTime
  const left = graph.leftGain.gain
  const right = graph.rightGain.gain
  left.cancelScheduledValues(t)
  right.cancelScheduledValues(t)
  left.setValueAtTime(0, t)
  right.setValueAtTime(0, t)
  left.linearRampToValueAtTime(TONE_GAIN, t + TONE_FADE)
  right.linearRampToValueAtTime(TONE_GAIN, t + TONE_FADE)
}

function measureDisplay(gen: number) {
  cancelMeasure()
  const deltas: number[] = []
  let last = 0
  const step = (now: number) => {
    if (gen !== generation || phase.value !== 'hold') {
      measureRaf = 0
      return
    }
    if (last) deltas.push(now - last)
    last = now
    if (deltas.length >= SAMPLE_FRAMES) {
      measureRaf = 0
      const sorted = [...deltas].sort((a, b) => a - b)
      const mid = sorted.length / 2
      const median = (sorted[mid - 1] + sorted[mid]) / 2
      if (gen !== generation || phase.value !== 'hold') return
      if (frameCanSampleStrobe(median)) strobeLive = true
      else steadyNote.value = true
      return
    }
    measureRaf = requestAnimationFrame(step)
  }
  measureRaf = requestAnimationFrame(step)
}

function paintFlash() {
  const el = flashEl.value
  if (!el) return
  if (!strobeLive || !audioCtx || phase.value === 'land' || phase.value === 'breath') {
    el.style.opacity = '0'
    return
  }
  let opacity = 1
  if (fadeAt > 0) {
    const u = (audioCtx.currentTime - fadeAt) / STROBE_FADE
    opacity = Math.max(0, 1 - u)
  }
  el.style.opacity = String(opacity)
  if (opacity > 0.004) {
    el.style.background = strobeOn(audioCtx.currentTime) ? '#fbf8ef' : '#121214'
  }
}

function frame(now: number) {
  raf = requestAnimationFrame(frame)
  if (phase.value === 'breath') {
    const ms = now - breathT0
    catchTicks(ms)
    if (breathPhase(ms).done) startHold()
    else {
      syncBreathText(ms)
      if (ringEl.value) ringEl.value.style.transform = `scale(${breathScale(ms)})`
    }
  }
  if (phase.value === 'hold' && now - holdT0 >= HOLD_CAP_MS) startField()
  paintFlash()
  if (phase.value === 'field' || phase.value === 'leaving') {
    const stillFading = strobeLive && !!audioCtx && fadeAt > 0 && (audioCtx.currentTime - fadeAt) < STROBE_FADE
    if (!stillFading) stopLoop()
  }
}

function applyVolume(next: number) {
  if (!audioCtx || !graph || phase.value !== 'field') return
  const t = audioCtx.currentTime
  const gain = graph.master.gain
  gain.cancelScheduledValues(t)
  gain.setTargetAtTime(Math.max(0, Math.min(1, next)), t, 0.04)
}

watch(volume, (next) => applyVolume(next))

function begin(flash: boolean) {
  if (phase.value !== 'land') return
  generation += 1
  clearLeave()
  stopTicks()
  teardownGraph()
  cancelMeasure()
  stopLoop()
  stopClock()
  wantFlash.value = flash
  steadyNote.value = false
  strobeLive = false
  fadeAt = 0
  nextTick = 0
  countLabel.value = '1'
  breathWord.value = 'Inhale'

  const ctx = ensureContext()
  if (!ctx) return
  buildSilentTones(ctx)
  breathT0 = performance.now()
  phase.value = 'breath'
  raf = requestAnimationFrame(frame)
}

function startHold() {
  if (phase.value !== 'breath') return
  phase.value = 'hold'
  holdT0 = performance.now()
  if (audioCtx && audioCtx.state === 'suspended') void audioCtx.resume()
  rampToneIn()
  if (wantFlash.value) measureDisplay(generation)
}

function startField() {
  if (phase.value !== 'hold' || !audioCtx || !graph) return
  phase.value = 'field'
  cancelMeasure()
  const t = audioCtx.currentTime
  fadeAt = t
  expTo(graph.left.frequency, THETA_LEFT, t + DRIFT, t)
  expTo(graph.right.frequency, THETA_RIGHT, t + DRIFT, t)
  startClock()
}

function finishLeave(gen: number) {
  if (gen !== generation) return
  stopTicks()
  teardownGraph()
  stopClock()
  stopLoop()
  cancelMeasure()
  strobeLive = false
  fadeAt = 0
  phase.value = 'land'
}

function leave() {
  if (phase.value !== 'field' || !audioCtx || !graph) return
  const gen = generation
  phase.value = 'leaving'
  const t = audioCtx.currentTime
  const gain = graph.master.gain
  gain.cancelScheduledValues(t)
  gain.setValueAtTime(Math.max(gain.value, 0.0001), t)
  gain.exponentialRampToValueAtTime(0.0001, t + FADE_OUT)
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
  stopLoop()
  cancelMeasure()
  stopTicks()
  teardownGraph()
  if (audioCtx && audioCtx.state !== 'closed') {
    void audioCtx.close().catch(() => {})
  }
  audioCtx = null
})
</script>

<template>
  <div class="te" :data-phase="phase" :data-te-theme="theme.theme">
    <div class="te__warm" :data-on="lightOn ? 'yes' : 'no'" aria-hidden="true" />
    <div ref="flashEl" class="te__flash" aria-hidden="true" />

    <NuxtLink
      to="/engage"
      class="te__iconbtn te__back"
      aria-label="Back to Engage"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
    </NuxtLink>

    <button
      type="button"
      class="te__iconbtn te__theme"
      :aria-label="`Switch to ${theme.theme === 'dark' ? 'light' : 'dark'} mode`"
      @click.stop.prevent="onThemeToggle"
    >
      <EdSignalIcon :name="theme.theme === 'dark' ? 'sun' : 'moon'" />
    </button>

    <div v-if="phase === 'land'" class="te__land">
      <p class="te__eyebrow te__anim" style="--i:0">Engage</p>
      <h1 class="te__title te__anim" style="--i:1">Third Eye</h1>
      <p class="te__lede te__anim" style="--i:2">Headphones on, screen bright, eyes closed when the light starts.</p>
      <button
        class="te__cta te__anim"
        style="--i:3"
        type="button"
        @click="begin(true)"
      >
        Begin
      </button>
      <button
        class="te__quiet te__anim"
        style="--i:4"
        type="button"
        @click="begin(false)"
      >
        Begin without the flash
      </button>
      <p class="te__caution te__anim" style="--i:5">Flashing light can bother some people. Skip it if strobes are a problem.</p>
      <p class="te__fine">An experiential listening and light guide. Not a medical device.</p>
    </div>

    <div v-else-if="phase === 'breath'" class="te__breath">
      <div class="te__mark">
        <svg ref="ringEl" class="te__ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#2F5BD8" stroke-width="1.35" />
        </svg>
        <div class="te__count">
          <span class="te__num">{{ countLabel }}</span>
          <span class="te__of">of 12</span>
        </div>
      </div>
      <p class="te__word" aria-live="polite">{{ breathWord }}</p>
      <p class="te__fine">An experiential listening and light guide. Not a medical device.</p>
    </div>

    <div v-else-if="phase === 'hold'" class="te__hold">
      <p class="te__holdword">Hold</p>
      <p v-if="steadyNote" class="te__note">This screen can't flash at 40 cleanly, so the light stays steady.</p>
      <button class="te__cta" type="button" @click="startField">
        Inhale
      </button>
      <p v-if="steadyNote || !wantFlash" class="te__fine">An experiential listening and light guide. Not a medical device.</p>
    </div>

    <div v-else class="te__open" :class="{ 'te__open--leaving': phase === 'leaving' }">
      <svg class="te__still" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="46" fill="none" stroke="#2F5BD8" stroke-width="1.35" />
      </svg>
      <p class="te__time">{{ clock }}</p>
      <label class="te__vol">
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
        class="te__leave"
        type="button"
        :disabled="phase === 'leaving'"
        @click="leave"
      >
        Leave
      </button>
      <p class="te__fine">An experiential listening and light guide. Not a medical device.</p>
    </div>
  </div>
</template>

<style scoped>
.te {
  --te-paper: #fbf8ef;
  --te-ink: #161618;
  --te-yellow: #ffd43b;
  --te-warm: #f4e2bc;
  --ink: var(--te-ink);
  --accent: var(--te-yellow);
  position: relative;
  width: 100%;
  height: 100svh;
  height: 100dvh;
  max-height: 100dvh;
  background: var(--te-paper);
  color: var(--te-ink);
  overflow: hidden;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 280ms ease, color 280ms ease;
}

.te[data-te-theme='dark'] {
  --te-paper: #121214;
  --te-ink: #ede6d6;
  --te-yellow: #e8c547;
  --te-warm: #2a2318;
}

.te__warm,
.te__flash {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.te__warm {
  z-index: 0;
  background: var(--te-warm);
  opacity: 0;
}
.te__warm[data-on='yes'] { opacity: 1; }

.te__flash {
  z-index: 1;
  opacity: 0;
}

.te__iconbtn {
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
  background: color-mix(in srgb, var(--te-paper) 55%, transparent);
  color: color-mix(in srgb, var(--te-ink) 70%, transparent);
  text-decoration: none;
  cursor: pointer;
  appearance: none;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: color 160ms ease, background 160ms ease, transform 120ms ease;
}
.te__iconbtn:hover,
.te__iconbtn:focus-visible {
  color: var(--te-ink);
  background: color-mix(in srgb, var(--te-paper) 82%, transparent);
}
.te__iconbtn:focus-visible {
  outline: 2rem solid var(--te-yellow);
  outline-offset: 2rem;
}
.te__iconbtn:active { transform: scale(0.94); }

.te[data-phase='hold'] .te__iconbtn { background: var(--te-paper); }
.te__back { left: max(10rem, env(safe-area-inset-left)); }
.te__back svg {
  width: 20rem;
  height: 20rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.25;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.te__theme { right: max(10rem, env(safe-area-inset-right)); }
.te__theme :deep(svg) {
  width: 18rem;
  height: 18rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.te__land,
.te__breath,
.te__hold,
.te__open {
  position: absolute;
  z-index: 2;
  inset: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 12rem;
  padding: 28rem 24rem;
  padding-top: max(72rem, calc(env(safe-area-inset-top) + 56rem));
  padding-bottom: max(64rem, calc(env(safe-area-inset-bottom) + 48rem));
  text-align: center;
  background: transparent;
}

.te__land { overflow: auto; }

.te__eyebrow {
  margin: 0;
  font: 800 11rem/1 var(--font-mono);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  opacity: 0.72;
}

.te__title {
  margin: 0;
  font: 700 clamp(52rem, 14vw, 104rem)/0.86 var(--font-display);
  letter-spacing: -0.06em;
  text-wrap: balance;
}

.te__lede,
.te__caution,
.te__note {
  margin: 0;
  max-width: 34ch;
  font-size: 15rem;
  line-height: 1.4;
  letter-spacing: 0.01em;
}

.te__lede { margin-bottom: 6rem; opacity: 0.82; }
.te__caution { font-size: 13rem; opacity: 0.62; }
.te__note {
  padding: 8rem 12rem;
  border-radius: 12rem;
  background: var(--te-paper);
  font-size: 14rem;
  opacity: 0.86;
}

.te__cta {
  appearance: none;
  border: none;
  background: var(--te-yellow);
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
    0 8rem 20rem color-mix(in srgb, var(--te-ink) 10%, transparent);
  transition: transform 160ms ease, box-shadow 160ms ease;
}
.te__cta:hover,
.te__cta:focus-visible { transform: translateY(-1rem); }
.te__cta:focus-visible {
  outline: 2rem solid var(--te-ink);
  outline-offset: 3rem;
}
.te__cta:active {
  transform: translateY(2rem) scale(0.98);
  box-shadow:
    0 0 0 transparent,
    0 2rem 8rem color-mix(in srgb, var(--te-ink) 8%, transparent);
}

.te__quiet {
  appearance: none;
  min-height: 44rem;
  margin-top: -4rem;
  padding: 12rem 18rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: color-mix(in srgb, var(--te-ink) 74%, transparent);
  font: 700 13rem/1.3 var(--font-mono);
  letter-spacing: 0.04em;
  cursor: pointer;
}
.te__quiet:hover,
.te__quiet:focus-visible { color: var(--te-ink); }
.te__quiet:focus-visible {
  outline: 2rem solid var(--te-yellow);
  outline-offset: 3rem;
}

.te__anim {
  animation: te-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 65ms + 30ms);
}

.te__mark {
  position: relative;
  width: min(68vw, 320rem);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
}

.te__ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: scale(0.72);
  transform-origin: center;
}

.te__count {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  gap: 2rem;
}

.te__num {
  font: 700 clamp(72rem, 18vw, 128rem)/0.84 var(--font-display);
  letter-spacing: -0.06em;
  font-variant-numeric: tabular-nums;
}

.te__of {
  font: 500 15rem/1 var(--font-display);
  letter-spacing: -0.02em;
  opacity: 0.45;
}

.te__word {
  margin: 4rem 0 0;
  font: 600 18rem/1 var(--font-display);
  letter-spacing: -0.03em;
}

.te__holdword {
  margin: 0;
  padding: 4rem 18rem;
  border-radius: 18rem;
  background: var(--te-paper);
  font: 700 clamp(56rem, 14vw, 104rem)/0.86 var(--font-display);
  letter-spacing: -0.06em;
}

.te__still {
  width: min(34vw, 148rem);
  height: auto;
}

.te__time {
  margin: 8rem 0 0;
  font: 700 clamp(40rem, 10vw, 64rem)/0.9 var(--font-display);
  letter-spacing: -0.05em;
  font-variant-numeric: tabular-nums;
}

.te__vol {
  display: grid;
  gap: 8rem;
  width: min(240rem, 72vw);
  margin-top: 8rem;
  color: color-mix(in srgb, var(--te-ink) 62%, transparent);
  font: 700 10rem/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  position: relative;
  z-index: 3;
}
.te__vol input {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 44rem;
  margin: 0;
  background: transparent;
  cursor: pointer;
  touch-action: pan-x;
}
.te__vol input:disabled { cursor: default; opacity: 0.5; }
.te__vol input::-webkit-slider-runnable-track {
  height: 3rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--te-ink) 28%, transparent);
}
.te__vol input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18rem;
  height: 18rem;
  margin-top: -7.5rem;
  border-radius: 50%;
  border: none;
  background: var(--te-yellow);
}
.te__vol input::-moz-range-track {
  height: 3rem;
  border: none;
  border-radius: 999px;
  background: color-mix(in srgb, var(--te-ink) 28%, transparent);
}
.te__vol input::-moz-range-thumb {
  width: 18rem;
  height: 18rem;
  border: none;
  border-radius: 50%;
  background: var(--te-yellow);
}

.te__leave {
  appearance: none;
  min-width: 44rem;
  min-height: 44rem;
  margin-top: 4rem;
  padding: 12rem 22rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: color-mix(in srgb, var(--te-ink) 70%, transparent);
  font: 800 12rem/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  z-index: 3;
}
.te__leave:hover,
.te__leave:focus-visible { color: var(--te-ink); }
.te__leave:focus-visible {
  outline: 2rem solid var(--te-yellow);
  outline-offset: 3rem;
}
.te__leave:disabled { cursor: default; opacity: 0.45; }

.te__open--leaving .te__still { opacity: 0.4; }

.te__fine {
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

@keyframes te-rise {
  from { opacity: 0; transform: translateY(12rem); }
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .te,
  .te__anim,
  .te__iconbtn,
  .te__cta,
  .te__quiet,
  .te__leave,
  .te__open--leaving .te__still {
    animation: none !important;
    transition: none !important;
  }
  .te__anim { opacity: 1; transform: none; }
}
</style>
