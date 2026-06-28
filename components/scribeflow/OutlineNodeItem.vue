<script setup lang="ts">
const props = defineProps<{
  node: {
    id: string; type: string; speaker?: string; content: string;
    choices?: Array<{ id: string; text: string }>; children: any[]
  }
  expanded: boolean
  selected: boolean
}>()

const emit = defineEmits<{
  toggle: [id: string]
  select: [id: string]
}>()

function strip(html: string) {
  if (!import.meta.client) return ''
  const d = document.createElement('div')
  d.innerHTML = html
  const t = d.textContent || ''
  return t.length > 50 ? t.slice(0, 50) + '…' : t
}
</script>

<template>
  <div class="oni">
    <div :class="['oni-row', { selected }]" @click="emit('select', node.id)">
      <button v-if="node.children.length" class="oni-expand" :class="{ open: expanded }" @click.stop="emit('toggle', node.id)">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <span v-else class="oni-spacer" />

      <span class="oni-badge" :class="node.type">{{ node.type === 'dialogue' ? 'D' : 'C' }}</span>
      <span class="oni-name">{{ node.type === 'dialogue' ? (node.speaker || 'Narrator') : 'Decision' }}</span>
      <span class="oni-preview">{{ strip(node.content) }}</span>
    </div>

    <div v-if="node.children.length && expanded" class="oni-children">
      <OutlineNodeItem
        v-for="child in node.children" :key="child.id"
        :node="child" :expanded="expanded" :selected="selected"
        @toggle="emit('toggle', $event)" @select="emit('select', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.oni-row {
  display: flex; align-items: center; gap: 8rem;
  padding: 8rem 10rem; border-radius: var(--radius-s);
  cursor: pointer; transition: background 0.12s;
  border-left: 3px solid transparent;
}
.oni-row:hover { background: var(--color-glass-bg); }
.oni-row.selected { background: color-mix(in srgb, var(--color-accent) 12%, transparent); border-left-color: var(--color-accent); }

.oni-expand {
  width: 18rem; height: 18rem; border: none; background: none;
  color: var(--color-text); opacity: 0.4; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.15s; flex-shrink: 0;
}
.oni-expand.open { transform: rotate(90deg); }

.oni-spacer { width: 18rem; flex-shrink: 0; }

.oni-badge {
  width: 20rem; height: 20rem; border-radius: var(--radius-xs);
  font-size: 10rem; font-weight: 700; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.oni-badge.dialogue { background: color-mix(in srgb, var(--color-accent) 15%, transparent); color: var(--color-accent); }
.oni-badge.choice { background: color-mix(in srgb, #6D8A40 15%, transparent); color: #6D8A40; }

.oni-name { font-size: 13rem; font-weight: 600; white-space: nowrap; }
.oni-preview { font-size: 12rem; opacity: 0.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }

.oni-children { margin-left: 18rem; border-left: 1px solid var(--color-divider); padding-left: 4rem; }
</style>
