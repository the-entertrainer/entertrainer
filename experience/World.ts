import { PlaneGeometry } from 'three'
import NavPlane from './NavPlane'
import type Experience from './Experience'
import type { NavItem } from '~/types/nav'

export default class World {
  experience: Experience
  geometry: PlaneGeometry
  navPlanes: NavPlane[] = []
  private _destroyed = false
  private _currentItems: NavItem[] = []
  private _isDark = true

  spiralRotationSpeedMultiplier = 1.0

  constructor(experience: Experience) {
    this.experience = experience
    this.geometry = new PlaneGeometry(1, 1, 8, 8)
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
  }

  updateTheme(isDark: boolean) {
    this._isDark = isDark
    this.navPlanes.forEach((p) => p.updateTexture(isDark))
  }

  reveal() {
    this.navPlanes.forEach((p, i) => setTimeout(() => p.reveal(), (i % 4) * 60))
  }

  // Spiral vortex transition — the single motion for every in-spiral change
  // (entering a sub-section, going back, returning home). Accelerate spin →
  // swap items → decelerate spin while fading the new cards in.
  async transitionTo(items: NavItem[]) {
    await this._animateSpiralExit()

    if (this._destroyed) return

    this.experience.controls.reset()
    this.setNavItems(items, this._isDark)
    // New planes are born hidden (hiddenProgress = 1). Snap them into final
    // position but invisible (entranceFade = 0) so the entrance animation can
    // fade + spin them in. Without this the spiral stays blank after the swap.
    this.navPlanes.forEach(p => { p.revealImmediate(); p.entranceFade = 0 })

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

  update(delta: number) {
    const { wheelDeltaY, scrollOffset } = this.experience.controls
    this.navPlanes.forEach((p) => p.update(delta, scrollOffset, wheelDeltaY, this.spiralRotationSpeedMultiplier))
  }

  destroy() {
    this._destroyed = true
    this.navPlanes.forEach((p) => p.destroy())
    this.geometry.dispose()
  }
}
