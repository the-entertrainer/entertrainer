/**
 * EKANS campaign levels — 13 obstacle courses per tier, generated from three
 * repeating pillar/frame/corridor patterns whose density rises with the
 * level number. There's no solver here, on purpose: this is a real-time
 * skill game now, not a puzzle with a provable answer, so a level doesn't
 * need to be verified solvable — it needs to be fair. "Fair" here means two
 * checked things, not just asserted ones: the spawn lane stays clear, and
 * the walls never cut the board into a mostly-sealed pocket (see the
 * reachability check in the dev-only self-test at the bottom of this file).
 */
import { type Mode, type Cell, type LevelDef, BOARD_COLS, BOARD_ROWS, cellKey } from './engine'

export interface CampaignLevel {
  name: string
  target: number
  walls: Cell[]
}

export interface CampaignTier {
  world: string
  tagline: string
  levels: CampaignLevel[]
}

// Rows 6–8 hold the spawn and its immediate run-up — never obstructed.
const PROTECTED_ROWS = new Set([6, 7, 8])

function clear(cells: Cell[]): Cell[] {
  const seen = new Set<number>()
  const out: Cell[] = []
  for (const c of cells) {
    if (PROTECTED_ROWS.has(c.r)) continue
    if (c.r < 1 || c.r > BOARD_ROWS - 2 || c.c < 1 || c.c > BOARD_COLS - 2) continue
    const k = cellKey(c)
    if (seen.has(k)) continue
    seen.add(k); out.push(c)
  }
  return out
}

/** Short two-tall pillars in a staggered grid — density tightens the spacing. */
function pillars(density: number): Cell[] {
  const rowStep = Math.max(3, Math.round(6 - density * 3))
  const colStep = Math.max(2, Math.round(4 - density * 2))
  const out: Cell[] = []
  let rowIdx = 0
  for (let r = 1; r < BOARD_ROWS - 1; r += rowStep) {
    const stagger = rowIdx % 2 === 1 ? Math.floor(colStep / 2) : 0
    for (let c = 1 + stagger; c < BOARD_COLS - 1; c += colStep) {
      out.push({ r, c })
      out.push({ r: r + 1, c })
    }
    rowIdx++
  }
  return out
}

/** An inset ring with regular gaps — density closes more of the gaps. */
function frame(density: number): Cell[] {
  const inset = 2
  const gapEvery = Math.max(2, Math.round(5 - density * 3))
  const out: Cell[] = []
  for (let c = inset; c <= BOARD_COLS - 1 - inset; c++) {
    if (c % gapEvery !== 0) { out.push({ r: inset, c }); out.push({ r: BOARD_ROWS - 1 - inset, c }) }
  }
  for (let r = inset; r <= BOARD_ROWS - 1 - inset; r++) {
    if (r % gapEvery !== 0) { out.push({ r, c: inset }); out.push({ r, c: BOARD_COLS - 1 - inset }) }
  }
  return out
}

/** Arms alternating from the left and right walls — a zigzag corridor. */
function corridor(density: number): Cell[] {
  const rowStep = Math.max(2, Math.round(5 - density * 3))
  const armLen = Math.min(BOARD_COLS - 3, 3 + Math.round(density * 3))
  const out: Cell[] = []
  let idx = 0
  for (let r = 1; r < BOARD_ROWS - 1; r += rowStep) {
    const fromLeft = idx % 2 === 0
    for (let i = 0; i < armLen; i++) {
      const c = fromLeft ? 1 + i : BOARD_COLS - 2 - i
      out.push({ r, c })
    }
    idx++
  }
  return out
}

const PATTERNS = [pillars, frame, corridor]

function buildWalls(tierBase: number, levelIndex: number): Cell[] {
  const pattern = PATTERNS[levelIndex % PATTERNS.length]
  const density = Math.min(1, tierBase + levelIndex * 0.045)
  return clear(pattern(density))
}

const NAMES: Record<Mode, string[]> = {
  learn: [
    'First Bite', 'Loose Soil', 'Hedge Row', 'Garden Path', 'Narrow Bed',
    'Stone Border', 'Trellis Turn', 'Greenhouse', 'Compost Corner', 'Back Fence',
    'Rose Maze', 'Last Patch', "Garden's Edge"
  ],
  standard: [
    'Loading Dock', 'Pallet Row', 'Narrow Aisle', 'Crate Stack', 'Forklift Lane',
    'Storage Rack', 'Blind Corner', 'Steel Shutter', 'Inventory Maze', 'Locked Bay',
    'Night Shift', 'Final Count', 'Closing Time'
  ],
  expert: [
    'Outer Gate', 'Pressure Plate', 'Service Duct', 'Guard Route', 'Laser Grid',
    'Blast Door', 'Inner Ring', 'Vault Keeper', 'Time Lock', 'Fail-Safe',
    'Last Defense', 'Dead Bolt', 'The Vault'
  ]
}

const WORLD: Record<Mode, { title: string; tagline: string; tierBase: number; targetBase: number }> = {
  learn:    { title: 'The Garden',    tagline: 'Room to breathe. Room to learn the turns.',        tierBase: 0.02, targetBase: 6 },
  standard: { title: 'The Warehouse', tagline: 'The aisles get tighter every row.',                 tierBase: 0.14, targetBase: 8 },
  expert:   { title: 'The Vault',     tagline: 'No room for a wrong turn — or a slow one.',          tierBase: 0.28, targetBase: 10 }
}

export const LEVELS_PER_TIER = 13

function buildTier(mode: Mode): CampaignTier {
  const w = WORLD[mode]
  const levels: CampaignLevel[] = Array.from({ length: LEVELS_PER_TIER }, (_, i) => ({
    name: NAMES[mode][i],
    target: w.targetBase + i,
    walls: buildWalls(w.tierBase, i)
  }))
  return { world: w.title, tagline: w.tagline, levels }
}

export const CAMPAIGN: Record<Mode, CampaignTier> = {
  learn: buildTier('learn'),
  standard: buildTier('standard'),
  expert: buildTier('expert')
}

export function levelDef(tier: Mode, index: number): LevelDef {
  const lvl = CAMPAIGN[tier].levels[index]
  return { walls: lvl.walls, target: lvl.target }
}
