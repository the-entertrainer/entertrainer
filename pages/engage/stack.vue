<script setup lang="ts">
definePageMeta({ layout: false })
/**
 * STACK — portrait arcade for Engage.
 * Tap to drop. Only the overlap stays.
 * Soft faux-3D slabs, paper/ink/yellow DNA, light/dark via useThemeStore.
 * Craft: hit one-tap stacker feel — no hatching, no confetti spam.
 */
import { useThemeStore } from '~/stores/theme'

useSeoMeta({
  title: 'Stack · Engage',
  description: 'Tap to drop. Only the overlap stays. A stacking arcade on Entertrainer.',
  ogUrl: 'https://entertrainer.in/engage/stack',
})

type Phase = 'title' | 'playing' | 'over'
type Block = { x: number; y: number; w: number; h: number; ink: boolean }
type Chip = {
  x: number; y: number; vx: number; vy: number
  life: number; w: number; rot: number; vr: number; ink: boolean
}
type Palette = {
  paper: string
  paperDeep: string
  ink: string
  yellow: string
  cream: string
  guide: string
  chip: string
}

const BEST_KEY = 'entertrainer-stack-best'

const PALETTE_LIGHT: Palette = {
  paper: '#FBF8EF',
  paperDeep: '#F0EAD8',
  ink: '#161618',
  yellow: '#FFD43B',
  cream: '#F5EFD9',
  guide: 'rgba(22,22,24,0.16)',
  chip: '#161618',
}

const PALETTE_DARK: Palette = {
  paper: '#121214',
  paperDeep: '#0A0A0C',
  ink: '#EDE6D6',
  yellow: '#E8C547',
  cream: '#2A2824',
  guide: 'rgba(237,230,214,0.20)',
  chip: '#EDE6D6',
}

const theme = useThemeStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const phase = ref<Phase>('title')
const score = ref(0)
const best = ref(0)
const lastPerfect = ref(false)
const newBest = ref(false)

/** Last perfect drop center — for flash ring art. */
let flashCx = 0
let flashCy = 0
let flashR0 = 40
/** Micro scale punch on placed block after perfect. */
let perfectScale = 0

let raf = 0
let W = 390
let H = 780
let dpr = 1
let blocks: Block[] = []
let cur: Block | null = null
let dir = 1
let speed = 0
let camY = 0
let camTarget = 0
let shake = 0
let flash = 0
let chips: Chip[] = []
let audioCtx: AudioContext | null = null
let running = false
const BLOCK_H = 28
const START_W = 220
const PERFECT_PX = 5
/** Faux-3D face depth in CSS px. */
const FACE = 5

function activePalette(): Palette {
  return theme.isDark ? PALETTE_DARK : PALETTE_LIGHT
}

onMounted(() => {
  // Bare layout still rides app.vue theme.init; re-init is idempotent for session key.
  theme.init()
  best.value = Number(localStorage.getItem(BEST_KEY) || 0) || 0
  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('orientationchange', resize)
  startTitleIdle()
})

onBeforeUnmount(() => {
  running = false
  titleIdle = false
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
  window.removeEventListener('orientationchange', resize)
  stopWatch?.()
})

/** Redraw when site theme flips (masthead or in-game toggle). */
const stopWatch = watch(
  () => theme.theme,
  () => {
    if (phase.value === 'title' && titleIdle) drawIdle(titleT)
    else draw()
  },
)

let titleIdle = false
let titleT = 0
function startTitleIdle() {
  titleIdle = true
  titleT = 0
  cancelAnimationFrame(raf)
  const tick = (ts: number) => {
    if (!titleIdle || phase.value !== 'title') return
    titleT = ts
    drawIdle(ts)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

function resize() {
  const c = canvasRef.value
  if (!c) return
  const parent = c.parentElement
  const cssW = parent?.clientWidth || window.innerWidth
  const cssH = parent?.clientHeight || window.innerHeight
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  W = Math.max(280, Math.floor(cssW))
  H = Math.max(420, Math.floor(cssH))
  c.width = Math.floor(W * dpr)
  c.height = Math.floor(H * dpr)
  c.style.width = `${W}px`
  c.style.height = `${H}px`
  const ctx = c.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  if (!running) drawIdle()
}

function ensureAudio() {
  if (audioCtx) return audioCtx
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  audioCtx = new AC()
  return audioCtx
}

function tone(freq: number, dur = 0.06, type: OscillatorType = 'square', gain = 0.04) {
  const ctx = ensureAudio()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume()
  const t0 = ctx.currentTime
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.connect(g)
  g.connect(ctx.destination)
  o.start(t0)
  o.stop(t0 + dur + 0.02)
}

/**
 * Web Audio micro-transient — “speaker haptic” for Safari iOS where vibrate is a no-op.
 * Very short click/thump/tick; shares AudioContext with game SFX.
 */
function speakerHaptic(kind: 'drop' | 'perfect' | 'miss' | 'over') {
  const ctx = ensureAudio()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume()
  const t0 = ctx.currentTime

  if (kind === 'drop') {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(180, t0)
    o.frequency.exponentialRampToValueAtTime(55, t0 + 0.045)
    g.gain.setValueAtTime(0.07, t0)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05)
    o.connect(g)
    g.connect(ctx.destination)
    o.start(t0)
    o.stop(t0 + 0.06)
    burstNoise(ctx, t0, 0.012, 0.045)
    return
  }

  if (kind === 'perfect') {
    burstNoise(ctx, t0, 0.01, 0.055)
    const o1 = ctx.createOscillator()
    const g1 = ctx.createGain()
    o1.type = 'triangle'
    o1.frequency.setValueAtTime(920, t0)
    g1.gain.setValueAtTime(0.05, t0)
    g1.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.04)
    o1.connect(g1)
    g1.connect(ctx.destination)
    o1.start(t0)
    o1.stop(t0 + 0.05)
    const o2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    o2.type = 'square'
    o2.frequency.setValueAtTime(620, t0 + 0.028)
    g2.gain.setValueAtTime(0.0001, t0)
    g2.gain.setValueAtTime(0.038, t0 + 0.028)
    g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08)
    o2.connect(g2)
    g2.connect(ctx.destination)
    o2.start(t0 + 0.028)
    o2.stop(t0 + 0.09)
    return
  }

  if (kind === 'miss') {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(90, t0)
    o.frequency.exponentialRampToValueAtTime(38, t0 + 0.12)
    g.gain.setValueAtTime(0.08, t0)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14)
    o.connect(g)
    g.connect(ctx.destination)
    o.start(t0)
    o.stop(t0 + 0.15)
    burstNoise(ctx, t0, 0.03, 0.035)
    return
  }

  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(70, t0)
  o.frequency.exponentialRampToValueAtTime(28, t0 + 0.18)
  g.gain.setValueAtTime(0.09, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2)
  o.connect(g)
  g.connect(ctx.destination)
  o.start(t0)
  o.stop(t0 + 0.22)
  burstNoise(ctx, t0, 0.04, 0.03)
}

function burstNoise(ctx: AudioContext, t0: number, dur: number, gain: number) {
  const n = Math.max(1, Math.floor(ctx.sampleRate * dur))
  const buf = ctx.createBuffer(1, n, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < n; i++) {
    const env = 1 - i / n
    data[i] = (Math.random() * 2 - 1) * env * env
  }
  const src = ctx.createBufferSource()
  src.buffer = buf
  const g = ctx.createGain()
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.01)
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 600
  src.connect(hp)
  hp.connect(g)
  g.connect(ctx.destination)
  src.start(t0)
  src.stop(t0 + dur + 0.02)
}

/**
 * Best-effort haptic: vibrate on Android; always fire speaker transient for iOS Safari.
 */
function haptic(kind: 'drop' | 'perfect' | 'miss' | 'over' | 'start', vibratePattern?: number | number[]) {
  speakerHaptic(kind === 'start' ? 'drop' : kind)
  if (vibratePattern !== undefined) {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(vibratePattern)
      }
    } catch { /* ignore */ }
  }
}

/** Clamp 0–255 channel. */
function clampByte(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)))
}

/** Parse #RRGGBB → [r,g,b]. */
function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function rgbStr(r: number, g: number, b: number) {
  return `rgb(${clampByte(r)},${clampByte(g)},${clampByte(b)})`
}

/**
 * Subtle height hue walk — ink/cream shift luminance as stack grows.
 * Keep readable; never leave paper/ink/yellow family.
 */
function heightShift(hex: string, index: number, towardLight: boolean): string {
  const [r, g, b] = hexRgb(hex)
  const t = Math.min(1, index / 28)
  const amt = t * 14
  if (towardLight) {
    return rgbStr(r + amt, g + amt * 0.9, b + amt * 0.7)
  }
  return rgbStr(r - amt * 0.7, g - amt * 0.75, b - amt * 0.85)
}

function lighten(hex: string, amt: number): string {
  const [r, g, b] = hexRgb(hex)
  return rgbStr(r + amt, g + amt, b + amt)
}

function darken(hex: string, amt: number): string {
  const [r, g, b] = hexRgb(hex)
  return rgbStr(r - amt, g - amt, b - amt)
}

/**
 * Soft faux-3D slab: front face + top + left + right sides, fixed top-left light,
 * soft contact shadow. Flat fills only — no hatch/stipple.
 */
function drawSlab(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  opts: { scale?: number; shadow?: boolean } = {},
) {
  if (w < 1 || h < 1) return
  const sc = opts.scale ?? 1
  const cx = x + w / 2
  const cy = y + h / 2
  const ww = w * sc
  const hh = h * sc
  const xx = cx - ww / 2
  const yy = cy - hh / 2
  const d = Math.min(FACE, Math.max(2, Math.floor(Math.min(ww, hh) * 0.22)))

  if (opts.shadow !== false && ww > 4) {
    ctx.fillStyle = theme.isDark ? 'rgba(0,0,0,0.38)' : 'rgba(22,22,24,0.14)'
    ctx.beginPath()
    ctx.ellipse(cx + 1, yy + hh + d * 0.55, ww * 0.48, Math.max(2.5, d * 0.55), 0, 0, Math.PI * 2)
    ctx.fill()
  }

  const topC = lighten(fill, theme.isDark ? 28 : 36)
  const leftC = lighten(fill, theme.isDark ? 12 : 16)
  const rightC = darken(fill, theme.isDark ? 22 : 28)
  const frontC = fill
  const bottomEdge = darken(fill, theme.isDark ? 32 : 40)

  // Top face (parallelogram toward top-left light)
  ctx.fillStyle = topC
  ctx.beginPath()
  ctx.moveTo(xx, yy)
  ctx.lineTo(xx + d, yy - d)
  ctx.lineTo(xx + ww + d, yy - d)
  ctx.lineTo(xx + ww, yy)
  ctx.closePath()
  ctx.fill()

  // Left face
  if (d >= 2) {
    ctx.fillStyle = leftC
    ctx.beginPath()
    ctx.moveTo(xx, yy)
    ctx.lineTo(xx + d, yy - d)
    ctx.lineTo(xx + d, yy + hh - d)
    ctx.lineTo(xx, yy + hh)
    ctx.closePath()
    ctx.fill()
  }

  // Right face (thin)
  ctx.fillStyle = rightC
  ctx.beginPath()
  ctx.moveTo(xx + ww, yy)
  ctx.lineTo(xx + ww + d, yy - d)
  ctx.lineTo(xx + ww + d, yy + hh - d)
  ctx.lineTo(xx + ww, yy + hh)
  ctx.closePath()
  ctx.fill()

  // Front face
  ctx.fillStyle = frontC
  ctx.fillRect(xx, yy, ww, hh)

  // Soft bottom shade on front
  if (hh > 4 && ww > 2) {
    ctx.fillStyle = theme.isDark ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.10)'
    ctx.fillRect(xx, yy + hh - 2, ww, 2)
    // Hairline top of front (lip into top face)
    ctx.fillStyle = theme.isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.28)'
    ctx.fillRect(xx, yy, ww, 1)
  }

  // Bottom edge accent
  ctx.fillStyle = bottomEdge
  ctx.fillRect(xx, yy + hh - 1, ww, 1)
}

function blockFill(b: Block, index: number, pal: Palette): string {
  if (b.ink) {
    return heightShift(pal.ink, index, theme.isDark)
  }
  // Warm cream-yellow face — yellow reserved more for perfect/CTA; blocks lean cream
  const base = theme.isDark ? '#C9B56A' : '#E8D078'
  return heightShift(base, index, !theme.isDark)
}

function startGame() {
  titleIdle = false
  ensureAudio()
  phase.value = 'playing'
  score.value = 0
  lastPerfect.value = false
  newBest.value = false
  blocks = []
  chips = []
  shake = 0
  flash = 0
  perfectScale = 0
  camY = 0
  camTarget = 0
  speed = Math.max(W * 0.55, 220)
  dir = 1

  const baseW = Math.min(START_W, W * 0.62)
  const baseX = (W - baseW) / 2
  const baseY = H * 0.72
  blocks.push({ x: baseX, y: baseY, w: baseW, h: BLOCK_H, ink: true })
  spawnMoving()
  running = true
  lastTs = 0
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(loop)
  haptic('start', 12)
  tone(180, 0.05, 'triangle', 0.03)
}

function spawnMoving() {
  const top = blocks[blocks.length - 1]
  const y = top.y - BLOCK_H
  cur = {
    x: dir > 0 ? -top.w : W,
    y,
    w: top.w,
    h: BLOCK_H,
    ink: blocks.length % 2 === 0,
  }
}

function drop() {
  if (phase.value !== 'playing' || !cur) return
  const top = blocks[blocks.length - 1]
  const left = Math.max(cur.x, top.x)
  const right = Math.min(cur.x + cur.w, top.x + top.w)
  const overlap = right - left

  if (overlap <= 2) {
    spawnChips(cur.x, cur.y, cur.w, cur.ink)
    cur = null
    endGame()
    return
  }

  const perfect = Math.abs(cur.x - top.x) <= PERFECT_PX && Math.abs(cur.w - top.w) <= PERFECT_PX
  let placed: Block

  if (perfect) {
    placed = { x: top.x, y: cur.y, w: top.w, h: BLOCK_H, ink: !top.ink }
    lastPerfect.value = true
    window.setTimeout(() => { lastPerfect.value = false }, 480)
    flash = 1
    perfectScale = 1
    flashCx = placed.x + placed.w / 2
    flashCy = placed.y + placed.h / 2
    flashR0 = Math.max(28, placed.w * 0.45)
    shake = 8
    score.value += 1
    haptic('perfect', [8, 30, 16])
    tone(520, 0.07, 'square', 0.045)
    tone(780, 0.09, 'triangle', 0.03)
  } else {
    lastPerfect.value = false
    const trimmedLeft = cur.x < top.x
    const fallW = cur.w - overlap
    const fallX = trimmedLeft ? cur.x : right
    spawnChips(fallX, cur.y, Math.max(fallW, 4), cur.ink)
    placed = { x: left, y: cur.y, w: overlap, h: BLOCK_H, ink: !top.ink }
    shake = 6
    score.value += 1
    haptic('drop', 18)
    tone(140, 0.08, 'sawtooth', 0.035)
  }

  blocks.push(placed)
  cur = null

  const stackTop = placed.y
  const desired = H * 0.38
  if (stackTop < desired) camTarget = desired - stackTop

  speed = Math.min(speed + 8 + score.value * 0.35, W * 1.35)

  if (placed.w < 18) {
    endGame()
    return
  }

  dir *= -1
  spawnMoving()
}

function spawnChips(x: number, y: number, w: number, ink: boolean) {
  const n = Math.max(3, Math.min(10, Math.floor(w / 10)))
  for (let i = 0; i < n; i++) {
    chips.push({
      x: x + (w * (i + 0.5)) / n,
      y: y + BLOCK_H / 2,
      vx: (Math.random() - 0.5) * 380,
      vy: -80 - Math.random() * 220,
      life: 0.55 + Math.random() * 0.35,
      w: Math.max(6, w / n - 2),
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 8,
      ink,
    })
  }
}

function endGame() {
  phase.value = 'over'
  cur = null
  running = false
  const beat = score.value > best.value
  newBest.value = beat
  const settleUntil = performance.now() + 700
  const settle = (ts: number) => {
    const dt = Math.min(0.033, (ts - (lastTs || ts)) / 1000)
    lastTs = ts
    for (const c of chips) {
      c.vy += 1400 * dt
      c.x += c.vx * dt
      c.y += c.vy * dt
      c.rot += c.vr * dt
      c.life -= dt
    }
    chips = chips.filter(c => c.life > 0)
    if (shake > 0) shake = Math.max(0, shake - dt * 40)
    if (perfectScale > 0) perfectScale = Math.max(0, perfectScale - dt * 4)
    draw()
    if (performance.now() < settleUntil && chips.length) {
      raf = requestAnimationFrame(settle)
      return
    }
    cancelAnimationFrame(raf)
    draw()
  }
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(settle)
  if (beat) {
    best.value = score.value
    localStorage.setItem(BEST_KEY, String(best.value))
    haptic('perfect', [20, 40, 20, 40, 40])
    tone(660, 0.12, 'square', 0.04)
  } else {
    haptic('over', [30, 40, 50])
    tone(90, 0.18, 'sawtooth', 0.04)
  }
}

let lastTs = 0
function loop(ts: number) {
  if (!running) {
    draw()
    return
  }
  const dt = Math.min(0.033, (ts - (lastTs || ts)) / 1000)
  lastTs = ts

  if (cur) {
    cur.x += dir * speed * dt
    if (dir > 0 && cur.x + cur.w > W + cur.w * 0.15) dir = -1
    if (dir < 0 && cur.x < -cur.w * 0.15) dir = 1
  }

  // Smoother camera lerp (was dt*6)
  camY += (camTarget - camY) * Math.min(1, dt * 4.2)
  if (shake > 0) shake = Math.max(0, shake - dt * 40)
  if (flash > 0) flash = Math.max(0, flash - dt * 3.4)
  if (perfectScale > 0) perfectScale = Math.max(0, perfectScale - dt * 4.5)

  for (const c of chips) {
    c.vy += 1400 * dt
    c.x += c.vx * dt
    c.y += c.vy * dt
    c.rot += c.vr * dt
    c.life -= dt
  }
  chips = chips.filter(c => c.life > 0)

  draw()
  raf = requestAnimationFrame(loop)
}

function drawIdle(ts = 0) {
  const c = canvasRef.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  const pal = activePalette()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  paintFrame(ctx, pal, 0)

  const reduce = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const drift = reduce ? 0 : Math.sin(ts / 1500) * 4
  const breath = reduce ? 1 : 1 + Math.sin(ts / 1700) * 0.01
  const bw = Math.min(200, W * 0.5) * breath
  let by = H * 0.64 + drift
  const layers = [
    { w: bw, ink: true },
    { w: bw * 0.86, ink: false },
    { w: bw * 0.7, ink: true },
    { w: bw * 0.52, ink: false },
  ]
  layers.forEach((L, i) => {
    const x = (W - L.w) / 2
    const fill = blockFill(
      { x, y: by, w: L.w, h: BLOCK_H, ink: L.ink },
      i,
      pal,
    )
    drawSlab(ctx, x, by, L.w, BLOCK_H - 2, fill)
    by -= BLOCK_H - 2
  })
}

function draw() {
  const c = canvasRef.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  const pal = activePalette()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  paintFrame(ctx, pal, camY)

  const sx = shake ? (Math.random() - 0.5) * shake : 0
  const sy = shake ? (Math.random() - 0.5) * shake : 0
  ctx.save()
  ctx.translate(sx, sy + camY)

  // Quiet ground line under base
  if (blocks.length) {
    const base = blocks[0]
    ctx.strokeStyle = theme.isDark
      ? 'rgba(237,230,214,0.18)'
      : 'rgba(22,22,24,0.18)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(28, base.y + BLOCK_H + 12)
    ctx.lineTo(W - 28, base.y + BLOCK_H + 12)
    ctx.stroke()
  }

  blocks.forEach((b, i) => {
    const isTop = i === blocks.length - 1
    const sc = isTop && perfectScale > 0
      ? 1 + 0.06 * Math.sin(perfectScale * Math.PI)
      : 1
    drawSlab(ctx, b.x, b.y, b.w, b.h - 1, blockFill(b, i, pal), { scale: sc })
  })

  if (cur) {
    const top = blocks[blocks.length - 1]
    // Soft contact ghost / guide on stack top
    ctx.fillStyle = pal.guide
    ctx.fillRect(top.x, cur.y, top.w, cur.h - 1)
    ctx.strokeStyle = theme.isDark
      ? 'rgba(237,230,214,0.28)'
      : 'rgba(22,22,24,0.22)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 5])
    ctx.strokeRect(top.x + 0.5, cur.y + 0.5, top.w - 1, cur.h - 2)
    ctx.setLineDash([])

    const idx = blocks.length
    drawSlab(ctx, cur.x, cur.y, cur.w, cur.h - 1, blockFill(cur, idx, pal), { shadow: true })
  }

  // Miss chips with slight spin
  for (const ch of chips) {
    ctx.save()
    ctx.globalAlpha = Math.max(0, Math.min(1, ch.life * 1.5))
    ctx.translate(ch.x, ch.y)
    ctx.rotate(ch.rot)
    const fill = ch.ink ? pal.ink : (theme.isDark ? '#C9B56A' : '#E8D078')
    ctx.fillStyle = fill
    ctx.fillRect(-ch.w / 2, -5, ch.w, 10)
    ctx.restore()
  }
  ctx.globalAlpha = 1

  // Perfect: cream halo + thin ring (no confetti)
  if (flash > 0) {
    const r = flashR0 + (1 - flash) * 48
    // Soft cream halo
    const grd = ctx.createRadialGradient(flashCx, flashCy, r * 0.15, flashCx, flashCy, r * 1.15)
    const creamA = theme.isDark ? '232,197,71' : '255,248,220'
    grd.addColorStop(0, `rgba(${creamA},${0.28 * flash})`)
    grd.addColorStop(0.55, `rgba(${creamA},${0.10 * flash})`)
    grd.addColorStop(1, `rgba(${creamA},0)`)
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.arc(flashCx, flashCy, r * 1.15, 0, Math.PI * 2)
    ctx.fill()

    // Thin yellow ring
    ctx.strokeStyle = pal.yellow
    ctx.globalAlpha = 0.7 * flash
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(flashCx, flashCy, r, 0, Math.PI * 2)
    ctx.stroke()
    // Inner cream hairline
    ctx.strokeStyle = theme.isDark ? pal.cream : '#FFF8E7'
    ctx.globalAlpha = 0.45 * flash
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(flashCx, flashCy, r * 0.78, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  ctx.restore()

  // Screen cream/yellow bloom — restrained
  if (flash > 0) {
    const a = 0.12 * flash
    ctx.fillStyle = theme.isDark
      ? `rgba(232,197,71,${a})`
      : `rgba(255,248,220,${a})`
    ctx.fillRect(0, 0, W, H)
  }
}

/**
 * Quiet vertical paper gradient. Optional micro parallax from camera.
 * Height walk: as stack grows, deep end of gradient shifts slightly with blocks.
 */
function paintFrame(ctx: CanvasRenderingContext2D, pal: Palette, cam: number) {
  const height = Math.max(0, blocks.length - 1)
  const t = Math.min(1, height / 28)
  const [pr, pg, pb] = hexRgb(pal.paper)
  const [dr, dg, db] = hexRgb(pal.paperDeep)
  // Walk both ends together — stay in cream↔charcoal family
  const shift = theme.isDark ? -t * 6 : t * 5
  const top = rgbStr(pr + shift, pg + shift * 0.9, pb + shift * 0.7)
  const bot = rgbStr(dr + shift * 0.6, dg + shift * 0.55, db + shift * 0.5)

  // Micro parallax: gradient origin drifts opposite to camera
  const gy = -cam * 0.04
  const g = ctx.createLinearGradient(0, gy, 0, H + gy)
  g.addColorStop(0, top)
  g.addColorStop(1, bot)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}

function onPointer() {
  if (phase.value === 'title') {
    startGame()
    return
  }
  if (phase.value === 'playing') {
    drop()
    return
  }
  if (phase.value === 'over') {
    startGame()
  }
}

function onThemeToggle(e: Event) {
  e.stopPropagation()
  theme.toggle()
}
</script>

<template>
  <div class="st" :data-phase="phase" :data-st-theme="theme.theme">
    <NuxtLink
      to="/engage"
      class="st__iconbtn st__back"
      aria-label="Back to Engage"
      @pointerdown.stop
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
    </NuxtLink>

    <button
      type="button"
      class="st__iconbtn st__theme"
      :aria-label="`Switch to ${theme.theme === 'dark' ? 'light' : 'dark'} mode`"
      @pointerdown.stop.prevent="onThemeToggle"
      @click.stop.prevent="onThemeToggle"
    >
      <EdSignalIcon :name="theme.theme === 'dark' ? 'sun' : 'moon'" />
    </button>

    <!-- Playing: huge score top-center, BEST quiet pill -->
    <div
      class="st__hud"
      :class="{ 'st__hud--on': phase === 'playing' }"
      aria-live="polite"
    >
      <strong class="st__score">{{ score }}</strong>
      <span class="st__bestpill">Best · {{ best }}</span>
    </div>

    <div class="st__stage" @pointerdown.prevent="onPointer">
      <canvas ref="canvasRef" class="st__canvas" role="img" aria-label="Stack game board" />
      <div class="st__vignette" aria-hidden="true" />

      <div v-if="phase === 'title'" class="st__overlay st__overlay--title">
        <p class="st__eyebrow st__anim" style="--i:0">Engage</p>
        <h1 class="st__title st__anim" style="--i:1">STACK</h1>
        <p class="st__lede st__anim" style="--i:2">Tap to drop. Only the overlap stays.</p>
        <button class="st__cta st__anim st__cta--pulse" style="--i:3" type="button">Play</button>
      </div>

      <div v-else-if="phase === 'over'" class="st__overlay st__overlay--over">
        <p v-if="newBest" class="st__badge st__anim" style="--i:0">Best</p>
        <h1 class="st__overscore st__anim st__score-pop" style="--i:1">{{ score }}</h1>
        <p class="st__lede st__anim" style="--i:2">Best · {{ best }}</p>
        <button class="st__cta st__anim" style="--i:3" type="button">Again</button>
      </div>

      <p v-else-if="lastPerfect" class="st__perfect" key="perfect">PERFECT</p>
    </div>
  </div>
</template>

<style scoped>
.st {
  --st-paper: #fbf8ef;
  --st-ink: #161618;
  --st-yellow: #ffd43b;
  --ink: var(--st-ink);
  --accent: var(--st-yellow);
  position: relative;
  width: 100%;
  height: 100svh;
  height: 100dvh;
  max-height: 100dvh;
  background: var(--st-paper);
  color: var(--st-ink);
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 280ms ease, color 280ms ease;
}
.st[data-st-theme='dark'] {
  --st-paper: #121214;
  --st-ink: #ede6d6;
  --st-yellow: #e8c547;
}

.st__stage {
  position: absolute;
  inset: 0;
  cursor: pointer;
  touch-action: none;
}

.st__canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/* Soft vignette — quieter than before; empty mid-field stays clear */
.st__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 80% 72% at 50% 42%,
    transparent 58%,
    color-mix(in srgb, var(--st-ink) 5%, transparent) 100%
  );
}
.st[data-st-theme='dark'] .st__vignette {
  background: radial-gradient(
    ellipse 80% 72% at 50% 42%,
    transparent 52%,
    color-mix(in srgb, #000 22%, transparent) 100%
  );
}

/* Circular ghost icon buttons — 44px hit targets */
.st__iconbtn {
  position: absolute;
  z-index: 6;
  top: max(10rem, env(safe-area-inset-top));
  width: 44rem;
  height: 44rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: color-mix(in srgb, var(--st-paper) 55%, transparent);
  color: color-mix(in srgb, var(--st-ink) 70%, transparent);
  text-decoration: none;
  cursor: pointer;
  appearance: none;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: color 160ms ease, background 160ms ease, transform 120ms ease;
}
.st__iconbtn:hover,
.st__iconbtn:focus-visible {
  color: var(--st-ink);
  background: color-mix(in srgb, var(--st-paper) 82%, transparent);
}
.st__iconbtn:active {
  transform: scale(0.94);
}

.st__back {
  left: max(10rem, env(safe-area-inset-left));
}
.st__back svg {
  width: 20rem;
  height: 20rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.25;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.st__theme {
  right: max(10rem, env(safe-area-inset-right));
}
.st__theme :deep(svg) {
  width: 18rem;
  height: 18rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Playing HUD — score giant top-center, BEST quiet pill */
.st__hud {
  position: absolute;
  top: max(58rem, calc(env(safe-area-inset-top) + 48rem));
  left: 0;
  right: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rem;
  pointer-events: none;
  opacity: 0;
  transform: translateY(-8rem);
  transition: opacity 280ms ease, transform 280ms ease;
}
.st__hud--on {
  opacity: 1;
  transform: none;
}
.st__score {
  font: 700 clamp(56rem, 16vw, 88rem)/0.9 var(--font-display);
  letter-spacing: -0.06em;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 1rem 0 color-mix(in srgb, var(--st-paper) 60%, transparent);
}
.st__bestpill {
  font: 700 11rem/1 var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 6rem 12rem;
  border-radius: 999px;
  color: color-mix(in srgb, var(--st-ink) 62%, transparent);
  background: color-mix(in srgb, var(--st-paper) 70%, transparent);
  backdrop-filter: blur(4px);
}

/* Overlays — premium indie hierarchy */
.st__overlay {
  position: absolute;
  inset: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 12rem;
  padding: 28rem 24rem;
  padding-top: max(28rem, env(safe-area-inset-top));
  padding-bottom: max(28rem, env(safe-area-inset-bottom));
  text-align: center;
  background: color-mix(in srgb, var(--st-paper) 68%, transparent);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: st-overlay-in 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
  pointer-events: none;
}
.st__overlay .st__cta { pointer-events: auto; }

.st__eyebrow {
  margin: 0;
  font: 800 11rem/1 var(--font-mono);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  opacity: 0.72;
}

.st__title {
  margin: 0;
  font: 700 clamp(80rem, 24vw, 128rem)/0.82 var(--font-display);
  letter-spacing: -0.07em;
  text-transform: uppercase;
}

.st__overscore {
  margin: 0;
  font: 700 clamp(88rem, 26vw, 140rem)/0.82 var(--font-display);
  letter-spacing: -0.07em;
  font-variant-numeric: tabular-nums;
}

.st__lede {
  margin: 0 0 6rem;
  font-size: 15rem;
  line-height: 1.4;
  max-width: 24ch;
  letter-spacing: 0.01em;
  opacity: 0.82;
}

.st__badge {
  margin: 0;
  font: 800 10rem/1 var(--font-mono);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 6rem 10rem;
  border-radius: 999px;
  background: var(--st-ink);
  color: var(--st-yellow);
}

/* Fat yellow Play / Again pill */
.st__cta {
  appearance: none;
  border: none;
  background: var(--st-yellow);
  color: #161618;
  font: 800 15rem/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 18rem 36rem;
  border-radius: 999px;
  cursor: pointer;
  box-shadow:
    0 1rem 0 color-mix(in srgb, #161618 12%, transparent),
    0 8rem 20rem color-mix(in srgb, var(--st-ink) 10%, transparent);
  transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
}
.st__cta:active {
  transform: translateY(2rem) scale(0.98);
  box-shadow:
    0 0 0 transparent,
    0 2rem 8rem color-mix(in srgb, var(--st-ink) 8%, transparent);
}

.st__anim {
  animation: st-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 65ms + 30ms);
}

.st__score-pop {
  animation:
    st-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both,
    st-score-pop 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 65ms + 30ms);
}

.st__cta--pulse {
  animation:
    st-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both,
    st-cta-pulse 2.6s ease-in-out 650ms infinite;
  animation-delay: calc(var(--i, 0) * 65ms + 30ms), 650ms;
}

.st__perfect {
  position: absolute;
  left: 50%;
  top: 20%;
  transform: translateX(-50%);
  margin: 0;
  padding: 7rem 14rem;
  background: var(--st-ink);
  color: var(--st-yellow);
  font: 800 12rem/1 var(--font-mono);
  letter-spacing: 0.22em;
  border-radius: 3rem;
  pointer-events: none;
  animation: st-pop 0.48s ease-out both;
}

@keyframes st-overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes st-rise {
  from { opacity: 0; transform: translateY(12rem); }
  to { opacity: 1; transform: none; }
}
@keyframes st-score-pop {
  0% { transform: scale(0.88); }
  55% { transform: scale(1.03); }
  100% { transform: scale(1); }
}
@keyframes st-cta-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.025); }
}
@keyframes st-pop {
  0% { opacity: 0; transform: translateX(-50%) translateY(6rem) scale(0.94); }
  22% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-10rem) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .st__overlay,
  .st__anim,
  .st__score-pop,
  .st__cta--pulse,
  .st__perfect,
  .st__hud {
    animation: none !important;
    transition: none !important;
  }
  .st__hud { opacity: 0; transform: none; }
  .st__hud--on { opacity: 1; }
  .st__anim,
  .st__score-pop,
  .st__cta--pulse { opacity: 1; transform: none; }
  .st { transition: none; }
}
</style>
