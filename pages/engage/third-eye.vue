<script setup lang="ts">
definePageMeta({ layout: false })
/**
 * THIRD EYE — twelve breaths, a hold, then a quieter pair.
 * This page only: a Windows 11 desktop. The session maths are untouched.
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

const minimized = ref(false)
const maximized = ref(false)
const popping = ref(true)
const startOpen = ref(false)
const volOpen = ref(false)
const exitQuiet = ref(false)
const trayTime = ref('')
const trayDate = ref('')

const clock = computed(() => {
  const s = elapsed.value
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
})

const lightOn = computed(() => phase.value === 'hold' || phase.value === 'field' || phase.value === 'leaving')

const volLevel = computed(() => {
  if (volume.value <= 0.001) return 0
  if (volume.value < 0.34) return 1
  if (volume.value < 0.67) return 2
  return 3
})

const ringEl = ref<SVGSVGElement | null>(null)
const flashEl = ref<HTMLElement | null>(null)

let audioCtx: AudioContext | null = null
let graph: Graph | null = null
let generation = 0
let leaveTimer = 0
let clockTimer = 0
let trayTimer = 0
let popTimer = 0
let startedAt = 0
let breathT0 = 0
let holdT0 = 0
let nextTick = 0
let fadeAt = 0
let strobeLive = false
let exitAfter = false
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
  exitAfter = false
  exitQuiet.value = false
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
  exitQuiet.value = false
  phase.value = 'land'
  if (flashEl.value) flashEl.value.style.opacity = '0'
  if (exitAfter) {
    exitAfter = false
    void navigateTo('/engage')
  }
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

function fadeSession(gen: number) {
  phase.value = 'leaving'
  cancelMeasure()
  if (flashEl.value) flashEl.value.style.opacity = '0'
  strobeLive = false
  if (audioCtx && graph) {
    const t = audioCtx.currentTime
    const gain = graph.master.gain
    gain.cancelScheduledValues(t)
    gain.setValueAtTime(Math.max(gain.value, 0.0001), t)
    gain.exponentialRampToValueAtTime(0.0001, t + FADE_OUT)
    clearLeave()
    leaveTimer = window.setTimeout(() => finishLeave(gen), FADE_OUT * 1000 + 40)
    return
  }
  finishLeave(gen)
}

function requestExit() {
  startOpen.value = false
  volOpen.value = false
  if (minimized.value) minimized.value = false
  if (phase.value === 'land') {
    void navigateTo('/engage')
    return
  }
  if (phase.value === 'leaving') {
    exitAfter = true
    return
  }
  if (phase.value === 'field') {
    exitAfter = true
    leave()
    return
  }
  exitAfter = true
  exitQuiet.value = true
  stopLoop()
  fadeSession(generation)
}

function playOpen() {
  popping.value = true
  if (popTimer) window.clearTimeout(popTimer)
  popTimer = window.setTimeout(() => { popping.value = false }, 220)
}

function minimizeWindow() {
  startOpen.value = false
  volOpen.value = false
  minimized.value = true
}

function restoreWindow() {
  if (!minimized.value) {
    minimizeWindow()
    return
  }
  minimized.value = false
  playOpen()
}

function toggleMax() {
  maximized.value = !maximized.value
}

function toggleStart() {
  startOpen.value = !startOpen.value
  volOpen.value = false
}

function toggleVol() {
  volOpen.value = !volOpen.value
  startOpen.value = false
}

function onDesktopPointer(e: PointerEvent) {
  const t = e.target as HTMLElement | null
  if (!t?.closest('.te__startwrap')) startOpen.value = false
  if (!t?.closest('.te__volwrap')) volOpen.value = false
}

function paintTray() {
  const d = new Date()
  trayTime.value = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  trayDate.value = d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function armTray() {
  if (trayTimer) window.clearTimeout(trayTimer)
  paintTray()
  const wait = 60000 - (Date.now() % 60000) + 40
  trayTimer = window.setTimeout(armTray, wait)
}

function onThemeToggle(e: Event) {
  e.stopPropagation()
  e.preventDefault()
  theme.toggle()
}

onMounted(() => {
  theme.init()
  armTray()
  popTimer = window.setTimeout(() => { popping.value = false }, 220)
})

onBeforeUnmount(() => {
  generation += 1
  clearLeave()
  stopClock()
  stopLoop()
  cancelMeasure()
  stopTicks()
  teardownGraph()
  if (trayTimer) window.clearTimeout(trayTimer)
  if (popTimer) window.clearTimeout(popTimer)
  trayTimer = 0
  popTimer = 0
  if (audioCtx && audioCtx.state !== 'closed') {
    void audioCtx.close().catch(() => {})
  }
  audioCtx = null
})
</script>

<template>
  <div
    class="te"
    :data-phase="phase"
    :data-te-theme="theme.theme"
    @pointerdown="onDesktopPointer"
  >
    <div class="te__wall" aria-hidden="true" />
    <div class="te__grain" aria-hidden="true" />
    <div class="te__warm" :data-on="lightOn ? 'yes' : 'no'" aria-hidden="true" />
    <div ref="flashEl" class="te__flash" aria-hidden="true" />

    <div class="te__stage">
      <section
        v-show="!minimized"
        class="te__window"
        :class="{ 'is-max': maximized, 'is-pop': popping }"
        aria-label="Third Eye"
      >
        <header class="te__titlebar" @dblclick.self="toggleMax">
          <span class="te__appico" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M2.5 12S6.5 6.5 12 6.5 21.5 12 21.5 12 17.5 17.5 12 17.5 2.5 12 2.5 12Z" />
              <circle cx="12" cy="12" r="2.35" />
            </svg>
          </span>
          <h1 class="te__wintitle" @dblclick="toggleMax">Third Eye</h1>
          <button type="button" class="te__back" @click="requestExit">Back to Engage</button>
          <div class="te__caps">
            <button type="button" class="te__cap" aria-label="Minimize" @click="minimizeWindow">
              <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.5h8" /></svg>
            </button>
            <button
              type="button"
              class="te__cap"
              :aria-label="maximized ? 'Restore' : 'Maximize'"
              @click="toggleMax"
            >
              <svg v-if="!maximized" viewBox="0 0 12 12" aria-hidden="true">
                <rect x="2.25" y="2.25" width="7.5" height="7.5" />
              </svg>
              <svg v-else viewBox="0 0 12 12" aria-hidden="true">
                <rect x="3.6" y="1.6" width="6.6" height="6.6" />
                <path d="M1.8 4.2V10h5.6" />
              </svg>
            </button>
            <button type="button" class="te__cap te__cap--close" aria-label="Close" @click="requestExit">
              <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3 3 9" /></svg>
            </button>
          </div>
        </header>

        <div class="te__body">
          <div v-if="phase === 'land'" class="te__land">
            <p class="te__lede">Headphones on, screen bright, eyes closed when the light starts.</p>
            <button class="te__cta" type="button" @click="begin(true)">Begin</button>
            <button class="te__quiet" type="button" @click="begin(false)">Begin without the flash</button>
            <p class="te__caution">Flashing light can bother some people. Skip it if strobes are a problem.</p>
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
            <div class="te__panel">
              <p class="te__holdword">Hold</p>
              <p v-if="steadyNote" class="te__note">This screen can't flash at 40 cleanly, so the light stays steady.</p>
              <button class="te__cta" type="button" @click="startField">Inhale</button>
            </div>
            <p v-if="steadyNote || !wantFlash" class="te__fine">An experiential listening and light guide. Not a medical device.</p>
          </div>

          <div v-else-if="phase === 'leaving' && exitQuiet" class="te__open">
            <p class="te__word">Closing</p>
          </div>

          <div v-else class="te__open" :class="{ 'is-leaving': phase === 'leaving' }">
            <div class="te__panel">
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
                class="te__quiet"
                type="button"
                :disabled="phase === 'leaving'"
                @click="leave"
              >
                Leave
              </button>
            </div>
            <p class="te__fine">An experiential listening and light guide. Not a medical device.</p>
          </div>
        </div>
      </section>
    </div>

    <footer class="te__taskbar">
      <div class="te__startwrap">
        <button
          type="button"
          class="te__tb te__start"
          aria-label="Start"
          :aria-expanded="startOpen"
          @click="toggleStart"
        >
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <path d="M1 1h7v7H1V1zm9 0h7v7h-7V1zM1 10h7v7H1v-7zm9 0h7v7h-7v-7z" />
          </svg>
        </button>
        <div v-if="startOpen" class="te__fly te__fly--start" role="menu">
          <p class="te__flylabel">Pinned</p>
          <button type="button" class="te__flyitem" role="menuitem" @click="requestExit">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2.5 12S6.5 6.5 12 6.5 21.5 12 21.5 12 17.5 17.5 12 17.5 2.5 12 2.5 12Z" />
              <circle cx="12" cy="12" r="2.35" />
            </svg>
            <span>Back to Engage</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        class="te__tb te__pin"
        :class="{ 'is-on': !minimized }"
        aria-label="Third Eye"
        :aria-pressed="!minimized"
        @click="restoreWindow"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2.5 12S6.5 6.5 12 6.5 21.5 12 21.5 12 17.5 17.5 12 17.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="2.35" />
        </svg>
      </button>

      <div class="te__tray">
        <button
          type="button"
          class="te__tb te__theme"
          :aria-label="`Switch to ${theme.theme === 'dark' ? 'light' : 'dark'} mode`"
          @click.stop.prevent="onThemeToggle"
        >
          <EdSignalIcon :name="theme.theme === 'dark' ? 'sun' : 'moon'" />
        </button>

        <div class="te__volwrap">
          <button
            type="button"
            class="te__tb"
            aria-label="Volume"
            :aria-expanded="volOpen"
            @click="toggleVol"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path class="te__spk" d="M4 9.5h3.2L11 6.2v11.6l-3.8-3.3H4V9.5z" />
              <path v-if="volLevel >= 1" class="te__wave" d="M14.2 10.2a2.6 2.6 0 0 1 0 3.6" />
              <path v-if="volLevel >= 2" class="te__wave" d="M16.2 8.2a5.4 5.4 0 0 1 0 7.6" />
              <path v-if="volLevel >= 3" class="te__wave" d="M18.2 6.3a8.2 8.2 0 0 1 0 11.4" />
              <path v-if="volLevel === 0" class="te__wave" d="M15 10l4 4M19 10l-4 4" />
            </svg>
          </button>
          <div v-if="volOpen" class="te__fly te__fly--vol">
            <label class="te__vol te__vol--fly">
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
          </div>
        </div>

        <div class="te__clock" aria-label="Local time">
          <span class="te__clocktime">{{ trayTime }}</span>
          <span class="te__clockdate">{{ trayDate }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.te {
  --te-bg: #f3f3f3;
  --te-text: #202020;
  --te-muted: #3f3f3f;
  --te-fine: #4d4d4d;
  --te-accent: #0067c0;
  --te-accent-ink: #ffffff;
  --te-line: rgba(0, 0, 0, 0.08);
  --te-edge: rgba(255, 255, 255, 0.72);
  --te-mica: rgba(243, 243, 243, 0.72);
  --te-mica-solid: rgba(249, 249, 249, 0.94);
  --te-hover: rgba(0, 0, 0, 0.06);
  --te-btn: #fbfbfb;
  --te-btn-border: #d0d0d0;
  --te-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    0 1px 1px rgba(0, 0, 0, 0.04),
    0 8px 16px rgba(0, 0, 0, 0.08),
    0 24px 48px rgba(15, 23, 42, 0.16);
  position: relative;
  width: 100%;
  height: 100svh;
  height: 100dvh;
  max-height: 100dvh;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  overflow: hidden;
  color: var(--te-text);
  font-family: "Segoe UI Variable", "Segoe UI", system-ui, sans-serif;
  font-size: 14rem;
  line-height: 1.4;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  color-scheme: light;
}

.te[data-te-theme='dark'] {
  --te-bg: #202020;
  --te-text: #ffffff;
  --te-muted: #e4e4e4;
  --te-fine: #d0d0d0;
  --te-accent: #4ea2ff;
  --te-accent-ink: #04121f;
  --te-line: rgba(255, 255, 255, 0.1);
  --te-edge: rgba(255, 255, 255, 0.14);
  --te-mica: rgba(32, 32, 32, 0.72);
  --te-mica-solid: rgba(32, 32, 32, 0.94);
  --te-hover: rgba(255, 255, 255, 0.08);
  --te-btn: #2c2c2c;
  --te-btn-border: #4a4a4a;
  --te-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.4),
    0 10px 24px rgba(0, 0, 0, 0.38),
    0 28px 64px rgba(0, 0, 0, 0.5);
  color-scheme: dark;
}

.te__wall,
.te__grain,
.te__warm,
.te__flash {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.te__wall {
  z-index: 0;
  background:
    radial-gradient(ellipse 58% 42% at 14% 0%, rgba(255, 255, 255, 0.72), transparent 68%),
    radial-gradient(ellipse 46% 36% at 86% 8%, rgba(255, 255, 255, 0.28), transparent 70%),
    radial-gradient(ellipse 80% 46% at 50% 118%, rgba(156, 174, 188, 0.45), transparent 62%),
    linear-gradient(168deg, #d5e3ee 0%, #e7eef3 38%, #c5d3de 100%);
}

.te[data-te-theme='dark'] .te__wall {
  background:
    radial-gradient(ellipse 52% 38% at 16% 0%, rgba(186, 206, 222, 0.16), transparent 70%),
    radial-gradient(ellipse 40% 30% at 84% 6%, rgba(120, 146, 168, 0.08), transparent 72%),
    radial-gradient(ellipse 90% 42% at 50% 120%, rgba(0, 0, 0, 0.35), transparent 60%),
    linear-gradient(168deg, #1a2430 0%, #141a22 46%, #0d1116 100%);
}

.te__grain {
  z-index: 1;
  opacity: 0.2;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  background-size: 180rem 180rem;
}

.te[data-te-theme='dark'] .te__grain {
  opacity: 0.14;
  mix-blend-mode: overlay;
}

.te__warm {
  z-index: 2;
  background: #f4f7fb;
  opacity: 0;
}
.te[data-te-theme='dark'] .te__warm { background: #243040; }
.te__warm[data-on='yes'] { opacity: 1; }

.te__flash {
  z-index: 3;
  opacity: 0;
}

.te__stage {
  position: relative;
  z-index: 4;
  min-height: 0;
  display: grid;
  place-items: center;
  padding: 16rem;
}

.te__window {
  display: flex;
  flex-direction: column;
  width: min(840rem, calc(100% - 8rem));
  height: min(600rem, calc(100% - 8rem));
  border-radius: 8rem;
  overflow: hidden;
  background: transparent;
  border: 1px solid var(--te-edge);
  box-shadow: var(--te-shadow);
  transform-origin: center center;
}

.te__window.is-max {
  width: calc(100% - 12rem);
  height: calc(100% - 12rem);
}

.te__window.is-pop {
  animation: te-open 180ms ease-out;
}

.te__titlebar {
  display: flex;
  align-items: center;
  gap: 8rem;
  height: 48rem;
  padding: 0 0 0 12rem;
  flex: 0 0 auto;
  background: var(--te-mica);
  backdrop-filter: blur(28px) saturate(1.4);
  -webkit-backdrop-filter: blur(28px) saturate(1.4);
  border-bottom: 1px solid var(--te-line);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.te[data-te-theme='dark'] .te__titlebar {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.te__appico {
  width: 16rem;
  height: 16rem;
  flex: 0 0 auto;
  color: var(--te-text);
}
.te__appico svg,
.te__pin svg,
.te__flyitem svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linejoin: round;
}
.te__appico circle,
.te__pin circle,
.te__flyitem circle { fill: #2F5BD8; stroke: none; }

.te__wintitle {
  margin: 0;
  min-width: 0;
  flex: 1;
  font: 400 12rem/1.2 "Segoe UI Variable", "Segoe UI", system-ui, sans-serif;
  letter-spacing: 0;
  color: var(--te-text);
}

.te__back {
  appearance: none;
  min-height: 44rem;
  margin-right: 4rem;
  padding: 0 12rem;
  border: none;
  border-radius: 4rem;
  background: transparent;
  color: var(--te-text);
  font: 400 14rem/1 "Segoe UI Variable", "Segoe UI", system-ui, sans-serif;
  cursor: pointer;
}
.te__back:hover,
.te__back:focus-visible { background: var(--te-hover); }
.te__back:focus-visible {
  outline: 2rem solid var(--te-accent);
  outline-offset: -2rem;
}

.te__caps {
  display: flex;
  align-self: stretch;
  flex: 0 0 auto;
}

.te__cap {
  appearance: none;
  width: 46rem;
  min-width: 46rem;
  height: 100%;
  min-height: 44rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--te-text);
  cursor: pointer;
  transition: background 120ms ease;
}
.te__cap svg {
  width: 12rem;
  height: 12rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1;
}
.te__cap:hover,
.te__cap:focus-visible { background: var(--te-hover); }
.te__cap:focus-visible { outline: 2rem solid var(--te-accent); outline-offset: -2rem; }
.te__cap--close:hover,
.te__cap--close:focus-visible {
  background: #c42b1c;
  color: #ffffff;
}

.te__body {
  position: relative;
  flex: 1;
  min-height: 0;
  background: var(--te-bg);
  color: var(--te-text);
}

.te[data-phase='hold'] .te__body,
.te[data-phase='field'] .te__body,
.te[data-phase='leaving'] .te__body {
  background: transparent;
}

.te__land,
.te__breath,
.te__hold,
.te__open {
  position: absolute;
  inset: 0;
  overflow: auto;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 12rem;
  padding: 22rem 22rem 56rem;
  text-align: center;
}

.te__lede,
.te__caution,
.te__note,
.te__word,
.te__holdword,
.te__time,
.te__fine {
  margin: 0;
  color: var(--te-text);
}

.te__lede {
  max-width: 36ch;
  font-size: 14rem;
  line-height: 1.45;
  color: var(--te-muted);
}

.te__caution,
.te__note {
  max-width: 38ch;
  font-size: 14rem;
  line-height: 1.4;
  color: var(--te-muted);
}

.te__note {
  padding: 8rem 12rem;
  border-radius: 4rem;
  background: var(--te-bg);
  border: 1px solid var(--te-line);
}

.te__cta,
.te__quiet {
  appearance: none;
  min-height: 44rem;
  padding: 0 18rem;
  border-radius: 4rem;
  font: 400 14rem/1 "Segoe UI Variable", "Segoe UI", system-ui, sans-serif;
  letter-spacing: 0;
  text-transform: none;
  cursor: pointer;
}

.te__cta {
  border: 1px solid transparent;
  background: var(--te-accent);
  color: var(--te-accent-ink);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28);
  transition: transform 80ms ease-out, background 80ms ease;
}
.te__cta:hover { filter: brightness(1.06); }
.te__cta:focus-visible {
  outline: 2rem solid var(--te-text);
  outline-offset: 2rem;
}
.te__cta:active { transform: scale(0.98); }

.te__quiet {
  border: 1px solid var(--te-btn-border);
  background: var(--te-btn);
  color: var(--te-text);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
  transition: background 120ms ease;
}
.te[data-te-theme='dark'] .te__quiet { box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04); }
.te__quiet:hover,
.te__quiet:focus-visible { background: var(--te-hover); }
.te__quiet:focus-visible {
  outline: 2rem solid var(--te-accent);
  outline-offset: 2rem;
}
.te__quiet:disabled { cursor: default; opacity: 0.55; }

.te__mark {
  position: relative;
  width: min(46vw, 240rem);
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
  font: 600 clamp(56rem, 10vw, 84rem)/0.9 "Segoe UI Variable", "Segoe UI", system-ui, sans-serif;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  color: var(--te-text);
}

.te__of {
  font-size: 14rem;
  color: var(--te-muted);
}

.te__word {
  font-size: 16rem;
  font-weight: 600;
}

.te__holdword {
  font: 600 32rem/1.1 "Segoe UI Variable", "Segoe UI", system-ui, sans-serif;
}

.te__panel {
  display: grid;
  justify-items: center;
  gap: 12rem;
  width: min(100%, 360rem);
  padding: 18rem 16rem;
  border-radius: 8rem;
  background: var(--te-mica-solid);
  border: 1px solid var(--te-line);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 8px 20px rgba(0, 0, 0, 0.08);
}

.te__still {
  width: min(34vw, 120rem);
  height: auto;
}

.te__time {
  font: 600 40rem/1 "Segoe UI Variable", "Segoe UI", system-ui, sans-serif;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
}

.te__vol {
  display: grid;
  gap: 6rem;
  width: min(240rem, 72vw);
  color: var(--te-muted);
  font-size: 12rem;
  text-align: left;
}
.te__vol input {
  appearance: none;
  width: 100%;
  height: 44rem;
  margin: 0;
  accent-color: var(--te-accent);
  background: transparent;
  cursor: pointer;
}
.te__vol input:disabled { cursor: default; opacity: 0.5; }

.te__open.is-leaving .te__still { opacity: 0.45; }

.te__fine {
  position: absolute;
  left: 16rem;
  right: 16rem;
  bottom: 12rem;
  padding: 4rem 8rem;
  border-radius: 4rem;
  background: var(--te-mica-solid);
  font-size: 12rem;
  line-height: 1.35;
  color: var(--te-fine);
}

.te__taskbar {
  position: relative;
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 4rem;
  height: calc(48rem + env(safe-area-inset-bottom, 0px));
  padding: 0 10rem env(safe-area-inset-bottom, 0px) 10rem;
  background: var(--te-mica);
  backdrop-filter: blur(30px) saturate(1.5);
  -webkit-backdrop-filter: blur(30px) saturate(1.5);
  border-top: 1px solid var(--te-edge);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.te[data-te-theme='dark'] .te__taskbar {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.te__tb {
  appearance: none;
  width: 44rem;
  height: 44rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 4rem;
  background: transparent;
  color: var(--te-text);
  cursor: pointer;
}
.te__tb:hover,
.te__tb:focus-visible { background: var(--te-hover); }
.te__tb:focus-visible {
  outline: 2rem solid var(--te-accent);
  outline-offset: -2rem;
}
.te__start svg {
  width: 16rem;
  height: 16rem;
  fill: currentColor;
}
.te__pin { position: relative; }
.te__pin svg { width: 20rem; height: 20rem; }
.te__pin::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 3rem;
  width: 0;
  height: 3rem;
  border-radius: 999px;
  background: var(--te-accent);
  transform: translateX(-50%);
  transition: width 160ms ease;
}
.te__pin.is-on::after { width: 16rem; }

.te__theme :deep(svg) {
  width: 16rem;
  height: 16rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.te__tray {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 2rem;
  height: 100%;
}

.te__volwrap,
.te__startwrap { position: relative; }

.te__tb svg { width: 18rem; height: 18rem; }
.te__spk { fill: currentColor; }
.te__wave {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.4;
  stroke-linecap: round;
}

.te__clock {
  display: grid;
  justify-items: center;
  min-width: 76rem;
  padding: 0 8rem;
  line-height: 1.15;
  color: var(--te-text);
}
.te__clocktime { font-size: 12rem; }
.te__clockdate { font-size: 11rem; }

.te__fly {
  position: absolute;
  bottom: calc(100% + 8rem);
  z-index: 7;
  min-width: 220rem;
  padding: 8rem;
  border-radius: 8rem;
  background: var(--te-mica-solid);
  border: 1px solid var(--te-edge);
  box-shadow: var(--te-shadow);
  backdrop-filter: blur(24px) saturate(1.3);
  -webkit-backdrop-filter: blur(24px) saturate(1.3);
}
.te__fly--start { left: 0; }
.te__fly--vol { right: 0; min-width: 200rem; padding: 12rem 14rem; }
.te__flylabel {
  margin: 2rem 8rem 6rem;
  font-size: 12rem;
  color: var(--te-muted);
}
.te__flyitem {
  appearance: none;
  width: 100%;
  min-height: 44rem;
  display: flex;
  align-items: center;
  gap: 10rem;
  padding: 0 10rem;
  border: none;
  border-radius: 4rem;
  background: transparent;
  color: var(--te-text);
  font: 400 14rem/1 "Segoe UI Variable", "Segoe UI", system-ui, sans-serif;
  text-align: left;
  cursor: pointer;
}
.te__flyitem svg { width: 18rem; height: 18rem; flex: 0 0 auto; }
.te__flyitem:hover,
.te__flyitem:focus-visible { background: var(--te-hover); }
.te__flyitem:focus-visible { outline: 2rem solid var(--te-accent); outline-offset: -2rem; }
.te__vol--fly { width: 180rem; }

@keyframes te-open {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .te__window.is-pop { animation: none; }
  .te__cap,
  .te__cta,
  .te__quiet,
  .te__pin::after,
  .te__back { transition: none; }
  .te__cta:active { transform: none; }
}

html[data-reduce-motion="on"] .te__window.is-pop { animation: none; }
</style>
