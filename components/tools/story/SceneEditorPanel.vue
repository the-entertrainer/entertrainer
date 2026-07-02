<script setup lang="ts">
import type { Scene } from '~/types/story'

defineProps<{ scene: Scene | null; sceneNumber: number }>()
defineEmits<{ delete: []; close: [] }>()

function pad(n: number) { return String(n).padStart(2, '0') }
</script>

<template>
  <Transition name="sheet">
    <aside v-if="scene" :key="scene.id" class="editor-panel glass-panel">
      <div class="editor-panel__head">
        <span class="glass-label">Scene {{ pad(sceneNumber) }}</span>
        <div class="editor-panel__head-actions">
          <button class="glass-chip editor-panel__delete" @click="$emit('delete')">Delete</button>
          <button class="editor-panel__close" aria-label="Close editor" @click="$emit('close')">✕</button>
        </div>
      </div>

      <label class="glass-label" for="ep-title">Scene title</label>
      <input id="ep-title" v-model="scene.title" class="glass-field">

      <label class="glass-label" for="ep-visual">Visual description &amp; on-screen text</label>
      <textarea id="ep-visual" v-model="scene.visualDescription" class="glass-field" rows="4" />

      <label class="glass-label" for="ep-narration">Narration / audio script</label>
      <textarea id="ep-narration" v-model="scene.narration" class="glass-field" rows="3" />

      <label class="glass-label" for="ep-interactions">Learner interactions &amp; feedback</label>
      <textarea id="ep-interactions" v-model="scene.interactions" class="glass-field" rows="3" />

      <label class="glass-label" for="ep-nav">Navigation &amp; branching notes</label>
      <textarea id="ep-nav" v-model="scene.navigation" class="glass-field" rows="2" />

      <div class="editor-panel__row">
        <div>
          <label class="glass-label" for="ep-duration">Duration (sec)</label>
          <input id="ep-duration" v-model.number="scene.duration" type="number" min="0" class="glass-field">
        </div>
        <div>
          <label class="glass-label" for="ep-status">Status</label>
          <select id="ep-status" v-model="scene.status" class="glass-field glass-select">
            <option>Draft</option>
            <option>SME Review</option>
            <option>Approved</option>
            <option>Final</option>
          </select>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.editor-panel {
  display: flex;
  flex-direction: column;
  gap: 10rem;
  position: sticky;
  top: 24rem;
  max-height: calc(100dvh - 48rem);
  overflow-y: auto;
}
.editor-panel__head { display: flex; align-items: center; justify-content: space-between; gap: 10rem; }
.editor-panel__head-actions { display: flex; align-items: center; gap: 8rem; }
.editor-panel__delete { color: #ff8d8d; }
.editor-panel__close {
  width: 26rem; height: 26rem;
  display: grid; place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  border: 1px solid var(--color-glass-border);
  font-size: 11rem;
}
.editor-panel__row { display: grid; grid-template-columns: 1fr 1fr; gap: 12rem; }

.sheet-enter-active, .sheet-leave-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; transform: translateY(14rem); }

@media (max-width: 900px) {
  .editor-panel {
    position: fixed;
    left: 12rem; right: 12rem; bottom: 12rem;
    top: auto;
    max-height: 76dvh;
    padding-bottom: calc(20rem + var(--safe-bottom));
    z-index: 30;
    box-shadow: 0 -20rem 60rem -20rem rgba(0, 0, 0, 0.65);
  }
  .sheet-enter-from, .sheet-leave-to { transform: translateY(100%); opacity: 1; }
}
</style>
