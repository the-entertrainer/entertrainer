<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'
import { WORLD_ZONE_LINKS } from '~/composables/world/worldRoutes'

/**
 * Nuxt's app-wide error page. It replaces app.vue wholesale, so everything the
 * shell normally provides — the theme sync, the masthead, the footer — has to
 * be mounted again here or a 404 becomes the one page on the site with no way
 * out of it.
 */
const props = defineProps<{ error: { statusCode?: number; statusMessage?: string; message?: string } }>()

const isNotFound = computed(() => props.error?.statusCode === 404)
const title = computed(() => isNotFound.value ? 'This dock is empty.' : 'This page did not load.')
const deck = computed(() => isNotFound.value
  ? 'That address is not on the map.'
  : 'The link is fine. The page failed. Try again, or pick a zone.')

useHead({ title: isNotFound.value ? 'This dock is empty. — Entertrainer' : 'This page did not load. — Entertrainer' })

onMounted(() => {
  useThemeStore().init()
  const heading = document.querySelector('#main h1')
  if (heading instanceof HTMLElement) {
    heading.tabIndex = -1
    heading.focus()
  }
})

function tryAgain() {
  if (import.meta.client) window.location.reload()
}
</script>

<template>
  <div id="app-root">
    <EdMasthead />
    <main id="main">
      <UiContentShell :eyebrow="`Error ${error?.statusCode ?? ''}`" :title="title" :deck="deck">
        <ul class="err__list">
          <li v-for="it in WORLD_ZONE_LINKS" :key="it.id">
            <NuxtLink :to="it.route" class="err__row">
              <span class="err__t">{{ it.label }}</span>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
            </NuxtLink>
          </li>
        </ul>
        <p class="err__actions">
          <button v-if="!isNotFound" type="button" class="ticket" @click="tryAgain">Try again</button>
          <NuxtLink to="/" class="ticket">Back to the front page</NuxtLink>
        </p>
      </UiContentShell>
    </main>
    <EdFooter />
    <div class="u-grain" aria-hidden="true" />
  </div>
</template>

<style scoped>
#app-root { min-height: 100dvh; background: var(--paper); display: flex; flex-direction: column; }
#main { flex: 1; }

.err__list { list-style: none; margin: 0 0 1.875rem; padding: 0; }
.err__row {
  display: grid; grid-template-columns: minmax(0, 1fr) 1rem;
  align-items: center; gap: 0.875rem;
  min-height: 2.75rem;
  padding: 0.875rem 0.5rem;
  border-bottom: var(--stroke) solid var(--line);
  transition: background var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .err__row:hover { background: var(--yellow); color: var(--on-yellow); } }
.err__t { font-size: 1.0625rem; font-weight: 600; }
.err__actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.err__actions .ticket { text-decoration: none; cursor: pointer; }
</style>
