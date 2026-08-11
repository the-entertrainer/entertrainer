<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'

const route      = useRoute()
const themeStore = useThemeStore()

// The preloader is an introduction, not a page transition: it plays once per
// tab. `booted` flips the moment it finishes and never flips back, so an
// internal navigation can't replay it.
// The preloader is the site's front door, so it only runs when someone
// actually arrives at the front door. Deep-linking to /my-work used to sit
// behind the same ~2s gate for no reason: there is no WebGL stage on an
// interior route to wait for, and the SPA splash already covers the gap
// before Vue mounts. Those routes boot straight into their page transition.
const landedOnHome = useRoute().path === '/'
const booted = ref(!landedOnHome)
const showPreloader = ref(landedOnHome)

// All routes use out-in fade so pages never hard-swap.
// Home uses 'default' mode (no wait for outgoing) to avoid a stall while the
// about/sub pages unmount — home mounts and fades in while the previous page fades out.
const transition = computed(() =>
  route.path === '/' ? { name: 'fade' } : { name: 'editorial', mode: 'out-in' as const }
)

const menuVisible = computed(() =>
  !route.path.startsWith('/glass-lab') &&
  !route.path.startsWith('/lab') &&
  !route.path.startsWith('/instructional-design') &&
  !route.path.startsWith('/my-work/strong') &&
  !/^\/about\/?$/.test(route.path)
)

// `lift` is the curtain starting to travel: the stage is visible, so the menu
// fades up with it rather than after it. `done` is the curtain having finished,
// which is the only safe moment to unmount a fixed, full-viewport overlay.
function onPreloaderLift() { booted.value = true }
function onPreloaderDone() { showPreloader.value = false }

// One pointer, one light, published as CSS variables for every glass surface
// on the page to read. See composables/useLightField.ts.
useLightField()

onMounted(() => {
  themeStore.init()
})
</script>

<template>
  <div id="app-root" :class="{ 'is-booted': booted }">
    <NuxtPage :transition="transition" />
    <UiGrain />

    <!-- Chrome is held back until the curtain has lifted, so the entrance is
         the stage arriving rather than a menu button fading up through a
         preloader that is still on its way out. -->
    <Transition name="chrome">
      <UiMenu v-if="menuVisible && booted" />
    </Transition>

    <UiPreloader v-if="showPreloader" @lift="onPreloaderLift" @done="onPreloaderDone" />
  </div>
</template>

<style>
#app-root { min-height: 100dvh; background: var(--color-bg); }

.fade-enter-active, .fade-leave-active { transition: opacity var(--dur-mid) var(--ease-out); }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }

/* Editorial page transition — a refined fade + rise with an expo-out feel.
   Used for every route except the fixed-viewport home stage.
   Leave is deliberately much faster than enter: the outgoing page is already
   spent, and matching the two durations makes every navigation feel like it
   takes twice as long as it actually does. */
.editorial-enter-active {
  transition:
    opacity var(--dur-mid) var(--ease-out),
    transform var(--dur-slow) var(--ease-out),
    filter var(--dur-mid) var(--ease-out);
}
.editorial-leave-active {
  transition:
    opacity var(--dur-fast) var(--ease-in),
    transform var(--dur-fast) var(--ease-in),
    filter var(--dur-fast) var(--ease-in);
}
.editorial-enter-from { opacity: 0; transform: translateY(22rem); filter: blur(6px); }
.editorial-leave-to   { opacity: 0; transform: translateY(-12rem); filter: blur(4px); }

/* Chrome fades up once, after the curtain. */
.chrome-enter-active { transition: opacity var(--dur-slow) var(--ease-out) 120ms; }
.chrome-enter-from { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .editorial-enter-active, .editorial-leave-active { transition: opacity var(--dur-fast) linear; }
  .editorial-enter-from, .editorial-leave-to { transform: none; filter: none; }
  .chrome-enter-active { transition: opacity var(--dur-fast) linear; }
}
</style>
