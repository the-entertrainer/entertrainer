<script setup lang="ts">
import { byCategory, type EditorialItem } from '~/content/editorial'

useSeoMeta({
  title: 'Empower · Free tools by Entertrainer',
  description: 'Two free browser tools that earn their keep — quiz distractors and email polish. No sign-up.',
  ogUrl: 'https://entertrainer.in/empower'
})

const ICON_BY_ID: Record<string, string> = {
  easymcq: '/easymcq-icon.svg',
  'better-emails': '/draftly-icon.svg'
}

const tools = computed(() =>
  byCategory('tools').map((item: EditorialItem) => ({
    ...item,
    icon: ICON_BY_ID[item.id] || item.image || ''
  }))
)
</script>

<template>
  <main id="main" class="empower">
    <header class="empower__hero" aria-labelledby="empower-title">
      <h1 id="empower-title">Empower</h1>
      <p class="empower__lede">
        Two free tools for work that keeps repeating. Open the browser and get on with it.
      </p>
    </header>

    <ol class="empower__grid">
      <li v-for="item in tools" :key="item.id" class="u-reveal">
        <NuxtLink :to="item.href" class="empower__card">
          <span class="empower__icon" aria-hidden="true">
            <img
              v-if="item.icon"
              :src="item.icon"
              :alt="''"
              width="64"
              height="64"
              loading="lazy"
              decoding="async"
            >
            <span v-else class="empower__icon-fallback">{{ item.title.slice(0, 1) }}</span>
          </span>
          <span class="empower__card-text">
            <strong class="empower__card-name">{{ item.title }}</strong>
            <span class="empower__card-blurb">{{ item.dek }}</span>
            <span v-if="item.stamp" class="empower__card-stamp">{{ item.stamp }}</span>
          </span>
          <span class="empower__card-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </span>
        </NuxtLink>
      </li>
    </ol>
  </main>
</template>

<style scoped>
.empower {
  min-height: calc(100dvh - 74rem);
  max-width: var(--shell-wide);
  margin: 0 auto;
  padding: clamp(24rem, 4vw, 56rem) var(--shell-gutter) clamp(48rem, 8vw, 96rem);
}

.empower__hero {
  padding-bottom: clamp(20rem, 3vw, 32rem);
  border-bottom: var(--stroke) solid var(--ink);
  margin-bottom: clamp(18rem, 3vw, 28rem);
}
.empower__hero h1 {
  margin: 0;
  font: 500 clamp(56rem, 12vw, 120rem)/.82 var(--font-display);
  letter-spacing: -.06em;
}
.empower__lede {
  margin: clamp(10rem, 2vw, 16rem) 0 0;
  max-width: 42ch;
  font: 400 clamp(16rem, 1.6vw, 19rem)/1.45 var(--font-reading);
  color: var(--ink-soft);
}

.empower__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12rem;
}

.empower__card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 22rem;
  align-items: center;
  gap: clamp(16rem, 2.5vw, 28rem);
  padding: clamp(18rem, 2.5vw, 26rem) clamp(18rem, 2.5vw, 24rem);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  background: var(--paper);
  box-shadow: 4rem 4rem 0 color-mix(in srgb, var(--ink) 12%, transparent);
  transition:
    background var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out),
    transform var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out);
}

@media (hover: hover) {
  .empower__card:hover {
    background: var(--accent);
    color: var(--accent-ink);
    transform: translate(-2rem, -2rem);
    box-shadow: 6rem 6rem 0 var(--ink);
  }
  .empower__card:hover .empower__card-blurb,
  .empower__card:hover .empower__card-stamp,
  .empower__card:hover .empower__card-arrow {
    color: var(--accent-ink);
  }
  .empower__card:hover .empower__card-arrow {
    transform: translate(2rem, -2rem);
  }
}

.empower__card:focus-visible {
  outline: 3rem solid var(--focus);
  outline-offset: 3rem;
}

.empower__icon {
  position: relative;
  flex-shrink: 0;
  width: 64rem;
  height: 64rem;
  box-sizing: border-box;
  border-radius: var(--radius-s);
  background: var(--paper);
  border: var(--stroke) solid var(--ink);
  overflow: hidden;
  display: grid;
  place-items: center;
}

.empower__icon img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empower__icon-fallback {
  font: 700 22rem/1 var(--font-display);
  color: var(--ink);
}

.empower__card-text {
  display: grid;
  gap: 6rem;
  min-width: 0;
}

.empower__card-name {
  font: 600 clamp(22rem, 3vw, 28rem)/1.15 var(--font-display);
  letter-spacing: -.02em;
}

.empower__card-blurb {
  font-size: 15rem;
  line-height: 1.4;
  color: var(--muted);
}

.empower__card-stamp {
  font: 700 11rem/1.2 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.empower__card-arrow {
  color: var(--muted);
  transition: transform var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}

@media (max-width: 640px) {
  .empower__card {
    grid-template-columns: auto minmax(0, 1fr);
    gap: 14rem;
  }
  .empower__card-arrow { display: none; }
  .empower__icon { width: 52rem; height: 52rem; }
}

@media (prefers-reduced-motion: reduce) {
  .empower__card,
  .empower__card-arrow { transition: none; }
  .empower__card:hover { transform: none; }
}
</style>
