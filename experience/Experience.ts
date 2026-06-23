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
  private _backdropImg: HTMLImageElement | null = null
  private _backdropSrc = ''
  private _backdropDark = true

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

    this.sizes.on('resize', () => this._onResize())
    this.time.on('tick', () => this._update())
  }

  private _onResize() {
    this.camera.resize()
    this.renderer.resize()
    this.postProcessing.resize()
    // re-pick / re-bake the backdrop so it tracks portrait↔landscape and never stretches
    if (this.scene.background) this.setBackdrop(this._backdropDark)
  }

  private _update() {
    this.controls.update()
    this.world.update(this.time.delta)
    SoundEngine.getInstance()?.setListenerFromCamera(this.camera.instance)
    this.postProcessing.tick(this.time.delta)
    this.postProcessing.render()
  }

  setFogColor(hex: number) {
    if (this.scene.fog) (this.scene.fog as FogExp2).color.set(hex)
    this.renderer.setClearColor(hex)
    this.postProcessing.setVignetteColor(hex)
  }

  // Picks the workshop backdrop for the current theme + viewport orientation
  // (9:16 portrait on phones, 16:9 landscape on wide screens) and bakes it into
  // a blurred, cover-fit CanvasTexture used as scene.background.
  setBackdrop(isDark: boolean) {
    this._backdropDark = isDark
    const landscape = this.sizes.width >= this.sizes.height
    const src = `/backdrop-${isDark ? 'dark' : 'light'}-${landscape ? 'landscape' : 'portrait'}.png`

    // same image already loaded → just re-bake at the new viewport size
    if (src === this._backdropSrc && this._backdropImg?.complete) {
      this._bakeBackdrop(this._backdropImg)
      return
    }
    this._backdropSrc = src

    const img = new Image()
    const ready = () => {
      if (this._backdropSrc !== src) return // theme/orientation changed mid-load
      this._backdropImg = img
      this._bakeBackdrop(img)
    }
    img.onload = ready
    img.src = src
    if (img.complete && img.naturalWidth > 0) ready()
  }

  private _bakeBackdrop(img: HTMLImageElement) {
    // canvas matches the viewport aspect so the background never stretches;
    // capped on the longest side to keep texture memory sane
    const cap = 1600
    let cw = this.sizes.width
    let ch = this.sizes.height
    const longest = Math.max(cw, ch)
    if (longest > cap) { const k = cap / longest; cw *= k; ch *= k }
    cw = Math.max(2, Math.round(cw))
    ch = Math.max(2, Math.round(ch))

    const c = document.createElement('canvas')
    c.width = cw; c.height = ch
    const ctx = c.getContext('2d')!

    // cover-fit (like CSS background-size: cover) with a small bleed so the
    // blur falloff lands outside the canvas instead of leaving dark edges
    const bleed = 1.06
    const ir = img.naturalWidth / img.naturalHeight
    const cr = cw / ch
    let dw: number, dh: number
    if (ir > cr) { dh = ch * bleed; dw = dh * ir }
    else         { dw = cw * bleed; dh = dw / ir }
    ctx.filter = 'blur(12px)'
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
    ctx.filter = 'none'

    this._backdropTex?.dispose()
    this._backdropTex = new CanvasTexture(c)
    this.scene.background = this._backdropTex
  }

  setTheme(isDark: boolean) {
    this.setFogColor(isDark ? 0x0D0C0A : 0xF4F1EC)
    this.world.updateTheme(isDark)
    this.postProcessing.setColorGrade(isDark)
    this.postProcessing.setLightRays(!isDark)
    this.setBackdrop(isDark)
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
