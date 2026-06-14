<script setup lang="ts">
import gsap from 'gsap'
import { useExperienceStore } from '~/stores/experience'

const emit = defineEmits<{ (e: 'entered'): void }>()

const experienceStore = useExperienceStore()
const progress = computed(() => Math.round(experienceStore.progress))
const isReady = computed(() => experienceStore.isReady)
const showButtons = ref(false)
const loaderEl = ref<HTMLElement | null>(null)
const titleEl = ref<HTMLElement | null>(null)

watch(isReady, (ready) => {
  if (ready) {
    // Animate title line in
    if (titleEl.value) {
      gsap.fromTo(titleEl.value,
        { yPercent: -100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power1.out', delay: 0.2 }
      )
    }
    setTimeout(() => { showButtons.value = true }, 800)
  }
})

function enter(withSound: boolean) {
  experienceStore.setHasEntered()
  // Fade out loader
  gsap.to(loaderEl.value, {
    opacity: 0, duration: 0.5, ease: 'power2.out',
    onComplete: () => { emit('entered') }
  })
}
</script>

<template>
  <div ref="loaderEl" class="loader">
    <div class="loader-inner">
      <div class="loader-anim">
        <div class="spinner"></div>
      </div>
      <div class="loader-progress">{{ progress }}<span class="pct">%</span></div>
      <div class="loader-title" ref="titleEl">
        <p>Motion designer &amp; creative developer</p>
      </div>
      <div class="loader-buttons" :class="{ show: showButtons }">
        <button class="enter-btn" @click="enter(true)">enter with sound</button>
        <button class="enter-btn secondary" @click="enter(false)">enter without sound</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loader {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
}
.loader-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30rem;
  text-align: center;
}
.loader-anim {
  width: 60rem;
  height: 60rem;
}
.spinner {
  width: 100%;
  height: 100%;
  border: 2px solid rgba(250,250,250,0.2);
  border-top-color: var(--color-white);
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
  color: var(--color-white);
  min-width: 3ch;
  text-align: center;
}
.pct { font-size: 40rem; }
.loader-title {
  overflow: hidden;
  font-size: 18rem;
  font-weight: 500;
  opacity: 0;
}
.loader-buttons {
  display: flex;
  flex-direction: column;
  gap: 12rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
}
.loader-buttons.show {
  opacity: 1;
  pointer-events: auto;
}
.enter-btn {
  background: var(--color-white);
  color: var(--color-black);
  border: none;
  border-radius: var(--radius-full);
  padding: 14rem 28rem;
  font-family: var(--main-font);
  font-size: 16rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  cursor: pointer;
  transition: transform 0.3s var(--ease-spring), background 0.2s ease;
}
.enter-btn:hover { transform: scale(1.05); }
.enter-btn.secondary {
  background: transparent;
  border: 1px solid var(--color-white20);
  color: var(--color-white);
  opacity: 0.6;
}
.enter-btn.secondary:hover { opacity: 1; }
</style>
