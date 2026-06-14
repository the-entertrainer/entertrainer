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
  private _isTouching = false

  constructor(experience: Experience) {
    this.experience = experience

    this._onWheel = this._onWheel.bind(this)
    this._onTouchStart = this._onTouchStart.bind(this)
    this._onTouchMove = this._onTouchMove.bind(this)
    this._onTouchEnd = this._onTouchEnd.bind(this)

    window.addEventListener('wheel', this._onWheel, { passive: true })
    window.addEventListener('touchstart', this._onTouchStart, { passive: true })
    window.addEventListener('touchmove', this._onTouchMove, { passive: true })
    window.addEventListener('touchend', this._onTouchEnd, { passive: true })
  }

  private _onWheel(event: WheelEvent) {
    this.targetWheelDeltaY += event.deltaY * 0.000015
    this.targetWheelDeltaY = clamp(this.targetWheelDeltaY, -2, 2)
  }

  private _onTouchStart(event: TouchEvent) {
    this._isTouching = true
    this._touchStartY = event.touches[0].clientY
  }

  private _onTouchMove(event: TouchEvent) {
    if (!this._isTouching) return
    const y = event.touches[0].clientY
    const delta = this._touchStartY - y
    this._touchStartY = y
    this.targetWheelDeltaY += delta * 0.00006
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
    window.removeEventListener('touchstart', this._onTouchStart)
    window.removeEventListener('touchmove', this._onTouchMove)
    window.removeEventListener('touchend', this._onTouchEnd)
  }
}
