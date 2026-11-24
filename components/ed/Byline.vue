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
.by { display: inline-flex; align-items: center; gap: 11rem; }
.by__face { position: relative; display: inline-flex; align-items: end; gap: 3rem; width: 40rem; height: 40rem; padding: 8rem; background: var(--signal-field); border: var(--stroke) solid var(--signal-rule); box-shadow: 4rem 4rem 0 var(--signal-sheet); flex: none; }.by__face i { width: 5rem; background: var(--signal-cobalt); }.by__face i:nth-child(1) { height: 14rem; }.by__face i:nth-child(2) { height: 20rem; }.by__face i:nth-child(3) { height: 11rem; }
.by__text { display: flex; flex-direction: column; gap: 3rem; }
.by__name { margin: 0; font-size: 15.5rem; font-weight: 700; line-height: 1; }
.by__role { margin: 0; color: var(--muted); }
</style>
