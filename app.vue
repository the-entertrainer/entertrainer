<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'

const route      = useRoute()
const themeStore = useThemeStore()

// Transition selection lives here and nowhere else. Nuxt merges
// `props.transition` ahead of `route.meta.pageTransition`
// (nuxt/dist/pages/runtime/page.js:108-111 — first argument wins), so a page's
// own definePageMeta({ pageTransition }) can never override this. I previously
// deleted eleven such overrides believing they were suppressing the editorial
// transition; they were no-ops, and so were the two I kept as exemptions.
// Opt-outs have to be listed here to have any effect at all.
//
//  - home: plain fade, 'default' mode so it mounts while the previous page
//    leaves rather than stalling on the unmount.
//  - storygen / strong: the editorial transition rasterizes the whole entering
//    subtree for its blur, which on a full-viewport canvas app is a visible
//    hitch. They cross-fade instead.
const FLAT_FADE = ['/tools/storygen', '/my-work/strong']

// Routes rebuilt in the Wanda language. They carry their own fixed header and
// index overlay (WandaSurface), so the old corner menu must not also mount —
// two navigation systems on one page is one too many.
const WANDA_ROUTES = ['/tools', '/my-work']
const isWanda = computed(() =>
  route.path === '/' ||
  WANDA_ROUTES.some(p => route.path === p || route.path === `${p}/`)
)

const transition = computed(() => {
  if (route.path === '/') return { name: 'fade' }
  if (FLAT_FADE.some(p => route.path.startsWith(p))) return { name: 'fade', mode: 'out-in' as const }
  // The Wanda surface transitions on opacity alone — no rise, no blur. Its
  // whole motion vocabulary is sine curves under a third of a second.
  if (isWanda.value) return { name: 'fade', mode: 'out-in' as const }
  return { name: 'editorial', mode: 'out-in' as const }
})

onMounted(() => {
  themeStore.init()
})
</script>

<template>
  <div id="app-root">
    <NuxtPage :transition="transition" />
    <UiMenu v-if="!isWanda && !route.path.startsWith('/glass-lab') && !route.path.startsWith('/lab') && !route.path.startsWith('/instructional-design') && !route.path.startsWith('/my-work/strong') && !/^\/about\/?$/.test(route.path)" />
  </div>
</template>

<style>
#app-root { min-height: 100dvh; background: var(--color-bg); }

.fade-enter-active, .fade-leave-active { transition: opacity var(--dur-4) var(--ease-in-out); }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }

/* Editorial page transition — a refined fade + rise with an expo-out feel.
   Applied to every route except home and the two full-canvas apps; see the
   FLAT_FADE list above, which is the only place an opt-out can live. */
.editorial-enter-active { transition: opacity var(--dur-5) var(--ease-out), transform var(--dur-5) var(--ease-out), filter var(--dur-5) var(--ease-in-out); }
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
