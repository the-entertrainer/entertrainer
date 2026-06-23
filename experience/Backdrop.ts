import { Mesh, PlaneGeometry, ShaderMaterial, CanvasTexture, Vector2 } from 'three'
import type Experience from './Experience'

// The workshop backdrop lives on a large plane behind the spiral (rather than
// scene.background) so a fragment shader can blur it dynamically. The blur acts
// like a depth-of-field rack focus: at rest the image is nearly sharp, and as
// the user scrolls/swipes the background softens in proportion to the velocity,
// then settles back. The plane is also panned slightly (parallax) for depth.

const BACK_Z      = -6      // sits behind the cards (which orbit z ∈ [-2, 2])
const OVERSCAN    = 0.92    // sample 92% of the texture, leaving margin to pan within
const CANVAS_CAP  = 1600    // longest baked side — keeps texture memory sane
const REST_BLUR   = 0.0035  // gentle softness when idle (fraction of screen)
const MAX_BLUR    = 0.05    // cap during a fast fling

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */`
  precision highp float;
  uniform sampler2D uTexture;
  uniform vec2  uOffset;   // parallax pan
  uniform vec2  uRepeat;   // overscan zoom
  uniform float uBlur;     // disk radius in UV units
  uniform float uAspect;   // canvas w/h, keeps the blur disk circular on screen
  varying vec2 vUv;

  #define SAMPLES 28

  void main() {
    vec2 baseUv = vUv * uRepeat + uOffset;
    vec3 sum = texture2D(uTexture, baseUv).rgb;
    float total = 1.0;
    // golden-angle spiral disk — cheap, even bokeh-like sampling
    const float golden = 2.399963229728653;
    for (int i = 0; i < SAMPLES; i++) {
      float fi = float(i) + 1.0;
      float r = uBlur * sqrt(fi / float(SAMPLES));
      float a = fi * golden;
      vec2 off = vec2(cos(a), sin(a)) * r;
      off.x /= uAspect;
      sum += texture2D(uTexture, baseUv + off).rgb;
      total += 1.0;
    }
    gl_FragColor = vec4(sum / total, 1.0);
  }
`

export default class Backdrop {
  experience: Experience
  mesh: Mesh
  material: ShaderMaterial

  private _geometry: PlaneGeometry
  private _tex: CanvasTexture | null = null
  private _img: HTMLImageElement | null = null
  private _src = ''
  private _isDark = true
  private _enabled = false

  private _blur = 0
  private _parallax = new Vector2(0, 0)

  constructor(experience: Experience) {
    this.experience = experience
    this._geometry = new PlaneGeometry(1, 1)
    const margin = (1 - OVERSCAN) / 2
    this.material = new ShaderMaterial({
      uniforms: {
        uTexture: { value: null },
        uOffset:  { value: new Vector2(margin, margin) },
        uRepeat:  { value: new Vector2(OVERSCAN, OVERSCAN) },
        uBlur:    { value: 0.0 },
        uAspect:  { value: 1.0 },
      },
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false,
    })
    this.mesh = new Mesh(this._geometry, this.material)
    this.mesh.position.z = BACK_Z
    this.mesh.renderOrder = -10   // always drawn first, behind the cards
    this.mesh.frustumCulled = false
    this.mesh.visible = false
    experience.scene.add(this.mesh)
    this.resize()
  }

  // Picks the variant for the current theme + viewport orientation and loads it.
  setTheme(isDark: boolean) {
    this._isDark = isDark
    const landscape = this.experience.sizes.width >= this.experience.sizes.height
    const src = `/backdrop-${isDark ? 'dark' : 'light'}-${landscape ? 'landscape' : 'portrait'}.png`

    if (src === this._src && this._img?.complete) { this._bake(this._img); return }
    this._src = src

    const img = new Image()
    const ready = () => {
      if (this._src !== src) return // theme/orientation changed mid-load
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
    // cover-fit (CSS background-size: cover), sharp — blur is now done in-shader
    const ir = img.naturalWidth / img.naturalHeight
    const cr = cw / ch
    let dw: number, dh: number
    if (ir > cr) { dh = ch; dw = dh * ir }
    else         { dw = cw; dh = dw / ir }
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)

    this._tex?.dispose()
    const tex = new CanvasTexture(c)
    this._tex = tex
    this.material.uniforms.uTexture.value = tex
    this.material.uniforms.uAspect.value = cw / ch
    this._enabled = true
    this.mesh.visible = true
  }

  resize() {
    const cam = this.experience.camera.instance
    const dist = cam.position.z - BACK_Z
    const vFov = (cam.fov * Math.PI) / 180
    const h = 2 * dist * Math.tan(vFov / 2) * 1.18 // 1.18 = cover margin for parallax
    const w = h * cam.aspect
    this.mesh.scale.set(w, h, 1)
    // re-pick (orientation flip) + re-cover-fit at the new viewport aspect
    if (this._src) this.setTheme(this._isDark)
  }

  // pointer: components in [-1, 1]; scrollSpeed: per-frame offset delta (cards)
  update(elapsed: number, pointer: Vector2, scrollSpeed: number) {
    if (!this._enabled) return
    const t = elapsed / 1000
    const margin = (1 - OVERSCAN) / 2

    // Parallax — pointer pan + slow ambient drift, eased, kept inside the margin
    const tx = pointer.x * 0.7 + Math.sin(t * 0.06) * 0.35
    const ty = pointer.y * 0.7 + Math.cos(t * 0.05) * 0.35
    this._parallax.x += (tx - this._parallax.x) * 0.04
    this._parallax.y += (ty - this._parallax.y) * 0.04
    this.material.uniforms.uOffset.value.set(
      margin * (1 + this._parallax.x),
      margin * (1 - this._parallax.y)
    )

    // Dynamic DOF — rest softness + scroll velocity, eased so it racks smoothly
    const target = Math.min(MAX_BLUR, REST_BLUR + Math.abs(scrollSpeed) * 0.9)
    this._blur += (target - this._blur) * 0.08
    this.material.uniforms.uBlur.value = this._blur
  }

  destroy() {
    this.experience.scene.remove(this.mesh)
    this._geometry.dispose()
    this.material.dispose()
    this._tex?.dispose()
    this._tex = null
  }
}
