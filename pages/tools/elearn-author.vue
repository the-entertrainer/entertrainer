<script setup lang="ts">
import Studio from '~/components/elearn/author/Studio.vue'
import { absoluteUrl } from '~/utils/site'

useSeoMeta({
  title: 'Course Studio · Empower',
  description: 'Arrange lesson blocks, preview the lesson, and export the lesson JSON.',
  ogTitle: 'Course Studio · Empower',
  ogDescription: 'Arrange lesson blocks, preview the lesson, and export the lesson JSON.',
  ogUrl: absoluteUrl('/tools/elearn-author'),
})
</script>

<template>
  <ClientOnly>
    <Studio />
    <template #fallback>
      <p class="cs-boot">Loading Course Studio…</p>
    </template>
  </ClientOnly>
</template>

<style scoped>
.cs-boot {
  min-height: 100dvh;
  margin: 0;
  padding: 1.5rem;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-ui);
}
</style>
