<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
  id: string
  data: { speaker?: string; content: string }
  selected?: boolean
}>()

const plainText = computed(() => {
  if (!import.meta.client) return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = props.data.content || ''
  const t = tmp.textContent || ''
  return t.length > 100 ? t.slice(0, 100) + '…' : t
})
</script>

<template>
  <div :class="['dn', { selected }]">
    <Handle type="target" :position="Position.Top" class="dn-handle" />
    <div class="dn-head">
      <svg class="dn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span class="dn-speaker">{{ data.speaker || 'Narrator' }}</span>
    </div>
    <p class="dn-body">{{ plainText || 'Empty…' }}</p>
    <Handle type="source" :position="Position.Bottom" class="dn-handle" />
  </div>
</template>

<style scoped>
.dn {
  width: 220rem; padding: 14rem 16rem;
  background: var(--color-bg); border: 1.5px solid var(--color-glass-border);
  border-radius: var(--radius-m); color: var(--color-text);
  box-shadow: 0 4rem 14rem rgba(0,0,0,0.08);
  transition: border-color 0.15s, box-shadow 0.15s;
  cursor: grab;
}
.dn:hover { border-color: var(--color-glass-border-hover); }
.dn.selected { border-color: var(--color-accent); box-shadow: 0 0 0 3rem rgba(36,63,106,0.15), 0 4rem 14rem rgba(0,0,0,0.08); }

.dn-head { display: flex; align-items: center; gap: 6rem; margin-bottom: 8rem; }
.dn-icon { opacity: 0.4; flex-shrink: 0; }
.dn-speaker { font-size: 12rem; font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; opacity: 0.5; }

.dn-body { margin: 0; font-size: 14rem; line-height: 1.45; opacity: 0.8; }

.dn-handle {
  width: 10rem !important; height: 10rem !important;
  background: var(--color-accent) !important; border: 2px solid var(--color-bg) !important;
  border-radius: 50% !important;
}
</style>
