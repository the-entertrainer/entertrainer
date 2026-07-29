<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'

const route      = useRoute()
const themeStore = useThemeStore()

// All routes use out-in fade so pages never hard-swap.
// Home uses 'default' mode (no wait for outgoing) to avoid a stall while the
// about/sub pages unmount — home mounts and fades in while the previous page fades out.
const transition = computed(() =>
  route.path === '/' ? { name: 'fade' } : { name: 'editorial', mode: 'out-in' as const }
)

onMounted(() => {
  themeStore.init()
})
</script>

<template>
  <div id="app-root">
    <NuxtPage :transition="transition" />
    <UiGrain />
    <!-- Every non-tool route now carries its own Press masthead (a hairline
         head bar with the section nav) and footer index. The floating corner
         button would sit on top of both and duplicate the navigation, so those
         routes opt out; it remains the tools' own chrome. -->
    <UiMenu v-if="route.path !== '/' && !route.path.startsWith('/glass-lab') && !route.path.startsWith('/lab') && !route.path.startsWith('/instructional-design') && !route.path.startsWith('/my-work') && !route.path.startsWith('/about') && !route.path.startsWith('/downloads')" />
  </div>
</template>

<style>
#app-root { min-height: 100dvh; background: var(--color-bg); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.35s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }

/* Editorial page transition — a refined fade + rise with an expo-out feel.
   Used for every route except the home page, which cross-fades instead. */
.editorial-enter-active { transition: opacity 0.5s cubic-bezier(.19,1,.22,1), transform 0.6s cubic-bezier(.19,1,.22,1), filter 0.5s ease; }
.editorial-leave-active { transition: opacity 0.3s ease, transform 0.3s ease, filter 0.3s ease; }
.editorial-enter-from { opacity: 0; transform: translateY(22px); filter: blur(6px); }
.editorial-leave-to   { opacity: 0; transform: translateY(-12px); filter: blur(4px); }
@media (prefers-reduced-motion: reduce) {
  .editorial-enter-active, .editorial-leave-active { transition: opacity 0.25s ease; }
  .editorial-enter-from, .editorial-leave-to { transform: none; filter: none; }
}
</style>
