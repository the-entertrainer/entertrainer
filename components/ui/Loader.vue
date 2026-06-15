<script setup lang="ts">
import gsap from 'gsap'
import { useExperienceStore } from '~/stores/experience'
import { useThemeStore } from '~/stores/theme'

const emit = defineEmits<{ (e: 'entered'): void }>()

const experienceStore = useExperienceStore()
const themeStore      = useThemeStore()
const progress        = computed(() => Math.round(experienceStore.progress))
const isReady         = computed(() => experienceStore.isReady)
const showButtons     = ref(false)
const loaderEl        = ref<HTMLElement | null>(null)

watch(isReady, (ready) => {
  if (ready) setTimeout(() => { showButtons.value = true }, 600)
})

function enter(theme: 'dark' | 'light') {
  themeStore.set(theme)
  experienceStore.setHasEntered()
  gsap.to(loaderEl.value, {
    opacity: 0, duration: 0.5, ease: 'power2.out',
    onComplete: () => emit('entered')
  })
}
</script>

<template>
  <div ref="loaderEl" class="loader">
    <div class="loader-inner">
      <div class="spinner"></div>
      <div class="loader-progress">{{ progress }}<span class="pct">%</span></div>
      <div class="loader-brand">
        <p class="brand-name">Naveen Jose</p>
        <p class="brand-role">Instructional Design &amp; E-Learning</p>
      </div>
      <div class="loader-buttons" :class="{ show: showButtons }">
        <button class="enter-btn dark-btn" @click.stop="enter('dark')">dark</button>
        <button class="enter-btn light-btn" @click.stop="enter('light')">light</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loader {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}
.loader-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28rem;
  text-align: center;
}
.spinner {
  width: 48rem;
  height: 48rem;
  border: 2px solid rgba(244,241,236,0.15);
  border-top-color: #8B5CF6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loader-progress {
  font-size: 80rem;
  font-weight: 600;
  letter-spacing: -0.05em;
  font-style: italic;
  color: #F4F1EC;
  min-width: 3ch;
  text-align: center;
}
.pct { font-size: 40rem; }
.loader-brand {
  display: flex;
  flex-direction: column;
  gap: 6rem;
}
.brand-name {
  font-size: 18rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: #F4F1EC;
}
.brand-role {
  font-size: 11rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #8B5CF6;
}
.loader-buttons {
  display: flex;
  gap: 10rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
}
.loader-buttons.show {
  opacity: 1;
  pointer-events: auto;
}
.enter-btn {
  padding: 12rem 28rem;
  border-radius: var(--radius-full);
  font-family: var(--main-font);
  font-size: 14rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform 0.3s var(--ease-spring), opacity 0.2s ease;
}
.enter-btn:hover { transform: scale(1.06); }
.dark-btn {
  background: rgba(244,241,236,0.1);
  color: #F4F1EC;
  border-color: rgba(244,241,236,0.2);
}
.light-btn {
  background: #F4F1EC;
  color: #0D0C0A;
}
</style>
