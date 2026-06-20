import * as THREE from 'three'

export interface Attractor { x: number; y: number; z: number }

export interface ParticleConfig {
  attractors: Attractor[]
  color: string
  speed: number
  noise: number
  size: number
  mouseRepel: number
}

export class ParticleField {
  private count: number
  private pos: Float32Array
  private vel: Float32Array
  private geometry: THREE.BufferGeometry
  private material: THREE.PointsMaterial
  points: THREE.Points

  constructor(count: number, scene: THREE.Scene) {
    this.count = count
    this.pos = new Float32Array(count * 3)
    this.vel = new Float32Array(count * 3)

    for (let i = 0; i < count * 3; i += 3) {
      this.pos[i]     = (Math.random() - 0.5) * 10
      this.pos[i + 1] = (Math.random() - 0.5) * 8
      this.pos[i + 2] = (Math.random() - 0.5) * 10
    }

    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.pos, 3))

    this.material = new THREE.PointsMaterial({
      color: 0xC8C5BC,
      size: 1.2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    this.points = new THREE.Points(this.geometry, this.material)
    scene.add(this.points)
  }

  tick(delta: number, config: ParticleConfig, mouse: THREE.Vector2) {
    const { attractors, speed, noise, mouseRepel, color, size } = config
    this.material.color.set(color)
    this.material.size = size

    const dt = Math.min(delta, 0.033)

    for (let i = 0; i < this.count * 3; i += 3) {
      const px = this.pos[i], py = this.pos[i+1], pz = this.pos[i+2]

      // Nearest attractor
      let bestDist2 = Infinity, ax = 0, ay = 0, az = 0
      for (const a of attractors) {
        const dx = a.x - px, dy = a.y - py, dz = a.z - pz
        const d2 = dx*dx + dy*dy + dz*dz
        if (d2 < bestDist2) { bestDist2 = d2; ax = a.x; ay = a.y; az = a.z }
      }

      const dirX = (ax - px) * speed
      const dirY = (ay - py) * speed
      const dirZ = (az - pz) * speed

      const nx = (Math.random() - 0.5) * noise
      const ny = (Math.random() - 0.5) * noise
      const nz = (Math.random() - 0.5) * noise

      let repX = 0, repY = 0
      if (mouseRepel > 0) {
        const mx = mouse.x * 3.5, my = mouse.y * 2.2
        const mdx = px - mx, mdy = py - my
        const md2 = mdx*mdx + mdy*mdy
        const rad2 = mouseRepel * mouseRepel
        if (md2 < rad2 && md2 > 0.001) {
          const f = (1 - md2 / rad2) * 0.045
          repX = (mdx / Math.sqrt(md2)) * f
          repY = (mdy / Math.sqrt(md2)) * f
        }
      }

      this.vel[i]   = (this.vel[i]   + dirX + nx + repX) * 0.88
      this.vel[i+1] = (this.vel[i+1] + dirY + ny + repY) * 0.88
      this.vel[i+2] = (this.vel[i+2] + dirZ + nz) * 0.88

      this.pos[i]   += this.vel[i]   * dt * 60
      this.pos[i+1] += this.vel[i+1] * dt * 60
      this.pos[i+2] += this.vel[i+2] * dt * 60
    }

    this.geometry.attributes.position.needsUpdate = true
  }

  setOffset(offset: THREE.Vector3) {
    this.points.position.copy(offset)
  }

  dispose() {
    this.geometry.dispose()
    this.material.dispose()
  }
}
