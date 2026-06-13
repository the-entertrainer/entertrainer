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

  camera = new THREE.PerspectiveCamera(36, container.clientWidth / container.clientHeight, 0.1, 2000)
  camera.position.set(0, 22, 540)
  camera.lookAt(0, -35, 0)

  cssRenderer = new CSS3DRenderer()
  cssRenderer.setSize(container.clientWidth, container.clientHeight)
  cssRenderer.domElement.style.position = 'absolute'
  cssRenderer.domElement.style.top = '0'
  cssRenderer.domElement.style.left = '0'
  cssRenderer.domElement.style.pointerEvents = 'none'
  container.appendChild(cssRenderer.domElement)

  staircaseGroup = new THREE.Group()
  scene.add(staircaseGroup)

  await createVerticalStaircase(CSS3DObject)

  setupMobileOptimizedDrag()

  const { gsap } = useGsap()

  gsap.from(staircaseGroup.position, {
    y: staircaseGroup.position.y + 90,
    duration: 1.6,
    ease: 'power3.out',
    delay: 0.3
  })

  const renderLoop = () => {
    if (!staircaseGroup || !cssRenderer || !camera) return

    if (!isActiveDrag) {
      velocity *= 0.94
      staircaseGroup.position.y += velocity * 0.7

      if (staircaseGroup.position.y > 60) staircaseGroup.position.y = 60
      if (staircaseGroup.position.y < -150) staircaseGroup.position.y = -150
    }

    cssRenderer.render(scene, camera)
  }
  gsap.ticker.add(renderLoop)

  window.addEventListener('resize', handleResize)
})

async function createVerticalStaircase(CSS3DObject: any) {
  const container = containerRef.value
  if (!container) return

  const isMobile = width.value < 640

  const horizontalSpread = isMobile ? 30 : 46
  const verticalStep = isMobile ? 82 : 62
  const depthStep = isMobile ? 22 : 28

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]

    const wrapper = document.createElement('div')
    wrapper.style.width = isMobile ? '115px' : '152px'
    wrapper.style.height = isMobile ? '135px' : '172px'
    wrapper.style.pointerEvents = 'auto'
    wrapper.style.borderRadius = '9px'
    wrapper.style.overflow = 'hidden'
    wrapper.style.boxShadow = '0 4px 16px rgba(0,0,0,0.6)'
    wrapper.style.border = '1px solid rgba(255,255,255,0.04)'
    wrapper.style.backdropFilter = 'blur(24px) saturate(190%)'

    const { createApp, h } = await import('vue')
    const PanelComponent = (await import('./Panel.vue')).default

    const app = createApp({
      render: () => h(PanelComponent, { 
        section, 
        index: i,
        compact: isMobile   // Pass compact mode for mobile spiral
      })
    })
    app.mount(wrapper)
    mountedApps.push(app)

    const object = new CSS3DObject(wrapper)

    const progress = i / (sections.length - 1)

    const x = (progress - 0.5) * horizontalSpread
    const y = -progress * sections.length * verticalStep * 0.58
    const z = -progress * sections.length * depthStep * 0.65

    object.position.set(x, y, z)
    object.rotation.x = 0.04 + progress * 0.02
    object.rotation.y = (progress - 0.5) * 0.2

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

  gsap.to(object.position, {
    z: object.position.z + 65,
    duration: 0.22,
    ease: 'back.out(1.8)'
  })

  const targetY = -index * 52

  gsap.to(staircaseGroup.position, {
    y: targetY,
    duration: 0.8,
    ease: 'power3.out'
  })
}

function setupMobileOptimizedDrag() {
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

    const speed = isMobile ? 2.5 : 1.4
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
