<script setup lang="ts">
import { onMounted, ref } from 'vue'
const props = defineProps<{ block: { title?: string; steps: { label: string; detail?: string; bad?: boolean; note?: string }[] } }>()
const emit = defineEmits<{ complete: [] }>()
const revealed = ref(0)

function finish() {
  if (!props.block.steps.length || revealed.value >= props.block.steps.length - 1) emit('complete')
}

function next() {
  if (revealed.value < props.block.steps.length - 1) revealed.value++
  finish()
}

onMounted(finish)
</script>
<template>
  <div class="elearn-process">
    <h3 v-if="block.title" class="elearn-process__title">{{ block.title }}</h3>
    <p v-if="!block.steps.length" class="done">No steps yet.</p>
    <ol v-else class="elearn-process__steps">
      <li
        v-for="(step, i) in block.steps"
        :key="i"
        class="elearn-process__step"
        :class="{ 'is-revealed': i <= revealed, 'is-bad': step.bad && i <= revealed }"
      >
        <span class="num">{{ i + 1 }}</span>
        <div>
          <strong>{{ step.label }}</strong>
          <p v-if="step.detail && i <= revealed" class="detail">{{ step.detail }}</p>
          <p v-if="step.bad && i === revealed && step.note" class="note">{{ step.note }}</p>
        </div>
      </li>
    </ol>
    <button v-if="block.steps.length && revealed < block.steps.length - 1" type="button" class="elearn-btn" @click="next">
      Next step
    </button>
    <p v-else-if="block.steps.length" class="done">{{ block.steps.some(step => step.bad) ? 'You found the crack.' : 'All steps shown.' }}</p>
  </div>
</template>
<style scoped>
.elearn-process { border: 1px solid var(--ink); border-radius: 0.5rem; padding: 1.25rem; background: var(--paper); }
.elearn-process__title { margin: 0 0 1rem; font: 500 1.25rem/1.2 var(--font-display); }
.elearn-process__steps { list-style: none; margin: 0; padding: 0; }
.elearn-process__step { display: grid; grid-template-columns: 2rem 1fr; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid var(--line); opacity: 0.4; transition: opacity 0.3s; }
.elearn-process__step.is-revealed { opacity: 1; }
.elearn-process__step.is-bad { background: color-mix(in srgb, #c45c26 8%, transparent); border-radius: 0.25rem; }
.num { font: 500 0.875rem/1 var(--font-mono); color: var(--signal-cobalt); }
.detail, .note { margin: 0.25rem 0 0; font-size: 0.9375rem; color: var(--ink-soft); }
.note { color: #c45c26; font-weight: 500; }
.elearn-btn { margin-top: 1rem; padding: 0.625rem 1.25rem; border: 1px solid var(--ink); border-radius: 999px; background: var(--paper); cursor: pointer; font-weight: 500; }
.elearn-btn:hover { background: var(--accent); }
.done { margin: 1rem 0 0; font-weight: 500; color: var(--signal-cobalt); }
</style>
