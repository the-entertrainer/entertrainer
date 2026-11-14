<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{ block: { title?: string; items: { title: string; content: string }[] } }>()
const emit = defineEmits<{ complete: [] }>()
const open = ref<number | null>(null)
const opened = ref(new Set<number>())

function toggle(i: number) {
  open.value = open.value === i ? null : i
  opened.value.add(i)
  if (opened.value.size === props.block.items.length) emit('complete')
}
</script>
<template>
  <div class="elearn-acc">
    <h3 v-if="block.title">{{ block.title }}</h3>
    <div v-for="(item, i) in block.items" :key="i" class="item">
      <button type="button" class="head" @click="toggle(i)" :aria-expanded="open === i">
        {{ item.title }}
        <span>{{ open === i ? '−' : '+' }}</span>
      </button>
      <div v-if="open === i" class="body" v-html="item.content" />
    </div>
  </div>
</template>
<style scoped>
.elearn-acc h3 { margin: 0 0 0.75rem; font: 500 1.25rem/1.2 var(--font-display); }
.item { border-bottom: 1px solid var(--line); }
.head { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0.875rem 0; background: none; border: none; font-weight: 500; font-size: 1.0625rem; cursor: pointer; text-align: left; }
.body { padding: 0 0 1rem; font-size: 0.9375rem; line-height: 1.5; color: var(--ink-soft); }
</style>
