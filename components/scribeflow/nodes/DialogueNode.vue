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
  <div class="dialogue-node">
    <Handle type="target" :position="Position.Top" />

    <div class="node-header">
      <div class="speaker-name">{{ data.speaker || 'Character' }}</div>
    </div>

    <div class="node-content">
      <p>{{ data.content?.substring(0, 100) }}...</p>
    </div>

    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.dialogue-node {
  background: linear-gradient(135deg, #243F6A 0%, #1a2d4d 100%);
  border: 2px solid #243F6A;
  border-radius: 0.75rem;
  padding: 1rem;
  min-width: 200px;
  max-width: 280px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.dialogue-node:hover {
  box-shadow: 0 8px 20px rgba(36, 63, 106, 0.4);
}

.node-header {
  margin-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.5rem;
}

.speaker-name {
  font-size: 0.9rem;
  font-weight: 700;
  opacity: 0.9;
}

.node-content {
  font-size: 0.85rem;
  line-height: 1.4;
  opacity: 0.85;
}

.node-content p {
  margin: 0;
}
</style>
