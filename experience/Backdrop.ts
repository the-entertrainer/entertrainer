import { Mesh, PlaneGeometry, ShaderMaterial, CanvasTexture, Vector2 } from 'three'
import type Experience from './Experience'

const BACK_Z = -6

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uIsDark;
  uniform float uAspect;
  uniform vec2  uPointer;
  uniform vec2  uResolution;
  uniform sampler2D uTypoTex;
  uniform float uReducedMotion;
  varying vec2 vUv;

  // ── Utility ─────────────────────────────────────────────────────────
  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }
  vec2 hash22(vec2 p) {
    float n = hash21(p);
    return vec2(n, hash21(p + n));
  }

  // ── SDF primitives ──────────────────────────────────────────────────
  float sdCircle(vec2 p, float r) { return length(p) - r; }
  float sdRing(vec2 p, float r, float w) { return abs(length(p) - r) - w; }
  float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  float sdCross(vec2 p, float s, float w) {
    p = abs(p);
    return min(
      max(p.x - w, p.y - s),
      max(p.x - s, p.y - w)
    );
  }

  float sdDiamond(vec2 p, float s) {
    p = abs(p);
    return (p.x + p.y - s) * 0.707;
  }

  float line(float d, float px) { return 1.0 - smoothstep(0.0, px * 1.5, abs(d)); }
  float fill(float d, float px) { return 1.0 - smoothstep(-px, px, d); }

  float t(float speed) {
    return uTime * speed * (1.0 - uReducedMotion * 0.95);
  }

  // ── Layer 1: Large abstract geometry ────────────────────────────────
  float geometryLayer(vec2 uv) {
    float px = 1.5 / uResolution.y;
    float result = 0.0;

    // Ring 1 — top right, partially off-screen
    vec2 c1 = vec2(0.88, -0.12) + vec2(sin(t(0.031)), cos(t(0.023))) * 0.04;
    result += line(sdRing(uv - c1, 0.42, 0.001), px) * 0.07;

    // Ring 2 — bottom left, larger
    vec2 c2 = vec2(-0.15, 1.1) + vec2(cos(t(0.019)), sin(t(0.027))) * 0.03;
    result += line(sdRing(uv - c2, 0.55, 0.001), px) * 0.05;

    // Arc 3 — center-left, half circle
    vec2 c3 = vec2(-0.05, 0.5) + vec2(0.0, sin(t(0.014))) * 0.02;
    float d3 = sdRing(uv - c3, 0.35, 0.001);
    float mask3 = smoothstep(-0.01, 0.01, uv.x - c3.x);
    result += line(d3, px) * mask3 * 0.06;

    // Ring 4 — top center, small
    vec2 c4 = vec2(0.5, 0.08) + vec2(sin(t(0.025)), cos(t(0.018))) * 0.05;
    result += line(sdRing(uv - c4, 0.18, 0.001), px) * 0.04;

    // Circle fill 5 — soft large glow, very faint
    vec2 c5 = vec2(0.65, 0.7) + vec2(cos(t(0.012)), sin(t(0.016))) * 0.03;
    float d5 = sdCircle(uv - c5, 0.3);
    result += fill(-d5, 0.2) * 0.02;

    // Ring 6 — bottom right
    vec2 c6 = vec2(1.1, 0.85) + vec2(sin(t(0.022)), cos(t(0.015))) * 0.04;
    result += line(sdRing(uv - c6, 0.48, 0.001), px) * 0.05;

    return result;
  }

  // ── Layer 2: Technical grid lines ───────────────────────────────────
  float gridLayer(vec2 uv) {
    float px = 1.0 / uResolution.y;
    float result = 0.0;

    // Sparse vertical lines
    float vFreq = 12.0;
    float vLine = abs(fract(uv.x * vFreq) - 0.5) / vFreq;
    float vFade = 0.5 + 0.5 * sin(uv.x * 2.1 + t(0.04));
    result += line(vLine, px) * 0.025 * vFade;

    // Sparse horizontal lines
    float hFreq = 8.0;
    float hLine = abs(fract(uv.y * hFreq) - 0.5) / hFreq;
    float hFade = 0.5 + 0.5 * sin(uv.y * 1.7 + t(0.035));
    result += line(hLine, px) * 0.02 * hFade;

    // Diagonal line 1 — top-left to bottom-right
    float d1 = sdSegment(uv, vec2(0.1, 0.0), vec2(0.7, 1.0));
    float d1Fade = 0.5 + 0.5 * sin(t(0.05) + 1.0);
    result += line(d1, px) * 0.03 * d1Fade;

    // Diagonal line 2 — top-right to center
    float d2 = sdSegment(uv, vec2(0.9, 0.05), vec2(0.4, 0.55));
    float d2Fade = 0.5 + 0.5 * sin(t(0.042) + 2.5);
    result += line(d2, px) * 0.025 * d2Fade;

    // Diagonal line 3 — bottom-left to right
    float d3 = sdSegment(uv, vec2(0.05, 0.85), vec2(0.8, 0.6));
    float d3Fade = 0.5 + 0.5 * sin(t(0.038) + 4.0);
    result += line(d3, px) * 0.02 * d3Fade;

    return result;
  }

  // ── Layer 3: Floating dots ──────────────────────────────────────────
  float dotsLayer(vec2 uv) {
    float result = 0.0;
    float px = 1.0 / uResolution.y;

    // Grid-based dot placement for efficiency
    float gridSize = 14.0;
    vec2 gridUv = uv * gridSize;
    vec2 cell = floor(gridUv);
    vec2 localUv = fract(gridUv) - 0.5;

    for (int i = -1; i <= 1; i++) {
      for (int j = -1; j <= 1; j++) {
        vec2 neighbor = cell + vec2(float(i), float(j));
        vec2 rnd = hash22(neighbor);

        // ~60% of cells have a dot
        if (rnd.x < 0.40) continue;

        vec2 dotPos = rnd - 0.5;
        // Slow drift
        dotPos += vec2(
          sin(t(0.02) + rnd.x * 20.0),
          cos(t(0.015) + rnd.y * 20.0)
        ) * 0.08;

        vec2 diff = localUv - vec2(float(i), float(j)) - dotPos;
        float dotSize = (1.5 + rnd.y * 2.5) / gridSize;
        float d = length(diff) / gridSize;
        float dot = fill(d - dotSize * px, px * 0.5);

        // Pulsing opacity
        float pulse = 0.5 + 0.5 * sin(t(0.03) + rnd.x * 30.0);
        float opacity = mix(0.015, 0.04, rnd.y) * pulse;
        result += dot * opacity;
      }
    }

    return result;
  }

  // ── Layer 4: Geometric decorations ──────────────────────────────────
  float decorLayer(vec2 uv) {
    float px = 1.0 / uResolution.y;
    float result = 0.0;

    // Fixed decoration positions (seeded for consistency)
    const int COUNT = 12;
    // Encoded as vec4: (x, y, type, rotation-seed)
    // type: 0=cross, 1=diamond, 2=small-circle, 3=plus, 4=square-outline

    vec2 positions[12];
    positions[0]  = vec2(0.12, 0.18);
    positions[1]  = vec2(0.78, 0.12);
    positions[2]  = vec2(0.92, 0.45);
    positions[3]  = vec2(0.35, 0.75);
    positions[4]  = vec2(0.62, 0.88);
    positions[5]  = vec2(0.15, 0.55);
    positions[6]  = vec2(0.85, 0.72);
    positions[7]  = vec2(0.48, 0.22);
    positions[8]  = vec2(0.25, 0.92);
    positions[9]  = vec2(0.72, 0.38);
    positions[10] = vec2(0.55, 0.55);
    positions[11] = vec2(0.08, 0.78);

    for (int i = 0; i < COUNT; i++) {
      vec2 pos = positions[i];
      // Gentle drift
      pos += vec2(
        sin(t(0.018) + float(i) * 1.7),
        cos(t(0.014) + float(i) * 2.3)
      ) * 0.015;

      vec2 p = uv - pos;
      float sz = 0.008 + hash21(pos) * 0.005;
      float d;
      float type = hash21(pos + 100.0);

      if (type < 0.25) {
        d = sdCross(p, sz, sz * 0.2);
      } else if (type < 0.5) {
        d = sdDiamond(p, sz);
      } else if (type < 0.75) {
        d = abs(sdCircle(p, sz)) - px;
      } else {
        d = sdCross(p, sz, sz * 0.25);
      }

      float fade = 0.5 + 0.5 * sin(t(0.025) + float(i) * 2.0);
      result += line(d, px) * mix(0.02, 0.05, hash21(pos + 50.0)) * fade;
    }

    return result;
  }

  // ── Layer 7: Gradient lighting ──────────────────────────────────────
  vec3 gradientLayer(vec2 uv) {
    // Pi Blue accent: #243F6A = vec3(0.141, 0.247, 0.416)
    vec3 accent = vec3(0.141, 0.247, 0.416);

    vec3 result = vec3(0.0);

    // Gradient 1 — top, warm
    vec2 g1 = vec2(0.4, 0.15) + uPointer * 0.06 + vec2(sin(t(0.013)), cos(t(0.019))) * 0.08;
    float d1 = length(uv - g1);
    result += accent * exp(-d1 * d1 * 3.0) * 0.04;

    // Gradient 2 — bottom right, cooler
    vec2 g2 = vec2(0.75, 0.8) + uPointer * 0.04 + vec2(cos(t(0.017)), sin(t(0.011))) * 0.06;
    float d2 = length(uv - g2);
    result += accent * 0.8 * exp(-d2 * d2 * 4.0) * 0.035;

    // Gradient 3 — center, very subtle
    vec2 g3 = vec2(0.5, 0.5) + uPointer * 0.08 + vec2(sin(t(0.009)), cos(t(0.007))) * 0.1;
    float d3 = length(uv - g3);
    result += accent * 0.6 * exp(-d3 * d3 * 2.0) * 0.025;

    // Gradient 4 — left, accent tint
    vec2 g4 = vec2(0.15, 0.45) + uPointer * 0.03 + vec2(cos(t(0.021)), sin(t(0.015))) * 0.05;
    float d4 = length(uv - g4);
    vec3 warm = mix(accent, vec3(0.2, 0.15, 0.1), uIsDark * 0.5);
    result += warm * exp(-d4 * d4 * 5.0) * 0.03;

    return result;
  }

  // ── Layer 6: Noise grain ────────────────────────────────────────────
  float noiseGrain(vec2 uv) {
    float n = hash21(uv * uResolution + fract(uTime * 0.7) * 100.0);
    return (n - 0.5) * 0.018;
  }

  // ── Main ────────────────────────────────────────────────────────────
  void main() {
    vec2 uv = vUv;

    // Base color
    vec3 lightBg = vec3(0.961, 0.937, 0.910);
    vec3 darkBg  = vec3(0.051, 0.047, 0.039);
    vec3 col = mix(lightBg, darkBg, uIsDark);

    // Element drawing color
    vec3 lightElem = vec3(0.15, 0.13, 0.11);   // dark marks on light paper
    vec3 darkElem  = vec3(0.75, 0.73, 0.70);   // faint light marks on dark
    vec3 elemCol = mix(lightElem, darkElem, uIsDark);

    // Layer 1: Large abstract geometry
    col += elemCol * geometryLayer(uv);

    // Layer 2: Technical grid lines
    col += elemCol * gridLayer(uv);

    // Layer 3: Floating dots
    col += elemCol * dotsLayer(uv);

    // Layer 4: Geometric decorations
    col += elemCol * decorLayer(uv);

    // Layer 5: Editorial typography
    float typo = texture2D(uTypoTex, uv).a;
    col += elemCol * typo * mix(0.04, 0.025, uIsDark);

    // Layer 7: Gradient lighting
    col += gradientLayer(uv);

    // Layer 6: Noise grain
    col += noiseGrain(uv);

    gl_FragColor = vec4(col, 1.0);
  }
`

const TYPO_WORDS = [
  { text: 'LEARN',    x: 0.10, y: 0.25, size: 180, rot: -8,  weight: 700 },
  { text: 'BUILD',    x: 0.68, y: 0.15, size: 160, rot: 5,   weight: 600 },
  { text: 'DESIGN',   x: 0.38, y: 0.72, size: 220, rot: -3,  weight: 700 },
  { text: 'THINK',    x: 0.80, y: 0.55, size: 140, rot: 12,  weight: 300 },
  { text: 'SYSTEM',   x: 0.05, y: 0.82, size: 120, rot: -15, weight: 600 },
  { text: 'IDEA',     x: 0.60, y: 0.90, size: 200, rot: 7,   weight: 700 },
  { text: '3.14',     x: 0.28, y: 0.12, size: 260, rot: -5,  weight: 300 },
  { text: 'FLOW',     x: 0.50, y: 0.42, size: 160, rot: 10,  weight: 600 },
  { text: 'MAKE',     x: 0.82, y: 0.35, size: 150, rot: -10, weight: 700 },
  { text: 'CREATE',   x: 0.20, y: 0.55, size: 130, rot: 3,   weight: 300 },
  { text: 'REMEMBER', x: 0.45, y: 0.05, size: 110, rot: -2,  weight: 600 },
]

function bakeTypographyTexture(): CanvasTexture {
  const W = 2048, H = 1024
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, W, H)

  for (const w of TYPO_WORDS) {
    ctx.save()
    ctx.translate(w.x * W, w.y * H)
    ctx.rotate((w.rot * Math.PI) / 180)
    ctx.font = `${w.weight} ${w.size}px "DM Sans", system-ui, sans-serif`
    ctx.fillStyle = `rgba(255, 255, 255, 0.22)`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(w.text, 0, 0)
    ctx.restore()
  }

  return new CanvasTexture(c)
}

export default class Backdrop {
  experience: Experience
  mesh: Mesh
  material: ShaderMaterial

  private _geometry: PlaneGeometry
  private _typoTex: CanvasTexture
  private _readyFired = false
  private _isDark = true
  private _pointer = new Vector2(0, 0)
  private _reducedMotion = false
  private _mqListener: (() => void) | null = null

  constructor(experience: Experience) {
    this.experience = experience
    this._geometry = new PlaneGeometry(1, 1)

    this._typoTex = bakeTypographyTexture()

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
        uAspect:        { value: width / height },
        uPointer:       { value: new Vector2(0, 0) },
        uResolution:    { value: new Vector2(width, height) },
        uTypoTex:       { value: this._typoTex },
        uReducedMotion: { value: 0.0 },
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
    this.material.uniforms.uAspect.value = width / height
    this.material.uniforms.uResolution.value.set(width, height)
  }

  update(elapsed: number, pointer: Vector2, _scrollSpeed: number) {
    this.material.uniforms.uTime.value = elapsed / 1000

    // Smooth pointer
    const tx = pointer.x * 0.5
    const ty = pointer.y * 0.5
    this._pointer.x += (tx - this._pointer.x) * 0.03
    this._pointer.y += (ty - this._pointer.y) * 0.03
    this.material.uniforms.uPointer.value.set(this._pointer.x, this._pointer.y)

    this.material.uniforms.uReducedMotion.value = this._reducedMotion ? 1.0 : 0.0
  }

  destroy() {
    this.experience.scene.remove(this.mesh)
    this._geometry.dispose()
    this.material.dispose()
    this._typoTex.dispose()
    if (this._mqListener && typeof window !== 'undefined') {
      window.matchMedia('(prefers-reduced-motion: reduce)').removeEventListener('change', this._mqListener)
      this._mqListener = null
    }
  }
}
