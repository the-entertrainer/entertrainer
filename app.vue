<script setup lang="ts">
// Design reminder — The Learning Atlas course is a self-contained, evidence-led player.
import { useThemeStore } from '~/stores/theme'

/**
 * The publication shell.
 *
 * Masthead at the top, the page in the middle, the footer at the bottom, and
 * an ordinary document scroll through all three. The previous shell was built
 * around a WebGL front page: a preloader gate, a floating hamburger, a section
 * ladder, and every interior route rendered `position: fixed` with its own
 * scroll container. That is the right architecture for a stage and the wrong
 * one for a publication — it meant no page could be longer than the viewport
 * without inventing its own scrolling, and the browser's own scroll
 * restoration, find-in-page and anchor links all had to be worked around.
 *
 * Two kinds of route render without the chrome: the self-contained artifacts
 * (the fifteen lab sketches, the glass lab) and the Strong module, which is a
 * course with its own player bar and its own exit. Wrapping either in a
 * masthead would be putting a magazine spine on a thing that is not a page.
 * The two immersive e-learning routes use the same rule: their compact course
 * bar is the entire learning chrome, so public navigation and footer content
 * must never surround an active course screen.
 */
const r = useRoute()
const theme = useThemeStore()
const showPreloader = ref(true)

// `/lab` itself is an index page and keeps the chrome; `/lab/g07` is an
// artifact and does not.
const bare = computed(() =>
  r.path.startsWith('/lab/') ||
  r.path.startsWith('/glass-lab') ||
  r.path.startsWith('/my-work/strong') ||
  r.path.startsWith('/courses/ai-atlas') ||
  r.path.startsWith('/instructional-design')
)

onMounted(() => theme.init())
onBeforeUnmount(() => theme.dispose())
</script>

<template>
  <div id="app-root">
    <EdPreloader v-if="showPreloader" @complete="showPreloader = false" />
    <template v-if="!showPreloader">
      <template v-if="bare">
        <NuxtPage />
      </template>

      <template v-else>
        <EdMasthead />
        <main id="main">
          <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
        </main>
        <EdFooter />
      </template>

      <div class="u-grain" aria-hidden="true" />
    </template>
  </div>
</template>

<style>
#app-root { min-height: 100dvh; background: var(--paper); display: flex; flex-direction: column; }
#main { flex: 1; }

/* One page transition, and it is nearly nothing: a short fade with a few
   pixels of travel. A publication should feel like turning to a page, not like
   operating a machine — and every millisecond spent animating a route change
   is a millisecond the reader is looking at neither page. */
.page-enter-active { transition: opacity var(--dur-mid) var(--ease-out), transform var(--dur-mid) var(--ease-out); }
.page-leave-active { transition: opacity var(--dur-fast) var(--ease-in); }
.page-enter-from { opacity: 0; transform: translateY(8rem); }
.page-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .page-enter-active, .page-leave-active { transition: opacity 120ms linear; }
  .page-enter-from { transform: none; }
}
</style>
