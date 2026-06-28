<script setup lang="ts">
import { computed, ref } from 'vue'
import { useScribeFlowStore } from '~/stores/scribeflow'
import CanvasNode from './CanvasNode.vue'

const scribeStore = useScribeFlowStore()
const contextMenu = ref({ x: 0, y: 0, visible: false })
const selectedConnecting = ref<string | null>(null)

// Handle right-click context menu
const handlePaneContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  contextMenu.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
    visible: true
  }
}

// Add dialogue node
const addDialogueNode = () => {
  scribeStore.addNode('dialogue', {
    x: contextMenu.value.x,
    y: contextMenu.value.y
  })
  contextMenu.value.visible = false
}

// Add choice node
const addChoiceNode = () => {
  scribeStore.addNode('choice', {
    x: contextMenu.value.x,
    y: contextMenu.value.y
  })
  contextMenu.value.visible = false
}

// Handle node connection
const startConnect = (fromId: string) => {
  selectedConnecting.value = fromId
}

const connectTo = (toId: string) => {
  if (selectedConnecting.value && selectedConnecting.value !== toId) {
    scribeStore.addEdge(selectedConnecting.value, toId)
  }
  selectedConnecting.value = null
}

const cancelConnect = () => {
  selectedConnecting.value = null
}
</script>

<template>
  <div class="canvas-container" @contextmenu="handlePaneContextMenu">
    <svg class="canvas-svg">
      <!-- Draw edges -->
      <g class="edges">
        <line
          v-for="edge in scribeStore.currentEdges"
          :key="edge.id"
          :x1="scribeStore.currentNodes.find(n => n.id === edge.source)?.position.x || 0"
          :y1="scribeStore.currentNodes.find(n => n.id === edge.source)?.position.y || 0"
          :x2="scribeStore.currentNodes.find(n => n.id === edge.target)?.position.x || 0"
          :y2="scribeStore.currentNodes.find(n => n.id === edge.target)?.position.y || 0"
          class="edge-line"
          @click="(e) => { e.stopPropagation(); e.preventDefault() }"
        />
      </g>
    </svg>

    <!-- Render nodes absolutely positioned -->
    <div class="nodes-layer">
      <CanvasNode
        v-for="node in scribeStore.currentNodes"
        :key="node.id"
        :node="node"
        :is-selected="scribeStore.selectedNodeId === node.id"
        :is-connecting="selectedConnecting === node.id"
        @select="scribeStore.selectedNodeId = node.id"
        @connect-start="startConnect"
        @connect-to="connectTo"
        @connect-cancel="cancelConnect"
      />
    </div>

    <!-- Context Menu -->
    <div
      v-if="contextMenu.visible"
      :style="{
        position: 'fixed',
        left: contextMenu.x + 'px',
        top: contextMenu.y + 'px',
        zIndex: 10
      }"
      class="context-menu"
      @click.stop
    >
      <button @click="addDialogueNode">Add Dialogue Node</button>
      <button @click="addChoiceNode">Add Choice Node</button>
      <button @click="contextMenu.visible = false">Cancel</button>
    </div>

    <!-- Click to close context menu -->
    <div
      v-if="contextMenu.visible"
      @click="contextMenu.visible = false"
      class="menu-backdrop"
    />
  </div>
</template>

<style scoped>
.canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--color-bg);
  overflow: hidden;
  user-select: none;
}

.canvas-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.edge-line {
  stroke: rgba(36, 63, 106, 0.3);
  stroke-width: 2;
  pointer-events: auto;
  cursor: pointer;
  transition: stroke 0.2s;
}

.edge-line:hover {
  stroke: rgba(36, 63, 106, 0.6);
  stroke-width: 3;
}

.nodes-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.context-menu {
  background: var(--color-bg);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 20;
}

.context-menu button {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  text-align: left;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
}

.context-menu button:last-child {
  border-bottom: none;
}

.context-menu button:hover {
  background: rgba(36, 63, 106, 0.1);
  color: #243F6A;
}

.menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
}
</style>
