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
  padding: 16rem;
}
.plan {
  width: min(620rem, 100%);
  max-height: calc(100dvh - 48rem);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16rem;
}
.plan__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12rem; }
.plan__head h2 { font-size: 20rem; letter-spacing: -0.03em; margin-bottom: 6rem; }
.plan__head p { font-size: 13rem; opacity: 0.65; line-height: 1.5; }
.plan__close {
  width: 28rem; height: 28rem;
  display: grid; place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  border: 1px solid var(--color-glass-border);
  font-size: 11rem;
  flex-shrink: 0;
}
.plan__phase { display: flex; flex-direction: column; gap: 7rem; }
.plan__phase-head { display: flex; align-items: center; gap: 9rem; font-size: 14.5rem; }
.plan__dot { width: 11rem; height: 11rem; border-radius: 999px; background: var(--stage-color); }
.plan__prompt {
  font-size: 12.5rem;
  line-height: 1.5;
  opacity: 0.75;
  padding: 8rem 12rem;
  border-radius: 10rem;
  background: color-mix(in srgb, var(--stage-color) 10%, transparent);
  border-left: 3rem solid var(--stage-color);
}
.plan__field { resize: vertical; min-height: 76rem; }

@media (max-width: 640px) {
  .plan-overlay { padding: 10rem; align-items: end; display: flex; }
  .plan { border-radius: 22rem 22rem 0 0; width: 100%; max-height: 86dvh; }
  .plan__field { font-size: 16px; }
}
</style>
