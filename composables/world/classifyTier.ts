/**
 * Satya Space tier rules from the revamp design spec (section 10.3).
 * Pure: no DOM, no three.js. The Pinia store fills the signals on the client.
 *
 * Any failed gate lowers the tier. Tier 3 is not the default. It needs a
 * flagship desktop and an explicit "Quality: High" opt-in.
 */

export type WorldTier = 0 | 1 | 2 | 3

export interface TierSignals {
  reducedMotion: boolean
  /** A WebGL or WebGL2 context could be created. */
  webgl: boolean
  saveData: boolean
  /** Unmasked renderer looks like a software rasterizer. */
  softwareGl: boolean
  /** navigator.deviceMemory in GiB, or null when the browser hides it. */
  deviceMemory: number | null
  /** navigator.hardwareConcurrency, or null when it is missing. */
  cores: number | null
  coarsePointer: boolean
  /** min(viewport width, viewport height) in CSS pixels. */
  shortSide: number
  dpr: number
  renderer: string
  vendor: string
  /** User opted into "Quality: High". Never promotes a failed gate. */
  qualityHigh: boolean
}

export interface TierDecision {
  tier: WorldTier
  reason: string
  /** Desktop-class machine. Tier 3 still needs qualityHigh. */
  flagship: boolean
}

/**
 * One probe window.
 * Any tier under 28 fps drops one step (spec §10.3).
 * Tier 3 also drops to Tier 2 when the average is under 50 fps (frame time
 * over 20ms). Tier 2 on the same machine holds 60, so the miss is the post
 * chain, not the software rasterizer. A pinned `?tier=` does not drop.
 */
export function tierAfterProbe(tier: WorldTier, avgFps: number, pinned: boolean): { tier: WorldTier, reason: string | null } {
  if (pinned) return { tier, reason: null }
  if (tier === 3 && avgFps < 50) {
    return {
      tier: 2,
      reason: `tier 3 frame ${(1000 / Math.max(avgFps, 1)).toFixed(1)}ms`,
    }
  }
  if (avgFps < 28 && tier > 0) {
    return { tier: (tier - 1) as WorldTier, reason: `fps probe ${avgFps.toFixed(1)} < 28` }
  }
  return { tier, reason: null }
}

export function parseTierQuery(raw: unknown): WorldTier | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value === 0 || value === '0') return 0
  if (value === 1 || value === '1') return 1
  if (value === 2 || value === '2') return 2
  if (value === 3 || value === '3') return 3
  return null
}

export function isSoftwareRenderer(renderer: string): boolean {
  return /swiftshader|llvmpipe|softpipe|software|microsoft basic render|virgl/i.test(renderer)
}

export function isFlagshipDesktop(signals: Pick<TierSignals, 'coarsePointer' | 'shortSide' | 'cores' | 'deviceMemory'>): boolean {
  return !signals.coarsePointer
    && signals.shortSide >= 900
    && signals.cores !== null
    && signals.cores >= 8
    && (signals.deviceMemory === null || signals.deviceMemory >= 8)
}

/**
 * Detection order matches the spec table: reduced motion, missing WebGL,
 * Save-Data, and software GL are Tier 0. A weak memory or core count is
 * Tier 1. Everything else that can draw is Tier 2 until the visitor asks
 * for high quality on a flagship desktop.
 */
export function classifyTier(signals: TierSignals): TierDecision {
  const flagship = isFlagshipDesktop(signals)

  if (signals.reducedMotion) {
    return { tier: 0, reason: 'prefers-reduced-motion', flagship }
  }
  if (!signals.webgl) {
    return { tier: 0, reason: 'no WebGL', flagship }
  }
  if (signals.saveData) {
    return { tier: 0, reason: 'Save-Data', flagship }
  }
  if (signals.softwareGl) {
    return { tier: 0, reason: 'software GL', flagship }
  }

  const lite: string[] = []
  if (signals.deviceMemory !== null && signals.deviceMemory <= 4) lite.push('deviceMemory<=4')
  if (signals.cores !== null && signals.cores <= 4) lite.push('hwConcurrency<=4')
  if (lite.length) {
    return { tier: 1, reason: lite.join(', '), flagship }
  }

  if (flagship && signals.qualityHigh) {
    return { tier: 3, reason: 'flagship + Quality: High', flagship }
  }

  return { tier: 2, reason: 'default', flagship }
}
