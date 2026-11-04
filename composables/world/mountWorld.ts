import {
  AdditiveBlending,
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  FogExp2,
  HemisphereLight,
  IcosahedronGeometry,
  LinearFilter,
  LinearSRGBColorSpace,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NoToneMapping,
  OctahedronGeometry,
  OrthographicCamera,
  PerspectiveCamera,
  PointLight,
  Points,
  RGBAFormat,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  TorusGeometry,
  UnsignedByteType,
  WebGLRenderTarget,
  WebGLRenderer,
  type BufferGeometry as BufferGeometryType,
  type Material,
} from 'three'
import gsap from 'gsap'
import { anchorById, type AnchorId } from './anchors'
import { beaconFrag, beaconVert, blurFrag, brightFrag, compositeFrag, quadVert, starFrag, starVert } from './shaders'
import { budgetFor, type TierBudget } from './tierBudget'

export interface WorldStats {
  triangles: number
  calls: number
  points: number
  stars: number
  dpr: number
  post: boolean
}

export interface WorldMountOptions {
  canvas: HTMLCanvasElement
  tier: 1 | 2 | 3
  /** False when reduced motion is on, even if a query forced a 3D tier. */
  motionOk: boolean
  probe: boolean
  width: number
  height: number
  onArrive: (id: AnchorId) => void
  onProbe: (fps: number) => void
  onContextLost: () => void
  onContextRestored: () => void
  onStats: (stats: WorldStats) => void
}

export interface WorldHandle {
  resize: (width: number, height: number) => void
  setPaused: (paused: boolean) => void
  travel: (id: AnchorId) => void
  setMotionOk: (ok: boolean) => void
  pointer: (dx: number, dy: number, dragging: boolean, nx: number, ny: number) => void
  pointerUp: () => void
  setGyro: (beta: number | null, gamma: number | null) => void
  clearGyro: () => void
  /** releaseContext loses the GL context. Use that on route leave, not on a same-canvas remount that has already scheduled a new renderer. */
  dispose: (releaseContext?: boolean) => void
}

const HULL = new Color('#12131A')
const HULL_LIT = new Color('#1A1C28')
const EMISSIVE = new Color('#2F5BD8')
const EMISSIVE_SOFT = new Color('#7A9AE8')
const STAR = new Color('#E8E4DC')
const FOG = new Color('#0B0C12')
const VOID = new Color('#07070A')

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function damp(current: number, target: number, lambda: number, dt: number, snap: boolean): number {
  if (snap) return target
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Client-only scene. Imported dynamically from the stage so three.js stays
 * out of the route's static graph until a tier above 0 actually mounts.
 */
export function mountWorld(options: WorldMountOptions): WorldHandle {
  const budget: TierBudget = budgetFor(options.tier)
  let motionOk = options.motionOk
  let disposed = false
  let lost = false
  let listening = false
  let reported = false
  let travelGen = 0
  let elapsed = 0
  let ca = 0
  let viewW = Math.max(1, options.width)
  let viewH = Math.max(1, options.height)
  let pixelRatio = 1
  let portrait = viewW / viewH < 0.85

  let dragging = false
  let dragYaw = 0
  let dragPitch = 0
  let parallaxYaw = 0
  let parallaxPitch = 0
  let gyroYaw = 0
  let gyroPitch = 0
  let gyroActive = false
  let yaw = 0
  let pitch = 0

  const renderer = new WebGLRenderer({
    canvas: options.canvas,
    antialias: false,
    alpha: false,
    powerPreference: options.tier === 3 ? 'high-performance' : 'low-power',
    stencil: false,
    depth: true,
    failIfMajorPerformanceCaveat: false,
  })
  if (!renderer.getContext()) {
    renderer.dispose()
    throw new Error('WebGL context unavailable')
  }
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = NoToneMapping
  renderer.setClearColor(VOID, 1)

  const scene = new Scene()
  if (budget.fog) scene.fog = new FogExp2(FOG, 0.021)

  const camera = new PerspectiveCamera(58, viewW / viewH, 0.12, 180)
  const home = anchorById('nexus')
  const rig = {
    x: home.cx,
    y: home.cy,
    z: home.cz,
    lx: home.lx,
    ly: home.ly,
    lz: home.lz,
  }

  const geos = new Set<BufferGeometryType>()
  const mats = new Set<Material>()
  const trackGeo = <T extends BufferGeometryType>(geo: T): T => {
    geos.add(geo)
    return geo
  }
  const trackMat = <T extends Material>(mat: T): T => {
    mats.add(mat)
    return mat
  }

  const hull = budget.standardMaterials
    ? trackMat(new MeshStandardMaterial({
        color: HULL_LIT,
        roughness: 0.92,
        metalness: 0.04,
        emissive: EMISSIVE,
        emissiveIntensity: 0.08,
      }))
    : trackMat(new MeshBasicMaterial({ color: HULL_LIT }))

  const bench = budget.standardMaterials
    ? trackMat(new MeshStandardMaterial({
        color: HULL,
        roughness: 0.96,
        metalness: 0.02,
        emissive: new Color('#0E1220'),
        emissiveIntensity: 0.4,
      }))
    : trackMat(new MeshBasicMaterial({ color: HULL }))

  const beaconMaterials: ShaderMaterial[] = []
  const makeBeacon = (color: Color) => {
    const mat = trackMat(new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBreath: { value: 1 },
        uColor: { value: color.clone() },
        uFogColor: { value: FOG.clone() },
        uFogDensity: { value: budget.fog ? 0.02 : 0 },
      },
      vertexShader: beaconVert,
      fragmentShader: beaconFrag(budget.noiseOctaves),
      toneMapped: false,
    }))
    beaconMaterials.push(mat)
    return mat
  }
  const glow = makeBeacon(EMISSIVE)
  const glowSoft = makeBeacon(EMISSIVE_SOFT)

  const box = trackGeo(new BoxGeometry(1, 1, 1))
  const barXs = [-0.5, -0.25, 0, 0.25, 0.5]
  const barHeights = [0.72, 1.15, 1.7, 2.3, 3.05]
  for (let i = 0; i < 5; i++) {
    const bar = new Mesh(box, glow)
    const h = barHeights[i]!
    bar.scale.set(0.16, h, 0.16)
    bar.position.set(barXs[i]!, 1.45 + h * 0.5, 0)
    scene.add(bar)
  }

  const core = new Mesh(trackGeo(new OctahedronGeometry(1.05, 0)), hull)
  core.position.y = 0.85
  scene.add(core)

  const platform = new Mesh(
    trackGeo(new RingGeometry(2.15, 2.55, budget.ringSegments)),
    hull,
  )
  platform.rotation.x = -Math.PI / 2
  platform.position.y = 0.02
  scene.add(platform)

  const zoneRing = (radial: number, tubular: number, tube = 0.07) =>
    trackGeo(new TorusGeometry(1.35, tube, radial, tubular))

  const elevate = anchorById('elevate')
  const elevateRing = new Mesh(zoneRing(budget.torusRadial, budget.torusTubular, 0.05), glow)
  elevateRing.position.set(elevate.x, elevate.y, elevate.z)
  elevateRing.scale.setScalar(1.7)
  scene.add(elevateRing)
  const elevateArm = new Mesh(zoneRing(budget.torusRadial, budget.torusTubular, 0.028), glowSoft)
  elevateArm.position.copy(elevateRing.position)
  elevateArm.rotation.y = Math.PI / 2
  elevateArm.scale.setScalar(1.05)
  scene.add(elevateArm)

  const empower = anchorById('empower')
  const empowerRing = new Mesh(zoneRing(budget.torusRadial, budget.torusTubular), glow)
  empowerRing.position.set(empower.x, empower.y + 0.15, empower.z)
  empowerRing.rotation.x = Math.PI / 2
  scene.add(empowerRing)
  const benchA = new Mesh(box, bench)
  benchA.scale.set(1.5, 0.16, 0.55)
  benchA.position.set(empower.x, empower.y - 0.45, empower.z)
  scene.add(benchA)
  const benchB = new Mesh(box, bench)
  benchB.scale.set(0.42, 0.72, 0.42)
  benchB.position.set(empower.x + 0.7, empower.y - 0.05, empower.z + 0.15)
  scene.add(benchB)

  const engage = anchorById('engage')
  const engageRing = new Mesh(zoneRing(budget.torusRadial, budget.torusTubular), glow)
  engageRing.position.set(engage.x, engage.y, engage.z)
  engageRing.rotation.x = Math.PI / 2.5
  engageRing.rotation.z = 0.4
  scene.add(engageRing)
  const sphere = new Mesh(trackGeo(new IcosahedronGeometry(0.68, budget.icoDetail)), hull)
  sphere.position.set(engage.x, engage.y, engage.z)
  scene.add(sphere)

  const pylonGeo = trackGeo(new CylinderGeometry(0.04, 0.055, 1.15, options.tier === 1 ? 5 : 7, 1, true))
  const gemGeo = trackGeo(new OctahedronGeometry(0.26, 0))
  for (const id of ['learn', 'work', 'dialogue', 'story', 'archive'] as const) {
    const anchor = anchorById(id)
    const gem = new Mesh(gemGeo, id === 'archive' ? glowSoft : glow)
    gem.position.set(anchor.x, anchor.y, anchor.z)
    if (id === 'archive') gem.scale.setScalar(0.8)
    if (id === 'story') gem.scale.setScalar(1.15)
    scene.add(gem)
    const pylon = new Mesh(pylonGeo, hull)
    pylon.position.set(anchor.x, anchor.y - 0.85, anchor.z)
    scene.add(pylon)
  }

  if (budget.contactDiscs) {
    const discGeo = trackGeo(new CircleGeometry(0.9, 18))
    const discMat = trackMat(new MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    }))
    for (const id of ['nexus', 'elevate', 'empower', 'engage'] as const) {
      const anchor = anchorById(id)
      const disc = new Mesh(discGeo, discMat)
      disc.rotation.x = -Math.PI / 2
      disc.position.set(anchor.x, anchor.y - 0.72, anchor.z)
      if (id === 'nexus') disc.position.y = 0.01
      scene.add(disc)
    }
  }

  const rand = mulberry32(0x5a7a)
  const starPositions = new Float32Array(budget.starCount * 3)
  const starSizes = new Float32Array(budget.starCount)
  for (let i = 0; i < budget.starCount; i++) {
    const radius = 16 + rand() * 46
    const theta = rand() * Math.PI * 2
    const phi = Math.acos(2 * rand() - 1)
    starPositions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius
    starPositions[i * 3 + 1] = Math.cos(phi) * radius * 0.65
    starPositions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius
    starSizes[i] = 1.1 + rand() * 2.4
  }
  const starGeo = trackGeo(new BufferGeometry())
  starGeo.setAttribute('position', new BufferAttribute(starPositions, 3))
  starGeo.setAttribute('aSize', new BufferAttribute(starSizes, 1))
  const starMat = trackMat(new ShaderMaterial({
    uniforms: { uColor: { value: STAR.clone().multiplyScalar(0.5) } },
    vertexShader: starVert,
    fragmentShader: starFrag,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    toneMapped: false,
  }))
  scene.add(new Points(starGeo, starMat))

  if (budget.standardMaterials) {
    scene.add(new AmbientLight(0xffffff, 0.22))
    scene.add(new HemisphereLight(0x9aafd6, 0x07070a, 0.42))
    const key = new DirectionalLight(0xE8E4DC, 2.2)
    key.position.set(7, 14, 9)
    scene.add(key)
    const beaconLight = new PointLight(0x2F5BD8, 16, 26, 2)
    beaconLight.position.set(0, 2.4, 0)
    scene.add(beaconLight)
  }

  let rtScene: WebGLRenderTarget | null = null
  let rtA: WebGLRenderTarget | null = null
  let rtB: WebGLRenderTarget | null = null
  let quadScene: Scene | null = null
  let quadMesh: Mesh | null = null
  let brightMat: ShaderMaterial | null = null
  let blurMat: ShaderMaterial | null = null
  let compositeMat: ShaderMaterial | null = null

  const makeTarget = (w: number, h: number, depth: boolean) => {
    const rt = new WebGLRenderTarget(Math.max(1, w), Math.max(1, h), {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
      type: UnsignedByteType,
      depthBuffer: depth,
      stencilBuffer: false,
    })
    rt.texture.colorSpace = LinearSRGBColorSpace
    return rt
  }

  if (budget.post) {
    const quadGeo = trackGeo(new BufferGeometry())
    quadGeo.setAttribute('position', new BufferAttribute(new Float32Array([
      -1, -1, 0,
      3, -1, 0,
      -1, 3, 0,
    ]), 3))
    brightMat = trackMat(new ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uThreshold: { value: 0.62 },
      },
      vertexShader: quadVert,
      fragmentShader: brightFrag,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    }))
    blurMat = trackMat(new ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uDir: { value: { x: 1, y: 0 } },
      },
      vertexShader: quadVert,
      fragmentShader: blurFrag,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    }))
    compositeMat = trackMat(new ShaderMaterial({
      uniforms: {
        tScene: { value: null },
        tBloom: { value: null },
        uResolution: { value: { x: viewW, y: viewH } },
        uGrain: { value: 0.035 },
        uCa: { value: 0 },
        uTime: { value: 0 },
      },
      vertexShader: quadVert,
      fragmentShader: compositeFrag,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    }))
    quadScene = new Scene()
    quadMesh = new Mesh(quadGeo, brightMat)
    quadScene.add(quadMesh)
    rtScene = makeTarget(8, 8, true)
    rtA = makeTarget(4, 4, false)
    rtB = makeTarget(4, 4, false)
  }

  function resize(width: number, height: number) {
    viewW = Math.max(1, width)
    viewH = Math.max(1, height)
    const raw = window.devicePixelRatio || 1
    pixelRatio = Math.min(raw, budget.dprCap)
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(viewW, viewH, false)
    portrait = viewW / viewH < 0.85
    camera.aspect = viewW / viewH
    camera.fov = portrait ? 76 : 58
    camera.updateProjectionMatrix()
    if (!rtScene || !rtA || !rtB || !compositeMat) return
    const pw = Math.max(1, Math.floor(viewW * pixelRatio))
    const ph = Math.max(1, Math.floor(viewH * pixelRatio))
    rtScene.setSize(pw, ph)
    rtA.setSize(Math.max(1, Math.floor(pw / 4)), Math.max(1, Math.floor(ph / 4)))
    rtB.setSize(rtA.width, rtA.height)
    compositeMat.uniforms.uResolution!.value.x = pw
    compositeMat.uniforms.uResolution!.value.y = ph
  }

  function placeCamera() {
    const dx = rig.x - rig.lx
    const dy = rig.y - rig.ly
    const dz = rig.z - rig.lz
    const dist = Math.max(0.8, Math.hypot(dx, dy, dz))
    const baseYaw = Math.atan2(dx, dz)
    const basePitch = Math.asin(clamp(dy / dist, -1, 1))
    let yawOff = yaw
    let pitchOff = pitch
    if (motionOk && budget.idleDrift && !dragging && !gyroActive) {
      yawOff += Math.sin(elapsed * 0.13) * 0.045
      pitchOff += Math.sin(elapsed * 0.09) * 0.02
    }
    const yawF = baseYaw + yawOff
    const pitchF = clamp(basePitch + pitchOff, -0.9, 1.05)
    const cp = Math.cos(pitchF)
    let px = rig.lx + Math.sin(yawF) * cp * dist
    let py = rig.ly + Math.sin(pitchF) * dist
    let pz = rig.lz + Math.cos(yawF) * cp * dist
    if (portrait) {
      px = rig.lx + (px - rig.lx) * 2.25
      py = rig.ly + (py - rig.ly) * 1.35
      pz = rig.lz + (pz - rig.lz) * 2.25
    }
    camera.position.set(px, py, pz)
    camera.lookAt(rig.lx, rig.ly - (portrait ? 1.7 : 0), rig.lz)
  }

  const probeSamples: number[] = []
  let warmed = 0
  let probed = !options.probe

  function renderScene(): WorldStats {
    let triangles = 0
    let calls = 0
    let points = 0
    if (budget.post && rtScene && rtA && rtB && brightMat && blurMat && compositeMat && quadMesh && quadScene) {
      renderer.setRenderTarget(rtScene)
      renderer.clear()
      renderer.render(scene, camera)
      triangles = renderer.info.render.triangles
      calls = renderer.info.render.calls
      points = renderer.info.render.points

      brightMat.uniforms.tDiffuse!.value = rtScene.texture
      quadMesh.material = brightMat
      renderer.setRenderTarget(rtA)
      renderer.clear()
      renderer.render(quadScene, quadCam)

      blurMat.uniforms.tDiffuse!.value = rtA.texture
      blurMat.uniforms.uDir!.value.x = 1 / Math.max(1, rtA.width)
      blurMat.uniforms.uDir!.value.y = 0
      quadMesh.material = blurMat
      renderer.setRenderTarget(rtB)
      renderer.clear()
      renderer.render(quadScene, quadCam)

      blurMat.uniforms.tDiffuse!.value = rtB.texture
      blurMat.uniforms.uDir!.value.x = 0
      blurMat.uniforms.uDir!.value.y = 1 / Math.max(1, rtA.height)
      renderer.setRenderTarget(rtA)
      renderer.clear()
      renderer.render(quadScene, quadCam)

      compositeMat.uniforms.tScene!.value = rtScene.texture
      compositeMat.uniforms.tBloom!.value = rtA.texture
      compositeMat.uniforms.uCa!.value = motionOk ? ca : 0
      compositeMat.uniforms.uTime!.value = elapsed
      quadMesh.material = compositeMat
      renderer.setRenderTarget(null)
      renderer.clear()
      renderer.render(quadScene, quadCam)
    } else {
      renderer.setRenderTarget(null)
      renderer.render(scene, camera)
      triangles = renderer.info.render.triangles
      calls = renderer.info.render.calls
      points = renderer.info.render.points
    }
    return {
      triangles,
      calls,
      points,
      stars: budget.starCount,
      dpr: pixelRatio,
      post: budget.post,
    }
  }

  const quadCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1)

  function frame(_time: number, deltaMs: number) {
    if (disposed || lost) return
    try {
      frameInner(deltaMs)
    } catch (error) {
      console.warn('[satya] frame failed', error)
      stop()
    }
  }

  function frameInner(deltaMs: number) {
    const dt = Math.min(Math.max(deltaMs, 0) / 1000, 0.05)
    if (motionOk) elapsed += dt

    const snap = !motionOk
    const lookTargetYaw = dragYaw + (gyroActive ? gyroYaw : 0) + parallaxYaw
    const lookTargetPitch = dragPitch + (gyroActive ? gyroPitch : 0) + parallaxPitch
    yaw = damp(yaw, lookTargetYaw, 7, dt, snap)
    pitch = damp(pitch, lookTargetPitch, 7, dt, snap)

    const breath = !motionOk
      ? 1
      : budget.tier === 1
        ? 0.62 + 0.38 * (0.5 + 0.5 * Math.sin(elapsed * 1.3))
        : 0.84 + 0.16 * (0.5 + 0.5 * Math.sin(elapsed * 0.8))
    for (const mat of beaconMaterials) {
      mat.uniforms.uTime!.value = motionOk && budget.noiseOctaves > 0 ? elapsed : 0
      mat.uniforms.uBreath!.value = breath
    }

    placeCamera()
    const stats = renderScene()
    if (!reported) {
      reported = true
      options.onStats(stats)
    }

    if (!probed) {
      warmed += 1
      if (warmed > 5) probeSamples.push(Math.min(deltaMs, 100))
      if (probeSamples.length >= 45) {
        probed = true
        const avgMs = probeSamples.reduce((sum, sample) => sum + sample, 0) / probeSamples.length
        options.onProbe(avgMs > 0 ? 1000 / avgMs : 60)
      }
    }
  }

  function start() {
    if (listening || disposed || lost) return
    listening = true
    gsap.ticker.add(frame)
  }

  function stop() {
    if (!listening) return
    listening = false
    gsap.ticker.remove(frame)
  }

  function onLost(event: Event) {
    event.preventDefault()
    lost = true
    stop()
    options.onContextLost()
  }

  function onRestored() {
    if (disposed) return
    lost = false
    start()
    options.onContextRestored()
  }

  options.canvas.addEventListener('webglcontextlost', onLost)
  options.canvas.addEventListener('webglcontextrestored', onRestored)

  resize(viewW, viewH)
  placeCamera()
  renderScene()
  start()

  return {
    resize,
    setPaused(paused: boolean) {
      if (paused) stop()
      else start()
    },
    travel(id: AnchorId) {
      const anchor = anchorById(id)
      const gen = ++travelGen
      dragYaw = 0
      dragPitch = 0
      parallaxYaw = 0
      parallaxPitch = 0
      const duration = motionOk ? budget.travelMs / 1000 : 0
      gsap.to(rig, {
        x: anchor.cx,
        y: anchor.cy,
        z: anchor.cz,
        lx: anchor.lx,
        ly: anchor.ly,
        lz: anchor.lz,
        duration,
        ease: 'expo.out',
        overwrite: 'auto',
        onUpdate(this: gsap.core.Tween) {
          if (!budget.post || !motionOk) {
            ca = 0
            return
          }
          ca = Math.sin(this.progress() * Math.PI) * 0.002
        },
        onComplete() {
          ca = 0
          if (gen === travelGen) options.onArrive(id)
        },
      })
    },
    setMotionOk(ok: boolean) {
      motionOk = ok
      if (!ok) {
        gsap.killTweensOf(rig)
        ca = 0
        gyroActive = false
        gyroYaw = 0
        gyroPitch = 0
      }
    },
    pointer(dx: number, dy: number, isDragging: boolean, nx: number, ny: number) {
      dragging = isDragging
      if (!motionOk) return
      if (isDragging) {
        dragYaw = clamp(dragYaw + dx * 0.0052, -1.15, 1.15)
        dragPitch = clamp(dragPitch + dy * 0.004, -0.55, 0.55)
        parallaxYaw = 0
        parallaxPitch = 0
        return
      }
      if (!gyroActive) {
        parallaxYaw = nx * 0.07
        parallaxPitch = ny * 0.045
      }
    },
    pointerUp() {
      dragging = false
    },
    setGyro(beta: number | null, gamma: number | null) {
      if (!budget.gyro || !motionOk || beta === null || gamma === null) {
        gyroActive = false
        gyroYaw = 0
        gyroPitch = 0
        return
      }
      gyroActive = true
      parallaxYaw = 0
      parallaxPitch = 0
      gyroYaw = clamp(gamma * 0.012, -0.4, 0.4)
      gyroPitch = clamp((beta - 45) * 0.008, -0.3, 0.28)
    },
    clearGyro() {
      gyroActive = false
      gyroYaw = 0
      gyroPitch = 0
    },
    dispose(releaseContext = false) {
      if (disposed) return
      disposed = true
      stop()
      gsap.killTweensOf(rig)
      options.canvas.removeEventListener('webglcontextlost', onLost)
      options.canvas.removeEventListener('webglcontextrestored', onRestored)
      rtScene?.dispose()
      rtA?.dispose()
      rtB?.dispose()
      for (const geo of geos) geo.dispose()
      for (const mat of mats) {
        const maps = mat as Material & Record<string, { dispose?: () => void } | null | undefined>
        for (const key of ['map', 'alphaMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap']) {
          const tex = maps[key]
          if (tex && typeof tex.dispose === 'function') tex.dispose()
        }
        mat.dispose()
      }
      if (releaseContext) {
        try { renderer.forceContextLoss() } catch { /* context already gone */ }
      }
      renderer.dispose()
    },
  }
}
