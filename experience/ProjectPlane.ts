import {
  Mesh,
  ShaderMaterial,
  DoubleSide,
  CanvasTexture,
  Vector2,
  PlaneGeometry
} from 'three'
import type Experience from './Experience'

const vertexShader = /* glsl */`
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  #define PI 3.14159265359

  uniform float uScrollSpeed;

  void main() {
    vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vec3 newPosition = position;

    // Curve the plane along horizontal axis
    newPosition.z = sin(uv.x * PI) * 0.2;

    vec4 modelPosition  = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition   = viewMatrix * modelPosition;

    // Y-based lateral drift
    viewPosition.x += pow(worldPosition.y, 2.0) * 0.1;

    // Scroll warp: bow sideways when spinning
    viewPosition.x += sin(uv.y * PI) * uScrollSpeed * 2.0;

    gl_Position = projectionMatrix * viewPosition;
    vUv = uv;
    vWorldPosition = worldPosition;
  }
`

const fragmentShader = /* glsl */`
  uniform sampler2D uTexture;
  uniform float uColorStrength;
  uniform float uZoom;
  uniform vec2  uPlaneSizes;
  uniform vec2  uImageSizes;
  uniform float uRevealProgress;

  varying vec2 vUv;

  float roundedRectSDF(vec2 uv, vec2 size, float radius) {
    vec2 d = abs(uv - 0.5) - size * 0.5 + radius;
    return length(max(d, 0.0)) - radius;
  }

  void main() {
    // Cover-fit image to plane aspect ratio
    vec2 ratio = vec2(
      min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
      min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
    );
    vec2 uv = vec2(
      vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    // Hover zoom
    vec2 zoomedUv = (uv - 0.5) / uZoom + 0.5;

    vec4 color;

    if (gl_FrontFacing) {
      color = texture2D(uTexture, zoomedUv);
      color = mix(color, vec4(0.0, 0.0, 0.0, 1.0), uColorStrength);
    } else {
      // Back face: 3x3 Gaussian blur
      float offset = 40.0 / 1024.0;
      vec4 c = vec4(0.0);
      c += texture2D(uTexture, uv + vec2(-offset, -offset)) * 1.0;
      c += texture2D(uTexture, uv + vec2( 0.0,   -offset)) * 2.0;
      c += texture2D(uTexture, uv + vec2( offset, -offset)) * 1.0;
      c += texture2D(uTexture, uv + vec2(-offset,  0.0))   * 2.0;
      c += texture2D(uTexture, uv)                         * 4.0;
      c += texture2D(uTexture, uv + vec2( offset,  0.0))   * 2.0;
      c += texture2D(uTexture, uv + vec2(-offset,  offset)) * 1.0;
      c += texture2D(uTexture, uv + vec2( 0.0,    offset)) * 2.0;
      c += texture2D(uTexture, uv + vec2( offset,  offset)) * 1.0;
      c /= 16.0;
      color = c;
    }

    // Reveal animation: SDF rounded rect grows from 0 to full
    float reveal    = clamp(uRevealProgress, 0.0, 1.0);
    vec2 revealSize = vec2(reveal);
    float radius    = 0.05 * reveal;

    float sdf   = roundedRectSDF(vUv, revealSize, radius);
    float alpha = 1.0 - smoothstep(0.0, 0.002, sdf);
    alpha *= smoothstep(0.1, 1.0, uRevealProgress);

    gl_FragColor = vec4(color.rgb, alpha);
  }
`

function makeProjectTexture(color: string, title: string): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1700
  canvas.height = 1000
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1700, 1000)
  // Noise-like gradient overlay
  const gradient = ctx.createRadialGradient(850, 500, 100, 850, 500, 700)
  gradient.addColorStop(0, 'rgba(255,255,255,0.05)')
  gradient.addColorStop(1, 'rgba(0,0,0,0.3)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1700, 1000)
  // Title text
  ctx.fillStyle = 'rgba(250,250,250,0.9)'
  ctx.font = 'bold 120px "DM Sans", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(title, 850, 500)
  return new CanvasTexture(canvas)
}

export default class ProjectPlane {
  experience: Experience
  mesh: Mesh
  index: number
  projectsCount: number

  // Animation state
  hiddenProgress = 1
  hiddenTarget = 1
  hoverProgress = 0
  hoverTarget = 0
  revealProgress = 0
  revealTarget = 0

  baseScaleX = 1.7
  baseScaleY = 1.0
  verticalGap = 0.5
  angleGap = 0.85
  baseRadius = 2.0

  project: { title: string; slug: string; year: number; color: string; shortDescription: string }

  constructor(
    experience: Experience,
    index: number,
    project: { title: string; slug: string; year: number; color: string; shortDescription: string },
    projectsCount: number,
    geometry: PlaneGeometry
  ) {
    this.experience = experience
    this.index = index
    this.project = project
    this.projectsCount = projectsCount

    const texture = makeProjectTexture(project.color, project.title)
    texture.needsUpdate = true

    const material = new ShaderMaterial({
      uniforms: {
        uTexture:       { value: texture },
        uColorStrength: { value: 0 },
        uZoom:          { value: 1 },
        uPlaneSizes:    { value: new Vector2(1.7, 1.0) },
        uImageSizes:    { value: new Vector2(1700, 1000) },
        uRevealProgress:{ value: 0 },
        uScrollSpeed:   { value: 0 }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: DoubleSide
    })

    this.mesh = new Mesh(geometry, material)
    this.mesh.scale.set(this.baseScaleX, this.baseScaleY, 1)
    experience.scene.add(this.mesh)
  }

  reveal() {
    this.hiddenTarget = 0
    this.revealTarget = 1
  }

  hide() {
    this.hiddenTarget = 1
    this.revealTarget = 0
  }

  setHovered(hovered: boolean) {
    this.hoverTarget = hovered ? 1 : 0
  }

  update(delta: number, scrollOffset: number, scrollSpeed: number) {
    const centerIndex = Math.floor(this.projectsCount / 2)

    // Wrapped scroll index
    let ws = (this.index - scrollOffset) % this.projectsCount
    ws = ((ws % this.projectsCount) + this.projectsCount) % this.projectsCount
    const Ba = ws - centerIndex

    // Lerp hidden/reveal/hover progress (delta-time aware)
    const hiddenFactor = 1 - Math.pow(1 - 0.05, delta * 0.15)
    const revealFactor = 1 - Math.pow(1 - 0.05, delta * 0.15)
    const hoverFactor  = 1 - Math.pow(1 - (this.hoverTarget > 0.5 ? 0.09 : 0.07), delta * 0.2)

    this.hiddenProgress += (this.hiddenTarget - this.hiddenProgress) * hiddenFactor
    this.revealProgress += (this.revealTarget - this.revealProgress) * revealFactor
    this.hoverProgress  += (this.hoverTarget  - this.hoverProgress)  * hoverFactor

    // Determine fly direction (planes above center go up, below go down)
    const ss = Ba > 0 ? -1.5 : 1.5

    // Position
    const Va = Ba * this.verticalGap - 0.8 - this.hiddenProgress * ss
    const Ga = this.baseRadius * (1 - this.hiddenProgress / 2)
    const Ha = Ba * this.angleGap

    this.mesh.position.set(
      Math.cos(Ha) * Ga,
      Va,
      Math.sin(Ha) * Ga
    )
    this.mesh.rotation.y = -Ha + Math.PI / 2

    // Shader uniforms
    const mat = this.mesh.material as ShaderMaterial
    mat.uniforms.uScrollSpeed.value = scrollSpeed
    mat.uniforms.uColorStrength.value = 0.55 * this.hoverProgress
    mat.uniforms.uZoom.value = 1 + 0.05 * this.hoverProgress
    mat.uniforms.uRevealProgress.value = this.revealProgress * (1 - this.hoverProgress * 0.05)
  }

  destroy() {
    this.experience.scene.remove(this.mesh)
    ;(this.mesh.material as ShaderMaterial).dispose()
  }
}
