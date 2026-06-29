import { Mesh, PlaneGeometry, ShaderMaterial, Vector2 } from 'three'
import type Experience from './Experience'

const BACK_Z = -6

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Refined gradient mesh — a few large, soft colour fields in the pi-blue
// family plus a faint warm counter-tone, drifting and blending slowly. Dark
// theme reads them as additive glow on near-black; light theme as subtle tonal
// washes on warm paper. Fine grain over the top. Quiet, atmospheric, premium.
const fragmentShader = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uIsDark;
  uniform vec2  uPointer;
  uniform vec2  uResolution;
  uniform float uReducedMotion;
  uniform float uScrollEnergy;
  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  // time, scaled — eases toward a near-freeze under prefers-reduced-motion
  float t(float speed) {
    return uTime * speed * (1.0 - uReducedMotion * 0.92);
  }

  // soft gaussian field
  float blob(vec2 p, vec2 c, float s) {
    vec2 d = p - c;
    return exp(-dot(d, d) * s);
  }

  void main() {
    vec2 uv = vUv;

    // Base — matches the --color-bg tokens (warm near-black / warm paper)
    vec3 lightBg = vec3(0.961, 0.937, 0.910);
    vec3 darkBg  = vec3(0.051, 0.047, 0.039);
    vec3 col = mix(lightBg, darkBg, uIsDark);

    // gentle parallax + a swell while the spiral is spinning
    vec2  par   = uPointer * 0.07;
    float swell = 1.0 + uScrollEnergy * 0.5;

    // Palette — pi-blue family, low saturation, with one faint warm accent
    vec3 blue   = vec3(0.141, 0.247, 0.416);   // #243F6A pi-blue
    vec3 indigo = vec3(0.105, 0.150, 0.320);
    vec3 teal   = vec3(0.130, 0.330, 0.380);
    vec3 amber  = vec3(0.520, 0.380, 0.230);

    // Slow, independent drift so the fields morph and never settle
    vec2 c1 = vec2(0.24, 0.28) + vec2(sin(t(0.047)), cos(t(0.036))) * 0.10 + par;
    vec2 c2 = vec2(0.78, 0.66) + vec2(cos(t(0.041)), sin(t(0.052))) * 0.10 + par * 0.7;
    vec2 c3 = vec2(0.58, 0.20) + vec2(sin(t(0.033)), cos(t(0.045))) * 0.09 + par * 0.5;
    vec2 c4 = vec2(0.34, 0.82) + vec2(cos(t(0.038)), sin(t(0.029))) * 0.08 + par * 0.6;

    vec3 mesh = vec3(0.0);
    mesh += blue   * blob(uv, c1, 2.8);
    mesh += teal   * blob(uv, c2, 2.6);
    mesh += indigo * blob(uv, c3, 2.2);
    mesh += amber  * blob(uv, c4, 4.6);   // tighter, smaller warm accent
    mesh *= swell;

    // Dark: additive glow. Light: tonal wash — a touch darker, hue-tinted.
    vec3  darkCol  = col + mesh * 0.65;
    float ml       = dot(mesh, vec3(0.299, 0.587, 0.114));
    vec3  lightCol = col - ml * 0.05 + mesh * 0.12;
    col = mix(lightCol, darkCol, uIsDark);

    // Fine film grain
    float g = hash21(uv * uResolution + fract(uTime * 0.6) * 100.0);
    col += (g - 0.5) * 0.015;

    gl_FragColor = vec4(col, 1.0);
  }
`

export default class Backdrop {
  experience: Experience
  mesh: Mesh
  material: ShaderMaterial

  private _geometry: PlaneGeometry
  private _readyFired = false
  private _isDark = true
  private _pointer = new Vector2(0, 0)
  private _reducedMotion = false
  private _scrollEnergy = 0
  private _mqListener: (() => void) | null = null

  constructor(experience: Experience) {
    this.experience = experience
    this._geometry = new PlaneGeometry(1, 1)

    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      this._reducedMotion = mq.matches
      this._mqListener = () => { this._reducedMotion = mq.matches }
      mq.addEventListener('change', this._mqListener)
    }

    const { width, height } = experience.sizes
    this.material = new ShaderMaterial({
      uniforms: {
        uTime:          { value: 0.0 },
        uIsDark:        { value: 1.0 },
        uPointer:       { value: new Vector2(0, 0) },
        uResolution:    { value: new Vector2(width, height) },
        uReducedMotion: { value: 0.0 },
        uScrollEnergy:  { value: 0.0 },
      },
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false,
    })

    this.mesh = new Mesh(this._geometry, this.material)
    this.mesh.position.z = BACK_Z
    this.mesh.renderOrder = -10
    this.mesh.frustumCulled = false
    this.mesh.visible = true
    experience.scene.add(this.mesh)
    this.resize()
  }

  setTheme(isDark: boolean) {
    this._isDark = isDark
    this.material.uniforms.uIsDark.value = isDark ? 1.0 : 0.0

    if (!this._readyFired) {
      this._readyFired = true
      this.experience.trigger('backdropReady', [])
    }
  }

  resize() {
    const cam = this.experience.camera.instance
    const dist = cam.position.z - BACK_Z
    const vFov = (cam.fov * Math.PI) / 180
    const h = 2 * dist * Math.tan(vFov / 2) * 1.35
    const w = h * cam.aspect
    this.mesh.scale.set(w, h, 1)

    const { width, height } = this.experience.sizes
    this.material.uniforms.uResolution.value.set(width, height)
  }

  update(elapsed: number, pointer: Vector2, scrollSpeed: number) {
    this.material.uniforms.uTime.value = elapsed / 1000

    // Smooth pointer
    const tx = pointer.x * 0.5
    const ty = pointer.y * 0.5
    this._pointer.x += (tx - this._pointer.x) * 0.03
    this._pointer.y += (ty - this._pointer.y) * 0.03
    this.material.uniforms.uPointer.value.set(this._pointer.x, this._pointer.y)

    this.material.uniforms.uReducedMotion.value = this._reducedMotion ? 1.0 : 0.0

    // Scroll energy — quick attack, slow decay. Floor of 0.006 cards/frame keeps
    // the ambient idle drift from triggering it; only real scrolling lifts the glow.
    const target = Math.min(1, Math.max(0, Math.abs(scrollSpeed) - 0.006) * 26)
    const rate = target > this._scrollEnergy ? 0.18 : 0.04
    this._scrollEnergy += (target - this._scrollEnergy) * rate
    this.material.uniforms.uScrollEnergy.value = this._scrollEnergy
  }

  destroy() {
    this.experience.scene.remove(this.mesh)
    this._geometry.dispose()
    this.material.dispose()
    if (this._mqListener && typeof window !== 'undefined') {
      window.matchMedia('(prefers-reduced-motion: reduce)').removeEventListener('change', this._mqListener)
      this._mqListener = null
    }
  }
}
