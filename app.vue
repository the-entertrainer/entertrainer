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
    <UiMenu v-if="!route.path.startsWith('/glass-lab') && !route.path.startsWith('/lab') && !route.path.startsWith('/instructional-design') && !route.path.startsWith('/my-work/strong') && !/^\/about\/?$/.test(route.path)" />
  </div>
</template>

<style>
#app-root { min-height: 100dvh; background: var(--color-bg); }

.fade-enter-active, .fade-leave-active { transition: opacity var(--dur-4) var(--ease-in-out); }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }

/* Editorial page transition — a refined fade + rise with an expo-out feel.
   Used for every route except the fixed-viewport home spiral.
   This was declared here and then overridden back to a flat `fade` by
   definePageMeta on eleven pages, so it effectively never ran. Those overrides
   are gone now; only StoryGen (whose full-viewport canvas hitches when the
   entering subtree is rasterized for the blur) and Strong (which owns st-fade)
   still opt out. */
.editorial-enter-active { transition: opacity var(--dur-5) var(--ease-out), transform 0.6s var(--ease-out), filter var(--dur-5) var(--ease-in-out); }
.editorial-leave-active { transition: opacity var(--dur-3) var(--ease-in-out), transform var(--dur-3) var(--ease-in-out), filter var(--dur-3) var(--ease-in-out); }
.editorial-enter-from { opacity: 0; transform: translateY(22px); filter: blur(6px); }
.editorial-leave-to   { opacity: 0; transform: translateY(-12px); filter: blur(4px); }
/* Blurring a whole entering page is a full-surface rasterization; on phone GPUs
   that is the difference between a transition and a stutter. */
@media (max-width: 640px) {
  .editorial-enter-from, .editorial-leave-to { filter: none; }
}
@media (prefers-reduced-motion: reduce) {
  .editorial-enter-active, .editorial-leave-active { transition: opacity var(--dur-3) var(--ease-in-out); }
  .editorial-enter-from, .editorial-leave-to { transform: none; filter: none; }
}
</style>
