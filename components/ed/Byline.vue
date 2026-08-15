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
    <img class="by__face" src="/naveen.jpeg" :alt="`Portrait of ${store.name}`" width="40" height="40" loading="lazy" />
    <div class="by__text">
      <p class="by__name">{{ store.name }}</p>
      <p class="t-mono by__role">{{ role || store.tagline }}</p>
    </div>
  </div>
</template>

<style scoped>
.by { display: inline-flex; align-items: center; gap: 11rem; }
.by__face {
  width: 40rem; height: 40rem; border-radius: 50%; object-fit: cover; flex: none;
  border: var(--stroke) solid var(--line);
}
.by__text { display: flex; flex-direction: column; gap: 3rem; }
.by__name { margin: 0; font-size: 15.5rem; font-weight: 700; line-height: 1; }
.by__role { margin: 0; color: var(--muted); }
</style>
