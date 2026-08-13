/**
 * Boop.
 *
 * A hover effect that finishes what it started. The usual pattern is a
 * transform held for as long as the pointer is over the element — the arrow
 * stays nudged until you leave. A boop applies the transform on hover and then
 * takes it away on a timer, so the element springs, returns, and sits still
 * even while you keep hovering. Josh Comeau's name for it, and his argument
 * for it is right: a held transform reads as a state, a boop reads as a
 * reaction, and a reaction has character.
 *
 * It matters most on things that point somewhere. The deck's Prev/Next arrows
 * nudge in the direction they would take you, which is a tiny piece of
 * teaching: the control demonstrates its own outcome before you commit to it.
 *
 * Two rules taken from the same source and worth restating:
 *  - it fires on direct user action only, never on its own timer, and
 *  - it does not repeat while the pointer sits still, because a thing that
 *    keeps twitching stops being charming within about four seconds.
 *
 * Under `prefers-reduced-motion` this returns a no-op. A boop is pure
 * decoration — there is no information in it to preserve.
 */
export interface BoopOptions {
  /** Pixels along x. Negative is left. */
  x?: number
  /** Pixels along y. Negative is up. */
  y?: number
  /** Degrees. */
  rotate?: number
  /** Multiplier, 1 is unchanged. */
  scale?: number
  /** How long the transform is held before it is taken away, in ms. */
  timing?: number
}

export function useBoop(opts: BoopOptions = {}) {
  const { x = 0, y = 0, rotate = 0, scale = 1, timing = 200 } = opts
  const booped = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  const reduce = import.meta.client &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

  function boop() {
    if (reduce || booped.value) return   // no re-trigger mid-boop
    booped.value = true
    clearTimeout(timer)
    timer = setTimeout(() => { booped.value = false }, timing)
  }

  /** Bind to the element that should move. */
  const style = computed(() => ({
    transform: booped.value
      ? `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`
      : 'translate(0px, 0px) rotate(0deg) scale(1)',
    // Springy on the way out, brisk on the way in — the return is the part you
    // actually watch, so it gets the more interesting curve.
    transition: booped.value
      ? `transform ${Math.round(timing * 0.45)}ms var(--ease-out)`
      : `transform 480ms var(--ease-spring)`
  }))

  onBeforeUnmount(() => clearTimeout(timer))

  return { boop, booped, style }
}
