<!-- Dawn-on-cream sonic logo: beat reveal → grow from wordmark complete until track ends — no ripple/fade-out. -->
<script setup lang="ts">
import { openingSoundSrc } from '~/composables/useSiteSettings'
import { pickPreloaderQuote, type PreloaderQuote } from '~/utils/preloaderQuotes'

/** Romanized Sanskrit (IAST-ish) for matrix rain — phrases, not English glosses. */
const SANSKRIT_RAIN = [
  'satyam eva jayate',
  'vasudhaiva kutumbakam',
  'yogah karmasu kaushalam',
  'tamaso ma jyotir gamaya',
  'vidya dadati vinayam',
  'prajnanam brahma',
  'ahimsa paramo dharmah',
  'sarve bhavantu sukhinah',
  'asato ma sad gamaya',
  'neti neti',
  'om shanti shanti shanti',
  'ekam sat vipra bahudha vadanti',
  'sa vidya ya vimuktaye',
  'jnana paramam balam',
  'shraddhavan labhate jnanam',
  'karmanye vadhikaraste',
  'atma deepo bhava',
  'lokah samastah sukhino bhavantu',
  'sat cit ananda',
  'yatra naryastu pujyante'
] as const

const emit = defineEmits<{ complete: [] }>()
const { settings, prefersReducedMotion, hydrate } = useSiteSettings()
const leaving = ref(false)
const entered = ref(false)
/** Brief post-tap morph from entry mark → first dawn ring (no hard cut). */
const handingOff = ref(false)
const reducedMotion = ref(false)
const ident = ref<HTMLAudioElement | null>(null)
const beatCanvas = ref<HTMLCanvasElement | null>(null)
const rainCanvas = ref<HTMLCanvasElement | null>(null)
const handCursor = ref<HTMLElement | null>(null)
/** One-shot animated hand that clicks the entry mark, then fades. */
const handPlaying = ref(false)
const handDone = ref(false)
const rainActive = ref(false)
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
let handoffTimer: ReturnType<typeof setTimeout> | undefined
let completed = false
let beatRaf = 0
let beatCursor = 0
let rainRaf = 0
let handTimer: ReturnType<typeof setTimeout> | undefined
let resizeObs: ResizeObserver | undefined
let rainResizeObs: ResizeObserver | undefined

interface RainCol {
  x: number
  y: number
  speed: number
  chars: string[]
  opacity: number
}

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
 * cold open → draw-on ripples 0–3 → enter / trainer 4–5 → wordmark complete
 * → beginGrow (stop living-middle) → quote ~8 may still fire once during grow
 * → leave only on audio ended / skip / safety (no timed leave).
 * Beats 6–7 and 9–17 are idle; settle slots unused once grow owns the outro.
 */
const REVEAL_LAST_BEAT = 8
const BEAT_CHOREO: ChoreoStep[] = [
  /* 0  0.511 */ { kind: 'ring-in', rings: [0] },
  /* 1  1.091 */ { kind: 'ring-in', rings: [1] },
  /* 2  1.370 */ { kind: 'ring-in', rings: [2] },
  /* 3  1.974 */ { kind: 'ring-in', rings: [3] },
  /* 4  2.252 */ { kind: 'enter-in' },
  /* 5  2.833 */ { kind: 'trainer-in', rings: [0, 1, 2, 3], strong: true, reaction: 'stroke' },
  /* 6–7 idle after wordmark — no beat reactions */
  /* 6  3.135 */ { kind: 'pulse' },
  /* 7  3.413 */ { kind: 'pulse' },
  /* 8  3.715 */ { kind: 'quote-in', word: true, reaction: 'word' },
  /* 9–17 idle — grow fills rest of track */
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
  () =>
    soundOn.value &&
    entered.value &&
    !reducedMotion.value &&
    !leaving.value &&
    !growing.value
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
/** Soft continuous breathe after reveal — stopped once grow starts. */
const breathing = ref(false)
/** Post-reveal slow parallax grow (wordmark + rings at different rates). */
const growing = ref(false)
/** Optional soft seed after first ring — never on cold open. */
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

const sizeRainCanvas = () => {
  const canvas = rainCanvas.value
  if (!canvas) return
  const root = canvas.closest('.preloader') ?? canvas.parentElement
  if (!root) return
  const rect = root.getBoundingClientRect()
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

const buildRainCols = (w: number, h: number): RainCol[] => {
  const cols: RainCol[] = []
  // Wide columns for huge readable glyphs — sparse so brand stays primary.
  const gap = Math.max(56, Math.min(96, Math.floor(w / 10)))
  let phraseIdx = Math.floor(Math.random() * SANSKRIT_RAIN.length)
  for (let x = gap * 0.45; x < w; x += gap) {
    const phrase = SANSKRIT_RAIN[phraseIdx % SANSKRIT_RAIN.length]!
    phraseIdx += 1
    // Split into glyph-ish chunks (space-aware) for a column stream
    const raw = phrase.replace(/\s+/g, '·').split('')
    const chars = [...raw, ...'·'.repeat(3)]
    cols.push({
      x,
      y: Math.random() * -h * 0.6,
      speed: 10 + Math.random() * 22,
      chars,
      opacity: 0.04 + Math.random() * 0.05
    })
  }
  return cols
}

let rainCols: RainCol[] = []
let rainLast = 0

const stopRain = () => {
  if (rainRaf) {
    cancelAnimationFrame(rainRaf)
    rainRaf = 0
  }
  rainActive.value = false
  rainCols = []
  const canvas = rainCanvas.value
  const ctx = canvas?.getContext('2d')
  if (canvas && ctx) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
  }
}

const tickRain = (now: number) => {
  if (!rainActive.value || leaving.value || reducedMotion.value) {
    rainRaf = 0
    return
  }
  const canvas = rainCanvas.value
  if (!canvas) {
    rainRaf = 0
    return
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = canvas.width / dpr
  const h = canvas.height / dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    rainRaf = 0
    return
  }
  if (!rainCols.length) rainCols = buildRainCols(w, h)
  const dt = rainLast ? Math.min(0.05, (now - rainLast) / 1000) : 0.016
  rainLast = now

  // Soft fade trail — keep brand readable over huge glyphs
  ctx.fillStyle = 'rgba(255, 250, 240, 0.22)'
  ctx.fillRect(0, 0, w, h)

  // Huge readable type, very low contrast so rings/wordmark stay primary
  const fontPx = Math.max(28, Math.min(52, Math.floor(w / 18)))
  const step = Math.round(fontPx * 1.15)
  ctx.font = `500 ${fontPx}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  for (const col of rainCols) {
    col.y += col.speed * dt * 10
    for (let i = 0; i < col.chars.length; i++) {
      const ch = col.chars[i]!
      const yy = col.y + i * step
      if (yy < -fontPx || yy > h + fontPx) continue
      const head = i === col.chars.length - 1
      const a = head
        ? col.opacity * 1.35
        : col.opacity * (0.4 + (i / col.chars.length) * 0.55)
      ctx.fillStyle = head
        ? `rgba(92, 68, 0, ${Math.min(0.14, a)})`
        : `rgba(21, 18, 15, ${Math.min(0.09, a)})`
      ctx.fillText(ch, col.x, yy)
    }
    if (col.y - col.chars.length * step > h) {
      col.y = -Math.random() * h * 0.35 - col.chars.length * step
      col.speed = 10 + Math.random() * 22
      const phrase = SANSKRIT_RAIN[Math.floor(Math.random() * SANSKRIT_RAIN.length)]!
      col.chars = [...phrase.replace(/\s+/g, '·').split(''), ...'·'.repeat(2)]
      col.opacity = 0.04 + Math.random() * 0.05
    }
  }

  rainRaf = requestAnimationFrame(tickRain)
}

const startRain = () => {
  if (reducedMotion.value || rainActive.value) return
  rainActive.value = true
  rainLast = 0
  nextTick(() => {
    sizeRainCanvas()
    if (typeof ResizeObserver !== 'undefined' && rainCanvas.value) {
      rainResizeObs?.disconnect()
      rainResizeObs = new ResizeObserver(() => {
        sizeRainCanvas()
        const canvas = rainCanvas.value
        if (!canvas) return
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        rainCols = buildRainCols(canvas.width / dpr, canvas.height / dpr)
      })
      const root = rainCanvas.value.closest('.preloader') ?? rainCanvas.value.parentElement
      if (root) rainResizeObs.observe(root)
    }
    rainCols = []
    rainRaf = requestAnimationFrame(tickRain)
  })
}

const stopHand = () => {
  if (handTimer !== undefined) {
    window.clearTimeout(handTimer)
    handTimer = undefined
  }
  handPlaying.value = false
}

/** One-shot: hand approaches logo, clicks once, fades. User can still tap anytime. */
const playHandCue = () => {
  if (reducedMotion.value || entered.value || completed || handDone.value) return
  handPlaying.value = true
  // Total choreography ~2.4s then fade; mark done so it never loops.
  handTimer = window.setTimeout(() => {
    handPlaying.value = false
    handDone.value = true
    handTimer = undefined
  }, 2600)
}

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
  growing.value = false
  seedOn.value = false
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

/** Entry mark → first ring continuous handoff. */
const HANDOFF_MS = 560
/** CSS grow duration (ms) — matched to remaining music at grow start. */
const growMs = ref(5200)

const finishLeave = () => {
  if (leaving.value) return
  completed = true
  leaving.value = true
  breathing.value = false
  growing.value = false
  stopRain()
  stopHand()
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
  removeTimer = window.setTimeout(() => emit('complete'), 320)
}

/**
 * Slow parallax grow until the track ends / skip.
 * Does NOT schedule leave — finishLeave only on ended / skip / safety.
 */
const beginGrow = () => {
  if (leaving.value || growing.value || completed) return
  breathing.value = false
  settling.value = true
  seedOn.value = false
  // Keep beat cursor/loop alive so quote-in can still fire once during grow.
  washes.length = 0

  if (reducedMotion.value) return

  const el = ident.value
  let remaining = MUSIC_DURATION_MS
  if (el) {
    const t = Number.isFinite(el.currentTime) ? el.currentTime : 0
    if (Number.isFinite(el.duration) && el.duration > 0) {
      remaining = Math.max(0, (el.duration - t) * 1000)
    } else {
      remaining = Math.max(0, MUSIC_DURATION_MS - t * 1000)
    }
  }
  // Keep a gentle floor so a late start still eases; leave still waits for ended/skip.
  growMs.value = Math.max(1200, Math.round(remaining))
  growing.value = true
}

/** Safety / sound-off / reduced: leave only — never a timed grow-then-exit. */
const finish = () => {
  finishLeave()
}

const onAudioEnded = () => {
  if (!entered.value || leaving.value) return
  clearFinishTimer()
  finishLeave()
}

const skip = () => {
  if (leaving.value || completed) return
  stopOpeningSound()
  clearFinishTimer()
  stopBeatLoop()
  stopHand()
  if (!entered.value) entered.value = true
  finishLeave()
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
    // Soft seed may appear only once the first ring has landed — never cold-open.
    if (ringsIn[0] && !seedOn.value) {
      seedOn.value = true
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
    // Soft confirmation pulse only on the assemble beat — then no more beat reactions.
    if (step.rings?.length) pulseRings(step, false)
    breathing.value = false
    // Wordmark complete → slow parallax grow until music ends (leave on ended/skip).
    if (wordEnterIn.value && !completed && !growing.value) {
      beginGrow()
    }
    return
  }
  if (step.kind === 'quote-in') {
    quoteIn.value = true
    // Soft kick only if grow has not started — avoid fighting parallax grow.
    if (step.word && !growing.value) kickWordmark()
    breathing.value = false
    wordShellEl.value?.classList.add('word--settled', 'word--assembled')
    // May fire once during grow; do not restart living-middle or schedule beginGrow.
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

  // After trainer lands, pulse slots stay idle (quote-in still allowed separately).
  if (step.kind === 'pulse') {
    if (wordTrainerIn.value || quoteIn.value || growing.value) return
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
  if (age < 0) return
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
  // Full preloader / viewport — exit ripples must not be cropped to the stage box.
  const root = canvas.closest('.preloader') ?? canvas.parentElement
  if (!root) return
  const rect = root.getBoundingClientRect()
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
  if (leaving.value || !beatDriven.value) {
    beatRaf = 0
    return
  }
  if (completed) {
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
        // Grow starts at trainer-in; quote-in may still fire once during grow.
        if (step) {
          if (growing.value) {
            if (step.kind === 'quote-in' && !quoteIn.value) {
              applyChoreo(step, now, w, h)
            }
          } else if (!(idx > REVEAL_LAST_BEAT)) {
            applyChoreo(step, now, w, h)
          }
        }
      }
      beatCursor += 1
    }
  }

  if (ctx && canvas && !growing.value) {
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

  // After grow + quote, no more choreography — stop the loop.
  if (growing.value && quoteIn.value) {
    washes.length = 0
    beatRaf = 0
    return
  }

  beatRaf = requestAnimationFrame(tickBeats)
}

const startBeatLoop = () => {
  stopBeatLoop()
  resetChoreo()
  if (!beatDriven.value) return
  nextTick(() => {
    sizeCanvas()
    if (typeof ResizeObserver !== 'undefined' && beatCanvas.value) {
      resizeObs?.disconnect()
      resizeObs = new ResizeObserver(() => sizeCanvas())
      const root = beatCanvas.value.closest('.preloader') ?? beatCanvas.value.parentElement
      if (root) resizeObs.observe(root)
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
  stopHand()
  handDone.value = true
  activeQuote.value = pickPreloaderQuote()
  playOpeningSound()
  // Continuous handoff: entry mark morphs into the first dawn-ring beat (no hard cut).
  handingOff.value = !reducedMotion.value
  entered.value = true
  // Sanskrit matrix rain — only after user enters (not on idle entry screen).
  if (!reducedMotion.value) startRain()
  if (handoffTimer !== undefined) window.clearTimeout(handoffTimer)
  if (handingOff.value) {
    handoffTimer = window.setTimeout(() => {
      handoffTimer = undefined
      handingOff.value = false
    }, HANDOFF_MS)
  }
  if (soundOn.value) {
    finishTimer = window.setTimeout(finish, MUSIC_SAFETY_MS)
    if (!reducedMotion.value) {
      startBeatLoop()
      // After resetChoreo: soft seed bridges morphing mark → first dawn ring (beat 0).
      if (handingOff.value) {
        seedOn.value = true
        seedSoft.value = true
      }
    } else revealStaticBrand()
  } else {
    // Short path: full wordmark via CSS; quote stays hidden.
    // Delay ring/word CSS start slightly so mark→ring morph can lead.
    seedOn.value = false
    const kickShort = () => {
      wordEnterIn.value = true
      wordTrainerIn.value = true
      for (let i = 0; i < 4; i++) ringsIn[i] = true
    }
    if (handingOff.value) window.setTimeout(kickShort, 220)
    else kickShort()
    finishTimer = window.setTimeout(
      finish,
      reducedMotion.value ? SHORT_REDUCED_MS : SHORT_NORMAL_MS + (handingOff.value ? 220 : 0)
    )
  }
}

onMounted(() => {
  hydrate()
  reducedMotion.value = prefersReducedMotion()
  if (!reducedMotion.value) {
    // Matrix rain starts only after tap/enter (see startExperience) — not on idle.
    // Brief beat so the logo is seen, then the hand cue plays once.
    handTimer = window.setTimeout(() => {
      handTimer = undefined
      playHandCue()
    }, 520)
  }
})

onBeforeUnmount(() => {
  clearFinishTimer()
  if (removeTimer) window.clearTimeout(removeTimer)
  if (handoffTimer !== undefined) window.clearTimeout(handoffTimer)
  stopBeatLoop()
  stopRain()
  stopHand()
  resizeObs?.disconnect()
  rainResizeObs?.disconnect()
  ident.value?.pause()
})
</script>

<template>
  <div
    class="preloader"
    :class="{
      'preloader--entered': entered,
      'preloader--handoff': handingOff,
      'preloader--leaving': leaving,
      'preloader--music': soundOn && entered,
      'preloader--beat': beatDriven,
      'preloader--breathe': breathing && !leaving && !growing,
      'preloader--settle': settling && !growing,
      'preloader--grow': growing && !leaving
    }"
    :style="growing ? { '--pl-grow-ms': growMs + 'ms' } : undefined"
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

    <!-- Sanskrit matrix rain (romanized) — post-tap only; huge+subtle under brand; off when reduce-motion. -->
    <canvas
      v-if="rainActive && !reducedMotion"
      ref="rainCanvas"
      class="preloader__rain"
      aria-hidden="true"
    />

    <button
      v-if="!entered || handingOff"
      type="button"
      class="preloader__entry"
      :class="{ 'entry--handoff': handingOff }"
      :aria-label="soundOn ? 'Enter Entertrainer with sound' : 'Enter Entertrainer'"
      :tabindex="handingOff ? -1 : 0"
      :aria-hidden="handingOff ? 'true' : undefined"
      @click="startExperience"
    >
      <span class="preloader__entry-mark" aria-hidden="true">
        <svg class="preloader__entry-brand" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r="94" fill="none" stroke="currentColor" stroke-width="18" />
          <circle cx="120" cy="120" r="62" fill="none" stroke="currentColor" stroke-width="18" />
          <circle cx="120" cy="120" r="30" fill="none" stroke="currentColor" stroke-width="18" />
          <text x="120" y="158" text-anchor="middle" class="preloader__entry-brand-e">e</text>
        </svg>
      </span>
    </button>

    <!-- One-shot hand cursor: approaches, clicks logo once, fades. No on-screen Tap label. -->
    <div
      v-if="handPlaying && !entered && !reducedMotion"
      ref="handCursor"
      class="preloader__hand"
      aria-hidden="true"
    >
      <svg class="preloader__hand-svg" viewBox="0 0 64 64" fill="none">
        <path
          class="preloader__hand-shape"
          d="M28 6c1.8 0 3.2 1.4 3.2 3.2V28l.4-.2c.7-1.2 2.1-1.7 3.4-1.3 1.5.4 2.3 1.9 1.9 3.3l-.3 1.1c.7-1 2-1.4 3.2-1 1.5.5 2.3 2 1.8 3.4l-.6 1.8c.6-.7 1.6-1 2.6-.7 1.4.4 2.2 1.8 1.8 3.2L42.2 48c-1.4 4.6-5.6 7.8-10.4 7.8h-3.2c-5.8 0-10.8-3.8-12.4-9.3L12.8 34.2c-.8-2.4.6-5 3-5.7 1.7-.5 3.5.2 4.5 1.6l2.5 3.6V9.2C22.8 7.4 24.2 6 26 6h2z"
          fill="#fffaf0"
          stroke="#15120f"
          stroke-width="2.4"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <!-- Full-viewport beat canvas (washes + exit ripples must not crop to stage). -->
    <canvas
      v-if="showBeatCanvas"
      ref="beatCanvas"
      class="preloader__beat-canvas"
      aria-hidden="true"
    />

    <div v-if="entered" class="preloader__stage" aria-hidden="true">
      <!-- Cold-open yellow seed / glow at locked center. -->
      <div
        class="preloader__seed"
        :class="{
          'seed--on': seedOn && beatDriven && seedSoft,
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
      :class="{ 'preloader__skip--on': true }"
      aria-label="Skip intro"
      @click.stop="skip"
    >
      Skip intro
    </button>

    <span class="sr-only" role="status" aria-live="polite">{{ entered ? 'Preparing Entertrainer' : 'Click the logo to enter Entertrainer' }}</span>
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
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 14rem;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: #15120f;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.preloader__entry-mark {
  position: relative;
  display: grid;
  place-items: center;
  width: 56rem;
  height: 56rem;
  border-radius: 50%;
  border: 0;
  background: transparent;
  color: #ffd43b;
  line-height: 1;
  opacity: .9;
  transition:
    opacity 180ms ease,
    border-color 180ms ease,
    border-width 180ms ease,
    width 180ms ease,
    height 180ms ease,
    transform 180ms ease,
    background 180ms ease,
    box-shadow 180ms ease;
}
.preloader__entry-brand {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: visible;
  color: #ffd43b;
  transition: opacity 200ms ease, transform 200ms ease;
}
.preloader__entry-brand-e {
  fill: #15120f;
  font-family: var(--font-ui), Arial, sans-serif;
  font-size: 144px;
  font-weight: 900;
  letter-spacing: -.1em;
}
.preloader__entry-mark-letter {
  position: relative;
  z-index: 1;
  transition: opacity 200ms ease, transform 200ms ease, color 200ms ease;
}
.preloader__entry:hover .preloader__entry-mark,
.preloader__entry:focus-visible .preloader__entry-mark {
  opacity: .85;
  border-color: rgb(21 18 15 / .35);
}

.preloader__rain {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  /* Huge glyphs drawn with very low alpha — keep overall veil soft. */
  opacity: .55;
  mix-blend-mode: multiply;
}
.preloader--leaving .preloader__rain { opacity: 0; transition: opacity 280ms ease; }

.preloader__hand {
  position: absolute;
  z-index: 4;
  left: 50%;
  top: 50%;
  width: 56rem;
  height: 56rem;
  margin: 0;
  pointer-events: none;
  transform: translate(72rem, 92rem) rotate(-18deg);
  animation: pl-hand-approach 2.4s cubic-bezier(.22, 1, .36, 1) both;
}
.preloader__hand-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2rem 0 rgb(21 18 15 / .18));
  transform-origin: 30% 20%;
  animation: pl-hand-click 2.4s cubic-bezier(.22, 1, .36, 1) both;
}
@keyframes pl-hand-approach {
  0% { opacity: 0; transform: translate(110rem, 130rem) rotate(-28deg); }
  18% { opacity: 1; }
  55% { opacity: 1; transform: translate(18rem, 22rem) rotate(-12deg); }
  62% { opacity: 1; transform: translate(14rem, 16rem) rotate(-10deg); }
  70% { opacity: 1; transform: translate(18rem, 22rem) rotate(-12deg); }
  88% { opacity: 1; transform: translate(22rem, 28rem) rotate(-14deg); }
  100% { opacity: 0; transform: translate(28rem, 40rem) rotate(-16deg); }
}
@keyframes pl-hand-click {
  0%, 54% { transform: scale(1); }
  60% { transform: scale(.86); }
  68% { transform: scale(1); }
  100% { transform: scale(1); }
}
.preloader__entry:focus-visible {
  outline: none;
}
.preloader__entry:focus-visible .preloader__entry-mark {
  outline: 2rem solid #15120f;
  outline-offset: 6rem;
}
.preloader__entry:active .preloader__entry-mark { opacity: 1; }

/*
 * Tap handoff: brand mark clocks into the first dawn-ring beat.
 * Mark expands + fades; CTA fades; stage crossfades under — no decorative entry rings.
 * Timed to meet beat 0 (~0.51s) so it feels one continuous sequence.
 */
.preloader__entry.entry--handoff {
  pointer-events: none;
  z-index: 3;
}
.preloader__entry.entry--handoff .preloader__entry-mark {
  width: min(22vw, 168rem);
  height: min(22vw, 168rem);
  border-width: 4.5px;
  border-color: #ffd43b;
  background: radial-gradient(circle at 50% 50%,
    rgb(255 212 59 / .22) 0%,
    rgb(255 212 59 / .06) 42%,
    transparent 68%);
  box-shadow: 0 0 0 1px rgb(255 212 59 / .12);
  opacity: 0;
  transform: scale(1.08);
  outline: none !important;
  transition:
    width 520ms cubic-bezier(.22, 1, .36, 1),
    height 520ms cubic-bezier(.22, 1, .36, 1),
    border-width 420ms cubic-bezier(.22, 1, .36, 1),
    border-color 280ms ease,
    background 360ms ease,
    box-shadow 360ms ease,
    opacity 560ms cubic-bezier(.22, 1, .36, 1) 40ms,
    transform 520ms cubic-bezier(.22, 1, .36, 1);
}
.preloader__entry.entry--handoff .preloader__entry-brand,
.preloader__entry.entry--handoff .preloader__entry-mark-letter {
  opacity: 0;
  transform: scale(.72);
  transition: opacity 220ms ease, transform 320ms cubic-bezier(.22, 1, .36, 1);
}

.preloader__stage {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: min(860rem, 92vw);
  aspect-ratio: 1.52;
  isolation: isolate;
  overflow: visible;
}
/* During handoff, stage rises under the morphing mark (shared center). */
.preloader--handoff .preloader__stage {
  animation: pl-stage-handoff-in 480ms cubic-bezier(.22, 1, .36, 1) both;
}
@keyframes pl-stage-handoff-in {
  0% { opacity: 0; transform: scale(.96); }
  40% { opacity: .55; }
  100% { opacity: 1; transform: scale(1); }
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
.preloader__seed.seed--on.seed--soft {
  opacity: .22;
  transform: scale(.7);
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
  opacity: .28;
  transition: opacity 220ms ease, background 220ms ease, border-color 220ms ease;
}
.preloader__skip--on { opacity: .34; }
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

/* Post-reveal: slow parallax grow until music ends — wordmark FG, rings BG; no fade-out. */
.preloader--grow .preloader__seed { opacity: 0 !important; animation: none !important; }
.preloader--grow .preloader__rings {
  z-index: 1;
  transform-origin: 50% 50%;
  animation: pl-grow-rings var(--pl-grow-ms, 5200ms) cubic-bezier(.16, 1, .3, 1) both;
}
.preloader--grow .preloader__brand-shell {
  z-index: 2;
  transform-origin: 50% 50%;
  animation: pl-grow-word var(--pl-grow-ms, 5200ms) cubic-bezier(.16, 1, .3, 1) both;
}
.preloader--grow .preloader__quote {
  animation: pl-grow-quote-fade 1100ms ease both;
}
@keyframes pl-grow-rings {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.14); opacity: .9; }
}
@keyframes pl-grow-word {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.24); opacity: 1; }
}
@keyframes pl-grow-quote-fade {
  to { opacity: 0; transform: translateX(-50%) translateY(8rem); }
}

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
  .preloader__rain,
  .preloader__hand { display: none !important; }
  .preloader__entry.entry--handoff .preloader__entry-mark,
  .preloader__entry.entry--handoff .preloader__entry-mark-letter { transition: none !important; }
  .preloader *,
  .preloader *::before,
  .preloader *::after { animation: none !important; }
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
:global(html[data-reduce-motion="on"]) .preloader__rain,
:global(html[data-reduce-motion="on"]) .preloader__hand { display: none !important; }
:global(html[data-reduce-motion="on"]) .preloader *,
:global(html[data-reduce-motion="on"]) .preloader *::before,
:global(html[data-reduce-motion="on"]) .preloader *::after { animation: none !important; }
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
