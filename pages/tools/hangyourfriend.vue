<script setup lang="ts">
import { Rope } from '~/utils/hang/rope'
import { HangCharacter, type ReactKind, type DeathStyle } from '~/utils/hang/character'
import { computeLayout, drawBackground, drawBacklight, drawTrees, drawGround, drawGallows, drawFog, drawIris, Atmosphere, type Layout } from '~/utils/hang/scene'
import { HangAudio } from '~/utils/hang/audio'
import { randomCard } from '~/utils/hang/words'
import { clamp, lerp, easeInCubic, easeInOutCubic } from '~/utils/hang/math'

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
  description: 'A dark-humor twist on Hangman drawn as a 1930s rubber-hose cartoon — sepia film grain, a physics-accurate rope and fully procedural sound, all in code. Set the word and three clues, then watch your friend sweat.',
  ogTitle: 'HangYourFriend',
  ogDescription: 'Darkly funny multiplayer Hangman as a 1930s rubber-hose cartoon, with a real Verlet-physics rope and procedural sound.'
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

// Procedural soundtrack: wind + crackle ambience and per-event stings.
const audio = new HangAudio()
const soundOn = ref(true)
function toggleSound() {
  soundOn.value = !soundOn.value
  audio.unlock()
  audio.setMuted(!soundOn.value)
  if (soundOn.value) audio.startAmbience()
}

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
let neckKickX = 0, twitchTimer = 0, swingSign = 0
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
    if (deathT > T.hang && char.state === 'FALLING') { char.setState('HANGING'); audio.snap() }
    // The "twitch" ending shudders periodically before finally going still.
    if (ending === 'twitch' && char.state === 'HANGING') {
      twitchTimer -= dt
      if (twitchTimer <= 0) { char.twitch(); audio.creak(0.9); twitchTimer = 0.45 + Math.random() * 0.6 }
    }
    if (deathT > T.limp && char.state === 'HANGING') { char.setState('LIMP'); audio.sadSting() }
    if (deathT > T.done && phase.value === 'play') phase.value = 'result'
    const last = rope.last
    speed = Math.hypot(last.x - last.ox, last.y - last.oy)
    neckX = last.x; neckY = last.y; ang = rope.endAngle(); footY = null
    // A wooden creak at each swing apex, louder with speed.
    if (char.state === 'HANGING' || char.state === 'LIMP') {
      const sg = Math.sign(last.x - last.ox)
      if (sg !== 0 && sg !== swingSign) {
        if (swingSign !== 0) audio.creak(clamp(speed / 5, 0.12, 1))
        swingSign = sg
      }
    }
  }

  rope.update()
  char.update(dt, { wrongFrac: wf, speed, groundY: L.groundY })
}

function render() {
  if (!ctx) return
  drawBackground(ctx, W, H, t)
  drawTrees(ctx, L, Math.sin(t * 0.1) * 8)
  drawBacklight(ctx, L)
  drawGround(ctx, L)
  drawGallows(ctx, L, platformDrop)
  rope.draw(ctx)
  char.draw(ctx, neckX, neckY, ang, L.s, footY)
  drawFog(ctx, L, t)
  atmo.draw(ctx, W, H, t)

  // The old-film iris closes on the face at the end of a round.
  let irisP = 0
  if (status.value === 'lost') {
    const T = END_TIMES[ending]
    irisP = clamp((deathT - T.limp) / (T.done - T.limp), 0, 1)
  } else if (status.value === 'won') {
    irisP = clamp((endT - 0.7) / 1.0, 0, 1)
  }
  if (irisP > 0) {
    const cx = neckX, cy = neckY - 48 * L.s
    const maxR = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy))
    drawIris(ctx, W, H, cx, cy, lerp(maxR, 92 * L.s, easeInOutCubic(irisP)))
  }
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
  audio.unlock()
  if (soundOn.value) audio.startAmbience()
}

function beginGuessing() {
  phase.value = 'play'
  audio.unlock()
  if (soundOn.value) audio.startAmbience()
}

function guess(letter: string) {
  if (phase.value !== 'play' || status.value !== 'playing' || guessed.value.includes(letter)) return
  audio.unlock()
  guessed.value.push(letter)
  if (word.value.includes(letter)) {
    audio.right(guessed.value.filter(l => word.value.includes(l)).length - 1)
    if (solved.value) { status.value = 'won'; endT = 0; audio.win() }
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
    audio.trapdoor()
  } else {
    // Non-fatal wrong guess: escalating flinch + a jolt through the rope.
    char.react(REACTIONS[Math.min(wrong.value - 1, REACTIONS.length - 1)])
    neckKickX = (Math.random() < 0.5 ? -1 : 1) * (4 + wrong.value) * L.s
    audio.wrong(wrong.value)
  }
}

function rematch() {
  phase.value = 'setup'; status.value = 'playing'; guessed.value = []
  platformDrop = 0; deathT = 0; endT = 0; ropeReleased = false
  neckKickX = 0; twitchTimer = 0; swingSign = 0; ending = 'swing'
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
  audio.dispose()
})
</script>

<template>
  <div ref="host" class="hy">
    <canvas ref="cv" class="hy__canvas" aria-hidden="true" />

    <header class="hy__top">
      <div class="hy__brand"><span class="hy__brand-dot" /> HANGYOURFRIEND</div>
      <div class="hy__top-right">
        <button type="button" class="hy__exit" :aria-pressed="soundOn" @click="toggleSound">
          {{ soundOn ? '♪ Sound on' : '♪ Muted' }}
        </button>
        <NuxtLink to="/" class="hy__exit" aria-label="Leave">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
          Exit
        </NuxtLink>
      </div>
    </header>

    <!-- SETUP -->
    <div v-if="phase === 'setup'" class="hy__center">
      <div class="hy__panel hy__setup">
        <p class="hy__eyebrow">A darkly funny hangman &mdash; in glorious sepiavision</p>
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
/* Vintage title-card HUD: sepia paper world, black intertitle cards with a
   double cream frame, serif type, dusty poster red. */
.hy {
  position: fixed; inset: 0; overflow: hidden;
  background: #cbbc95; color: #241a10;
  font-family: Georgia, 'Iowan Old Style', 'Times New Roman', serif;
  --ink: #f0e5c6;            /* cream text on the cards */
  --paper-ink: #241a10;      /* ink text over the paper canvas */
  --muted: #b9ab88;
  --danger: #a03d2d;
  --accent: #cf6a50;         /* the same red, lifted for dark cards */
  --card: rgba(26, 18, 10, 0.94);
  --line: rgba(240, 229, 198, 0.28);
  --mono: ui-monospace, 'Courier New', monospace;
}
.hy__canvas { position: absolute; inset: 0; display: block; }

.hy__top {
  position: absolute; top: 0; left: 0; right: 0; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  padding: calc(14rem + var(--safe-top)) 20rem 14rem;
}
.hy__brand { display: inline-flex; align-items: center; gap: 9rem; font-size: 13.5rem; font-weight: 700; letter-spacing: 0.18em; color: var(--paper-ink); }
.hy__brand-dot { width: 8rem; height: 8rem; border-radius: 50%; background: var(--danger); box-shadow: 0 0 10rem rgba(160, 61, 45, 0.7); }
.hy__top-right { display: flex; gap: 8rem; }
.hy__exit {
  display: inline-flex; align-items: center; gap: 5rem; font-size: 12rem; color: #4a3a22;
  font-family: var(--mono); padding: 6rem 11rem; border: 1px solid rgba(56, 42, 22, 0.4);
  border-radius: 999rem; background: rgba(240, 231, 205, 0.4); cursor: pointer;
}
@media (hover: hover) { .hy__exit:hover { color: var(--paper-ink); border-color: rgba(56, 42, 22, 0.7); } }

.hy__center { position: absolute; inset: 0; z-index: 8; display: flex; align-items: center; justify-content: center; padding: 24rem; }
.hy__panel {
  width: 100%; max-width: 460rem; background: var(--card); border: 1px solid var(--line);
  border-radius: 8rem; padding: 38rem 34rem;
  box-shadow:
    inset 0 0 0 5rem rgba(26, 18, 10, 1),
    inset 0 0 0 6rem var(--line),
    0 34rem 90rem -44rem rgba(20, 12, 4, 0.95);
}
.hy__eyebrow { font-style: italic; font-size: 12.5rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin-bottom: 12rem; }
.hy__title { font-size: clamp(28rem, 5vw, 40rem); font-weight: 700; line-height: 1.08; letter-spacing: 0.005em; color: var(--ink); }
.hy__sub { margin-top: 14rem; font-size: 14.5rem; line-height: 1.65; color: var(--muted); }
.hy__note { margin-top: 18rem; font-size: 13.5rem; color: var(--muted); font-style: italic; }

.hy__seg { display: flex; gap: 6rem; margin-top: 24rem; padding: 5rem; background: rgba(12, 8, 4, 0.65); border-radius: 8rem; }
.hy__seg button { flex: 1; padding: 11rem; border-radius: 6rem; font-size: 13.5rem; font-weight: 700; color: var(--muted); font-family: inherit; cursor: pointer; }
.hy__seg button.on { background: rgba(240, 229, 198, 0.13); color: var(--ink); }

.hy__form { margin-top: 20rem; }
.hy__label { display: block; font-family: var(--mono); font-size: 10.5rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted); margin: 14rem 0 8rem; }
.hy__input { width: 100%; background: rgba(12, 8, 4, 0.7); border: 1px solid var(--line); border-radius: 6rem; padding: 12rem 14rem; color: var(--ink); font-size: 15rem; margin-bottom: 8rem; letter-spacing: 0.05em; font-family: var(--mono); }
.hy__input:focus { outline: none; border-color: var(--accent); }

.hy__btn {
  display: inline-flex; align-items: center; justify-content: center; margin-top: 24rem; width: 100%;
  padding: 14rem; border-radius: 6rem; background: var(--danger); color: #f6ecd2;
  font-size: 15rem; font-weight: 700; letter-spacing: 0.05em; cursor: pointer; font-family: inherit;
  box-shadow: inset 0 0 0 1.5rem rgba(246, 236, 210, 0.35);
  transition: filter 0.15s ease, transform 0.1s ease;
}
.hy__btn:active { transform: translateY(1px); }
.hy__btn:disabled { opacity: 0.4; cursor: not-allowed; }
@media (hover: hover) { .hy__btn:not(:disabled):hover { filter: brightness(1.12); } }
.hy__btn--ghost { background: transparent; border: 1px solid var(--line); box-shadow: none; color: var(--ink); text-decoration: none; }

.hy__hand-glyph { color: var(--accent); margin-bottom: 8rem; }

/* PLAY HUD */
.hy__clues {
  position: absolute; top: calc(58rem + var(--safe-top)); left: 0; right: 0; z-index: 7;
  display: flex; gap: 10rem; justify-content: center; flex-wrap: wrap; padding: 0 16rem;
}
.hy__clue {
  display: flex; align-items: baseline; gap: 8rem; max-width: 260rem;
  background: var(--card); border: 1px solid var(--line); border-radius: 6rem;
  padding: 10rem 14rem; font-size: 13rem; line-height: 1.45; color: var(--ink);
  font-style: italic;
  box-shadow: inset 0 0 0 3rem rgba(26, 18, 10, 1), inset 0 0 0 4rem rgba(240, 229, 198, 0.18);
}
.hy__clue-n { font-family: var(--mono); font-style: normal; font-size: 11rem; color: var(--accent); }

.hy__hud { position: absolute; left: 0; right: 0; bottom: 0; z-index: 8; padding: 16rem 16rem calc(16rem + var(--safe-bottom)); display: flex; flex-direction: column; align-items: center; gap: 13rem; }
.hy__word { display: flex; flex-wrap: wrap; gap: 8rem; justify-content: center; }
.hy__slot {
  min-width: 30rem; height: 42rem; display: inline-flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-size: 26rem; font-weight: 700; color: var(--paper-ink);
  background: rgba(240, 231, 205, 0.55); border-radius: 5rem 5rem 0 0;
  border-bottom: 3px solid rgba(46, 34, 18, 0.55);
}
.hy__slot.is-space { min-width: 14rem; border: none; background: transparent; }
.hy__slot.is-filled { border-color: var(--danger); }
.hy__mistakes {
  display: flex; align-items: center; gap: 6rem; font-family: var(--mono); font-size: 11.5rem;
  color: #5a4930; background: rgba(240, 231, 205, 0.55); padding: 5rem 12rem; border-radius: 999rem;
}
.hy__mistakes i { width: 9rem; height: 9rem; border-radius: 50%; border: 1.5px solid rgba(46, 34, 18, 0.5); }
.hy__mistakes i.used { background: var(--danger); border-color: var(--danger); }
.hy__num { color: var(--paper-ink); margin-left: 4rem; }

.hy__keyboard { display: flex; flex-direction: column; gap: 7rem; width: 100%; max-width: 500rem; }
.hy__krow { display: flex; gap: 6rem; justify-content: center; }
.hy__key {
  flex: 1; max-width: 44rem; aspect-ratio: 1 / 1.15; border-radius: 6rem;
  background: #241a10; border: 1px solid rgba(240, 229, 198, 0.32); color: #efe3c2;
  font-family: inherit; font-size: 15rem; font-weight: 700; cursor: pointer;
  transition: transform 0.08s ease, background 0.14s ease;
}
@media (hover: hover) { .hy__key:not(:disabled):hover { background: #3a2c1a; } }
.hy__key:active:not(:disabled) { transform: translateY(2px); }
.hy__key.hit { background: #46512f; border-color: #6c7a49; color: #e7ecd0; }
.hy__key.miss { background: #57281c; border-color: var(--danger); color: #e2b9a8; opacity: 0.75; }
.hy__key:disabled { cursor: default; }

.hy__result.won .hy__eyebrow { color: #9aa86a; }
.hy__reveal { margin-top: 16rem; font-size: 15rem; color: var(--muted); }
.hy__reveal b { color: var(--ink); font-family: var(--mono); letter-spacing: 0.1em; }
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
