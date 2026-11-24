<script setup lang="ts">
defineProps<{ block: { content: string; lead?: boolean } }>()
</script>
<template>
  <p :class="{ 'is-lead': block.lead }" class="elearn-text" v-html="block.content" />
</template>
<style scoped>
.elearn-text { margin: 0; font-size: 1.0625rem; line-height: 1.6; }
.is-lead::first-letter { float: left; margin: 0.1rem 0.6rem 0 0; font: 500 3.5em/0.8 var(--font-display); color: var(--signal-cobalt); }
</style>
