<script setup lang="ts">
import { useContentStore } from '~/stores/content'

/**
 * The contributor byline. One writer on this publication, which is exactly why
 * it is worth printing: everything here was made by a named person who can be
 * asked about it.
 */
withDefaults(defineProps<{ role?: string }>(), { role: '' })
const store = useContentStore()
</script>

<template>
  <div class="by">
    <span class="by__face" role="img" :aria-label="`Paper Signal author mark for ${store.name}`"><i /><i /><i /></span>
    <div class="by__text">
      <p class="by__name">{{ store.name }}</p>
      <p class="t-mono by__role">{{ role || store.tagline }}</p>
    </div>
  </div>
</template>

<style scoped>
.by { display: inline-flex; align-items: center; gap: 0.6875rem; }
.by__face { position: relative; display: inline-flex; align-items: end; gap: 0.1875rem; width: 2.5rem; height: 2.5rem; padding: 0.5rem; background: var(--signal-field); border: var(--stroke) solid var(--signal-rule); box-shadow: 0.25rem 0.25rem 0 var(--signal-sheet); flex: none; }.by__face i { width: 0.3125rem; background: var(--signal-cobalt); }.by__face i:nth-child(1) { height: 0.875rem; }.by__face i:nth-child(2) { height: 1.25rem; }.by__face i:nth-child(3) { height: 0.6875rem; }
.by__text { display: flex; flex-direction: column; gap: 0.1875rem; }
.by__name { margin: 0; font-size: 0.96875rem; font-weight: 700; line-height: 1; }
.by__role { margin: 0; color: var(--muted); }
</style>
