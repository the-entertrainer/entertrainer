<script setup lang="ts">
// Sound button — audio is stubbed (no Howler). Toggle is purely visual.
const muted = ref(true)

function toggle() {
  muted.value = !muted.value
  // audio: toggle ambient mute (no-op)
}
</script>

<template>
  <button class="sound-button" :class="{ muted }" @click="toggle" aria-label="toggle sound">
    <span class="b"></span>
    <span class="b"></span>
    <span class="b"></span>
  </button>
</template>

<style scoped>
.sound-button {
  position: fixed;
  right: 30rem;
  bottom: 30rem;
  z-index: 30;
  width: 48rem;
  height: 48rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  border-radius: var(--radius-full);
  background: var(--color-white);
  color: var(--color-black);
  transition: transform 0.3s var(--ease-spring);
}
.sound-button:hover {
  transform: scale(1.08);
}
.b {
  width: 3rem;
  height: 14rem;
  border-radius: 2rem;
  background: var(--color-black);
  animation: sound-bounce 1s ease-in-out infinite;
}
.b:nth-child(2) {
  animation-delay: 0.15s;
}
.b:nth-child(3) {
  animation-delay: 0.3s;
}
.sound-button.muted .b {
  animation-play-state: paused;
  height: 6rem;
}
@keyframes sound-bounce {
  0%,
  100% {
    height: 8rem;
  }
  50% {
    height: 18rem;
  }
}
</style>
