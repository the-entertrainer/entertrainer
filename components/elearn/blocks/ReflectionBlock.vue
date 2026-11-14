<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ block: { prompt: string; placeholder?: string } }>()
const emit = defineEmits<{ complete: [] }>()
const text = ref('')
function done() {
  if (text.value.trim()) emit('complete')
}
</script>
<template>
  <div class="elearn-ref">
    <p class="prompt">{{ block.prompt }}</p>
    <textarea v-model="text" :placeholder="block.placeholder || 'Write a few lines…'" rows="4" @blur="done" />
  </div>
</template>
<style scoped>
.elearn-ref { border: 1px dashed var(--ink); border-radius: 0.5rem; padding: 1.25rem; }
.prompt { margin: 0 0 0.75rem; font-weight: 500; }
textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--line); border-radius: 0.375rem; font: inherit; resize: vertical; background: var(--paper); }
</style>
