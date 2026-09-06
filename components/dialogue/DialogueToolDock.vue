<template>
  <nav class="dock" aria-label="Tools">
    <button
      v-for="t in tools"
      :key="t.id"
      type="button"
      :class="{ active: modelValue === t.id }"
      @click="$emit('update:modelValue', t.id)"
    >
      <span class="ico">{{ t.ico }}</span>{{ t.label }}
    </button>
  </nav>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits(['update:modelValue'])
const tools = [
  { id: 'panels', label: 'Panels', ico: '▦' },
  { id: 'art', label: 'Art', ico: '🖼' },
  { id: 'balloon', label: 'Balloon', ico: '💬' },
  { id: 'type', label: 'Type', ico: 'T' },
  { id: 'stickers', label: 'Stickers', ico: '★' },
  { id: 'frames', label: 'Frames', ico: '▭' },
]
</script>
