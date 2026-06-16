<script setup lang="ts">
import { useHomeViewStore } from '~/stores/homeview'

const route         = useRoute()
const router        = useRouter()
const homeViewStore = useHomeViewStore()

const isHome    = computed(() => homeViewStore.isHome)
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
  <Transition name="fade" mode="out-in">
    <!-- Home root view: LinkedIn shortcut -->
    <a
      v-if="isHome"
      key="li"
      class="back-btn-circle"
      href="https://www.linkedin.com/in/entertrainer/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View LinkedIn profile"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M4.98 3.5C4.98 4.881 3.87 6 2.5 6S.02 4.881.02 3.5C.02 2.12 1.13 1 2.5 1S4.98 2.12 4.98 3.5zM.5 8.5h4V24h-4V8.5zm6.5 0h3.84v2.13h.05c.54-1.01 1.84-2.13 3.79-2.13 4.05 0 4.8 2.66 4.8 6.12V24h-4v-8.7c0-2.07-.04-4.74-2.89-4.74-2.89 0-3.33 2.26-3.33 4.59V24H7V8.5z"/>
      </svg>
    </a>

    <!-- Sub-section or detail page: back chevron -->
    <button
      v-else
      key="bk"
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
  </Transition>
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

.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
