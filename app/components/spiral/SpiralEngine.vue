<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useContent } from '~/composables/useContent'
import { useViewMode } from '~/composables/useViewMode'
import { useGsap } from '~/composables/useGsap'
import { createApp, h } from 'vue'
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
let staircaseGroup: any = null

let velocity = 0
let isActiveDrag = false
let lastPointerY = 0
let dragCleanup: (() => void) | null = null

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

  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  document.body.style.touchAction = 'none'

  const threeModule = await import('three')
  THREE = threeModule

  const { CSS3DRenderer, CSS3DObject } = await import('three/examples/jsm/renderers/CSS3DRenderer.js')

  const container = containerRef.value
  if (!container) return

  scene = new THREE.Scene()

  // Clean, balanced camera for vertical staircase
  camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 2000)
  camera.position.set(0, 18, 480)
  camera.lookAt(0, -20, 0)

  cssRenderer = new CSS3DRenderer()
  cssRenderer.setSize(container.clientWidth, container.clientHeight)
  cssRenderer.domElement.style.position = 'absolute'
  cssRenderer.domElement.style.top = '0'
  cssRenderer.domElement.style.left = '0'
  cssRenderer.domElement.style.pointerEvents = 'none'
  container.appendChild(cssRenderer.domElement)

  staircaseGroup = new THREE.Group()
  scene.add(staircaseGroup)

  await createCleanStaircase(CSS3DObject)

  setupDragControls()

  const { gsap } = useGsap()

  // Clean elegant entrance
  gsap.from(staircaseGroup.position, {
    y: staircaseGroup.position.y + 80,
    duration: 1.7,
    ease: 'power3.out',
    delay: 0.4
  })

  const renderLoop = () => {
    if (!staircaseGroup || !cssRenderer || !camera) return

    if (!isActiveDrag) {
      velocity *= 0.94
      staircaseGroup.position.y += velocity * 0.65

      // Soft bounds
      if (staircaseGroup.position.y > 50) staircaseGroup.position.y = 50
      if (staircaseGroup.position.y < -160) staircaseGroup.position.y = -160
    }

    cssRenderer.render(scene, camera)
  }
  gsap.ticker.add(renderLoop)

  window.addEventListener('resize', handleResize)
})

async function createCleanStaircase(CSS3DObject: any) {
  const container = containerRef.value
  if (!container) return

  const isMobile = width.value < 640

  // Balanced, stable parameters
  const horizontalSpread = isMobile ? 28 : 42
  const verticalStep = isMobile ? 78 : 58
  const depthStep = isMobile ? 20 : 26

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]

    const wrapper = document.createElement('div')
    wrapper.style.width = isMobile ? '128px' : '148px'
    wrapper.style.height = isMobile ? '148px' : '168px'
    wrapper.style.pointerEvents = 'auto'
    wrapper.style.borderRadius = '10px'
    wrapper.style.overflow = 'hidden'
    wrapper.style.boxShadow = '0 5px 18px rgba(0,0,0,0.6)'
    wrapper.style.border = '1px solid rgba(255,255,255,0.05)'
    wrapper.style.backdropFilter = 'blur(26px) saturate(190%)'

    const PanelComponent = (await import('./Panel.vue')).default

    const app = createApp({
      render: () => h(PanelComponent, { 
        section, 
        index: i,
        compact: isMobile
      })
    })

    app.mount(wrapper)
    mountedApps.push(app)

    const object = new CSS3DObject(wrapper)

    const progress = i / (sections.length - 1)

    // Clean vertical staircase positioning
    const x = (progress - 0.5) * horizontalSpread
    const y = -progress * sections.length * verticalStep * 0.52
    const z = -progress * sections.length * depthStep * 0.6

    object.position.set(x, y, z)
    object.rotation.x = 0.05 + progress * 0.015
    object.rotation.y = (progress - 0.5) * 0.18

    wrapper.addEventListener('click', () => {
      focusPanel(object, i)
    })

    staircaseGroup.add(object)
    panelObjects.push(object)
  }
}

function focusPanel(object: any, index: number) {
  if (!staircaseGroup) return

  const { gsap } = useGsap()

  gsap.to(object.scale, {
    x: 1.06,
    y: 1.06,
    z: 1.06,
    duration: 0.12,
    ease: 'back.out(2)',
    onComplete: () => {
      gsap.to(object.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
    }
  })

  gsap.to(object.position, {
    z: object.position.z + 60,
    duration: 0.22,
    ease: 'back.out(1.6)'
  })

  const targetY = -index * 48

  gsap.to(staircaseGroup.position, {
    y: targetY,
    duration: 0.8,
    ease: 'power3.out'
  })
}

function setupDragControls() {
  const container = containerRef.value
  if (!container || !staircaseGroup) return

  const isMobile = width.value < 640

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
    if (!isActiveDrag || !staircaseGroup) return

    const deltaY = e.clientY - lastPointerY
    lastPointerY = e.clientY

    const speed = isMobile ? 2.2 : 1.25
    velocity = deltaY * speed
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
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  document.body.style.touchAction = ''

  if (dragCleanup) dragCleanup()
  if (snapTimeout) clearTimeout(snapTimeout)
  window.removeEventListener('resize', handleResize)

  mountedApps.forEach(app => {
    try { app.unmount() } catch {}
  })
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
  touch-action: none;
  overscroll-behavior: none;
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
