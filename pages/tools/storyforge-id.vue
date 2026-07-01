<script setup lang="ts">
import { saveAs } from 'file-saver'
import PptxGenJS from 'pptxgenjs'
import jsPDF from 'jspdf'
import {
  DEVELOPMENT_TOOL_OPTIONS,
  READABILITY_STANDARD_OPTIONS,
  useStoryforgeAiStore,
  type DevelopmentTool,
  type ReadabilityStandard,
  type StoryForgeAiAction,
  type StoryForgeScreen,
  type StoryForgeSuggestion
} from '~/stores/storyforgeAi'
import { useGroqAI } from '~/composables/useGroqAI'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

const aiStore = useStoryforgeAiStore()
const { ask, effectiveTool } = useGroqAI()

const projectTitle = ref('New Instructional Storyboard')
const projectSummary = ref('')
const objectives = ref<string[]>([])
const screens = ref<StoryForgeScreen[]>([])
const selectedScreen = ref<StoryForgeScreen | null>(null)
const showExportMenu = ref(false)
const quickPrompt = ref('')
const rewriteInstruction = ref('Make this clearer, more engaging, and accessible.')
const chatInput = ref('')
const draggedIndex = ref<number | null>(null)
const customProjectTool = ref('')
const projectAudience = ref('')
const projectTone = ref('clear, practical, and learner-centered')
const batchInstruction = ref('Improve narration for clarity and accessibility.')
const selectedStandard = ref<ReadabilityStandard>('cefr-b1')
const standardsScope = ref<'field' | 'screen' | 'project'>('field')
const standardsField = ref<keyof StoryForgeScreen>('narration')

const selectedTool = computed({
  get: () => aiStore.primaryTool,
  set: (tool: DevelopmentTool) => aiStore.setProjectTool(tool, customProjectTool.value)
})
const objectiveText = computed({
  get: () => objectives.value.join('\n'),
  set: (value: string) => { objectives.value = value.split('\n').map(item => item.trim()).filter(Boolean) }
})
const totalDuration = computed(() => Math.max(1, Math.round(screens.value.reduce((sum, screen) => sum + (screen.duration || 0), 0) / 60)))
const projectContext = computed(() => ({
  title: projectTitle.value,
  summary: projectSummary.value,
  objectives: objectives.value,
  primaryTool: aiStore.primaryTool,
  customTool: customProjectTool.value,
  tone: projectTone.value,
  audience: projectAudience.value,
  screenTitles: screens.value.map((screen, index) => `${index + 1}. ${screen.title}`)
}))
const visibleSuggestions = computed(() => aiStore.activeSuggestions.filter(suggestion => !suggestion.screenId || suggestion.screenId === selectedScreen.value?.id || suggestion.target !== 'screen'))
const selectedToolLabel = computed(() => toolLabel(effectiveTool(aiStore.primaryTool, selectedScreen.value), selectedScreen.value?.customTool || customProjectTool.value))
const selectedStandardLabel = computed(() => READABILITY_STANDARD_OPTIONS.find(option => option.value === selectedStandard.value)?.label || 'Selected standard')

onMounted(() => {
  if (!screens.value.length) {
    const first = createScreen({
      title: 'Opening hook',
      visualDescription: 'A title screen with a provocative question and a clear Start button.',
      narration: 'Introduce the learner to the problem they will solve in this experience.',
      interactions: 'Learner selects Start.',
      navigation: 'Start button advances to the first content screen.',
      duration: 30
    })
    screens.value = [first]
    selectedScreen.value = first
  }
})

watch(selectedScreen, (screen) => {
  if (screen) void requestAi('proactive', { silent: true })
})

watch(customProjectTool, (toolName) => {
  if (aiStore.primaryTool === 'other') aiStore.setProjectTool('other', toolName)
})

function createScreen(partial: Partial<StoryForgeScreen> = {}): StoryForgeScreen {
  return {
    id: partial.id || `s${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: partial.title || 'New screen',
    visualDescription: partial.visualDescription || '',
    narration: partial.narration || '',
    interactions: partial.interactions || '',
    navigation: partial.navigation || 'Next',
    duration: Number(partial.duration || 45),
    status: partial.status || 'Draft',
    developmentTool: partial.developmentTool,
    customTool: partial.customTool,
    readability: partial.readability || {}
  }
}

function addScreen(partial: Partial<StoryForgeScreen> = {}) {
  const screen = createScreen(partial)
  screens.value.push(screen)
  selectedScreen.value = screen
}
function selectScreen(screen: StoryForgeScreen) { selectedScreen.value = screen }
function deleteScreen() {
  if (!selectedScreen.value) return
  const index = screens.value.findIndex(screen => screen.id === selectedScreen.value?.id)
  screens.value = screens.value.filter(screen => screen.id !== selectedScreen.value?.id)
  selectedScreen.value = screens.value[Math.max(0, index - 1)] ?? screens.value[0] ?? null
}
function dragStart(index: number) { draggedIndex.value = index }
function drop(dropIndex: number) {
  if (draggedIndex.value === null) return
  const [dragged] = screens.value.splice(draggedIndex.value, 1)
  screens.value.splice(dropIndex, 0, dragged)
  draggedIndex.value = null
}

async function requestAi(action: StoryForgeAiAction, options: { silent?: boolean; targetField?: keyof StoryForgeScreen | 'all'; prompt?: string; scope?: 'field' | 'screen' | 'project' } = {}) {
  if (!options.silent) aiStore.clearSuggestions(action === 'batch' ? undefined : selectedScreen.value?.id)
  await ask({
    action,
    prompt: options.prompt ?? quickPrompt.value,
    project: projectContext.value,
    screen: selectedScreen.value,
    screens: screens.value,
    targetField: options.targetField || 'all',
    customInstruction: action === 'rewrite' ? rewriteInstruction.value : action === 'batch' ? batchInstruction.value : action === 'standardsRewrite' ? `Rewrite to ${selectedStandardLabel.value}. Preserve meaning and instructional intent.` : '',
    standard: selectedStandard.value,
    standardLabel: selectedStandardLabel.value,
    scope: options.scope || standardsScope.value,
    chatHistory: aiStore.chat
  })
}

async function applyStandards(scope = standardsScope.value, field = standardsField.value) {
  await requestAi('standardsRewrite', { targetField: scope === 'field' ? field : 'all', scope })
}

async function estimateWithAi(field: keyof StoryForgeScreen) {
  await requestAi('readability', { targetField: field, scope: 'field' })
}

async function sendChat() {
  const prompt = chatInput.value.trim()
  if (!prompt) return
  aiStore.addChat('user', prompt)
  chatInput.value = ''
  await requestAi('chat', { prompt })
}

function acceptSuggestion(suggestion: StoryForgeSuggestion) {
  if (suggestion.projectPatch) {
    if (suggestion.projectPatch.summary) projectSummary.value = suggestion.projectPatch.summary
    if (suggestion.projectPatch.objectives) objectives.value = suggestion.projectPatch.objectives
  }
  if (suggestion.patch) {
    const target = screens.value.find(screen => screen.id === suggestion.screenId) || selectedScreen.value
    if (target) Object.assign(target, suggestion.patch)
  }
  if (suggestion.batchPatches?.length) {
    for (const item of suggestion.batchPatches) {
      const target = screens.value.find(screen => screen.id === item.screenId)
      if (target && item.patch) Object.assign(target, item.patch)
    }
  }
  aiStore.dismissSuggestion(suggestion.id)
}

async function importProject(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const data = JSON.parse(await file.text())
    projectTitle.value = data.title || 'Imported Project'
    projectSummary.value = data.summary || ''
    objectives.value = data.learningObjectives || data.objectives || []
    aiStore.setProjectTool(data.primaryTool || data.developmentTool || 'storyline', data.customTool || '')
    customProjectTool.value = data.customTool || ''
    screens.value = (data.screens || data.scenes || []).map((screen: Partial<StoryForgeScreen>) => createScreen(screen))
    selectedScreen.value = screens.value[0] ?? null
  } catch {
    aiStore.setError('Could not import that project file.')
  }
  ;(event.target as HTMLInputElement).value = ''
}

function exportSBF() {
  const project = {
    version: '2.2',
    title: projectTitle.value,
    summary: projectSummary.value,
    objectives: objectives.value,
    primaryTool: aiStore.primaryTool,
    customTool: customProjectTool.value,
    created: new Date().toISOString(),
    screens: screens.value
  }
  saveAs(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), `${safeName(projectTitle.value)}.sbf`)
  showExportMenu.value = false
}
async function exportPPTX() {
  const pptx = new PptxGenJS(); pptx.layout = 'LAYOUT_WIDE'; pptx.title = projectTitle.value
  screens.value.forEach((screen, index) => {
    const slide = pptx.addSlide()
    slide.addText(`Screen ${index + 1}: ${screen.title}`, { x: 0.45, y: 0.3, w: 12.4, fontSize: 24, bold: true })
    slide.addText(`Tool: ${toolLabel(effectiveTool(aiStore.primaryTool, screen), screen.customTool || customProjectTool.value)}`, { x: 0.5, y: 0.75, fontSize: 10, color: '666666' })
    slide.addText(`Visual / On-screen text:\n${screen.visualDescription}`, { x: 0.55, y: 1.05, w: 6.0, h: 2.2, fontSize: 12 })
    slide.addText(`Narration:\n${screen.narration}`, { x: 6.85, y: 1.05, w: 5.8, h: 2.2, fontSize: 12 })
    slide.addText(`Interaction: ${screen.interactions}\nNavigation: ${screen.navigation}\nDuration: ${screen.duration}s`, { x: 0.55, y: 4.0, w: 12, fontSize: 11, color: '666666' })
  })
  await pptx.writeFile({ fileName: `${safeName(projectTitle.value)}.pptx` })
  showExportMenu.value = false
}
function exportPDF() {
  const doc = new jsPDF(); doc.setFontSize(18); doc.text(projectTitle.value, 18, 18)
  doc.setFontSize(10); doc.text(`Primary tool: ${toolLabel(aiStore.primaryTool, customProjectTool.value)}`, 18, 26)
  let y = 38
  screens.value.forEach((screen, index) => {
    if (y > 250) { doc.addPage(); y = 18 }
    doc.setFontSize(13); doc.text(`Screen ${index + 1}: ${screen.title}`, 18, y)
    doc.setFontSize(9); doc.text(doc.splitTextToSize(`${screen.visualDescription}\nNarration: ${screen.narration}\nInteraction: ${screen.interactions}\nNavigation: ${screen.navigation}`, 170), 18, y + 7)
    y += 48
  })
  doc.save(`${safeName(projectTitle.value)}.pdf`)
  showExportMenu.value = false
}
function newProject() {
  projectTitle.value = 'New Instructional Storyboard'
  projectSummary.value = ''
  objectives.value = []
  screens.value = []
  selectedScreen.value = null
  quickPrompt.value = ''
  aiStore.clearSuggestions()
  addScreen()
}
function updateReadability(screen: StoryForgeScreen, field: 'visualDescription' | 'narration' | 'interactions' | 'navigation') {
  const text = String(screen[field] || '')
  screen.readability ||= {}
  screen.readability[field] = estimateReadabilityLocally(text, selectedStandard.value)
}
function estimateReadabilityLocally(text: string, standard?: ReadabilityStandard) {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const sentences = Math.max(1, (text.match(/[.!?]+/g) || []).length)
  const avgWords = words.length / sentences
  const avgChars = words.reduce((sum, word) => sum + word.length, 0) / Math.max(1, words.length)
  const gradeLevel = Math.max(1, Math.round(avgWords * 0.35 + avgChars * 1.2 - 4))
  const estimatedCefr = gradeLevel <= 3 ? 'A1' : gradeLevel <= 5 ? 'A2' : gradeLevel <= 8 ? 'B1' : gradeLevel <= 10 ? 'B2' : gradeLevel <= 13 ? 'C1' : 'C2'
  return { estimatedCefr, gradeLevel, standard, note: `${words.length} words • avg ${Math.round(avgWords)} words/sentence`, updatedAt: new Date().toISOString() }
}
function readabilityMeta(screen: StoryForgeScreen | null, field: 'visualDescription' | 'narration' | 'interactions' | 'navigation') {
  if (!screen) return undefined
  return screen.readability?.[field] || estimateReadabilityLocally(String(screen[field] || ''))
}
function readabilityBadge(screen: StoryForgeScreen | null, field: 'visualDescription' | 'narration' | 'interactions' | 'navigation') {
  const meta = readabilityMeta(screen, field)
  return meta ? `${meta.estimatedCefr || '—'} • G${meta.gradeLevel || '—'}` : '—'
}
function readabilityClass(screen: StoryForgeScreen | null, field: 'visualDescription' | 'narration' | 'interactions' | 'navigation') {
  const level = readabilityMeta(screen, field)?.estimatedCefr
  return level === 'A1' || level === 'A2' ? 'sf-badge--easy' : level === 'B1' || level === 'B2' ? 'sf-badge--mid' : 'sf-badge--advanced'
}
function safeName(name: string) { return name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'storyboard' }
function toolLabel(tool: DevelopmentTool, customTool = '') { return tool === 'other' ? customTool || 'Other custom tool' : DEVELOPMENT_TOOL_OPTIONS.find(option => option.value === tool)?.label || 'Selected tool' }
</script>

<template>
  <UiToolShell wide eyebrow="Web App" title="StoryForge ID" deck="An AI copilot for instructional designers: draft faster, refine screens, and get tool-aware build guidance for Storyline, Rise, Captivate, Vyond, HeyGen, Synthesia, or your custom stack.">
    <section class="sf-grid-top">
      <div class="glass-panel sf-settings">
        <div class="sf-panel-head"><div><span class="glass-label">Project settings</span><h2>Build context</h2></div><label class="glass-chip sf-file">Import .sbf<input type="file" accept=".sbf,.json" @change="importProject"></label></div>
        <label><span class="glass-label">Primary development tool</span><select v-model="selectedTool" class="glass-field glass-select"><option v-for="tool in DEVELOPMENT_TOOL_OPTIONS" :key="tool.value" :value="tool.value">{{ tool.label }}</option></select></label>
        <label v-if="selectedTool === 'other'"><span class="glass-label">Custom tool</span><input v-model="customProjectTool" class="glass-field" placeholder="e.g. Adapt, Lectora, custom LMS component"></label>
        <div class="sf-two"><label><span class="glass-label">Audience</span><input v-model="projectAudience" class="glass-field" placeholder="e.g. first-time managers"></label><label><span class="glass-label">Voice / tone</span><input v-model="projectTone" class="glass-field" placeholder="clear, warm, practical"></label></div>
      </div>

      <div class="glass-panel sf-draft">
        <span class="glass-label">Quick drafting assistant</span>
        <textarea v-model="quickPrompt" class="glass-field sf-prompt" placeholder="Give StoryForge a short prompt, rough SME notes, or a learning objective. Example: Create a scenario screen where a new manager gives feedback after a missed deadline." />
        <div class="sf-actions"><button class="glass-btn" :disabled="!!aiStore.pendingAction" @click="requestAi('quickDraft')">{{ aiStore.pendingAction === 'quickDraft' ? 'Drafting…' : 'Generate screen draft' }}</button><button class="glass-btn glass-btn--ghost" :disabled="!!aiStore.pendingAction" @click="requestAi('toolBuild')">{{ selectedTool === 'rise' ? 'Structure for Rise' : selectedTool === 'vyond' ? 'Create Vyond breakdown' : selectedTool === 'storyline' ? 'Build for Storyline' : 'Tool build helper' }}</button></div>
      </div>
    </section>

    <p v-if="aiStore.error" class="glass-note glass-note--error sf-error">{{ aiStore.error }}</p>

    <section class="sf-workspace">
      <aside class="glass-panel sf-project">
        <input v-model="projectTitle" class="sf-title" placeholder="Untitled Storyboard">
        <p class="sf-muted">{{ screens.length }} screens • Est. {{ totalDuration }} min • {{ toolLabel(selectedTool, customProjectTool) }}</p>
        <textarea v-model="projectSummary" class="glass-field" rows="3" placeholder="Project summary / design intent"></textarea>
        <label><span class="glass-label">Learning objectives</span><textarea v-model="objectiveText" class="glass-field" rows="4" placeholder="One objective per line"></textarea></label>
        <div class="sf-actions"><button class="glass-btn glass-btn--ghost" @click="addScreen()">+ Add screen</button><button class="glass-btn glass-btn--ghost" @click="newProject">New</button><div class="sf-export"><button class="glass-btn" @click="showExportMenu = !showExportMenu">Export ↓</button><div v-if="showExportMenu" class="glass-panel sf-menu"><button @click="exportSBF">Project .sbf</button><button @click="exportPPTX">Editable PPTX</button><button @click="exportPDF">PDF</button></div></div></div>
        <div class="sf-batch"><span class="glass-label">Batch AI operation</span><textarea v-model="batchInstruction" class="glass-field" rows="3" /><button class="glass-btn glass-btn--ghost" :disabled="!!aiStore.pendingAction" @click="requestAi('batch')">Improve all selected screens</button><button class="glass-btn glass-btn--ghost" :disabled="!!aiStore.pendingAction" @click="applyStandards('project')">Apply {{ selectedStandardLabel }} to all screens</button></div>
      </aside>

      <main class="sf-board-wrap">
        <div class="sf-board">
          <article v-for="(screen, index) in screens" :key="screen.id" draggable="true" class="glass-panel sf-card" :class="{ 'sf-card--active': selectedScreen?.id === screen.id }" @dragstart="dragStart(index)" @dragover.prevent @drop="drop(index)" @click="selectScreen(screen)">
            <div class="sf-card-top"><span>Screen {{ String(index + 1).padStart(2, '0') }}</span><span>{{ screen.duration }}s</span></div>
            <h2>{{ screen.title || 'Untitled screen' }}</h2>
            <p>{{ screen.visualDescription || screen.narration || 'Select this card and ask the copilot for a draft.' }}</p>
            <span class="glass-chip">{{ toolLabel(effectiveTool(selectedTool, screen), screen.customTool || customProjectTool) }}</span>
          </article>
        </div>
      </main>

      <aside v-if="selectedScreen" class="glass-panel sf-editor">
        <div class="sf-panel-head"><div><span class="glass-label">Screen editor</span><h2>{{ selectedToolLabel }}</h2></div><button class="glass-chip sf-delete" @click="deleteScreen">Delete</button></div>
        <div class="sf-two"><label><span class="glass-label">Tool override</span><select v-model="selectedScreen.developmentTool" class="glass-field glass-select"><option :value="undefined">Use project tool</option><option v-for="tool in DEVELOPMENT_TOOL_OPTIONS" :key="tool.value" :value="tool.value">{{ tool.label }}</option></select></label><label v-if="selectedScreen.developmentTool === 'other'"><span class="glass-label">Custom</span><input v-model="selectedScreen.customTool" class="glass-field"></label></div>
        <div class="sf-standards">
          <div class="sf-panel-head"><div><span class="glass-label">Standards & readability</span><h2>{{ selectedStandardLabel }}</h2></div><button class="glass-chip" :disabled="!!aiStore.pendingAction" @click="estimateWithAi(standardsField)">Suggest level</button></div>
          <div class="sf-two"><label><span class="glass-label">Standard / level</span><select v-model="selectedStandard" class="glass-field glass-select"><option v-for="standard in READABILITY_STANDARD_OPTIONS" :key="standard.value" :value="standard.value">{{ standard.label }}</option></select></label><label><span class="glass-label">Apply to</span><select v-model="standardsField" class="glass-field glass-select"><option value="visualDescription">On-screen text / visual</option><option value="narration">Narration</option><option value="interactions">Interactions</option><option value="navigation">Navigation</option></select></label></div>
          <div class="sf-ai-row"><button class="glass-chip" :disabled="!!aiStore.pendingAction" @click="applyStandards('field')">Format field</button><button class="glass-chip" :disabled="!!aiStore.pendingAction" @click="applyStandards('screen')">Format screen</button><button class="glass-chip" :disabled="!!aiStore.pendingAction" @click="applyStandards('project')">Format all screens</button></div>
        </div>
        <div class="sf-ai-row"><button class="glass-chip" :disabled="!!aiStore.pendingAction" @click="requestAi('proactive')">Refresh suggestions</button><button class="glass-chip" :disabled="!!aiStore.pendingAction" @click="requestAi('rewrite')">Rewrite</button><button class="glass-chip" :disabled="!!aiStore.pendingAction" @click="requestAi('toolBuild')">Tool build notes</button></div>
        <label><span class="glass-label">Rewrite instruction</span><input v-model="rewriteInstruction" class="glass-field"></label>
        <label><span class="glass-label">Screen title</span><input v-model="selectedScreen.title" class="glass-field"></label>
        <label><span class="glass-label sf-label-row">Visual description & on-screen text <button class="sf-badge" :class="readabilityClass(selectedScreen, 'visualDescription')" type="button" @click="standardsField = 'visualDescription'; applyStandards('field', 'visualDescription')">{{ readabilityBadge(selectedScreen, 'visualDescription') }}</button></span><textarea v-model="selectedScreen.visualDescription" class="glass-field" rows="5" @blur="updateReadability(selectedScreen, 'visualDescription')" /></label>
        <label><span class="glass-label sf-label-row">Narration / audio script <button class="sf-badge" :class="readabilityClass(selectedScreen, 'narration')" type="button" @click="standardsField = 'narration'; applyStandards('field', 'narration')">{{ readabilityBadge(selectedScreen, 'narration') }}</button></span><textarea v-model="selectedScreen.narration" class="glass-field" rows="4" @blur="updateReadability(selectedScreen, 'narration')" /></label>
        <label><span class="glass-label sf-label-row">Learner interactions & feedback <button class="sf-badge" :class="readabilityClass(selectedScreen, 'interactions')" type="button" @click="standardsField = 'interactions'; applyStandards('field', 'interactions')">{{ readabilityBadge(selectedScreen, 'interactions') }}</button></span><textarea v-model="selectedScreen.interactions" class="glass-field" rows="3" @blur="updateReadability(selectedScreen, 'interactions')" /></label>
        <label><span class="glass-label sf-label-row">Navigation & branching <button class="sf-badge" :class="readabilityClass(selectedScreen, 'navigation')" type="button" @click="standardsField = 'navigation'; applyStandards('field', 'navigation')">{{ readabilityBadge(selectedScreen, 'navigation') }}</button></span><textarea v-model="selectedScreen.navigation" class="glass-field" rows="2" @blur="updateReadability(selectedScreen, 'navigation')" /></label>
        <div class="sf-two"><label><span class="glass-label">Duration</span><input v-model.number="selectedScreen.duration" type="number" class="glass-field"></label><label><span class="glass-label">Status</span><select v-model="selectedScreen.status" class="glass-field glass-select"><option>Draft</option><option>SME Review</option><option>Approved</option><option>Final</option></select></label></div>
      </aside>
    </section>

    <section class="sf-copilot-grid">
      <aside class="glass-panel sf-suggestions">
        <div class="sf-panel-head"><div><span class="glass-label">Proactive AI suggestions</span><h2>{{ selectedToolLabel }}</h2></div></div>
        <div v-if="!visibleSuggestions.length" class="sf-empty">Select a screen or ask for a draft to see tool-aware suggestions.</div>
        <article v-for="suggestion in visibleSuggestions" :key="suggestion.id" class="sf-suggestion">
          <h3>{{ suggestion.label }}</h3>
          <p>{{ suggestion.rationale }}</p>
          <pre v-if="suggestion.toolBuild">{{ suggestion.toolBuild }}</pre>
          <div v-if="suggestion.comparison" class="sf-compare"><div><span class="glass-label">Original</span><p>{{ suggestion.comparison.original }}</p></div><div><span class="glass-label">{{ suggestion.comparison.standardLabel || 'Rewritten' }}</span><p>{{ suggestion.comparison.rewritten }}</p></div></div>
          <div class="sf-actions"><button v-if="suggestion.patch || suggestion.projectPatch || suggestion.batchPatches?.length" class="glass-btn" @click="acceptSuggestion(suggestion)">Accept</button><button class="glass-btn glass-btn--ghost" @click="aiStore.dismissSuggestion(suggestion.id)">Dismiss</button></div>
        </article>
      </aside>

      <aside class="glass-panel sf-chat">
        <span class="glass-label">Copilot chat</span>
        <div class="sf-chat-log">
          <p v-if="!aiStore.chat.length" class="sf-empty">Ask: “How would I build this in Storyline?” or “Suggest a Rise branching structure.”</p>
          <div v-for="message in aiStore.chat" :key="message.id" class="sf-message" :class="`sf-message--${message.role}`">{{ message.content }}</div>
        </div>
        <form class="sf-chat-form" @submit.prevent="sendChat"><input v-model="chatInput" class="glass-field" placeholder="Ask about the current screen, project, or selected tool..."><button class="glass-btn" :disabled="!!aiStore.pendingAction || !chatInput.trim()">Send</button></form>
      </aside>
    </section>
  </UiToolShell>
</template>

<style scoped>
.sf-grid-top, .sf-workspace, .sf-copilot-grid { display:grid; gap:18rem; }
.sf-grid-top { grid-template-columns:minmax(0, .9fr) minmax(0, 1.1fr); }
.sf-workspace { grid-template-columns:300rem minmax(0, 1fr) 390rem; align-items:start; margin-top:18rem; }
.sf-copilot-grid { grid-template-columns:minmax(0, 1fr) minmax(320rem, .8fr); margin-top:18rem; }
.sf-settings, .sf-draft, .sf-project, .sf-editor, .sf-suggestions, .sf-chat { display:flex; flex-direction:column; gap:14rem; }
.sf-panel-head, .sf-actions, .sf-card-top, .sf-ai-row { display:flex; align-items:center; justify-content:space-between; gap:10rem; flex-wrap:wrap; }
.sf-panel-head h2 { font-size:22rem; line-height:1.1; letter-spacing:-.04em; }
.sf-two { display:grid; grid-template-columns:1fr 1fr; gap:12rem; }
.sf-prompt { min-height:174rem; resize:vertical; }
.sf-file { position:relative; overflow:hidden; }
.sf-file input { position:absolute; inset:0; opacity:0; cursor:pointer; }
.sf-error { margin-top:18rem; }
.sf-project, .sf-editor { position:sticky; top:24rem; }
.sf-title { width:100%; border:0; background:transparent; color:var(--color-text); font:700 30rem/1.1 var(--main-font); letter-spacing:-.04em; outline:none; }
.sf-muted, .sf-empty { color:var(--color-text); opacity:.62; font-size:14rem; line-height:1.5; }
.sf-export { position:relative; }
.sf-menu { position:absolute; right:0; top:calc(100% + 8rem); min-width:180rem; padding:8rem; z-index:5; }
.sf-menu button { display:block; width:100%; padding:10rem 12rem; border-radius:10rem; text-align:left; font-size:13rem; }
.sf-batch, .sf-standards { display:grid; gap:10rem; padding-top:8rem; border-top:1px solid var(--color-divider); }
.sf-label-row { display:flex; align-items:center; justify-content:space-between; gap:10rem; }
.sf-badge { border:1px solid var(--color-glass-border); border-radius:999rem; padding:4rem 8rem; color:var(--color-text); background:color-mix(in srgb, var(--color-bg) 54%, transparent); font-size:11rem; letter-spacing:0; text-transform:none; }
.sf-badge--easy { border-color:color-mix(in srgb, #4ade80 52%, var(--color-glass-border)); }
.sf-badge--mid { border-color:color-mix(in srgb, #facc15 52%, var(--color-glass-border)); }
.sf-badge--advanced { border-color:color-mix(in srgb, #fb7185 52%, var(--color-glass-border)); }
.sf-board { display:flex; gap:14rem; overflow-x:auto; min-height:520rem; padding-bottom:12rem; }
.sf-card { width:280rem; flex:0 0 auto; padding:20rem; cursor:grab; }
.sf-card--active { border-color:var(--color-glass-border-hover); box-shadow:0 0 0 2rem color-mix(in srgb, var(--color-text) 24%, transparent), 0 34rem 90rem -42rem rgba(0,0,0,.6); }
.sf-card-top { font-size:11rem; text-transform:uppercase; letter-spacing:.08em; opacity:.55; }
.sf-card h2 { margin:14rem 0 10rem; font-size:21rem; line-height:1.1; }
.sf-card p { min-height:130rem; font-size:14rem; line-height:1.45; opacity:.66; display:-webkit-box; -webkit-line-clamp:6; -webkit-box-orient:vertical; overflow:hidden; }
.sf-delete { color:#ff8d8d; }
.sf-suggestion { border:1px solid var(--color-glass-border); border-radius:16rem; padding:14rem; background:color-mix(in srgb, var(--color-bg) 42%, transparent); display:grid; gap:10rem; }
.sf-suggestion h3 { font-size:17rem; line-height:1.2; }
.sf-compare { display:grid; grid-template-columns:1fr 1fr; gap:10rem; }
.sf-compare div { border:1px solid var(--color-glass-border); border-radius:12rem; padding:10rem; background:color-mix(in srgb, var(--color-bg) 48%, transparent); }
.sf-suggestion p, .sf-suggestion pre { color:var(--color-text); opacity:.72; font:inherit; font-size:14rem; line-height:1.5; white-space:pre-wrap; }
.sf-chat-log { min-height:260rem; max-height:420rem; overflow:auto; display:flex; flex-direction:column; gap:10rem; }
.sf-message { border-radius:14rem; padding:12rem 14rem; font-size:14rem; line-height:1.5; background:color-mix(in srgb, var(--color-bg) 50%, transparent); border:1px solid var(--color-glass-border); }
.sf-message--user { align-self:flex-end; max-width:86%; background:var(--color-text); color:var(--color-bg); }
.sf-message--assistant { align-self:flex-start; max-width:92%; }
.sf-chat-form { display:grid; grid-template-columns:1fr auto; gap:10rem; }
@media (max-width: 1200px) { .sf-workspace, .sf-grid-top, .sf-copilot-grid { grid-template-columns:1fr; } .sf-project, .sf-editor { position:static; } }
@media (max-width: 700px) { .sf-two, .sf-chat-form, .sf-compare { grid-template-columns:1fr; } }
</style>
