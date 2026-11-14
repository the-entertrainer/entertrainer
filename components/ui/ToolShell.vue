<script setup lang="ts">
/**
 * Frame for Empower tools. Compact title + one-line deck, then the app.
 * No category chip or kicker — the tool name is enough.
 */
defineProps<{
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
          <NuxtLink to="/empower" class="t-mono ts__back u-underline">← Empower</NuxtLink>
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
.ts { position: relative; padding: clamp(1.375rem, 4vw, 2.5rem) 0 clamp(2.5rem, 7vh, 5rem); }
.ts__inner { max-width: 47.5rem; margin: 0 auto; padding: 0 var(--shell-gutter); }
.ts--wide .ts__inner { max-width: var(--shell-max); }

.ts__head {
  margin-bottom: clamp(1.375rem, 3vw, 2rem);
  padding-bottom: clamp(1.125rem, 2.5vw, 1.625rem);
  border-bottom: var(--stroke) solid var(--line);
}
.ts__top { display: flex; align-items: center; justify-content: flex-end; gap: 1rem; margin-bottom: 0.875rem; }
.ts__back { color: var(--muted); font-family: var(--font-mono); font-size: var(--type-meta); letter-spacing: var(--tracking-meta); text-transform: uppercase; }
.ts__title { font-size: var(--type-h1); line-height: 1.02; margin: 0; }
.ts__deck {
  margin: 0.75rem 0 0; max-width: 56ch;
  font-family: var(--font-reading); font-size: clamp(1rem, 1.5vw, 1.1875rem); line-height: 1.55;
  color: var(--muted);
}
</style>
