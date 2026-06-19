<script setup lang="ts">
import SoundEngine from '~/experience/SoundEngine'

const STORAGE_KEY = 'et-muted'
const muted = ref(true)

onMounted(() => {
  // Restore the user's last preference (default muted — autoplay-safe).
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) muted.value = stored === '1'
  } catch {}
})

function toggle() {
  // Ensure an engine exists; init is idempotent and safe inside this gesture.
  const engine = SoundEngine.getInstance() ?? SoundEngine.init()
  const next = !muted.value
  muted.value = next
  engine.setMuted(next)
  try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0') } catch {}
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
  right: calc(30rem + var(--safe-right));
  bottom: calc(30rem + var(--safe-bottom));
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
