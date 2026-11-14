<script setup lang="ts">
defineProps<{ block: { text: string; attribution?: string } }>()
</script>
<template>
  <blockquote class="elearn-quote">
    <p>{{ block.text }}</p>
    <footer v-if="block.attribution">{{ block.attribution }}</footer>
  </blockquote>
</template>
<style scoped>
.elearn-quote { margin: 0; padding: 1.5rem 0; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--ink); font: 500 1.5rem/1.3 var(--font-display); letter-spacing: -0.02em; }
.elearn-quote p { margin: 0; }
.elearn-quote footer { margin-top: 0.75rem; font: 400 0.875rem/1 var(--font-mono); color: var(--ink-soft); }
</style>
