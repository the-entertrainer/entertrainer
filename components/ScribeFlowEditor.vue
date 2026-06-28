<script setup lang="ts">
import { ref } from 'vue'
import { useScribeFlowStore } from '~/stores/scribeflow'
import ScribeFlowCanvas from './scribeflow/ScribeFlowCanvas.vue'
import ScribeFlowOutline from './scribeflow/ScribeFlowOutline.vue'
import ScribeFlowNodePanel from './scribeflow/ScribeFlowNodePanel.vue'

const scribeStore = useScribeFlowStore()
const showShareModal = ref(false)
const shareUrl = ref('')

const toggleEditMode = (mode: 'canvas' | 'outline') => {
  scribeStore.setEditingMode(mode)
}

const generateShareUrl = () => {
  const hash = scribeStore.exportAsUrl()
  shareUrl.value = `${window.location.origin}${window.location.pathname}${hash}`
  showShareModal.value = true
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(shareUrl.value)
}

const goBack = () => {
  scribeStore.setCurrentProject(null)
}
</script>

<template>
  <div class="scribeflow-editor">
    <!-- Header -->
    <div class="editor-header">
      <div class="header-left">
        <button class="btn-back" @click="goBack">← Back</button>
        <div class="project-title">
          <h2>{{ scribeStore.currentProject?.title }}</h2>
          <p class="node-count">{{ scribeStore.currentNodes.length }} nodes</p>
        </div>
      </div>

      <div class="header-center">
        <button
          :class="['mode-btn', { active: scribeStore.editingMode === 'canvas' }]"
          @click="toggleEditMode('canvas')"
        >
          Canvas
        </button>
        <button
          :class="['mode-btn', { active: scribeStore.editingMode === 'outline' }]"
          @click="toggleEditMode('outline')"
        >
          Outline
        </button>
      </div>

      <div class="header-right">
        <button class="btn-share" @click="generateShareUrl">Share</button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="editor-content">
      <div
        v-if="scribeStore.editingMode === 'canvas'"
        class="editor-pane canvas-pane"
      >
        <ScribeFlowCanvas />
      </div>

      <div
        v-if="scribeStore.editingMode === 'outline'"
        class="editor-pane outline-pane"
      >
        <ScribeFlowOutline />
      </div>

      <div
        v-if="scribeStore.selectedNode"
        class="inspector-pane"
      >
        <ScribeFlowNodePanel />
      </div>
    </div>

    <!-- Share Modal -->
    <div v-if="showShareModal" class="modal-overlay" @click="showShareModal = false">
      <div class="modal" @click.stop>
        <h3>Share Scenario</h3>
        <p class="share-description">Copy this link to share your scenario with others:</p>
        <div class="share-link-container">
          <input
            type="text"
            :value="shareUrl"
            readonly
            class="share-link"
          />
          <button class="btn-copy" @click="copyToClipboard">Copy</button>
        </div>
        <button class="btn-close-modal" @click="showShareModal = false">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scribeflow-editor {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100dvh;
  background: var(--color-bg);
  color: var(--color-text);
}

/* Header */
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--color-surface, rgba(255, 255, 255, 0.03));
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  gap: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.1);
}

.project-title {
  min-width: 0;
  flex: 1;
}

.project-title h2 {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-count {
  font-size: 0.85rem;
  opacity: 0.6;
  margin: 0;
}

.header-center {
  display: flex;
  gap: 0.5rem;
}

.mode-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.mode-btn.active {
  background: #243F6A;
  color: white;
  border-color: #243F6A;
}

.mode-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.1);
}

.header-right {
  flex: 1;
  text-align: right;
}

.btn-share {
  padding: 0.5rem 1rem;
  background: #243F6A;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-share:hover {
  background: #1a2d4d;
}

/* Content */
.editor-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 1px;
  background: rgba(0, 0, 0, 0.1);
}

.editor-pane {
  flex: 1;
  overflow: hidden;
  background: var(--color-bg);
}

.canvas-pane {
  flex: 2;
}

.outline-pane {
  flex: 1;
}

.inspector-pane {
  width: 320px;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  background: var(--color-surface, rgba(255, 255, 255, 0.02));
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
  min-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal h3 {
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}

.share-description {
  opacity: 0.7;
  margin-bottom: 1.5rem;
}

.share-link-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.share-link {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.9rem;
  word-break: break-all;
}

.btn-copy {
  padding: 0.75rem 1.5rem;
  background: #243F6A;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.btn-copy:hover {
  background: #1a2d4d;
}

.btn-close-modal {
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-close-modal:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
