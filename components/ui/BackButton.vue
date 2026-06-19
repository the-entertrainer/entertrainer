<script setup lang="ts">
import { useHomeViewStore } from '~/stores/homeview'

const route         = useRoute()
const router        = useRouter()
const homeViewStore = useHomeViewStore()

const onHomePage = computed(() => route.path === '/')

function handleBack() {
  if (onHomePage.value) {
    homeViewStore.triggerBack()
  } else {
    router.back()
  }
}
</script>

<template>
  <button
    class="back-btn-circle"
    aria-label="Go back"
    @click="handleBack"
  >
    <svg
      class="back-chevron"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  </button>
</template>

<style scoped>
.back-btn-circle {
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
  border: none;
  text-decoration: none;
  color: var(--color-black);
  transition: transform 0.2s ease;
}
.back-btn-circle:active {
  transform: scale(0.9);
}
.back-chevron {
  width: 20rem;
  height: 20rem;
}
</style>
