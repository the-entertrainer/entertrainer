<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  expanded: Boolean,
  selected: Boolean
})

const emit = defineEmits(['toggle', 'select'])

const hasChildren = computed(() => props.node.children && props.node.children.length > 0)

const nodeLabel = computed(() => {
  if (props.node.type === 'dialogue') {
    return props.node.speaker || 'Dialogue'
  }
  return `Decision (${props.node.choices?.length || 0} options)`
})

const nodePreview = computed(() => {
  if (props.node.type === 'dialogue') {
    return props.node.content?.substring(0, 60) || ''
  }
  return props.node.choices?.map(c => c.text).join(', ') || ''
})
</script>

<template>
  <div class="outline-node-item">
    <div
      :class="['node-header', { selected, [props.node.type]: true }]"
      @click="$emit('select', props.node.id)"
    >
      <button
        v-if="hasChildren"
        :class="['expand-btn', { expanded }]"
        @click.stop="$emit('toggle', props.node.id)"
      >
        ▶
      </button>
      <span v-else class="expand-placeholder" />

      <div class="node-label">
        <span class="type-badge" :class="props.node.type">
          {{ props.node.type === 'dialogue' ? '💬' : '🔀' }}
        </span>
        <span class="label-text">{{ nodeLabel }}</span>
      </div>
    </div>

    <div v-if="nodePreview" class="node-preview">{{ nodePreview }}</div>

    <div v-if="hasChildren && expanded" class="node-children">
      <OutlineNodeItem
        v-for="child in props.node.children"
        :key="child.id"
        :node="child"
        :expanded="expanded"
        :selected="selected"
        @toggle="$emit('toggle', $event)"
        @select="$emit('select', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.outline-node-item {
  margin-bottom: 0.25rem;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  border-left: 3px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 0.9rem;
  font-weight: 500;
}

.node-header:hover {
  background: rgba(36, 63, 106, 0.05);
}

.node-header.selected {
  background: rgba(36, 63, 106, 0.15);
  border-left-color: #243F6A;
}

.node-header.dialogue {
  --highlight: #243F6A;
}

.node-header.choice {
  --highlight: #6D8A40;
}

.expand-btn {
  padding: 0;
  width: 1.2rem;
  height: 1.2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.expand-btn.expanded {
  transform: rotate(90deg);
}

.expand-btn:hover {
  color: var(--highlight, #243F6A);
}

.expand-placeholder {
  display: block;
  width: 1.2rem;
  flex-shrink: 0;
}

.node-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
}

.type-badge {
  display: inline-block;
  font-size: 1rem;
  flex-shrink: 0;
}

.label-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-preview {
  padding: 0 0.75rem 0 calc(1.2rem + 0.5rem + 0.5rem);
  font-size: 0.8rem;
  opacity: 0.6;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-children {
  margin-left: 0.5rem;
  border-left: 2px solid rgba(0, 0, 0, 0.1);
  padding-left: 0.5rem;
}
</style>
