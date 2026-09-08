<!-- Compact logo first, then finite wordmark reveal; optional opening music (~8.93s) with beat-reactive canvas. -->
<script setup lang="ts">
import { openingSoundSrc } from '~/composables/useSiteSettings'

const emit = defineEmits<{ complete: [] }>()
const { settings, prefersReducedMotion, hydrate } = useSiteSettings()
const leaving = ref(false)
const entered = ref(false)
const reducedMotion = ref(false)
const ident = ref<HTMLAudioElement | null>(null)
const beatCanvas = ref<HTMLCanvasElement | null>(null)
let finishTimer: ReturnType<typeof setTimeout> | undefined
let removeTimer: ReturnType<typeof setTimeout> | undefined
let completed = false
let beatRaf = 0
let beatCursor = 0
let resizeObs: ResizeObserver | undefined

/** Opening track duration (~8.93s); safety finish = duration + 400ms. */
const MUSIC_DURATION_MS = 8930
const MUSIC_SAFETY_MS = MUSIC_DURATION_MS + 400
/** Sound-off short preloader. */
const SHORT_NORMAL_MS = 2800
const SHORT_REDUCED_MS = 850

/**
 * Precomputed beat onsets (seconds) from public/audio/idents/opening.mp3.
 * Authoritative sync map — drive pulses from audio.currentTime via rAF.
 */
const BEAT_TIMES = [
  0.511, 1.091, 1.37, 1.974, 2.252, 2.833, 3.135, 3.413, 3.715, 4.296, 4.598,
  5.178, 5.457, 5.759, 6.06, 6.339, 6.618, 6.92, 7.5, 8.081, 8.382
] as const

/** Look-ahead so a beat near the frame boundary still fires cleanly. */
const BEAT_LOOKAHEAD_S = 0.028

const soundOn = computed(() => settings.value.openingSound === 'on')
const identSrc = computed(() => openingSoundSrc(settings.value.openingSound))
const showBeatCanvas = computed(
  () => soundOn.value && entered.value && !reducedMotion.value && !leaving.value
)

type PulseKind = 'ring' | 'orb' | 'ticks' | 'wash' | 'dots'

interface Pulse {
  kind: PulseKind
  born: number
  life: number
  x: number
  y: number
  scale0: number
  scale1: number
  rot: number
  strong: boolean
  alt: number
  /** Tick/dot count for geometric blooms. */
  count: number
  radius: number
}

const pulses: Pulse[] = []

const playOpeningSound = () => {
  const el = ident.value
  const src = identSrc.value
  if (!el || !src || !soundOn.value) return
  try {
    if (el.getAttribute('src') !== src) el.src = src
    el.pause()
    el.currentTime = 0
    el.volume = 0.92
    const p = el.play()
    if (p && typeof p.catch === 'function') p.catch(() => undefined)
  } catch {
    // Visual handoff never depends on audio.
  }
}

const stopOpeningSound = () => {
  const el = ident.value
  if (!el) return
  try {
    el.pause()
    el.currentTime = 0
  } catch {
    /* ignore */
  }
}

const clearFinishTimer = () => {
  if (finishTimer !== undefined) {
    window.clearTimeout(finishTimer)
    finishTimer = undefined
  }
}

const stopBeatLoop = () => {
  if (beatRaf) {
    cancelAnimationFrame(beatRaf)
    beatRaf = 0
  }
  pulses.length = 0
  beatCursor = 0
}

const finish = () => {
  if (completed) return
  completed = true
  clearFinishTimer()
  stopBeatLoop()
  leaving.value = true
  const el = ident.value
  if (el && !el.paused) {
    const startVol = el.volume
    const t0 = performance.now()
    const step = (now: number) => {
      const u = Math.min(1, (now - t0) / 300)
      el.volume = Math.max(0, startVol * (1 - u))
      if (u < 1) requestAnimationFrame(step)
      else el.pause()
    }
    requestAnimationFrame(step)
  }
  removeTimer = window.setTimeout(() => emit('complete'), 300)
}

const onAudioEnded = () => {
  if (!entered.value || completed) return
  clearFinishTimer()
  finish()
}

const skip = () => {
  if (completed) return
  stopOpeningSound()
  clearFinishTimer()
  stopBeatLoop()
  if (!entered.value) entered.value = true
  finish()
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2)

/** Soft envelope: rise fast, hold briefly, fade — for arrive-and-leave motifs. */
const bloomEnvelope = (u: number) => {
  if (u < 0.18) return easeOutCubic(u / 0.18)
  if (u < 0.42) return 1
  return 1 - easeInOut((u - 0.42) / 0.58)
}

const spawnBeat = (index: number, now: number, w: number, h: number) => {
  const cx = w * 0.5
  const cy = h * 0.5
  const strong = index % 2 === 0
  const accent = index % 4 === 0
  const alt = index % 2
  const minDim = Math.min(w, h)

  // Soft yellow ring pulse — alternate layer scale
  pulses.push({
    kind: 'ring',
    born: now,
    life: strong ? 720 : 560,
    x: cx,
    y: cy,
    scale0: 0.55 + alt * 0.08,
    scale1: 1.08 + (strong ? 0.12 : 0.04) + alt * 0.06,
    rot: (index % 3) * 0.35,
    strong,
    alt,
    count: 0,
    radius: minDim * (0.22 + alt * 0.08)
  })

  // Ink/yellow orb flash behind wordmark
  pulses.push({
    kind: 'orb',
    born: now,
    life: 480,
    x: cx + (alt ? -1 : 1) * minDim * 0.04,
    y: cy + (index % 3 - 1) * minDim * 0.03,
    scale0: 0.35,
    scale1: strong ? 1.15 : 0.9,
    rot: 0,
    strong,
    alt,
    count: 0,
    radius: minDim * (strong ? 0.18 : 0.12)
  })

  // Geometric ticks / dashes that bloom then leave
  pulses.push({
    kind: 'ticks',
    born: now,
    life: 640,
    x: cx,
    y: cy,
    scale0: 0.7,
    scale1: 1.05,
    rot: (index * 0.47) % (Math.PI * 2),
    strong,
    alt,
    count: strong ? 8 : 6,
    radius: minDim * (0.28 + (index % 3) * 0.04)
  })

  // Tiny orbiting dots — arrive outward then fade
  pulses.push({
    kind: 'dots',
    born: now,
    life: 700,
    x: cx,
    y: cy,
    scale0: 0.6,
    scale1: 1.12,
    rot: -((index * 0.31) % (Math.PI * 2)),
    strong,
    alt,
    count: accent ? 10 : 7,
    radius: minDim * (0.32 + alt * 0.05)
  })

  // Radial wash / vignette breath on stronger beats
  if (strong) {
    pulses.push({
      kind: 'wash',
      born: now,
      life: accent ? 900 : 700,
      x: cx,
      y: cy,
      scale0: 0.8,
      scale1: 1.25,
      rot: 0,
      strong: accent,
      alt,
      count: 0,
      radius: minDim * 0.55
    })
  }

  // Cap live pulses so the canvas never gets busy
  while (pulses.length > 48) pulses.shift()
}

const drawPulse = (
  ctx: CanvasRenderingContext2D,
  p: Pulse,
  now: number,
  dpr: number
) => {
  const age = now - p.born
  const u = Math.min(1, age / p.life)
  const env = bloomEnvelope(u)
  if (env <= 0.001) return

  const scale = p.scale0 + (p.scale1 - p.scale0) * easeOutCubic(Math.min(1, u * 1.15))
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rot + u * (p.alt ? 0.12 : -0.08))
  ctx.scale(scale, scale)

  if (p.kind === 'ring') {
    const r = p.radius
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.strokeStyle = p.alt
      ? `rgba(21, 18, 15, ${0.1 * env})`
      : `rgba(255, 212, 59, ${0.55 * env})`
    ctx.lineWidth = (p.strong ? 3.2 : 2.2) * dpr
    ctx.stroke()
    // Inner hairline
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(255, 212, 59, ${0.22 * env})`
    ctx.lineWidth = 1.1 * dpr
    ctx.stroke()
  } else if (p.kind === 'orb') {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.radius)
    if (p.alt) {
      g.addColorStop(0, `rgba(21, 18, 15, ${0.12 * env})`)
      g.addColorStop(0.45, `rgba(255, 212, 59, ${0.1 * env})`)
      g.addColorStop(1, 'rgba(255, 212, 59, 0)')
    } else {
      g.addColorStop(0, `rgba(255, 212, 59, ${0.42 * env})`)
      g.addColorStop(0.5, `rgba(255, 212, 59, ${0.14 * env})`)
      g.addColorStop(1, 'rgba(255, 250, 240, 0)')
    }
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2)
    ctx.fill()
  } else if (p.kind === 'ticks') {
    const n = p.count
    const r = p.radius
    const len = r * 0.09
    ctx.strokeStyle = p.strong
      ? `rgba(21, 18, 15, ${0.28 * env})`
      : `rgba(21, 18, 15, ${0.16 * env})`
    ctx.lineWidth = 1.4 * dpr
    ctx.lineCap = 'round'
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const cos = Math.cos(a)
      const sin = Math.sin(a)
      const inward = r * (0.02 + 0.04 * (1 - env))
      ctx.beginPath()
      ctx.moveTo(cos * (r - inward), sin * (r - inward))
      ctx.lineTo(cos * (r - inward + len), sin * (r - inward + len))
      ctx.stroke()
    }
  } else if (p.kind === 'dots') {
    const n = p.count
    const r = p.radius * (0.85 + 0.2 * easeOutCubic(u))
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + u * 0.35 * (p.alt ? 1 : -1)
      const dotR = (p.strong ? 2.4 : 1.7) * dpr * (0.7 + 0.3 * env)
      const x = Math.cos(a) * r
      const y = Math.sin(a) * r
      ctx.beginPath()
      ctx.arc(x, y, dotR, 0, Math.PI * 2)
      ctx.fillStyle =
        i % 2 === 0
          ? `rgba(255, 212, 59, ${0.7 * env})`
          : `rgba(21, 18, 15, ${0.22 * env})`
      ctx.fill()
    }
  } else if (p.kind === 'wash') {
    const g = ctx.createRadialGradient(0, 0, p.radius * 0.15, 0, 0, p.radius)
    const peak = p.strong ? 0.14 : 0.08
    g.addColorStop(0, `rgba(255, 212, 59, ${peak * env})`)
    g.addColorStop(0.55, `rgba(255, 212, 59, ${peak * 0.35 * env})`)
    g.addColorStop(1, 'rgba(255, 250, 240, 0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

const sizeCanvas = () => {
  const canvas = beatCanvas.value
  if (!canvas) return
  const parent = canvas.parentElement
  if (!parent) return
  const rect = parent.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = Math.max(1, Math.floor(rect.width))
  const h = Math.max(1, Math.floor(rect.height))
  canvas.width = Math.floor(w * dpr)
  canvas.height = Math.floor(h * dpr)
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  const ctx = canvas.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

const tickBeats = (now: number) => {
  if (completed || leaving.value || !showBeatCanvas.value) {
    beatRaf = 0
    return
  }
  const canvas = beatCanvas.value
  const audio = ident.value
  if (!canvas) {
    beatRaf = requestAnimationFrame(tickBeats)
    return
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = canvas.width / dpr
  const h = canvas.height / dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    beatRaf = requestAnimationFrame(tickBeats)
    return
  }

  // Clock from the <audio> element — avoids setTimeout drift.
  const t = audio && !audio.paused ? audio.currentTime : -1
  if (t >= 0) {
    while (
      beatCursor < BEAT_TIMES.length &&
      BEAT_TIMES[beatCursor]! <= t + BEAT_LOOKAHEAD_S
    ) {
      // Only fire if we haven't skipped past by more than a beat gap (seek/skip).
      const bt = BEAT_TIMES[beatCursor]!
      if (t - bt < 0.12) spawnBeat(beatCursor, now, w, h)
      beatCursor += 1
    }
  }

  ctx.clearRect(0, 0, w, h)
  for (let i = pulses.length - 1; i >= 0; i--) {
    const p = pulses[i]!
    if (now - p.born >= p.life) {
      pulses.splice(i, 1)
      continue
    }
    drawPulse(ctx, p, now, dpr)
  }

  beatRaf = requestAnimationFrame(tickBeats)
}

const startBeatLoop = () => {
  stopBeatLoop()
  if (!showBeatCanvas.value) return
  nextTick(() => {
    sizeCanvas()
    if (typeof ResizeObserver !== 'undefined' && beatCanvas.value?.parentElement) {
      resizeObs?.disconnect()
      resizeObs = new ResizeObserver(() => sizeCanvas())
      resizeObs.observe(beatCanvas.value.parentElement)
    }
    beatRaf = requestAnimationFrame(tickBeats)
  })
}

const startExperience = () => {
  if (entered.value || completed) return
  playOpeningSound()
  entered.value = true
  if (soundOn.value) {
    finishTimer = window.setTimeout(finish, MUSIC_SAFETY_MS)
    if (!reducedMotion.value) startBeatLoop()
  } else {
    finishTimer = window.setTimeout(
      finish,
      reducedMotion.value ? SHORT_REDUCED_MS : SHORT_NORMAL_MS
    )
  }
}

onMounted(() => {
  hydrate()
  reducedMotion.value = prefersReducedMotion()
})

onBeforeUnmount(() => {
  clearFinishTimer()
  if (removeTimer) window.clearTimeout(removeTimer)
  stopBeatLoop()
  resizeObs?.disconnect()
  ident.value?.pause()
})
</script>

<template>
  <div
    class="preloader"
    :class="{
      'preloader--entered': entered,
      'preloader--leaving': leaving,
      'preloader--music': soundOn && entered
    }"
  >
    <audio
      v-if="identSrc"
      ref="ident"
      class="preloader__audio"
      :src="identSrc"
      preload="auto"
      playsinline
      aria-hidden="true"
      @ended="onAudioEnded"
    />

    <button
      v-if="!entered"
      type="button"
      class="preloader__entry"
      :aria-label="soundOn ? 'Tap to enter Entertrainer with sound' : 'Tap to enter Entertrainer'"
      @click="startExperience"
    >
      <svg class="preloader__entry-logo" viewBox="0 0 240 240" aria-hidden="true">
        <circle class="preloader__entry-ring" cx="120" cy="120" r="94" />
        <circle class="preloader__entry-ring" cx="120" cy="120" r="62" />
        <circle class="preloader__entry-ring" cx="120" cy="120" r="30" />
        <text class="preloader__entry-e" x="120" y="158" text-anchor="middle">e</text>
      </svg>
      <svg class="preloader__entry-orbit" viewBox="0 0 400 400" aria-hidden="true">
        <defs><path id="entry-orbit-path" d="M 200,200 m -145,0 a 145,145 0 1,1 290,0 a 145,145 0 1,1 -290,0" /></defs>
        <text><textPath href="#entry-orbit-path" startOffset="0%">TAP TO ENTER · TAP TO ENTER · TAP TO ENTER · TAP TO ENTER · TAP TO ENTER · TAP TO ENTER · TAP TO ENTER · TAP TO ENTER · TAP TO ENTER · TAP TO ENTER · </textPath></text>
      </svg>
      <span class="sr-only">Tap to enter</span>
    </button>

    <div v-else class="preloader__stage" aria-hidden="true">
      <canvas
        v-if="showBeatCanvas"
        ref="beatCanvas"
        class="preloader__beat-canvas"
        aria-hidden="true"
      />
      <div class="preloader__rings"><i></i><i></i><i></i><i></i></div>
      <div class="preloader__brand-shell">
        <span class="preloader__word">entertrainer</span>
      </div>
    </div>

    <button
      type="button"
      class="preloader__skip"
      :class="{ 'preloader__skip--on': entered }"
      aria-label="Skip opening"
      @click.stop="skip"
    >
      Skip
    </button>

    <span class="sr-only" role="status" aria-live="polite">{{ entered ? 'Preparing Entertrainer' : 'Tap to enter Entertrainer' }}</span>
  </div>
</template>

<style scoped>
/* Selected identity: a direct visitor gesture unlocks the sound and shockwave sequence. */
.preloader {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #fffaf0;
  color: #15120f;
  transition: opacity 300ms cubic-bezier(.3, 0, 1, 1), visibility 300ms step-end;
}
.preloader--leaving { opacity: 0; visibility: hidden; pointer-events: none; }
.preloader__audio { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

.preloader__entry {
  position: relative;
  display: grid;
  place-items: center;
  width: min(236rem, 58vw);
  aspect-ratio: 1;
  padding: 0;
  border: 0;
  background: transparent;
  color: #15120f;
  cursor: pointer;
}
.preloader__entry-logo { position: relative; z-index: 1; display: block; width: 80%; height: auto; overflow: visible; transition: transform 220ms cubic-bezier(.16, 1, .3, 1); }
.preloader__entry-ring { fill: none; stroke: #ffd43b; stroke-width: 18; }
.preloader__entry-e { fill: #15120f; font-family: var(--font-ui), Arial, sans-serif; font-size: 144rem; font-weight: 900; letter-spacing: -.1em; }
.preloader__entry-orbit { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; animation: pl-entry-orbit 24s linear infinite; }
.preloader__entry-orbit text { fill: #15120f; font-family: var(--font-mono), monospace; font-size: 10rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.preloader__entry:hover .preloader__entry-logo { transform: scale(1.025); }
.preloader__entry:focus-visible { outline: 3rem solid #15120f; outline-offset: 10rem; border-radius: 50%; }
.preloader__entry:active .preloader__entry-logo { transform: scale(.975); }

.preloader__stage {
  position: relative;
  display: grid;
  place-items: center;
  width: min(860rem, 92vw);
  aspect-ratio: 1.52;
  isolation: isolate;
}
.preloader__beat-canvas {
  position: absolute;
  z-index: 0;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.preloader__rings { position: absolute; z-index: 1; inset: 0; display: grid; place-items: center; pointer-events: none; }
.preloader__rings i {
  position: absolute;
  box-sizing: border-box;
  border: clamp(22rem, 3.1vw, 48rem) solid #ffd43b;
  border-radius: 50%;
  opacity: 0;
  transform: scale(.42);
  animation:
    pl-ring-arrive 1500ms cubic-bezier(.16, 1, .3, 1) var(--pl-ring-delay) both,
    pl-ring-breathe 1750ms ease-in-out calc(1480ms + var(--pl-ring-delay)) 1 both;
}
.preloader__rings i:nth-child(1) { --pl-ring-delay: 0ms; width: 30%; aspect-ratio: 1; }
.preloader__rings i:nth-child(2) { --pl-ring-delay: 110ms; width: 48%; aspect-ratio: 1; }
.preloader__rings i:nth-child(3) { --pl-ring-delay: 220ms; width: 68%; aspect-ratio: 1; }
.preloader__rings i:nth-child(4) { --pl-ring-delay: 330ms; width: 88%; aspect-ratio: 1; }
.preloader__brand-shell {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  opacity: 0;
  transform: scale(.94);
  animation: pl-word-arrive 760ms cubic-bezier(.16, 1, .3, 1) 540ms both;
}
.preloader__word {
  color: #15120f;
  font-family: var(--font-ui), Arial, sans-serif;
  font-size: clamp(52rem, 9.4vw, 142rem);
  font-weight: 900;
  letter-spacing: -.082em;
  line-height: .82;
  text-wrap: nowrap;
}
.preloader__brand-shell::after {
  position: absolute;
  z-index: -1;
  right: 6%;
  bottom: -18rem;
  width: 32%;
  height: 14rem;
  content: '';
  border-radius: 50%;
  background: rgb(92 68 0 / .14);
  filter: blur(10rem);
  transform: scaleX(.6);
  opacity: 0;
  animation: pl-shadow-arrive 800ms cubic-bezier(.16, 1, .3, 1) 760ms both;
}

/* Music-on timeline ~8.9s: slower arrive, longer hold/breathe to land with the track. */
.preloader--music .preloader__rings i {
  animation:
    pl-ring-arrive 2600ms cubic-bezier(.16, 1, .3, 1) var(--pl-ring-delay) both,
    pl-ring-breathe 2400ms ease-in-out calc(2500ms + var(--pl-ring-delay)) 2 both;
}
.preloader--music .preloader__rings i:nth-child(1) { --pl-ring-delay: 0ms; }
.preloader--music .preloader__rings i:nth-child(2) { --pl-ring-delay: 180ms; }
.preloader--music .preloader__rings i:nth-child(3) { --pl-ring-delay: 360ms; }
.preloader--music .preloader__rings i:nth-child(4) { --pl-ring-delay: 540ms; }
.preloader--music .preloader__brand-shell {
  animation: pl-word-arrive 1400ms cubic-bezier(.16, 1, .3, 1) 1100ms both;
}
.preloader--music .preloader__brand-shell::after {
  animation: pl-shadow-arrive 1200ms cubic-bezier(.16, 1, .3, 1) 1800ms both;
}

/* Ghost Skip pill — cream/ink DNA; almost invisible until hover/focus. */
.preloader__skip {
  position: absolute;
  z-index: 2;
  bottom: max(28rem, 4vh);
  left: 50%;
  transform: translateX(-50%);
  padding: 8rem 16rem;
  border: 1px solid rgb(21 18 15 / .08);
  border-radius: 999px;
  background: rgb(255 250 240 / .35);
  color: #15120f;
  font-family: var(--font-ui), Arial, sans-serif;
  font-size: 11rem;
  font-weight: 600;
  letter-spacing: .04em;
  line-height: 1;
  cursor: pointer;
  opacity: .14;
  transition: opacity 220ms ease, background 220ms ease, border-color 220ms ease;
}
.preloader__skip--on { opacity: .22; }
.preloader__skip:hover,
.preloader__skip:focus-visible {
  opacity: .72;
  background: rgb(255 250 240 / .85);
  border-color: rgb(21 18 15 / .18);
  outline: none;
}
.preloader__skip:focus-visible {
  outline: 2rem solid #15120f;
  outline-offset: 3rem;
}

@keyframes pl-entry-orbit { to { transform: rotate(360deg); } }
@keyframes pl-ring-arrive {
  0% { opacity: 0; transform: scale(.36) rotate(-10deg); }
  58% { opacity: 1; transform: scale(1.035) rotate(1deg); }
  100% { opacity: 1; transform: scale(1) rotate(0); }
}
@keyframes pl-ring-breathe {
  0%, 100% { transform: scale(1); }
  48% { transform: scale(1.035); }
}
@keyframes pl-word-arrive {
  0% { opacity: 0; transform: scale(.94) translateY(16rem); filter: blur(5rem); }
  66% { opacity: 1; filter: blur(0); }
  100% { opacity: 1; transform: none; filter: none; }
}
@keyframes pl-shadow-arrive { to { opacity: .78; transform: scaleX(1); } }

@media (prefers-reduced-motion: reduce) {
  .preloader { transition-duration: 80ms; }
  .preloader *,
  .preloader *::before,
  .preloader *::after { animation: none !important; }
  .preloader__entry-orbit { transform: none; }
  .preloader__rings i { opacity: 1; transform: scale(1); }
  .preloader__brand-shell { opacity: 1; transform: none; }
  .preloader__brand-shell::after { opacity: .55; transform: scaleX(1); }
  .preloader__beat-canvas { display: none; }
}
:global(html[data-reduce-motion="on"]) .preloader { transition-duration: 80ms; }
:global(html[data-reduce-motion="on"]) .preloader *,
:global(html[data-reduce-motion="on"]) .preloader *::before,
:global(html[data-reduce-motion="on"]) .preloader *::after { animation: none !important; }
:global(html[data-reduce-motion="on"]) .preloader__entry-orbit { transform: none; }
:global(html[data-reduce-motion="on"]) .preloader__rings i { opacity: 1; transform: scale(1); }
:global(html[data-reduce-motion="on"]) .preloader__brand-shell { opacity: 1; transform: none; }
:global(html[data-reduce-motion="on"]) .preloader__brand-shell::after { opacity: .55; transform: scaleX(1); }
:global(html[data-reduce-motion="on"]) .preloader__beat-canvas { display: none; }
</style>
