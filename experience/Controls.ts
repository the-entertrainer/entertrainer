import type Experience from './Experience'

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export default class Controls {
  experience: Experience
  easing = 0.1
  minWheelSpeed = 0.002
  wheelDirection = 1
  scrollOffset = 0

  wheelDeltaY = 0
  targetWheelDeltaY = 0

  private _touchStartY = 0
  private _lastTouchY = 0
  private _lastTouchTime = 0
  private _isTouching = false

  constructor(experience: Experience) {
    this.experience = experience

    this._onWheel = this._onWheel.bind(this)
    this._onTouchStart = this._onTouchStart.bind(this)
    this._onTouchMove = this._onTouchMove.bind(this)
    this._onTouchEnd = this._onTouchEnd.bind(this)

    window.addEventListener('wheel', this._onWheel, { passive: true })
    // Non-passive so we can prevent browser scroll/bounce on the canvas
    experience.canvas.addEventListener('touchstart', this._onTouchStart, { passive: false })
    experience.canvas.addEventListener('touchmove', this._onTouchMove, { passive: false })
    experience.canvas.addEventListener('touchend', this._onTouchEnd, { passive: true })
  }

  private _onWheel(event: WheelEvent) {
    this.targetWheelDeltaY += event.deltaY * 0.000015
    this.targetWheelDeltaY = clamp(this.targetWheelDeltaY, -2, 2)
  }

  private _onTouchStart(event: TouchEvent) {
    event.preventDefault()
    this._isTouching = true
    this._touchStartY = event.touches[0].clientY
    this._lastTouchY = this._touchStartY
    this._lastTouchTime = performance.now()
  }

  private _onTouchMove(event: TouchEvent) {
    event.preventDefault()
    if (!this._isTouching) return
    const y = event.touches[0].clientY
    const delta = this._lastTouchY - y
    this._lastTouchY = y
    this._lastTouchTime = performance.now()
    this.targetWheelDeltaY += delta * 0.00009
    this.targetWheelDeltaY = clamp(this.targetWheelDeltaY, -2, 2)
  }

  private _onTouchEnd() {
    this._isTouching = false
  }

  update() {
    // Lerp wheel speed toward target
    this.wheelDeltaY += (this.targetWheelDeltaY - this.wheelDeltaY) * this.easing
    this.scrollOffset += this.wheelDeltaY

    // Decay target
    this.targetWheelDeltaY *= 0.9

    // Enforce minimum auto-rotation speed
    if (Math.abs(this.targetWheelDeltaY) < this.minWheelSpeed) {
      this.targetWheelDeltaY = this.wheelDirection * this.minWheelSpeed
    }
  }

  destroy() {
    window.removeEventListener('wheel', this._onWheel)
    this.experience.canvas.removeEventListener('touchstart', this._onTouchStart)
    this.experience.canvas.removeEventListener('touchmove', this._onTouchMove)
    this.experience.canvas.removeEventListener('touchend', this._onTouchEnd)
  }
}
