<script setup lang="ts">
import type { ModelId } from '~/utils/idModels'
import { ID_MODELS, MODEL_ORDER, modelOf } from '~/utils/idModels'
import { parseFiles } from '~/utils/parseSource'
import { aiGenerateStoryboard, type GeneratedStoryboard } from '~/utils/aiStoryboard'

// "New storyboard with AI": real document parsing in the browser, then one
// tightly-controlled Groq call that must return our exact card schema.
const props = defineProps<{ defaultModel?: ModelId }>()
const emit = defineEmits<{ close: []; done: [result: GeneratedStoryboard & { modelId: ModelId }] }>()

const { settings } = useAiSettings()

const chosenModel = ref<ModelId>(props.defaultModel && props.defaultModel !== 'freeform' ? props.defaultModel : 'gagne')
const pasted = ref('')
const fileText = ref('')
const fileNames = ref<string[]>([])
const parseNotes = ref<string[]>([])
const screenCount = ref(10)
const phase = ref<'idle' | 'parsing' | 'generating'>('idle')
const error = ref('')

const sourceChars = computed(() => fileText.value.length + pasted.value.trim().length)
const canGenerate = computed(() => phase.value === 'idle' && sourceChars.value >= 80)

async function onFiles(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files || [])
  if (!files.length) return
  phase.value = 'parsing'
  error.value = ''
  try {
    const parsed = await parseFiles(files)
    fileText.value = [fileText.value, parsed.text].filter(Boolean).join('\n\n').slice(0, 60000)
    fileNames.value = [...fileNames.value, ...files.map(f => f.name)]
    parseNotes.value = parsed.notes
  } catch {
    error.value = 'Could not read those files.'
  }
  phase.value = 'idle'
  ;(e.target as HTMLInputElement).value = ''
}

function clearFiles() {
  fileText.value = ''
  fileNames.value = []
  parseNotes.value = []
}

async function generate() {
  if (!canGenerate.value) return
  phase.value = 'generating'
  error.value = ''
  try {
    const source = [fileText.value, pasted.value.trim()].filter(Boolean).join('\n\n')
    const result = await aiGenerateStoryboard(settings.value.key, source, modelOf(chosenModel.value), screenCount.value)
    emit('done', { ...result, modelId: chosenModel.value })
  } catch (e: any) {
    error.value = e?.message || 'Something went wrong — try again.'
    phase.value = 'idle'
  }
}
</script>

<template>
  <div class="aig-overlay" @click.self="phase !== 'generating' && emit('close')">
    <div class="aig glass-panel" data-lenis-prevent>
      <header class="aig__head">
        <div>
          <h2 class="aig__head-title"><ToolsStoryIcon name="sparkle" :size="16" /> New storyboard with AI</h2>
          <p>Drop in source material — the AI structures it into framework-shaped screen cards you fully control afterward.</p>
        </div>
        <button class="aig__close" aria-label="Close" :disabled="phase === 'generating'" @click="emit('close')"><ToolsStoryIcon name="close" :size="14" /></button>
      </header>

      <div v-if="phase === 'generating'" class="aig__busy">
        <div class="aig__spinner" />
        <p class="aig__busy-title">Structuring your storyboard…</p>
        <p class="aig__busy-sub">Analyzing the source and mapping it onto {{ ID_MODELS[chosenModel].label }} stages.</p>
      </div>

      <template v-else>
        <label class="glass-chip aig__file">
          {{ phase === 'parsing' ? 'Parsing…' : 'Upload documents — PDF, Word (.docx), text, markdown, CSV, HTML' }}
          <input type="file" multiple :disabled="phase === 'parsing'" accept=".pdf,.docx,.txt,.md,.markdown,.csv,.json,.html,.htm,.rtf,.vtt,.srt" @change="onFiles">
        </label>
        <p v-if="fileNames.length" class="aig__filelist">
          Parsed: {{ fileNames.join(', ') }} <button class="aig__clear" @click="clearFiles">clear</button>
        </p>
        <p v-for="note in parseNotes" :key="note" class="aig__note">{{ note }}</p>

        <label class="glass-label" for="aig-paste">And / or paste source text</label>
        <textarea
          id="aig-paste" v-model="pasted" class="glass-field aig__paste" rows="5"
          placeholder="SME notes, policy text, transcripts, outlines, messy bullets…"
        />

        <div class="aig__row">
          <div>
            <label class="glass-label" for="aig-model">Framework</label>
            <select id="aig-model" v-model="chosenModel" class="glass-field glass-select">
              <option v-for="m in MODEL_ORDER" :key="m" :value="m">{{ ID_MODELS[m].label }}</option>
            </select>
          </div>
          <div>
            <label class="glass-label" for="aig-count">Screens (approx.)</label>
            <input id="aig-count" v-model.number="screenCount" type="number" min="5" max="20" class="glass-field">
          </div>
        </div>

        <p v-if="error" class="aig__error">{{ error }}</p>

        <div class="aig__actions">
          <button class="glass-btn" :disabled="!canGenerate" @click="generate">Generate storyboard</button>
          <span class="aig__chars">{{ !sourceChars ? 'Add at least a paragraph of source' : sourceChars >= 1000 ? `${Math.round(sourceChars / 1000)}k chars of source` : `${sourceChars} chars of source` }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.aig-overlay {
  position: fixed;
  inset: 0;
  z-index: 33;
  background: rgba(0, 0, 0, 0.42);
  display: grid;
  place-items: center;
  padding: 16rem;
}
.aig {
  width: min(600rem, 100%);
  max-height: calc(100dvh - 48rem);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12rem;
}
.aig__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12rem; }
.aig__head h2 { font-size: 20rem; letter-spacing: -0.03em; margin-bottom: 6rem; }
.aig__head-title { display: flex; align-items: center; gap: 8rem; color: #8B7CF6; }
.aig__head p { font-size: 13rem; opacity: 0.65; line-height: 1.5; }
.aig__close {
  width: 28rem; height: 28rem;
  display: grid; place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  border: 1px solid var(--color-glass-border);
  font-size: 11rem;
  flex-shrink: 0;
}
.aig__file { position: relative; overflow: hidden; justify-content: center; padding: 12rem; width: 100%; text-align: center; }
.aig__file input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.aig__filelist { font-size: 12rem; opacity: 0.7; line-height: 1.5; }
.aig__clear { font-size: 11.5rem; text-decoration: underline; opacity: 0.7; color: var(--color-text); margin-left: 4rem; }
.aig__note { font-size: 12rem; color: #FBBF24; line-height: 1.45; }
.aig__paste { resize: vertical; min-height: 96rem; }
.aig__row { display: grid; grid-template-columns: 1fr 130rem; gap: 12rem; }
.aig__error {
  font-size: 12.5rem;
  line-height: 1.5;
  color: #ff8d8d;
  padding: 9rem 12rem;
  border-radius: 10rem;
  background: color-mix(in srgb, #ff6b6b 10%, transparent);
}
.aig__actions { display: flex; align-items: center; gap: 12rem; flex-wrap: wrap; }
.aig__chars { font-size: 11.5rem; opacity: 0.55; }

.aig__busy { min-height: 220rem; display: grid; place-items: center; align-content: center; gap: 12rem; text-align: center; }
.aig__spinner {
  width: 38rem; height: 38rem;
  border-radius: 999px;
  border: 3rem solid var(--color-spinner-track);
  border-top-color: var(--color-text);
  animation: aig-spin 0.8s linear infinite;
}
@keyframes aig-spin { to { transform: rotate(360deg); } }
.aig__busy-title { font-size: 17rem; font-weight: 700; }
.aig__busy-sub { font-size: 13rem; opacity: 0.6; }

@media (max-width: 640px) {
  .aig-overlay { padding: 10rem; align-items: end; display: flex; }
  .aig { border-radius: 22rem 22rem 0 0; width: 100%; max-height: 86dvh; }
  .aig__paste, .aig__row .glass-field { font-size: 16px; }
  .aig__row { grid-template-columns: 1fr 110rem; }
}
</style>
