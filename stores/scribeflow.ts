import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import Dexie from 'dexie'
import LZString from 'lz-string'

export interface ChoiceOption {
  id: string
  text: string
}

export interface NodeData {
  id: string
  type: 'dialogue' | 'choice'
  position: { x: number; y: number }
  data: {
    speaker?: string
    content: string
    choices?: ChoiceOption[]
  }
}

export interface Edge {
  id: string
  source: string
  sourceHandle?: string
  target: string
  targetHandle?: string
  type: string
}

export interface ScenarioProject {
  id: string
  title: string
  description: string
  nodes: NodeData[]
  edges: Edge[]
  updatedAt: number
}

class ScribeFlowDB extends Dexie {
  projects!: Dexie.Table<ScenarioProject, string>

  constructor() {
    super('scribeflow')
    this.version(1).stores({
      projects: 'id, updatedAt'
    })
  }
}

let db: ScribeFlowDB | null = null
function getDB() {
  if (!db) db = new ScribeFlowDB()
  return db
}

export const useScribeFlowStore = defineStore('scribeflow', () => {
  const projects = ref<Map<string, ScenarioProject>>(new Map())
  const currentProjectId = ref<string | null>(null)
  const selectedNodeId = ref<string | null>(null)
  const editingMode = ref<'canvas' | 'outline'>('canvas')
  const interactionMode = ref<'pan' | 'arrange'>('pan')
  const isLoading = ref(false)

  const currentProject = computed(() =>
    currentProjectId.value ? projects.value.get(currentProjectId.value) ?? null : null
  )
  const currentNodes = computed(() => currentProject.value?.nodes ?? [])
  const currentEdges = computed(() => currentProject.value?.edges ?? [])
  const selectedNode = computed(() =>
    selectedNodeId.value ? currentNodes.value.find(n => n.id === selectedNodeId.value) ?? null : null
  )

  let _saveTimer: ReturnType<typeof setTimeout> | null = null

  function _debouncedPersist() {
    if (_saveTimer) clearTimeout(_saveTimer)
    _saveTimer = setTimeout(() => {
      if (currentProject.value) {
        currentProject.value.updatedAt = Date.now()
        getDB().projects.put({ ...currentProject.value })
      }
    }, 800)
  }

  async function loadProjects() {
    if (typeof window === 'undefined') return
    isLoading.value = true
    try {
      const all = await getDB().projects.toArray()
      projects.value = new Map(all.map(p => [p.id, p]))
    } catch (e) {
      console.error('ScribeFlow: failed to load', e)
    } finally {
      isLoading.value = false
    }
  }

  function _uid() {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }

  async function createProject(title: string) {
    const id = `proj_${_uid()}`
    const startNode: NodeData = {
      id: 'node_start',
      type: 'dialogue',
      position: { x: 250, y: 60 },
      data: { speaker: 'Narrator', content: '<p>Begin your scenario here…</p>' }
    }
    const project: ScenarioProject = {
      id, title, description: '', nodes: [startNode], edges: [], updatedAt: Date.now()
    }
    projects.value.set(id, project)
    currentProjectId.value = id
    selectedNodeId.value = 'node_start'
    await getDB().projects.put(project)
    return id
  }

  function addNode(type: 'dialogue' | 'choice', position: { x: number; y: number }, fromNodeId?: string) {
    if (!currentProject.value) return null
    const id = `node_${_uid()}`
    const node: NodeData = {
      id, type, position,
      data: {
        speaker: type === 'dialogue' ? 'Character' : undefined,
        content: type === 'dialogue' ? '<p></p>' : '',
        choices: type === 'choice' ? [{ id: `c_${_uid()}`, text: 'Option A' }] : undefined
      }
    }
    currentProject.value.nodes.push(node)
    if (fromNodeId) {
      addEdge(fromNodeId, id)
    }
    selectedNodeId.value = id
    _debouncedPersist()
    return id
  }

  function updateNode(nodeId: string, updates: Partial<NodeData>) {
    if (!currentProject.value) return
    const idx = currentProject.value.nodes.findIndex(n => n.id === nodeId)
    if (idx === -1) return
    const node = currentProject.value.nodes[idx]
    if (updates.data) node.data = { ...node.data, ...updates.data }
    if (updates.position) node.position = updates.position
    _debouncedPersist()
  }

  function updateNodePosition(nodeId: string, pos: { x: number; y: number }) {
    if (!currentProject.value) return
    const node = currentProject.value.nodes.find(n => n.id === nodeId)
    if (node) {
      node.position = pos
      _debouncedPersist()
    }
  }

  function deleteNode(nodeId: string) {
    if (!currentProject.value) return
    currentProject.value.nodes = currentProject.value.nodes.filter(n => n.id !== nodeId)
    currentProject.value.edges = currentProject.value.edges.filter(
      e => e.source !== nodeId && e.target !== nodeId
    )
    if (selectedNodeId.value === nodeId) selectedNodeId.value = null
    _debouncedPersist()
  }

  function addEdge(source: string, target: string, sourceHandle?: string) {
    if (!currentProject.value) return
    const exists = currentProject.value.edges.some(e => e.source === source && e.target === target)
    if (exists) return
    currentProject.value.edges.push({
      id: `e_${source}_${target}`,
      source, target,
      sourceHandle,
      type: 'smoothstep'
    })
    _debouncedPersist()
  }

  function deleteEdge(edgeId: string) {
    if (!currentProject.value) return
    currentProject.value.edges = currentProject.value.edges.filter(e => e.id !== edgeId)
    _debouncedPersist()
  }

  function addChoice(nodeId: string) {
    if (!currentProject.value) return
    const node = currentProject.value.nodes.find(n => n.id === nodeId)
    if (!node || node.type !== 'choice') return
    const choices = node.data.choices ?? []
    choices.push({ id: `c_${_uid()}`, text: `Option ${String.fromCharCode(65 + choices.length)}` })
    node.data.choices = choices
    _debouncedPersist()
  }

  function updateChoice(nodeId: string, choiceId: string, text: string) {
    if (!currentProject.value) return
    const node = currentProject.value.nodes.find(n => n.id === nodeId)
    const choice = node?.data.choices?.find(c => c.id === choiceId)
    if (choice) {
      choice.text = text
      _debouncedPersist()
    }
  }

  function removeChoice(nodeId: string, choiceId: string) {
    if (!currentProject.value) return
    const node = currentProject.value.nodes.find(n => n.id === nodeId)
    if (node?.data.choices) {
      node.data.choices = node.data.choices.filter(c => c.id !== choiceId)
      currentProject.value.edges = currentProject.value.edges.filter(
        e => e.sourceHandle !== choiceId
      )
      _debouncedPersist()
    }
  }

  function exportAsUrl(): string {
    if (!currentProject.value) return ''
    const { title, description, nodes, edges } = currentProject.value
    const compressed = LZString.compressToBase64(JSON.stringify({ title, description, nodes, edges }))
    return `#scenario=${compressed}`
  }

  async function importFromUrl(hash: string): Promise<boolean> {
    try {
      const match = hash.match(/scenario=([A-Za-z0-9+/=]+)/)
      if (!match) return false
      const json = LZString.decompressFromBase64(match[1])
      if (!json) return false
      const payload = JSON.parse(json)
      const id = `proj_${_uid()}`
      const project: ScenarioProject = {
        id,
        title: payload.title || 'Imported Scenario',
        description: payload.description || '',
        nodes: payload.nodes || [],
        edges: payload.edges || [],
        updatedAt: Date.now()
      }
      projects.value.set(id, project)
      currentProjectId.value = id
      await getDB().projects.put(project)
      return true
    } catch {
      return false
    }
  }

  async function deleteProject(projectId: string) {
    projects.value.delete(projectId)
    if (currentProjectId.value === projectId) {
      currentProjectId.value = null
      selectedNodeId.value = null
    }
    await getDB().projects.delete(projectId)
  }

  function setCurrentProject(id: string | null) {
    currentProjectId.value = id
    selectedNodeId.value = null
  }

  function setEditingMode(mode: 'canvas' | 'outline') {
    editingMode.value = mode
  }

  function setInteractionMode(mode: 'pan' | 'arrange') {
    interactionMode.value = mode
  }

  return {
    projects, currentProjectId, selectedNodeId, editingMode, interactionMode, isLoading,
    currentProject, currentNodes, currentEdges, selectedNode,
    loadProjects, createProject, addNode, updateNode, updateNodePosition,
    deleteNode, addEdge, deleteEdge,
    addChoice, updateChoice, removeChoice,
    exportAsUrl, importFromUrl, deleteProject, setCurrentProject,
    setEditingMode, setInteractionMode
  }
})
