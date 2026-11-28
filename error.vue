<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'
import { NAV } from '~/content/editorial'

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

const code = computed(() => String(props.error?.statusCode ?? 500))
const indexOpen = useState('dp-index-open', () => false)

useHead({ title: isNotFound.value ? 'Page not found — Entertrainer' : 'Error — Entertrainer' })
</script>

<template>
  <div id="app-root">
    <EdMasthead />
    <main id="main">
      <div class="err__art" aria-hidden="true">
        <span class="err__sun" />
        <span class="err__code">{{ code }}</span>
        <span class="err__horizon" />
      </div>
      <UiContentShell :eyebrow="`Error ${error?.statusCode ?? ''}`" :title="title" :deck="deck">
        <ul class="err__list">
          <li v-for="it in NAV" :key="it.href">
            <NuxtLink :to="it.href" class="err__row">
              <span class="err__t">{{ it.label }}</span>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
            </NuxtLink>
          </li>
        </ul>
        <div class="err__actions">
          <NuxtLink to="/" class="ticket err__home">Back to the front page</NuxtLink>
          <button type="button" class="err__search" @click="indexOpen = true"><EdSignalIcon name="search" /> Search the index</button>
        </div>
      </UiContentShell>
    </main>
    <EdFooter />
    <EdIndexPalette />
    <div class="u-grain" aria-hidden="true" />
  </div>
</template>

<style scoped>
#app-root { min-height: 100dvh; background: var(--paper); display: flex; flex-direction: column; }
#main { flex: 1; }

.err__list { list-style: none; margin: 0 0 30rem; padding: 0; }
.err__row {
  display: grid; grid-template-columns: minmax(0, 1fr) 16rem;
  align-items: center; gap: 14rem;
  padding: 14rem 8rem;
  border-bottom: var(--stroke) solid var(--line);
  transition: background var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .err__row:hover { background: var(--yellow); color: var(--on-yellow); } }
.err__t { font-size: 17rem; font-weight: 600; }
.err__home { text-decoration: none; }
.err__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 14rem 22rem; }
.err__search { display: inline-flex; align-items: center; gap: 8rem; padding: 10rem 14rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-s); background: var(--paper); color: var(--ink); font: 700 14rem/1.1 var(--font-body); cursor: pointer; }
.err__search:hover { background: var(--paper-2); }

/* The press has stopped: the status number set in display type, sitting on a horizon with the sun half down behind it. */
.err__art { position: relative; display: grid; place-items: end center; height: clamp(150px, 24vw, 300px); margin: clamp(24px, 5vw, 56px) auto 0; max-width: var(--shell-max); overflow: hidden; }
.err__code { position: relative; z-index: 1; font: 400 clamp(120px, 22vw, 280px)/.8 var(--font-display); font-variation-settings: "opsz" 144, "SOFT" 60, "WONK" 1; letter-spacing: -.05em; color: var(--ink); transform: translateY(6%); }
.err__sun { position: absolute; left: 50%; bottom: 0; width: clamp(150px, 26vw, 340px); aspect-ratio: 1; border-radius: 50%; background: var(--accent); transform: translate(-50%, 50%); animation: err-set var(--dur-ident, 2400ms) var(--ease-sun, ease-out) both; }
.err__horizon { position: absolute; left: var(--shell-gutter); right: var(--shell-gutter); bottom: 0; z-index: 2; border-top: 3px solid var(--ink); }
@keyframes err-set { from { transform: translate(-50%, 10%); } to { transform: translate(-50%, 50%); } }
@media (prefers-reduced-motion: reduce) { .err__sun { animation: none; } }
html[data-reduce-motion="on"] .err__sun { animation: none; }
</style>
