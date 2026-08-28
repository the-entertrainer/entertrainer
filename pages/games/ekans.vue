<script setup lang="ts">
import {
  type Cell, type Mode, type TurnRecord,
  MODES, BOARD_COLS, BOARD_ROWS,
  createRun, canPlace, placeFood, advance, randomSeedLabel, solveTrapLine
} from '~/utils/ekans/engine'
import { arcade } from '~/utils/ekans/audio'

/**
 * EKANS is a self-contained, full-screen mobile app, not a publication page —
 * see the `bare` route list in app.vue. It pins its own light, yellow theme
 * regardless of the site's light/dark setting: a game cabinet in the
 * publication's accent colour, not a themed section of the editorial shell.
 *
 * Screens carry labels, not prose. The board teaches the rule — tap, watch,
 * see what happens — so the chrome stays at the level an arcade cabinet uses:
 * a word, a number, an icon.
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

type Phase = 'menu' | 'playing' | 'result'

const DIFFICULTY: Record<Mode, number> = { learn: 1, standard: 2, expert: 3 }
const MODE_TAG: Record<Mode, string> = { learn: 'EASY', standard: 'NORMAL', expert: 'HARD' }
const ICON_COIL = [
  { r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 },
  { r: 1, c: 3 }, { r: 2, c: 3 }, { r: 2, c: 2 }, { r: 2, c: 1 }, { r: 3, c: 1 }
]

const LIVE_TICK_MS = 150

const phase = ref<Phase>('menu')
const mode = ref<Mode>('standard')
const seedInput = ref(randomSeedLabel())
const muted = ref(false)

// A plain ref (not shallowRef) so Vue proxies it with reactive() — the engine
// mutates body/status/food in place (unshift/pop/assign), and that proxy is
// what makes those in-place mutations show up in the template automatically.
const state = ref(createRun('standard')) // placeholder until first real run; overwritten by startRun
const history = ref<TurnRecord[]>([])
let turnPath: Cell[] = []
let turnBodyBefore: Cell[] = []
let turnFood: Cell | null = null

/**
 * The hint marks the next click and then gets out of the way — the player
 * still makes every move. `guided` just means the hint re-arms itself each
 * turn instead of being asked for one move at a time.
 */
const hintCell = ref<Cell | null>(null)
const hintBusy = ref(false)
const hintFailed = ref(false)
const guided = ref(false)

// Shared animation state — only one run animates at a time.
const bodyIds = ref<number[]>([])
let nextId = 1
const bulgeAt = ref<number | null>(null)
const chomping = ref(false)
const shaking = ref(false)
const trapFlash = ref(false)
const waves = ref<{ id: number; x: number; y: number; bad: boolean }[]>([])
const shocks = ref<{ id: number; r: number; c: number; delay: number }[]>([])
const bursts = ref<{ id: number; r: number; c: number }[]>([])
let fxId = 0

let tickTimer: ReturnType<typeof window.setTimeout> | null = null
let bulgeTimer: ReturnType<typeof window.setInterval> | null = null
let solveTimer: ReturnType<typeof window.setTimeout> | null = null


const view = computed(() => state.value)

const modeTag = computed(() => MODE_TAG[view.value.mode])
const modeInitial = computed(() => MODE_TAG[view.value.mode][0])
const playerWon = computed(() => state.value.status === 'trapped')
const fillPercent = computed(() => Math.round((state.value.body.length / (BOARD_COLS * BOARD_ROWS)) * 100))
const showFirstHint = computed(() => phase.value === 'playing' && state.value.eaten === 0 && state.value.status === 'placing')

function haptic(p: number | number[]) { try { navigator.vibrate?.(p) } catch { /* unsupported */ } }
function sfx(name: 'tap' | 'select' | 'place' | 'deny' | 'crunch' | 'start' | 'win' | 'lose' | 'reveal') {
  arcade.unlock()
  arcade[name]()
}
function toggleMute() {
  arcade.unlock()
  muted.value = !muted.value
  arcade.setMuted(muted.value)
  if (!muted.value) arcade.tap()
}

function clearTimers() {
  if (tickTimer) { window.clearTimeout(tickTimer); tickTimer = null }
  if (bulgeTimer) { window.clearInterval(bulgeTimer); bulgeTimer = null }
  if (solveTimer) { window.clearTimeout(solveTimer); solveTimer = null }
  hintBusy.value = false
  bulgeAt.value = null
}

/** One place that retires the marker, so it can never outlive its board. */
function clearHint() {
  hintCell.value = null
  hintBusy.value = false
  hintFailed.value = false
}

// --- shared board effects ---------------------------------------------------

function resetIds(body: Cell[]) {
  bodyIds.value = body.map((_, i) => i + 1)
  nextId = body.length + 1
}
function pushHeadId(len: number) {
  bodyIds.value.unshift(nextId++)
  while (bodyIds.value.length > len) bodyIds.value.pop()
}

/**
 * The swallow: a bulge that runs from head to tail after a bite, so growth
 * reads as something moving through the snake rather than a segment blinking
 * into existence.
 */
function swallow(bodyLength: number) {
  if (bulgeTimer) window.clearInterval(bulgeTimer)
  bulgeAt.value = 0
  bulgeTimer = window.setInterval(() => {
    if (bulgeAt.value === null) return
    bulgeAt.value++
    if (bulgeAt.value > bodyLength) {
      bulgeAt.value = null
      if (bulgeTimer) { window.clearInterval(bulgeTimer); bulgeTimer = null }
    }
  }, 52)
}

function chomp() {
  chomping.value = true
  window.setTimeout(() => { chomping.value = false }, 260)
}

function burstAt(cell: Cell) {
  const id = fxId++
  bursts.value.push({ id, ...cell })
  window.setTimeout(() => { bursts.value = bursts.value.filter((b) => b.id !== id) }, 520)
}

/**
 * Ripple: two wave fronts crossing the tiles, each cell delayed by its
 * distance from the tap. Deliberately near-threshold — you should feel the
 * board answer the touch, not watch a light show.
 */
function rippleTiles(origin: Cell) {
  const RADIUS = 4
  const added: number[] = []
  for (let front = 0; front < 2; front++) {
    for (let r = origin.r - RADIUS; r <= origin.r + RADIUS; r++) {
      for (let c = origin.c - RADIUS; c <= origin.c + RADIUS; c++) {
        if (r < 0 || r >= BOARD_ROWS || c < 0 || c >= BOARD_COLS) continue
        const dist = Math.abs(r - origin.r) + Math.abs(c - origin.c)
        if (dist > RADIUS) continue
        const id = fxId++
        added.push(id)
        shocks.value.push({ id, r, c, delay: dist * 42 + front * 300 })
      }
    }
  }
  window.setTimeout(() => {
    const drop = new Set(added)
    shocks.value = shocks.value.filter((s) => !drop.has(s.id))
  }, 1500)
}

function ringWave(xPct: number, yPct: number, bad: boolean) {
  const id = fxId++
  waves.value.push({ id, x: xPct, y: yPct, bad })
  window.setTimeout(() => { waves.value = waves.value.filter((w) => w.id !== id) }, 1200)
}

function flashTrap() {
  trapFlash.value = true
  window.setTimeout(() => { trapFlash.value = false }, 1500)
}

// --- live run ----------------------------------------------------------------

function startRun() {
  sfx('start'); haptic(12)
  clearTimers()
  const s = createRun(mode.value, seedInput.value)
  state.value = s
  resetIds(s.body)
  history.value = []
  clearHint()
  phase.value = 'playing'
}

function retrySeed() { guided.value = false; seedInput.value = state.value.seedLabel; startRun() }
function newSeed() { guided.value = false; seedInput.value = randomSeedLabel(); startRun() }
function backToMenu() {
  sfx('tap'); haptic(10)
  clearTimers(); clearHint()
  guided.value = false
  phase.value = 'menu'
}
function pickMode(key: Mode) { sfx('select'); haptic(8); mode.value = key }

function recordTurn(outcome: 'ate' | 'trapped') {
  const s = state.value
  history.value.push({
    turn: s.turn, food: turnFood!, path: turnPath,
    bodyBefore: turnBodyBefore, bodyAfter: s.body.map((c) => ({ ...c })), outcome
  })
}

function runTicks() {
  const step = () => {
    const s = state.value
    if (s.status !== 'moving') return
    const before = s.eaten
    advance(s)
    turnPath.push({ ...s.body[0] })
    pushHeadId(s.body.length)

    if (s.eaten > before) {
      if (turnFood) burstAt(turnFood)
      chomp(); swallow(s.body.length); sfx('crunch'); haptic(16)
    }

    if (s.status === 'trapped') {
      recordTurn('trapped'); flashTrap(); sfx('win'); haptic([0, 45, 70, 45, 70, 120])
      window.setTimeout(() => { phase.value = 'result' }, 1250)
      return
    }
    if (s.status === 'escaped') {
      recordTurn('ate'); sfx('lose')
      window.setTimeout(() => { phase.value = 'result' }, 900)
      return
    }
    if (s.status === 'placing') {
      recordTurn('ate')
      if (guided.value) requestHint()
      return
    }
    tickTimer = window.setTimeout(step, LIVE_TICK_MS)
  }
  tickTimer = window.setTimeout(step, LIVE_TICK_MS)
}

function onBoardTap(e: MouseEvent) {
  arcade.unlock()
  const s = state.value
  if (phase.value !== 'playing' || s.status !== 'placing') return
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const c = Math.floor((x / rect.width) * BOARD_COLS)
  const r = Math.floor((y / rect.height) * BOARD_ROWS)
  const ok = canPlace(s, { r, c })

  ringWave((x / rect.width) * 100, (y / rect.height) * 100, !ok)

  if (!ok) {
    sfx('deny'); haptic([0, 12, 35, 12])
    shaking.value = true
    window.setTimeout(() => { shaking.value = false }, 220)
    return
  }

  // The marker has done its job the moment the player commits a move.
  clearHint()

  turnBodyBefore = s.body.map((cc) => ({ ...cc }))
  turnPath = [{ ...s.body[0] }]
  turnFood = { r, c }
  placeFood(s, { r, c })
  rippleTiles({ r, c })
  sfx('place'); haptic(9)
  runTicks()
}

// --- hint: show the next click, nothing more --------------------------------

const SOLVE_PASSES = [
  { beamWidth: 14, candidates: 20, maxNodes: 9000 },
  { beamWidth: 30, candidates: 32, maxNodes: 40000 }
]

/**
 * Search from the position on the board right now and mark the first move of
 * a line that traps the snake. The player still taps it themselves — nothing
 * here advances the game.
 */
function requestHint() {
  const s = state.value
  if (hintBusy.value || phase.value !== 'playing' || s.status !== 'placing') return
  arcade.unlock()
  hintCell.value = null
  hintFailed.value = false
  hintBusy.value = true
  runHintPass(0)
}

function runHintPass(passIndex: number) {
  const cfg = SOLVE_PASSES[passIndex]
  if (!cfg) { hintBusy.value = false; hintFailed.value = true; return }

  const iter = solveTrapLine(state.value.mode, state.value.seedLabel, { ...cfg, from: state.value })
  const pump = () => {
    // Anything that ended the turn or left the screen invalidates this search.
    if (!hintBusy.value || phase.value !== 'playing' || state.value.status !== 'placing') {
      hintBusy.value = false
      return
    }
    const started = performance.now()
    let res = iter.next()
    while (!res.done && performance.now() - started < 12) res = iter.next()
    if (!res.done) { solveTimer = window.setTimeout(pump, 0); return }

    const line = res.value.placements
    if (!line || !line.length) { runHintPass(passIndex + 1); return }
    hintBusy.value = false
    hintCell.value = line[0]
    sfx('reveal')
  }
  solveTimer = window.setTimeout(pump, 0)
}

/** Replay this exact board from the start, marking each next click as it goes. */
function startGuided() {
  sfx('tap'); haptic(8)
  guided.value = true
  seedInput.value = state.value.seedLabel
  startRun()
  requestHint()
}

function askHint() { sfx('tap'); haptic(8); requestHint() }

// --- rendering ---------------------------------------------------------------

const segments = computed(() => {
  const body = view.value.body
  return body.map((cell, i) => ({
    id: bodyIds.value[i] ?? `f${i}`,
    r: cell.r, c: cell.c,
    isHead: i === 0,
    isTail: i === body.length - 1,
    bulge: bulgeAt.value === i
  }))
})

/** Head facing, derived from the first two segments. */
const headFacing = computed(() => {
  const body = view.value.body
  if (body.length < 2) return 'right'
  const [h, n] = body
  if (h.r < n.r) return 'up'
  if (h.r > n.r) return 'down'
  if (h.c < n.c) return 'left'
  return 'right'
})

const isTrapped = computed(() => view.value.status === 'trapped')

const stampText = computed(() => 'YOU WIN')

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
  arcade.restore()
  muted.value = arcade.muted
  prevOverflow = document.body.style.overflow
  prevOverscroll = document.documentElement.style.overscrollBehavior
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overscrollBehavior = 'none'
  if (import.meta.dev) {
    (window as any).__ekansDebug = { state, phase, history, hintCell, hintBusy, hintFailed, guided }
  }
})
onUnmounted(() => {
  clearTimers()
  arcade.dispose()
  document.body.style.overflow = prevOverflow
  document.documentElement.style.overscrollBehavior = prevOverscroll
})
</script>

<template>
  <div class="ekans" :class="{ 'is-shaking': shaking, 'is-trapflash': trapFlash }">
    <div class="ekans__scene" v-if="phase !== 'menu'">
      <header class="ekans__hud">
        <button class="ekans__icon-btn" @click="backToMenu" aria-label="Back">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>

        <div class="ekans__hud-chip" :class="{ 'is-demo': guided }">
          <span class="ekans__hud-mode">{{ modeInitial }}</span>
          <i class="ekans__hud-diamond" aria-hidden="true"></i>
          <span class="ekans__hud-count">{{ view.eaten }}/{{ view.target }}</span>
        </div>

        <button
          class="ekans__icon-btn"
          :class="{ 'is-armed': !!hintCell }"
          :disabled="hintBusy || state.status !== 'placing'"
          @click="askHint" aria-label="Hint"
        >
          <svg v-if="!hintBusy" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.4.3.6.8.6 1.2h6c0-.4.2-.9.6-1.2A6 6 0 0 0 12 3z" /></svg>
          <svg v-else class="ekans__spin" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 3a9 9 0 0 1 9 9" /></svg>
        </button>

        <button class="ekans__icon-btn" @click="toggleMute" :aria-label="muted ? 'Sound on' : 'Sound off'">
          <svg v-if="!muted" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9v6h4l5 4V5L9 9H5z" /><path d="M17 9a4 4 0 0 1 0 6" /></svg>
          <svg v-else viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9v6h4l5 4V5L9 9H5z" /><path d="M17 10l4 4M21 10l-4 4" /></svg>
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

          <div v-for="(w, i) in view.walls" :key="`wall-${i}`" class="ekans__wall" :style="segStyle(w)" />

          <span
            v-for="sk in shocks" :key="sk.id"
            class="ekans__shock"
            :style="{ ...segStyle(sk), animationDelay: sk.delay + 'ms' }"
          />

          <div
            v-for="seg in segments"
            :key="seg.id"
            class="ekans__seg"
            :class="{
              'ekans__seg--head': seg.isHead,
              'ekans__seg--tail': seg.isTail,
              'is-bulge': seg.bulge,
              'is-chomp': seg.isHead && chomping,
              'is-caught': seg.isHead && isTrapped
            }"
            :style="segStyle(seg)"
          >
            <span v-if="seg.isHead" class="ekans__face" :class="`is-${headFacing}`" aria-hidden="true">
              <i></i><i></i>
            </span>
          </div>

          <Transition name="food">
            <div v-if="view.food" :key="`${view.food.r}-${view.food.c}`" class="ekans__food" :style="segStyle(view.food)">
              <span class="ekans__food-dot" />
            </div>
          </Transition>

          <div v-for="b in bursts" :key="b.id" class="ekans__burst" :style="segStyle(b)">
            <i v-for="n in 8" :key="n" :style="{ '--ang': `${n * 45}deg` }" />
          </div>

          <span
            v-for="w in waves" :key="w.id"
            class="ekans__wave" :class="{ 'is-bad': w.bad }"
            :style="{ left: w.x + '%', top: w.y + '%' }"
          ><i></i><i></i><i></i></span>

          <!-- The hint: where to tap next. The player still taps it. -->
          <div
            v-if="hintCell && phase === 'playing' && state.status === 'placing'"
            class="ekans__aim"
            :style="segStyle(hintCell)"
            aria-hidden="true"
          >
            <span class="ekans__aim-halo"></span>
            <span class="ekans__aim-ring"></span>
            <span class="ekans__aim-dot">{{ history.length + 1 }}</span>
          </div>

          <Transition name="stamp">
            <div v-if="trapFlash" class="ekans__stamp" aria-hidden="true">{{ stampText }}</div>
          </Transition>

          <Transition name="hint">
            <p v-if="showFirstHint" class="ekans__hint">TAP TO FEED</p>
          </Transition>
        </div>
      </div>

      <footer class="ekans__foot">
        <div v-if="guided" class="ekans__demobar">
          <span class="ekans__demotag">GUIDE</span>
          <span class="ekans__democount">{{ history.length + 1 }}</span>
        </div>
        <p v-else-if="hintFailed" class="ekans__demotag">NO HINT</p>
      </footer>
    </div>

    <Transition name="sheet">
      <div v-if="phase === 'menu'" class="ekans__menu">
        <button class="ekans__icon-btn ekans__mute-corner" @click="toggleMute" :aria-label="muted ? 'Sound on' : 'Sound off'">
          <svg v-if="!muted" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9v6h4l5 4V5L9 9H5z" /><path d="M17 9a4 4 0 0 1 0 6" /></svg>
          <svg v-else viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9v6h4l5 4V5L9 9H5z" /><path d="M17 10l4 4M21 10l-4 4" /></svg>
        </button>

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
              <span>{{ MODE_TAG[key as Mode] }}</span>
              <span class="ekans__mode-pips"><i v-for="p in 3" :key="p" :class="{ 'is-on': p <= DIFFICULTY[key as Mode] }" /></span>
            </button>
          </div>

          <button class="ekans__play" @click="startRun">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M7 4l13 8-13 8V4z" /></svg>
            PLAY
          </button>

          <div class="ekans__seedbar">
            <input
              v-model="seedInput" class="ekans__seedinput" aria-label="Seed"
              maxlength="8" autocapitalize="characters" autocomplete="off" spellcheck="false"
            />
            <button class="ekans__seed-shuffle" @click="sfx('select'); seedInput = randomSeedLabel()" aria-label="Shuffle seed">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="sheet">
      <div v-if="phase === 'result'" class="ekans__backdrop">
        <div class="ekans__sheet">
          <div class="ekans__result-icon" :class="{ 'is-win': playerWon }">
            <svg v-if="playerWon" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
            <svg v-else viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </div>
          <h2 class="ekans__sheet-title">{{ playerWon ? 'YOU WIN' : 'YOU LOSE' }}</h2>

          <div class="ekans__result-stats">
            <div class="ekans__result-stat"><b>{{ history.length }}</b><span>MOVES</span></div>
            <div class="ekans__result-stat"><b>{{ fillPercent }}%</b><span>FILLED</span></div>
            <div class="ekans__result-stat"><b>{{ modeTag }}</b><span>MODE</span></div>
          </div>

          <button v-if="!playerWon" class="ekans__play ekans__play--sheet" @click="startGuided">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.4.3.6.8.6 1.2h6c0-.4.2-.9.6-1.2A6 6 0 0 0 12 3z" /></svg>
            SHOW ME
          </button>

          <button class="ekans__play ekans__play--sheet" :class="{ 'ekans__play--ghost': !playerWon }" @click="newSeed">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M7 4l13 8-13 8V4z" /></svg>
            NEXT
          </button>

          <div class="ekans__result-row">
            <button class="ekans__chip-btn" @click="retrySeed" aria-label="Retry">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></svg>
              RETRY
            </button>
            <button class="ekans__chip-btn" @click="backToMenu" aria-label="Home">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7M6 10v9h12v-9" /></svg>
              HOME
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

.ekans__hud {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: calc(env(safe-area-inset-top, 0px) + 14px) 16px 10px;
}
.ekans__icon-btn {
  display: grid; place-items: center; width: 34px; height: 34px; border-radius: 999px;
  background: var(--panel); border: 1px solid var(--edge); color: var(--ink); flex-shrink: 0;
  transition: transform 120ms ease, background 120ms ease;
}
.ekans__icon-btn:active { transform: scale(.9); background: var(--accent-soft); }
.ekans__icon-btn--solid { background: var(--accent); border-color: var(--ink); }
.ekans__icon-btn.is-armed { background: var(--accent); border-color: var(--ink); }
.ekans__icon-btn:disabled { opacity: .4; }
.ekans__hud-chip {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 12px 7px 8px; border-radius: 999px;
  background: var(--panel); border: 1px solid var(--edge);
}
.ekans__hud-chip.is-demo { border-color: var(--accent-strong); background: var(--accent-soft); }
.ekans__hud-mode {
  display: grid; place-items: center; width: 19px; height: 19px; border-radius: 6px;
  background: var(--accent); font: 800 10px/1 var(--font-mono); color: var(--ink);
}
.ekans__hud-diamond { width: 7px; height: 7px; background: var(--accent-strong); transform: rotate(45deg); border-radius: 1px; }
.ekans__hud-count { font: 700 13px/1 var(--font-mono); }

.ekans__stage { flex: 1; display: grid; place-items: center; padding: 6px 16px; min-height: 0; }
.ekans__board {
  position: relative; width: 100%; max-width: 480px;
  aspect-ratio: 9 / 15; max-height: 100%;
  border-radius: 16px; overflow: hidden;
  background: var(--panel); border: 1px solid var(--edge);
  box-shadow: 0 2px 0 rgba(22, 22, 24, .06), 0 14px 30px -18px rgba(22, 22, 24, .4);
  transition: box-shadow 200ms ease;
}
.is-trapflash .ekans__board { box-shadow: 0 0 0 3px var(--accent-strong), 0 14px 30px -18px rgba(22, 22, 24, .4); }
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
    135deg, rgba(22, 22, 24, .10) 0px, rgba(22, 22, 24, .10) 2px, transparent 2px, transparent 6px);
}

/* Ripple across the tiles. Peak opacity is deliberately tiny — the board
   should seem to breathe, not blink. */
.ekans__shock { position: absolute; top: 0; left: 0; pointer-events: none; }
.ekans__shock::after {
  content: ''; position: absolute; inset: 1.5px; border-radius: 4px;
  background: var(--accent-strong);
  opacity: 0;
  animation: ekans-shock 760ms cubic-bezier(.33, .7, .4, 1) both;
}
@keyframes ekans-shock {
  0%   { opacity: 0; transform: scale(.9); }
  30%  { opacity: .13; transform: scale(1); }
  100% { opacity: 0; transform: scale(.95); }
}

/* Concentric wave rings from the touch point. */
.ekans__wave { position: absolute; pointer-events: none; }
.ekans__wave i {
  position: absolute; border-radius: 50%; border: 1.5px solid var(--accent-strong);
  width: 34px; height: 34px; margin: -17px 0 0 -17px; opacity: 0;
  animation: ekans-wave 1100ms cubic-bezier(.2, .7, .3, 1) both;
}
.ekans__wave i:nth-child(2) { animation-delay: 150ms; }
.ekans__wave i:nth-child(3) { animation-delay: 300ms; }
.ekans__wave.is-bad i { border-color: var(--ink); }
@keyframes ekans-wave {
  0%   { opacity: .34; transform: scale(.35); }
  100% { opacity: 0; transform: scale(2.4); }
}

/* The snake: rounded, chunky, a face on the head. */
.ekans__seg {
  position: absolute; top: 0; left: 0;
  transition: transform 140ms cubic-bezier(.3, .7, .4, 1);
}
.ekans__seg::after {
  content: ''; position: absolute; inset: 1.5px; border-radius: 5px;
  background: var(--ink);
  transition: transform 130ms cubic-bezier(.3, 1.5, .5, 1);
}
.ekans__seg--tail::after { inset: 3px; border-radius: 999px; opacity: .82; }
.ekans__seg--head::after {
  inset: 0.5px; border-radius: 8px; box-shadow: 0 0 0 2px var(--accent);
}
/* Swallow: the bite travels down the body. */
.ekans__seg.is-bulge::after { transform: scale(1.22); border-radius: 40%; }
/* Chomp: the head bites down on contact. */
.ekans__seg.is-chomp::after { animation: ekans-chomp 260ms cubic-bezier(.2, .9, .3, 1); }
@keyframes ekans-chomp {
  0%   { transform: scale(1); }
  28%  { transform: scale(1.34, .74); }
  60%  { transform: scale(.9, 1.18); }
  100% { transform: scale(1); }
}
/* Caught: the head pulses where it ran out of room. */
.ekans__seg.is-caught::after { animation: ekans-caught 700ms ease-in-out 3; }
@keyframes ekans-caught {
  0%, 100% { box-shadow: 0 0 0 2px var(--accent); }
  50%      { box-shadow: 0 0 0 5px var(--accent-strong); }
}

.ekans__face { position: absolute; inset: 0; display: grid; place-items: center; z-index: 1; }
.ekans__face i {
  position: absolute; width: 17%; height: 17%; border-radius: 50%; background: var(--panel);
  animation: ekans-blink 4.2s ease-in-out infinite;
}
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
@keyframes ekans-blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(.15); } }

.ekans__food { position: absolute; top: 0; left: 0; display: grid; place-items: center; pointer-events: none; }
.ekans__food-dot {
  width: 46%; height: 46%; border-radius: 50%;
  background: var(--accent); border: 2px solid var(--ink); box-sizing: border-box;
  animation: ekans-pulse 1.1s ease-in-out infinite;
}
@keyframes ekans-pulse { 0%, 100% { transform: scale(.86); } 50% { transform: scale(1.06); } }
.food-enter-active { transition: transform 200ms cubic-bezier(.2, 1.6, .4, 1), opacity 160ms; }
.food-enter-from { transform: scale(.2); opacity: 0; }
.food-leave-active { transition: opacity 90ms; }
.food-leave-to { opacity: 0; }

/* Crumbs from the bite. */
.ekans__burst { position: absolute; top: 0; left: 0; display: grid; place-items: center; pointer-events: none; }
.ekans__burst i {
  position: absolute; width: 5px; height: 5px; background: var(--accent-strong); border-radius: 1.5px;
  animation: ekans-burst 520ms cubic-bezier(.15, .75, .3, 1) forwards;
}
@keyframes ekans-burst {
  0%   { transform: rotate(var(--ang)) translateY(0) scale(1) ; opacity: 1; }
  100% { transform: rotate(var(--ang)) translateY(-22px) scale(.15) rotate(140deg); opacity: 0; }
}

/* Answer-key reticle: a target that pulses on the cell, then snaps shut as
   the simulated tap lands. */
.ekans__aim { position: absolute; top: 0; left: 0; display: grid; place-items: center; pointer-events: none; z-index: 3; }
.ekans__aim-halo,
.ekans__aim-ring,
.ekans__aim-dot { position: absolute; border-radius: 50%; }
.ekans__aim-halo {
  width: 190%; height: 190%;
  background: radial-gradient(circle, rgba(234, 185, 0, .30) 0%, transparent 68%);
  animation: ekans-aim-halo 1.15s ease-in-out infinite;
}
.ekans__aim-ring {
  width: 128%; height: 128%; box-sizing: border-box;
  border: 2.5px dashed var(--accent-strong);
  animation: ekans-aim-ring 1.15s ease-in-out infinite;
}
/* The step number lives inside the marker: a badge hung off the corner gets
   clipped by the board on edge cells, and edges are exactly where traps
   get built. */
.ekans__aim-dot {
  display: grid; place-items: center;
  width: 62%; height: 62%; background: var(--ink); color: var(--accent);
  font: 800 11px/1 var(--font-mono);
  box-shadow: 0 0 0 2.5px var(--accent-strong);
  animation: ekans-aim-dot 1.15s ease-in-out infinite;
}
@keyframes ekans-aim-halo { 0%, 100% { opacity: .5; transform: scale(.82); } 50% { opacity: 1; transform: scale(1.04); } }
@keyframes ekans-aim-ring { 0%, 100% { transform: scale(1) rotate(0deg); opacity: .8; } 50% { transform: scale(.84) rotate(45deg); opacity: 1; } }
@keyframes ekans-aim-dot { 0%, 100% { transform: scale(.9); } 50% { transform: scale(1.06); } }

.ekans__stamp {
  position: absolute; inset: auto 0 auto 0; top: 50%; margin-top: -22px;
  text-align: center; font: 800 30px/1 inherit; letter-spacing: .06em;
  color: var(--ink); text-shadow: 0 2px 0 var(--accent), 0 0 22px rgba(255, 212, 59, .9);
  pointer-events: none;
}
.stamp-enter-active { animation: ekans-stamp 420ms cubic-bezier(.2, 1.5, .35, 1); }
.stamp-leave-active { transition: opacity 300ms ease; }
.stamp-leave-to { opacity: 0; }
@keyframes ekans-stamp {
  0%   { transform: scale(2.4) rotate(-9deg); opacity: 0; }
  60%  { transform: scale(.94) rotate(2deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

.ekans__hint {
  position: absolute; inset: auto 0 14px 0; margin: 0; text-align: center;
  font: 700 11px/1 var(--font-mono); letter-spacing: .18em; color: var(--ink-soft);
  animation: ekans-hintpulse 1.6s ease-in-out infinite; pointer-events: none;
}
@keyframes ekans-hintpulse { 0%, 100% { opacity: .45; } 50% { opacity: 1; } }
.hint-leave-active { transition: opacity 200ms ease; }
.hint-leave-to { opacity: 0; }

.is-shaking .ekans__board { animation: ekans-shake 220ms ease-in-out; }
@keyframes ekans-shake {
  0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); }
}

.ekans__foot {
  min-height: 58px; display: grid; place-items: center;
  padding: 8px 16px calc(env(safe-area-inset-bottom, 0px) + 14px);
}
.ekans__demobar {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 6px 6px 14px; border-radius: 999px;
  background: var(--panel); border: 1px solid var(--edge);
}
.ekans__demotag { font: 800 10px/1 var(--font-mono); letter-spacing: .16em; color: var(--ink-soft); }
.ekans__democount { font: 800 13px/1 var(--font-mono); }

/* Menu */
.ekans__menu {
  position: absolute; inset: 0; z-index: 5;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  background: radial-gradient(120% 60% at 50% 8%, var(--accent-soft) 0%, transparent 62%), var(--bg);
  padding: calc(env(safe-area-inset-top, 0px) + 24px) 24px calc(env(safe-area-inset-bottom, 0px) + 28px);
}
.ekans__mute-corner { position: absolute; top: calc(env(safe-area-inset-top, 0px) + 16px); right: 18px; }
.ekans__mark { position: relative; width: clamp(96px, 28vw, 132px); aspect-ratio: 1; margin-bottom: 14px; }
.ekans__mark-glow {
  position: absolute; inset: -34%; border-radius: 50%;
  background: radial-gradient(circle, var(--accent) 0%, transparent 68%); opacity: .55;
}
.ekans__mark-seg { position: absolute; top: 0; left: 0; width: 25%; height: 25%; }
.ekans__mark-seg::after {
  content: ''; position: absolute; inset: 6%; border-radius: 26%; background: var(--ink);
  animation: ekans-mark-glow 2.6s ease-in-out calc(var(--i) * 110ms) infinite;
}
.ekans__mark-seg--head::after { box-shadow: 0 0 0 2px var(--accent-strong); }
@keyframes ekans-mark-glow { 0%, 100% { opacity: .58; } 30% { opacity: 1; } }

.ekans__wordmark { margin: 0 0 26px; font: 800 clamp(46px, 13vw, 68px)/.9 inherit; letter-spacing: -.02em; }
.ekans__menu-controls { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 340px; }

.ekans__modes { display: flex; gap: 6px; padding: 4px; border-radius: 999px; background: var(--panel); border: 1px solid var(--edge); }
.ekans__mode-pill {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px;
  padding: 9px 6px; border-radius: 999px; color: var(--ink-soft);
  font: 800 11.5px/1 inherit; letter-spacing: .06em;
  transition: background 140ms ease, color 140ms ease, transform 100ms ease;
}
.ekans__mode-pill:active { transform: scale(.96); }
.ekans__mode-pill.is-active { background: var(--accent); color: var(--ink); }
.ekans__mode-pips { display: flex; gap: 3px; }
.ekans__mode-pips i { width: 4px; height: 4px; border-radius: 50%; background: currentColor; opacity: .32; }
.ekans__mode-pips i.is-on { opacity: 1; }

.ekans__play {
  display: flex; align-items: center; justify-content: center; gap: 9px;
  padding: 16px; border-radius: 999px; background: var(--accent); color: var(--ink);
  border: 1px solid var(--ink); font: 800 14px/1 inherit; letter-spacing: .1em;
  box-shadow: 0 3px 0 var(--ink);
  transition: transform 100ms ease, box-shadow 100ms ease;
}
.ekans__play:active { transform: translateY(3px); box-shadow: 0 0 0 var(--ink); }
.ekans__play:disabled { opacity: .7; }
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

/* Result sheet */
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
.ekans__note { margin: 0; font: 800 10px/1 var(--font-mono); letter-spacing: .16em; color: var(--ink-soft); }
.ekans__result-row { display: flex; gap: 8px; width: 100%; }
.ekans__chip-btn {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px;
  padding: 10px 6px; border-radius: 14px; border: 1px solid var(--edge);
  background: var(--panel); color: var(--ink);
  font: 800 9.5px/1 var(--font-mono); letter-spacing: .1em;
  transition: transform 100ms ease, background 100ms ease;
}
.ekans__chip-btn:active { transform: scale(.95); background: var(--accent-soft); }

.sheet-enter-active, .sheet-leave-active { transition: opacity 200ms ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-leave-active { pointer-events: none; }
.ekans__backdrop.sheet-enter-active .ekans__sheet { transition: transform 220ms cubic-bezier(.2, .9, .3, 1); }
.ekans__backdrop.sheet-enter-from .ekans__sheet { transform: translateY(24px); }

@media (prefers-reduced-motion: reduce) {
  .ekans__seg, .ekans__seg::after, .ekans__food-dot, .ekans__wave i, .ekans__burst i,
  .ekans__mark-seg::after, .ekans__shock::after, .ekans__face i, .ekans__hint,
  .ekans__stamp, .is-shaking .ekans__board,
  .ekans__aim-halo, .ekans__aim-ring, .ekans__aim-dot {
    animation: none !important; transition: none !important;
  }
}
</style>
