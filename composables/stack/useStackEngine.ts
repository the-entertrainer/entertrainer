/**
 * Three.js Stack engine — orthographic Ketchapp-class stacker.
 * Alternating X/Z move, overlap trim, falling overhangs, soft shadows.
 */
import * as THREE from 'three'

export type StackPhase = 'title' | 'playing' | 'over'

export type StackPalette = {
  paper: string
  paperDeep: string
  ink: string
  yellow: string
  cream: string
  creamBlock: string
}

export const STACK_PALETTE_LIGHT: StackPalette = {
  paper: '#FBF8EF',
  paperDeep: '#F0EAD8',
  ink: '#161618',
  yellow: '#FFD43B',
  cream: '#F5EFD9',
  creamBlock: '#E8D078',
}

export const STACK_PALETTE_DARK: StackPalette = {
  paper: '#121214',
  paperDeep: '#0A0A0C',
  ink: '#EDE6D6',
  yellow: '#E8C547',
  cream: '#2A2824',
  creamBlock: '#C9B56A',
}

const SLAB_H = 0.38
const START_SIZE = 3.2
const PERFECT_EPS = 0.07
const MOVE_SPAN = 5.2
const MIN_SIZE = 0.18

type Axis = 'x' | 'z'

type SlabData = {
  mesh: THREE.Mesh
  x: number
  z: number
  w: number
  d: number
  y: number
  ink: boolean
  bounce: number
}

type FallPiece = {
  mesh: THREE.Mesh
  vx: number
  vy: number
  vz: number
  rx: number
  ry: number
  rz: number
  life: number
}

export type StackEngineHooks = {
  onScore?: (n: number, perfect: boolean) => void
  onGameOver?: (score: number) => void
  onPerfect?: () => void
  onPlace?: (perfect: boolean) => void
  onMiss?: () => void
}

export function createStackEngine(canvas: HTMLCanvasElement, hooks: StackEngineHooks = {}) {
  let pal: StackPalette = { ...STACK_PALETTE_LIGHT }
  let isDark = false

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(pal.paper)

  // Orthographic isometric-ish camera
  const frustum = 5.5
  const camera = new THREE.OrthographicCamera(-frustum, frustum, frustum, -frustum, 0.1, 80)
  camera.position.set(7.5, 8.5, 7.5)
  camera.lookAt(0, 0, 0)

  const ambient = new THREE.AmbientLight(0xffffff, 0.62)
  scene.add(ambient)

  const key = new THREE.DirectionalLight(0xfff6e0, 0.95)
  key.position.set(6, 14, 4)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.near = 1
  key.shadow.camera.far = 40
  key.shadow.camera.left = -10
  key.shadow.camera.right = 10
  key.shadow.camera.top = 10
  key.shadow.camera.bottom = -10
  key.shadow.bias = -0.0008
  key.shadow.normalBias = 0.02
  scene.add(key)
  scene.add(key.target)

  const fill = new THREE.DirectionalLight(0xc8d4ff, 0.28)
  fill.position.set(-5, 6, -3)
  scene.add(fill)

  // Soft ground plane for contact shadows
  const groundGeo = new THREE.PlaneGeometry(24, 24)
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.22 })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -SLAB_H * 0.5 - 0.01
  ground.receiveShadow = true
  scene.add(ground)

  // Subtle base disc under tower
  const discGeo = new THREE.CircleGeometry(2.6, 48)
  const discMat = new THREE.MeshLambertMaterial({
    color: new THREE.Color(pal.paperDeep),
    transparent: true,
    opacity: 0.55,
  })
  const disc = new THREE.Mesh(discGeo, discMat)
  disc.rotation.x = -Math.PI / 2
  disc.position.y = -SLAB_H * 0.5
  disc.receiveShadow = true
  scene.add(disc)

  const tower = new THREE.Group()
  scene.add(tower)

  // Shared geometry template — each slab gets its own scaled BoxGeometry for clean UVs/shadows
  const materials: THREE.Material[] = [groundMat, discMat]
  const geometries: THREE.BufferGeometry[] = [groundGeo, discGeo]

  let slabs: SlabData[] = []
  let falling: FallPiece[] = []
  let moving: SlabData | null = null
  let axis: Axis = 'x'
  let dir = 1
  let speed = 2.8
  let score = 0
  let phase: StackPhase = 'title'
  let camY = 0
  let camTargetY = 0
  let camPull = 0 // game-over pull-back of frustum
  let camPullTarget = 0
  let flash = 0
  let flashMesh: THREE.Mesh | null = null
  let combo = 0
  let running = false
  let raf = 0
  let lastTs = 0
  let cssW = 390
  let cssH = 780
  let titleIdle = false

  // Halo ring for perfect
  const haloGeo = new THREE.RingGeometry(0.9, 1.15, 48)
  const haloMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(pal.yellow),
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  geometries.push(haloGeo)
  materials.push(haloMat)
  const halo = new THREE.Mesh(haloGeo, haloMat)
  halo.rotation.x = -Math.PI / 2
  halo.visible = false
  scene.add(halo)

  function hexShift(hex: string, index: number, towardLight: boolean): THREE.Color {
    const c = new THREE.Color(hex)
    const t = Math.min(1, index / 28)
    const amt = t * 0.055
    if (towardLight) {
      c.r = Math.min(1, c.r + amt)
      c.g = Math.min(1, c.g + amt * 0.9)
      c.b = Math.min(1, c.b + amt * 0.7)
    } else {
      c.r = Math.max(0, c.r - amt * 0.7)
      c.g = Math.max(0, c.g - amt * 0.75)
      c.b = Math.max(0, c.b - amt * 0.85)
    }
    return c
  }

  function slabColor(ink: boolean, index: number): THREE.Color {
    if (ink) return hexShift(pal.ink, index, isDark)
    return hexShift(pal.creamBlock, index, !isDark)
  }

  function makeSlabMesh(w: number, d: number, color: THREE.Color): THREE.Mesh {
    const geo = new THREE.BoxGeometry(w, SLAB_H, d)
    geometries.push(geo)
    const mat = new THREE.MeshLambertMaterial({ color })
    materials.push(mat)
    const mesh = new THREE.Mesh(geo, mat)
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
  }

  function disposeMesh(mesh: THREE.Mesh) {
    mesh.parent?.remove(mesh)
    const geo = mesh.geometry
    const mat = mesh.material
    if (geo) {
      geo.dispose()
      const gi = geometries.indexOf(geo)
      if (gi >= 0) geometries.splice(gi, 1)
    }
    if (mat && !Array.isArray(mat)) {
      mat.dispose()
      const mi = materials.indexOf(mat)
      if (mi >= 0) materials.splice(mi, 1)
    }
  }

  function clearTower() {
    for (const s of slabs) disposeMesh(s.mesh)
    slabs = []
    if (moving) {
      disposeMesh(moving.mesh)
      moving = null
    }
    for (const f of falling) disposeMesh(f.mesh)
    falling = []
    flash = 0
    halo.visible = false
    haloMat.opacity = 0
  }

  function applyTheme(next: StackPalette, dark: boolean) {
    pal = next
    isDark = dark
    scene.background = new THREE.Color(pal.paper)
    discMat.color.set(pal.paperDeep)
    groundMat.opacity = dark ? 0.38 : 0.18
    key.intensity = dark ? 0.85 : 0.95
    ambient.intensity = dark ? 0.48 : 0.62
    haloMat.color.set(pal.yellow)
    // Retint existing slabs
    slabs.forEach((s, i) => {
      const m = s.mesh.material as THREE.MeshLambertMaterial
      m.color.copy(slabColor(s.ink, i))
    })
    if (moving) {
      const m = moving.mesh.material as THREE.MeshLambertMaterial
      m.color.copy(slabColor(moving.ink, slabs.length))
    }
    for (const f of falling) {
      // leave falling as-is (already colored)
    }
  }

  function setSize(w: number, h: number) {
    cssW = Math.max(280, Math.floor(w))
    cssH = Math.max(420, Math.floor(h))
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(cssW, cssH, false)
    updateCameraFrustum()
  }

  function updateCameraFrustum() {
    const aspect = cssW / cssH
    const base = frustum + camPull
    // Keep tower comfortably framed; portrait stretches vertical view
    const halfH = base * 1.05
    const halfW = halfH * aspect
    camera.left = -halfW
    camera.right = halfW
    camera.top = halfH
    camera.bottom = -halfH
    camera.updateProjectionMatrix()
  }

  function placeCamera() {
    const lookY = camY
    camera.position.set(7.5, 8.5 + lookY, 7.5)
    camera.lookAt(0, lookY, 0)
    key.position.set(6, 14 + lookY, 4)
    key.target.position.set(0, lookY, 0)
    key.target.updateMatrixWorld()
  }

  function startTitleIdle() {
    phase = 'title'
    titleIdle = true
    clearTower()
    score = 0
    combo = 0
    camY = 0
    camTargetY = 0
    camPull = 0
    camPullTarget = 0
    // Idle showcase tower
    const layers = [
      { w: START_SIZE, d: START_SIZE, ink: true },
      { w: START_SIZE * 0.86, d: START_SIZE * 0.86, ink: false },
      { w: START_SIZE * 0.7, d: START_SIZE * 0.7, ink: true },
      { w: START_SIZE * 0.52, d: START_SIZE * 0.52, ink: false },
    ]
    layers.forEach((L, i) => {
      const y = i * SLAB_H
      const mesh = makeSlabMesh(L.w, L.d, slabColor(L.ink, i))
      mesh.position.set(0, y, 0)
      tower.add(mesh)
      slabs.push({ mesh, x: 0, z: 0, w: L.w, d: L.d, y, ink: L.ink, bounce: 0 })
    })
    placeCamera()
    ensureLoop()
  }

  function startGame() {
    titleIdle = false
    phase = 'playing'
    clearTower()
    score = 0
    combo = 0
    speed = 2.8
    dir = 1
    axis = 'x'
    camY = 0
    camTargetY = 0
    camPull = 0
    camPullTarget = 0

    const mesh = makeSlabMesh(START_SIZE, START_SIZE, slabColor(true, 0))
    mesh.position.set(0, 0, 0)
    tower.add(mesh)
    slabs.push({
      mesh, x: 0, z: 0, w: START_SIZE, d: START_SIZE, y: 0, ink: true, bounce: 0,
    })
    spawnMoving()
    placeCamera()
    ensureLoop()
  }

  function spawnMoving() {
    const top = slabs[slabs.length - 1]
    const y = top.y + SLAB_H
    const ink = slabs.length % 2 === 0
    const mesh = makeSlabMesh(top.w, top.d, slabColor(ink, slabs.length))
    const start = dir > 0 ? -MOVE_SPAN : MOVE_SPAN
    const x = axis === 'x' ? start : top.x
    const z = axis === 'z' ? start : top.z
    mesh.position.set(x, y, z)
    tower.add(mesh)
    moving = { mesh, x, z, w: top.w, d: top.d, y, ink, bounce: 0 }
  }

  function drop() {
    if (phase !== 'playing' || !moving) return
    const top = slabs[slabs.length - 1]
    const cur = moving

    let overlapW = cur.w
    let overlapD = cur.d
    let newX = cur.x
    let newZ = cur.z
    let fallW = 0
    let fallD = 0
    let fallX = 0
    let fallZ = 0
    let hasFall = false

    if (axis === 'x') {
      const left = Math.max(cur.x - cur.w / 2, top.x - top.w / 2)
      const right = Math.min(cur.x + cur.w / 2, top.x + top.w / 2)
      overlapW = right - left
      if (overlapW <= 0.02) {
        spawnFall(cur.x, cur.y, cur.z, cur.w, cur.d, cur.ink, dir * 1.2, 0)
        disposeMesh(cur.mesh)
        moving = null
        hooks.onMiss?.()
        endGame()
        return
      }
      newX = (left + right) / 2
      newZ = top.z
      const overhang = cur.w - overlapW
      if (overhang > 0.02) {
        hasFall = true
        fallW = overhang
        fallD = cur.d
        fallX = cur.x < top.x
          ? cur.x - cur.w / 2 + overhang / 2
          : cur.x + cur.w / 2 - overhang / 2
        fallZ = cur.z
      }
    } else {
      const near = Math.max(cur.z - cur.d / 2, top.z - top.d / 2)
      const far = Math.min(cur.z + cur.d / 2, top.z + top.d / 2)
      overlapD = far - near
      if (overlapD <= 0.02) {
        spawnFall(cur.x, cur.y, cur.z, cur.w, cur.d, cur.ink, 0, dir * 1.2)
        disposeMesh(cur.mesh)
        moving = null
        hooks.onMiss?.()
        endGame()
        return
      }
      newZ = (near + far) / 2
      newX = top.x
      const overhang = cur.d - overlapD
      if (overhang > 0.02) {
        hasFall = true
        fallW = cur.w
        fallD = overhang
        fallX = cur.x
        fallZ = cur.z < top.z
          ? cur.z - cur.d / 2 + overhang / 2
          : cur.z + cur.d / 2 - overhang / 2
      }
    }

    const dx = Math.abs(cur.x - top.x)
    const dz = Math.abs(cur.z - top.z)
    const perfect = axis === 'x'
      ? dx <= PERFECT_EPS
      : dz <= PERFECT_EPS

    // Remove moving mesh; rebuild placed + optional fall
    disposeMesh(cur.mesh)
    moving = null

    if (perfect) {
      overlapW = top.w
      overlapD = top.d
      newX = top.x
      newZ = top.z
      hasFall = false
      combo += 1
    } else {
      combo = 0
    }

    if (hasFall) {
      spawnFall(
        fallX, cur.y, fallZ, fallW, fallD, cur.ink,
        axis === 'x' ? (fallX < newX ? -1.4 : 1.4) : 0,
        axis === 'z' ? (fallZ < newZ ? -1.4 : 1.4) : 0,
      )
    }

    const placedMesh = makeSlabMesh(overlapW, overlapD, slabColor(cur.ink, slabs.length))
    placedMesh.position.set(newX, cur.y, newZ)
    tower.add(placedMesh)
    const placed: SlabData = {
      mesh: placedMesh,
      x: newX,
      z: newZ,
      w: overlapW,
      d: overlapD,
      y: cur.y,
      ink: cur.ink,
      bounce: perfect ? 1 : 0,
    }
    slabs.push(placed)

    score += 1
    hooks.onScore?.(score, perfect)
    hooks.onPlace?.(perfect)
    if (perfect) {
      flash = 1
      triggerHalo(newX, cur.y + SLAB_H * 0.55, newZ, Math.max(overlapW, overlapD))
      hooks.onPerfect?.()
    }

    // Camera follow
    const stackTop = cur.y
    const desired = 1.6
    if (stackTop > desired) camTargetY = stackTop - desired

    speed = Math.min(speed + 0.06 + score * 0.004, 6.2)

    if (overlapW < MIN_SIZE || overlapD < MIN_SIZE) {
      endGame()
      return
    }

    axis = axis === 'x' ? 'z' : 'x'
    dir *= -1
    spawnMoving()
  }

  function spawnFall(
    x: number, y: number, z: number,
    w: number, d: number, ink: boolean,
    vx: number, vz: number,
  ) {
    const mesh = makeSlabMesh(Math.max(w, 0.05), Math.max(d, 0.05), slabColor(ink, slabs.length))
    mesh.position.set(x, y, z)
    scene.add(mesh) // not in tower — falls in world
    falling.push({
      mesh,
      vx: vx + (Math.random() - 0.5) * 0.4,
      vy: 0.6 + Math.random() * 0.5,
      vz: vz + (Math.random() - 0.5) * 0.4,
      rx: (Math.random() - 0.5) * 4,
      ry: (Math.random() - 0.5) * 2,
      rz: (Math.random() - 0.5) * 4,
      life: 1.6,
    })
  }

  function triggerHalo(x: number, y: number, z: number, size: number) {
    halo.position.set(x, y, z)
    const s = Math.max(0.6, size * 0.55)
    halo.userData.baseScale = s
    halo.scale.setScalar(s)
    halo.visible = true
    haloMat.opacity = 0.85
    haloMat.color.set(pal.yellow)
  }

  function endGame() {
    phase = 'over'
    moving = null
    camPullTarget = Math.min(4.5, 0.35 + slabs.length * 0.12)
    // Center look on mid-tower
    const midY = slabs.length ? slabs[Math.floor(slabs.length / 2)].y : 0
    camTargetY = midY * 0.55
    hooks.onGameOver?.(score)
  }

  function tick(ts: number) {
    const dt = Math.min(0.033, (ts - (lastTs || ts)) / 1000)
    lastTs = ts

    if (titleIdle && phase === 'title') {
      const t = ts / 1000
      const drift = Math.sin(t * 0.7) * 0.08
      tower.rotation.y = drift
      camY += (0 - camY) * Math.min(1, dt * 3)
      placeCamera()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
      return
    }

    tower.rotation.y = 0

    if (phase === 'playing' && moving) {
      if (axis === 'x') {
        moving.x += dir * speed * dt
        if (dir > 0 && moving.x > MOVE_SPAN) dir = -1
        if (dir < 0 && moving.x < -MOVE_SPAN) dir = 1
        moving.mesh.position.x = moving.x
      } else {
        moving.z += dir * speed * dt
        if (dir > 0 && moving.z > MOVE_SPAN) dir = -1
        if (dir < 0 && moving.z < -MOVE_SPAN) dir = 1
        moving.mesh.position.z = moving.z
      }
    }

    // Bounce on perfect
    for (const s of slabs) {
      if (s.bounce > 0) {
        s.bounce = Math.max(0, s.bounce - dt * 4.2)
        const punch = Math.sin(s.bounce * Math.PI) * 0.07
        s.mesh.scale.set(1 + punch, 1 + punch * 0.5, 1 + punch)
      }
    }

    // Falling overhangs
    for (const f of falling) {
      f.vy -= 14 * dt
      f.mesh.position.x += f.vx * dt
      f.mesh.position.y += f.vy * dt
      f.mesh.position.z += f.vz * dt
      f.mesh.rotation.x += f.rx * dt
      f.mesh.rotation.y += f.ry * dt
      f.mesh.rotation.z += f.rz * dt
      f.life -= dt
      const mat = f.mesh.material as THREE.MeshLambertMaterial
      if (mat.transparent !== true) {
        mat.transparent = true
      }
      mat.opacity = Math.max(0, Math.min(1, f.life * 1.2))
    }
    falling = falling.filter((f) => {
      if (f.life <= 0 || f.mesh.position.y < -8) {
        disposeMesh(f.mesh)
        return false
      }
      return true
    })

    // Halo fade
    if (flash > 0) {
      flash = Math.max(0, flash - dt * 2.8)
      haloMat.opacity = 0.85 * flash
      const grow = 1 + (1 - flash) * 0.7
      const b = (halo.userData.baseScale as number) || 1
      halo.scale.setScalar(b * grow)
      if (flash <= 0) {
        halo.visible = false
      }
    }

    camY += (camTargetY - camY) * Math.min(1, dt * 3.6)
    camPull += (camPullTarget - camPull) * Math.min(1, dt * 2.4)
    updateCameraFrustum()
    placeCamera()

    renderer.render(scene, camera)

    if (running) raf = requestAnimationFrame(tick)
  }

  function ensureLoop() {
    if (running) return
    running = true
    lastTs = 0
    raf = requestAnimationFrame(tick)
  }

  function stopLoop() {
    running = false
    cancelAnimationFrame(raf)
  }

  function onPointer() {
    if (phase === 'title') {
      startGame()
      return 'start' as const
    }
    if (phase === 'playing') {
      drop()
      return 'drop' as const
    }
    if (phase === 'over') {
      startGame()
      return 'again' as const
    }
    return null
  }

  function getPhase() { return phase }
  function getScore() { return score }
  function getCombo() { return combo }

  function dispose() {
    stopLoop()
    clearTower()
    geometries.forEach(g => g.dispose())
    materials.forEach(m => m.dispose())
    renderer.dispose()
    scene.clear()
  }

  // initial size from canvas parent
  const parent = canvas.parentElement
  setSize(parent?.clientWidth || window.innerWidth, parent?.clientHeight || window.innerHeight)
  startTitleIdle()
  renderer.render(scene, camera)

  return {
    setSize,
    applyTheme,
    startGame,
    startTitleIdle,
    onPointer,
    getPhase,
    getScore,
    getCombo,
    dispose,
    drop,
  }
}

export type StackEngine = ReturnType<typeof createStackEngine>
