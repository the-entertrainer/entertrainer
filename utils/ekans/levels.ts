/**
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
  learn: {
    world: "The Garden",
    tagline: "Where every trap starts as a hedge.",
    levels: [
    { seed: "HUKEJd", par: 1, name: "First Bite" },
    { seed: "NXSH5f", par: 1, name: "Loose Soil" },
    { seed: "Z8UD35", par: 2, name: "Hedge Row" },
    { seed: "YS943l", par: 3, name: "Garden Path" },
    { seed: "ZTQSJ8", par: 3, name: "Narrow Bed" },
    { seed: "VA74Xc", par: 4, name: "Stone Border" },
    { seed: "766XP0", par: 4, name: "Trellis Turn" },
    { seed: "4XNH56", par: 5, name: "Greenhouse" },
    { seed: "24S574", par: 5, name: "Compost Corner" },
    { seed: "2EV7L6", par: 6, name: "Back Fence" },
    { seed: "W8X5Bi", par: 6, name: "Rose Maze" },
    { seed: "942W23", par: 6, name: "Last Patch" },
    { seed: "RVJR3m", par: 6, name: "Garden's Edge" }
    ]
  },
  standard: {
    world: "The Warehouse",
    tagline: "Aisles built tight. Choices built tighter.",
    levels: [
    { seed: "F6AZJc", par: 2, name: "Loading Dock" },
    { seed: "HH8WC8", par: 3, name: "Pallet Row" },
    { seed: "N5MDCd", par: 3, name: "Narrow Aisle" },
    { seed: "545QSy", par: 4, name: "Crate Stack" },
    { seed: "L7C8Wv", par: 5, name: "Forklift Lane" },
    { seed: "THDT9r", par: 5, name: "Storage Rack" },
    { seed: "MGA6Gm", par: 5, name: "Blind Corner" },
    { seed: "J6MLUk", par: 5, name: "Steel Shutter" },
    { seed: "RXFJ34", par: 7, name: "Inventory Maze" },
    { seed: "5EMDAj", par: 6, name: "Locked Bay" },
    { seed: "255MQ4", par: 7, name: "Night Shift" },
    { seed: "GJXD6t", par: 8, name: "Final Count" },
    { seed: "KT5DM5", par: 10, name: "Closing Time" }
    ]
  },
  expert: {
    world: "The Vault",
    tagline: "No walls to hide behind — just you and the geometry.",
    levels: [
    { seed: "HQPVSz", par: 3, name: "Outer Gate" },
    { seed: "AG22Zl", par: 3, name: "Pressure Plate" },
    { seed: "XAZ9Rz", par: 4, name: "Service Duct" },
    { seed: "CETAN1", par: 5, name: "Guard Route" },
    { seed: "EXNGXt", par: 6, name: "Laser Grid" },
    { seed: "68ESGu", par: 6, name: "Blast Door" },
    { seed: "D3HW8x", par: 7, name: "Inner Ring" },
    { seed: "GBE84g", par: 8, name: "Vault Keeper" },
    { seed: "2XGHYb", par: 9, name: "Time Lock" },
    { seed: "D2YAFa", par: 9, name: "Fail-Safe" },
    { seed: "WTXNGw", par: 11, name: "Last Defense" },
    { seed: "PN7JG6", par: 11, name: "Dead Bolt" },
    { seed: "MTNXCc", par: 13, name: "The Vault" }
    ]
  }
}

export const LEVELS_PER_TIER = 13
