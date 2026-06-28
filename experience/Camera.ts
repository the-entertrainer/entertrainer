import { PerspectiveCamera } from 'three'
import type Experience from './Experience'

export default class Camera {
  experience: Experience
  instance: PerspectiveCamera

  constructor(experience: Experience) {
    this.experience = experience
    const { width, height } = this.experience.sizes

    this.instance = new PerspectiveCamera(
      width < 420 ? 52 : width < 900 ? 45 : 35,
      width / height,
      0.1,
      100
    )
    this.instance.position.set(0, 0, 8)
    this.experience.scene.add(this.instance)
  }

  resize() {
    const { width, height } = this.experience.sizes
    this.instance.fov = width < 420 ? 52 : width < 900 ? 45 : 35
    this.instance.aspect = width / height
    this.instance.updateProjectionMatrix()
  }
}
