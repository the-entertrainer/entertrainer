/**
 * Brainwave tuner math.
 * A binaural beat is the difference between two carriers.
 * Left stays at the carrier. Right is carrier plus the tuned beat.
 * Band names are ordinary labels for ranges, not effects.
 */

export const CARRIER_HZ = 200
export const BEAT_MIN = 0.5
export const BEAT_MAX = 40
export const BEAT_STEP = 0.5
export const DEFAULT_BEAT = 10

/** Exponential ramps in Web Audio throw or glitch at 0. Stay above this. */
export const RAMP_FLOOR = 0.0001

/**
 * Clamp to 0.5–40 Hz and snap to the nearest 0.5.
 * Non-finite input falls back to the default.
 * @param {number} value
 * @returns {number}
 */
export function clampBeat(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return DEFAULT_BEAT
  const snapped = Math.round(n / BEAT_STEP) * BEAT_STEP
  const tidy = Math.round(snapped * 2) / 2
  if (tidy < BEAT_MIN) return BEAT_MIN
  if (tidy > BEAT_MAX) return BEAT_MAX
  return tidy
}

/**
 * @param {number} beat
 * @param {number} [left]
 * @returns {number}
 */
export function rightFrequency(beat, left = CARRIER_HZ) {
  return left + clampBeat(beat)
}

/**
 * delta under 4, theta 4–8, alpha 8–13, beta 13–30, gamma above 30.
 * A shared edge belongs to the higher band, except 30 which is still beta
 * because gamma is only above 30.
 * @param {number} beat
 * @returns {'delta' | 'theta' | 'alpha' | 'beta' | 'gamma'}
 */
export function bandLabel(beat) {
  const hz = clampBeat(beat)
  if (hz < 4) return 'delta'
  if (hz < 8) return 'theta'
  if (hz < 13) return 'alpha'
  if (hz <= 30) return 'beta'
  return 'gamma'
}

/**
 * A ramp target that is never 0.
 * @param {number} value
 * @returns {number}
 */
export function safeRamp(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= RAMP_FLOOR) return RAMP_FLOOR
  return n
}
