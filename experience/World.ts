import { PlaneGeometry } from 'three'
import ProjectPlane from './ProjectPlane'
import type Experience from './Experience'

export default class World {
  experience: Experience
  geometry: PlaneGeometry
  projectPlanes: ProjectPlane[] = []
  hoveredPlane: ProjectPlane | null = null

  constructor(experience: Experience) {
    this.experience = experience
    // Shared geometry — 8×8 subdivisions required for vertex warp
    this.geometry = new PlaneGeometry(1, 1, 8, 8)
  }

  setProjects(projects: { title: string; slug: string; year: number; color: string; shortDescription: string }[]) {
    // Clear existing
    this.projectPlanes.forEach((p) => p.destroy())
    this.projectPlanes = []

    // Duplicate ×2 for infinite loop
    const doubled = [...projects, ...projects]
    const count = doubled.length

    doubled.forEach((project, i) => {
      this.projectPlanes.push(new ProjectPlane(this.experience, i, project, count, this.geometry))
    })
  }

  revealProjects() {
    this.projectPlanes.forEach((plane, i) => {
      setTimeout(() => plane.reveal(), (i % 4) * 50)
    })
  }

  hideProjects() {
    this.projectPlanes.forEach((plane, i) => {
      setTimeout(() => plane.hide(), (i % 4) * 30)
    })
  }

  private _updateHover() {
    const raycaster = this.experience.raycaster
    if (!raycaster || !raycaster.hasPointer) {
      if (this.hoveredPlane) {
        this.hoveredPlane.setHovered(false)
        this.hoveredPlane = null
      }
      return
    }

    const meshes = this.projectPlanes.map((p) => p.mesh)
    const intersects = raycaster.instance.intersectObjects(meshes, false)

    let newHovered: ProjectPlane | null = null
    if (intersects.length > 0) {
      const mesh = intersects[0].object
      newHovered = this.projectPlanes.find((p) => p.mesh === mesh) ?? null
    }

    if (newHovered !== this.hoveredPlane) {
      this.hoveredPlane?.setHovered(false)
      newHovered?.setHovered(true)
      this.hoveredPlane = newHovered
    }
  }

  update(delta: number) {
    const controls = this.experience.controls
    const speed = controls.wheelDeltaY
    this._updateHover()
    this.projectPlanes.forEach((plane) => {
      plane.update(delta, controls.scrollOffset, speed)
    })
  }

  destroy() {
    this.projectPlanes.forEach((p) => p.destroy())
    this.geometry.dispose()
  }
}
