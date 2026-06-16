<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'
const themeStore = useThemeStore()
</script>

<template>
  <button
    class="theme-toggle"
    @click="themeStore.set(themeStore.isDark ? 'light' : 'dark')"
    :aria-label="`Switch to ${themeStore.isDark ? 'light' : 'dark'} mode`"
  >
    <span class="theme-dot" :class="{ dark: themeStore.isDark }"></span>
    <span class="theme-label">{{ themeStore.isDark ? 'dark' : 'light' }}</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  position: fixed;
  bottom: calc(30rem + var(--safe-bottom));
  left: calc(30rem + var(--safe-left));
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8rem;
  height: 40rem;
  padding: 0 16rem;
  border-radius: var(--radius-full);
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--color-text);
  font-family: var(--main-font);
  font-size: 13rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.25s ease;
}
.theme-toggle:hover {
  background: var(--color-glass-bg-hover);
  border-color: var(--color-glass-border-hover);
}
.theme-dot {
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  border: 1.5px solid var(--color-text);
  transition: background 0.25s ease, border-color 0.25s ease;
}
.theme-dot.dark {
  background: var(--color-text);
}
</style>
