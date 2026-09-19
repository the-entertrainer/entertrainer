import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import type { ScaleId } from './scales'

/**
 * 4K photoreal maps (Blue Marble / clouds / bump / specular via turban webgl-earth;
 * night lights via three-globe; SDO AIA 304 for the solar disc; three.js moon).
 * Loaded at runtime so the island stays small. Fall back to physical colours if a
 * CDN is quiet.
 */
const TEX = {
  day: 'https://cdn.jsdelivr.net/gh/turban/webgl-earth@master/images/2_no_clouds_4k.jpg',
  clouds: 'https://cdn.jsdelivr.net/gh/turban/webgl-earth@master/images/fair_clouds_4k.png',
  bump: 'https://cdn.jsdelivr.net/gh/turban/webgl-earth@master/images/elev_bump_4k.jpg',
  spec: 'https://cdn.jsdelivr.net/gh/turban/webgl-earth@master/images/water_4k.png',
  night: 'https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg',
  moon: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r163/examples/textures/planets/moon_1024.jpg',
  sun: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0304.jpg',
}

export interface CreateEngineOpts {
  canvas: HTMLCanvasElement
  lat: number
  scale: ScaleId
  theme: 'dark' | 'light'
  rate: number
  paused: boolean
  onReady?: () => void
  onTapBody?: () => void
}

export interface VelocityEngine {
  setScale: (s: ScaleId) => void
  setLat: (lat: number) => void
  setTheme: (t: 'dark' | 'light') => void
  setRate: (r: number) => void
  setPaused: (p: boolean) => void
  dispose: () => void
}

const FRAME: Record<ScaleId, { dist: number; pitch: number; fov: number }> = {
  earth: { dist: 3.35, pitch: 0.18, fov: 32 },
  sun: { dist: 7.4, pitch: 0.22, fov: 34 },
  galaxy: { dist: 16.5, pitch: 0.55, fov: 38 },
  cosmos: { dist: 18, pitch: 0.12, fov: 42 },
  helix: { dist: 9.2, pitch: 0.08, fov: 36 },
}

function loadColor(url: string): Promise<THREE.Texture | null> {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(
      url,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = 16
        t.minFilter = THREE.LinearMipmapLinearFilter
        t.magFilter = THREE.LinearFilter
        t.needsUpdate = true
        resolve(t)
      },
      undefined,
      () => resolve(null),
    )
  })
}

function loadData(url: string): Promise<THREE.Texture | null> {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(
      url,
      (t) => {
        t.anisotropy = 8
        t.needsUpdate = true
        resolve(t)
      },
      undefined,
      () => resolve(null),
    )
  })
}

function disc(size = 64): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.35, 'rgba(210,230,255,0.55)')
  grd.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, size, size)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function milkyWaySky(): THREE.CanvasTexture {
  const w = 2048
  const h = 1024
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#02040c'
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 12000; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const mag = Math.random()
    const a = 0.12 + mag * 0.88
    ctx.fillStyle = `rgba(${210 + mag * 45},${220 + mag * 30},255,${a})`
    const s = mag > 0.985 ? 2.2 : mag > 0.92 ? 1.4 : 1
    ctx.fillRect(x, y, s, s)
  }
  for (let i = 0; i < 70000; i++) {
    const x = Math.random() * w
    const y = h * 0.5 + (Math.random() - 0.5) * h * 0.28 * Math.pow(Math.random(), 0.35)
    const d = Math.abs(y - h * 0.5) / (h * 0.22)
    const a = Math.max(0, 1 - d * d) * 0.07 * Math.random()
    const warm = Math.random()
    ctx.fillStyle = `rgba(${255},${200 + warm * 40},${160 + warm * 50},${a})`
    ctx.fillRect(x, y, 1, 1)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.mapping = THREE.EquirectangularReflectionMapping
  t.needsUpdate = true
  return t
}

function atmosphereMat(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      glowColor: { value: new THREE.Color('#4ea9ff') },
      coef: { value: 0.42 },
      power: { value: 3.6 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float coef;
      uniform float power;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float f = pow(coef - dot(vNormal, vView), power);
        gl_FragColor = vec4(glowColor, clamp(f, 0.0, 1.0));
      }
    `,
  })
}

function galaxy(): THREE.Group {
  const group = new THREE.Group()
  const N = 48000
  const pos = new Float32Array(N * 3)
  const col = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    const arm = i % 4
    const r = Math.pow(Math.random(), 0.55) * 8.4
    const a = arm * (Math.PI / 2) + r * 0.46 + (Math.random() - 0.5) * (0.09 + r * 0.012)
    const dust = Math.random() < 0.18
    pos[i * 3] = Math.cos(a) * r + (dust ? (Math.random() - 0.5) * 0.4 : 0)
    pos[i * 3 + 1] = (Math.random() - 0.5) * (0.06 + r * 0.014)
    pos[i * 3 + 2] = Math.sin(a) * r
    const core = Math.max(0, 1 - r / 8.4)
    if (dust) {
      col[i * 3] = 0.18 + core * 0.2
      col[i * 3 + 1] = 0.14 + core * 0.1
      col[i * 3 + 2] = 0.12
    } else {
      col[i * 3] = 0.55 + core * 0.45
      col[i * 3 + 1] = 0.62 + core * 0.3
      col[i * 3 + 2] = 1 - core * 0.25
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  const pts = new THREE.Points(g, new THREE.PointsMaterial({
    size: 0.038,
    vertexColors: true,
    map: disc(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  }))
  pts.rotation.x = 0.62
  group.add(pts)
  const bulge = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 32, 24),
    new THREE.MeshBasicMaterial({ color: 0xffd6a0, transparent: true, opacity: 0.55 }),
  )
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(1.35, 24, 16),
    new THREE.MeshBasicMaterial({
      color: 0xffb060,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
  group.add(bulge, halo)
  return group
}

function trailPoints(count: number, color: number, size: number): THREE.Points {
  const pos = new Float32Array(count * 3)
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return new THREE.Points(g, new THREE.PointsMaterial({
    color, size, map: disc(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }))
}

export function createEngine(opts: CreateEngineOpts): VelocityEngine {
  const renderer = new THREE.WebGLRenderer({
    canvas: opts.canvas,
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
  })
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.92
  renderer.setClearColor(0x02040c, 1)

  const scene = new THREE.Scene()
  const sky = milkyWaySky()
  scene.background = sky
  scene.environment = sky

  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 400)
  const clock = new THREE.Clock()

  let scale: ScaleId = opts.scale
  let rate = opts.rate
  let paused = opts.paused
  let pinLat = opts.lat
  let yaw = 0.55
  let pitch = FRAME[scale].pitch
  let dist = FRAME[scale].dist
  let targetDist = dist
  let disposed = false
  let simT = 0
  let reduced = false
  try {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch { /* */ }

  const sunLight = new THREE.DirectionalLight(0xfff1d0, 2.35)
  sunLight.position.set(-8, 3.2, 5.5)
  scene.add(sunLight)
  scene.add(new THREE.AmbientLight(0x1a2233, 0.18))
  const fill = new THREE.PointLight(0x6aa4ff, 0.35, 40)
  fill.position.set(6, 1.4, -4)
  scene.add(fill)

  const groups: Record<ScaleId, THREE.Group> = {
    earth: new THREE.Group(),
    sun: new THREE.Group(),
    galaxy: new THREE.Group(),
    cosmos: new THREE.Group(),
    helix: new THREE.Group(),
  }
  Object.values(groups).forEach((g) => {
    g.visible = false
    scene.add(g)
  })

  const earthPivot = new THREE.Group()
  const earthMat = new THREE.MeshPhysicalMaterial({
    color: 0x6d889c,
    roughness: 0.62,
    metalness: 0.04,
    clearcoat: 0.08,
    clearcoatRoughness: 0.7,
    envMapIntensity: 0.35,
  })
  const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 192, 128), earthMat)
  const cloudsMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    roughness: 1,
    metalness: 0,
  })
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.018, 96, 64), cloudsMat)
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.08, 64, 48), atmosphereMat())
  const latRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.02, 0.0045, 8, 192),
    new THREE.MeshBasicMaterial({ color: 0x7ad4ff, transparent: true, opacity: 0.55 }),
  )
  latRing.rotation.x = Math.PI / 2
  const pin = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffd36a }),
  )
  earthPivot.add(earth, clouds, atmo)
  groups.earth.add(earthPivot, latRing, pin)

  const sunMat = new THREE.MeshStandardMaterial({
    color: 0xffc56a,
    emissive: 0xff7a18,
    emissiveIntensity: 1.4,
    roughness: 0.55,
    metalness: 0,
  })
  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.72, 96, 64), sunMat)
  const corona = new THREE.Mesh(
    new THREE.SphereGeometry(1.18, 48, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffb24a,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
  const sunGlow = new THREE.Mesh(
    new THREE.SphereGeometry(1.7, 32, 24),
    new THREE.MeshBasicMaterial({
      color: 0xff8a30,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
  const orbitRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.55, 0.006, 8, 256),
    new THREE.MeshBasicMaterial({ color: 0x5ec8ff, transparent: true, opacity: 0.4 }),
  )
  orbitRing.rotation.x = Math.PI / 2
  const earthBeadMat = new THREE.MeshPhysicalMaterial({
    color: 0x3d8dff,
    roughness: 0.35,
    metalness: 0.08,
    clearcoat: 0.4,
  })
  const earthBead = new THREE.Mesh(new THREE.SphereGeometry(0.09, 32, 24), earthBeadMat)
  const moonMat = new THREE.MeshStandardMaterial({ color: 0xb8b4aa, roughness: 0.92, metalness: 0 })
  const moonBead = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 16), moonMat)
  const sunTrail = trailPoints(120, 0x4fd2ff, 0.045)
  groups.sun.add(sun, corona, sunGlow, orbitRing, earthBead, moonBead, sunTrail)

  const milky = galaxy()
  const sunMark = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffd36a }),
  )
  sunMark.position.set(4.6, 0.12, 0.4)
  milky.add(sunMark)
  const flow = trailPoints(180, 0xff6ad2, 0.05)
  groups.galaxy.add(milky, flow)

  const warm = trailPoints(280, 0xff6b4a, 0.065)
  const cool = trailPoints(280, 0x4fd2ff, 0.065)
  groups.cosmos.add(warm, cool, galaxy())

  const helixPts: number[] = []
  for (let i = 0; i <= 360; i++) {
    const u = i / 360
    const a = u * Math.PI * 6
    helixPts.push(Math.cos(a) * (1.45 + u * 0.18), (u - 0.5) * 5.2, Math.sin(a) * (1.45 + u * 0.18))
  }
  const helixGeom = new THREE.BufferGeometry()
  helixGeom.setAttribute('position', new THREE.Float32BufferAttribute(helixPts, 3))
  const helixLine = new THREE.Line(
    helixGeom,
    new THREE.LineBasicMaterial({ color: 0x6ad4ff, transparent: true, opacity: 0.75 }),
  )
  const helixSun = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xffd36a }),
  )
  groups.helix.add(helixLine, helixSun)

  function applyEarthMaps(
    day: THREE.Texture | null,
    night: THREE.Texture | null,
    bump: THREE.Texture | null,
    spec: THREE.Texture | null,
    cloud: THREE.Texture | null,
  ) {
    if (day) {
      earthMat.map = day
      earthMat.color.set(0xffffff)
    }
    if (night) {
      earthMat.emissiveMap = night
      earthMat.emissive = new THREE.Color(0x1a3a68)
      earthMat.emissiveIntensity = 1.15
    }
    if (bump) {
      earthMat.bumpMap = bump
      earthMat.bumpScale = 0.045
    }
    if (spec) {
      earthMat.roughnessMap = spec
      earthMat.roughness = 0.85
      earthMat.metalness = 0.02
    }
    earthMat.needsUpdate = true
    if (cloud) {
      cloudsMat.map = cloud
      cloudsMat.alphaMap = cloud
      cloudsMat.opacity = 0.55
      cloudsMat.needsUpdate = true
    }
  }

  void Promise.all([
    loadColor(TEX.day),
    loadColor(TEX.night),
    loadData(TEX.bump),
    loadData(TEX.spec),
    loadColor(TEX.clouds),
    loadColor(TEX.sun),
    loadColor(TEX.moon),
  ]).then(([day, night, bump, spec, cloud, sunMap, moonMap]) => {
    applyEarthMaps(day, night, bump, spec, cloud)
    if (sunMap) {
      sunMat.map = sunMap
      sunMat.emissiveMap = sunMap
      sunMat.color.set(0xffffff)
      sunMat.emissive = new THREE.Color(0xff9a40)
      sunMat.needsUpdate = true
    }
    if (moonMap) {
      moonMat.map = moonMap
      moonMat.color.set(0xffffff)
      moonMat.needsUpdate = true
    }
    opts.onReady?.()
  })

  function placePin() {
    const phi = THREE.MathUtils.degToRad(90 - pinLat)
    pin.position.setFromSphericalCoords(1.045, phi, THREE.MathUtils.degToRad(77))
    const r = Math.cos(THREE.MathUtils.degToRad(pinLat)) * 1.02
    latRing.scale.set(Math.max(0.08, r / 1.02), 1, Math.max(0.08, r / 1.02))
    latRing.position.y = Math.sin(THREE.MathUtils.degToRad(pinLat)) * 1.0
  }
  placePin()

  function show(s: ScaleId) {
    scale = s
    pitch = FRAME[s].pitch
    targetDist = FRAME[s].dist
    dist = THREE.MathUtils.lerp(dist, targetDist, 0.4)
    yaw = s === 'helix' ? 0.85 : 0.55
    camera.fov = FRAME[s].fov
    camera.updateProjectionMatrix()
    ;(Object.keys(groups) as ScaleId[]).forEach((k) => {
      groups[k].visible = k === s
    })
  }
  show(scale)

  const pointers = new Map<number, { x: number; y: number }>()
  let pinch0 = 0
  let moved = 0
  let dragging = false
  let lx = 0
  let ly = 0

  const onDown = (e: PointerEvent) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.size === 1) {
      dragging = true
      moved = 0
      lx = e.clientX
      ly = e.clientY
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      pinch0 = Math.hypot(a.x - b.x, a.y - b.y)
      dragging = false
    }
    try { opts.canvas.setPointerCapture(e.pointerId) } catch { /* */ }
  }
  const onMove = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      if (pinch0 > 0) {
        const factor = pinch0 / Math.max(24, d)
        targetDist = THREE.MathUtils.clamp(targetDist * factor, FRAME[scale].dist * 0.45, FRAME[scale].dist * 2.4)
        pinch0 = d
      }
      return
    }
    if (!dragging) return
    const dx = e.clientX - lx
    const dy = e.clientY - ly
    lx = e.clientX
    ly = e.clientY
    moved += Math.abs(dx) + Math.abs(dy)
    yaw -= dx * 0.0044
    pitch = THREE.MathUtils.clamp(pitch + dy * 0.0032, -1.15, 1.15)
  }
  const onUp = (e: PointerEvent) => {
    pointers.delete(e.pointerId)
    if (pointers.size < 2) pinch0 = 0
    if (pointers.size === 0) {
      dragging = false
      if (moved < 7) opts.onTapBody?.()
    }
    try { opts.canvas.releasePointerCapture(e.pointerId) } catch { /* */ }
  }
  const onWheel = (e: WheelEvent) => {
    e.preventDefault()
    targetDist = THREE.MathUtils.clamp(targetDist + e.deltaY * 0.01, FRAME[scale].dist * 0.45, FRAME[scale].dist * 2.4)
  }
  opts.canvas.addEventListener('pointerdown', onDown)
  opts.canvas.addEventListener('pointermove', onMove)
  opts.canvas.addEventListener('pointerup', onUp)
  opts.canvas.addEventListener('pointercancel', onUp)
  opts.canvas.addEventListener('wheel', onWheel, { passive: false })

  const composer = new EffectComposer(renderer)
  const renderPass = new RenderPass(scene, camera)
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.42, 0.55, 0.84)
  composer.addPass(renderPass)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())

  const ro = new ResizeObserver(() => {
    const w = opts.canvas.clientWidth || 1
    const h = opts.canvas.clientHeight || 1
    renderer.setSize(w, h, false)
    composer.setSize(w, h)
    bloom.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  })
  ro.observe(opts.canvas)
  const readyT = window.setTimeout(() => opts.onReady?.(), 1400)

  function writeTrail(pts: THREE.Points, fn: (i: number, t: number) => [number, number, number]) {
    const arr = pts.geometry.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < arr.count; i++) {
      const [x, y, z] = fn(i / arr.count, simT)
      arr.setXYZ(i, x, y, z)
    }
    arr.needsUpdate = true
  }

  function placeCam() {
    dist += (targetDist - dist) * 0.08
    const sph = new THREE.Spherical(dist, Math.PI / 2 - pitch, yaw)
    camera.position.setFromSpherical(sph)
    camera.lookAt(0, scale === 'earth' ? -0.05 : 0, 0)
  }

  renderer.setAnimationLoop(() => {
    if (disposed) return
    const dt = clock.getDelta()
    if (!paused && !reduced) simT += dt * rate
    const t = simT
    placeCam()

    if (scale === 'earth') {
      earth.rotation.y = t * 0.08
      clouds.rotation.y = t * 0.095
      sunLight.position.set(Math.cos(t * 0.08) * 8, 2.4, Math.sin(t * 0.08) * 8)
      ;(latRing.material as THREE.MeshBasicMaterial).opacity = 0.35 + 0.2 * Math.sin(t * 2.2)
    }
    if (scale === 'sun') {
      sun.rotation.y = t * 0.12
      const a = t * 0.22
      earthBead.position.set(Math.cos(a) * 2.55, Math.sin(a) * 0.06, Math.sin(a) * 2.55)
      moonBead.position.copy(earthBead.position).add(
        new THREE.Vector3(Math.cos(t * 1.6) * 0.22, 0.02, Math.sin(t * 1.6) * 0.22),
      )
      writeTrail(sunTrail, (u) => {
        const b = a - u * 1.5
        return [Math.cos(b) * 2.55, Math.sin(b) * 0.06, Math.sin(b) * 2.55]
      })
    }
    if (scale === 'galaxy') {
      milky.rotation.y = t * 0.028
      writeTrail(flow, (u) => {
        const r = 1.3 + u * 4.4
        const b = t * 0.28 + u * 6
        return [Math.cos(b) * r, (u - 0.5) * 0.28, Math.sin(b) * r]
      })
    }
    if (scale === 'cosmos') {
      writeTrail(warm, (u) => [-9 + u * 18, Math.sin(u * 8 + t * 0.4) * 0.45, (u - 0.5) * 1.15])
      writeTrail(cool, (u) => [9 - u * 18, Math.cos(u * 8 + t * 0.4) * 0.45, (0.5 - u) * 1.15])
    }
    if (scale === 'helix') {
      const u = (t * 0.05) % 1
      const a = u * Math.PI * 6
      helixSun.position.set(Math.cos(a) * 1.52, (u - 0.5) * 5.2, Math.sin(a) * 1.52)
    }

    bloom.strength = scale === 'sun' ? 0.72 : scale === 'galaxy' ? 0.38 : 0.28
    composer.render()
  })

  return {
    setScale: show,
    setLat(v) {
      pinLat = v
      placePin()
    },
    setTheme() {
      /* Space stays black. Native chrome owns the UI, not a paper swap. */
    },
    setRate(r) { rate = r },
    setPaused(p) { paused = p },
    dispose() {
      disposed = true
      window.clearTimeout(readyT)
      renderer.setAnimationLoop(null)
      ro.disconnect()
      opts.canvas.removeEventListener('pointerdown', onDown)
      opts.canvas.removeEventListener('pointermove', onMove)
      opts.canvas.removeEventListener('pointerup', onUp)
      opts.canvas.removeEventListener('pointercancel', onUp)
      opts.canvas.removeEventListener('wheel', onWheel)
      composer.dispose()
      renderer.dispose()
      sky.dispose()
    },
  }
}
