<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'
import { WORLD_ZONE_LINKS } from '~/content/zone-links'

/**
 * RmError (design spec §9.11). Nuxt replaces app.vue with this page, so the
 * Reading Mode sheet, the skip link, and the zone list live here.
 *
 * Zone rows come from WORLD_ZONE_LINKS (`content/zone-links.ts`). That module
 * is the stand-in for `composables/world/worldRoutes.ts` until PR #78 lands.
 * Keep this import name. When the shell arrives, re-export the same constant
 * from zone-links instead of inlining the list.
 */
const props = defineProps<{ error: { statusCode?: number; statusMessage?: string; message?: string } }>()

const isNotFound = computed(() => props.error?.statusCode === 404)
const heading = computed(() => isNotFound.value ? 'This dock is empty.' : 'This page did not load.')
const body = computed(() => isNotFound.value
  ? 'That address is not on the map.'
  : 'The link is fine. The page failed. Try again, or pick a zone.')

const headingEl = ref<HTMLElement | null>(null)

if (import.meta.server) {
  const event = useRequestEvent()
  const code = props.error?.statusCode || 500
  if (event) setResponseStatus(event, code, props.error?.statusMessage)
}

onMounted(() => {
  useThemeStore().init()
  const node = headingEl.value
  if (!node) return
  // tabindex=-1 keeps it out of the tab order. The attribute suppresses the
  // ring Chromium paints for this script focus. The next key clears it, so a
  // later keyboard focus still matches :focus-visible.
  node.dataset.programmaticFocus = ''
  node.focus({ preventScroll: true, focusVisible: false } as FocusOptions)
  const clear = () => {
    delete node.dataset.programmaticFocus
    window.removeEventListener('keydown', clear, true)
  }
  window.addEventListener('keydown', clear, true)
})

function tryAgain() {
  if (import.meta.client) window.location.reload()
}

/** Leave the error state. A NuxtLink alone can stay stuck on this page. */
function go(route: string) {
  clearError({ redirect: route })
}

useHead({
  title: () => isNotFound.value ? 'This dock is empty. — Entertrainer' : 'This page did not load. — Entertrainer',
})
</script>

<template>
  <div class="reading rm-error" data-rm-error :data-status="error?.statusCode || 500">
    <a class="reading__skip" href="#main">Skip to content</a>

    <main id="main" tabindex="-1" class="rm-error__sheet">
      <p class="rm-error__eyebrow">{{ isNotFound ? '404' : 'Error' }}</p>
      <h1 ref="headingEl" tabindex="-1">{{ heading }}</h1>
      <p class="rm-error__body">{{ body }}</p>

      <ul class="rm-error__zones">
        <li
          v-for="zone in WORLD_ZONE_LINKS"
          :key="zone.id"
          class="rm-error__zone"
          :class="{ 'rm-error__zone--nexus': zone.id === 'nexus' }"
        >
          <NuxtLink
            :to="zone.route"
            class="rm-error__link"
            :class="{ 'rm-error__link--primary': zone.id === 'nexus' }"
            @click="go(zone.route)"
          >{{ zone.label }}</NuxtLink>
          <NuxtLink v-if="zone.id === 'nexus'" class="rm-error__link" to="/" @click="go('/')">Open map</NuxtLink>
        </li>
      </ul>

      <button v-if="!isNotFound" type="button" class="rm-error__retry" @click="tryAgain">Try again</button>
    </main>
  </div>
</template>

<style src="~/assets/css/reading-mode.css"></style>
