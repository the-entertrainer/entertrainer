<script setup lang="ts">
/**
 * Code-driven split-brain lab: fixation cross, half-field flashes,
 * hand choices, and the left-hemisphere interpreter — science mapping fixed.
 * Left VF → right hemisphere → left hand.
 * Right VF → left hemisphere → speech / right hand.
 */

import * as THREE from 'three'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type Step = {
  id: string
  tag: string
  caption: string
  hint: string
  /** Scene pose keys applied when entering this step. */
  pose: Pose
}

type Pose = {
  keyFlash: number
  clawFlash: number
  snowFlash: number
  speech: 'none' | 'nothing' | 'shed'
  leftPick: 'none' | 'key' | 'shovel'
  rightPick: 'none' | 'chicken'
  highlightRh: number
  highlightLh: number
  pathLeft: number
  pathRight: number
}

const STEPS: Step[] = [
  {
    id: 'map',
    tag: 'Map',
    caption: 'Look at the cross. Left space goes to the right half. Right space goes to the left half.',
    hint: 'Speech usually lives with the left half.',
    pose: {
      keyFlash: 0, clawFlash: 0, snowFlash: 0,
      speech: 'none', leftPick: 'none', rightPick: 'none',
      highlightRh: 0.35, highlightLh: 0.35,
      pathLeft: 0, pathRight: 0
    }
  },
  {
    id: 'beat-a-flash',
    tag: 'Beat A',
    caption: 'A key flashes on the left. Only the right half of the brain sees it.',
    hint: 'The speaking half sees nothing.',
    pose: {
      keyFlash: 1, clawFlash: 0, snowFlash: 0,
      speech: 'none', leftPick: 'none', rightPick: 'none',
      highlightRh: 1, highlightLh: 0.2,
      pathLeft: 1, pathRight: 0
    }
  },
  {
    id: 'beat-a-out',
    tag: 'Beat A',
    caption: 'The mouth says nothing. The left hand still finds the key.',
    hint: 'The quiet half can still act.',
    pose: {
      keyFlash: 0.25, clawFlash: 0, snowFlash: 0,
      speech: 'nothing', leftPick: 'key', rightPick: 'none',
      highlightRh: 1, highlightLh: 0.25,
      pathLeft: 1, pathRight: 0
    }
  },
  {
    id: 'beat-b-flash',
    tag: 'Beat B',
    caption: 'A chicken claw flashes on the right. Snow flashes on the left.',
    hint: 'Each half sees one picture.',
    pose: {
      keyFlash: 0, clawFlash: 1, snowFlash: 1,
      speech: 'none', leftPick: 'none', rightPick: 'none',
      highlightRh: 1, highlightLh: 1,
      pathLeft: 1, pathRight: 1
    }
  },
  {
    id: 'beat-b-hands',
    tag: 'Beat B',
    caption: 'The right hand picks a chicken. The left hand picks a shovel.',
    hint: 'Each hand answers for its half.',
    pose: {
      keyFlash: 0, clawFlash: 0.2, snowFlash: 0.2,
      speech: 'none', leftPick: 'shovel', rightPick: 'chicken',
      highlightRh: 0.9, highlightLh: 0.9,
      pathLeft: 1, pathRight: 1
    }
  },
  {
    id: 'beat-b-story',
    tag: 'Interpreter',
    caption: 'The mouth only saw the claw. It invents a chicken-shed story for the shovel.',
    hint: 'That storytelling system is the interpreter.',
    pose: {
      keyFlash: 0, clawFlash: 0.15, snowFlash: 0,
      speech: 'shed', leftPick: 'shovel', rightPick: 'chicken',
      highlightRh: 0.45, highlightLh: 1,
      pathLeft: 0.5, pathRight: 1
    }
  }
]

const wrapRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const stepIndex = ref(0)
const webglFail = ref(false)
const reducedMotion = ref(false)

const step = computed(() => STEPS[stepIndex.value]!)
const canBack = computed(() => stepIndex.value > 0)
const canNext = computed(() => stepIndex.value < STEPS.length - 1)
const stepLabel = computed(() => `Step ${stepIndex.value + 1} of ${STEPS.length}`)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let raf = 0
let resizeObs: ResizeObserver | null = null
let clock: THREE.Clock | null = null

const disposables: Array<{ dispose: () => void }> = []
const texCanvases: HTMLCanvasElement[] = []

/** Live pose (lerped toward target). */
const live: Pose = {
  keyFlash: 0, clawFlash: 0, snowFlash: 0,
  speech: 'none', leftPick: 'none', rightPick: 'none',
  highlightRh: 0.35, highlightLh: 0.35,
  pathLeft: 0, pathRight: 0
}
let targetPose: Pose = { ...STEPS[0]!.pose }

type Nodes = {
  keyMesh: THREE.Mesh
  clawMesh: THREE.Mesh
  snowMesh: THREE.Mesh
  rhHalf: THREE.Mesh
  lhHalf: THREE.Mesh
  cutGlow: THREE.Mesh
  pathLeft: THREE.Line
  pathRight: THREE.Line
  leftHand: THREE.Group
  rightHand: THREE.Group
  pickKey: THREE.Mesh
  pickShovel: THREE.Mesh
  pickChicken: THREE.Mesh
  speechNothing: THREE.Mesh
  speechShed: THREE.Mesh
  pulseRing: THREE.Mesh
}
let nodes: Nodes | null = null

function cssVars() {
  const el = wrapRef.value
  const fallback = {
    paper: '#FFFBF2',
    ink: '#161618',
    soft: '#9A9AA0',
    accent: '#FFD43B',
    field: '#FFF3B8',
    line: '#DCDCE0'
  }
  if (!el) return fallback
  const s = getComputedStyle(el)
  return {
    paper: s.getPropertyValue('--paper').trim() || fallback.paper,
    ink: s.getPropertyValue('--ink').trim() || fallback.ink,
    soft: s.getPropertyValue('--ink-soft').trim() || fallback.soft,
    accent: s.getPropertyValue('--accent').trim() || fallback.accent,
    field: s.getPropertyValue('--signal-field').trim() || fallback.field,
    line: s.getPropertyValue('--line').trim() || fallback.line
  }
}

function hexColor(css: string) {
  const c = new THREE.Color()
  try { c.set(css) } catch { c.set('#161618') }
  return c
}

function makeLabelTexture(
  lines: string[],
  opts: { w?: number; h?: number; fill?: string; ink?: string; size?: number; weight?: string } = {}
) {
  const w = opts.w ?? 512
  const h = opts.h ?? 256
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  texCanvases.push(canvas)
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, w, h)
  const fill = opts.fill
  if (fill) {
    ctx.fillStyle = fill
    roundRect(ctx, 8, 8, w - 16, h - 16, 28)
    ctx.fill()
  }
  ctx.fillStyle = opts.ink ?? '#161618'
  ctx.font = `${opts.weight ?? '700'} ${opts.size ?? 42}px "IBM Plex Mono", ui-monospace, monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const lineH = (opts.size ?? 42) * 1.25
  const startY = h / 2 - ((lines.length - 1) * lineH) / 2
  lines.forEach((line, i) => ctx.fillText(line, w / 2, startY + i * lineH))
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  disposables.push(tex)
  return tex
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function makeIconTexture(kind: 'key' | 'claw' | 'snow' | 'shovel' | 'chicken' | 'cross') {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  texCanvases.push(canvas)
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  const ink = '#161618'
  const accent = '#FFD43B'
  ctx.strokeStyle = ink
  ctx.fillStyle = ink
  ctx.lineWidth = 10
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (kind === 'cross') {
    ctx.beginPath()
    ctx.moveTo(128, 56); ctx.lineTo(128, 200)
    ctx.moveTo(56, 128); ctx.lineTo(200, 128)
    ctx.stroke()
  } else if (kind === 'key') {
    ctx.beginPath()
    ctx.arc(100, 128, 36, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(136, 128); ctx.lineTo(210, 128)
    ctx.moveTo(190, 128); ctx.lineTo(190, 150)
    ctx.moveTo(175, 128); ctx.lineTo(175, 145)
    ctx.stroke()
  } else if (kind === 'claw') {
    ctx.beginPath()
    ctx.moveTo(70, 170); ctx.quadraticCurveTo(90, 90, 128, 70)
    ctx.quadraticCurveTo(166, 90, 186, 170)
    ctx.stroke()
    for (const x of [90, 118, 146, 174]) {
      ctx.beginPath()
      ctx.moveTo(x, 168); ctx.lineTo(x + (x < 128 ? -8 : 8), 210)
      ctx.stroke()
    }
  } else if (kind === 'snow') {
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.moveTo(40, 190); ctx.lineTo(128, 70); ctx.lineTo(216, 190); ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = ink
    ctx.fillRect(118, 150, 20, 40)
    ctx.strokeRect(118, 150, 20, 40)
  } else if (kind === 'shovel') {
    ctx.beginPath()
    ctx.moveTo(128, 40); ctx.lineTo(128, 150)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(90, 150); ctx.lineTo(166, 150)
    ctx.lineTo(158, 210); ctx.lineTo(98, 210); ctx.closePath()
    ctx.fillStyle = accent
    ctx.fill(); ctx.stroke()
  } else if (kind === 'chicken') {
    ctx.beginPath()
    ctx.arc(120, 120, 48, 0, Math.PI * 2)
    ctx.fillStyle = accent
    ctx.fill(); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(160, 110); ctx.lineTo(200, 100); ctx.lineTo(160, 130)
    ctx.closePath(); ctx.fill(); ctx.stroke()
    ctx.beginPath()
    ctx.arc(108, 110, 6, 0, Math.PI * 2); ctx.fillStyle = ink; ctx.fill()
    ctx.beginPath()
    ctx.moveTo(100, 165); ctx.lineTo(90, 210)
    ctx.moveTo(130, 165); ctx.lineTo(140, 210)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  disposables.push(tex)
  return tex
}

function spriteMat(tex: THREE.Texture, opacity = 1) {
  const m = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide
  })
  disposables.push(m)
  return m
}

function solidMat(color: THREE.Color, opts: { opacity?: number; metal?: number; rough?: number } = {}) {
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.rough ?? 0.72,
    metalness: opts.metal ?? 0.05,
    transparent: (opts.opacity ?? 1) < 1,
    opacity: opts.opacity ?? 1
  })
  disposables.push(m)
  return m
}

function webglSupported() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

function buildScene() {
  const colors = cssVars()
  const ink = hexColor(colors.ink)
  const paper = hexColor(colors.paper)
  const accent = hexColor(colors.accent)
  const field = hexColor(colors.field)
  const soft = hexColor(colors.soft)

  scene = new THREE.Scene()
  scene.background = paper.clone()

  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(0, 1.15, 6.4)
  camera.lookAt(0, 0.15, 0)

  const amb = new THREE.AmbientLight(0xffffff, 0.78)
  scene.add(amb)
  const key = new THREE.DirectionalLight(0xffffff, 0.75)
  key.position.set(3, 6, 4)
  scene.add(key)
  const fill = new THREE.DirectionalLight(accent.getHex(), 0.35)
  fill.position.set(-4, 2, 2)
  scene.add(fill)

  // Desk / stage plate
  const deskGeo = new THREE.BoxGeometry(5.6, 0.12, 2.8)
  disposables.push(deskGeo)
  const desk = new THREE.Mesh(deskGeo, solidMat(field, { rough: 0.9 }))
  desk.position.set(0, -1.35, 0.2)
  scene.add(desk)

  // Monitor body
  const monGeo = new THREE.BoxGeometry(3.4, 2.05, 0.14)
  disposables.push(monGeo)
  const mon = new THREE.Mesh(monGeo, solidMat(ink, { rough: 0.55, metal: 0.15 }))
  mon.position.set(0, 0.55, -0.85)
  scene.add(mon)

  // Screen face
  const screenGeo = new THREE.PlaneGeometry(3.05, 1.75)
  disposables.push(screenGeo)
  const screen = new THREE.Mesh(screenGeo, solidMat(paper, { rough: 1 }))
  screen.position.set(0, 0.55, -0.77)
  scene.add(screen)

  // Fixation cross
  const crossGeo = new THREE.PlaneGeometry(0.42, 0.42)
  disposables.push(crossGeo)
  const cross = new THREE.Mesh(crossGeo, spriteMat(makeIconTexture('cross')))
  cross.position.set(0, 0.55, -0.76)
  scene.add(cross)

  // Field labels on screen
  const lvTex = makeLabelTexture(['LEFT FIELD'], { w: 420, h: 96, size: 36, ink: colors.soft })
  const rvTex = makeLabelTexture(['RIGHT FIELD'], { w: 420, h: 96, size: 36, ink: colors.soft })
  const lvGeo = new THREE.PlaneGeometry(1.15, 0.26)
  const rvGeo = new THREE.PlaneGeometry(1.15, 0.26)
  disposables.push(lvGeo, rvGeo)
  const lv = new THREE.Mesh(lvGeo, spriteMat(lvTex, 0.85))
  const rv = new THREE.Mesh(rvGeo, spriteMat(rvTex, 0.85))
  lv.position.set(-0.95, 1.2, -0.76)
  rv.position.set(0.95, 1.2, -0.76)
  scene.add(lv, rv)

  // Flash icons on screen
  const iconGeo = new THREE.PlaneGeometry(0.7, 0.7)
  disposables.push(iconGeo)
  const keyMesh = new THREE.Mesh(iconGeo, spriteMat(makeIconTexture('key'), 0))
  keyMesh.position.set(-0.95, 0.55, -0.75)
  const clawMesh = new THREE.Mesh(iconGeo.clone(), spriteMat(makeIconTexture('claw'), 0))
  clawMesh.position.set(0.95, 0.55, -0.75)
  const snowMesh = new THREE.Mesh(iconGeo.clone(), spriteMat(makeIconTexture('snow'), 0))
  snowMesh.position.set(-0.95, 0.55, -0.75)
  scene.add(keyMesh, clawMesh, snowMesh)

  // Brain halves: RH under left field, LH under right field (visual-field routing).
  const halfGeo = new THREE.SphereGeometry(0.52, 28, 20)
  disposables.push(halfGeo)
  const rhMat = solidMat(ink.clone().lerp(accent, 0.15), { rough: 0.65 })
  const lhMat = solidMat(ink.clone().lerp(paper, 0.12), { rough: 0.65 })
  const rhHalf = new THREE.Mesh(halfGeo, rhMat)
  const lhHalf = new THREE.Mesh(halfGeo.clone(), lhMat)
  rhHalf.scale.set(0.85, 1.1, 1)
  lhHalf.scale.set(0.85, 1.1, 1)
  rhHalf.position.set(-0.78, -0.55, 0.55)
  lhHalf.position.set(0.78, -0.55, 0.55)
  scene.add(rhHalf, lhHalf)

  // Cut callosum glow (gap between halves)
  const cutGeo = new THREE.BoxGeometry(0.08, 0.7, 0.55)
  disposables.push(cutGeo)
  const cutGlow = new THREE.Mesh(cutGeo, solidMat(accent, { opacity: 0.95, rough: 0.4 }))
  cutGlow.position.set(0, -0.5, 0.55)
  scene.add(cutGlow)

  // Hemisphere labels
  const rhLab = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.28),
    spriteMat(makeLabelTexture(['RIGHT HALF'], { w: 400, h: 100, size: 34, ink: colors.ink }))
  )
  disposables.push(rhLab.geometry)
  rhLab.position.set(-0.72, -1.05, 0.9)
  const lhLab = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.28),
    spriteMat(makeLabelTexture(['LEFT HALF'], { w: 400, h: 100, size: 34, ink: colors.ink }))
  )
  disposables.push(lhLab.geometry)
  lhLab.position.set(0.72, -1.05, 0.9)
  const speechLab = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.22),
    spriteMat(makeLabelTexture(['SPEECH'], { w: 320, h: 80, size: 32, fill: colors.accent, ink: colors.ink }))
  )
  disposables.push(speechLab.geometry)
  speechLab.position.set(0.72, -0.15, 0.95)
  scene.add(rhLab, lhLab, speechLab)

  // Routing paths: left field → RH, right field → LH
  const mkPath = (pts: THREE.Vector3[]) => {
    const g = new THREE.BufferGeometry().setFromPoints(pts)
    disposables.push(g)
    const m = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0 })
    disposables.push(m)
    return new THREE.Line(g, m)
  }
  const pathLeft = mkPath([
    new THREE.Vector3(-0.95, 0.55, -0.7),
    new THREE.Vector3(-1.15, 0.05, -0.1),
    new THREE.Vector3(-0.72, -0.35, 0.45)
  ])
  const pathRight = mkPath([
    new THREE.Vector3(0.95, 0.55, -0.7),
    new THREE.Vector3(1.15, 0.05, -0.1),
    new THREE.Vector3(0.72, -0.35, 0.45)
  ])
  scene.add(pathLeft, pathRight)

  // Hands
  const handGeo = new THREE.SphereGeometry(0.16, 16, 16)
  disposables.push(handGeo)
  const leftHand = new THREE.Group()
  const rightHand = new THREE.Group()
  const lhPalm = new THREE.Mesh(handGeo, solidMat(ink))
  const rhPalm = new THREE.Mesh(handGeo, solidMat(ink))
  leftHand.add(lhPalm)
  rightHand.add(rhPalm)
  leftHand.position.set(-1.55, -1.05, 1.15)
  rightHand.position.set(1.55, -1.05, 1.15)
  scene.add(leftHand, rightHand)

  const handL = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.22),
    spriteMat(makeLabelTexture(['LEFT HAND'], { w: 320, h: 80, size: 30, ink: colors.soft }))
  )
  disposables.push(handL.geometry)
  handL.position.set(-1.55, -1.35, 1.2)
  const handR = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.22),
    spriteMat(makeLabelTexture(['RIGHT HAND'], { w: 340, h: 80, size: 30, ink: colors.soft }))
  )
  disposables.push(handR.geometry)
  handR.position.set(1.55, -1.35, 1.2)
  scene.add(handL, handR)

  // Choice cards near hands
  const cardGeo = new THREE.PlaneGeometry(0.55, 0.55)
  disposables.push(cardGeo)
  const pickKey = new THREE.Mesh(cardGeo, spriteMat(makeIconTexture('key'), 0))
  pickKey.position.set(-1.55, -0.7, 1.25)
  const pickShovel = new THREE.Mesh(cardGeo.clone(), spriteMat(makeIconTexture('shovel'), 0))
  pickShovel.position.set(-1.55, -0.7, 1.25)
  const pickChicken = new THREE.Mesh(cardGeo.clone(), spriteMat(makeIconTexture('chicken'), 0))
  pickChicken.position.set(1.55, -0.7, 1.25)
  scene.add(pickKey, pickShovel, pickChicken)

  // Speech bubbles
  const nothingTex = makeLabelTexture(['“Nothing.”'], {
    w: 480, h: 140, size: 44, fill: colors.paper, ink: colors.ink
  })
  const shedTex = makeLabelTexture(['“Chicken shed.”'], {
    w: 520, h: 140, size: 40, fill: colors.accent, ink: colors.ink
  })
  const bubGeo = new THREE.PlaneGeometry(1.35, 0.4)
  disposables.push(bubGeo)
  const speechNothing = new THREE.Mesh(bubGeo, spriteMat(nothingTex, 0))
  speechNothing.position.set(1.55, 0.35, 1.0)
  const speechShed = new THREE.Mesh(bubGeo.clone(), spriteMat(shedTex, 0))
  speechShed.position.set(1.55, 0.35, 1.0)
  scene.add(speechNothing, speechShed)

  // Soft pulse ring on screen during flashes
  const ringGeo = new THREE.RingGeometry(0.55, 0.68, 40)
  disposables.push(ringGeo)
  const pulseRing = new THREE.Mesh(
    ringGeo,
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, side: THREE.DoubleSide })
  )
  disposables.push(pulseRing.material)
  pulseRing.position.set(0, 0.55, -0.74)
  scene.add(pulseRing)

  // Cut label
  const cutLab = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 0.24),
    spriteMat(makeLabelTexture(['CUT CALLOSUM'], { w: 420, h: 90, size: 30, fill: colors.accent, ink: colors.ink }))
  )
  disposables.push(cutLab.geometry)
  cutLab.position.set(0, -0.95, 0.95)
  scene.add(cutLab)

  nodes = {
    keyMesh, clawMesh, snowMesh,
    rhHalf, lhHalf, cutGlow,
    pathLeft, pathRight,
    leftHand, rightHand,
    pickKey, pickShovel, pickChicken,
    speechNothing, speechShed,
    pulseRing
  }
}

function applyPoseImmediate(p: Pose) {
  Object.assign(live, p)
  targetPose = { ...p }
  paintPose(1)
}

function paintPose(flashPulse = 0) {
  if (!nodes) return
  const setOp = (mesh: THREE.Mesh, op: number) => {
    const m = mesh.material as THREE.MeshBasicMaterial
    m.opacity = Math.max(0, Math.min(1, op))
  }

  setOp(nodes.keyMesh, live.keyFlash)
  setOp(nodes.clawMesh, live.clawFlash)
  // snow shares left slot with key — prefer snow when both requested
  const snowOp = live.snowFlash
  const keyOp = live.snowFlash > 0.05 ? 0 : live.keyFlash
  setOp(nodes.keyMesh, keyOp)
  setOp(nodes.snowMesh, snowOp)

  setOp(nodes.pickKey, live.leftPick === 'key' ? 1 : 0)
  setOp(nodes.pickShovel, live.leftPick === 'shovel' ? 1 : 0)
  setOp(nodes.pickChicken, live.rightPick === 'chicken' ? 1 : 0)
  setOp(nodes.speechNothing, live.speech === 'nothing' ? 1 : 0)
  setOp(nodes.speechShed, live.speech === 'shed' ? 1 : 0)

  ;(nodes.pathLeft.material as THREE.LineBasicMaterial).opacity = live.pathLeft * 0.85
  ;(nodes.pathRight.material as THREE.LineBasicMaterial).opacity = live.pathRight * 0.85

  const rhMat = nodes.rhHalf.material as THREE.MeshStandardMaterial
  const lhMat = nodes.lhHalf.material as THREE.MeshStandardMaterial
  const colors = cssVars()
  const ink = hexColor(colors.ink)
  const accent = hexColor(colors.accent)
  const paper = hexColor(colors.paper)
  rhMat.color.copy(ink.clone().lerp(accent, 0.1 + live.highlightRh * 0.55))
  lhMat.color.copy(ink.clone().lerp(paper, 0.08).lerp(accent, live.highlightLh * 0.5))
  rhMat.emissive.copy(accent).multiplyScalar(live.highlightRh * 0.18)
  lhMat.emissive.copy(accent).multiplyScalar(live.highlightLh * 0.18)

  // Hand lift when picking
  nodes.leftHand.position.y = -1.05 + (live.leftPick !== 'none' ? 0.22 : 0)
  nodes.rightHand.position.y = -1.05 + (live.rightPick !== 'none' ? 0.22 : 0)

  const pulse = Math.max(live.keyFlash, live.clawFlash, live.snowFlash)
  const ringMat = nodes.pulseRing.material as THREE.MeshBasicMaterial
  ringMat.opacity = pulse * 0.35 * (0.55 + 0.45 * flashPulse)
  const s = 1 + pulse * 0.35 * flashPulse
  nodes.pulseRing.scale.set(s, s, 1)
  // Place pulse near active flash
  if (live.keyFlash > 0.2 || live.snowFlash > 0.2) nodes.pulseRing.position.x = -0.95
  else if (live.clawFlash > 0.2) nodes.pulseRing.position.x = 0.95
  else nodes.pulseRing.position.x = 0
}

function lerpPose(dt: number) {
  const k = reducedMotion.value ? 1 : Math.min(1, dt * 3.2)
  const n = (a: number, b: number) => a + (b - a) * k
  live.keyFlash = n(live.keyFlash, targetPose.keyFlash)
  live.clawFlash = n(live.clawFlash, targetPose.clawFlash)
  live.snowFlash = n(live.snowFlash, targetPose.snowFlash)
  live.highlightRh = n(live.highlightRh, targetPose.highlightRh)
  live.highlightLh = n(live.highlightLh, targetPose.highlightLh)
  live.pathLeft = n(live.pathLeft, targetPose.pathLeft)
  live.pathRight = n(live.pathRight, targetPose.pathRight)
  // Discrete labels switch with the step (not per-frame k, which stays small).
  live.speech = targetPose.speech
  live.leftPick = targetPose.leftPick
  live.rightPick = targetPose.rightPick
}

function frame() {
  if (!renderer || !scene || !camera || !clock) return
  const dt = Math.min(0.05, clock.getDelta())
  const t = clock.elapsedTime
  lerpPose(dt)
  const pulse = reducedMotion.value ? 1 : 0.5 + 0.5 * Math.sin(t * 3.2)
  paintPose(pulse)
  if (!reducedMotion.value && camera) {
    camera.position.x = Math.sin(t * 0.25) * 0.08
    camera.lookAt(0, 0.15, 0)
  }
  renderer.render(scene, camera)
  raf = requestAnimationFrame(frame)
}

function resize() {
  if (!wrapRef.value || !renderer || !camera) return
  const rect = wrapRef.value.querySelector('.sbl__stage')?.getBoundingClientRect()
  const w = Math.max(280, rect?.width ?? wrapRef.value.clientWidth)
  const h = Math.max(220, Math.round(w * 0.62))
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.setSize(w, h, false)
}

function go(i: number) {
  const next = Math.max(0, Math.min(STEPS.length - 1, i))
  stepIndex.value = next
  targetPose = { ...STEPS[next]!.pose }
  if (reducedMotion.value) applyPoseImmediate(targetPose)
}

function next() { if (canNext.value) go(stepIndex.value + 1) }
function back() { if (canBack.value) go(stepIndex.value - 1) }
function restart() { go(0); applyPoseImmediate(STEPS[0]!.pose) }

function disposeAll() {
  cancelAnimationFrame(raf)
  resizeObs?.disconnect()
  resizeObs = null
  for (const d of disposables) {
    try { d.dispose() } catch { /* noop */ }
  }
  disposables.length = 0
  if (scene) {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.geometry) mesh.geometry.dispose?.()
    })
  }
  renderer?.dispose()
  renderer = null
  scene = null
  camera = null
  clock = null
  nodes = null
  texCanvases.length = 0
}

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!webglSupported() || !canvasRef.value || !wrapRef.value) {
    webglFail.value = true
    return
  }
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.value,
      antialias: true,
      alpha: false,
      powerPreference: 'low-power'
    })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    buildScene()
    clock = new THREE.Clock()
    applyPoseImmediate(STEPS[0]!.pose)
    resize()
    resizeObs = new ResizeObserver(() => resize())
    const stage = wrapRef.value.querySelector('.sbl__stage')
    if (stage) resizeObs.observe(stage)
    else resizeObs.observe(wrapRef.value)
    raf = requestAnimationFrame(frame)
  } catch (err) {
    console.warn('[SplitBrainLab] WebGL init failed', err)
    webglFail.value = true
    disposeAll()
  }
})

onBeforeUnmount(() => {
  disposeAll()
})

watch(stepIndex, () => {
  targetPose = { ...step.value.pose }
  if (reducedMotion.value) applyPoseImmediate(targetPose)
})
</script>

<template>
  <section
    ref="wrapRef"
    class="sbl"
    aria-label="Split-brain experiment lab"
  >
    <div class="sbl__labels" aria-hidden="true">
      <span class="sbl__tag">{{ step.tag }}</span>
      <span class="sbl__tag sbl__tag--muted">{{ stepLabel }}</span>
    </div>

    <div class="sbl__stage">
      <canvas
        v-show="!webglFail"
        ref="canvasRef"
        class="sbl__canvas"
        role="img"
        :aria-label="step.caption"
      />
      <div v-if="webglFail" class="sbl__fallback" role="img" :aria-label="step.caption">
        <p class="sbl__fallback-title">Split-brain lab</p>
        <ol class="sbl__fallback-list">
          <li>Left of the cross goes to the right half. That half moves the left hand.</li>
          <li>Right of the cross goes to the left half. That half talks and moves the right hand.</li>
          <li>Key on the left: the mouth says nothing. The left hand still finds the key.</li>
          <li>Claw on the right and snow on the left: right hand picks chicken. Left hand picks shovel.</li>
          <li>The mouth invents a chicken-shed story so the shovel still fits.</li>
        </ol>
        <p class="sbl__fallback-now">{{ step.caption }}</p>
      </div>
    </div>

    <div class="sbl__foot">
      <p class="sbl__caption">{{ step.caption }}</p>
      <p class="sbl__hint">{{ step.hint }}</p>
      <div class="sbl__actions">
        <button type="button" class="sbl__btn sbl__btn--ghost" :disabled="!canBack" @click="back">
          Back
        </button>
        <button
          v-if="canNext"
          type="button"
          class="sbl__btn"
          @click="next"
        >
          Next
        </button>
        <button
          v-else
          type="button"
          class="sbl__btn"
          @click="restart"
        >
          Restart
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sbl {
  position: relative;
  margin: 48rem 0 58rem;
  padding: 18rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  background: var(--paper-2);
}
.sbl__labels {
  display: flex;
  flex-wrap: wrap;
  gap: 8rem;
  margin-bottom: 12rem;
}
.sbl__tag {
  display: inline-flex;
  align-items: center;
  min-height: 28rem;
  padding: 0 12rem;
  border-radius: var(--radius-full);
  font: 700 11rem/1 var(--font-mono);
  letter-spacing: .07em;
  text-transform: uppercase;
  background: var(--ink);
  color: var(--paper);
  border: var(--stroke) solid var(--ink);
}
.sbl__tag--muted {
  background: transparent;
  color: var(--ink-soft);
  border: var(--stroke) dashed var(--line);
}
.sbl__stage {
  border: var(--stroke) solid var(--ink);
  border-radius: calc(var(--radius-m) - 4rem);
  overflow: hidden;
  background: var(--paper);
  min-height: 220rem;
}
.sbl__canvas {
  display: block;
  width: 100%;
  height: auto;
}
.sbl__fallback {
  padding: clamp(18rem, 4vw, 28rem);
  background: var(--signal-field);
  color: var(--ink);
  min-height: 220rem;
}
.sbl__fallback-title {
  margin: 0 0 12rem;
  font: 700 12rem/1.2 var(--font-mono);
  letter-spacing: .07em;
  text-transform: uppercase;
}
.sbl__fallback-list {
  margin: 0;
  padding-left: 1.2em;
  font: 400 15rem/1.45 var(--font-body);
}
.sbl__fallback-list li + li { margin-top: 8rem; }
.sbl__fallback-now {
  margin: 18rem 0 0;
  padding-top: 14rem;
  border-top: var(--stroke) solid var(--ink);
  font: 500 clamp(18rem, 2vw, 22rem)/1.25 var(--font-display);
  letter-spacing: -.03em;
}
.sbl__foot {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4rem 16rem;
  align-items: start;
  margin-top: 14rem;
}
.sbl__caption {
  margin: 0;
  grid-column: 1;
  font: 500 clamp(18rem, 2vw, 24rem)/1.2 var(--font-display);
  letter-spacing: -.03em;
}
.sbl__hint {
  margin: 0;
  grid-column: 1;
  color: var(--ink-soft);
  font: 400 13rem/1.4 var(--font-mono);
}
.sbl__actions {
  grid-column: 2;
  grid-row: 1 / span 2;
  align-self: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8rem;
  justify-content: flex-end;
}
.sbl__btn {
  appearance: none;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-full);
  background: var(--accent);
  color: var(--accent-ink);
  font: 700 11rem/1 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
  min-height: 40rem;
  padding: 0 16rem;
  cursor: pointer;
}
.sbl__btn--ghost {
  background: transparent;
  color: var(--ink);
}
.sbl__btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.sbl__btn:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}
@media (max-width: 640px) {
  .sbl { padding: 12rem; margin: 36rem 0 48rem; }
  .sbl__foot { grid-template-columns: 1fr; }
  .sbl__actions {
    grid-column: 1;
    grid-row: auto;
    justify-content: flex-start;
    margin-top: 8rem;
  }
}
</style>
