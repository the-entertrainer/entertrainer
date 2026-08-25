/**
 * EKANS engine — no rendering, no Vue. Pure grid logic:
 *
 * The player never moves the snake. Each turn they place one piece of food;
 * the snake decides its own route to it, tick by tick, using one of three
 * pathfinding personalities (see decideStep). The player wins when that
 * routing runs the snake out of legal moves — a self-trap. The snake "wins"
 * a run by surviving long enough to reach its target food count.
 *
 * Movement rule (why the tail is excluded from `blocked` below): on any
 * non-growth move the tail vacates its cell the same tick the head enters a
 * new one, so a snake's own tail cell is always safe to step into unless
 * this step also eats food (in which case the tail stays put and growth
 * occupies it). Recomputing that constraint fresh every tick — rather than
 * committing to one static path — is what lets the snake react as its own
 * growing body changes the board mid-route, and is what occasionally dooms
 * it: a route that was open when chosen can close by the time it arrives.
 */

export type Mode = 'learn' | 'standard' | 'expert'

export interface Cell { r: number; c: number }

export interface ModeInfo {
  label: string
  blurb: string
  target: number
  margin: number
}

export const MODES: Record<Mode, ModeInfo> = {
  learn:    { label: 'Learn',    blurb: 'Commits to food. Easiest to read.',        target: 8,  margin: 0 },
  standard: { label: 'Standard', blurb: 'Leaves room for a trap, won’t hand you one.', target: 14, margin: 3 },
  expert:   { label: 'Expert',   blurb: 'Guards open space. Plan further ahead.',    target: 20, margin: 6 }
}

export interface TurnRecord {
  turn: number
  food: Cell
  path: Cell[]        // head positions taken this turn, including the starting head
  bodyBefore: Cell[]
  bodyAfter: Cell[]
  outcome: 'ate' | 'trapped'
}

export interface EkansState {
  cols: number
  rows: number
  mode: Mode
  seed: number
  seedLabel: string
  body: Cell[]         // index 0 = head
  dir: Cell
  food: Cell | null
  eaten: number
  target: number
  turn: number
  status: 'placing' | 'moving' | 'trapped' | 'escaped'
}

const DIRS: Cell[] = [{ r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }]

export function cellKey(c: Cell): number { return c.r * 1024 + c.c }
export function cellsEqual(a: Cell, b: Cell): boolean { return a.r === b.r && a.c === b.c }
function inBounds(c: Cell, cols: number, rows: number): boolean {
  return c.r >= 0 && c.r < rows && c.c >= 0 && c.c < cols
}

// --- seeded RNG -------------------------------------------------------

export function hashSeed(s: string): number {
  let h = 1779033703 ^ s.length
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return (h ^ (h >>> 16)) >>> 0
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

const SEED_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no O/0, I/1
export function randomSeedLabel(): string {
  let out = ''
  for (let i = 0; i < 5; i++) out += SEED_CHARS[Math.floor(Math.random() * SEED_CHARS.length)]
  return out
}

// --- grid search --------------------------------------------------------

function neighborsOf(c: Cell, cols: number, rows: number): Cell[] {
  const out: Cell[] = []
  for (const d of DIRS) {
    const n = { r: c.r + d.r, c: c.c + d.c }
    if (inBounds(n, cols, rows)) out.push(n)
  }
  return out
}

/** Shortest path from start to goal avoiding `blocked`, inclusive of both ends. */
export function bfsPath(start: Cell, goal: Cell, blocked: Set<number>, cols: number, rows: number): Cell[] | null {
  if (cellsEqual(start, goal)) return [start]
  const startK = cellKey(start)
  const visited = new Set<number>([startK])
  const prev = new Map<number, Cell>()
  const queue: Cell[] = [start]
  let qi = 0
  while (qi < queue.length) {
    const cur = queue[qi++]
    for (const n of neighborsOf(cur, cols, rows)) {
      const nk = cellKey(n)
      if (visited.has(nk)) continue
      const isGoal = cellsEqual(n, goal)
      if (blocked.has(nk) && !isGoal) continue
      visited.add(nk)
      prev.set(nk, cur)
      if (isGoal) {
        const path: Cell[] = [n]
        let walk = cur
        while (!cellsEqual(walk, start)) {
          path.push(walk)
          walk = prev.get(cellKey(walk))!
        }
        path.push(start)
        return path.reverse()
      }
      queue.push(n)
    }
  }
  return null
}

/** Count of cells reachable from `start` (inclusive) avoiding `blocked`. */
function floodCount(start: Cell, blocked: Set<number>, cols: number, rows: number): number {
  const visited = new Set<number>([cellKey(start)])
  const queue: Cell[] = [start]
  let qi = 0
  let count = 1
  while (qi < queue.length) {
    const cur = queue[qi++]
    for (const n of neighborsOf(cur, cols, rows)) {
      const nk = cellKey(n)
      if (visited.has(nk) || blocked.has(nk)) continue
      visited.add(nk)
      count++
      queue.push(n)
    }
  }
  return count
}

// --- run setup ------------------------------------------------------------

export const BOARD_COLS = 9
export const BOARD_ROWS = 15

export function createRun(mode: Mode, seedLabel?: string): EkansState {
  const label = (seedLabel && seedLabel.trim()) || randomSeedLabel()
  const cols = BOARD_COLS
  const rows = BOARD_ROWS
  const midRow = Math.floor(rows / 2)
  const startCol = 4
  const body: Cell[] = [
    { r: midRow, c: startCol },
    { r: midRow, c: startCol - 1 },
    { r: midRow, c: startCol - 2 }
  ]
  return {
    cols, rows, mode,
    seed: hashSeed(label.toUpperCase()),
    seedLabel: label.toUpperCase(),
    body,
    dir: { r: 0, c: 1 },
    food: null,
    eaten: 0,
    target: MODES[mode].target,
    turn: 0,
    status: 'placing'
  }
}

// --- placement --------------------------------------------------------

function tailFreeBlockedSet(body: Cell[]): Set<number> {
  const blocked = new Set(body.map(cellKey))
  blocked.delete(cellKey(body[body.length - 1]))
  return blocked
}

export function canPlace(state: EkansState, cell: Cell): boolean {
  if (state.status !== 'placing') return false
  if (!inBounds(cell, state.cols, state.rows)) return false
  if (state.body.some((b) => cellsEqual(b, cell))) return false
  const blocked = tailFreeBlockedSet(state.body)
  return bfsPath(state.body[0], cell, blocked, state.cols, state.rows) !== null
}

export function placeFood(state: EkansState, cell: Cell): boolean {
  if (!canPlace(state, cell)) return false
  state.food = cell
  state.status = 'moving'
  state.turn += 1
  return true
}

// --- the snake's own move choice ------------------------------------------

interface StepResult { next: Cell | null; ate: boolean }

function pickSafest(
  legal: Cell[], head: Cell, tail: Cell, blocked: Set<number>, food: Cell | null,
  cols: number, rows: number, dir: Cell, rng: () => number
): Cell {
  let best: Cell[] = []
  let bestScore = -1
  for (const n of legal) {
    const eat = !!food && cellsEqual(n, food)
    const nb = new Set(blocked)
    nb.add(cellKey(head))
    if (eat) nb.add(cellKey(tail))
    let score = floodCount(n, nb, cols, rows)
    if (n.r - head.r === dir.r && n.c - head.c === dir.c) score += 0.25 // mild preference to keep gliding straight
    if (score > bestScore) { bestScore = score; best = [n] }
    else if (score === bestScore) { best.push(n) }
  }
  return best[Math.floor(rng() * best.length)] ?? legal[0]
}

export function decideStep(state: EkansState): StepResult {
  const head = state.body[0]
  const tail = state.body[state.body.length - 1]
  const blocked = tailFreeBlockedSet(state.body)
  const legal = neighborsOf(head, state.cols, state.rows).filter((n) => !blocked.has(cellKey(n)))
  const rng = mulberry32((state.seed ^ (state.turn * 7919) ^ (state.body.length * 104729)) >>> 0)

  if (legal.length === 0) return { next: null, ate: false }
  if (!state.food) return { next: null, ate: false }

  const path = bfsPath(head, state.food, blocked, state.cols, state.rows)
  const proposed = path && path.length > 1 ? path[1] : null
  const info = MODES[state.mode]

  if (!proposed) {
    // Food is currently unreachable — wander toward the safest open space
    // and keep trying to reach it as the board changes underfoot.
    return { next: pickSafest(legal, head, tail, blocked, state.food, state.cols, state.rows, state.dir, rng), ate: false }
  }

  if (info.margin === 0) {
    return { next: proposed, ate: cellsEqual(proposed, state.food) }
  }

  const eatProposed = cellsEqual(proposed, state.food)
  const nb = new Set(blocked)
  nb.add(cellKey(head))
  if (eatProposed) nb.add(cellKey(tail))
  const proposedScore = floodCount(proposed, nb, state.cols, state.rows)
  const required = state.body.length + info.margin

  if (proposedScore >= required) {
    return { next: proposed, ate: eatProposed }
  }

  const safest = pickSafest(legal, head, tail, blocked, state.food, state.cols, state.rows, state.dir, rng)
  const safestNb = new Set(blocked)
  safestNb.add(cellKey(head))
  if (cellsEqual(safest, state.food)) safestNb.add(cellKey(tail))
  const safestScore = floodCount(safest, safestNb, state.cols, state.rows)

  if (safestScore > proposedScore) {
    return { next: safest, ate: cellsEqual(safest, state.food) }
  }
  return { next: proposed, ate: eatProposed } // nothing better on offer — commit
}

function hasAnyLegalMove(state: EkansState): boolean {
  const head = state.body[0]
  const blocked = tailFreeBlockedSet(state.body)
  return neighborsOf(head, state.cols, state.rows).some((n) => !blocked.has(cellKey(n)))
}

export type AdvanceResult = 'moved' | 'ate' | 'trapped'

export function advance(state: EkansState): AdvanceResult {
  const result = decideStep(state)
  if (!result.next) {
    state.status = 'trapped'
    return 'trapped'
  }
  const head = state.body[0]
  state.dir = { r: result.next.r - head.r, c: result.next.c - head.c }
  state.body.unshift(result.next)
  if (result.ate) {
    state.eaten += 1
    state.food = null
    // A self-trap always wins the run, even on the bite that would
    // otherwise have hit the target — "no legal move left" is the rule,
    // full stop, not something reaching the target should be able to
    // paper over the same tick it happens.
    if (!hasAnyLegalMove(state)) state.status = 'trapped'
    else if (state.eaten >= state.target) state.status = 'escaped'
    else state.status = 'placing'
    return 'ate'
  }
  state.body.pop()
  return 'moved'
}
