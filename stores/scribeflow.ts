import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import LZString from 'lz-string'

export interface NodeData {
  id: string
  type: 'dialogue' | 'choice'
  position: { x: number; y: number }
  data: {
    speaker?: string
    content: string
    choices?: Array<{ id: string; text: string; targetId?: string }>
  }
}

export interface Edge {
  id: string
  source: string
  target: string
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

const STORAGE_KEY = 'scribeflow_projects'

export const useScribeFlowStore = defineStore('scribeflow', () => {
  const projects = ref<Map<string, ScenarioProject>>(new Map())
  const currentProjectId = ref<string | null>(null)
  const selectedNodeId = ref<string | null>(null)
  const editingMode = ref<'canvas' | 'outline'>('canvas')
  const isLoading = ref(false)

  const currentProject = computed(() =>
    currentProjectId.value ? projects.value.get(currentProjectId.value) : null
  )

  const currentNodes = computed(() => currentProject.value?.nodes || [])
  const currentEdges = computed(() => currentProject.value?.edges || [])

  const selectedNode = computed(() =>
    selectedNodeId.value
      ? currentNodes.value.find(n => n.id === selectedNodeId.value)
      : null
  )

  // Load all projects from localStorage
  async function loadProjects() {
    if (typeof window === 'undefined') return

    isLoading.value = true
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        projects.value.clear()
        Object.entries(data).forEach(([id, project]) => {
          projects.value.set(id, project as ScenarioProject)
        })
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Save to localStorage
  function persistProjects() {
    if (typeof window === 'undefined') return

    try {
      const data: Record<string, ScenarioProject> = {}
      projects.value.forEach((project, id) => {
        data[id] = project
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to persist projects:', error)
    }
  }

  // Create new project
  async function createProject(title: string, description: string = '') {
    const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const project: ScenarioProject = {
      id,
      title,
      description,
      nodes: [
        {
          id: 'node_start',
          type: 'dialogue',
          position: { x: 0, y: 0 },
          data: {
            speaker: 'Start',
            content: 'Begin your scenario here...'
          }
        }
      ],
      edges: [],
      updatedAt: Date.now()
    }

    try {
      projects.value.set(id, project)
      currentProjectId.value = id
      selectedNodeId.value = 'node_start'
      persistProjects()
      return id
    } catch (error) {
      console.error('Failed to create project:', error)
      return null
    }
  }

  // Save project
  async function saveProject() {
    if (!currentProject.value) return

    const updated = {
      ...currentProject.value,
      updatedAt: Date.now()
    }

    try {
      projects.value.set(updated.id, updated)
      persistProjects()
    } catch (error) {
      console.error('Failed to save project:', error)
    }
  }

  // Add node to current project
  function addNode(type: 'dialogue' | 'choice', position: { x: number; y: number }) {
    if (!currentProject.value) return

    const nodeId = `node_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const newNode: NodeData = {
      id: nodeId,
      type,
      position,
      data: {
        speaker: type === 'dialogue' ? 'Character' : undefined,
        content: type === 'dialogue' ? 'Enter dialogue here...' : '',
        choices: type === 'choice' ? [] : undefined
      }
    }

    currentProject.value.nodes.push(newNode)
    selectedNodeId.value = nodeId
    saveProject()
    return nodeId
  }

  // Update node
  function updateNode(nodeId: string, updates: Partial<NodeData>) {
    if (!currentProject.value) return

    const nodeIndex = currentProject.value.nodes.findIndex(n => n.id === nodeId)
    if (nodeIndex !== -1) {
      currentProject.value.nodes[nodeIndex] = {
        ...currentProject.value.nodes[nodeIndex],
        ...updates
      }
      saveProject()
    }
  }

  // Delete node and its edges
  function deleteNode(nodeId: string) {
    if (!currentProject.value) return

    currentProject.value.nodes = currentProject.value.nodes.filter(n => n.id !== nodeId)
    currentProject.value.edges = currentProject.value.edges.filter(
      e => e.source !== nodeId && e.target !== nodeId
    )

    if (selectedNodeId.value === nodeId) {
      selectedNodeId.value = null
    }

    saveProject()
  }

  // Add edge between nodes
  function addEdge(source: string, target: string) {
    if (!currentProject.value) return

    const edgeId = `edge_${source}_${target}_${Date.now()}`
    const edge: Edge = {
      id: edgeId,
      source,
      target,
      type: 'smoothstep'
    }

    currentProject.value.edges.push(edge)
    saveProject()
    return edgeId
  }

  // Delete edge
  function deleteEdge(edgeId: string) {
    if (!currentProject.value) return

    currentProject.value.edges = currentProject.value.edges.filter(e => e.id !== edgeId)
    saveProject()
  }

  // Export project as compressed URL hash
  function exportAsUrl(): string {
    if (!currentProject.value) return ''

    const payload = {
      title: currentProject.value.title,
      description: currentProject.value.description,
      nodes: currentProject.value.nodes,
      edges: currentProject.value.edges
    }

    const json = JSON.stringify(payload)
    const compressed = LZString.compressToBase64(json)
    return `#scenario=${compressed}`
  }

  // Import from URL hash
  async function importFromUrl(hash: string): Promise<boolean> {
    try {
      const match = hash.match(/scenario=([A-Za-z0-9+/=]+)/)
      if (!match) return false

      const compressed = match[1]
      const json = LZString.decompressFromBase64(compressed)
      if (!json) return false

      const payload = JSON.parse(json)
      const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

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
      persistProjects()
      return true
    } catch (error) {
      console.error('Failed to import from URL:', error)
      return false
    }
  }

  // Delete project
  async function deleteProject(projectId: string) {
    try {
      projects.value.delete(projectId)
      if (currentProjectId.value === projectId) {
        currentProjectId.value = null
        selectedNodeId.value = null
      }
      persistProjects()
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  // Set current project
  function setCurrentProject(projectId: string | null) {
    currentProjectId.value = projectId
    selectedNodeId.value = null
  }

  // Set editing mode
  function setEditingMode(mode: 'canvas' | 'outline') {
    editingMode.value = mode
  }

  return {
    // State
    projects,
    currentProjectId,
    selectedNodeId,
    editingMode,
    isLoading,

    // Computed
    currentProject,
    currentNodes,
    currentEdges,
    selectedNode,

    // Methods
    loadProjects,
    saveProject,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    deleteEdge,
    exportAsUrl,
    importFromUrl,
    deleteProject,
    setCurrentProject,
    setEditingMode
  }
})
