import { Raycaster as ThreeRaycaster, Vector2 } from 'three'
import type Experience from './Experience'

export default class Raycaster {
  experience: Experience
  instance: ThreeRaycaster
  pointer: Vector2
  hasPointer = false

  constructor(experience: Experience) {
    this.experience = experience
    this.instance = new ThreeRaycaster()
    this.pointer = new Vector2(-2, -2)

    this._onPointerMove = this._onPointerMove.bind(this)
    this._onPointerLeave = this._onPointerLeave.bind(this)
    window.addEventListener('pointermove', this._onPointerMove)
    window.addEventListener('pointerleave', this._onPointerLeave)
  }

  private _onPointerMove(event: PointerEvent) {
    this.pointer.x = (event.clientX / this.experience.sizes.width) * 2 - 1
    this.pointer.y = -(event.clientY / this.experience.sizes.height) * 2 + 1
    this.hasPointer = true
  }

  private _onPointerLeave() {
    this.hasPointer = false
    this.pointer.set(-2, -2)
  }

  update() {
    this.instance.setFromCamera(this.pointer, this.experience.camera.instance)
  }

  destroy() {
    window.removeEventListener('pointermove', this._onPointerMove)
    window.removeEventListener('pointerleave', this._onPointerLeave)
  }
}
