import { Raycaster as ThreeRaycaster, Vector2 } from 'three'
import type Experience from './Experience'
import type NavPlane from './NavPlane'
import SoundEngine from './SoundEngine'

export default class Raycaster {
  experience: Experience
  instance: ThreeRaycaster
  pointer: Vector2 = new Vector2(-999, -999)
  hoveredPlane: NavPlane | null = null

  private _touchStartX = 0
  private _touchStartY = 0
  private _lastTouchEndMs = 0

  constructor(experience: Experience) {
    this.experience = experience
    this.instance = new ThreeRaycaster()

    this._onMouseMove = this._onMouseMove.bind(this)
    this._onClick     = this._onClick.bind(this)
    this._onTouchStart = this._onTouchStart.bind(this)
    this._onTouchEnd   = this._onTouchEnd.bind(this)

    window.addEventListener('mousemove', this._onMouseMove)
    experience.canvas.addEventListener('click', this._onClick)
    experience.canvas.addEventListener('touchstart', this._onTouchStart, { passive: true })
    experience.canvas.addEventListener('touchend', this._onTouchEnd, { passive: true })
  }

  private _toNDC(clientX: number, clientY: number) {
    return new Vector2(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1
    )
  }

  private _intersect() {
    this.instance.setFromCamera(this.pointer, this.experience.camera.instance)
    const meshes = this.experience.world.navPlanes.map((p) => p.mesh)
    const hits = this.instance.intersectObjects(meshes, false)
    if (!hits.length) return null
    return this.experience.world.navPlanes.find((p) => p.mesh === hits[0].object) ?? null
  }

  private _updateHover() {
    const hit = this._intersect()
    this.experience.world.navPlanes.forEach((p) => p.setHovered(p === hit))
    if (hit !== this.hoveredPlane) {
      this.hoveredPlane = hit
      this.experience.trigger('hoverChange', [hit?.navItem ?? null])
      document.body.style.cursor = hit ? 'pointer' : ''
      SoundEngine.getInstance()?.onHoverChange(hit?.index ?? null, hit ? hit.mesh.position : null)
    }
  }

  private _onMouseMove(e: MouseEvent) {
    this.pointer = this._toNDC(e.clientX, e.clientY)
    this._updateHover()
  }

  private _onClick() {
    if (Date.now() - this._lastTouchEndMs < 500) return
    const hit = this._intersect()
    if (hit) {
      this.experience.trigger('planeClick', [hit.navItem.href])
      SoundEngine.getInstance()?.onCardClick(hit.mesh.position)
    }
  }

  private _onTouchStart(e: TouchEvent) {
    this._touchStartX = e.touches[0].clientX
    this._touchStartY = e.touches[0].clientY
  }

  private _onTouchEnd(e: TouchEvent) {
    const t = e.changedTouches[0]
    const dx = t.clientX - this._touchStartX
    const dy = t.clientY - this._touchStartY
    // Treat as tap only if movement was < 12px (not a swipe)
    if (dx * dx + dy * dy > 144) return

    this.pointer = this._toNDC(t.clientX, t.clientY)
    const hit = this._intersect()
    this.pointer = new Vector2(-999, -999)
    if (hit) {
      this._lastTouchEndMs = Date.now()
      this.experience.trigger('planeClick', [hit.navItem.href])
      SoundEngine.getInstance()?.onCardClick(hit.mesh.position)
    }
  }

  destroy() {
    window.removeEventListener('mousemove', this._onMouseMove)
    this.experience.canvas.removeEventListener('click', this._onClick)
    this.experience.canvas.removeEventListener('touchstart', this._onTouchStart)
    this.experience.canvas.removeEventListener('touchend', this._onTouchEnd)
    document.body.style.cursor = ''
  }
}
