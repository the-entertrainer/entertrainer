<script setup lang="ts">
import { useExperienceStore } from '~/stores/experience'

const expStore = useExperienceStore()
const animating = ref(false)

// Start after the loader overlay is fully gone (~850ms after hasEntered fires)
watch(() => expStore.hasEntered, (v) => {
  if (v) setTimeout(() => { animating.value = true }, 850)
})
</script>

<template>
  <NuxtLink to="/" class="logo-wrapper" aria-label="Entertrainer — home">
    <div class="logo" :class="{ 'logo--in': animating }">
      <svg class="logo-mark" viewBox="0 0 24 32" aria-hidden="true">
        <!-- Left spine (5 dots, top → bottom) -->
        <circle class="d d0"  cx="3"  cy="4"  r="2.2" />
        <circle class="d d1"  cx="3"  cy="10" r="2.2" />
        <circle class="d d2"  cx="3"  cy="16" r="2.2" />
        <circle class="d d3"  cx="3"  cy="22" r="2.2" />
        <circle class="d d4"  cx="3"  cy="28" r="2.2" />
        <!-- Top arm (spine → tip) -->
        <circle class="d d5"  cx="9"  cy="4"  r="2.2" />
        <circle class="d d6"  cx="15" cy="4"  r="2.2" />
        <circle class="d d7"  cx="21" cy="4"  r="2.2" />
        <!-- Middle arm -->
        <circle class="d d8"  cx="9"  cy="16" r="2.2" />
        <!-- Bottom arm (spine → tip) -->
        <circle class="d d9"  cx="9"  cy="28" r="2.2" />
        <circle class="d d10" cx="15" cy="28" r="2.2" />
        <circle class="d d11" cx="21" cy="28" r="2.2" />
      </svg>
    </div>
  </NuxtLink>
</template>

<style scoped>
.logo-wrapper {
  position: fixed;
  left: calc(30rem + var(--safe-left));
  top: calc(38rem + var(--safe-top));
  width: 48rem;
  height: 48rem;
  z-index: 30;
  cursor: pointer;
}
.logo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--color-white);
  transition: transform 0.2s ease;
}
.logo-mark {
  width: 18rem;
  height: 24rem;
}
.logo-mark circle {
  fill: var(--color-black);
  transform-box: fill-box;
  transform-origin: center;
  opacity: 0;
  transform: scale(0);
}
.logo:active { transform: scale(0.9); }

@keyframes dot-in {
  0%   { opacity: 0; transform: scale(0); }
  65%  { opacity: 1; transform: scale(1.25); }
  100% { opacity: 1; transform: scale(1); }
}

.logo--in .d { animation: dot-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

/* 5 "primary" dots that match where the loader dots land — appear first */
.logo--in .d0  { animation-delay: 0.00s; } /* spine top     */
.logo--in .d2  { animation-delay: 0.03s; } /* spine mid     */
.logo--in .d4  { animation-delay: 0.06s; } /* spine bot     */
.logo--in .d7  { animation-delay: 0.03s; } /* top arm end   */
.logo--in .d11 { animation-delay: 0.06s; } /* bot arm end   */

/* 7 "clone" dots — appear to spawn from the primaries */
.logo--in .d1  { animation-delay: 0.14s; } /* spine 2nd (between d0 & d2) */
.logo--in .d3  { animation-delay: 0.17s; } /* spine 4th (between d2 & d4) */
.logo--in .d5  { animation-delay: 0.20s; } /* top arm 1 (from spine)      */
.logo--in .d8  { animation-delay: 0.22s; } /* mid arm   (from spine)      */
.logo--in .d9  { animation-delay: 0.20s; } /* bot arm 1 (from spine)      */
.logo--in .d6  { animation-delay: 0.26s; } /* top arm 2 (growing outward) */
.logo--in .d10 { animation-delay: 0.29s; } /* bot arm 2 (growing outward) */
</style>
