<script setup lang="ts">
definePageMeta({ layout: false })
/**
 * STACK — brutalist portrait arcade for Engage.
 * Tap to drop. Only the overlap stays. No lore.
 */
useSeoMeta({
  title: 'Stack · Engage',
  description: 'Tap to drop. Only the overlap stays. A brutalist stacking arcade on Entertrainer.',
  ogUrl: 'https://entertrainer.in/engage/stack',
})

type Phase = 'title' | 'playing' | 'over'
type Block = { x: number; y: number; w: number; h: number; ink: boolean }

const BEST_KEY = 'entertrainer-stack-best'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const phase = ref<Phase>('title')
const score = ref(0)
const best = ref(0)
const lastPerfect = ref(false)

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
let chips: { x: number; y: number; vx: number; vy: number; life: number; w: number }[] = []
let audioCtx: AudioContext | null = null
let running = false
const BLOCK_H = 28
const START_W = 220
const PERFECT_PX = 5

onMounted(() => {
  best.value = Number(localStorage.getItem(BEST_KEY) || 0) || 0
  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('orientationchange', resize)
  drawIdle()
})

onBeforeUnmount(() => {
  running = false
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
  window.removeEventListener('orientationchange', resize)
})

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

function haptic(pattern: number | number[]) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern)
  } catch { /* ignore */ }
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

function startGame() {
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
  haptic(12)
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
    // total miss — fling the moving block as chips
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
    shake = 10
    score.value += 1
    // bonus nudge — keep width, slight speed bump later
    haptic([8, 30, 16])
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
    haptic(18)
    tone(140, 0.08, 'sawtooth', 0.035)
  }

  blocks.push(placed)
  cur = null

  // camera follows upward growth
  const stackTop = placed.y
  const desired = H * 0.38
  if (stackTop < desired) camTarget = desired - stackTop

  // ramp speed gently
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
    })
  }
}

function endGame() {
  phase.value = 'over'
  cur = null
  running = false
  // Let chips finish falling for a beat, then freeze.
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
    haptic([20, 40, 20, 40, 40])
    tone(660, 0.12, 'square', 0.04)
  } else {
    haptic([30, 40, 50])
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

function drawIdle() {
  const c = canvasRef.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  paintFrame(ctx)
  // deco stack on title
  const bw = Math.min(200, W * 0.5)
  const bx = (W - bw) / 2
  let by = H * 0.62
  const layers = [
    { w: bw, ink: true },
    { w: bw * 0.86, ink: false },
    { w: bw * 0.7, ink: true },
    { w: bw * 0.52, ink: false },
  ]
  for (const L of layers) {
    const x = (W - L.w) / 2
    ctx.fillStyle = L.ink ? '#161618' : '#FFD43B'
    ctx.fillRect(x, by, L.w, BLOCK_H - 2)
    by -= BLOCK_H - 2
  }
  // floating ghost
  ctx.globalAlpha = 0.35
  ctx.fillStyle = '#161618'
  ctx.fillRect(bx - 40, by - 8, bw * 0.52, BLOCK_H - 2)
  ctx.globalAlpha = 1
}

function draw() {
  const c = canvasRef.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  paintFrame(ctx)

  const sx = shake ? (Math.random() - 0.5) * shake : 0
  const sy = shake ? (Math.random() - 0.5) * shake : 0
  ctx.save()
  ctx.translate(sx, sy + camY)

  // ground rule
  if (blocks.length) {
    const base = blocks[0]
    ctx.strokeStyle = '#161618'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(24, base.y + BLOCK_H + 10)
    ctx.lineTo(W - 24, base.y + BLOCK_H + 10)
    ctx.stroke()
  }

  for (const b of blocks) {
    ctx.fillStyle = b.ink ? '#161618' : '#FFD43B'
    ctx.fillRect(b.x, b.y, b.w, b.h - 1)
  }

  if (cur) {
    ctx.fillStyle = cur.ink ? '#161618' : '#FFD43B'
    ctx.fillRect(cur.x, cur.y, cur.w, cur.h - 1)
    // hairline guide on previous top edges
    const top = blocks[blocks.length - 1]
    ctx.strokeStyle = 'rgba(22,22,24,0.18)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.strokeRect(top.x, cur.y, top.w, cur.h - 1)
    ctx.setLineDash([])
  }

  for (const ch of chips) {
    ctx.globalAlpha = Math.max(0, ch.life * 1.4)
    ctx.fillStyle = '#161618'
    ctx.fillRect(ch.x - ch.w / 2, ch.y - 6, ch.w, 12)
  }
  ctx.globalAlpha = 1
  ctx.restore()

  if (flash > 0) {
    ctx.fillStyle = `rgba(255,212,59,${0.18 * flash})`
    ctx.fillRect(0, 0, W, H)
  }
}

function paintFrame(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#FBF8EF'
  ctx.fillRect(0, 0, W, H)
  // brutalist corner ticks
  ctx.strokeStyle = '#161618'
  ctx.lineWidth = 2
  const t = 18
  ctx.beginPath()
  ctx.moveTo(12, 12 + t); ctx.lineTo(12, 12); ctx.lineTo(12 + t, 12)
  ctx.moveTo(W - 12, 12 + t); ctx.lineTo(W - 12, 12); ctx.lineTo(W - 12 - t, 12)
  ctx.moveTo(12, H - 12 - t); ctx.lineTo(12, H - 12); ctx.lineTo(12 + t, H - 12)
  ctx.moveTo(W - 12, H - 12 - t); ctx.lineTo(W - 12, H - 12); ctx.lineTo(W - 12 - t, H - 12)
  ctx.stroke()
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
</script>

<template>
  <div class="st">
    <header class="st__bar">
      <NuxtLink to="/engage" class="st__back" aria-label="Back to Engage">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
        <span>Back</span>
      </NuxtLink>
      <NuxtLink to="/" class="st__home" aria-label="Entertrainer home">
        <EdWordmark variant="mark" :size="28" />
      </NuxtLink>
      <span class="st__title">Stack</span>
    </header>

    <div class="st__stage">
      <div class="st__hud" aria-live="polite">
        <div class="st__stat">
          <span class="st__label">Score</span>
          <strong>{{ score }}</strong>
        </div>
        <div class="st__stat st__stat--right">
          <span class="st__label">Best</span>
          <strong>{{ best }}</strong>
        </div>
      </div>

      <div class="st__play" @pointerdown.prevent="onPointer">
        <canvas ref="canvasRef" class="st__canvas" role="img" aria-label="Stack game board" />

        <div v-if="phase === 'title'" class="st__overlay st__overlay--title">
          <p class="st__eyebrow">Engage</p>
          <h1>STACK</h1>
          <p class="st__lede">Tap to drop.<br />Only the overlap stays.</p>
          <button class="st__cta" type="button">Play</button>
        </div>

        <div v-else-if="phase === 'over'" class="st__overlay st__overlay--over">
          <p class="st__eyebrow">Done</p>
          <h1>{{ score }}</h1>
          <p class="st__lede">
            <template v-if="score > 0 && score === best">New best.</template>
            <template v-else>Best {{ best }}</template>
          </p>
          <button class="st__cta" type="button">Again</button>
        </div>

        <p v-else-if="lastPerfect" class="st__perfect" key="perfect">PERFECT</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.st {
  --st-paper: #fbf8ef;
  --st-ink: #161618;
  --st-yellow: #ffd43b;
  min-height: 100dvh;
  background: var(--st-paper);
  color: var(--st-ink);
  display: flex;
  flex-direction: column;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom);
}

.st__bar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12rem;
  min-height: 56rem;
  padding: 10rem clamp(14rem, 3vw, 28rem);
  background: var(--st-paper);
  border-bottom: 2rem solid var(--st-ink);
}

.st__back,
.st__home,
.st__title {
  font: 700 12rem/1 var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--st-ink);
  text-decoration: none;
}

.st__back {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 6rem;
}
.st__back svg {
  width: 18rem;
  height: 18rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.st__home { justify-self: center; display: inline-flex; }
.st__title { justify-self: end; color: color-mix(in srgb, var(--st-ink) 55%, transparent); }

.st__stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: min(100%, 480rem);
  margin: 0 auto;
  min-height: 0;
}

.st__hud {
  display: flex;
  justify-content: space-between;
  padding: 14rem clamp(16rem, 4vw, 28rem) 0;
  pointer-events: none;
}

.st__stat {
  display: grid;
  gap: 2rem;
}
.st__stat--right { text-align: right; }
.st__label {
  font: 700 10rem/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.55;
}
.st__stat strong {
  font: 700 28rem/1 var(--font-display);
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}

.st__play {
  position: relative;
  flex: 1;
  min-height: 520rem;
  margin: 8rem clamp(10rem, 2vw, 18rem) 18rem;
  border: 2rem solid var(--st-ink);
  background: var(--st-paper);
  overflow: hidden;
  cursor: pointer;
  touch-action: none;
}

.st__canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.st__overlay {
  position: absolute;
  inset: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 10rem;
  padding: 28rem 24rem;
  text-align: center;
  background: color-mix(in srgb, var(--st-paper) 78%, transparent);
  backdrop-filter: blur(2px);
}

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
  box-shadow: 4rem 4rem 0 var(--st-ink);
  cursor: pointer;
}
.st__cta:active {
  transform: translate(2rem, 2rem);
  box-shadow: 2rem 2rem 0 var(--st-ink);
}

.st__perfect {
  position: absolute;
  left: 50%;
  top: 18%;
  transform: translateX(-50%);
  margin: 0;
  padding: 6rem 12rem;
  background: var(--st-ink);
  color: var(--st-yellow);
  font: 800 12rem/1 var(--font-mono);
  letter-spacing: 0.2em;
  pointer-events: none;
  animation: st-pop 0.55s ease-out both;
}

@keyframes st-pop {
  0% { opacity: 0; transform: translateX(-50%) translateY(8rem) scale(0.92); }
  25% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-12rem) scale(1); }
}

@media (min-width: 720px) {
  .st__play { min-height: 640rem; }
}
</style>
