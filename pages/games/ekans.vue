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
 *
 * No screen here explains the mechanic in prose. The board teaches it: tap,
 * watch, see what happens. Copy stays to single words and numbers — a HUD
 * chip, a stat, a button label — the way an actual game reads, not a page
 * that describes a game.
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

const DIFFICULTY: Record<Mode, number> = { learn: 1, standard: 2, expert: 3 }
const ICON_COIL = [
  { r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 },
  { r: 1, c: 3 }, { r: 2, c: 3 }, { r: 2, c: 2 }, { r: 2, c: 1 }, { r: 3, c: 1 }
]

const phase = ref<Phase>('menu')
const mode = ref<Mode>('standard')
const seedInput = ref(randomSeedLabel())

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
const bursts = ref<{ id: number; r: number; c: number }[]>([])
let fxId = 0
const tickTimer = ref<ReturnType<typeof window.setTimeout> | null>(null)
const TICK_MS = 150

const replayIndex = ref(0)

const modeLabel = computed(() => MODES[state.value.mode].label.toUpperCase())
const modeInitial = computed(() => MODES[state.value.mode].label[0])
const hintText = computed(() => state.value.status === 'moving' ? 'HUNTING' : 'TAP TO FEED')
const fillPercent = computed(() => Math.round((state.value.body.length / (BOARD_COLS * BOARD_ROWS)) * 100))

function haptic(pattern: number | number[]) {
  try { navigator.vibrate?.(pattern) } catch { /* unsupported */ }
}

function startRun() {
  haptic(10)
  const s = createRun(mode.value, seedInput.value)
  state.value = s
  initialBody.value = s.body.map((c) => ({ ...c }))
  bodyIds.value = s.body.map((_, i) => i + 1)
  nextId = s.body.length + 1
  history.value = []
  replayIndex.value = 0
  phase.value = 'playing'
}

function retrySeed() { haptic(10); seedInput.value = state.value.seedLabel; startRun() }
function newSeed() { haptic(10); seedInput.value = randomSeedLabel(); startRun() }
function backToMenu() {
  haptic(10)
  if (tickTimer.value) { window.clearTimeout(tickTimer.value); tickTimer.value = null }
  phase.value = 'menu'
}
function pickMode(key: Mode) { haptic(8); mode.value = key }

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

function burst(cell: Cell) {
  const id = fxId++
  bursts.value.push({ id, ...cell })
  window.setTimeout(() => { bursts.value = bursts.value.filter((b) => b.id !== id) }, 460)
}

function runTicks() {
  const step = () => {
    const s = state.value
    if (s.status !== 'moving') return
    const eatenBefore = s.eaten
    advance(s)
    turnPath.push({ ...s.body[0] })
    bodyIds.value.unshift(nextId++)
    while (bodyIds.value.length > s.body.length) bodyIds.value.pop()

    if (s.eaten > eatenBefore) burst(turnFood!)

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

  const id = fxId++
  ripples.value.push({ id, x: (x / rect.width) * 100, y: (y / rect.height) * 100, bad: !ok })
  window.setTimeout(() => { ripples.value = ripples.value.filter((rp) => rp.id !== id) }, 420)

  if (!ok) { reject(); return }
  placeCell({ r, c })
}

function openReplay() { haptic(8); replayIndex.value = history.value.length; phase.value = 'replay' }
function closeReplay() { haptic(8); phase.value = 'result' }

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
function iconSegStyle(cell: { r: number; c: number }) {
  return { transform: `translate(${cell.c * 100}%, ${cell.r * 100}%)` }
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
      <header class="ekans__hud">
        <button class="ekans__hud-exit" @click="backToMenu" aria-label="Exit run">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div class="ekans__hud-chip">
          <span class="ekans__hud-mode">{{ modeInitial }}</span>
          <i class="ekans__hud-diamond" aria-hidden="true"></i>
          <span class="ekans__hud-count">{{ state.eaten }}/{{ state.target }}</span>
        </div>
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

          <div v-for="b in bursts" :key="b.id" class="ekans__burst" :style="segStyle(b)">
            <i v-for="n in 6" :key="n" :style="{ '--ang': `${n * 60}deg` }" />
          </div>

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
        <div class="ekans__mark" aria-hidden="true">
          <span class="ekans__mark-glow"></span>
          <span
            v-for="(cell, i) in ICON_COIL" :key="i"
            class="ekans__mark-seg" :class="{ 'ekans__mark-seg--head': i === ICON_COIL.length - 1 }"
            :style="{ ...iconSegStyle(cell), '--i': i }"
          />
        </div>
        <h1 class="ekans__wordmark">EKANS</h1>

        <div class="ekans__menu-controls">
          <div class="ekans__modes" role="tablist">
            <button
              v-for="(info, key) in MODES" :key="key"
              class="ekans__mode-pill" :class="{ 'is-active': mode === key }"
              role="tab" :aria-selected="mode === key"
              @click="pickMode(key as Mode)"
            >
              <span>{{ info.label }}</span>
              <span class="ekans__mode-pips"><i v-for="p in 3" :key="p" :class="{ 'is-on': p <= DIFFICULTY[key] }" /></span>
            </button>
          </div>

          <button class="ekans__play" @click="startRun">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 4l13 8-13 8V4z" /></svg>
            PLAY
          </button>

          <div class="ekans__seedbar">
            <input
              v-model="seedInput" class="ekans__seedinput" aria-label="Seed"
              maxlength="8" autocapitalize="characters" autocomplete="off" spellcheck="false"
            />
            <button class="ekans__seed-shuffle" @click="seedInput = randomSeedLabel()" aria-label="Shuffle seed">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="sheet">
      <div v-if="phase === 'result'" class="ekans__backdrop">
        <div class="ekans__sheet ekans__sheet--result">
          <div class="ekans__result-icon" :class="{ 'is-trapped': state.status === 'trapped' }">
            <svg v-if="state.status === 'trapped'" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
            <svg v-else viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </div>
          <h2 class="ekans__sheet-title">{{ state.status === 'trapped' ? 'TRAPPED' : 'ESCAPED' }}</h2>

          <div class="ekans__result-stats">
            <div class="ekans__result-stat"><b>{{ history.length }}</b><span>MOVES</span></div>
            <div class="ekans__result-stat"><b>{{ fillPercent }}%</b><span>FILLED</span></div>
            <div class="ekans__result-stat"><b>{{ modeLabel }}</b><span>MODE</span></div>
          </div>

          <button class="ekans__play ekans__play--sheet" @click="newSeed">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 4l13 8-13 8V4z" /></svg>
            PLAY AGAIN
          </button>

          <div class="ekans__result-row">
            <button v-if="state.status === 'trapped'" class="ekans__chip-btn" @click="openReplay" aria-label="Watch replay">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" /></svg>
              REPLAY
            </button>
            <button class="ekans__chip-btn" @click="retrySeed" aria-label="Retry same seed">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></svg>
              RETRY
            </button>
            <button class="ekans__chip-btn" @click="backToMenu" aria-label="Change mode">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7M6 10v9h12v-9" /></svg>
              HOME
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="sheet">
      <div v-if="phase === 'replay'" class="ekans__backdrop">
        <div class="ekans__sheet ekans__sheet--replay">
          <div class="ekans__replay-head">
            <p class="ekans__replay-count">
              {{ replayIndex }} / {{ history.length }}
              <svg v-if="isFinalTrapFrame" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
            </p>
            <button class="ekans__hud-exit" @click="closeReplay" aria-label="Close replay">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <input type="range" class="ekans__scrub" min="0" :max="history.length" step="1" v-model.number="replayIndex" />
          <div class="ekans__replay-nav">
            <button class="ekans__step" :disabled="replayIndex === 0" @click="replayIndex = Math.max(0, replayIndex - 1)" aria-label="Previous turn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <button class="ekans__step" :disabled="replayIndex === history.length" @click="replayIndex = Math.min(history.length, replayIndex + 1)" aria-label="Next turn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </button>
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

/* HUD: two chips, not a data table. */
.ekans__hud {
  display: flex; align-items: center; justify-content: space-between;
  padding: calc(env(safe-area-inset-top, 0px) + 14px) 16px 10px;
}
.ekans__hud-exit {
  display: grid; place-items: center; width: 34px; height: 34px; border-radius: 999px;
  background: var(--panel); border: 1px solid var(--faint); color: var(--fg);
  transition: transform 120ms ease, background 120ms ease;
}
.ekans__hud-exit:active { transform: scale(.9); background: var(--faint); }
.ekans__hud-chip {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 12px 7px 8px; border-radius: 999px; background: var(--panel); border: 1px solid var(--faint);
}
.ekans__hud-mode {
  display: grid; place-items: center; width: 19px; height: 19px; border-radius: 6px;
  background: var(--faint); font: 800 10px/1 var(--font-mono); color: var(--fg);
}
.ekans__hud-diamond { width: 7px; height: 7px; background: var(--fg); transform: rotate(45deg); border-radius: 1px; }
.ekans__hud-count { font: 700 13px/1 var(--font-mono); letter-spacing: .01em; }

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
  width: 30%; height: 30%; transform: rotate(45deg);
  border: 1.5px solid var(--fg); box-sizing: border-box;
  animation: ekans-pulse 1.1s ease-in-out infinite;
}
.ekans__food-dot.is-final { background: var(--fg); animation: none; }
@keyframes ekans-pulse {
  0%, 100% { transform: rotate(45deg) scale(.85); opacity: .75; }
  50% { transform: rotate(45deg) scale(1.08); opacity: 1; }
}

.food-enter-active { transition: transform 160ms cubic-bezier(.2, 1.4, .4, 1), opacity 160ms; }
.food-enter-from { transform: scale(.2); opacity: 0; }
.food-leave-active { transition: opacity 100ms; }
.food-leave-to { opacity: 0; }

/* Eat burst: a few particles kick outward from the cell that was just eaten. */
.ekans__burst { position: absolute; top: 0; left: 0; display: grid; place-items: center; pointer-events: none; }
.ekans__burst i {
  position: absolute; width: 4px; height: 4px; background: var(--fg); border-radius: 1px;
  animation: ekans-burst 440ms cubic-bezier(.2, .7, .3, 1) forwards;
}
@keyframes ekans-burst {
  from { transform: rotate(var(--ang)) translateY(0) scale(1); opacity: 1; }
  to { transform: rotate(var(--ang)) translateY(-16px) scale(.2); opacity: 0; }
}

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
.ekans__hint { margin: 0; font: 700 11px/1 var(--font-mono); letter-spacing: .14em; color: var(--dim); }

/* Menu: a splash screen, not a hero section — a mark, a wordmark, and controls. */
.ekans__menu {
  position: absolute; inset: 0; z-index: 5;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  background: var(--bg);
  padding: calc(env(safe-area-inset-top, 0px) + 24px) 24px calc(env(safe-area-inset-bottom, 0px) + 28px);
}

.ekans__mark { position: relative; width: clamp(96px, 28vw, 132px); aspect-ratio: 1; margin-bottom: 14px; }
.ekans__mark-glow {
  position: absolute; inset: -40%; border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--fg) 14%, transparent), transparent 70%);
}
.ekans__mark-seg {
  position: absolute; top: 0; left: 0; width: 25%; height: 25%;
}
.ekans__mark-seg::after {
  content: ''; position: absolute; inset: 6%; border-radius: 22%;
  background: color-mix(in srgb, var(--fg) 74%, transparent);
  animation: ekans-mark-glow 2.6s ease-in-out calc(var(--i) * 110ms) infinite;
}
.ekans__mark-seg--head::after { background: var(--fg); }
@keyframes ekans-mark-glow {
  0%, 100% { opacity: .55; } 30% { opacity: 1; }
}

.ekans__wordmark {
  margin: 0 0 26px; font: 800 clamp(46px, 13vw, 68px)/.9 inherit; letter-spacing: -.02em;
  text-shadow: 0 0 34px color-mix(in srgb, var(--fg) 20%, transparent);
}

.ekans__menu-controls { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 340px; align-items: stretch; }

.ekans__modes { display: flex; gap: 6px; padding: 4px; border-radius: 999px; background: var(--panel); border: 1px solid var(--faint); }
.ekans__mode-pill {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px;
  padding: 9px 6px; border-radius: 999px; color: var(--dim);
  font: 700 12px/1 inherit; letter-spacing: .02em;
  transition: background 140ms ease, color 140ms ease, transform 100ms ease;
}
.ekans__mode-pill:active { transform: scale(.96); }
.ekans__mode-pill.is-active { background: var(--fg); color: var(--bg); }
.ekans__mode-pips { display: flex; gap: 3px; }
.ekans__mode-pips i { width: 4px; height: 4px; border-radius: 50%; background: currentColor; opacity: .3; }
.ekans__mode-pips i.is-on { opacity: 1; }

.ekans__play {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 16px; border-radius: 999px; background: var(--fg); color: var(--bg);
  font: 800 14px/1 inherit; letter-spacing: .08em;
  transition: transform 100ms ease, opacity 100ms ease;
}
.ekans__play:active { transform: scale(.97); opacity: .9; }
.ekans__play svg { flex-shrink: 0; }

.ekans__seedbar { display: flex; align-items: center; gap: 6px; align-self: center; opacity: .8; }
.ekans__seedinput {
  width: 90px; padding: 7px 4px; text-align: center; border-radius: 8px;
  border: 1px solid transparent; background: transparent; color: var(--dim);
  font: 700 12px/1 var(--font-mono); letter-spacing: .1em; text-transform: uppercase;
}
.ekans__seedinput:focus { outline: none; border-color: var(--faint); color: var(--fg); }
.ekans__seed-shuffle { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 999px; color: var(--dim); }
.ekans__seed-shuffle:active { color: var(--fg); }

/* Bottom sheets (result / replay) */
.ekans__backdrop {
  position: absolute; inset: 0; z-index: 10;
  display: flex; align-items: flex-end;
  background: rgba(0, 0, 0, .55); backdrop-filter: blur(6px);
}
.ekans__sheet {
  width: 100%; padding: 26px 22px calc(env(safe-area-inset-bottom, 0px) + 22px);
  border-radius: 20px 20px 0 0; background: #121214; border-top: 1px solid var(--faint);
  display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center;
}
.ekans__result-icon {
  display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%;
  background: var(--panel); border: 1px solid var(--faint); color: var(--fg);
}
.ekans__result-icon.is-trapped { background: var(--fg); color: var(--bg); border-color: var(--fg); }
.ekans__sheet-title { margin: 0; font: 800 32px/1 inherit; letter-spacing: -.01em; }

.ekans__result-stats { display: flex; gap: 22px; }
.ekans__result-stat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.ekans__result-stat b { font: 800 18px/1 var(--font-mono); }
.ekans__result-stat span { font: 700 9px/1 var(--font-mono); letter-spacing: .12em; color: var(--dim); }

.ekans__play--sheet { width: 100%; margin-top: 4px; }

.ekans__result-row { display: flex; gap: 8px; width: 100%; }
.ekans__chip-btn {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px;
  padding: 10px 6px; border-radius: 14px; border: 1px solid var(--faint); background: transparent; color: var(--fg);
  font: 700 9.5px/1 var(--font-mono); letter-spacing: .08em;
  transition: transform 100ms ease, background 100ms ease;
}
.ekans__chip-btn:active { transform: scale(.95); background: var(--faint); }

.ekans__sheet--replay { gap: 16px; padding-top: 20px; }
.ekans__replay-head { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.ekans__replay-count { display: flex; align-items: center; gap: 6px; margin: 0; font: 800 16px/1 var(--font-mono); }
.ekans__scrub { width: 100%; accent-color: var(--fg); }
.ekans__replay-nav { display: flex; gap: 10px; justify-content: center; width: 100%; }
.ekans__step {
  width: 52px; height: 42px; display: grid; place-items: center; border-radius: 12px;
  background: var(--panel); border: 1px solid var(--faint); color: var(--fg);
}
.ekans__step:disabled { opacity: .3; }
.ekans__step:not(:disabled):active { transform: scale(.94); background: var(--faint); }

.sheet-enter-active, .sheet-leave-active { transition: opacity 200ms ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
/* A fading-out sheet must not keep intercepting taps meant for the board
   underneath it during its 200ms leave transition. */
.sheet-leave-active { pointer-events: none; }
.ekans__backdrop.sheet-enter-active .ekans__sheet { transition: transform 220ms cubic-bezier(.2, .9, .3, 1); }
.ekans__backdrop.sheet-enter-from .ekans__sheet { transform: translateY(24px); }

@media (prefers-reduced-motion: reduce) {
  .ekans__seg, .ekans__food-dot, .ekans__ripple, .ekans__burst i, .ekans__mark-seg::after, .is-shaking .ekans__board {
    animation: none !important; transition: none !important;
  }
}
</style>
