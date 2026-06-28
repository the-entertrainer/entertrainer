import { Mesh, PlaneGeometry, ShaderMaterial, CanvasTexture, Vector2 } from 'three'
import type Experience from './Experience'

const BACK_Z      = -6
const OVERSCAN    = 0.92
const CANVAS_CAP  = 1600
const REST_BLUR   = 0.0025
const MAX_BLUR    = 0.011
const FADE_MS     = 600   // crossfade duration between themes

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */`
  precision highp float;
  uniform sampler2D uTexture;   // current (outgoing during fade)
  uniform sampler2D uTextureB;  // incoming
  uniform float uCrossFade;     // 0 = only A, 1 = only B
  uniform vec2  uOffset;
  uniform vec2  uRepeat;
  uniform float uBlur;
  uniform float uAspect;
  uniform float uIsDark;
  varying vec2 vUv;

  #define SAMPLES 28

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.07 + vec2(0.13, 0.47);
      a *= 0.5;
    }
    return v;
  }

  // Scattered 4-pointed sketch stars decorating the paper/board
  float starField(vec2 uv) {
    vec2 g0 = floor(uv * 7.0);
    vec2 fr = fract(uv * 7.0) - 0.5;
    float v = 0.0;
    for (int i = -1; i <= 1; i++) {
      for (int j = -1; j <= 1; j++) {
        vec2 g = g0 + vec2(float(i), float(j));
        float active = smoothstep(0.58, 0.63, noise(g * 0.47));
        float jx = (noise(g + 5.3) - 0.5) * 0.6;
        float jy = (noise(g + 13.7) - 0.5) * 0.6;
        vec2 d = fr - vec2(jx + float(i), jy + float(j));
        float r = length(d) * 7.0;
        float a = atan(d.y, d.x);
        float spikes = abs(cos(a * 2.0));
        float sz = 0.06 + noise(g + 99.1) * 0.04;
        float star = smoothstep(sz * (0.2 + 0.8 * spikes), 0.0, r);
        v = max(v, star * active);
      }
    }
    return v;
  }

  vec3 sketchEffect(vec3 col, vec2 uv) {
    if (uIsDark > 0.5) {
      // ── Chalk on blackboard ──────────────────────────────────────────────
      float luma = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(vec3(luma * 0.50), col * 0.30, 0.25);
      float chalk = fbm(uv * 450.0) * 0.14;
      col += chalk * 0.60;
      float lineFreq  = 90.0;
      float lineVal   = fract(uv.y * lineFreq);
      float lineNoise = noise(vec2(uv.x * 60.0, uv.y * lineFreq)) * 0.3;
      float line = smoothstep(0.0, 0.04 + lineNoise, lineVal) *
                   (1.0 - smoothstep(0.82 - lineNoise, 0.95, lineVal));
      col = mix(col * 0.88, col, line);
      // Chalk stars
      float stars = starField(uv);
      col = mix(col, vec3(0.82, 0.79, 0.74), stars * 0.45);
    } else {
      // ── Pencil on warm cream paper ───────────────────────────────────────
      // Warm cream-ivory paper tone (#F5EFE8 ≈ 0.961, 0.937, 0.910)
      vec3 paper = vec3(0.961, 0.937, 0.910);
      float luma = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(vec3(luma), col, 0.40);   // partial desaturate
      col = mix(col, paper, 0.68);        // strong pull to warm paper
      float grain = fbm(uv * 550.0) * 0.07;
      col += grain * vec3(0.82, 0.74, 0.56);
      // Pencil hatching — very faint diagonal
      float hatch      = fract((uv.x + uv.y) * 140.0);
      float hatchNoise = noise(uv * 90.0) * 0.25;
      float hatchLine  = smoothstep(0.0, 0.04 + hatchNoise, hatch) *
                         (1.0 - smoothstep(0.94 - hatchNoise, 1.0, hatch));
      col = mix(col, col * 0.92, (1.0 - hatchLine) * 0.07);
      // Pencil stars
      float stars = starField(uv);
      col = mix(col, vec3(0.22, 0.19, 0.14), stars * 0.30);
    }
    return col;
  }

  void main() {
    vec2 baseUv = vUv * uRepeat + uOffset;
    vec3 sumA = texture2D(uTexture,  baseUv).rgb;
    vec3 sumB = texture2D(uTextureB, baseUv).rgb;
    float total = 1.0;
    const float golden = 2.399963229728653;
    for (int i = 0; i < SAMPLES; i++) {
      float fi = float(i) + 1.0;
      float r = uBlur * sqrt(fi / float(SAMPLES));
      float a = fi * golden;
      vec2 off = vec2(cos(a), sin(a)) * r;
      off.x /= uAspect;
      sumA += texture2D(uTexture,  baseUv + off).rgb;
      sumB += texture2D(uTextureB, baseUv + off).rgb;
      total += 1.0;
    }
    vec3 blurred = mix(sumA / total, sumB / total, uCrossFade);
    vec3 enhanced = sketchEffect(blurred, baseUv);

    float grain = noise(vUv * 240.0);
    grain = mix(0.5, grain, 0.4) - 0.5;
    enhanced += grain * 0.025;

    gl_FragColor = vec4(enhanced, 1.0);
  }
`

export default class Backdrop {
  experience: Experience
  mesh: Mesh
  material: ShaderMaterial

  private _geometry: PlaneGeometry
  private _texA: CanvasTexture | null = null  // currently displayed
  private _texB: CanvasTexture | null = null  // incoming (during crossfade)
  private _img: HTMLImageElement | null = null
  private _src = ''
  private _isDark = true
  private _enabled = false
  private _readyFired = false

  private _blur = 0
  private _parallax = new Vector2(0, 0)
  private _crossFadeStart = -1  // elapsed-ms when fade began; -1 = no fade

  constructor(experience: Experience) {
    this.experience = experience
    this._geometry = new PlaneGeometry(1, 1)
    const margin = (1 - OVERSCAN) / 2
    this.material = new ShaderMaterial({
      uniforms: {
        uTexture:   { value: null },
        uTextureB:  { value: null },
        uCrossFade: { value: 0.0 },
        uOffset:    { value: new Vector2(margin, margin) },
        uRepeat:    { value: new Vector2(OVERSCAN, OVERSCAN) },
        uBlur:      { value: 0.0 },
        uAspect:    { value: 1.0 },
        uIsDark:    { value: 1.0 },
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
    this.mesh.visible = false
    experience.scene.add(this.mesh)
    this.resize()
  }

  setTheme(isDark: boolean) {
    this._isDark = isDark
    this.material.uniforms.uIsDark.value = isDark ? 1.0 : 0.0
    const landscape = this.experience.sizes.width >= this.experience.sizes.height
    const src = `/backdrop-${isDark ? 'dark' : 'light'}-${landscape ? 'landscape' : 'portrait'}.png`

    if (src === this._src && this._img?.complete) { this._bake(this._img); return }
    this._src = src

    const img = new Image()
    const ready = () => {
      if (this._src !== src) return
      this._img = img
      this._bake(img)
    }
    img.onload = ready
    img.src = src
    if (img.complete && img.naturalWidth > 0) ready()
  }

  private _bake(img: HTMLImageElement) {
    const { width, height } = this.experience.sizes
    let cw = width, ch = height
    const longest = Math.max(cw, ch)
    if (longest > CANVAS_CAP) { const k = CANVAS_CAP / longest; cw *= k; ch *= k }
    cw = Math.max(2, Math.round(cw))
    ch = Math.max(2, Math.round(ch))

    const c = document.createElement('canvas')
    c.width = cw; c.height = ch
    const ctx = c.getContext('2d')!
    const ir = img.naturalWidth / img.naturalHeight
    const cr = cw / ch
    let dw: number, dh: number
    if (ir > cr) { dh = ch; dw = dh * ir }
    else         { dw = cw; dh = dw / ir }
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)

    const tex = new CanvasTexture(c)

    if (!this._texA) {
      // First load: no crossfade, show immediately
      this._texA = tex
      this.material.uniforms.uTexture.value  = tex
      this.material.uniforms.uTextureB.value = tex  // safe: same tex, fade=0
      this.material.uniforms.uCrossFade.value = 0
      this.material.uniforms.uAspect.value = cw / ch
      this.material.uniforms.uIsDark.value = this._isDark ? 1.0 : 0.0
      this._enabled = true
      this.mesh.visible = true
      if (!this._readyFired) {
        this._readyFired = true
        this.experience.trigger('backdropReady', [])
      }
    } else {
      // Subsequent loads: crossfade A → B
      this._texB?.dispose()
      this._texB = tex
      this.material.uniforms.uTextureB.value = tex
      this.material.uniforms.uAspect.value = cw / ch
      this.material.uniforms.uIsDark.value = this._isDark ? 1.0 : 0.0
      this._crossFadeStart = -1  // update() will capture elapsed on next frame
    }
  }

  resize() {
    const cam = this.experience.camera.instance
    const dist = cam.position.z - BACK_Z
    const vFov = (cam.fov * Math.PI) / 180
    const h = 2 * dist * Math.tan(vFov / 2) * 1.35  // Increased from 1.18 to cover edges during zoom
    const w = h * cam.aspect
    this.mesh.scale.set(w, h, 1)
    if (this._src) this.setTheme(this._isDark)
  }

  update(elapsed: number, pointer: Vector2, scrollSpeed: number) {
    if (!this._enabled) return
    const t = elapsed / 1000
    const margin = (1 - OVERSCAN) / 2

    // Parallax
    const tx = pointer.x * 0.7 + Math.sin(t * 0.06) * 0.35
    const ty = pointer.y * 0.7 + Math.cos(t * 0.05) * 0.35
    this._parallax.x += (tx - this._parallax.x) * 0.04
    this._parallax.y += (ty - this._parallax.y) * 0.04
    this.material.uniforms.uOffset.value.set(
      margin * (1 + this._parallax.x),
      margin * (1 - this._parallax.y)
    )

    // DOF blur
    const blurTarget = Math.min(MAX_BLUR, REST_BLUR + Math.abs(scrollSpeed) * 0.28)
    this._blur += (blurTarget - this._blur) * 0.08
    this.material.uniforms.uBlur.value = this._blur

    // Crossfade between themes
    if (this._texB) {
      if (this._crossFadeStart < 0) this._crossFadeStart = elapsed
      const raw = (elapsed - this._crossFadeStart) / FADE_MS
      const fade = Math.min(1, raw)
      // smoothstep ease
      this.material.uniforms.uCrossFade.value = fade * fade * (3 - 2 * fade)

      if (fade >= 1) {
        // Swap complete: A becomes B
        this._texA?.dispose()
        this._texA = this._texB
        this._texB = null
        this.material.uniforms.uTexture.value  = this._texA
        this.material.uniforms.uTextureB.value = this._texA
        this.material.uniforms.uCrossFade.value = 0
        this._crossFadeStart = -1
      }
    }
  }

  destroy() {
    this.experience.scene.remove(this.mesh)
    this._geometry.dispose()
    this.material.dispose()
    this._texA?.dispose()
    this._texB?.dispose()
    this._texA = null
    this._texB = null
  }
}
