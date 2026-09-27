<script setup lang="ts">
definePageMeta({ layout: false })

import { createSquash, type Actor, type Squash } from '~/utils/squash/game'
import { useThemeStore } from '~/stores/theme'

useSeoMeta({
  title: 'Squash · Engage',
  description: 'Tap the brown ones. Never the glow. A one-thumb wall on Entertrainer.',
  ogUrl: 'https://entertrainer.in/engage/squash'
})

const BEST_KEY = 'entertrainer-squash-best'
const theme = useThemeStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const phase = ref<'title' | 'playing' | 'paused' | 'over'>('title')
const score = ref(0)
const best = ref(0)
const combo = ref(1)
const fever = ref(0)
const pop = ref('')
const newBest = ref(false)

let game: Squash | null = null
let raf = 0
let last = 0
let wall: HTMLCanvasElement | null = null
let shake = 0
let audioCtx: AudioContext | null = null
let popTimer = 0
const images: Record<string, HTMLImageElement> = {}
const buffers: Record<string, AudioBuffer> = {}
let themeSource: AudioBufferSourceNode | null = null
let themeGain: GainNode | null = null
const muted = ref(false)
const MUTE_KEY = 'entertrainer-squash-mute'
const SFX = [
  'squish_01', 'squish_02', 'squish_03', 'squish_04', 'squish_05', 'squish_06',
  'squishpop', 'splat', 'theme'
]

const sources: Record<string, string> = {
  roach: '/squash/roach_crawl.png',
  nymph: '/squash/nymph_crawl.png',
  radio: '/squash/radio_crawl.png',
  roachBurst: '/squash/roach_burst.png',
  nymphBurst: '/squash/nymph_burst.png',
  flare: '/squash/radio_flare.png',
  ripple: '/squash/tap_ripple.png',
  wallLight: '/squash/wall_light_plain.png',
  wallDark: '/squash/wall_dark_plain.png',
  crackLight: '/squash/wall_light_crack.png',
  crackDark: '/squash/wall_dark_crack.png',
  stainLight: '/squash/wall_light_stain.png',
  stainDark: '/squash/wall_dark_stain.png'
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(src))
    img.src = src
  })
}

function ensureAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AC) audioCtx = new AC()
  }
  if (audioCtx?.state === 'suspended') void audioCtx.resume()
  return audioCtx
}

function playBuf(name: string, gain = 0.7) {
  const ctx = ensureAudio()
  const buf = buffers[name]
  if (!ctx || !buf || muted.value) return
  const src = ctx.createBufferSource()
  const g = ctx.createGain()
  src.buffer = buf
  g.gain.value = gain
  src.connect(g)
  g.connect(ctx.destination)
  src.start()
}

function squashHit(clean: boolean) {
  const pool = clean
    ? ['squishpop', 'splat', 'squish_03']
    : ['squish_01', 'squish_02', 'squish_04', 'squish_05', 'squish_06']
  playBuf(pool[Math.floor(Math.random() * pool.length)], clean ? 0.85 : 0.78)
}

function startTheme() {
  const ctx = ensureAudio()
  const buf = buffers.theme
  if (!ctx || !buf) return
  stopTheme()
  themeGain = ctx.createGain()
  themeGain.gain.value = muted.value ? 0 : 0.28
  themeSource = ctx.createBufferSource()
  themeSource.buffer = buf
  themeSource.loop = true
  themeSource.connect(themeGain)
  themeGain.connect(ctx.destination)
  themeSource.start()
}

function stopTheme() {
  try { themeSource?.stop() } catch { /* already stopped */ }
  themeSource = null
}

function toggleMute(event?: Event) {
  event?.stopPropagation()
  event?.preventDefault()
  muted.value = !muted.value
  if (themeGain) themeGain.gain.value = muted.value ? 0 : 0.28
  try { localStorage.setItem(MUTE_KEY, muted.value ? '1' : '0') } catch { /* private */ }
}

function paintWall() {
  const canvas = canvasRef.value
  const plain = images[theme.theme === 'dark' ? 'wallDark' : 'wallLight']
  const crack = images[theme.theme === 'dark' ? 'crackDark' : 'crackLight']
  const stain = images[theme.theme === 'dark' ? 'stainDark' : 'stainLight']
  if (!canvas || !plain || !crack || !stain) return
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  wall = document.createElement('canvas')
  wall.width = width
  wall.height = height
  const ctx = wall.getContext('2d')
  if (!ctx) return
  let n = 0
  for (let y = 0; y < height; y += 128) {
    for (let x = 0; x < width; x += 128) {
      n += 1
      const img = n % 13 === 0 ? crack : n % 9 === 0 ? stain : plain
      ctx.drawImage(img, x, y, 128, 128)
    }
  }
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  game?.resize(width, height)
  paintWall()
}

function sheetFor(actor: Actor) {
  if (actor.anim === 'ripple') return images.ripple
  if (actor.anim === 'flare') return images.flare
  if (actor.anim === 'burst') return actor.kind === 'nymph' ? images.nymphBurst : images.roachBurst
  if (actor.kind === 'radio') return images.radio
  if (actor.kind === 'nymph') return images.nymph
  return images.roach
}

function draw(actors: Actor[]) {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return
  const dpr = canvas.width / canvas.clientWidth
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.imageSmoothingEnabled = true
  const jx = shake > 0 ? (Math.random() - 0.5) * 4 : 0
  const jy = shake > 0 ? (Math.random() - 0.5) * 4 : 0
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
  if (wall) ctx.drawImage(wall, jx, jy)
  const ordered = [...actors].sort((a, b) => Number(a.anim !== 'crawl') - Number(b.anim !== 'crawl'))
  for (const actor of ordered) {
    const img = sheetFor(actor)
    if (!img) continue
    const heading = actor.anim === 'crawl' ? actor.heading : 0
    const sx = actor.frame * 192
    const sy = heading * 192
    const size = actor.anim === 'ripple' ? 150 : actor.draw
    ctx.drawImage(img, sx, sy, 192, 192, actor.x - size / 2 + jx, actor.y - size / 2 + jy, size, size)
  }
}

function loop(now: number) {
  raf = requestAnimationFrame(loop)
  const dt = last ? (now - last) / 1000 : 0
  last = now
  if (shake > 0) shake = Math.max(0, shake - dt)
  game?.update(dt)
  const snap = game?.snapshot()
  if (!snap) return
  phase.value = snap.phase
  score.value = snap.score
  combo.value = snap.combo
  fever.value = snap.fever
  draw(snap.actors)
}

function showPop(text: string) {
  pop.value = text
  window.clearTimeout(popTimer)
  popTimer = window.setTimeout(() => {
    pop.value = ''
  }, 420)
}

function playNow() {
  if (!game) return
  ensureAudio()
  game.start()
  newBest.value = false
  startTheme()
  const snap = game.snapshot()
  phase.value = snap.phase
  score.value = snap.score
}

function onPointer(event: PointerEvent) {
  if (!game) return
  if (phase.value !== 'playing') return
  ensureAudio()
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const result = game.tap(event.clientX - rect.left, event.clientY - rect.top)
  const snap = game.snapshot()
  phase.value = snap.phase
  score.value = snap.score
  combo.value = snap.combo
  fever.value = snap.fever
  if (result.type === 'kill') {
    shake = 0.1
    squashHit(result.clean)
    if (result.fever) playBuf('squishpop', 0.9)
    showPop(result.clean ? 'Clean' : `+${result.points}`)
    try { navigator.vibrate?.(14) } catch { /* no actuator */ }
  } else if (result.type === 'dead') {
    shake = 0.2
    playBuf('splat', 0.95)
    stopTheme()
    if (score.value > best.value) {
      best.value = score.value
      newBest.value = true
      try { localStorage.setItem(BEST_KEY, String(best.value)) } catch { /* private */ }
    } else {
      newBest.value = false
    }
    try { navigator.vibrate?.(32) } catch { /* no actuator */ }
  } else if (result.type === 'miss') {
    playBuf('squish_05', 0.25)
  }
}

function onPause(event: Event) {
  event.stopPropagation()
  event.preventDefault()
  game?.togglePause()
  phase.value = game?.snapshot().phase ?? phase.value
}

function onTheme(event: Event) {
  event.stopPropagation()
  event.preventDefault()
  theme.toggle()
  paintWall()
}

onMounted(async () => {
  try {
    best.value = Number(localStorage.getItem(BEST_KEY) || 0) || 0
  } catch {
    best.value = 0
  }
  try { muted.value = localStorage.getItem(MUTE_KEY) === '1' } catch { muted.value = false }
  const canvas = canvasRef.value
  if (!canvas) return
  game = createSquash(canvas.clientWidth || 390, canvas.clientHeight || 700)
  await Promise.all(Object.entries(sources).map(async ([key, src]) => {
    images[key] = await loadImage(src)
  }))
  const ctx = ensureAudio()
  if (ctx) {
    await Promise.all(SFX.map(async (name) => {
      const res = await fetch(`/squash/sfx/${name}.mp3`)
      const raw = await res.arrayBuffer()
      buffers[name] = await ctx.decodeAudioData(raw.slice(0))
    }))
  }
  resize()
  window.addEventListener('resize', resize)
  raf = requestAnimationFrame(loop)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
  window.clearTimeout(popTimer)
  stopTheme()
  if (audioCtx) void audioCtx.close().catch(() => {})
})
</script>

<template>
  <div class="sq" :data-sq-theme="theme.theme">
    <NuxtLink to="/engage" class="sq__icon sq__back" aria-label="Back to Engage" @pointerdown.stop>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
    </NuxtLink>
    <button
      v-if="phase === 'playing' || phase === 'paused'"
      type="button"
      class="sq__icon sq__pause"
      :aria-label="phase === 'paused' ? 'Resume' : 'Pause'"
      @pointerdown.stop.prevent="onPause"
    >
      <span v-if="phase === 'paused'" class="sq__play" aria-hidden="true" />
      <span v-else class="sq__bars" aria-hidden="true" />
    </button>
    <button
      type="button"
      class="sq__icon sq__mute"
      :aria-label="muted ? 'Unmute' : 'Mute'"
      @pointerdown.stop.prevent="toggleMute"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path v-if="!muted" d="M4 10v4h3l4 3V7L7 10H4Zm11 1.5a2.5 2.5 0 0 1 0 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path v-else d="M4 10v4h3l4 3V7L7 10H4ZM16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </button>
    <button
      type="button"
      class="sq__icon sq__theme"
      :aria-label="`Switch to ${theme.theme === 'dark' ? 'light' : 'dark'} mode`"
      @pointerdown.stop.prevent="onTheme"
    >
      <EdSignalIcon :name="theme.theme === 'dark' ? 'sun' : 'moon'" />
    </button>

    <div class="sq__hud" :class="{ 'is-on': phase === 'playing' || phase === 'paused' }">
      <strong class="sq__score">{{ score }}</strong>
      <span v-if="fever > 0" class="sq__fever">Fever</span>
      <span v-else-if="combo > 1" class="sq__combo">×{{ combo }}</span>
    </div>
    <p v-if="pop && phase === 'playing'" class="sq__pop">{{ pop }}</p>

    <div class="sq__stage" @pointerdown.prevent="onPointer">
      <canvas ref="canvasRef" class="sq__canvas" aria-label="Squash. Tap the brown bugs. Never the glow." />

      <div v-if="phase === 'title'" class="sq__overlay">
        <p class="sq__eyebrow">Engage</p>
        <h1 class="sq__title">Squash</h1>
        <p class="sq__lede">Brown bugs score. The yellow glow ends the run. Best · {{ best }}</p>
        <button class="sq__cta" type="button" @pointerdown.stop.prevent="playNow">Play</button>
      </div>

      <div v-else-if="phase === 'paused'" class="sq__overlay">
        <h1 class="sq__title sq__title--small">Paused</h1>
        <button class="sq__cta" type="button" @pointerdown.stop.prevent="onPause">Resume</button>
      </div>

      <div v-else-if="phase === 'over'" class="sq__overlay">
        <p v-if="newBest" class="sq__badge">Best</p>
        <p v-else class="sq__eyebrow">The glow</p>
        <h1 class="sq__title sq__title--score">{{ score }}</h1>
        <p class="sq__lede">Best · {{ best }}</p>
        <button class="sq__cta" type="button" @pointerdown.stop.prevent="playNow">Again</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sq {
  --sq-paper: #fbf8ef;
  --sq-ink: #161618;
  --sq-yellow: #ffd43b;
  position: relative;
  width: 100%;
  height: 100svh;
  height: 100dvh;
  background: var(--sq-paper);
  color: var(--sq-ink);
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.sq[data-sq-theme='dark'] {
  --sq-paper: #121214;
  --sq-ink: #ede6d6;
  --sq-yellow: #e8c547;
}
.sq__stage { position: absolute; inset: 0; touch-action: none; }
.sq__canvas { display: block; width: 100%; height: 100%; touch-action: none; }
.sq__icon {
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
  background: color-mix(in srgb, var(--sq-paper) 62%, transparent);
  color: color-mix(in srgb, var(--sq-ink) 72%, transparent);
  text-decoration: none;
  cursor: pointer;
  backdrop-filter: blur(6px);
}
.sq__back { left: max(10rem, env(safe-area-inset-left)); }
.sq__back svg { width: 20rem; height: 20rem; fill: none; stroke: currentColor; stroke-width: 2.25; stroke-linecap: round; stroke-linejoin: round; }
.sq__mute { right: max(62rem, calc(env(safe-area-inset-right) + 52rem)); }
.sq__mute svg { width: 18rem; height: 18rem; }
.sq__theme { right: max(10rem, env(safe-area-inset-right)); }
.sq__theme :deep(svg) { width: 18rem; height: 18rem; fill: none; stroke: currentColor; stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; }
.sq__pause { right: max(62rem, calc(env(safe-area-inset-right) + 52rem)); }
.sq__bars, .sq__play { display: block; }
.sq__bars { width: 12rem; height: 14rem; border-left: 3rem solid currentColor; border-right: 3rem solid currentColor; }
.sq__play { width: 0; height: 0; border-top: 7rem solid transparent; border-bottom: 7rem solid transparent; border-left: 11rem solid currentColor; margin-left: 2rem; }
.sq__hud {
  position: absolute;
  z-index: 5;
  top: max(62rem, calc(env(safe-area-inset-top) + 52rem));
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rem;
  pointer-events: none;
  opacity: 0;
}
.sq__hud.is-on { opacity: 1; }
.sq__score {
  font: 700 clamp(56rem, 16vw, 88rem)/0.9 var(--font-display);
  letter-spacing: -0.06em;
  font-variant-numeric: tabular-nums;
}
.sq__combo, .sq__fever {
  font: 800 12rem/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 6rem 10rem;
  border-radius: 999px;
  background: var(--sq-ink);
  color: var(--sq-yellow);
}
.sq__pop {
  position: absolute;
  z-index: 6;
  top: 42%;
  left: 0;
  right: 0;
  margin: 0;
  text-align: center;
  pointer-events: none;
  font: 800 22rem/1 var(--font-display);
  letter-spacing: -0.04em;
  color: var(--sq-ink);
}
.sq__overlay {
  position: absolute;
  inset: 0;
  z-index: 8;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 12rem;
  padding: 28rem 24rem;
  text-align: center;
  background: color-mix(in srgb, var(--sq-paper) 46%, transparent);
  pointer-events: none;
}
.sq__overlay .sq__cta { pointer-events: auto; }
.sq__eyebrow {
  margin: 0;
  font: 800 11rem/1 var(--font-mono);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  opacity: 0.72;
}
.sq__title {
  margin: 0;
  font: 700 clamp(72rem, 22vw, 120rem)/0.84 var(--font-display);
  letter-spacing: -0.07em;
}
.sq__title--small { font-size: clamp(48rem, 14vw, 72rem); }
.sq__title--score { font-variant-numeric: tabular-nums; }
.sq__lede {
  margin: 0 0 6rem;
  max-width: 22ch;
  font-size: 16rem;
  line-height: 1.4;
  opacity: 0.84;
}
.sq__badge {
  margin: 0;
  font: 800 10rem/1 var(--font-mono);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 6rem 10rem;
  border-radius: 999px;
  background: var(--sq-ink);
  color: var(--sq-yellow);
}
.sq__cta {
  appearance: none;
  border: none;
  background: var(--sq-yellow);
  color: #161618;
  font: 800 15rem/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 18rem 36rem;
  border-radius: 999px;
  cursor: pointer;
}
.sq__icon:focus-visible, .sq__cta:focus-visible { outline: 2px solid var(--sq-ink); outline-offset: 3px; }
</style>
