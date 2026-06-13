<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const dot = ref<HTMLElement | null>(null)
const ring = ref<HTMLElement | null>(null)
const enabled = ref(false)

let raf = 0
let mx = -100
let my = -100
let rx = -100
let ry = -100

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function onMove(e: MouseEvent) {
  mx = e.clientX
  my = e.clientY
  if (dot.value) dot.value.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`
}

function tick() {
  rx = lerp(rx, mx, 0.16)
  ry = lerp(ry, my, 0.16)
  if (ring.value) ring.value.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`
  raf = requestAnimationFrame(tick)
}

function onOver(e: MouseEvent) {
  const t = e.target as HTMLElement
  const interactive = t.closest('a, button, input, textarea, [data-hover]')
  ring.value?.classList.toggle('is-hover', !!interactive)
  dot.value?.classList.toggle('is-hover', !!interactive)
}

onMounted(() => {
  if (window.matchMedia('(pointer: coarse)').matches) return
  enabled.value = true
  window.addEventListener('mousemove', onMove, { passive: true })
  window.addEventListener('mouseover', onOver, { passive: true })
  raf = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseover', onOver)
})
</script>

<template>
  <div v-if="enabled" class="cursor-layer" aria-hidden="true">
    <div ref="dot" class="cursor-dot" />
    <div ref="ring" class="cursor-ring" />
  </div>
</template>

<style scoped>
.cursor-layer { position: fixed; inset: 0; z-index: 9999; pointer-events: none; }

@media (pointer: fine) {
  :global(*) { cursor: none !important; }
}

.cursor-dot {
  position: fixed;
  top: 0; left: 0;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--neon-cyan);
  box-shadow: var(--glow-cyan);
  will-change: transform;
  transition: width 0.2s, height 0.2s;
}

.cursor-ring {
  position: fixed;
  top: 0; left: 0;
  width: 38px; height: 38px;
  border: 1.5px solid rgba(0, 240, 255, 0.5);
  border-radius: 50%;
  will-change: transform;
  transition: width 0.3s var(--ease-out), height 0.3s var(--ease-out), border-color 0.2s;
}

.cursor-ring.is-hover {
  width: 56px; height: 56px;
  border-color: var(--neon-magenta);
}
.cursor-dot.is-hover {
  width: 5px; height: 5px;
  background: var(--neon-magenta);
}
</style>
