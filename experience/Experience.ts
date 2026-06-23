import { Scene, FogExp2, CanvasTexture } from 'three'
import EventEmitter from './EventEmitter'
import Sizes from './Sizes'
import Time from './Time'
import Camera from './Camera'
import Renderer from './Renderer'
import PostProcessing from './PostProcessing'
import Controls from './Controls'
import World from './World'
import Raycaster from './Raycaster'
import SoundEngine from './SoundEngine'

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
  private _backdropTex: CanvasTexture | null = null

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
    SoundEngine.getInstance()?.setListenerFromCamera(this.camera.instance)
    this.postProcessing.render()
  }

  setFogColor(hex: number) {
    if (this.scene.fog) (this.scene.fog as FogExp2).color.set(hex)
    this.renderer.setClearColor(hex)
    this.postProcessing.setVignetteColor(hex)
  }

  setBackdrop(src: string | null) {
    if (!src) {
      this.scene.background = null
      this._backdropTex?.dispose()
      this._backdropTex = null
      return
    }
    const img = new Image()
    const apply = () => {
      // Bake a cream wash into the texture so the image reads ambient, not dominant
      const W = 720, H = 1280
      const c = document.createElement('canvas')
      c.width = W; c.height = H
      const ctx = c.getContext('2d')!
      ctx.drawImage(img, 0, 0, W, H)
      ctx.fillStyle = 'rgba(244,241,236,0.58)'
      ctx.fillRect(0, 0, W, H)
      this._backdropTex?.dispose()
      this._backdropTex = new CanvasTexture(c)
      this.scene.background = this._backdropTex
    }
    img.onload = apply
    img.src = src
    if (img.complete && img.naturalWidth > 0) apply()
  }

  setTheme(isDark: boolean) {
    this.setFogColor(isDark ? 0x0D0C0A : 0xF4F1EC)
    this.world.updateTheme(isDark)
    this.postProcessing.setColorGrade(isDark)
    this.setBackdrop(isDark ? null : '/backdrop-light.png')
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
    // NOTE: SoundEngine is a persistent singleton — it must survive Experience
    // teardown (list-mode toggle, section change, navigation). Do NOT destroy it
    // here, or the AudioContext closes and audio dies until the next gesture.
    this._backdropTex?.dispose()
    this._backdropTex = null
    Experience._instance = null
  }
}
