<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useContent } from '~/composables/useContent'
import { useViewMode } from '~/composables/useViewMode'
import { useReducedMotion } from '~/composables/useReducedMotion'
import { useGsap } from '~/composables/useGsap'
import { useDrag } from '~/composables/useDrag'

import type { SectionContent } from '~/content/site'

// Three.js + CSS3D types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const THREE: any

const site = useContent()
const sections = site.sections

const { mode, isAnimating } = useViewMode()
const motion = useReducedMotion()
const { width } = useWindowSize()

const containerRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)

// Three.js objects
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let renderer: any = null
let animationFrame: number | null = null
let dragCleanup: (() => void) | null = null

// Store panel objects for later manipulation
const panelObjects: any[] = []

onMounted(async () => {
  if (mode.value !== 'spiral') return

  // Lazy load Three.js
  const threeModule = await import('three')
  THREE = threeModule

  const { CSS3DRenderer, CSS3DObject } = await import('three/examples/jsm/renderers/CSS3DRenderer.js')

  const container = containerRef.value
  if (!container) return

  // Scene
  scene = new THREE.Scene()

  // Camera - elegant angled view of the helix
  camera = new THREE.PerspectiveCamera(
    55,
    container.clientWidth / container.clientHeight,
    0.1,
    2000
  )
  // Position camera for nice front/side helix view
  camera.position.set(0, 80, 420)
  camera.lookAt(0, 40, 0)

  // CSS3D Renderer (for real Vue panels in 3D)
  cssRenderer = new CSS3DRenderer()
  cssRenderer.setSize(container.clientWidth, container.clientHeight)
  cssRenderer.domElement.style.position = 'absolute'
  cssRenderer.domElement.style.top = '0'
  cssRenderer.domElement.style.left = '0'
  cssRenderer.domElement.style.pointerEvents = 'none'
  container.appendChild(cssRenderer.domElement)

  // Helix group
  helixGroup = new THREE.Group()
  scene.add(helixGroup)

  // Create panels as CSS3DObjects
  await createHelixPanels(CSS3DObject)

  // Setup interaction
  setupDragControls()

  // Start render loop
  const { gsap } = useGsap()
  const render = () => {
    if (!cssRenderer || !camera || !helixGroup) return
    cssRenderer.render(scene, camera)
  }
  gsap.ticker.add(render)

  // Resize handler
  window.addEventListener('resize', handleResize)
})

async function createHelixPanels(CSS3DObject: any) {
  const container = containerRef.value
  if (!container) return

  const radius = width.value < 640 ? 95 : 115
  const verticalStep = width.value < 640 ? 48 : 55
  const totalTurns = 1.6

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]

    // Create wrapper div
    const wrapper = document.createElement('div')
    wrapper.style.width = width.value < 640 ? '168px' : '195px'
    wrapper.style.height = width.value < 640 ? '205px' : '235px'
    wrapper.style.pointerEvents = 'auto'

    // Mount Panel component into the wrapper
    // We use a temporary Vue app to render the panel
    const { createApp, h } = await import('vue')
    const PanelComponent = (await import('./Panel.vue')).default

    const app = createApp({
      render: () => h(PanelComponent, { section, index: i })
    })
    app.mount(wrapper)

    const object = new CSS3DObject(wrapper)

    // Helix positioning (elegant angled staircase)
    const angle = (i / sections.length) * totalTurns * Math.PI * 2
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius * 0.6
    const y = i * verticalStep - (sections.length * verticalStep) / 2

    object.position.set(x, y, z)
    object.rotation.y = angle + Math.PI * 0.5

    helixGroup.add(object)
    panelObjects.push(object)
  }
}

function setupDragControls() {
  const container = containerRef.value
  if (!container || !helixGroup) return

  let isActive = false
  let lastY = 0

  const onPointerDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('.stage__panel')) return
    isActive = true
    lastY = e.clientY
    isDragging.value = true
  }

  const onPointerMove = (e: PointerEvent) => {
    if (!isActive || !helixGroup) return

    const deltaY = e.clientY - lastY
    lastY = e.clientY

    // Rotate helix on Y axis (feels like turning a staircase)
    helixGroup.rotation.y += deltaY * 0.0025
  }

  const onPointerUp = () => {
    isActive = false
    isDragging.value = false
  }

  container.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)

  dragCleanup = () => {
    container.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)
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

  // Cleanup Three.js objects
  if (helixGroup) {
    helixGroup.children.forEach((child: any) => {
      if (child.element) child.element.remove()
    })
  }

  panelObjects.length = 0
})

// Keep Grid/List working as before
watch(mode, async (next) => {
  if (next !== 'spiral' && helixGroup) {
    // Hide 3D when switching away
    helixGroup.visible = false
  }
})
</script>

<template>
  <div
    ref="containerRef"
    class="spiral-3d"
    :class="{ 'is-dragging': isDragging }"
  >
    <!-- Three.js + CSS3D canvas will be appended here -->
  </div>
</template>

<style scoped>
.spiral-3d {
  position: relative;
  width: 100%;
  height: min(72vh, 680px);
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
