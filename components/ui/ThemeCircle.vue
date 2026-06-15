<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'
const themeStore = useThemeStore()
</script>

<template>
  <button
    class="theme-circle"
    @click="themeStore.set(themeStore.isDark ? 'light' : 'dark')"
    :aria-label="`Switch to ${themeStore.isDark ? 'light' : 'dark'} mode`"
  >
    <span class="tc-dot" :class="{ filled: themeStore.isDark }"></span>
  </button>
</template>

<style scoped>
.theme-circle {
  position: fixed;
  bottom: calc(30rem + var(--safe-bottom));
  left: calc(30rem + var(--safe-left));
  width: 48rem;
  height: 48rem;
  border-radius: 24rem;
  background: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.theme-circle:active {
  transform: scale(0.9);
}
.tc-dot {
  width: 14rem;
  height: 14rem;
  border-radius: 50%;
  border: 2px solid var(--color-black);
  transition: background 0.25s ease;
}
.tc-dot.filled {
  background: var(--color-black);
}
</style>
