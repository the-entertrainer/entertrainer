/**
 * Escape — first-person concrete rooms, touch-only, seeded layouts.
 * Fixed 60 Hz motion. Portals are one-bounce render targets (no recursive stencil).
 */
import * as THREE from 'three'
import { buildLevel, type LevelSpec, type RoomKind } from './level'

const STEP = 1 / 60
const EYE = 1.62
const MAX_SPEED = 4.2
const TAP_PX = 18

export interface EscapeMount {
  dispose: () => void
  nextEscape: () => void
}

interface TouchPoint {
  x: number
  y: number
  ox: number
  oy: number
  lastX: number
  moved: number
}

interface Portal {
  mesh: THREE.Mesh
  cam: THREE.PerspectiveCamera
  target: THREE.WebGLRenderTarget
  /** World-space shift applied to the viewer to look through this wall. */
  shift: THREE.Vector3
  yaw: number
}

interface ChalkMark {
  x: number
  z: number
}

export function mountEscape(
  view: HTMLCanvasElement,
  card: HTMLCanvasElement,
  hooks: { onPhase: (phase: 'play' | 'fade' | 'card') => void }
): EscapeMount {
  const renderer = new THREE.WebGLRenderer({
    canvas: view,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.setClearColor(0xf4f0e6, 1)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf6f2ea)
  const camera = new THREE.PerspectiveCamera(68, 1, 0.08, 80)
  camera.position.set(0, EYE, 0)

  const sun = new THREE.DirectionalLight(0xfff6e8, 2.4)
  sun.position.set(8, 18, 6)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 40
  sun.shadow.camera.left = -16
  sun.shadow.camera.right = 16
  sun.shadow.camera.top = 16
  sun.shadow.camera.bottom = -16
  sun.shadow.bias = -0.0004
  scene.add(sun)
  scene.add(new THREE.HemisphereLight(0xfffaf2, 0xc8c0b2, 0.55))

  const doorLight = new THREE.PointLight(0xffb15a, 6, 14, 1.6)
  doorLight.castShadow = false
  scene.add(doorLight)

  const concrete = new THREE.MeshPhysicalMaterial({
    color: 0xd7d1c5,
    roughness: 0.62,
    metalness: 0,
    clearcoat: 0.08,
    clearcoatRoughness: 0.7
  })
  const floorMat = concrete.clone()
  floorMat.color = new THREE.Color(0xcfc7b8)
  floorMat.roughness = 0.48
  const ringMat = new THREE.MeshPhysicalMaterial({
    color: 0x385c84,
    roughness: 0.22,
    metalness: 0.82,
    clearcoat: 0.4
  })
  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x3a2a18,
    emissive: new THREE.Color(0xffb15a),
    emissiveIntensity: 2.4,
    roughness: 0.35
  })

  const pointers = new Map<number, TouchPoint>()
  let yaw = 0
  let roll = 0
  let rollTarget = 0
  let x = 0
  let z = 0
  let speed = 0
  let desired = 0
  let walkPhase = 0
  let bob = 0
  let seed = 0
  let escapeCount = 0
  let level: LevelSpec = buildLevel(1, 0)
  let ringCooldown = 0
  let playing = true
  let acc = 0
  let last = performance.now()
  let raf = 0
  const path: { x: number; z: number }[] = []
  const chalk: ChalkMark[] = []
  const chalkGroup = new THREE.Group()
  scene.add(chalkGroup)
  const portals: Portal[] = []
  const solids: THREE.Object3D[] = []
  let doorPos = new THREE.Vector3()

  const scratch = new THREE.Vector3()

  function resize() {
    const w = view.clientWidth || window.innerWidth
    const h = view.clientHeight || window.innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / Math.max(1, h)
    camera.updateProjectionMatrix()
  }

  function clearRoom() {
    for (const portal of portals) {
      scene.remove(portal.mesh)
      portal.target.dispose()
      ;(portal.mesh.material as THREE.Material).dispose()
    }
    portals.length = 0
    for (const obj of solids) {
      scene.remove(obj)
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
        }
      })
    }
    solids.length = 0
    while (chalkGroup.children.length) {
      const child = chalkGroup.children[0]!
      chalkGroup.remove(child)
      if (child instanceof THREE.Line) child.geometry.dispose()
    }
  }

  function addSolid(mesh: THREE.Mesh) {
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)
    solids.push(mesh)
  }

  function makePortal(width: number, height: number, position: THREE.Vector3, rotationY: number, shift: THREE.Vector3, yawAdd: number) {
    const target = new THREE.WebGLRenderTarget(640, 480)
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: target.texture })
    )
    mesh.position.copy(position)
    mesh.rotation.y = rotationY
    mesh.castShadow = false
    mesh.receiveShadow = false
    scene.add(mesh)
    const cam = new THREE.PerspectiveCamera(68, 640 / 480, 0.08, 80)
    portals.push({ mesh, cam, target, shift, yaw: yawAdd })
  }

  function loadLevel(nextCount: number, keepSeed = true) {
    if (!keepSeed) {
      const buf = new Uint32Array(1)
      crypto.getRandomValues(buf)
      seed = buf[0]! || 1
    }
    escapeCount = nextCount
    level = buildLevel(seed, escapeCount)
    clearRoom()
    path.length = 0
    chalk.length = 0
    ringCooldown = 0
    roll = 0
    rollTarget = 0
    speed = 0
    desired = 0

    const floor = new THREE.Mesh(new THREE.BoxGeometry(level.hx * 2, 0.28, level.hz * 2), floorMat)
    floor.position.y = -0.14
    floor.receiveShadow = true
    floor.castShadow = true
    addSolid(floor)

    const wallH = 3.4
    const kind: RoomKind = level.kind
    const kick = level.yawKick

    if (kind === 'rings') {
      addSolid(wallBox(level.hx * 2, wallH, 0.28, 0, wallH / 2, -level.hz))
      addSolid(wallBox(level.hx * 2, wallH, 0.28, 0, wallH / 2, level.hz))
      addSolid(wallBox(0.28, wallH, level.hz * 2, -level.hx, wallH / 2, 0))
      addSolid(wallBox(0.28, wallH, level.hz * 2, level.hx, wallH / 2, 0))
      for (const ring of level.rings) {
        const torus = new THREE.Mesh(new THREE.TorusGeometry(ring.radius, 0.08, 16, 48), ringMat)
        torus.position.set(ring.x, ring.radius + 0.15, ring.z)
        torus.rotation.y = ring.yaw
        addSolid(torus)
      }
    } else if (kind === 'cylinder') {
      addSolid(wallBox(level.hx * 2, wallH, 0.28, 0, wallH / 2, -level.hz))
      addSolid(wallBox(level.hx * 2, wallH, 0.28, 0, wallH / 2, level.hz))
      makePortal(level.hz * 2, wallH, new THREE.Vector3(-level.hx + 0.02, wallH / 2, 0), Math.PI / 2, new THREE.Vector3(level.hx * 2, 0, 0), 0)
      makePortal(level.hz * 2, wallH, new THREE.Vector3(level.hx - 0.02, wallH / 2, 0), -Math.PI / 2, new THREE.Vector3(-level.hx * 2, 0, 0), 0)
    } else {
      makePortal(level.hx * 2, wallH, new THREE.Vector3(0, wallH / 2, -level.hz + 0.02), 0, new THREE.Vector3(0, 0, level.hz * 2), kick)
      makePortal(level.hx * 2, wallH, new THREE.Vector3(0, wallH / 2, level.hz - 0.02), Math.PI, new THREE.Vector3(0, 0, -level.hz * 2), kick)
      makePortal(level.hz * 2, wallH, new THREE.Vector3(-level.hx + 0.02, wallH / 2, 0), Math.PI / 2, new THREE.Vector3(level.hx * 2, 0, 0), kick)
      makePortal(level.hz * 2, wallH, new THREE.Vector3(level.hx - 0.02, wallH / 2, 0), -Math.PI / 2, new THREE.Vector3(-level.hx * 2, 0, 0), -kick)
    }

    const door = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.15, 0.08), doorMat)
    door.position.set(level.door.x, 1.08, level.door.z)
    door.rotation.y = level.door.yaw
    addSolid(door)
    doorPos = door.position.clone()
    doorLight.position.set(level.door.x, 1.4, level.door.z)

    x = -level.door.x * 0.85
    z = -level.door.z * 0.85
    if (Math.hypot(x, z) < 1.2) {
      x = 0
      z = -level.hz * 0.35
    }
    yaw = Math.atan2(level.door.x - x, level.door.z - z)
    path.push({ x, z })
    playing = true
    hooks.onPhase('play')
  }

  function wallBox(w: number, h: number, d: number, px: number, py: number, pz: number) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), concrete)
    mesh.position.set(px, py, pz)
    return mesh
  }

  function wrapPosition() {
    if (level.kind === 'rings') {
      x = THREE.MathUtils.clamp(x, -level.hx + 0.35, level.hx - 0.35)
      z = THREE.MathUtils.clamp(z, -level.hz + 0.35, level.hz - 0.35)
      return
    }
    if (level.kind === 'cylinder') {
      z = THREE.MathUtils.clamp(z, -level.hz + 0.35, level.hz - 0.35)
      if (x > level.hx) {
        x -= level.hx * 2
        rollTarget += Math.PI / 2
      } else if (x < -level.hx) {
        x += level.hx * 2
        rollTarget -= Math.PI / 2
      }
      return
    }
    if (x > level.hx) {
      x -= level.hx * 2
      yaw += level.yawKick
    } else if (x < -level.hx) {
      x += level.hx * 2
      yaw -= level.yawKick
    }
    if (z > level.hz) {
      z -= level.hz * 2
      yaw += level.yawKick
    } else if (z < -level.hz) {
      z += level.hz * 2
      yaw -= level.yawKick
    }
  }

  function dropChalk() {
    const jitter = (n: number) => (n - 0.5) * 0.35
    const mark: ChalkMark = { x, z }
    chalk.push(mark)
    const pts: THREE.Vector3[] = []
    const rng = mulberryLocal(seed, escapeCount, chalk.length)
    let cx = x
    let cz = z
    pts.push(new THREE.Vector3(cx, 0.02, cz))
    for (let i = 0; i < 7; i++) {
      cx += Math.cos(yaw) * 0.05 + jitter(rng())
      cz += Math.sin(yaw) * 0.05 + jitter(rng())
      pts.push(new THREE.Vector3(cx, 0.02 + rng() * 0.004, cz))
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const line = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({ color: 0x111111 })
    )
    chalkGroup.add(line)
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(12)
    }
  }

  function stepRings() {
    if (level.kind !== 'rings' || ringCooldown > 0) return
    for (const ring of level.rings) {
      const d = Math.hypot(x - ring.x, z - ring.z)
      if (d < ring.radius * 0.72) {
        x = ring.destX
        z = ring.destZ
        yaw = ring.yaw
        ringCooldown = 0.7
        break
      }
    }
  }

  function step(dt: number) {
    if (!playing) return
    const braking = pointers.size >= 2
    if (braking) desired = 0
    speed = damp(speed, braking ? 0 : desired, 7, dt)
    const moving = Math.abs(speed) > 0.02
    bob = damp(bob, moving ? 0.045 : 0, 6, dt)
    if (moving) walkPhase += dt * (3.2 + Math.abs(speed))
    x += Math.sin(yaw) * speed * dt
    z += Math.cos(yaw) * speed * dt
    wrapPosition()
    ringCooldown = Math.max(0, ringCooldown - dt)
    stepRings()
    roll = damp(roll, rollTarget, 3.2, dt)

    const lastPt = path[path.length - 1]
    if (!lastPt || Math.hypot(x - lastPt.x, z - lastPt.z) > 0.12) path.push({ x, z })

    if (Math.hypot(x - doorPos.x, z - doorPos.z) < 0.72) {
      playing = false
      desired = 0
      speed = 0
      hooks.onPhase('fade')
      window.setTimeout(() => {
        paintCard()
        hooks.onPhase('card')
      }, 720)
    }
  }

  function paintCard() {
    const w = 900
    const h = 1200
    const dpr = 2
    card.width = w * dpr
    card.height = h * dpr
    const ctx = card.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#f7f1e4'
    ctx.fillRect(0, 0, w, h)
    const pad = 120
    const mapX = (wx: number) => pad + ((wx + level.hx) / (level.hx * 2)) * (w - pad * 2)
    const mapY = (wz: number) => pad + ((wz + level.hz) / (level.hz * 2)) * (h - pad * 2)
    ctx.strokeStyle = '#0b0b0c'
    ctx.lineWidth = 3
    ctx.strokeRect(mapX(-level.hx), mapY(-level.hz), mapX(level.hx) - mapX(-level.hx), mapY(level.hz) - mapY(-level.hz))
    if (level.kind === 'rings') {
      ctx.strokeStyle = '#385c84'
      ctx.lineWidth = 4
      for (const ring of level.rings) {
        ctx.beginPath()
        ctx.ellipse(mapX(ring.x), mapY(ring.z), 28, 18, ring.yaw, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    ctx.strokeStyle = '#0b0b0c'
    ctx.lineWidth = 2.2
    ctx.beginPath()
    path.forEach((p, i) => {
      const px = mapX(p.x)
      const py = mapY(p.z)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    })
    ctx.stroke()
    ctx.fillStyle = '#0b0b0c'
    for (const mark of chalk) {
      ctx.beginPath()
      ctx.arc(mapX(mark.x), mapY(mark.z), 5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#e39a45'
    ctx.fillRect(mapX(level.door.x) - 8, mapY(level.door.z) - 14, 16, 28)
  }

  function renderPortals() {
    for (const portal of portals) portal.mesh.visible = false
    for (const portal of portals) {
      scratch.set(x, EYE, z).add(portal.shift)
      portal.cam.aspect = camera.aspect
      portal.cam.fov = camera.fov
      portal.cam.position.copy(scratch)
      portal.cam.position.y += Math.sin(walkPhase) * bob
      portal.cam.rotation.set(0, yaw + portal.yaw, roll, 'YXZ')
      portal.cam.updateProjectionMatrix()
      renderer.setRenderTarget(portal.target)
      renderer.render(scene, portal.cam)
    }
    for (const portal of portals) portal.mesh.visible = true
    renderer.setRenderTarget(null)
  }

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    acc += dt
    while (acc >= STEP) {
      step(STEP)
      acc -= STEP
    }
    camera.position.set(x, EYE + Math.sin(walkPhase) * bob, z)
    camera.rotation.set(0, yaw, roll, 'YXZ')
    if (portals.length) renderPortals()
    renderer.render(scene, camera)
    raf = requestAnimationFrame(frame)
  }

  function onDown(ev: PointerEvent) {
    view.setPointerCapture(ev.pointerId)
    pointers.set(ev.pointerId, {
      x: ev.clientX,
      y: ev.clientY,
      ox: ev.clientX,
      oy: ev.clientY,
      lastX: ev.clientX,
      moved: 0
    })
  }

  function onMove(ev: PointerEvent) {
    const p = pointers.get(ev.pointerId)
    if (!p || !playing) return
    const dx = ev.clientX - p.lastX
    p.lastX = ev.clientX
    p.x = ev.clientX
    p.y = ev.clientY
    p.moved = Math.hypot(ev.clientX - p.ox, ev.clientY - p.oy)
    if (pointers.size >= 2) {
      desired = 0
      return
    }
    yaw -= dx * 0.0055
    const vertical = p.oy - p.y
    const span = Math.max(window.innerHeight, 1)
    desired = THREE.MathUtils.clamp((vertical / span) * MAX_SPEED * 2.4, -MAX_SPEED, MAX_SPEED)
  }

  function onUp(ev: PointerEvent) {
    const p = pointers.get(ev.pointerId)
    pointers.delete(ev.pointerId)
    if (p && p.moved < TAP_PX && pointers.size === 0 && playing) dropChalk()
    if (pointers.size === 0) desired = 0
  }

  view.addEventListener('pointerdown', onDown)
  view.addEventListener('pointermove', onMove)
  view.addEventListener('pointerup', onUp)
  view.addEventListener('pointercancel', onUp)
  window.addEventListener('resize', resize)
  resize()
  loadLevel(0, false)
  raf = requestAnimationFrame(frame)

  return {
    nextEscape() {
      loadLevel(escapeCount + 1)
    },
    dispose() {
      cancelAnimationFrame(raf)
      view.removeEventListener('pointerdown', onDown)
      view.removeEventListener('pointermove', onMove)
      view.removeEventListener('pointerup', onUp)
      view.removeEventListener('pointercancel', onUp)
      window.removeEventListener('resize', resize)
      clearRoom()
      renderer.dispose()
    }
  }
}

function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.damp(current, target, lambda, dt)
}

function mulberryLocal(seed: number, escapeCount: number, n: number) {
  let a = (seed ^ Math.imul(escapeCount + 1, 0x85ebca6b) ^ Math.imul(n, 0xc2b2ae35)) >>> 0
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
