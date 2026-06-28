<script setup lang="ts">
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Controls, Background, MiniMap } from '@vue-flow/additional-components'
import { computed, ref } from 'vue'
import { useScribeFlowStore } from '~/stores/scribeflow'
import DialogueNode from './nodes/DialogueNode.vue'
import ChoiceNode from './nodes/ChoiceNode.vue'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/additional-components/dist/style.css'

const scribeStore = useScribeFlowStore()
const { onConnect, addNodes, addEdges } = useVueFlow()
const showNodeMenu = ref(false)
const contextMenu = ref({ x: 0, y: 0, visible: false })

// Convert store nodes to Vue Flow nodes
const nodes = computed(() =>
  scribeStore.currentNodes.map(node => ({
    id: node.id,
    data: {
      label: node.data.speaker || 'Node',
      ...node.data
    },
    position: node.position,
    type: node.type === 'choice' ? 'choiceNode' : 'dialogueNode'
  }))
)

// Convert store edges to Vue Flow edges
const edges = computed(() =>
  scribeStore.currentEdges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type
  }))
)

// Handle node connection
const handleConnect = (connection: any) => {
  if (connection.source && connection.target) {
    scribeStore.addEdge(connection.source, connection.target)
  }
}

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
</script>

<template>
  <div class="canvas-container">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      @connect="handleConnect"
      @pane-context-menu="handlePaneContextMenu"
      @node-click="(e) => scribeStore.selectedNodeId = e.node.id"
    >
      <Background pattern-color="#aaa" :gap="[16, 16]" />
      <Controls />
      <MiniMap />

      <template #node-dialogueNode="props">
        <DialogueNode :data="props.data" />
      </template>

      <template #node-choiceNode="props">
        <ChoiceNode :data="props.data" />
      </template>
    </VueFlow>

    <!-- Context Menu -->
    <div
      v-if="contextMenu.visible"
      :style="{
        position: 'absolute',
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
      style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 5"
    />
  </div>
</template>

<style scoped>
.canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
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
}

.context-menu button:last-child {
  border-bottom: none;
}

.context-menu button:hover {
  background: rgba(36, 63, 106, 0.1);
  color: #243F6A;
}
</style>
