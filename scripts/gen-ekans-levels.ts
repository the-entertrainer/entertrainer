/**
 * Offline level generator for EKANS' campaign mode.
 *
 * Run with: node --experimental-strip-types scripts/gen-ekans-levels.ts
 *
 * For each of the three tiers (learn/standard/expert) this searches random
 * seeds for 13 boards whose *shortest* trap line lands in a rising band of
 * move counts — so level 1 of a tier is a near-immediate trap and level 13
 * genuinely requires a planned multi-move lure. Two things are verified for
 * every accepted seed, not just asserted:
 *
 *   1. No single placement traps the snake on turn one (unless the level's
 *      target really is a 1-move level) — checked exhaustively across every
 *      legal cell, not just the solver's heuristic shortlist. This is the
 *      direct fix for a level being "won" by an accidental first tap.
 *   2. The board solves within the same search budgets the live in-game
 *      hint uses (SOLVE_PASSES in ekans.vue), so "SHOW ME" never fails on a
 *      level a player got stuck on.
 *
 * The output is written straight to utils/ekans/levels.ts.
 */
import {
  type Mode, type EkansState,
  createRun, cloneRun, placeFood, runTurn, legalPlacements,
  solveTrapLine, randomSeedLabel
} from '../utils/ekans/engine.ts'
import { writeFileSync } from 'node:fs'

const TIERS: Mode[] = ['learn', 'standard', 'expert']
const LEVELS_PER_TIER = 13

// Rising move-count bands per tier. [min, max] — the solver's shortest found
// trap for the chosen seed must land inside this window.
const BANDS: Record<Mode, [number, number][]> = {
  learn: [
    [1, 1], [1, 2], [2, 2], [2, 3], [2, 3], [3, 4], [3, 4],
    [4, 5], [4, 5], [5, 6], [5, 6], [6, 7], [6, 8]
  ],
  standard: [
    [2, 2], [2, 3], [3, 3], [3, 4], [4, 5], [4, 5], [5, 6],
    [5, 6], [6, 7], [6, 8], [7, 8], [7, 9], [8, 10]
  ],
  expert: [
    [3, 3], [3, 4], [4, 4], [4, 5], [5, 6], [5, 6], [6, 7],
    [7, 8], [7, 9], [8, 10], [9, 11], [10, 12], [11, 13]
  ]
}

// Exactly the two passes the live "SHOW ME" hint tries, in order — a level
// only ships if one of these actually solves it.
const SOLVE_PASSES = [
  { beamWidth: 14, candidates: 20, maxNodes: 9000 },
  { beamWidth: 30, candidates: 32, maxNodes: 40000 }
]

function solveOnce(mode: Mode, seed: string, cfg: { beamWidth: number; candidates: number; maxNodes: number }) {
  const iter = solveTrapLine(mode, seed, cfg)
  let res = iter.next()
  while (!res.done) res = iter.next()
  return res.value
}

/** Every legal opening placement, simulated to the end of that turn — true, not heuristic. */
function hasImmediateTrap(state: EkansState): boolean {
  for (const cell of legalPlacements(state)) {
    const sim = cloneRun(state)
    placeFood(sim, cell)
    runTurn(sim)
    if (sim.status === 'trapped') return true
  }
  return false
}

interface LevelPick { seed: string; par: number }

function findLevel(mode: Mode, band: [number, number], attempts: number): LevelPick | null {
  const [min, max] = band
  for (let i = 0; i < attempts; i++) {
    const seed = randomSeedLabel() + Math.floor(Math.random() * 36).toString(36)
    const start = createRun(mode, seed)
    if (legalPlacements(start).length < 5) continue // too cramped to be a fair opening

    let par: number | null = null
    for (const cfg of SOLVE_PASSES) {
      const out = solveOnce(mode, seed, cfg)
      if (out.placements) { par = out.placements.length; break }
    }
    if (par == null) continue
    if (par < min || par > max) continue

    // Direct, exhaustive fix for "one tap wins it": only levels whose target
    // par is 1 are allowed to have a one-move trap available.
    const immediate = hasImmediateTrap(start)
    if (immediate && min > 1) continue
    if (!immediate && min === 1 && max === 1) continue

    return { seed, par }
  }
  return null
}

function generateTier(mode: Mode): LevelPick[] {
  const picks: LevelPick[] = []
  for (let i = 0; i < LEVELS_PER_TIER; i++) {
    let band = BANDS[mode][i]
    let found = findLevel(mode, band, 1400)
    let widen = 0
    while (!found && widen < 4) {
      widen++
      const relaxed: [number, number] = [Math.max(1, band[0] - widen), band[1] + widen * 2]
      found = findLevel(mode, relaxed, 1400)
    }
    if (!found) throw new Error(`Could not find a level for ${mode} #${i + 1} (band ${band})`)
    picks.push(found)
    process.stderr.write(`${mode} #${String(i + 1).padStart(2, '0')}: seed=${found.seed} par=${found.par}\n`)
  }
  return picks
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

const WORLD: Record<Mode, { title: string; tagline: string }> = {
  learn: { title: 'The Garden', tagline: 'Where every trap starts as a hedge.' },
  standard: { title: 'The Warehouse', tagline: 'Aisles built tight. Choices built tighter.' },
  expert: { title: 'The Vault', tagline: 'No walls to hide behind — just you and the geometry.' }
}

const results: Record<Mode, LevelPick[]> = {
  learn: generateTier('learn'),
  standard: generateTier('standard'),
  expert: generateTier('expert')
}

function tierBlock(mode: Mode): string {
  const rows = results[mode].map((p, i) => {
    const name = NAMES[mode][i]
    return `    { seed: ${JSON.stringify(p.seed)}, par: ${p.par}, name: ${JSON.stringify(name)} }`
  }).join(',\n')
  return `  ${mode}: {\n    world: ${JSON.stringify(WORLD[mode].title)},\n    tagline: ${JSON.stringify(WORLD[mode].tagline)},\n    levels: [\n${rows}\n    ]\n  }`
}

const out = `/**
 * EKANS campaign levels — generated, not hand-typed.
 *
 * Each level pins a seed whose board (via the same deterministic
 * generateWalls in engine.ts) was verified by scripts/gen-ekans-levels.ts to:
 *
 *   - solve within the exact search budgets the live "SHOW ME" hint uses,
 *     so the hint can never fail on a level a player got stuck on;
 *   - have no one-tap accidental trap unless the level is deliberately a
 *     one-move opener (checked exhaustively across every legal placement,
 *     not just a heuristic shortlist).
 *
 * "par" is the move count of the shortest trap line the generator found —
 * shown to the player as a target to beat, not a hidden implementation
 * detail. Regenerate with: node --experimental-strip-types scripts/gen-ekans-levels.ts
 */
import type { Mode } from './engine'

export interface CampaignLevel {
  seed: string
  par: number
  name: string
}

export interface CampaignTier {
  world: string
  tagline: string
  levels: CampaignLevel[]
}

export const CAMPAIGN: Record<Mode, CampaignTier> = {
${TIERS.map(tierBlock).join(',\n')}
}

export const LEVELS_PER_TIER = ${LEVELS_PER_TIER}
`

writeFileSync(new URL('../utils/ekans/levels.ts', import.meta.url), out)
process.stderr.write('\nWrote utils/ekans/levels.ts\n')
