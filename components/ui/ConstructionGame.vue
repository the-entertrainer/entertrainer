<script setup lang="ts">
// "Deadline Dash" — a tiny, dependency-free canvas runner for pages that
// aren't built yet. One input (tap / click / Space): jump the little pixel
// dev over incoming bugs. Everything is drawn procedurally at a low logical
// resolution and scaled up crisp ("pixelated") — no image assets to load,
// so it's instant on any device.
//
// The logical resolution and every physics constant scale together off the
// bezel's real rendered size (via ResizeObserver), so the exact same game
// feels right whether it's a small inline teaser or a fullscreen immersive
// take-over — nothing is a fixed 256×64 grid stretched thin. On touch
// devices, starting the game promotes it into a fullscreen overlay instead
// of leaving the player cramped inside a small inline box.
const props = withDefaults(defineProps<{ autofocus?: boolean }>(), { autofocus: false })

const canvasRef = ref<HTMLCanvasElement | null>(null)
const bezelRef  = ref<HTMLElement | null>(null)
const rootRef   = ref<HTMLElement | null>(null)

// Logical (unscaled) game resolution — reactive so the <canvas> attributes
// (and thus its backing store) resize whenever the rendered box does.
const BASE_H = 64          // tuning baseline every physics constant is relative to
const PIXEL_UNIT = 2.6     // real CSS px per logical game unit — chunky, not blocky
const canvasW = ref(256)
const canvasH = ref(64)
let W = 256
let H = 64
let GROUND_Y = 52
let scale = 1

type Phase = 'idle' | 'playing' | 'over'
const phase = ref<Phase>('idle')
const score = ref(0)
const highScore = ref(0)
const epitaph = ref('')
const immersive = ref(false)
const leaving = ref(false)
const isCoarsePointer = ref(false)

// Rendered as real HTML (not canvas fillText) — text drawn at the game's
// tiny logical resolution turns to illegible mush once CSS scales the
// canvas up to fill its container.
const scoreDisplay = computed(() => String(Math.floor(score.value)).padStart(5, '0'))
const highScoreDisplay = computed(() => String(Math.floor(highScore.value)).padStart(5, '0'))

const HIGH_SCORE_KEY = 'entertrainer-deadline-dash-hiscore'
const SOUND_KEY = 'entertrainer-deadline-dash-sound'
const soundOn = ref(true)

// ── Synthesized sound effects — Web Audio oscillators + a noise burst, no
// audio files. Everything is generated on the fly (a pitch-swept blip for
// jumps, a low tone + filtered white noise for the "thud" of a hit), so it
// costs nothing to load and works the same in any browser. The
// AudioContext is created lazily on the first real tap/keypress, since
// browsers refuse to start audio before a user gesture. ──────────────────
let audioCtx: AudioContext | null = null
function ensureAudio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext || (window as any).webkitAudioContext
  if (!Ctor) return null
  if (!audioCtx) audioCtx = new Ctor()
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {})
  return audioCtx
}
function loadSoundPref() {
  try {
    const raw = localStorage.getItem(SOUND_KEY)
    soundOn.value = raw === null ? true : raw === '1'
  } catch { soundOn.value = true }
}
function toggleSound() {
  soundOn.value = !soundOn.value
  try { localStorage.setItem(SOUND_KEY, soundOn.value ? '1' : '0') } catch {}
}

// A frequency-swept oscillator with an exponential gain decay — the basic
// unit every blip in this game is built from.
function tone(freqFrom: number, freqTo: number, duration: number, type: OscillatorType = 'square', gainPeak = 0.14) {
  if (!soundOn.value) return
  const ctx = ensureAudio()
  if (!ctx) return
  const t0 = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(Math.max(20, freqFrom), t0)
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqTo), t0 + duration)
  gain.gain.setValueAtTime(gainPeak, t0)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

// A short burst of filtered white noise — generated per-call, not decoded
// from a file — for the percussive half of a collision "thud".
function noiseBurst(duration: number, cutoff: number, gainPeak = 0.2) {
  if (!soundOn.value) return
  const ctx = ensureAudio()
  if (!ctx) return
  const t0 = ctx.currentTime
  const size = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / size)
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = cutoff
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(gainPeak, t0)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  src.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  src.start(t0)
}

function playJumpSound()      { tone(320, 680, 0.11, 'square', 0.12) }
function playMilestoneSound() { tone(660, 1040, 0.16, 'triangle', 0.09) }
function playGameOverSound() {
  tone(220, 55, 0.38, 'sawtooth', 0.13)
  noiseBurst(0.28, 850, 0.16)
}

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
let resizeObserver: ResizeObserver | null = null

const player = { x: 20, y: 0, w: 10, h: 12, vy: 0, grounded: true, runFrame: 0 }
let GRAVITY = 900
let JUMP_VELOCITY = -220

interface Obstacle { x: number; w: number; h: number }
let obstacles: Obstacle[] = []
let spawnTimer = 0
let nextSpawnIn = 900
let speed = 140
let elapsed = 0
let groundScrollX = 0
let lastMilestone = 0
const MILESTONE_STEP = 500

// ── Progressive background flair — meteors, then (further into a run) a
// UFO — purely decorative, never collidable, and gradually more frequent
// as the score climbs so a long run keeps feeling more alive rather than
// visually static. ─────────────────────────────────────────────────────
interface SkyObject { kind: 'meteor' | 'ufo'; x: number; y: number; vx: number; vy: number; life: number; seed: number }
let skyObjects: SkyObject[] = []
let skySpawnTimer = 0
const METEOR_SCORE = 120   // meteors start showing up past this score
const UFO_SCORE = 700      // UFOs are the rarer, later treat

// Both spawn bands start below ~22% of the game height — the HUD score and
// the mute/expand buttons live in that top strip as an HTML overlay, and a
// sky object drifting directly behind them just reads as clutter.
function spawnMeteor() {
  const fromLeft = Math.random() < 0.5
  const sp = (60 + Math.random() * 50) * scale
  skyObjects.push({
    kind: 'meteor',
    x: fromLeft ? -6 * scale : W + 6 * scale,
    y: H * (0.24 + Math.random() * 0.34),
    vx: (fromLeft ? 1 : -1) * sp,
    vy: sp * 0.55,
    life: 3,
    seed: Math.random()
  })
}
function spawnUfo() {
  const fromLeft = Math.random() < 0.5
  skyObjects.push({
    kind: 'ufo',
    x: fromLeft ? -22 * scale : W + 22 * scale,
    y: H * (0.26 + Math.random() * 0.16),
    vx: (fromLeft ? 1 : -1) * 26 * scale,
    vy: 0,
    life: 8,
    seed: Math.random() * 100
  })
}
function updateSky(dt: number) {
  if (score.value > METEOR_SCORE) {
    skySpawnTimer += dt
    // Ramps from "rare" to "fairly frequent" over several thousand points,
    // and caps out so the sky never gets visually noisy.
    const progress = Math.min(1, (score.value - METEOR_SCORE) / 3000)
    const interval = Math.max(1.1, 3.6 - progress * 2.2)
    if (skySpawnTimer >= interval) {
      skySpawnTimer = 0
      const activeMeteors = skyObjects.filter(s => s.kind === 'meteor').length
      if (activeMeteors < 3 && Math.random() < 0.35 + progress * 0.4) spawnMeteor()
      const activeUfos = skyObjects.filter(s => s.kind === 'ufo').length
      if (score.value > UFO_SCORE && activeUfos < 1 && Math.random() < 0.22) spawnUfo()
    }
  }
  for (const s of skyObjects) {
    s.x += s.vx * dt
    s.y += s.vy * dt
    s.life -= dt
  }
  skyObjects = skyObjects.filter(s => s.life > 0 && s.x > -30 * scale && s.x < W + 30 * scale)
}

// Recomputes every size- and scale-derived constant from the bezel's actual
// rendered box. Called on mount and on every resize — never in the hot
// per-frame loop.
function applyGeometry() {
  const el = bezelRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  if (rect.width < 4 || rect.height < 4) return

  W = Math.round(Math.min(520, Math.max(120, rect.width / PIXEL_UNIT)))
  H = Math.round(Math.min(260, Math.max(50, rect.height / PIXEL_UNIT)))
  canvasW.value = W
  canvasH.value = H
  scale = H / BASE_H
  GROUND_Y = Math.round(H * 0.8125)
  GRAVITY = 900 * scale
  JUMP_VELOCITY = -220 * scale
  player.x = Math.round(20 * scale)
  player.w = Math.round(10 * scale)
  player.h = Math.round(12 * scale)
  // Keep whoever's mid-air or mid-run snapped to the (possibly moved) ground
  // rather than popping through the floor on an orientation change.
  if (player.grounded || phase.value !== 'playing') player.y = GROUND_Y - player.h
}

function resetGame() {
  applyGeometry()
  player.y = GROUND_Y - player.h
  player.vy = 0
  player.grounded = true
  player.runFrame = 0
  obstacles = []
  spawnTimer = 0
  nextSpawnIn = 900
  speed = 140 * scale
  elapsed = 0
  groundScrollX = 0
  score.value = 0
  skyObjects = []
  skySpawnTimer = 0
  lastMilestone = 0
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

function lockBodyScroll(lock: boolean) {
  document.documentElement.classList.toggle('cgame-lock', lock)
}

function enterImmersive() {
  if (immersive.value) return
  immersive.value = true
  lockBodyScroll(true)
  nextTick(() => { applyGeometry(); canvasRef.value?.focus() })
}
function exitImmersive() {
  if (!immersive.value || leaving.value) return
  // Let the dematerialize keyframe play before the Teleport actually moves
  // the element back inline — otherwise it just vanishes with no exit beat.
  leaving.value = true
  setTimeout(() => {
    immersive.value = false
    leaving.value = false
    lockBodyScroll(false)
    nextTick(applyGeometry)
  }, 220)
}
function toggleImmersive() {
  if (immersive.value) exitImmersive()
  else enterImmersive()
}

function startGame() {
  // A tiny inline strip is exactly the "trapped in a small box" complaint —
  // on touch devices, committing to play promotes the game to a fullscreen
  // take-over instead of leaving the player cramped in the teaser.
  if (isCoarsePointer.value && !immersive.value) enterImmersive()
  resetGame()
  phase.value = 'playing'
}
function endGame() {
  phase.value = 'over'
  epitaph.value = EPITAPHS[Math.floor(Math.random() * EPITAPHS.length)]
  playGameOverSound()
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
    playJumpSound()
  }
}

function spawnObstacle() {
  const presets = [
    { w: 8, h: 10 },
    { w: 10, h: 14 },
    { w: 12, h: 11 }
  ].map(p => ({ w: p.w * scale, h: p.h * scale }))
  const p = presets[Math.floor(Math.random() * presets.length)]
  obstacles.push({ x: W + 4, w: p.w, h: p.h })
  // Occasionally pair a second obstacle close behind once the pace has picked up.
  if (speed > 200 * scale && Math.random() < 0.22) {
    obstacles.push({ x: W + 4 + p.w + 14 * scale, w: presets[0].w, h: presets[0].h })
  }
}

function update(dt: number) {
  elapsed += dt
  score.value += dt * 10
  speed = Math.min(340 * scale, 140 * scale + elapsed * 6 * scale)

  const milestone = Math.floor(score.value / MILESTONE_STEP)
  if (milestone > lastMilestone) {
    lastMilestone = milestone
    playMilestoneSound()
  }
  updateSky(dt)

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
  groundScrollX = (groundScrollX + speed * dt) % (8 * scale)

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
  const inset = Math.max(1, 2 * scale)
  const pl = { x: player.x + inset, y: player.y + inset, w: player.w - inset * 2, h: player.h - inset * 1.5 }
  for (const o of obstacles) {
    const oInset = Math.max(0.5, scale)
    const ol = { x: o.x + oInset, y: GROUND_Y - o.h, w: o.w - oInset * 2, h: o.h }
    if (pl.x < ol.x + ol.w && pl.x + pl.w > ol.x && pl.y < ol.y + ol.h && pl.y + pl.h > ol.y) {
      endGame()
      break
    }
  }
}

// Chunky pixel-art streak: a bright core with a few fading trailing
// squares along the direction of travel — matches the flat-rect, no-
// gradient style already used for the player and bugs.
function drawMeteor(s: SkyObject) {
  if (!ctx) return
  const dirX = s.vx === 0 ? 0 : s.vx / Math.abs(s.vx)
  const dirY = s.vy === 0 ? 0 : s.vy / Math.abs(s.vy)
  const steps = 4
  for (let i = steps; i >= 0; i--) {
    const size = Math.max(1.5, (i === 0 ? 4 : 3.4 - i * 0.4) * scale)
    const tx = s.x - dirX * i * 4 * scale
    const ty = s.y - dirY * i * 4 * scale
    const alpha = i === 0 ? 1 : Math.max(0.12, 0.85 - i * 0.16)
    ctx.fillStyle = i === 0 ? 'rgba(214,255,190,1)' : `rgba(150,220,120,${alpha})`
    ctx.fillRect(tx - size / 2, ty - size / 2, size, size)
  }
}

// A stepped-rect "saucer" (stacked bars of decreasing width) with a small
// dome and two alternating blinking lights — cosmetic only, never collides.
function drawUfo(s: SkyObject, t: number) {
  if (!ctx) return
  const bodyW = 20 * scale
  const bodyH = 3 * scale
  ctx.fillStyle = 'rgba(150,220,120,0.75)'
  ctx.fillRect(s.x - bodyW / 2, s.y, bodyW, bodyH)
  ctx.fillRect(s.x - bodyW / 2 + 3 * scale, s.y - bodyH, bodyW - 6 * scale, bodyH)
  ctx.fillStyle = 'rgba(214,255,190,0.85)'
  ctx.fillRect(s.x - 4 * scale, s.y - bodyH * 2, 8 * scale, bodyH)
  const blink = Math.floor(t * 3 + s.seed) % 2 === 0
  ctx.fillStyle = blink ? 'rgba(214,255,190,0.95)' : 'rgba(150,220,120,0.25)'
  ctx.fillRect(s.x - bodyW / 2 + 2 * scale, s.y + bodyH, Math.max(1, scale), Math.max(1, scale))
  ctx.fillRect(s.x + bodyW / 2 - 3 * scale, s.y + bodyH, Math.max(1, scale), Math.max(1, scale))
}

function draw(t = 0) {
  if (!ctx) return
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = '#0A1408'
  ctx.fillRect(0, 0, W, H)

  // background flair — behind everything else, purely decorative
  for (const s of skyObjects) {
    if (s.kind === 'meteor') drawMeteor(s)
    else drawUfo(s, t)
  }

  // ground
  ctx.strokeStyle = 'rgba(150,220,120,0.35)'
  ctx.lineWidth = Math.max(1, scale)
  ctx.beginPath()
  ctx.moveTo(0, GROUND_Y + 0.5)
  ctx.lineTo(W, GROUND_Y + 0.5)
  ctx.stroke()
  ctx.fillStyle = 'rgba(150,220,120,0.22)'
  const dashW = Math.max(2, 3 * scale)
  for (let x = -groundScrollX; x < W; x += 8 * scale) ctx.fillRect(x, GROUND_Y + 3 * scale, dashW, Math.max(1, scale))

  // player (two-frame run cycle while grounded; tucked pose while airborne)
  const legW = Math.max(2, 3 * scale)
  const legH = Math.max(3, 4 * scale)
  const bob = player.grounded && Math.floor(player.runFrame * 10) % 2 === 0 ? 0 : 1
  ctx.fillStyle = 'rgb(150,220,120)'
  ctx.fillRect(player.x, player.y, player.w, player.h - legH)
  ctx.fillStyle = 'rgb(214,255,190)'
  ctx.fillRect(player.x + 2 * scale, player.y + 2 * scale, Math.max(2, 3 * scale), Math.max(2, 3 * scale)) // "visor" accent — a lighter tint of the same hue, not a different color
  ctx.fillStyle = 'rgb(150,220,120)'
  if (player.grounded) {
    ctx.fillRect(player.x + (bob === 0 ? 0 : 2 * scale), player.y + player.h - legH, legW, legH)
    ctx.fillRect(player.x + (bob === 0 ? 6 * scale : 4 * scale), player.y + player.h - legH, legW, legH)
  } else {
    ctx.fillRect(player.x + 1 * scale, player.y + player.h - legH, legW, Math.max(2, 3 * scale))
    ctx.fillRect(player.x + 5 * scale, player.y + player.h - legH, legW, Math.max(2, 3 * scale))
  }

  // obstacles ("bugs")
  ctx.fillStyle = 'rgb(150,220,120)'
  for (const o of obstacles) {
    const oy = GROUND_Y - o.h
    ctx.fillRect(o.x, oy, o.w, o.h)
    ctx.fillStyle = '#0A1408'
    const eye = Math.max(1, 2 * scale)
    ctx.fillRect(o.x + 1 * scale, oy + 2 * scale, eye, eye)
    ctx.fillRect(o.x + o.w - eye - 1 * scale, oy + 2 * scale, eye, eye)
    ctx.fillStyle = 'rgb(150,220,120)'
  }
}

function frame(t: number) {
  if (!lastT) lastT = t
  const dt = Math.min(0.05, (t - lastT) / 1000)
  lastT = t
  if (phase.value === 'playing') update(dt)
  draw(t / 1000)
  raf = requestAnimationFrame(frame)
}

function onKeydown(e: KeyboardEvent) {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault()
    jumpOrAdvance()
  } else if (e.code === 'Escape' && immersive.value) {
    e.preventDefault()
    exitImmersive()
  }
}
// A single listener on the whole component root — not just the canvas —
// so a tap anywhere on the game surface registers as input. On a phone,
// precisely hitting a small canvas mid-panic is exactly the kind of
// friction that makes a game "unsatisfying to play"; during an active run
// any tap here (including the fullscreen scrim around the bezel) counts as
// a jump. Between rounds, a tap inside the bezel starts/retries, while a
// tap out on the scrim (fullscreen mode only) exits instead.
function onAnyPointer(e: Event) {
  const target = e.target as HTMLElement | null
  const insideBezel = !!(target && bezelRef.value?.contains(target))
  if (phase.value === 'playing') {
    e.preventDefault()
    jumpOrAdvance()
    return
  }
  if (insideBezel) {
    e.preventDefault()
    jumpOrAdvance()
  } else if (immersive.value) {
    exitImmersive()
  }
}
function onVisibility() {
  if (document.hidden) lastT = 0
}

onMounted(() => {
  loadHighScore()
  loadSoundPref()
  isCoarsePointer.value = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  applyGeometry()
  player.y = GROUND_Y - player.h
  raf = requestAnimationFrame(frame)
  document.addEventListener('visibilitychange', onVisibility)
  if (bezelRef.value) {
    resizeObserver = new ResizeObserver(() => applyGeometry())
    resizeObserver.observe(bezelRef.value)
  }
  if (props.autofocus) canvas.focus()
})
onUnmounted(() => {
  cancelAnimationFrame(raf)
  document.removeEventListener('visibilitychange', onVisibility)
  resizeObserver?.disconnect()
  if (immersive.value) lockBodyScroll(false)
})
</script>

<template>
  <Teleport to="body" :disabled="!immersive">
    <div
      ref="rootRef" class="cgame" :class="{ 'cgame--immersive': immersive }"
      @pointerdown="onAnyPointer"
    >
      <Transition name="cgame-scrim">
        <div v-if="immersive" class="cgame__scrim" />
      </Transition>

      <div ref="bezelRef" class="cgame__bezel" :class="{ 'cgame__bezel--leaving': leaving }">
          <canvas
            ref="canvasRef" :width="canvasW" :height="canvasH" tabindex="0"
            class="cgame__canvas"
            aria-label="Deadline Dash — a small runner game. Press space, tap, or click to jump."
            @keydown="onKeydown"
          />
          <div class="cgame__hud">
            <span class="cgame__hi">HI {{ highScoreDisplay }}</span>
            <span class="cgame__score">{{ scoreDisplay }}</span>
          </div>
          <div class="cgame__controls">
            <button
              type="button"
              class="cgame__toggle"
              :aria-label="soundOn ? 'Mute sound' : 'Unmute sound'"
              @pointerdown.stop
              @click.stop="toggleSound"
            >
              <svg v-if="soundOn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 9v6h4l5 4V5L8 9H4Z" />
                <path d="M16.5 8.5a5 5 0 0 1 0 7" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 9v6h4l5 4V5L8 9H4Z" />
                <path d="M16 9l5 6M21 9l-5 6" />
              </svg>
            </button>
            <button
              type="button"
              class="cgame__toggle"
              :aria-label="immersive ? 'Exit fullscreen' : 'Play fullscreen'"
              @pointerdown.stop
              @click.stop="toggleImmersive"
            >
              <svg v-if="!immersive" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4l6 6M4 10V4h6M20 4l-6 6M20 10V4h-6M4 20l6-6M4 14v6h6M20 20l-6-6M20 14v6h-6" />
              </svg>
            </button>
          </div>
          <div v-if="phase !== 'playing'" class="cgame__overlay">
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
  </Teleport>
</template>

<style scoped>
.cgame { width: 100%; }
.cgame__bezel {
  position: relative;
  width: 100%;
  aspect-ratio: 21 / 6;
  border-radius: 12rem;
  overflow: hidden;
  background: #070F06;
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

/* ── Immersive fullscreen take-over ──────────────────────────────────────
   Teleported to <body>; the exact same canvas element just gets a bigger,
   gentler-aspect stage instead of a thin inline strip. */
.cgame--immersive {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(20rem + var(--safe-top)) calc(20rem + var(--safe-right)) calc(20rem + var(--safe-bottom)) calc(20rem + var(--safe-left));
}
.cgame__scrim {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, var(--color-bg) 78%, transparent);
  backdrop-filter: blur(28px) saturate(1.1);
  -webkit-backdrop-filter: blur(28px) saturate(1.1);
}
.cgame--immersive .cgame__bezel {
  position: relative;
  z-index: 1;
  width: min(92vw, 144dvh, 720rem);
  aspect-ratio: 2 / 1;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06), 0 40rem 90rem -30rem rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05);
  animation: cgame-materialize 0.5s var(--ease-spring) both, cgame-glow 4s ease-in-out 0.5s infinite;
}
.cgame--immersive .cgame__bezel.cgame__bezel--leaving {
  animation: cgame-dematerialize 0.22s ease forwards;
}
@keyframes cgame-materialize {
  from { opacity: 0; transform: scale(0.88); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes cgame-dematerialize {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.92); }
}
@keyframes cgame-glow {
  0%, 100% { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06), 0 40rem 90rem -30rem rgba(0,0,0,0.75), 0 0 60rem -12rem rgba(150,220,120,0.25); }
  50%      { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06), 0 40rem 90rem -30rem rgba(0,0,0,0.75), 0 0 90rem -10rem rgba(214,255,190,0.30); }
}

.cgame-scrim-enter-active, .cgame-scrim-leave-active { transition: opacity 0.4s ease; }
.cgame-scrim-enter-from, .cgame-scrim-leave-to { opacity: 0; }

.cgame__hud {
  position: absolute;
  top: 6rem;
  left: 8rem;
  right: 66rem;
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
.cgame--immersive .cgame__hud { top: 14rem; left: 16rem; right: 92rem; font-size: 13rem; }
.cgame__hi { color: rgba(150,220,120,0.55); }
.cgame__score { color: rgba(214,255,190,0.95); }

.cgame__controls {
  position: absolute;
  top: 6rem;
  right: 8rem;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6rem;
}
.cgame--immersive .cgame__controls {
  top: calc(14rem + var(--safe-top));
  right: calc(14rem + var(--safe-right));
  gap: 8rem;
}
.cgame__toggle {
  width: 24rem;
  height: 24rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(7,15,6,0.55);
  border: 1px solid rgba(150,220,120,0.3);
  color: rgba(150,220,120,0.85);
  cursor: pointer;
  touch-action: manipulation;
  transition: background 0.2s ease, transform 0.15s var(--ease-spring), color 0.2s ease;
}
.cgame__toggle svg { width: 13rem; height: 13rem; }
.cgame__toggle:active { transform: scale(0.9); }
@media (hover: hover) {
  .cgame__toggle:hover { background: rgba(7,15,6,0.8); color: rgb(214,255,190); }
}
.cgame--immersive .cgame__toggle {
  width: 32rem;
  height: 32rem;
}
.cgame--immersive .cgame__toggle svg { width: 15rem; height: 15rem; }

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
  background: rgba(7, 15, 6, 0.6);
  cursor: pointer;
}
.cgame__title { font-size: 15rem; font-weight: 800; color: rgb(214,255,190); letter-spacing: -0.02em; }
.cgame__hint { font-size: 11rem; color: rgba(150,220,120,0.75); }
.cgame__over { font-size: 15rem; font-weight: 800; color: rgb(214,255,190); letter-spacing: -0.02em; }
.cgame__epitaph { font-size: 11.5rem; color: rgba(150,220,120,0.8); font-style: italic; }
.cgame__score { font-size: 12rem; font-weight: 700; color: rgb(214,255,190); }
.cgame__cta {
  margin-top: 4rem;
  font-size: 10rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgb(214,255,190);
}
.cgame--immersive .cgame__title { font-size: 22rem; }
.cgame--immersive .cgame__hint { font-size: 14rem; }
.cgame--immersive .cgame__over { font-size: 22rem; }
.cgame--immersive .cgame__epitaph { font-size: 15rem; }
.cgame--immersive .cgame__score { font-size: 15rem; }
.cgame--immersive .cgame__cta { font-size: 12rem; margin-top: 8rem; }
</style>
