<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'

const route      = useRoute()
const themeStore = useThemeStore()

// All routes use out-in fade so pages never hard-swap.
// Home uses 'default' mode (no wait for outgoing) to avoid a stall while the
// about/sub pages unmount — home mounts and fades in while the previous page fades out.
const transition = computed(() =>
  route.path === '/' ? { name: 'fade' } : { name: 'fade', mode: 'out-in' as const }
)

onMounted(() => {
  themeStore.init()
})
</script>

<template>
  <div id="app-root">
    <NuxtPage :transition="transition" />
    <UiMenu v-if="!route.path.startsWith('/glass-lab') && !route.path.startsWith('/instructional-design') && !route.path.startsWith('/my-work/downbeat') && !route.path.startsWith('/my-work/strong')" />
  </div>
</template>

<style>
#app-root { min-height: 100dvh; background: var(--color-bg); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.35s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }
</style>
