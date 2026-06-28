<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { useScribeFlowStore } from '~/stores/scribeflow'

const scribeStore = useScribeFlowStore()

const speakerInput = ref('')
const newChoiceText = ref('')

const editor = useEditor({
  extensions: [StarterKit],
  content: '',
  editorProps: {
    attributes: { class: 'sfnp-editor-content' }
  },
  onUpdate: ({ editor: e }) => {
    if (!scribeStore.selectedNode) return
    scribeStore.updateNode(scribeStore.selectedNode.id, { data: { content: e.getHTML() } })
  }
})

watch(() => scribeStore.selectedNode, (node) => {
  if (!node) return
  speakerInput.value = node.data.speaker || ''
  if (editor.value && editor.value.getHTML() !== node.data.content) {
    editor.value.commands.setContent(node.data.content || '')
  }
}, { immediate: true })

function saveSpeaker() {
  if (!scribeStore.selectedNode) return
  scribeStore.updateNode(scribeStore.selectedNode.id, { data: { speaker: speakerInput.value } })
}

function addChoice() {
  if (!scribeStore.selectedNode) return
  scribeStore.addChoice(scribeStore.selectedNode.id)
}

function updateChoice(choiceId: string, text: string) {
  if (!scribeStore.selectedNode) return
  scribeStore.updateChoice(scribeStore.selectedNode.id, choiceId, text)
}

function removeChoice(choiceId: string) {
  if (!scribeStore.selectedNode) return
  scribeStore.removeChoice(scribeStore.selectedNode.id, choiceId)
}

function addConnectedNode(type: 'dialogue' | 'choice') {
  if (!scribeStore.selectedNode) return
  const from = scribeStore.selectedNode
  const pos = { x: from.position.x, y: from.position.y + 200 }
  scribeStore.addNode(type, pos, from.id)
}

function deleteNode() {
  if (!scribeStore.selectedNode) return
  scribeStore.deleteNode(scribeStore.selectedNode.id)
}

onUnmounted(() => { editor.value?.destroy() })
</script>

<template>
  <div class="sfnp">
    <div v-if="scribeStore.selectedNode" class="sfnp-inner">
      <!-- Header -->
      <div class="sfnp-head">
        <span class="sfnp-type">{{ scribeStore.selectedNode.type === 'dialogue' ? 'Dialogue' : 'Choice' }}</span>
        <button class="sfnp-del" @click="deleteNode" aria-label="Delete node">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </div>

      <!-- Dialogue fields -->
      <template v-if="scribeStore.selectedNode.type === 'dialogue'">
        <label class="sfnp-label">Speaker</label>
        <input
          v-model="speakerInput" type="text"
          class="sfnp-input" placeholder="Character name…"
          @blur="saveSpeaker" @keyup.enter="($event.target as HTMLInputElement).blur()"
        />

        <label class="sfnp-label">Content</label>
        <div class="sfnp-editor">
          <div v-if="editor" class="sfnp-toolbar">
            <button :class="{ active: editor.isActive('bold') }" @click="editor.chain().focus().toggleBold().run()"><b>B</b></button>
            <button :class="{ active: editor.isActive('italic') }" @click="editor.chain().focus().toggleItalic().run()"><i>I</i></button>
            <button :class="{ active: editor.isActive('bulletList') }" @click="editor.chain().focus().toggleBulletList().run()">•</button>
          </div>
          <EditorContent :editor="editor" />
        </div>
      </template>

      <!-- Choice fields -->
      <template v-else>
        <label class="sfnp-label">Choices</label>
        <div class="sfnp-choices">
          <div v-for="c in scribeStore.selectedNode.data.choices" :key="c.id" class="sfnp-choice">
            <input
              :value="c.text" type="text"
              class="sfnp-input sfnp-choice-input"
              @input="updateChoice(c.id, ($event.target as HTMLInputElement).value)"
            />
            <button class="sfnp-choice-rm" @click="removeChoice(c.id)" aria-label="Remove choice">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <button class="sfnp-add-choice" @click="addChoice">+ Add choice</button>
        </div>
      </template>

      <!-- Quick connect -->
      <div class="sfnp-divider" />
      <label class="sfnp-label">Connect to new</label>
      <div class="sfnp-connect-row">
        <button class="sfnp-connect-btn" @click="addConnectedNode('dialogue')">+ Dialogue</button>
        <button class="sfnp-connect-btn" @click="addConnectedNode('choice')">+ Choice</button>
      </div>
    </div>

    <div v-else class="sfnp-empty">
      <p>Select a node to edit</p>
    </div>
  </div>
</template>

<style scoped>
.sfnp { height: 100%; overflow-y: auto; }

.sfnp-inner { padding: 18rem 16rem; }
.sfnp-empty { padding: 40rem 20rem; text-align: center; font-size: var(--text-sm); opacity: 0.35; }

.sfnp-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 18rem; padding-bottom: 12rem;
  border-bottom: 1px solid var(--color-divider);
}
.sfnp-type { font-size: 13rem; font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase; opacity: 0.5; }

.sfnp-del {
  width: 30rem; height: 30rem; border-radius: var(--radius-s);
  border: 1px solid var(--color-glass-border); background: none;
  color: var(--color-text); opacity: 0.35; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.15s, background 0.15s;
}
.sfnp-del:hover { opacity: 1; background: rgba(220,50,50,0.08); color: #dc3232; border-color: rgba(220,50,50,0.3); }

.sfnp-label {
  display: block; font-size: var(--text-label); font-weight: 600;
  letter-spacing: var(--tracking-label); text-transform: uppercase;
  opacity: 0.4; margin-bottom: 6rem; margin-top: 14rem;
}

.sfnp-input {
  width: 100%; padding: 10rem 12rem;
  border-radius: var(--radius-s); border: 1px solid var(--color-glass-border);
  background: var(--color-glass-bg); color: var(--color-text);
  font: 400 14rem/1.4 var(--main-font);
}
.sfnp-input:focus { outline: none; border-color: var(--color-glass-border-hover); background: var(--color-glass-bg-hover); }
.sfnp-input::placeholder { opacity: 0.3; }

/* ── Tiptap editor ── */
.sfnp-editor {
  border: 1px solid var(--color-glass-border); border-radius: var(--radius-s);
  background: var(--color-glass-bg); overflow: hidden;
}
.sfnp-toolbar {
  display: flex; gap: 2rem; padding: 4rem 6rem;
  border-bottom: 1px solid var(--color-divider);
}
.sfnp-toolbar button {
  width: 28rem; height: 28rem; border-radius: var(--radius-xs);
  border: none; background: none; color: var(--color-text); cursor: pointer;
  font-size: 13rem; display: flex; align-items: center; justify-content: center;
  opacity: 0.5; transition: opacity 0.12s, background 0.12s;
}
.sfnp-toolbar button:hover { opacity: 1; background: var(--color-glass-bg); }
.sfnp-toolbar button.active { opacity: 1; background: var(--color-glass-bg-hover); }

.sfnp-editor :deep(.sfnp-editor-content) {
  padding: 10rem 12rem; min-height: 100rem; font-size: 14rem; line-height: 1.5;
  color: var(--color-text); outline: none;
}
.sfnp-editor :deep(.sfnp-editor-content p) { margin: 0 0 6rem; }
.sfnp-editor :deep(.sfnp-editor-content p:last-child) { margin-bottom: 0; }
.sfnp-editor :deep(.ProseMirror-focused) { outline: none; }

/* ── Choices ── */
.sfnp-choices { display: flex; flex-direction: column; gap: 6rem; }
.sfnp-choice { display: flex; gap: 6rem; align-items: center; }
.sfnp-choice-input { flex: 1; }
.sfnp-choice-rm {
  width: 28rem; height: 28rem; border-radius: var(--radius-xs);
  border: 1px solid transparent; background: none; color: var(--color-text);
  opacity: 0.3; cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.sfnp-choice-rm:hover { opacity: 1; color: #dc3232; border-color: rgba(220,50,50,0.3); }

.sfnp-add-choice {
  padding: 8rem; border-radius: var(--radius-s);
  border: 1px dashed var(--color-glass-border); background: none;
  color: var(--color-text); font: 500 13rem/1 var(--main-font);
  opacity: 0.4; cursor: pointer; transition: opacity 0.15s, background 0.15s;
}
.sfnp-add-choice:hover { opacity: 0.7; background: var(--color-glass-bg); }

/* ── Quick connect ── */
.sfnp-divider { height: 1px; background: var(--color-divider); margin: 20rem 0 4rem; }
.sfnp-connect-row { display: flex; gap: 6rem; }
.sfnp-connect-btn {
  flex: 1; padding: 8rem;
  border-radius: var(--radius-s); border: 1px solid var(--color-glass-border);
  background: none; color: var(--color-text);
  font: 500 12rem/1 var(--main-font); cursor: pointer;
  transition: background 0.15s;
}
.sfnp-connect-btn:hover { background: var(--color-glass-bg); }
</style>
