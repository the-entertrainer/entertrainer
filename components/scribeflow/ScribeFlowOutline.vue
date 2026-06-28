<script setup lang="ts">
import { useScribeFlowStore } from '~/stores/scribeflow'

const scribeStore = useScribeFlowStore()
const expanded = ref<Set<string>>(new Set())

interface TreeNode {
  id: string
  type: string
  speaker?: string
  content: string
  choices?: Array<{ id: string; text: string }>
  children: TreeNode[]
}

const tree = computed((): TreeNode[] => {
  const nodes = scribeStore.currentNodes
  const edges = scribeStore.currentEdges
  const targetIds = new Set(edges.map(e => e.target))
  const roots = nodes.filter(n => !targetIds.has(n.id))
  const visited = new Set<string>()

  function build(nodeId: string): TreeNode | null {
    if (visited.has(nodeId)) return null
    visited.add(nodeId)
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return null
    const children = edges
      .filter(e => e.source === nodeId)
      .map(e => build(e.target))
      .filter(Boolean) as TreeNode[]
    return {
      id: node.id, type: node.type,
      speaker: node.data.speaker, content: node.data.content,
      choices: node.data.choices, children
    }
  }

  return roots.map(r => build(r.id)).filter(Boolean) as TreeNode[]
})

function toggle(id: string) {
  expanded.value.has(id) ? expanded.value.delete(id) : expanded.value.add(id)
}

function select(id: string) { scribeStore.selectedNodeId = id }

function strip(html: string) {
  if (!import.meta.client) return ''
  const d = document.createElement('div')
  d.innerHTML = html
  const t = d.textContent || ''
  return t.length > 60 ? t.slice(0, 60) + '…' : t
}
</script>

<template>
  <div class="sfo">
    <div class="sfo-head">
      <span class="sfo-title">Scenario Tree</span>
      <span class="sfo-count">{{ scribeStore.currentNodes.length }} nodes</span>
    </div>

    <div class="sfo-tree">
      <template v-for="item in tree" :key="item.id">
        <div class="sfo-node">
          <div
            :class="['sfo-row', { selected: scribeStore.selectedNodeId === item.id }]"
            @click="select(item.id)"
          >
            <button v-if="item.children.length" class="sfo-expand" :class="{ open: expanded.has(item.id) }" @click.stop="toggle(item.id)">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <span v-else class="sfo-spacer" />

            <span class="sfo-badge" :class="item.type">{{ item.type === 'dialogue' ? 'D' : 'C' }}</span>
            <span class="sfo-name">{{ item.type === 'dialogue' ? (item.speaker || 'Narrator') : 'Decision' }}</span>
            <span class="sfo-preview">{{ strip(item.content) }}</span>
          </div>

          <div v-if="item.children.length && expanded.has(item.id)" class="sfo-children">
            <OutlineNodeItem
              v-for="child in item.children" :key="child.id"
              :node="child" :expanded="expanded.has(child.id)"
              :selected="scribeStore.selectedNodeId === child.id"
              @toggle="toggle" @select="select"
            />
          </div>
        </div>
      </template>

      <p v-if="!tree.length" class="sfo-empty">No nodes yet.</p>
    </div>
  </div>
</template>

<style scoped>
.sfo { display: flex; flex-direction: column; height: 100%; background: var(--color-bg); }

.sfo-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14rem 16rem; border-bottom: 1px solid var(--color-divider);
}
.sfo-title { font-size: 13rem; font-weight: 700; }
.sfo-count { font-size: var(--text-label); opacity: 0.4; letter-spacing: var(--tracking-label); text-transform: uppercase; }

.sfo-tree { flex: 1; overflow-y: auto; padding: 8rem; }

.sfo-row {
  display: flex; align-items: center; gap: 8rem;
  padding: 8rem 10rem; border-radius: var(--radius-s);
  cursor: pointer; transition: background 0.12s;
  border-left: 3px solid transparent;
}
.sfo-row:hover { background: var(--color-glass-bg); }
.sfo-row.selected { background: color-mix(in srgb, var(--color-accent) 12%, transparent); border-left-color: var(--color-accent); }

.sfo-expand {
  width: 18rem; height: 18rem; border: none; background: none;
  color: var(--color-text); opacity: 0.4; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.15s; flex-shrink: 0;
}
.sfo-expand.open { transform: rotate(90deg); }

.sfo-spacer { width: 18rem; flex-shrink: 0; }

.sfo-badge {
  width: 20rem; height: 20rem; border-radius: var(--radius-xs);
  font-size: 10rem; font-weight: 700; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.sfo-badge.dialogue { background: color-mix(in srgb, var(--color-accent) 15%, transparent); color: var(--color-accent); }
.sfo-badge.choice { background: color-mix(in srgb, #6D8A40 15%, transparent); color: #6D8A40; }

.sfo-name { font-size: 13rem; font-weight: 600; white-space: nowrap; }
.sfo-preview { font-size: 12rem; opacity: 0.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }

.sfo-children { margin-left: 18rem; border-left: 1px solid var(--color-divider); padding-left: 4rem; }

.sfo-empty { text-align: center; font-size: var(--text-sm); opacity: 0.3; padding: 30rem; }
</style>
