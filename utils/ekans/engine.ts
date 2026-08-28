/**
 * EKANS engine — pure grid logic, no rendering, no Vue.
 *
 * This is a real Snake: the player steers, the snake grows on every bite,
 * and it's over the moment the head hits a wall, the border, or its own
 * body. Nothing here simulates the future or searches for a solution —
 * there's nothing to solve. It's a real-time skill game. The engine's job
 * is just to answer "where does one tick take the snake," honestly and
 * deterministically given a direction.
 */

export type Mode = 'learn' | 'standard' | 'expert'
export type Dir = 'up' | 'down' | 'left' | 'right'

export interface Cell { r: number; c: number }

export interface ModeInfo {
  label: string
  /** Starting time between ticks, in ms — lower is faster. */
  tickMs: number
  /** The ramp never goes faster than this, however long the run gets. */
  minTickMs: number
  /** Ticks shave off `speedStep` ms from the interval this often (in food eaten). */
  speedupEvery: number
  speedStep: number
}

export const MODES: Record<Mode, ModeInfo> = {
  learn:    { label: 'Easy',   tickMs: 175, minTickMs: 120, speedupEvery: 4, speedStep: 6 },
  standard: { label: 'Normal', tickMs: 145, minTickMs: 90,  speedupEvery: 3, speedStep: 7 },
  expert:   { label: 'Hard',   tickMs: 118, minTickMs: 68,  speedupEvery: 2, speedStep: 8 }
}

export const BOARD_COLS = 9
export const BOARD_ROWS = 15

const DIR_VECTOR: Record<Dir, Cell> = {
  up: { r: -1, c: 0 }, down: { r: 1, c: 0 }, left: { r: 0, c: -1 }, right: { r: 0, c: 1 }
}
const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' }

export function cellKey(c: Cell): number { return c.r * 1024 + c.c }
export function cellsEqual(a: Cell, b: Cell): boolean { return a.r === b.r && a.c === b.c }

export type RunStatus = 'playing' | 'dead' | 'cleared'
export type DeathCause = null | 'wall' | 'edge' | 'self'

export interface SnakeState {
  cols: number; rows: number
  mode: Mode
  body: Cell[]          // index 0 = head
  dir: Dir
  pendingDir: Dir        // queued input, applied at the start of the next tick
  food: Cell
  walls: Cell[]          // fixed obstacles, set once at createRun
  eaten: number
  target: number         // food needed to clear the level; Infinity for endless freeplay
  status: RunStatus
  deathCause: DeathCause
  ghostArmed: boolean    // GHOST powerup: forgives the next wall/self collision, once
  ghostUsedThisTick: boolean
}

function inBounds(c: Cell, cols: number, rows: number): boolean {
  return c.r >= 0 && c.r < rows && c.c >= 0 && c.c < cols
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function occupiedSet(body: Cell[], walls: Cell[]): Set<number> {
  const set = new Set<number>()
  for (const b of body) set.add(cellKey(b))
  for (const w of walls) set.add(cellKey(w))
  return set
}

function randomFreeCell(occupied: Set<number>, cols: number, rows: number, rng: () => number): Cell | null {
  const free: Cell[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!occupied.has(r * 1024 + c)) free.push({ r, c })
    }
  }
  if (!free.length) return null
  return free[Math.floor(rng() * free.length)]
}

export interface LevelDef {
  walls: Cell[]
  target: number
}

export function createRun(mode: Mode, level?: LevelDef): SnakeState {
  const cols = BOARD_COLS, rows = BOARD_ROWS
  const midRow = Math.floor(rows / 2), startCol = 4
  const body: Cell[] = [
    { r: midRow, c: startCol }, { r: midRow, c: startCol - 1 }, { r: midRow, c: startCol - 2 }
  ]
  const walls = level?.walls ?? []
  const target = level?.target ?? Infinity
  const rng = mulberry32((Date.now() ^ (Math.random() * 0xffffffff)) >>> 0)
  const food = randomFreeCell(occupiedSet(body, walls), cols, rows, rng) ?? { r: 0, c: 0 }

  return {
    cols, rows, mode, body, dir: 'right', pendingDir: 'right', food, walls,
    eaten: 0, target, status: 'playing', deathCause: null,
    ghostArmed: false, ghostUsedThisTick: false
  }
}

/** Current tick interval given how much has been eaten — the speed ramp. */
export function currentTickMs(state: SnakeState): number {
  const info = MODES[state.mode]
  const steps = Math.floor(state.eaten / info.speedupEvery)
  return Math.max(info.minTickMs, info.tickMs - steps * info.speedStep)
}

/** Queue a turn. Ignored if it would reverse the snake directly into its own neck. */
export function setDirection(state: SnakeState, dir: Dir) {
  if (state.status !== 'playing') return
  if (OPPOSITE[dir] === state.dir) return
  state.pendingDir = dir
}

/** Arm the GHOST powerup: the next wall/self collision is forgiven once. */
export function armGhost(state: SnakeState) {
  if (state.status !== 'playing') return
  state.ghostArmed = true
}

export type TickResult = 'moved' | 'ate' | 'ghosted' | 'dead' | 'cleared'

/** Advance one tick. The engine's whole job, done honestly. */
export function tick(state: SnakeState, rng: () => number = Math.random): TickResult {
  if (state.status !== 'playing') return state.status === 'dead' ? 'dead' : 'cleared'
  state.ghostUsedThisTick = false

  state.dir = state.pendingDir
  const head = state.body[0]
  const v = DIR_VECTOR[state.dir]
  const next: Cell = { r: head.r + v.r, c: head.c + v.c }

  if (!inBounds(next, state.cols, state.rows)) {
    state.status = 'dead'; state.deathCause = 'edge'
    return 'dead'
  }

  const hitsWall = state.walls.some((w) => cellsEqual(w, next))
  // The tail vacates its own cell the same tick the head arrives, unless this
  // move also eats — then growth keeps the tail in place, so it stays solid.
  const willGrow = cellsEqual(next, state.food)
  const bodyToCheck = willGrow ? state.body : state.body.slice(0, -1)
  const hitsSelf = bodyToCheck.some((b) => cellsEqual(b, next))

  let ghosted = false
  if (hitsWall || hitsSelf) {
    if (state.ghostArmed) {
      state.ghostArmed = false
      state.ghostUsedThisTick = true
      ghosted = true
    } else {
      state.status = 'dead'; state.deathCause = hitsWall ? 'wall' : 'self'
      return 'dead'
    }
  }

  state.body.unshift(next)
  if (willGrow) {
    state.eaten += 1
    if (state.eaten >= state.target) { state.status = 'cleared'; return 'cleared' }
    const spawned = randomFreeCell(occupiedSet(state.body, state.walls), state.cols, state.rows, rng)
    // No free cell left means the snake fills the board — the good kind of stuck.
    if (spawned) state.food = spawned
    else { state.status = 'cleared'; return 'cleared' }
    return ghosted ? 'ghosted' : 'ate'
  }

  state.body.pop()
  return ghosted ? 'ghosted' : 'moved'
}
