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
    this.applyBackdropAccents()
  }

  // Tint each card's rim/edge to a colour from the live backdrop palette —
  // spread across the palette by index so the spiral echoes the whole gradient.
  applyBackdropAccents() {
    const pal = this.experience.backdrop?.getPalette?.()
    if (!pal || !pal.length) return
    this.navPlanes.forEach((p) => {
      p.setAccent(pal[p.index % pal.length])
      p.setPrimary(pal[0])
    })
  }

  updateTheme(isDark: boolean) {
    this._isDark = isDark
    this.navPlanes.forEach((p) => p.updateTexture(isDark))
  }

  reveal() {
    this.navPlanes.forEach((p, i) => setTimeout(() => p.reveal(), (i % 4) * 60))
  }

  // Spiral vortex transition — the single canonical motion used for all
  // navigation from the spiral (both in-spiral sections and leaving to
  // external pages like About / Instructional Design).
  // The spiral winds up and cross-fades out, then (for internal) items swap
  // and it unwinds. For external navigation we only perform the exit.
  private readonly _spinPeak = 2.2

  async transitionTo(items: NavItem[]) {
    await this._animateSpiralExit()

    if (this._destroyed) return

    this.experience.controls.reset()
    this.setNavItems(items, this._isDark)
    // New planes are born hidden — snap them to their final spots but fully
    // transparent so the entrance can cross-fade them in. The spin multiplier
    // is already at PEAK, so they start wound up and unwind into place.
    this.navPlanes.forEach(p => { p.revealImmediate(); p.transitionOpacity = 0 })

    // One frame to let the new meshes register, then fade/unwind in.
    await new Promise<void>(r => requestAnimationFrame(() => r()))
    if (this._destroyed) return

    await this._animateSpiralEntrance()
  }

  /**
   * Perform only the exit half of the vortex animation.
   * Used when navigating away to a full page (e.g. /about).
   * Leaves the spiral wound up and faded out.
   */
  async exit() {
    await this._animateSpiralExit()
  }

  // easeInOutSine — gentle, symmetric, no abrupt starts or stops.
  private _ease(t: number): number {
    return 0.5 - 0.5 * Math.cos(Math.PI * t)
  }

  private async _animateSpiralExit() {
    const startTime = performance.now()
    const duration = 440  // ms

    return new Promise<void>(r => {
      const animate = () => {
        if (this._destroyed) { r(); return }

        const e = this._ease(Math.min((performance.now() - startTime) / duration, 1))
        // Wind up 1 → PEAK and cross-fade out 1 → 0.
        this.spiralRotationSpeedMultiplier = 1 + (this._spinPeak - 1) * e
        this.navPlanes.forEach(p => { p.transitionOpacity = 1 - e })

        if (e < 1) requestAnimationFrame(animate)
        else r()  // leave spin wound at PEAK, opacity 0 — entrance continues from here
      }
      animate()
    })
  }

  private async _animateSpiralEntrance() {
    const startTime = performance.now()
    const duration = 500  // ms

    return new Promise<void>(r => {
      const animate = () => {
        if (this._destroyed) { r(); return }

        const e = this._ease(Math.min((performance.now() - startTime) / duration, 1))
        // Unwind PEAK → 1 and cross-fade in 0 → 1.
        this.spiralRotationSpeedMultiplier = this._spinPeak - (this._spinPeak - 1) * e
        this.navPlanes.forEach(p => { p.transitionOpacity = e })

        if (e < 1) requestAnimationFrame(animate)
        else {
          this.spiralRotationSpeedMultiplier = 1
          this.navPlanes.forEach(p => { p.transitionOpacity = 1 })
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
