import {
  Mesh,
  ShaderMaterial,
  DoubleSide,
  CanvasTexture,
  Vector2,
  PlaneGeometry
} from 'three'
import type Experience from './Experience'
import type { NavItem } from '~/types/nav'

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

  varying vec2 vUv;
  #include <fog_pars_fragment>

  float roundedRectSDF(vec2 uv, vec2 size, float radius) {
    vec2 d = abs(uv - 0.5) - size * 0.5 + radius;
    return length(max(d, 0.0)) - radius;
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

    vec4 color;
    if (gl_FrontFacing) {
      color = texture2D(uTexture, zoomedUv);
      color = mix(color, vec4(0.0, 0.0, 0.0, 1.0), uColorStrength);
    } else {
      // Heavy blur + darken on back-face so text is unreadable
      float o1 = 70.0 / 1024.0;
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
      c.rgb *= 0.2;
      color = c;
    }

    float reveal    = clamp(uRevealProgress, 0.0, 1.0);
    vec2 revealSize = vec2(reveal);
    float radius    = 0.05 * reveal;
    float sdf       = roundedRectSDF(vUv, revealSize, radius);
    float alpha     = 1.0 - smoothstep(0.0, 0.002, sdf);
    alpha          *= smoothstep(0.1, 1.0, uRevealProgress);

    gl_FragColor = vec4(color.rgb, alpha);
    #include <fog_fragment>
  }
`

function makeNavTexture(color: string, label: string, description: string): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1700
  canvas.height = 1000
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1700, 1000)

  // Subtle gradient
  const grad = ctx.createLinearGradient(0, 0, 1700, 1000)
  grad.addColorStop(0, 'rgba(255,255,255,0.05)')
  grad.addColorStop(1, 'rgba(0,0,0,0.3)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1700, 1000)

  // Accent line
  ctx.fillStyle = '#F59E0B'
  ctx.fillRect(100, 820, 140, 6)

  // Main label
  ctx.fillStyle = '#fafafa'
  ctx.font = '700 180px system-ui, -apple-system, Arial, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(label, 100, 550)

  // Description
  ctx.fillStyle = 'rgba(250,250,250,0.45)'
  ctx.font = '400 64px system-ui, -apple-system, Arial, sans-serif'
  ctx.fillText(description, 100, 650)

  return new CanvasTexture(canvas)
}

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
    geometry: PlaneGeometry
  ) {
    this.experience = experience
    this.index      = index
    this.navItem    = navItem
    this.totalCount = totalCount

    const texture = makeNavTexture(navItem.color, navItem.label, navItem.description)
    texture.needsUpdate = true

    const material = new ShaderMaterial({
      uniforms: {
        uTexture:        { value: texture },
        uColorStrength:  { value: 0 },
        uZoom:           { value: 1 },
        uPlaneSizes:     { value: new Vector2(1.7, 1.0) },
        uImageSizes:     { value: new Vector2(1700, 1000) },
        uRevealProgress: { value: 0 },
        uScrollSpeed:    { value: 0 }
      },
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

  reveal() { this.hiddenTarget = 0; this.revealTarget = 1 }
  hide()   { this.hiddenTarget = 1; this.revealTarget = 0 }
  setHovered(hovered: boolean) { this.hoverTarget = hovered ? 1 : 0 }

  update(delta: number, scrollOffset: number, scrollSpeed: number) {
    const centerIndex = Math.floor(this.totalCount / 2)
    let ws = (this.index - scrollOffset) % this.totalCount
    ws = ((ws % this.totalCount) + this.totalCount) % this.totalCount
    const Ba = ws - centerIndex

    const hFactor = 1 - Math.pow(1 - 0.05, delta * 0.15)
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
  }

  destroy() {
    this.experience.scene.remove(this.mesh)
    ;(this.mesh.material as ShaderMaterial).dispose()
  }
}
