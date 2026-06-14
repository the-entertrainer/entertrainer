<script setup lang="ts">
const props = defineProps<{ label?: string; visible?: boolean }>()

const x = ref(-100)
const y = ref(-100)
const targetX = ref(-100)
const targetY = ref(-100)
let rafId = 0

onMounted(() => {
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  window.addEventListener('mousemove', (e) => {
    targetX.value = e.clientX
    targetY.value = e.clientY
  })

  function loop() {
    x.value = lerp(x.value, targetX.value, 0.1)
    y.value = lerp(y.value, targetY.value, 0.1)
    rafId = requestAnimationFrame(loop)
  }
  loop()
})

onUnmounted(() => cancelAnimationFrame(rafId))
</script>

<template>
  <div
    class="cursor-tag"
    :class="{ visible }"
    :style="{ transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -150%)` }"
  >
    {{ label || 'view' }}
  </div>
</template>

<style scoped>
.cursor-tag {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  pointer-events: none;
  background: var(--color-pop-green);
  color: var(--color-bg-dark);
  border-radius: 50rem;
  font-size: 24rem;
  font-weight: 500;
  padding: 8rem 16rem;
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
  will-change: transform, opacity;
  opacity: 0;
  scale: 0;
}
.cursor-tag.visible {
  opacity: 1;
  scale: 1;
}
</style>
