<script setup lang="ts">
import {
  type Cell, type Mode, type Dir, type SnakeState,
  MODES, BOARD_COLS, BOARD_ROWS,
  createRun, tick, setDirection, armGhost, currentTickMs
} from '~/utils/ekans/engine'
import { CAMPAIGN, LEVELS_PER_TIER, levelDef, type CampaignLevel } from '~/utils/ekans/levels'
import { arcade } from '~/utils/ekans/audio'

/**
 * EKANS is a self-contained, full-screen mobile app, not a publication page —
 * see the `bare` route list in app.vue. It pins its own light, yellow theme
 * regardless of the site's light/dark setting: a game cabinet in the
 * publication's accent colour, not a themed section of the editorial shell.
 *
 * It's a real Snake: swipe, tap the pad, or use arrow keys to steer, eat to
 * grow, don't hit a wall or your own tail. Screens carry labels, not prose —
 * the chrome stays at the level an arcade cabinet uses: a word, a number, an
 * icon.
 */
definePageMeta({ layout: false })
useSeoMeta({
  title: 'EKANS · Entertrainer',
  description: 'A real Snake: steer with a swipe, arrow keys, or the on-screen pad. Eat to grow, don’t hit the walls or your own tail.',
  ogTitle: 'EKANS — steer, eat, don’t crash',
  ogDescription: 'Classic Snake with a campaign of 39 obstacle courses, a free-run endless mode, and two powerups that never touch the board itself.',
  ogUrl: 'https://entertrainer.in/games/ekans',
  robots: 'index, follow'
})

type Phase = 'menu' | 'campaign' | 'rules' | 'playing' | 'result'

const DIFFICULTY: Record<Mode, number> = { learn: 1, standard: 2, expert: 3 }
const MODE_TAG: Record<Mode, string> = { learn: 'EASY', standard: 'NORMAL', expert: 'HARD' }
const ICON_COIL = [
  { r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 },
  { r: 1, c: 3 }, { r: 2, c: 3 }, { r: 2, c: 2 }, { r: 2, c: 1 }, { r: 3, c: 1 }
]

/** How many charges of each powerup a run starts with — tighter on harder tiers. */
const POWERUP_CHARGES: Record<Mode, { slowmo: number; ghost: number }> = {
  learn: { slowmo: 3, ghost: 2 },
  standard: { slowmo: 2, ghost: 1 },
  expert: { slowmo: 1, ghost: 1 }
}
const SLOWMO_DURATION_MS = 3500
const SLOWMO_FACTOR = 1.7

const phase = ref<Phase>('menu')
const mode = ref<Mode>('standard')
const muted = ref(false)
const theme = ref<'yellow' | 'pink'>('yellow')

// Campaign: which tier the level-select sheet is showing, and which level
// (if any) the current run belongs to. `null` means a freeplay run — endless,
// no target, ended only by a crash.
const campaignTier = ref<Mode>('learn')
const activeLevel = ref<{ tier: Mode; index: number } | null>(null)
const activeLevelInfo = computed<CampaignLevel | null>(() => activeLevel.value ? CAMPAIGN[activeLevel.value.tier].levels[activeLevel.value.index] : null)
const hasNextLevel = computed(() => !!activeLevel.value && activeLevel.value.index + 1 < LEVELS_PER_TIER)

function defaultProgress(): Record<Mode, boolean[]> {
  return { learn: Array(LEVELS_PER_TIER).fill(false), standard: Array(LEVELS_PER_TIER).fill(false), expert: Array(LEVELS_PER_TIER).fill(false) }
}
const progress = ref<Record<Mode, boolean[]>>(defaultProgress())
function isUnlocked(tier: Mode, index: number): boolean { return index === 0 || !!progress.value[tier][index - 1] }
function loadProgress() {
  try {
    const raw = window.localStorage.getItem('ekans-progress')
    if (!raw) return
    const parsed = JSON.parse(raw)
    const next = defaultProgress()
    for (const tier of ['learn', 'standard', 'expert'] as Mode[]) {
      if (Array.isArray(parsed?.[tier])) for (let i = 0; i < LEVELS_PER_TIER; i++) next[tier][i] = !!parsed[tier][i]
    }
    progress.value = next
  } catch { /* private mode or corrupt data */ }
}
function saveProgress() {
  try { window.localStorage.setItem('ekans-progress', JSON.stringify(progress.value)) } catch { /* private mode */ }
}

function defaultHighScores(): Record<Mode, number> { return { learn: 0, standard: 0, expert: 0 } }
const highScores = ref<Record<Mode, number>>(defaultHighScores())
function loadHighScores() {
  try {
    const raw = window.localStorage.getItem('ekans-highscores')
    if (!raw) return
    const parsed = JSON.parse(raw)
    const next = defaultHighScores()
    for (const tier of ['learn', 'standard', 'expert'] as Mode[]) if (Number.isFinite(parsed?.[tier])) next[tier] = parsed[tier]
    highScores.value = next
  } catch { /* private mode or corrupt data */ }
}
function saveHighScores() {
  try { window.localStorage.setItem('ekans-highscores', JSON.stringify(highScores.value)) } catch { /* private mode */ }
}

function loadTheme() {
  try { if (window.localStorage.getItem('ekans-theme') === 'pink') theme.value = 'pink' } catch { /* private mode */ }
}
function toggleTheme() {
  theme.value = theme.value === 'pink' ? 'yellow' : 'pink'
  arcade.setTheme(theme.value)
  sfx('select'); haptic(8)
  try { window.localStorage.setItem('ekans-theme', theme.value) } catch { /* private mode */ }
}

// Powerups. Neither one touches the walls, the target, or the food's
// position — SLOW-MO widens the tick interval for a few seconds, GHOST
// forgives exactly one crash — so a level's obstacle course is never
// actually shortcut, only survived more easily.
const slowmoCharges = ref(0)
const ghostCharges = ref(0)
const slowmoActive = ref(false)
const ghostFlash = ref(false)
let slowmoTimer: ReturnType<typeof window.setTimeout> | null = null

// A plain ref (not shallowRef) so Vue proxies it with reactive() — the engine
// mutates body/status/food in place (unshift/pop/assign), and that proxy is
// what makes those in-place mutations show up in the template automatically.
const state = ref<SnakeState>(createRun('standard')) // placeholder until first real run; overwritten by beginRun

// Shared animation state — only one run animates at a time.
const bodyIds = ref<number[]>([])
let nextId = 1
const bulgeAt = ref<number | null>(null)
const chomping = ref(false)
const shaking = ref(false)
const clearFlash = ref(false)
interface Crumb { dx: number; dy: number; rot: number; delay: number }
const bursts = ref<{ id: number; r: number; c: number; crumbs: Crumb[] }[]>([])
const impacts = ref<{ id: number; r: number; c: number }[]>([])
let fxId = 0

let tickTimer: ReturnType<typeof window.setTimeout> | null = null
let bulgeTimer: ReturnType<typeof window.setInterval> | null = null

const view = computed(() => state.value)

const modeTag = computed(() => MODE_TAG[view.value.mode])
const modeInitial = computed(() => MODE_TAG[view.value.mode][0])
const cleared = computed(() => state.value.status === 'cleared')
const isDead = computed(() => state.value.status === 'dead')
const beatHighScore = computed(() => isDead.value && !activeLevel.value && state.value.eaten > 0 && state.value.eaten >= (highScores.value[mode.value] ?? 0))

function haptic(p: number | number[]) { try { navigator.vibrate?.(p) } catch { /* unsupported */ } }
function sfx(name: 'tap' | 'select' | 'crunch' | 'start' | 'clear' | 'crash' | 'slowmo' | 'ghost' | 'ghostSave' | 'levelUnlock' | 'highScore') {
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
  if (slowmoTimer) { window.clearTimeout(slowmoTimer); slowmoTimer = null }
  bulgeAt.value = null
  slowmoActive.value = false
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

/**
 * Crumbs from the bite. Randomised drift and fall rather than eight crumbs
 * radiating out on a perfect 45° wheel — an even spread reads as a light
 * show, not the aftermath of biting down on something with actual force.
 */
function burstAt(cell: Cell) {
  const id = fxId++
  const crumbs: Crumb[] = Array.from({ length: 9 }, () => ({
    dx: (Math.random() - 0.5) * 34,
    dy: 16 + Math.random() * 22,
    rot: (Math.random() - 0.5) * 360,
    delay: Math.random() * 40
  }))
  bursts.value.push({ id, ...cell, crumbs })
  window.setTimeout(() => { bursts.value = bursts.value.filter((b) => b.id !== id) }, 620)
}

/** A brief impact flash at the bite point — the "force" half of the crunch. */
function impactAt(cell: Cell) {
  const id = fxId++
  impacts.value.push({ id, ...cell })
  window.setTimeout(() => { impacts.value = impacts.value.filter((i) => i.id !== id) }, 260)
}

function flashClear() {
  clearFlash.value = true
  window.setTimeout(() => { clearFlash.value = false }, 1500)
}

function flashGhostSave() {
  ghostFlash.value = true
  window.setTimeout(() => { ghostFlash.value = false }, 500)
}

// --- live run ----------------------------------------------------------------

/**
 * The one place a run actually starts, freeplay or campaign. `level` is null
 * for an endless freeplay run; set for a campaign level, which is what lets
 * the result sheet offer "next level" and persist completion.
 */
function beginRun(tier: Mode, level: { tier: Mode; index: number } | null) {
  sfx('start'); haptic(12)
  clearTimers()
  mode.value = tier
  activeLevel.value = level
  const def = level ? levelDef(level.tier, level.index) : undefined
  const s = createRun(tier, def)
  state.value = s
  resetIds(s.body)
  const charges = POWERUP_CHARGES[tier]
  slowmoCharges.value = charges.slowmo
  ghostCharges.value = charges.ghost
  phase.value = 'playing'
  scheduleTick()
}

function startRun() { beginRun(mode.value, null) }
function retryRun() { if (activeLevel.value) beginRun(activeLevel.value.tier, activeLevel.value); else beginRun(mode.value, null) }

/** Leave a run for wherever it came from: the level map for a campaign run, the main menu for freeplay. */
function exitRun() {
  sfx('tap'); haptic(10)
  clearTimers()
  const wasLevel = activeLevel.value
  activeLevel.value = null
  if (wasLevel) { campaignTier.value = wasLevel.tier; phase.value = 'campaign' }
  else phase.value = 'menu'
}
function backToMenu() { sfx('tap'); haptic(10); phase.value = 'menu' }
function pickMode(key: Mode) { sfx('select'); haptic(8); mode.value = key }

// --- campaign -----------------------------------------------------------

function openCampaign() { sfx('tap'); haptic(8); campaignTier.value = mode.value; phase.value = 'campaign' }
function openRules() { sfx('tap'); haptic(8); phase.value = 'rules' }
function pickTier(key: Mode) { sfx('select'); haptic(8); campaignTier.value = key }

function startLevel(tier: Mode, index: number) {
  if (!isUnlocked(tier, index)) return
  beginRun(tier, { tier, index })
}

function markComplete(tier: Mode, index: number) {
  if (progress.value[tier][index]) return
  progress.value[tier][index] = true
  saveProgress()
  sfx('levelUnlock')
}

/** From a cleared campaign level: mark it done, then move to the next one or back to the map. */
function nextLevel() {
  if (!activeLevel.value) return
  const { tier, index } = activeLevel.value
  markComplete(tier, index)
  const next = index + 1
  if (next < LEVELS_PER_TIER) startLevel(tier, next)
  else { campaignTier.value = tier; phase.value = 'campaign' }
}

// --- the loop ------------------------------------------------------------

function scheduleTick() {
  if (tickTimer) { window.clearTimeout(tickTimer); tickTimer = null }
  const s = state.value
  if (s.status !== 'playing') return
  const base = currentTickMs(s)
  const interval = slowmoActive.value ? base * SLOWMO_FACTOR : base
  tickTimer = window.setTimeout(runTick, interval)
}

function runTick() {
  const s = state.value
  if (s.status !== 'playing') return
  const result = tick(s)
  pushHeadId(s.body.length)

  if (result === 'ate' || result === 'ghosted') {
    const headCell = s.body[0]
    impactAt(headCell); burstAt(headCell)
    chomp(); swallow(s.body.length); sfx('crunch'); haptic(16)
  }
  if (result === 'ghosted') {
    flashGhostSave(); sfx('ghostSave'); haptic([0, 20, 40, 20])
  }

  if (result === 'dead') {
    sfx('crash'); haptic([0, 45, 70, 45, 70, 120])
    shaking.value = true
    window.setTimeout(() => { shaking.value = false }, 260)
    if (!activeLevel.value && s.eaten > (highScores.value[s.mode] ?? 0)) {
      highScores.value[s.mode] = s.eaten
      saveHighScores()
    }
    finishRun()
    return
  }
  if (result === 'cleared') {
    if (activeLevel.value) markComplete(activeLevel.value.tier, activeLevel.value.index)
    sfx('clear'); flashClear(); haptic([0, 40, 60, 40, 60, 100])
    finishRun()
    return
  }
  scheduleTick()
}

function finishRun() {
  clearTimers()
  window.setTimeout(() => { phase.value = 'result' }, 1100)
}

// --- input -----------------------------------------------------------------

function turn(dir: Dir) {
  if (phase.value !== 'playing') return
  setDirection(state.value, dir)
}

const KEY_DIR: Record<string, Dir> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right'
}
function onKeydown(e: KeyboardEvent) {
  const dir = KEY_DIR[e.key]
  if (!dir) return
  if (phase.value !== 'playing') return
  e.preventDefault()
  turn(dir)
}

let touchStart: { x: number; y: number } | null = null
function onTouchStart(e: TouchEvent) {
  const t = e.touches[0]
  if (t) touchStart = { x: t.clientX, y: t.clientY }
}
function onTouchEnd(e: TouchEvent) {
  if (!touchStart) return
  const t = e.changedTouches[0]
  const dx = t.clientX - touchStart.x, dy = t.clientY - touchStart.y
  touchStart = null
  if (Math.hypot(dx, dy) < 18) return // too small to be a deliberate swipe
  if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 'right' : 'left')
  else turn(dy > 0 ? 'down' : 'up')
}

function onVisibilityChange() {
  if (document.hidden) {
    if (tickTimer) { window.clearTimeout(tickTimer); tickTimer = null }
  } else if (phase.value === 'playing' && state.value.status === 'playing' && !tickTimer) {
    scheduleTick()
  }
}

// --- powerups -------------------------------------------------------------

function useSlowmo() {
  if (slowmoCharges.value <= 0 || phase.value !== 'playing' || state.value.status !== 'playing') return
  sfx('slowmo'); haptic(10)
  slowmoCharges.value--
  slowmoActive.value = true
  if (slowmoTimer) window.clearTimeout(slowmoTimer)
  slowmoTimer = window.setTimeout(() => { slowmoActive.value = false }, SLOWMO_DURATION_MS)
}

function useGhost() {
  if (ghostCharges.value <= 0 || phase.value !== 'playing' || state.value.status !== 'playing') return
  sfx('ghost'); haptic(10)
  ghostCharges.value--
  armGhost(state.value)
}

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

const isDeadHead = computed(() => view.value.status === 'dead')

const stampText = computed(() => 'CLEARED!')

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
  loadTheme()
  arcade.setTheme(theme.value)
  loadProgress()
  loadHighScores()
  prevOverflow = document.body.style.overflow
  prevOverscroll = document.documentElement.style.overscrollBehavior
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overscrollBehavior = 'none'
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('visibilitychange', onVisibilityChange)
  if (import.meta.dev) {
    (window as any).__ekansDebug = {
      state, phase, campaignTier, activeLevel, progress, highScores,
      slowmoCharges, ghostCharges, slowmoActive
    }
  }
})
onUnmounted(() => {
  clearTimers()
  arcade.dispose()
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  document.body.style.overflow = prevOverflow
  document.documentElement.style.overscrollBehavior = prevOverscroll
})
</script>

<template>
  <div class="ekans" :class="{ 'is-shaking': shaking, 'is-clearflash': clearFlash, 'is-pink': theme === 'pink' }">
    <div class="ekans__scene" v-if="phase === 'playing' || phase === 'result'">
      <header class="ekans__hud">
        <button class="ekans__icon-btn" @click="exitRun" aria-label="Back">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>

        <div class="ekans__hud-chip">
          <span class="ekans__hud-mode">{{ modeInitial }}</span>
          <i class="ekans__hud-diamond" aria-hidden="true"></i>
          <span class="ekans__hud-count">{{ view.eaten }}<template v-if="activeLevelInfo">/{{ activeLevelInfo.target }}</template></span>
        </div>

        <button class="ekans__icon-btn" @click="toggleMute" :aria-label="muted ? 'Sound on' : 'Sound off'">
          <svg v-if="!muted" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9v6h4l5 4V5L9 9H5z" /><path d="M17 9a4 4 0 0 1 0 6" /></svg>
          <svg v-else viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9v6h4l5 4V5L9 9H5z" /><path d="M17 10l4 4M21 10l-4 4" /></svg>
        </button>
      </header>

      <div v-if="activeLevelInfo" class="ekans__level-strip">{{ activeLevelInfo.name }} <span>· TARGET {{ activeLevelInfo.target }}</span></div>
      <div v-else class="ekans__level-strip">BEST <span>{{ highScores[mode] || 0 }}</span></div>

      <div class="ekans__stage">
        <div
          class="ekans__board"
          role="img"
          aria-label="EKANS board"
          @touchstart.passive="onTouchStart"
          @touchend="onTouchEnd"
        >
          <div class="ekans__gridlines" aria-hidden="true"></div>

          <div v-for="(w, i) in view.walls" :key="`wall-${i}`" class="ekans__wall" :style="segStyle(w)" />

          <div
            v-for="seg in segments"
            :key="seg.id"
            class="ekans__seg"
            :class="{
              'ekans__seg--head': seg.isHead,
              'ekans__seg--tail': seg.isTail,
              'is-bulge': seg.bulge,
              'is-chomp': seg.isHead && chomping,
              'is-caught': seg.isHead && isDeadHead
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

          <div v-for="im in impacts" :key="im.id" class="ekans__impact" :style="segStyle(im)" />

          <div v-for="b in bursts" :key="b.id" class="ekans__burst" :style="segStyle(b)">
            <i
              v-for="(cr, n) in b.crumbs" :key="n"
              :style="{ '--dx': cr.dx + 'px', '--dy': cr.dy + 'px', '--rot': cr.rot + 'deg', animationDelay: cr.delay + 'ms' }"
            />
          </div>

          <Transition name="stamp">
            <div v-if="clearFlash" class="ekans__stamp" aria-hidden="true">{{ stampText }}</div>
          </Transition>

          <div v-if="ghostFlash" class="ekans__ghost-flash" aria-hidden="true"></div>
        </div>
      </div>

      <footer class="ekans__foot">
        <div class="ekans__controls">
          <div class="ekans__dpad" aria-label="Directional controls">
            <button class="ekans__dpad-btn ekans__dpad-btn--up" @click="turn('up')" aria-label="Up">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
            </button>
            <button class="ekans__dpad-btn ekans__dpad-btn--left" @click="turn('left')" aria-label="Left">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
            </button>
            <button class="ekans__dpad-btn ekans__dpad-btn--right" @click="turn('right')" aria-label="Right">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
            <button class="ekans__dpad-btn ekans__dpad-btn--down" @click="turn('down')" aria-label="Down">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M18 13l-6 6-6-6" /></svg>
            </button>
          </div>

          <div class="ekans__powerbar ekans__powerbar--stack">
            <button class="ekans__power-btn" :class="{ 'is-active': slowmoActive }" :disabled="slowmoCharges <= 0 || state.status !== 'playing'" @click="useSlowmo">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>
              SLOW-MO <span class="ekans__power-count">{{ slowmoCharges }}</span>
            </button>
            <button class="ekans__power-btn" :disabled="ghostCharges <= 0 || state.status !== 'playing'" @click="useGhost">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20V10a6 6 0 0 1 12 0v10l-3-2-3 2-3-2-3 2Z" /></svg>
              GHOST <span class="ekans__power-count">{{ ghostCharges }}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>

    <Transition name="sheet">
      <div v-if="phase === 'menu'" class="ekans__menu">
        <button class="ekans__icon-btn ekans__rules-corner" @click="openRules" aria-label="How to play">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.7-2.5 2-2.5 4" /><path d="M12 17h.01" /><circle cx="12" cy="12" r="9" /></svg>
        </button>
        <button class="ekans__icon-btn ekans__theme-corner" @click="toggleTheme" :aria-label="theme === 'pink' ? 'Switch to yellow theme' : 'Switch to pink theme'">
          <span class="ekans__theme-dot"></span>
        </button>
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
          <button class="ekans__play" @click="openCampaign">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
            CAMPAIGN
          </button>

          <div class="ekans__freeplay">
            <p class="ekans__freeplay-label">FREEPLAY · ENDLESS</p>
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

            <p class="ekans__best">BEST <b>{{ highScores[mode] || 0 }}</b></p>

            <button class="ekans__play ekans__play--ghost" @click="startRun">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M7 4l13 8-13 8V4z" /></svg>
              PLAY
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="sheet">
      <div v-if="phase === 'campaign'" class="ekans__campaign">
        <header class="ekans__campaign-head">
          <button class="ekans__icon-btn" @click="backToMenu" aria-label="Back">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <h2>{{ CAMPAIGN[campaignTier].world }}</h2>
          <span aria-hidden="true" style="width: 34px"></span>
        </header>
        <p class="ekans__campaign-tagline">{{ CAMPAIGN[campaignTier].tagline }}</p>

        <div class="ekans__tier-tabs" role="tablist">
          <button
            v-for="(info, key) in MODES" :key="key"
            class="ekans__mode-pill" :class="{ 'is-active': campaignTier === key }"
            role="tab" :aria-selected="campaignTier === key"
            @click="pickTier(key as Mode)"
          >
            <span>{{ MODE_TAG[key as Mode] }}</span>
            <span class="ekans__mode-pips"><i v-for="p in 3" :key="p" :class="{ 'is-on': p <= DIFFICULTY[key as Mode] }" /></span>
          </button>
        </div>

        <div class="ekans__level-grid">
          <button
            v-for="(lvl, i) in CAMPAIGN[campaignTier].levels" :key="i"
            class="ekans__level-tile"
            :class="{ 'is-done': progress[campaignTier][i] }"
            :disabled="!isUnlocked(campaignTier, i)"
            @click="startLevel(campaignTier, i)"
          >
            <span class="ekans__level-star" v-if="progress[campaignTier][i]" aria-hidden="true">★</span>
            <span class="ekans__level-num">{{ i + 1 }}</span>
            <svg v-if="!isUnlocked(campaignTier, i)" class="ekans__level-lock" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
            <span v-else class="ekans__level-name">{{ lvl.name }}</span>
          </button>
        </div>
      </div>
    </Transition>

    <Transition name="sheet">
      <div v-if="phase === 'rules'" class="ekans__campaign ekans__rules">
        <header class="ekans__campaign-head">
          <button class="ekans__icon-btn" @click="backToMenu" aria-label="Back">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <h2>How It Works</h2>
          <span aria-hidden="true" style="width: 34px"></span>
        </header>

        <section class="ekans__rule">
          <h3>Steering</h3>
          <p>Swipe on the board, tap the on-screen pad, or use arrow keys / WASD. You can't reverse straight into your own neck — that input's just ignored.</p>
        </section>
        <section class="ekans__rule">
          <h3>Growing</h3>
          <p>Eat to grow — and to speed up. The longer a run goes, the faster the tick, until it caps out at that difficulty's fastest pace.</p>
        </section>
        <section class="ekans__rule">
          <h3>Dying</h3>
          <p>Hit a wall, the edge of the board, or your own body, and the run ends. Nothing forgives that except GHOST, and only once.</p>
        </section>
        <section class="ekans__rule">
          <h3>Campaign vs. Freeplay</h3>
          <p>Campaign levels have a wall layout and a target — eat that much without dying and you clear it, which unlocks the next one.</p>
          <p>Freeplay has no walls and no ceiling. It's endless: it ends when you do, and your best score for that difficulty is saved on this device.</p>
        </section>
        <section class="ekans__rule">
          <h3>Powerups</h3>
          <p><b>SLOW-MO</b> widens the tick for a few seconds — more time to react, not a different game.</p>
          <p><b>GHOST</b> forgives your very next crash. Once. Doesn't care when you cash it in.</p>
        </section>
      </div>
    </Transition>

    <Transition name="sheet">
      <div v-if="phase === 'result'" class="ekans__backdrop">
        <div class="ekans__sheet">
          <div class="ekans__result-icon" :class="{ 'is-win': cleared }">
            <svg v-if="cleared" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            <svg v-else viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </div>
          <h2 class="ekans__sheet-title">{{ cleared ? 'LEVEL CLEAR' : 'GAME OVER' }}</h2>
          <p v-if="activeLevelInfo" class="ekans__level-tag">{{ activeLevelInfo.name }} · TARGET {{ activeLevelInfo.target }}</p>

          <div class="ekans__result-stats">
            <div class="ekans__result-stat"><b>{{ view.eaten }}</b><span>EATEN</span></div>
            <div class="ekans__result-stat"><b>{{ view.body.length }}</b><span>LENGTH</span></div>
            <div class="ekans__result-stat"><b>{{ modeTag }}</b><span>MODE</span></div>
          </div>
          <p v-if="beatHighScore" class="ekans__par-badge">★ NEW BEST</p>

          <button
            v-if="cleared && activeLevel"
            class="ekans__play ekans__play--sheet"
            @click="nextLevel"
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M7 4l13 8-13 8V4z" /></svg>
            {{ hasNextLevel ? 'NEXT LEVEL' : 'BACK TO MAP' }}
          </button>
          <button
            v-else-if="!activeLevel"
            class="ekans__play ekans__play--sheet"
            @click="startRun"
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M7 4l13 8-13 8V4z" /></svg>
            PLAY AGAIN
          </button>

          <div class="ekans__result-row">
            <button class="ekans__chip-btn" @click="retryRun" aria-label="Retry">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></svg>
              RETRY
            </button>
            <button class="ekans__chip-btn" @click="exitRun" aria-label="Home">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7M6 10v9h12v-9" /></svg>
              {{ activeLevel ? 'MAP' : 'HOME' }}
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
  transition: background 220ms ease, color 220ms ease;
  display: flex; flex-direction: column;
  background: var(--bg); color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-tap-highlight-color: transparent;
  user-select: none; touch-action: manipulation;
  overflow: hidden;
}

/* Second palette: a rosy, pastel-luxury take on the same cabinet — same
   shapes, same contrast logic, salmon and blush instead of yellow. */
.ekans.is-pink {
  --bg: #FFF3F4;
  --panel: #FFFFFF;
  --ink: #3A1F26;
  --ink-soft: #9C7480;
  --accent: #FF9FB0;
  --accent-strong: #F2688A;
  --accent-soft: #FFE3E8;
  --line: rgba(58, 31, 38, .08);
  --edge: rgba(58, 31, 38, .12);
  --wall: #F6D9DE;
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
.ekans__icon-btn:active { transform: scale(.93); background: var(--accent-soft); }
.ekans__icon-btn:disabled { opacity: .4; }
.ekans__hud-chip {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 12px 7px 8px; border-radius: 999px;
  background: var(--panel); border: 1px solid var(--edge);
}
.ekans__hud-mode {
  display: grid; place-items: center; width: 19px; height: 19px; border-radius: 8px;
  background: var(--accent); font: 800 10px/1 var(--font-mono); color: var(--ink);
}
.ekans__hud-diamond { width: 7px; height: 7px; background: var(--accent-strong); transform: rotate(45deg); border-radius: 1px; }
.ekans__hud-count { font: 700 13px/1 var(--font-mono); }

.ekans__level-strip {
  align-self: center; margin-top: 2px; padding: 5px 13px; border-radius: 999px;
  background: var(--panel); border: 1px solid var(--edge);
  font: 700 10px/1 var(--font-mono); letter-spacing: .06em; color: var(--ink-soft); text-align: center;
}
.ekans__level-strip span { color: var(--accent-strong); }

.ekans__stage { flex: 1; display: grid; place-items: center; padding: 6px 16px; min-height: 0; }
.ekans__board {
  position: relative; width: 100%; max-width: 480px;
  aspect-ratio: 9 / 15; max-height: 100%;
  border-radius: 22px; overflow: hidden; touch-action: none;
  background: var(--panel); border: 1px solid var(--edge);
  box-shadow: 0 18px 36px -20px rgba(22, 22, 24, .28);
  transition: box-shadow 260ms ease;
}
.is-clearflash .ekans__board {
  box-shadow: 0 0 0 2px var(--accent-strong), 0 0 30px 6px color-mix(in srgb, var(--accent-strong) 40%, transparent), 0 18px 36px -20px rgba(22, 22, 24, .28);
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
  content: ''; position: absolute; inset: 1.5px; border-radius: 6px;
  background-color: var(--wall);
  background-image: repeating-linear-gradient(
    135deg, rgba(22, 22, 24, .08) 0px, rgba(22, 22, 24, .08) 2px, transparent 2px, transparent 6px);
}

/* The snake: rounded, chunky, a face on the head. */
.ekans__seg {
  position: absolute; top: 0; left: 0;
  transition: transform 120ms linear;
}
.ekans__seg::after {
  content: ''; position: absolute; inset: 1.5px; border-radius: 8px;
  background: var(--ink);
  transition: transform 130ms cubic-bezier(.3, 1.5, .5, 1);
}
.ekans__seg--tail::after { inset: 3px; border-radius: 999px; opacity: .82; }
.ekans__seg--head::after {
  inset: 0.5px; border-radius: 11px; box-shadow: 0 0 0 2px var(--accent);
}
/* Swallow: the bite travels down the body. */
.ekans__seg.is-bulge::after { transform: scale(1.22); border-radius: 40%; }
/* Chomp: the head bites down on contact. */
.ekans__seg.is-chomp::after { animation: ekans-chomp 240ms cubic-bezier(.2, .9, .3, 1); }
@keyframes ekans-chomp {
  0%   { transform: scale(1); }
  22%  { transform: scale(1.44, .6); }
  58%  { transform: scale(.86, 1.22); }
  100% { transform: scale(1); }
}
/* Dead: the head flashes where it crashed. */
.ekans__seg.is-caught::after { animation: ekans-caught 700ms ease-in-out 2; }
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

/* Pink theme only: bigger eyes, plus a bold lash wedge over each. The eye
   is tiny on screen — a thin outlined arc disappeared at that size, so this
   is a solid filled shape instead. Rides the same element the eye animates
   on, so it blinks in sync for free. */
.ekans.is-pink .ekans__face i { width: 26%; height: 26%; box-shadow: 0 0 0 1.4px var(--ink); }
.ekans.is-pink .ekans__face i::before {
  content: ''; position: absolute; top: -78%; left: 30%; width: 18%; height: 55%;
  background: var(--accent-strong); border-radius: 50% 50% 20% 20%;
  transform-origin: bottom center;
  pointer-events: none;
}
.ekans.is-pink .ekans__face i:nth-child(1)::before { transform: rotate(-28deg); }
.ekans.is-pink .ekans__face i:nth-child(2)::before { transform: rotate(24deg); }

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

/* The impact: a hard, brief flash right on the bite — force, not decoration. */
.ekans__impact { position: absolute; top: 0; left: 0; pointer-events: none; }
.ekans__impact::after {
  content: ''; position: absolute; inset: -22%; border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent-strong) 60%, transparent) 0%, transparent 70%);
  animation: ekans-impact 240ms cubic-bezier(.15, .8, .3, 1) forwards;
}
@keyframes ekans-impact {
  0%   { opacity: 0; transform: scale(.35); }
  25%  { opacity: .95; transform: scale(1.15); }
  100% { opacity: 0; transform: scale(1.8); }
}

/* Crumbs from the bite: an initial scatter from the force of it, then real
   gravity — falling and tumbling rather than radiating out on a neat wheel. */
.ekans__burst { position: absolute; top: 0; left: 0; display: grid; place-items: center; pointer-events: none; }
.ekans__burst i {
  position: absolute; width: 5px; height: 5px; background: var(--accent-strong); border-radius: 1.5px;
  animation: ekans-burst 600ms cubic-bezier(.32, 0, .4, 1) both;
}
@keyframes ekans-burst {
  0%   { transform: translate(0, 0) scale(1.15) rotate(0deg); opacity: 1; }
  32%  { transform: translate(calc(var(--dx) * .55), calc(var(--dy) * -.4)) scale(1) rotate(calc(var(--rot) * .3)); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(.3) rotate(var(--rot)); opacity: 0; }
}

/* Ghost save: a quick cool flash across the whole board — a different
   register from the crash shake, so a forgiven hit reads as a reprieve. */
.ekans__ghost-flash {
  position: absolute; inset: 0; pointer-events: none;
  background: color-mix(in srgb, var(--accent) 30%, transparent);
  animation: ekans-ghost-flash 480ms ease-out forwards;
}
@keyframes ekans-ghost-flash { 0% { opacity: .9; } 100% { opacity: 0; } }

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

.is-shaking .ekans__board { animation: ekans-shake 260ms ease-in-out; }
@keyframes ekans-shake {
  0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 45% { transform: translateX(6px); } 70% { transform: translateX(-4px); } 90% { transform: translateX(3px); }
}

.ekans__foot { padding: 10px 16px calc(env(safe-area-inset-bottom, 0px) + 16px); }
.ekans__controls { display: flex; align-items: center; justify-content: space-between; gap: 14px; }

/* D-pad: a 3x3 grid, only the cross cells populated. */
.ekans__dpad {
  display: grid; grid-template-columns: repeat(3, 44px); grid-template-rows: repeat(3, 44px); gap: 4px;
  flex-shrink: 0;
}
.ekans__dpad-btn {
  display: grid; place-items: center; border-radius: 12px;
  background: var(--panel); border: 1px solid var(--edge); color: var(--ink);
  transition: transform 90ms ease, background 90ms ease;
}
.ekans__dpad-btn:active { transform: scale(.92); background: var(--accent-soft); }
.ekans__dpad-btn--up { grid-column: 2; grid-row: 1; }
.ekans__dpad-btn--left { grid-column: 1; grid-row: 2; }
.ekans__dpad-btn--right { grid-column: 3; grid-row: 2; }
.ekans__dpad-btn--down { grid-column: 2; grid-row: 3; }

.ekans__powerbar { display: flex; align-items: center; gap: 8px; }
.ekans__powerbar--stack { flex-direction: column; align-items: stretch; gap: 6px; }
.ekans__power-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 14px; border-radius: 999px;
  background: var(--panel); border: 1px solid var(--edge); color: var(--ink);
  font: 800 10.5px/1 var(--font-mono); letter-spacing: .07em;
  transition: transform 100ms ease, background 100ms ease;
}
.ekans__power-btn:active:not(:disabled) { transform: scale(.94); background: var(--accent-soft); }
.ekans__power-btn:disabled { opacity: .38; }
.ekans__power-btn.is-active { background: var(--accent); border-color: color-mix(in srgb, var(--ink) 24%, transparent); }
.ekans__power-count {
  display: grid; place-items: center; min-width: 16px; height: 16px; padding: 0 3px; border-radius: 999px;
  background: var(--accent); color: var(--ink); font-size: 9px;
}
.ekans__power-btn.is-active .ekans__power-count { background: var(--panel); }

/* Menu */
.ekans__menu {
  position: absolute; inset: 0; z-index: 5;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  background: radial-gradient(120% 60% at 50% 8%, var(--accent-soft) 0%, transparent 62%), var(--bg);
  padding: calc(env(safe-area-inset-top, 0px) + 24px) 24px calc(env(safe-area-inset-bottom, 0px) + 28px);
}
.ekans__mute-corner { position: absolute; top: calc(env(safe-area-inset-top, 0px) + 16px); right: 18px; }
.ekans__theme-corner { position: absolute; top: calc(env(safe-area-inset-top, 0px) + 16px); right: 60px; }
.ekans__theme-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--accent); border: 1px solid var(--ink); }
.ekans__rules-corner { position: absolute; top: calc(env(safe-area-inset-top, 0px) + 16px); left: 18px; }
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
.ekans__menu-controls { display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 340px; }
.ekans__freeplay { display: flex; flex-direction: column; gap: 10px; padding-top: 10px; border-top: 1px dashed var(--edge); }
.ekans__freeplay-label { margin: 0; text-align: center; font: 800 10px/1 var(--font-mono); letter-spacing: .18em; color: var(--ink-soft); }
.ekans__best { margin: 0; text-align: center; font: 700 12px/1 var(--font-mono); letter-spacing: .06em; color: var(--ink-soft); }
.ekans__best b { color: var(--accent-strong); font-size: 15px; }

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
  border: 1px solid color-mix(in srgb, var(--ink) 22%, transparent); font: 800 14px/1 inherit; letter-spacing: .1em;
  box-shadow: 0 10px 22px -8px color-mix(in srgb, var(--ink) 32%, transparent);
  transition: transform 120ms ease, box-shadow 120ms ease;
}
.ekans__play:active { transform: scale(.97) translateY(1px); box-shadow: 0 4px 12px -6px color-mix(in srgb, var(--ink) 28%, transparent); }
.ekans__play:disabled { opacity: .7; }
.ekans__play svg { flex-shrink: 0; }
.ekans__play--ghost { background: var(--panel); box-shadow: 0 6px 16px -8px color-mix(in srgb, var(--ink) 20%, transparent); }
.ekans__spin { animation: ekans-spin .9s linear infinite; }
@keyframes ekans-spin { to { transform: rotate(360deg); } }

/* Result sheet */
.ekans__backdrop {
  position: absolute; inset: 0; z-index: 10;
  display: flex; align-items: flex-end;
  background: rgba(22, 22, 24, .32); backdrop-filter: blur(5px);
}
.ekans__sheet {
  width: 100%; padding: 26px 22px calc(env(safe-area-inset-bottom, 0px) + 22px);
  border-radius: 28px 28px 0 0; background: var(--bg); border-top: 1.5px solid var(--edge);
  display: flex; flex-direction: column; align-items: center; gap: 13px; text-align: center;
}
.ekans__result-icon {
  display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%;
  background: var(--panel); border: 1.5px solid var(--edge); color: var(--ink);
}
.ekans__result-icon.is-win { background: var(--accent); }
.ekans__sheet-title { margin: 0; font: 800 32px/1 inherit; letter-spacing: -.01em; }
.ekans__level-tag { margin: -6px 0 0; font: 700 11px/1 var(--font-mono); letter-spacing: .07em; color: var(--ink-soft); }
.ekans__result-stats { display: flex; gap: 22px; }
.ekans__result-stat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.ekans__result-stat b { font: 800 18px/1 var(--font-mono); }
.ekans__result-stat span { font: 700 9px/1 var(--font-mono); letter-spacing: .12em; color: var(--ink-soft); }
.ekans__par-badge { margin: -6px 0 0; font: 800 10px/1 var(--font-mono); letter-spacing: .1em; color: var(--accent-strong); }
.ekans__play--sheet { width: 100%; margin-top: 2px; }
.ekans__result-row { display: flex; gap: 8px; width: 100%; }
.ekans__chip-btn {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px;
  padding: 10px 6px; border-radius: 18px; border: 1px solid var(--edge);
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

/* Campaign: the level map. A tier picker over a grid of numbered stops —
   locked, unlocked, or cleared. */
.ekans__campaign {
  position: absolute; inset: 0; z-index: 6;
  display: flex; flex-direction: column; gap: 14px;
  background: var(--bg);
  padding: calc(env(safe-area-inset-top, 0px) + 18px) 20px calc(env(safe-area-inset-bottom, 0px) + 20px);
  overflow-y: auto;
}
.ekans__campaign-head { display: flex; align-items: center; justify-content: space-between; }
.ekans__campaign-head h2 { margin: 0; font: 800 21px/1 inherit; letter-spacing: -.01em; }
.ekans__campaign-tagline { margin: -8px 0 0; font: 500 13px/1.4 inherit; color: var(--ink-soft); }
.ekans__tier-tabs { display: flex; gap: 6px; padding: 4px; border-radius: 999px; background: var(--panel); border: 1px solid var(--edge); }
.ekans__level-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 2px; }
.ekans__level-tile {
  position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  aspect-ratio: 1; padding: 8px 6px; border-radius: 18px; border: 1px solid var(--edge);
  background: var(--panel); color: var(--ink);
  transition: transform 100ms ease, background 100ms ease;
}
.ekans__level-tile:active:not(:disabled) { transform: scale(.95); }
.ekans__level-tile:disabled { opacity: .4; }
.ekans__level-tile.is-done { background: var(--accent-soft); border-color: var(--accent-strong); }
.ekans__level-num { font: 800 11px/1 var(--font-mono); color: var(--ink-soft); }
.ekans__level-name { font: 700 10px/1.15 inherit; text-align: center; letter-spacing: -.01em; }
.ekans__level-lock { color: var(--ink-soft); }
.ekans__level-star { position: absolute; top: 5px; right: 7px; font-size: 10px; line-height: 1; color: var(--accent-strong); }

/* Rules: the same full-screen sheet as the campaign map, plain reading type. */
.ekans__rules { gap: 4px; }
.ekans__rule { padding: 16px 0; border-top: 1px solid var(--edge); }
.ekans__rule:first-of-type { border-top: 1px solid var(--edge); margin-top: 6px; }
.ekans__rule h3 { margin: 0 0 8px; font: 800 15px/1 inherit; letter-spacing: -.01em; }
.ekans__rule p { margin: 0; font: 400 14px/1.55 inherit; color: var(--ink-soft); }
.ekans__rule p + p { margin-top: 8px; }
.ekans__rule b { color: var(--ink); }

@media (prefers-reduced-motion: reduce) {
  .ekans__seg, .ekans__seg::after, .ekans__food-dot, .ekans__burst i,
  .ekans__mark-seg::after, .ekans__face i,
  .ekans__stamp, .is-shaking .ekans__board, .ekans__impact::after, .ekans__ghost-flash {
    animation: none !important; transition: none !important;
  }
}
</style>
