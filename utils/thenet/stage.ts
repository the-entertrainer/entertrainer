// ============================================================
// "The Net" — the procedural 3D stage (scenes 1 & 2).
// ============================================================
//
// Everything is generated in code — no photographs, no HDRI, no downloaded
// assets. That is the point: because we author geometry and material
// ourselves, we can PROVE the six oranges are the same colour. All six are
// drawn by ONE MeshPhysicalMaterial whose `.color` came from the single
// BASE_ORANGE constant; `baseColorHex()` reads back the exact value that
// rendered every fruit.
//
// Realism strategy (all procedural, all deterministic):
//  - A 4+2 pile of fruit RESTING on a ground plane, not floating.
//  - Peel: fine seeded pore bump + waxy clearcoat, tiny stem + calyx.
//  - The net is real geometry: two helical families of tube strands draped
//    over an implicit hull (smooth-min of the six fruit spheres), gathered
//    into a neck, wrapped, and knotted — the way an actual mesh bag hangs.
//  - Product lighting: warm key, cool fill, back rim, procedural studio
//    environment, blob contact shadows, and a lattice shadow cast by the
//    net that fades when the net lifts.
import * as THREE from 'three'
import { BASE_ORANGE, NET_ORANGE } from './palette'
import { fbm3, mulberry32 } from './noise'

// ── layout constants ─────────────────────────────────────────
// Fruit radius is 0.5 · scale; centres tuned so neighbours touch without
// intersecting. Ground is y = 0.
const R = 0.5
const PILE: { p: [number, number, number]; s: number }[] = [
  { p: [-0.62, 0.475, 0.28], s: 0.97 },
  { p: [0.42, 0.48, 0.62], s: 0.98 },
  { p: [0.62, 0.47, -0.4], s: 0.96 },
  { p: [-0.42, 0.475, -0.66], s: 0.97 },
  { p: [-0.1, 1.2, 0.44], s: 0.95 },
  { p: [0.1, 1.19, -0.52], s: 0.94 }
]
const PILE_CENTER = new THREE.Vector3(0, 0.74, 0)
const KNOT = new THREE.Vector3(0.08, 2.0, -0.04)

export interface OrangeScreenPos {
  x: number
  y: number
  r: number
  visible: boolean
}

// polynomial smooth-min — blends the six spheres into one baggy hull the
// strands can drape across (fabric spans crevices instead of diving in).
function smin(a: number, b: number, k: number): number {
  const h = Math.max(k - Math.abs(a - b), 0) / k
  return Math.min(a, b) - h * h * k * 0.25
}

export class NetStage {
  readonly canvas: HTMLCanvasElement
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private pmrem: THREE.PMREMGenerator

  private root = new THREE.Group()
  private oranges: THREE.Mesh[] = []
  private orangeMat!: THREE.MeshPhysicalMaterial

  // exposed handles the reveal animation tweens directly
  netGroup = new THREE.Group()
  netMaterial!: THREE.MeshStandardMaterial
  netShadowMaterial!: THREE.MeshBasicMaterial

  private raf = 0
  private parallax = { x: 0, y: 0 }
  private target = { x: 0, y: 0 }
  private disposed = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.18

    this.scene = new THREE.Scene()
    // fog melts the ground disc's edge into the page backdrop
    this.scene.fog = new THREE.Fog(0x16110d, 5.5, 11)

    this.camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100)
    this.camera.position.set(2.55, 2.2, 5.15)
    this.camera.lookAt(0, 1.04, 0)

    this.pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = this.buildEnvironment()

    this.scene.add(this.root)
    this.root.add(this.netGroup)

    this.buildLights()
    this.buildGround()
    this.buildOranges()
    this.buildNet()
    this.buildShadows()

    this.resize()
    this.tick = this.tick.bind(this)
    this.raf = requestAnimationFrame(this.tick)
  }

  /** The exact colour that rendered every orange — proof, not decoration. */
  baseColorHex(): string {
    return `#${this.orangeMat.color.getHexString().toUpperCase()}`
  }

  // ── environment: a procedural photo studio ─────────────────
  private buildEnvironment(): THREE.Texture {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, c.height)
    g.addColorStop(0, '#332c26')
    g.addColorStop(0.55, '#1c1713')
    g.addColorStop(1, '#0b0907')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, c.width, c.height)

    const blob = (x: number, y: number, r: number, col: string, a: number) => {
      const rg = ctx.createRadialGradient(x, y, 1, x, y, r)
      rg.addColorStop(0, col.replace(')', `,${a})`).replace('rgb', 'rgba'))
      rg.addColorStop(1, col.replace(')', ',0)').replace('rgb', 'rgba'))
      ctx.fillStyle = rg
      ctx.fillRect(0, 0, c.width, c.height)
    }
    blob(70, 26, 60, 'rgb(255,236,210)', 0.95) // warm softbox, high left
    blob(205, 44, 44, 'rgb(150,170,205)', 0.4) // cool counter, right

    const tex = new THREE.CanvasTexture(c)
    tex.mapping = THREE.EquirectangularReflectionMapping
    tex.colorSpace = THREE.SRGBColorSpace
    const env = this.pmrem.fromEquirectangular(tex).texture
    tex.dispose()
    return env
  }

  private buildLights() {
    const key = new THREE.DirectionalLight(0xffe3c2, 2.7)
    key.position.set(3.2, 4.6, 2.4)
    this.scene.add(key)

    const fill = new THREE.DirectionalLight(0xa9b8d8, 0.55)
    fill.position.set(-3.6, 2.0, 3.4)
    this.scene.add(fill)

    // back rim separates the pile's silhouette from the dark set
    const rim = new THREE.DirectionalLight(0xffd2a8, 1.1)
    rim.position.set(-1.6, 3.0, -4.2)
    this.scene.add(rim)

    this.scene.add(new THREE.HemisphereLight(0x35302a, 0x0f0c09, 0.45))
  }

  private buildGround() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x1d1712, roughness: 0.96, metalness: 0 })
    const ground = new THREE.Mesh(new THREE.CircleGeometry(8, 48), mat)
    ground.rotation.x = -Math.PI / 2
    this.root.add(ground)
  }

  // ── the six oranges: one geometry, ONE shared material ─────
  private buildOranges() {
    const geo = new THREE.SphereGeometry(R, 128, 96)
    this.displacePeel(geo)
    geo.computeVertexNormals()

    this.orangeMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(BASE_ORANGE),
      roughness: 0.46,
      metalness: 0,
      bumpMap: this.buildPeelBump(),
      bumpScale: 1.35,
      clearcoat: 0.14, // the waxy sheen of citrus skin
      clearcoatRoughness: 0.5,
      envMapIntensity: 0.85
    })

    // stem + calyx share cheap materials; they are trim, not peel, so they
    // don't participate in the colour argument.
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x5c5426, roughness: 0.9 })
    const calyxMat = new THREE.MeshStandardMaterial({ color: 0x4d5023, roughness: 0.95 })
    const stemGeo = new THREE.CylinderGeometry(0.014, 0.02, 0.045, 8)
    const calyxGeo = new THREE.ConeGeometry(0.055, 0.02, 5)

    const rand = mulberry32(7)
    for (const { p, s } of PILE) {
      const fruit = new THREE.Group()
      const m = new THREE.Mesh(geo, this.orangeMat)
      fruit.add(m)

      const stem = new THREE.Mesh(stemGeo, stemMat)
      stem.position.y = R + 0.012
      const calyx = new THREE.Mesh(calyxGeo, calyxMat)
      calyx.position.y = R + 0.002
      fruit.add(stem, calyx)

      // random orientation so the shared geometry never reads as cloned and
      // the stems point every which way, as poured fruit does.
      fruit.rotation.set(rand() * Math.PI * 2, rand() * Math.PI * 2, rand() * Math.PI * 2)
      fruit.scale.setScalar(s)
      fruit.position.set(p[0], p[1], p[2])
      this.oranges.push(m)
      this.root.add(fruit)
    }
  }

  /** Gentle seeded irregularity — real fruit is never a perfect sphere. */
  private displacePeel(geo: THREE.SphereGeometry) {
    const pos = geo.attributes.position as THREE.BufferAttribute
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const broad = fbm3(v.x * 3.2, v.y * 3.2, v.z * 3.2, 42, 3)
      const fine = fbm3(v.x * 11, v.y * 11, v.z * 11, 91, 2)
      v.multiplyScalar(1 + (broad - 0.5) * 0.022 + (fine - 0.5) * 0.007)
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    pos.needsUpdate = true
  }

  /** Citrus pores: a seeded canvas of small dark pits on a soft field. */
  private buildPeelBump(): THREE.CanvasTexture {
    const size = 512
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')!
    const img = ctx.createImageData(size, size)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const field = fbm3(x * 0.045, y * 0.045, 0, 5, 3) // soft undulation
        const pore = fbm3(x * 0.42, y * 0.42, 3.1, 8, 2)
        const pit = Math.max(0, (pore - 0.55) / 0.45) // sparse dark pits
        const val = Math.min(255, Math.max(0, (0.64 + (field - 0.5) * 0.24 - pit * 0.85) * 255))
        const idx = (y * size + x) * 4
        img.data[idx] = img.data[idx + 1] = img.data[idx + 2] = val
        img.data[idx + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(4, 4)
    return tex
  }

  // ── the net: tube strands draped over the fruit hull ───────
  private bagSDF(p: THREE.Vector3): number {
    let d = Infinity
    for (const { p: c, s } of PILE) {
      const dist =
        Math.hypot(p.x - c[0], p.y - c[1], p.z - c[2]) - (R * s + 0.045)
      d = smin(d, dist, 0.38)
    }
    return d
  }

  /** March outward from the pile centre; return where the strand rests. */
  private surfacePoint(dir: THREE.Vector3): THREE.Vector3 {
    const steps = 120
    const maxR = 2.6
    let bestR = 0.3
    let bestD = Infinity
    let lastNeg = -1
    const probe = new THREE.Vector3()
    for (let i = 0; i <= steps; i++) {
      const r = 0.05 + (maxR - 0.05) * (i / steps)
      probe.copy(PILE_CENTER).addScaledVector(dir, r)
      const d = this.bagSDF(probe)
      if (d < 0) lastNeg = r
      if (Math.abs(d) < bestD) {
        bestD = Math.abs(d)
        bestR = r
      }
    }
    // crossed the surface: bisect the last inside→outside transition.
    // never inside (ray spans a crevice): the taut-fabric chord is simply
    // the closest approach to the hull.
    let r = lastNeg > 0 ? lastNeg : bestR
    if (lastNeg > 0) {
      let lo = lastNeg
      let hi = Math.min(lastNeg + (maxR - 0.05) / steps, maxR)
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2
        probe.copy(PILE_CENTER).addScaledVector(dir, mid)
        if (this.bagSDF(probe) < 0) lo = mid
        else hi = mid
      }
      r = (lo + hi) / 2
    }
    const out = PILE_CENTER.clone().addScaledVector(dir, r)
    out.y = Math.max(out.y, 0.02) // strands press flat against the ground
    return out
  }

  private buildNet() {
    this.netMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(NET_ORANGE),
      roughness: 0.58,
      metalness: 0,
      transparent: true,
      envMapIntensity: 0.6
    })

    const rand = mulberry32(23)
    const strandsPerFamily = 19
    const samples = 46

    for (const twist of [2.35, -2.35]) {
      for (let j = 0; j < strandsPerFamily; j++) {
        const theta0 = (j / strandsPerFamily) * Math.PI * 2 + (twist > 0 ? 0 : 0.165)
        const pts: THREE.Vector3[] = []
        for (let i = 0; i <= samples; i++) {
          const t = i / samples
          // bottom pole → shoulder, with the family's helical twist
          const phi = Math.PI * (0.9 - 0.76 * t)
          const theta = theta0 + twist * t
          const dir = new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta),
            Math.cos(phi),
            Math.sin(phi) * Math.sin(theta)
          )
          let p = this.surfacePoint(dir)
          // gather into the neck over the last stretch
          const g = THREE.MathUtils.smoothstep(t, 0.78, 1)
          if (g > 0) {
            const bundle = KNOT.clone()
            bundle.x += Math.cos(theta0 * 3.1) * 0.045
            bundle.z += Math.sin(theta0 * 2.3) * 0.045
            p = p.lerp(bundle, g)
          }
          pts.push(p)
        }
        // loose ends splaying above the knot — a tied bag, not a dome
        const tipA = KNOT.clone().add(
          new THREE.Vector3((rand() - 0.5) * 0.08, 0.06 + rand() * 0.05, (rand() - 0.5) * 0.08)
        )
        const tipB = tipA.clone().add(
          new THREE.Vector3((rand() - 0.5) * 0.15, 0.08 + rand() * 0.07, (rand() - 0.5) * 0.15)
        )
        pts.push(tipA, tipB)

        this.smoothPolyline(pts, 2)
        const curve = new THREE.CatmullRomCurve3(pts)
        const tube = new THREE.TubeGeometry(curve, 140, 0.008, 6, false)
        this.netGroup.add(new THREE.Mesh(tube, this.netMaterial))
      }
    }

    // the wrap that cinches the neck shut
    const wrap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.085, 0.1, 16),
      this.netMaterial
    )
    wrap.position.copy(KNOT)
    this.netGroup.add(wrap)
  }

  /** Small moving-average passes so strands read taut, not jittery. */
  private smoothPolyline(pts: THREE.Vector3[], passes: number) {
    for (let p = 0; p < passes; p++) {
      for (let i = 1; i < pts.length - 1; i++) {
        pts[i]
          .multiplyScalar(2)
          .add(pts[i - 1])
          .add(pts[i + 1])
          .multiplyScalar(0.25)
      }
    }
  }

  // ── shadows: blob contacts + the net's lattice, all fake ───
  private radialTexture(inner: number, mid: number): THREE.CanvasTexture {
    const size = 256
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2)
    g.addColorStop(0, `rgba(0,0,0,${inner})`)
    g.addColorStop(0.55, `rgba(0,0,0,${mid})`)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    return new THREE.CanvasTexture(c)
  }

  private buildShadows() {
    // one wide ambient pool under the pile
    const pool = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 4.4),
      new THREE.MeshBasicMaterial({ map: this.radialTexture(0.5, 0.22), transparent: true, depthWrite: false })
    )
    pool.rotation.x = -Math.PI / 2
    pool.position.y = 0.008
    this.root.add(pool)

    // tighter contact blobs under the four grounded fruit, nudged away
    // from the key light
    const blobTex = this.radialTexture(0.55, 0.18)
    for (const { p, s } of PILE.slice(0, 4)) {
      const blob = new THREE.Mesh(
        new THREE.PlaneGeometry(1.25 * s, 1.25 * s),
        new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })
      )
      blob.rotation.x = -Math.PI / 2
      blob.position.set(p[0] - 0.09, 0.01, p[2] + 0.07)
      this.root.add(blob)
    }

    // the net's cast lattice — a blurred diamond grid that fades as the
    // net lifts away (the "shadow softens" beat of the reveal)
    const size = 512
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')!
    ctx.strokeStyle = 'rgba(0,0,0,0.6)'
    ctx.lineWidth = 5
    ctx.filter = 'blur(4px)'
    for (let d = -size; d < size * 2; d += 42) {
      ctx.beginPath()
      ctx.moveTo(d, 0)
      ctx.lineTo(d + size, size)
      ctx.moveTo(d, size)
      ctx.lineTo(d + size, 0)
      ctx.stroke()
    }
    // mask to a soft circle so the lattice doesn't print a hard square
    ctx.filter = 'none'
    ctx.globalCompositeOperation = 'destination-in'
    const mask = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2)
    mask.addColorStop(0, 'rgba(0,0,0,1)')
    mask.addColorStop(0.7, 'rgba(0,0,0,0.7)')
    mask.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = mask
    ctx.fillRect(0, 0, size, size)

    this.netShadowMaterial = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(c),
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    })
    const lattice = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 3.1), this.netShadowMaterial)
    lattice.rotation.x = -Math.PI / 2
    lattice.position.y = 0.012
    this.root.add(lattice)
  }

  /** A tiny staggered squash as the net clears — the pile settles. */
  pulseOranges(gsapLib: { to: Function }) {
    this.oranges.forEach((m, i) => {
      const parent = m.parent as THREE.Group
      const s = parent.scale.x
      gsapLib.to(parent.scale, {
        x: s * 1.025,
        y: s * 0.975,
        z: s * 1.025,
        duration: 0.16,
        delay: i * 0.045,
        yoyo: true,
        repeat: 1,
        ease: 'sine.inOut'
      })
    })
  }

  // ── parallax: max ~2.5° drift toward the pointer ───────────
  setPointer(nx: number, ny: number) {
    const max = (2.5 * Math.PI) / 180
    this.target.x = ny * max
    this.target.y = nx * max
  }

  /** Project an orange's centre to canvas-relative CSS pixels + radius. */
  projectOrange(i: number): OrangeScreenPos {
    const rect = this.canvas.getBoundingClientRect()
    const world = new THREE.Vector3()
    this.oranges[i].getWorldPosition(world)
    const p = world.clone().project(this.camera)
    const x = (p.x * 0.5 + 0.5) * rect.width
    const y = (-p.y * 0.5 + 0.5) * rect.height
    const edge = world.clone().add(new THREE.Vector3(0, R, 0)).project(this.camera)
    const ey = (-edge.y * 0.5 + 0.5) * rect.height
    const r = Math.max(16, Math.abs(ey - y))
    return { x, y, r, visible: p.z < 1 }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect()
    const w = Math.max(1, rect.width)
    const h = Math.max(1, rect.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  private tick() {
    if (this.disposed) return
    this.parallax.x += (this.target.x - this.parallax.x) * 0.05
    this.parallax.y += (this.target.y - this.parallax.y) * 0.05
    this.root.rotation.x = this.parallax.x
    this.root.rotation.y = this.parallax.y
    this.renderer.render(this.scene, this.camera)
    this.raf = requestAnimationFrame(this.tick)
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.geometry) m.geometry.dispose()
      const mat = m.material as THREE.Material | THREE.Material[]
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
      else if (mat) mat.dispose()
    })
    this.scene.environment?.dispose()
    this.pmrem.dispose()
    this.renderer.dispose()
  }
}
