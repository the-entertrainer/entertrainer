<script setup lang="ts">
import { ref } from 'vue'
import { oneEqualsTwoLesson } from '~/content/oneEqualsTwoLesson'
import LessonPlayer from '~/components/elearn/LessonPlayer.vue'
import type { Lesson } from '~/types/lesson'

const source = ref(JSON.stringify(oneEqualsTwoLesson, null, 2))
const preview = ref<Lesson>(oneEqualsTwoLesson)
const error = ref('')

function updatePreview() {
  try {
    preview.value = JSON.parse(source.value)
    error.value = ''
  } catch (e) {
    error.value = 'Invalid JSON'
  }
}

function copyJson() {
  navigator.clipboard.writeText(source.value)
}
</script>

<template>
  <div class="author">
    <header>
      <h1>E-learning author</h1>
      <p>Edit the lesson JSON. Preview updates on blur. Copy when ready to commit.</p>
    </header>
    <div class="split">
      <textarea v-model="source" @blur="updatePreview" spellcheck="false" />
      <div class="preview">
        <p v-if="error" class="err">{{ error }}</p>
        <LessonPlayer v-else :lesson="preview" />
      </div>
    </div>
    <button type="button" @click="copyJson">Copy JSON</button>
  </div>
</template>

<style scoped>
.author { padding: 1.5rem; }
header h1 { font: 500 2rem/1 var(--font-display); margin: 0 0 0.5rem; }
.split { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 1.5rem 0; min-height: 70vh; }
@media (max-width: 900px) { .split { grid-template-columns: 1fr; } }
textarea { width: 100%; height: 100%; min-height: 60vh; font: 400 0.8125rem/1.4 var(--font-mono); padding: 1rem; border: 1px solid var(--ink); border-radius: 0.5rem; background: var(--paper); resize: none; }
.preview { border: 1px solid var(--line); border-radius: 0.5rem; overflow: auto; max-height: 80vh; }
.err { color: #c45c26; padding: 1rem; }
button { padding: 0.75rem 1.5rem; border: 1px solid var(--ink); border-radius: 999px; background: var(--paper); cursor: pointer; font-weight: 500; }
button:hover { background: var(--accent); }
</style>
