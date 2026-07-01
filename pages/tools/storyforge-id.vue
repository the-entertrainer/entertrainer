<script setup lang="ts">
import { saveAs } from 'file-saver'
import PptxGenJS from 'pptxgenjs'
import jsPDF from 'jspdf'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

type Scene = {
  id: string
  title: string
  visualDescription: string
  narration: string
  interactions: string
  navigation: string
  duration: number
  status: string
}

type CopilotField = 'visualDescription' | 'narration' | 'interactions' | 'navigation'

// ── Project state ──────────────────────────────────────────────────────────
const projectTitle   = ref('New Instructional Storyboard')
const projectSummary = ref('')
const objectives     = ref<string[]>([])
const screens        = ref<Scene[]>([])
const selectedScreen = ref<Scene | null>(null)
const showExportMenu = ref(false)
const rawSource      = ref('')
const audience       = ref('')
const modality       = ref('eLearning storyboard')
const tone           = ref('clear, practical, and learner-centered')
const screenCount    = ref(8)
const pending        = ref(false)
const error          = ref('')
const uploadNote     = ref('')
const draggedIndex   = ref<number | null>(null)

// ── AI Copilot state ───────────────────────────────────────────────────────
const authoringTool    = ref('Storyline')
const cefrLevel        = ref('B1')
const copilotField     = ref<CopilotField | null>(null)
const copilotPending   = ref(false)
const copilotSuggestion = ref('')
const copilotError     = ref('')
const copilotEditMode  = ref(false)
const copilotEditText  = ref('')

const AUTHORING_TOOLS = ['Storyline', 'Rise', 'Captivate', 'Vyond', 'HeyGen', 'Synthesia', 'Other'] as const
const CEFR_LEVELS     = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Plain'] as const

const FIELD_ACTIONS: Record<CopilotField, string> = {
  visualDescription: 'rewrite_visual',
  narration:         'rewrite_narration',
  interactions:      'suggest_interaction',
  navigation:        'suggest_navigation',
}

const FIELD_LABELS: Record<CopilotField, string> = {
  visualDescription: 'visual description',
  narration:         'narration',
  interactions:      'interaction',
  navigation:        'navigation',
}

// ── Readability (Flesch-Kincaid grade level, client-side) ─────────────────
function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 0
  if (w.length <= 3) return 1
  // Strip silent trailing letters (e.g. silent 'e', '-es', '-ed'),
  // handle leading 'y', then count vowel clusters as syllable nuclei.
  const m = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '')
    .match(/[aeiouy]{1,2}/g)
  return m?.length || 1
}

// Grade labels indexed by FK grade (0 = unused, 1 = Kindergarten…)
const GRADE_LABELS: Record<number, string> = {
  1: 'K', 2: '1', 3: '2', 4: '3', 5: '4', 6: '5', 7: '6',
  8: '7', 9: '8', 10: '9', 11: '10', 12: '11', 13: '12',
  14: 'College', 15: 'College+', 16: 'Grad', 17: 'Grad+', 18: 'Grad++',
}

function readabilityGrade(text: string): { grade: number; label: string } | null {
  if (!text || text.trim().length < 30) return null
  const sents = (text.match(/[.!?]+/g) || []).length || 1
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return null
  const sylls = words.reduce((s, w) => s + syllables(w), 0)
  const grade = Math.max(1, Math.min(18, Math.round(0.39 * (words.length / sents) + 11.8 * (sylls / words.length) - 15.59)))
  return { grade, label: GRADE_LABELS[grade] ?? `${grade}` }
}

// ── Computed ───────────────────────────────────────────────────────────────
const totalDuration  = computed(() => Math.max(1, Math.round(screens.value.reduce((s, sc) => s + (sc.duration || 0), 0) / 60)))
const canGenerate    = computed(() => rawSource.value.trim().length >= 20 && !pending.value)
const narrationGrade = computed(() => selectedScreen.value ? readabilityGrade(selectedScreen.value.narration) : null)
const visualGrade    = computed(() => selectedScreen.value ? readabilityGrade(selectedScreen.value.visualDescription) : null)

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(() => {
  if (!screens.value.length) {
    screens.value = [createScene('Welcome & Objectives', 'Opening hero screen with course title, welcoming image, and three learning objectives.', 'Welcome learners and orient them to why this topic matters.', 'Select Start to begin.', 'Start button advances to Scene 2.', 45, 'Approved')]
    selectedScreen.value = screens.value[0]
  }
})

// ── Scene helpers ──────────────────────────────────────────────────────────
function createScene(title = 'New Scene', visualDescription = '', narration = '', interactions = '', navigation = 'Standard Next', duration = 60, status = 'Draft'): Scene {
  return { id: `s${Date.now()}-${Math.random().toString(16).slice(2)}`, title, visualDescription, narration, interactions, navigation, duration, status }
}
function selectScreen(screen: Scene) {
  selectedScreen.value = screen
  dismissSuggestion()
}
function addScreen() { const scene = createScene(); screens.value.push(scene); selectScreen(scene) }
function deleteScreen() {
  if (!selectedScreen.value) return
  const index = screens.value.findIndex(s => s.id === selectedScreen.value?.id)
  screens.value = screens.value.filter(s => s.id !== selectedScreen.value?.id)
  selectedScreen.value = screens.value[Math.max(0, index - 1)] ?? null
}
function dragStart(index: number) { draggedIndex.value = index }
function drop(dropIndex: number) {
  if (draggedIndex.value === null) return
  const [dragged] = screens.value.splice(draggedIndex.value, 1)
  screens.value.splice(dropIndex, 0, dragged)
  draggedIndex.value = null
}

// ── Generate storyboard ────────────────────────────────────────────────────
async function generateWithGroq() {
  if (!canGenerate.value) return
  pending.value = true
  error.value   = ''
  try {
    const data = await $fetch<{ title: string; summary: string; learningObjectives: string[]; scenes: Scene[] }>('/api/storyforge', {
      method: 'POST',
      body: { raw: rawSource.value, audience: audience.value, modality: modality.value, tone: tone.value, screenCount: screenCount.value, authoringTool: authoringTool.value }
    })
    projectTitle.value   = data.title || projectTitle.value
    projectSummary.value = data.summary || ''
    objectives.value     = data.learningObjectives || []
    screens.value        = data.scenes || []
    selectedScreen.value = screens.value[0] ?? null
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Something went wrong while building the storyboard.'
  } finally {
    pending.value = false
  }
}

// ── AI Copilot ─────────────────────────────────────────────────────────────
async function triggerCopilot(field: CopilotField) {
  if (!selectedScreen.value) return
  if (copilotField.value === field && !copilotPending.value && copilotSuggestion.value) {
    dismissSuggestion(); return
  }
  copilotField.value      = field
  copilotPending.value    = true
  copilotSuggestion.value = ''
  copilotError.value      = ''
  copilotEditMode.value   = false
  try {
    const useCefr = field === 'narration' || field === 'visualDescription'
    const data = await $fetch<{ suggestion: string }>('/api/storyforge-copilot', {
      method: 'POST',
      body: {
        action:       FIELD_ACTIONS[field],
        text:         selectedScreen.value[field],
        sceneTitle:   selectedScreen.value.title,
        authoringTool: authoringTool.value,
        cefrLevel:    useCefr ? cefrLevel.value : '',
        audience:     audience.value,
      }
    })
    copilotSuggestion.value = data.suggestion
  } catch (e: any) {
    copilotError.value = e?.data?.statusCode === 429
      ? 'Rate limit reached. Please wait a moment and try again.'
      : (e?.data?.message ?? 'Could not reach AI. Try again.')
  } finally {
    copilotPending.value = false
  }
}
function acceptSuggestion() {
  if (!selectedScreen.value || !copilotField.value || !copilotSuggestion.value) return
  selectedScreen.value[copilotField.value] = copilotSuggestion.value
  dismissSuggestion()
}
function startEditSuggestion() { copilotEditText.value = copilotSuggestion.value; copilotEditMode.value = true }
function acceptEditedSuggestion() {
  if (!selectedScreen.value || !copilotField.value) return
  selectedScreen.value[copilotField.value] = copilotEditText.value
  dismissSuggestion()
}
function dismissSuggestion() {
  copilotField.value      = null
  copilotSuggestion.value = ''
  copilotError.value      = ''
  copilotEditMode.value   = false
  copilotEditText.value   = ''
}

// ── File import / export ───────────────────────────────────────────────────
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
      uploadNote.value = 'PDF text was extracted with a lightweight in-browser fallback. Review before generating.'
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
    projectTitle.value   = data.title || 'Imported Project'
    projectSummary.value = data.summary || ''
    objectives.value     = data.learningObjectives || data.objectives || []
    screens.value        = data.screens || data.scenes || []
    selectedScreen.value = screens.value[0] ?? null
  } catch { error.value = 'Could not import that project file.' }
  ;(e.target as HTMLInputElement).value = ''
}
function exportSBF() {
  const project = { version: '2.0', title: projectTitle.value, summary: projectSummary.value, learningObjectives: objectives.value, created: new Date().toISOString(), screens: screens.value }
  saveAs(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), `${safeName(projectTitle.value)}.sbf`)
  showExportMenu.value = false
}
async function exportPPTX() {
  const pptx = new PptxGenJS(); pptx.layout = 'LAYOUT_WIDE'; pptx.title = projectTitle.value
  screens.value.forEach((screen, i) => {
    const slide = pptx.addSlide()
    slide.addText(`Scene ${i + 1}: ${screen.title}`, { x: 0.45, y: 0.3, w: 12.4, fontSize: 24, bold: true })
    slide.addText(`Visual / On-screen text:\n${screen.visualDescription || ''}`, { x: 0.55, y: 1.0, w: 6.0, h: 2.2, fontSize: 12, breakLine: false })
    slide.addText(`Narration:\n${screen.narration || ''}`, { x: 6.85, y: 1.0, w: 5.8, h: 2.2, fontSize: 12 })
    slide.addText(`Interaction: ${screen.interactions || 'None'}\nNavigation: ${screen.navigation || 'Next'}\nDuration: ${screen.duration || 0}s`, { x: 0.55, y: 4.0, w: 12.0, fontSize: 11, color: '666666' })
  })
  await pptx.writeFile({ fileName: `${safeName(projectTitle.value)}.pptx` })
  showExportMenu.value = false
}
function exportPDF() {
  const doc = new jsPDF(); doc.setFontSize(18); doc.text(projectTitle.value, 18, 18)
  let y = 30
  screens.value.forEach((screen, i) => {
    if (y > 250) { doc.addPage(); y = 18 }
    doc.setFontSize(13); doc.text(`Scene ${i + 1}: ${screen.title}`, 18, y)
    doc.setFontSize(9); doc.text(doc.splitTextToSize(`${screen.visualDescription}\nNarration: ${screen.narration}`, 170), 18, y + 7)
    y += 42
  })
  doc.save(`${safeName(projectTitle.value)}.pdf`); showExportMenu.value = false
}
function exportXLSX() { exportSBF() }
function safeName(name: string) { return name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'storyboard' }
function newProject() { projectTitle.value = 'New Instructional Storyboard'; projectSummary.value = ''; objectives.value = []; screens.value = []; selectedScreen.value = null; rawSource.value = ''; addScreen() }
</script>

<template>
  <UiToolShell wide eyebrow="AI Copilot" title="StoryForge ID" deck="Paste notes, briefs, or documents — then use the AI Copilot to draft and refine each scene with one click.">
    <section class="sf-grid">
      <!-- ── Setup / Input panel ── -->
      <div class="glass-panel sf-input" :class="{ 'sf-input--loading': pending }">
        <div v-if="pending" class="sf-loading">
          <div class="sf-spinner" />
          <p class="sf-loading-title">Forging your storyboard...</p>
          <p class="sf-muted">Groq is structuring raw content into scenes, narration, interactions, and navigation.</p>
        </div>
        <form v-else @submit.prevent="generateWithGroq">
          <div class="sf-row">
            <label class="glass-chip sf-file">Upload PDF / text / docs<input type="file" multiple accept=".pdf,.txt,.md,.csv,.json,.doc,.docx,text/*,application/pdf" @change="importSource"></label>
            <label class="glass-chip sf-file">Import .sbf<input type="file" accept=".sbf,.json" @change="importProject"></label>
          </div>
          <p v-if="uploadNote" class="glass-note">{{ uploadNote }}</p>
          <label class="glass-label" for="sf-raw">Raw source material</label>
          <textarea id="sf-raw" v-model="rawSource" class="glass-field sf-raw" placeholder="Paste SME notes, policy text, transcripts, outlines, messy bullets, job aids, or extracted document text here..." />

          <div class="sf-controls">
            <div><label class="glass-label">Audience</label><input v-model="audience" class="glass-field" placeholder="e.g. new team leads"></div>
            <div><label class="glass-label">Format</label><select v-model="modality" class="glass-field glass-select"><option>eLearning storyboard</option><option>Facilitator-led workshop</option><option>Microlearning sequence</option><option>Scenario-based module</option></select></div>
            <div><label class="glass-label">Scenes</label><input v-model.number="screenCount" class="glass-field" min="3" max="20" type="number"></div>
          </div>

          <div>
            <label class="glass-label">Authoring tool</label>
            <div class="sf-chip-row">
              <button v-for="t in AUTHORING_TOOLS" :key="t" type="button" class="glass-chip sf-tool-chip" :class="{ 'sf-chip--active': authoringTool === t }" @click="authoringTool = t">{{ t }}</button>
            </div>
          </div>

          <label class="glass-label">Tone / design direction</label>
          <input v-model="tone" class="glass-field" placeholder="clear, practical, learner-centered">
          <button class="glass-btn sf-generate" :disabled="!canGenerate">Generate scenes with Groq</button>
        </form>
      </div>

      <!-- ── Meta panel ── -->
      <aside class="glass-panel sf-meta">
        <input v-model="projectTitle" class="sf-title" placeholder="Untitled Storyboard">
        <p class="sf-muted">{{ screens.length }} scenes • Est. {{ totalDuration }} min</p>
        <p v-if="projectSummary" class="sf-summary">{{ projectSummary }}</p>
        <div v-if="objectives.length"><span class="glass-label">Objectives</span><ul><li v-for="objective in objectives" :key="objective">{{ objective }}</li></ul></div>
        <div class="sf-actions">
          <button class="glass-btn glass-btn--ghost" @click="addScreen">+ Add scene</button>
          <button class="glass-btn glass-btn--ghost" @click="newProject">New</button>
          <div class="sf-export">
            <button class="glass-btn" @click="showExportMenu = !showExportMenu">Export ↓</button>
            <div v-if="showExportMenu" class="glass-panel sf-menu">
              <button @click="exportSBF">Project .sbf</button>
              <button @click="exportPPTX">Editable PPTX</button>
              <button @click="exportPDF">PDF</button>
              <button @click="exportXLSX">JSON template</button>
            </div>
          </div>
        </div>
      </aside>
    </section>

    <p v-if="error" class="glass-note glass-note--error sf-error">{{ error }}</p>

    <section class="sf-workspace">
      <!-- ── Scene board ── -->
      <div class="sf-board">
        <article v-for="(screen, index) in screens" :key="screen.id" draggable="true" class="glass-panel sf-card" :class="{ 'sf-card--active': selectedScreen?.id === screen.id }" @dragstart="dragStart(index)" @dragover.prevent @drop="drop(index)" @click="selectScreen(screen)">
          <div class="sf-card-top"><span>Scene {{ String(index + 1).padStart(2, '0') }}</span><span>{{ screen.duration }}s</span></div>
          <h2>{{ screen.title || 'Untitled Scene' }}</h2>
          <p>{{ screen.visualDescription || 'No visual direction yet.' }}</p>
          <span class="glass-chip">{{ screen.status || 'Draft' }}</span>
        </article>
      </div>

      <!-- ── Scene editor ── -->
      <aside v-if="selectedScreen" class="glass-panel sf-editor">
        <div class="sf-editor-head"><strong>Edit scene</strong><button class="glass-chip sf-delete" @click="deleteScreen">Delete</button></div>

        <label class="glass-label">Scene title</label>
        <input v-model="selectedScreen.title" class="glass-field">

        <!-- Visual description -->
        <div>
          <div class="sf-field-head">
            <label class="glass-label">Visual description & on-screen text</label>
            <div class="sf-field-actions">
              <span v-if="visualGrade" class="sf-grade" :title="`Flesch-Kincaid Grade ${visualGrade.grade}`">Grade {{ visualGrade.label }}</span>
              <button type="button" class="glass-chip sf-ai-chip" :class="{ 'sf-ai-chip--active': copilotField === 'visualDescription' }" :disabled="copilotPending" @click="triggerCopilot('visualDescription')">{{ copilotField === 'visualDescription' && copilotPending ? '...' : '✦ AI' }}</button>
            </div>
          </div>
          <textarea v-model="selectedScreen.visualDescription" class="glass-field" rows="5" />
          <Transition name="sf-suggest">
            <div v-if="copilotField === 'visualDescription'" class="sf-suggestion">
              <div v-if="copilotPending" class="sf-suggest-loading"><div class="sf-mini-spinner" /><span>Generating suggestion...</span></div>
              <div v-else-if="copilotError" class="sf-suggest-error">{{ copilotError }}</div>
              <template v-else-if="copilotSuggestion">
                <p class="sf-suggest-label">✦ Suggestion</p>
                <div v-if="!copilotEditMode" class="sf-suggest-text">{{ copilotSuggestion }}</div>
                <textarea v-else v-model="copilotEditText" class="glass-field sf-suggest-textarea" rows="4" />
                <div class="sf-suggest-actions">
                  <button class="glass-btn glass-btn--ghost sf-suggest-btn" @click="dismissSuggestion">Dismiss</button>
                  <button v-if="!copilotEditMode" class="glass-btn glass-btn--ghost sf-suggest-btn" @click="startEditSuggestion">Edit</button>
                  <button v-if="!copilotEditMode" class="glass-btn sf-suggest-btn" @click="acceptSuggestion">Accept ✓</button>
                  <button v-if="copilotEditMode" class="glass-btn glass-btn--ghost sf-suggest-btn" @click="copilotEditMode = false">Cancel</button>
                  <button v-if="copilotEditMode" class="glass-btn sf-suggest-btn" @click="acceptEditedSuggestion">Use this</button>
                </div>
              </template>
            </div>
          </Transition>
        </div>

        <!-- Narration -->
        <div>
          <div class="sf-field-head">
            <label class="glass-label">Narration / audio script</label>
            <div class="sf-field-actions">
              <span v-if="narrationGrade" class="sf-grade" :title="`Flesch-Kincaid Grade ${narrationGrade.grade}`">Grade {{ narrationGrade.label }}</span>
              <button type="button" class="glass-chip sf-ai-chip" :class="{ 'sf-ai-chip--active': copilotField === 'narration' }" :disabled="copilotPending" @click="triggerCopilot('narration')">{{ copilotField === 'narration' && copilotPending ? '...' : '✦ AI' }}</button>
            </div>
          </div>
          <textarea v-model="selectedScreen.narration" class="glass-field" rows="4" />
          <Transition name="sf-suggest">
            <div v-if="copilotField === 'narration'" class="sf-suggestion">
              <div v-if="copilotPending" class="sf-suggest-loading"><div class="sf-mini-spinner" /><span>Generating suggestion...</span></div>
              <div v-else-if="copilotError" class="sf-suggest-error">{{ copilotError }}</div>
              <template v-else-if="copilotSuggestion">
                <p class="sf-suggest-label">✦ Suggestion</p>
                <div v-if="!copilotEditMode" class="sf-suggest-text">{{ copilotSuggestion }}</div>
                <textarea v-else v-model="copilotEditText" class="glass-field sf-suggest-textarea" rows="4" />
                <div class="sf-suggest-actions">
                  <button class="glass-btn glass-btn--ghost sf-suggest-btn" @click="dismissSuggestion">Dismiss</button>
                  <button v-if="!copilotEditMode" class="glass-btn glass-btn--ghost sf-suggest-btn" @click="startEditSuggestion">Edit</button>
                  <button v-if="!copilotEditMode" class="glass-btn sf-suggest-btn" @click="acceptSuggestion">Accept ✓</button>
                  <button v-if="copilotEditMode" class="glass-btn glass-btn--ghost sf-suggest-btn" @click="copilotEditMode = false">Cancel</button>
                  <button v-if="copilotEditMode" class="glass-btn sf-suggest-btn" @click="acceptEditedSuggestion">Use this</button>
                </div>
              </template>
            </div>
          </Transition>
        </div>

        <!-- Interactions -->
        <div>
          <div class="sf-field-head">
            <label class="glass-label">Learner interactions & feedback</label>
            <button type="button" class="glass-chip sf-ai-chip" :class="{ 'sf-ai-chip--active': copilotField === 'interactions' }" :disabled="copilotPending" @click="triggerCopilot('interactions')">{{ copilotField === 'interactions' && copilotPending ? '...' : '✦ AI' }}</button>
          </div>
          <textarea v-model="selectedScreen.interactions" class="glass-field" rows="3" />
          <Transition name="sf-suggest">
            <div v-if="copilotField === 'interactions'" class="sf-suggestion">
              <div v-if="copilotPending" class="sf-suggest-loading"><div class="sf-mini-spinner" /><span>Generating suggestion for {{ authoringTool }}...</span></div>
              <div v-else-if="copilotError" class="sf-suggest-error">{{ copilotError }}</div>
              <template v-else-if="copilotSuggestion">
                <p class="sf-suggest-label">✦ Suggestion for {{ authoringTool }}</p>
                <div v-if="!copilotEditMode" class="sf-suggest-text">{{ copilotSuggestion }}</div>
                <textarea v-else v-model="copilotEditText" class="glass-field sf-suggest-textarea" rows="3" />
                <div class="sf-suggest-actions">
                  <button class="glass-btn glass-btn--ghost sf-suggest-btn" @click="dismissSuggestion">Dismiss</button>
                  <button v-if="!copilotEditMode" class="glass-btn glass-btn--ghost sf-suggest-btn" @click="startEditSuggestion">Edit</button>
                  <button v-if="!copilotEditMode" class="glass-btn sf-suggest-btn" @click="acceptSuggestion">Accept ✓</button>
                  <button v-if="copilotEditMode" class="glass-btn glass-btn--ghost sf-suggest-btn" @click="copilotEditMode = false">Cancel</button>
                  <button v-if="copilotEditMode" class="glass-btn sf-suggest-btn" @click="acceptEditedSuggestion">Use this</button>
                </div>
              </template>
            </div>
          </Transition>
        </div>

        <!-- Navigation -->
        <div>
          <div class="sf-field-head">
            <label class="glass-label">Navigation & branching</label>
            <button type="button" class="glass-chip sf-ai-chip" :class="{ 'sf-ai-chip--active': copilotField === 'navigation' }" :disabled="copilotPending" @click="triggerCopilot('navigation')">{{ copilotField === 'navigation' && copilotPending ? '...' : '✦ AI' }}</button>
          </div>
          <textarea v-model="selectedScreen.navigation" class="glass-field" rows="2" />
          <Transition name="sf-suggest">
            <div v-if="copilotField === 'navigation'" class="sf-suggestion">
              <div v-if="copilotPending" class="sf-suggest-loading"><div class="sf-mini-spinner" /><span>Generating suggestion...</span></div>
              <div v-else-if="copilotError" class="sf-suggest-error">{{ copilotError }}</div>
              <template v-else-if="copilotSuggestion">
                <p class="sf-suggest-label">✦ Suggestion</p>
                <div v-if="!copilotEditMode" class="sf-suggest-text">{{ copilotSuggestion }}</div>
                <textarea v-else v-model="copilotEditText" class="glass-field sf-suggest-textarea" rows="3" />
                <div class="sf-suggest-actions">
                  <button class="glass-btn glass-btn--ghost sf-suggest-btn" @click="dismissSuggestion">Dismiss</button>
                  <button v-if="!copilotEditMode" class="glass-btn glass-btn--ghost sf-suggest-btn" @click="startEditSuggestion">Edit</button>
                  <button v-if="!copilotEditMode" class="glass-btn sf-suggest-btn" @click="acceptSuggestion">Accept ✓</button>
                  <button v-if="copilotEditMode" class="glass-btn glass-btn--ghost sf-suggest-btn" @click="copilotEditMode = false">Cancel</button>
                  <button v-if="copilotEditMode" class="glass-btn sf-suggest-btn" @click="acceptEditedSuggestion">Use this</button>
                </div>
              </template>
            </div>
          </Transition>
        </div>

        <div class="sf-controls">
          <div><label class="glass-label">Duration (s)</label><input v-model.number="selectedScreen.duration" type="number" class="glass-field"></div>
          <div><label class="glass-label">Status</label><select v-model="selectedScreen.status" class="glass-field glass-select"><option>Draft</option><option>SME Review</option><option>Approved</option><option>Final</option></select></div>
        </div>

        <!-- AI Copilot context -->
        <div class="sf-copilot-context">
          <label class="glass-label">AI language target</label>
          <div class="sf-chip-row">
            <button v-for="l in CEFR_LEVELS" :key="l" type="button" class="glass-chip sf-cefr-chip" :class="{ 'sf-chip--active': cefrLevel === l }" @click="cefrLevel = l">{{ l }}</button>
          </div>
          <p class="sf-cefr-hint">Applied when rewriting visual or narration fields. Tool: <strong>{{ authoringTool }}</strong></p>
        </div>
      </aside>
    </section>
  </UiToolShell>
</template>

<style scoped>
/* ── Layout ── */
.sf-grid      { display:grid; grid-template-columns:minmax(0,1.4fr) minmax(300rem,.8fr); gap:18rem; margin-bottom:18rem; }
.sf-input, .sf-meta, .sf-editor { display:flex; flex-direction:column; gap:14rem; }
.sf-row, .sf-actions, .sf-card-top, .sf-editor-head { display:flex; align-items:center; justify-content:space-between; gap:10rem; flex-wrap:wrap; }
.sf-file { position:relative; overflow:hidden; }
.sf-file input { position:absolute; inset:0; opacity:0; cursor:pointer; }
.sf-raw { min-height:200rem; resize:vertical; }
.sf-controls { display:grid; grid-template-columns:1fr 1fr; gap:12rem; }
.sf-generate { margin-top:6rem; }
.sf-workspace { display:grid; grid-template-columns:minmax(0,1fr) 380rem; gap:18rem; align-items:start; }
.sf-board { display:flex; gap:14rem; overflow-x:auto; min-height:360rem; padding-bottom:12rem; }
.sf-editor { position:sticky; top:24rem; }
.sf-error { margin:0 0 18rem; }

/* ── Meta panel ── */
.sf-title { width:100%; border:0; background:transparent; color:var(--color-text); font:700 30rem/1.1 var(--main-font); letter-spacing:-.04em; outline:none; }
.sf-muted, .sf-summary, .sf-meta li { color:var(--color-text); opacity:.68; font-size:14rem; line-height:1.5; }
.sf-meta ul { padding-left:18rem; display:grid; gap:6rem; }
.sf-export { position:relative; }
.sf-menu { position:absolute; right:0; top:calc(100% + 8rem); min-width:190rem; padding:8rem; z-index:5; }
.sf-menu button { display:block; width:100%; padding:10rem 12rem; border-radius:10rem; text-align:left; font-size:13rem; }

/* ── Scene card ── */
.sf-card { width:275rem; flex:0 0 auto; padding:20rem; cursor:grab; }
.sf-card--active { border-color:var(--color-glass-border-hover); box-shadow:0 0 0 2rem color-mix(in srgb, var(--color-text) 24%, transparent), 0 34rem 90rem -42rem rgba(0,0,0,.6); }
.sf-card-top { font-size:11rem; text-transform:uppercase; letter-spacing:.08em; opacity:.55; }
.sf-card h2 { margin:14rem 0 10rem; font-size:21rem; line-height:1.1; }
.sf-card p { min-height:82rem; font-size:14rem; line-height:1.45; opacity:.66; display:-webkit-box; -webkit-line-clamp:4; -webkit-box-orient:vertical; overflow:hidden; }

/* ── Editor ── */
.sf-editor-head { margin-bottom:4rem; }
.sf-delete { color:#ff8d8d; }

/* ── Field header row (label + grade + AI chip) ── */
.sf-field-head { display:flex; align-items:center; justify-content:space-between; gap:8rem; padding-bottom:6rem; }
.sf-field-head .glass-label { padding-bottom:0; flex:1; }
.sf-field-actions { display:flex; align-items:center; gap:6rem; flex-shrink:0; }

/* ── Readability grade badge ── */
.sf-grade {
  font-size:10rem;
  font-weight:600;
  letter-spacing:.05em;
  text-transform:uppercase;
  opacity:.5;
  padding:3rem 7rem;
  border-radius:999px;
  border:1px solid var(--color-glass-border);
  white-space:nowrap;
  cursor:default;
}

/* ── AI chip (per-field trigger) ── */
.sf-ai-chip { font-size:11rem; padding:4rem 9rem; letter-spacing:.02em; }
.sf-ai-chip--active {
  background:color-mix(in srgb, rgb(var(--accent-fog,150,140,255)) 28%, transparent);
  border-color:var(--color-glass-border-hover);
}

/* ── Authoring tool / CEFR chips ── */
.sf-chip-row { display:flex; flex-wrap:wrap; gap:6rem; }
.sf-tool-chip, .sf-cefr-chip { font-size:12rem; padding:5rem 11rem; }
.sf-chip--active {
  background:color-mix(in srgb, rgb(var(--accent-fog,150,140,255)) 28%, transparent);
  border-color:var(--color-glass-border-hover);
}

/* ── Copilot context footer ── */
.sf-copilot-context { display:flex; flex-direction:column; gap:8rem; padding-top:4rem; border-top:1px solid var(--color-divider); }
.sf-cefr-hint { font-size:11rem; opacity:.45; line-height:1.4; margin-top:2rem; }
.sf-cefr-hint strong { opacity:.75; font-weight:600; }

/* ── Inline suggestion panel ── */
.sf-suggestion {
  margin-top:8rem;
  padding:14rem 16rem;
  border-radius:14rem;
  background:color-mix(in srgb, rgb(var(--accent-fog,150,140,255)) 8%, color-mix(in srgb, var(--color-bg) 70%, transparent));
  border:1px solid color-mix(in srgb, rgb(var(--accent-fog,150,140,255)) 30%, var(--color-glass-border));
  display:flex;
  flex-direction:column;
  gap:10rem;
}
.sf-suggest-label { font-size:10rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; opacity:.55; }
.sf-suggest-text { font-size:14rem; line-height:1.55; white-space:pre-wrap; }
.sf-suggest-loading { display:flex; align-items:center; gap:8rem; font-size:13rem; opacity:.7; }
.sf-suggest-error { font-size:13rem; color:#ff8d8d; }
.sf-suggest-textarea { resize:vertical; font-size:13rem; }
.sf-suggest-actions { display:flex; gap:6rem; flex-wrap:wrap; margin-top:4rem; }
.sf-suggest-btn { font-size:12rem; padding:8rem 14rem; }

/* ── Mini spinner ── */
.sf-mini-spinner { width:14rem; height:14rem; border-radius:999px; border:2rem solid var(--color-spinner-track); border-top-color:var(--color-text); animation:spin .7s linear infinite; flex-shrink:0; }

/* ── Full-screen loading ── */
.sf-loading { min-height:400rem; display:grid; place-items:center; text-align:center; align-content:center; gap:14rem; }
.sf-spinner { width:42rem; height:42rem; border-radius:999px; border:3rem solid var(--color-spinner-track); border-top-color:var(--color-text); animation:spin .8s linear infinite; }
.sf-loading-title { font-size:22rem; font-weight:700; }
@keyframes spin { to { transform:rotate(360deg); } }

/* ── Suggestion enter/leave ── */
.sf-suggest-enter-active { transition:opacity .2s ease, transform .2s var(--ease-spring); }
.sf-suggest-leave-active { transition:opacity .15s ease; }
.sf-suggest-enter-from { opacity:0; transform:translateY(-6rem); }
.sf-suggest-leave-to  { opacity:0; }

/* ── Responsive ── */
@media (max-width:900px) {
  .sf-grid, .sf-workspace { grid-template-columns:1fr; }
  .sf-editor { position:static; }
  .sf-controls { grid-template-columns:1fr; }
}
</style>
