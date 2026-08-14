<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'
import { ITEMS } from '~/content/editorial'

/**
 * Nuxt's app-wide error page. It replaces app.vue wholesale, so everything the
 * shell normally provides — the theme sync, the masthead, the footer — has to
 * be mounted again here or a 404 becomes the one page on the site with no way
 * out of it.
 */
const props = defineProps<{ error: { statusCode?: number; statusMessage?: string; message?: string } }>()

onMounted(() => useThemeStore().init())

const isNotFound = computed(() => props.error?.statusCode === 404)
const title = computed(() => isNotFound.value ? 'This page has not been built yet' : 'Something went sideways')
const deck = computed(() => isNotFound.value
  ? 'You found a corner of the site that does not exist. Nothing is broken — there is simply nothing here. Here is everything that does exist.'
  : 'That was not supposed to happen. It has been quietly noted by nobody at all — this is a static site — so heading back is the whole recovery plan.'
)

useHead({ title: isNotFound.value ? 'Page not found — Entertrainer' : 'Error — Entertrainer' })
</script>

<template>
  <div id="app-root">
    <EdMasthead />
    <main id="main">
      <UiContentShell :eyebrow="`Error ${error?.statusCode ?? ''}`" :title="title" :deck="deck">
        <ul class="err__list">
          <li v-for="it in ITEMS.slice(0, 6)" :key="it.id">
            <NuxtLink :to="it.href" class="err__row">
              <EdChip :category="it.category" />
              <span class="err__t">{{ it.title }}</span>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
            </NuxtLink>
          </li>
        </ul>
        <NuxtLink to="/" class="ticket err__home">Back to the front page</NuxtLink>
      </UiContentShell>
    </main>
    <EdFooter />
    <div class="u-grain" aria-hidden="true" />
  </div>
</template>

<style scoped>
#app-root { min-height: 100dvh; background: var(--paper); display: flex; flex-direction: column; }
#main { flex: 1; }

.err__list { list-style: none; margin: 0 0 30rem; padding: 0; }
.err__row {
  display: grid; grid-template-columns: auto minmax(0, 1fr) 16rem;
  align-items: center; gap: 14rem;
  padding: 14rem 8rem;
  border-bottom: var(--stroke-hair) solid var(--line);
  transition: background var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .err__row:hover { background: var(--sun); color: var(--on-sun); } }
.err__t { font-size: 17rem; font-weight: 600; }
.err__home { text-decoration: none; }
</style>
