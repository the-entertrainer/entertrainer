import { Mesh, PlaneGeometry, ShaderMaterial, Vector2, Vector3 } from 'three'
import type Experience from './Experience'

const BACK_Z = -6

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Fractal-glass gradients — fluted/reeded glass refracting a flowing 5-blob
// gradient, with film grain and exponential tone-mapping. Technique learned
// from franky-adl/fractal-glass-gradients, reproduced fully procedurally (the
// noise-warp and grain are generated in-shader rather than from FBO/texture
// assets). Every load randomises the palette + flute/warp params; dark and
// light themes draw from separate palette pools for distinct aesthetics.
const fragmentShader = /* glsl */`
  precision highp float;
  uniform float uTime, uReducedMotion, uScrollEnergy;
  uniform float uWarpStrength, uFluteWidth, uFluteStrength, uToneMapExposure, uGrainStrength, uSeed, uAlgo;
  uniform vec2  uResolution, uPointer;
  uniform vec3  uC1, uC2, uC3, uC4, uC5, uBase;
  varying vec2 vUv;

  float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i), b = hash21(i + vec2(1.0,0.0)), c = hash21(i + vec2(0.0,1.0)), d = hash21(i + vec2(1.0,1.0));
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }
  float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ v += a * vnoise(p); p *= 2.03; a *= 0.5; } return v; }
  float tt(float s){ return uTime * s * (1.0 - uReducedMotion * 0.9); }
  float atanh_(float x){ x = clamp(x, -0.9999, 0.9999); return 0.5 * log((1.0 + x) / (1.0 - x)); }
  vec2 rot(vec2 v, float a){ float s = sin(a), c = cos(a); return mat2(c, -s, s, c) * v; }
  vec2 warpN(vec2 uv){ return vec2(fbm(uv * 3.0 + uSeed), fbm(uv * 3.0 + vec2(17.3, 4.1) + uSeed)); }

  // Flowing field of five soft Gaussian blobs.
  vec3 blobs(vec2 uv){
    float t = tt(0.6) + 3.5 + uSeed;
    vec2 p1 = vec2(-0.28 + sin(t*0.7+0.5)*0.15,  0.06 + cos(t*0.5)*0.12);
    vec2 p2 = vec2(-0.06 + sin(t*0.4+1.2)*0.18,  0.16 + cos(t*0.6)*0.15);
    vec2 p3 = vec2( 0.07 + sin(t*0.5+3.4)*0.20,  0.00 + cos(t*0.4)*0.14);
    vec2 p4 = vec2( 0.22 + sin(t*0.3+2.3)*0.24, -0.10 + cos(t*0.7)*0.14);
    vec2 p5 = vec2( 0.30 + sin(t*0.6+1.1)*0.18,  0.06 + cos(t*0.4)*0.13);
    vec2 wn = warpN(vUv) * 2.0 - 1.0;
    vec2 w = uv + wn * uWarpStrength;
    vec3 col = uBase;
    col += uC1 * exp(-dot(w-p1, w-p1) * 12.0) * 1.4;
    col += uC2 * exp(-dot(w-p2, w-p2) * 20.0) * 2.0;
    col += uC3 * exp(-dot(w-p3, w-p3) *  9.0) * 1.6;
    col += uC4 * exp(-dot(w-p4, w-p4) * 15.0) * 1.3;
    col += uC5 * exp(-dot(w-p5, w-p5) * 25.0) * 0.8;
    return col;
  }
  // Flowing field of five rotated Gaussian ellipses.
  vec3 ellipses(vec2 uv){
    float t = tt(0.6) + 3.5 + uSeed;
    vec2 p1 = vec2(-0.32 + sin(t*0.5+1.8)*0.20, -0.12 + cos(t*0.8+0.3)*0.16);
    vec2 p2 = vec2( 0.10 + sin(t*0.6+2.5)*0.14,  0.24 + cos(t*0.3+1.7)*0.18);
    vec2 p3 = vec2(-0.15 + sin(t*0.9+0.7)*0.22, -0.08 + cos(t*0.5+2.9)*0.11);
    vec2 p4 = vec2( 0.28 + sin(t*0.4+3.1)*0.17,  0.18 + cos(t*0.6+0.9)*0.20);
    vec2 p5 = vec2(-0.05 + sin(t*0.7+4.2)*0.13, -0.20 + cos(t*0.9+1.5)*0.15);
    vec2 wn = warpN(vUv) * 2.0 - 1.0;
    vec2 w = uv + vec2(wn.r * uWarpStrength, wn.g * uWarpStrength * 0.2);
    vec2 r1 = rot(w-p1, 0.3), r2 = rot(w-p2, -1.1), r3 = rot(w-p3, 0.8), r4 = rot(w-p4, -0.5), r5 = rot(w-p5, 1.4);
    float e1 = r1.x*r1.x* 8.0 + r1.y*r1.y* 1.0;
    float e2 = r2.x*r2.x*25.0 + r2.y*r2.y*12.0;
    float e3 = r3.x*r3.x* 6.0 + r3.y*r3.y*14.0;
    float e4 = r4.x*r4.x*20.0 + r4.y*r4.y* 8.0;
    float e5 = r5.x*r5.x*30.0 + r5.y*r5.y*15.0;
    vec3 col = uBase;
    col += uC1*exp(-e1)*1.4; col += uC2*exp(-e2)*2.0; col += uC3*exp(-e3)*1.6; col += uC4*exp(-e4)*1.3; col += uC5*exp(-e5)*0.8;
    return col;
  }

  void main(){
    // Fluted/reeded glass: split into vertical flutes, displace the sample
    // coords within each flute so every strip refracts the gradient.
    vec2 frag   = vUv * uResolution;
    vec2 mapped = frag - uResolution * 0.5;
    vec2 scaled = mapped / uFluteWidth;
    vec2 fr     = vec2(fract(scaled.x), scaled.y);
    float fx    =  uFluteStrength * (fr.x - 0.5);
    float fy    = -uFluteStrength * atanh_(pow(fr.x, 6.0));
    vec2 fc     = vec2(mapped.x + fx, mapped.y + fy);
    vec2 fuv    = fc / uResolution.y + uPointer * 0.01;

    vec3 color = (uAlgo < 0.5) ? blobs(fuv) : ellipses(fuv);

    // exponential tone-map → soft, filmic, no harsh clipping
    color = 1.0 - exp(-color * uToneMapExposure);

    // film grain, scaled by local brightness
    float g = hash21(vUv * uResolution + fract(uTime * 0.5) * 100.0) * 2.0 - 1.0;
    color += g * uGrainStrength * max(color.r, max(color.g, color.b));

    color *= 1.0 + uScrollEnergy * 0.15;
    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`

// Curated palette pools — each entry is five RGB triplets.
const DARK_PALETTES: number[][][] = [
  [[1.0,0.15,0.60],[0.15,0.90,1.00],[0.30,0.30,1.00],[0.70,0.20,1.00],[1.00,0.40,0.85]], // neon flux
  [[1.0,0.50,0.15],[1.00,0.20,0.25],[1.00,0.78,0.20],[0.90,0.20,0.60],[0.50,0.15,0.65]], // sunset
  [[0.2,1.00,0.60],[0.10,0.80,0.95],[0.20,0.50,1.00],[0.50,1.00,0.80],[0.55,0.30,1.00]], // aurora
  [[1.0,0.30,0.10],[1.00,0.62,0.12],[1.00,0.85,0.30],[0.95,0.20,0.35],[0.60,0.10,0.25]], // ember
  [[0.6,0.20,1.00],[1.00,0.20,0.80],[0.20,0.65,1.00],[0.95,0.45,1.00],[0.30,0.95,1.00]], // cyber violet
]
const LIGHT_PALETTES: number[][][] = [
  [[0.95,0.55,0.68],[0.55,0.80,1.00],[0.82,0.68,1.00],[1.00,0.78,0.60],[0.70,0.92,0.86]], // pastel dawn
  [[0.60,0.92,0.86],[0.66,0.84,1.00],[0.86,0.78,1.00],[0.98,0.84,0.66],[0.80,0.94,0.90]], // mint sky
  [[1.00,0.76,0.68],[0.84,0.74,1.00],[0.96,0.68,0.85],[0.74,0.86,1.00],[0.92,0.86,0.74]], // peach lilac
]

interface GlassParams {
  colors: number[][]
  base: number[]
  fluteWidth: number
  fluteStrength: number
  warp: number
  algo: number
  exposure: number
  grain: number
  seed: number
}

function genParams(isDark: boolean): GlassParams {
  const r = Math.random
  const pool = isDark ? DARK_PALETTES : LIGHT_PALETTES
  const pal = pool[Math.floor(r() * pool.length)]
  const scale = isDark ? 1.0 : 0.62
  return {
    colors: pal.map(c => c.map(x => x * scale)),
    base: isDark ? [0.005, 0.010, 0.055] : [0.58, 0.57, 0.60],
    fluteWidth: 28 + Math.floor(r() * 58),
    fluteStrength: 34 + Math.floor(r() * 86),
    warp: 0.02 + r() * 0.07,
    algo: r() < 0.5 ? 0 : 1,
    exposure: isDark ? 0.95 + r() * 0.6 : 0.80 + r() * 0.28,
    grain: (isDark ? 0.05 : 0.04) + r() * 0.045,
    seed: r() * 10.0,
  }
}

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
  // One random variant rolled per theme, per page load.
  private _darkParams = genParams(true)
  private _lightParams = genParams(false)

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
        uTime:            { value: 0.0 },
        uReducedMotion:   { value: 0.0 },
        uScrollEnergy:    { value: 0.0 },
        uResolution:      { value: new Vector2(width, height) },
        uPointer:         { value: new Vector2(0, 0) },
        uWarpStrength:    { value: 0.05 },
        uFluteWidth:      { value: 48 },
        uFluteStrength:   { value: 70 },
        uToneMapExposure: { value: 1.1 },
        uGrainStrength:   { value: 0.07 },
        uSeed:            { value: 0 },
        uAlgo:            { value: 0 },
        uBase:            { value: new Vector3() },
        uC1:              { value: new Vector3() },
        uC2:              { value: new Vector3() },
        uC3:              { value: new Vector3() },
        uC4:              { value: new Vector3() },
        uC5:              { value: new Vector3() },
      },
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false,
    })

    this._applyParams(this._darkParams)

    this.mesh = new Mesh(this._geometry, this.material)
    this.mesh.position.z = BACK_Z
    this.mesh.renderOrder = -10
    this.mesh.frustumCulled = false
    this.mesh.visible = true
    experience.scene.add(this.mesh)
    this.resize()
  }

  private _applyParams(p: GlassParams) {
    const u = this.material.uniforms
    u.uWarpStrength.value    = p.warp
    u.uFluteWidth.value      = p.fluteWidth
    u.uFluteStrength.value   = p.fluteStrength
    u.uToneMapExposure.value = p.exposure
    u.uGrainStrength.value   = p.grain
    u.uSeed.value            = p.seed
    u.uAlgo.value            = p.algo
    ;(u.uBase.value as Vector3).set(p.base[0], p.base[1], p.base[2])
    const cs = [u.uC1, u.uC2, u.uC3, u.uC4, u.uC5]
    cs.forEach((c, i) => (c.value as Vector3).set(p.colors[i][0], p.colors[i][1], p.colors[i][2]))
  }

  setTheme(isDark: boolean) {
    this._isDark = isDark
    this._applyParams(isDark ? this._darkParams : this._lightParams)

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
    ;(this.material.uniforms.uResolution.value as Vector2).set(width, height)
  }

  update(elapsed: number, pointer: Vector2, scrollSpeed: number) {
    this.material.uniforms.uTime.value = elapsed / 1000

    const tx = pointer.x * 0.5
    const ty = pointer.y * 0.5
    this._pointer.x += (tx - this._pointer.x) * 0.03
    this._pointer.y += (ty - this._pointer.y) * 0.03
    ;(this.material.uniforms.uPointer.value as Vector2).set(this._pointer.x, this._pointer.y)

    this.material.uniforms.uReducedMotion.value = this._reducedMotion ? 1.0 : 0.0

    // Scroll energy — quick attack, slow decay; floor ignores the idle drift.
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
