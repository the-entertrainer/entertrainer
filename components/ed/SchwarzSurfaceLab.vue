<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'

const host = ref<HTMLDivElement | null>(null)
const reversed = ref(false)
const dragging = ref(false)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let cloud: THREE.Points | null = null
let frame = 0
let spin = 0.35
let raf = 0
let last = 0
let lastX = 0

function schwarzField(x: number, y: number, z: number) {
  return Math.cos(x) + Math.cos(y) + Math.cos(z)
}

function buildCloud() {
  const res = 46
  const span = Math.PI * 2.15
  const positions: number[] = []
  const colors: number[] = []
  const color = new THREE.Color()
  for (let i = 0; i < res; i++) {
    const x = -span + (2 * span * i) / (res - 1)
    for (let j = 0; j < res; j++) {
      const y = -span + (2 * span * j) / (res - 1)
      for (let k = 0; k < res; k++) {
        const z = -span + (2 * span * k) / (res - 1)
        const f = schwarzField(x, y, z)
        if (Math.abs(f) > 0.16) continue
        positions.push(x, y, z)
        const t = (f + 0.16) / 0.32
        color.setHSL(0.12 + t * 0.42, 0.72, 0.58)
        colors.push(color.r, color.g, color.b)
      }
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  const mat = new THREE.PointsMaterial({
    size: 0.085,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    sizeAttenuation: true,
    depthWrite: false
  })
  return new THREE.Points(geo, mat)
}

function tick(now: number) {
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016
  last = now
  if (cloud) cloud.rotation.y += spin * dt
  if (renderer && scene && camera) renderer.render(scene, camera)
  raf = requestAnimationFrame(tick)
}

function resize() {
  if (!host.value || !renderer || !camera) return
  const w = host.value.clientWidth
  const h = host.value.clientHeight
  renderer.setSize(w, h, false)
  camera.aspect = w / Math.max(h, 1)
  camera.updateProjectionMatrix()
}

function onPointerDown(e: PointerEvent) {
  dragging.value = true
  lastX = e.clientX
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  const dx = e.clientX - lastX
  lastX = e.clientX
  spin = Math.max(-2.4, Math.min(2.4, spin + dx * 0.012))
  reversed.value = spin < 0
}

function onPointerUp() {
  dragging.value = false
}

function reverseSpin() {
  spin = spin === 0 ? -0.35 : -spin
  reversed.value = spin < 0
}

onMounted(() => {
  if (!host.value) return
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0b0b0c)
  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40)
  camera.position.set(0, 1.6, 9.4)
  camera.lookAt(0, 0, 0)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  host.value.appendChild(renderer.domElement)
  cloud = buildCloud()
  scene.add(cloud)
  resize()
  window.addEventListener('resize', resize)
  raf = requestAnimationFrame(tick)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
  cloud?.geometry.dispose()
  ;(cloud?.material as THREE.Material | undefined)?.dispose()
  renderer?.dispose()
  renderer?.domElement.remove()
})

defineExpose({ reverseSpin })
</script>

<template>
  <figure class="ssl">
    <div
      ref="host"
      class="ssl__stage"
      role="img"
      aria-label="A live Schwarz P surface, rotating"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    />
    <figcaption>
      Live Schwarz P surface. Mean curvature zero, tiled through space.
      Drag sideways to change the spin. Or reverse it.
    </figcaption>
    <button type="button" class="ssl__btn" @click="reverseSpin">
      {{ reversed ? 'Spin the other way' : 'Reverse the spin' }}
    </button>
  </figure>
</template>

<style scoped>
.ssl { margin: 50rem 0 45rem; }
.ssl__stage {
  width: 100%;
  aspect-ratio: 16 / 11;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  background: #0b0b0c;
  overflow: hidden;
  touch-action: none;
  cursor: grab;
}
.ssl__stage:active { cursor: grabbing; }
.ssl__stage :deep(canvas) { display: block; width: 100%; height: 100%; }
.ssl figcaption {
  margin-top: 10rem;
  color: var(--ink-soft);
  font: 400 13rem/1.35 var(--font-mono);
}
.ssl__btn {
  margin-top: 14rem;
  border: var(--stroke) solid var(--ink);
  background: var(--accent);
  color: var(--accent-ink);
  font: 700 13rem/1 var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 12rem 16rem;
  border-radius: var(--radius-m);
  cursor: pointer;
}
</style>
