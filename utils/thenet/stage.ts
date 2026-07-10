// ============================================================
// "The Net" — the procedural 3D stage (scenes 1 & 2).
// ============================================================
//
// Everything here is generated in code. No photographs, no downloaded assets,
// no HDRI. That is the whole point: because we author the geometry and the
// material ourselves, we can PROVE the six oranges are the same colour — they
// are all drawn by one MeshStandardMaterial whose `.color` came from the
// single BASE_ORANGE constant. Read `baseColorHex()` and you are reading the
// exact value that rendered every fruit.
import * as THREE from 'three'
import { BASE_ORANGE, NET_ORANGE } from './palette'
import { fbm3, mulberry32 } from './noise'

// The bag holds six. Denser netting sits on the RIGHT side of the bag, so the
// fruit at higher x reads riper — that is the trap in scene 1.
const COUNT = 6

export interface OrangeScreenPos {
  x: number // css px, canvas-relative
  y: number
  r: number // projected radius in css px
  visible: boolean
}

export class NetStage {
  readonly canvas: HTMLCanvasElement
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private pmrem: THREE.PMREMGenerator

  private root = new THREE.Group() // tilts for parallax
  private cluster = new THREE.Group() // holds the six fruit
  private oranges: THREE.Mesh[] = []
  private orangeMat!: THREE.MeshStandardMaterial

  netGroup = new THREE.Group()
  netUniforms!: {
    uDissolve: { value: number }
    uOpacity: { value: number }
    uColor: { value: THREE.Color }
  }
  shadow!: THREE.Mesh

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
    this.renderer.toneMappingExposure = 1.05

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    // Three-quarter view, looking slightly down at the bag.
    this.camera.position.set(2.4, 1.6, 4.6)
    this.camera.lookAt(0, -0.1, 0)

    this.pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = this.buildEnvironment()

    this.scene.add(this.root)
    this.root.add(this.cluster)
    this.root.add(this.netGroup)

    this.buildLights()
    this.buildOranges()
    this.buildNet()
    this.buildShadow()

    this.resize()
    this.tick = this.tick.bind(this)
    this.raf = requestAnimationFrame(this.tick)
  }

  /** The exact colour that rendered every orange — proof, not decoration. */
  baseColorHex(): string {
    return `#${this.orangeMat.color.getHexString().toUpperCase()}`
  }

  // ── environment: a subtle procedural studio, no HDRI file ──
  private buildEnvironment(): THREE.Texture {
    const c = document.createElement('canvas')
    c.width = 64
    c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, c.height)
    g.addColorStop(0, '#3a3532') // soft warm sky
    g.addColorStop(0.5, '#201c1a')
    g.addColorStop(1, '#0a0908') // dark floor
    ctx.fillStyle = g
    ctx.fillRect(0, 0, c.width, c.height)
    // a gentle key highlight so the peel gets a believable specular roll-off
    const hi = ctx.createRadialGradient(44, 30, 2, 44, 30, 40)
    hi.addColorStop(0, 'rgba(255,240,220,0.9)')
    hi.addColorStop(1, 'rgba(255,240,220,0)')
    ctx.fillStyle = hi
    ctx.fillRect(0, 0, c.width, c.height)

    const tex = new THREE.CanvasTexture(c)
    tex.mapping = THREE.EquirectangularReflectionMapping
    tex.colorSpace = THREE.SRGBColorSpace
    const env = this.pmrem.fromEquirectangular(tex).texture
    tex.dispose()
    return env
  }

  private buildLights() {
    const key = new THREE.DirectionalLight(0xffe9d0, 2.1)
    key.position.set(3, 5, 4)
    this.scene.add(key)

    const fill = new THREE.DirectionalLight(0xbfc8ff, 0.45)
    fill.position.set(-4, 1, 2)
    this.scene.add(fill)

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.12))
  }

  // ── the six oranges: one geometry, ONE shared material ──
  private buildOranges() {
    const geo = new THREE.SphereGeometry(0.5, 96, 72)
    this.displacePeel(geo)
    geo.computeVertexNormals()

    // ONE material. Its colour is the single constant. All six meshes point at
    // this exact instance — there is no per-fruit colour anywhere.
    this.orangeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(BASE_ORANGE),
      roughness: 0.62,
      metalness: 0.0,
      bumpMap: this.buildPeelBump(),
      bumpScale: 0.9,
      envMapIntensity: 0.7
    })

    const rand = mulberry32(7)
    // A loose 2-2-2 bag. x spreads left→right so the right side can sit under
    // denser netting.
    const layout: [number, number, number][] = [
      [-0.66, 0.40, 0.12],
      [0.66, 0.40, 0.12],
      [-0.68, -0.34, 0.22],
      [0.68, -0.34, 0.22],
      [0.0, 0.06, 0.42],
      [0.0, -0.72, 0.06]
    ]

    for (let i = 0; i < COUNT; i++) {
      const m = new THREE.Mesh(geo, this.orangeMat)
      const [x, y, z] = layout[i]
      m.position.set(x, y, z)
      // random orientation only — so the shared geometry never looks cloned.
      m.rotation.set(rand() * Math.PI * 2, rand() * Math.PI * 2, rand() * Math.PI * 2)
      const s = 0.94 + rand() * 0.12
      m.scale.setScalar(s)
      this.oranges.push(m)
      this.cluster.add(m)
    }
  }

  /** Push vertices in/out with seeded fbm — dimpled citrus peel, deterministic. */
  private displacePeel(geo: THREE.SphereGeometry) {
    const pos = geo.attributes.position as THREE.BufferAttribute
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const n = fbm3(v.x * 4.5, v.y * 4.5, v.z * 4.5, 42, 4)
      const dimple = fbm3(v.x * 14, v.y * 14, v.z * 14, 91, 2)
      const disp = 1 + (n - 0.5) * 0.05 + (dimple - 0.5) * 0.02
      v.multiplyScalar(disp)
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    pos.needsUpdate = true
  }

  /** A seeded noise canvas used as the shared peel bump map (pitted skin). */
  private buildPeelBump(): THREE.CanvasTexture {
    const size = 256
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')!
    const img = ctx.createImageData(size, size)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const n = fbm3(x * 0.16, y * 0.16, 0, 5, 4)
        const pit = fbm3(x * 0.7, y * 0.7, 3.1, 8, 2)
        const val = Math.min(255, Math.max(0, (n * 0.6 + pit * 0.4) * 255))
        const idx = (y * size + x) * 4
        img.data[idx] = img.data[idx + 1] = img.data[idx + 2] = val
        img.data[idx + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(3, 3)
    return tex
  }

  // ── the net: a diamond lattice drawn in a shader on a baggy shell ──
  private buildNet() {
    this.netUniforms = {
      uDissolve: { value: 0 }, // 0 = intact, 1 = fully lifted away
      uOpacity: { value: 1 },
      uColor: { value: new THREE.Color(NET_ORANGE) }
    }

    const geo = new THREE.SphereGeometry(1.18, 180, 140)
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: this.netUniforms,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform float uDissolve;
        uniform float uOpacity;
        uniform vec3 uColor;

        // distance to the nearest strand of a set of parallel lines at 'freq'
        float lines(float coord, float freq, float width) {
          float f = fract(coord * freq);
          float d = min(f, 1.0 - f);           // 0 at a strand centre
          return 1.0 - smoothstep(0.0, width, d);
        }

        void main() {
          // Density ramps left(loose) -> right(dense): some fruit sit under
          // heavier netting. This is what makes them read riper.
          float density = mix(9.0, 15.0, smoothstep(0.0, 1.0, vUv.x));
          float w = mix(0.055, 0.035, smoothstep(0.0, 1.0, vUv.x));

          float a = lines(vUv.x + vUv.y, density, w);
          float b = lines(vUv.x - vUv.y, density, w);
          float strand = max(a, b);

          // Dissolve upward: strands near the top vanish first as the bag lifts.
          // uDissolve 0 -> threshold above 1 (nothing gone, net intact);
          // uDissolve 1 -> threshold below 0 (everything gone).
          float threshold = mix(1.25, -0.3, uDissolve);
          float gone = smoothstep(threshold, threshold + 0.25, vUv.y);
          float alpha = strand * (1.0 - gone) * uOpacity * 0.92;

          // Only the front-facing half should paint over the fruit; fade the
          // rim so the silhouette stays clean instead of a hard cutout.
          float facing = smoothstep(-0.1, 0.35, vNormal.z);
          alpha *= facing;

          if (alpha < 0.02) discard;
          gl_FragColor = vec4(uColor, alpha);
        }
      `
    })

    const shell = new THREE.Mesh(geo, mat)
    shell.scale.set(1.0, 1.16, 1.0) // baggy: a touch tall, like a real net sack
    shell.position.y = 0.02
    shell.renderOrder = 2
    this.netGroup.add(shell)
  }

  // ── soft contact shadow (fake, animatable), no shadow maps ──
  private buildShadow() {
    const size = 256
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2)
    g.addColorStop(0, 'rgba(0,0,0,0.55)')
    g.addColorStop(0.6, 'rgba(0,0,0,0.28)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(c)

    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false
    })
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), mat)
    this.shadow.rotation.x = -Math.PI / 2
    this.shadow.position.y = -1.02
    this.root.add(this.shadow)
  }

  // ── parallax: max ~4deg tilt toward the pointer ──
  setPointer(nx: number, ny: number) {
    // nx, ny in -1..1
    const max = (4 * Math.PI) / 180
    this.target.x = ny * max
    this.target.y = nx * max
  }

  /** Project an orange's centre to canvas-relative CSS pixels + a radius. */
  projectOrange(i: number): OrangeScreenPos {
    const rect = this.canvas.getBoundingClientRect()
    const world = new THREE.Vector3()
    this.oranges[i].getWorldPosition(world)
    const p = world.clone().project(this.camera)
    const x = (p.x * 0.5 + 0.5) * rect.width
    const y = (-p.y * 0.5 + 0.5) * rect.height
    // approximate projected radius from a point offset by the fruit radius
    const edge = world.clone().add(new THREE.Vector3(0, 0.5, 0)).project(this.camera)
    const ey = (-edge.y * 0.5 + 0.5) * rect.height
    const r = Math.max(14, Math.abs(ey - y))
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
    // ease parallax toward target
    this.parallax.x += (this.target.x - this.parallax.x) * 0.06
    this.parallax.y += (this.target.y - this.parallax.y) * 0.06
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
