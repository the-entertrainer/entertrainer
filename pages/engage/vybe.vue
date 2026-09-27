<script setup lang="ts">
definePageMeta({ layout: false })

/**
 * Vybe — the room goes in, a rhythm comes out.
 * Audio stays in the worklet hop. Nothing is stored or sent.
 */
import { openEar, type Ear, type EarFrame } from '~/utils/vybe/listen'
import { createRhythm, type VybeStyle } from '~/utils/vybe/rhythm'
import { createTempo } from '~/utils/vybe/tempo'

useSeoMeta({
  title: 'Vybe · Engage',
  description: 'A tactile synthesizer. The microphone hears the room. A rhythm engine answers with pulses, not a copy of the sound.',
  ogUrl: 'https://entertrainer.in/engage/vybe'
})

const STYLES: { id: VybeStyle; name: string; hint: string }[] = [
  { id: 'pulse', name: 'Pulse', hint: 'Strikes on the beat, then beside it.' },
  { id: 'surge', name: 'Surge', hint: 'Intensity climbs with the room, then breaks.' },
  { id: 'sync', name: 'Sync', hint: 'Off the beat. Triplets against the bar.' },
  { id: 'sub', name: 'Sub', hint: 'Slow weight when the low end is present.' }
]

const style = ref<VybeStyle>('pulse')
const sensitivity = ref(0.62)
const ceiling = ref(0.72)
const divergence = ref(0.4)
const live = ref(false)
const blackout = ref(false)
const level = ref(0)
const bpm = ref(0)
const canVibrate = ref(false)
const error = ref('')
const canvasRef = ref<HTMLCanvasElement | null>(null)

let ear: Ear | null = null
let tempo = createTempo()
let rhythm = createRhythm()
let frame = 0
let holdTimer = 0
let wake: WakeLockSentinel | null = null
let smooth = 0

const styleHint = computed(() => STYLES.find((item) => item.id === style.value)?.hint ?? '')

function gate(value: number) {
  const floor = 0.008 + (1 - sensitivity.value) * 0.06
  if (value <= floor) return 0
  return Math.min(1, (value - floor) / 0.18)
}

function onFrame(features: EarFrame) {
  const snap = tempo.push(performance.now(), features.flux)
  if (snap.bpm) bpm.value = Math.round(snap.bpm)
  const heard = {
    rms: gate(features.rms),
    sub: gate(features.sub),
    bass: gate(features.bass),
    high: gate(features.high),
    flux: gate(features.flux)
  }
  const out = rhythm.step({
    now: performance.now(),
    phase: snap.phase,
    divergence: divergence.value,
    ceiling: ceiling.value,
    style: style.value,
    ...heard
  })
  level.value = out.level
  if (!out.pulses.length || !canVibrate.value) return
  const pattern: number[] = []
  for (const ms of out.pulses) {
    if (pattern.length) pattern.push(18)
    pattern.push(ms)
  }
  try {
    const ok = navigator.vibrate(pattern)
    if (ok === false) canVibrate.value = false
  } catch {
    canVibrate.value = false
  }
}

async function listen() {
  error.value = ''
  if (!navigator.mediaDevices?.getUserMedia) {
    error.value = 'This browser has no microphone.'
    return
  }
  try {
    tempo = createTempo(performance.now())
    rhythm = createRhythm()
    ear = await openEar(onFrame)
    live.value = true
    canVibrate.value = typeof navigator.vibrate === 'function'
    try {
      wake = await navigator.wakeLock?.request('screen') ?? null
    } catch {
      wake = null
    }
  } catch {
    error.value = 'The microphone stayed closed.'
    live.value = false
  }
}

function stop() {
  ear?.stop()
  ear = null
  live.value = false
  blackout.value = false
  level.value = 0
  bpm.value = 0
  try { navigator.vibrate?.(0) } catch { /* no actuator */ }
  void wake?.release()
  wake = null
}

function toggleBlackout() {
  if (!live.value) return
  blackout.value = !blackout.value
}

function holdStart() {
  if (!blackout.value) return
  window.clearTimeout(holdTimer)
  holdTimer = window.setTimeout(() => {
    blackout.value = false
  }, 700)
}

function holdEnd() {
  window.clearTimeout(holdTimer)
}

function draw(time: number) {
  frame = requestAnimationFrame(draw)
  const canvas = canvasRef.value
  if (!canvas || blackout.value) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  smooth += (level.value - smooth) * 0.18
  const cx = w / 2
  const cy = h * 0.46
  const base = Math.min(w, h) * 0.22
  const t = time * 0.001
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 4; i++) {
    const wobble = 1 + Math.sin(t * (0.7 + i * 0.17) + i) * 0.04
    const radius = base * wobble * (1.05 + smooth * 0.85) * (1 - i * 0.12)
    const ox = Math.cos(t * 0.6 + i * 1.7) * base * 0.08 * (0.3 + smooth)
    const oy = Math.sin(t * 0.5 + i) * base * 0.06 * (0.3 + smooth)
    const g = ctx.createRadialGradient(cx + ox, cy + oy, radius * 0.1, cx + ox, cy + oy, radius)
    const alpha = 0.14 + smooth * 0.5 - i * 0.03
    g.addColorStop(0, `rgba(244, 240, 232, ${Math.max(0, alpha)})`)
    g.addColorStop(0.45, `rgba(186, 186, 196, ${Math.max(0, alpha * 0.35)})`)
    g.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cx + ox, cy + oy, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalCompositeOperation = 'source-over'
  ctx.beginPath()
  ctx.arc(cx, cy, base * 0.18 * (1 + smooth * 0.4), 0, Math.PI * 2)
  ctx.fillStyle = `rgba(255, 252, 246, ${0.35 + smooth * 0.55})`
  ctx.fill()
}

onMounted(() => {
  frame = requestAnimationFrame(draw)
  canVibrate.value = typeof navigator.vibrate === 'function'
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  stop()
})
</script>

<template>
  <div class="vy" :class="{ 'is-live': live, 'is-dark': blackout }">
    <header class="vy__top">
      <NuxtLink to="/engage" class="vy__back">Engage</NuxtLink>
      <p class="vy__mark">Vybe</p>
      <p class="vy__bpm" aria-live="polite">{{ live && bpm ? bpm + ' bpm' : '—' }}</p>
    </header>

    <canvas ref="canvasRef" class="vy__orb" aria-hidden="true" />

    <p v-if="!live" class="vy__invite">The room, turned into a pulse.</p>

    <div class="vy__dock">
      <div class="vy__styles" role="radiogroup" aria-label="Tactile style">
        <button
          v-for="item in STYLES"
          :key="item.id"
          type="button"
          role="radio"
          :aria-checked="style === item.id"
          :class="{ 'is-on': style === item.id }"
          @click="style = item.id"
        >
          {{ item.name }}
        </button>
      </div>
      <p class="vy__hint">{{ styleHint }}</p>

      <label class="vy__slider">
        <span>Ear</span>
        <input v-model.number="sensitivity" type="range" min="0" max="1" step="0.01" />
      </label>
      <label class="vy__slider">
        <span>Ceiling</span>
        <input v-model.number="ceiling" type="range" min="0.15" max="1" step="0.01" />
      </label>
      <label class="vy__slider">
        <span>Drift</span>
        <input v-model.number="divergence" type="range" min="0" max="1" step="0.01" />
      </label>

      <div class="vy__actions">
        <button v-if="!live" type="button" class="vy__go" @click="listen">Listen</button>
        <button v-else type="button" class="vy__go" @click="stop">Stop</button>
        <button type="button" class="vy__ghost" :disabled="!live" @click="toggleBlackout">Dark</button>
      </div>
      <p v-if="error" class="vy__error" role="alert">{{ error }}</p>
      <p class="vy__note">
        Heard here, then discarded. The pattern is a rhythm, not the sound itself.
        <template v-if="live && !canVibrate"> This browser will not vibrate. The orb still follows.</template>
      </p>
    </div>

    <button
      v-if="blackout"
      type="button"
      class="vy__shield"
      aria-label="Screen is dark. Hold to return."
      @pointerdown="holdStart"
      @pointerup="holdEnd"
      @pointerleave="holdEnd"
      @pointercancel="holdEnd"
    />
  </div>
</template>

<style scoped>
.vy {
  position: fixed;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  background: #070708;
  color: #eceae4;
  font-family: var(--font-sans, system-ui, sans-serif);
  overflow: hidden;
}
.vy.is-dark .vy__top,
.vy.is-dark .vy__orb,
.vy.is-dark .vy__dock,
.vy.is-dark .vy__invite {
  visibility: hidden;
}
.vy__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 22rem 22rem 0;
  position: relative;
  z-index: 2;
}
.vy__back {
  color: #9a968e;
  text-decoration: none;
  font: 500 13rem/1 var(--font-mono, ui-monospace, monospace);
  letter-spacing: 0.04em;
}
.vy__mark {
  margin: 0;
  font: 500 22rem/1 var(--font-display, Georgia, serif);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.vy__bpm {
  margin: 0;
  min-width: 64rem;
  text-align: right;
  color: #9a968e;
  font: 400 13rem/1 var(--font-mono, ui-monospace, monospace);
}
.vy__orb {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.vy__invite {
  position: absolute;
  left: 0;
  right: 0;
  top: 58%;
  margin: 0;
  text-align: center;
  color: #b9b4aa;
  font: 400 15rem/1.4 var(--font-sans, system-ui, sans-serif);
  z-index: 2;
}
.vy__dock {
  position: relative;
  z-index: 2;
  margin-top: auto;
  padding: 18rem 22rem 28rem;
  display: flex;
  flex-direction: column;
  gap: 12rem;
  background: linear-gradient(to top, rgba(7, 7, 8, 0.92), rgba(7, 7, 8, 0));
}
.vy__styles {
  display: flex;
  gap: 8rem;
}
.vy__styles button {
  flex: 1;
  border: 1px solid #2a2a2e;
  background: transparent;
  color: #c8c3ba;
  border-radius: 999rem;
  padding: 8rem 0;
  font: 500 13rem/1 var(--font-sans, system-ui, sans-serif);
  cursor: pointer;
}
.vy__styles button.is-on {
  color: #111;
  background: #eceae4;
  border-color: #eceae4;
}
.vy__hint {
  margin: 0;
  min-height: 18rem;
  color: #8e8a84;
  font-size: 13rem;
}
.vy__slider {
  display: grid;
  grid-template-columns: 72rem 1fr;
  align-items: center;
  gap: 10rem;
  color: #b9b4aa;
  font: 500 12rem/1 var(--font-mono, ui-monospace, monospace);
  letter-spacing: 0.04em;
}
.vy__slider input {
  width: 100%;
  accent-color: #eceae4;
}
.vy__actions {
  display: flex;
  gap: 10rem;
  margin-top: 4rem;
}
.vy__go,
.vy__ghost {
  border: 0;
  border-radius: 999rem;
  padding: 12rem 22rem;
  font: 600 14rem/1 var(--font-sans, system-ui, sans-serif);
  cursor: pointer;
}
.vy__go {
  background: #eceae4;
  color: #111;
}
.vy__ghost {
  background: transparent;
  color: #eceae4;
  border: 1px solid #3a3a3e;
}
.vy__ghost:disabled {
  opacity: 0.35;
  cursor: default;
}
.vy__error,
.vy__note {
  margin: 0;
  color: #8e8a84;
  font-size: 12rem;
  line-height: 1.45;
  max-width: 520rem;
}
.vy__error { color: #e7d2c4; }
.vy__shield {
  position: absolute;
  inset: 0;
  z-index: 4;
  border: 0;
  background: #000;
  color: transparent;
  cursor: pointer;
}
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid #eceae4;
  outline-offset: 3px;
}
</style>
