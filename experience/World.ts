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

  // Transition state
  spiralRotationSpeedMultiplier = 1.0  // Controls spiral spin speed during transitions
  private _transitionStartTime = 0
  private _transitionDuration = 600  // ms

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
    // Simple staggered reveal (for return visits)
    this.navPlanes.forEach((p, i) => setTimeout(() => p.reveal(), (i % 4) * 60))
  }

  // Polished entrance animation for home page — smooth spiral bloom from center
  async revealWithEntrance() {
    const startTime = performance.now()
    const duration = 1200  // ms — smooth, unhurried entrance

    // Start cards fully hidden
    this.navPlanes.forEach(p => { p.entranceFade = 0 })

    return new Promise<void>(r => {
      const animate = () => {
        if (this._destroyed) {
          r()
          return
        }

        const elapsed = performance.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Gentle ease-out for smooth reveal
        const easeProgress = 1 - Math.pow(1 - progress, 3)

        // Cards bloom in with entrance fade
        this.navPlanes.forEach(p => {
          p.entranceFade = easeProgress
          p.reveal()  // Start individual reveal animations
        })

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          this.navPlanes.forEach(p => { p.entranceFade = 1 })
          r()
        }
      }
      animate()
    })
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
    const duration = 650  // ms — slightly longer for dramatic exit

    return new Promise<void>(r => {
      const animate = () => {
        if (this._destroyed) {
          r()
          return
        }

        const elapsed = performance.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Accelerate spin: 1x → 3.5x speed (more dramatic vortex)
        // Use ease-in quad for snappy acceleration
        const easeProgress = progress * progress
        this.spiralRotationSpeedMultiplier = 1 + easeProgress * 2.5

        // Depth-cascade fade: fade out as we spin
        // Progress faster for more dramatic exit
        const fadeFactor = Math.pow(progress, 1.0)
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
    const duration = 550  // ms — slightly longer for satisfying reveal

    this.navPlanes.forEach(p => { p.entranceFade = 0 })

    return new Promise<void>(r => {
      const animate = () => {
        if (this._destroyed) {
          r()
          return
        }

        const elapsed = performance.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Decelerate spin: 3.5x → 1x speed with ease-out quad
        const easeProgress = 1 - (1 - progress) * (1 - progress)
        this.spiralRotationSpeedMultiplier = 3.5 - easeProgress * 2.5

        // Depth-cascade fade in (reverse): cards appear via depth
        // Use ease-out for smooth, natural reveal
        const revealFactor = Math.pow(progress, 0.7)
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
