<script setup lang="ts">
import type { Category, Media } from '~/content/editorial'

/**
 * The head of a story page.
 *
 * Reveal order is headline, then metadata, then media — the sequence the spec
 * asks for, and the sequence that matches how the page is read. It is done
 * with a stagger on `.t-fade-up`, which is CSS-only and collapses under
 * reduced motion, so a slow bundle can never leave a headline invisible.
 */
defineProps<{
  category?: Category
  media?: Media
  title: string
  deck?: string
  stamp?: string
  minutes?: number
  /** Retained for call-site compatibility; hero counters are intentionally not shown. */
  count?: string
}>()
</script>

<template>
  <header :class="['hero', category ? `hero--${category}` : 'hero--default']">
    <h1 class="hero__title t-display">{{ title }}</h1>

    <p v-if="deck" class="hero__deck">{{ deck }}</p>

    <div v-if="stamp || minutes" class="hero__meta">
      <p v-if="stamp || minutes" class="t-mono hero__stamp">
        <span v-if="stamp">{{ stamp }}</span>
        <template v-if="stamp && minutes"><span aria-hidden="true"> · </span></template>
        <span v-if="minutes">{{ minutes }} min</span>
      </p>
    </div>

    <slot />
  </header>
</template>

<style scoped>
.hero {
  padding-bottom: clamp(24rem, 4vw, 40rem);
  border-bottom: var(--stroke) solid var(--line);
  margin-bottom: clamp(28rem, 5vw, 52rem);
}
/* Sized a rung under --type-display. Bangers is a caps face with no lowercase
   to give the eye a break, so a headline of more than about six words needs
   the smaller setting or it stops being a headline and becomes a wall. */
.hero__title {
  font-size: clamp(34rem, 4.6vw, 66rem);
  margin: 0;
  max-width: 20ch;
}
.hero--projects .hero__title { animation: hero-projects-title 620ms var(--ease-expo-out) both; }
.hero--tools .hero__title { animation: hero-tools-title 560ms var(--ease-spring) both; }
.hero--practice .hero__title { animation: hero-practice-title 640ms var(--ease-out) both; }
.hero--story .hero__title { animation: hero-story-title 720ms var(--ease-expo-out) both; }
.hero--projects .hero__deck, .hero--tools .hero__deck, .hero--practice .hero__deck, .hero--story .hero__deck { animation: hero-deck 420ms var(--ease-out) 120ms both; }
@keyframes hero-projects-title { from { opacity: 0; transform: translateX(-18rem); letter-spacing: .04em; } to { opacity: 1; transform: none; } }
@keyframes hero-tools-title { from { opacity: 0; transform: translateY(12rem) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes hero-practice-title { from { opacity: 0; clip-path: inset(0 100% 0 0); } to { opacity: 1; clip-path: inset(0 0 0 0); } }
@keyframes hero-story-title { from { opacity: 0; transform: translateY(14rem); filter: blur(5px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes hero-deck { from { opacity: 0; transform: translateY(8rem); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .hero--projects .hero__title, .hero--tools .hero__title, .hero--practice .hero__title, .hero--story .hero__title,
  .hero--projects .hero__deck, .hero--tools .hero__deck, .hero--practice .hero__deck, .hero--story .hero__deck { animation: none; }
}
.hero__deck {
  font-family: var(--font-reading);
  font-size: clamp(17rem, 1.7vw, 21rem); line-height: 1.55;
  color: var(--muted);
  max-width: 52ch;
  margin: clamp(16rem, 2vw, 24rem) 0 0;
}
.hero__meta {
  margin-top: clamp(20rem, 3vw, 30rem);
  display: flex; flex-wrap: wrap; align-items: center; gap: 14rem 24rem;
}
.hero__stamp { margin: 0; color: var(--muted); }
</style>
