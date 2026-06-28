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
  'my-work':              '/my-work.png',
  'tools':                '/web-apps.png',
  'downloads':            '/downloads.png',
  'better-emails':        '/better-emails.png',
  'training-cal-gen':     '/training-cal-gen.png',
  'easymcq':              '/easymcq.png',
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
  varying float vDepth;
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
    // Permanent base arch (physical fan shape) + small velocity nudge
    float arch = 0.025 + uScrollSpeed * 0.12;
    mvPosition.x += sin(uv.y * PI) * arch * 2.0;
    gl_Position = projectionMatrix * mvPosition;
    vUv = uv;
    vWorldPosition = worldPosition;
    vDepth = length(mvPosition.xyz); // distance from camera for depth effects
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
  uniform float uExitFade;
  uniform float uEntranceFade;
  varying vec2 vUv;
  varying float vDepth;
  #include <fog_pars_fragment>

  // Subtle noise for texture
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  vec3 depthTint(vec3 col, float depth) {
    float depthFactor = smoothstep(8.0, 14.0, depth) * 0.08;
    vec3 warmTint = vec3(1.02, 0.98, 0.96);
    return mix(col, col * warmTint, depthFactor);
  }

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

    // Depth-based blur: cards far from camera get subtle blur
    float depthBlur = smoothstep(8.0, 14.0, vDepth) * 0.015;

    vec4 color;
    if (gl_FrontFacing) {
      color = texture2D(uTexture, zoomedUv);

      // Apply subtle depth blur to distant cards
      if (depthBlur > 0.001) {
        vec4 blurred = color;
        const int samples = 5;
        for (int i = -samples; i <= samples; i++) {
          for (int j = -samples; j <= samples; j++) {
            vec2 offset = vec2(float(i), float(j)) * depthBlur * 0.002;
            blurred += texture2D(uTexture, zoomedUv + offset);
          }
        }
        blurred /= float((2*samples+1) * (2*samples+1));
        color = mix(color, blurred, smoothstep(10.0, 13.0, vDepth));
      }

      color.rgb = mix(color.rgb, vec3(0.0), uColorStrength);

      // Apply depth-based tinting for visual depth
      color.rgb = depthTint(color.rgb, vDepth);

      // Add subtle grain texture for premium feel
      float grain = noise(zoomedUv * 200.0 + vDepth);
      grain = mix(0.5, grain, 0.3) - 0.5;
      color.rgb += grain * 0.02;
    } else {
      // Solid glass back face — mirrors front card aesthetics, no bleed-through
      float luma = dot(fogColor, vec3(0.299, 0.587, 0.114));
      float dark = step(luma, 0.5); // 1.0 dark mode, 0.0 light mode

      // Glass body
      //  light: warm frosted cream — picks up fogColor so backs blend with the scene
      //  dark:  faint white glass (unchanged)
      vec3 lightBack = mix(fogColor, vec3(1.0), 0.12);  // slightly lighter than backdrop
      lightBack += (vUv.y - 0.5) * 0.03;               // subtle top-lit sheen
      vec3 glass = mix(
        lightBack,
        mix(fogColor, vec3(1.0), 0.07),
        dark
      );

      // Diagonal ambient sheen — both modes
      float sweep = max(0.0, 0.6 - vUv.x * 0.5 - vUv.y * 0.5) * mix(0.05, 0.04, dark);
      glass += vec3(sweep);

      // Border using rounded-rect SDF — matches --color-glass-border
      float bAspect = uPlaneSizes.x / uPlaneSizes.y;
      vec2  bP      = vec2((vUv.x - 0.5) * bAspect, vUv.y - 0.5);
      vec2  bD      = abs(bP) - vec2(bAspect * 0.5, 0.5) + 0.08;
      float bSdf    = length(max(bD, 0.0)) - 0.08;
      float bStr    = mix(0.14, 0.18, dark);
      vec3  bCol    = mix(
        fogColor * 0.84,                 // light: slightly darker warm edge
        mix(fogColor, vec3(1.0), bStr),  // dark:  faint white edge
        dark
      );
      glass = mix(glass, bCol, smoothstep(-0.008, -0.001, bSdf));

      // Accent tick — mirrors bottom-left marker on front face
      float tX = step(100.0/1700.0, vUv.x) - step(240.0/1700.0, vUv.x);
      float tY = step(820.0/1000.0, vUv.y) - step(824.0/1000.0, vUv.y);
      vec3  tCol = mix(fogColor * 0.70, vec3(0.957, 0.945, 0.925), dark);
      glass = mix(glass, tCol, clamp(tX * tY, 0.0, 1.0) * mix(0.30, 0.40, dark));

      color = vec4(glass, 1.0);
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

    // Depth-cascade fade during spiral transitions
    // Back cards (high vDepth) fade first, progressively to front cards
    float depthCascade = smoothstep(14.0, 8.0, vDepth);
    float transitionFade = mix(uExitFade, uEntranceFade, 0.5);
    float cascadedFade = mix(transitionFade, 1.0, depthCascade);

    gl_FragColor = vec4(color.rgb, alpha * color.a * uOpacity * cascadedFade);
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

  // Transition effects
  exitFade = 0        // Fades out during spiral exit (0=full fade, 1=visible)
  entranceFade = 1    // Fades in during spiral entrance (0=hidden, 1=visible)

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
  private _cursorVisible = false

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
          uIsImage:        { value: this._bgImage ? 1.0 : 0.0 },
          uExitFade:       { value: 0 },
          uEntranceFade:   { value: 1 }
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

    // Image-backed card — draw photo, add border on top
    if (this._bgImage) {
      ctx.drawImage(this._bgImage, 0, 0, W, H)
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.22)'
      ctx.lineWidth   = 6
      ctx.strokeRect(6, 6, W - 12, H - 12)
      this._tex.needsUpdate = true
      return
    }

    // Glass body
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.72)'
    ctx.fillRect(0, 0, W, H)

    // Diagonal ambient sweep — dark mode only; on light it washes out dark text
    if (isDark) {
      const sweep = ctx.createLinearGradient(0, 0, W * 0.6, H * 0.6)
      sweep.addColorStop(0, 'rgba(255,255,255,0.04)')
      sweep.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = sweep
      ctx.fillRect(0, 0, W, H)
    }

    // Border
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.22)'
    ctx.lineWidth   = 6
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
    const cursorOpacity = this._cursorVisible ? (1 - this._cursorFading) : 0
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

  revealImmediate() {
    this.hiddenProgress = 0
    this.hiddenTarget   = 0
    this.revealProgress = 1
    this.revealTarget   = 1
    this.wrapFade       = 1
    this._labelProgress = 1
    this._descProgress  = 1
    this._cursorFading  = 1
  }

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

  update(delta: number, scrollOffset: number, scrollSpeed: number, spinMultiplier = 1.0) {
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

    // Edge push: ramp a card sharply up (top) / down (bottom) once it passes the
    // visible fan, so it flies in from above the viewport and out below the
    // bottom — instead of dissolving in mid-screen at the wrap point.
    const half = this.totalCount / 2
    const edge = Math.max(0, Math.abs(Ba) - (half - 2.2))
    // ~0.4 lifts a card just past the top/bottom edge as it fades; higher
    // values fling it far above the viewport and read as a violent jump.
    const edgePush = Math.sign(Ba) * edge * edge * 0.4
    const Va = Ba * this.verticalGap - 0.8 + this.hiddenProgress * 9.0 + edgePush
    const Ga = this.baseRadius * (1 - this.hiddenProgress / 2)

    // Apply spin multiplier to angle during transition (spiral acceleration/deceleration)
    const Ha = Ba * this.angleGap * spinMultiplier

    this.mesh.position.set(Math.cos(Ha) * Ga, Va, Math.sin(Ha) * Ga)
    this.mesh.rotation.y  = -Ha + Math.PI / 2
    this.mesh.rotation.z  = 0

    const mat = this.mesh.material as ShaderMaterial
    mat.uniforms.uScrollSpeed.value    = scrollSpeed
    mat.uniforms.uColorStrength.value  = 0.55 * this.hoverProgress
    mat.uniforms.uZoom.value           = 1 + 0.05 * this.hoverProgress
    mat.uniforms.uRevealProgress.value = this.revealProgress * (1 - this.hoverProgress * 0.05)
    mat.uniforms.uOpacity.value = this.wrapFade
    mat.uniforms.uExitFade.value = this.exitFade
    mat.uniforms.uEntranceFade.value = this.entranceFade

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

    const charCount   = Math.min(
      this.navItem.label.length,
      Math.ceil(this._labelProgress * this.navItem.label.length)
    )
    const blinkOn     = this._labelProgress > 0 && this._cursorFading < 1 &&
                        (Math.floor(performance.now() / 380) % 2 === 0)
    const needsRedraw = charCount !== this._prevCharCount || blinkOn !== this._cursorVisible
    if (needsRedraw) {
      this._prevCharCount = charCount
      this._cursorVisible = blinkOn
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
