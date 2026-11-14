<script setup lang="ts">
defineProps<{ block: { src: string; alt: string; caption?: string; credit?: string } }>()
</script>
<template>
  <figure class="elearn-image">
    <EdEditorialImage :src="block.src" :alt="block.alt" />
    <figcaption v-if="block.caption || block.credit">
      {{ block.caption }}
      <span v-if="block.credit" class="credit">{{ block.credit }}</span>
    </figcaption>
  </figure>
</template>
<style scoped>
.elearn-image { margin: 0; }
.elearn-image :deep(.ed-editorial-image) { width: 100%; border: 1px solid var(--ink); border-radius: 0.5rem; }
.elearn-image figcaption { margin-top: 0.5rem; font: 400 0.8125rem/1.35 var(--font-mono); color: var(--ink-soft); }
.credit { display: block; margin-top: 0.25rem; }
</style>
