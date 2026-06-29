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

// Organic monochrome shattered-crystal glass, theme-aware.
//
// The fracture is generated organically (heavy domain-warp + ridged multi-fractal
// cracks + sparse warped-Voronoi shards with broken edges, concentrated by a
// warped noise mask) — no honeycomb. It's baked into a height field whose normal
// drives real glass: screen-space refraction with a faint chromatic dispersion
// loop, Fresnel reflection against a procedural studio environment, and
// Blinn-Phong specular. Monochrome, with two distinct aesthetics:
//   dark  → dramatic obsidian / smoked glass (charcoal base, sharp silver fractures)
//   light → soft frosted pearl (airy off-white, gentle crack shadows, diffuse glints)
const fragmentShader = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uIsDark;
  uniform vec2  uPointer;
  uniform vec2  uResolution;
  uniform float uReducedMotion;
  uniform float uScrollEnergy;
  varying vec2 vUv;

  float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  vec2 hash22(vec2 p){
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i), b = hash21(i + vec2(1.0,0.0)), c = hash21(i + vec2(0.0,1.0)), d = hash21(i + vec2(1.0,1.0));
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }
  float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * vnoise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return v; }
  float t(float s){ return uTime * s * (1.0 - uReducedMotion * 0.9); }
  vec3 sat(vec3 c, float i){ vec3 L = vec3(0.2125, 0.7154, 0.0721); return mix(vec3(dot(c, L)), c, i); }
  vec2 warp2(vec2 p){ float b = t(0.08); return vec2(fbm(p + vec2(0.0, b)), fbm(p + vec2(3.1, 1.7) - b)); }

  // Monochrome flowing tone — charcoal (dark) or pearl-white (light).
  vec3 background(vec2 uv){
    vec2 p = uv + 0.05 * vec2(sin(uv.y * 4.0 + t(0.25)), cos(uv.x * 3.2 + t(0.2)));
    float v = 0.5 + 0.30 * sin((p.x * 1.4 + p.y) * 3.0 + t(0.3)) + 0.18 * sin((p.x - p.y) * 5.0 - t(0.25));
    v = clamp(mix(v, 1.0 - uv.y, 0.30), 0.0, 1.0);
    vec3 dk = vec3(0.045, 0.050, 0.065) + v * vec3(0.15, 0.17, 0.21);
    vec3 lt = vec3(0.72, 0.71, 0.69) + v * vec3(0.22, 0.22, 0.23);
    return mix(lt, dk, uIsDark);
  }

  // Procedural studio environment for Fresnel reflections (theme-aware).
  vec3 envReflect(vec3 R){
    float y = R.y * 0.5 + 0.5;
    vec3 dk = mix(vec3(0.02, 0.02, 0.03), vec3(0.55, 0.62, 0.78), smoothstep(0.25, 0.95, y));
    dk += vec3(0.80, 0.88, 1.0) * smoothstep(0.62, 0.66, y) * 0.7;
    vec3 lt = mix(vec3(0.56, 0.56, 0.58), vec3(1.0, 1.0, 1.0), smoothstep(0.1, 0.9, y));
    lt += vec3(1.0) * smoothstep(0.7, 0.74, y) * 0.25;
    return mix(lt, dk, uIsDark);
  }

  void voronoi(vec2 x, out float border, out vec2 cid){
    vec2 n = floor(x), f = fract(x), mg = vec2(0.0), mr = vec2(0.0);
    float md = 8.0;
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash22(n + g);
      vec2 r = g + o - f;
      float dd = dot(r, r);
      if (dd < md){ md = dd; mr = r; mg = g; }
    }
    border = 8.0;
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){
      vec2 g = mg + vec2(float(i), float(j));
      vec2 o = hash22(n + g);
      vec2 r = g + o - f;
      vec2 df = mr - r;
      if (dot(df, df) > 0.0001){ float b = dot(0.5 * (mr + r), normalize(r - mr)); border = min(border, b); }
    }
    cid = n + mg;
  }

  // Organic crack value: ridged branching cracks + sparse broken-edge shards,
  // over a heavy domain warp — fracture, not honeycomb.
  float crackField(vec2 b){
    vec2 w = warp2(b * 1.2);
    vec2 p = b + (w - 0.5) * 0.55;
    float r1 = fbm(p * 2.5 + w * 0.95); float c1 = 1.0 - abs(r1 - 0.5) * 2.0; c1 = pow(smoothstep(0.72, 1.0, c1), 1.3);
    float r2 = fbm(p * 5.2 - w * 0.6);  float c2 = 1.0 - abs(r2 - 0.5) * 2.0; c2 = pow(smoothstep(0.80, 1.0, c2), 1.6);
    float bv; vec2 ci; voronoi(p * 4.2, bv, ci);
    float cv = (1.0 - smoothstep(0.0, 0.045, bv)) * step(0.45, hash21(ci + 0.7));
    return max(max(c1, c2 * 0.7), cv * 0.9);
  }

  // Glass surface height (cracks are grooves) — its gradient gives the normal.
  float surfaceH(vec2 b){
    float crack = crackField(b);
    vec2 w = warp2(b * 1.2);
    vec2 p = b + (w - 0.5) * 0.55;
    float facet = fbm(p * 1.8) * 0.5;
    return facet * 0.85 - crack * 1.1;
  }

  void main(){
    vec2 uv = vUv;
    vec2 ar = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 b = uv * ar;

    // organic shatter concentration (warped noise + mild central bias)
    vec2 w0 = warp2(b * 0.9);
    float cen = smoothstep(1.0, 0.15, abs(uv.x - 0.58));
    float mask = smoothstep(0.34, 0.66, fbm(b * 1.0 + w0 * 0.85) + cen * 0.16);

    // height-field normal, flattened in the smooth glossy areas
    float e = 1.3 / uResolution.y;
    float h = surfaceH(b), hx = surfaceH(b + vec2(e, 0.0)), hy = surfaceH(b + vec2(0.0, e));
    vec3 N = normalize(vec3((h - hx) / e, (h - hy) / e, 1.0));
    N = normalize(mix(vec3(0.0, 0.0, 1.0), N, mask * 0.9 + 0.1));
    float crack = crackField(b) * mask;

    vec3 eye = normalize(vec3((uv - 0.5) * ar * 0.7, -1.0));

    // refraction with a faint chromatic dispersion loop (subtle — monochrome)
    float power = 0.20;
    float disp = mix(0.55, 1.0, uIsDark);
    vec3 refrCol = vec3(0.0);
    const int LOOP = 10;
    for (int i = 0; i < LOOP; i++){
      float sl = float(i) / float(LOOP) * 0.5;
      vec3 rR = refract(eye, N, 1.0 / (1.46 - 0.03 * disp));
      vec3 rG = refract(eye, N, 1.0 / 1.46);
      vec3 rB = refract(eye, N, 1.0 / (1.46 + 0.04 * disp));
      refrCol.r += background(uv + rR.xy * (power + sl * 0.02)).r;
      refrCol.g += background(uv + rG.xy * (power + sl * 0.03)).g;
      refrCol.b += background(uv + rB.xy * (power + sl * 0.04)).b;
    }
    refrCol /= float(LOOP);
    refrCol = sat(refrCol, mix(1.02, 1.10, uIsDark));

    // Fresnel reflection
    float F = pow(1.0 - abs(dot(eye, N)), mix(3.0, 4.0, uIsDark));
    vec3 R = reflect(eye, N);
    vec3 col = mix(refrCol, envReflect(R), clamp(F * mix(0.55, 0.9, uIsDark), 0.0, 0.92));

    // specular glints + crack edge highlight + groove AO — all theme-weighted
    vec3 hi = mix(vec3(1.0, 0.99, 0.97), vec3(0.88, 0.93, 1.0), uIsDark);
    float specPow = mix(36.0, 110.0, uIsDark);
    float specAmt = mix(0.45, 1.3, uIsDark);
    vec3 L1 = normalize(vec3(-0.5, 0.6, 0.6)); vec3 H1 = normalize(L1 - eye);
    col += hi * pow(max(dot(N, H1), 0.0), specPow) * specAmt;
    vec3 L2 = normalize(vec3(0.6, -0.4, 0.6)); vec3 H2 = normalize(L2 - eye);
    col += hi * pow(max(dot(N, H2), 0.0), specPow * 0.7) * specAmt * 0.6;
    col += hi * pow(crack, 1.5) * mix(0.18, 0.5, uIsDark);
    col *= 1.0 - crack * mix(0.28, 0.16, uIsDark);

    // scroll-reactive energy + soft bloom on highlights
    col *= 1.0 + uScrollEnergy * 0.3;
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col += col * smoothstep(0.78, 1.5, lum) * 0.4;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
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
