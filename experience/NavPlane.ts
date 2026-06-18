import {
  Mesh,
  ShaderMaterial,
  DoubleSide,
  CanvasTexture,
  Vector2,
  PlaneGeometry,
  UniformsLib,
  UniformsUtils
} from 'three'
import type Experience from './Experience'
import type { NavItem } from '~/types/nav'

// Start fetching card images immediately at module load — before any NavPlane is constructed
const CARD_IMAGE_MAP: Record<string, string> = {
  'about':                '/about-me.png',
  'instructional-design': '/instructional-design.png',
}
const _imageCache = new Map<string, HTMLImageElement>()
if (typeof document !== 'undefined') {
  for (const [id, src] of Object.entries(CARD_IMAGE_MAP)) {
    const img = new Image()
    img.src = src
    _imageCache.set(id, img)
  }
}

const vertexShader = /* glsl */`
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  #include <fog_pars_vertex>
  #define PI 3.14159265359
  uniform float uScrollSpeed;

  void main() {
    vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vec3 newPosition = position;
    newPosition.z = sin(uv.x * PI) * 0.2;
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 mvPosition    = viewMatrix * modelPosition;
    mvPosition.x += pow(worldPosition.y, 2.0) * 0.1;
    mvPosition.x += sin(uv.y * PI) * uScrollSpeed * 2.0;
    gl_Position = projectionMatrix * mvPosition;
    vUv = uv;
    vWorldPosition = worldPosition;
    #include <fog_vertex>
  }
`

const fragmentShader = /* glsl */`
  uniform sampler2D uTexture;
  uniform float uColorStrength;
  uniform float uZoom;
  uniform vec2  uPlaneSizes;
  uniform vec2  uImageSizes;
  uniform float uRevealProgress;
  uniform float uOpacity;
  uniform float uRimAngle;
  uniform float uGlowStrength;
  uniform float uIsImage;

  varying vec2 vUv;
  #include <fog_pars_fragment>

  void main() {
    vec2 ratio = vec2(
      min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
      min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
    );
    vec2 uv = vec2(
      vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
    vec2 zoomedUv = (uv - 0.5) / uZoom + 0.5;

    vec4 color;
    if (gl_FrontFacing) {
      color = texture2D(uTexture, zoomedUv);
      color.rgb = mix(color.rgb, vec3(0.0), uColorStrength);
    } else {
      // Heavy blur + darken on back-face so text is unreadable
      float o2 = 140.0 / 1024.0;
      vec4 c = vec4(0.0);
      c += texture2D(uTexture, uv + vec2(-o2, -o2)) * 1.0;
      c += texture2D(uTexture, uv + vec2(0.0, -o2)) * 2.0;
      c += texture2D(uTexture, uv + vec2( o2, -o2)) * 1.0;
      c += texture2D(uTexture, uv + vec2(-o2, 0.0)) * 2.0;
      c += texture2D(uTexture, uv               )   * 4.0;
      c += texture2D(uTexture, uv + vec2( o2, 0.0)) * 2.0;
      c += texture2D(uTexture, uv + vec2(-o2,  o2)) * 1.0;
      c += texture2D(uTexture, uv + vec2(0.0,  o2)) * 2.0;
      c += texture2D(uTexture, uv + vec2( o2,  o2)) * 1.0;
      c /= 16.0;
      if (uIsImage < 0.5) c.rgb *= 0.2;
      color = c;
    }

    float aspect    = uPlaneSizes.x / uPlaneSizes.y;
    float reveal    = clamp(uRevealProgress, 0.0, 1.0);
    vec2  p         = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);
    vec2  halfSize  = vec2(aspect, 1.0) * 0.5 * reveal;
    float radius    = 0.08 * reveal;
    vec2  d         = abs(p) - halfSize + radius;
    float sdf       = length(max(d, 0.0)) - radius;
    float aa        = fwidth(sdf);
    float alpha     = 1.0 - smoothstep(-aa, aa, sdf);
    alpha          *= smoothstep(0.1, 1.0, uRevealProgress);

    // Orbiting rim glow — cream spotlight tracing the card edge
    if (gl_FrontFacing) {
      vec2  cp       = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);
      float pAngle   = atan(cp.y, cp.x);
      float angDelta = abs(mod(pAngle - uRimAngle + 3.14159, 6.28318) - 3.14159);
      float rimFade  = exp(-sdf * sdf * 300.0);
      float arcFade  = exp(-angDelta * angDelta * 1.2);
      float glowMask = rimFade * arcFade * uGlowStrength;
      color.rgb     += vec3(0.96, 0.95, 0.93) * glowMask * 0.50;
    }

    gl_FragColor = vec4(color.rgb, alpha * color.a * uOpacity);
    #include <fog_fragment>
  }
`

export default class NavPlane {
  experience: Experience
  mesh: Mesh
  index: number
  totalCount: number
  navItem: NavItem

  hiddenProgress = 1
  hiddenTarget   = 1
  hoverProgress  = 0
  hoverTarget    = 0
  revealProgress = 0
  revealTarget   = 0

  private prevBa: number | null = null
  private wrapFade = 1
  private _isDark  = true

  // Canvas-texture refs (mutable for typewriter animation)
  private _canvas!: HTMLCanvasElement
  private _ctx!:    CanvasRenderingContext2D
  private _tex!:    CanvasTexture

  // Typewriter state
  private _labelProgress = 0
  private _descProgress  = 0
  private _prevCharCount = -1
  private _cursorFading  = 0

  // Rim glow state
  private _rimAngle    = 0
  private _glowStrength = 0

  // Custom background image (replaces canvas texture for specific cards)
  private _bgImage: HTMLImageElement | null = null

  readonly baseScaleX  = 1.7
  readonly baseScaleY  = 1.0
  readonly verticalGap = 0.5
  readonly angleGap    = 0.85
  readonly baseRadius  = 2.0

  constructor(
    experience: Experience,
    index: number,
    navItem: NavItem,
    totalCount: number,
    geometry: PlaneGeometry,
    isDark = true
  ) {
    this.experience = experience
    this.index      = index
    this.navItem    = navItem
    this.totalCount = totalCount
    this._isDark    = isDark

    this._canvas        = document.createElement('canvas')
    this._canvas.width  = 1700
    this._canvas.height = 1000
    this._ctx = this._canvas.getContext('2d')!
    this._tex = new CanvasTexture(this._canvas)
    this._drawTexture(isDark)

    const cached = _imageCache.get(navItem.id)
    if (cached) {
      if (cached.complete && cached.naturalWidth > 0) {
        // Already in browser cache — use immediately
        this._bgImage = cached
        this._drawTexture(isDark)
      } else {
        cached.addEventListener('load', () => {
          this._bgImage = cached
          this._drawTexture(this._isDark)
          ;(this.mesh.material as ShaderMaterial).uniforms.uIsImage.value = 1.0
        }, { once: true })
      }
    }

    const material = new ShaderMaterial({
      uniforms: UniformsUtils.merge([
        UniformsLib.fog,
        {
          uTexture:        { value: this._tex },
          uColorStrength:  { value: 0 },
          uZoom:           { value: 1 },
          uPlaneSizes:     { value: new Vector2(1.7, 1.0) },
          uImageSizes:     { value: new Vector2(1700, 1000) },
          uRevealProgress: { value: 0 },
          uScrollSpeed:    { value: 0 },
          uOpacity:        { value: 1 },
          uRimAngle:       { value: 0 },
          uGlowStrength:   { value: 0 },
          uIsImage:        { value: this._bgImage ? 1.0 : 0.0 }
        }
      ]),
      vertexShader,
      fragmentShader,
      transparent: true,
      fog: true,
      side: DoubleSide
    })

    this.mesh = new Mesh(geometry, material)
    this.mesh.scale.set(this.baseScaleX, this.baseScaleY, 1)
    experience.scene.add(this.mesh)
  }

  private _drawTexture(isDark: boolean) {
    const W = 1700, H = 1000
    const ctx = this._ctx
    ctx.clearRect(0, 0, W, H)

    // Image-backed card — draw photo, skip all text
    if (this._bgImage) {
      ctx.drawImage(this._bgImage, 0, 0, W, H)
      this._tex.needsUpdate = true
      return
    }

    // Glass body — matches --color-glass-bg token
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.15)'
    ctx.fillRect(0, 0, W, H)

    // Diagonal ambient sweep — dark mode only; on light it washes out dark text
    if (isDark) {
      const sweep = ctx.createLinearGradient(0, 0, W * 0.6, H * 0.6)
      sweep.addColorStop(0, 'rgba(255,255,255,0.04)')
      sweep.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = sweep
      ctx.fillRect(0, 0, W, H)
    }

    // Border — matches --color-glass-border token
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)'
    ctx.lineWidth   = 5
    ctx.strokeRect(6, 6, W - 12, H - 12)

    // Accent tick
    ctx.fillStyle = isDark ? 'rgba(244,241,236,0.40)' : 'rgba(13,12,10,0.25)'
    ctx.fillRect(100, 820, 140, 4)

    // ── Label (typewriter) ────────────────────────────────────────
    const label     = this.navItem.label
    const charCount = Math.min(label.length, Math.ceil(this._labelProgress * label.length))
    const textColor = isDark ? '#F4F1EC' : '#0D0C0A'
    ctx.fillStyle    = textColor
    ctx.textAlign    = 'left'
    ctx.textBaseline = 'alphabetic'
    let labelPx = 180
    ctx.font = `700 ${labelPx}px system-ui, -apple-system, Arial, sans-serif`
    while (ctx.measureText(label).width > 1480 && labelPx > 72) {
      labelPx -= 6
      ctx.font = `700 ${labelPx}px system-ui, -apple-system, Arial, sans-serif`
    }
    ctx.fillText(label.substring(0, charCount), 100, 550)

    // ── Cursor ────────────────────────────────────────────────────
    const cursorOpacity = (1 - this._cursorFading) *
      Math.max(0, 0.5 + 0.5 * Math.sin(Date.now() / 380))
    if (cursorOpacity > 0.01 && charCount > 0) {
      const typedWidth = ctx.measureText(label.substring(0, charCount)).width
      const cursorH   = labelPx * 0.82
      const cursorX   = 100 + typedWidth + 10
      const cursorY   = 550 - cursorH
      ctx.globalAlpha = cursorOpacity
      ctx.fillStyle   = textColor
      ctx.fillRect(cursorX, cursorY, Math.max(3, labelPx * 0.06), cursorH)
      ctx.globalAlpha = 1
    }

    // ── Description (fades in after label) ───────────────────────
    if (this._descProgress > 0) {
      const desc      = this.navItem.description
      const descAlpha = this._descProgress * (isDark ? 0.60 : 0.50)
      ctx.fillStyle   = isDark
        ? `rgba(244,241,236,${descAlpha.toFixed(3)})`
        : `rgba(13,12,10,${descAlpha.toFixed(3)})`
      let descPx = 64
      ctx.font = `400 ${descPx}px system-ui, -apple-system, Arial, sans-serif`
      while (ctx.measureText(desc).width > 1480 && descPx > 38) {
        descPx -= 4
        ctx.font = `400 ${descPx}px system-ui, -apple-system, Arial, sans-serif`
      }
      ctx.fillText(desc, 100, 650)
    }

    this._tex.needsUpdate = true
  }

  reveal() { this.hiddenTarget = 0; this.revealTarget = 1 }

  hide() {
    this.hiddenTarget   = 1
    this.revealTarget   = 0
    this._labelProgress = 0
    this._descProgress  = 0
    this._cursorFading  = 0
    this._prevCharCount = -1
  }

  setHovered(hovered: boolean) { this.hoverTarget = hovered ? 1 : 0 }

  updateTexture(isDark: boolean) {
    if (isDark === this._isDark) return
    this._isDark = isDark
    this._prevCharCount = -1
    this._drawTexture(isDark)
    const mat = this.mesh.material as ShaderMaterial
    mat.uniforms.uTexture.value = this._tex
  }

  update(delta: number, scrollOffset: number, scrollSpeed: number) {
    const centerIndex = Math.floor(this.totalCount / 2)
    let ws = (this.index - scrollOffset) % this.totalCount
    ws = ((ws % this.totalCount) + this.totalCount) % this.totalCount
    const Ba = ws - centerIndex

    if (this.prevBa !== null && Math.abs(Ba - this.prevBa) > this.totalCount / 2) {
      this.wrapFade = 0
    }
    this.prevBa = Ba
    const wFactor = 1 - Math.pow(1 - 0.008, delta)
    this.wrapFade += (1 - this.wrapFade) * wFactor

    const hFactor  = 1 - Math.pow(1 - 0.05, delta * 0.15)
    const hvFactor = 1 - Math.pow(1 - (this.hoverTarget > 0.5 ? 0.09 : 0.07), delta * 0.2)

    this.hiddenProgress += (this.hiddenTarget - this.hiddenProgress) * hFactor
    this.revealProgress += (this.revealTarget  - this.revealProgress) * hFactor
    this.hoverProgress  += (this.hoverTarget   - this.hoverProgress)  * hvFactor

    const ss = Ba > 0 ? -1.5 : 1.5
    const Va = Ba * this.verticalGap - 0.8 - this.hiddenProgress * ss
    const Ga = this.baseRadius * (1 - this.hiddenProgress / 2)
    const Ha = Ba * this.angleGap

    this.mesh.position.set(Math.cos(Ha) * Ga, Va, Math.sin(Ha) * Ga)
    this.mesh.rotation.y = -Ha + Math.PI / 2

    const mat = this.mesh.material as ShaderMaterial
    mat.uniforms.uScrollSpeed.value    = scrollSpeed
    mat.uniforms.uColorStrength.value  = 0.55 * this.hoverProgress
    mat.uniforms.uZoom.value           = 1 + 0.05 * this.hoverProgress
    mat.uniforms.uRevealProgress.value = this.revealProgress * (1 - this.hoverProgress * 0.05)

    const halfCount = this.totalCount / 2
    const edgeFade  = Math.max(0, Math.min(1, (halfCount - Math.abs(Ba)) / 0.5))
    mat.uniforms.uOpacity.value = this.wrapFade * edgeFade

    // ── Typewriter ──────────────────────────────────────────────
    const LABEL_DURATION = 1200
    const DESC_DELAY     = 0.70
    const DESC_DURATION  = 600

    if (this.revealProgress > 0.5 && this._labelProgress < 1) {
      this._labelProgress = Math.min(1, this._labelProgress + delta / LABEL_DURATION)
    }
    if (this._labelProgress >= DESC_DELAY) {
      this._descProgress = Math.min(1, this._descProgress + delta / DESC_DURATION)
    }
    if (this._labelProgress >= 1 && this._cursorFading < 1) {
      this._cursorFading = Math.min(1, this._cursorFading + delta / 1200)
    }

    const charCount    = Math.min(
      this.navItem.label.length,
      Math.ceil(this._labelProgress * this.navItem.label.length)
    )
    const cursorActive = this._labelProgress > 0 && this._cursorFading < 1
    if (charCount !== this._prevCharCount || cursorActive) {
      this._prevCharCount = charCount
      this._drawTexture(this._isDark)
    }

    // ── Rim glow ─────────────────────────────────────────────────
    this._rimAngle     = (this._rimAngle + delta * 0.0007) % (Math.PI * 2)
    const glowFactor   = 1 - Math.pow(1 - 0.004, delta)
    this._glowStrength += (this.revealProgress - this._glowStrength) * glowFactor

    mat.uniforms.uRimAngle.value     = this._rimAngle
    mat.uniforms.uGlowStrength.value = this._glowStrength
  }

  destroy() {
    this.experience.scene.remove(this.mesh)
    ;(this.mesh.material as ShaderMaterial).dispose()
    this._tex.dispose()
  }
}
