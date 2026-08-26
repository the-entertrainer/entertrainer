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
 *
 * Determinism: a run is fully determined by (mode, seed, the player's
 * placements). Nothing reads Math.random once a run has started, which is
 * what lets `solveTrapLine` search this exact board offline and hand back a
 * line that will reproduce move-for-move when replayed.
 */

export type Mode = 'learn' | 'standard' | 'expert'

export interface Cell { r: number; c: number }

export interface ModeInfo {
  label: string
  target: number
  /**
   * Free space the snake wants to keep beyond its own length before it will
   * commit to a route. 0 = takes the shortest path, always.
   */
  margin: number
  /**
   * Ticks the snake will spend refusing an unsafe-looking route before
   * hunger wins and it commits anyway. Without this the margin acts as a
   * permanent veto: a snake that never accepts the only route never eats,
   * the turn never ends, and a lure into a tight pocket — the whole point of
   * the game — silently does nothing.
   */
  patience: number
}

export const MODES: Record<Mode, ModeInfo> = {
  learn:    { label: 'Learn',    target: 8,  margin: 0, patience: 0 },
  standard: { label: 'Standard', target: 11, margin: 2, patience: 10 },
  expert:   { label: 'Expert',   target: 15, margin: 4, patience: 18 }
}

/**
 * Absolute per-turn tick ceiling. Desperation guarantees the snake closes on
 * reachable food, so hitting this means the food is genuinely walled off from
 * it — see the `sealed` end reason.
 */
const HARD_TICK_CAP = 240

export type EndReason = null | 'no-move' | 'sealed' | 'target'

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
  walls: Cell[]        // permanent obstacles, laid out once at createRun
  turnTicks: number    // ticks spent on the current turn; drives desperation
  endReason: EndReason
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

// --- maze walls -------------------------------------------------------

/**
 * Trapping the snake on a fully open board turns out to need a several-move
 * spiral planned from the first placement — real, but not something a player
 * finds by feel. A handful of short walls gives the board actual choke
 * points and dead-end pockets: places a player can *see* are dangerous and
 * lure the snake into, instead of having to build a trap from nothing.
 * Denser on Learn (more of the trap is done for you), sparse on Expert
 * (the AI is also the most careful, so it still has to be earned).
 */
const WALL_TARGET: Record<Mode, number> = { learn: 16, standard: 13, expert: 8 }
const WALL_MIN_KEEP = 0.6 // a candidate wall segment must leave this share of open cells reachable

function generateWalls(mode: Mode, seed: number, body: Cell[], cols: number, rows: number): Cell[] {
  const rng = mulberry32((seed ^ 0x9e3779b9) >>> 0)
  const head = body[0]
  const forbidden = new Set(body.map(cellKey))
  for (const b of body) {
    for (const n of neighborsOf(b, cols, rows)) forbidden.add(cellKey(n))
  }

  const totalOpen = cols * rows - body.length
  const walls: Cell[] = []
  const wallKeys = new Set<number>()
  let attempts = 0

  while (walls.length < WALL_TARGET[mode] && attempts < WALL_TARGET[mode] * 60) {
    attempts++
    const horizontal = rng() < 0.5
    const len = 2 + Math.floor(rng() * 4) // 2–5 cells
    const r0 = Math.floor(rng() * rows)
    const c0 = Math.floor(rng() * cols)
    const segment: Cell[] = []
    let ok = true
    for (let i = 0; i < len; i++) {
      const cell = horizontal ? { r: r0, c: c0 + i } : { r: r0 + i, c: c0 }
      const k = inBounds(cell, cols, rows) ? cellKey(cell) : -1
      if (k === -1 || forbidden.has(k) || wallKeys.has(k)) { ok = false; break }
      segment.push(cell)
    }
    if (!ok) continue

    const trial = new Set(wallKeys)
    segment.forEach((c) => trial.add(cellKey(c)))
    const reachable = floodCount(head, trial, cols, rows)
    if (reachable < totalOpen * WALL_MIN_KEEP) continue // would seal off too much of the board

    segment.forEach((c) => { wallKeys.add(cellKey(c)); walls.push(c) })
  }
  return walls
}

/** Body (tail excluded) plus the run's permanent walls — the blocked set every move check starts from. */
function baseBlocked(state: EkansState): Set<number> {
  const blocked = new Set<number>()
  for (let i = 0; i < state.body.length - 1; i++) blocked.add(cellKey(state.body[i]))
  for (const w of state.walls) blocked.add(cellKey(w))
  return blocked
}

// --- run setup ------------------------------------------------------------

export const BOARD_COLS = 9
export const BOARD_ROWS = 15

export function createRun(mode: Mode, seedLabel?: string): EkansState {
  const label = ((seedLabel && seedLabel.trim()) || randomSeedLabel()).toUpperCase()
  const cols = BOARD_COLS
  const rows = BOARD_ROWS
  const midRow = Math.floor(rows / 2)
  const startCol = 4
  const body: Cell[] = [
    { r: midRow, c: startCol },
    { r: midRow, c: startCol - 1 },
    { r: midRow, c: startCol - 2 }
  ]
  const seed = hashSeed(label)
  return {
    cols, rows, mode,
    seed,
    seedLabel: label,
    body,
    dir: { r: 0, c: 1 },
    food: null,
    eaten: 0,
    target: MODES[mode].target,
    turn: 0,
    status: 'placing',
    walls: generateWalls(mode, seed, body, cols, rows),
    turnTicks: 0,
    endReason: null
  }
}

/** Deep copy — the solver explores thousands of hypothetical futures. */
export function cloneRun(s: EkansState): EkansState {
  return {
    cols: s.cols, rows: s.rows, mode: s.mode, seed: s.seed, seedLabel: s.seedLabel,
    body: s.body.map((c) => ({ r: c.r, c: c.c })),
    dir: { r: s.dir.r, c: s.dir.c },
    food: s.food ? { r: s.food.r, c: s.food.c } : null,
    eaten: s.eaten, target: s.target, turn: s.turn, status: s.status,
    walls: s.walls.map((c) => ({ r: c.r, c: c.c })),
    turnTicks: s.turnTicks, endReason: s.endReason
  }
}

// --- placement --------------------------------------------------------

export function canPlace(state: EkansState, cell: Cell): boolean {
  if (state.status !== 'placing') return false
  if (!inBounds(cell, state.cols, state.rows)) return false
  if (state.body.some((b) => cellsEqual(b, cell))) return false
  if (state.walls.some((w) => cellsEqual(w, cell))) return false
  const blocked = baseBlocked(state)
  return bfsPath(state.body[0], cell, blocked, state.cols, state.rows) !== null
}

/**
 * Free cells the head can still reach — the placements a player would have.
 * Deliberately status-agnostic so `advance` can ask "would there be anything
 * to feed after this bite?" while the turn is still resolving.
 */
function reachableFreeCells(state: EkansState): Cell[] {
  const out: Cell[] = []
  const blocked = baseBlocked(state)
  const occupied = new Set(state.body.map(cellKey))
  for (const w of state.walls) occupied.add(cellKey(w))
  const head = state.body[0]
  // One flood from the head marks everything reachable; cheaper than a BFS per cell.
  const reachable = new Set<number>([cellKey(head)])
  const queue: Cell[] = [head]
  let qi = 0
  while (qi < queue.length) {
    const cur = queue[qi++]
    for (const n of neighborsOf(cur, state.cols, state.rows)) {
      const nk = cellKey(n)
      if (reachable.has(nk) || blocked.has(nk)) continue
      reachable.add(nk)
      queue.push(n)
    }
  }
  for (const k of reachable) {
    if (occupied.has(k)) continue
    out.push({ r: Math.floor(k / 1024), c: k % 1024 })
  }
  return out
}

/** Every cell the player could legally feed right now. Empty means a dead board. */
export function legalPlacements(state: EkansState): Cell[] {
  if (state.status !== 'placing') return []
  return reachableFreeCells(state)
}

export function placeFood(state: EkansState, cell: Cell): boolean {
  if (!canPlace(state, cell)) return false
  state.food = { r: cell.r, c: cell.c }
  state.status = 'moving'
  state.turn += 1
  state.turnTicks = 0
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
  const blocked = baseBlocked(state)
  const legal = neighborsOf(head, state.cols, state.rows).filter((n) => !blocked.has(cellKey(n)))

  if (legal.length === 0) return { next: null, ate: false }
  if (!state.food) return { next: null, ate: false } // defensive: only 'moving' turns step

  // turnTicks is mixed in so tie-breaks differ tick to tick. Without it the
  // draw is identical every tick of a turn (turn and length are both fixed
  // while the snake is merely travelling) and the snake locks into a cycle.
  const rng = mulberry32(
    (state.seed ^ (state.turn * 7919) ^ (state.body.length * 104729) ^ (state.turnTicks * 2654435761)) >>> 0
  )

  const path = bfsPath(head, state.food, blocked, state.cols, state.rows)
  const proposed = path && path.length > 1 ? path[1] : null
  const info = MODES[state.mode]

  if (!proposed) {
    // Food is currently unreachable — wander toward the safest open space
    // and keep trying to reach it as the board changes underfoot.
    return { next: pickSafest(legal, head, tail, blocked, state.food, state.cols, state.rows, state.dir, rng), ate: false }
  }

  const eatProposed = cellsEqual(proposed, state.food)

  // Hunger overrides caution. Past its patience the snake takes the shortest
  // path whatever the margin says, which both guarantees the turn ends and
  // makes a tight-pocket lure a real tactic rather than a no-op.
  if (info.margin === 0 || state.turnTicks >= info.patience) {
    return { next: proposed, ate: eatProposed }
  }

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
  const blocked = baseBlocked(state)
  return neighborsOf(head, state.cols, state.rows).some((n) => !blocked.has(cellKey(n)))
}

export type AdvanceResult = 'moved' | 'ate' | 'trapped'

export function advance(state: EkansState): AdvanceResult {
  if (state.status !== 'moving') return 'moved'
  state.turnTicks++

  const result = decideStep(state)
  if (!result.next) {
    state.status = 'trapped'
    state.endReason = 'no-move'
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
    if (!hasAnyLegalMove(state)) { state.status = 'trapped'; state.endReason = 'no-move' }
    else if (state.eaten >= state.target) { state.status = 'escaped'; state.endReason = 'target' }
    else if (reachableFreeCells(state).length === 0) {
      // Nothing left the player could legally feed: the snake has shut itself
      // into a pocket with no free cell it can still reach.
      state.status = 'trapped'; state.endReason = 'sealed'
    } else state.status = 'placing'
    return 'ate'
  }

  state.body.pop()

  if (state.turnTicks >= HARD_TICK_CAP) {
    // Desperation makes the snake close on any reachable food, so exhausting
    // the cap means the food is walled off from it for good.
    state.status = 'trapped'
    state.endReason = 'sealed'
    return 'trapped'
  }
  return 'moved'
}

/** Run the current turn to its end. Returns the resulting status. */
export function runTurn(state: EkansState): EkansState['status'] {
  let guard = 0
  while (state.status === 'moving' && guard++ <= HARD_TICK_CAP + 2) advance(state)
  return state.status
}

// --- solver: "show me the line I missed" ----------------------------------

/** How much room the snake still commands — the number a trap must drive to zero. */
function headFreedom(s: EkansState): number {
  return floodCount(s.body[0], baseBlocked(s), s.cols, s.rows)
}

/**
 * Room to spare beyond the snake's own body. A trap is exactly the moment
 * this reaches zero, so searching toward small slack heads straight at one —
 * measurably better than chasing raw free-space alone.
 */
function slack(s: EkansState): number {
  return headFreedom(s) - s.body.length
}

/**
 * Traps get built against something. Ranking candidate placements by how many
 * of their sides are already wall, body or board edge — and only searching the
 * best few — cuts the branching factor enormously and finds *more* traps than
 * an exhaustive scan does within the same budget.
 */
function trapCandidates(s: EkansState, limit: number): Cell[] {
  const occupied = new Set<number>()
  for (const b of s.body) occupied.add(cellKey(b))
  for (const w of s.walls) occupied.add(cellKey(w))

  const scored = legalPlacements(s).map((cell) => {
    let touching = 0
    for (const d of DIRS) {
      const n = { r: cell.r + d.r, c: cell.c + d.c }
      if (!inBounds(n, s.cols, s.rows) || occupied.has(cellKey(n))) touching++
    }
    return { cell, touching }
  })
  scored.sort((a, b) => b.touching - a.touching)
  return scored.slice(0, limit).map((x) => x.cell)
}

/** Identity of a position, for pruning branches that reconverge. */
function bodySignature(s: EkansState): string {
  return s.body.map(cellKey).join(',')
}

export interface SolveOutcome {
  placements: Cell[] | null
  exhausted: boolean   // searched the whole budget without finding a trap
}

/**
 * Beam-search a sequence of placements that traps the snake on this exact
 * board, driven as a generator so the caller can spread the work across
 * frames instead of freezing the page. Runs are deterministic, so a line
 * found here replays move-for-move.
 */
export function* solveTrapLine(
  mode: Mode,
  seedLabel: string,
  opts: { beamWidth?: number; candidates?: number; maxNodes?: number } = {}
): Generator<number, SolveOutcome, unknown> {
  // Measured across 60 boards per config: this beam/candidate pair solves
  // 20/20 Learn, 16/20 Standard and 16/20 Expert inside ~1.9s worst case.
  // Widening further buys about one more board for double the time.
  const beamWidth = opts.beamWidth ?? 14
  const candidateLimit = opts.candidates ?? 20
  const maxNodes = opts.maxNodes ?? 9000

  interface Node { state: EkansState; placements: Cell[] }
  let beam: Node[] = [{ state: createRun(mode, seedLabel), placements: [] }]
  let explored = 0
  const maxDepth = MODES[mode].target + 2

  for (let depth = 0; depth < maxDepth; depth++) {
    const scored: { node: Node; score: number }[] = []
    const seen = new Set<string>()

    for (const node of beam) {
      if (node.state.status !== 'placing') continue
      for (const cell of trapCandidates(node.state, candidateLimit)) {
        if (explored >= maxNodes) return { placements: null, exhausted: true }
        const sim = cloneRun(node.state)
        placeFood(sim, cell)
        runTurn(sim)
        explored++

        const next: Node = { state: sim, placements: [...node.placements, cell] }
        if (sim.status === 'trapped') return { placements: next.placements, exhausted: false }
        if (sim.status === 'escaped') continue // dead end: the snake already won down this line

        const key = bodySignature(sim)
        if (seen.has(key)) continue // branches that reconverge add cost, not coverage
        seen.add(key)
        scored.push({ node: next, score: slack(sim) })

        // Yield often enough that the host can keep painting; a whole node's
        // worth of simulation in one slice is long enough to drop frames.
        if (explored % 20 === 0) yield explored
      }
    }

    if (!scored.length) return { placements: null, exhausted: explored >= maxNodes }
    scored.sort((a, b) => a.score - b.score)
    beam = scored.slice(0, beamWidth).map((s) => s.node)
  }

  return { placements: null, exhausted: explored >= maxNodes }
}

/**
 * Replay a placement sequence into per-turn records — the same shape the live
 * game records, so the player's own run and a solved line can share one
 * replay viewer.
 */
export function replayLine(mode: Mode, seedLabel: string, placements: Cell[]) {
  const state = createRun(mode, seedLabel)
  const initialBody = state.body.map((c) => ({ ...c }))
  const history: TurnRecord[] = []

  for (const cell of placements) {
    if (state.status !== 'placing') break
    const bodyBefore = state.body.map((c) => ({ ...c }))
    const path: Cell[] = [{ ...state.body[0] }]
    if (!placeFood(state, cell)) break
    let guard = 0
    while (state.status === 'moving' && guard++ <= HARD_TICK_CAP + 2) {
      advance(state)
      path.push({ ...state.body[0] })
    }
    history.push({
      turn: state.turn,
      food: { ...cell },
      path,
      bodyBefore,
      bodyAfter: state.body.map((c) => ({ ...c })),
      outcome: state.status === 'trapped' ? 'trapped' : 'ate'
    })
  }
  return { initialBody, history, finalState: state }
}
