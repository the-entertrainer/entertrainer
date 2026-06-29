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
// gradient, distorted by an animated two-scale simplex-noise warp, with film
// grain and tone-mapping. Technique from franky-adl/fractal-glass-gradients,
// reproduced procedurally (noise-warp + grain generated in-shader). Colour
// model is theme-aware and vivid in BOTH themes: dark = additive glow on black,
// light = subtractive "ink" on white. Every load randomises palette + warp +
// flute + brightness params.
const fragmentShader = /* glsl */`
  precision highp float;
  uniform float uTime, uWarpStrength, uWarpSpeed, uNoiseScaleX, uNoiseScaleY, uFlowSpeed;
  uniform float uFluteWidth, uFluteStrength, uBrightness, uGrainStrength, uSeed, uAlgo, uLight;
  uniform vec2  uResolution, uPointer;
  uniform vec3  uC1, uC2, uC3, uC4, uC5, uBase;
  varying vec2 vUv;

  vec3 permute(vec3 x){ return mod((x*34.0+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0); m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5); vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g; g.x = a0.x*x0.x + h.x*x0.y; g.yz = a0.yz*x12.xz + h.yz*x12.yw;
    return 130.0 * dot(m, g);
  }
  float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float atanh_(float x){ x = clamp(x, -0.9999, 0.9999); return 0.5 * log((1.0 + x) / (1.0 - x)); }
  vec2 rot(vec2 v, float a){ float s = sin(a), c = cos(a); return mat2(c, -s, s, c) * v; }

  // Animated two-scale simplex warp (mirrors the repo's noise.glsl).
  vec2 warpVec(vec2 p){
    float t = uTime * uWarpSpeed;
    vec2 sc = vec2(uNoiseScaleX, uNoiseScaleY) * 4.0;
    return vec2(snoise(p * sc + t * 0.5), snoise(p * sc * 0.93 - t * 0.3));
  }

  // Returns vec4(accumulated colour, total gaussian weight).
  vec4 field(vec2 uv){
    float t = uTime * 0.6 * uFlowSpeed + 3.5 + uSeed;
    if (uAlgo < 0.5){
      vec2 p1 = vec2(-0.28+sin(t*0.7+0.5)*0.15,  0.06+cos(t*0.5)*0.12);
      vec2 p2 = vec2(-0.06+sin(t*0.4+1.2)*0.18,  0.16+cos(t*0.6)*0.15);
      vec2 p3 = vec2( 0.07+sin(t*0.5+3.4)*0.20,  0.00+cos(t*0.4)*0.14);
      vec2 p4 = vec2( 0.22+sin(t*0.3+2.3)*0.24, -0.10+cos(t*0.7)*0.14);
      vec2 p5 = vec2( 0.30+sin(t*0.6+1.1)*0.18,  0.06+cos(t*0.4)*0.13);
      float g1=exp(-dot(uv-p1,uv-p1)*12.0)*1.4, g2=exp(-dot(uv-p2,uv-p2)*20.0)*2.0, g3=exp(-dot(uv-p3,uv-p3)*9.0)*1.6, g4=exp(-dot(uv-p4,uv-p4)*15.0)*1.3, g5=exp(-dot(uv-p5,uv-p5)*25.0)*0.8;
      return vec4(uC1*g1+uC2*g2+uC3*g3+uC4*g4+uC5*g5, g1+g2+g3+g4+g5);
    } else {
      vec2 p1 = vec2(-0.32+sin(t*0.5+1.8)*0.20, -0.12+cos(t*0.8+0.3)*0.16);
      vec2 p2 = vec2( 0.10+sin(t*0.6+2.5)*0.14,  0.24+cos(t*0.3+1.7)*0.18);
      vec2 p3 = vec2(-0.15+sin(t*0.9+0.7)*0.22, -0.08+cos(t*0.5+2.9)*0.11);
      vec2 p4 = vec2( 0.28+sin(t*0.4+3.1)*0.17,  0.18+cos(t*0.6+0.9)*0.20);
      vec2 p5 = vec2(-0.05+sin(t*0.7+4.2)*0.13, -0.20+cos(t*0.9+1.5)*0.15);
      vec2 r1=rot(uv-p1,0.3), r2=rot(uv-p2,-1.1), r3=rot(uv-p3,0.8), r4=rot(uv-p4,-0.5), r5=rot(uv-p5,1.4);
      float g1=exp(-(r1.x*r1.x*8.0+r1.y*r1.y*1.0))*1.4, g2=exp(-(r2.x*r2.x*25.0+r2.y*r2.y*12.0))*2.0, g3=exp(-(r3.x*r3.x*6.0+r3.y*r3.y*14.0))*1.6, g4=exp(-(r4.x*r4.x*20.0+r4.y*r4.y*8.0))*1.3, g5=exp(-(r5.x*r5.x*30.0+r5.y*r5.y*15.0))*0.8;
      return vec4(uC1*g1+uC2*g2+uC3*g3+uC4*g4+uC5*g5, g1+g2+g3+g4+g5);
    }
  }

  void main(){
    vec2 ar = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 frag = vUv * uResolution; vec2 mapped = frag - uResolution * 0.5;
    vec2 scaled = mapped / uFluteWidth; vec2 fr = vec2(fract(scaled.x), scaled.y);
    float fx =  uFluteStrength * (fr.x - 0.5);
    float fy = -uFluteStrength * atanh_(pow(fr.x, 6.0));
    vec2 fc = vec2(mapped.x + fx, mapped.y + fy);
    vec2 fuv = fc / uResolution.y + uPointer * 0.01;

    vec2 warp = warpVec(vUv * ar) * uWarpStrength;
    vec4 fld = field(fuv + warp);
    vec3 glow = fld.rgb; float totalG = fld.a;

    vec3 col;
    if (uLight > 0.5) {
      // vivid colour on white — subtractive ink (CMY-on-paper)
      vec3 ink = (vec3(totalG) - glow) * uBrightness;
      col = uBase - ink;
    } else {
      // vivid colour on black — additive glow + HDR tone-map
      col = uBase + glow;
      col = 1.0 - exp(-col * uBrightness);
    }

    float gr = hash21(vUv * uResolution + fract(uTime * 0.5) * 100.0) * 2.0 - 1.0;
    col += gr * uGrainStrength * max(col.r, max(col.g, col.b));
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`

// Vivid palette pool (used in both themes — the colour model differs, not the hues).
const PALETTES: number[][][] = [
  [[1.0,0.15,0.60],[0.15,0.90,1.00],[0.30,0.30,1.00],[0.70,0.20,1.00],[1.00,0.40,0.85]], // neon flux
  [[1.0,0.50,0.15],[1.00,0.20,0.25],[1.00,0.78,0.20],[0.90,0.20,0.60],[0.50,0.15,0.65]], // sunset
  [[0.2,1.00,0.60],[0.10,0.80,0.95],[0.20,0.50,1.00],[0.50,1.00,0.80],[0.55,0.30,1.00]], // aurora
  [[1.0,0.30,0.10],[1.00,0.62,0.12],[1.00,0.85,0.30],[0.95,0.20,0.35],[0.60,0.10,0.25]], // ember
  [[0.6,0.20,1.00],[1.00,0.20,0.80],[0.20,0.65,1.00],[0.95,0.45,1.00],[0.30,0.95,1.00]], // cyber violet
]

interface GlassParams {
  colors: number[][]; base: number[]; light: number
  algo: number; noiseScale1: number; noiseScale2: number
  warp: number; warpSpeed: number; flowSpeed: number; grain: number
  fluteWidth: number; fluteStrength: number; brightness: number; seed: number
}

function genParams(isDark: boolean): GlassParams {
  const r = Math.random
  return {
    colors: PALETTES[Math.floor(r() * PALETTES.length)],
    base: isDark ? [0.005, 0.010, 0.055] : [0.98, 0.97, 0.96],
    light: isDark ? 0 : 1,
    // randomised every page load
    algo: r() < 0.5 ? 0 : 1,
    noiseScale1: 0.25 + r() * 0.35,
    noiseScale2: 0.40 + r() * 0.40,
    warp: 0.03 + r() * 0.07,
    warpSpeed: 0.06 + r() * 0.10,
    fluteStrength: 80 + Math.floor(r() * 80),
    seed: r() * 10.0,
    // fixed
    flowSpeed: 2.0,
    grain: 0.07,
    fluteWidth: 100,
    brightness: isDark ? 1.10 : 0.20,
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
  private _clock = 0
  private _lastElapsed = 0
  private _mqListener: (() => void) | null = null
  private _darkParams = genParams(true)
  private _lightParams = genParams(false)
  private _activeColors: number[][] = []

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
        uResolution:    { value: new Vector2(width, height) },
        uPointer:       { value: new Vector2(0, 0) },
        uWarpStrength:  { value: 0.05 },
        uWarpSpeed:     { value: 0.1 },
        uNoiseScaleX:   { value: 0.35 },
        uNoiseScaleY:   { value: 0.55 },
        uFlowSpeed:     { value: 1.0 },
        uFluteWidth:    { value: 70 },
        uFluteStrength: { value: 140 },
        uBrightness:    { value: 1.0 },
        uGrainStrength: { value: 0.07 },
        uSeed:          { value: 0 },
        uAlgo:          { value: 0 },
        uLight:         { value: 0 },
        uBase:          { value: new Vector3() },
        uC1:            { value: new Vector3() },
        uC2:            { value: new Vector3() },
        uC3:            { value: new Vector3() },
        uC4:            { value: new Vector3() },
        uC5:            { value: new Vector3() },
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

  // The active palette (5 RGB triplets), so the cards can harmonise with it.
  getPalette(): number[][] { return this._activeColors }

  private _applyParams(p: GlassParams) {
    this._activeColors = p.colors
    // Publish the primary accent to CSS so chrome (e.g. edge fog) can match it.
    if (typeof document !== 'undefined') {
      const c = p.colors[0]
      document.documentElement.style.setProperty(
        '--accent-fog',
        `${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)}`
      )
    }
    const u = this.material.uniforms
    u.uWarpStrength.value  = p.warp
    u.uWarpSpeed.value     = p.warpSpeed
    u.uNoiseScaleX.value   = p.noiseScale1
    u.uNoiseScaleY.value   = p.noiseScale2
    u.uFlowSpeed.value     = p.flowSpeed
    u.uFluteWidth.value    = p.fluteWidth
    u.uFluteStrength.value = p.fluteStrength
    u.uBrightness.value    = p.brightness
    u.uGrainStrength.value = p.grain
    u.uSeed.value          = p.seed
    u.uAlgo.value          = p.algo
    u.uLight.value         = p.light
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

  update(elapsed: number, pointer: Vector2, _scrollSpeed: number) {
    // Advance our own clock so prefers-reduced-motion can freeze the animation.
    const dt = elapsed - this._lastElapsed
    this._lastElapsed = elapsed
    if (!this._reducedMotion) this._clock += dt
    this.material.uniforms.uTime.value = this._clock / 1000

    const tx = pointer.x * 0.5
    const ty = pointer.y * 0.5
    this._pointer.x += (tx - this._pointer.x) * 0.03
    this._pointer.y += (ty - this._pointer.y) * 0.03
    ;(this.material.uniforms.uPointer.value as Vector2).set(this._pointer.x, this._pointer.y)
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
