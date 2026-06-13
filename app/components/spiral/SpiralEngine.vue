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

  camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 2000)
  camera.position.set(-12, 55, 580)
  camera.lookAt(0, 12, 0)

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
    y: helixGroup.rotation.y - 0.75,
    duration: 1.6,
    ease: 'power3.out',
    delay: 0.35
  })

  const renderLoop = () => {
    if (!helixGroup || !cssRenderer || !camera) return

    if (!isActiveDrag) {
      velocity *= 0.935
      helixGroup.rotation.y += velocity * 0.0012

      if (Math.abs(velocity) < 0.5 && !snapTimeout) {
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

  // Accurate & elegant helix parameters
  const radius = isMobile ? 88 : 85
  const verticalStep = isMobile ? 65 : 48
  const totalTurns = isMobile ? 1.5 : 1.75
  const tilt = -0.04

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]

    const wrapper = document.createElement('div')
    // Much smaller, correctly scaled panels
    wrapper.style.width = isMobile ? '132px' : '158px'
    wrapper.style.height = isMobile ? '158px' : '185px'
    wrapper.style.pointerEvents = 'auto'
    wrapper.style.borderRadius = '14px'
    wrapper.style.overflow = 'hidden'
    wrapper.style.boxShadow = '0 8px 30px rgba(0,0,0,0.5)'
    wrapper.style.border = '1px solid rgba(255,255,255,0.1)'
    wrapper.style.backdropFilter = 'blur(24px) saturate(170%)'

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

    // Clean parametric helix
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius * 0.42
    const y = (t - 0.5) * sections.length * verticalStep * 0.55

    object.position.set(x, y, z)
    object.rotation.y = angle + 1.25
    object.rotation.x = tilt

    // View-only: clicking focuses the panel (can later open dedicated pages)
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

  // Bring panel forward
  gsap.to(object.position, {
    z: object.position.z + 60,
    duration: 0.3,
    ease: 'power2.out'
  })

  // Snap helix so this panel is prominent
  const step = (1.75 * Math.PI * 2) / sections.length
  const targetY = -(index * step) + 0.7

  gsap.to(helixGroup.rotation, {
    y: targetY,
    duration: 0.8,
    ease: 'power3.out',
    onComplete: () => {
      // Here we can later navigate to dedicated page
      console.log('Panel clicked - open dedicated page for index:', index)
    }
  })
}

function updateCardFacing() {
  if (!helixGroup || panelObjects.length === 0) return
  const baseRotation = helixGroup.rotation.y

  panelObjects.forEach((obj, index) => {
    const baseAngle = (index / sections.length) * 1.75 * Math.PI * 2
    obj.rotation.y = baseAngle + 1.25 + baseRotation * 0.06
  })
}

function snapToNearestPanel() {
  if (!helixGroup || panelObjects.length === 0) return

  const current = helixGroup.rotation.y
  const step = (1.75 * Math.PI * 2) / sections.length
  const nearest = Math.round(current / step) * step

  const { gsap } = useGsap()
  gsap.to(helixGroup.rotation, {
    y: nearest,
    duration: 0.55,
    ease: 'power3.out',
    onComplete: () => { velocity = 0 }
  })

  snapTimeout = setTimeout(() => { snapTimeout = null }, 600)
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

    const speed = width.value < 640 ? 0.0024 : 0.0021
    helixGroup.rotation.y += deltaY * speed
    velocity = deltaY * 0.8
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
