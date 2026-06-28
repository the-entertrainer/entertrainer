<script setup lang="ts">
import { useScribeFlowStore } from '~/stores/scribeflow'
import { onMounted, ref } from 'vue'

const scribeStore = useScribeFlowStore()
const showNewProjectModal = ref(false)
const projectTitle = ref('')

onMounted(async () => {
  await scribeStore.loadProjects()

  // Check for URL import
  const hash = window.location.hash
  if (hash.includes('scenario=')) {
    const success = await scribeStore.importFromUrl(hash)
    if (success) {
      window.location.hash = ''
    }
  }
})

const createNewProject = async () => {
  if (!projectTitle.value.trim()) return

  await scribeStore.createProject(projectTitle.value)
  projectTitle.value = ''
  showNewProjectModal.value = false
}

const selectProject = (projectId: string) => {
  scribeStore.setCurrentProject(projectId)
}

const deleteProject = async (projectId: string, e: Event) => {
  e.stopPropagation()
  if (confirm('Delete this scenario? This cannot be undone.')) {
    await scribeStore.deleteProject(projectId)
  }
}
</script>

<template>
  <div class="scribeflow-page">
    <!-- Project List View -->
    <div v-if="!scribeStore.currentProjectId" class="projects-view">
      <div class="projects-header">
        <h1>ScribeFlow</h1>
        <p>Author branching dialogues and scenarios with a node-based editor</p>
      </div>

      <button class="btn-create" @click="showNewProjectModal = true">
        + New Scenario
      </button>

      <div class="projects-grid">
        <div
          v-for="project of scribeStore.projects.values()"
          :key="project.id"
          class="project-card"
          @click="selectProject(project.id)"
        >
          <div class="project-info">
            <h3>{{ project.title }}</h3>
            <p>{{ project.description || 'No description' }}</p>
            <span class="node-count">{{ project.nodes.length }} nodes</span>
          </div>
          <button
            class="btn-delete"
            @click="(e) => deleteProject(project.id, e)"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- New Project Modal -->
      <div v-if="showNewProjectModal" class="modal-overlay" @click="showNewProjectModal = false">
        <div class="modal" @click.stop>
          <h2>New Scenario</h2>
          <input
            v-model="projectTitle"
            type="text"
            placeholder="Scenario title..."
            class="modal-input"
            @keyup.enter="createNewProject"
            autofocus
          />
          <div class="modal-actions">
            <button @click="showNewProjectModal = false">Cancel</button>
            <button class="btn-primary" @click="createNewProject">Create</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor View -->
    <div v-else class="editor-view">
      <ScribeFlowEditor />
    </div>
  </div>
</template>

<style scoped>
.scribeflow-page {
  min-height: 100dvh;
  background: var(--color-bg);
  color: var(--color-text);
}

/* Projects View */
.projects-view {
  padding: 3rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.projects-header {
  margin-bottom: 3rem;
  text-align: center;
}

.projects-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.projects-header p {
  font-size: 1.1rem;
  opacity: 0.7;
}

.btn-create {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #243F6A;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 2rem;
  transition: all 0.2s;
}

.btn-create:hover {
  background: #1a2d4d;
  transform: translateY(-2px);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.project-card {
  padding: 1.5rem;
  background: var(--color-surface, rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.project-card:hover {
  background: var(--color-surface, rgba(255, 255, 255, 0.08));
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.project-info h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.project-info p {
  font-size: 0.9rem;
  opacity: 0.7;
  margin-bottom: 0.75rem;
}

.node-count {
  display: inline-block;
  font-size: 0.85rem;
  padding: 0.25rem 0.75rem;
  background: rgba(36, 63, 106, 0.1);
  border-radius: 0.25rem;
  color: #243F6A;
}

.btn-delete {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  border: none;
  background: rgba(255, 0, 0, 0.1);
  color: #ff4444;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: rgba(255, 0, 0, 0.2);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--color-bg);
  padding: 2rem;
  border-radius: 1rem;
  min-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.modal-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
}

.modal-input:focus {
  outline: none;
  border-color: #243F6A;
  background: rgba(255, 255, 255, 0.1);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.modal-actions button {
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.modal-actions .btn-primary {
  background: #243F6A;
  color: white;
  border-color: #243F6A;
}

.modal-actions .btn-primary:hover {
  background: #1a2d4d;
}

.modal-actions button:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Editor View */
.editor-view {
  width: 100%;
  height: 100dvh;
}
</style>
