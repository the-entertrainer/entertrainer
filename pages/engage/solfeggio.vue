<script setup lang="ts">
definePageMeta({ layout: false })
/**
 * Solfeggio — one tap, a slow tune on nine pitches.
 * Same cream / ink / yellow shell as Gateway, Stack, and The Mind Reader.
 * Web Audio only. The pitch list is a modern numerological set, not a therapy.
 */
import { useThemeStore } from '~/stores/theme'
import {
  schedulePiece,
  PHI,
  phiRingRadii,
  pentagonVertices,
  goldenRectangleCorners,
} from '~/utils/solfeggio-math.mjs'

useSeoMeta({
  title: 'Solfeggio · Engage',
  description: 'A slow tune from nine pitches.',
  ogUrl: 'https://entertrainer.in/engage/solfeggio',
})

const MASTER_GAIN = 0.16
const FADE_IN = 2
const FADE_OUT = 2
const ATTACK = 0.48
const RELEASE = 1.7
const FLOOR = 0.0001
const LOOKAHEAD = 0.75

const VOICE_PEAK: Record<string, number> = {
  drone: 0.36,
  partner: 0.14,
  melody: 0.22,
  upper: 0.04,
}
const VOICE_PAN: Record<string, number> = {
  drone: -0.22,
  partner: 0.2,
  melody: 0.06,
  upper: 0.28,
}

type Phase = 'land' | 'hold' | 'leaving'
type Scheduled = { t: number, dur: number, voice: string, hz: number }
type LiveNote = { start: number, oscs: OscillatorNode[], nodes: AudioNode[] }

const theme = useThemeStore()
const phase = ref<Phase>('land')
const sounding = ref(0)
const playedOnce = ref(false)
const vizEl = ref<HTMLCanvasElement | null>(null)

let pieceEvents: Scheduled[] = []
let pieceOrigin = 0
let vizRaf = 0
let vizAngle = 0
let strokePhase = 0
let lastAudioTime = -1
let reduceMotion = false
let motionQuery: MediaQueryList | null = null
let resizeObserver: ResizeObserver | null = null

let audioCtx: AudioContext | null = null
let graphNodes: AudioNode[] = []
let master: GainNode | null = null
let bus: GainNode | null = null
let live: LiveNote[] = []
let generation = 0
let leaveTimer = 0
let tickTimer = 0

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

function clearTimers() {
  if (leaveTimer) window.clearTimeout(leaveTimer)
  if (tickTimer) window.clearTimeout(tickTimer)
  leaveTimer = 0
  tickTimer = 0
}

function stopLive() {
  const ctx = audioCtx
  const now = ctx ? ctx.currentTime : 0
  for (const note of live) {
    const when = Math.max(now, note.start)
    for (const osc of note.oscs) {
      try { osc.stop(when) } catch { /* already stopped, or not started */ }
    }
    for (const node of note.nodes) {
      try { node.disconnect() } catch { /* already disconnected */ }
    }
  }
  live = []
}

function disconnectGraph() {
  for (const node of graphNodes) {
    try { node.disconnect() } catch { /* already disconnected */ }
  }
  graphNodes = []
  master = null
  bus = null
}

function teardown() {
  clearTimers()
  stopVizLoop()
  stopLive()
  disconnectGraph()
  pieceEvents = []
  pieceOrigin = 0
  lastAudioTime = -1
}

function connectPan(ctx: AudioContext, source: AudioNode, dest: AudioNode, pan: number, when: number) {
  if (typeof ctx.createStereoPanner !== 'function') {
    source.connect(dest)
    return [] as AudioNode[]
  }
  const panner = ctx.createStereoPanner()
  panner.pan.setValueAtTime(pan, when)
  source.connect(panner)
  panner.connect(dest)
  return [panner]
}

function spawn(ctx: AudioContext, dest: AudioNode, event: Scheduled, origin: number) {
  const when = origin + event.t
  const peak = VOICE_PEAK[event.voice] ?? 0.1
  const releaseAt = when + Math.max(event.dur, ATTACK + 0.25)
  const stopAt = releaseAt + RELEASE
  const melody = event.voice === 'melody'

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(FLOOR, when)
  gain.gain.exponentialRampToValueAtTime(Math.max(peak, FLOOR), when + ATTACK)
  gain.gain.setValueAtTime(Math.max(peak, FLOOR), releaseAt)
  gain.gain.exponentialRampToValueAtTime(FLOOR, stopAt)

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(melody ? 1400 : 2200, when)
  filter.Q.setValueAtTime(0.55, when)
  filter.connect(gain)

  const osc = ctx.createOscillator()
  osc.type = melody ? 'triangle' : 'sine'
  osc.frequency.setValueAtTime(event.hz, when)
  osc.connect(filter)

  const width = ctx.createOscillator()
  width.type = 'sine'
  width.frequency.setValueAtTime(event.hz, when)
  width.detune.setValueAtTime(event.voice === 'drone' ? -4 : 4, when)
  const widthGain = ctx.createGain()
  widthGain.gain.setValueAtTime(0.22, when)
  width.connect(widthGain)
  widthGain.connect(filter)

  const panners = connectPan(ctx, gain, dest, VOICE_PAN[event.voice] ?? 0, when)
  osc.start(when)
  width.start(when)
  osc.stop(stopAt + 0.03)
  width.stop(stopAt + 0.03)
  live.push({
    start: when,
    oscs: [osc, width],
    nodes: [osc, width, widthGain, filter, gain, ...panners],
  })
}

function buildGraph(ctx: AudioContext) {
  const t = ctx.currentTime
  const voice = ctx.createGain()
  voice.gain.setValueAtTime(1, t)

  const dry = ctx.createGain()
  dry.gain.setValueAtTime(0.88, t)

  const delay = ctx.createDelay(1.5)
  delay.delayTime.setValueAtTime(0.47, t)
  const damp = ctx.createBiquadFilter()
  damp.type = 'lowpass'
  damp.frequency.setValueAtTime(980, t)
  damp.Q.setValueAtTime(0.5, t)
  const feedback = ctx.createGain()
  feedback.gain.setValueAtTime(0.16, t)
  const wet = ctx.createGain()
  wet.gain.setValueAtTime(0.18, t)

  const out = ctx.createGain()
  out.gain.cancelScheduledValues(t)
  out.gain.setValueAtTime(FLOOR, t)
  out.gain.exponentialRampToValueAtTime(MASTER_GAIN, t + FADE_IN)

  voice.connect(dry)
  dry.connect(out)
  voice.connect(delay)
  delay.connect(damp)
  damp.connect(feedback)
  feedback.connect(delay)
  damp.connect(wet)
  wet.connect(out)
  out.connect(ctx.destination)

  bus = voice
  master = out
  graphNodes = [voice, dry, delay, damp, feedback, wet, out]
}

function runPiece(gen: number, events: Scheduled[], origin: number) {
  let cursor = 0
  let tail = 0
  for (const event of events) tail = Math.max(tail, event.t + event.dur)

  const step = () => {
    if (gen !== generation || !audioCtx || !bus || phase.value !== 'hold') return
    const now = audioCtx.currentTime - origin
    let latest = sounding.value
    for (const event of events) {
      if (event.t <= now + 0.03) latest = event.hz
      else break
    }
    sounding.value = latest

    const horizon = audioCtx.currentTime + LOOKAHEAD
    while (cursor < events.length && origin + events[cursor].t <= horizon) {
      spawn(audioCtx, bus, events[cursor], origin)
      cursor += 1
    }

    if (now >= tail + 0.15) {
      leave()
      return
    }
    tickTimer = window.setTimeout(step, 200)
  }
  step()
}

function begin() {
  if (phase.value !== 'land') return
  const gen = ++generation
  clearTimers()
  stopLive()
  disconnectGraph()

  const ctx = ensureContext()
  if (!ctx) return

  const seed = (Math.random() * 0x100000000) >>> 0
  const piece = schedulePiece(seed)
  buildGraph(ctx)
  phase.value = 'hold'
  playedOnce.value = true
  pieceEvents = piece.events as Scheduled[]
  pieceOrigin = ctx.currentTime + 0.05
  vizAngle = 0
  strokePhase = 0
  lastAudioTime = -1
  sounding.value = piece.events[0]?.hz ?? piece.droneHz
  runPiece(gen, piece.events as Scheduled[], pieceOrigin)
  startVizLoop()
  paintViz(false)
}

function finishLeave(gen: number) {
  if (gen !== generation) return
  teardown()
  vizAngle = 0
  strokePhase = 0
  phase.value = 'land'
  paintViz(false)
}

function leave() {
  if (phase.value !== 'hold' || !audioCtx || !master) return
  const gen = generation
  phase.value = 'leaving'
  if (tickTimer) window.clearTimeout(tickTimer)
  tickTimer = 0
  const t = audioCtx.currentTime
  const current = Math.max(master.gain.value, FLOOR)
  master.gain.cancelScheduledValues(t)
  master.gain.setValueAtTime(current, t)
  master.gain.exponentialRampToValueAtTime(FLOOR, t + FADE_OUT)
  if (leaveTimer) window.clearTimeout(leaveTimer)
  leaveTimer = window.setTimeout(() => finishLeave(gen), FADE_OUT * 1000 + 40)
}

function onThemeToggle(e: Event) {
  e.stopPropagation()
  e.preventDefault()
  theme.toggle()
}

function noteEnvelope(elapsed: number, dur: number) {
  if (elapsed < 0) return 0
  const releaseAt = Math.max(dur, ATTACK + 0.25)
  const stopAt = releaseAt + RELEASE
  if (elapsed >= stopAt) return 0
  if (elapsed <= ATTACK) return FLOOR * (1 / FLOOR) ** (elapsed / ATTACK)
  if (elapsed <= releaseAt) return 1
  return FLOOR ** ((elapsed - releaseAt) / RELEASE)
}

function activeNote(audioTime: number) {
  if (!pieceEvents.length || phase.value === 'land') return null
  const now = audioTime - pieceOrigin
  let active = pieceEvents[0]
  for (const event of pieceEvents) {
    if (event.t <= now + 0.03) active = event
    else break
  }
  return {
    hz: active.hz,
    env: noteEnvelope(now - active.t, active.dur),
  }
}

function advanceViz(audioTime: number, hz: number, env: number) {
  if (lastAudioTime < 0) {
    lastAudioTime = audioTime
    return
  }
  const dt = Math.min(0.1, Math.max(0, audioTime - lastAudioTime))
  lastAudioTime = audioTime
  const pitch = hz > 0 ? hz : 396
  const omega = (pitch / 528) * ((Math.PI * 2) / 36)
  vizAngle += dt * omega * (0.25 + 0.75 * env)
  strokePhase += dt * pitch * 0.02 * (0.3 + 0.7 * env)
}

function fitViz(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = Math.max(1, canvas.clientWidth)
  const h = Math.max(1, canvas.clientHeight)
  const pw = Math.round(w * dpr)
  const ph = Math.round(h * dpr)
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw
    canvas.height = ph
  }
  return dpr
}

function drawViz(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  angle: number,
  env: number,
  dash: number,
  dark: boolean,
  motion: boolean,
) {
  const paper = dark ? '#121214' : '#fbf8ef'
  const ink = dark ? '#ede6d6' : '#161618'
  const cobalt = '#2F5BD8'
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, width, height)

  const minSide = Math.min(width, height)
  const count = 6
  const outer = minSide * 0.48 * (0.94 + 0.06 * env)
  const radii = phiRingRadii(count, outer / (PHI ** (count - 1)))
  const cx = width / 2
  const cy = height / 2

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)
  ctx.lineJoin = 'miter'
  ctx.lineCap = 'butt'

  for (let i = 0; i < radii.length; i++) {
    ctx.beginPath()
    ctx.arc(0, 0, radii[i], 0, Math.PI * 2)
    ctx.strokeStyle = i % 2 === 0 ? ink : cobalt
    ctx.globalAlpha = 0.22 + 0.38 * (i / (count - 1))
    ctx.lineWidth = i === count - 1 ? 1.4 : 1
    ctx.stroke()
  }

  const drawStar = (radius: number, inkStroke: boolean) => {
    const verts = pentagonVertices(radius, -Math.PI / 2)
    ctx.beginPath()
    verts.forEach((v, i) => (i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y)))
    ctx.closePath()
    ctx.setLineDash([])
    ctx.strokeStyle = ink
    ctx.globalAlpha = inkStroke ? 0.72 : 0.4
    ctx.lineWidth = 1.2
    ctx.stroke()

    ctx.beginPath()
    for (let i = 0; i <= 5; i++) {
      const v = verts[(i * 2) % 5]
      if (i === 0) ctx.moveTo(v.x, v.y)
      else ctx.lineTo(v.x, v.y)
    }
    ctx.strokeStyle = cobalt
    ctx.globalAlpha = 0.45 + 0.5 * env
    ctx.lineWidth = 1.35
    if (motion) {
      ctx.setLineDash([5, 8])
      ctx.lineDashOffset = -dash
    } else {
      ctx.setLineDash([])
    }
    ctx.stroke()
    ctx.setLineDash([])
  }

  drawStar(radii[2], false)
  drawStar(radii[4], true)

  const rect = goldenRectangleCorners(radii[2] * 2)
  ctx.beginPath()
  rect.forEach((c, i) => (i === 0 ? ctx.moveTo(c.x, c.y) : ctx.lineTo(c.x, c.y)))
  ctx.closePath()
  ctx.strokeStyle = ink
  ctx.globalAlpha = 0.78
  ctx.lineWidth = 1.25
  ctx.stroke()

  ctx.restore()
  ctx.globalAlpha = 1
}

function paintViz(advanceClock: boolean) {
  const canvas = vizEl.value
  if (!canvas) return
  const dpr = fitViz(canvas)
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const musical = audioCtx ? activeNote(audioCtx.currentTime) : null
  if (advanceClock && musical && audioCtx && !reduceMotion) {
    advanceViz(audioCtx.currentTime, musical.hz, musical.env)
  }
  const env = musical ? musical.env : 0
  const hz = musical ? musical.hz : 0
  const angle = reduceMotion ? ((hz || 0) / 963) * (Math.PI / 5) : vizAngle
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  drawViz(
    ctx,
    canvas.clientWidth,
    canvas.clientHeight,
    angle,
    reduceMotion ? (hz ? 1 : 0) : env,
    reduceMotion ? 0 : strokePhase,
    theme.theme === 'dark',
    !reduceMotion && phase.value !== 'land',
  )
}

function vizFrame() {
  vizRaf = window.requestAnimationFrame(vizFrame)
  paintViz(true)
}

function startVizLoop() {
  if (reduceMotion || vizRaf) return
  lastAudioTime = -1
  vizRaf = window.requestAnimationFrame(vizFrame)
}

function stopVizLoop() {
  if (!vizRaf) return
  window.cancelAnimationFrame(vizRaf)
  vizRaf = 0
}

function onMotionChange() {
  reduceMotion = !!motionQuery?.matches
  if (reduceMotion) stopVizLoop()
  else if (phase.value === 'hold' || phase.value === 'leaving') startVizLoop()
  paintViz(false)
}

onMounted(() => {
  theme.init()
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduceMotion = motionQuery.matches
  motionQuery.addEventListener('change', onMotionChange)
  nextTick(() => {
    const canvas = vizEl.value
    if (!canvas) return
    resizeObserver = new ResizeObserver(() => paintViz(false))
    resizeObserver.observe(canvas)
    paintViz(false)
  })
})

watch(() => theme.theme, () => paintViz(false))
watch(sounding, () => {
  if (reduceMotion) paintViz(false)
})

onBeforeUnmount(() => {
  generation += 1
  motionQuery?.removeEventListener('change', onMotionChange)
  resizeObserver?.disconnect()
  resizeObserver = null
  teardown()
  if (audioCtx && audioCtx.state !== 'closed') {
    void audioCtx.close().catch(() => {})
  }
  audioCtx = null
})
</script>

<template>
  <div class="sf" :data-phase="phase" :data-sf-theme="theme.theme">
    <canvas ref="vizEl" class="sf__viz" aria-hidden="true" />
    <NuxtLink
      to="/engage"
      class="sf__iconbtn sf__back"
      aria-label="Back to Engage"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
    </NuxtLink>

    <button
      type="button"
      class="sf__iconbtn sf__theme"
      :aria-label="`Switch to ${theme.theme === 'dark' ? 'light' : 'dark'} mode`"
      @click.stop.prevent="onThemeToggle"
    >
      <EdSignalIcon :name="theme.theme === 'dark' ? 'sun' : 'moon'" />
    </button>

    <div v-if="phase === 'land'" class="sf__land">
      <p class="sf__eyebrow sf__anim" style="--i:0">Engage</p>
      <h1 class="sf__title sf__anim" style="--i:1">Solfeggio</h1>
      <p class="sf__lede sf__anim" style="--i:2">A slow tune from nine pitches.</p>
      <button
        class="sf__cta sf__anim sf__cta--pulse"
        style="--i:3"
        type="button"
        @click="begin"
      >
        {{ playedOnce ? 'Again' : 'Begin' }}
      </button>
      <p class="sf__fine">A listening piece built from a modern pitch list, not a medical device and not a therapy.</p>
    </div>

    <div v-else class="sf__hold" :class="{ 'sf__hold--leaving': phase === 'leaving' }">
      <p class="sf__hz" aria-live="polite">
        <span class="sf__hz-num">{{ sounding }}</span><span class="sf__hz-unit"> Hz</span>
      </p>
      <p class="sf__hint">Headphones</p>
      <button
        class="sf__leave"
        type="button"
        :disabled="phase === 'leaving'"
        @click="leave"
      >
        Leave
      </button>
      <p class="sf__fine">A listening piece built from a modern pitch list, not a medical device and not a therapy.</p>
    </div>
  </div>
</template>

<style scoped>
.sf {
  --sf-paper: #fbf8ef;
  --sf-ink: #161618;
  --sf-cobalt: #2F5BD8;
  --sf-yellow: #ffd43b;
  --ink: var(--sf-ink);
  --accent: var(--sf-yellow);
  position: relative;
  width: 100%;
  height: 100svh;
  height: 100dvh;
  max-height: 100dvh;
  background: var(--sf-paper);
  color: var(--sf-ink);
  overflow: hidden;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 280ms ease, color 280ms ease;
}

.sf[data-sf-theme='dark'] {
  --sf-paper: #121214;
  --sf-ink: #ede6d6;
  --sf-yellow: #e8c547;
}

.sf__iconbtn {
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
  background: color-mix(in srgb, var(--sf-paper) 55%, transparent);
  color: color-mix(in srgb, var(--sf-ink) 70%, transparent);
  text-decoration: none;
  cursor: pointer;
  appearance: none;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: color 160ms ease, background 160ms ease, transform 120ms ease;
}
.sf__iconbtn:hover,
.sf__iconbtn:focus-visible {
  color: var(--sf-ink);
  background: color-mix(in srgb, var(--sf-paper) 82%, transparent);
}
.sf__iconbtn:focus-visible {
  outline: 2rem solid var(--sf-yellow);
  outline-offset: 2rem;
}
.sf__iconbtn:active { transform: scale(0.94); }

.sf__back { left: max(10rem, env(safe-area-inset-left)); }
.sf__back svg {
  width: 20rem;
  height: 20rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.25;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sf__theme { right: max(10rem, env(safe-area-inset-right)); }
.sf__theme :deep(svg) {
  width: 18rem;
  height: 18rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sf__viz {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

.sf__land,
.sf__hold {
  position: absolute;
  z-index: 1;
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

.sf__eyebrow {
  margin: 0;
  font: 800 11rem/1 var(--font-mono);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  opacity: 0.72;
}

.sf__title {
  margin: 0;
  font: 700 clamp(52rem, 14vw, 104rem)/0.86 var(--font-display);
  letter-spacing: -0.06em;
  text-wrap: balance;
  text-shadow: 0 0 18rem var(--sf-paper), 0 0 6rem var(--sf-paper);
}

.sf__lede {
  margin: 0 0 6rem;
  font-size: 15rem;
  line-height: 1.4;
  max-width: 28ch;
  letter-spacing: 0.01em;
  opacity: 0.82;
}

.sf__cta {
  appearance: none;
  border: none;
  background: var(--sf-yellow);
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
    0 8rem 20rem color-mix(in srgb, var(--sf-ink) 10%, transparent);
  transition: transform 160ms ease, box-shadow 160ms ease;
}
.sf__cta:hover,
.sf__cta:focus-visible { transform: translateY(-1rem); }
.sf__cta:focus-visible {
  outline: 2rem solid var(--sf-ink);
  outline-offset: 3rem;
}
.sf__cta:active {
  transform: translateY(2rem) scale(0.98);
  box-shadow:
    0 0 0 transparent,
    0 2rem 8rem color-mix(in srgb, var(--sf-ink) 8%, transparent);
}

.sf__anim {
  animation: sf-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 65ms + 30ms);
}

.sf__cta--pulse {
  animation:
    sf-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both,
    sf-cta-pulse 2.6s ease-in-out 650ms infinite;
  animation-delay: calc(var(--i, 0) * 65ms + 30ms), 650ms;
}

.sf__hz {
  margin: 4rem 0 0;
  font: 700 clamp(56rem, 16vw, 96rem)/0.86 var(--font-display);
  letter-spacing: -0.06em;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 16rem var(--sf-paper), 0 0 4rem var(--sf-paper);
}
.sf__hz-unit {
  font: 700 18rem/1 var(--font-mono);
  letter-spacing: 0.08em;
  opacity: 0.55;
}

.sf__hint {
  margin: 0;
  font: 700 11rem/1 var(--font-mono);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.42;
}

.sf__leave {
  appearance: none;
  min-width: 44rem;
  min-height: 44rem;
  margin-top: 4rem;
  padding: 12rem 22rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: color-mix(in srgb, var(--sf-ink) 70%, transparent);
  font: 800 12rem/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
}
.sf__leave:hover,
.sf__leave:focus-visible { color: var(--sf-ink); }
.sf__leave:focus-visible {
  outline: 2rem solid var(--sf-yellow);
  outline-offset: 3rem;
}
.sf__leave:disabled {
  cursor: default;
  opacity: 0.45;
}

.sf__hold--leaving .sf__hz {
  opacity: 0.35;
  transition: opacity 2s linear;
}

.sf__fine {
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

@keyframes sf-rise {
  from { opacity: 0; transform: translateY(12rem); }
  to { opacity: 1; transform: none; }
}
@keyframes sf-cta-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.025); }
}
@media (prefers-reduced-motion: reduce) {
  .sf,
  .sf__anim,
  .sf__cta--pulse,
  .sf__hold--leaving .sf__hz {
    animation: none !important;
    transition: none !important;
  }
  .sf__anim,
  .sf__cta--pulse { opacity: 1; transform: none; }
}
</style>
