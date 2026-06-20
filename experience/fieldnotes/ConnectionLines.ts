import * as THREE from 'three'

interface Connection {
  line: THREE.Line
  mat: THREE.LineBasicMaterial
  phaseOffset: number
}

export class ConnectionLines {
  private _connections: Connection[] = []
  private _scene: THREE.Scene
  private _time = 0

  constructor(scene: THREE.Scene) {
    this._scene = scene
  }

  add(a: THREE.Vector3, b: THREE.Vector3, baseOpacity = 0.35): Connection {
    const geo = new THREE.BufferGeometry().setFromPoints([a, b])
    const mat = new THREE.LineBasicMaterial({
      color: 0xC8C0B0,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
    const line = new THREE.Line(geo, mat)
    this._scene.add(line)
    const conn = { line, mat, phaseOffset: Math.random() * Math.PI * 2 }
    this._connections.push(conn)
    return conn
  }

  addMany(points: THREE.Vector3[], threshold: number) {
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (points[i].distanceTo(points[j]) < threshold) {
          this.add(points[i], points[j])
        }
      }
    }
  }

  tick(delta: number, active = true) {
    this._time += delta
    this._connections.forEach(({ mat, phaseOffset }) => {
      if (active) {
        mat.opacity = 0.2 + Math.sin(this._time * 1.4 + phaseOffset) * 0.15
      } else {
        mat.opacity = Math.max(0, mat.opacity - delta * 1.5)
      }
    })
  }

  setVisible(v: boolean) {
    this._connections.forEach(c => { c.line.visible = v })
  }

  fadeIn(duration = 1.2) {
    this._connections.forEach(({ mat }, i) => {
      const delay = i * 0.04
      let elapsed = -delay
      const step = () => {
        elapsed += 1 / 60
        if (elapsed < 0) { requestAnimationFrame(step); return }
        const t = Math.min(elapsed / duration, 1)
        mat.opacity = 0.28 * t
        if (t < 1) requestAnimationFrame(step)
      }
      step()
    })
  }

  fadeOut(duration = 0.6) {
    this._connections.forEach(({ mat }) => {
      const start = mat.opacity
      let elapsed = 0
      const step = () => {
        elapsed += 1 / 60
        const t = Math.min(elapsed / duration, 1)
        mat.opacity = start * (1 - t)
        if (t < 1) requestAnimationFrame(step)
      }
      step()
    })
  }

  dispose() {
    this._connections.forEach(({ line, mat }) => {
      line.geometry.dispose()
      mat.dispose()
      this._scene.remove(line)
    })
    this._connections = []
  }
}
