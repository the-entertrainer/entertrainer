<script setup lang="ts">
defineProps<{ block: { text: string; style?: string } }>()
</script>
<template>
  <aside class="elearn-statement" :class="block.style || 'insight'">
    <p>{{ block.text }}</p>
  </aside>
</template>
<style scoped>
.elearn-statement { padding: 1.25rem 1.5rem; border-radius: 0.5rem; border: 1px solid var(--ink); background: var(--paper); }
.elearn-statement.insight { border-left: 4px solid var(--signal-cobalt); }
.elearn-statement.warning { border-left: 4px solid #c45c26; }
.elearn-statement p { margin: 0; font-weight: 500; font-size: 1.125rem; line-height: 1.4; }
</style>
