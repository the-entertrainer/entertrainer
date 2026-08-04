<script setup lang="ts">
import * as THREE from 'three'

// Ambient 3D backdrop for the immersive modules: a slow drift of soft, lit
// spheres in fog, tinted to each module's palette. Deliberately subtle so
// content can sit sparse and legible on top of it.
//
// This is the native path. The wrapper is structured so a Spline scene could
// replace the three.js scene later without touching the modules: swap what
// happens inside init()/animate() and keep the same fallback ladder.

const props = withDefaults(defineProps<{
  colors: string[]   // sphere tints
  bg: string         // fog + fallback base colour
  count?: number     // sphere count on desktop (auto-reduced on small screens)
}>(), { count: 24 })

const host = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const useFallback = ref(false)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let group: THREE.Group | null = null
let raf = 0
let running = false
let reduceMotion = false
const meshes: { m: THREE.Mesh; baseY: number; baseX: number; amp: number; speed: number; phase: number }[] = []
const geometries: THREE.SphereGeometry[] = []
const materials: THREE.Material[] = []
const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
let clock: THREE.Clock | null = null

function webglSupported(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch { return false }
}

// A calm static gradient built from the palette, for no-WebGL devices.
const fallbackStyle = computed(() => {
  const [a = props.bg, b = props.bg, c = props.bg] = props.colors
  return {
    background: `radial-gradient(80% 60% at 22% 18%, ${a}22, transparent 60%),`
      + `radial-gradient(70% 60% at 85% 88%, ${b}22, transparent 55%),`
      + `radial-gradient(60% 50% at 60% 40%, ${c}18, transparent 60%),`
      + props.bg
  }
})

function sizeOf() {
  const el = host.value!
  return { w: el.clientWidth, h: el.clientHeight }
}

function init() {
  if (!canvas.value || !host.value) return
  const { w, h } = sizeOf()

  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(new THREE.Color(props.bg), 9, 26)

  camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100)
  camera.position.set(0, 0, 15)

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.setSize(w, h)

  scene.add(new THREE.AmbientLight(0xffffff, 0.55))
  const key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(5, 8, 6); scene.add(key)
  const fill = new THREE.PointLight(new THREE.Color(props.colors[0] || 0xffffff), 0.6, 40); fill.position.set(-8, -4, 6); scene.add(fill)

  group = new THREE.Group()
  scene.add(group)

  // Share a couple of geometries across all spheres.
  const geoA = new THREE.SphereGeometry(1, 32, 32)
  const geoB = new THREE.SphereGeometry(1, 20, 20)
  geometries.push(geoA, geoB)

  const palette = props.colors.map(c => new THREE.Color(c))
  const small = Math.min(window.innerWidth, window.innerHeight) < 720
  const n = small ? Math.round((props.count ?? 24) * 0.6) : (props.count ?? 24)

  for (let i = 0; i < n; i++) {
    const col = palette[i % palette.length]
    const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.62, metalness: 0.08 })
    materials.push(mat)
    const m = new THREE.Mesh(i % 3 === 0 ? geoA : geoB, mat)
    const r = 0.35 + Math.random() * 1.5
    m.scale.setScalar(r)
    const baseX = (Math.random() - 0.5) * 20
    const baseY = (Math.random() - 0.5) * 13
    m.position.set(baseX, baseY, -7 + Math.random() * 11)
    group.add(m)
    meshes.push({ m, baseX, baseY, amp: 0.3 + Math.random() * 0.7, speed: 0.15 + Math.random() * 0.35, phase: Math.random() * Math.PI * 2 })
  }

  clock = new THREE.Clock()
  renderer.render(scene, camera) // paint first frame immediately
}

function frame() {
  if (!renderer || !scene || !camera || !group || !clock) return
  const t = clock.getElapsedTime()
  for (const s of meshes) {
    s.m.position.y = s.baseY + Math.sin(t * s.speed + s.phase) * s.amp
    s.m.position.x = s.baseX + Math.cos(t * s.speed * 0.6 + s.phase) * s.amp * 0.4
  }
  group.rotation.y += 0.0006
  pointer.x += (pointer.tx - pointer.x) * 0.04
  pointer.y += (pointer.ty - pointer.y) * 0.04
  camera.position.x = pointer.x * 1.6
  camera.position.y = pointer.y * 1.0
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
  if (running) raf = requestAnimationFrame(frame)
}

function start() { if (!running && !reduceMotion) { running = true; raf = requestAnimationFrame(frame) } }
function stop() { running = false; cancelAnimationFrame(raf) }

function onResize() {
  if (!renderer || !camera || !host.value) return
  const { w, h } = sizeOf()
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
  if (!running) renderer.render(scene!, camera)
}
function onPointer(e: PointerEvent) {
  if (reduceMotion) return
  pointer.tx = (e.clientX / window.innerWidth - 0.5)
  pointer.ty = -(e.clientY / window.innerHeight - 0.5)
}
function onVisibility() { if (document.hidden) stop(); else start() }

onMounted(() => {
  if (!webglSupported()) { useFallback.value = true; return }
  reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  try {
    init()
  } catch (err) {
    console.warn('[Backdrop3d] init failed, using gradient fallback', err)
    useFallback.value = true
    return
  }
  window.addEventListener('resize', onResize)
  window.addEventListener('pointermove', onPointer, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  start()
})

onBeforeUnmount(() => {
  stop()
  window.removeEventListener('resize', onResize)
  window.removeEventListener('pointermove', onPointer)
  document.removeEventListener('visibilitychange', onVisibility)
  geometries.forEach(g => g.dispose())
  materials.forEach(m => m.dispose())
  renderer?.dispose()
  renderer = null; scene = null; camera = null; group = null; clock = null
  meshes.length = 0; geometries.length = 0; materials.length = 0
})
</script>

<template>
  <div ref="host" class="bd3d" aria-hidden="true">
    <div v-if="useFallback" class="bd3d__fallback" :style="fallbackStyle" />
    <canvas v-else ref="canvas" class="bd3d__canvas" />
  </div>
</template>

<style scoped>
.bd3d { position: fixed; inset: 0; z-index: 0; overflow: hidden; }
.bd3d__canvas, .bd3d__fallback { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
</style>
