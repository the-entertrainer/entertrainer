<script setup lang="ts">
defineProps<{
  src: string
  alt: string
}>()

const ready = ref(true)
</script>

<template>
  <span class="ed-editorial-image" :class="{ 'is-fallback': !ready }">
    <img v-if="ready" :src="src" :alt="alt" @error="ready = false">
    <span v-else class="ed-editorial-image__fallback" role="img" :aria-label="alt">
      <span aria-hidden="true"></span>
    </span>
  </span>
</template>

<style scoped>
/* Controlled editorial imagery: a warm, brand-consistent fallback preserves the magazine rhythm when a managed image is not yet available. */
.ed-editorial-image { display: block; width: 100%; height: 100%; background: var(--paper-2); }
.ed-editorial-image img { display: block; width: 100%; height: 100%; object-fit: inherit; }
.ed-editorial-image__fallback { display: grid; width: 100%; height: 100%; min-height: 180rem; place-items: center; background: var(--accent); }
.ed-editorial-image__fallback span { width: 18%; aspect-ratio: 1; border: var(--stroke) solid var(--ink); border-radius: 50%; background: var(--paper); }
</style>
