import { PlaneGeometry } from 'three'
import NavPlane from './NavPlane'
import type Experience from './Experience'
import type { NavItem } from '~/types/nav'

export default class World {
  experience: Experience
  geometry: PlaneGeometry
  navPlanes: NavPlane[] = []
  private _destroyed = false

  constructor(experience: Experience) {
    this.experience = experience
    this.geometry = new PlaneGeometry(1, 1, 8, 8)
  }

  setNavItems(items: NavItem[], isDark = true) {
    this.navPlanes.forEach((p) => p.destroy())
    this.navPlanes = []

    // Duplicate ×2 for infinite loop
    const doubled = [...items, ...items]
    doubled.forEach((item, i) => {
      this.navPlanes.push(new NavPlane(this.experience, i, item, doubled.length, this.geometry, isDark))
    })
  }

  updateTheme(isDark: boolean) {
    this.navPlanes.forEach((p) => p.updateTexture(isDark))
  }

  reveal() {
    this.navPlanes.forEach((p, i) => setTimeout(() => p.reveal(), (i % 4) * 50))
  }

  hide() {
    this.navPlanes.forEach((p, i) => setTimeout(() => p.hide(), (i % 4) * 30))
  }

  // Accordion transition: hide → swap items → reveal
  async transitionTo(items: NavItem[]) {
    this.hide()

    await new Promise<void>(r => setTimeout(r, 520))
    if (this._destroyed) return

    this.experience.controls.reset()
    this.setNavItems(items)

    await new Promise<void>(r => setTimeout(r, 80))
    if (this._destroyed) return

    this.reveal()
  }

  update(delta: number) {
    const { wheelDeltaY, scrollOffset } = this.experience.controls
    this.navPlanes.forEach((p) => p.update(delta, scrollOffset, wheelDeltaY))
  }

  destroy() {
    this._destroyed = true
    this.navPlanes.forEach((p) => p.destroy())
    this.geometry.dispose()
  }
}
