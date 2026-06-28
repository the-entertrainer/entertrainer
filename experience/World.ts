import { PlaneGeometry } from 'three'
import NavPlane from './NavPlane'
import Particles from './Particles'
import type Experience from './Experience'
import type { NavItem } from '~/types/nav'

export default class World {
  experience: Experience
  geometry: PlaneGeometry
  navPlanes: NavPlane[] = []
  particles: Particles
  private _destroyed = false
  private _currentItems: NavItem[] = []
  private _isDark = true

  constructor(experience: Experience) {
    this.experience = experience
    this.geometry = new PlaneGeometry(1, 1, 8, 8)
    this.particles = new Particles(experience)
  }

  get currentItemCount(): number {
    return this._currentItems.length * 2
  }

  setNavItems(items: NavItem[], isDark = true) {
    this.navPlanes.forEach((p) => p.destroy())
    this.navPlanes = []
    this._currentItems = items
    this._isDark = isDark

    // Duplicate ×2 for infinite loop
    const doubled = [...items, ...items]
    doubled.forEach((item, i) => {
      this.navPlanes.push(new NavPlane(this.experience, i, item, doubled.length, this.geometry, isDark))
    })
    this.particles.setTheme(isDark)
  }

  updateTheme(isDark: boolean) {
    this.navPlanes.forEach((p) => p.updateTexture(isDark))
    this.particles.setTheme(isDark)
  }

  reveal() {
    this.navPlanes.forEach((p, i) => setTimeout(() => p.reveal(), (i % 4) * 60))
  }

  hide() {
    this.navPlanes.forEach((p, i) => setTimeout(() => p.hide(), (i % 4) * 40))
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

  // Accordion expand: hide planes after clicked, rebuild, reveal in-place
  async expandAt(newItems: NavItem[], clickedItemIndex: number) {
    // Hide planes after the clicked item (stagger 40ms)
    for (let i = 0; i < this.navPlanes.length; i++) {
      if (this.navPlanes[i].index > clickedItemIndex) {
        setTimeout(() => { this.navPlanes[i]?.hide() }, (i - clickedItemIndex) * 40)
      }
    }

    await new Promise<void>(r => setTimeout(r, 380))
    if (this._destroyed) return

    this.setNavItems(newItems, this._isDark)
    this.experience.controls.reset()  // centre the new spiral at its first item

    await new Promise<void>(r => setTimeout(r, 30))
    if (this._destroyed) return

    // Reveal all with a gentle stagger for a crisp entrance
    for (let i = 0; i < this.navPlanes.length; i++) {
      const plane = this.navPlanes[i]
      if (!plane) continue
      const staggerMs = (i % newItems.length) * 60
      if (staggerMs === 0) {
        plane.revealImmediate()
      } else {
        setTimeout(() => { plane.reveal() }, staggerMs)
      }
    }
  }

  update(delta: number) {
    const { wheelDeltaY, scrollOffset } = this.experience.controls
    this.navPlanes.forEach((p) => p.update(delta, scrollOffset, wheelDeltaY))
    this.particles.update(delta)
  }

  destroy() {
    this._destroyed = true
    this.navPlanes.forEach((p) => p.destroy())
    this.particles.destroy()
    this.geometry.dispose()
  }
}
