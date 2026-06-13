<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useReducedMotion } from '~/composables/useReducedMotion'
import { useGsap } from '~/composables/useGsap'

const canvas = ref<HTMLCanvasElement | null>(null)
const motion = useReducedMotion()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let renderer: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let scene: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cameraObj: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let points: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let geometry: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let material: any = null
let tickerFn: (() => void) | null = null
let pointerX = 0
let pointerY = 0

function onPointer(e: MouseEvent) {
  pointerX = (e.clientX / window.innerWidth - 0.5)
  pointerY = (e.clientY / window.innerHeight - 0.5)
}

onMounted(async () => {
  // Respect capability gates — render nothing heavy on low-end / reduced motion.
  if (!motion.enableThree.value) return

  // Defer the heavy import until the browser is idle so it never blocks paint.
  await new Promise<void>((res) => {
    const ric = (window as any).requestIdleCallback
    ric ? ric(() => res(), { timeout: 1200 }) : setTimeout(res, 600)
  })

  const THREE = await import('three')
  const el = canvas.value
  if (!el) return

  const count = motion.deviceTier.value === 'high' ? 3000 : 1200
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x05060f, 0.035)

  cameraObj = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100)
  cameraObj.position.z = 14

  // Two-tone neon particle cloud (cyan ↔ magenta) via per-vertex colours.
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const cyan = new THREE.Color(0x00f0ff)
  const magenta = new THREE.Color(0xff2bd6)
  const violet = new THREE.Color(0x9b5cff)

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40
    positions[i * 3 + 1] = (Math.random() - 0.5) * 26
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30
    const pick = Math.random()
    const c = pick < 0.4 ? cyan : pick < 0.75 ? magenta : violet
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }

  geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  material = new THREE.PointsMaterial({
    size: 0.09,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  points = new THREE.Points(geometry, material)
  scene.add(points)

  renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true })
  renderer.setPixelRatio(dpr)
  renderer.setSize(window.innerWidth, window.innerHeight)

  window.addEventListener('mousemove', onPointer, { passive: true })
  window.addEventListener('resize', onWindowResize, { passive: true })

  // Share the single GSAP ticker rather than spawning a second rAF loop.
  const { gsap } = useGsap()
  tickerFn = () => {
    if (document.hidden) return
    points.rotation.y += 0.0006
    points.rotation.x += 0.0002
    // Subtle parallax toward the pointer.
    cameraObj.position.x += (pointerX * 3 - cameraObj.position.x) * 0.03
    cameraObj.position.y += (-pointerY * 2 - cameraObj.position.y) * 0.03
    cameraObj.lookAt(scene.position)
    renderer.render(scene, cameraObj)
  }
  gsap.ticker.add(tickerFn)
})

function onWindowResize() {
  if (!renderer || !cameraObj) return
  cameraObj.aspect = window.innerWidth / window.innerHeight
  cameraObj.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

onBeforeUnmount(() => {
  if (tickerFn) {
    try { useGsap().gsap.ticker.remove(tickerFn) } catch { /* plugin gone */ }
  }
  window.removeEventListener('mousemove', onPointer)
  window.removeEventListener('resize', onWindowResize)
  geometry?.dispose()
  material?.dispose()
  renderer?.dispose()
  renderer = scene = cameraObj = points = geometry = material = null
})
</script>

<template>
  <div class="three-bg" aria-hidden="true">
    <canvas ref="canvas" class="three-bg__canvas" />
  </div>
</template>

<style scoped>
.three-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}
.three-bg__canvas { width: 100%; height: 100%; display: block; }
</style>
