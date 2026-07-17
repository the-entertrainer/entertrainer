<script setup lang="ts">
import { Rope } from '~/utils/hang/rope'
import { Crow } from '~/utils/hang/crow'
import { HangCharacter, type ReactKind, type DeathStyle } from '~/utils/hang/character'
import { computeLayout, drawBackground, drawBacklight, drawTrees, drawGround, drawGallows, drawFog, drawIris, Atmosphere, type Layout } from '~/utils/hang/scene'
import { HangAudio } from '~/utils/hang/audio'
import { randomCard } from '~/utils/hang/words'
import { clamp, lerp, easeInCubic, easeInOutCubic } from '~/utils/hang/math'

definePageMeta({ layout: false, pageTransition: { name: 'hy-fade', mode: 'out-in' } })
useSeoMeta({
  title: 'HangYourFriend — a darkly funny Hangman · Entertrainer',
  description: 'A dark-humor twist on Hangman drawn as a 1930s rubber-hose cartoon — sepia film grain, a physics-accurate rope and fully procedural sound, all in code. Set the word and three clues, then watch your friend sweat.',
  ogTitle: 'HangYourFriend',
  ogDescription: 'Darkly funny multiplayer Hangman as a 1930s rubber-hose cartoon, with a real Verlet-physics rope and procedural sound.'
})

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']
const MAX_WRONG = 7

// Every wrong guess plays the next reaction in this escalating list.
const REACTIONS: ReactKind[] = ['flinch', 'gulp', 'shiver', 'dart', 'tug', 'wobble']
// The hang plays out differently each round; timings (seconds) tuned per style.
const ENDINGS: DeathStyle[] = ['swing', 'snap', 'kick', 'twitch']
const END_TIMES: Record<DeathStyle, { hang: number; limp: number; done: number }> = {
  swing:  { hang: 0.55, limp: 3.6, done: 5.7 },
  snap:   { hang: 0.42, limp: 1.7, done: 4.1 },
  kick:   { hang: 0.6,  limp: 4.8, done: 6.9 },
  twitch: { hang: 0.55, limp: 4.2, done: 6.3 }
}

type Phase = 'title' | 'setup' | 'handoff' | 'play' | 'result'
const phase = ref<Phase>('title')
const status = ref<'playing' | 'won' | 'lost'>('playing')

// Procedural soundtrack: wind + crackle ambience and per-event stings.
const audio = new HangAudio()
const soundOn = ref(true)
function toggleSound() {
  soundOn.value = !soundOn.value
  audio.unlock()
  audio.setMuted(!soundOn.value)
  if (soundOn.value) audio.startAmbience()
}

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

// Screen shake on every miss — pure game juice.
const shaking = ref(false)
let shakeTO: ReturnType<typeof setTimeout> | undefined
function shake() {
  shaking.value = false
  requestAnimationFrame(() => { shaking.value = true })
  clearTimeout(shakeTO)
  shakeTO = setTimeout(() => { shaking.value = false }, 420)
}

// ── Canvas + loop ────────────────────────────────────────────────────────────
const host = ref<HTMLElement | null>(null)
const cv = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let rope: Rope, char: HangCharacter, crow: Crow, atmo: Atmosphere, L: Layout
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
  crow = new Crow(L.beamRightX + 16 * L.s, L.beamY - 10 * L.s, L.anchorX + 32 * L.s)
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
    crow.flyAway()
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
    if (deathT > T.limp && char.state === 'HANGING') { char.setState('LIMP'); audio.sadSting(); audio.ghostRise() }
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
  crow.update(dt, wf)
}

function render() {
  if (!ctx) return
  drawBackground(ctx, W, H, t)
  drawTrees(ctx, L, Math.sin(t * 0.1) * 8)
  drawBacklight(ctx, L)
  drawGround(ctx, L)
  drawGallows(ctx, L, platformDrop)
  crow.draw(ctx, L.s)
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
  // The soul floats up over everything, iris included.
  char.drawGhost(ctx, L.s)
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
function resetWorld() {
  status.value = 'playing'; guessed.value = []
  platformDrop = 0; deathT = 0; endT = 0; ropeReleased = false
  neckKickX = 0; twitchTimer = 0; swingSign = 0; ending = 'swing'
  char = new HangCharacter()
  buildWorld()
}

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

function quickGame() { setupMode.value = 'random'; resetWorld(); lockIn() }
function setTrap() { setupMode.value = 'own'; phase.value = 'setup'; audio.unlock() }
function toMenu() { resetWorld(); phase.value = 'title' }
function playAgain() {
  resetWorld()
  if (setupMode.value === 'own') phase.value = 'setup'
  else lockIn()
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
    crow.excite()
    audio.trapdoor()
    shake()
  } else {
    // Non-fatal wrong guess: escalating flinch + a jolt through the rope,
    // and the crow hops a little closer each time.
    char.react(REACTIONS[Math.min(wrong.value - 1, REACTIONS.length - 1)])
    neckKickX = (Math.random() < 0.5 ? -1 : 1) * (4 + wrong.value) * L.s
    crow.startle()
    audio.wrong(wrong.value)
    if (wrong.value >= 4) audio.caw()
    shake()
  }
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
    <canvas ref="cv" class="hy__canvas" :class="{ 'is-shaking': shaking }" aria-hidden="true" />

    <!-- Persistent corner controls, game-style round buttons -->
    <NuxtLink to="/" class="hy__icon hy__icon--home" aria-label="Leave the game">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 11.5 12 4l9 7.5" /><path d="M6 10v10h12V10" />
      </svg>
    </NuxtLink>
    <button type="button" class="hy__icon hy__icon--sound" :aria-pressed="soundOn" :aria-label="soundOn ? 'Mute sound' : 'Unmute sound'" @click="toggleSound">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 5 6.5 9H3v6h3.5L11 19V5z" />
        <path v-if="soundOn" d="M15.5 9.5a4 4 0 0 1 0 5.5M18 7a8 8 0 0 1 0 10" />
        <path v-else d="m16 9 5 6M21 9l-5 6" />
      </svg>
    </button>

    <Transition name="iris" mode="out-in">
      <!-- TITLE -->
      <div v-if="phase === 'title'" key="title" class="hy__screen hy__screen--title">
        <div class="hy__title-top">
          <h1 class="hy__logo" aria-label="Hang Your Friend">
            <span class="hy__logo-big"><b v-for="(ch, i) in 'HANG'" :key="i" :class="`n${i % 4}`">{{ ch }}</b></span>
            <span class="hy__logo-mid">your</span>
            <span class="hy__logo-big"><b v-for="(ch, i) in 'FRIEND'" :key="i" :class="`n${(i + 2) % 4}`">{{ ch }}</b></span>
          </h1>
          <p class="hy__tagline">A darkly funny hangman picture &mdash; in glorious sepiavision</p>
        </div>
        <div class="hy__title-bottom">
          <div class="hy__menu">
            <button type="button" class="hy__mbtn hy__mbtn--primary" @click="quickGame">&#9656;&nbsp; Quick game</button>
            <button type="button" class="hy__mbtn" @click="setTrap">Set a trap for a friend</button>
          </div>
          <p class="hy__studio">&copy; 1931 Entertrainer Pictures &middot; no friends were harmed</p>
        </div>
      </div>

      <!-- SETUP: write the trap -->
      <div v-else-if="phase === 'setup'" key="setup" class="hy__screen hy__screen--center">
        <div class="hy__card">
          <p class="hy__eyebrow">Strictly between us</p>
          <h2 class="hy__h2">Write the trap</h2>
          <label class="hy__label">Secret word</label>
          <input v-model="ownWord" class="hy__input" maxlength="18" placeholder="e.g. GALLOWS" autocomplete="off" spellcheck="false" />
          <label class="hy__label">Three clues</label>
          <input v-for="i in 3" :key="i" v-model="ownClues[i - 1]" class="hy__input" maxlength="60" :placeholder="`Clue ${i}`" autocomplete="off" />
          <div class="hy__row">
            <button type="button" class="hy__mbtn" @click="toMenu">Back</button>
            <button type="button" class="hy__mbtn hy__mbtn--primary" :disabled="ownWord.replace(/[^A-Za-z]/g, '').length < 3" @click="lockIn">Lock it in</button>
          </div>
        </div>
      </div>

      <!-- HANDOFF -->
      <div v-else-if="phase === 'handoff'" key="handoff" class="hy__screen hy__screen--center">
        <div class="hy__card hy__card--center">
          <div class="hy__hand-glyph" aria-hidden="true">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 0 1 8-8M20 12a8 8 0 0 1-8 8M8 8l-4 4 4 4M16 8l4 4-4 4" /></svg>
          </div>
          <h2 class="hy__h2">Pass it over</h2>
          <p class="hy__cardsub">Hand the device to your victim. The word is hidden. When they are ready, let them begin.</p>
          <button type="button" class="hy__mbtn hy__mbtn--primary hy__mbtn--full" @click="beginGuessing">I'm the victim &mdash; begin</button>
        </div>
      </div>

      <!-- PLAY -->
      <div v-else-if="phase === 'play'" key="play" class="hy__screen">
        <div class="hy__clues">
          <div v-for="(c, i) in clues" :key="i" class="hy__clue"><span class="hy__clue-n">N&ordm;{{ i + 1 }}</span>{{ c }}</div>
        </div>

        <div class="hy__hud">
          <div class="hy__word" role="text" :aria-label="`Word, ${display.filter(d => d !== ' ').length} letters`">
            <span v-for="(ch, i) in display" :key="i" class="hy__slot" :class="{ 'is-space': ch === ' ', 'is-filled': ch && ch !== ' ' }">{{ ch === ' ' ? '' : ch || '' }}</span>
          </div>
          <div class="hy__lives" :class="{ 'is-danger': wrong >= MAX_WRONG - 2 }" :aria-label="`${wrong} of ${MAX_WRONG} mistakes`">
            <svg v-for="n in MAX_WRONG" :key="n" class="hy__noose" :class="{ used: n <= wrong }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
              <path d="M12 2v4" /><circle cx="12" cy="13" r="6.5" />
            </svg>
            <b class="hy__num">{{ wrong }}/{{ MAX_WRONG }}</b>
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
      </div>

      <!-- RESULT -->
      <div v-else key="result" class="hy__screen hy__screen--center">
        <div class="hy__end">
          <p class="hy__eyebrow hy__end-eyebrow">{{ status === 'won' ? 'The rope goes slack' : 'The floor gives way' }}</p>
          <h2 class="hy__logo hy__logo--end" :aria-label="status === 'won' ? 'You escaped' : 'Game over'">
            <span class="hy__logo-big"><b v-for="(ch, i) in (status === 'won' ? 'YOU' : 'GAME')" :key="i" :class="`n${i % 4}`">{{ ch }}</b></span>
            <span class="hy__logo-big"><b v-for="(ch, i) in (status === 'won' ? 'ESCAPED' : 'OVER')" :key="'b' + i" :class="`n${(i + 1) % 4}`">{{ ch }}</b></span>
          </h2>
          <p class="hy__ticket">The word was <b>{{ word }}</b></p>
          <div class="hy__menu">
            <button type="button" class="hy__mbtn hy__mbtn--primary" @click="playAgain">&#9656;&nbsp; Play again</button>
            <button type="button" class="hy__mbtn" @click="toMenu">Menu</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* A native-game shell over the sepia cartoon world: hand-lettered title,
   iris-wipe screen transitions, round icon controls, chunky letter tiles,
   arcade keys with a 3D ledge, noose lives, ticket-stub clues. */
.hy {
  position: fixed; inset: 0; overflow: hidden;
  background: #cbbc95; color: #241a10;
  font-family: Georgia, 'Iowan Old Style', 'Times New Roman', serif;
  --ink: #241a10;
  --cream: #f0e5c6;
  --danger: #a03d2d;
  --mono: ui-monospace, 'Courier New', monospace;
}
.hy__canvas { position: absolute; inset: 0; display: block; }
.hy__canvas.is-shaking { animation: hy-shake 0.38s linear; }
@keyframes hy-shake {
  12% { translate: -7rem 3rem; } 28% { translate: 6rem -4rem; }
  46% { translate: -5rem 2rem; } 64% { translate: 4rem -2rem; }
  82% { translate: -2rem 1rem; } 100% { translate: 0 0; }
}

/* ── Corner icon buttons ─────────────────────────────────────────────────── */
.hy__icon {
  position: absolute; z-index: 20; top: calc(14rem + var(--safe-top));
  width: 44rem; height: 44rem; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--ink); color: var(--cream);
  border: 2rem solid var(--cream);
  box-shadow: 0 0 0 2.5rem var(--ink), 0 5rem 0 2.5rem #17100a;
  cursor: pointer; transition: transform 0.08s ease, box-shadow 0.08s ease;
}
.hy__icon:active { transform: translateY(3rem); box-shadow: 0 0 0 2.5rem var(--ink), 0 2rem 0 2.5rem #17100a; }
.hy__icon--home { left: 16rem; }
.hy__icon--sound { right: 16rem; }
@media (hover: hover) { .hy__icon:hover { background: #3a2c1a; } }

/* ── Screens + iris wipe ─────────────────────────────────────────────────── */
.hy__screen { position: absolute; inset: 0; z-index: 8; pointer-events: none; }
.hy__screen--center { display: flex; align-items: center; justify-content: center; padding: 24rem; }
.hy__screen--center > *, .hy__clues, .hy__hud, .hy__title-top, .hy__title-bottom { pointer-events: auto; }
.hy__screen--title {
  display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  text-align: center;
  padding: calc(76rem + var(--safe-top)) 20rem calc(22rem + var(--safe-bottom));
}
.hy__title-top, .hy__title-bottom { display: flex; flex-direction: column; align-items: center; }

.iris-enter-active { animation: hy-iris-in 0.55s ease both; }
.iris-leave-active { animation: hy-iris-out 0.4s ease both; }
@keyframes hy-iris-in { from { clip-path: circle(0% at 50% 45%); } to { clip-path: circle(125% at 50% 45%); } }
@keyframes hy-iris-out { from { clip-path: circle(125% at 50% 45%); } to { clip-path: circle(0% at 50% 45%); } }

/* ── Title screen ────────────────────────────────────────────────────────── */
.hy__logo { display: flex; flex-direction: column; align-items: center; line-height: 0.94; }
.hy__logo-big { display: block; white-space: nowrap; animation: hy-float 3.2s ease-in-out infinite alternate; }
.hy__logo-big + .hy__logo-big, .hy__logo-mid + .hy__logo-big { animation-delay: 0.45s; }
@keyframes hy-float { from { translate: 0 0; } to { translate: 0 -5rem; } }
.hy__logo-big b {
  display: inline-block; font-weight: 900;
  font-size: clamp(42rem, 11vw, 74rem);
  color: var(--cream);
  -webkit-text-stroke: 2.2rem var(--ink);
  text-shadow: 3.5rem 4.5rem 0 rgba(36, 26, 16, 0.92);
  letter-spacing: 0.015em;
}
.hy__logo-big b.n0 { rotate: -2.6deg; }
.hy__logo-big b.n1 { rotate: 1.9deg; translate: 0 2.5rem; }
.hy__logo-big b.n2 { rotate: -1.1deg; translate: 0 -2rem; }
.hy__logo-big b.n3 { rotate: 2.7deg; translate: 0 1.5rem; }
.hy__logo-mid {
  display: block; font-style: italic; font-weight: 700;
  font-size: clamp(17rem, 4.2vw, 23rem); color: var(--danger);
  letter-spacing: 0.35em; padding-left: 0.35em; text-transform: lowercase;
  margin: 5rem 0 7rem;
  text-shadow: 1.5rem 2rem 0 rgba(240, 229, 198, 0.75);
}
.hy__tagline { margin-top: 14rem; font-style: italic; font-size: 13rem; color: rgba(36, 26, 16, 0.78); text-shadow: 0 1rem 0 rgba(240, 229, 198, 0.6); }
.hy__studio { margin-top: 16rem; font-size: 10.5rem; letter-spacing: 0.18em; text-transform: uppercase; color: #4c3d26; text-shadow: 0 1rem 0 rgba(240, 229, 198, 0.5); }

/* ── Game menu buttons ───────────────────────────────────────────────────── */
.hy__menu { display: grid; gap: 13rem; margin-top: 30rem; width: min(320rem, 80vw); }
.hy__title-bottom .hy__menu { margin-top: 0; }
.hy__mbtn {
  position: relative; padding: 15rem 20rem;
  font-family: inherit; font-weight: 800; font-size: 15.5rem;
  letter-spacing: 0.12em; text-transform: uppercase;
  background: var(--ink); color: var(--cream);
  border: 2rem solid var(--cream); border-radius: 12rem;
  box-shadow: 0 0 0 2.5rem var(--ink), 0 6rem 0 2.5rem #17100a;
  cursor: pointer; transition: transform 0.08s ease, box-shadow 0.08s ease, filter 0.15s ease;
}
.hy__mbtn:active:not(:disabled) { transform: translateY(4rem); box-shadow: 0 0 0 2.5rem var(--ink), 0 2rem 0 2.5rem #17100a; }
.hy__mbtn:disabled { opacity: 0.45; cursor: not-allowed; }
.hy__mbtn--primary { background: var(--danger); box-shadow: 0 0 0 2.5rem #712a1e, 0 6rem 0 2.5rem #572117; }
.hy__mbtn--primary:active:not(:disabled) { box-shadow: 0 0 0 2.5rem #712a1e, 0 2rem 0 2.5rem #572117; }
.hy__mbtn--full { width: 100%; margin-top: 24rem; }
@media (hover: hover) {
  .hy__mbtn:not(:disabled):hover { filter: brightness(1.12); animation: hy-wiggle 0.4s ease; }
}
@keyframes hy-wiggle { 25% { rotate: -1deg; } 65% { rotate: 1deg; } 100% { rotate: 0deg; } }

/* ── Paper cards (setup / handoff) ───────────────────────────────────────── */
.hy__card {
  width: min(440rem, 92vw); background: var(--cream); color: var(--ink);
  border: 3rem solid var(--ink); border-radius: 10rem;
  padding: 30rem 28rem; rotate: -0.4deg;
  box-shadow: 8rem 10rem 0 rgba(36, 26, 16, 0.4);
}
.hy__card--center { text-align: center; }
.hy__eyebrow { font-style: italic; font-size: 12.5rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--danger); margin-bottom: 10rem; }
.hy__h2 { font-size: clamp(26rem, 5vw, 34rem); font-weight: 900; line-height: 1.06; }
.hy__cardsub { margin-top: 12rem; font-size: 14rem; line-height: 1.6; color: rgba(36, 26, 16, 0.72); }
.hy__hand-glyph { color: var(--danger); margin-bottom: 6rem; display: inline-flex; }

.hy__label { display: block; font-family: var(--mono); font-size: 10.5rem; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(36, 26, 16, 0.6); margin: 16rem 0 6rem; }
.hy__input {
  width: 100%; background: rgba(36, 26, 16, 0.05);
  border: none; border-bottom: 2.5rem dashed rgba(36, 26, 16, 0.45);
  border-radius: 6rem 6rem 0 0; padding: 11rem 12rem;
  color: var(--ink); font-family: var(--mono); font-size: 15rem;
  letter-spacing: 0.06em; margin-bottom: 8rem;
}
.hy__input::placeholder { color: rgba(36, 26, 16, 0.35); }
.hy__input:focus { outline: none; border-bottom-color: var(--danger); background: rgba(36, 26, 16, 0.08); }
.hy__row { display: flex; gap: 10rem; margin-top: 24rem; }
.hy__row .hy__mbtn { flex: 1; padding: 13rem 10rem; font-size: 13.5rem; }

/* ── Play HUD ────────────────────────────────────────────────────────────── */
.hy__clues {
  position: absolute; top: calc(66rem + var(--safe-top)); left: 0; right: 0;
  display: flex; gap: 10rem; justify-content: center; flex-wrap: wrap; padding: 0 16rem;
}
.hy__clue {
  display: flex; align-items: baseline; gap: 8rem; max-width: 260rem;
  background: var(--cream); color: var(--ink);
  border: 2rem solid var(--ink); border-left: 2rem dashed var(--ink);
  border-radius: 4rem; padding: 8rem 13rem;
  font-style: italic; font-size: 13rem; line-height: 1.45;
  box-shadow: 2.5rem 3.5rem 0 rgba(36, 26, 16, 0.45);
}
.hy__clue:nth-child(1) { rotate: -1.1deg; }
.hy__clue:nth-child(2) { rotate: 0.9deg; }
.hy__clue:nth-child(3) { rotate: -0.5deg; }
.hy__clue-n { font-family: var(--mono); font-style: normal; font-size: 10.5rem; font-weight: 700; color: var(--danger); }

.hy__hud {
  position: absolute; left: 0; right: 0; bottom: 0;
  padding: 16rem 16rem calc(16rem + var(--safe-bottom));
  display: flex; flex-direction: column; align-items: center; gap: 13rem;
}

/* Word: chunky letter tiles that pop when they land. */
.hy__word { display: flex; flex-wrap: wrap; gap: 7rem; justify-content: center; }
.hy__slot {
  min-width: 34rem; height: 46rem; display: inline-flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 24rem; color: var(--ink);
  background: var(--cream); border: 2.5rem solid var(--ink); border-radius: 7rem;
  box-shadow: 0 4rem 0 var(--ink);
}
.hy__slot:nth-child(odd) { rotate: -1.3deg; }
.hy__slot:nth-child(even) { rotate: 1.1deg; }
.hy__slot.is-space { min-width: 12rem; background: transparent; border: none; box-shadow: none; }
.hy__slot.is-filled { animation: hy-pop 0.32s ease; border-color: var(--danger); box-shadow: 0 4rem 0 var(--danger); }
@keyframes hy-pop { 0% { scale: 0.3; rotate: -10deg; } 62% { scale: 1.18; } 100% { scale: 1; } }

/* Lives: seven little nooses, stamped red as they're used up. */
.hy__lives {
  display: flex; align-items: center; gap: 6rem;
  background: rgba(240, 231, 205, 0.65); border: 2rem solid rgba(36, 26, 16, 0.35);
  padding: 6rem 13rem; border-radius: 999rem;
}
.hy__lives.is-danger { animation: hy-pulse 0.8s ease infinite; border-color: var(--danger); }
@keyframes hy-pulse { 0% { box-shadow: 0 0 0 0 rgba(160, 61, 45, 0.45); } 100% { box-shadow: 0 0 0 11rem rgba(160, 61, 45, 0); } }
.hy__noose { width: 17rem; height: 17rem; color: rgba(36, 26, 16, 0.32); }
.hy__noose.used { color: var(--danger); animation: hy-stamp 0.32s ease; }
@keyframes hy-stamp { 0% { scale: 2.1; opacity: 0; rotate: -18deg; } 65% { scale: 0.88; } 100% { scale: 1; opacity: 1; rotate: 0deg; } }
.hy__num { font-family: var(--mono); font-size: 11.5rem; color: var(--ink); margin-left: 3rem; }

/* Keyboard: arcade keys with a 3D ledge. */
.hy__keyboard { display: flex; flex-direction: column; gap: 8rem; width: 100%; max-width: 500rem; }
.hy__krow { display: flex; gap: 6rem; justify-content: center; }
.hy__key {
  flex: 1; max-width: 44rem; aspect-ratio: 1 / 1.12; border-radius: 8rem;
  background: var(--cream); border: 2.5rem solid var(--ink); color: var(--ink);
  font-family: inherit; font-size: 17rem; font-weight: 800; cursor: pointer;
  box-shadow: 0 4rem 0 var(--ink);
  transition: transform 0.07s ease, box-shadow 0.07s ease, background 0.14s ease;
}
@media (hover: hover) { .hy__key:not(:disabled):hover { background: #fff8e0; } }
.hy__key:active:not(:disabled) { transform: translateY(3rem); box-shadow: 0 1rem 0 var(--ink); }
.hy__key.hit { background: #7f8f52; border-color: #4d5a2c; color: #f3f5e3; box-shadow: 0 2rem 0 #4d5a2c; animation: hy-stamp 0.3s ease; }
.hy__key.miss { background: var(--danger); border-color: #572117; color: #f0d7cd; box-shadow: 0 1rem 0 #572117; rotate: -2.5deg; opacity: 0.9; animation: hy-stamp 0.3s ease; }
.hy__key:disabled { cursor: default; }

/* ── Result screen ───────────────────────────────────────────────────────── */
.hy__end { display: flex; flex-direction: column; align-items: center; text-align: center; }
.hy__end-eyebrow { color: #cf6a50; margin-bottom: 14rem; text-shadow: 0 1rem 0 rgba(20, 12, 4, 0.8); }
.hy__logo--end .hy__logo-big b { font-size: clamp(42rem, 11vw, 74rem); }
.hy__ticket {
  margin-top: 22rem; background: var(--cream); color: var(--ink);
  border: 2rem solid var(--ink); border-radius: 4rem;
  padding: 9rem 16rem; font-size: 14rem; font-style: italic; rotate: 1deg;
  box-shadow: 2.5rem 3.5rem 0 rgba(20, 12, 4, 0.55);
}
.hy__ticket b { font-family: var(--mono); font-style: normal; letter-spacing: 0.12em; color: var(--danger); }

.hy-fade-enter-active, .hy-fade-leave-active { transition: opacity 0.3s ease; }
.hy-fade-enter-from, .hy-fade-leave-to { opacity: 0; }

@media (max-width: 560px) {
  .hy__clue { font-size: 12rem; max-width: 44%; }
  .hy__slot { min-width: 27rem; font-size: 20rem; height: 38rem; }
  .hy__key { font-size: 14rem; }
}
</style>
