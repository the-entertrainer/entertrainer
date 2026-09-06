<script setup lang="ts">
import { byCategory, type EditorialItem } from '~/content/editorial'

useSeoMeta({
  title: 'Empower · Free tools by Entertrainer',
  description: 'Browser tools for common writing, planning, and learning tasks.',
  ogUrl: 'https://entertrainer.in/empower'
})

const ICON_BY_ID: Record<string, string> = {
  storygen: '/storygen-icon-192.png',
  cadence: '/cadence-icon-192.png',
  easymcq: '/easymcq-icon-192.png',
  'better-emails': '/draftly-icon-192.png'
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
    <section class="empower__stage" aria-labelledby="empower-title">
      <div class="empower__tiles" aria-hidden="true"><i v-for="n in 42" :key="n"></i></div>
      <h1 id="empower-title">Empower</h1>
      <span>Browser tools for writing, planning, and learning — open and get on with it.</span>
    </section>

    <ol class="empower__grid">
      <li v-for="item in tools" :key="item.id" class="u-reveal">
        <NuxtLink :to="item.href" class="empower__card">
          <span class="empower__icon" aria-hidden="true">
            <img
              v-if="item.icon"
              :src="item.icon"
              :alt="''"
              width="52"
              height="52"
              loading="lazy"
              decoding="async"
            >
            <span v-else class="empower__icon-fallback">{{ item.title.slice(0, 1) }}</span>
          </span>
          <span class="empower__card-text">
            <strong class="empower__card-name">{{ item.title }}</strong>
            <span class="empower__card-blurb">{{ item.dek }}</span>
          </span>
          <span class="empower__card-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
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
  padding: clamp(24rem, 4vw, 56rem) var(--shell-gutter);
}

.empower__stage {
  position: relative;
  display: grid;
  min-height: min(420rem, calc(100dvh - 320rem));
  align-content: center;
  justify-items: start;
  overflow: hidden;
  padding: clamp(34rem, 7vw, 96rem);
  color: var(--ink);
  background: var(--signal-field);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-l);
}

.empower__tiles {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
  opacity: .46;
}

.empower__tiles i {
  border: 1rem solid color-mix(in srgb, var(--ink) 14%, transparent);
}

.empower__tiles i:nth-child(3n) {
  background: color-mix(in srgb, var(--signal-cobalt) 42%, transparent);
}

.empower__tiles i:nth-child(5n) {
  background: color-mix(in srgb, var(--accent) 28%, transparent);
}

.empower__stage > *:not(.empower__tiles) {
  position: relative;
}

.empower__stage h1 {
  max-width: 800rem;
  margin: 18rem 0;
  font: 500 clamp(65rem, 12vw, 180rem)/.82 var(--font-display);
  letter-spacing: -.08em;
}

.empower__stage > span {
  max-width: 480rem;
  font-size: 20rem;
  line-height: 1.4;
}

.empower__grid {
  list-style: none;
  margin: clamp(20rem, 3vw, 32rem) 0 0;
  padding: 0;
  display: grid;
  gap: 10rem;
}

.empower__card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 20rem;
  align-items: center;
  gap: clamp(16rem, 2.5vw, 24rem);
  padding: 20rem 22rem;
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-m);
  background: var(--paper);
  transition:
    background var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}

@media (hover: hover) {
  .empower__card:hover {
    background: var(--paper-2);
    border-color: var(--ink);
    transform: translateX(3rem);
  }
  .empower__card:hover .empower__card-arrow {
    transform: translate(2rem, -2rem);
  }
}

.empower__icon {
  position: relative;
  flex-shrink: 0;
  width: 52rem;
  height: 52rem;
  box-sizing: border-box;
  border-radius: var(--radius-s);
  background: var(--paper-2);
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
  font: 700 18rem/1 var(--font-display);
  color: var(--ink);
}

.empower__card-text {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4rem 12rem;
  min-width: 0;
}

.empower__card-name {
  font: 600 19rem/1.2 var(--font-display);
  flex-shrink: 0;
}

.empower__card-blurb {
  flex: 1 1 260rem;
  min-width: 0;
  font-size: 14rem;
  line-height: 1.4;
  color: var(--muted);
}

.empower__card-arrow {
  color: var(--muted);
  transition: transform var(--dur-fast) var(--ease-out);
}

@media (max-width: 640px) {
  .empower__card {
    align-items: start;
    gap: 14rem;
  }
  .empower__card-arrow {
    align-self: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .empower__card,
  .empower__card-arrow {
    transition: none;
  }
  .empower__card:hover {
    transform: none;
  }
}
</style>
