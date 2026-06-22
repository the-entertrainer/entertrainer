<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'

const route      = useRoute()
const themeStore = useThemeStore()

const transition = computed(() =>
  route.path === '/' ? false : { name: 'fade', mode: 'out-in' as const }
)

onMounted(() => {
  themeStore.init()
})
</script>

<template>
  <div id="app-root">
    <NuxtPage :transition="transition" />
    <UiMenu />
  </div>
</template>

<style>
#app-root { min-height: 100dvh; background: var(--color-bg); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.35s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }
</style>
