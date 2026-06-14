<script setup lang="ts">
import gsap from 'gsap'

// 24 colorful sticker squares cycling on mouse move. No image files — random hues.
const COUNT = 24
const items = Array.from({ length: COUNT }, (_, i) => {
  // Mix the pop-green accent with random hues for variety
  const hue = (i * 37) % 360
  return i % 4 === 0 ? 'var(--color-pop-green)' : `hsl(${hue}, 70%, 55%)`
})

const wrapperEl = ref<HTMLElement | null>(null)
const imgEls = ref<HTMLElement[]>([])

const threshold = 80
let currentIndex = 0
let rafId = 0

const actualMouse = { x: 0, y: 0 }
const smoothMouse = { x: 0, y: 0 }
let lastTriggerX = 0
let lastTriggerY = 0

function showNext() {
  const el = imgEls.value[currentIndex % COUNT]
  currentIndex++
  if (!el) return

  // audio: tick (no-op)
  const inner = el.querySelector('.trail-inner') as HTMLElement
  const w = el.offsetWidth
  const h = el.offsetHeight

  gsap.killTweensOf(el)
  gsap.killTweensOf(inner)

  gsap
    .timeline()
    .fromTo(
      el,
      {
        opacity: 1,
        scale: 0,
        x: smoothMouse.x - w / 2,
        y: smoothMouse.y - h / 2
      },
      {
        scale: 1,
        x: actualMouse.x - w / 2,
        y: actualMouse.y - h / 2,
        duration: 0.4,
        ease: 'power2.out'
      },
      0
    )
    .fromTo(inner, { scale: 2.5 }, { scale: 1, duration: 0.4 }, 0)
    .to(el, { opacity: 0, scale: 0.2, duration: 0.4 }, 0.45)
}

function onMouseMove(e: MouseEvent) {
  actualMouse.x = e.clientX
  actualMouse.y = e.clientY
}

function loop() {
  smoothMouse.x += (actualMouse.x - smoothMouse.x) * 0.1
  smoothMouse.y += (actualMouse.y - smoothMouse.y) * 0.1

  const dx = actualMouse.x - lastTriggerX
  const dy = actualMouse.y - lastTriggerY
  if (Math.hypot(dx, dy) > threshold) {
    lastTriggerX = actualMouse.x
    lastTriggerY = actualMouse.y
    showNext()
  }

  rafId = requestAnimationFrame(loop)
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  loop()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <div ref="wrapperEl" class="image-trail">
    <div
      v-for="(color, i) in items"
      :key="i"
      class="trail-img"
      :ref="(el) => { if (el) imgEls[i] = el as HTMLElement }"
    >
      <div class="trail-inner" :style="{ background: color }"></div>
    </div>
  </div>
</template>
