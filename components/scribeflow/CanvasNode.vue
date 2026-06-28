<script setup lang="ts">
import type { NodeData } from '~/stores/scribeflow'
import { ref } from 'vue'

const props = defineProps<{
  node: NodeData
  isSelected: boolean
  isConnecting: boolean
}>()

const emit = defineEmits(['select', 'connectStart', 'connectTo', 'connectCancel'])

const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

const handleMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return
  isDragging.value = true
  dragStart.value = {
    x: e.clientX - props.node.position.x,
    y: e.clientY - props.node.position.y
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  // TODO: Update node position
}

const handleMouseUp = () => {
  isDragging.value = false
}

const handleSelect = () => {
  emit('select')
}

const handleConnectStart = (e: MouseEvent) => {
  e.stopPropagation()
  emit('connectStart', props.node.id)
}

const handleConnectEnd = (e: MouseEvent) => {
  e.stopPropagation()
  emit('connectTo', props.node.id)
}
</script>

<template>
  <div
    :class="['canvas-node', props.node.type, { selected: isSelected, connecting: isConnecting }]"
    :style="{
      left: props.node.position.x + 'px',
      top: props.node.position.y + 'px'
    }"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @click="handleSelect"
  >
    <!-- Node header -->
    <div class="node-header">
      <div v-if="props.node.type === 'dialogue'" class="node-title">
        {{ props.node.data.speaker || 'Dialogue' }}
      </div>
      <div v-else class="node-title">
        Decision ({{ props.node.data.choices?.length || 0 }})
      </div>
    </div>

    <!-- Node content -->
    <div class="node-content">
      <p>{{ props.node.data.content?.substring(0, 80) }}...</p>
    </div>

    <!-- Connection handles -->
    <div class="handle handle-in" @mousedown="handleConnectEnd" title="Connect from node" />
    <div class="handle handle-out" @mousedown="handleConnectStart" title="Drag to connect" />
  </div>
</template>

<style scoped>
.canvas-node {
  position: absolute;
  width: 200px;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 2px solid;
  background: linear-gradient(135deg, #243F6A 0%, #1a2d4d 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: move;
  transition: all 0.2s;
  user-select: none;
}

.canvas-node.dialogue {
  border-color: #243F6A;
}

.canvas-node.choice {
  background: linear-gradient(135deg, #6D8A40 0%, #5a7035 100%);
  border-color: #6D8A40;
}

.canvas-node:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  transform: scale(1.02);
}

.canvas-node.selected {
  box-shadow: 0 0 0 3px rgba(36, 63, 106, 0.5);
  transform: scale(1.05);
}

.canvas-node.connecting {
  opacity: 0.7;
  border-style: dashed;
}

.node-header {
  margin-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.5rem;
  font-weight: 700;
  font-size: 0.9rem;
}

.node-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-content {
  font-size: 0.85rem;
  line-height: 1.3;
  opacity: 0.85;
}

.node-content p {
  margin: 0;
}

.handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: white;
  border: 2px solid #243F6A;
  border-radius: 50%;
  cursor: crosshair;
  transition: all 0.2s;
}

.choice .handle {
  border-color: #6D8A40;
}

.handle:hover {
  transform: scale(1.3);
  box-shadow: 0 0 8px currentColor;
}

.handle-in {
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
}

.handle-out {
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
