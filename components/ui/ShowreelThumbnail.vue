<script setup lang="ts">
const emit = defineEmits<{ (e: 'click'): void }>()
const isHovered = ref(false)
</script>

<template>
  <div class="showreel-wrapper" @mouseenter="isHovered = true" @mouseleave="isHovered = false" @click="emit('click')">
    <div class="thumbnail-card" :class="{ hovered: isHovered }">
      <div class="thumbnail-content">
        <span class="reel-label">showreel</span>
        <span class="play-icon">▶</span>
      </div>
    </div>
    <div class="marquee-container">
      <span class="marquee-text">showreel 2025 · watch · showreel 2025 · watch ·&nbsp;</span>
    </div>
  </div>
</template>

<style scoped>
.showreel-wrapper {
  position: fixed;
  bottom: 30px;
  left: 30px;
  z-index: 10;
  cursor: pointer;
  width: 280rem;
}
.thumbnail-card {
  width: 280rem;
  aspect-ratio: 16/9;
  transform: rotate(-15deg);
  border-radius: var(--radius-m);
  overflow: hidden;
  background: var(--color-bg-grey);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transition: transform 0.3s var(--ease-spring);
  position: relative;
}
.thumbnail-card.hovered {
  transform: rotate(-13deg) scale(1.05);
}
.thumbnail-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rem;
}
.reel-label {
  font-size: 16rem;
  font-weight: 500;
  color: var(--color-white);
  opacity: 0.7;
}
.play-icon {
  font-size: 36rem;
  color: var(--color-white);
}
.marquee-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}
.marquee-text {
  position: absolute;
  white-space: nowrap;
  font-size: 18rem;
  font-weight: 500;
  color: var(--color-white);
  offset-path: path("M29.5684 182H274.432C290.14 182 304 169 304 152.286V29.7143C304 13 291.064 0 274.432 0H29.5684C12.9362 0 0 13 0 29.7143V152.286C0 169 13.8602 182 29.5684 182Z");
  offset-rotate: auto 180deg;
  animation: moveAlong 12s linear infinite;
}
@keyframes moveAlong {
  from { offset-distance: -100%; }
  to   { offset-distance:    0%; }
}
</style>
