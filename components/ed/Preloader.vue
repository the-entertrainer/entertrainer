<!-- Dawn-on-cream-paper sonic logo: SVG ink-ripple rings + split wordmark + quote; beat reveal then calm breathe. -->
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
const ringEls = ref<(SVGCircleElement | null)[]>([])
const wordShellEl = ref<HTMLElement | null>(null)
const enterPartEl = ref<HTMLElement | null>(null)
const trainerPartEl = ref<HTMLElement | null>(null)
const setRingEl = (el: Element | null | { $el?: Element }, index: number) => {
  const node = el && '$el' in el ? el.$el : el
  ringEls.value[index] = node instanceof SVGCircleElement ? node : null
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
 * Authoritative sync map — drive choreography + washes from audio.currentTime via rAF.
 */
const BEAT_TIMES = [
  0.511, 1.091, 1.37, 1.974, 2.252, 2.833, 3.135, 3.413, 3.715, 4.296, 4.598,
  5.178, 5.457, 5.759, 6.06, 6.339, 6.618, 6.92, 7.5, 8.081, 8.382
] as const

/** Look-ahead so a beat near the frame boundary still fires cleanly. */
const BEAT_LOOKAHEAD_S = 0.028

/**
 * SVG ring geometry in a 100×100 viewBox (innermost → outermost).
 * Diameters keep the prior stage feel (~30 / 48 / 68 / 88% of stage).
 */
const RING_GEOM = [
  { r: 15, sw: 5.5 },
  { r: 24, sw: 5.2 },
  { r: 34, sw: 4.8 },
  { r: 44, sw: 4.4 }
] as const

const ringCirc = (r: number) => 2 * Math.PI * r

type ChoreoKind =
  | 'ring-in'
  | 'enter-in'
  | 'trainer-in'
  | 'quote-in'
  | 'pulse'
  | 'settle'

type Reaction =
  | 'stroke'
  | 'wash'
  | 'word'
  | 'seed'

interface ChoreoStep {
  kind: ChoreoKind
  rings?: number[]
  /** Soft wordmark micro-kick once assembled. */
  word?: boolean
  strong?: boolean
  /** Living-middle single reaction (prefer one clear hit). */
  reaction?: Reaction
}

/**
 * Dawn-on-cream beat map (music-on):
 * cold open → draw-on ripples 0–3 → enter / trainer 4–5 → quote ~8
 * → calm breathe (no per-beat living-middle) → settle 18–20 ends breathe.
 * Beats 9–17 are intentionally idle so the logo can rest on soft breath.
 */
const REVEAL_LAST_BEAT = 8
const BEAT_CHOREO: ChoreoStep[] = [
  /* 0  0.511 */ { kind: 'ring-in', rings: [0] },
  /* 1  1.091 */ { kind: 'ring-in', rings: [1] },
  /* 2  1.370 */ { kind: 'ring-in', rings: [2] },
  /* 3  1.974 */ { kind: 'ring-in', rings: [3] },
  /* 4  2.252 */ { kind: 'enter-in' },
  /* 5  2.833 */ { kind: 'trainer-in', rings: [0, 1, 2, 3], strong: true, reaction: 'stroke' },
  /* 6  3.135 */ { kind: 'pulse', rings: [0], reaction: 'stroke' },
  /* 7  3.413 */ { kind: 'pulse', rings: [1, 3], reaction: 'stroke' },
  /* 8  3.715 */ { kind: 'quote-in', word: true, reaction: 'word' },
  /* 9–17 idle — breathe only */
  /* 9  4.296 */ { kind: 'pulse' },
  /* 10 4.598 */ { kind: 'pulse' },
  /* 11 5.178 */ { kind: 'pulse' },
  /* 12 5.457 */ { kind: 'pulse' },
  /* 13 5.759 */ { kind: 'pulse' },
  /* 14 6.060 */ { kind: 'pulse' },
  /* 15 6.339 */ { kind: 'pulse' },
  /* 16 6.618 */ { kind: 'pulse' },
  /* 17 6.920 */ { kind: 'pulse' },
  /* 18 7.500 */ { kind: 'settle', rings: [0, 1, 2, 3] },
  /* 19 8.081 */ { kind: 'settle' },
  /* 20 8.382 */ { kind: 'settle' }
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
/** Soft continuous breathe after reveal (quote beat) until settle / leave. */
const breathing = ref(false)
/** Cold-open yellow seed — visible until first ring lands, then soft hold. */
const seedOn = ref(false)
const seedSoft = ref(false)
/** Music-on only — hidden on the short music-off path. */
const activeQuote = ref<PreloaderQuote>(pickPreloaderQuote())
const showQuoteBlock = computed(() => soundOn.value && entered.value)
const wordAssembled = computed(() => wordEnterIn.value && wordTrainerIn.value)

/** Calm wash / ink-ripple motifs only — no ticks/dots clutter. */
type WashKind = 'ripple' | 'wash' | 'seed-bloom'

interface Wash {
  kind: WashKind
  born: number
  life: number
  x: number
  y: number
  r0: number
  r1: number
  strong: boolean
  alt: number
}

const washes: Wash[] = []

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
  breathing.value = false
  seedOn.value = true
  seedSoft.value = false
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
  washes.length = 0
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

const restartClass = (el: Element | null | undefined, cls: string) => {
  if (!el) return
  el.classList.remove(cls)
  // Force reflow so the same keyframe can re-fire on successive beats.
  if (el instanceof HTMLElement) void el.offsetWidth
  else if (el instanceof SVGElement) void el.getBoundingClientRect()
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
    void el.getBoundingClientRect()
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

const applyChoreo = (step: ChoreoStep, now: number, w: number, h: number) => {
  if (step.kind === 'ring-in') {
    for (const i of step.rings ?? []) {
      if (i >= 0 && i < 4) ringsIn[i] = true
    }
    // First ring extinguishes the cold-open seed breath into a soft hold.
    if (ringsIn[0]) {
      seedSoft.value = true
    }
    // Soft ink ripple behind each draw-on.
    if (w > 0 && h > 0) {
      const i = step.rings?.[0] ?? 0
      const geom = RING_GEOM[i]!
      washes.push({
        kind: 'ripple',
        born: now,
        life: 780,
        x: w * 0.5,
        y: h * 0.5,
        r0: (Math.min(w, h) * geom.r) / 100 * 0.55,
        r1: (Math.min(w, h) * geom.r) / 100 * 1.35,
        strong: false,
        alt: i % 2
      })
      while (washes.length > 12) washes.shift()
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
    // Reveal complete — leave beats behind for editorial calm breathe.
    breathing.value = true
    wordShellEl.value?.classList.add('word--settled', 'word--assembled')
    return
  }
  if (step.kind === 'settle') {
    settling.value = true
    breathing.value = false
    seedOn.value = false
    // Soft one-shot settle breath on rings, then hold still until leave.
    if (step.rings?.length) pulseRings(step, true)
    return
  }

  // Post-reveal pulse slots are intentionally idle (breathe only).
  if (step.kind === 'pulse') {
    // Pre-quote pulses (beats 6–7) still fire stroke reactions.
    if (!breathing.value && !quoteIn.value) {
      const reaction = step.reaction
      if (reaction === 'word' || (step.word && !reaction)) {
        kickWordmark()
      } else if (reaction === 'wash' && w > 0 && h > 0) {
        const minDim = Math.min(w, h)
        washes.push({
          kind: 'wash',
          born: now,
          life: step.strong ? 900 : 700,
          x: w * 0.5,
          y: h * 0.5,
          r0: minDim * 0.12,
          r1: minDim * (step.strong ? 0.58 : 0.42),
          strong: !!step.strong,
          alt: 0
        })
        while (washes.length > 12) washes.shift()
        if (step.rings?.length) pulseRings(step, false)
      } else if (step.rings?.length) {
        pulseRings(step, false)
      }
      if (step.word && reaction && reaction !== 'word') kickWordmark()
    }
  }
}

const onRingAnimEnd = (e: AnimationEvent, index: number) => {
  const el = ringEls.value[index]
  if (!el || e.target !== el) return
  const name = e.animationName
  if (name === 'pl-ring-draw' || name === 'pl-ring-arrive-css') {
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
  if (e.animationName === 'pl-part-arrive-beat' || e.animationName === 'pl-part-arrive-css') {
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

const drawWash = (
  ctx: CanvasRenderingContext2D,
  p: Wash,
  now: number,
  dpr: number
) => {
  const age = now - p.born
  const u = Math.min(1, age / p.life)
  const env = bloomEnvelope(u)
  if (env <= 0.001) return

  const r = p.r0 + (p.r1 - p.r0) * easeOutCubic(Math.min(1, u * 1.08))
  ctx.save()
  ctx.translate(p.x, p.y)

  if (p.kind === 'ripple') {
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.strokeStyle = p.alt
      ? `rgba(21, 18, 15, ${0.08 * env})`
      : `rgba(255, 212, 59, ${0.42 * env})`
    ctx.lineWidth = (p.strong ? 2.4 : 1.6) * dpr
    ctx.stroke()
  } else if (p.kind === 'wash' || p.kind === 'seed-bloom') {
    const g = ctx.createRadialGradient(0, 0, r * 0.12, 0, 0, r)
    const peak = p.kind === 'seed-bloom' ? 0.22 : p.strong ? 0.12 : 0.07
    g.addColorStop(0, `rgba(255, 212, 59, ${peak * env})`)
    g.addColorStop(0.55, `rgba(255, 212, 59, ${peak * 0.35 * env})`)
    g.addColorStop(1, 'rgba(255, 250, 240, 0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
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
        // After quote reveal, ignore living-middle pulse slots — breathe until settle.
        if (step && !(idx > REVEAL_LAST_BEAT && step.kind === 'pulse')) {
          applyChoreo(step, now, w, h)
        }
      }
      beatCursor += 1
    }
  }

  if (ctx && canvas) {
    ctx.clearRect(0, 0, w, h)
    for (let i = washes.length - 1; i >= 0; i--) {
      const p = washes[i]!
      if (now - p.born >= p.life) {
        washes.splice(i, 1)
        continue
      }
      drawWash(ctx, p, now, dpr)
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
  seedOn.value = false
  nextTick(() => {
    wordShellEl.value?.classList.add('word--settled', 'word--assembled')
    enterPartEl.value?.classList.add('part--settled')
    trainerPartEl.value?.classList.add('part--settled')
    for (const el of ringEls.value) el?.classList.add('ring--settled')
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
    seedOn.value = false
    wordEnterIn.value = true
    wordTrainerIn.value = true
    for (let i = 0; i < 4; i++) ringsIn[i] = true
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
      'preloader--breathe': breathing && !leaving,
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

      <!-- Cold-open yellow seed / glow at locked center. -->
      <div
        class="preloader__seed"
        :class="{
          'seed--on': seedOn && beatDriven,
          'seed--soft': seedSoft
        }"
      />

      <!-- SVG ink-ripple rings — stroke-dash draw-on, not chunky borders. -->
      <svg
        class="preloader__rings"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle
          v-for="(g, i) in RING_GEOM"
          :key="i"
          :ref="(el) => setRingEl(el, i)"
          class="preloader__ring"
          :class="{ 'ring--in': ringsIn[i] }"
          cx="50"
          cy="50"
          :r="g.r"
          fill="none"
          :stroke-width="g.sw"
          :style="{
            '--ring-len': String(ringCirc(g.r)),
            '--pl-ring-delay': `${i * 110}ms`,
            '--ring-sw': g.sw + 'px'
          }"
          @animationend="onRingAnimEnd($event, i)"
        />
      </svg>

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
/* Dawn on cream paper — editorial sonic logo; reveal-and-settle, not perpetual motion. */
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

/* Cold-open seed — tiny yellow breath at locked center. */
.preloader__seed {
  position: absolute;
  z-index: 1;
  width: clamp(10rem, 1.6vw, 18rem);
  height: clamp(10rem, 1.6vw, 18rem);
  border-radius: 50%;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 50%,
      #ffd43b 0%,
      rgb(255 212 59 / .55) 42%,
      rgb(255 212 59 / 0) 72%);
  opacity: 0;
  transform: scale(.6);
  filter: blur(0.5px);
}
.preloader__seed.seed--on {
  opacity: .85;
  transform: scale(1);
  animation: pl-seed-breath 1.6s ease-in-out infinite;
}
.preloader__seed.seed--on.seed--soft {
  opacity: .28;
  transform: scale(.72);
  animation: pl-seed-hold 2.4s ease-in-out infinite;
}
.preloader--settle .preloader__seed {
  opacity: 0;
  animation: none;
}
.preloader--settle .preloader__ring.ring--settled {
  opacity: .88;
  transition: opacity 600ms ease;
}

/*
 * Post-reveal calm: slow editorial breathe on ring group + wordmark.
 * Not beat-locked — ~3.2s ease-in-out until settle / leave.
 */
.preloader--breathe:not(.preloader--settle) .preloader__rings {
  transform-origin: 50% 50%;
  animation: pl-logo-breathe 3.2s ease-in-out infinite;
}
.preloader--breathe:not(.preloader--settle) .preloader__brand-shell.word--assembled {
  transform-origin: 50% 50%;
  animation: pl-word-breathe 3.2s ease-in-out infinite;
}
.preloader--settle .preloader__rings,
.preloader--settle .preloader__brand-shell {
  animation: none;
  transform: none;
}

/* SVG rings — elegant stroke draw-on, mid-stage diameters. */
.preloader__rings {
  position: absolute;
  z-index: 1;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.preloader__ring {
  stroke: #ffd43b;
  stroke-width: var(--ring-sw);
  stroke-linecap: round;
  stroke-linejoin: round;
  /* Rotate so stroke-dash reveal starts at 12 o'clock and draws clockwise. */
  transform-origin: 50% 50%;
  transform-box: fill-box;
  transform: rotate(-90deg);
  /* Hidden until path-specific rules reveal. */
  opacity: 0;
  stroke-dasharray: var(--ring-len);
  stroke-dashoffset: var(--ring-len);
}

/* Music-off short path: staggered CSS draw + overshoot settle. */
.preloader:not(.preloader--beat) .preloader__ring {
  animation:
    pl-ring-arrive-css 1500ms cubic-bezier(.16, 1, .3, 1) var(--pl-ring-delay) both,
    pl-ring-breathe-css 1750ms ease-in-out calc(1480ms + var(--pl-ring-delay)) 1 both;
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
.preloader--beat .preloader__ring {
  animation: none;
  opacity: 0;
  stroke-dashoffset: var(--ring-len);
}
.preloader--beat .preloader__ring.ring--in:not(.ring--settled) {
  opacity: 1;
  animation: pl-ring-draw 720ms cubic-bezier(.22, 1, .36, 1) both;
}
.preloader--beat .preloader__ring.ring--in.ring--settled {
  opacity: 1;
  stroke-dashoffset: 0;
  transform: rotate(-90deg) scale(1);
  animation: none;
}
.preloader--beat .preloader__ring.ring--in.ring--settled.ring--pulse {
  animation: pl-ring-pulse-beat 440ms cubic-bezier(.16, 1, .3, 1);
}
.preloader--beat .preloader__ring.ring--in.ring--settled.ring--pulse-strong {
  animation: pl-ring-pulse-strong 520ms cubic-bezier(.16, 1, .3, 1);
}
.preloader--beat .preloader__ring.ring--in.ring--settled.ring--settle-breath {
  animation: pl-ring-settle-breath 720ms cubic-bezier(.22, 1, .36, 1);
}

.preloader--beat .preloader__brand-shell {
  animation: none;
  opacity: 1;
  transform: none;
  filter: none;
}
.preloader--beat .preloader__word-part {
  opacity: 0;
  transform: scale(.88) translateY(18rem);
  filter: blur(6rem);
  clip-path: inset(0 100% 0 0);
}
.preloader--beat .preloader__word-part.part--in:not(.part--settled) {
  animation: pl-part-arrive-beat 820ms cubic-bezier(.16, 1, .3, 1) both;
}
.preloader--beat .preloader__word-part.part--in.part--settled {
  opacity: 1;
  transform: none;
  filter: none;
  clip-path: none;
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

@keyframes pl-logo-breathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.012); opacity: .96; }
}
@keyframes pl-word-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.01); }
}

@keyframes pl-seed-breath {
  0%, 100% { opacity: .55; transform: scale(.85); }
  50% { opacity: .95; transform: scale(1.08); }
}
@keyframes pl-seed-hold {
  0%, 100% { opacity: .22; transform: scale(.68); }
  50% { opacity: .34; transform: scale(.78); }
}

/* Draw clockwise: dashoffset circumference → 0 with slight scale overshoot. */
@keyframes pl-ring-draw {
  0% {
    opacity: 0;
    stroke-dashoffset: var(--ring-len);
    transform: rotate(-90deg) scale(.92);
  }
  12% { opacity: 1; }
  62% {
    opacity: 1;
    stroke-dashoffset: 0;
    transform: rotate(-90deg) scale(1.04);
  }
  100% {
    opacity: 1;
    stroke-dashoffset: 0;
    transform: rotate(-90deg) scale(1);
  }
}
@keyframes pl-ring-arrive-css {
  0% {
    opacity: 0;
    stroke-dashoffset: var(--ring-len);
    transform: rotate(-90deg) scale(.9);
  }
  58% {
    opacity: 1;
    stroke-dashoffset: 0;
    transform: rotate(-90deg) scale(1.035);
  }
  100% {
    opacity: 1;
    stroke-dashoffset: 0;
    transform: rotate(-90deg) scale(1);
  }
}
@keyframes pl-ring-breathe-css {
  0%, 100% { transform: rotate(-90deg) scale(1); }
  48% { transform: rotate(-90deg) scale(1.02); }
}
@keyframes pl-ring-pulse-beat {
  0% { opacity: 1; stroke-width: var(--ring-sw); transform: rotate(-90deg) scale(1); }
  42% { opacity: 1; stroke-width: calc(var(--ring-sw) * 1.35); transform: rotate(-90deg) scale(1.025); }
  100% { opacity: 1; stroke-width: var(--ring-sw); transform: rotate(-90deg) scale(1); }
}
@keyframes pl-ring-pulse-strong {
  0% { opacity: 1; stroke-width: var(--ring-sw); transform: rotate(-90deg) scale(1); }
  38% { opacity: 1; stroke-width: calc(var(--ring-sw) * 1.55); transform: rotate(-90deg) scale(1.04); }
  100% { opacity: 1; stroke-width: var(--ring-sw); transform: rotate(-90deg) scale(1); }
}
@keyframes pl-ring-settle-breath {
  0% { opacity: 1; transform: rotate(-90deg) scale(1); }
  45% { opacity: .92; transform: rotate(-90deg) scale(1.012); }
  100% { opacity: 1; transform: rotate(-90deg) scale(1); }
}
@keyframes pl-word-arrive {
  0% { opacity: 0; transform: scale(.94) translateY(16rem); filter: blur(5rem); }
  66% { opacity: 1; filter: blur(0); }
  100% { opacity: 1; transform: none; filter: none; }
}
@keyframes pl-part-arrive-beat {
  0% {
    opacity: 0;
    transform: scale(.88) translateY(18rem);
    filter: blur(6rem);
    clip-path: inset(0 100% 0 0);
  }
  55% {
    opacity: 1;
    filter: blur(0);
    transform: scale(1.04) translateY(-2rem);
    clip-path: inset(0 0 0 0);
  }
  100% {
    opacity: 1;
    transform: none;
    filter: none;
    clip-path: inset(0 0 0 0);
  }
}
@keyframes pl-part-arrive-css {
  0% { opacity: 0; transform: scale(.92) translateY(12rem); }
  100% { opacity: 1; transform: none; }
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
  .preloader__ring {
    opacity: 1;
    stroke-dashoffset: 0;
    transform: rotate(-90deg);
  }
  .preloader__seed { opacity: 0; }
  .preloader__brand-shell { opacity: 1; transform: none; filter: none; }
  .preloader__brand-shell::after { opacity: .55; transform: scaleX(1); }
  .preloader__word-part { opacity: 1; transform: none; filter: none; clip-path: none; }
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
:global(html[data-reduce-motion="on"]) .preloader__ring {
  opacity: 1;
  stroke-dashoffset: 0;
  transform: rotate(-90deg);
}
:global(html[data-reduce-motion="on"]) .preloader__seed { opacity: 0; }
:global(html[data-reduce-motion="on"]) .preloader__brand-shell { opacity: 1; transform: none; filter: none; }
:global(html[data-reduce-motion="on"]) .preloader__brand-shell::after { opacity: .55; transform: scaleX(1); }
:global(html[data-reduce-motion="on"]) .preloader__word-part { opacity: 1; transform: none; filter: none; clip-path: none; }
:global(html[data-reduce-motion="on"]) .preloader__quote.quote--in {
  opacity: .72;
  transform: translateX(-50%) translateY(0);
}
:global(html[data-reduce-motion="on"]) .preloader__beat-canvas { display: none; }
</style>
