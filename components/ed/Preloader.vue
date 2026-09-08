<!-- Compact logo first, then beat-choreographed rings + atomic→orbital white particles / enter→trainer / Sanskrit quote; optional opening music (~8.93s). -->
<script setup lang="ts">
import { openingSoundSrc } from '~/composables/useSiteSettings'
import { pickPreloaderQuote, type PreloaderQuote } from '~/utils/preloaderQuotes'

const emit = defineEmits<{ complete: [] }>()
const { settings, prefersReducedMotion, hydrate } = useSiteSettings()
const leaving = ref(false)
const entered = ref(false)
const reducedMotion = ref(false)
const ident = ref<HTMLAudioElement | null>(null)
const beatCanvas = ref<HTMLCanvasElement | null>(null)
const ringEls = ref<(HTMLElement | null)[]>([])
const wordShellEl = ref<HTMLElement | null>(null)
const enterPartEl = ref<HTMLElement | null>(null)
const trainerPartEl = ref<HTMLElement | null>(null)
const setRingEl = (el: Element | null | { $el?: Element }, index: number) => {
  const node = el && '$el' in el ? el.$el : el
  ringEls.value[index] = node instanceof HTMLElement ? node : null
}
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
 * Authoritative sync map — drive choreography + pulses from audio.currentTime via rAF.
 */
const BEAT_TIMES = [
  0.511, 1.091, 1.37, 1.974, 2.252, 2.833, 3.135, 3.413, 3.715, 4.296, 4.598,
  5.178, 5.457, 5.759, 6.06, 6.339, 6.618, 6.92, 7.5, 8.081, 8.382
] as const

/** Look-ahead so a beat near the frame boundary still fires cleanly. */
const BEAT_LOOKAHEAD_S = 0.028

/**
 * Beat-index → brand choreography. Canvas motifs still spawn on every beat.
 * Ring indices are 0–3 (innermost → outermost).
 */
type ChoreoKind =
  | 'ring-in'
  | 'enter-in'
  | 'trainer-in'
  | 'quote-in'
  | 'pulse'
  | 'settle'

interface ChoreoStep {
  kind: ChoreoKind
  /** Which rings arrive or pulse (0–3). */
  rings?: number[]
  /** Subtle wordmark kick (both parts once assembled). */
  word?: boolean
  /** Stronger pulse intensity. */
  strong?: boolean
}

/**
 * Beat map (music-on):
 * 0–3 rings → 4 enter → 5 trainer (+ strong ring pulse) → 8 quote
 * (+ word kick) → later pulses / settle. Word kicks pulse both halves.
 */
const BEAT_CHOREO: ChoreoStep[] = [
  /* 0  0.511 */ { kind: 'ring-in', rings: [0] },
  /* 1  1.091 */ { kind: 'ring-in', rings: [1] },
  /* 2  1.370 */ { kind: 'ring-in', rings: [2] },
  /* 3  1.974 */ { kind: 'ring-in', rings: [3] },
  /* 4  2.252 */ { kind: 'enter-in' },
  /* 5  2.833 */ { kind: 'trainer-in', rings: [0, 1, 2, 3], strong: true },
  /* 6  3.135 */ { kind: 'pulse', rings: [0, 2] },
  /* 7  3.413 */ { kind: 'pulse', rings: [1, 3] },
  /* 8  3.715 */ { kind: 'quote-in', rings: [0, 1, 2, 3], word: true },
  /* 9  4.296 */ { kind: 'pulse', rings: [2, 3] },
  /* 10 4.598 */ { kind: 'pulse', rings: [0, 1], word: true },
  /* 11 5.178 */ { kind: 'pulse', rings: [0, 1, 2, 3], strong: true },
  /* 12 5.457 */ { kind: 'pulse', rings: [1, 2] },
  /* 13 5.759 */ { kind: 'pulse', rings: [0, 1, 2, 3], word: true },
  /* 14 6.060 */ { kind: 'pulse', rings: [0, 3] },
  /* 15 6.339 */ { kind: 'pulse', rings: [1, 2] },
  /* 16 6.618 */ { kind: 'pulse', rings: [0, 1, 2, 3], word: true, strong: true },
  /* 17 6.920 */ { kind: 'pulse', rings: [0, 1, 2, 3] },
  /* 18 7.500 */ { kind: 'settle', rings: [0, 1, 2, 3] },
  /* 19 8.081 */ { kind: 'settle', rings: [1, 2], word: true },
  /* 20 8.382 */ { kind: 'settle', rings: [0, 1, 2, 3] }
]

/**
 * Soft white orbital particles per ring (innermost → outermost).
 * Ride mid-stroke of each yellow ring; outer rings drift slower.
 * `start` = initial angle (deg); `dur` = orbital period (s); `atomic` = intro swirl period (s).
 */
const RING_PARTICLES: { start: number; dur: number; atomic: number }[][] = [
  [{ start: 18, dur: 5.2, atomic: 0.95 }],
  [
    { start: 55, dur: 7.0, atomic: 1.05 },
    { start: 215, dur: 8.4, atomic: 1.15 }
  ],
  [
    { start: 100, dur: 9.6, atomic: 1.2 },
    { start: 280, dur: 11.2, atomic: 1.35 }
  ],
  [
    { start: 12, dur: 13.5, atomic: 1.45 },
    { start: 138, dur: 15.8, atomic: 1.55 },
    { start: 255, dur: 12.4, atomic: 1.4 }
  ]
]

const soundOn = computed(() => settings.value.openingSound === 'on')
const identSrc = computed(() => openingSoundSrc(settings.value.openingSound))
const showBeatCanvas = computed(
  () => soundOn.value && entered.value && !reducedMotion.value && !leaving.value
)
/** Music-on path uses beat classes; sound-off keeps CSS-delay sequence. */
const beatDriven = computed(
  () => soundOn.value && entered.value && !reducedMotion.value
)

const ringsIn = reactive([false, false, false, false])
const wordEnterIn = ref(false)
const wordTrainerIn = ref(false)
const quoteIn = ref(false)
const settling = ref(false)
/** Music-on only — hidden on the short music-off path. */
const activeQuote = ref<PreloaderQuote>(pickPreloaderQuote())
const showQuoteBlock = computed(() => soundOn.value && entered.value)
const wordAssembled = computed(() => wordEnterIn.value && wordTrainerIn.value)

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

const resetChoreo = () => {
  for (let i = 0; i < 4; i++) ringsIn[i] = false
  wordEnterIn.value = false
  wordTrainerIn.value = false
  quoteIn.value = false
  settling.value = false
  for (const el of ringEls.value) {
    el?.classList.remove(
      'ring--pulse',
      'ring--pulse-strong',
      'ring--settle-breath',
      'ring--settled'
    )
  }
  wordShellEl.value?.classList.remove('word--kick', 'word--settled', 'word--assembled')
  for (const el of [enterPartEl.value, trainerPartEl.value]) {
    el?.classList.remove('part--kick', 'part--settled')
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

const restartClass = (el: HTMLElement | null | undefined, cls: string) => {
  if (!el) return
  el.classList.remove(cls)
  // Force reflow so the same keyframe can re-fire on successive beats.
  void el.offsetWidth
  el.classList.add(cls)
}

const pulseRings = (step: ChoreoStep, settle: boolean) => {
  const pulseCls = settle
    ? 'ring--settle-breath'
    : step.strong
      ? 'ring--pulse-strong'
      : 'ring--pulse'
  for (const i of step.rings ?? []) {
    if (!ringsIn[i]) continue
    const el = ringEls.value[i]
    if (!el) continue
    el.classList.add('ring--settled')
    el.classList.remove('ring--pulse', 'ring--pulse-strong', 'ring--settle-breath')
    void el.offsetWidth
    el.classList.add(pulseCls)
  }
}

const kickWordmark = () => {
  if (!wordAssembled.value) return
  wordShellEl.value?.classList.add('word--settled', 'word--assembled')
  restartClass(wordShellEl.value, 'word--kick')
  // Slight stagger so the two halves feel like one logo, not a single slab.
  restartClass(enterPartEl.value, 'part--kick')
  const trainer = trainerPartEl.value
  if (trainer) {
    trainer.classList.remove('part--kick')
    window.setTimeout(() => restartClass(trainer, 'part--kick'), 36)
  }
}

const applyChoreo = (step: ChoreoStep) => {
  if (step.kind === 'ring-in') {
    for (const i of step.rings ?? []) {
      if (i >= 0 && i < 4) ringsIn[i] = true
    }
    return
  }
  if (step.kind === 'enter-in') {
    wordEnterIn.value = true
    return
  }
  if (step.kind === 'trainer-in') {
    wordTrainerIn.value = true
    if (wordEnterIn.value) {
      wordShellEl.value?.classList.add('word--assembled')
    }
    if (step.rings?.length) pulseRings(step, false)
    return
  }
  if (step.kind === 'quote-in') {
    quoteIn.value = true
    if (step.rings?.length) pulseRings(step, false)
    if (step.word) kickWordmark()
    return
  }
  if (step.kind === 'settle') {
    settling.value = true
  }

  // pulse + settle breath — lock arrive first so keyframes can re-fire cleanly
  if (step.kind === 'pulse' || step.kind === 'settle') {
    pulseRings(step, step.kind === 'settle')
    if (step.word) kickWordmark()
  }
}

const onRingAnimEnd = (e: AnimationEvent, index: number) => {
  const el = ringEls.value[index]
  if (!el || e.target !== el) return
  const name = e.animationName
  if (name === 'pl-ring-arrive-beat') {
    el.classList.add('ring--settled')
    return
  }
  if (
    name === 'pl-ring-pulse-beat' ||
    name === 'pl-ring-pulse-strong' ||
    name === 'pl-ring-settle-breath'
  ) {
    el.classList.remove('ring--pulse', 'ring--pulse-strong', 'ring--settle-breath')
  }
}

const onWordAnimEnd = (e: AnimationEvent) => {
  const el = wordShellEl.value
  if (!el) return
  if (e.animationName === 'pl-word-kick') {
    el.classList.remove('word--kick')
  }
}

const onPartAnimEnd = (e: AnimationEvent, which: 'enter' | 'trainer') => {
  const el = which === 'enter' ? enterPartEl.value : trainerPartEl.value
  if (!el) return
  if (e.animationName === 'pl-part-arrive-beat') {
    el.classList.add('part--settled')
    if (wordAssembled.value) {
      wordShellEl.value?.classList.add('word--settled', 'word--assembled')
    }
    return
  }
  if (e.animationName === 'pl-part-kick') {
    el.classList.remove('part--kick')
  }
}

const onQuoteAnimEnd = (e: AnimationEvent) => {
  if (e.animationName === 'pl-quote-arrive') {
    ;(e.currentTarget as HTMLElement | null)?.classList.add('quote--settled')
  }
}

const spawnBeat = (index: number, now: number, w: number, h: number) => {
  const cx = w * 0.5
  const cy = h * 0.5
  const strong = index % 2 === 0
  const accent = index % 4 === 0
  const alt = index % 2
  const minDim = Math.min(w, h)

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
  if (completed || leaving.value || !beatDriven.value) {
    beatRaf = 0
    return
  }
  const canvas = beatCanvas.value
  const audio = ident.value
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = canvas ? canvas.width / dpr : 0
  const h = canvas ? canvas.height / dpr : 0
  const ctx = canvas && w > 0 ? canvas.getContext('2d') : null

  // Clock from the <audio> element — avoids setTimeout drift.
  const t = audio && !audio.paused ? audio.currentTime : -1
  if (t >= 0) {
    while (
      beatCursor < BEAT_TIMES.length &&
      BEAT_TIMES[beatCursor]! <= t + BEAT_LOOKAHEAD_S
    ) {
      const bt = BEAT_TIMES[beatCursor]!
      const idx = beatCursor
      if (t - bt < 0.12) {
        const step = BEAT_CHOREO[idx]
        if (step) applyChoreo(step)
        if (ctx && w > 0 && h > 0) spawnBeat(idx, now, w, h)
      }
      beatCursor += 1
    }
  }

  if (ctx && canvas) {
    ctx.clearRect(0, 0, w, h)
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i]!
      if (now - p.born >= p.life) {
        pulses.splice(i, 1)
        continue
      }
      drawPulse(ctx, p, now, dpr)
    }
  }

  beatRaf = requestAnimationFrame(tickBeats)
}

const startBeatLoop = () => {
  stopBeatLoop()
  resetChoreo()
  if (!beatDriven.value) return
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

const revealStaticBrand = () => {
  for (let i = 0; i < 4; i++) ringsIn[i] = true
  wordEnterIn.value = true
  wordTrainerIn.value = true
  quoteIn.value = soundOn.value
  nextTick(() => {
    wordShellEl.value?.classList.add('word--settled', 'word--assembled')
    enterPartEl.value?.classList.add('part--settled')
    trainerPartEl.value?.classList.add('part--settled')
  })
}

const startExperience = () => {
  if (entered.value || completed) return
  activeQuote.value = pickPreloaderQuote()
  playOpeningSound()
  entered.value = true
  if (soundOn.value) {
    finishTimer = window.setTimeout(finish, MUSIC_SAFETY_MS)
    if (!reducedMotion.value) startBeatLoop()
    else revealStaticBrand()
  } else {
    // Short path: full wordmark via CSS; quote stays hidden.
    wordEnterIn.value = true
    wordTrainerIn.value = true
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
      'preloader--music': soundOn && entered,
      'preloader--beat': beatDriven,
      'preloader--settle': settling
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
      <div class="preloader__rings">
        <i
          v-for="n in 4"
          :key="n"
          :ref="(el) => setRingEl(el, n - 1)"
          :class="{ 'ring--in': ringsIn[n - 1] }"
          @animationend="onRingAnimEnd($event, n - 1)"
        >
          <!-- Soft white discs: atomic 3D swirl on ring-in, then flat orbital drift. -->
          <span class="ring__orbit-plane" aria-hidden="true" @animationend.stop>
            <span
              v-for="(p, pi) in RING_PARTICLES[n - 1]"
              :key="pi"
              class="ring__particle-arm"
              :style="{
                '--orbit-dur': p.dur + 's',
                '--orbit-start': p.start + 'deg',
                '--atomic-dur': p.atomic + 's'
              }"
            >
              <span class="ring__particle" />
            </span>
          </span>
        </i>
      </div>
      <div
        ref="wordShellEl"
        class="preloader__brand-shell"
        :class="{
          'word--in': wordEnterIn || wordTrainerIn,
          'word--assembled': wordAssembled
        }"
        @animationend="onWordAnimEnd"
      >
        <span class="preloader__word">
          <span
            ref="enterPartEl"
            class="preloader__word-part preloader__word-part--enter"
            :class="{ 'part--in': wordEnterIn }"
            @animationend="onPartAnimEnd($event, 'enter')"
          >enter</span><span
            ref="trainerPartEl"
            class="preloader__word-part preloader__word-part--trainer"
            :class="{ 'part--in': wordTrainerIn }"
            @animationend="onPartAnimEnd($event, 'trainer')"
          >trainer</span>
        </span>
      </div>
    </div>

    <!-- Cream band below rings / above Skip — music-on only. -->
    <div
      v-if="showQuoteBlock"
      class="preloader__quote"
      :class="{ 'quote--in': quoteIn }"
      aria-hidden="true"
      @animationend="onQuoteAnimEnd"
    >
      <p class="preloader__quote-sa" lang="sa">{{ activeQuote.sa }}</p>
      <p class="preloader__quote-en">{{ activeQuote.en }}</p>
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
.preloader__rings {
  position: absolute;
  z-index: 1;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}
.preloader__rings i {
  position: absolute;
  box-sizing: border-box;
  border: clamp(22rem, 3.1vw, 48rem) solid #ffd43b;
  border-radius: 50%;
  opacity: 0;
  transform: scale(.42);
  perspective: 820px;
  transform-style: preserve-3d;
  animation:
    pl-ring-arrive 1500ms cubic-bezier(.16, 1, .3, 1) var(--pl-ring-delay) both,
    pl-ring-breathe 1750ms ease-in-out calc(1480ms + var(--pl-ring-delay)) 1 both;
}
.preloader__rings i:nth-child(1) { --pl-ring-delay: 0ms; width: 30%; aspect-ratio: 1; }
.preloader__rings i:nth-child(2) { --pl-ring-delay: 110ms; width: 48%; aspect-ratio: 1; }
.preloader__rings i:nth-child(3) { --pl-ring-delay: 220ms; width: 68%; aspect-ratio: 1; }
.preloader__rings i:nth-child(4) { --pl-ring-delay: 330ms; width: 88%; aspect-ratio: 1; }

/*
 * Orbital particles — soft off-white discs mid-stroke on each yellow ring.
 * Music-on beat path: tilted atomic swirl while the ring arrives, then flatten
 * into steady flat orbits at staggered angular velocities.
 * Music-off / reduced-motion: static or minimal flat drift (no 3D spin).
 */
.ring__orbit-plane {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  transform-style: preserve-3d;
  pointer-events: none;
}
.ring__particle-arm {
  position: absolute;
  inset: 0;
  transform: rotate(var(--orbit-start, 0deg));
  transform-style: preserve-3d;
}
.ring__particle {
  position: absolute;
  /* Mid-stroke of the thick yellow border (half of clamp(22–48rem)). */
  top: clamp(11rem, 1.55vw, 24rem);
  left: 50%;
  width: clamp(6rem, .95vw, 12rem);
  height: clamp(6rem, .95vw, 12rem);
  border-radius: 50%;
  background:
    radial-gradient(
      circle at 32% 28%,
      #fffef9 0%,
      #f3eee4 52%,
      #e4dccf 100%
    );
  box-shadow:
    inset 0 -1.2px 2.5px rgb(21 18 15 / .1),
    inset 0 1px 1.5px rgb(255 255 255 / .55),
    0 1px 2px rgb(92 68 0 / .08);
  transform: translate(-50%, -50%);
  opacity: .82;
  will-change: transform;
}
.preloader__rings i:nth-child(1) .ring__particle { width: clamp(5rem, .8vw, 9rem); height: clamp(5rem, .8vw, 9rem); }
.preloader__rings i:nth-child(4) .ring__particle { width: clamp(7rem, 1.05vw, 13rem); height: clamp(7rem, 1.05vw, 13rem); }

/* Music-off: gentle flat orbit after CSS ring-in — no atomic tilt. */
.preloader:not(.preloader--beat) .ring__particle-arm {
  animation: pl-arm-orbit var(--orbit-dur, 10s) linear infinite;
}
.preloader:not(.preloader--beat) .ring__orbit-plane {
  transform: none;
}
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
.preloader__word-part {
  display: inline-block;
  /* Keep halves flush so tracking reads as one wordmark. */
  letter-spacing: inherit;
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

/*
 * Beat-driven music path: rings/word stay hidden until JS toggles classes
 * when audio.currentTime crosses assigned beat times — no CSS-delay choreography.
 */
.preloader--beat .preloader__rings i {
  animation: none;
  opacity: 0;
  transform: scale(.36) rotate(-10deg);
}
.preloader--beat .preloader__rings i.ring--in:not(.ring--settled) {
  animation: pl-ring-arrive-beat 680ms cubic-bezier(.16, 1, .3, 1) both;
}
.preloader--beat .preloader__rings i.ring--in.ring--settled {
  opacity: 1;
  transform: scale(1) rotate(0);
  animation: none;
}
.preloader--beat .preloader__rings i.ring--in.ring--settled.ring--pulse {
  animation: pl-ring-pulse-beat 440ms cubic-bezier(.16, 1, .3, 1);
}
.preloader--beat .preloader__rings i.ring--in.ring--settled.ring--pulse-strong {
  animation: pl-ring-pulse-strong 520ms cubic-bezier(.16, 1, .3, 1);
}
.preloader--beat .preloader__rings i.ring--in.ring--settled.ring--settle-breath {
  animation: pl-ring-settle-breath 720ms cubic-bezier(.22, 1, .36, 1);
}

/* Particles: hidden until ring-in; atomic tilt while arriving; flatten + orbit once settled. */
.preloader--beat .ring__orbit-plane {
  opacity: 0;
  transform: rotateX(68deg) rotateZ(-28deg) scale(.72);
}
.preloader--beat .ring__particle {
  opacity: 0;
}
.preloader--beat .preloader__rings i.ring--in:not(.ring--settled) .ring__orbit-plane {
  opacity: 1;
  animation: pl-atomic-plane-spin 1.05s linear infinite;
}
.preloader--beat .preloader__rings i.ring--in:not(.ring--settled) .ring__particle-arm {
  animation: pl-arm-orbit var(--atomic-dur, 1.1s) linear infinite;
}
.preloader--beat .preloader__rings i.ring--in:not(.ring--settled) .ring__particle {
  opacity: .88;
  animation: pl-particle-bloom 420ms cubic-bezier(.16, 1, .3, 1) both;
}
.preloader--beat .preloader__rings i.ring--in.ring--settled .ring__orbit-plane {
  opacity: 1;
  animation: pl-atomic-plane-flatten 1100ms cubic-bezier(.16, 1, .3, 1) both;
}
.preloader--beat .preloader__rings i.ring--in.ring--settled .ring__particle-arm {
  animation: pl-arm-orbit var(--orbit-dur, 10s) linear infinite;
}
.preloader--beat .preloader__rings i.ring--in.ring--settled .ring__particle {
  opacity: .82;
}
.preloader--beat .preloader__brand-shell {
  /* Shell stays clear; halves animate independently. */
  animation: none;
  opacity: 1;
  transform: none;
  filter: none;
}
.preloader--beat .preloader__word-part {
  opacity: 0;
  transform: scale(.88) translateY(22rem);
  filter: blur(8rem);
}
.preloader--beat .preloader__word-part.part--in:not(.part--settled) {
  animation: pl-part-arrive-beat 820ms cubic-bezier(.16, 1, .3, 1) both;
}
.preloader--beat .preloader__word-part.part--in.part--settled {
  opacity: 1;
  transform: none;
  filter: none;
  animation: none;
}
.preloader--beat .preloader__word-part.part--in.part--settled.part--kick {
  animation: pl-part-kick 360ms cubic-bezier(.16, 1, .3, 1);
}
.preloader--beat .preloader__brand-shell.word--in.word--settled.word--kick {
  animation: pl-word-kick 380ms cubic-bezier(.16, 1, .3, 1);
}
.preloader--beat .preloader__brand-shell::after {
  animation: none;
  opacity: 0;
  transform: scaleX(.55);
}
.preloader--beat .preloader__brand-shell.word--assembled::after {
  animation: pl-shadow-arrive 700ms cubic-bezier(.16, 1, .3, 1) 120ms both;
}
.preloader--beat .preloader__brand-shell.word--assembled.word--settled::after {
  opacity: .78;
  transform: scaleX(1);
  animation: none;
}

/*
 * Sanskrit quote — empty cream band BELOW the ring stage, ABOVE Skip.
 * Secondary to the wordmark: soft ink, small type, wide tracking.
 */
.preloader__quote {
  position: absolute;
  z-index: 2;
  left: 50%;
  bottom: clamp(72rem, 15vh, 132rem);
  width: min(520rem, 88vw);
  padding: 0 12rem;
  text-align: center;
  pointer-events: none;
  opacity: 0;
  transform: translateX(-50%) translateY(14rem);
}
.preloader__quote.quote--in:not(.quote--settled) {
  animation: pl-quote-arrive 900ms cubic-bezier(.16, 1, .3, 1) both;
}
.preloader__quote.quote--in.quote--settled {
  opacity: .72;
  transform: translateX(-50%) translateY(0);
  animation: none;
}
.preloader__quote-sa {
  margin: 0;
  color: rgb(21 18 15 / .48);
  font-family: 'Noto Sans Devanagari', 'Noto Serif Devanagari', 'Kohinoor Devanagari', 'Mangal', 'Arial Unicode MS', sans-serif;
  font-size: clamp(13rem, 2.4vw, 18rem);
  font-weight: 500;
  letter-spacing: .06em;
  line-height: 1.35;
}
.preloader__quote-en {
  margin: 6rem 0 0;
  color: rgb(21 18 15 / .34);
  font-family: var(--font-mono), monospace;
  font-size: clamp(9rem, 1.6vw, 11rem);
  font-weight: 500;
  letter-spacing: .14em;
  line-height: 1.4;
  text-transform: uppercase;
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
/* Electron-arm spin — start angle via --orbit-start on the element. */
@keyframes pl-arm-orbit {
  from { transform: rotate(var(--orbit-start, 0deg)); }
  to { transform: rotate(calc(var(--orbit-start, 0deg) + 360deg)); }
}
/* Atomic intro: tilted elliptical plane (perspective parent → oval paths). */
@keyframes pl-atomic-plane-spin {
  0% { transform: rotateX(68deg) rotateZ(0deg) scale(.92); }
  50% { transform: rotateX(58deg) rotateZ(180deg) scale(1); }
  100% { transform: rotateX(68deg) rotateZ(360deg) scale(.92); }
}
@keyframes pl-atomic-plane-flatten {
  0% { transform: rotateX(62deg) rotateZ(18deg) scale(1); }
  55% { transform: rotateX(22deg) rotateZ(6deg) scale(1); }
  100% { transform: rotateX(0deg) rotateZ(0deg) scale(1); }
}
@keyframes pl-particle-bloom {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(.35); }
  70% { opacity: .92; transform: translate(-50%, -50%) scale(1.08); }
  100% { opacity: .88; transform: translate(-50%, -50%) scale(1); }
}
@keyframes pl-ring-arrive {
  0% { opacity: 0; transform: scale(.36) rotate(-10deg); }
  58% { opacity: 1; transform: scale(1.035) rotate(1deg); }
  100% { opacity: 1; transform: scale(1) rotate(0); }
}
@keyframes pl-ring-arrive-beat {
  0% { opacity: 0; transform: scale(.32) rotate(-12deg); }
  55% { opacity: 1; transform: scale(1.05) rotate(1.5deg); }
  100% { opacity: 1; transform: scale(1) rotate(0); }
}
@keyframes pl-ring-breathe {
  0%, 100% { transform: scale(1); }
  48% { transform: scale(1.035); }
}
@keyframes pl-ring-pulse-beat {
  0% { opacity: 1; transform: scale(1) rotate(0); }
  42% { opacity: 1; transform: scale(1.04) rotate(0.4deg); }
  100% { opacity: 1; transform: scale(1) rotate(0); }
}
@keyframes pl-ring-pulse-strong {
  0% { opacity: 1; transform: scale(1) rotate(0); }
  38% { opacity: 1; transform: scale(1.065) rotate(-0.6deg); }
  100% { opacity: 1; transform: scale(1) rotate(0); }
}
@keyframes pl-ring-settle-breath {
  0% { opacity: 1; transform: scale(1); }
  45% { opacity: 1; transform: scale(1.018); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes pl-word-arrive {
  0% { opacity: 0; transform: scale(.94) translateY(16rem); filter: blur(5rem); }
  66% { opacity: 1; filter: blur(0); }
  100% { opacity: 1; transform: none; filter: none; }
}
@keyframes pl-word-arrive-beat {
  0% { opacity: 0; transform: scale(.86) translateY(28rem); filter: blur(10rem); }
  58% { opacity: 1; filter: blur(0); transform: scale(1.03) translateY(-2rem); }
  100% { opacity: 1; transform: none; filter: none; }
}
@keyframes pl-part-arrive-beat {
  0% { opacity: 0; transform: scale(.86) translateY(24rem); filter: blur(8rem); }
  58% { opacity: 1; filter: blur(0); transform: scale(1.025) translateY(-2rem); }
  100% { opacity: 1; transform: none; filter: none; }
}
@keyframes pl-part-kick {
  0% { opacity: 1; transform: scale(1); filter: none; }
  40% { opacity: 1; transform: scale(1.04); filter: none; }
  100% { opacity: 1; transform: scale(1); filter: none; }
}
@keyframes pl-word-kick {
  0% { opacity: 1; transform: scale(1); filter: none; }
  40% { opacity: 1; transform: scale(1.035); filter: none; }
  100% { opacity: 1; transform: scale(1); filter: none; }
}
@keyframes pl-quote-arrive {
  0% { opacity: 0; transform: translateX(-50%) translateY(16rem); }
  100% { opacity: .72; transform: translateX(-50%) translateY(0); }
}
@keyframes pl-shadow-arrive { to { opacity: .78; transform: scaleX(1); } }

@media (prefers-reduced-motion: reduce) {
  .preloader { transition-duration: 80ms; }
  .preloader *,
  .preloader *::before,
  .preloader *::after { animation: none !important; }
  .preloader__entry-orbit { transform: none; }
  .preloader__rings i { opacity: 1; transform: scale(1); }
  .ring__orbit-plane { opacity: 1; transform: none; }
  .ring__particle-arm { transform: rotate(var(--orbit-start, 0deg)); }
  .ring__particle { opacity: .7; transform: translate(-50%, -50%); }
  .preloader__brand-shell { opacity: 1; transform: none; filter: none; }
  .preloader__brand-shell::after { opacity: .55; transform: scaleX(1); }
  .preloader__word-part { opacity: 1; transform: none; filter: none; }
  .preloader__quote.quote--in {
    opacity: .72;
    transform: translateX(-50%) translateY(0);
  }
  .preloader__beat-canvas { display: none; }
}
:global(html[data-reduce-motion="on"]) .preloader { transition-duration: 80ms; }
:global(html[data-reduce-motion="on"]) .preloader *,
:global(html[data-reduce-motion="on"]) .preloader *::before,
:global(html[data-reduce-motion="on"]) .preloader *::after { animation: none !important; }
:global(html[data-reduce-motion="on"]) .preloader__entry-orbit { transform: none; }
:global(html[data-reduce-motion="on"]) .preloader__rings i { opacity: 1; transform: scale(1); }
:global(html[data-reduce-motion="on"]) .ring__orbit-plane { opacity: 1; transform: none; }
:global(html[data-reduce-motion="on"]) .ring__particle-arm { transform: rotate(var(--orbit-start, 0deg)); }
:global(html[data-reduce-motion="on"]) .ring__particle { opacity: .7; transform: translate(-50%, -50%); }
:global(html[data-reduce-motion="on"]) .preloader__brand-shell { opacity: 1; transform: none; filter: none; }
:global(html[data-reduce-motion="on"]) .preloader__brand-shell::after { opacity: .55; transform: scaleX(1); }
:global(html[data-reduce-motion="on"]) .preloader__word-part { opacity: 1; transform: none; filter: none; }
:global(html[data-reduce-motion="on"]) .preloader__quote.quote--in {
  opacity: .72;
  transform: translateX(-50%) translateY(0);
}
:global(html[data-reduce-motion="on"]) .preloader__beat-canvas { display: none; }
</style>
