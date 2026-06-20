import * as THREE from 'three'
import type { SceneParticleConfig, Attractor } from './scenes'

const LERP = 0.06

export class ParticleField {
  private count: number
  private pos: Float32Array
  private vel: Float32Array
  private geometry: THREE.BufferGeometry
  private material: THREE.PointsMaterial
  points: THREE.Points

  // pre-allocated scratch vectors (no GC in hot path)
  private _v3 = new THREE.Vector3()
  private _mouse3 = new THREE.Vector3()

  constructor(count: number, scene: THREE.Scene) {
    this.count = count
    this.pos = new Float32Array(count * 3)
    this.vel = new Float32Array(count * 3)

    // Scatter particles randomly in a sphere of radius 4
    for (let i = 0; i < count * 3; i += 3) {
      this.pos[i]     = (Math.random() - 0.5) * 8
      this.pos[i + 1] = (Math.random() - 0.5) * 8
      this.pos[i + 2] = (Math.random() - 0.5) * 8
    }

    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position',
      new THREE.BufferAttribute(this.pos, 3)
    )

    this.material = new THREE.PointsMaterial({
      color: 0xB8CCE8,
      size: 1.4,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    this.points = new THREE.Points(this.geometry, this.material)
    scene.add(this.points)
  }

  setColor(hex: string) {
    this.material.color.set(hex)
  }

  setSize(s: number) {
    this.material.size = s
  }

  tick(
    delta: number,
    config: SceneParticleConfig,
    mouse: THREE.Vector2,      // NDC -1..1
    cameraWorldPos: THREE.Vector3
  ) {
    const { attractors, speed, noise, mouseRepel, color, size } = config

    // Lazy-update material properties
    this.material.color.set(color)
    this.material.size = size

    const dt = Math.min(delta, 0.033) // cap at 33ms

    for (let i = 0; i < this.count * 3; i += 3) {
      const px = this.pos[i], py = this.pos[i + 1], pz = this.pos[i + 2]

      // ── Find nearest attractor ───────────────────────────────
      let bestDist2 = Infinity
      let ax = 0, ay = 0, az = 0
      for (const a of attractors) {
        const dx = a.x - px, dy = a.y - py, dz = a.z - pz
        const d2 = dx * dx + dy * dy + dz * dz
        if (d2 < bestDist2) { bestDist2 = d2; ax = a.x; ay = a.y; az = a.z }
      }

      // ── Steer toward attractor ───────────────────────────────
      const dirX = (ax - px) * speed
      const dirY = (ay - py) * speed
      const dirZ = (az - pz) * speed

      // ── Noise jitter ─────────────────────────────────────────
      const nx = (Math.random() - 0.5) * noise
      const ny = (Math.random() - 0.5) * noise
      const nz = (Math.random() - 0.5) * noise

      // ── Mouse repulsion ───────────────────────────────────────
      let repX = 0, repY = 0, repZ = 0
      if (mouseRepel > 0) {
        // Project mouse ray to the Z=cameraPos.z - 6 plane (approx)
        const mx = mouse.x * 3, my = mouse.y * 2
        const mdx = px - mx, mdy = py - my
        const md2 = mdx * mdx + mdy * mdy
        const rad2 = mouseRepel * mouseRepel
        if (md2 < rad2 && md2 > 0.001) {
          const factor = (1 - md2 / rad2) * 0.04
          repX = (mdx / Math.sqrt(md2)) * factor
          repY = (mdy / Math.sqrt(md2)) * factor
        }
      }

      // ── Euler integrate ───────────────────────────────────────
      this.vel[i]     = (this.vel[i]     + dirX + nx + repX) * 0.88
      this.vel[i + 1] = (this.vel[i + 1] + dirY + ny + repY) * 0.88
      this.vel[i + 2] = (this.vel[i + 2] + dirZ + nz + repZ) * 0.88

      this.pos[i]     += this.vel[i]     * dt * 60
      this.pos[i + 1] += this.vel[i + 1] * dt * 60
      this.pos[i + 2] += this.vel[i + 2] * dt * 60
    }

    this.geometry.attributes.position.needsUpdate = true
  }

  dispose() {
    this.geometry.dispose()
    this.material.dispose()
  }
}
