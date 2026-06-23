import { Scene, FogExp2, Vector2 } from 'three'
import EventEmitter from './EventEmitter'
import Sizes from './Sizes'
import Time from './Time'
import Camera from './Camera'
import Renderer from './Renderer'
import PostProcessing from './PostProcessing'
import Controls from './Controls'
import World from './World'
import Raycaster from './Raycaster'
import Backdrop from './Backdrop'

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
  backdrop: Backdrop

  private static _instance: Experience | null = null
  private _parallaxTarget = new Vector2(0, 0)
  private _onPointerMove = (e: PointerEvent) => {
    this._parallaxTarget.set(
      (e.clientX / this.sizes.width) * 2 - 1,
      (e.clientY / this.sizes.height) * 2 - 1
    )
  }

  constructor(canvas: HTMLCanvasElement) {
    super()
    if (Experience._instance) return Experience._instance
    Experience._instance = this

    this.canvas       = canvas
    this.scene        = new Scene()
    this.scene.fog    = new FogExp2(0x0D0C0A, 0.0)
    this.sizes        = new Sizes()
    this.time         = new Time()
    this.camera       = new Camera(this)
    this.renderer     = new Renderer(this)
    this.postProcessing = new PostProcessing(this)
    this.controls     = new Controls(this)
    this.world        = new World(this)
    this.raycaster    = new Raycaster(this)
    this.backdrop     = new Backdrop(this)

    this.sizes.on('resize', () => this._onResize())
    this.time.on('tick', () => this._update())
    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', this._onPointerMove, { passive: true })
    }
  }

  private _onResize() {
    this.camera.resize()
    this.renderer.resize()
    this.postProcessing.resize()
    this.backdrop.resize()
  }

  private _update() {
    this.controls.update()
    this.world.update(this.time.delta)
    this.backdrop.update(this.time.elapsed, this._parallaxTarget, this.controls.wheelDeltaY)
    this.postProcessing.render()
  }

  setFogColor(hex: number) {
    if (this.scene.fog) (this.scene.fog as FogExp2).color.set(hex)
    this.renderer.setClearColor(hex)
    this.postProcessing.setVignetteColor(hex)
  }

  setBackdrop(isDark: boolean) {
    this.backdrop.setTheme(isDark)
  }

  setTheme(isDark: boolean) {
    this.setFogColor(isDark ? 0x0D0C0A : 0xF4F1EC)
    this.world.updateTheme(isDark)
    this.postProcessing.setColorGrade(isDark)
    this.backdrop.setTheme(isDark)
  }

  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointermove', this._onPointerMove)
    }
    this.sizes.destroy()
    this.time.destroy()
    this.controls.destroy()
    this.world.destroy()
    this.raycaster.destroy()
    this.renderer.destroy()
    this.postProcessing.destroy()
    this.backdrop.destroy()
    this.scene.clear()
    Experience._instance = null
  }
}
