<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useContent } from '~/composables/useContent'
import { useViewMode } from '~/composables/useViewMode'
import { useGsap } from '~/composables/useGsap'

import type { SectionContent } from '~/content/site'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const THREE: any

const site = useContent()
const sections = site.sections

const { mode } = useViewMode()
const { width } = useWindowSize()

const containerRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)

// Three.js + CSS3D
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let THREE: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let scene: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let camera: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cssRenderer: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let helixGroup: any = null

// Interaction state
let velocity = 0
let isActiveDrag = false
let lastPointerY = 0
let dragCleanup: (() => void) | null = null

const panelObjects: any[] = []

onMounted(async () => {
  if (mode.value !== 'spiral') return

  const threeModule = await import('three')
  THREE = threeModule

  const { CSS3DRenderer, CSS3DObject } = await import('three/examples/jsm/renderers/CSS3DRenderer.js')

  const container = containerRef.value
  if (!container) return

  // Scene
  scene = new THREE.Scene()

  // Camera - elegant angled view
  camera = new THREE.PerspectiveCamera(52, container.clientWidth / container.clientHeight, 0.1, 2000)
  camera.position.set(-35, 95, 380)
  camera.lookAt(12, 35, 0)

  // CSS3D Renderer
  cssRenderer = new CSS3DRenderer()
  cssRenderer.setSize(container.clientWidth, container.clientHeight)
  cssRenderer.domElement.style.position = 'absolute'
  cssRenderer.domElement.style.top = '0'
  cssRenderer.domElement.style.left = '0'
  cssRenderer.domElement.style.pointerEvents = 'none'
  container.appendChild(cssRenderer.domElement)

  helixGroup = new THREE.Group()
  scene.add(helixGroup)

  await createElegantHelix(CSS3DObject)

  setupMomentumDrag()

  const { gsap } = useGsap()
  const renderLoop = () => {
    if (!helixGroup || !cssRenderer || !camera) return

    // Apply momentum
    if (!isActiveDrag) {
      velocity *= 0.92 // friction
      helixGroup.rotation.y += velocity * 0.0018
    }

    cssRenderer.render(scene, camera)
  }
  gsap.ticker.add(renderLoop)

  window.addEventListener('resize', handleResize)
})

async function createElegantHelix(CSS3DObject: any) {
  const container = containerRef.value
  if (!container) return

  const isMobile = width.value < 640
  const radius = isMobile ? 88 : 105
  const verticalStep = isMobile ? 52 : 58
  const totalTurns = 1.75

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]

    const wrapper = document.createElement('div')
    wrapper.style.width = isMobile ? '162px' : '188px'
    wrapper.style.height = isMobile ? '198px' : '228px'
    wrapper.style.pointerEvents = 'auto'
    wrapper.style.backdropFilter = 'blur(18px) saturate(140%)'

    const { createApp, h } = await import('vue')
    const PanelComponent = (await import('./Panel.vue')).default

    const app = createApp({
      render: () => h(PanelComponent, { section, index: i })
    })
    app.mount(wrapper)

    const object = new CSS3DObject(wrapper)

    const angle = (i / sections.length) * totalTurns * Math.PI * 2

    // Elegant helix positioning
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius * 0.55
    const y = i * verticalStep - (sections.length * verticalStep) / 2.1

    object.position.set(x, y, z)

    // Cards gently face the camera direction
    object.rotation.y = angle + 1.35
    object.rotation.x = -0.12

    helixGroup.add(object)
    panelObjects.push(object)
  }
}

function setupMomentumDrag() {
  const container = containerRef.value
  if (!container || !helixGroup) return

  const onDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('.stage__panel')) return
    isActiveDrag = true
    lastPointerY = e.clientY
    velocity = 0
    isDragging.value = true
  }

  const onMove = (e: PointerEvent) => {
    if (!isActiveDrag || !helixGroup) return

    const deltaY = e.clientY - lastPointerY
    lastPointerY = e.clientY

    const rotationSpeed = width.value < 640 ? 0.0032 : 0.0026
    helixGroup.rotation.y += deltaY * rotationSpeed
    velocity = deltaY * 0.85
  }

  const onUp = () => {
    isActiveDrag = false
    isDragging.value = false
  }

  container.addEventListener('pointerdown', onDown)
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)

  dragCleanup = () => {
    container.removeEventListener('pointerdown', onDown)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
  }
}

function handleResize() {
  if (!containerRef.value || !cssRenderer || !camera) return
  const w = containerRef.value.clientWidth
  const h = containerRef.value.clientHeight

  camera.aspect = w / h
  camera.updateProjectionMatrix()
  cssRenderer.setSize(w, h)
}

onBeforeUnmount(() => {
  if (dragCleanup) dragCleanup()
  window.removeEventListener('resize', handleResize)

  panelObjects.forEach(obj => {
    if (obj.element?.parentNode) obj.element.parentNode.removeChild(obj.element)
  })
  panelObjects.length = 0
})
</script>

<template>
  <div
    ref="containerRef"
    class="spiral-3d"
    :class="{ 'is-dragging': isDragging }"
  >
  </div>
</template>

<style scoped>
.spiral-3d {
  position: relative;
  width: 100%;
  height: min(74vh, 720px);
  overflow: hidden;
  cursor: grab;
  background: transparent;
}

.spiral-3d.is-dragging {
  cursor: grabbing;
}

.spiral-3d :deep(.stage__panel) {
  pointer-events: auto;
}
</style>
