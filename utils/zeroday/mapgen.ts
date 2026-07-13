// ============================================================
// ZERO DAY — procedural level generator.
// ============================================================
//
// Levels are built from chunk templates stitched left→right, never
// hand-authored (the Contra reference used TMX files; this is the upgrade).
// The "advanced logic" is in the guarantees:
//   • Reachability — gaps never exceed the jump distance, ground steps are at
//     most one tile, and floating platforms are placed inside the player's
//     jump arc, so every level is always completable.
//   • Pacing — a hard chunk (gap / platforms / arena) is never followed by
//     another hard chunk; there is always a breather. Difficulty ramps: the
//     weighting shifts toward hazards and denser enemies as you progress.
//   • Biomes — the first half is the subway (area 1), the second the rooftops
//     (area 2), each with its own art.
// Seeded so a run is reproducible.

export const TILE = 16
export const ROWS = 17 // logical rows (RH / TILE)

export type EnemyType = 'ar' | 'rpg' | 'sniper'
export type PickupType = 'patch' | 'firewall' | 'twofa'

export interface Spawn {
  x: number
  y: number
} // px; y = ground surface (feet rest here)
export interface EnemySpawn extends Spawn {
  type: EnemyType
}
export interface PickupSpawn extends Spawn {
  type: PickupType
}

export interface Level {
  cols: number
  rows: number
  solid: Uint8Array // 1 = solid
  enemies: EnemySpawn[]
  pickups: PickupSpawn[]
  biomeSplitCol: number
  exitX: number
  widthPx: number
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const MIN_GROUND = 11 // highest ground row (smaller = higher)
const MAX_GROUND = 14 // lowest ground row

export function generateLevel(seed = (Math.random() * 1e9) | 0, cols = 170): Level {
  const rng = mulberry32(seed)
  const rint = (a: number, b: number) => a + Math.floor(rng() * (b - a + 1))
  const solid = new Uint8Array(cols * ROWS)
  const enemies: EnemySpawn[] = []
  const pickups: PickupSpawn[] = []

  const fillCol = (c: number, gRow: number) => {
    for (let r = gRow; r < ROWS; r++) solid[r * cols + c] = 1
  }
  const platform = (c0: number, len: number, row: number) => {
    for (let c = c0; c < c0 + len && c < cols; c++) solid[row * cols + c] = 1
  }
  const enemyAt = (c: number, gRow: number, type: EnemyType) =>
    enemies.push({ x: c * TILE + TILE / 2, y: gRow * TILE, type })
  const pickupAt = (c: number, row: number, type: PickupType) =>
    pickups.push({ x: c * TILE + TILE / 2, y: row * TILE })

  let col = 0
  let gRow = MAX_GROUND
  let lastHard = false

  // safe on-ramp
  for (; col < 12; col++) fillCol(col, gRow)

  const biomeSplitCol = Math.floor(cols * 0.5)

  while (col < cols - 14) {
    const progress = col / cols
    const canHard = !lastHard
    const r = rng()
    let hard = false

    if (canHard && r < 0.22 + progress * 0.15) {
      // GAP — jumpable pit (<= 4 tiles)
      const w = rint(2, Math.min(4, 2 + Math.floor(progress * 3)))
      col += w
      // a floating platform sometimes bridges the gap for a pickup
      if (rng() < 0.4) {
        const prow = gRow - rint(3, 4)
        platform(col - w, w + 1, prow)
        if (rng() < 0.6) pickupAt(col - w + ((w / 2) | 0), prow - 1, pickChoice(rng))
      }
      hard = true
    } else if (canHard && r < 0.42 + progress * 0.15) {
      // PLATFORMS — floating steps above ground, reachable in one jump each
      const runLen = rint(6, 9)
      for (let i = 0; i < runLen; i++) fillCol(col + i, gRow)
      const count = rint(2, 3)
      for (let k = 0; k < count; k++) {
        const prow = gRow - rint(3, 5)
        const pc = col + 1 + k * 2 + rint(0, 1)
        platform(pc, rint(2, 3), prow)
        if (rng() < 0.5) enemyAt(pc, prow, enemyChoice(rng, progress))
        else if (rng() < 0.5) pickupAt(pc, prow - 1, pickChoice(rng))
      }
      col += runLen
      hard = true
    } else if (canHard && r < 0.58 + progress * 0.2) {
      // ARENA — flat killbox with several enemies
      const len = rint(9, 13)
      for (let i = 0; i < len; i++) fillCol(col + i, gRow)
      const count = 1 + Math.floor(progress * 3) + rint(0, 1)
      for (let k = 0; k < count; k++) enemyAt(col + 2 + k * 3, gRow, enemyChoice(rng, progress))
      if (rng() < 0.4) pickupAt(col + (len >> 1), gRow - 3, pickChoice(rng))
      col += len
      hard = true
    } else {
      // BREATHER — flat or a single one-tile step, at most one soft enemy
      const len = rint(5, 9)
      if (rng() < 0.5) gRow = Math.max(MIN_GROUND, Math.min(MAX_GROUND, gRow + (rng() < 0.5 ? -1 : 1)))
      for (let i = 0; i < len; i++) fillCol(col + i, gRow)
      if (!lastHard && rng() < 0.35 + progress * 0.2) enemyAt(col + (len >> 1), gRow, 'ar')
      col += len
    }
    lastHard = hard
  }

  // extraction pad
  for (; col < cols; col++) fillCol(col, gRow)
  const exitX = (cols - 6) * TILE

  return { cols, rows: ROWS, solid, enemies, pickups, biomeSplitCol, exitX, widthPx: cols * TILE }
}

function enemyChoice(rng: () => number, progress: number): EnemyType {
  const r = rng()
  if (r < 0.6 - progress * 0.2) return 'ar'
  if (r < 0.85) return 'sniper'
  return 'rpg'
}
function pickChoice(rng: () => number): PickupType {
  const r = rng()
  return r < 0.55 ? 'patch' : r < 0.8 ? 'firewall' : 'twofa'
}
