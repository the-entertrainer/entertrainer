<script setup lang="ts">
import { Rope } from '~/utils/hang/rope'
import { HangCharacter, type ReactKind, type DeathStyle } from '~/utils/hang/character'
import { computeLayout, drawBackground, drawBacklight, drawTrees, drawGround, drawGallows, drawFog, Atmosphere, type Layout } from '~/utils/hang/scene'
import { randomCard } from '~/utils/hang/words'
import { clamp, easeInCubic } from '~/utils/hang/math'

// Every wrong guess plays the next reaction in this escalating list.
const REACTIONS: ReactKind[] = ['flinch', 'gulp', 'shiver', 'dart', 'tug', 'wobble']
// The hang plays out differently each round; timings (seconds) tuned per style.
const ENDINGS: DeathStyle[] = ['swing', 'snap', 'kick', 'twitch']
const END_TIMES: Record<DeathStyle, { hang: number; limp: number; done: number }> = {
  swing:  { hang: 0.55, limp: 3.6, done: 4.6 },
  snap:   { hang: 0.42, limp: 1.7, done: 3.0 },
  kick:   { hang: 0.6,  limp: 4.8, done: 5.8 },
  twitch: { hang: 0.55, limp: 4.2, done: 5.2 }
}

definePageMeta({ layout: false, pageTransition: { name: 'hy-fade', mode: 'out-in' } })
useSeoMeta({
  title: 'HangYourFriend — a darkly funny Hangman · Entertrainer',
  description: 'A dark-humor twist on Hangman with Limbo-style visuals and a physics-accurate rope, drawn entirely in code. Set the word and three clues, then watch your friend guess under pressure.',
  ogTitle: 'HangYourFriend',
  ogDescription: 'Darkly funny multiplayer Hangman with a real Verlet-physics rope, drawn entirely on Canvas.'
})

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']
const MAX_WRONG = 7

type Phase = 'setup' | 'handoff' | 'play' | 'result'
const phase = ref<Phase>('setup')
const status = ref<'playing' | 'won' | 'lost'>('playing')

const word = ref('')
const clues = ref<string[]>(['', '', ''])
const guessed = ref<string[]>([])

const setupMode = ref<'own' | 'random'>('random')
const ownWord = ref('')
const ownClues = ref<string[]>(['', '', ''])

const wrong = computed(() => guessed.value.filter(l => !word.value.includes(l)).length)
const uniqueLetters = computed(() => [...new Set(word.value.split('').filter(c => /[A-Z]/.test(c)))])
const solved = computed(() => uniqueLetters.value.length > 0 && uniqueLetters.value.every(l => guessed.value.includes(l)))
const display = computed(() => word.value.split('').map(c => (/[A-Z]/.test(c) ? (guessed.value.includes(c) || status.value !== 'playing' ? c : '') : c)))

// ── Canvas + loop ────────────────────────────────────────────────────────────
const host = ref<HTMLElement | null>(null)
const cv = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let rope: Rope, char: HangCharacter, atmo: Atmosphere, L: Layout
let W = 0, H = 0, raf = 0, lastT = 0, acc = 0, t = 0
let platformDrop = 0, deathT = 0, endT = 0, speed = 0
let neckX = 0, neckY = 0, ang = Math.PI / 2, footY: number | null = 0
let ropeReleased = false
let neckKickX = 0, twitchTimer = 0
let ending: DeathStyle = 'swing'
const STEP = 1 / 60

function buildWorld() {
  if (!cv.value || !host.value) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  W = host.value.clientWidth; H = host.value.clientHeight
  cv.value.width = W * dpr; cv.value.height = H * dpr
  cv.value.style.width = W + 'px'; cv.value.style.height = H + 'px'
  ctx = cv.value.getContext('2d')
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  L = computeLayout(W, H)
  // Build rope long enough to reach the taut hang point, then pin at the (higher) standing neck so it starts slack.
  rope = new Rope(L.anchorX, L.anchorY, L.standNeckX, L.tautNeckY, 14, { gravity: 0.55, damping: 0.99, iterations: 14 })
  if (!ropeReleased) rope.pinLast(L.standNeckX, L.standNeckY)
  atmo = new Atmosphere(W, H, 34)
}

function step(dt: number) {
  t += dt
  const wf = clamp(wrong.value / MAX_WRONG, 0, 1)

  if (status.value === 'playing') {
    char.setState(wf < 0.3 ? 'IDLE' : wf < 0.6 ? 'NERVOUS' : 'STRUGGLING')
    neckKickX *= Math.pow(0.02, dt) // per-wrong rope jolt settles quickly
    neckX = L.standNeckX + Math.sin(t * 2) * wf * 8 * L.s + neckKickX
    neckY = L.standNeckY
    ang = Math.PI / 2 + Math.sin(t * 2) * wf * 0.05
    footY = L.platformY
    rope.pinLast(neckX, neckY)
  } else if (status.value === 'won') {
    char.setState('ESCAPED')
    neckX = L.standNeckX; neckY = L.standNeckY; ang = Math.PI / 2; footY = L.platformY
    endT += dt
    if (endT > 1.8 && phase.value === 'play') phase.value = 'result'
  } else {
    deathT += dt
    const T = END_TIMES[ending]
    platformDrop = easeInCubic(clamp(deathT / 0.28, 0, 1)) * L.dropDist * 3
    if (deathT > T.hang && char.state === 'FALLING') char.setState('HANGING')
    // The "twitch" ending shudders periodically before finally going still.
    if (ending === 'twitch' && char.state === 'HANGING') {
      twitchTimer -= dt
      if (twitchTimer <= 0) { char.twitch(); twitchTimer = 0.45 + Math.random() * 0.6 }
    }
    if (deathT > T.limp && char.state === 'HANGING') char.setState('LIMP')
    if (deathT > T.done && phase.value === 'play') phase.value = 'result'
    const last = rope.last
    speed = Math.hypot(last.x - last.ox, last.y - last.oy)
    neckX = last.x; neckY = last.y; ang = rope.endAngle(); footY = null
  }

  rope.update()
  char.update(dt, { wrongFrac: wf, speed })
}

function render() {
  if (!ctx) return
  drawBackground(ctx, W, H)
  drawTrees(ctx, L, Math.sin(t * 0.1) * 8)
  drawBacklight(ctx, L)
  drawGround(ctx, L)
  drawFog(ctx, L, t)
  drawGallows(ctx, L, platformDrop)
  rope.draw(ctx)
  char.draw(ctx, neckX, neckY, ang, L.s, footY)
  atmo.draw(ctx, W, H, t)
}

function frame(now: number) {
  const dt = Math.min((now - lastT) / 1000, 0.05); lastT = now
  acc += dt
  let n = 0
  while (acc >= STEP && n < 5) { step(STEP); acc -= STEP; n++ }
  render()
  raf = requestAnimationFrame(frame)
}

// ── Game flow ────────────────────────────────────────────────────────────────
function lockIn() {
  if (setupMode.value === 'own') {
    const w = ownWord.value.toUpperCase().replace(/[^A-Z ]/g, '').trim()
    if (w.replace(/ /g, '').length < 3) return
    word.value = w
    clues.value = ownClues.value.map(c => c.trim())
  } else {
    const c = randomCard()
    word.value = c.word
    clues.value = [...c.clues]
  }
  guessed.value = []
  status.value = 'playing'
  phase.value = setupMode.value === 'own' ? 'handoff' : 'play'
}

function beginGuessing() { phase.value = 'play' }

function guess(letter: string) {
  if (phase.value !== 'play' || status.value !== 'playing' || guessed.value.includes(letter)) return
  guessed.value.push(letter)
  if (word.value.includes(letter)) {
    if (solved.value) { status.value = 'won'; endT = 0 }
  } else if (wrong.value >= MAX_WRONG) {
    // Fatal guess: pick a random ending and release the rope with matching energy.
    ending = ENDINGS[Math.floor(Math.random() * ENDINGS.length)]
    char.setDeathStyle(ending)
    status.value = 'lost'; deathT = 0; twitchTimer = 0.5; ropeReleased = true
    rope.unpinLast()
    const dir = Math.random() < 0.5 ? -1 : 1
    if (ending === 'snap') rope.nudgeLast(dir * 7 * L.s, 9 * L.s)
    else if (ending === 'kick') rope.nudgeLast(dir * 11 * L.s, 2 * L.s)
    else if (ending === 'swing') rope.nudgeLast(dir * 9 * L.s, 2 * L.s)
    else rope.nudgeLast(0, 3 * L.s)
    char.setState('FALLING')
  } else {
    // Non-fatal wrong guess: escalating flinch + a jolt through the rope.
    char.react(REACTIONS[Math.min(wrong.value - 1, REACTIONS.length - 1)])
    neckKickX = (Math.random() < 0.5 ? -1 : 1) * (4 + wrong.value) * L.s
  }
}

function rematch() {
  phase.value = 'setup'; status.value = 'playing'; guessed.value = []
  platformDrop = 0; deathT = 0; endT = 0; ropeReleased = false
  neckKickX = 0; twitchTimer = 0; ending = 'swing'
  char = new HangCharacter()
  buildWorld()
}

function onKey(e: KeyboardEvent) {
  if (phase.value === 'play' && status.value === 'playing' && /^[a-zA-Z]$/.test(e.key)) guess(e.key.toUpperCase())
}
function onResize() { const rel = ropeReleased; buildWorld(); ropeReleased = rel }

onMounted(() => {
  char = new HangCharacter()
  buildWorld()
  lastT = performance.now()
  raf = requestAnimationFrame(frame)
  window.addEventListener('resize', onResize)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="host" class="hy">
    <canvas ref="cv" class="hy__canvas" aria-hidden="true" />

    <header class="hy__top">
      <div class="hy__brand"><span class="hy__brand-dot" /> HANGYOURFRIEND</div>
      <NuxtLink to="/" class="hy__exit" aria-label="Leave">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
        Exit
      </NuxtLink>
    </header>

    <!-- SETUP -->
    <div v-if="phase === 'setup'" class="hy__center">
      <div class="hy__panel hy__setup">
        <p class="hy__eyebrow">A darkly funny Hangman</p>
        <h1 class="hy__title">Set a trap for your friend</h1>
        <p class="hy__sub">Pick a word and three clues. Then hand them the device and watch them sweat. Nobody actually gets hurt. Legally, you can't.</p>

        <div class="hy__seg">
          <button type="button" :class="{ on: setupMode === 'random' }" @click="setupMode = 'random'">Surprise me</button>
          <button type="button" :class="{ on: setupMode === 'own' }" @click="setupMode = 'own'">Set my own</button>
        </div>

        <div v-if="setupMode === 'own'" class="hy__form">
          <label class="hy__label">Secret word</label>
          <input v-model="ownWord" class="hy__input" maxlength="18" placeholder="e.g. GALLOWS" autocomplete="off" spellcheck="false" />
          <label class="hy__label">Three clues</label>
          <input v-for="i in 3" :key="i" v-model="ownClues[i - 1]" class="hy__input" maxlength="60" :placeholder="`Clue ${i}`" autocomplete="off" />
        </div>
        <p v-else class="hy__note">A random word and three ready clues will be dealt from the deck.</p>

        <button type="button" class="hy__btn" :disabled="setupMode === 'own' && ownWord.replace(/[^A-Za-z]/g, '').length < 3" @click="lockIn">
          Lock it in
        </button>
      </div>
    </div>

    <!-- HANDOFF -->
    <div v-else-if="phase === 'handoff'" class="hy__center">
      <div class="hy__panel hy__handoff">
        <div class="hy__hand-glyph" aria-hidden="true">
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 0 1 8-8M20 12a8 8 0 0 1-8 8M8 8l-4 4 4 4M16 8l4 4-4 4"/></svg>
        </div>
        <h2 class="hy__title">Pass it over</h2>
        <p class="hy__sub">Hand the device to your victim. The word is hidden. When they are ready, let them begin.</p>
        <button type="button" class="hy__btn" @click="beginGuessing">I'm the victim. Begin.</button>
      </div>
    </div>

    <!-- PLAY -->
    <template v-else-if="phase === 'play'">
      <div class="hy__clues">
        <div v-for="(c, i) in clues" :key="i" class="hy__clue"><span class="hy__clue-n">{{ i + 1 }}</span>{{ c }}</div>
      </div>

      <div class="hy__hud">
        <div class="hy__word" role="text" :aria-label="`Word, ${display.filter(d => d !== ' ').length} letters`">
          <span v-for="(ch, i) in display" :key="i" class="hy__slot" :class="{ 'is-space': ch === ' ', 'is-filled': ch && ch !== ' ' }">{{ ch === ' ' ? '' : ch || '' }}</span>
        </div>
        <div class="hy__mistakes">
          <span>mistakes</span>
          <i v-for="n in MAX_WRONG" :key="n" :class="{ used: n <= wrong }" />
          <b class="hy__num">{{ wrong }} / {{ MAX_WRONG }}</b>
        </div>

        <div class="hy__keyboard">
          <div v-for="(row, ri) in ROWS" :key="ri" class="hy__krow">
            <button
              v-for="k in row.split('')" :key="k" type="button"
              class="hy__key"
              :class="{ hit: guessed.includes(k) && word.includes(k), miss: guessed.includes(k) && !word.includes(k) }"
              :disabled="guessed.includes(k) || status !== 'playing'"
              @click="guess(k)"
            >{{ k }}</button>
          </div>
        </div>
      </div>
    </template>

    <!-- RESULT -->
    <div v-if="phase === 'result'" class="hy__center">
      <div class="hy__panel hy__result" :class="status === 'won' ? 'won' : 'lost'">
        <p class="hy__eyebrow">{{ status === 'won' ? 'The rope goes slack' : 'The floor gives way' }}</p>
        <h2 class="hy__title">{{ status === 'won' ? 'You escaped' : 'You have been hanged' }}</h2>
        <p class="hy__reveal">The word was <b>{{ word }}</b></p>
        <div class="hy__result-actions">
          <button type="button" class="hy__btn" @click="rematch">Rematch</button>
          <NuxtLink to="/" class="hy__btn hy__btn--ghost">Leave</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hy {
  position: fixed; inset: 0; overflow: hidden;
  background: #0a0c12; color: #d4d4d8;
  font-family: 'Inter', system-ui, sans-serif;
  --ink: #d4d4d8; --muted: #8a8a90; --danger: #8b3a3a; --wood: #4a3728;
  --panel: rgba(18,21,30,0.82); --line: rgba(120,130,150,0.16);
}
.hy__canvas { position: absolute; inset: 0; display: block; }

.hy__top {
  position: absolute; top: 0; left: 0; right: 0; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  padding: calc(14rem + var(--safe-top)) 20rem 14rem;
}
.hy__brand { display: inline-flex; align-items: center; gap: 9rem; font-size: 13rem; font-weight: 700; letter-spacing: 0.16em; color: var(--ink); }
.hy__brand-dot { width: 8rem; height: 8rem; border-radius: 50%; background: var(--danger); box-shadow: 0 0 12rem var(--danger); }
.hy__exit { display: inline-flex; align-items: center; gap: 5rem; font-size: 12rem; color: var(--muted); font-family: ui-monospace, monospace; padding: 6rem 10rem; border: 1px solid var(--line); border-radius: 999rem; }
@media (hover: hover) { .hy__exit:hover { color: var(--ink); } }

.hy__center { position: absolute; inset: 0; z-index: 8; display: flex; align-items: center; justify-content: center; padding: 24rem; }
.hy__panel {
  width: 100%; max-width: 460rem; background: var(--panel); border: 1px solid var(--line);
  border-radius: 18rem; padding: 34rem 30rem; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 40rem 100rem -50rem #000;
}
.hy__eyebrow { font-family: ui-monospace, monospace; font-size: 11.5rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--danger); margin-bottom: 12rem; }
.hy__title { font-size: clamp(28rem, 5vw, 40rem); font-weight: 800; line-height: 1.05; letter-spacing: -0.02em; color: var(--ink); }
.hy__sub { margin-top: 14rem; font-size: 14.5rem; line-height: 1.6; color: var(--muted); }
.hy__note { margin-top: 18rem; font-size: 13.5rem; color: var(--muted); }

.hy__seg { display: flex; gap: 6rem; margin-top: 24rem; padding: 5rem; background: rgba(10,12,18,0.6); border-radius: 12rem; }
.hy__seg button { flex: 1; padding: 11rem; border-radius: 9rem; font-size: 13.5rem; font-weight: 600; color: var(--muted); }
.hy__seg button.on { background: rgba(120,130,150,0.14); color: var(--ink); }

.hy__form { margin-top: 20rem; }
.hy__label { display: block; font-family: ui-monospace, monospace; font-size: 10.5rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin: 14rem 0 8rem; }
.hy__input { width: 100%; background: rgba(10,12,18,0.7); border: 1px solid var(--line); border-radius: 10rem; padding: 12rem 14rem; color: var(--ink); font-size: 15rem; margin-bottom: 8rem; letter-spacing: 0.04em; }
.hy__input:focus { outline: none; border-color: var(--danger); }

.hy__btn {
  display: inline-flex; align-items: center; justify-content: center; margin-top: 24rem; width: 100%;
  padding: 14rem; border-radius: 11rem; background: var(--danger); color: #fff;
  font-size: 15rem; font-weight: 700; letter-spacing: 0.02em; cursor: pointer;
  transition: filter 0.15s ease, transform 0.1s ease;
}
.hy__btn:active { transform: translateY(1px); }
.hy__btn:disabled { opacity: 0.4; cursor: not-allowed; }
@media (hover: hover) { .hy__btn:not(:disabled):hover { filter: brightness(1.12); } }
.hy__btn--ghost { background: transparent; border: 1px solid var(--line); color: var(--ink); text-decoration: none; }

.hy__hand-glyph { color: var(--danger); margin-bottom: 8rem; }

/* PLAY HUD */
.hy__clues {
  position: absolute; top: calc(58rem + var(--safe-top)); left: 0; right: 0; z-index: 7;
  display: flex; gap: 10rem; justify-content: center; flex-wrap: wrap; padding: 0 16rem;
}
.hy__clue {
  display: flex; align-items: baseline; gap: 8rem; max-width: 260rem;
  background: var(--panel); border: 1px solid var(--line); border-radius: 12rem;
  padding: 10rem 14rem; font-size: 13rem; line-height: 1.4; color: var(--ink);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
}
.hy__clue-n { font-family: ui-monospace, monospace; font-size: 11rem; color: var(--danger); }

.hy__hud { position: absolute; left: 0; right: 0; bottom: 0; z-index: 8; padding: 16rem 16rem calc(16rem + var(--safe-bottom)); display: flex; flex-direction: column; align-items: center; gap: 14rem; }
.hy__word { display: flex; flex-wrap: wrap; gap: 8rem; justify-content: center; }
.hy__slot {
  min-width: 30rem; height: 42rem; display: inline-flex; align-items: center; justify-content: center;
  font-family: ui-monospace, monospace; font-size: 26rem; font-weight: 700; color: var(--ink);
  border-bottom: 3px solid rgba(120,130,150,0.4);
}
.hy__slot.is-space { min-width: 14rem; border: none; }
.hy__slot.is-filled { border-color: var(--danger); }
.hy__mistakes { display: flex; align-items: center; gap: 6rem; font-family: ui-monospace, monospace; font-size: 11.5rem; color: var(--muted); }
.hy__mistakes i { width: 9rem; height: 9rem; border-radius: 50%; border: 1.5px solid rgba(120,130,150,0.4); }
.hy__mistakes i.used { background: var(--danger); border-color: var(--danger); }
.hy__num { color: var(--ink); margin-left: 4rem; }

.hy__keyboard { display: flex; flex-direction: column; gap: 7rem; width: 100%; max-width: 500rem; }
.hy__krow { display: flex; gap: 6rem; justify-content: center; }
.hy__key {
  flex: 1; max-width: 44rem; aspect-ratio: 1 / 1.15; border-radius: 8rem;
  background: rgba(30,35,46,0.9); border: 1px solid var(--line); color: var(--ink);
  font-size: 15rem; font-weight: 600; cursor: pointer; transition: transform 0.08s ease, background 0.14s ease;
}
@media (hover: hover) { .hy__key:not(:disabled):hover { background: rgba(50,56,70,0.95); } }
.hy__key:active:not(:disabled) { transform: translateY(2px); }
.hy__key.hit { background: #2c4a34; border-color: #3f7a52; color: #d7f0dd; }
.hy__key.miss { background: #3a1f1f; border-color: var(--danger); color: #e5b8b8; opacity: 0.7; }
.hy__key:disabled { cursor: default; }

.hy__result.won .hy__eyebrow { color: #4f9d6b; }
.hy__reveal { margin-top: 16rem; font-size: 15rem; color: var(--muted); }
.hy__reveal b { color: var(--ink); font-family: ui-monospace, monospace; letter-spacing: 0.08em; }
.hy__result-actions { display: flex; gap: 10rem; margin-top: 26rem; }
.hy__result-actions .hy__btn { margin-top: 0; }

.hy-fade-enter-active, .hy-fade-leave-active { transition: opacity 0.3s ease; }
.hy-fade-enter-from, .hy-fade-leave-to { opacity: 0; }

@media (max-width: 560px) {
  .hy__clue { font-size: 12rem; max-width: 44%; }
  .hy__slot { min-width: 24rem; font-size: 21rem; height: 36rem; }
  .hy__key { font-size: 13rem; }
}
</style>
