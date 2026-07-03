<script setup lang="ts">
import { saveAs } from 'file-saver'
import type { CardKind, Connection, StoryCard, StoryGenProject } from '~/types/story'
import { createCard, CARD_KINDS } from '~/utils/storyCards'
import type { ModelId } from '~/utils/idModels'
import { ID_MODELS, modelOf } from '~/utils/idModels'
import { cardNumbers, lastInSequence, sanitizeConnections } from '~/utils/storyGraph'
import { laneLayout, nextAutoPosition, tidyPositions } from '~/utils/storyLayout'
import { exportStoryDocx } from '~/utils/storyExportDocx'
import { exportStoryXlsx } from '~/utils/storyExportXlsx'
import { exportDiagramPng, renderDiagram } from '~/utils/storyExportDiagram'
import {
  listProjects, migrateLegacyProject, newProjectId, readProject,
  removeProject, writeProject, writeThumb, type ProjectMeta
} from '~/composables/useStoryProjects'
import { aiRewriteField, aiSuggestOptions, aiGenerateMcqCards, type GeneratedStoryboard } from '~/utils/aiStoryboard'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

const TOUR_KEY = 'storygen-tour-seen'

// The app has three faces: a brief branded splash, the project shelf
// (home), and the canvas editor.
const view = ref<'splash' | 'home' | 'editor'>('splash')
const projects = ref<ProjectMeta[]>([])
const activeProjectId = ref<string | null>(null)
let pendingPrevProjectId: string | null | undefined

const projectTitle = ref('Untitled Storyboard')
const model = ref<ModelId>('freeform')
const cards = ref<StoryCard[]>([])
const connections = ref<Connection[]>([])
const selectedCardId = ref<string | null>(null)

// Selection and editing are deliberately separate states: on mobile a tap
// only selects (a slim action bar appears); the inspector drawer opens on
// an explicit Edit. On desktop selecting opens the floating inspector,
// which never blocks the canvas.
const inspectorOpen = ref(false)

const showPaletteSheet = ref(false)
const showMenu = ref<'export' | 'mobile' | 'ai' | null>(null)
const modelPicker = ref<'new' | 'switch' | null>(null)
const savedFlash = ref(false)
const tourOpen = ref(false)

// ── Optional AI (bring-your-own Groq key, stored locally) ───────
const { settings: aiSettings, aiReady } = useAiSettings()
const aiSetupOpen = ref(false)
const aiGenerateOpen = ref(false)
const aiBusyField = ref<string | null>(null)
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(message: string) {
  toast.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 3200)
}

function openAiSetup() {
  showMenu.value = null
  aiSetupOpen.value = true
}
function openAiGenerate() {
  showMenu.value = null
  aiGenerateOpen.value = true
}

// A finished AI generation becomes a fresh project on the shelf.
function onAiGenerated(result: GeneratedStoryboard & { modelId: ModelId }) {
  aiGenerateOpen.value = false
  flushSave()
  projectTitle.value = result.title
  model.value = result.modelId
  cards.value = result.cards
  connections.value = result.connections
  selectedCardId.value = null
  activeProjectId.value = newProjectId()
  resetHistory()
  persist()
  view.value = 'editor'
  nextTick(() => canvasRef.value?.fitView())
  showToast(`Storyboard drafted — ${result.cards.length} screens. Every card is yours to edit.`)
}

async function aiRewrite(field: 'body' | 'narration' | 'question' | 'feedback') {
  const card = selectedCard.value
  if (!card || aiBusyField.value) return
  const text = card[field]
  if (!text.trim()) return
  aiBusyField.value = field
  try {
    const labels = { body: 'on-screen text', narration: 'narration script', question: 'question', feedback: 'answer feedback' }
    card[field] = await aiRewriteField(aiSettings.value.key, card, labels[field], text, activeModel.value)
    showToast('Rewritten — undo (⌘Z) brings the old text back.')
  } catch (e: any) {
    showToast(e?.message || 'AI rewrite failed — try again.')
  } finally {
    aiBusyField.value = null
  }
}

async function aiOptions() {
  const card = selectedCard.value
  if (!card || card.kind !== 'mcq' || aiBusyField.value) return
  aiBusyField.value = 'options'
  try {
    const suggestion = await aiSuggestOptions(aiSettings.value.key, card)
    card.options = suggestion.options
    card.correctIndex = suggestion.correctIndex
    if (suggestion.feedback && !card.feedback.trim()) card.feedback = suggestion.feedback
    showToast('Options drafted — mark a different correct answer if needed.')
  } catch (e: any) {
    showToast(e?.message || 'AI suggestion failed — try again.')
  } finally {
    aiBusyField.value = null
  }
}

async function aiAddMcqs() {
  showMenu.value = null
  if (aiBusyField.value) return
  aiBusyField.value = 'mcqs'
  showToast('Analyzing your content for knowledge checks…')
  try {
    const generated = await aiGenerateMcqCards(aiSettings.value.key, cards.value, connections.value, activeModel.value, 3)
    for (const card of generated) {
      const prevLast = lastInSequence(cards.value, connections.value)
      const pos = nextAutoPosition(cards.value, connections.value)
      card.x = pos.x
      card.y = pos.y
      cards.value.push(card)
      if (prevLast) connections.value.push({ id: id('k'), from: prevLast.id, to: card.id })
    }
    nextTick(() => canvasRef.value?.fitView())
    showToast(`Added ${generated.length} knowledge checks from your content.`)
  } catch (e: any) {
    showToast(e?.message || 'Could not generate knowledge checks.')
  } finally {
    aiBusyField.value = null
  }
}

function startTour() {
  showMenu.value = null
  tourOpen.value = true
}
function closeTour() {
  tourOpen.value = false
  showMenu.value = null
  try { localStorage.setItem(TOUR_KEY, '1') } catch {}
}
// The tour stages real UI: on the export step it opens the actual menu so
// the spotlight shows the genuine options, then closes it afterward.
function onTourStep(stepId: string) {
  showMenu.value = stepId === 'export' ? (isDesktop.value ? 'export' : 'mobile') : null
}

const canvasRef = ref<{
  zoomIn: () => void; zoomOut: () => void; fitView: () => void
  centerOn: (id: string) => void; zoomPercent: number; gestureActive: boolean
} | null>(null)

const isDesktop = ref(true)
let mq: MediaQueryList | null = null
const onMq = (e: MediaQueryListEvent | MediaQueryList) => { isDesktop.value = e.matches }
const canvasInsets = computed(() => isDesktop.value
  ? { top: 76, right: 24, bottom: 70, left: 208 }
  : { top: 72, right: 12, bottom: 88, left: 12 })

const activeModel = computed(() => modelOf(model.value))
const numberMap = computed(() => cardNumbers(cards.value, connections.value))
const selectedCard = computed(() => cards.value.find(c => c.id === selectedCardId.value) ?? null)
const selectedCardNumber = computed(() => (selectedCardId.value && numberMap.value.get(selectedCardId.value)) || 0)
const selectedKindColor = computed(() => (selectedCard.value ? CARD_KINDS[selectedCard.value.kind]?.color : undefined))
const totalMinutes = computed(() => Math.max(1, Math.round(cards.value.reduce((s, c) => s + (c.duration || 0), 0) / 60)))

// Where each MCQ answer branch of the selected card currently leads
const branchLabels = computed<(string | null)[]>(() => {
  const card = selectedCard.value
  if (!card || card.kind !== 'mcq') return []
  return [0, 1, 2, 3].map(i => {
    const conn = connections.value.find(c => c.from === card.id && c.fromPort === `opt-${i}`)
    const num = conn ? numberMap.value.get(conn.to) : undefined
    return num ? `→ Screen ${String(num).padStart(2, '0')}` : null
  })
})

// Seconds of storyboard time already committed per framework stage
const stageSeconds = computed<Record<string, number>>(() => {
  const acc: Record<string, number> = {}
  for (const c of cards.value) {
    if (c.stage) acc[c.stage] = (acc[c.stage] || 0) + (c.duration || 0)
  }
  return acc
})

watch(selectedCardId, (id) => {
  if (!id) { inspectorOpen.value = false; return }
  if (isDesktop.value) inspectorOpen.value = true
})

function id(prefix: string) { return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}` }
function safeName(name: string) { return name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'storyboard' }

// ── Card operations ─────────────────────────────────────────────
function addCard(kind: CardKind, stage?: string) {
  const prevLast = lastInSequence(cards.value, connections.value)
  const card = createCard(kind, nextAutoPosition(cards.value, connections.value))
  // Quick-adds from a stage carry it; plain kind-adds continue the stage
  // the flow is currently in.
  card.stage = stage ?? (activeModel.value.stages.length ? (prevLast?.stage ?? '') : '')
  cards.value.push(card)
  if (prevLast) connections.value.push({ id: id('k'), from: prevLast.id, to: card.id })
  selectedCardId.value = card.id
  showPaletteSheet.value = false
  nextTick(() => canvasRef.value?.centerOn(card.id))
}

function deleteCard(cardId: string) {
  // Deleting a middle card heals the chain: its predecessor re-plugs
  // straight into its successor instead of leaving two loose ends.
  const inbound = connections.value.find(c => c.to === cardId)
  const outbound = connections.value.find(c => c.from === cardId)
  cards.value = cards.value.filter(c => c.id !== cardId)
  connections.value = connections.value.filter(c => c.from !== cardId && c.to !== cardId)
  if (inbound && outbound && inbound.from !== outbound.to) {
    connections.value.push({ id: id('k'), from: inbound.from, to: outbound.to })
  }
  if (selectedCardId.value === cardId) selectedCardId.value = null
}

function duplicateSelected() {
  const src = selectedCard.value
  if (!src) return
  const copy: StoryCard = { ...JSON.parse(JSON.stringify(src)), id: id('c'), x: src.x + 36, y: src.y + 36 }
  cards.value.push(copy)
  selectedCardId.value = copy.id
}

function editCard(cardId: string) {
  selectedCardId.value = cardId
  inspectorOpen.value = true
}

function tidy() {
  if (activeModel.value.stages.length) laneLayout(cards.value, connections.value, activeModel.value)
  else tidyPositions(cards.value, connections.value)
  nextTick(() => canvasRef.value?.fitView())
}

// ── Model picking / seeding ─────────────────────────────────────
function seedFromModel(modelId: ModelId) {
  const m = ID_MODELS[modelId]
  model.value = modelId
  projectTitle.value = 'Untitled Storyboard'
  selectedCardId.value = null
  connections.value = []
  if (!m.stages.length) {
    cards.value = [createCard('title', { x: 60, y: 160 })]
  } else {
    const seeded: StoryCard[] = []
    const conns: Connection[] = []
    for (const s of m.stages) {
      const card = createCard(s.kind, { x: 0, y: 0 })
      card.stage = s.id
      card.title = s.label.replace(/^\d+ · /, '')
      const prev = seeded.at(-1)
      seeded.push(card)
      if (prev) conns.push({ id: id('k'), from: prev.id, to: card.id })
    }
    cards.value = seeded
    connections.value = conns
    laneLayout(cards.value, connections.value, m)
  }
  nextTick(() => canvasRef.value?.fitView())
}

function pickModel(modelId: ModelId) {
  const mode = modelPicker.value
  modelPicker.value = null
  if (mode === 'switch') {
    // Non-destructive: cards stay, stages that don't exist in the new
    // framework reset to unassigned. Tidy re-lanes on demand.
    const m = ID_MODELS[modelId]
    model.value = modelId
    for (const card of cards.value) {
      if (card.stage && !m.stages.some(s => s.id === card.stage)) card.stage = ''
    }
  } else {
    pendingPrevProjectId = undefined // the new project is committed
    seedFromModel(modelId)
    view.value = 'editor'
    resetHistory()
    persist()
    // Very first storyboard: let the tour walk the fresh canvas once the
    // seeded lanes have settled into view.
    let seen = false
    try { seen = !!localStorage.getItem(TOUR_KEY) } catch {}
    if (!seen) setTimeout(() => { tourOpen.value = true }, 700)
  }
}

function onPickerClose() {
  modelPicker.value = null
  // A cancelled "new" flow rolls back to whatever was active before.
  if (pendingPrevProjectId !== undefined) {
    activeProjectId.value = pendingPrevProjectId
    pendingPrevProjectId = undefined
  }
}

function newProject() {
  showMenu.value = null
  flushSave()
  pendingPrevProjectId = activeProjectId.value
  activeProjectId.value = newProjectId()
  modelPicker.value = 'new'
}

// ── Project shelf (home) ────────────────────────────────────────
function openProject(projectId: string) {
  const data = readProject(projectId)
  if (!data) return
  applyProject(data)
  activeProjectId.value = projectId
  resetHistory()
  view.value = 'editor'
}

function goHome() {
  flushSave()
  refreshThumb(true)
  selectedCardId.value = null
  inspectorOpen.value = false
  showMenu.value = null
  projects.value = listProjects()
  view.value = 'home'
}

function deleteProjectEntry(projectId: string) {
  removeProject(projectId)
  projects.value = listProjects()
  if (activeProjectId.value === projectId) activeProjectId.value = null
}

function flushSave() {
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null }
  if (activeProjectId.value) { commitHistory(); persist() }
}

function modelLabelOf(modelId: string) { return modelOf(modelId).label }

function relTime(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return days === 1 ? 'yesterday' : `${days} days ago`
}

// ── Persistence + history ───────────────────────────────────────
const histStack = ref<string[]>([])
const histIndex = ref(-1)
let restoring = false
let saveTimer: ReturnType<typeof setTimeout> | null = null

const canUndo = computed(() => histIndex.value > 0)
const canRedo = computed(() => histIndex.value < histStack.value.length - 1)

function serialize() {
  return JSON.stringify({ title: projectTitle.value, model: model.value, cards: cards.value, connections: connections.value })
}
function commitHistory() {
  const s = serialize()
  if (histStack.value[histIndex.value] === s) return
  histStack.value.splice(histIndex.value + 1)
  histStack.value.push(s)
  if (histStack.value.length > 80) histStack.value.shift()
  histIndex.value = histStack.value.length - 1
}
function applySnapshot(s: string) {
  restoring = true
  try {
    const data = JSON.parse(s)
    projectTitle.value = data.title
    model.value = data.model || 'freeform'
    cards.value = data.cards
    connections.value = data.connections
    if (selectedCardId.value && !data.cards.some((c: StoryCard) => c.id === selectedCardId.value)) selectedCardId.value = null
  } finally {
    nextTick(() => { restoring = false })
  }
  persist()
}
function undo() { if (canUndo.value) { histIndex.value--; applySnapshot(histStack.value[histIndex.value]) } }
function redo() { if (canRedo.value) { histIndex.value++; applySnapshot(histStack.value[histIndex.value]) } }

function currentProject(): StoryGenProject {
  return {
    version: '5.0',
    title: projectTitle.value,
    model: model.value,
    updated: new Date().toISOString(),
    cards: cards.value,
    connections: connections.value
  }
}

// Home-screen thumbnails come from the same renderer as the PNG export,
// at postcard scale — refreshed at most every few seconds.
let lastThumbAt = 0
function refreshThumb(force = false) {
  if (!activeProjectId.value || !cards.value.length) return
  const now = Date.now()
  if (!force && now - lastThumbAt < 8000) return
  lastThumbAt = now
  try {
    const w = Math.max(...cards.value.map(c => c.x)) - Math.min(...cards.value.map(c => c.x)) + 480
    const canvas = renderDiagram({
      title: projectTitle.value, cards: cards.value, connections: connections.value,
      modelId: model.value, modelLabel: activeModel.value.stages.length ? activeModel.value.label : undefined
    }, Math.min(0.55, 620 / w))
    if (canvas) writeThumb(activeProjectId.value, canvas.toDataURL('image/jpeg', 0.72))
  } catch {}
}

function persist() {
  if (!activeProjectId.value) return
  writeProject(activeProjectId.value, currentProject())
  refreshThumb()
  savedFlash.value = true
  setTimeout(() => { savedFlash.value = false }, 1400)
}

function resetHistory() {
  histStack.value = []
  histIndex.value = -1
  nextTick(commitHistory)
}

function scheduleCommit(delay = 350) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    // Never snapshot a half-finished drag or half-plugged connection.
    if (canvasRef.value?.gestureActive) { scheduleCommit(150); return }
    commitHistory()
    persist()
  }, delay)
}

watch([projectTitle, model, cards, connections], () => {
  if (restoring) return
  scheduleCommit()
}, { deep: true })

// Accepts the current shape or migrates older StoryGen/StoryForge saves so
// nobody's work is stranded.
function normalizeProject(data: any): { title: string; model: ModelId; cards: StoryCard[]; connections: Connection[] } {
  const modelId: ModelId = ID_MODELS[data?.model as ModelId] ? data.model : 'freeform'
  const blank = (kind: CardKind, x: number, y: number) => createCard(kind, { x, y })
  if (Array.isArray(data?.cards)) {
    const sane: StoryCard[] = data.cards.map((c: any, i: number) => {
      const kind: CardKind = CARD_KINDS[c.kind as CardKind] ? c.kind : 'text-image'
      const base = blank(kind, Number(c.x ?? 60 + i * 300), Number(c.y ?? 160))
      const options = Array.isArray(c.options) ? c.options.slice(0, 4).map(String) : base.options
      while (options.length < 4) options.push('')
      return { ...base, ...c, kind, options, stage: typeof c.stage === 'string' ? c.stage : '', id: String(c.id || base.id) }
    })
    const conns = (Array.isArray(data.connections) ? data.connections : [])
      .map((c: any) => ({ id: String(c.id || id('k')), from: String(c.from), to: String(c.to) }))
    return { title: String(data.title || 'Untitled Storyboard'), model: modelId, cards: sane, connections: sanitizeConnections(sane, conns) }
  }
  if (Array.isArray(data?.scenes)) {
    const migrated: StoryCard[] = data.scenes.map((s: any, i: number) => ({
      ...blank('text-image', Number(s.x ?? 60 + i * 376), Number(s.y ?? 160)),
      id: String(s.id || id('c')),
      title: String(s.title || `Screen ${i + 1}`),
      body: String(s.visualDescription || ''),
      narration: String(s.narration || ''),
      notes: [s.interactions, s.navigation].filter(Boolean).join('\n'),
      duration: Number(s.duration || 45),
      status: String(s.status || 'Draft')
    }))
    const conns = sanitizeConnections(migrated, (Array.isArray(data.connections) ? data.connections : [])
      .map((c: any) => ({ id: String(c.id || id('k')), from: String(c.from), to: String(c.to) })))
    for (const m of (Array.isArray(data.mcqs) ? data.mcqs : [])) {
      const pos = nextAutoPosition(migrated, conns)
      const opts = (Array.isArray(m.options) ? m.options : []).map((o: any) => String(o?.text ?? o ?? ''))
      while (opts.length < 4) opts.push('')
      migrated.push({
        ...blank('mcq', pos.x, pos.y),
        title: 'Knowledge Check',
        question: String(m.question || ''),
        options: opts.slice(0, 4),
        correctIndex: Math.max(0, (Array.isArray(m.options) ? m.options : []).findIndex((o: any) => o?.correct)),
        feedback: String(m.explanation || '')
      })
    }
    return { title: String(data.title || 'Imported Storyboard'), model: 'freeform', cards: migrated, connections: conns }
  }
  return { title: 'Untitled Storyboard', model: 'freeform', cards: [], connections: [] }
}

function applyProject(data: any) {
  const normal = normalizeProject(data)
  projectTitle.value = normal.title
  model.value = normal.model
  cards.value = normal.cards
  connections.value = normal.connections
  selectedCardId.value = null
  nextTick(() => canvasRef.value?.fitView())
}

async function importProject(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  showMenu.value = null
  if (!file) return
  try {
    const data = JSON.parse(await file.text())
    flushSave()
    applyProject(data)
    // An imported file becomes its own project on the shelf.
    activeProjectId.value = newProjectId()
    resetHistory()
    persist()
    view.value = 'editor'
  } catch {}
  ;(e.target as HTMLInputElement).value = ''
}

// ── Exports ─────────────────────────────────────────────────────
async function exportDocx() {
  showMenu.value = null
  await exportStoryDocx(
    { title: projectTitle.value, cards: cards.value, connections: connections.value, model: activeModel.value },
    `${safeName(projectTitle.value)}.docx`
  )
}
async function exportXlsx() {
  showMenu.value = null
  await exportStoryXlsx(
    { title: projectTitle.value, cards: cards.value, connections: connections.value, model: activeModel.value },
    `${safeName(projectTitle.value)}.xlsx`
  )
}
function exportDiagram() {
  showMenu.value = null
  exportDiagramPng({
    title: projectTitle.value,
    cards: cards.value,
    connections: connections.value,
    modelId: model.value,
    modelLabel: activeModel.value.stages.length ? activeModel.value.label : undefined
  }, `${safeName(projectTitle.value)}-flow.png`)
}
function exportSbf() {
  showMenu.value = null
  const project: StoryGenProject = {
    version: '5.0', title: projectTitle.value, model: model.value, updated: new Date().toISOString(),
    cards: cards.value, connections: connections.value
  }
  saveAs(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), `${safeName(projectTitle.value)}.sbf`)
}

// ── Keyboard shortcuts (desktop-software feel) ──────────────────
function isEditingText(e: KeyboardEvent) {
  const t = e.target as HTMLElement
  return !!t.closest('input, textarea, select, [contenteditable="true"]')
}
function onKeydown(e: KeyboardEvent) {
  if (view.value !== 'editor') {
    if (e.key === 'Escape' && modelPicker.value) onPickerClose()
    return
  }
  const mod = e.metaKey || e.ctrlKey
  if (mod && e.key.toLowerCase() === 'z') {
    if (isEditingText(e)) return
    e.preventDefault()
    e.shiftKey ? redo() : undo()
  } else if (mod && e.key.toLowerCase() === 'y') {
    if (isEditingText(e)) return
    e.preventDefault(); redo()
  } else if (mod && e.key.toLowerCase() === 'd' && selectedCard.value) {
    e.preventDefault(); duplicateSelected()
  } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCardId.value && !isEditingText(e)) {
    e.preventDefault(); deleteCard(selectedCardId.value)
  } else if (e.key === 'Escape') {
    if (tourOpen.value) return // TourGuide owns Escape while open
    if (modelPicker.value) { onPickerClose(); return }
    if (showMenu.value || showPaletteSheet.value) { showMenu.value = null; showPaletteSheet.value = false; return }
    if (inspectorOpen.value) { inspectorOpen.value = false; return }
    selectedCardId.value = null
  }
}

let splashTimer: ReturnType<typeof setTimeout> | null = null
onMounted(() => {
  mq = window.matchMedia('(min-width: 900px)')
  onMq(mq)
  mq.addEventListener('change', onMq)
  window.addEventListener('keydown', onKeydown)
  migrateLegacyProject()
  projects.value = listProjects()
  splashTimer = setTimeout(() => { if (view.value === 'splash') view.value = 'home' }, 1300)
})
onUnmounted(() => {
  mq?.removeEventListener('change', onMq)
  window.removeEventListener('keydown', onKeydown)
  if (splashTimer) clearTimeout(splashTimer)
  flushSave()
})
</script>

<template>
  <div class="sg-root">
    <UiGlassBackdrop />

    <!-- Splash: a breath of brand before the shelf -->
    <Transition name="splash">
      <div v-if="view === 'splash'" class="sg-splash" @click="view = 'home'">
        <ToolsStoryBrandMark :size="116" class="sg-splash__mark" />
        <p class="sg-splash__name">Story<em>Gen</em></p>
        <p class="sg-splash__tag">Storyboard studio for instructional designers</p>
        <button class="sg-ai-chip sg-splash__ai" @click.stop="view = 'home'; aiSetupOpen = true">
          ✨ AI features: {{ aiReady ? 'On' : 'Off' }}
        </button>
      </div>
    </Transition>

    <!-- Home: recent local projects -->
    <div v-if="view === 'home'" class="sg-home" data-lenis-prevent>
      <div class="sg-home__inner">
        <header class="sg-home__head">
          <ToolsStoryBrandMark :size="46" />
          <div>
            <h1>Story<em>Gen</em></h1>
            <p>Pick a framework, wire the screens, export a polished storyboard.</p>
          </div>
          <button class="sg-ai-chip sg-home__ai" :class="{ 'sg-ai-chip--on': aiReady }" @click="aiSetupOpen = true">
            ✨ AI {{ aiReady ? 'On' : 'Off' }}
          </button>
        </header>

        <div class="sg-home__actions">
          <button class="glass-btn" @click="newProject">+ New storyboard</button>
          <button v-if="aiReady" class="glass-btn sg-home__ai-new" @click="openAiGenerate">✨ New with AI</button>
          <label class="sg-tool sg-tool--wide sg-file-btn sg-home__open">Open .sbf<input type="file" accept=".sbf,.json" @change="importProject"></label>
        </div>

        <p v-if="projects.length" class="glass-label sg-home__label">Recent storyboards</p>
        <div class="sg-home__grid">
          <article
            v-for="p in projects" :key="p.id"
            class="glass-panel sg-proj" role="button" tabindex="0"
            @click="openProject(p.id)"
            @keydown.enter="openProject(p.id)"
          >
            <div class="sg-proj__thumb">
              <img v-if="p.thumb" :src="p.thumb" alt="">
              <ToolsStoryBrandMark v-else :size="40" class="sg-proj__thumb-fallback" />
            </div>
            <div class="sg-proj__meta">
              <strong>{{ p.title || 'Untitled Storyboard' }}</strong>
              <span>{{ modelLabelOf(p.model) }} · {{ p.screens }} screens · ≈{{ p.minutes }} min</span>
              <span class="sg-proj__date">{{ relTime(p.updated) }}</span>
            </div>
            <button class="sg-proj__del" title="Delete storyboard" @click.stop="deleteProjectEntry(p.id)">✕</button>
          </article>
        </div>
        <p v-if="!projects.length" class="sg-home__empty">Nothing here yet — your storyboards live on this device. Create the first one.</p>
      </div>
    </div>

    <!-- Editor -->
    <div v-if="view === 'editor'" class="sg-app">

    <!-- Canvas fills the whole workspace; every control floats above it -->
    <ToolsStoryNodeCanvas
      ref="canvasRef"
      v-model:cards="cards"
      v-model:connections="connections"
      v-model:selected-card-id="selectedCardId"
      class="sg-canvas"
      data-lenis-prevent
      :insets="canvasInsets"
      :model-id="model"
      @delete-card="deleteCard"
      @edit-card="editCard"
    />

    <!-- Top bar -->
    <header class="sg-topbar glass-panel">
      <button class="sg-wordmark" title="Home" @click="goHome">
        <ToolsStoryBrandMark :size="20" />
        <span class="sg-wordmark__text">Story<em>Gen</em></span>
      </button>
      <input v-model="projectTitle" class="sg-title" placeholder="Untitled Storyboard" aria-label="Project title">
      <span class="sg-saved" :class="{ 'sg-saved--on': savedFlash }">● Saved</span>

      <button class="sg-tool sg-tool--wide sg-model-chip sg-desktop-only" title="Switch framework" @click="modelPicker = 'switch'">
        {{ activeModel.label }}
      </button>

      <div class="sg-topbar__group">
        <button class="sg-tool" :disabled="!canUndo" title="Undo (⌘Z)" @click="undo">↶</button>
        <button class="sg-tool" :disabled="!canRedo" title="Redo (⇧⌘Z)" @click="redo">↷</button>
        <button class="sg-tool sg-desktop-only" title="Product tour" @click="startTour">?</button>
      </div>

      <div class="sg-topbar__group sg-desktop-only">
        <div class="sg-menu-wrap">
          <button
            class="sg-tool sg-tool--wide" :class="{ 'sg-tool--ai': aiReady }" title="AI features"
            @click="aiReady ? (showMenu = showMenu === 'ai' ? null : 'ai') : openAiSetup()"
          >✨{{ aiReady ? ' AI' : '' }}</button>
          <div v-if="showMenu === 'ai'" class="glass-panel sg-menu">
            <button @click="openAiGenerate">✨ New storyboard with AI…</button>
            <button :disabled="aiBusyField === 'mcqs'" @click="aiAddMcqs">✨ Add knowledge checks from content</button>
            <button @click="openAiSetup">AI settings…</button>
          </div>
        </div>
        <button class="sg-tool sg-tool--wide" @click="newProject">New</button>
        <label class="sg-tool sg-tool--wide sg-file-btn">Open<input type="file" accept=".sbf,.json" @change="importProject"></label>
        <div class="sg-menu-wrap">
          <button class="glass-btn sg-export-btn" @click="showMenu = showMenu === 'export' ? null : 'export'">Export ▾</button>
          <div v-if="showMenu === 'export'" class="glass-panel sg-menu">
            <button @click="exportDocx">Word (.docx) — Storyboard + MCQ</button>
            <button @click="exportXlsx">Excel (.xlsx) — Storyboard + MCQ</button>
            <button @click="exportDiagram">Flow diagram (.png)</button>
            <button @click="exportSbf">Project file (.sbf)</button>
          </div>
        </div>
      </div>

      <div class="sg-menu-wrap sg-mobile-only">
        <button class="sg-tool" aria-label="Menu" @click="showMenu = showMenu === 'mobile' ? null : 'mobile'">⋯</button>
        <div v-if="showMenu === 'mobile'" class="glass-panel sg-menu">
          <button @click="goHome">Home — all storyboards</button>
          <button @click="showMenu = null; modelPicker = 'switch'">Framework: {{ activeModel.label }}</button>
          <button @click="openAiSetup">✨ AI features: {{ aiReady ? 'On' : 'Off' }}…</button>
          <button v-if="aiReady" @click="openAiGenerate">✨ New storyboard with AI…</button>
          <button v-if="aiReady" :disabled="aiBusyField === 'mcqs'" @click="aiAddMcqs">✨ Add knowledge checks</button>
          <button @click="startTour">Show the tour</button>
          <button @click="newProject">New storyboard</button>
          <label class="sg-menu-file">Open project (.sbf)<input type="file" accept=".sbf,.json" @change="importProject"></label>
          <button @click="exportDocx">Export Word (.docx)</button>
          <button @click="exportXlsx">Export Excel (.xlsx)</button>
          <button @click="exportDiagram">Export diagram (.png)</button>
          <button @click="exportSbf">Save project (.sbf)</button>
        </div>
      </div>
    </header>

    <!-- Left dock: card palette (desktop) -->
    <aside class="sg-dock glass-panel sg-desktop-only" data-lenis-prevent>
      <ToolsStoryCardPalette :model-id="model" :stage-seconds="stageSeconds" @add="addCard" />
    </aside>

    <!-- Bottom-left: zoom + layout controls (desktop; mobile pinches) -->
    <div class="sg-zoombar glass-panel sg-desktop-only">
      <button class="sg-tool" aria-label="Zoom out" @click="canvasRef?.zoomOut()">−</button>
      <span class="sg-zoom-pct">{{ canvasRef?.zoomPercent ?? 100 }}%</span>
      <button class="sg-tool" aria-label="Zoom in" @click="canvasRef?.zoomIn()">+</button>
      <span class="sg-zoombar__sep" />
      <button class="sg-tool sg-tool--wide" @click="canvasRef?.fitView()">Fit</button>
      <button class="sg-tool sg-tool--wide" title="Auto-arrange into stage lanes" @click="tidy">Tidy</button>
      <span class="sg-zoombar__sep sg-desktop-only" />
      <span class="sg-zoombar__meta sg-desktop-only">{{ cards.length }} screens · ≈{{ totalMinutes }} min</span>
    </div>

    <!-- Mobile bottom action bar -->
    <div class="sg-bottombar glass-panel sg-mobile-only">
      <button class="glass-btn sg-add-btn" @click="showPaletteSheet = true">+ Add card</button>
      <button class="sg-tool sg-tool--wide" @click="canvasRef?.fitView()">Fit</button>
      <button class="sg-tool sg-tool--wide" @click="tidy">Tidy</button>
      <span class="sg-bottombar__meta">{{ cards.length }} screens · ≈{{ totalMinutes }} min</span>
    </div>

    <!-- Mobile: slim selected-card bar — the clever middle step between
         tapping a card and committing to the full editor drawer -->
    <Transition name="cardbar">
      <div v-if="selectedCard && !isDesktop && !inspectorOpen" class="sg-cardbar glass-panel">
        <span class="sg-cardbar__dot" :style="{ background: selectedKindColor }" />
        <span class="sg-cardbar__title">{{ selectedCard.title || 'Untitled' }}</span>
        <button class="glass-btn sg-cardbar__edit" @click="inspectorOpen = true">✎ Edit</button>
        <button class="sg-tool" title="Duplicate" @click="duplicateSelected">⧉</button>
        <button class="sg-tool sg-cardbar__delete" title="Delete" @click="deleteCard(selectedCard.id)">✕</button>
      </div>
    </Transition>

    <!-- Mobile palette sheet -->
    <Transition name="sheet">
      <div v-if="showPaletteSheet" class="sg-sheet-overlay" @click.self="showPaletteSheet = false">
        <div class="sg-sheet glass-panel" data-lenis-prevent>
          <div class="sg-sheet__head">
            <strong>Add a card</strong>
            <button class="sg-tool" aria-label="Close" @click="showPaletteSheet = false">✕</button>
          </div>
          <ToolsStoryCardPalette sheet :model-id="model" :stage-seconds="stageSeconds" @add="addCard" />
        </div>
      </div>
    </Transition>

    <!-- Inspector: floating window (desktop) / bottom drawer (mobile) -->
    <ToolsStoryInspectorPanel
      :card="inspectorOpen ? selectedCard : null"
      :card-number="selectedCardNumber"
      :model-id="model"
      :branch-labels="branchLabels"
      :ai-ready="aiReady"
      :ai-busy="aiBusyField"
      @delete="selectedCardId && deleteCard(selectedCardId)"
      @duplicate="duplicateSelected"
      @close="inspectorOpen = false"
      @ai-rewrite="aiRewrite"
      @ai-options="aiOptions"
    />

    <!-- Click-away layer for open dropdowns -->
    <div v-if="showMenu" class="sg-clickaway" @click="showMenu = null" />
    </div><!-- /editor -->

    <!-- Framework picker: new storyboards (home or editor) + framework switch -->
    <ToolsStoryModelPicker
      v-if="modelPicker"
      :switching="modelPicker === 'switch'"
      :dismissible="projects.length > 0 || view === 'editor'"
      @pick="pickModel"
      @close="onPickerClose"
    />

    <!-- Spotlight product tour: auto-plays once on the first storyboard,
         replayable from ? (desktop) or the ⋯ menu (mobile) -->
    <ToolsStoryTourGuide v-if="tourOpen" @close="closeTour" @step="onTourStep" />

    <!-- Optional AI: setup (key + validation) and document-to-storyboard -->
    <ToolsStoryAiSetupSheet v-if="aiSetupOpen" @close="aiSetupOpen = false" />
    <ToolsStoryAiGenerateSheet
      v-if="aiGenerateOpen"
      :default-model="model"
      @close="aiGenerateOpen = false"
      @done="onAiGenerated"
    />

    <Transition name="toast">
      <div v-if="toast" class="sg-toast glass-panel">{{ toast }}</div>
    </Transition>
  </div>
</template>

<style scoped>
/* ── Splash ── */
.sg-splash {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rem;
  cursor: pointer;
}
.sg-splash__mark {
  border-radius: 26rem;
  box-shadow: 0 34rem 80rem -30rem rgba(0, 0, 0, 0.55);
  animation: splash-mark 0.9s var(--ease-spring) both;
}
@keyframes splash-mark {
  from { opacity: 0; transform: scale(0.7) rotate(-6deg); }
  to   { opacity: 1; transform: none; }
}
.sg-splash__name {
  font-size: 34rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  animation: splash-text 0.7s 0.25s var(--ease-spring) both;
}
.sg-splash__name em { font-style: normal; opacity: 0.55; }
.sg-splash__tag {
  font-size: 13.5rem;
  opacity: 0.55;
  animation: splash-text 0.7s 0.4s var(--ease-spring) both;
}
@keyframes splash-text {
  from { opacity: 0; transform: translateY(12rem); }
  to   { opacity: 1; transform: none; }
}
.splash-leave-active { transition: opacity 0.35s ease, transform 0.35s ease; }
.splash-leave-to { opacity: 0; transform: scale(1.04); }

/* ── AI chips + toast ── */
.sg-ai-chip {
  display: inline-flex;
  align-items: center;
  gap: 6rem;
  padding: 7rem 14rem;
  border-radius: 999px;
  font-size: 12rem;
  font-weight: 700;
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-bg) 50%, transparent);
  border: 1px solid var(--color-glass-border);
  transition: border-color 0.15s ease, background 0.15s ease;
}
.sg-ai-chip--on {
  border-color: color-mix(in srgb, #A78BFA 55%, transparent);
  background: color-mix(in srgb, #A78BFA 14%, transparent);
}
@media (hover: hover) { .sg-ai-chip:hover { background: color-mix(in srgb, #A78BFA 20%, transparent); } }
.sg-splash__ai { margin-top: 10rem; animation: splash-text 0.7s 0.55s var(--ease-spring) both; }
.sg-home__ai { margin-left: auto; flex-shrink: 0; }
.sg-home__ai-new {
  background: linear-gradient(120deg, #8B7CF6, #5B8DEF);
  color: #fff;
}
.sg-tool--ai {
  border-color: color-mix(in srgb, #A78BFA 55%, transparent);
  background: color-mix(in srgb, #A78BFA 14%, transparent);
}

.sg-toast {
  position: fixed;
  left: 50%;
  bottom: calc(24rem + var(--safe-bottom));
  transform: translateX(-50%);
  z-index: 34;
  padding: 12rem 18rem;
  font-size: 13rem;
  font-weight: 600;
  max-width: min(480rem, calc(100vw - 32rem));
  text-align: center;
  line-height: 1.45;
}
.toast-enter-active, .toast-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(10rem); }

/* ── Home ── */
.sg-home {
  position: fixed;
  inset: 0;
  overflow-y: auto;
  z-index: 1;
  padding: calc(96rem + var(--safe-top)) 24rem calc(48rem + var(--safe-bottom));
}
.sg-home__inner { max-width: 980rem; margin: 0 auto; }
.sg-home__head {
  display: flex;
  align-items: center;
  gap: 18rem;
  margin-bottom: 26rem;
}
.sg-home__head svg { border-radius: 12rem; box-shadow: 0 18rem 40rem -18rem rgba(0,0,0,0.5); }
.sg-home__head h1 { font-size: 30rem; font-weight: 800; letter-spacing: -0.04em; }
.sg-home__head h1 em { font-style: normal; opacity: 0.55; }
.sg-home__head p { font-size: 14rem; opacity: 0.6; margin-top: 4rem; line-height: 1.4; }
.sg-home__actions { display: flex; align-items: center; gap: 10rem; margin-bottom: 30rem; }
.sg-home__open { height: 40rem; }
.sg-home__label { margin-bottom: 10rem; }
.sg-home__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280rem, 1fr));
  gap: 14rem;
}
.sg-proj {
  position: relative;
  padding: 12rem;
  display: flex;
  flex-direction: column;
  gap: 11rem;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease;
}
@media (hover: hover) {
  .sg-proj:hover { transform: translateY(-2rem); border-color: var(--color-glass-border-hover); }
  .sg-proj:hover .sg-proj__del { opacity: 0.7; }
}
.sg-proj__thumb {
  height: 132rem;
  border-radius: 14rem;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--color-text) 5%, transparent);
  border: 1px solid var(--color-divider);
}
.sg-proj__thumb img { width: 100%; height: 100%; object-fit: cover; }
.sg-proj__thumb-fallback { opacity: 0.5; border-radius: 10rem; }
.sg-proj__meta { display: flex; flex-direction: column; gap: 3rem; padding: 0 4rem 2rem; }
.sg-proj__meta strong { font-size: 15rem; letter-spacing: -0.02em; }
.sg-proj__meta span { font-size: 12rem; opacity: 0.6; }
.sg-proj__date { font-size: 11rem !important; opacity: 0.45 !important; }
.sg-proj__del {
  position: absolute;
  top: 10rem; right: 10rem;
  width: 24rem; height: 24rem;
  display: grid; place-items: center;
  border-radius: 999px;
  font-size: 10rem;
  color: #ff8d8d;
  background: color-mix(in srgb, var(--color-bg) 60%, transparent);
  border: 1px solid var(--color-glass-border);
  opacity: 0;
  transition: opacity 0.15s ease;
}
@media (hover: none) { .sg-proj__del { opacity: 0.55; } }
.sg-home__empty { font-size: 14rem; opacity: 0.55; line-height: 1.5; }

@media (max-width: 640px) {
  .sg-home { padding: calc(84rem + var(--safe-top)) 14rem calc(40rem + var(--safe-bottom)); }
  .sg-home__grid { grid-template-columns: 1fr; }
  .sg-home__head h1 { font-size: 25rem; }
}

/* ── Editor shell ── */
.sg-app {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 1;
}
.sg-canvas { position: absolute; inset: 0; }

.sg-desktop-only { display: flex; }
.sg-mobile-only { display: none; }

/* ── Top bar ── */
.sg-topbar {
  position: absolute;
  top: calc(12rem + var(--safe-top));
  left: 78rem;
  right: 78rem;
  display: flex;
  align-items: center;
  gap: 10rem;
  padding: 9rem 14rem;
  border-radius: 16rem;
  z-index: 20;
}
.sg-wordmark {
  display: inline-flex;
  align-items: center;
  gap: 8rem;
  font-size: 15rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  white-space: nowrap;
  color: var(--color-text);
  border-radius: 10rem;
  padding: 4rem 6rem;
  transition: background 0.15s ease;
}
@media (hover: hover) { .sg-wordmark:hover { background: color-mix(in srgb, var(--color-bg) 55%, transparent); } }
.sg-wordmark svg { border-radius: 5rem; display: block; }
.sg-wordmark em { font-style: normal; opacity: 0.55; }
.sg-title {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--color-text);
  font: 600 14rem/1.2 var(--main-font);
  letter-spacing: -0.02em;
  outline: none;
  padding: 6rem 8rem;
  border-radius: 8rem;
}
.sg-title:focus { background: color-mix(in srgb, var(--color-bg) 55%, transparent); }
.sg-saved {
  font-size: 10.5rem;
  font-weight: 600;
  opacity: 0;
  color: #3fbf6f;
  transition: opacity 0.3s ease;
  white-space: nowrap;
}
.sg-saved--on { opacity: 0.9; }
.sg-model-chip { max-width: 190rem; overflow: hidden; text-overflow: ellipsis; }

.sg-topbar__group { display: flex; align-items: center; gap: 6rem; }

.sg-tool {
  min-width: 30rem;
  height: 30rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rem;
  border-radius: 9rem;
  font-size: 13rem;
  font-weight: 600;
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-bg) 45%, transparent);
  border: 1px solid var(--color-glass-border);
  transition: background 0.15s ease, opacity 0.15s ease;
}
@media (hover: hover) { .sg-tool:not(:disabled):hover { background: color-mix(in srgb, var(--color-bg) 65%, transparent); } }
.sg-tool:disabled { opacity: 0.3; cursor: default; }
.sg-tool--wide { font-size: 12rem; padding: 0 12rem; white-space: nowrap; }
.sg-file-btn { position: relative; overflow: hidden; cursor: pointer; }
.sg-file-btn input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

.sg-export-btn { padding: 8rem 16rem; font-size: 12.5rem; }

.sg-menu-wrap { position: relative; }
.sg-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8rem);
  min-width: 260rem;
  padding: 8rem;
  z-index: 26;
  display: flex;
  flex-direction: column;
}
.sg-menu button, .sg-menu-file {
  display: block;
  width: 100%;
  padding: 10rem 12rem;
  border-radius: 10rem;
  text-align: left;
  font-size: 13rem;
  font-weight: 500;
  color: var(--color-text);
  cursor: pointer;
  position: relative;
}
@media (hover: hover) {
  .sg-menu button:hover, .sg-menu-file:hover { background: color-mix(in srgb, var(--color-bg) 60%, transparent); }
}
.sg-menu-file { overflow: hidden; }
.sg-menu-file input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

/* Sits under the top bar so open dropdowns stay clickable, but over the
   canvas so any outside tap dismisses the menu. */
.sg-clickaway { position: fixed; inset: 0; z-index: 19; }

/* ── Left dock ── */
.sg-dock {
  position: absolute;
  left: 14rem;
  top: calc(74rem + var(--safe-top));
  padding: 12rem 8rem;
  border-radius: 18rem;
  z-index: 15;
  max-height: calc(100dvh - 74rem - 84rem - var(--safe-top) - var(--safe-bottom));
  overflow-y: auto;
}

/* ── Zoom bar ── */
.sg-zoombar {
  position: absolute;
  left: 14rem;
  bottom: calc(14rem + var(--safe-bottom));
  display: flex;
  align-items: center;
  gap: 6rem;
  padding: 8rem 10rem;
  border-radius: 14rem;
  z-index: 15;
}
.sg-zoom-pct { font-size: 11.5rem; font-weight: 600; opacity: 0.65; min-width: 38rem; text-align: center; }
.sg-zoombar__sep { width: 1px; height: 18rem; background: var(--color-divider); margin: 0 2rem; }
.sg-zoombar__meta { font-size: 11.5rem; font-weight: 600; opacity: 0.6; white-space: nowrap; padding: 0 4rem; }

/* ── Mobile bottom bar + sheets ── */
.sg-bottombar {
  position: absolute;
  left: 10rem;
  right: 10rem;
  bottom: calc(10rem + var(--safe-bottom));
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 8rem;
  padding: 10rem 12rem;
  border-radius: 16rem;
  z-index: 18;
}
.sg-add-btn { padding: 10rem 16rem; font-size: 13rem; }
.sg-bottombar__meta { font-size: 11rem; font-weight: 600; opacity: 0.6; white-space: nowrap; margin-left: auto; }

/* Slim selected-card action bar (mobile) */
.sg-cardbar {
  position: absolute;
  left: 10rem;
  right: 10rem;
  bottom: calc(66rem + var(--safe-bottom));
  display: flex;
  align-items: center;
  gap: 9rem;
  padding: 9rem 12rem;
  border-radius: 14rem;
  z-index: 19;
}
.sg-cardbar__dot { width: 10rem; height: 10rem; border-radius: 999px; flex-shrink: 0; }
.sg-cardbar__title {
  flex: 1;
  min-width: 0;
  font-size: 13rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sg-cardbar__edit { padding: 8rem 14rem; font-size: 12rem; }
.sg-cardbar__delete { color: #ff8d8d; }
.cardbar-enter-active, .cardbar-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.cardbar-enter-from, .cardbar-leave-to { opacity: 0; transform: translateY(10rem); }

.sg-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 28;
  display: flex;
  align-items: flex-end;
}
.sg-sheet {
  width: 100%;
  border-radius: 22rem 22rem 0 0;
  padding: 16rem 16rem calc(20rem + var(--safe-bottom));
  max-height: 72dvh;
  overflow-y: auto;
}
.sg-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rem;
  font-size: 15rem;
}

.sheet-enter-active, .sheet-leave-active { transition: opacity 0.22s ease; }
.sheet-enter-active .sg-sheet, .sheet-leave-active .sg-sheet { transition: transform 0.26s var(--ease-expo-out); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .sg-sheet, .sheet-leave-to .sg-sheet { transform: translateY(60%); }

@media (max-width: 899px) {
  .sg-desktop-only { display: none !important; }
  .sg-mobile-only { display: flex; }
  .sg-topbar { left: 72rem; right: 72rem; padding: 8rem 10rem; gap: 7rem; }
  .sg-wordmark__text { display: none; }
  .sg-wordmark { padding: 4rem; }
  .sg-title { font-size: 16px; } /* ≥16px so iOS Safari doesn't zoom on focus */
  .sg-bottombar { display: flex; }
  .sg-menu { position: fixed; left: 12rem; right: 12rem; top: calc(64rem + var(--safe-top)); min-width: 0; }
}
</style>
