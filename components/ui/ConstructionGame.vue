<script setup lang="ts">
// "Deadline Dash" — a tiny, dependency-free canvas runner for pages that
// aren't built yet. One input (tap / click / Space): jump the little pixel
// dev over incoming bugs. Everything is drawn procedurally at a low logical
// resolution and scaled up crisp ("pixelated") — no image assets to load,
// so it's instant on any device.
const props = withDefaults(defineProps<{ autofocus?: boolean }>(), { autofocus: false })

const canvasRef = ref<HTMLCanvasElement | null>(null)
const rootRef = ref<HTMLElement | null>(null)

// Logical (unscaled) game resolution — kept small on purpose for the
// chunky pixel look. Rendered up to fill the container via CSS.
const W = 256
const H = 64
const GROUND_Y = 52

type Phase = 'idle' | 'playing' | 'over'
const phase = ref<Phase>('idle')
const score = ref(0)
const highScore = ref(0)
const epitaph = ref('')

// Rendered as real HTML (not canvas fillText) — text drawn at the game's
// tiny logical resolution turns to illegible mush once CSS scales the
// canvas up to fill its container.
const scoreDisplay = computed(() => String(Math.floor(score.value)).padStart(5, '0'))
const highScoreDisplay = computed(() => String(Math.floor(highScore.value)).padStart(5, '0'))

const HIGH_SCORE_KEY = 'entertrainer-deadline-dash-hiscore'
const EPITAPHS = [
  'Naveen tripped over a semicolon.',
  'Squashed by a deadline.',
  'Merge conflict. You lose.',
  'That bug had seniority.',
  'Scope creep got you.',
  'Naveen forgot to hydrate you.',
  'It worked on localhost.',
  'The bug filed a bug against you.',
  'Undefined is not a runner.',
  'You got refactored.'
]

let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let lastT = 0

const player = { x: 20, y: 0, w: 10, h: 12, vy: 0, grounded: true, runFrame: 0 }
const GRAVITY = 900
const JUMP_VELOCITY = -220

interface Obstacle { x: number; w: number; h: number }
let obstacles: Obstacle[] = []
let spawnTimer = 0
let nextSpawnIn = 900
let speed = 140
let elapsed = 0
let groundScrollX = 0

function resetGame() {
  player.y = GROUND_Y - player.h
  player.vy = 0
  player.grounded = true
  player.runFrame = 0
  obstacles = []
  spawnTimer = 0
  nextSpawnIn = 900
  speed = 140
  elapsed = 0
  groundScrollX = 0
  score.value = 0
}

function loadHighScore() {
  try {
    const raw = localStorage.getItem(HIGH_SCORE_KEY)
    highScore.value = raw ? parseInt(raw, 10) || 0 : 0
  } catch { highScore.value = 0 }
}
function saveHighScore() {
  try { localStorage.setItem(HIGH_SCORE_KEY, String(highScore.value)) } catch {}
}

function startGame() {
  resetGame()
  phase.value = 'playing'
}
function endGame() {
  phase.value = 'over'
  epitaph.value = EPITAPHS[Math.floor(Math.random() * EPITAPHS.length)]
  if (score.value > highScore.value) {
    highScore.value = Math.floor(score.value)
    saveHighScore()
  }
}
function jumpOrAdvance() {
  if (phase.value === 'idle') { startGame(); return }
  if (phase.value === 'over') { startGame(); return }
  if (player.grounded) {
    player.vy = JUMP_VELOCITY
    player.grounded = false
  }
}

function spawnObstacle() {
  const presets = [
    { w: 8, h: 10 },
    { w: 10, h: 14 },
    { w: 12, h: 11 }
  ]
  const p = presets[Math.floor(Math.random() * presets.length)]
  obstacles.push({ x: W + 4, w: p.w, h: p.h })
  // Occasionally pair a second obstacle close behind once the pace has picked up.
  if (speed > 200 && Math.random() < 0.22) {
    obstacles.push({ x: W + 4 + p.w + 14, w: presets[0].w, h: presets[0].h })
  }
}

function update(dt: number) {
  elapsed += dt
  score.value += dt * 10
  speed = Math.min(340, 140 + elapsed * 6)

  // player physics
  player.vy += GRAVITY * dt
  player.y += player.vy * dt
  if (player.y >= GROUND_Y - player.h) {
    player.y = GROUND_Y - player.h
    player.vy = 0
    player.grounded = true
  }
  if (player.grounded) player.runFrame += dt

  // ground scroll
  groundScrollX = (groundScrollX + speed * dt) % 8

  // obstacles
  spawnTimer += dt * 1000
  if (spawnTimer >= nextSpawnIn) {
    spawnTimer = 0
    nextSpawnIn = Math.max(500, 1100 - speed) + Math.random() * 500
    spawnObstacle()
  }
  for (const o of obstacles) o.x -= speed * dt
  obstacles = obstacles.filter(o => o.x + o.w > -4)

  // collision (small inset so near-misses feel fair)
  const pl = { x: player.x + 2, y: player.y + 2, w: player.w - 4, h: player.h - 3 }
  for (const o of obstacles) {
    const ol = { x: o.x + 1, y: GROUND_Y - o.h, w: o.w - 2, h: o.h }
    if (pl.x < ol.x + ol.w && pl.x + pl.w > ol.x && pl.y < ol.y + ol.h && pl.y + pl.h > ol.y) {
      endGame()
      break
    }
  }
}

function draw() {
  if (!ctx) return
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = '#14101f'
  ctx.fillRect(0, 0, W, H)

  // ground
  ctx.strokeStyle = 'rgba(244,241,236,0.35)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, GROUND_Y + 0.5)
  ctx.lineTo(W, GROUND_Y + 0.5)
  ctx.stroke()
  ctx.fillStyle = 'rgba(244,241,236,0.22)'
  for (let x = -groundScrollX; x < W; x += 8) ctx.fillRect(x, GROUND_Y + 3, 3, 1)

  // player (two-frame run cycle while grounded; tucked pose while airborne)
  const bob = player.grounded && Math.floor(player.runFrame * 10) % 2 === 0 ? 0 : 1
  ctx.fillStyle = '#8B7CF6'
  ctx.fillRect(player.x, player.y, player.w, player.h - 4)
  ctx.fillStyle = '#2DD4BF'
  ctx.fillRect(player.x + 2, player.y + 2, 3, 3) // "visor" accent
  ctx.fillStyle = '#8B7CF6'
  if (player.grounded) {
    ctx.fillRect(player.x + (bob === 0 ? 0 : 2), player.y + player.h - 4, 3, 4)
    ctx.fillRect(player.x + (bob === 0 ? 6 : 4), player.y + player.h - 4, 3, 4)
  } else {
    ctx.fillRect(player.x + 1, player.y + player.h - 4, 3, 3)
    ctx.fillRect(player.x + 5, player.y + player.h - 4, 3, 3)
  }

  // obstacles ("bugs")
  ctx.fillStyle = '#FB7185'
  for (const o of obstacles) {
    const oy = GROUND_Y - o.h
    ctx.fillRect(o.x, oy, o.w, o.h)
    ctx.fillStyle = '#14101f'
    ctx.fillRect(o.x + 1, oy + 2, 2, 2)
    ctx.fillRect(o.x + o.w - 3, oy + 2, 2, 2)
    ctx.fillStyle = '#FB7185'
  }
}

function frame(t: number) {
  if (!lastT) lastT = t
  const dt = Math.min(0.05, (t - lastT) / 1000)
  lastT = t
  if (phase.value === 'playing') update(dt)
  draw()
  raf = requestAnimationFrame(frame)
}

function onKeydown(e: KeyboardEvent) {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault()
    jumpOrAdvance()
  }
}
function onPointer(e: Event) {
  e.preventDefault()
  jumpOrAdvance()
}
function onVisibility() {
  if (document.hidden) lastT = 0
}

onMounted(() => {
  loadHighScore()
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  player.y = GROUND_Y - player.h
  raf = requestAnimationFrame(frame)
  document.addEventListener('visibilitychange', onVisibility)
  if (props.autofocus) canvas.focus()
})
onUnmounted(() => {
  cancelAnimationFrame(raf)
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <div ref="rootRef" class="cgame">
    <div class="cgame__bezel">
      <canvas
        ref="canvasRef" :width="W" :height="H" tabindex="0"
        class="cgame__canvas"
        aria-label="Deadline Dash — a small runner game. Press space, tap, or click to jump."
        @keydown="onKeydown"
        @pointerdown="onPointer"
      />
      <div class="cgame__hud">
        <span class="cgame__hi">HI {{ highScoreDisplay }}</span>
        <span class="cgame__score">{{ scoreDisplay }}</span>
      </div>
      <div v-if="phase !== 'playing'" class="cgame__overlay" @pointerdown.stop="onPointer">
        <template v-if="phase === 'idle'">
          <p class="cgame__title">Deadline Dash</p>
          <p class="cgame__hint">Dodge the bugs while this page gets built.</p>
          <p class="cgame__cta">Tap, click, or press Space</p>
        </template>
        <template v-else>
          <p class="cgame__over">Game over</p>
          <p class="cgame__epitaph">{{ epitaph }}</p>
          <p class="cgame__score">Score {{ Math.floor(score) }} · Best {{ Math.floor(highScore) }}</p>
          <p class="cgame__cta">Tap, click, or press Space to retry</p>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cgame { width: 100%; }
.cgame__bezel {
  position: relative;
  width: 100%;
  aspect-ratio: 256 / 64;
  border-radius: 12rem;
  overflow: hidden;
  background: #0a0812;
  border: 1px solid var(--color-glass-border);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04), 0 18rem 40rem -24rem rgba(0,0,0,0.6);
}
.cgame__canvas {
  width: 100%;
  height: 100%;
  display: block;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  cursor: pointer;
  outline: none;
  touch-action: manipulation;
}
.cgame__hud {
  position: absolute;
  top: 6rem;
  left: 8rem;
  right: 8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: ui-monospace, 'SF Mono', 'Courier New', monospace;
  font-size: 10rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(0,0,0,0.6);
}
.cgame__hi { color: rgba(244,241,236,0.5); }
.cgame__score { color: rgba(244,241,236,0.9); }
.cgame__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rem;
  text-align: center;
  padding: 8rem 16rem;
  background: rgba(10, 8, 18, 0.55);
  cursor: pointer;
}
.cgame__title { font-size: 15rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
.cgame__hint { font-size: 11rem; color: rgba(255,255,255,0.65); }
.cgame__over { font-size: 15rem; font-weight: 800; color: #FB7185; letter-spacing: -0.02em; }
.cgame__epitaph { font-size: 11.5rem; color: rgba(255,255,255,0.75); font-style: italic; }
.cgame__score { font-size: 12rem; font-weight: 700; color: #fff; }
.cgame__cta {
  margin-top: 4rem;
  font-size: 10rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #2DD4BF;
}
</style>
