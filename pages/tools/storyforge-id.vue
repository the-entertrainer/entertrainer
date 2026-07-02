<script setup lang="ts">
import { saveAs } from 'file-saver'
import type { Connection, Mcq, Scene, StoryProject } from '~/types/story'
import { nextAutoPosition } from '~/utils/storyLayout'
import { orderScenes, sceneNumbers } from '~/utils/storyGraph'
import { exportStoryDocx } from '~/utils/storyExportDocx'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

const projectTitle = ref('New Instructional Storyboard')
const projectSummary = ref('')
const objectives = ref<string[]>([])
const scenes = ref<Scene[]>([])
const connections = ref<Connection[]>([])
const mcqs = ref<Mcq[]>([])
const selectedSceneId = ref<string | null>(null)

const activeTab = ref<'storyboard' | 'mcq'>('storyboard')
const showSourcePanel = ref(true)
const showExportMenu = ref(false)

const rawSource = ref('')
const audience = ref('')
const modality = ref('eLearning storyboard')
const tone = ref('clear, practical, and learner-centered')
const screenCount = ref(8)
const pending = ref(false)
const mcqPending = ref(false)
const error = ref('')
const uploadNote = ref('')

const canvasRef = ref<{ zoomIn: () => void; zoomOut: () => void; fitView: () => void } | null>(null)

const numberMap = computed(() => sceneNumbers(scenes.value, connections.value))
const selectedScene = computed(() => scenes.value.find(s => s.id === selectedSceneId.value) ?? null)
const selectedSceneNumber = computed(() => (selectedSceneId.value && numberMap.value.get(selectedSceneId.value)) || 0)
const totalDuration = computed(() => Math.max(1, Math.round(scenes.value.reduce((sum, s) => sum + (s.duration || 0), 0) / 60)))
const canGenerate = computed(() => rawSource.value.trim().length >= 20 && !pending.value)

onMounted(() => {
  if (!scenes.value.length) addScene()
})

function id(prefix: string) { return `${prefix}${Date.now()}-${Math.random().toString(16).slice(2)}` }

function createScene(overrides: Partial<Scene> = {}): Scene {
  const pos = nextAutoPosition(scenes.value, connections.value)
  return {
    id: id('s'), title: 'New Scene', visualDescription: '', narration: '', interactions: '',
    navigation: 'Standard Next', duration: 60, status: 'Draft', x: pos.x, y: pos.y, ...overrides
  }
}

function addScene() {
  const prevLast = orderScenes(scenes.value, connections.value).at(-1) ?? null
  const scene = createScene()
  scenes.value.push(scene)
  if (prevLast) connections.value.push({ id: id('c'), from: prevLast.id, to: scene.id })
  selectedSceneId.value = scene.id
  nextTick(() => canvasRef.value?.fitView())
}

function deleteScene(sceneId: string) {
  scenes.value = scenes.value.filter(s => s.id !== sceneId)
  connections.value = connections.value.filter(c => c.from !== sceneId && c.to !== sceneId)
  mcqs.value.forEach(m => { if (m.sceneId === sceneId) m.sceneId = null })
  if (selectedSceneId.value === sceneId) selectedSceneId.value = null
}
function deleteSelectedScene() {
  if (selectedSceneId.value) deleteScene(selectedSceneId.value)
}

// Lays out a fresh, unordered scene list into one flowing auto-connected
// chain — used for AI generation and for importing storyboards that don't
// already carry canvas positions.
function layoutFromScratch(incoming: Array<Omit<Scene, 'x' | 'y'>>) {
  const laidOut: Scene[] = []
  const conns: Connection[] = []
  for (const raw of incoming) {
    const pos = nextAutoPosition(laidOut, conns)
    const scene: Scene = { ...raw, x: pos.x, y: pos.y }
    const prev = laidOut.at(-1)
    laidOut.push(scene)
    if (prev) conns.push({ id: id('c'), from: prev.id, to: scene.id })
  }
  scenes.value = laidOut
  connections.value = conns
  selectedSceneId.value = laidOut[0]?.id ?? null
}

async function generateWithGroq() {
  if (!canGenerate.value) return
  pending.value = true
  error.value = ''
  try {
    const data = await $fetch<{ title: string; summary: string; learningObjectives: string[]; scenes: Array<Omit<Scene, 'x' | 'y'>>; mcqs: Mcq[] }>('/api/storyforge', {
      method: 'POST',
      body: { raw: rawSource.value, audience: audience.value, modality: modality.value, tone: tone.value, screenCount: screenCount.value }
    })
    projectTitle.value = data.title || projectTitle.value
    projectSummary.value = data.summary || ''
    objectives.value = data.learningObjectives || []
    layoutFromScratch(data.scenes || [])
    mcqs.value = data.mcqs || []
    showSourcePanel.value = false
    nextTick(() => canvasRef.value?.fitView())
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Something went wrong while building the storyboard.'
  } finally {
    pending.value = false
  }
}

async function generateMcqs(count: number) {
  if (!scenes.value.length || mcqPending.value) return
  mcqPending.value = true
  error.value = ''
  try {
    const data = await $fetch<{ mcqs: Mcq[] }>('/api/storyforge-mcq', {
      method: 'POST',
      body: {
        count,
        scenes: scenes.value.map(s => ({ id: s.id, title: s.title, visualDescription: s.visualDescription, narration: s.narration }))
      }
    })
    mcqs.value = [...mcqs.value, ...(data.mcqs || [])]
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Could not generate knowledge checks. Try again.'
  } finally {
    mcqPending.value = false
  }
}

function extractPdfTextFallback(buffer: ArrayBuffer) {
  const raw = new TextDecoder('latin1').decode(buffer)
  return raw
    .replace(/\\\(|\\\)/g, '')
    .match(/[A-Za-z0-9][A-Za-z0-9\s.,;:!?()'"\-/%]{20,}/g)
    ?.join('\n')
    .replace(/\s{2,}/g, ' ')
    .slice(0, 30000) || ''
}

async function importSource(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files || [])
  if (!files.length) return
  uploadNote.value = ''
  const chunks: string[] = []
  for (const file of files) {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const text = extractPdfTextFallback(await file.arrayBuffer())
      chunks.push(`\n\n--- ${file.name} (PDF text extraction) ---\n${text}`)
      uploadNote.value = 'PDF text was extracted with a lightweight in-browser fallback. Review the pasted text before generating.'
    } else {
      chunks.push(`\n\n--- ${file.name} ---\n${await file.text()}`)
    }
  }
  rawSource.value = `${rawSource.value}${chunks.join('')}`.trim()
  ;(e.target as HTMLInputElement).value = ''
}

async function importProject(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const data = JSON.parse(await file.text())
    projectTitle.value = data.title || 'Imported Project'
    projectSummary.value = data.summary || ''
    objectives.value = data.learningObjectives || data.objectives || []
    const incoming = data.scenes || data.screens || []
    const hasLayout = Array.isArray(data.connections) && incoming.length && incoming.every((s: any) => typeof s.x === 'number' && typeof s.y === 'number')
    if (hasLayout) {
      scenes.value = incoming
      connections.value = data.connections
      selectedSceneId.value = incoming[0]?.id ?? null
    } else {
      layoutFromScratch(incoming)
    }
    mcqs.value = data.mcqs || []
    nextTick(() => canvasRef.value?.fitView())
  } catch {
    error.value = 'Could not import that project file.'
  }
  ;(e.target as HTMLInputElement).value = ''
}

function exportSBF() {
  const project: StoryProject = {
    version: '3.0',
    title: projectTitle.value,
    summary: projectSummary.value,
    learningObjectives: objectives.value,
    created: new Date().toISOString(),
    scenes: scenes.value,
    connections: connections.value,
    mcqs: mcqs.value
  }
  saveAs(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), `${safeName(projectTitle.value)}.sbf`)
  showExportMenu.value = false
}

async function exportDocx() {
  showExportMenu.value = false
  try {
    await exportStoryDocx({
      title: projectTitle.value,
      summary: projectSummary.value,
      learningObjectives: objectives.value,
      scenes: scenes.value,
      connections: connections.value,
      mcqs: mcqs.value
    }, `${safeName(projectTitle.value)}.docx`)
  } catch {
    error.value = 'Could not build the Word export. Try again.'
  }
}

function safeName(name: string) { return name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'storyboard' }

function newProject() {
  projectTitle.value = 'New Instructional Storyboard'
  projectSummary.value = ''
  objectives.value = []
  scenes.value = []
  connections.value = []
  mcqs.value = []
  selectedSceneId.value = null
  rawSource.value = ''
  showSourcePanel.value = true
  addScene()
}
</script>

<template>
  <UiToolShell wide eyebrow="Web App" title="StoryForge" deck="Paste messy notes or SME dumps — Groq turns them into a branching storyboard you wire together like a flowchart, plus a knowledge-check quiz. Export both as one Word doc.">
    <section class="glass-panel sf-meta">
      <div class="sf-meta__top">
        <input v-model="projectTitle" class="sf-title" placeholder="Untitled Storyboard">
        <div class="sf-meta__actions">
          <button class="glass-btn glass-btn--ghost" @click="newProject">New</button>
          <label class="glass-chip sf-file">Import .sbf<input type="file" accept=".sbf,.json" @change="importProject"></label>
          <div class="sf-export">
            <button class="glass-btn" @click="showExportMenu = !showExportMenu">Export ↓</button>
            <div v-if="showExportMenu" class="glass-panel sf-menu">
              <button @click="exportDocx">Word (.docx) — Storyboard + MCQ</button>
              <button @click="exportSBF">Save project (.sbf)</button>
            </div>
          </div>
        </div>
      </div>
      <p class="sf-muted">{{ scenes.length }} scenes • {{ mcqs.length }} knowledge checks • Est. {{ totalDuration }} min</p>
      <p v-if="projectSummary" class="sf-summary">{{ projectSummary }}</p>
      <div v-if="objectives.length" class="sf-objectives">
        <span class="glass-label">Objectives</span>
        <ul><li v-for="objective in objectives" :key="objective">{{ objective }}</li></ul>
      </div>
    </section>

    <section class="glass-panel sf-source">
      <button class="sf-source__toggle" @click="showSourcePanel = !showSourcePanel">
        <span>AI Generate from source</span><span>{{ showSourcePanel ? '−' : '+' }}</span>
      </button>
      <div v-if="showSourcePanel" class="sf-source__body">
        <div v-if="pending" class="sf-loading">
          <div class="sf-spinner" />
          <p class="sf-loading-title">Forging your storyboard...</p>
          <p class="sf-muted">Groq is structuring raw content into scenes, navigation, and a knowledge-check quiz.</p>
        </div>
        <form v-else @submit.prevent="generateWithGroq">
          <div class="sf-row">
            <label class="glass-chip sf-file">Upload PDF / text / docs<input type="file" multiple accept=".pdf,.txt,.md,.csv,.json,.doc,.docx,text/*,application/pdf" @change="importSource"></label>
          </div>
          <p v-if="uploadNote" class="glass-note">{{ uploadNote }}</p>
          <label class="glass-label" for="sf-raw">Raw dirty source material</label>
          <textarea id="sf-raw" v-model="rawSource" class="glass-field sf-raw" placeholder="Paste SME notes, policy text, transcripts, outlines, messy bullets, job aids, or extracted document text here..." />
          <div class="sf-controls">
            <div><label class="glass-label">Audience</label><input v-model="audience" class="glass-field" placeholder="e.g. new team leads"></div>
            <div><label class="glass-label">Format</label>
              <select v-model="modality" class="glass-field glass-select">
                <option>eLearning storyboard</option>
                <option>Facilitator-led workshop</option>
                <option>Microlearning sequence</option>
                <option>Scenario-based module</option>
              </select>
            </div>
            <div><label class="glass-label">Scenes</label><input v-model.number="screenCount" class="glass-field" min="3" max="20" type="number"></div>
          </div>
          <label class="glass-label">Tone / design direction</label>
          <input v-model="tone" class="glass-field" placeholder="clear, practical, learner-centered">
          <button class="glass-btn sf-generate" :disabled="!canGenerate">Generate storyboard + quiz with Groq</button>
        </form>
      </div>
    </section>

    <Transition name="fade">
      <p v-if="error" class="glass-note glass-note--error sf-error">{{ error }}</p>
    </Transition>

    <nav class="sf-tabs">
      <button class="sf-tab" :class="{ 'sf-tab--active': activeTab === 'storyboard' }" @click="activeTab = 'storyboard'">Storyboard</button>
      <button class="sf-tab" :class="{ 'sf-tab--active': activeTab === 'mcq' }" @click="activeTab = 'mcq'">Knowledge Checks ({{ mcqs.length }})</button>
    </nav>

    <section v-if="activeTab === 'storyboard'" class="sf-workspace">
      <div class="sf-canvas-wrap">
        <ToolsStoryNodeCanvas
          ref="canvasRef"
          v-model:scenes="scenes"
          v-model:connections="connections"
          v-model:selected-scene-id="selectedSceneId"
          @delete-scene="deleteScene"
        />
        <div class="sf-canvas-toolbar">
          <button class="glass-chip" @click="addScene">+ Scene</button>
          <button class="glass-chip" aria-label="Zoom out" @click="canvasRef?.zoomOut()">−</button>
          <button class="glass-chip" aria-label="Zoom in" @click="canvasRef?.zoomIn()">+</button>
          <button class="glass-chip" @click="canvasRef?.fitView()">Fit</button>
        </div>
        <p class="sf-canvas-hint">Drag a scene's right-edge dot onto another scene to connect them — the flow snaps into place. Tap a curve to disconnect it, or drag its arrival end to re-plug it elsewhere.</p>
      </div>

      <ToolsStorySceneEditorPanel
        :scene="selectedScene"
        :scene-number="selectedSceneNumber"
        @delete="deleteSelectedScene"
        @close="selectedSceneId = null"
      />
    </section>

    <section v-else class="sf-mcq">
      <ToolsStoryMcqPanel v-model:mcqs="mcqs" :scenes="scenes" :pending="mcqPending" @generate="generateMcqs" />
    </section>
  </UiToolShell>
</template>

<style scoped>
.sf-meta { display: flex; flex-direction: column; gap: 10rem; margin-bottom: 14rem; }
.sf-meta__top { display: flex; align-items: center; justify-content: space-between; gap: 14rem; flex-wrap: wrap; }
.sf-meta__actions { display: flex; align-items: center; gap: 8rem; flex-wrap: wrap; }
.sf-title { flex: 1; min-width: 220rem; border: 0; background: transparent; color: var(--color-text); font: 700 28rem/1.1 var(--main-font); letter-spacing: -0.04em; outline: none; }
.sf-file { position: relative; overflow: hidden; }
.sf-file input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.sf-muted, .sf-summary, .sf-objectives li { color: var(--color-text); opacity: 0.68; font-size: 14rem; line-height: 1.5; }
.sf-objectives ul { padding-left: 18rem; display: grid; gap: 6rem; margin-top: 4rem; }
.sf-export { position: relative; }
.sf-menu { position: absolute; right: 0; top: calc(100% + 8rem); min-width: 240rem; padding: 8rem; z-index: 20; }
.sf-menu button { display: block; width: 100%; padding: 10rem 12rem; border-radius: 10rem; text-align: left; font-size: 13rem; }

.sf-source { margin-bottom: 14rem; }
.sf-source__toggle {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  font-size: 13rem; font-weight: 700; letter-spacing: 0.02em; opacity: 0.85;
}
.sf-source__body { margin-top: 16rem; display: flex; flex-direction: column; gap: 14rem; }
.sf-row { display: flex; align-items: center; gap: 10rem; flex-wrap: wrap; }
.sf-raw { min-height: 160rem; resize: vertical; }
.sf-controls { display: grid; grid-template-columns: 1fr 1fr 110rem; gap: 12rem; }
.sf-generate { margin-top: 4rem; align-self: flex-start; }
.sf-error { margin: 0 0 14rem; }

.sf-loading { min-height: 220rem; display: grid; place-items: center; text-align: center; align-content: center; gap: 12rem; }
.sf-spinner { width: 38rem; height: 38rem; border-radius: 999px; border: 3rem solid var(--color-spinner-track); border-top-color: var(--color-text); animation: spin 0.8s linear infinite; }
.sf-loading-title { font-size: 19rem; font-weight: 700; }
@keyframes spin { to { transform: rotate(360deg); } }

.sf-tabs { display: flex; gap: 8rem; margin-bottom: 14rem; }
.sf-tab {
  padding: 9rem 18rem; border-radius: 999px; font-size: 13rem; font-weight: 600;
  background: color-mix(in srgb, var(--color-bg) 50%, transparent);
  border: 1px solid var(--color-glass-border); opacity: 0.65;
  transition: opacity 0.15s ease, background 0.15s ease;
}
.sf-tab--active { opacity: 1; background: var(--color-text); color: var(--color-bg); border-color: transparent; }

.sf-workspace { display: grid; grid-template-columns: minmax(0, 1fr) 360rem; gap: 18rem; align-items: start; }
.sf-canvas-wrap { display: flex; flex-direction: column; gap: 10rem; position: relative; }
.sf-canvas-wrap :deep(.node-canvas) { height: clamp(420rem, 64dvh, 760rem); }
.sf-canvas-toolbar { position: absolute; top: 14rem; left: 14rem; display: flex; gap: 6rem; z-index: 10; }
.sf-canvas-hint { font-size: 12rem; opacity: 0.5; line-height: 1.5; }

.sf-mcq { padding-bottom: 20rem; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 900px) {
  .sf-workspace { grid-template-columns: 1fr; }
  .sf-controls { grid-template-columns: 1fr; }
  .sf-title { font-size: 24rem; }
}
</style>
