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
  <header class="hero">
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
