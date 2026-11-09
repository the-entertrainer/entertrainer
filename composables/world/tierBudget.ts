import type { WorldTier } from './classifyTier'

/**
 * Per-tier budgets. Numbers the design spec states are followed exactly:
 * DPR cap 1 on Tier 1 and 1.5 on Tier 2, triangle caps, post only on Tier 3.
 * The spec does not set a Tier 3 DPR, a particle count, or texture sizes.
 * Tier 3 keeps the 1.5 DPR ceiling. Stars are a point field, not image textures.
 */
export interface TierBudget {
  tier: WorldTier
  dprCap: number
  post: boolean
  fog: boolean
  /** MeshStandard on Tier 2–3. Tier 1 stays unlit. */
  standardMaterials: boolean
  triangleCap: number
  starCount: number
  torusRadial: number
  torusTubular: number
  icoDetail: number
  ringSegments: number
  /** Noise octaves in the beacon shader. 0 omits the noise functions. */
  noiseOctaves: number
  /** Spec: gyro is off on Tier 1, optional from Tier 2 up. */
  gyro: boolean
  /** Positional camera idle. Tier 1 breathes opacity only. */
  idleDrift: boolean
  /** Zone travel. Spec asks for 900–1400ms on Tier 2–3. */
  travelMs: number
  contactDiscs: boolean
}

const STATIC: TierBudget = {
  tier: 0,
  dprCap: 1,
  post: false,
  fog: false,
  standardMaterials: false,
  triangleCap: 0,
  starCount: 0,
  torusRadial: 0,
  torusTubular: 0,
  icoDetail: 0,
  ringSegments: 0,
  noiseOctaves: 0,
  gyro: false,
  idleDrift: false,
  travelMs: 0,
  contactDiscs: false,
}

export function budgetFor(tier: WorldTier): TierBudget {
  if (tier === 0) return STATIC
  if (tier === 1) {
    return {
      tier: 1,
      dprCap: 1,
      post: false,
      fog: false,
      standardMaterials: false,
      triangleCap: 20_000,
      starCount: 48,
      torusRadial: 4,
      torusTubular: 18,
      icoDetail: 0,
      ringSegments: 24,
      noiseOctaves: 0,
      gyro: false,
      idleDrift: false,
      travelMs: 700,
      contactDiscs: false,
    }
  }
  if (tier === 2) {
    return {
      tier: 2,
      dprCap: 1.5,
      post: false,
      fog: true,
      standardMaterials: true,
      triangleCap: 80_000,
      starCount: 160,
      torusRadial: 8,
      torusTubular: 36,
      icoDetail: 1,
      ringSegments: 48,
      noiseOctaves: 2,
      gyro: true,
      idleDrift: true,
      travelMs: 1100,
      contactDiscs: true,
    }
  }
  return {
    tier: 3,
    dprCap: 1.5,
    post: true,
    fog: true,
    standardMaterials: true,
    triangleCap: 80_000,
    starCount: 280,
    torusRadial: 10,
    torusTubular: 48,
    icoDetail: 1,
    ringSegments: 64,
    noiseOctaves: 4,
    gyro: true,
    idleDrift: true,
    travelMs: 1300,
    contactDiscs: true,
  }
}

export function tierLabel(tier: WorldTier): string {
  if (tier === 0) return 'Static'
  if (tier === 1) return 'Lite'
  if (tier === 2) return 'Standard'
  return 'High'
}
