<script setup lang="ts">
import * as THREE from 'three'
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Immersive Gallery — Lab', robots: 'noindex' })

const cv = ref<HTMLCanvasElement | null>(null)
const active = ref(0)
const N = LAB_NAV.length
const router = useRouter()

// ── Precisely-coded momentum physics ──────────────────────────────
let pos = 0, vel = 0, goal: number | null = null
let dragging = false, dragged = false, downX = 0, basePos = 0, lastX = 0, lastT = 0

let renderer: THREE.WebGLRenderer, scene: THREE.Scene, cam: THREE.PerspectiveCamera
const cards: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; aspect: number }[] = []
const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2()
let raf = 0, tPrev = 0
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

// Layout constants — tuned so the centre card is full & sharp and neighbours
// tuck back in real depth (coverflow "river").
const H = 2.15, SPACING = 2.3, DEPTH = 1.55, TILT = 0.62, MAXT = 0.9, YLIFT = 0.5
const DRAGPX = 240

function themeColor(varName: string, fallback: number) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  try { return new THREE.Color(v || '#000').getHex() } catch { return fallback }
}

function tick(now: number) {
  const dt = tPrev ? Math.min((now - tPrev) / 16.67, 2) : 1; tPrev = now
  if (dragging) { /* pos set on move */ }
  else if (goal !== null) { pos += (goal - pos) * 0.14 * dt; vel = 0; if (Math.abs(goal - pos) < 0.001) { pos = goal; goal = null } }
  else {
    pos += vel * dt; vel *= Math.pow(0.92, dt)
    pos = clamp(pos, 0, N - 1)
    if (Math.abs(vel) < 0.016) { const t = Math.round(pos); pos += (t - pos) * 0.12 * dt }
  }
  pos = clamp(pos, 0, N - 1)
  const t = now / 1000
  cards.forEach((c, i) => {
    const a = i - pos
    const s = 1 - Math.min(Math.abs(a), 3) * 0.05
    c.mesh.position.set(a * SPACING, YLIFT + Math.sin(t * 0.6 + i) * 0.03, -Math.abs(a) * DEPTH)
    c.mesh.rotation.y = clamp(-a * TILT, -MAXT, MAXT)
    c.mesh.scale.set(c.aspect * H * s, H * s, 1)
    c.mat.opacity = clamp(1 - Math.abs(a) * 0.16, 0, 1)
    c.mesh.renderOrder = 100 - Math.round(Math.abs(a) * 10)
    c.mesh.visible = Math.abs(a) < 3.6
  })
  const ai = clamp(Math.round(pos), 0, N - 1)
  if (ai !== active.value) active.value = ai
  renderer.render(scene, cam)
  raf = requestAnimationFrame(tick)
}

function onDown(e: PointerEvent) { dragging = true; dragged = false; downX = lastX = e.clientX; basePos = pos; lastT = performance.now(); vel = 0; goal = null; (cv.value as HTMLElement).setPointerCapture(e.pointerId) }
function onMove(e: PointerEvent) {
  if (!dragging) return
  const now = performance.now(); const d = e.clientX - lastX
  if (Math.abs(e.clientX - downX) > 5) dragged = true
  pos = clamp(basePos - (e.clientX - downX) / DRAGPX, 0, N - 1)
  vel = clamp(-d / DRAGPX * (16 / Math.max(now - lastT, 8)), -0.6, 0.6)
  lastX = e.clientX; lastT = now
}
function onUp(e: PointerEvent) {
  if (!dragging) return; dragging = false
  if (!dragged) {
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1)
    ray.setFromCamera(ndc, cam)
    const hit = ray.intersectObjects(cards.map(c => c.mesh))[0]
    if (hit) { const i = cards.findIndex(c => c.mesh === hit.object); if (i === Math.round(pos)) router.push(LAB_NAV[i].href); else goal = i }
  }
}
let wlock = false
function onWheel(e: WheelEvent) { const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY; if (Math.abs(d) < 6 || wlock) return; wlock = true; goal = clamp(Math.round(pos) + (d > 0 ? 1 : -1), 0, N - 1); setTimeout(() => (wlock = false), 200) }
function onKey(e: KeyboardEvent) { if (e.key === 'ArrowRight') goal = clamp(Math.round(pos) + 1, 0, N - 1); else if (e.key === 'ArrowLeft') goal = clamp(Math.round(pos) - 1, 0, N - 1); else if (e.key === 'Enter') router.push(LAB_NAV[active.value].href) }

onMounted(() => {
  renderer = new THREE.WebGLRenderer({ canvas: cv.value!, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  scene = new THREE.Scene()
  const bg = themeColor('--color-bg', 0xf5efe8)
  scene.background = new THREE.Color(bg)
  scene.fog = new THREE.Fog(bg, 5.5, 13)
  cam = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100)
  cam.position.set(0, 0, 6.6)
  const geo = new THREE.PlaneGeometry(1, 1)
  const loader = new THREE.TextureLoader()
  LAB_NAV.forEach((item) => {
    const mat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: true })
    const mesh = new THREE.Mesh(geo, mat)
    const c = { mesh, mat, aspect: 16 / 9 }
    cards.push(c); scene.add(mesh)
    const tex = loader.load(item.img, (t) => { const im = t.image as HTMLImageElement; if (im?.width) c.aspect = im.width / im.height })
    tex.colorSpace = THREE.SRGBColorSpace; tex.minFilter = THREE.LinearFilter; mat.map = tex; mat.needsUpdate = true
  })
  const resize = () => { renderer.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix() }
  resize(); addEventListener('resize', resize); addEventListener('wheel', onWheel, { passive: true }); addEventListener('keydown', onKey)
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => { cancelAnimationFrame(raf); removeEventListener('wheel', onWheel); removeEventListener('keydown', onKey); renderer?.dispose() })
</script>

<template>
  <LabFrame n="01" name="Immersive Gallery" hint="swipe · fling · click">
    <canvas ref="cv" class="im__cv" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp" />
    <div class="im__ui">
      <span class="im__eyebrow">Naveen Jose — Instructional Designer</span>
      <Transition name="im" mode="out-in">
        <div :key="active" class="im__cap">
          <h1 class="im__label">{{ LAB_NAV[active].label }}</h1>
          <p class="im__desc">{{ LAB_NAV[active].desc }}</p>
          <button class="im__enter" @click="router.push(LAB_NAV[active].href)">Enter →</button>
        </div>
      </Transition>
    </div>
    <div class="im__idx" aria-hidden="true">
      <span>{{ String(active + 1).padStart(2, '0') }}</span><i>/</i><span>{{ String(N).padStart(2, '0') }}</span>
    </div>
  </LabFrame>
</template>

<style scoped>
.im__cv { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: grab; }
.im__cv:active { cursor: grabbing; }
.im__ui { position: absolute; left: 0; right: 0; bottom: clamp(48rem, 10vh, 96rem); text-align: center; pointer-events: none; padding: 0 24rem; }
.im__eyebrow { font-size: 12rem; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700; opacity: 0.55; }
.im__cap { margin-top: 10rem; }
.im__label { font-family: var(--serif); font-weight: 400; font-size: clamp(40rem, 6vw, 84rem); line-height: 1; letter-spacing: -0.02em; margin: 0; }
.im__desc { font-size: 14.5rem; opacity: 0.65; margin: 10rem auto 0; max-width: 44ch; }
.im__enter { pointer-events: auto; margin-top: 16rem; background: none; border: 1px solid var(--color-glass-border); border-radius: 999rem; padding: 10rem 22rem; color: var(--color-text); font-family: var(--serif); font-style: italic; font-size: 15rem; cursor: pointer; transition: background 0.2s ease, transform 0.2s ease; }
.im__enter:hover { background: var(--color-glass-bg); transform: translateY(-2rem); }
.im-enter-active, .im-leave-active { transition: opacity 0.3s ease, transform 0.45s cubic-bezier(.19,1,.22,1); }
.im-enter-from { opacity: 0; transform: translateY(16rem); }
.im-leave-to { opacity: 0; transform: translateY(-10rem); }
.im__idx { position: absolute; top: calc(20rem + var(--safe-top)); right: clamp(20rem, 5vw, 44rem); font-family: var(--serif); font-size: 15rem; opacity: 0.55; font-variant-numeric: tabular-nums; }
.im__idx i { font-style: normal; opacity: 0.4; margin: 0 4rem; }
</style>
