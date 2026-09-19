import * as THREE from 'three'
import type { ScaleId } from './scales'

const NASA_DAY = 'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg'
const NASA_NIGHT = 'https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg'
const NASA_BUMP = 'https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png'
const SDO_SUN = 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0304.jpg'

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

const FRAME: Record<ScaleId, [number, number, number]> = {
  earth: [0, 0.2, 7.8],
  sun: [0, 2.2, 12.4],
  galaxy: [0, 11, 19],
  cosmos: [0, 1.4, 22],
  helix: [6.5, 3.2, 10],
}

function disc(size = 64): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.4, 'rgba(180,230,255,0.5)')
  grd.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, size, size)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function stars(n: number, r: number): THREE.Points {
  const p = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const th = Math.random() * Math.PI * 2
    const ph = Math.acos(2 * Math.random() - 1)
    const rr = r * (0.55 + Math.random() * 0.45)
    p[i * 3] = rr * Math.sin(ph) * Math.cos(th)
    p[i * 3 + 1] = rr * Math.cos(ph)
    p[i * 3 + 2] = rr * Math.sin(ph) * Math.sin(th)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(p, 3))
  return new THREE.Points(g, new THREE.PointsMaterial({
    color: 0xcfe8ff, size: 0.09, map: disc(32), transparent: true, depthWrite: false, opacity: 0.75,
  }))
}

function glowRing(radius: number, color: number, tube = 0.008): THREE.Mesh {
  const m = new THREE.Mesh(
    new THREE.TorusGeometry(radius, tube, 10, 160),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 }),
  )
  m.rotation.x = Math.PI / 2
  return m
}

function trailPoints(count: number, color: number, size: number): THREE.Points {
  const pos = new Float32Array(count * 3)
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return new THREE.Points(g, new THREE.PointsMaterial({
    color, size, map: disc(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }))
}

function galaxy(): THREE.Group {
  const group = new THREE.Group()
  const N = 7800
  const pos = new Float32Array(N * 3)
  const col = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    const arm = i % 4
    const r = Math.pow(Math.random(), 0.6) * 7.6
    const a = arm * (Math.PI / 2) + r * 0.44 + (Math.random() - 0.5) * 0.2
    pos[i * 3] = Math.cos(a) * r
    pos[i * 3 + 1] = (Math.random() - 0.5) * (0.1 + r * 0.016)
    pos[i * 3 + 2] = Math.sin(a) * r
    const core = Math.max(0, 1 - r / 8)
    col[i * 3] = 0.45 + core * 0.55
    col[i * 3 + 1] = 0.7 + core * 0.2
    col[i * 3 + 2] = 1 - core * 0.15
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  const pts = new THREE.Points(g, new THREE.PointsMaterial({
    size: 0.05, vertexColors: true, map: disc(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }))
  pts.rotation.x = 0.58
  group.add(pts)
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.48, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xffd08a, transparent: true, opacity: 0.55 }),
  )
  group.add(core)
  return group
}

export function createEngine(opts: CreateEngineOpts): VelocityEngine {
  const renderer = new THREE.WebGLRenderer({ canvas: opts.canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95

  const scene = new THREE.Scene()
  const bgD = new THREE.Color('#05070E')
  const bgL = new THREE.Color('#E6E0D4')
  scene.background = opts.theme === 'light' ? bgL : bgD
  scene.fog = new THREE.FogExp2(opts.theme === 'light' ? 0xe6e0d4 : 0x05070e, 0.01)
  scene.add(stars(1100, 46))

  const camera = new THREE.PerspectiveCamera(26, 1, 0.08, 220)
  const clock = new THREE.Clock()
  const loader = new THREE.TextureLoader()

  let scale: ScaleId = opts.scale
  let rate = opts.rate
  let paused = opts.paused
  let pinLat = opts.lat
  let yaw = 0.4
  let pitch = 0.08
  let disposed = false
  let simT = 0

  scene.add(new THREE.AmbientLight(0x4c6280, 0.32))
  const key = new THREE.DirectionalLight(0xfff1d2, 1.6)
  key.position.set(-6, 3.4, 5)
  scene.add(key)
  scene.add(new THREE.PointLight(0x4fd2ff, 0.55, 30).translateX(4).translateY(2))

  const groups: Record<ScaleId, THREE.Group> = {
    earth: new THREE.Group(), sun: new THREE.Group(), galaxy: new THREE.Group(),
    cosmos: new THREE.Group(), helix: new THREE.Group(),
  }
  Object.values(groups).forEach((g) => { g.visible = false; scene.add(g) })

  const earthMat = new THREE.MeshStandardMaterial({ color: 0x8aa0b4, roughness: 0.76, metalness: 0.04 })
  const earth = new THREE.Mesh(new THREE.SphereGeometry(1.02, 80, 60), earthMat)
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 48, 32),
    new THREE.MeshBasicMaterial({ color: 0x4fd2ff, transparent: true, opacity: 0.1, side: THREE.BackSide }),
  )
  const latRing = glowRing(1.04, 0x4fd2ff, 0.006)
  const pin = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffd36a }))
  groups.earth.add(earth, atmo, latRing, pin)
  loader.load(NASA_DAY, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; earthMat.map = t; earthMat.color.set(0xffffff); earthMat.needsUpdate = true })
  loader.load(NASA_NIGHT, (t) => { t.colorSpace = THREE.SRGBColorSpace; earthMat.emissiveMap = t; earthMat.emissive = new THREE.Color(0x143056); earthMat.needsUpdate = true })
  loader.load(NASA_BUMP, (t) => { earthMat.bumpMap = t; earthMat.bumpScale = 0.04 })

  const sunMat = new THREE.MeshStandardMaterial({ color: 0xffc56a, emissive: 0xff8a1a, emissiveIntensity: 0.85, roughness: 0.4 })
  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.58, 48, 32), sunMat)
  const corona = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 32, 24),
    new THREE.MeshBasicMaterial({ color: 0xffb24a, transparent: true, opacity: 0.12, side: THREE.BackSide }),
  )
  const orbitRing = glowRing(2.2, 0x4fd2ff, 0.01)
  const earthBead = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), new THREE.MeshStandardMaterial({ color: 0x4ea3ff, roughness: 0.4 }))
  const moonBead = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 10), new THREE.MeshBasicMaterial({ color: 0xd7dde8 }))
  const sunTrail = trailPoints(90, 0x4fd2ff, 0.05)
  groups.sun.add(sun, corona, orbitRing, earthBead, moonBead, sunTrail)
  loader.load(SDO_SUN, (t) => { t.colorSpace = THREE.SRGBColorSpace; sunMat.map = t; sunMat.emissiveMap = t; sunMat.color.set(0xffffff); sunMat.needsUpdate = true }, undefined, () => {})

  const milky = galaxy()
  const sunMark = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffd36a }))
  sunMark.position.set(4.5, 0.1, 0.35)
  milky.add(sunMark)
  const flow = trailPoints(140, 0xff4fd0, 0.06)
  groups.galaxy.add(milky, flow)

  const warm = trailPoints(220, 0xff6b4a, 0.07)
  const cool = trailPoints(220, 0x4fd2ff, 0.07)
  groups.cosmos.add(warm, cool, galaxy())

  const helixLine = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0x4fd2ff, transparent: true, opacity: 0.7 }),
  )
  const helixSun = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffd36a }))
  groups.helix.add(helixLine, helixSun)
  const helixPts: number[] = []
  for (let i = 0; i <= 240; i++) {
    const u = i / 240
    const a = u * Math.PI * 6
    helixPts.push(Math.cos(a) * (1.4 + u * 0.2), (u - 0.5) * 4.8, Math.sin(a) * (1.4 + u * 0.2))
  }
  helixLine.geometry.setAttribute('position', new THREE.Float32BufferAttribute(helixPts, 3))

  function placePin() {
    const phi = THREE.MathUtils.degToRad(90 - pinLat)
    pin.position.setFromSphericalCoords(1.06, phi, THREE.MathUtils.degToRad(77))
    const r = Math.cos(THREE.MathUtils.degToRad(pinLat)) * 1.04
    latRing.scale.setScalar(Math.max(0.08, r / 1.04))
    latRing.position.y = Math.sin(THREE.MathUtils.degToRad(pinLat)) * 1.02
  }
  placePin()

  function show(s: ScaleId) {
    scale = s
    yaw = s === 'helix' ? 0.7 : 0.35
    pitch = s === 'galaxy' ? 0.05 : 0.08
    ;(Object.keys(groups) as ScaleId[]).forEach((k) => { groups[k].visible = k === s })
    const c = FRAME[s]
    camera.position.set(c[0], c[1], c[2])
    camera.lookAt(0, s === 'earth' ? -0.12 : 0, 0)
  }
  show(scale)

  let dragging = false
  let lx = 0
  let ly = 0
  let moved = 0
  const onDown = (e: PointerEvent) => {
    dragging = true; moved = 0; lx = e.clientX; ly = e.clientY
    try { opts.canvas.setPointerCapture(e.pointerId) } catch { /* */ }
  }
  const onMove = (e: PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - lx
    const dy = e.clientY - ly
    lx = e.clientX; ly = e.clientY
    moved += Math.abs(dx) + Math.abs(dy)
    yaw += dx * 0.0042
    pitch = Math.max(-0.7, Math.min(0.7, pitch + dy * 0.003))
  }
  const onUp = (e: PointerEvent) => {
    dragging = false
    try { opts.canvas.releasePointerCapture(e.pointerId) } catch { /* */ }
    if (moved < 7) opts.onTapBody?.()
  }
  opts.canvas.addEventListener('pointerdown', onDown)
  opts.canvas.addEventListener('pointermove', onMove)
  opts.canvas.addEventListener('pointerup', onUp)

  const ro = new ResizeObserver(() => {
    const w = opts.canvas.clientWidth || 1
    const h = opts.canvas.clientHeight || 1
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  })
  ro.observe(opts.canvas)
  const readyT = window.setTimeout(() => opts.onReady?.(), 650)

  function writeTrail(pts: THREE.Points, fn: (i: number, t: number) => [number, number, number], t: number) {
    const arr = pts.geometry.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < arr.count; i++) {
      const [x, y, z] = fn(i / arr.count, t)
      arr.setXYZ(i, x, y, z)
    }
    arr.needsUpdate = true
  }

  renderer.setAnimationLoop(() => {
    if (disposed) return
    const dt = clock.getDelta()
    if (!paused) simT += dt * rate
    const t = simT
    const g = groups[scale]
    g.rotation.y = yaw
    g.rotation.x = pitch
    if (scale === 'earth') {
      earth.rotation.y = t * 0.35
      latRing.material.opacity = 0.35 + 0.25 * Math.sin(t * 3)
    }
    if (scale === 'sun') {
      sun.rotation.y = t * 0.2
      const a = t * 0.35
      earthBead.position.set(Math.cos(a) * 2.2, Math.sin(a) * 0.08, Math.sin(a) * 2.2)
      moonBead.position.copy(earthBead.position).add(new THREE.Vector3(Math.cos(t * 2.2) * 0.18, 0.02, Math.sin(t * 2.2) * 0.18))
      writeTrail(sunTrail, (u) => {
        const b = a - u * 1.6
        return [Math.cos(b) * 2.2, Math.sin(b) * 0.08, Math.sin(b) * 2.2]
      }, t)
    }
    if (scale === 'galaxy') {
      milky.rotation.y = t * 0.05
      writeTrail(flow, (u) => {
        const r = 1.2 + u * 4.2
        const b = t * 0.4 + u * 6
        return [Math.cos(b) * r, (u - 0.5) * 0.3, Math.sin(b) * r]
      }, t)
    }
    if (scale === 'cosmos') {
      writeTrail(warm, (u) => [ -8 + u * 16, Math.sin(u * 8 + t) * 0.4, (u - 0.5) * 1.2 ], t)
      writeTrail(cool, (u) => [ 8 - u * 16, Math.cos(u * 8 + t) * 0.4, (0.5 - u) * 1.2 ], t)
    }
    if (scale === 'helix') {
      const u = (t * 0.08) % 1
      const a = u * Math.PI * 6
      helixSun.position.set(Math.cos(a) * 1.5, (u - 0.5) * 4.8, Math.sin(a) * 1.5)
    }
    renderer.render(scene, camera)
  })

  return {
    setScale: show,
    setLat(v) { pinLat = v; placePin() },
    setTheme(th) {
      scene.background = th === 'light' ? bgL : bgD
      scene.fog = new THREE.FogExp2(th === 'light' ? 0xe6e0d4 : 0x05070e, 0.01)
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
      renderer.dispose()
    },
  }
}
