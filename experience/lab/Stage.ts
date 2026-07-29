/**
 * One engine, five spaces.
 *
 * The old lab duplicated a whole Experience class per variation, which meant a
 * change to input or resize handling had to be made six times. Here the parts
 * that never actually varied — renderer, camera, compositor, pointer handling,
 * texture plumbing — live once, and a `Concept` supplies only the four things
 * that genuinely differ between spaces:
 *
 *   layout()   where each card sits this frame  (the geometry)
 *   input      what a wheel or a drag means     (the motion)
 *   card       vertex + fragment shaders        (the material)
 *   face()     what is painted onto the card    (the typography)
 *
 * Everything a concept needs to be expressive is therefore a pure description,
 * and none of it is engine code.
 */
import {
  Scene, PerspectiveCamera, WebGLRenderer, Mesh, PlaneGeometry, ShaderMaterial,
  CanvasTexture, Vector2, Raycaster, DoubleSide, AdditiveBlending, NormalBlending,
  LinearFilter, SRGBColorSpace, Object3D
} from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import type { NavItem } from '~/types/nav'

// ── Shared types ─────────────────────────────────────────────────────────────

export interface StageState {
  /** Seconds since mount. */
  time: number
  /** Seconds since last frame, clamped. */
  dt: number
  /** Scroll position in card units. */
  offset: number
  /** Card units per second — drives motion blur, tearing, ink spread. */
  velocity: number
  /** Pointer in NDC, -1..1, eased. */
  px: number
  py: number
  /** 0 → 1 entrance. */
  reveal: number
  /** How long the pointer has been held down, in seconds. */
  held: number
  count: number
}

export interface CardView {
  index: number
  item: NavItem
  mesh: Mesh
  uniforms: Record<string, { value: any }>
  /** Concept-assigned: 1 when this card is the one being read. */
  focus: number
  hover: number
  seed: number
}

export interface Concept {
  id: string
  clear: number
  camera: { fov: number; pos: [number, number, number]; look: [number, number, number] }
  card: {
    aspect: number
    seg?: [number, number]
    vertex: string
    fragment: string
    uniforms?: () => Record<string, { value: any }>
    additive?: boolean
    depthWrite?: boolean
    /** Euler order — geometries that tilt a whole formation need XYZ. */
    rotationOrder?: 'XYZ' | 'YXZ' | 'ZXY' | 'ZYX' | 'YZX' | 'XZY'
  }
  /** Painted onto every card's own canvas — this is where type happens. */
  face: (ctx: CanvasRenderingContext2D, w: number, h: number, item: NavItem, img: HTMLImageElement | null, i: number) => void
  /** Optional reverse side, for geometries that turn cards over. */
  back?: (ctx: CanvasRenderingContext2D, w: number, h: number, item: NavItem, i: number) => void
  backdrop?: { fragment: string; uniforms?: () => Record<string, { value: any }>; dist: number }
  /** Full-frame finishing pass — the concept's screen-level signature. */
  composite?: { fragment: string; uniforms?: () => Record<string, { value: any }> }
  bloom?: { strength: number; radius: number; threshold: number }
  input: { axis: 'x' | 'y'; mode: 'free' | 'snap' | 'flick'; perCard?: number; invert?: boolean }
  /** `hold` commits only once ink (or equivalent) has finished spreading. */
  selectOn?: 'click' | 'hold'
  /** Positions one card for this frame, and sets its `focus`. */
  layout: (c: CardView, s: StageState) => void
  /** Optional extra scene furniture (lattices, guides); returns a per-frame update. */
  build?: (scene: Scene) => ((cards: CardView[], s: StageState) => void) | void
}

/** Signed distance from the reading position, wrapped so the set is endless. */
export function wrapT(index: number, offset: number, count: number): number {
  let t = (index - offset) % count
  if (t > count / 2) t -= count
  if (t < -count / 2) t += count
  return t
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const smootherstep = (t: number) => { const x = clamp01(t); return x * x * x * (x * (x * 6 - 15) + 10) }

// ── Card artwork ─────────────────────────────────────────────────────────────

const CARD_IMAGE: Record<string, string> = {
  'about': '/about-me.png',
  'instructional-design': '/instructional-design.png',
  'my-work': '/my-work.png',
  'tools': '/web-apps.png'
}
const _imgCache = new Map<string, Promise<HTMLImageElement | null>>()
function loadImage(id: string): Promise<HTMLImageElement | null> {
  const src = CARD_IMAGE[id]
  if (!src || typeof document === 'undefined') return Promise.resolve(null)
  let p = _imgCache.get(id)
  if (!p) {
    const img = new Image()
    img.src = src
    p = img.decode().then(() => img).catch(() => null)
    _imgCache.set(id, p)
  }
  return p
}

const FACE_W = 1280

// ── Fullscreen quad shaders ──────────────────────────────────────────────────

const QUAD_VERT = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`

// ── Input ────────────────────────────────────────────────────────────────────

class Input {
  offset = 0
  velocity = 0
  held = 0
  down = false
  px = 0; py = 0
  private _tpx = 0; private _tpy = 0
  private _v = 0
  private _last = 0
  private _dragging = false
  private _idle = 0
  private _committed: number | null = null
  private _downAt = 0

  constructor(private el: HTMLElement, private cfg: Concept['input']) {
    el.addEventListener('wheel', this._wheel, { passive: true })
    el.addEventListener('pointerdown', this._down)
    window.addEventListener('pointermove', this._move, { passive: true })
    window.addEventListener('pointerup', this._up)
    window.addEventListener('pointercancel', this._up)
  }

  private get per() { return this.cfg.perCard ?? 340 }
  private get sign() { return this.cfg.invert ? -1 : 1 }

  private _wheel = (e: WheelEvent) => {
    const d = (this.cfg.axis === 'x' ? (e.deltaX || e.deltaY) : e.deltaY) * this.sign
    if (this.cfg.mode === 'flick') {
      // Discrete: one notch of intent equals exactly one sheet.
      if (this._committed === null && Math.abs(d) > 8) {
        this._committed = Math.round(this.offset) + Math.sign(d)
        setTimeout(() => { this._committed = null }, 260)
      }
    } else {
      this.offset += d / this.per
      this._v = d / this.per
    }
    this._idle = 0
  }

  private _down = (e: PointerEvent) => {
    this.down = true
    this.held = 0
    this._downAt = performance.now()
    this._dragging = true
    this._last = this.cfg.axis === 'x' ? e.clientX : e.clientY
    this._v = 0
  }

  private _move = (e: PointerEvent) => {
    const r = this.el.getBoundingClientRect()
    this._tpx = ((e.clientX - r.left) / r.width) * 2 - 1
    this._tpy = -(((e.clientY - r.top) / r.height) * 2 - 1)
    if (!this._dragging) return
    const cur = this.cfg.axis === 'x' ? e.clientX : e.clientY
    const d = (this._last - cur) * this.sign
    this._last = cur
    if (this.cfg.mode !== 'flick') {
      this.offset += d / (this.per * 0.55)
      this._v = d / (this.per * 0.55)
    } else {
      this._v = d / (this.per * 0.55)
    }
    this._idle = 0
  }

  private _up = () => {
    if (this._dragging && this.cfg.mode === 'flick' && Math.abs(this._v) > 0.012) {
      this._committed = Math.round(this.offset) + Math.sign(this._v)
    }
    this._dragging = false
    this.down = false
    this.held = 0
  }

  update(dt: number) {
    // Wall-clock, not summed frame deltas: `dt` is clamped to 50ms to keep the
    // physics stable after a tab stall, and accumulating it would make a
    // press-and-hold take several times longer than it should on any device
    // rendering below ~20fps.
    this.held = this.down ? (performance.now() - this._downAt) / 1000 : 0
    this.px += (this._tpx - this.px) * Math.min(dt * 8, 1)
    this.py += (this._tpy - this.py) * Math.min(dt * 8, 1)

    if (this.cfg.mode === 'flick') {
      const target = this._committed ?? Math.round(this.offset)
      const k = Math.min(dt * 7.5, 1)
      const prev = this.offset
      this.offset += (target - this.offset) * k
      this.velocity = (this.offset - prev) / Math.max(dt, 0.001)
      return
    }

    if (!this._dragging) {
      this.offset += this._v
      this._v *= Math.pow(0.0025, dt)          // friction
      this._idle += dt
      if (this.cfg.mode === 'snap' && Math.abs(this._v) < 0.0016 && this._idle > 0.18) {
        const target = Math.round(this.offset)
        this.offset += (target - this.offset) * Math.min(dt * 4.5, 1)
      }
    }
    this.velocity = this._v / Math.max(dt, 0.001)
  }

  destroy() {
    this.el.removeEventListener('wheel', this._wheel)
    this.el.removeEventListener('pointerdown', this._down)
    window.removeEventListener('pointermove', this._move)
    window.removeEventListener('pointerup', this._up)
    window.removeEventListener('pointercancel', this._up)
  }
}

// ── Stage ────────────────────────────────────────────────────────────────────

export default class Stage {
  private renderer: WebGLRenderer
  private scene = new Scene()
  private camera: PerspectiveCamera
  private composer: EffectComposer
  private compositePass: ShaderPass | null = null
  private backdrop: Mesh | null = null
  private input: Input
  private raycaster = new Raycaster()
  private cards: CardView[] = []
  private geometry: PlaneGeometry
  private extraUpdate: ((cards: CardView[], s: StageState) => void) | void
  private hovered: CardView | null = null
  private raf = 0
  private t0 = performance.now()
  private last = performance.now()
  private reveal = 0
  private dead = false
  private faces: Array<{ canvas: HTMLCanvasElement; tex: CanvasTexture; card: CardView }> = []

  constructor(
    private canvas: HTMLCanvasElement,
    private concept: Concept,
    items: NavItem[],
    private onSelect: (item: NavItem) => void
  ) {
    const w = canvas.clientWidth || window.innerWidth
    const h = canvas.clientHeight || window.innerHeight

    this.renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', stencil: false })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(w, h, false)
    this.renderer.setClearColor(concept.clear, 1)

    this.camera = new PerspectiveCamera(this.fov(w), w / h, 0.1, 120)
    this.camera.position.set(...concept.camera.pos)
    this.camera.lookAt(...concept.camera.look)
    this.scene.add(this.camera)

    const seg = concept.card.seg ?? [24, 24]
    this.geometry = new PlaneGeometry(1, 1, seg[0], seg[1])

    items.forEach((item, i) => this.addCard(item, i, items.length))
    if (concept.backdrop) this.addBackdrop()

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    if (concept.bloom) {
      this.composer.addPass(new UnrealBloomPass(
        new Vector2(w, h), concept.bloom.strength, concept.bloom.radius, concept.bloom.threshold
      ))
    }
    if (concept.composite) {
      this.compositePass = new ShaderPass({
        uniforms: {
          tDiffuse: { value: null },
          uTime: { value: 0 },
          uRes: { value: new Vector2(w, h) },
          uVel: { value: 0 },
          uReveal: { value: 0 },
          ...(concept.composite.uniforms?.() ?? {})
        },
        vertexShader: QUAD_VERT,
        fragmentShader: concept.composite.fragment
      })
      this.composer.addPass(this.compositePass)
    }
    this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.composer.setSize(w, h)

    this.extraUpdate = concept.build?.(this.scene)

    this.input = new Input(canvas, concept.input)
    canvas.addEventListener('click', this.onClick)
    window.addEventListener('resize', this.onResize)
    // Faces are typeset with the site's real fonts; if they land after first
    // paint the canvases must be repainted or every card keeps the fallback.
    if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
      ;(document as any).fonts.ready.then(() => this.repaintFaces()).catch(() => {})
    }
    this.raf = requestAnimationFrame(this.tick)
  }

  private fov(w: number) {
    return w < 520 ? this.concept.camera.fov * 1.35 : w < 900 ? this.concept.camera.fov * 1.16 : this.concept.camera.fov
  }

  private addCard(item: NavItem, i: number, n: number) {
    const aspect = this.concept.card.aspect
    const canvas = document.createElement('canvas')
    canvas.width = FACE_W
    canvas.height = Math.round(FACE_W / aspect)
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.minFilter = LinearFilter
    tex.generateMipmaps = false

    let backTex: CanvasTexture | null = null
    if (this.concept.back) {
      const bc = document.createElement('canvas')
      bc.width = canvas.width; bc.height = canvas.height
      this.concept.back(bc.getContext('2d')!, bc.width, bc.height, item, i)
      backTex = new CanvasTexture(bc)
      backTex.colorSpace = SRGBColorSpace
      backTex.minFilter = LinearFilter
      backTex.generateMipmaps = false
    }

    const uniforms: Record<string, { value: any }> = {
      uTex: { value: tex },
      uBack: { value: backTex ?? tex },
      uTime: { value: 0 },
      uFocus: { value: 0 },
      uHover: { value: 0 },
      uVel: { value: 0 },
      uReveal: { value: 0 },
      uHeld: { value: 0 },
      uSeed: { value: i * 37.13 + 4.2 },
      uIndex: { value: i },
      uAspect: { value: aspect },
      uPointer: { value: new Vector2(0.5, 0.5) },
      ...(this.concept.card.uniforms?.() ?? {})
    }

    const mesh = new Mesh(this.geometry, new ShaderMaterial({
      uniforms,
      vertexShader: this.concept.card.vertex,
      fragmentShader: this.concept.card.fragment,
      transparent: true,
      side: DoubleSide,
      depthWrite: this.concept.card.depthWrite ?? false,
      blending: this.concept.card.additive ? AdditiveBlending : NormalBlending
    }))
    mesh.rotation.order = this.concept.card.rotationOrder ?? 'YXZ'
    mesh.frustumCulled = false
    this.scene.add(mesh)

    const card: CardView = { index: i, item, mesh, uniforms, focus: 0, hover: 0, seed: i * 37.13 }
    this.cards.push(card)
    this.faces.push({ canvas, tex, card })

    const paint = (img: HTMLImageElement | null) => {
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      this.concept.face(ctx, canvas.width, canvas.height, item, img, i)
      tex.needsUpdate = true
    }
    paint(null)
    loadImage(item.id).then((img) => { if (!this.dead) paint(img) })
    void n
  }

  private repaintFaces() {
    this.faces.forEach(({ canvas, tex, card }) => {
      loadImage(card.item.id).then((img) => {
        if (this.dead) return
        const ctx = canvas.getContext('2d')!
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        this.concept.face(ctx, canvas.width, canvas.height, card.item, img, card.index)
        tex.needsUpdate = true
      })
    })
  }

  private addBackdrop() {
    const b = this.concept.backdrop!
    const mesh = new Mesh(new PlaneGeometry(1, 1), new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new Vector2(1, 1) },
        uPointer: { value: new Vector2(0, 0) },
        uVel: { value: 0 },
        ...(b.uniforms?.() ?? {})
      },
      vertexShader: QUAD_VERT,
      fragmentShader: b.fragment,
      depthWrite: false,
      transparent: false
    }))
    mesh.position.z = -b.dist
    mesh.renderOrder = -1
    this.camera.add(mesh)   // rides the camera, so it always fills
    this.backdrop = mesh
    this.sizeBackdrop()
  }

  private sizeBackdrop() {
    if (!this.backdrop || !this.concept.backdrop) return
    const d = this.concept.backdrop.dist
    const h = 2 * Math.tan((this.camera.fov * Math.PI) / 360) * d
    this.backdrop.scale.set(h * this.camera.aspect * 1.06, h * 1.06, 1)
  }

  private onResize = () => {
    const w = this.canvas.clientWidth || window.innerWidth
    const h = this.canvas.clientHeight || window.innerHeight
    this.camera.fov = this.fov(w)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h, false)
    this.composer.setSize(w, h)
    this.sizeBackdrop()
    const u = this.compositePass?.material.uniforms
    if (u?.uRes) u.uRes.value.set(w, h)
    const bu = (this.backdrop?.material as ShaderMaterial | undefined)?.uniforms
    if (bu?.uRes) bu.uRes.value.set(w, h)
  }

  private pick(): CardView | null {
    this.raycaster.setFromCamera(new Vector2(this.input.px, this.input.py), this.camera)
    const hits = this.raycaster.intersectObjects(this.cards.map((c) => c.mesh), false)
    for (const h of hits) {
      const card = this.cards.find((c) => c.mesh === h.object)
      // Only the card being read is clickable — otherwise a passing card that
      // happens to slide under a stationary cursor steals the click.
      if (card && card.focus > 0.55) {
        card.uniforms.uPointer.value.set(h.uv?.x ?? 0.5, h.uv?.y ?? 0.5)
        return card
      }
    }
    return null
  }

  private onClick = () => {
    // Hold-to-commit concepts must not also fire on a stray tap, or the
    // deliberate gesture they're built around becomes decorative.
    if (this.concept.selectOn === 'hold') return
    if (this.hovered) this.onSelect(this.hovered.item)
  }

  /** Concepts with a hold gesture report progress so the UI can mirror it. */
  holdProgress = 0
  private holdFired = false

  private tick = () => {
    if (this.dead) return
    this.raf = requestAnimationFrame(this.tick)

    const now = performance.now()
    const dt = Math.min((now - this.last) / 1000, 0.05)
    this.last = now
    const time = (now - this.t0) / 1000

    this.input.update(dt)
    this.reveal = Math.min(1, this.reveal + dt / 1.1)

    const s: StageState = {
      time, dt,
      offset: this.input.offset,
      velocity: this.input.velocity,
      px: this.input.px, py: this.input.py,
      reveal: smootherstep(this.reveal),
      held: this.input.held,
      count: this.cards.length
    }

    this.hovered = this.pick()
    this.holdProgress = this.hovered && this.input.down ? clamp01(this.input.held / 0.85) : 0

    if (this.concept.selectOn === 'hold') {
      if (!this.input.down) this.holdFired = false
      else if (this.holdProgress >= 1 && this.hovered && !this.holdFired) {
        this.holdFired = true
        this.onSelect(this.hovered.item)
      }
    }

    for (const c of this.cards) {
      this.concept.layout(c, s)
      const target = c === this.hovered ? 1 : 0
      c.hover += (target - c.hover) * Math.min(dt * 9, 1)
      c.uniforms.uTime.value = time
      c.uniforms.uFocus.value = c.focus
      c.uniforms.uHover.value = c.hover
      c.uniforms.uVel.value = s.velocity
      c.uniforms.uReveal.value = s.reveal
      c.uniforms.uHeld.value = c === this.hovered ? this.holdProgress : 0
      c.mesh.renderOrder = Math.round(-c.mesh.position.z * 100)
    }

    if (this.extraUpdate) this.extraUpdate(this.cards, s)

    const bu = (this.backdrop?.material as ShaderMaterial | undefined)?.uniforms
    if (bu) {
      if (bu.uTime) bu.uTime.value = time
      if (bu.uPointer) bu.uPointer.value.set(s.px, s.py)
      if (bu.uVel) bu.uVel.value = s.velocity
    }
    const cu = this.compositePass?.material.uniforms
    if (cu) {
      if (cu.uTime) cu.uTime.value = time
      if (cu.uVel) cu.uVel.value = s.velocity
      if (cu.uReveal) cu.uReveal.value = s.reveal
    }

    this.canvas.style.cursor = this.hovered ? 'pointer' : ''
    this.composer.render()
  }

  destroy() {
    this.dead = true
    cancelAnimationFrame(this.raf)
    this.input.destroy()
    this.canvas.removeEventListener('click', this.onClick)
    window.removeEventListener('resize', this.onResize)
    this.cards.forEach((c) => {
      const m = c.mesh.material as ShaderMaterial
      m.uniforms.uTex.value?.dispose?.()
      if (m.uniforms.uBack.value !== m.uniforms.uTex.value) m.uniforms.uBack.value?.dispose?.()
      m.dispose()
      this.scene.remove(c.mesh)
    })
    if (this.backdrop) (this.backdrop.material as ShaderMaterial).dispose()
    this.geometry.dispose()
    this.composer.dispose()
    this.renderer.dispose()
    this.scene.traverse((o: Object3D) => { void o })
    this.scene.clear()
  }
}
