<script setup lang="ts">
import { useScribeFlowStore } from '~/stores/scribeflow'
import { computed, ref } from 'vue'

const scribeStore = useScribeFlowStore()
const expandedNodes = ref<Set<string>>(new Set())

// Build tree structure from nodes and edges
const tree = computed(() => {
  const nodes = scribeStore.currentNodes
  const edges = scribeStore.currentEdges

  // Find root nodes (those with no incoming edges)
  const rootIds = nodes
    .filter(n => !edges.some(e => e.target === n.id))
    .map(n => n.id)

  const buildTree = (nodeId: string): any => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return null

    const children = edges
      .filter(e => e.source === nodeId)
      .map(e => buildTree(e.target))
      .filter(Boolean)

    return {
      id: node.id,
      type: node.type,
      speaker: node.data.speaker,
      content: node.data.content,
      choices: node.data.choices,
      children
    }
  }

  return rootIds.map(id => buildTree(id)).filter(Boolean)
})

const toggleNode = (nodeId: string) => {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId)
  } else {
    expandedNodes.value.add(nodeId)
  }
}

const selectNode = (nodeId: string) => {
  scribeStore.selectedNodeId = nodeId
}
</script>

<template>
  <div class="outline-view">
    <div class="outline-header">
      <h3>Scenario Structure</h3>
    </div>

    <div class="outline-content">
      <div
        v-for="item in tree"
        :key="item.id"
        class="outline-node"
      >
        <OutlineNodeItem
          :node="item"
          :expanded="expandedNodes.has(item.id)"
          :selected="scribeStore.selectedNodeId === item.id"
          @toggle="toggleNode"
          @select="selectNode"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import OutlineNodeItem from './OutlineNodeItem.vue'
</script>

<style scoped>
.outline-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg);
}

.outline-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.outline-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.outline-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.outline-node {
  margin-bottom: 0.25rem;
}
</style>
