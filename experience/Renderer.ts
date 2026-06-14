import { WebGLRenderer, NoToneMapping } from 'three'
import type Experience from './Experience'

export default class Renderer {
  experience: Experience
  instance: WebGLRenderer

  constructor(experience: Experience) {
    this.experience = experience

    this.instance = new WebGLRenderer({
      canvas: experience.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false
    })
    this.instance.toneMapping = NoToneMapping
    this.instance.shadowMap.enabled = false
    this.instance.setClearColor(0x0e0f0e, 0)
    this.instance.setPixelRatio(experience.sizes.pixelRatio)
    this.instance.setSize(experience.sizes.width, experience.sizes.height)
  }

  resize() {
    this.instance.setPixelRatio(this.experience.sizes.pixelRatio)
    this.instance.setSize(this.experience.sizes.width, this.experience.sizes.height)
  }

  render() {
    this.instance.render(this.experience.scene, this.experience.camera.instance)
  }

  destroy() {
    this.instance.dispose()
  }
}
