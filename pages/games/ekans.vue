<script setup lang="ts">
import {
  type Cell, type Mode, type TurnRecord,
  MODES, BOARD_COLS, BOARD_ROWS,
  createRun, canPlace, placeFood, advance, randomSeedLabel,
  solveTrapLine, replayLine
} from '~/utils/ekans/engine'

/**
 * EKANS is a self-contained, full-screen mobile app, not a publication page —
 * see the `bare` route list in app.vue. It pins its own light, yellow theme
 * regardless of the site's light/dark setting: a game cabinet in the
 * publication's accent colour, not a themed section of the editorial shell.
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
type ReplaySource = 'own' | 'solution'

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
const shocks = ref<{ id: number; r: number; c: number; delay: number; dist: number }[]>([])
let fxId = 0
const tickTimer = ref<ReturnType<typeof window.setTimeout> | null>(null)
const TICK_MS = 150

// Replay / solution
const replayIndex = ref(0)
const replaySource = ref<ReplaySource>('own')
const solutionHistory = ref<TurnRecord[]>([])
const solutionInitialBody = ref<Cell[]>([])
const solving = ref(false)
const solveFailed = ref(false)
let solveTimer: ReturnType<typeof window.setTimeout> | null = null

const modeLabel = computed(() => MODES[state.value.mode].label.toUpperCase())
const modeInitial = computed(() => MODES[state.value.mode].label[0])
const hintText = computed(() => state.value.status === 'moving' ? 'HUNTING' : 'TAP TO FEED')
const fillPercent = computed(() => Math.round((state.value.body.length / (BOARD_COLS * BOARD_ROWS)) * 100))
const playerWon = computed(() => state.value.status === 'trapped')
const resultTitle = computed(() => playerWon.value ? 'TRAPPED' : 'ESCAPED')

function haptic(pattern: number | number[]) {
  try { navigator.vibrate?.(pattern) } catch { /* unsupported */ }
}

function stopTimers() {
  if (tickTimer.value) { window.clearTimeout(tickTimer.value); tickTimer.value = null }
  if (solveTimer) { window.clearTimeout(solveTimer); solveTimer = null }
  solving.value = false
}

function startRun() {
  haptic(10)
  stopTimers()
  const s = createRun(mode.value, seedInput.value)
  state.value = s
  initialBody.value = s.body.map((c) => ({ ...c }))
  bodyIds.value = s.body.map((_, i) => i + 1)
  nextId = s.body.length + 1
  history.value = []
  solutionHistory.value = []
  solveFailed.value = false
  replayIndex.value = 0
  phase.value = 'playing'
}

function retrySeed() { seedInput.value = state.value.seedLabel; startRun() }
function newSeed() { seedInput.value = randomSeedLabel(); startRun() }
function backToMenu() {
  haptic(10)
  stopTimers()
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

/**
 * The placement shockwave: every tile within a few steps of the tap gets a
 * kick, delayed by its distance so the disturbance visibly travels outward
 * from the cell the player chose.
 */
function shockwave(origin: Cell) {
  const RADIUS = 3
  const added: number[] = []
  for (let r = origin.r - RADIUS; r <= origin.r + RADIUS; r++) {
    for (let c = origin.c - RADIUS; c <= origin.c + RADIUS; c++) {
      if (r < 0 || r >= BOARD_ROWS || c < 0 || c >= BOARD_COLS) continue
      const dist = Math.abs(r - origin.r) + Math.abs(c - origin.c)
      if (dist > RADIUS) continue
      const id = fxId++
      added.push(id)
      shocks.value.push({ id, r, c, delay: dist * 45, dist })
    }
  }
  window.setTimeout(() => {
    const drop = new Set(added)
    shocks.value = shocks.value.filter((s) => !drop.has(s.id))
  }, 900)
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

    if (s.eaten > eatenBefore && turnFood) burst(turnFood)

    if (s.status === 'trapped') {
      recordTurn('trapped')
      haptic([0, 45, 70, 45, 70, 90])
      window.setTimeout(() => { phase.value = 'result' }, 320)
      return
    }
    if (s.status === 'escaped') {
      recordTurn('ate')
      haptic(18)
      window.setTimeout(() => { phase.value = 'result' }, 320)
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
  shockwave(cell)
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
  if (phase.value !== 'playing' || s.status !== 'placing') return
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const c = Math.floor((x / rect.width) * BOARD_COLS)
  const r = Math.floor((y / rect.height) * BOARD_ROWS)
  const ok = canPlace(s, { r, c })

  const id = fxId++
  ripples.value.push({ id, x: (x / rect.width) * 100, y: (y / rect.height) * 100, bad: !ok })
  window.setTimeout(() => { ripples.value = ripples.value.filter((rp) => rp.id !== id) }, 460)

  if (!ok) { reject(); return }
  placeCell({ r, c })
}

// --- replay + "show me the line" -------------------------------------------

function openOwnReplay() {
  haptic(8)
  replaySource.value = 'own'
  replayIndex.value = history.value.length
  phase.value = 'replay'
}

function closeReplay() { haptic(8); phase.value = 'result' }

/**
 * Two passes, escalating. The first is tuned to answer almost instantly on
 * most boards; the handful it can't crack usually fall to a much wider search
 * that costs a few seconds, which is worth spending rather than telling a
 * player their board was unwinnable when it wasn't.
 */
const SOLVE_PASSES = [
  { beamWidth: 14, candidates: 20, maxNodes: 9000 },
  { beamWidth: 30, candidates: 32, maxNodes: 40000 }
]
const solvePass = ref(0)

function showTheLine() {
  if (solving.value) return
  haptic(8)
  solving.value = true
  solveFailed.value = false
  solvePass.value = 0
  runSolvePass(0)
}

function runSolvePass(passIndex: number) {
  const cfg = SOLVE_PASSES[passIndex]
  if (!cfg) { solving.value = false; solveFailed.value = true; return }
  solvePass.value = passIndex

  const iter = solveTrapLine(state.value.mode, state.value.seedLabel, cfg)
  const pump = () => {
    if (!solving.value) return // cancelled by leaving the screen
    const started = performance.now()
    let res = iter.next()
    // Work for a slice, then hand the frame back so the page keeps painting.
    while (!res.done && performance.now() - started < 12) res = iter.next()

    if (!res.done) { solveTimer = window.setTimeout(pump, 0); return }

    const line = res.value.placements
    if (!line) { runSolvePass(passIndex + 1); return }

    solving.value = false
    const replayed = replayLine(state.value.mode, state.value.seedLabel, line)
    solutionInitialBody.value = replayed.initialBody
    solutionHistory.value = replayed.history
    replaySource.value = 'solution'
    replayIndex.value = 0 // start at the beginning: the line is a lesson, not a reveal
    phase.value = 'replay'
  }
  solveTimer = window.setTimeout(pump, 0)
}

const activeHistory = computed(() => replaySource.value === 'solution' ? solutionHistory.value : history.value)
const activeInitialBody = computed(() => replaySource.value === 'solution' ? solutionInitialBody.value : initialBody.value)

const replayFrame = computed(() => {
  if (replayIndex.value <= 0) return { body: activeInitialBody.value, food: null as Cell | null }
  const rec = activeHistory.value[replayIndex.value - 1]
  if (!rec) return { body: activeInitialBody.value, food: null as Cell | null }
  return { body: rec.bodyAfter, food: rec.food }
})

/** The placement being taught on this replay frame — shown as a marker. */
const replayPlacement = computed(() => {
  if (phase.value !== 'replay' || replayIndex.value <= 0) return null
  return activeHistory.value[replayIndex.value - 1]?.food ?? null
})

const isFinalTrapFrame = computed(() => {
  const h = activeHistory.value
  return replayIndex.value === h.length && h[h.length - 1]?.outcome === 'trapped'
})

const displaySegments = computed(() => {
  const body = phase.value === 'replay' ? replayFrame.value.body : state.value.body
  return body.map((cell, i) => ({
    id: phase.value === 'replay' ? i : (bodyIds.value[i] ?? i),
    r: cell.r, c: cell.c,
    isHead: i === 0,
    isTail: i === body.length - 1
  }))
})
const displayFood = computed(() => phase.value === 'replay' ? replayFrame.value.food : state.value.food)

/** Head facing, derived from the first two segments so replay frames work too. */
const headFacing = computed(() => {
  const body = phase.value === 'replay' ? replayFrame.value.body : state.value.body
  if (body.length < 2) return 'right'
  const [h, n] = body
  if (h.r < n.r) return 'up'
  if (h.r > n.r) return 'down'
  if (h.c < n.c) return 'left'
  return 'right'
})

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

let prevOverflow = ''
let prevOverscroll = ''
onMounted(() => {
  prevOverflow = document.body.style.overflow
  prevOverscroll = document.documentElement.style.overscrollBehavior
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overscrollBehavior = 'none'
  if (import.meta.dev) (window as any).__ekansDebug = { state, phase, history, solutionHistory, solving, solveFailed }
})
onUnmounted(() => {
  stopTimers()
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
            v-for="(w, i) in state.walls" :key="`wall-${i}`"
            class="ekans__wall"
            :style="segStyle(w)"
          />

          <span
            v-for="sk in shocks" :key="sk.id"
            class="ekans__shock"
            :style="{ ...segStyle(sk), animationDelay: sk.delay + 'ms' }"
          />

          <div
            v-for="seg in displaySegments"
            :key="seg.id"
            class="ekans__seg"
            :class="{ 'ekans__seg--head': seg.isHead, 'ekans__seg--tail': seg.isTail }"
            :style="segStyle(seg)"
          >
            <span v-if="seg.isHead" class="ekans__face" :class="`is-${headFacing}`" aria-hidden="true">
              <i></i><i></i>
            </span>
          </div>

          <Transition name="food">
            <div
              v-if="displayFood"
              :key="`${displayFood.r}-${displayFood.c}`"
              class="ekans__food"
              :style="segStyle(displayFood)"
            ><span class="ekans__food-dot" :class="{ 'is-final': phase === 'replay' && isFinalTrapFrame }" /></div>
          </Transition>

          <div
            v-if="replayPlacement"
            class="ekans__taught"
            :style="segStyle(replayPlacement)"
            aria-hidden="true"
          ><span></span></div>

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
          <div class="ekans__result-icon" :class="{ 'is-win': playerWon }">
            <svg v-if="playerWon" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
            <svg v-else viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </div>
          <h2 class="ekans__sheet-title">{{ resultTitle }}</h2>

          <div class="ekans__result-stats">
            <div class="ekans__result-stat"><b>{{ history.length }}</b><span>MOVES</span></div>
            <div class="ekans__result-stat"><b>{{ fillPercent }}%</b><span>FILLED</span></div>
            <div class="ekans__result-stat"><b>{{ modeLabel }}</b><span>MODE</span></div>
          </div>

          <!-- Lost: the board is solvable and here is proof. -->
          <button v-if="!playerWon" class="ekans__play ekans__play--sheet" @click="showTheLine" :disabled="solving">
            <svg v-if="!solving" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></svg>
            <svg v-else class="ekans__spin" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 3a9 9 0 0 1 9 9" /></svg>
            {{ solving ? (solvePass > 0 ? 'SEARCHING DEEPER…' : 'FINDING A LINE…') : 'SHOW ME THE LINE' }}
          </button>
          <p v-if="solveFailed" class="ekans__note">Searched hard and found no trap on this board. Some seeds really are the snake's.</p>

          <button class="ekans__play ekans__play--sheet" :class="{ 'ekans__play--ghost': !playerWon }" @click="newSeed">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 4l13 8-13 8V4z" /></svg>
            {{ playerWon ? 'PLAY AGAIN' : 'NEW BOARD' }}
          </button>

          <div class="ekans__result-row">
            <button v-if="playerWon" class="ekans__chip-btn" @click="openOwnReplay" aria-label="Watch replay">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" /></svg>
              REPLAY
            </button>
            <button class="ekans__chip-btn" @click="retrySeed" aria-label="Retry same board">
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

    <!-- Replay is a teaching view, so it never dims the board: the whole point
         is to watch the shape the line makes. It docks as a bar, not a modal. -->
    <Transition name="sheet">
      <div v-if="phase === 'replay'" class="ekans__replaydock">
        <div class="ekans__sheet ekans__sheet--replay">
          <div class="ekans__replay-head">
            <p class="ekans__replay-label">{{ replaySource === 'solution' ? 'A WINNING LINE' : 'YOUR RUN' }}</p>
            <button class="ekans__hud-exit" @click="closeReplay" aria-label="Close replay">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <p class="ekans__replay-count">
            {{ replayIndex }} / {{ activeHistory.length }}
            <svg v-if="isFinalTrapFrame" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
          </p>
          <input type="range" class="ekans__scrub" min="0" :max="activeHistory.length" step="1" v-model.number="replayIndex" />
          <div class="ekans__replay-nav">
            <button class="ekans__step" :disabled="replayIndex === 0" @click="replayIndex = Math.max(0, replayIndex - 1)" aria-label="Previous turn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <button class="ekans__step" :disabled="replayIndex === activeHistory.length" @click="replayIndex = Math.min(activeHistory.length, replayIndex + 1)" aria-label="Next turn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* One pinned palette. The game is a cabinet in the publication's yellow, and
   it looks the same whether the reader's site theme is light or dark. */
.ekans {
  --bg: #FFFBEF;
  --panel: #FFFFFF;
  --ink: #161618;
  --ink-soft: #6B6857;
  --accent: #FFD43B;
  --accent-strong: #EAB900;
  --accent-soft: #FFF3B8;
  --line: rgba(22, 22, 24, .08);
  --edge: rgba(22, 22, 24, .14);
  --wall: #E4DCC2;

  position: fixed; inset: 0; z-index: 40;
  display: flex; flex-direction: column;
  background: var(--bg); color: var(--ink);
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
  background: var(--panel); border: 1px solid var(--edge); color: var(--ink);
  transition: transform 120ms ease, background 120ms ease;
}
.ekans__hud-exit:active { transform: scale(.9); background: var(--accent-soft); }
.ekans__hud-chip {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 12px 7px 8px; border-radius: 999px;
  background: var(--panel); border: 1px solid var(--edge);
}
.ekans__hud-mode {
  display: grid; place-items: center; width: 19px; height: 19px; border-radius: 6px;
  background: var(--accent); font: 800 10px/1 var(--font-mono); color: var(--ink);
}
.ekans__hud-diamond { width: 7px; height: 7px; background: var(--accent-strong); transform: rotate(45deg); border-radius: 1px; }
.ekans__hud-count { font: 700 13px/1 var(--font-mono); letter-spacing: .01em; }

.ekans__stage { flex: 1; display: grid; place-items: center; padding: 6px 16px; min-height: 0; }
.ekans__board {
  position: relative; width: 100%; max-width: 480px;
  aspect-ratio: 9 / 15;
  max-height: 100%;
  border-radius: 16px; overflow: hidden;
  background: var(--panel);
  border: 1px solid var(--edge);
  box-shadow: 0 2px 0 rgba(22, 22, 24, .06), 0 14px 30px -18px rgba(22, 22, 24, .4);
}
.ekans__gridlines {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(to right, var(--line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--line) 1px, transparent 1px);
  background-size: calc(100% / 9) 100%, 100% calc(100% / 15);
}

.ekans__wall { position: absolute; top: 0; left: 0; pointer-events: none; }
.ekans__wall::after {
  content: ''; position: absolute; inset: 1.5px; border-radius: 4px;
  background-color: var(--wall);
  background-image: repeating-linear-gradient(
    135deg,
    rgba(22, 22, 24, .10) 0px, rgba(22, 22, 24, .10) 2px,
    transparent 2px, transparent 6px
  );
}

/* Shockwave: each tile in range flinches, delayed by its distance. */
.ekans__shock { position: absolute; top: 0; left: 0; pointer-events: none; }
.ekans__shock::after {
  content: ''; position: absolute; inset: 1.5px; border-radius: 4px;
  background: var(--accent);
  animation: ekans-shock 620ms cubic-bezier(.25, .8, .35, 1) both;
}
@keyframes ekans-shock {
  0%   { opacity: 0; transform: scale(.55); }
  28%  { opacity: .5; transform: scale(1.06); }
  100% { opacity: 0; transform: scale(.82); }
}

/* The snake: rounded, chunky, a face on the head. Minimal but alive. */
.ekans__seg {
  position: absolute; top: 0; left: 0;
  transition: transform 140ms cubic-bezier(.3, .7, .4, 1);
}
.ekans__seg::after {
  content: ''; position: absolute; inset: 1.5px; border-radius: 5px;
  background: var(--ink);
}
.ekans__seg--tail::after { inset: 3px; border-radius: 999px; opacity: .82; }
.ekans__seg--head::after {
  inset: 0.5px; border-radius: 8px;
  background: var(--ink);
  box-shadow: 0 0 0 2px var(--accent);
}

.ekans__face { position: absolute; inset: 0; display: grid; place-items: center; z-index: 1; }
.ekans__face i {
  position: absolute; width: 17%; height: 17%; border-radius: 50%; background: var(--panel);
  animation: ekans-blink 4.2s ease-in-out infinite;
}
/* Eyes sit toward whichever edge the head is travelling into. */
.ekans__face.is-right i { left: 62%; }
.ekans__face.is-right i:nth-child(1) { top: 27%; }
.ekans__face.is-right i:nth-child(2) { top: 56%; }
.ekans__face.is-left i { left: 21%; }
.ekans__face.is-left i:nth-child(1) { top: 27%; }
.ekans__face.is-left i:nth-child(2) { top: 56%; }
.ekans__face.is-up i { top: 21%; }
.ekans__face.is-up i:nth-child(1) { left: 27%; }
.ekans__face.is-up i:nth-child(2) { left: 56%; }
.ekans__face.is-down i { top: 62%; }
.ekans__face.is-down i:nth-child(1) { left: 27%; }
.ekans__face.is-down i:nth-child(2) { left: 56%; }
@keyframes ekans-blink {
  0%, 92%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(.15); }
}

.ekans__food { position: absolute; top: 0; left: 0; display: grid; place-items: center; pointer-events: none; }
.ekans__food-dot {
  width: 46%; height: 46%; border-radius: 50%;
  background: var(--accent); border: 2px solid var(--ink); box-sizing: border-box;
  animation: ekans-pulse 1.1s ease-in-out infinite;
}
.ekans__food-dot.is-final { background: var(--ink); animation: none; }
@keyframes ekans-pulse {
  0%, 100% { transform: scale(.86); }
  50% { transform: scale(1.06); }
}

.food-enter-active { transition: transform 160ms cubic-bezier(.2, 1.4, .4, 1), opacity 160ms; }
.food-enter-from { transform: scale(.2); opacity: 0; }
.food-leave-active { transition: opacity 100ms; }
.food-leave-to { opacity: 0; }

/* The placement being taught in a replay frame. */
.ekans__taught { position: absolute; top: 0; left: 0; display: grid; place-items: center; pointer-events: none; }
.ekans__taught span {
  width: 82%; height: 82%; border-radius: 6px;
  border: 2px dashed var(--accent-strong);
  animation: ekans-taught 1.4s ease-in-out infinite;
}
@keyframes ekans-taught { 0%, 100% { opacity: .45; } 50% { opacity: 1; } }

.ekans__burst { position: absolute; top: 0; left: 0; display: grid; place-items: center; pointer-events: none; }
.ekans__burst i {
  position: absolute; width: 4px; height: 4px; background: var(--accent-strong); border-radius: 1px;
  animation: ekans-burst 440ms cubic-bezier(.2, .7, .3, 1) forwards;
}
@keyframes ekans-burst {
  from { transform: rotate(var(--ang)) translateY(0) scale(1); opacity: 1; }
  to { transform: rotate(var(--ang)) translateY(-16px) scale(.2); opacity: 0; }
}

.ekans__ripple {
  position: absolute; width: 46px; height: 46px; margin: -23px 0 0 -23px;
  border-radius: 50%; border: 2px solid var(--accent-strong); pointer-events: none;
  animation: ekans-ripple 460ms ease-out forwards;
}
.ekans__ripple--bad { border-color: var(--ink); }
@keyframes ekans-ripple { from { transform: scale(.4); opacity: .7; } to { transform: scale(1.25); opacity: 0; } }

.is-shaking .ekans__board { animation: ekans-shake 220ms ease-in-out; }
@keyframes ekans-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.ekans__foot { padding: 10px 16px calc(env(safe-area-inset-bottom, 0px) + 18px); text-align: center; }
.ekans__hint { margin: 0; font: 700 11px/1 var(--font-mono); letter-spacing: .14em; color: var(--ink-soft); }

/* Menu: a splash screen, not a hero section. */
.ekans__menu {
  position: absolute; inset: 0; z-index: 5;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  background:
    radial-gradient(120% 60% at 50% 8%, var(--accent-soft) 0%, transparent 62%),
    var(--bg);
  padding: calc(env(safe-area-inset-top, 0px) + 24px) 24px calc(env(safe-area-inset-bottom, 0px) + 28px);
}

.ekans__mark { position: relative; width: clamp(96px, 28vw, 132px); aspect-ratio: 1; margin-bottom: 14px; }
.ekans__mark-glow {
  position: absolute; inset: -34%; border-radius: 50%;
  background: radial-gradient(circle, var(--accent) 0%, transparent 68%);
  opacity: .55;
}
.ekans__mark-seg { position: absolute; top: 0; left: 0; width: 25%; height: 25%; }
.ekans__mark-seg::after {
  content: ''; position: absolute; inset: 6%; border-radius: 26%;
  background: var(--ink);
  animation: ekans-mark-glow 2.6s ease-in-out calc(var(--i) * 110ms) infinite;
}
.ekans__mark-seg--head::after { background: var(--ink); box-shadow: 0 0 0 2px var(--accent-strong); }
@keyframes ekans-mark-glow { 0%, 100% { opacity: .58; } 30% { opacity: 1; } }

.ekans__wordmark {
  margin: 0 0 26px; font: 800 clamp(46px, 13vw, 68px)/.9 inherit; letter-spacing: -.02em;
}

.ekans__menu-controls { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 340px; align-items: stretch; }

.ekans__modes {
  display: flex; gap: 6px; padding: 4px; border-radius: 999px;
  background: var(--panel); border: 1px solid var(--edge);
}
.ekans__mode-pill {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px;
  padding: 9px 6px; border-radius: 999px; color: var(--ink-soft);
  font: 700 12px/1 inherit; letter-spacing: .02em;
  transition: background 140ms ease, color 140ms ease, transform 100ms ease;
}
.ekans__mode-pill:active { transform: scale(.96); }
.ekans__mode-pill.is-active { background: var(--accent); color: var(--ink); }
.ekans__mode-pips { display: flex; gap: 3px; }
.ekans__mode-pips i { width: 4px; height: 4px; border-radius: 50%; background: currentColor; opacity: .32; }
.ekans__mode-pips i.is-on { opacity: 1; }

.ekans__play {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 16px; border-radius: 999px; background: var(--accent); color: var(--ink);
  border: 1px solid var(--ink);
  font: 800 14px/1 inherit; letter-spacing: .08em;
  box-shadow: 0 3px 0 var(--ink);
  transition: transform 100ms ease, box-shadow 100ms ease;
}
.ekans__play:active { transform: translateY(3px); box-shadow: 0 0 0 var(--ink); }
.ekans__play:disabled { opacity: .65; }
.ekans__play svg { flex-shrink: 0; }
.ekans__play--ghost { background: var(--panel); box-shadow: 0 3px 0 var(--edge); }
.ekans__spin { animation: ekans-spin .9s linear infinite; }
@keyframes ekans-spin { to { transform: rotate(360deg); } }

.ekans__seedbar { display: flex; align-items: center; gap: 6px; align-self: center; }
.ekans__seedinput {
  width: 92px; padding: 7px 4px; text-align: center; border-radius: 8px;
  border: 1px solid transparent; background: transparent; color: var(--ink-soft);
  font: 700 12px/1 var(--font-mono); letter-spacing: .1em; text-transform: uppercase;
}
.ekans__seedinput:focus { outline: none; border-color: var(--edge); color: var(--ink); background: var(--panel); }
.ekans__seed-shuffle { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 999px; color: var(--ink-soft); }
.ekans__seed-shuffle:active { color: var(--ink); }

/* Bottom sheets (result / replay) */
.ekans__backdrop {
  position: absolute; inset: 0; z-index: 10;
  display: flex; align-items: flex-end;
  background: rgba(22, 22, 24, .32); backdrop-filter: blur(5px);
}
.ekans__sheet {
  width: 100%; padding: 26px 22px calc(env(safe-area-inset-bottom, 0px) + 22px);
  border-radius: 22px 22px 0 0; background: var(--bg); border-top: 2px solid var(--ink);
  display: flex; flex-direction: column; align-items: center; gap: 13px; text-align: center;
}
.ekans__result-icon {
  display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%;
  background: var(--panel); border: 2px solid var(--ink); color: var(--ink);
}
.ekans__result-icon.is-win { background: var(--accent); }
.ekans__sheet-title { margin: 0; font: 800 32px/1 inherit; letter-spacing: -.01em; }

.ekans__result-stats { display: flex; gap: 22px; }
.ekans__result-stat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.ekans__result-stat b { font: 800 18px/1 var(--font-mono); }
.ekans__result-stat span { font: 700 9px/1 var(--font-mono); letter-spacing: .12em; color: var(--ink-soft); }

.ekans__play--sheet { width: 100%; margin-top: 2px; }
.ekans__note { margin: 0; font: 600 11.5px/1.4 inherit; color: var(--ink-soft); max-width: 34ch; }

.ekans__result-row { display: flex; gap: 8px; width: 100%; }
.ekans__chip-btn {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px;
  padding: 10px 6px; border-radius: 14px; border: 1px solid var(--edge);
  background: var(--panel); color: var(--ink);
  font: 700 9.5px/1 var(--font-mono); letter-spacing: .08em;
  transition: transform 100ms ease, background 100ms ease;
}
.ekans__chip-btn:active { transform: scale(.95); background: var(--accent-soft); }

/* Docked replay controls: bottom-anchored, board left fully legible above. */
.ekans__replaydock {
  position: absolute; inset: auto 0 0 0; z-index: 10;
  display: flex; align-items: flex-end;
  pointer-events: none;
}
.ekans__replaydock .ekans__sheet {
  pointer-events: auto;
  box-shadow: 0 -14px 30px -22px rgba(22, 22, 24, .55);
}
.ekans__sheet--replay { gap: 14px; padding-top: 18px; }
.ekans__replay-head { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.ekans__replay-label { margin: 0; font: 800 11px/1 var(--font-mono); letter-spacing: .16em; color: var(--ink-soft); }
.ekans__replay-count { display: flex; align-items: center; gap: 6px; margin: 0; font: 800 18px/1 var(--font-mono); }
.ekans__scrub { width: 100%; accent-color: var(--accent-strong); }
.ekans__replay-nav { display: flex; gap: 10px; justify-content: center; width: 100%; }
.ekans__step {
  width: 52px; height: 42px; display: grid; place-items: center; border-radius: 12px;
  background: var(--panel); border: 1px solid var(--edge); color: var(--ink);
}
.ekans__step:disabled { opacity: .35; }
.ekans__step:not(:disabled):active { transform: scale(.94); background: var(--accent-soft); }

.sheet-enter-active, .sheet-leave-active { transition: opacity 200ms ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
/* A fading-out sheet must not keep intercepting taps meant for the board
   underneath it during its 200ms leave transition. */
.sheet-leave-active { pointer-events: none; }
.ekans__backdrop.sheet-enter-active .ekans__sheet,
.ekans__replaydock.sheet-enter-active .ekans__sheet { transition: transform 220ms cubic-bezier(.2, .9, .3, 1); }
.ekans__backdrop.sheet-enter-from .ekans__sheet,
.ekans__replaydock.sheet-enter-from .ekans__sheet { transform: translateY(24px); }

@media (prefers-reduced-motion: reduce) {
  .ekans__seg, .ekans__food-dot, .ekans__ripple, .ekans__burst i, .ekans__mark-seg::after,
  .ekans__shock::after, .ekans__taught span, .ekans__face i, .is-shaking .ekans__board {
    animation: none !important; transition: none !important;
  }
}
</style>
