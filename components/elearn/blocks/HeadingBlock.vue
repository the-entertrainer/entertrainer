<script setup lang="ts">
defineProps<{ block: { text: string; level?: number } }>()
</script>
<template>
  <component :is="block.level === 3 ? 'h3' : 'h2'" class="elearn-heading">{{ block.text }}</component>
</template>
<style scoped>
.elearn-heading { margin: 0; font: 500 1.75rem/1.1 var(--font-display); letter-spacing: -0.03em; }
</style>
