<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useReducedMotion } from '~/composables/useReducedMotion'
import { useGsap } from '~/composables/useGsap'
import { useScrollProgress } from '~/composables/useScrollProgress'
import { webglOK } from '~/utils/webgl'
import { buildExtrudedText, loadFont } from '~/utils/buildExtrudedText'

const canvas = ref<HTMLCanvasElement | null>(null)
const motion = useReducedMotion()
const scrollState = useScrollProgress(8)

let renderer: any = null
let scene: any = null
let camera: any = null
let heroMesh: any = null
let doorLeftMesh: any = null
let doorRightMesh: any = null
let tickerFn: (() => void) | null = null
let font: any = null

const canRender = computed(() => webglOK() && !motion.prefersReducedMotion.value)

onMounted(async () => {
  if (!canRender.value) return

  const el = canvas.value
  if (!el) return

  await new Promise<void>((res) => {
    const ric = (window as any).requestIdleCallback
    ric ? ric(() => res(), { timeout: 1200 }) : setTimeout(res, 600)
  })

  const THREE = await import('three')

  // Load font
  try {
    font = await loadFont('/fonts/helvetiker_bold.typeface.json')
  } catch (err) {
    console.warn('Font load failed, using fallback:', err)
    return
  }

  const w = window.innerWidth
  const h = window.innerHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  // Scene setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)
  scene.fog = new THREE.Fog(0xffffff, 100, 200)

  // Camera - responsive FOV for mobile vs desktop
  const vFOV = window.innerWidth < 768 ? 75 : 50
  camera = new THREE.PerspectiveCamera(vFOV, w / h, 0.1, 1000)
  camera.position.z = 0

  // Lighting - raking lights to carve text bevels on white background
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.8)
  keyLight.position.set(10, 10, 10)
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.3)
  rimLight.position.set(-10, -10, -10)
  scene.add(rimLight)

  scene.add(new THREE.AmbientLight(0xffffff, 0.5))

  // Hero word geometry - "entertrainer" split into left/right doors
  const heroGeometry = await buildExtrudedText('entertrainer', font, {
    size: window.innerWidth < 768 ? 0.8 : 1.2,
    height: 0.15,
    bevelEnabled: true,
    bevelThickness: 0.01,
  })

  const heroMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    metalness: 0.1,
    roughness: 0.8,
  })

  // Create left door (split geometry)
  const leftGeometry = new THREE.BufferGeometry()
  const positions = heroGeometry.getAttribute('position').array as Float32Array
  const indices = (heroGeometry.getIndex()?.array as Uint32Array) ||
                  new Uint32Array(Array.from({ length: (positions.length / 3) | 0 }, (_, i) => i))

  // Filter indices to left half (x < 0)
  const leftIndices = []
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i] * 3
    const i1 = indices[i + 1] * 3
    const i2 = indices[i + 2] * 3
    const x0 = positions[i0]
    const x1 = positions[i1]
    const x2 = positions[i2]
    if (x0 < 0 && x1 < 0 && x2 < 0) {
      leftIndices.push(indices[i], indices[i + 1], indices[i + 2])
    }
  }

  if (leftIndices.length > 0) {
    leftGeometry.setAttribute('position', heroGeometry.getAttribute('position'))
    leftGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(leftIndices), 1))
    doorLeftMesh = new THREE.Mesh(leftGeometry, heroMaterial)
    doorLeftMesh.position.z = 0
    scene.add(doorLeftMesh)
  }

  // Right door
  const rightGeometry = new THREE.BufferGeometry()
  const rightIndices = []
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i] * 3
    const i1 = indices[i + 1] * 3
    const i2 = indices[i + 2] * 3
    const x0 = positions[i0]
    const x1 = positions[i1]
    const x2 = positions[i2]
    if (x0 >= 0 && x1 >= 0 && x2 >= 0) {
      rightIndices.push(indices[i], indices[i + 1], indices[i + 2])
    }
  }

  if (rightIndices.length > 0) {
    rightGeometry.setAttribute('position', heroGeometry.getAttribute('position'))
    rightGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(rightIndices), 1))
    doorRightMesh = new THREE.Mesh(rightGeometry, heroMaterial)
    doorRightMesh.position.z = 0
    scene.add(doorRightMesh)
  }

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: el,
    antialias: true,
    alpha: false,
  })
  renderer.setPixelRatio(dpr)
  renderer.setSize(w, h)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const { gsap } = useGsap()

  tickerFn = () => {
    const progress = scrollState.value.progress

    // Camera dolly forward as scroll progresses
    const cameraZ = Math.max(0, -progress * 50)
    camera.position.z = cameraZ

    if (doorLeftMesh && doorRightMesh) {
      // Door opening animation - swing outward from center
      const doorRotation = progress * Math.PI * 0.25
      doorLeftMesh.rotation.y = -doorRotation
      doorRightMesh.rotation.y = doorRotation
    }

    renderer.render(scene, camera)
  }

  gsap.ticker.add(tickerFn)

  window.addEventListener('resize', onWindowResize)
})

function onWindowResize() {
  if (!renderer || !camera) return
  const w = window.innerWidth
  const h = window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

onBeforeUnmount(() => {
  if (tickerFn) {
    try {
      useGsap().gsap.ticker.remove(tickerFn)
    } catch {
      /* ticker gone */
    }
  }
  window.removeEventListener('resize', onWindowResize)
  renderer?.dispose()
  scene = camera = renderer = doorLeftMesh = doorRightMesh = null
})
</script>

<template>
  <canvas ref="canvas" class="journey-3d" aria-hidden="true" />
</template>

<style scoped>
.journey-3d {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: -1;
}
</style>
