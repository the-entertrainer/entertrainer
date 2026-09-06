<template>
  <div class="filmstrip">
    <button
      v-for="p in sorted"
      :key="p.id"
      type="button"
      class="thumb"
      :class="{ active: p.id === selectedId }"
      :style="{ background: p.placeholderColor || '#ccc' }"
      @click="$emit('select', p.id)"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ panels: any[]; selectedId?: string | null }>()
defineEmits(['select'])
const sorted = computed(() => (props.panels || []).slice().sort((a, b) => a.order - b.order))
</script>
