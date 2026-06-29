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

// Shattered crystal over a glossy iridescent gradient. A smooth, lit,
// domain-warped colour field (gold → magenta → purple → teal → blue) flows like
// liquid metal; a Voronoi crack-web — concentrated into a diagonal band — sits
// over it as bright crystalline glass with refraction, prismatic fringing and
// sparkle. Breathing ripples, pointer parallax and a scroll-reactive swell keep
// it alive. prefers-reduced-motion eases it toward a freeze.
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
  float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ v += a * vnoise(p); p *= 2.02; a *= 0.5; } return v; }

  // time, scaled — eases toward a near-freeze under prefers-reduced-motion
  float t(float s){ return uTime * s * (1.0 - uReducedMotion * 0.9); }

  vec2 warp(vec2 p){
    float b = t(0.12);
    return vec2(fbm(p + vec2(0.0, b)), fbm(p + vec2(5.2, 1.3) - b * 0.7));
  }

  // Glossy iridescent flowing surface — domain-warped gradient lit for sheen.
  vec3 background(vec2 uv){
    vec2 q = warp(uv * 1.6);
    vec2 p = uv + (q - 0.5) * 0.30;
    float d = clamp(0.55 * p.x + 0.62 * (1.0 - p.y) + (q.x - 0.5) * 0.30, 0.0, 1.0);
    vec3 gold    = vec3(0.95, 0.62, 0.28);
    vec3 magenta = vec3(0.55, 0.16, 0.42);
    vec3 purple  = vec3(0.26, 0.15, 0.52);
    vec3 teal    = vec3(0.08, 0.42, 0.56);
    vec3 blue    = vec3(0.09, 0.17, 0.46);
    vec3 c = gold;
    c = mix(c, magenta, smoothstep(0.04, 0.26, d));
    c = mix(c, purple,  smoothstep(0.24, 0.42, d));
    c = mix(c, teal,    smoothstep(0.42, 0.66, d));
    c = mix(c, blue,    smoothstep(0.66, 0.95, d));
    // sheen from a height-field normal
    float e = 0.0035;
    float h0 = fbm(p * 3.0 + q * 2.0);
    float hx = fbm((p + vec2(e, 0.0)) * 3.0 + q * 2.0);
    float hy = fbm((p + vec2(0.0, e)) * 3.0 + q * 2.0);
    vec3 N = normalize(vec3((h0 - hx) / e, (h0 - hy) / e, 6.0));
    vec3 L = normalize(vec3(-0.45, 0.55, 0.7)), V = vec3(0.0, 0.0, 1.0), H = normalize(L + V);
    float diff = 0.55 + 0.45 * max(dot(N, L), 0.0);
    float spec = pow(max(dot(N, H), 0.0), 48.0);
    c *= 0.62 + 0.55 * diff;
    c += vec3(0.85, 0.92, 1.0) * spec * 0.7;
    return c;
  }

  // Voronoi — distance to nearest shard border + the border's normal direction.
  void voronoi(vec2 x, out float border, out vec2 ndir){
    vec2 n = floor(x), f = fract(x), mg = vec2(0.0), mr = vec2(0.0);
    float md = 8.0;
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash22(n + g);
      vec2 r = g + o - f;
      float dd = dot(r, r);
      if (dd < md){ md = dd; mr = r; mg = g; }
    }
    border = 8.0; vec2 bdir = vec2(0.0);
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){
      vec2 g = mg + vec2(float(i), float(j));
      vec2 o = hash22(n + g);
      vec2 r = g + o - f;
      vec2 df = mr - r;
      if (dot(df, df) > 0.0001){
        float bd = dot(0.5 * (mr + r), normalize(r - mr));
        if (bd < border){ border = bd; bdir = normalize(r - mr); }
      }
    }
    ndir = bdir;
  }

  void main(){
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 ar = vec2(aspect, 1.0);
    float bt = t(0.4);

    // breathing ripples
    vec2 rp = uv * ar;
    vec2 ripple = vec2(
      sin(rp.y * 7.0 + bt) + sin(rp.x * 5.0 - bt * 0.8),
      cos(rp.x * 6.0 + bt * 0.9)
    ) * 0.004 * (0.7 + 0.3 * sin(t(0.2)));

    // crack web — two scales, focused into a diagonal band
    vec2 nd1; float b1; voronoi(uv * ar * 8.5 + ripple * 3.0 + uPointer * 0.2, b1, nd1);
    vec2 nd2; float b2; voronoi(uv * ar * 22.0 - ripple * 2.0, b2, nd2);
    float crack1 = 1.0 - smoothstep(0.0, 0.03, b1);
    float crack2 = 1.0 - smoothstep(0.0, 0.018, b2);
    float dl      = abs((uv.x - 0.52) - (1.0 - uv.y) * 0.12);
    float band    = smoothstep(0.46, 0.0, dl);
    float organic = smoothstep(0.26, 0.72, fbm(uv * ar * 2.4 + 3.0));
    float mask    = clamp(band * (0.5 + organic), 0.0, 1.0);
    float cracks  = max(crack1, crack2 * 0.7) * mask;

    // glass refracts the surface beneath the cracks
    vec2 refr = nd1 * cracks * 0.11 + ripple;
    vec3 col = background(uv + refr);

    // bright crystalline glass
    col += vec3(0.88, 0.95, 1.0) * pow(cracks, 1.25) * 1.9;

    // prismatic fringing along the cracks
    float hue = fract(b1 * 6.0 + t(0.3));
    vec3 prism = 0.5 + 0.5 * cos(6.28318 * (hue + vec3(0.0, 0.33, 0.67)));
    col += prism * cracks * 0.25;

    // crystalline sparkle
    vec2 sc = floor((uv * ar + ripple) * 90.0);
    float spk = hash21(sc + floor(t(3.0)));
    spk = pow(max(spk - 0.80, 0.0) / 0.20, 4.0);
    col += vec3(1.0) * spk * cracks * 2.4;

    // scroll-reactive energy + soft bloom on highlights
    col *= 1.0 + uScrollEnergy * 0.3;
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col += col * smoothstep(0.7, 1.5, lum) * 0.4;

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
