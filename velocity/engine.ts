import * as THREE from 'three'
import type { ScaleId } from './scales'

const NASA_DAY =
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg'
const NASA_NIGHT =
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg'
const NASA_BUMP =
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png'
const SDO_SUN =
  'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0304.jpg'

export interface CreateEngineOpts {
  canvas: HTMLCanvasElement
  lat: number
  scale: ScaleId
  theme: 'dark' | 'light'
  onReady?: () => void
  onTapBody?: () => void
  onLat?: (lat: number) => void
}

export interface VelocityEngine {
  setScale: (s: ScaleId) => void
  setLat: (lat: number) => void
  setTheme: (t: 'dark' | 'light') => void
  dispose: () => void
}

const FRAMING: Record<ScaleId, { cam: [number, number, number] }> = {
  earth: { cam: [0, 0.15, 7.4] },
  sun: { cam: [0, 1.6, 11.5] },
  galaxy: { cam: [0, 10.5, 18] },
  cosmos: { cam: [0, 1.2, 26] },
}

function softDisc(size = 64): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.35, 'rgba(255,255,255,0.45)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function starfield(count: number, radius: number, size: number): THREE.Points {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const u = Math.random()
    const v = Math.random()
    const theta = 2 * Math.PI * u
    const phi = Math.acos(2 * v - 1)
    const r = radius * (0.65 + Math.random() * 0.35)
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    pos[i * 3 + 1] = r * Math.cos(phi)
    pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: 0xe8eef8,
      size,
      map: softDisc(32),
      transparent: true,
      depthWrite: false,
      opacity: 0.7,
    }),
  )
}

function spiralGalaxy(): THREE.Group {
  const group = new THREE.Group()
  const N = 6200
  const pos = new Float32Array(N * 3)
  const col = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    const arm = i % 4
    const r = Math.pow(Math.random(), 0.62) * 7.4
    const a = arm * (Math.PI / 2) + r * 0.42 + (Math.random() - 0.5) * 0.22
    pos[i * 3] = Math.cos(a) * r
    pos[i * 3 + 1] = (Math.random() - 0.5) * (0.12 + r * 0.018)
    pos[i * 3 + 2] = Math.sin(a) * r
    const core = Math.max(0, 1 - r / 8)
    col[i * 3] = 0.72 + core * 0.28
    col[i * 3 + 1] = 0.78 + core * 0.12
    col[i * 3 + 2] = 0.88 - core * 0.18
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  const stars = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      map: softDisc(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  stars.rotation.x = 0.55
  group.add(stars)
  group.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0xffe2b0, transparent: true, opacity: 0.35 }),
    ),
  )
  return group
}

export function createEngine(opts: CreateEngineOpts): VelocityEngine {
  const renderer = new THREE.WebGLRenderer({
    canvas: opts.canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.92

  const scene = new THREE.Scene()
  const bgDark = new THREE.Color('#07080B')
  const bgLight = new THREE.Color('#E7E1D6')
  scene.background = opts.theme === 'light' ? bgLight : bgDark
  scene.fog = new THREE.FogExp2(opts.theme === 'light' ? 0xe7e1d6 : 0x07080b, 0.012)

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200)
  const clock = new THREE.Clock()
  const loader = new THREE.TextureLoader()
  scene.add(starfield(900, 42, 0.11))

  const groups: Record<ScaleId, THREE.Group> = {
    earth: new THREE.Group(),
    sun: new THREE.Group(),
    galaxy: new THREE.Group(),
    cosmos: new THREE.Group(),
  }
  Object.values(groups).forEach((g) => {
    g.visible = false
    scene.add(g)
  })

  let scale: ScaleId = opts.scale
  let disposed = false
  let pinLat = opts.lat
  let yaw = 0.35
  let pitch = 0.08

  scene.add(new THREE.AmbientLight(0x6b7380, 0.28))
  const key = new THREE.DirectionalLight(0xfff3dc, 1.55)
  key.position.set(-6, 3.2, 4)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0x6ea8ff, 0.22)
  fill.position.set(5, -1, -3)
  scene.add(fill)

  const earthMat = new THREE.MeshStandardMaterial({
    color: 0x8aa0b4,
    roughness: 0.78,
    metalness: 0.02,
  })
  const earth = new THREE.Mesh(new THREE.SphereGeometry(1.05, 72, 56), earthMat)
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(1.12, 48, 36),
    new THREE.MeshBasicMaterial({
      color: 0x64b5f6,
      transparent: true,
      opacity: 0.09,
      side: THREE.BackSide,
    }),
  )
  const equator = new THREE.Mesh(
    new THREE.TorusGeometry(1.06, 0.0035, 8, 128),
    new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.55 }),
  )
  equator.rotation.x = Math.PI / 2
  const pin = new THREE.Mesh(
    new THREE.SphereGeometry(0.022, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xd4af37 }),
  )
  groups.earth.add(earth, atmo, equator, pin)

  loader.load(NASA_DAY, (t) => {
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    earthMat.map = t
    earthMat.color.set(0xffffff)
    earthMat.needsUpdate = true
  })
  loader.load(NASA_NIGHT, (t) => {
    t.colorSpace = THREE.SRGBColorSpace
    earthMat.emissiveMap = t
    earthMat.emissive = new THREE.Color(0x1c2a44)
    earthMat.needsUpdate = true
  })
  loader.load(NASA_BUMP, (t) => {
    earthMat.bumpMap = t
    earthMat.bumpScale = 0.035
  })

  const sunMat = new THREE.MeshStandardMaterial({
    color: 0xffc56a,
    emissive: 0xff9a2a,
    emissiveIntensity: 0.7,
    roughness: 0.45,
  })
  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.62, 48, 32), sunMat)
  const corona = new THREE.Mesh(
    new THREE.SphereGeometry(0.92, 32, 24),
    new THREE.MeshBasicMaterial({
      color: 0xffb347,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
    }),
  )
  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(2.15, 0.004, 8, 160),
    new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.4 }),
  )
  orbit.rotation.x = Math.PI / 2.15
  const earthBead = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x64b5f6 }),
  )
  groups.sun.add(sun, corona, orbit, earthBead)
  loader.load(
    SDO_SUN,
    (t) => {
      t.colorSpace = THREE.SRGBColorSpace
      sunMat.map = t
      sunMat.emissiveMap = t
      sunMat.color.set(0xffffff)
      sunMat.needsUpdate = true
    },
    undefined,
    () => {},
  )

  const galaxy = spiralGalaxy()
  const sunBead = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xd4af37 }),
  )
  sunBead.position.set(4.6, 0.08, 0.4)
  galaxy.add(sunBead)
  groups.galaxy.add(galaxy)

  const web = spiralGalaxy()
  web.scale.setScalar(1.15)
  groups.cosmos.add(web)

  function placePin() {
    const phi = THREE.MathUtils.degToRad(90 - pinLat)
    pin.position.setFromSphericalCoords(1.07, phi, THREE.MathUtils.degToRad(77.2))
  }
  placePin()

  function applyFrame() {
    const f = FRAMING[scale]
    camera.position.set(f.cam[0], f.cam[1], f.cam[2])
    camera.lookAt(0, scale === 'earth' ? -0.15 : 0, 0)
  }

  function show(s: ScaleId) {
    scale = s
    yaw = s === 'galaxy' ? 0.15 : 0.35
    pitch = s === 'galaxy' ? 0.02 : 0.06
    ;(Object.keys(groups) as ScaleId[]).forEach((k) => {
      groups[k].visible = k === s
    })
    applyFrame()
  }
  show(scale)

  let dragging = false
  let lastX = 0
  let lastY = 0
  let moved = 0
  const onDown = (e: PointerEvent) => {
    dragging = true
    moved = 0
    lastX = e.clientX
    lastY = e.clientY
    try { opts.canvas.setPointerCapture(e.pointerId) } catch { /* */ }
  }
  const onMove = (e: PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    lastX = e.clientX
    lastY = e.clientY
    moved += Math.abs(dx) + Math.abs(dy)
    yaw += dx * 0.0045
    pitch = Math.max(-0.6, Math.min(0.7, pitch + dy * 0.0032))
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
  const readyT = window.setTimeout(() => opts.onReady?.(), 700)

  renderer.setAnimationLoop(() => {
    if (disposed) return
    const t = clock.getElapsedTime()
    const pivot = groups[scale]
    pivot.rotation.y = yaw
    pivot.rotation.x = pitch
    if (scale === 'earth') earth.rotation.y = t * 0.028
    if (scale === 'sun') {
      sun.rotation.y = t * 0.02
      const a = t * 0.18
      earthBead.position.set(Math.cos(a) * 2.15, Math.sin(a) * 0.12, Math.sin(a) * 2.15)
    }
    renderer.render(scene, camera)
  })

  return {
    setScale: show,
    setLat(v) {
      pinLat = v
      placePin()
    },
    setTheme(th) {
      scene.background = th === 'light' ? bgLight : bgDark
      scene.fog = new THREE.FogExp2(th === 'light' ? 0xe7e1d6 : 0x07080b, 0.012)
    },
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
