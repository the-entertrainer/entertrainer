<script setup lang="ts">
import { useScribeFlowStore } from '~/stores/scribeflow'
import { ref, watch } from 'vue'

const scribeStore = useScribeFlowStore()

const editingSpeaker = ref('')
const editingContent = ref('')
const newChoiceText = ref('')

watch(
  () => scribeStore.selectedNode,
  (node) => {
    if (node) {
      editingSpeaker.value = node.data.speaker || ''
      editingContent.value = node.data.content || ''
    }
  },
  { immediate: true }
)

const saveSpeaker = () => {
  if (scribeStore.selectedNode) {
    scribeStore.updateNode(scribeStore.selectedNode.id, {
      data: {
        ...scribeStore.selectedNode.data,
        speaker: editingSpeaker.value
      }
    })
  }
}

const saveContent = () => {
  if (scribeStore.selectedNode) {
    scribeStore.updateNode(scribeStore.selectedNode.id, {
      data: {
        ...scribeStore.selectedNode.data,
        content: editingContent.value
      }
    })
  }
}

const addChoice = () => {
  if (!newChoiceText.value.trim() || !scribeStore.selectedNode) return

  const choices = scribeStore.selectedNode.data.choices || []
  const newChoice = {
    id: `choice_${Date.now()}`,
    text: newChoiceText.value
  }

  scribeStore.updateNode(scribeStore.selectedNode.id, {
    data: {
      ...scribeStore.selectedNode.data,
      choices: [...choices, newChoice]
    }
  })

  newChoiceText.value = ''
}

const removeChoice = (choiceId: string) => {
  if (!scribeStore.selectedNode) return

  const choices = (scribeStore.selectedNode.data.choices || []).filter(c => c.id !== choiceId)
  scribeStore.updateNode(scribeStore.selectedNode.id, {
    data: {
      ...scribeStore.selectedNode.data,
      choices
    }
  })
}

const deleteNode = () => {
  if (scribeStore.selectedNode && confirm('Delete this node?')) {
    scribeStore.deleteNode(scribeStore.selectedNode.id)
  }
}
</script>

<template>
  <div class="node-panel">
    <div v-if="scribeStore.selectedNode" class="panel-content">
      <!-- Header -->
      <div class="panel-header">
        <h4>{{ scribeStore.selectedNode.type === 'dialogue' ? 'Dialogue' : 'Choice' }} Node</h4>
        <button class="btn-delete-node" @click="deleteNode">🗑</button>
      </div>

      <!-- Dialogue Node Editor -->
      <template v-if="scribeStore.selectedNode.type === 'dialogue'">
        <div class="field">
          <label>Speaker</label>
          <input
            v-model="editingSpeaker"
            type="text"
            placeholder="Character name..."
            @blur="saveSpeaker"
          />
        </div>

        <div class="field">
          <label>Content</label>
          <textarea
            v-model="editingContent"
            placeholder="Dialogue text..."
            rows="6"
            @blur="saveContent"
          />
        </div>
      </template>

      <!-- Choice Node Editor -->
      <template v-else>
        <div class="field">
          <label>Choices</label>
          <div v-if="scribeStore.selectedNode.data.choices?.length" class="choices-list">
            <div
              v-for="choice of scribeStore.selectedNode.data.choices"
              :key="choice.id"
              class="choice-item"
            >
              <span>{{ choice.text }}</span>
              <button @click="removeChoice(choice.id)" class="btn-remove">✕</button>
            </div>
          </div>
          <div v-else class="empty-choices">No choices yet</div>
        </div>

        <div class="field">
          <input
            v-model="newChoiceText"
            type="text"
            placeholder="Add a new choice..."
            @keyup.enter="addChoice"
          />
          <button @click="addChoice" class="btn-add-choice">Add Choice</button>
        </div>
      </template>
    </div>

    <div v-else class="panel-empty">
      <p>Select a node to edit</p>
    </div>
  </div>
</template>

<style scoped>
.node-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg);
  overflow-y: auto;
}

.panel-content {
  padding: 1.5rem;
  flex: 1;
}

.panel-empty {
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.panel-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.btn-delete-node {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
  color: #ff4444;
  transition: all 0.2s;
}

.btn-delete-node:hover {
  background: rgba(255, 0, 0, 0.1);
}

.field {
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.field input,
.field textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: #243F6A;
  background: rgba(255, 255, 255, 0.08);
}

.choices-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.choice-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: rgba(109, 138, 64, 0.1);
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

.btn-remove {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: none;
  color: #ff4444;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-remove:hover {
  color: #ff2222;
}

.empty-choices {
  padding: 1rem;
  text-align: center;
  font-size: 0.85rem;
  opacity: 0.6;
  font-style: italic;
}

.btn-add-choice {
  width: 100%;
  padding: 0.5rem;
  background: #6D8A40;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-add-choice:hover {
  background: #5a7035;
}
</style>
