import * as THREE from 'three'

export class NoteObject {
  mesh: THREE.Mesh
  private _time: number
  private _floatAmp: number
  private _floatFreq: number
  private _rotAmp: number
  private _rotFreq: number
  private _baseY: number
  private _baseRotZ: number
  private _mat: THREE.MeshBasicMaterial

  constructor(
    scene: THREE.Scene,
    texture: THREE.Texture,
    position: THREE.Vector3,
    rotation = new THREE.Euler(),
    scale = 1
  ) {
    const geo = new THREE.PlaneGeometry(1.4 * scale, 1.8 * scale)
    this._mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
    this.mesh = new THREE.Mesh(geo, this._mat)
    this.mesh.position.copy(position)
    this.mesh.rotation.copy(rotation)
    this._baseY = position.y
    this._baseRotZ = rotation.z

    const r = Math.random
    this._time = r() * Math.PI * 2
    this._floatAmp  = 0.03 + r() * 0.04
    this._floatFreq = 0.25 + r() * 0.25
    this._rotAmp    = 0.005 + r() * 0.006
    this._rotFreq   = 0.18 + r() * 0.18

    scene.add(this.mesh)
  }

  tick(delta: number) {
    this._time += delta
    this.mesh.position.y = this._baseY + Math.sin(this._time * this._floatFreq) * this._floatAmp
    this.mesh.rotation.z = this._baseRotZ + Math.sin(this._time * this._rotFreq) * this._rotAmp
  }

  fadeTo(opacity: number, duration = 0.8) {
    // lightweight manual lerp — avoids GSAP dep in Three.js layer
    const start = this._mat.opacity
    const delta = opacity - start
    let elapsed = 0
    const step = () => {
      elapsed += 1 / 60
      const t = Math.min(elapsed / duration, 1)
      this._mat.opacity = start + delta * t
      if (t < 1) requestAnimationFrame(step)
    }
    step()
  }

  dispose() {
    this.mesh.geometry.dispose()
    this._mat.dispose()
  }
}
