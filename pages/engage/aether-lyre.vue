<script setup lang="ts">
definePageMeta({ layout: false })

/**
 * Aether Lyre — Sexagesimal Resonance
 * Offline-first Engage experience: pure ratios, seven Sumerian tunings, Web Audio.
 */
import {
  BASE_HZ_OPTIONS,
  TUNINGS,
  JUST_INTERVALS,
  getScale,
  getTuning,
  formatRatio,
  type TuningId,
  type ScaleNote,
} from '~/utils/aether-lyre/tunings'
import { createLyreEngine, type LyreEngine } from '~/utils/aether-lyre/synth'

useSeoMeta({
  title: 'Aether Lyre · Engage',
  description:
    'Sexagesimal just intonation and seven Sumerian tunings. Pure ratios, live harmonics, dry resonance — an Entertrainer Engage experience.',
  ogUrl: 'https://entertrainer.in/engage/aether-lyre',
})

type PlayMode = 'drone' | 'sequence' | 'layers' | 'session'
type PersistState = {
  tuning: TuningId
  baseHz: number
  mode: PlayMode
  volume: number
}

const STORAGE_KEY = 'entertrainer-aether-lyre'
const SESSION_OPTIONS = [5, 10, 20, 45] as const

const COLORS = {
  charcoal: '#0E0E10',
  sand: '#C4B49A',
  gold: '#C9A227',
  lapis: '#3D5A80',
  cream: '#EDE6D6',
}

const route = useRoute()

const tuningId = ref<TuningId>('ishartum')
const baseHz = ref(60)
const mode = ref<PlayMode>('drone')
const volume = ref(0.7)
const playing = ref(false)
const primed = ref(false)
const sessionMinutes = ref(10)
const sessionLeftSec = ref(0)
const vizDepth = ref(1)
const reduceMotion = ref(false)

const currentHz = ref(60)
const currentRatio = ref('1/1')
const activeLattice = ref<Set<string>>(new Set(['1:1']))

const layerOn = reactive<Record<string, boolean>>({
  '1:1': true,
  '3:2': false,
  '4:3': false,
  '5:4': false,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const latticeRef = ref<SVGSVGElement | null>(null)

let engine: LyreEngine | null = null
let raf = 0
let sessionTimer: number | null = null
let sessionEndAt = 0
let wavePhase = 0
let dpr = 1
let cw = 320
let ch = 320
let pinchStartDist = 0
let pinchStartDepth = 1
let longPressTimer: number | null = null

const scale = computed(() => getScale(tuningId.value, baseHz.value))
const tuningMeta = computed(() => getTuning(tuningId.value))

const displayHz = computed(() => {
  const h = currentHz.value
  return h >= 100 ? h.toFixed(1) : h.toFixed(2)
})

function haptic(ms: number | number[] = 12) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms)
  } catch { /* */ }
}

function loadPersist() {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw) as Partial<PersistState>
    if (data.tuning && TUNINGS.some((t) => t.id === data.tuning)) tuningId.value = data.tuning
    if (typeof data.baseHz === 'number' && (BASE_HZ_OPTIONS as readonly number[]).includes(data.baseHz)) {
      baseHz.value = data.baseHz
    }
    if (data.mode && ['drone', 'sequence', 'layers', 'session'].includes(data.mode)) mode.value = data.mode
    if (typeof data.volume === 'number') volume.value = Math.max(0, Math.min(1, data.volume))
  } catch { /* */ }
}

function savePersist() {
  if (!import.meta.client) return
  try {
    const data: PersistState = {
      tuning: tuningId.value,
      baseHz: baseHz.value,
      mode: mode.value,
      volume: volume.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* */ }
}

function ensureEngine() {
  if (!engine) engine = createLyreEngine()
  return engine
}

async function resumeAudio() {
  const e = ensureEngine()
  await e.resume()
  e.setMaster(volume.value)
}

function syncDisplayFromScale(note?: ScaleNote) {
  const n = note ?? scale.value[0]
  currentHz.value = n.hz
  currentRatio.value = n.label
  activeLattice.value = new Set([ratioToLatticeKey(n.ratio.n, n.ratio.d)])
}

function ratioToLatticeKey(n: number, d: number): string {
  const key = `${n}:${d}`
  if (JUST_INTERVALS.some((j) => j.id === key)) return key
  // nearest known just label by float proximity
  const f = n / d
  let best = '1:1'
  let bestDiff = Infinity
  for (const j of JUST_INTERVALS) {
    const diff = Math.abs(j.ratio.n / j.ratio.d - f)
    if (diff < bestDiff) {
      bestDiff = diff
      best = j.id
    }
  }
  return bestDiff < 0.02 ? best : key
}

function updateLatticeFromLevels() {
  const e = engine
  if (!e) return
  const levels = e.getLevels()
  const next = new Set<string>()
  if (!levels.length) {
    next.add('1:1')
  } else {
    const fund = levels[0]?.hz || baseHz.value
    levels.forEach((l) => {
      const r = l.hz / fund
      let best = '1:1'
      let bestDiff = Infinity
      for (const j of JUST_INTERVALS) {
        const diff = Math.abs(j.ratio.n / j.ratio.d - r)
        if (diff < bestDiff) {
          bestDiff = diff
          best = j.id
        }
      }
      if (bestDiff < 0.04) next.add(best)
      // also mark absolute from base
      const rb = l.hz / baseHz.value
      for (const j of JUST_INTERVALS) {
        if (Math.abs(j.ratio.n / j.ratio.d - rb) < 0.04) next.add(j.id)
      }
    })
  }
  activeLattice.value = next
  if (levels[0]) {
    currentHz.value = levels[0].hz
    currentRatio.value = levels[0].ratioLabel
  }
}

async function startPlayback(opts?: { minutes?: number }) {
  await resumeAudio()
  const e = ensureEngine()
  e.stopAll()
  playing.value = true
  primed.value = false

  const notes = scale.value
  syncDisplayFromScale(notes[0])

  if (mode.value === 'drone') {
    e.playDrone(notes[0].hz, notes[0].label)
    activeLattice.value = new Set(['1:1'])
  } else if (mode.value === 'sequence') {
    const ascending = notes.map((n) => n.hz)
    const descending = notes.slice(0, -1).reverse().map((n) => n.hz)
    const cycle = [...ascending, ...descending]
    const labels = [...notes.map((n) => n.label), ...notes.slice(0, -1).reverse().map((n) => n.label)]
    e.startSequence(cycle, 2.6, labels)
  } else if (mode.value === 'layers') {
    applyLayers()
  } else if (mode.value === 'session') {
    const mins = opts?.minutes ?? sessionMinutes.value
    sessionMinutes.value = mins
    e.playDrone(notes[0].hz, notes[0].label)
    beginSession(mins)
  }

  haptic(10)
  startViz()
}

function applyLayers() {
  const e = ensureEngine()
  const layers: { id: string; n: number; d: number }[] = [
    { id: '1:1', n: 1, d: 1 },
    { id: '3:2', n: 3, d: 2 },
    { id: '4:3', n: 4, d: 3 },
    { id: '5:4', n: 5, d: 4 },
  ]
  layers.forEach((L) => {
    const on = layerOn[L.id]
    const hz = baseHz.value * (L.n / L.d)
    if (on) {
      e.setLayer(L.id, hz, L.id === '1:1' ? 0.48 : 0.28, `${L.n}/${L.d}`)
    } else {
      e.fadeLayer(L.id, 0, 0.25)
    }
  })
  const active = layers.filter((L) => layerOn[L.id])
  if (active[0]) {
    currentHz.value = baseHz.value * (active[0].n / active[0].d)
    currentRatio.value = `${active[0].n}/${active[0].d}`
  }
  activeLattice.value = new Set(active.map((L) => L.id))
}

function beginSession(mins: number) {
  clearSessionTimer()
  sessionEndAt = Date.now() + mins * 60 * 1000
  sessionLeftSec.value = mins * 60
  let fading = false
  sessionTimer = window.setInterval(() => {
    const left = Math.max(0, Math.ceil((sessionEndAt - Date.now()) / 1000))
    sessionLeftSec.value = left
    if (left <= 0) {
      endSession()
    } else if (left <= 8 && engine && !fading) {
      fading = true
      engine.fadeOut(Math.min(8, left))
    }
  }, 250)
}

function clearSessionTimer() {
  if (sessionTimer != null) {
    window.clearInterval(sessionTimer)
    sessionTimer = null
  }
}

function endSession() {
  const seconds = sessionMinutes.value * 60 - sessionLeftSec.value
  clearSessionTimer()
  sessionLeftSec.value = 0
  if (engine) engine.fadeOut(2.5)
  playing.value = false
  postSessionEnd(Math.max(0, seconds))
  haptic([20, 40, 20])
}

function postSessionEnd(seconds: number) {
  if (!import.meta.client) return
  try {
    window.parent?.postMessage(
      {
        source: 'aether-lyre',
        event: 'session-end',
        tuning: tuningId.value,
        seconds,
      },
      '*',
    )
  } catch { /* */ }
}

async function stopPlayback() {
  clearSessionTimer()
  sessionLeftSec.value = 0
  if (engine) {
    engine.fadeOut(0.45)
    engine.stopSequence()
  }
  playing.value = false
  haptic(8)
}

async function togglePlay() {
  if (playing.value) await stopPlayback()
  else await startPlayback()
}

function selectTuning(id: TuningId) {
  if (tuningId.value === id) return
  tuningId.value = id
  haptic(14)
  savePersist()
  if (playing.value) void startPlayback(mode.value === 'session' ? { minutes: sessionMinutes.value } : undefined)
  else syncDisplayFromScale(scale.value[0])
}

function selectBase(hz: number) {
  baseHz.value = hz
  savePersist()
  if (playing.value) void startPlayback(mode.value === 'session' ? { minutes: sessionMinutes.value } : undefined)
  else syncDisplayFromScale(getScale(tuningId.value, hz)[0])
}

function setMode(m: PlayMode) {
  mode.value = m
  savePersist()
  if (playing.value) void startPlayback(m === 'session' ? { minutes: sessionMinutes.value } : undefined)
}

function onVolume(v: number) {
  volume.value = v
  engine?.setMaster(v)
  savePersist()
}

function toggleLayer(id: string) {
  layerOn[id] = !layerOn[id]
  if (!layerOn['1:1'] && !layerOn['3:2'] && !layerOn['4:3'] && !layerOn['5:4']) {
    layerOn['1:1'] = true
  }
  haptic(10)
  if (playing.value && mode.value === 'layers') applyLayers()
}

function lockDroneFromNote(note: ScaleNote) {
  mode.value = 'drone'
  haptic([12, 30, 12])
  void (async () => {
    await resumeAudio()
    const e = ensureEngine()
    e.stopSequence()
    e.clearLayers()
    e.playDrone(note.hz, note.label)
    playing.value = true
    currentHz.value = note.hz
    currentRatio.value = note.label
    activeLattice.value = new Set([ratioToLatticeKey(note.ratio.n, note.ratio.d)])
    startViz()
  })()
}

function lockDroneFromLattice(intervalId: string) {
  const j = JUST_INTERVALS.find((x) => x.id === intervalId)
  if (!j) return
  const note: ScaleNote = {
    degree: 0,
    ratio: j.ratio,
    hz: baseHz.value * (j.ratio.n / j.ratio.d),
    label: formatRatio(j.ratio),
  }
  lockDroneFromNote(note)
}

/* ——— visualizer ——— */
function resizeCanvas() {
  const c = canvasRef.value
  if (!c) return
  const parent = c.parentElement
  const size = Math.min(parent?.clientWidth || 320, parent?.clientHeight || 320, 420)
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  cw = size
  ch = size
  c.width = Math.floor(size * dpr)
  c.height = Math.floor(size * dpr)
  c.style.width = `${size}px`
  c.style.height = `${size}px`
  const ctx = c.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function drawViz() {
  const c = canvasRef.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return

  const amp = engine?.getMasterAmp() ?? 0
  const levels = engine?.getLevels() ?? []
  wavePhase += reduceMotion.value ? 0.01 : 0.028 + amp * 0.04

  ctx.clearRect(0, 0, cw, ch)
  const cx = cw / 2
  const cy = ch / 2
  const R = Math.min(cw, ch) * 0.42 * vizDepth.value

  // charcoal disc with ziggurat rings
  ctx.fillStyle = COLORS.charcoal
  ctx.beginPath()
  ctx.arc(cx, cy, R + 18, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = 'rgba(196,180,154,0.22)'
  ctx.lineWidth = 1
  for (let i = 1; i <= 4; i++) {
    const rr = R * (0.35 + i * 0.16)
    // stepped octagon hint
    ctx.beginPath()
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 - Math.PI / 8
      const x = cx + Math.cos(a) * rr
      const y = cy + Math.sin(a) * rr
      if (k === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()
  }

  // geometric ratio rays for sounding intervals
  const rayCount = Math.max(1, levels.length)
  levels.forEach((l, i) => {
    const a = -Math.PI / 2 + (i / rayCount) * Math.PI * 2 + wavePhase * 0.15
    const len = R * (0.55 + l.amp * 0.35)
    ctx.strokeStyle = i === 0 ? `rgba(201,162,39,${0.35 + l.amp * 0.4})` : `rgba(61,90,128,${0.3 + l.amp * 0.35})`
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len)
    ctx.stroke()
  })

  // waveform ring
  ctx.beginPath()
  const samples = 96
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const a = t * Math.PI * 2 - Math.PI / 2
    const wobble = reduceMotion.value
      ? amp * 6
      : Math.sin(wavePhase * 2 + t * Math.PI * 6) * (8 + amp * 22) * vizDepth.value
    const rr = R * 0.72 + wobble
    const x = cx + Math.cos(a) * rr
    const y = cy + Math.sin(a) * rr
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.strokeStyle = playing.value ? COLORS.sand : 'rgba(196,180,154,0.45)'
  ctx.lineWidth = 2
  ctx.stroke()

  // inner core
  ctx.fillStyle = playing.value ? COLORS.gold : 'rgba(201,162,39,0.45)'
  ctx.beginPath()
  ctx.arc(cx, cy, 6 + amp * 10, 0, Math.PI * 2)
  ctx.fill()

  if (playing.value) updateLatticeFromLevels()
}

function vizLoop() {
  drawViz()
  raf = requestAnimationFrame(vizLoop)
}

function startViz() {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(vizLoop)
}

/* ——— gestures ——— */
function dist(a: Touch, b: Touch) {
  const dx = a.clientX - b.clientX
  const dy = a.clientY - b.clientY
  return Math.hypot(dx, dy)
}

function onVizTouchStart(ev: TouchEvent) {
  if (ev.touches.length === 2) {
    pinchStartDist = dist(ev.touches[0], ev.touches[1])
    pinchStartDepth = vizDepth.value
  }
}

function onVizTouchMove(ev: TouchEvent) {
  if (ev.touches.length === 2 && pinchStartDist > 0) {
    ev.preventDefault()
    const d = dist(ev.touches[0], ev.touches[1])
    vizDepth.value = Math.max(0.7, Math.min(1.35, pinchStartDepth * (d / pinchStartDist)))
  }
}

function onVizTouchEnd() {
  pinchStartDist = 0
}

function onDegreePointerDown(note: ScaleNote) {
  clearLongPress()
  longPressTimer = window.setTimeout(() => {
    lockDroneFromNote(note)
    longPressTimer = null
  }, 520)
}

function clearLongPress() {
  if (longPressTimer != null) {
    window.clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

function onLatticePointerDown(id: string) {
  clearLongPress()
  longPressTimer = window.setTimeout(() => {
    lockDroneFromLattice(id)
    longPressTimer = null
  }, 520)
}

/* ——— entertrainer bridge + query ——— */
function onBridgeMessage(ev: MessageEvent) {
  const data = ev.data
  if (!data || typeof data !== 'object') return
  if (data.source !== 'entertrainer' || data.app !== 'aether-lyre') return
  if (data.tuning && TUNINGS.some((t) => t.id === data.tuning)) tuningId.value = data.tuning
  if (typeof data.baseHz === 'number' && (BASE_HZ_OPTIONS as readonly number[]).includes(data.baseHz)) {
    baseHz.value = data.baseHz
  }
  if (data.mode && ['drone', 'sequence', 'layers', 'session'].includes(data.mode)) mode.value = data.mode
  if (typeof data.minutes === 'number' && (SESSION_OPTIONS as readonly number[]).includes(data.minutes)) {
    sessionMinutes.value = data.minutes
  }
  if (data.action === 'start') void startPlayback({ minutes: data.minutes })
  if (data.action === 'stop') void stopPlayback()
}

function applyQueryPrime() {
  const q = route.query
  if (typeof q.tuning === 'string' && TUNINGS.some((t) => t.id === q.tuning)) {
    tuningId.value = q.tuning as TuningId
  }
  if (typeof q.mode === 'string' && ['drone', 'sequence', 'layers', 'session'].includes(q.mode)) {
    mode.value = q.mode as PlayMode
  }
  if (typeof q.baseHz === 'string') {
    const hz = Number(q.baseHz)
    if ((BASE_HZ_OPTIONS as readonly number[]).includes(hz)) baseHz.value = hz
  }
  if (typeof q.minutes === 'string') {
    const m = Number(q.minutes)
    if ((SESSION_OPTIONS as readonly number[]).includes(m)) {
      sessionMinutes.value = m
      mode.value = 'session'
    }
  }
  // Auto-start needs a gesture — mark primed Play
  if (q.tuning || q.mode || q.minutes || q.baseHz) primed.value = true
}

function onVisibility() {
  // Keep context running while playing; only resume if suspended
  if (document.visibilityState === 'visible' && playing.value && engine) {
    void engine.resume()
  }
}

onMounted(() => {
  loadPersist()
  applyQueryPrime()
  syncDisplayFromScale(scale.value[0])
  reduceMotion.value =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.getAttribute('data-reduce-motion') === 'on'

  resizeCanvas()
  startViz()
  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('message', onBridgeMessage)
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  clearSessionTimer()
  clearLongPress()
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('message', onBridgeMessage)
  document.removeEventListener('visibilitychange', onVisibility)
  engine?.dispose()
  engine = null
})

watch([tuningId, baseHz, mode, volume], () => savePersist())

const sessionLabel = computed(() => {
  if (!playing.value || mode.value !== 'session' || sessionLeftSec.value <= 0) return ''
  const m = Math.floor(sessionLeftSec.value / 60)
  const s = sessionLeftSec.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

const radialStyle = computed(() => {
  const i = TUNINGS.findIndex((t) => t.id === tuningId.value)
  const angle = (i / 7) * 360
  return { transform: `rotate(${angle}deg)` }
})
</script>

<template>
  <div class="al" :class="{ 'al--playing': playing }">
    <header class="al__bar">
      <NuxtLink to="/engage" class="al__back" aria-label="Back to Engage">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
        <span>Back</span>
      </NuxtLink>
      <NuxtLink to="/" class="al__home" aria-label="Entertrainer home">
        <EdWordmark variant="mark" :size="28" />
      </NuxtLink>
      <div class="al__titles">
        <span class="al__title">Aether Lyre</span>
        <span class="al__subtitle">Sexagesimal Resonance</span>
      </div>
    </header>

    <div class="al__body">
      <section class="al__viz-wrap" aria-label="Harmonic visualizer">
        <div
          class="al__viz"
          @touchstart.passive="onVizTouchStart"
          @touchmove="onVizTouchMove"
          @touchend="onVizTouchEnd"
        >
          <canvas
            ref="canvasRef"
            class="al__canvas"
            role="img"
            aria-label="Live waveform and ratio geometry"
          />
        </div>
        <p class="al__readout" aria-live="polite">
          <strong class="al__hz">{{ displayHz }} Hz</strong>
          <span class="al__ratio">{{ currentRatio }}</span>
        </p>
        <p class="al__tuning-blurb">{{ tuningMeta.name }} — {{ tuningMeta.short }}</p>
      </section>

      <!-- Harmonic lattice -->
      <section class="al__lattice" aria-label="Harmonic lattice">
        <svg ref="latticeRef" viewBox="0 0 200 120" class="al__lattice-svg" aria-hidden="true">
          <!-- soft ziggurat steps -->
          <path d="M20 100 H180 L160 78 H40 Z" fill="rgba(196,180,154,0.06)" stroke="rgba(196,180,154,0.2)" />
          <path d="M40 78 H160 L145 58 H55 Z" fill="rgba(196,180,154,0.05)" stroke="rgba(196,180,154,0.18)" />
          <path d="M55 58 H145 L130 40 H70 Z" fill="rgba(61,90,128,0.08)" stroke="rgba(61,90,128,0.25)" />
          <g
            v-for="(node, idx) in JUST_INTERVALS"
            :key="node.id"
            class="al__node"
            :class="{ 'al__node--on': activeLattice.has(node.id) }"
            @pointerdown="onLatticePointerDown(node.id)"
            @pointerup="clearLongPress"
            @pointerleave="clearLongPress"
            @pointercancel="clearLongPress"
          >
            <circle
              :cx="28 + (idx % 5) * 36"
              :cy="idx < 5 ? 92 : 52"
              r="10"
              :fill="activeLattice.has(node.id) ? '#C9A227' : 'rgba(237,230,214,0.08)'"
              :stroke="activeLattice.has(node.id) ? '#C4B49A' : 'rgba(196,180,154,0.35)'"
              stroke-width="1.4"
            />
            <text
              :x="28 + (idx % 5) * 36"
              :y="idx < 5 ? 95.5 : 55.5"
              text-anchor="middle"
              font-size="6.5"
              :fill="activeLattice.has(node.id) ? '#0E0E10' : '#C4B49A'"
              font-family="var(--font-mono), monospace"
            >{{ node.id }}</text>
          </g>
        </svg>
        <p class="al__hint">Long-press a node to lock as drone</p>
      </section>

      <!-- Tuning radial -->
      <section class="al__radial" aria-label="Tuning selector">
        <div class="al__dial" role="listbox" :aria-activedescendant="`tun-${tuningId}`" aria-label="Seven Sumerian tunings">
          <div class="al__dial-ring" :style="radialStyle" aria-hidden="true">
            <span class="al__dial-mark" />
          </div>
          <button
            v-for="(t, i) in TUNINGS"
            :id="`tun-${t.id}`"
            :key="t.id"
            type="button"
            role="option"
            class="al__tun"
            :class="{ 'al__tun--on': tuningId === t.id }"
            :style="{ '--i': i }"
            :aria-selected="tuningId === t.id"
            :aria-label="`${t.name}: ${t.short}`"
            @click="selectTuning(t.id)"
          >
            <span class="al__tun-name">{{ t.name }}</span>
          </button>
          <div class="al__dial-core" aria-hidden="true">
            <span>{{ tuningMeta.name.slice(0, 3) }}</span>
          </div>
        </div>
      </section>

      <!-- Base Hz chips -->
      <section class="al__bases" aria-label="Base frequency">
        <button
          v-for="hz in BASE_HZ_OPTIONS"
          :key="hz"
          type="button"
          class="al__chip"
          :class="{ 'al__chip--on': baseHz === hz }"
          :aria-pressed="baseHz === hz"
          :aria-label="`${hz} hertz`"
          @click="selectBase(hz)"
        >
          {{ hz === 112.5 ? '112.5 Hz' : `${hz}` }}
        </button>
      </section>

      <!-- Scale degrees -->
      <section class="al__degrees" aria-label="Scale degrees">
        <button
          v-for="n in scale"
          :key="n.degree"
          type="button"
          class="al__deg"
          :aria-label="`Degree ${n.degree + 1}, ${n.label}, long press to drone`"
          @pointerdown="onDegreePointerDown(n)"
          @pointerup="clearLongPress"
          @pointerleave="clearLongPress"
          @pointercancel="clearLongPress"
        >
          <span class="al__deg-label">{{ n.label }}</span>
          <span class="al__deg-hz">{{ n.hz.toFixed(1) }}</span>
        </button>
      </section>

      <!-- Mode tabs -->
      <div class="al__modes" role="tablist" aria-label="Play mode">
        <button
          v-for="m in (['drone', 'sequence', 'layers', 'session'] as PlayMode[])"
          :key="m"
          type="button"
          role="tab"
          class="al__mode"
          :class="{ 'al__mode--on': mode === m }"
          :aria-selected="mode === m"
          @click="setMode(m)"
        >
          {{ m === 'sequence' ? 'Sequence' : m.charAt(0).toUpperCase() + m.slice(1) }}
        </button>
      </div>

      <!-- Mode panels -->
      <div v-if="mode === 'layers'" class="al__layers" role="group" aria-label="Layer stack">
        <button
          v-for="id in ['1:1', '3:2', '4:3', '5:4']"
          :key="id"
          type="button"
          class="al__layer"
          :class="{ 'al__layer--on': layerOn[id] }"
          :aria-pressed="layerOn[id]"
          @click="toggleLayer(id)"
        >
          {{ id }}
        </button>
      </div>

      <div v-if="mode === 'session'" class="al__session" role="group" aria-label="Session length">
        <button
          v-for="m in SESSION_OPTIONS"
          :key="m"
          type="button"
          class="al__chip"
          :class="{ 'al__chip--on': sessionMinutes === m }"
          :aria-pressed="sessionMinutes === m"
          @click="sessionMinutes = m; if (playing) startPlayback({ minutes: m })"
        >
          {{ m }} min
        </button>
        <p v-if="sessionLabel" class="al__session-left" aria-live="polite">{{ sessionLabel }} remaining</p>
      </div>

      <!-- Transport -->
      <div class="al__transport">
        <button
          type="button"
          class="al__play"
          :class="{ 'al__play--primed': primed && !playing }"
          :aria-label="playing ? 'Pause' : primed ? 'Play primed session' : 'Play'"
          @click="togglePlay"
        >
          <svg v-if="!playing" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3v14H7zm7 0h3v14h-3z" /></svg>
        </button>
        <label class="al__vol">
          <span class="u-sr-only">Volume</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="volume"
            aria-label="Volume"
            @input="onVolume(Number(($event.target as HTMLInputElement).value))"
          />
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.al {
  --al-bg: #0E0E10;
  --al-sand: #C4B49A;
  --al-gold: #C9A227;
  --al-lapis: #3D5A80;
  --al-cream: #EDE6D6;
  --al-muted: rgba(237, 230, 214, 0.55);
  min-height: 100dvh;
  background:
    linear-gradient(180deg, rgba(61, 90, 128, 0.12) 0%, transparent 28%),
    var(--al-bg);
  color: var(--al-cream);
  display: flex;
  flex-direction: column;
  padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom);
  -webkit-tap-highlight-color: transparent;
  font-family: var(--font-ui, var(--font-sans, system-ui, sans-serif));
}

.al__bar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12rem;
  min-height: 56rem;
  padding: 10rem clamp(14rem, 3vw, 28rem);
  background: color-mix(in srgb, var(--al-bg) 92%, transparent);
  border-bottom: 1rem solid rgba(196, 180, 154, 0.22);
  backdrop-filter: blur(8px);
}

.al__back,
.al__home {
  color: var(--al-sand);
  text-decoration: none;
  font: 600 11rem/1 var(--font-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  min-height: 44rem;
  display: inline-flex;
  align-items: center;
}
.al__back { justify-self: start; gap: 6rem; }
.al__back svg {
  width: 18rem; height: 18rem;
  fill: none; stroke: currentColor; stroke-width: 2;
  stroke-linecap: round; stroke-linejoin: round;
}
.al__home { justify-self: center; color: var(--al-cream); }
.al__titles {
  justify-self: end;
  text-align: right;
  display: grid;
  gap: 2rem;
}
.al__title {
  font: 600 13rem/1.1 var(--font-display);
  letter-spacing: 0.02em;
  color: var(--al-cream);
}
.al__subtitle {
  font: 500 9rem/1 var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--al-muted);
}

.al__body {
  flex: 1;
  width: min(100%, 520rem);
  margin: 0 auto;
  padding: 12rem clamp(14rem, 3vw, 24rem) 28rem;
  display: flex;
  flex-direction: column;
  gap: 16rem;
  min-height: 0;
}

.al__viz-wrap {
  display: grid;
  justify-items: center;
  gap: 10rem;
}
.al__viz {
  width: min(100%, 360rem);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  touch-action: none;
  border-radius: 50%;
  box-shadow:
    0 0 0 1rem rgba(196, 180, 154, 0.2),
    0 18rem 48rem rgba(0, 0, 0, 0.45);
}
.al__canvas { display: block; border-radius: 50%; }

.al__readout {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 12rem;
  font-variant-numeric: tabular-nums;
}
.al__hz {
  font: 600 28rem/1 var(--font-display);
  letter-spacing: -0.03em;
  color: var(--al-cream);
}
.al__ratio {
  font: 500 14rem/1 var(--font-mono);
  color: var(--al-gold);
  letter-spacing: 0.04em;
}
.al__tuning-blurb {
  margin: 0;
  max-width: 36ch;
  text-align: center;
  font-size: 12rem;
  line-height: 1.4;
  color: var(--al-muted);
}

.al__lattice {
  display: grid;
  gap: 4rem;
  justify-items: center;
}
.al__lattice-svg {
  width: min(100%, 320rem);
  height: auto;
  overflow: visible;
}
.al__node { cursor: pointer; touch-action: manipulation; }
.al__node circle { transition: fill 160ms ease, stroke 160ms ease; }
.al__hint {
  margin: 0;
  font: 500 10rem/1 var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--al-muted);
}

.al__radial { display: grid; place-items: center; padding: 8rem 0; }
.al__dial {
  position: relative;
  width: min(100%, 280rem);
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1rem solid rgba(196, 180, 154, 0.28);
  background:
    radial-gradient(circle at 50% 42%, rgba(61, 90, 128, 0.22), transparent 55%),
    rgba(237, 230, 214, 0.03);
}
.al__dial-ring {
  position: absolute;
  inset: 10%;
  border-radius: 50%;
  border: 1rem dashed rgba(201, 162, 39, 0.35);
  transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}
.al__dial-mark {
  position: absolute;
  top: -4rem;
  left: 50%;
  width: 8rem;
  height: 8rem;
  margin-left: -4rem;
  border-radius: 50%;
  background: var(--al-gold);
  box-shadow: 0 0 12rem rgba(201, 162, 39, 0.55);
}
.al__dial-core {
  position: absolute;
  inset: 34%;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(14, 14, 16, 0.85);
  border: 1rem solid rgba(196, 180, 154, 0.3);
  font: 600 14rem/1 var(--font-display);
  color: var(--al-sand);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  pointer-events: none;
}
.al__tun {
  --i: 0;
  appearance: none;
  position: absolute;
  left: 50%;
  top: 50%;
  width: 72rem;
  min-height: 44rem;
  margin: 0;
  padding: 8rem 6rem;
  border: 0;
  background: transparent;
  color: var(--al-muted);
  font: 600 10rem/1.15 var(--font-mono);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transform:
    translate(-50%, -50%)
    rotate(calc(var(--i) * 51.428deg))
    translateY(-104rem)
    rotate(calc(var(--i) * -51.428deg));
  transition: color 160ms ease;
}
.al__tun--on { color: var(--al-gold); }
.al__tun:focus-visible {
  outline: 2rem solid var(--al-gold);
  outline-offset: 2rem;
  border-radius: 8rem;
}
.al__tun-name { display: block; text-align: center; max-width: 9ch; }

.al__bases,
.al__session,
.al__layers {
  display: flex;
  flex-wrap: wrap;
  gap: 8rem;
  justify-content: center;
}
.al__chip,
.al__layer {
  appearance: none;
  min-height: 44rem;
  min-width: 44rem;
  padding: 10rem 14rem;
  border-radius: 999rem;
  border: 1rem solid rgba(196, 180, 154, 0.3);
  background: rgba(237, 230, 214, 0.04);
  color: var(--al-sand);
  font: 600 12rem/1 var(--font-mono);
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
}
.al__chip--on,
.al__layer--on {
  background: rgba(201, 162, 39, 0.18);
  border-color: var(--al-gold);
  color: var(--al-cream);
}
.al__chip:focus-visible,
.al__layer:focus-visible {
  outline: 2rem solid var(--al-gold);
  outline-offset: 2rem;
}

.al__degrees {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6rem;
}
.al__deg {
  appearance: none;
  min-height: 52rem;
  padding: 8rem 2rem;
  border-radius: 12rem;
  border: 1rem solid rgba(196, 180, 154, 0.22);
  background: rgba(61, 90, 128, 0.12);
  color: var(--al-cream);
  display: grid;
  gap: 4rem;
  place-items: center;
  cursor: pointer;
}
.al__deg-label { font: 600 11rem/1 var(--font-mono); color: var(--al-gold); }
.al__deg-hz { font: 500 9rem/1 var(--font-mono); color: var(--al-muted); }

.al__modes {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6rem;
  padding: 4rem;
  border-radius: 999rem;
  background: rgba(237, 230, 214, 0.05);
  border: 1rem solid rgba(196, 180, 154, 0.18);
}
.al__mode {
  appearance: none;
  min-height: 44rem;
  border: 0;
  border-radius: 999rem;
  background: transparent;
  color: var(--al-muted);
  font: 600 11rem/1 var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
}
.al__mode--on {
  background: rgba(201, 162, 39, 0.2);
  color: var(--al-cream);
}
.al__mode:focus-visible {
  outline: 2rem solid var(--al-gold);
  outline-offset: 1rem;
}

.al__session-left {
  flex-basis: 100%;
  margin: 4rem 0 0;
  text-align: center;
  font: 500 13rem/1 var(--font-mono);
  color: var(--al-sand);
}

.al__transport {
  display: flex;
  align-items: center;
  gap: 16rem;
  justify-content: center;
  padding-top: 4rem;
}
.al__play {
  appearance: none;
  width: 72rem;
  height: 72rem;
  border-radius: 50%;
  border: 2rem solid var(--al-sand);
  background: var(--al-gold);
  color: var(--al-bg);
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 8rem 24rem rgba(201, 162, 39, 0.25);
  transition: transform 120ms ease, box-shadow 160ms ease;
}
.al__play--primed {
  box-shadow: 0 0 0 4rem rgba(201, 162, 39, 0.25), 0 8rem 24rem rgba(201, 162, 39, 0.3);
}
.al__play:active { transform: scale(0.96); }
.al__play svg { width: 28rem; height: 28rem; fill: currentColor; }
.al--playing .al__play {
  background: transparent;
  color: var(--al-gold);
  border-color: var(--al-gold);
}

.al__vol {
  flex: 1;
  max-width: 180rem;
  display: flex;
  align-items: center;
}
.al__vol input[type="range"] {
  width: 100%;
  height: 44rem;
  accent-color: var(--al-gold);
  cursor: pointer;
}

.u-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 420px) {
  .al__degrees { gap: 4rem; }
  .al__deg { min-height: 48rem; padding: 6rem 1rem; }
  .al__deg-label { font-size: 9rem; }
  .al__tun { width: 64rem; font-size: 9rem; }
}

@media (prefers-reduced-motion: reduce) {
  .al__dial-ring,
  .al__node circle,
  .al__chip,
  .al__layer,
  .al__play { transition: none; }
}
</style>
