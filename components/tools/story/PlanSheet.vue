<script setup lang="ts">
import { modelOf } from '~/utils/idModels'

// The design-plan worksheet for process frameworks (ADDIE, SAM): the
// phases describe the designer's project, not the learner's screens — so
// they live here as guided notes, and export as a Design Plan table.
const plan = defineModel<Record<string, string>>('plan', { required: true })
const props = defineProps<{ modelId: string }>()
defineEmits<{ close: [] }>()

const model = computed(() => modelOf(props.modelId))
</script>

<template>
  <div class="plan-overlay" @click.self="$emit('close')">
    <div class="plan glass-panel" data-lenis-prevent>
      <header class="plan__head">
        <div>
          <h2>{{ model.label }} design plan</h2>
          <p>{{ model.label }} phases describe your project, not the learner's screens — capture the plan here. It leads the Word and Excel exports.</p>
        </div>
        <button class="plan__close" aria-label="Close" @click="$emit('close')"><ToolsStoryIcon name="close" :size="14" /></button>
      </header>

      <div v-for="s in model.stages" :key="s.id" class="plan__phase" :style="{ '--stage-color': s.color }">
        <div class="plan__phase-head">
          <span class="plan__dot" />
          <strong>{{ s.label }}</strong>
        </div>
        <p class="plan__prompt">{{ s.prompt }}</p>
        <textarea v-model="plan[s.id]" class="glass-field plan__field" rows="3" :placeholder="`Notes for ${s.label}…`" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.plan-overlay {
  position: fixed;
  inset: 0;
  z-index: 33;
  background: rgba(0, 0, 0, 0.42);
  display: grid;
  place-items: center;
  padding: 1rem;
}
.plan {
  width: min(38.75rem, 100%);
  max-height: calc(100dvh - 3rem);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.plan__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; }
.plan__head h2 { font-size: 1.25rem; letter-spacing: -0.03em; margin-bottom: 0.375rem; }
.plan__head p { font-size: 0.8125rem; opacity: 0.65; line-height: 1.5; }
.plan__close {
  width: 1.75rem; height: 1.75rem;
  display: grid; place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  border: 1px solid var(--color-glass-border);
  font-size: 0.75rem;
  flex-shrink: 0;
}
.plan__phase { display: flex; flex-direction: column; gap: 0.4375rem; }
.plan__phase-head { display: flex; align-items: center; gap: 0.5625rem; font-size: 0.90625rem; }
.plan__dot { width: 0.6875rem; height: 0.6875rem; border-radius: 999px; background: var(--stage-color); }
.plan__prompt {
  font-size: 0.78125rem;
  line-height: 1.5;
  opacity: 0.75;
  padding: 0.5rem 0.75rem;
  border-radius: 0.625rem;
  background: color-mix(in srgb, var(--stage-color) 10%, transparent);
  border-left: 0.1875rem solid var(--stage-color);
}
.plan__field { resize: vertical; min-height: 4.75rem; }

@media (max-width: 640px) {
  .plan-overlay { padding: 0.625rem; align-items: end; display: flex; }
  .plan { border-radius: 1.375rem 1.375rem 0 0; width: 100%; max-height: 86dvh; }
  .plan__field { font-size: 16px; }
}
</style>
