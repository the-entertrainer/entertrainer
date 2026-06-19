import type Experience from './Experience'
import SoundEngine from './SoundEngine'

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

type Phase = 'drag' | 'fling' | 'snap' | 'rest' | 'drift'

/**
 * iOS-style spiral input.
 *
 * `scrollOffset` is measured in card units (one card == 1.0), so snapping is just
 * an ease toward `Math.round(scrollOffset)`. While dragging, the spiral tracks the
 * finger 1:1; on release the captured velocity carries with exponential friction
 * (a flick), then it eases to centre the nearest card. After a short rest a gentle
 * idle drift resumes so the spiral still feels alive.
 */
export default class Controls {
  experience: Experience

  scrollOffset = 0.5
  wheelDeltaY = 0 // per-frame change in scrollOffset (consumed by World/NavPlane shaders)
  wheelDirection = 1

  // ── Tunables ──────────────────────────────────────────────────────────────
  private PX_PER_CARD   = 300     // finger pixels to advance one card (larger = less sensitive)
  private WHEEL_PER_CARD = 600    // wheel deltaY pixels to advance one card
  private FRICTION_FRAME = 0.91   // momentum decay per 60fps frame (lower = quicker decay)
  private MAX_V          = 0.002  // max velocity (cards/ms) — keeps distortion minimal
  private SNAP_V         = 0.0004 // below this velocity, momentum hands off to snap
  private FLICK_V        = 0.001  // release velocity that counts as a flick (→ whoosh)
  private SNAP_EASE      = 0.06   // snap ease strength per 60fps frame (lower = slower)
  private IDLE_DELAY     = 600    // ms at rest before the gentle drift resumes
  private IDLE_DRIFT     = 0.00025 // cards/ms — gentle ambient rotation

  private _phase: Phase = 'rest'
  private _velocity = 0          // cards/ms
  private _snapTarget = 0
  private _lastInteraction = 0   // performance.now() of last user input
  private _prevOffset = 0.5
  private _lastFloor = 0

  // touch tracking
  private _isTouching = false
  private _lastTouchY = 0
  private _lastTouchTime = 0

  // wheel whoosh throttle
  private _lastWheelWhoosh = 0

  constructor(experience: Experience) {
    this.experience = experience
    this._phase = 'drift'
    this._lastInteraction = performance.now()
    this._lastFloor = Math.floor(this.scrollOffset)

    this._onWheel = this._onWheel.bind(this)
    this._onTouchStart = this._onTouchStart.bind(this)
    this._onTouchMove = this._onTouchMove.bind(this)
    this._onTouchEnd = this._onTouchEnd.bind(this)

    window.addEventListener('wheel', this._onWheel, { passive: true })
    experience.canvas.addEventListener('touchstart', this._onTouchStart, { passive: false })
    experience.canvas.addEventListener('touchmove', this._onTouchMove, { passive: false })
    experience.canvas.addEventListener('touchend', this._onTouchEnd, { passive: true })
  }

  // ── Wheel: add a velocity impulse ──────────────────────────────────────────
  private _onWheel(event: WheelEvent) {
    const impulse = (event.deltaY / this.WHEEL_PER_CARD) / 16.67 // cards/ms
    this._velocity = clamp(this._velocity + impulse, -this.MAX_V, this.MAX_V)
    this._phase = 'fling'
    this._lastInteraction = performance.now()

    const now = this._lastInteraction
    if (Math.abs(impulse) > this.FLICK_V * 0.5 && now - this._lastWheelWhoosh > 220) {
      this._lastWheelWhoosh = now
      SoundEngine.getInstance()?.onSwipeWhoosh(
        Math.min(1, Math.abs(this._velocity) / this.MAX_V),
        Math.sign(this._velocity) || 1
      )
    }
  }

  // ── Touch: 1:1 finger tracking + velocity capture ──────────────────────────
  private _onTouchStart(event: TouchEvent) {
    event.preventDefault()
    this._isTouching = true
    this._phase = 'drag'
    this._velocity = 0
    this._lastTouchY = event.touches[0].clientY
    this._lastTouchTime = performance.now()
    this._lastInteraction = this._lastTouchTime
  }

  private _onTouchMove(event: TouchEvent) {
    event.preventDefault()
    if (!this._isTouching) return
    const y = event.touches[0].clientY
    const now = performance.now()
    const dt = Math.max(now - this._lastTouchTime, 1)

    // swipe-up (y decreases) → scrollOffset decreases → cards move up
    const dOffset = (y - this._lastTouchY) / this.PX_PER_CARD
    this.scrollOffset += dOffset

    const inst = dOffset / dt // cards/ms
    this._velocity = clamp(this._velocity * 0.7 + inst * 0.3, -this.MAX_V, this.MAX_V)

    this._lastTouchY = y
    this._lastTouchTime = now
    this._lastInteraction = now
  }

  private _onTouchEnd() {
    if (!this._isTouching) return
    this._isTouching = false
    this._lastInteraction = performance.now()

    if (Math.abs(this._velocity) > this.FLICK_V) {
      this._phase = 'fling'
      SoundEngine.getInstance()?.onSwipeWhoosh(
        Math.min(1, Math.abs(this._velocity) / this.MAX_V),
        Math.sign(this._velocity) || 1
      )
    } else {
      this._beginSnap()
    }
  }

  private _beginSnap() {
    this._phase = 'snap'
    this._snapTarget = Math.round(this.scrollOffset)
  }

  // ── Per-frame integration ──────────────────────────────────────────────────
  update() {
    const dt = Math.min(this.experience.time.delta, 64)
    const frames = dt / 16.67
    const now = performance.now()

    switch (this._phase) {
      case 'drag':
        // scrollOffset driven directly by touchmove
        break

      case 'fling': {
        this.scrollOffset += this._velocity * dt
        this._velocity *= Math.pow(this.FRICTION_FRAME, frames)
        if (Math.abs(this._velocity) <= this.SNAP_V) this._beginSnap()
        break
      }

      case 'snap': {
        const ease = 1 - Math.pow(1 - this.SNAP_EASE, frames)
        this.scrollOffset += (this._snapTarget - this.scrollOffset) * ease
        if (Math.abs(this._snapTarget - this.scrollOffset) < 0.0005) {
          this.scrollOffset = this._snapTarget
          this._velocity = 0
          this._phase = 'rest'
          this._lastInteraction = now
        }
        break
      }

      case 'rest':
        if (now - this._lastInteraction > this.IDLE_DELAY) this._phase = 'drift'
        break

      case 'drift':
        this.scrollOffset += this.wheelDirection * this.IDLE_DRIFT * dt
        break
    }

    // Per-frame offset delta — consumed by NavPlane's uScrollSpeed + scroll wind
    this.wheelDeltaY = this.scrollOffset - this._prevOffset
    this._prevOffset = this.scrollOffset

    // Riffle: a soft tick each time a card crosses centre (rate scales with speed)
    const floor = Math.floor(this.scrollOffset)
    if (floor !== this._lastFloor && (this._phase === 'fling' || this._phase === 'drift')) {
      const intensity = Math.min(1, Math.abs(this.wheelDeltaY) / 0.08)
      if (intensity > 0.05) SoundEngine.getInstance()?.onCardTick(intensity)
      this._lastFloor = floor
    } else if (this._phase !== 'fling' && this._phase !== 'drift') {
      this._lastFloor = floor
    }

    SoundEngine.getInstance()?.updateScroll(this.wheelDeltaY)
  }

  reset() {
    this.scrollOffset = 0.5
    this._prevOffset = 0.5
    this._velocity = 0
    this._phase = 'drift'
    this._lastFloor = Math.floor(this.scrollOffset)
    this._lastInteraction = performance.now()
  }

  destroy() {
    window.removeEventListener('wheel', this._onWheel)
    this.experience.canvas.removeEventListener('touchstart', this._onTouchStart)
    this.experience.canvas.removeEventListener('touchmove', this._onTouchMove)
    this.experience.canvas.removeEventListener('touchend', this._onTouchEnd)
  }
}
