<script setup lang="ts">
import type { Mcq, Scene } from '~/types/story'

const mcqs = defineModel<Mcq[]>('mcqs', { required: true })
const props = defineProps<{ scenes: Scene[]; pending?: boolean }>()
const emit = defineEmits<{ generate: [count: number] }>()

const genCount = ref(5)

function newMcq(): Mcq {
  const id = `m${Date.now()}-${Math.random().toString(16).slice(2)}`
  return {
    id,
    sceneId: null,
    question: '',
    explanation: '',
    options: [0, 1, 2, 3].map(i => ({ id: `${id}-o${i}`, text: '', correct: i === 0 }))
  }
}
function addMcq() { mcqs.value.push(newMcq()) }
function removeMcq(id: string) { mcqs.value = mcqs.value.filter(m => m.id !== id) }
function setCorrect(mcq: Mcq, optionId: string) {
  mcq.options.forEach(o => { o.correct = o.id === optionId })
}
</script>

<template>
  <div class="mcq-panel">
    <div class="mcq-toolbar">
      <div class="mcq-toolbar__gen">
        <input v-model.number="genCount" type="number" min="1" max="15" class="glass-field mcq-count">
        <button class="glass-btn glass-btn--ghost" :disabled="pending || !scenes.length" @click="emit('generate', genCount)">
          {{ pending ? 'Generating…' : 'Generate with AI' }}
        </button>
      </div>
      <button class="glass-btn" @click="addMcq">+ Add question</button>
    </div>

    <p v-if="!scenes.length" class="glass-note">Add storyboard scenes first — knowledge checks can link back to them.</p>

    <TransitionGroup name="mcq-list" tag="div" class="mcq-list">
      <article v-for="mcq in mcqs" :key="mcq.id" class="glass-panel mcq-card">
        <div class="mcq-card__head">
          <select v-model="mcq.sceneId" class="glass-field glass-select mcq-scene-select">
            <option :value="null">General question</option>
            <option v-for="s in scenes" :key="s.id" :value="s.id">{{ s.title || 'Untitled scene' }}</option>
          </select>
          <button class="glass-chip mcq-delete" @click="removeMcq(mcq.id)">Delete</button>
        </div>

        <label class="glass-label" :for="`mcq-q-${mcq.id}`">Question</label>
        <textarea :id="`mcq-q-${mcq.id}`" v-model="mcq.question" class="glass-field" rows="2" placeholder="What does this knowledge check test?" />

        <label class="glass-label">Options — select the correct one</label>
        <div class="mcq-options">
          <label v-for="(opt, i) in mcq.options" :key="opt.id" class="mcq-option" :class="{ 'mcq-option--correct': opt.correct }">
            <input type="radio" :name="`correct-${mcq.id}`" :checked="opt.correct" @change="setCorrect(mcq, opt.id)">
            <input v-model="opt.text" class="glass-field mcq-option-input" :placeholder="`Option ${String.fromCharCode(65 + i)}`">
          </label>
        </div>

        <label class="glass-label" :for="`mcq-e-${mcq.id}`">Explanation</label>
        <textarea :id="`mcq-e-${mcq.id}`" v-model="mcq.explanation" class="glass-field" rows="2" placeholder="Why is the correct answer right?" />
      </article>
    </TransitionGroup>

    <p v-if="!mcqs.length" class="glass-note">No knowledge checks yet — add one or generate a set from your scenes.</p>
  </div>
</template>

<style scoped>
.mcq-panel { display: flex; flex-direction: column; gap: 16rem; }
.mcq-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12rem; flex-wrap: wrap; }
.mcq-toolbar__gen { display: flex; align-items: center; gap: 8rem; }
.mcq-count { width: 64rem; text-align: center; }

.mcq-list { position: relative; display: flex; flex-direction: column; gap: 14rem; }
.mcq-list-enter-active, .mcq-list-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.mcq-list-enter-from, .mcq-list-leave-to { opacity: 0; transform: translateY(10rem) scale(0.99); }
.mcq-list-leave-active { position: absolute; }

.mcq-card { display: flex; flex-direction: column; gap: 10rem; }
.mcq-card__head { display: flex; align-items: center; gap: 10rem; justify-content: space-between; }
.mcq-scene-select { max-width: 260rem; }
.mcq-delete { color: #ff8d8d; flex-shrink: 0; }

.mcq-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8rem 12rem; }
.mcq-option { display: flex; align-items: center; gap: 8rem; }
.mcq-option input[type="radio"] { width: 16rem; height: 16rem; accent-color: var(--color-accent); flex-shrink: 0; }
.mcq-option-input { padding: 10rem 12rem; }
.mcq-option--correct .mcq-option-input { border-color: color-mix(in srgb, #3fbf6f 55%, var(--color-glass-border)); }

@media (max-width: 640px) {
  .mcq-options { grid-template-columns: 1fr; }
  .mcq-scene-select { max-width: none; flex: 1; }
}
</style>
