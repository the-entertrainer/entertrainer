// ============================================================
// DOOMBOX — haptics.
// ============================================================
//
// Goal: a real physical "click" under the finger when a console button is
// pressed. Two platforms, two mechanisms:
//
// • Android / Chrome — the Vibration API. navigator.vibrate(ms) works on a
//   user gesture and gives a crisp tap.
//
// • iOS / Safari — Safari never shipped the Vibration API. The only route to
//   the Taptic Engine from the web is the native <input type="checkbox"
//   switch> control: toggling it fires a system haptic. Apple closed the
//   PROGRAMMATIC version of this (a scripted .click()) in iOS 26.5, but a
//   GENUINE user tap on the switch still fires — because it's a real user
//   gesture, not synthetic. So each console button carries a transparent,
//   hit-testable switch input (see makeHapticSwitch): the finger lands on it
//   directly and iOS buzzes. That is structural, not scripted — nothing to
//   call here for iOS.
//
// This module is the Android side plus a feature probe. It is intentionally
// best-effort: haptics are pure enhancement and must never throw.

export type Buzz = 'tap' | 'fire' | 'hit'

const PATTERN: Record<Buzz, number> = {
  tap: 8, // a button press
  fire: 14, // the neutraliser
  hit: 22 // taking damage
}

let enabled = true

export function setHapticsEnabled(v: boolean) {
  enabled = v
}

/** Android/Chrome path. No-op (silently) where the Vibration API is absent. */
export function vibrate(kind: Buzz = 'tap') {
  if (!enabled) return
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(PATTERN[kind])
    }
  } catch {
    /* haptics are enhancement — never surface an error */
  }
}

/**
 * Build the iOS haptic element for a console button: a native switch input,
 * transparent and stretched to fill the button so the user's tap lands on it
 * directly. Returns the element to place inside the button; callers hide it
 * with the .db-haptic class (opacity 0, NOT display:none — display:none would
 * remove it from hit-testing and kill the haptic).
 */
export function makeHapticSwitch(label: string): HTMLInputElement | null {
  if (typeof document === 'undefined') return null
  const input = document.createElement('input')
  input.type = 'checkbox'
  input.setAttribute('switch', '')
  input.className = 'db-haptic'
  input.tabIndex = -1
  input.setAttribute('aria-label', label)
  return input
}
