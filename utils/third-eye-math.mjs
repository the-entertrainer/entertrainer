/**
 * Third Eye timing.
 * The page may draw the 40 Hz square only when the display can sample it.
 * A 60 Hz screen aliases that square into a slower flicker, which is worse
 * than a steady field. The beat still lives in the two tones either way.
 */

export const BREATH_IN_MS = 4000
export const BREATH_OUT_MS = 6000
export const CYCLES = 12
export const HOLD_CAP_MS = 40000
export const IGNITION_LEFT = 963
export const IGNITION_RIGHT = 1003
export const THETA_LEFT = 100
export const THETA_RIGHT = 106

/** About 95 Hz. Slower than this, do not draw the square. */
export const STROBE_FRAME_MS = 10.5

const CYCLE_MS = BREATH_IN_MS + BREATH_OUT_MS

/**
 * @param {number} elapsedMs monotonic milliseconds since the first inhale
 * @returns {{ index: number, inhale: boolean, done: boolean }}
 */
export function breathPhase(elapsedMs) {
  const total = CYCLE_MS * CYCLES
  if (!(elapsedMs > 0)) {
    return { index: 0, inhale: true, done: false }
  }
  if (elapsedMs >= total) {
    return { index: CYCLES - 1, inhale: false, done: true }
  }
  const index = Math.floor(elapsedMs / CYCLE_MS)
  const within = elapsedMs - index * CYCLE_MS
  return { index, inhale: within < BREATH_IN_MS, done: false }
}

/**
 * Square-wave gate locked to AudioContext.currentTime.
 * On for the first half of each period: (t % (1/hz)) < (1/(2hz)).
 * At 40 Hz that is on when (t % 0.025) < 0.0125.
 *
 * The caller must only use this when the display can sample it
 * (median frame delta <= STROBE_FRAME_MS). Otherwise the light stays steady.
 *
 * IEEE modulo lands 1 % (1/40) just under the period instead of on 0.
 * A remainder that close to the period is the next on-edge.
 *
 * @param {number} audioTimeSec
 * @param {number} [hz]
 * @returns {boolean}
 */
export function strobeOn(audioTimeSec, hz = 40) {
  const period = 1 / hz
  const half = period / 2
  let m = audioTimeSec % period
  if (m < 0) m += period
  if (period - m <= period * 1e-8) m = 0
  return m < half
}

/**
 * @param {number} medianFrameMs
 * @returns {boolean}
 */
export function frameCanSampleStrobe(medianFrameMs) {
  return Number.isFinite(medianFrameMs) && medianFrameMs <= STROBE_FRAME_MS
}
