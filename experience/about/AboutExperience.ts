import * as THREE from 'three'
import { ParticleField } from './ParticleField'
import { PostFX } from './PostFX'
import { SCENES, REALIZATION_LATE } from './scenes'
import type { SceneDef } from './scenes'

const SCENE_COUNT = 12
const LERP_CAM    = 0.055
const MOBILE      = typeof window !== 'undefined' && window.innerWidth < 768

// ── Scene-specific mesh groups ──────────────────────────────────────────────
function buildConstellation(scene: THREE.Scene, def: SceneDef): THREE.Group {
  const g = new THREE.Group()
  const { attractors } = def.particles
  const col = new THREE.Color(def.particles.color)

  // Stars
  const sphereGeo = new THREE.SphereGeometry(0.06, 8, 8)
  attractors.forEach((a) => {
    const mat = new THREE.MeshBasicMaterial({ color: col })
    const mesh = new THREE.Mesh(sphereGeo, mat)
    mesh.position.set(a.x, a.y, a.z)
    g.add(mesh)
  })

  // Lines connecting stars
  const positions: number[] = []
  for (let i = 0; i < attractors.length; i++) {
    for (let j = i + 1; j < attractors.length; j++) {
      if (Math.random() < 0.55) {
        const a = attractors[i], b = attractors[j]
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z)
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry()
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  const lineMat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.35 })
  g.add(new THREE.LineSegments(lineGeo, lineMat))

  scene.add(g)
  return g
}

function buildNeural(scene: THREE.Scene, def: SceneDef): THREE.Group {
  const g = new THREE.Group()
  const col = new THREE.Color(def.particles.color)
  const { attractors } = def.particles

  const nodeGeo = new THREE.SphereGeometry(0.07, 8, 8)
  const nodes: THREE.Mesh[] = []
  attractors.forEach((a) => {
    const mat = new THREE.MeshBasicMaterial({ color: col })
    const m = new THREE.Mesh(nodeGeo, mat)
    m.position.set(a.x, a.y, a.z)
    g.add(m)
    nodes.push(m)
  })

  // Connect all pairs within distance threshold
  const positions: number[] = []
  const threshold = 1.8
  for (let i = 0; i < attractors.length; i++) {
    for (let j = i + 1; j < attractors.length; j++) {
      const a = attractors[i], b = attractors[j]
      const dx = a.x - b.x, dy = a.y - b.y
      if (Math.sqrt(dx * dx + dy * dy) < threshold) {
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z)
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry()
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  const lineMat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.25 })
  g.add(new THREE.LineSegments(lineGeo, lineMat))

  scene.add(g)
  return g
}

function buildGodray(scene: THREE.Scene, def: SceneDef): THREE.Group {
  const g = new THREE.Group()
  const a = def.particles.attractors[0]

  // Vertical elongated plane = god-ray sprite
  const geo = new THREE.PlaneGeometry(0.6, 6)
  const mat = new THREE.MeshBasicMaterial({
    color: 0xE8EEFF,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  const plane = new THREE.Mesh(geo, mat)
  plane.position.set(a.x, a.y - 1, a.z)
  g.add(plane)
  scene.add(g)
  return g
}

function buildPanels(scene: THREE.Scene, def: SceneDef): THREE.Group {
  const g = new THREE.Group()
  const { attractors } = def.particles

  attractors.forEach((a, i) => {
    const geo = new THREE.PlaneGeometry(0.9, 0.65)
    const mat = new THREE.MeshBasicMaterial({
      color: 0xFDFCF8,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(a.x, a.y, a.z)
    mesh.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.06
    g.add(mesh)
  })

  scene.add(g)
  return g
}

function buildPortrait(scene: THREE.Scene, def: SceneDef): THREE.Group {
  const g = new THREE.Group()
  const loader = new THREE.TextureLoader()
  loader.load('/naveen.jpeg', (tex) => {
    const geo = new THREE.PlaneGeometry(2.2, 2.8)
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0,
    })
    const mesh = new THREE.Mesh(geo, mat)
    const a = def.particles.attractors[0]
    mesh.position.set(a.x, a.y + 0.5, a.z)
    ;(g as any).__portraitMat = mat
    g.add(mesh)
  })
  scene.add(g)
  return g
}

// ── Main Experience class ────────────────────────────────────────────────────
export class AboutExperience {
  private canvas: HTMLCanvasElement
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private postFX: PostFX
  private particles: ParticleField
  private mouse = new THREE.Vector2()
  private clock = new THREE.Clock()

  private _progress = 0
  private _camPos    = new THREE.Vector3()
  private _camTarget = new THREE.Vector3()
  private _raf = 0

  // pre-allocated
  private _wpPos    = new THREE.Vector3()
  private _wpTarget = new THREE.Vector3()

  // scene-specific groups: sparse — only allocated for scenes that need extras
  private _extras = new Map<number, THREE.Group>()
  private _currentScene = -1
  private _time = 0

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas

    // ── Renderer ──────────────────────────────────────────────
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !MOBILE,
      powerPreference: 'high-performance',
      stencil: false,
    })
    this.renderer.setClearColor(0x0D0C0A, 1)
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    // ── Scene ─────────────────────────────────────────────────
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.FogExp2(0x0D0C0A, 0.018)

    // ── Camera ────────────────────────────────────────────────
    const fov = window.innerWidth < 900 ? 50 : 38
    this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 200)
    const w0 = SCENES[0].waypoint
    this.camera.position.set(...w0.pos)
    this._camPos.set(...w0.pos)
    this._camTarget.set(...w0.target)
    this.camera.lookAt(this._camTarget)
    this.scene.add(this.camera)

    // ── Post FX ───────────────────────────────────────────────
    this.postFX = new PostFX(
      this.renderer, this.scene, this.camera,
      window.innerWidth, window.innerHeight,
      Math.min(devicePixelRatio, 2)
    )

    // ── Particles ─────────────────────────────────────────────
    const count = MOBILE ? 12_000 : 30_000
    this.particles = new ParticleField(count, this.scene)

    // ── Mouse tracking ────────────────────────────────────────
    this._onMouseMove = this._onMouseMove.bind(this)
    window.addEventListener('mousemove', this._onMouseMove, { passive: true })

    // ── Resize ────────────────────────────────────────────────
    this._onResize = this._onResize.bind(this)
    window.addEventListener('resize', this._onResize, { passive: true })

    // ── Start RAF ─────────────────────────────────────────────
    this._tick = this._tick.bind(this)
    this._raf = requestAnimationFrame(this._tick)
  }

  setProgress(p: number) {
    this._progress = Math.max(0, Math.min(1, p))
  }

  setTheme(isDark: boolean) {
    const bg = isDark ? 0x0D0C0A : 0xF4F1EC
    this.renderer.setClearColor(bg, 1)
    if (this.scene.fog) (this.scene.fog as THREE.FogExp2).color.set(bg)
    this.postFX.setFillColor(bg)
  }

  private _onMouseMove(e: MouseEvent) {
    this.mouse.x = (e.clientX / window.innerWidth)  * 2 - 1
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
  }

  private _onResize() {
    const w = window.innerWidth, h = window.innerHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
    this.postFX.resize(w, h, Math.min(devicePixelRatio, 2))
  }

  private _tick() {
    this._raf = requestAnimationFrame(this._tick)
    const delta = this.clock.getDelta()
    this._time += delta

    const p = this._progress
    const rawScene = p * SCENE_COUNT
    const sceneIdx  = Math.min(Math.floor(rawScene), SCENE_COUNT - 1)
    const sceneLocal = rawScene - sceneIdx  // 0..1 within scene

    // ── Camera waypoint lerp ───────────────────────────────────
    const w0 = SCENES[sceneIdx].waypoint
    const w1 = SCENES[Math.min(sceneIdx + 1, SCENE_COUNT - 1)].waypoint

    this._wpPos.set(
      w0.pos[0] + (w1.pos[0] - w0.pos[0]) * sceneLocal,
      w0.pos[1] + (w1.pos[1] - w0.pos[1]) * sceneLocal,
      w0.pos[2] + (w1.pos[2] - w0.pos[2]) * sceneLocal,
    )
    this._wpTarget.set(
      w0.target[0] + (w1.target[0] - w0.target[0]) * sceneLocal,
      w0.target[1] + (w1.target[1] - w0.target[1]) * sceneLocal,
      w0.target[2] + (w1.target[2] - w0.target[2]) * sceneLocal,
    )

    this._camPos.lerp(this._wpPos, LERP_CAM)
    this._camTarget.lerp(this._wpTarget, LERP_CAM)
    this.camera.position.copy(this._camPos)
    this.camera.lookAt(this._camTarget)

    // ── Scene-specific extra objects ──────────────────────────
    this._updateExtras(sceneIdx, sceneLocal)

    // ── Particle config ───────────────────────────────────────
    let particleConfig = SCENES[sceneIdx].particles

    // Scene 04 (Realization): swap to late config at sceneLocal > 0.5
    if (sceneIdx === 3 && sceneLocal > 0.5) {
      particleConfig = {
        ...particleConfig,
        attractors: REALIZATION_LATE,
        speed: 0.04,
      }
    }

    this.particles.tick(delta, particleConfig, this.mouse, this._camPos)

    // ── Neural network node pulse (scene 06) ──────────────────
    if (sceneIdx === 5) {
      const group = this._extras.get(5)
      if (group) {
        group.children.forEach((child, i) => {
          if (child instanceof THREE.Mesh) {
            const s = 1 + Math.sin(this._time * 2.2 + i * 0.6) * 0.22
            child.scale.setScalar(s)
          }
        })
      }
    }

    // ── God-ray pulse (scene 10) ──────────────────────────────
    if (sceneIdx === 9) {
      const group = this._extras.get(9)
      if (group) {
        const mesh = group.children[0] as THREE.Mesh
        if (mesh?.material instanceof THREE.MeshBasicMaterial) {
          mesh.material.opacity = 0.08 + Math.sin(this._time * 1.1) * 0.05
        }
      }
    }

    // ── Portrait fade-in (scene 12) ──────────────────────────
    if (sceneIdx === 11) {
      const group = this._extras.get(11)
      if (group) {
        const mat = (group as any).__portraitMat as THREE.MeshBasicMaterial | undefined
        if (mat) {
          mat.opacity = THREE.MathUtils.clamp((sceneLocal - 0.3) / 0.5, 0, 1)
        }
      }
    }

    // ── Render ────────────────────────────────────────────────
    this.postFX.render()
  }

  private _updateExtras(sceneIdx: number, sceneLocal: number) {
    if (sceneIdx === this._currentScene) return
    this._currentScene = sceneIdx

    // Hide all extras
    this._extras.forEach((g) => { g.visible = false })

    const def = SCENES[sceneIdx]
    if (!def.extra) return

    // Show or lazily build the group for this scene
    if (!this._extras.has(sceneIdx)) {
      let group: THREE.Group
      switch (def.extra) {
        case 'constellation': group = buildConstellation(this.scene, def); break
        case 'neural':        group = buildNeural(this.scene, def); break
        case 'godray':        group = buildGodray(this.scene, def); break
        case 'panels':        group = buildPanels(this.scene, def); break
        case 'portrait':      group = buildPortrait(this.scene, def); break
        default:              return
      }
      this._extras.set(sceneIdx, group)
    }

    const g = this._extras.get(sceneIdx)!
    g.visible = true
  }

  destroy() {
    cancelAnimationFrame(this._raf)
    window.removeEventListener('mousemove', this._onMouseMove)
    window.removeEventListener('resize', this._onResize)
    this._extras.forEach((g) => {
      g.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
          else obj.material.dispose()
        }
      })
    })
    this.particles.dispose()
    this.postFX.dispose()
    this.renderer.dispose()
  }
}
