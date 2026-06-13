<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useContent } from '~/composables/useContent'
import { useViewMode } from '~/composables/useViewMode'
import { useGsap } from '~/composables/useGsap'

import type { SectionContent } from '~/content/site'

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

let velocity = 0
let isActiveDrag = false
let lastPointerY = 0
let dragCleanup: (() => void) | null = null
let snapTimeout: any = null

const panelObjects: any[] = []
const mountedApps: any[] = []

const site = useContent()
const sections = site.sections

const { mode } = useViewMode()
const { width } = useWindowSize()

const containerRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)

onMounted(async () => {
  if (mode.value !== 'spiral') return

  const threeModule = await import('three')
  THREE = threeModule

  const { CSS3DRenderer, CSS3DObject } = await import('three/examples/jsm/renderers/CSS3DRenderer.js')

  const container = containerRef.value
  if (!container) return

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 2000)
  camera.position.set(-8, 48, 620)
  camera.lookAt(0, 8, 0)

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

  setupMomentumDragWithSnap()

  const { gsap } = useGsap()

  gsap.from(helixGroup.rotation, {
    y: helixGroup.rotation.y - 0.7,
    duration: 1.7,
    ease: 'power3.out',
    delay: 0.4
  })

  const renderLoop = () => {
    if (!helixGroup || !cssRenderer || !camera) return

    if (!isActiveDrag) {
      velocity *= 0.94
      helixGroup.rotation.y += velocity * 0.0011

      if (Math.abs(velocity) < 0.45 && !snapTimeout) {
        snapToNearestPanel()
      }
    }

    updateCardFacing()
    cssRenderer.render(scene, camera)
  }
  gsap.ticker.add(renderLoop)

  window.addEventListener('resize', handleResize)
})

async function createElegantHelix(CSS3DObject: any) {
  const container = containerRef.value
  if (!container) return

  const isMobile = width.value < 640

  // More accurate & elegant helix
  const radius = isMobile ? 82 : 78
  const verticalStep = isMobile ? 62 : 46
  const totalTurns = isMobile ? 1.45 : 1.7
  const tilt = -0.035

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]

    const wrapper = document.createElement('div')
    wrapper.style.width = isMobile ? '128px' : '152px'
    wrapper.style.height = isMobile ? '152px' : '178px'
    wrapper.style.pointerEvents = 'auto'
    wrapper.style.borderRadius = '12px'
    wrapper.style.overflow = 'hidden'
    wrapper.style.boxShadow = '0 6px 25px rgba(0,0,0,0.55)'
    wrapper.style.border = '1px solid rgba(255,255,255,0.08)'
    wrapper.style.backdropFilter = 'blur(26px) saturate(180%)'

    const { createApp, h } = await import('vue')
    const PanelComponent = (await import('./Panel.vue')).default

    const app = createApp({
      render: () => h(PanelComponent, { section, index: i })
    })
    app.mount(wrapper)
    mountedApps.push(app)

    const object = new CSS3DObject(wrapper)

    const t = i / sections.length
    const angle = t * totalTurns * Math.PI * 2

    // Clean parametric helix positioning
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius * 0.38
    const y = (t - 0.5) * sections.length * verticalStep * 0.5

    object.position.set(x, y, z)
    object.rotation.y = angle + 1.2
    object.rotation.x = tilt

    // Scale based on approximate depth for visual hierarchy
    const depthScale = 0.85 + (Math.sin(angle) * 0.15)
    object.scale.setScalar(depthScale)

    // Click to focus (can open dedicated page)
    wrapper.addEventListener('click', () => {
      focusPanel(object, i)
    })

    helixGroup.add(object)
    panelObjects.push(object)
  }
}

function focusPanel(object: any, index: number) {
  if (!helixGroup) return

  const { gsap } = useGsap()

  // Bring forward with nice pop
  gsap.to(object.position, {
    z: object.position.z + 70,
    duration: 0.28,
    ease: 'back.out(1.4)'
  })

  // Snap helix elegantly
  const step = (1.7 * Math.PI * 2) / sections.length
  const targetY = -(index * step) + 0.65

  gsap.to(helixGroup.rotation, {
    y: targetY,
    duration: 0.85,
    ease: 'power3.out',
    onComplete: () => {
      // TODO: Navigate to dedicated page for this section
      console.log(`Open dedicated page for section index: ${index}`)
    }
  })
}

function updateCardFacing() {
  if (!helixGroup || panelObjects.length === 0) return
  const baseRotation = helixGroup.rotation.y

  panelObjects.forEach((obj, index) => {
    const baseAngle = (index / sections.length) * 1.7 * Math.PI * 2
    obj.rotation.y = baseAngle + 1.2 + baseRotation * 0.05
  })
}

function snapToNearestPanel() {
  if (!helixGroup || panelObjects.length === 0) return

  const current = helixGroup.rotation.y
  const step = (1.7 * Math.PI * 2) / sections.length
  const nearest = Math.round(current / step) * step

  const { gsap } = useGsap()
  gsap.to(helixGroup.rotation, {
    y: nearest,
    duration: 0.5,
    ease: 'power3.out',
    onComplete: () => { velocity = 0 }
  })

  snapTimeout = setTimeout(() => { snapTimeout = null }, 500)
}

function setupMomentumDragWithSnap() {
  const container = containerRef.value
  if (!container || !helixGroup) return

  const onDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('.stage__panel')) return
    isActiveDrag = true
    lastPointerY = e.clientY
    velocity = 0
    isDragging.value = true

    if (snapTimeout) {
      clearTimeout(snapTimeout)
      snapTimeout = null
    }
  }

  const onMove = (e: PointerEvent) => {
    if (!isActiveDrag || !helixGroup) return

    const deltaY = e.clientY - lastPointerY
    lastPointerY = e.clientY

    const speed = width.value < 640 ? 0.0022 : 0.002
    helixGroup.rotation.y += deltaY * speed
    velocity = deltaY * 0.78
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
  if (snapTimeout) clearTimeout(snapTimeout)
  window.removeEventListener('resize', handleResize)

  mountedApps.forEach(app => { try { app.unmount() } catch {} })
  mountedApps.length = 0

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
  height: 100dvh;
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
