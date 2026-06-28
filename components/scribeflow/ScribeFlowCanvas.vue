<script setup lang="ts">
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { useScribeFlowStore } from '~/stores/scribeflow'
import DialogueNode from './nodes/DialogueNode.vue'
import ChoiceNode from './nodes/ChoiceNode.vue'

const scribeStore = useScribeFlowStore()

const { onNodesChange, onEdgesChange, onConnect, onPaneClick, onNodeClick, onNodeDragStop } = useVueFlow()

const nodes = computed(() =>
  scribeStore.currentNodes.map(n => ({
    id: n.id,
    type: n.type === 'dialogue' ? 'dialogueNode' : 'choiceNode',
    position: n.position,
    data: n.data,
  }))
)

const edges = computed(() =>
  scribeStore.currentEdges.map(e => ({
    id: e.id,
    source: e.source,
    sourceHandle: e.sourceHandle,
    target: e.target,
    targetHandle: e.targetHandle,
    type: 'smoothstep',
    animated: true,
    style: { stroke: 'var(--color-accent)', strokeWidth: 2, opacity: 0.5 },
  }))
)

onNodeDragStop(({ node }) => {
  scribeStore.updateNodePosition(node.id, { x: node.position.x, y: node.position.y })
})

onConnect(({ source, target, sourceHandle, targetHandle }) => {
  if (source && target) scribeStore.addEdge(source, target, sourceHandle ?? undefined)
})

onNodeClick(({ node }) => {
  scribeStore.selectedNodeId = node.id
})

onPaneClick(() => {
  scribeStore.selectedNodeId = null
})

const showCtx = ref(false)
const ctxPos = ref({ x: 0, y: 0 })
const ctxFlow = ref({ x: 0, y: 0 })

function onCtx(e: MouseEvent) {
  e.preventDefault()
  ctxPos.value = { x: e.clientX, y: e.clientY }
  const el = (e.currentTarget as HTMLElement)?.querySelector('.vue-flow__viewport') as HTMLElement
  if (el) {
    const t = el.style.transform
    const m = t.match(/translate\(([^,]+)px,\s*([^)]+)px\).*scale\(([^)]+)\)/)
    if (m) {
      ctxFlow.value = {
        x: (e.clientX - parseFloat(m[1])) / parseFloat(m[3]),
        y: (e.clientY - parseFloat(m[2])) / parseFloat(m[3])
      }
    } else {
      ctxFlow.value = { x: e.clientX, y: e.clientY }
    }
  }
  showCtx.value = true
}

function addFromCtx(type: 'dialogue' | 'choice') {
  scribeStore.addNode(type, ctxFlow.value)
  showCtx.value = false
}

function onEdgeClick(id: string) {
  scribeStore.deleteEdge(id)
}
</script>

<template>
  <div class="sfc" @contextmenu="onCtx">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :default-viewport="{ x: 0, y: 0, zoom: 1 }"
      :min-zoom="0.2"
      :max-zoom="2"
      fit-view-on-init
      @edge-click="({ edge }) => onEdgeClick(edge.id)"
    >
      <template #node-dialogueNode="props">
        <DialogueNode v-bind="props" />
      </template>
      <template #node-choiceNode="props">
        <ChoiceNode v-bind="props" />
      </template>
      <Background :gap="20" :size="1" pattern-color="var(--color-glass-border)" />
      <Controls position="bottom-left" />
    </VueFlow>

    <!-- Context menu -->
    <Teleport to="body">
      <div v-if="showCtx" class="sfc-ctx-back" @click="showCtx = false">
        <div class="sfc-ctx" :style="{ left: ctxPos.x + 'px', top: ctxPos.y + 'px' }" @click.stop>
          <button @click="addFromCtx('dialogue')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Dialogue
          </button>
          <button @click="addFromCtx('choice')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            Choice
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Floating add button (mobile) -->
    <button class="sfc-fab" @click="scribeStore.addNode('dialogue', { x: 200, y: scribeStore.currentNodes.length * 200 + 60 })" aria-label="Add node">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>
  </div>
</template>

<style scoped>
.sfc { position: relative; width: 100%; height: 100%; }

/* Vue Flow overrides */
.sfc :deep(.vue-flow) { width: 100%; height: 100%; background: var(--color-bg); }
.sfc :deep(.vue-flow__edge-path) { stroke: var(--color-accent); stroke-opacity: 0.4; }
.sfc :deep(.vue-flow__edge.selected .vue-flow__edge-path) { stroke-opacity: 0.8; }
.sfc :deep(.vue-flow__controls) {
  border: 1px solid var(--color-glass-border); border-radius: var(--radius-m);
  background: var(--color-bg); box-shadow: 0 4rem 16rem rgba(0,0,0,0.12); overflow: hidden;
}
.sfc :deep(.vue-flow__controls-button) {
  background: var(--color-bg); border: none; border-bottom: 1px solid var(--color-divider);
  color: var(--color-text); fill: var(--color-text); width: 32rem; height: 32rem;
}
.sfc :deep(.vue-flow__controls-button:hover) { background: var(--color-glass-bg); }
.sfc :deep(.vue-flow__background) { opacity: 0.5; }

/* Context menu */
.sfc-ctx-back { position: fixed; inset: 0; z-index: 100; }
.sfc-ctx {
  position: fixed; z-index: 101;
  background: var(--color-bg); border: 1px solid var(--color-glass-border);
  border-radius: var(--radius-m); overflow: hidden;
  box-shadow: 0 8rem 24rem rgba(0,0,0,0.18);
  min-width: 160rem;
}
.sfc-ctx button {
  display: flex; align-items: center; gap: 10rem;
  width: 100%; padding: 12rem 16rem;
  background: none; border: none; border-bottom: 1px solid var(--color-divider);
  color: var(--color-text); font: 500 14rem/1 var(--main-font); cursor: pointer;
  text-align: left; transition: background 0.12s;
}
.sfc-ctx button:last-child { border-bottom: none; }
.sfc-ctx button:hover { background: var(--color-glass-bg); }

/* FAB */
.sfc-fab {
  position: absolute; bottom: 20rem; right: 20rem;
  width: 48rem; height: 48rem; border-radius: 50%;
  background: var(--color-accent); color: #fff; border: none;
  box-shadow: 0 6rem 20rem rgba(36,63,106,0.4);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: transform 0.15s;
}
.sfc-fab:active { transform: scale(0.92); }

@media (min-width: 641px) { .sfc-fab { display: none; } }
</style>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';
</style>
