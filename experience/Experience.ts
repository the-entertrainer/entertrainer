import { Scene, FogExp2 } from 'three'
import EventEmitter from './EventEmitter'
import Sizes from './Sizes'
import Time from './Time'
import Camera from './Camera'
import Renderer from './Renderer'
import PostProcessing from './PostProcessing'
import Controls from './Controls'
import World from './World'
import Raycaster from './Raycaster'

export default class Experience extends EventEmitter {
  canvas: HTMLCanvasElement
  scene: Scene
  sizes: Sizes
  time: Time
  camera: Camera
  renderer: Renderer
  postProcessing: PostProcessing
  controls: Controls
  world: World
  raycaster: Raycaster

  private static _instance: Experience | null = null

  constructor(canvas: HTMLCanvasElement) {
    super()
    if (Experience._instance) return Experience._instance
    Experience._instance = this

    this.canvas       = canvas
    this.scene        = new Scene()
    this.scene.fog    = new FogExp2(0x0D0C0A, 0.06)
    this.sizes        = new Sizes()
    this.time         = new Time()
    this.camera       = new Camera(this)
    this.renderer     = new Renderer(this)
    this.postProcessing = new PostProcessing(this)
    this.controls     = new Controls(this)
    this.world        = new World(this)
    this.raycaster    = new Raycaster(this)

    this.sizes.on('resize', () => this._onResize())
    this.time.on('tick', () => this._update())
  }

  private _onResize() {
    this.camera.resize()
    this.renderer.resize()
    this.postProcessing.resize()
  }

  private _update() {
    this.controls.update()
    this.world.update(this.time.delta)
    this.postProcessing.render()
  }

  setFogColor(hex: number) {
    if (this.scene.fog) (this.scene.fog as FogExp2).color.set(hex)
    this.renderer.setClearColor(hex)
    this.postProcessing.setVignetteColor(hex)
  }

  setTheme(isDark: boolean) {
    this.setFogColor(isDark ? 0x0D0C0A : 0xF4F1EC)
    this.world.updateTheme(isDark)
  }

  setDofFocus(distance: number) {
    this.postProcessing.setDofFocus(distance)
  }

  destroy() {
    this.sizes.destroy()
    this.time.destroy()
    this.controls.destroy()
    this.world.destroy()
    this.raycaster.destroy()
    this.renderer.destroy()
    this.postProcessing.destroy()
    this.scene.clear()
    Experience._instance = null
  }
}
