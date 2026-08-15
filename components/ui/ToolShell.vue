<script setup lang="ts">
/**
 * The frame the four web apps sit in.
 *
 * A tool is not an article, so this is not the story-page head: the title and
 * the one-line description are compact, and everything below them is the
 * application. What it does share with the rest of the publication is the
 * category chip, the frame, the gutter and the type — so opening EasyMCQ still
 * reads as a page of this site rather than a different product.
 */
defineProps<{
  eyebrow?: string
  title?: string
  deck?: string
  wide?: boolean
}>()
</script>

<template>
  <div class="ts" :class="{ 'ts--wide': wide }">
    <div class="ts__inner">
      <header class="ts__head">
        <div class="ts__top">
          <EdChip category="tools" media="web app" tone="solid" />
          <NuxtLink to="/tools" class="t-mono ts__back u-underline">← All web apps</NuxtLink>
        </div>
        <h1 class="ts__title">
          <slot name="title">{{ title }}</slot>
        </h1>
        <p v-if="deck || $slots.deck" class="ts__deck">
          <slot name="deck">{{ deck }}</slot>
        </p>
      </header>

      <div class="ts__content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ts { position: relative; padding: clamp(22rem, 4vw, 40rem) 0 clamp(40rem, 7vh, 80rem); }
.ts__inner { max-width: 760rem; margin: 0 auto; padding: 0 var(--shell-gutter); }
.ts--wide .ts__inner { max-width: var(--shell-max); }

.ts__head {
  margin-bottom: clamp(22rem, 3vw, 32rem);
  padding-bottom: clamp(18rem, 2.5vw, 26rem);
  border-bottom: var(--stroke) solid var(--line);
}
.ts__top { display: flex; align-items: center; justify-content: space-between; gap: 16rem; margin-bottom: 18rem; }
.ts__back { color: var(--muted); font-family: var(--font-mono); font-size: var(--type-meta); letter-spacing: var(--tracking-meta); text-transform: uppercase; }
.ts__title { font-size: var(--type-h1); line-height: 1.02; margin: 0; }
.ts__deck {
  margin: 12rem 0 0; max-width: 56ch;
  font-family: var(--font-reading); font-size: clamp(16rem, 1.5vw, 19rem); line-height: 1.55;
  color: var(--muted);
}
</style>
