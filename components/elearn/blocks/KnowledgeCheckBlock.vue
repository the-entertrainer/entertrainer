<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{
  block: {
    question: string
    options: { id: string; text: string }[]
    correctId: string
    feedback: { correct: string; incorrect: string }
  }
}>()
const emit = defineEmits<{ complete: [] }>()
const selected = ref<string | null>(null)
const submitted = ref(false)

function submit() {
  if (!selected.value) return
  submitted.value = true
  emit('complete')
}
</script>
<template>
  <div class="elearn-check">
    <p class="q">{{ block.question }}</p>
    <div class="options">
      <label v-for="opt in block.options" :key="opt.id" class="opt" :class="{ selected: selected === opt.id, correct: submitted && opt.id === block.correctId, wrong: submitted && selected === opt.id && opt.id !== block.correctId }">
        <input type="radio" :value="opt.id" v-model="selected" :disabled="submitted" />
        {{ opt.text }}
      </label>
    </div>
    <button v-if="!submitted" type="button" class="elearn-btn" :disabled="!selected" @click="submit">Check</button>
    <p v-else class="feedback" :class="{ good: selected === block.correctId }">
      {{ selected === block.correctId ? block.feedback.correct : block.feedback.incorrect }}
    </p>
  </div>
</template>
<style scoped>
.elearn-check { border: 1px solid var(--ink); border-radius: 0.5rem; padding: 1.25rem; }
.q { margin: 0 0 1rem; font-weight: 500; font-size: 1.125rem; }
.options { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
.opt { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 0.75rem; border: 1px solid var(--line); border-radius: 0.375rem; cursor: pointer; }
.opt.selected { border-color: var(--ink); background: color-mix(in srgb, var(--accent) 20%, transparent); }
.opt.correct { border-color: #2a7a3a; background: color-mix(in srgb, #2a7a3a 12%, transparent); }
.opt.wrong { border-color: #c45c26; background: color-mix(in srgb, #c45c26 12%, transparent); }
.elearn-btn { padding: 0.625rem 1.25rem; border: 1px solid var(--ink); border-radius: 999px; background: var(--paper); cursor: pointer; font-weight: 500; }
.elearn-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.feedback { margin: 1rem 0 0; font-weight: 500; }
.feedback.good { color: #2a7a3a; }
</style>
