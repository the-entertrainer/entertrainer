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

const routes: HomeRoute[] = [
  {
    name: 'Elevate',
    href: '/elevate',
    tip: 'Curious pieces that might teach you something.'
  },
  {
    name: 'Empower',
    href: '/empower',
    tip: 'Tools for the awkward, repeating work.'
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
  <main id="main" class="route-index">
    <header class="route-index__intro">
      <h1 class="route-index__headline" :class="{ 'is-ready': quoteReady }">
        <span class="route-index__quote">{{ quote.text }}</span>
      </h1>
      <p v-if="quote.attribution" class="route-index__attribution">{{ quote.attribution }}</p>
    </header>

    <nav class="route-index__switchboard" aria-label="Entertrainer sections">
      <div class="route-index__hub" aria-hidden="true">
        <EdWordmark variant="mark" :size="94" />
      </div>

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
          <p
            v-if="route.tip && openTip === route.name"
            :id="tipId(route.name)"
            class="route-index__tip"
            data-route-tip
            role="note"
          >
            {{ route.tip }}
          </p>
        </li>
      </ol>
    </nav>
  </main>
</template>

<style scoped>
/* Compact home: knowledge quote + tactile route switchboard. */
.route-index {
  max-width: var(--shell-wide);
  min-height: min(720rem, calc(100dvh - 130rem));
  margin: 0 auto;
  padding: clamp(36rem, 6vw, 82rem) var(--shell-gutter) clamp(54rem, 7vw, 96rem);
  display: grid;
  align-content: center;
  gap: clamp(30rem, 5vw, 68rem);
}

.route-index__intro { max-width: 920rem; }

.route-index__attribution {
  margin: 12rem 0 0;
  max-width: 36ch;
  color: var(--ink-soft);
  font: 600 11rem/1.35 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
}

.route-index__headline {
  margin: 0;
  font: 500 clamp(28rem, 4.6vw, 52rem)/1.18 var(--font-display);
  letter-spacing: -.035em;
  color: var(--ink);
  max-width: 28ch;
}

.route-index__quote {
  display: inline;
  background-image: linear-gradient(
    105deg,
    var(--ink) 0%,
    var(--ink) 42%,
    color-mix(in srgb, var(--accent-strong, #EAB900) 88%, var(--ink)) 52%,
    var(--ink) 62%,
    var(--ink) 100%
  );
  background-size: 220% 100%;
  background-position: 100% 50%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.route-index__headline.is-ready .route-index__quote {
  animation: route-quote-shimmer 11s ease-in-out infinite;
}

@keyframes route-quote-shimmer {
  0%, 22% { background-position: 100% 50%; }
  50% { background-position: 0% 50%; }
  78%, 100% { background-position: 100% 50%; }
}

.route-index__switchboard {
  position: relative;
  display: grid;
  grid-template-columns: minmax(190rem, .62fr) minmax(0, 1.38fr);
  gap: clamp(22rem, 5vw, 78rem);
  align-items: center;
  padding: clamp(20rem, 3vw, 38rem);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-xl);
  background: color-mix(in srgb, var(--signal-field) 55%, var(--paper-2));
  box-shadow: 10rem 10rem 0 color-mix(in srgb, var(--accent) 22%, transparent);
  overflow: hidden;
}

[data-theme="dark"] .route-index__switchboard {
  background: var(--paper-2);
  box-shadow: 10rem 10rem 0 color-mix(in srgb, var(--accent) 28%, transparent);
}

.route-index__switchboard::before {
  content: '';
  position: absolute;
  inset: auto -16% -68% auto;
  width: min(480rem, 54vw);
  aspect-ratio: 1;
  border: 38rem solid color-mix(in srgb, var(--accent) 22%, transparent);
  border-radius: 50%;
  pointer-events: none;
}

.route-index__hub {
  position: relative;
  z-index: 1;
  display: grid;
  width: min(100%, 260rem);
  aspect-ratio: 1;
  place-items: center;
  justify-self: center;
  border: var(--stroke) solid var(--ink);
  border-radius: 50%;
  background: var(--signal-field);
  box-shadow: 8rem 8rem 0 var(--ink);
}

.route-index__hub::before,
.route-index__hub::after {
  content: '';
  position: absolute;
  inset: 18%;
  border: var(--stroke) solid var(--ink);
  border-radius: 50%;
  opacity: .14;
}

.route-index__hub::after { inset: 34%; }
.route-index__hub :deep(.wordmark),
.route-index__hub :deep(.wm) { position: relative; z-index: 1; }

.route-index__routes {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.route-index__route {
  display: grid;
  gap: 0;
  align-content: start;
}

.route-index__card {
  position: relative;
  display: grid;
  min-height: 118rem;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-l);
  color: var(--ink);
  background: color-mix(in srgb, var(--paper) 92%, transparent);
  overflow: hidden;
  transition:
    transform var(--dur-fast) var(--ease-spring),
    background var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out);
}

.route-index__link {
  display: grid;
  grid-column: 1 / 2;
  grid-row: 1;
  align-content: end;
  min-height: 118rem;
  padding: 18rem;
  padding-right: 48rem;
  color: inherit;
  text-decoration: none;
}

.route-index__route strong {
  margin: 0;
  font: 500 clamp(28rem, 3vw, 42rem)/.88 var(--font-display);
  letter-spacing: -.055em;
}

.route-index__info {
  position: absolute;
  top: 14rem;
  right: 14rem;
  z-index: 2;
  display: inline-grid;
  place-items: center;
  width: 26rem;
  height: 26rem;
  margin: 0;
  padding: 0;
  border: var(--stroke) solid var(--ink);
  border-radius: 50%;
  background: color-mix(in srgb, var(--paper) 88%, var(--accent));
  color: var(--ink);
  font: 700 12rem/1 var(--font-mono);
  letter-spacing: 0;
  text-transform: lowercase;
  cursor: pointer;
  transition:
    background var(--dur-fast) var(--ease-out),
    transform var(--dur-fast) var(--ease-spring);
}

.route-index__info:hover {
  background: var(--signal-field);
}

.route-index__info:focus-visible {
  outline: 3rem solid var(--focus);
  outline-offset: 3rem;
}

.route-index__route.is-open .route-index__info {
  background: var(--signal-field);
}

.route-index__tip {
  margin: 8rem 2rem 0;
  padding: 10rem 12rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m, 10rem);
  background: color-mix(in srgb, var(--paper) 94%, var(--accent));
  color: var(--ink);
  font: 500 13.5rem/1.45 var(--font-ui);
  box-shadow: 3rem 3rem 0 color-mix(in srgb, var(--accent) 28%, transparent);
}

@media (hover: hover) {
  .route-index__card:has(.route-index__link:hover) {
    background: var(--signal-field);
    transform: translate(-3rem, -3rem);
    box-shadow: 5rem 5rem 0 var(--ink);
  }
}

.route-index__link:focus-visible {
  outline: 3rem solid var(--focus);
  outline-offset: -4rem;
  border-radius: inherit;
}

@media (max-width: 780px) {
  .route-index { min-height: auto; gap: 26rem; }
  .route-index__headline { font-size: clamp(24rem, 6.5vw, 34rem); max-width: none; }
  .route-index__switchboard {
    display: block;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    overflow: visible;
  }
  .route-index__switchboard::before { display: none; }
  .route-index__hub { display: none; }
  .route-index__routes { display: block; border-top: var(--stroke) solid var(--ink); }
  .route-index__route { display: block; }
  .route-index__card {
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    border: 0;
    border-bottom: var(--stroke) solid var(--ink);
    border-radius: 0;
    background: transparent;
    overflow: visible;
  }
  .route-index__link {
    min-height: 0;
    display: flex;
    align-items: center;
    padding: 16rem 4rem;
    padding-right: 44rem;
  }
  .route-index__route strong {
    margin: 0;
    font-size: clamp(32rem, 9vw, 42rem);
  }
  .route-index__info {
    position: absolute;
    top: 50%;
    right: 4rem;
    transform: translateY(-50%);
  }
  .route-index__info:hover { transform: translateY(-50%); }
  .route-index__tip {
    margin: 0 0 12rem;
    border-radius: var(--radius-m, 10rem);
  }
  @media (hover: hover) {
    .route-index__card:has(.route-index__link:hover) {
      transform: none;
      box-shadow: none;
      background: color-mix(in srgb, var(--signal-field) 70%, transparent);
    }
  }
}

@media (max-width: 460px) {
  .route-index { padding-top: 24rem; gap: 22rem; }
  .route-index__headline { font-size: clamp(22rem, 7vw, 30rem); }
  .route-index__link { padding: 14rem 2rem; padding-right: 40rem; }
  .route-index__route strong { font-size: 34rem; }
  .route-index__info { right: 2rem; }
}

@media (prefers-reduced-motion: reduce) {
  .route-index__quote {
    animation: none !important;
    color: var(--ink);
    background: none;
    -webkit-background-clip: unset;
    background-clip: unset;
  }
  .route-index__card,
  .route-index__info { transition: none; }
  .route-index__card:has(.route-index__link:hover) { transform: none; }
}

:global(html[data-reduce-motion="on"]) .route-index__quote {
  animation: none !important;
  color: var(--ink);
  background: none;
  -webkit-background-clip: unset;
  background-clip: unset;
}
:global(html[data-reduce-motion="on"]) .route-index__card,
:global(html[data-reduce-motion="on"]) .route-index__info { transition: none; }
</style>
