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

/**
 * Page transitions, on the tower's axis.
 *
 * The site ran two unrelated transitions: a plain fade for home and a rise for
 * everything else, both direction-blind. Going deeper into a section and
 * backing out of it looked identical, which wastes the one thing a transition
 * is actually good for — telling you which way you just went.
 *
 * The home page is a vertical stack of cards you move up and down through, so
 * the whole site moves on that axis now. Deeper: the new page rises from below
 * while the old one recedes upward and back, exactly like advancing the tower.
 * Backing out plays it in reverse. Lateral moves between siblings get a plain
 * crossfade, because nothing about that is up or down.
 *
 * One transition name; the direction is an attribute on the root that the
 * keyframes read. Two names would have meant two copies of the same CSS
 * drifting apart.
 */
const depth = (p: string) => p.replace(/\/+$/, '').split('/').filter(Boolean).length
const navDir = ref('lateral')
watch(() => route.path, (to, from) => {
  if (!from) return
  const d = depth(to) - depth(from)
  navDir.value = d > 0 ? 'deeper' : d < 0 ? 'back' : 'lateral'
})

// Home keeps `default` mode rather than `out-in`: it mounts a WebGL canvas, and
// waiting for the outgoing page to leave first put a visible stall in front of
// the stage. Everything else waits, so two pages of text never overlap.
const transition = computed(() =>
  route.path === '/' ? { name: 'rung' } : { name: 'rung', mode: 'out-in' })

// Chrome is hidden only where the page IS the interface — the WebGL labs and
// the Strong module, which are self-contained artifacts with their own exits.
// /about and /instructional-design used to be excluded too, which meant the
// site's primary navigation simply vanished on two of five content pages;
// both had grown a bespoke back button to compensate, so the site ended up
// with three different back affordances and no menu on either page.
const menuVisible = computed(() =>
  !route.path.startsWith('/glass-lab') &&
  !route.path.startsWith('/lab') &&
  !route.path.startsWith('/my-work/strong')
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
  <div id="app-root" :class="{ 'is-booted': booted }" :data-nav="navDir">
    <NuxtPage :transition="transition" />
    <UiGrain />

    <!-- Chrome is held back until the curtain has lifted, so the entrance is
         the stage arriving rather than a menu button fading up through a
         preloader that is still on its way out. -->
    <Transition name="chrome">
      <UiMenu v-if="menuVisible && booted" />
    </Transition>

    <!-- The section ladder: the home tower seen edge-on, so every interior
         page can say where you are and what else there is without opening
         anything. Not on the home route — there the tower itself is on screen
         at full size, and a miniature of it beside the original is noise. -->
    <Transition name="chrome">
      <UiSectionRail v-if="menuVisible && booted && route.path !== '/'" />
    </Transition>

    <UiPreloader v-if="showPreloader" @lift="onPreloaderLift" @done="onPreloaderDone" />
  </div>
</template>

<style>
#app-root { min-height: 100dvh; background: var(--color-bg); }

/* ── One transition, three directions ─────────────────────────────────────
   `rung` is the only page transition on the site. What changes is the sign of
   the travel, read from [data-nav] on the root: deeper moves the page up the
   stack, back moves it down, lateral just crosses over.

   Leave is deliberately much faster than enter. The outgoing page is spent,
   and matching the two durations makes every navigation feel like it takes
   twice as long as it does. */
.rung-enter-active {
  transition:
    opacity var(--dur-mid) var(--ease-out),
    transform var(--dur-slow) var(--ease-out),
    filter var(--dur-mid) var(--ease-out);
}
.rung-leave-active {
  transition:
    opacity var(--dur-fast) var(--ease-in),
    transform var(--dur-fast) var(--ease-in),
    filter var(--dur-fast) var(--ease-in);
}

/* Default (first paint, or a move the router cannot classify): straight fade,
   no travel — there is no direction to express yet. */
.rung-enter-from, .rung-leave-to { opacity: 0; }

/* Deeper: the new page climbs into place from below while the old one recedes
   upward and away, which is the tower advancing one card. */
[data-nav="deeper"] .rung-enter-from { transform: translateY(26rem) scale(0.985); filter: blur(6px); }
[data-nav="deeper"] .rung-leave-to   { transform: translateY(-18rem) scale(1.015); filter: blur(4px); }

/* Back: the same motion, reversed, so retreating never looks like advancing. */
[data-nav="back"] .rung-enter-from { transform: translateY(-26rem) scale(1.015); filter: blur(6px); }
[data-nav="back"] .rung-leave-to   { transform: translateY(18rem) scale(0.985); filter: blur(4px); }

/* Lateral: siblings at the same depth. Nothing about that is up or down. */
[data-nav="lateral"] .rung-enter-from,
[data-nav="lateral"] .rung-leave-to { transform: none; filter: blur(3px); }

/* Chrome fades up once, after the curtain. */
.chrome-enter-active { transition: opacity var(--dur-slow) var(--ease-out) 120ms; }
.chrome-enter-from { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .rung-enter-active, .rung-leave-active { transition: opacity var(--dur-fast) linear; }
  .rung-enter-from, .rung-leave-to,
  [data-nav] .rung-enter-from, [data-nav] .rung-leave-to { transform: none; filter: none; }
  .chrome-enter-active { transition: opacity var(--dur-fast) linear; }
}
</style>
