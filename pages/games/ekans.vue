<script setup lang="ts">
import {
  type Cell, type Mode, type TurnRecord,
  MODES, BOARD_COLS, BOARD_ROWS,
  createRun, canPlace, placeFood, advance, randomSeedLabel
} from '~/utils/ekans/engine'

/**
 * EKANS is a self-contained, full-screen mobile app, not a publication page —
 * see the `bare` route list in app.vue. It runs its own monochrome theme
 * regardless of the site's light/dark setting: an immersive black stage, not
 * a themed section of the editorial shell.
 */
definePageMeta({ layout: false })
useSeoMeta({
  title: 'EKANS · Entertrainer',
  description: 'You don’t steer the snake. You place what it eats, and try to close every route it has left. A Snake tribute, inverted.',
  ogTitle: 'EKANS — a Snake game, inverted',
  ogDescription: 'The snake finds its own way. You choose where it eats — and decide where it slowly runs out of room.',
  ogUrl: 'https://entertrainer.in/games/ekans',
  robots: 'index, follow'
})

type Phase = 'menu' | 'playing' | 'result' | 'replay'

const phase = ref<Phase>('menu')
const mode = ref<Mode>('standard')
const seedInput = ref(randomSeedLabel())
const runNumber = ref(0)

// A plain ref (not shallowRef) so Vue proxies it with reactive() — the engine
// mutates body/status/food in place (unshift/pop/assign), and that proxy is
// what makes those in-place mutations show up in the template automatically.
const state = ref(createRun('standard')) // placeholder until first real run; overwritten by startRun
const bodyIds = ref<number[]>([])
let nextId = 1

const history = ref<TurnRecord[]>([])
const initialBody = ref<Cell[]>([])
let turnPath: Cell[] = []
let turnBodyBefore: Cell[] = []
let turnFood: Cell | null = null

const shaking = ref(false)
const ripples = ref<{ id: number; x: number; y: number; bad: boolean }[]>([])
let rippleId = 0
const tickTimer = ref<ReturnType<typeof window.setTimeout> | null>(null)
const TICK_MS = 150

const replayIndex = ref(0)

const modeLabel = computed(() => MODES[state.value.mode].label.toUpperCase())
const reserve = computed(() => Math.max(0, state.value.target - state.value.eaten))
const hintText = computed(() => {
  switch (state.value.status) {
    case 'placing': return 'TAP AN OPEN CELL TO PLACE FOOD'
    case 'moving': return 'WATCHING'
    case 'trapped': return 'NO MOVES LEFT'
    case 'escaped': return 'TARGET REACHED'
    default: return ''
  }
})

function haptic(pattern: number | number[]) {
  try { navigator.vibrate?.(pattern) } catch { /* unsupported */ }
}

function startRun() {
  runNumber.value += 1
  const s = createRun(mode.value, seedInput.value)
  state.value = s
  initialBody.value = s.body.map((c) => ({ ...c }))
  bodyIds.value = s.body.map((_, i) => i + 1)
  nextId = s.body.length + 1
  history.value = []
  replayIndex.value = 0
  phase.value = 'playing'
}

function retrySeed() { seedInput.value = state.value.seedLabel; startRun() }
function newSeed() { seedInput.value = randomSeedLabel(); startRun() }
function backToMenu() {
  if (tickTimer.value) { window.clearTimeout(tickTimer.value); tickTimer.value = null }
  phase.value = 'menu'
}

function recordTurn(outcome: 'ate' | 'trapped') {
  const s = state.value
  history.value.push({
    turn: s.turn,
    food: turnFood!,
    path: turnPath,
    bodyBefore: turnBodyBefore,
    bodyAfter: s.body.map((c) => ({ ...c })),
    outcome
  })
}

function runTicks() {
  const step = () => {
    const s = state.value
    if (s.status !== 'moving') return
    advance(s)
    turnPath.push({ ...s.body[0] })
    bodyIds.value.unshift(nextId++)
    while (bodyIds.value.length > s.body.length) bodyIds.value.pop()

    if (s.status === 'trapped') {
      recordTurn('trapped')
      haptic([0, 45, 70, 45, 70, 90])
      window.setTimeout(() => { phase.value = 'result' }, 260)
      return
    }
    if (s.status === 'escaped') {
      recordTurn('ate')
      haptic(18)
      window.setTimeout(() => { phase.value = 'result' }, 260)
      return
    }
    if (s.status === 'placing') {
      recordTurn('ate')
      haptic(18)
      return
    }
    tickTimer.value = window.setTimeout(step, TICK_MS)
  }
  tickTimer.value = window.setTimeout(step, TICK_MS)
}

function placeCell(cell: Cell) {
  const s = state.value
  turnBodyBefore = s.body.map((c) => ({ ...c }))
  turnPath = [{ ...s.body[0] }]
  turnFood = { ...cell }
  placeFood(s, cell)
  haptic(9)
  runTicks()
}

function reject() {
  haptic([0, 12, 35, 12])
  shaking.value = true
  window.setTimeout(() => { shaking.value = false }, 220)
}

function onBoardTap(e: MouseEvent) {
  const s = state.value
  if (s.status !== 'placing') return
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const c = Math.floor((x / rect.width) * BOARD_COLS)
  const r = Math.floor((y / rect.height) * BOARD_ROWS)
  const ok = canPlace(s, { r, c })

  const id = rippleId++
  ripples.value.push({ id, x: (x / rect.width) * 100, y: (y / rect.height) * 100, bad: !ok })
  window.setTimeout(() => { ripples.value = ripples.value.filter((rp) => rp.id !== id) }, 420)

  if (!ok) { reject(); return }
  placeCell({ r, c })
}

function openReplay() { replayIndex.value = history.value.length; phase.value = 'replay' }
function closeReplay() { phase.value = 'result' }

const replayFrame = computed(() => {
  if (replayIndex.value <= 0) return { body: initialBody.value, food: null as Cell | null }
  const rec = history.value[replayIndex.value - 1]
  return { body: rec.bodyAfter, food: rec.food }
})

const displaySegments = computed(() => {
  if (phase.value === 'replay') {
    return replayFrame.value.body.map((cell, i) => ({ id: i, r: cell.r, c: cell.c, isHead: i === 0 }))
  }
  return state.value.body.map((cell, i) => ({ id: bodyIds.value[i] ?? i, r: cell.r, c: cell.c, isHead: i === 0 }))
})
const displayFood = computed(() => phase.value === 'replay' ? replayFrame.value.food : state.value.food)

function segStyle(cell: { r: number; c: number }) {
  return {
    width: `${100 / BOARD_COLS}%`,
    height: `${100 / BOARD_ROWS}%`,
    transform: `translate(${cell.c * 100}%, ${cell.r * 100}%)`
  }
}

const lastOutcome = computed(() => history.value[history.value.length - 1]?.outcome)
const isFinalTrapFrame = computed(() =>
  replayIndex.value === history.value.length && lastOutcome.value === 'trapped'
)

let prevOverflow = ''
let prevOverscroll = ''
onMounted(() => {
  prevOverflow = document.body.style.overflow
  prevOverscroll = document.documentElement.style.overscrollBehavior
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overscrollBehavior = 'none'
  if (import.meta.dev) (window as any).__ekansDebug = { state, phase, history }
})
onUnmounted(() => {
  if (tickTimer.value) window.clearTimeout(tickTimer.value)
  document.body.style.overflow = prevOverflow
  document.documentElement.style.overscrollBehavior = prevOverscroll
})
</script>

<template>
  <div class="ekans" :class="{ 'is-shaking': shaking }">
    <div class="ekans__scene" v-if="phase !== 'menu'">
      <header class="ekans__bar">
        <div class="ekans__stats">
          <div class="ekans__stat"><b>{{ runNumber }}</b><span>RUN</span></div>
          <div class="ekans__stat"><b>{{ state.seedLabel }}</b><span>SEED</span></div>
          <div class="ekans__stat"><b>{{ modeLabel }}</b><span>MODE</span></div>
          <div class="ekans__stat"><b>{{ reserve }}</b><span>RESERVE</span></div>
        </div>
        <button class="ekans__icon-btn" @click="backToMenu" aria-label="Exit run">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </header>

      <div class="ekans__stage">
        <div
          class="ekans__board"
          role="grid"
          aria-label="EKANS board. Tap an empty cell to place food."
          @click="onBoardTap"
        >
          <div class="ekans__gridlines" aria-hidden="true"></div>

          <div
            v-for="seg in displaySegments"
            :key="seg.id"
            class="ekans__seg"
            :class="{ 'ekans__seg--head': seg.isHead }"
            :style="segStyle(seg)"
          />

          <Transition name="food">
            <div
              v-if="displayFood"
              :key="`${displayFood.r}-${displayFood.c}`"
              class="ekans__food"
              :style="segStyle(displayFood)"
            ><span class="ekans__food-dot" :class="{ 'is-final': phase === 'replay' && isFinalTrapFrame }" /></div>
          </Transition>

          <span
            v-for="rp in ripples" :key="rp.id"
            class="ekans__ripple" :class="{ 'ekans__ripple--bad': rp.bad }"
            :style="{ left: rp.x + '%', top: rp.y + '%' }"
          />
        </div>
      </div>

      <footer class="ekans__foot">
        <p class="ekans__hint" v-if="phase === 'playing'">{{ hintText }}</p>
      </footer>
    </div>

    <Transition name="sheet">
      <div v-if="phase === 'menu'" class="ekans__menu">
        <div class="ekans__menu-inner">
          <p class="ekans__kicker">A SNAKE GAME, INVERTED</p>
          <h1 class="ekans__title">EKANS</h1>
          <p class="ekans__tag">The snake finds its own way. You choose where it eats — and where its own length finally boxes it in.</p>

          <div class="ekans__modes">
            <button
              v-for="(info, key) in MODES" :key="key"
              class="ekans__mode" :class="{ 'is-active': mode === key }"
              @click="mode = key as Mode"
            >
              <span class="ekans__mode-name">{{ info.label }}</span>
              <span class="ekans__mode-blurb">{{ info.blurb }}</span>
            </button>
          </div>

          <div class="ekans__seedrow">
            <label class="ekans__seedlabel" for="ekans-seed">SEED</label>
            <input
              id="ekans-seed" v-model="seedInput" class="ekans__seedinput"
              maxlength="8" autocapitalize="characters" autocomplete="off" spellcheck="false"
            />
            <button class="ekans__icon-btn" @click="seedInput = randomSeedLabel()" aria-label="Shuffle seed">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></svg>
            </button>
          </div>

          <button class="ekans__start" @click="startRun">START RUN</button>
        </div>
      </div>
    </Transition>

    <Transition name="sheet">
      <div v-if="phase === 'result'" class="ekans__backdrop">
        <div class="ekans__sheet">
          <p class="ekans__sheet-kicker">{{ state.status === 'trapped' ? 'SELF-TRAP' : 'RESERVE SPENT' }}</p>
          <h2 class="ekans__sheet-title">{{ state.status === 'trapped' ? 'TRAPPED' : 'ESCAPED' }}</h2>
          <p class="ekans__sheet-body">
            <template v-if="state.status === 'trapped'">No legal move left after {{ history.length }} placements. That closing was yours.</template>
            <template v-else>It reached {{ state.target }} and never lost its way out. Same board, another route in.</template>
          </p>
          <div class="ekans__sheet-actions">
            <button v-if="state.status === 'trapped'" class="ekans__btn ekans__btn--ghost" @click="openReplay">VIEW REPLAY</button>
            <button class="ekans__btn ekans__btn--ghost" @click="retrySeed">SAME SEED</button>
            <button class="ekans__btn ekans__btn--solid" @click="newSeed">NEW SEED</button>
          </div>
          <button class="ekans__text-btn" @click="backToMenu">CHANGE MODE</button>
        </div>
      </div>
    </Transition>

    <Transition name="sheet">
      <div v-if="phase === 'replay'" class="ekans__backdrop">
        <div class="ekans__sheet ekans__sheet--replay">
          <div class="ekans__replay-head">
            <p class="ekans__sheet-kicker">REPLAY</p>
            <button class="ekans__icon-btn" @click="closeReplay" aria-label="Close replay">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <p class="ekans__replay-turn">
            <template v-if="replayIndex === 0">START — board before the first placement</template>
            <template v-else>TURN {{ replayIndex }} / {{ history.length }}<span v-if="isFinalTrapFrame"> — THE TRAP</span></template>
          </p>
          <input type="range" class="ekans__scrub" min="0" :max="history.length" step="1" v-model.number="replayIndex" />
          <div class="ekans__replay-nav">
            <button class="ekans__step" :disabled="replayIndex === 0" @click="replayIndex = Math.max(0, replayIndex - 1)" aria-label="Previous turn">‹</button>
            <button class="ekans__step" :disabled="replayIndex === history.length" @click="replayIndex = Math.min(history.length, replayIndex + 1)" aria-label="Next turn">›</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.ekans {
  --bg: #0A0A0B;
  --fg: #F4F4F2;
  --dim: rgba(244, 244, 242, .46);
  --faint: rgba(244, 244, 242, .14);
  --line: rgba(244, 244, 242, .10);
  --panel: #17171A;
  --danger: rgba(244, 244, 242, .5);

  position: fixed; inset: 0; z-index: 40;
  display: flex; flex-direction: column;
  background: var(--bg); color: var(--fg);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-tap-highlight-color: transparent;
  user-select: none; touch-action: manipulation;
  overflow: hidden;
}

.ekans__scene { position: absolute; inset: 0; display: flex; flex-direction: column; }

.ekans__bar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: calc(env(safe-area-inset-top, 0px) + 14px) 16px 10px;
}
.ekans__stats { display: flex; gap: 18px; }
.ekans__stat { display: flex; flex-direction: column; gap: 2px; line-height: 1; }
.ekans__stat b { font: 600 13px/1 var(--font-mono); letter-spacing: .02em; }
.ekans__stat span { font: 500 8.5px/1 var(--font-mono); letter-spacing: .12em; color: var(--dim); margin-top: 4px; }

.ekans__icon-btn {
  display: grid; place-items: center; width: 34px; height: 34px; border-radius: 999px;
  background: var(--panel); border: 1px solid var(--faint); color: var(--fg);
  transition: transform 120ms ease, background 120ms ease;
}
.ekans__icon-btn:active { transform: scale(.9); background: var(--faint); }

.ekans__stage { flex: 1; display: grid; place-items: center; padding: 6px 16px; min-height: 0; }
.ekans__board {
  position: relative; width: 100%; max-width: 480px;
  aspect-ratio: 9 / 15;
  max-height: 100%;
  border-radius: 14px; overflow: hidden;
  background: color-mix(in srgb, var(--fg) 3%, var(--bg));
  border: 1px solid var(--faint);
}
.ekans__gridlines {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(to right, var(--line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--line) 1px, transparent 1px);
  background-size: calc(100% / 9) 100%, 100% calc(100% / 15);
}

.ekans__seg {
  position: absolute; top: 0; left: 0;
  transition: transform 140ms cubic-bezier(.3, .7, .4, 1);
}
.ekans__seg::after {
  content: ''; position: absolute; inset: 1.5px; border-radius: 3px;
  background: color-mix(in srgb, var(--fg) 78%, transparent);
}
.ekans__seg--head::after {
  inset: 1px; border-radius: 5px; background: var(--fg);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--fg) 30%, transparent);
}

.ekans__food { position: absolute; top: 0; left: 0; display: grid; place-items: center; pointer-events: none; }
.ekans__food-dot {
  width: 34%; height: 34%; border-radius: 50%;
  border: 1.5px solid var(--fg); box-sizing: border-box;
  animation: ekans-pulse 1.1s ease-in-out infinite;
}
.ekans__food-dot.is-final { background: var(--fg); animation: none; }
@keyframes ekans-pulse { 0%, 100% { transform: scale(.85); opacity: .75; } 50% { transform: scale(1.05); opacity: 1; } }

.food-enter-active { transition: transform 160ms cubic-bezier(.2, 1.4, .4, 1), opacity 160ms; }
.food-enter-from { transform: scale(.2); opacity: 0; }
.food-leave-active { transition: opacity 100ms; }
.food-leave-to { opacity: 0; }

.ekans__ripple {
  position: absolute; width: 46px; height: 46px; margin: -23px 0 0 -23px;
  border-radius: 50%; border: 1.5px solid var(--fg); pointer-events: none;
  animation: ekans-ripple 420ms ease-out forwards;
}
.ekans__ripple--bad { border-color: var(--danger); }
@keyframes ekans-ripple { from { transform: scale(.4); opacity: .55; } to { transform: scale(1.15); opacity: 0; } }

.is-shaking .ekans__board { animation: ekans-shake 220ms ease-in-out; }
@keyframes ekans-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.ekans__foot { padding: 10px 16px calc(env(safe-area-inset-bottom, 0px) + 18px); text-align: center; }
.ekans__hint { margin: 0; font: 600 11px/1 var(--font-mono); letter-spacing: .1em; color: var(--dim); }

/* Menu */
.ekans__menu {
  position: absolute; inset: 0; z-index: 5;
  display: flex; align-items: flex-end;
  background: var(--bg);
  padding: calc(env(safe-area-inset-top, 0px) + 32px) 22px calc(env(safe-area-inset-bottom, 0px) + 28px);
}
.ekans__menu-inner { display: flex; flex-direction: column; gap: 18px; width: 100%; max-width: 460px; margin: 0 auto; }
.ekans__kicker { margin: 0; font: 700 10.5px/1 var(--font-mono); letter-spacing: .18em; color: var(--dim); }
.ekans__title {
  margin: 0; font: 800 clamp(52px, 16vw, 84px)/.9 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: -.02em;
}
.ekans__tag { margin: 0; max-width: 40ch; font: 400 15px/1.5 inherit; color: var(--dim); }

.ekans__modes { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
.ekans__mode {
  display: flex; flex-direction: column; gap: 3px; text-align: left;
  padding: 12px 14px; border-radius: 12px; border: 1px solid var(--faint); background: var(--panel);
  transition: background 140ms ease, border-color 140ms ease, transform 100ms ease;
}
.ekans__mode:active { transform: scale(.985); }
.ekans__mode.is-active { background: var(--fg); border-color: var(--fg); }
.ekans__mode-name { font: 700 14px/1.2 inherit; color: var(--fg); }
.ekans__mode.is-active .ekans__mode-name { color: var(--bg); }
.ekans__mode-blurb { font: 400 12px/1.3 inherit; color: var(--dim); }
.ekans__mode.is-active .ekans__mode-blurb { color: color-mix(in srgb, var(--bg) 70%, transparent); }

.ekans__seedrow { display: flex; align-items: center; gap: 10px; }
.ekans__seedlabel { font: 700 10px/1 var(--font-mono); letter-spacing: .14em; color: var(--dim); }
.ekans__seedinput {
  flex: 1; min-width: 0; padding: 10px 12px; border-radius: 10px;
  border: 1px solid var(--faint); background: var(--panel); color: var(--fg);
  font: 600 14px/1 var(--font-mono); letter-spacing: .08em; text-transform: uppercase;
}
.ekans__seedinput:focus { outline: none; border-color: var(--fg); }

.ekans__start {
  margin-top: 4px; padding: 15px; border-radius: 999px; background: var(--fg); color: var(--bg);
  font: 800 13px/1 inherit; letter-spacing: .06em; transition: transform 100ms ease, opacity 100ms ease;
}
.ekans__start:active { transform: scale(.97); opacity: .9; }

/* Bottom sheets (result / replay) */
.ekans__backdrop {
  position: absolute; inset: 0; z-index: 10;
  display: flex; align-items: flex-end;
  background: rgba(0, 0, 0, .55); backdrop-filter: blur(6px);
}
.ekans__sheet {
  width: 100%; padding: 22px 22px calc(env(safe-area-inset-bottom, 0px) + 22px);
  border-radius: 20px 20px 0 0; background: #121214; border-top: 1px solid var(--faint);
  display: flex; flex-direction: column; gap: 14px;
}
.ekans__sheet-kicker { margin: 0; font: 700 10.5px/1 var(--font-mono); letter-spacing: .18em; color: var(--dim); }
.ekans__sheet-title { margin: 0; font: 800 40px/1 inherit; letter-spacing: -.01em; }
.ekans__sheet-body { margin: 0; font: 400 14.5px/1.5 inherit; color: var(--dim); max-width: 44ch; }
.ekans__sheet-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.ekans__btn {
  flex: 1 1 auto; padding: 13px 14px; border-radius: 999px; font: 700 12px/1 inherit; letter-spacing: .04em;
  transition: transform 100ms ease, opacity 100ms ease;
}
.ekans__btn:active { transform: scale(.96); }
.ekans__btn--solid { background: var(--fg); color: var(--bg); }
.ekans__btn--ghost { background: transparent; border: 1px solid var(--faint); color: var(--fg); }
.ekans__text-btn { align-self: center; margin-top: 2px; padding: 6px; font: 600 11px/1 var(--font-mono); letter-spacing: .1em; color: var(--dim); }

.ekans__sheet--replay { gap: 16px; }
.ekans__replay-head { display: flex; align-items: center; justify-content: space-between; }
.ekans__replay-turn { margin: 0; font: 700 13px/1.3 var(--font-mono); letter-spacing: .03em; }
.ekans__scrub { width: 100%; accent-color: var(--fg); }
.ekans__replay-nav { display: flex; gap: 10px; justify-content: center; }
.ekans__step {
  width: 46px; height: 40px; border-radius: 12px; background: var(--panel); border: 1px solid var(--faint);
  color: var(--fg); font-size: 20px; line-height: 1;
}
.ekans__step:disabled { opacity: .3; }
.ekans__step:not(:disabled):active { transform: scale(.94); background: var(--faint); }

.sheet-enter-active, .sheet-leave-active { transition: opacity 200ms ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
/* A fading-out sheet must not keep intercepting taps meant for the board
   underneath it during its 200ms leave transition. */
.sheet-leave-active { pointer-events: none; }
.ekans__menu.sheet-enter-active .ekans__menu-inner,
.ekans__backdrop.sheet-enter-active .ekans__sheet { transition: transform 220ms cubic-bezier(.2, .9, .3, 1); }
.ekans__backdrop.sheet-enter-from .ekans__sheet { transform: translateY(24px); }
.ekans__menu.sheet-enter-from .ekans__menu-inner { transform: translateY(14px); }

@media (prefers-reduced-motion: reduce) {
  .ekans__seg, .ekans__food-dot, .ekans__ripple, .is-shaking .ekans__board { animation: none !important; transition: none !important; }
}
</style>
