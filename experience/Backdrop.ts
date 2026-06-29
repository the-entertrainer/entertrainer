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

// Photoreal-ish shattered glass over a glossy iridescent gradient. Rather than
// painting crack lines, this builds a real glass *normal field* (faceted shards
// + two crack scales, concentrated into a diagonal band) and renders it with
// proper screen-space refraction, chromatic dispersion (a per-channel IOR
// sampling loop), Fresnel reflection against a procedural studio environment,
// and Blinn-Phong specular glints. Technique per Maxime Heckel's refraction /
// dispersion write-up, adapted to sample an analytic background.
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
  float t(float s){ return uTime * s * (1.0 - uReducedMotion * 0.9); }
  vec3 sat(vec3 c, float i){ vec3 L = vec3(0.2125, 0.7154, 0.0721); return mix(vec3(dot(c, L)), c, i); }

  // Glossy iridescent gradient — kept cheap so the dispersion loop can sample it.
  vec3 background(vec2 uv){
    vec2 p = uv + 0.05 * vec2(sin(uv.y * 4.0 + t(0.25)), cos(uv.x * 3.2 + t(0.2)));
    float d = clamp(0.55 * p.x + 0.62 * (1.0 - p.y), 0.0, 1.0);
    vec3 gold    = vec3(0.98, 0.66, 0.30);
    vec3 magenta = vec3(0.62, 0.16, 0.45);
    vec3 purple  = vec3(0.24, 0.14, 0.55);
    vec3 teal    = vec3(0.06, 0.45, 0.60);
    vec3 blue    = vec3(0.07, 0.16, 0.50);
    vec3 c = gold;
    c = mix(c, magenta, smoothstep(0.05, 0.27, d));
    c = mix(c, purple,  smoothstep(0.25, 0.44, d));
    c = mix(c, teal,    smoothstep(0.44, 0.66, d));
    c = mix(c, blue,    smoothstep(0.66, 0.95, d));
    float s1 = 0.5 + 0.5 * sin((p.x * 1.5 + p.y) * 7.0 + t(0.5) + 2.0 * sin(p.y * 5.0 + t(0.3)));
    c += vec3(0.7, 0.8, 1.0) * pow(s1, 4.0) * 0.18;
    float s2 = 0.5 + 0.5 * sin((p.x - p.y) * 9.0 - t(0.4));
    c += vec3(1.0, 0.8, 0.6) * pow(s2, 6.0) * 0.10;
    return c;
  }

  // Procedural studio environment for Fresnel reflections.
  vec3 envReflect(vec3 R){
    float y = R.y * 0.5 + 0.5;
    vec3 e = mix(vec3(0.02, 0.03, 0.06), vec3(0.6, 0.75, 0.95), smoothstep(0.2, 0.9, y));
    e += vec3(1.0) * smoothstep(0.62, 0.64, y) * 0.5;                       // soft-box highlight
    e += vec3(1.0, 0.95, 0.9) * pow(max(R.x * 0.5 + 0.5, 0.0), 8.0) * 0.4;  // side key
    return e;
  }

  void voronoi(vec2 x, out float border, out vec2 ndir, out vec2 cid){
    vec2 n = floor(x), f = fract(x), mg = vec2(0.0), mr = vec2(0.0);
    float md = 8.0;
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash22(n + g);
      vec2 r = g + o - f;
      float dd = dot(r, r);
      if (dd < md){ md = dd; mr = r; mg = g; }
    }
    border = 8.0; vec2 bd = vec2(0.0);
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){
      vec2 g = mg + vec2(float(i), float(j));
      vec2 o = hash22(n + g);
      vec2 r = g + o - f;
      vec2 df = mr - r;
      if (dot(df, df) > 0.0001){
        float b = dot(0.5 * (mr + r), normalize(r - mr));
        if (b < border){ border = b; bd = normalize(r - mr); }
      }
    }
    ndir = bd; cid = n + mg;
  }

  // The shattered-glass surface normal: smooth flowing base everywhere, faceted
  // shards + two crack scales concentrated in a diagonal band.
  vec3 glassNormal(vec2 uv, out float bevel){
    vec2 ar = vec2(uResolution.x / uResolution.y, 1.0);
    float dl      = abs((uv.x - 0.52) - (1.0 - uv.y) * 0.12);
    float band    = smoothstep(0.5, 0.0, dl);
    float organic = smoothstep(0.30, 0.72, vnoise(uv * ar * 2.5 + 3.0));
    float mask    = clamp(band * (0.5 + organic), 0.0, 1.0);

    float border; vec2 ndir, cid;
    voronoi(uv * ar * 9.0 + uPointer * 0.2, border, ndir, cid);
    vec2 tilt   = (hash22(cid + 3.1) - 0.5) * 0.85;     // per-shard facet slope
    vec3 facetN = normalize(vec3(tilt, 1.0));
    bevel       = smoothstep(0.06, 0.0, border) * mask;
    vec3 bevelN = normalize(vec3(ndir * 1.6, 0.5));
    vec3 N = normalize(mix(facetN, bevelN, bevel));

    // finer secondary cracks for crystalline detail
    float border2; vec2 ndir2, cid2;
    voronoi(uv * ar * 21.0 - uPointer * 0.1, border2, ndir2, cid2);
    float bevel2 = smoothstep(0.035, 0.0, border2) * mask;
    vec3 bevelN2 = normalize(vec3(ndir2 * 1.4, 0.5));
    N = normalize(mix(N, bevelN2, bevel2 * 0.6));
    bevel = max(bevel, bevel2 * 0.85);

    // gentle smooth flow for the un-cracked glossy areas
    vec2 flow = 0.12 * vec2(sin(uv.y * 6.0 + t(0.4)), cos(uv.x * 5.0 + t(0.35)));
    vec3 baseN = normalize(vec3(flow, 1.0));
    N = normalize(mix(baseN, N, mask * 0.85 + 0.15));
    return N;
  }

  void main(){
    vec2 uv = vUv;
    vec2 ar = vec2(uResolution.x / uResolution.y, 1.0);

    float bevel; vec3 N = glassNormal(uv, bevel);
    vec3 eye = normalize(vec3((uv - 0.5) * ar * 0.7, -1.0));

    // ── Refraction with chromatic dispersion (per-channel IOR sampling loop) ──
    float power = 0.14;
    vec3 refrCol = vec3(0.0);
    const int LOOP = 12;
    for (int i = 0; i < LOOP; i++){
      float sl = float(i) / float(LOOP) * 0.5;
      vec3 rR = refract(eye, N, 1.0 / 1.44);
      vec3 rG = refract(eye, N, 1.0 / 1.47);
      vec3 rB = refract(eye, N, 1.0 / 1.50);
      refrCol.r += background(uv + rR.xy * (power + sl * 0.02)).r;
      refrCol.g += background(uv + rG.xy * (power + sl * 0.03)).g;
      refrCol.b += background(uv + rB.xy * (power + sl * 0.04)).b;
    }
    refrCol /= float(LOOP);
    refrCol = sat(refrCol, 1.2);

    // ── Fresnel: blend refraction toward the reflected environment at edges ──
    float F = pow(1.0 - abs(dot(eye, N)), 4.0);
    vec3 R = reflect(eye, N);
    vec3 col = mix(refrCol, envReflect(R), clamp(F * 0.9, 0.0, 0.92));

    // ── Blinn-Phong specular glints (cool key + warm fill) ───────────────────
    vec3 L1 = normalize(vec3(-0.5, 0.6, 0.6)); vec3 H1 = normalize(L1 - eye);
    col += vec3(1.0) * pow(max(dot(N, H1), 0.0), 120.0) * 1.2;
    vec3 L2 = normalize(vec3(0.6, -0.4, 0.6)); vec3 H2 = normalize(L2 - eye);
    col += vec3(1.0, 0.9, 0.8) * pow(max(dot(N, H2), 0.0), 80.0) * 0.7;

    // ── Crystalline edge glint + round sparkle on the bevels ─────────────────
    col += vec3(0.9, 0.95, 1.0) * pow(bevel, 1.6) * 0.5;
    vec2 sg = uv * ar * 130.0;
    vec2 sid = floor(sg); vec2 sf = fract(sg) - 0.5;
    float sr = hash21(sid + floor(t(2.5)));
    float sparkle = step(0.70, sr) * smoothstep(0.5, 0.0, length(sf));
    col += vec3(1.0) * sparkle * smoothstep(0.08, 0.55, bevel) * 2.4;

    // ── Scroll-reactive energy + soft bloom on highlights ────────────────────
    col *= 1.0 + uScrollEnergy * 0.3;
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col += col * smoothstep(0.75, 1.5, lum) * 0.4;

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
