import { Scene } from 'three'
import Sizes from './Sizes'
import Time from './Time'
import Camera from './Camera'
import Renderer from './Renderer'
import PostProcessing from './PostProcessing'
import Controls from './Controls'
import Raycaster from './Raycaster'
import World from './World'
import type { Project } from '~/stores/content'

export default class Experience {
  canvas: HTMLCanvasElement
  scene: Scene
  sizes: Sizes
  time: Time
  camera: Camera
  renderer: Renderer
  postProcessing: PostProcessing
  controls: Controls
  raycaster: Raycaster
  world: World

  private static _instance: Experience | null = null

  constructor(canvas: HTMLCanvasElement) {
    if (Experience._instance) {
      return Experience._instance
    }

    Experience._instance = this
    this.canvas = canvas

    // Order: Controls → Time → Sizes → Scene → Camera → Raycaster → Renderer → PostProcessing → World
    this.sizes = new Sizes()
    this.scene = new Scene()
    this.controls = new Controls(this)
    this.time = new Time()
    this.camera = new Camera(this)
    this.raycaster = new Raycaster(this)
    this.renderer = new Renderer(this)
    this.postProcessing = new PostProcessing(this)
    this.world = new World(this)

    this.sizes.on('resize', () => this._onResize())
    this.time.on('tick', () => this._update())
  }

  static get instance(): Experience | null {
    return Experience._instance
  }

  setProjects(projects: Project[]) {
    this.world.setProjects(projects)
  }

  private _onResize() {
    this.camera.resize()
    this.renderer.resize()
    this.postProcessing.resize()
  }

  private _update() {
    this.controls.update()
    this.raycaster.update()
    this.world.update(this.time.delta)
    // Post-processing composer drives the final render
    this.postProcessing.render()
  }

  destroy() {
    this.sizes.destroy()
    this.time.destroy()
    this.controls.destroy()
    this.raycaster.destroy()
    this.world.destroy()
    this.renderer.destroy()
    this.postProcessing.destroy()
    this.scene.clear()
    Experience._instance = null
  }
}
