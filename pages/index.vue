<script setup lang="ts">
import { KNOWLEDGE_QUOTES, pickKnowledgeQuote } from '~/content/knowledge-quotes'

useSeoMeta({
  title: 'Entertrainer · Elevate, Empower, Engage',
  description: 'Stories for questions that keep returning, tools for work that keeps repeating, and small games for short detours.',
  ogTitle: 'Entertrainer · The Three Es',
  ogDescription: 'Elevate, Empower, Engage.',
  ogUrl: 'https://entertrainer.in/'
})

type HomeRoute = {
  name: string
  href: string
  tip?: string
}

const notices = [
  {
    kicker: 'Essay',
    title: '1 = 2',
    dek: 'Five tidy lines of school algebra that say two equals one.',
    href: '/elevate/one-equals-two-lets-break-maths'
  },
  {
    kicker: 'Tool',
    title: 'Draftly',
    dek: 'Paste a rough email. Leave with a clearer one.',
    href: '/tools/better-emails'
  },
  {
    kicker: 'Game',
    title: 'AstroClock',
    dek: 'Birth place and time, then a dial for today.',
    href: '/engage/astroclock'
  }
]

const routes: HomeRoute[] = [
  {
    name: 'Elevate',
    href: '/elevate',
    tip: 'Essays that start in a room and refuse the tidy story.'
  },
  {
    name: 'Empower',
    href: '/empower',
    tip: 'Two free tools that earn their keep.'
  },
  {
    name: 'Engage',
    href: '/engage',
    tip: 'Short games and little detours.'
  },
  { name: 'About me', href: '/about' }
]

const openTip = ref<string | null>(null)

const tipId = (name: string) => `home-tip-${name.toLowerCase().replace(/\s+/g, '-')}`

const toggleTip = (name: string, event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  openTip.value = openTip.value === name ? null : name
}

const closeTip = () => {
  openTip.value = null
}

const onDocPointer = (event: Event) => {
  const target = event.target as Element | null
  if (!target?.closest?.('[data-route-tip]')) closeTip()
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeTip()
}

// SSR-stable first quote; client picks once per home visit / visibility return — no interval rotation.
const quote = ref(KNOWLEDGE_QUOTES[0] ?? { text: '', attribution: '' })
const quoteReady = ref(false)

const refreshQuote = () => {
  quote.value = pickKnowledgeQuote()
  quoteReady.value = true
}

const onVisibility = () => {
  // Only when the tab/screen becomes visible again after being hidden.
  if (document.visibilityState === 'visible') refreshQuote()
}

onMounted(() => {
  refreshQuote()
  document.addEventListener('visibilitychange', onVisibility)
  document.addEventListener('pointerdown', onDocPointer)
  document.addEventListener('keydown', onKeydown)
})

// Keep-alive return to home: treat as a fresh screen visit.
onActivated(() => {
  refreshQuote()
  closeTip()
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibility)
  document.removeEventListener('pointerdown', onDocPointer)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="route-index">
    <header class="route-index__intro">
      <h1 class="route-index__headline" :class="{ 'is-ready': quoteReady }">
        <span class="route-index__quote">{{ quote.text }}</span>
      </h1>
      <p v-if="quote.attribution" class="route-index__attribution">{{ quote.attribution }}</p>
    </header>

    <nav class="route-index__switchboard" aria-label="Entertrainer sections">
      <ol class="route-index__routes">
        <li
          v-for="route in routes"
          :key="route.href"
          class="route-index__route"
          :class="{ 'is-open': openTip === route.name }"
        >
          <div class="route-index__card">
            <NuxtLink :to="route.href" class="route-index__link">
              <strong>{{ route.name }}</strong>
            </NuxtLink>
            <button
              v-if="route.tip"
              type="button"
              class="route-index__info u-icon-btn u-icon-btn--idle"
              data-route-tip
              :aria-expanded="openTip === route.name"
              :aria-controls="tipId(route.name)"
              :aria-label="`About ${route.name}`"
              @click="toggleTip(route.name, $event)"
            >
              <span aria-hidden="true">i</span>
            </button>
          </div>
          <Transition name="route-tip">
            <p
              v-if="route.tip && openTip === route.name"
              :id="tipId(route.name)"
              class="route-index__tip"
              data-route-tip
              role="note"
            >
              {{ route.tip }}
            </p>
          </Transition>
        </li>
      </ol>
    </nav>

    <aside class="route-index__notices" aria-label="Also on the site">
      <p class="route-index__notices-label">On the desk</p>
      <ul class="route-index__notices-list">
        <li v-for="notice in notices" :key="notice.href">
          <NuxtLink :to="notice.href" class="route-index__notice">
            <span class="route-index__notice-kicker">{{ notice.kicker }}</span>
            <span class="route-index__notice-title">{{ notice.title }}</span>
            <span class="route-index__notice-dek">{{ notice.dek }}</span>
          </NuxtLink>
        </li>
      </ul>
    </aside>
  </div>
</template>

<style scoped>
/* Home: the quote is the 76px display. Routes are the 29px step. */
.route-index {
  max-width: calc(var(--column) + (var(--shell-gutter) * 2));
  min-height: min(720rem, calc(100dvh - var(--nav-h)));
  margin: 0 auto;
  padding: var(--space-55) var(--shell-gutter) var(--space-89);
  display: grid;
  align-content: center;
  gap: var(--space-34);
}

.route-index__intro { max-width: var(--column); }

.route-index__attribution {
  margin: var(--space-21) 0 0;
  max-width: 36ch;
  color: var(--muted);
  font: 500 var(--type-meta)/1.35 var(--font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
}

.route-index__headline {
  margin: 0;
  font: 500 var(--type-hero)/0.92 var(--font-display);
  letter-spacing: -.03em;
  color: var(--ink);
  max-width: 16ch;
}

.route-index__quote { color: var(--ink); }

.route-index__switchboard { max-width: 420rem; }

.route-index__routes {
  display: block;
  padding: 0;
  margin: 0;
  list-style: none;
  border-top: var(--stroke) solid var(--ink);
}

.route-index__route { display: block; }

.route-index__card {
  position: relative;
  display: block;
  border-bottom: var(--stroke) solid var(--ink);
  color: var(--ink);
  background: transparent;
}

.route-index__link {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-13);
  min-height: var(--space-55);
  padding: var(--space-13) var(--space-34) var(--space-13) 0;
  color: inherit;
  text-decoration: none;
}

.route-index__route strong {
  margin: 0;
  font: 500 var(--type-card)/1.05 var(--font-display);
  letter-spacing: -.02em;
}

.route-index__info {
  position: absolute;
  top: 50%;
  right: 0;
  z-index: 2;
  display: inline-grid;
  place-items: center;
  width: var(--space-21);
  height: var(--space-21);
  margin: 0;
  padding: 0;
  border: var(--stroke) solid var(--ink);
  border-radius: 50%;
  background: var(--paper);
  color: var(--ink);
  font: 500 var(--type-meta)/1 var(--font-mono);
  letter-spacing: 0;
  text-transform: lowercase;
  cursor: pointer;
  transform: translateY(-50%);
}

.route-index__info:hover,
.route-index__route.is-open .route-index__info { background: var(--accent); }

.route-index__info::before {
  content: '';
  position: absolute;
  inset: -12rem;
}

.route-index__info:focus-visible {
  outline: 2rem solid var(--ink);
  outline-offset: 3rem;
}

.route-index__tip {
  margin: 0 0 var(--space-13);
  padding: var(--space-13);
  border: var(--stroke) solid var(--ink);
  background: var(--accent);
  color: var(--accent-ink);
  font: 400 var(--type-body)/1.45 var(--font-ui);
}

.route-tip-enter-active,
.route-tip-leave-active {
  transition: opacity 160ms var(--ease-out), transform 160ms var(--ease-out);
}
.route-tip-enter-from,
.route-tip-leave-to {
  opacity: 0;
  transform: translateY(-4rem);
}

@media (hover: hover) {
  .route-index__card:has(.route-index__link:hover) {
    background: color-mix(in srgb, var(--accent) 35%, var(--paper));
  }
}

.route-index__link:focus-visible {
  outline: 2rem solid var(--ink);
  outline-offset: 3rem;
}

.route-index__notices {
  max-width: var(--column);
  margin: 0;
}

.route-index__notices-label {
  margin: 0 0 var(--space-13);
  color: var(--muted);
  font: 500 var(--type-meta)/1.2 var(--font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
}

.route-index__notices-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-13);
  margin: 0;
  padding: 0;
  list-style: none;
}

.route-index__notice {
  display: grid;
  align-content: start;
  gap: 4rem;
  min-height: 44rem;
  padding: var(--space-13) var(--space-13) var(--space-13) 0;
  border-top: 2rem solid var(--accent-text);
  color: var(--ink);
  text-decoration: none;
}

.route-index__notice-kicker {
  color: var(--accent-text);
  font: 700 var(--type-meta)/1.2 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
}

.route-index__notice-title {
  font: 500 18rem/1.2 var(--font-display);
  letter-spacing: -.02em;
}

.route-index__notice-dek {
  color: var(--muted);
  font: 400 14rem/1.4 var(--font-ui);
}

@media (hover: hover) {
  .route-index__notice:hover { background: var(--paper-2); }
}

.route-index__notice:focus-visible {
  outline: 2rem solid var(--ink);
  outline-offset: 3rem;
}

@media (max-width: 780px) {
  .route-index { min-height: auto; gap: var(--space-34); padding-top: var(--space-34); }
  .route-index__headline { font-size: var(--type-h1); max-width: none; }
  .route-index__notices-list { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .route-index__card,
  .route-index__info,
  .route-tip-enter-active,
  .route-tip-leave-active { transition: none; }
  .route-tip-enter-from,
  .route-tip-leave-to { opacity: 1; transform: none; }
}
</style>
