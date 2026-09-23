<script setup lang="ts">
definePageMeta({ layout: false })
/**
 * STACK — editorial portrait arcade for Engage.
 * Tap to drop. Only the overlap stays. No lore.
 * Light/dark via useThemeStore; iOS-aware speaker haptics.
 * Visual DNA: Tajjalan cream/ink/cobalt woodcut (same as blog/tajjalan covers).
 */
import { useThemeStore } from '~/stores/theme'

useSeoMeta({
  title: 'Stack · Engage',
  description: 'Tap to drop. Only the overlap stays. An editorial ink-on-cream stacking arcade on Entertrainer — Tajjalan art DNA.',
  ogUrl: 'https://entertrainer.in/engage/stack',
})

type Phase = 'title' | 'playing' | 'over'
type Block = { x: number; y: number; w: number; h: number; ink: boolean }
type Palette = {
  paper: string
  ink: string
  cobalt: string
  guide: string
  chip: string
}

/** Block render mode — placed tower alternates dense/open; live piece is cobalt. */
type BlockStyle = 'dense' | 'open' | 'cobalt'

const BEST_KEY = 'entertrainer-stack-best'

const PALETTE_LIGHT: Palette = {
  paper: '#F7F1E4',
  ink: '#0B0B0C',
  cobalt: '#2F5BD8',
  guide: 'rgba(11,11,12,0.18)',
  chip: '#0B0B0C',
}

const PALETTE_DARK: Palette = {
  paper: '#0B0B0C',
  ink: '#F7F1E4',
  cobalt: '#2F5BD8',
  guide: 'rgba(247,241,228,0.22)',
  chip: '#F7F1E4',
}

const theme = useThemeStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const phase = ref<Phase>('title')
const score = ref(0)
const best = ref(0)
const lastPerfect = ref(false)
/** Last perfect drop center — for flash ring art. */
let flashCx = 0
let flashCy = 0
let flashR0 = 40

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
let chips: { x: number; y: number; vx: number; vy: number; life: number; w: number; seed: number }[] = []
let audioCtx: AudioContext | null = null
let running = false
const BLOCK_H = 28
const START_W = 220
const PERFECT_PX = 5

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
    // Soft click + low thump
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
    // hairline noise tick
    burstNoise(ctx, t0, 0.012, 0.045)
    return
  }

  if (kind === 'perfect') {
    // Richer double-tick
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
    // Soft thud
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

  // over — deeper soft thud
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
  // Mild highpass so it reads as a click, not rumble
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
 * Optional double-tap: audio + vibrate when vibrate exists.
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

/**
 * Hatched / stippled slab — Tajjalan woodcut language.
 * Spacing ~4–5px so mobile stays smooth; no solid candy fills.
 */
function fillBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  style: BlockStyle,
  pal: Palette,
) {
  if (w <= 0.5 || h <= 0.5) return
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const bw = Math.ceil(w)
  const bh = Math.ceil(h)

  ctx.save()
  ctx.beginPath()
  ctx.rect(x0, y0, bw, bh)
  ctx.clip()

  // Cream (or inverted paper) underlay keeps hatch readable
  ctx.fillStyle = pal.paper
  ctx.fillRect(x0, y0, bw, bh)

  if (style === 'dense') {
    // Dense diagonal + light cross-hatch in ink
    ctx.strokeStyle = pal.ink
    ctx.lineWidth = 1
    const step = 4
    const span = bw + bh + step
    for (let i = -bh; i < span; i += step) {
      ctx.beginPath()
      ctx.moveTo(x0 + i, y0)
      ctx.lineTo(x0 + i + bh, y0 + bh)
      ctx.stroke()
    }
    ctx.globalAlpha = 0.55
    for (let i = -bh; i < span; i += step * 2) {
      ctx.beginPath()
      ctx.moveTo(x0 + i + bh, y0)
      ctx.lineTo(x0 + i, y0 + bh)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  } else if (style === 'open') {
    // Lighter open hatch + stipple (cream-outline slab feel)
    ctx.strokeStyle = pal.ink
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.38
    const step = 5
    const span = bw + bh + step
    for (let i = -bh; i < span; i += step) {
      ctx.beginPath()
      ctx.moveTo(x0 + i, y0)
      ctx.lineTo(x0 + i + bh, y0 + bh)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.fillStyle = pal.ink
    const s = 5
    for (let py = y0 + 2; py < y0 + bh - 1; py += s) {
      const row = Math.floor((py - y0) / s)
      const ox = (row % 2) * (s * 0.5)
      for (let px = x0 + 2 + ox; px < x0 + bw - 1; px += s) {
        ctx.fillRect(px, py, 1.25, 1.25)
      }
    }
  } else {
    // Cobalt accent — grainy wash + cobalt hatch, ink outline outside
    ctx.fillStyle = pal.cobalt
    ctx.globalAlpha = 0.2
    ctx.fillRect(x0, y0, bw, bh)
    ctx.globalAlpha = 1
    ctx.strokeStyle = pal.cobalt
    ctx.lineWidth = 1.15
    const step = 4
    const span = bw + bh + step
    for (let i = -bh; i < span; i += step) {
      ctx.beginPath()
      ctx.moveTo(x0 + i, y0)
      ctx.lineTo(x0 + i + bh, y0 + bh)
      ctx.stroke()
    }
    // Deterministic stipple grain (stable across frames)
    ctx.fillStyle = pal.cobalt
    for (let py = y0 + 1; py < y0 + bh; py += 3) {
      for (let px = x0 + 1 + (py & 1); px < x0 + bw; px += 3) {
        const n = ((px * 73856093) ^ (py * 19349663)) >>> 0
        if ((n & 3) !== 0) ctx.fillRect(px, py, 1, 1)
      }
    }
  }

  ctx.restore()

  // Ink hairline outline — woodcut edge
  ctx.strokeStyle = pal.ink
  ctx.lineWidth = 1
  ctx.strokeRect(x0 + 0.5, y0 + 0.5, bw - 1, bh - 1)
}

function startGame() {
  titleIdle = false
  ensureAudio()
  phase.value = 'playing'
  score.value = 0
  lastPerfect.value = false
  blocks = []
  chips = []
  shake = 0
  flash = 0
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
    spawnChips(cur.x, cur.y, cur.w)
    cur = null
    endGame()
    return
  }

  const perfect = Math.abs(cur.x - top.x) <= PERFECT_PX && Math.abs(cur.w - top.w) <= PERFECT_PX
  let placed: Block

  if (perfect) {
    placed = { x: top.x, y: cur.y, w: top.w, h: BLOCK_H, ink: !top.ink }
    lastPerfect.value = true
    window.setTimeout(() => { lastPerfect.value = false }, 560)
    flash = 1
    flashCx = placed.x + placed.w / 2
    flashCy = placed.y + placed.h / 2
    flashR0 = Math.max(28, placed.w * 0.45)
    shake = 10
    score.value += 1
    haptic('perfect', [8, 30, 16])
    tone(520, 0.07, 'square', 0.045)
    tone(780, 0.09, 'triangle', 0.03)
  } else {
    lastPerfect.value = false
    const trimmedLeft = cur.x < top.x
    const fallW = cur.w - overlap
    const fallX = trimmedLeft ? cur.x : right
    spawnChips(fallX, cur.y, Math.max(fallW, 4))
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

function spawnChips(x: number, y: number, w: number) {
  const n = Math.max(3, Math.min(10, Math.floor(w / 10)))
  for (let i = 0; i < n; i++) {
    chips.push({
      x: x + (w * (i + 0.5)) / n,
      y: y + BLOCK_H / 2,
      vx: (Math.random() - 0.5) * 380,
      vy: -80 - Math.random() * 220,
      life: 0.55 + Math.random() * 0.35,
      w: Math.max(6, w / n - 2),
      seed: (Math.random() * 0xffffffff) >>> 0,
    })
  }
}

function endGame() {
  phase.value = 'over'
  cur = null
  running = false
  const settleUntil = performance.now() + 700
  const settle = (ts: number) => {
    const dt = Math.min(0.033, (ts - (lastTs || ts)) / 1000)
    lastTs = ts
    for (const c of chips) {
      c.vy += 1400 * dt
      c.x += c.vx * dt
      c.y += c.vy * dt
      c.life -= dt
    }
    chips = chips.filter(c => c.life > 0)
    if (shake > 0) shake = Math.max(0, shake - dt * 40)
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
  if (score.value > best.value) {
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

  camY += (camTarget - camY) * Math.min(1, dt * 6)
  if (shake > 0) shake = Math.max(0, shake - dt * 40)
  if (flash > 0) flash = Math.max(0, flash - dt * 3)

  for (const c of chips) {
    c.vy += 1400 * dt
    c.x += c.vx * dt
    c.y += c.vy * dt
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
  paintFrame(ctx, pal)
  const reduce = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  // Breathing vertical drift + tiny scale breath on deco stack
  const drift = reduce ? 0 : Math.sin(ts / 1400) * 5
  const breath = reduce ? 1 : 1 + Math.sin(ts / 1600) * 0.012
  const ghostX = reduce ? 0 : Math.sin(ts / 1100) * 10
  const bw = Math.min(200, W * 0.5) * breath
  const bx = (W - bw) / 2
  let by = H * 0.62 + drift
  const layers = [
    { w: bw, ink: true },
    { w: bw * 0.86, ink: false },
    { w: bw * 0.7, ink: true },
    { w: bw * 0.52, ink: false },
  ]
  for (const L of layers) {
    const x = (W - L.w) / 2
    fillBlock(ctx, x, by, L.w, BLOCK_H - 2, L.ink ? 'dense' : 'open', pal)
    by -= BLOCK_H - 2
  }
  // Ghost moving hint — cobalt accent
  ctx.globalAlpha = 0.42 + (reduce ? 0 : 0.1 * Math.sin(ts / 900))
  fillBlock(ctx, bx - 40 + ghostX, by - 8 + drift * 0.4, bw * 0.52, BLOCK_H - 2, 'cobalt', pal)
  ctx.globalAlpha = 1
}

function draw() {
  const c = canvasRef.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  const pal = activePalette()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  paintFrame(ctx, pal)

  const sx = shake ? (Math.random() - 0.5) * shake : 0
  const sy = shake ? (Math.random() - 0.5) * shake : 0
  ctx.save()
  ctx.translate(sx, sy + camY)

  if (blocks.length) {
    const base = blocks[0]
    ctx.strokeStyle = pal.ink
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(24, base.y + BLOCK_H + 10)
    ctx.lineTo(W - 24, base.y + BLOCK_H + 10)
    ctx.stroke()
  }

  for (const b of blocks) {
    fillBlock(ctx, b.x, b.y, b.w, b.h - 1, b.ink ? 'dense' : 'open', pal)
  }

  if (cur) {
    // Live piece always cobalt — the one moving accent
    fillBlock(ctx, cur.x, cur.y, cur.w, cur.h - 1, 'cobalt', pal)
    const top = blocks[blocks.length - 1]
    ctx.strokeStyle = pal.guide
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.strokeRect(top.x, cur.y, top.w, cur.h - 1)
    ctx.setLineDash([])
  }

  // Miss chips — torn ink paper shards (not confetti)
  for (const ch of chips) {
    ctx.globalAlpha = Math.max(0, Math.min(1, ch.life * 1.4))
    const hw = ch.w * 0.5
    const hh = 7
    // Stable jagged outline (seed fixed at spawn)
    const j = (n: number) => ((ch.seed >> (n % 16)) & 7) / 7
    ctx.beginPath()
    ctx.moveTo(ch.x - hw, ch.y - hh * (0.4 + j(0) * 0.4))
    ctx.lineTo(ch.x + hw * (0.55 + j(1) * 0.35), ch.y - hh * (0.7 + j(2) * 0.3))
    ctx.lineTo(ch.x + hw, ch.y + hh * (0.15 + j(3) * 0.35))
    ctx.lineTo(ch.x + hw * (0.1 + j(4) * 0.25), ch.y + hh)
    ctx.lineTo(ch.x - hw * (0.7 + j(5) * 0.25), ch.y + hh * (0.35 + j(6) * 0.3))
    ctx.closePath()
    ctx.fillStyle = pal.chip
    ctx.fill()
    ctx.strokeStyle = pal.ink
    ctx.lineWidth = 1
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Perfect flash ring — cobalt outer + ink hairline inner
  if (flash > 0) {
    const r = flashR0 + (1 - flash) * 52
    ctx.strokeStyle = pal.cobalt
    ctx.globalAlpha = 0.6 * flash
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(flashCx, flashCy, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = pal.ink
    ctx.globalAlpha = 0.4 * flash
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(flashCx, flashCy, r * 0.82, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  ctx.restore()

  if (flash > 0) {
    const a = 0.12 * flash
    ctx.fillStyle = `rgba(47,91,216,${a})`
    ctx.fillRect(0, 0, W, H)
  }
}

function paintFrame(ctx: CanvasRenderingContext2D, pal: Palette) {
  ctx.fillStyle = pal.paper
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
    <!-- Floating chrome — no sticky bordered bar -->
    <NuxtLink to="/engage" class="st__back" aria-label="Back to Engage">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
      <span>Back</span>
    </NuxtLink>
    <NuxtLink to="/" class="st__home" aria-label="Entertrainer home">
      <EdWordmark variant="mark" :size="26" />
    </NuxtLink>

    <button
      type="button"
      class="st__theme"
      :aria-label="`Switch to ${theme.theme === 'dark' ? 'light' : 'dark'} mode`"
      @pointerdown.stop.prevent="onThemeToggle"
      @click.stop.prevent="onThemeToggle"
    >
      <EdSignalIcon :name="theme.theme === 'dark' ? 'sun' : 'moon'" />
    </button>

    <div
      class="st__hud"
      :class="{ 'st__hud--on': phase === 'playing' }"
      aria-live="polite"
    >
      <div class="st__stat">
        <span class="st__label">Score</span>
        <strong>{{ score }}</strong>
      </div>
      <div class="st__stat st__stat--right">
        <span class="st__label">Best</span>
        <strong>{{ best }}</strong>
      </div>
      <div class="st__hud-rule" aria-hidden="true" />
    </div>

    <div class="st__stage" @pointerdown.prevent="onPointer">
      <canvas ref="canvasRef" class="st__canvas" role="img" aria-label="Stack game board" />
      <div class="st__grain" aria-hidden="true" />
      <div class="st__vignette" aria-hidden="true" />

      <div v-if="phase === 'title'" class="st__overlay st__overlay--title">
        <p class="st__eyebrow st__anim" style="--i:0">Engage</p>
        <h1 class="st__anim" style="--i:1">STACK</h1>
        <p class="st__lede st__anim" style="--i:2">Tap to drop.<br />Only the overlap stays.</p>
        <button class="st__cta st__anim st__cta--pulse" style="--i:3" type="button">Play</button>
      </div>

      <div v-else-if="phase === 'over'" class="st__overlay st__overlay--over">
        <p class="st__eyebrow st__anim" style="--i:0">Done</p>
        <h1 class="st__anim st__score-pop" style="--i:1">{{ score }}</h1>
        <p class="st__lede st__anim" style="--i:2">
          <template v-if="score > 0 && score === best">New best.</template>
          <template v-else>Best {{ best }}</template>
        </p>
        <button class="st__cta st__anim" style="--i:3" type="button">Again</button>
      </div>

      <p v-else-if="lastPerfect" class="st__perfect" key="perfect">PERFECT</p>
    </div>
  </div>
</template>

<style scoped>
.st {
  --st-paper: #f7f1e4;
  --st-ink: #0b0b0c;
  --st-cobalt: #2f5bd8;
  /* Yellow stays for CTA chrome only — not game art */
  --st-yellow: #ffd43b;
  /* Local ink for wordmark (uses --ink) when bare layout */
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
  --st-paper: #0b0b0c;
  --st-ink: #f7f1e4;
  --st-cobalt: #2f5bd8;
  --st-yellow: #ffd43b;
}

/* Edge-to-edge canvas stage */
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

/* Soft paper grain — CSS only, subtle */
.st__grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.045;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
  background-size: 160px 160px;
}
.st[data-st-theme='dark'] .st__grain {
  opacity: 0.07;
  mix-blend-mode: screen;
}

.st__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 75% 70% at 50% 45%,
    transparent 55%,
    color-mix(in srgb, var(--st-ink) 6%, transparent) 100%
  );
}
.st[data-st-theme='dark'] .st__vignette {
  background: radial-gradient(
    ellipse 75% 70% at 50% 45%,
    transparent 50%,
    color-mix(in srgb, #000 28%, transparent) 100%
  );
}

/* Floating ghost back — ink on paper, no bar */
.st__back {
  position: absolute;
  top: max(12rem, env(safe-area-inset-top));
  left: max(12rem, env(safe-area-inset-left));
  z-index: 6;
  display: inline-flex;
  align-items: center;
  gap: 4rem;
  padding: 8rem 10rem;
  font: 700 11rem/1 var(--font-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--st-ink) 72%, transparent);
  text-decoration: none;
  border-radius: 3rem;
  background: color-mix(in srgb, var(--st-paper) 55%, transparent);
  backdrop-filter: blur(4px);
  transition: color 160ms ease, background 160ms ease;
}
.st__back:hover,
.st__back:focus-visible {
  color: var(--st-ink);
  background: color-mix(in srgb, var(--st-paper) 82%, transparent);
}
.st__back svg {
  width: 16rem;
  height: 16rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Discreet home mark — fixed lowercase-e wordmark */
.st__home {
  position: absolute;
  top: max(14rem, calc(env(safe-area-inset-top) + 2rem));
  left: 50%;
  transform: translateX(-50%);
  z-index: 6;
  display: inline-flex;
  opacity: 0.72;
  text-decoration: none;
  transition: opacity 160ms ease;
  color: var(--st-ink);
}
.st__home:hover,
.st__home:focus-visible { opacity: 1; }

/* Minimal circular theme control */
.st__theme {
  position: absolute;
  top: max(12rem, env(safe-area-inset-top));
  right: max(12rem, env(safe-area-inset-right));
  z-index: 6;
  width: 36rem;
  height: 36rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1.5rem solid color-mix(in srgb, var(--st-ink) 28%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--st-paper) 70%, transparent);
  color: var(--st-ink);
  cursor: pointer;
  appearance: none;
  backdrop-filter: blur(4px);
  transition: border-color 160ms ease, background 160ms ease, transform 120ms ease;
}
.st__theme:hover,
.st__theme:focus-visible {
  border-color: var(--st-ink);
  background: color-mix(in srgb, var(--st-paper) 88%, transparent);
}
.st__theme:active {
  transform: scale(0.94);
}
.st__theme :deep(svg) {
  width: 16rem;
  height: 16rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Playing HUD — floating type + faint rule, glass-less */
.st__hud {
  position: absolute;
  top: max(52rem, calc(env(safe-area-inset-top) + 40rem));
  left: 0;
  right: 0;
  z-index: 5;
  display: flex;
  justify-content: space-between;
  padding: 0 max(16rem, env(safe-area-inset-right)) 0 max(16rem, env(safe-area-inset-left));
  pointer-events: none;
  opacity: 0;
  transform: translateY(-6rem);
  transition: opacity 280ms ease, transform 280ms ease;
}
.st__hud--on {
  opacity: 1;
  transform: none;
}
.st__hud-rule {
  position: absolute;
  left: max(16rem, env(safe-area-inset-left));
  right: max(16rem, env(safe-area-inset-right));
  bottom: -10rem;
  height: 1px;
  background: color-mix(in srgb, var(--st-ink) 14%, transparent);
}

.st__stat { display: grid; gap: 2rem; }
.st__stat--right { text-align: right; }
.st__label {
  font: 700 10rem/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.5;
}
.st__stat strong {
  font: 700 28rem/1 var(--font-display);
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}

/* Menus — fade+rise overlays, not bordered cards */
.st__overlay {
  position: absolute;
  inset: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 10rem;
  padding: 28rem 24rem;
  padding-top: max(28rem, env(safe-area-inset-top));
  padding-bottom: max(28rem, env(safe-area-inset-bottom));
  text-align: center;
  background: color-mix(in srgb, var(--st-paper) 72%, transparent);
  backdrop-filter: blur(3px);
  animation: st-overlay-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
  pointer-events: none;
}
.st__overlay .st__cta { pointer-events: auto; }

.st__eyebrow {
  margin: 0;
  font: 800 11rem/1 var(--font-mono);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.st__overlay h1 {
  margin: 0;
  font: 700 clamp(72rem, 22vw, 120rem)/0.85 var(--font-display);
  letter-spacing: -0.07em;
  text-transform: uppercase;
}

.st__lede {
  margin: 0 0 8rem;
  font-size: 16rem;
  line-height: 1.35;
  max-width: 22ch;
}

.st__cta {
  appearance: none;
  border: 2rem solid var(--st-ink);
  background: var(--st-yellow);
  color: var(--st-ink);
  font: 800 14rem/1 var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 16rem 28rem;
  border-radius: 3rem;
  cursor: pointer;
  box-shadow: none;
  transition: transform 120ms ease, background 120ms ease;
}
.st__cta:active {
  transform: translateY(1rem) scale(0.98);
}

/* Staggered entrance */
.st__anim {
  animation: st-rise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 70ms + 40ms);
}

.st__score-pop {
  animation:
    st-rise 520ms cubic-bezier(0.22, 1, 0.36, 1) both,
    st-score-pop 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 70ms + 40ms);
}

/* Soft idle CTA pulse — brutalist, not candy */
.st__cta--pulse {
  animation:
    st-rise 520ms cubic-bezier(0.22, 1, 0.36, 1) both,
    st-cta-pulse 2.8s ease-in-out 700ms infinite;
  animation-delay: calc(var(--i, 0) * 70ms + 40ms), 700ms;
}

.st__perfect {
  position: absolute;
  left: 50%;
  top: 18%;
  transform: translateX(-50%);
  margin: 0;
  padding: 6rem 12rem;
  background: var(--st-ink);
  color: var(--st-cobalt);
  font: 800 12rem/1 var(--font-mono);
  letter-spacing: 0.2em;
  pointer-events: none;
  animation: st-pop 0.55s ease-out both;
}

@keyframes st-overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes st-rise {
  from { opacity: 0; transform: translateY(14rem); }
  to { opacity: 1; transform: none; }
}
@keyframes st-score-pop {
  0% { transform: scale(0.86); }
  55% { transform: scale(1.04); }
  100% { transform: scale(1); }
}
@keyframes st-cta-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}
@keyframes st-pop {
  0% { opacity: 0; transform: translateX(-50%) translateY(8rem) scale(0.92); }
  25% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-12rem) scale(1); }
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
