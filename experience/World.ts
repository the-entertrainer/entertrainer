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

  spiralRotationSpeedMultiplier = 1.0

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

  // Spiral vortex transition: accelerate spin → swap items → decelerate spin
  async transitionTo(items: NavItem[]) {
    await this._animateSpiralExit()

    if (this._destroyed) return

    this.experience.controls.reset()
    this.setNavItems(items)

    await new Promise<void>(r => setTimeout(r, 80))
    if (this._destroyed) return

    await this._animateSpiralEntrance()
  }

  private async _animateSpiralExit() {
    const startTime = performance.now()
    const duration = 600  // ms

    return new Promise<void>(r => {
      const animate = () => {
        if (this._destroyed) {
          r()
          return
        }

        const elapsed = performance.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Accelerate spin: 1x → 3x speed over 600ms
        this.spiralRotationSpeedMultiplier = 1 + progress * 2

        // Depth-cascade fade: fade out as we spin
        const fadeFactor = Math.pow(progress, 1.2)  // ease-out for fade
        this.navPlanes.forEach(p => {
          p.exitFade = fadeFactor
        })

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          this.spiralRotationSpeedMultiplier = 1
          this.navPlanes.forEach(p => { p.exitFade = 1 })
          r()
        }
      }
      animate()
    })
  }

  private async _animateSpiralEntrance() {
    const startTime = performance.now()
    const duration = 500  // ms

    this.navPlanes.forEach(p => { p.entranceFade = 0 })

    return new Promise<void>(r => {
      const animate = () => {
        if (this._destroyed) {
          r()
          return
        }

        const elapsed = performance.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Decelerate spin: 3x → 1x speed
        this.spiralRotationSpeedMultiplier = 3 - progress * 2

        // Depth-cascade fade in (reverse): cards appear via depth
        const revealFactor = Math.pow(progress, 0.8)  // ease-in for reveal
        this.navPlanes.forEach(p => {
          p.entranceFade = revealFactor
        })

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          this.spiralRotationSpeedMultiplier = 1
          this.navPlanes.forEach(p => { p.entranceFade = 1 })
          r()
        }
      }
      animate()
    })
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
    this.navPlanes.forEach((p) => p.update(delta, scrollOffset, wheelDeltaY, this.spiralRotationSpeedMultiplier))
    this.particles.update(delta)
  }

  destroy() {
    this._destroyed = true
    this.navPlanes.forEach((p) => p.destroy())
    this.particles.destroy()
    this.geometry.dispose()
  }
}
