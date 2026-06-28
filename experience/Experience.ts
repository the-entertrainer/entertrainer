import { Scene, FogExp2, Vector2, Vector3 } from 'three'
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
import type NavPlane from './NavPlane'

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

  // ── Camera dolly state ─────────────────────────────────────────────────────
  private _dollyActive    = false
  private _dollyElapsed   = 0
  private readonly _DOLLY_DURATION = 800  // ms
  private _dollyTargetPos = new Vector3()
  private _dollyCamStart  = new Vector3()
  private _dollyHref      = ''
  private _dollyMidFired  = false
  private _dollyTmpVec    = new Vector3()
  private _dollyNavItemIndex = 0

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

  startDolly(plane: NavPlane, href: string) {
    if (this._dollyActive) return
    this.controls.locked  = true
    this._dollyActive     = true
    this._dollyElapsed    = 0
    this._dollyMidFired   = false
    this._dollyHref       = href
    this._dollyTargetPos.copy(plane.mesh.position)
    this._dollyCamStart.copy(this.camera.instance.position)
    this._dollyNavItemIndex = plane.index % this.world.currentItemCount
  }

  get lastClickedItemIndex(): number {
    return this._dollyNavItemIndex
  }

  resetCamera() {
    this._dollyActive         = false
    this.controls.locked      = false
    this.camera.instance.position.set(0, 0, 8)
    this.camera.instance.lookAt(0, 0, 0)
  }

  private _onResize() {
    this.camera.resize()
    this.renderer.resize()
    this.postProcessing.resize()
    this.backdrop.resize()
  }

  private _update() {
    if (this._dollyActive) {
      this._dollyElapsed = Math.min(this._dollyElapsed + this.time.delta, this._DOLLY_DURATION)
      const rawT = this._dollyElapsed / this._DOLLY_DURATION
      const t    = rawT * rawT  // ease-in quad — accelerates into the card

      // Move camera toward card, stop 1.4 units before it
      const dir      = this._dollyTmpVec.subVectors(this._dollyTargetPos, this._dollyCamStart).normalize()
      const maxTravel = Math.max(0, this._dollyCamStart.distanceTo(this._dollyTargetPos) - 1.4)
      this.camera.instance.position
        .copy(this._dollyCamStart)
        .addScaledVector(dir, maxTravel * t)
      this.camera.instance.lookAt(this._dollyTargetPos)

      // Midpoint event at 60% — SpiralView fades in the overlay
      if (!this._dollyMidFired && rawT >= 0.6) {
        this._dollyMidFired = true
        this.trigger('dollyMid', [])
      }

      if (rawT >= 1) {
        this._dollyActive    = false
        this.controls.locked = false
        this.trigger('planeClick', [this._dollyHref])
      }
    } else {
      this.controls.update()
    }

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
