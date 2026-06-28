<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps({
  data: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="choice-node">
    <Handle type="target" :position="Position.Top" />

    <div class="node-content">
      <div class="choice-label">Decision Point</div>
      <div v-if="data.choices && data.choices.length" class="choices-list">
        <div v-for="choice of data.choices" :key="choice.id" class="choice-item">
          • {{ choice.text?.substring(0, 40) }}
        </div>
      </div>
      <div v-else class="no-choices">Add choices</div>
    </div>

    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.choice-node {
  background: linear-gradient(135deg, #6D8A40 0%, #5a7035 100%);
  border: 2px solid #6D8A40;
  border-radius: 0.75rem;
  padding: 1rem;
  min-width: 200px;
  max-width: 280px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.choice-node:hover {
  box-shadow: 0 8px 20px rgba(109, 138, 64, 0.4);
}

.node-content {
  font-size: 0.85rem;
  line-height: 1.4;
}

.choice-label {
  font-weight: 700;
  margin-bottom: 0.5rem;
  opacity: 0.9;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.5rem;
}

.choices-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.choice-item {
  font-size: 0.8rem;
  opacity: 0.85;
}

.no-choices {
  font-size: 0.8rem;
  opacity: 0.6;
  font-style: italic;
}
</style>
