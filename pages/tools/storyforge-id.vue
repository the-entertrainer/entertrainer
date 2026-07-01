<script setup lang="ts">
import { saveAs } from 'file-saver'
import PptxGenJS from 'pptxgenjs'
import jsPDF from 'jspdf'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

type CardType = 'Learning Objective' | 'Content' | 'MCQ/Quiz' | 'Scenario' | 'Video/Animation' | 'Summary' | 'Assessment'
type CardStatus = 'Draft' | 'SME Review' | 'Approved' | 'Final'
type CardTheme = 'Glass' | 'Slate' | 'Aurora' | 'Sunrise'
type CardLayout = 'Stack' | 'Split' | 'Focus'
type EditableField = 'onscreenHtml' | 'narrationHtml' | 'notesHtml'

type StoryCard = {
  id: string
  type: CardType
  title: string
  onscreenHtml: string
  narrationHtml: string
  notesHtml: string
  duration: number
  status: CardStatus
  theme: CardTheme
  layout: CardLayout
  x: number
  y: number
}

type CardConnection = {
  id: string
  fromId: string
  toId: string
  label: string
}

type AiCardAssistResponse = {
  field: EditableField
  content: string
  suggestions: string[]
}

const CARD_TYPES: CardType[] = ['Learning Objective', 'Content', 'MCQ/Quiz', 'Scenario', 'Video/Animation', 'Summary', 'Assessment']
const CARD_THEMES: CardTheme[] = ['Glass', 'Slate', 'Aurora', 'Sunrise']
const CARD_LAYOUTS: CardLayout[] = ['Stack', 'Split', 'Focus']
const CONNECTION_LABELS = ['Next', 'If correct', 'If incorrect', 'Remediation', 'Optional path']
const CARD_STATUSES: CardStatus[] = ['Draft', 'SME Review', 'Approved', 'Final']

const CARD_WIDTH = 292
const CARD_HEIGHT = 228

const projectTitle = ref('Adaptive Learning Storyboard')
const projectSummary = ref('')
const objectives = ref<string[]>([])
const cards = ref<StoryCard[]>([])
const connections = ref<CardConnection[]>([])
const selectedCardId = ref('')
const showExportMenu = ref(false)
const rawSource = ref('')
const audience = ref('')
const modality = ref('eLearning storyboard')
const tone = ref('clear, practical, learner-centered')
const cardCount = ref(9)
const pending = ref(false)
const error = ref('')
const uploadNote = ref('')
const enableAi = ref(true)
const aiPending = ref(false)
const aiError = ref('')
const aiSuggestions = ref<string[]>([])
const activeEditorField = ref<EditableField>('onscreenHtml')

const dragState = ref<{ id: string; offsetX: number; offsetY: number } | null>(null)
const surfaceRef = ref<HTMLElement | null>(null)
const connectionDraft = ref<{ fromId: string; label: string; x: number; y: number } | null>(null)

const selectedCard = computed(() => cards.value.find(card => card.id === selectedCardId.value) ?? null)
const canGenerate = computed(() => rawSource.value.trim().length >= 20 && !pending.value)
const totalDuration = computed(() => Math.max(1, Math.round(cards.value.reduce((sum, card) => sum + Math.max(0, Number(card.duration || 0)), 0) / 60)))
const surfaceSize = computed(() => {
  const maxX = cards.value.length ? Math.max(...cards.value.map(card => card.x + CARD_WIDTH + 110)) : 1300
  const maxY = cards.value.length ? Math.max(...cards.value.map(card => card.y + CARD_HEIGHT + 110)) : 860
  return {
    width: Math.max(1300, maxX),
    height: Math.max(860, maxY)
  }
})

const connectionPaths = computed(() => {
  return connections.value
    .map((link) => {
      const from = cards.value.find(card => card.id === link.fromId)
      const to = cards.value.find(card => card.id === link.toId)
      if (!from || !to) return null
      const start = { x: from.x + CARD_WIDTH - 12, y: from.y + CARD_HEIGHT / 2 }
      const end = { x: to.x + 12, y: to.y + CARD_HEIGHT / 2 }
      const curve = Math.max(70, Math.min(180, Math.abs(end.x - start.x) * 0.45))
      const d = `M ${start.x} ${start.y} C ${start.x + curve} ${start.y}, ${end.x - curve} ${end.y}, ${end.x} ${end.y}`
      const lx = Math.round((start.x + end.x) / 2)
      const ly = Math.round((start.y + end.y) / 2 - 10)
      return { ...link, d, lx, ly }
    })
    .filter(Boolean) as Array<CardConnection & { d: string; lx: number; ly: number }>
})

const draftPath = computed(() => {
  if (!connectionDraft.value) return ''
  const from = cards.value.find(card => card.id === connectionDraft.value?.fromId)
  if (!from) return ''
  const start = { x: from.x + CARD_WIDTH - 12, y: from.y + CARD_HEIGHT / 2 }
  const end = { x: connectionDraft.value.x, y: connectionDraft.value.y }
  const curve = Math.max(60, Math.min(160, Math.abs(end.x - start.x) * 0.45))
  return `M ${start.x} ${start.y} C ${start.x + curve} ${start.y}, ${end.x - curve} ${end.y}, ${end.x} ${end.y}`
})

onMounted(() => {
  if (!cards.value.length) seedProject()
  window.addEventListener('pointermove', onGlobalPointerMove)
  window.addEventListener('pointerup', onGlobalPointerUp)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onGlobalPointerMove)
  window.removeEventListener('pointerup', onGlobalPointerUp)
})

function uid(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function sanitizeHtml(input: string) {
  return String(input || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+=("[^"]*"|'[^']*')/gi, '')
    .replace(/javascript:/gi, '')
}

function textToHtml(text: string) {
  return sanitizeHtml(String(text || '').trim()).replace(/\n/g, '<br>')
}

function htmlToText(html: string) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>|<\/div>|<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function seedProject() {
  objectives.value = [
    'Identify the core performance gap and success criteria.',
    'Practice decision-making with feedback loops and remediation.',
    'Demonstrate readiness through assessment and reflection.'
  ]

  cards.value = [
    createCard('Learning Objective', 70, 90, {
      title: 'Welcome + Outcomes',
      onscreenHtml: textToHtml('Course title\nWhy this matters\n3 measurable outcomes'),
      narrationHtml: textToHtml('Welcome learners and establish relevance in under 45 seconds.'),
      notesHtml: textToHtml('Use a high-contrast hero visual and concise objective cards.'),
      status: 'Approved',
      duration: 45
    }),
    createCard('Content', 440, 90, {
      title: 'Core Concept Walkthrough',
      onscreenHtml: textToHtml('Model overview\nProcess map\nDo/Don\'t examples'),
      narrationHtml: textToHtml('Explain each step with one practical example.'),
      notesHtml: textToHtml('Include one short interaction checkpoint.'),
      duration: 90
    }),
    createCard('Scenario', 810, 80, {
      title: 'Decision Scenario',
      onscreenHtml: textToHtml('Situation\nDecision point\nTwo available actions'),
      narrationHtml: textToHtml('Prompt learners to choose an action based on the context.'),
      notesHtml: textToHtml('Branch to feedback cards based on choice.'),
      duration: 110,
      theme: 'Aurora',
      layout: 'Split'
    }),
    createCard('MCQ/Quiz', 1170, 40, {
      title: 'Check Understanding',
      onscreenHtml: textToHtml('Single best-answer MCQ with rationale.'),
      narrationHtml: textToHtml('Keep stem concise and plausible distractors balanced.'),
      notesHtml: textToHtml('If incorrect, route to remediation card.'),
      duration: 75,
      theme: 'Slate'
    }),
    createCard('Content', 1170, 320, {
      title: 'Remediation Boost',
      onscreenHtml: textToHtml('Targeted explanation\nWorked example\nTry again prompt'),
      narrationHtml: textToHtml('Address the likely misconception and rebuild confidence.'),
      notesHtml: textToHtml('Connect back to assessment.'),
      duration: 95,
      theme: 'Sunrise',
      layout: 'Focus'
    }),
    createCard('Summary', 1540, 180, {
      title: 'Summary + Transfer',
      onscreenHtml: textToHtml('Key takeaways\nOn-the-job application checklist'),
      narrationHtml: textToHtml('Wrap with a concise transfer prompt.'),
      notesHtml: textToHtml('Prepare learner for final assessment.'),
      duration: 60
    }),
    createCard('Assessment', 1910, 180, {
      title: 'Final Assessment',
      onscreenHtml: textToHtml('Performance task and scoring rubric.'),
      narrationHtml: textToHtml('Clarify pass criteria and what happens next.'),
      notesHtml: textToHtml('Completion unlocks certificate or next module.'),
      status: 'SME Review',
      duration: 100
    })
  ]

  connections.value = [
    makeConnection(cards.value[0].id, cards.value[1].id, 'Next'),
    makeConnection(cards.value[1].id, cards.value[2].id, 'Next'),
    makeConnection(cards.value[2].id, cards.value[3].id, 'If correct'),
    makeConnection(cards.value[2].id, cards.value[4].id, 'If incorrect'),
    makeConnection(cards.value[4].id, cards.value[3].id, 'Retry'),
    makeConnection(cards.value[3].id, cards.value[5].id, 'Next'),
    makeConnection(cards.value[5].id, cards.value[6].id, 'Next')
  ]

  projectSummary.value = 'A branching, assessment-led learning flow with explicit remediation path.'
  selectedCardId.value = cards.value[0]?.id || ''
}

function createCard(type: CardType, x: number, y: number, overrides: Partial<StoryCard> = {}): StoryCard {
  const { onscreenHtml: _on, narrationHtml: _nar, notesHtml: _notes, ...restOverrides } = overrides
  const onscreenHtml = sanitizeHtml(overrides.onscreenHtml ?? textToHtml('Add on-screen text here.'))
  const narrationHtml = sanitizeHtml(overrides.narrationHtml ?? textToHtml('Add narration script here.'))
  const notesHtml = sanitizeHtml(overrides.notesHtml ?? textToHtml('Add design notes, interactions, and branching logic.'))

  return {
    ...restOverrides,
    id: uid('card'),
    type: CARD_TYPES.includes(restOverrides.type as CardType) ? restOverrides.type as CardType : type,
    title: String(restOverrides.title || `${type} Card`),
    onscreenHtml,
    narrationHtml,
    notesHtml,
    duration: Math.max(20, Math.min(360, Number(restOverrides.duration ?? 60))),
    status: CARD_STATUSES.includes(restOverrides.status as CardStatus) ? restOverrides.status as CardStatus : 'Draft',
    theme: CARD_THEMES.includes(restOverrides.theme as CardTheme) ? restOverrides.theme as CardTheme : 'Glass',
    layout: CARD_LAYOUTS.includes(restOverrides.layout as CardLayout) ? restOverrides.layout as CardLayout : 'Stack',
    x,
    y
  }
}

function makeConnection(fromId: string, toId: string, label: string): CardConnection {
  return { id: uid('link'), fromId, toId, label: label.trim() || 'Next' }
}

function addCard(type: CardType) {
  const last = cards.value.at(-1)
  const x = last ? last.x + 330 : 80
  const y = last ? (last.y + 40) % 520 + 80 : 120
  const newCard = createCard(type, x, y)
  cards.value.push(newCard)
  selectedCardId.value = newCard.id
}

function duplicateSelectedCard() {
  if (!selectedCard.value) return
  const source = selectedCard.value
  const duplicate = createCard(source.type, source.x + 40, source.y + 40, {
    title: `${source.title} (Copy)`,
    onscreenHtml: source.onscreenHtml,
    narrationHtml: source.narrationHtml,
    notesHtml: source.notesHtml,
    duration: source.duration,
    status: source.status,
    theme: source.theme,
    layout: source.layout
  })
  cards.value.push(duplicate)
  selectedCardId.value = duplicate.id
}

function selectCard(cardId: string) {
  if (connectionDraft.value && connectionDraft.value.fromId !== cardId) {
    createConnection(connectionDraft.value.fromId, cardId, connectionDraft.value.label)
    connectionDraft.value = null
    return
  }
  selectedCardId.value = cardId
}

function deleteSelectedCard() {
  const card = selectedCard.value
  if (!card) return
  cards.value = cards.value.filter(entry => entry.id !== card.id)
  connections.value = connections.value.filter(link => link.fromId !== card.id && link.toId !== card.id)
  selectedCardId.value = cards.value[0]?.id || ''
}

function createConnection(fromId: string, toId: string, label: string) {
  const exists = connections.value.some(link => link.fromId === fromId && link.toId === toId && link.label === label)
  if (exists) return
  connections.value.push(makeConnection(fromId, toId, label))
}

function deleteConnection(connectionId: string) {
  connections.value = connections.value.filter(link => link.id !== connectionId)
}

function startConnect(fromId: string, event?: PointerEvent) {
  const card = cards.value.find(entry => entry.id === fromId)
  if (!card) return
  const startX = card.x + CARD_WIDTH - 12
  const startY = card.y + CARD_HEIGHT / 2
  connectionDraft.value = {
    fromId,
    label: 'Next',
    x: event ? getSurfacePoint(event.clientX, event.clientY).x : startX + 100,
    y: event ? getSurfacePoint(event.clientX, event.clientY).y : startY
  }
}

function cancelConnect() {
  connectionDraft.value = null
}

function getSurfacePoint(clientX: number, clientY: number) {
  const rect = surfaceRef.value?.getBoundingClientRect()
  if (!rect) return { x: 0, y: 0 }
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
}

function beginDrag(cardId: string, event: PointerEvent) {
  if (connectionDraft.value) return
  const card = cards.value.find(entry => entry.id === cardId)
  if (!card) return
  const point = getSurfacePoint(event.clientX, event.clientY)
  dragState.value = {
    id: cardId,
    offsetX: point.x - card.x,
    offsetY: point.y - card.y
  }
}

function onGlobalPointerMove(event: PointerEvent) {
  if (connectionDraft.value) {
    const point = getSurfacePoint(event.clientX, event.clientY)
    connectionDraft.value.x = point.x
    connectionDraft.value.y = point.y
  }

  if (!dragState.value) return
  const movingCard = cards.value.find(entry => entry.id === dragState.value?.id)
  if (!movingCard) return

  const point = getSurfacePoint(event.clientX, event.clientY)
  movingCard.x = clamp(point.x - dragState.value.offsetX, 12, surfaceSize.value.width - CARD_WIDTH - 12)
  movingCard.y = clamp(point.y - dragState.value.offsetY, 12, surfaceSize.value.height - CARD_HEIGHT - 12)
}

function onGlobalPointerUp() {
  dragState.value = null
}

function onSurfacePointerDown(event: PointerEvent) {
  if (!connectionDraft.value) return
  const target = event.target as HTMLElement | null
  if (target?.closest('.sf-node')) return
  cancelConnect()
}

function updateCardField(field: EditableField, event: Event) {
  const card = selectedCard.value
  if (!card) return
  const el = event.target as HTMLElement | null
  if (!el) return
  card[field] = sanitizeHtml(el.innerHTML)
}

function pastePlain(event: ClipboardEvent) {
  event.preventDefault()
  const text = event.clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
}

function execEditorCommand(command: string, value?: string) {
  document.execCommand(command, false, value)
}

function applyTheme(theme: CardTheme) {
  if (!selectedCard.value) return
  selectedCard.value.theme = theme
}

function applyLayout(layout: CardLayout) {
  if (!selectedCard.value) return
  selectedCard.value.layout = layout
}

async function generateWithGroq() {
  if (!canGenerate.value) return
  pending.value = true
  error.value = ''
  aiError.value = ''

  try {
    const data = await $fetch<any>('/api/storyforge', {
      method: 'POST',
      body: {
        mode: 'generate',
        raw: rawSource.value,
        audience: audience.value,
        modality: modality.value,
        tone: tone.value,
        cardCount: cardCount.value
      }
    })

    const incomingCards = Array.isArray(data?.cards) ? data.cards : []
    if (!incomingCards.length) throw new Error('AI did not return storyboard cards.')

    const normalizedCards = incomingCards.map((entry: any, index: number) => {
      const type = CARD_TYPES.includes(entry?.type) ? entry.type : 'Content'
      const row = Math.floor(index / 4)
      const col = index % 4
      const zig = row % 2 === 0 ? col : 3 - col
      const x = Number.isFinite(Number(entry?.x)) ? Number(entry.x) : 90 + zig * 340
      const y = Number.isFinite(Number(entry?.y)) ? Number(entry.y) : 80 + row * 260

      return createCard(type, x, y, {
        title: String(entry?.title || `${type} ${index + 1}`),
        onscreenHtml: textToHtml(String(entry?.onscreenText || entry?.onscreenHtml || '')),
        narrationHtml: textToHtml(String(entry?.narrationText || entry?.narrationHtml || '')),
        notesHtml: textToHtml(String(entry?.notesText || entry?.notesHtml || entry?.interactions || '')),
        duration: Math.max(20, Math.min(360, Number(entry?.duration || 60))),
        status: CARD_STATUSES.includes(entry?.status) ? entry.status : 'Draft',
        theme: CARD_THEMES.includes(entry?.theme) ? entry.theme : CARD_THEMES[index % CARD_THEMES.length],
        layout: CARD_LAYOUTS.includes(entry?.layout) ? entry.layout : CARD_LAYOUTS[index % CARD_LAYOUTS.length]
      })
    })

    const resolvedConnections = normalizeConnections(data?.connections, normalizedCards)

    projectTitle.value = String(data?.title || projectTitle.value)
    projectSummary.value = String(data?.summary || '')
    objectives.value = Array.isArray(data?.learningObjectives) ? data.learningObjectives.map((item: any) => String(item)).slice(0, 8) : []
    cards.value = normalizedCards
    connections.value = resolvedConnections.length ? resolvedConnections : buildLinearConnections(normalizedCards)
    selectedCardId.value = normalizedCards[0]?.id || ''
  } catch (e: any) {
    error.value = e?.data?.message ?? e?.message ?? 'Something went wrong while generating cards.'
  } finally {
    pending.value = false
  }
}

function normalizeConnections(rawLinks: any, normalizedCards: StoryCard[]) {
  if (!Array.isArray(rawLinks)) return []

  return rawLinks
    .map((link: any) => {
      const fromId = resolveCardId(link?.fromId, link?.fromIndex, normalizedCards)
      const toId = resolveCardId(link?.toId, link?.toIndex, normalizedCards)
      if (!fromId || !toId || fromId === toId) return null
      return makeConnection(fromId, toId, String(link?.label || 'Next'))
    })
    .filter(Boolean) as CardConnection[]
}

function resolveCardId(rawId: unknown, rawIndex: unknown, normalizedCards: StoryCard[]) {
  if (typeof rawId === 'string' && normalizedCards.some(card => card.id === rawId)) return rawId
  const asNum = Number(rawIndex)
  if (!Number.isFinite(asNum)) return ''
  const zeroBased = asNum > 0 ? asNum - 1 : asNum
  return normalizedCards[zeroBased]?.id || ''
}

function buildLinearConnections(list: StoryCard[]) {
  return list.slice(1).map((card, idx) => makeConnection(list[idx].id, card.id, 'Next'))
}

async function assistCard(field: EditableField, instruction: string) {
  if (!enableAi.value || !selectedCard.value || aiPending.value) return
  aiPending.value = true
  aiError.value = ''

  try {
    const data = await $fetch<AiCardAssistResponse>('/api/storyforge', {
      method: 'POST',
      body: {
        mode: 'card-assist',
        field,
        instruction,
        tone: tone.value,
        audience: audience.value,
        card: {
          title: selectedCard.value.title,
          type: selectedCard.value.type,
          onscreenText: htmlToText(selectedCard.value.onscreenHtml),
          narrationText: htmlToText(selectedCard.value.narrationHtml),
          notesText: htmlToText(selectedCard.value.notesHtml)
        }
      }
    })

    if (!selectedCard.value) return
    selectedCard.value[data.field] = textToHtml(data.content || '')
    activeEditorField.value = data.field
    aiSuggestions.value = Array.isArray(data.suggestions) ? data.suggestions.slice(0, 4) : []
  } catch (e: any) {
    aiError.value = e?.data?.message ?? e?.message ?? 'AI assist failed. You can keep editing manually.'
  } finally {
    aiPending.value = false
  }
}

function applySuggestion(suggestion: string) {
  if (!selectedCard.value) return
  const targetField = activeEditorField.value
  const previous = htmlToText(selectedCard.value[targetField])
  selectedCard.value[targetField] = textToHtml(`${previous}\n${suggestion}`.trim())
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
      chunks.push(`\n\n--- ${file.name} (PDF extraction) ---\n${text}`)
      uploadNote.value = 'PDF text was extracted with a lightweight fallback. Review before generation.'
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

    if (Array.isArray(data?.cards) && data.cards.length) {
      const importedCards = data.cards.map((entry: any, index: number) => {
        const type = CARD_TYPES.includes(entry?.type) ? entry.type : 'Content'
        return createCard(type, Number(entry?.x ?? 90 + (index % 4) * 340), Number(entry?.y ?? 80 + Math.floor(index / 4) * 260), {
          id: typeof entry?.id === 'string' && entry.id ? entry.id : uid('card'),
          title: String(entry?.title || `${type} ${index + 1}`),
          onscreenHtml: sanitizeHtml(String(entry?.onscreenHtml || textToHtml(entry?.onscreenText || ''))),
          narrationHtml: sanitizeHtml(String(entry?.narrationHtml || textToHtml(entry?.narrationText || ''))),
          notesHtml: sanitizeHtml(String(entry?.notesHtml || textToHtml(entry?.notesText || ''))),
          duration: Math.max(20, Math.min(360, Number(entry?.duration || 60))),
          status: CARD_STATUSES.includes(entry?.status) ? entry.status : 'Draft',
          theme: CARD_THEMES.includes(entry?.theme) ? entry.theme : 'Glass',
          layout: CARD_LAYOUTS.includes(entry?.layout) ? entry.layout : 'Stack'
        })
      })

      const importedConnections = normalizeConnections(data?.connections, importedCards)
      cards.value = importedCards
      connections.value = importedConnections.length ? importedConnections : buildLinearConnections(importedCards)
    } else {
      const scenes = Array.isArray(data?.screens) ? data.screens : Array.isArray(data?.scenes) ? data.scenes : []
      const importedCards = scenes.map((scene: any, index: number) => createCard('Content', 90 + (index % 4) * 340, 80 + Math.floor(index / 4) * 260, {
        title: String(scene?.title || `Scene ${index + 1}`),
        onscreenHtml: textToHtml(String(scene?.visualDescription || '')),
        narrationHtml: textToHtml(String(scene?.narration || '')),
        notesHtml: textToHtml(String(scene?.interactions || scene?.navigation || '')),
        duration: Math.max(20, Math.min(360, Number(scene?.duration || 60))),
        status: CARD_STATUSES.includes(scene?.status) ? scene.status : 'Draft',
        theme: CARD_THEMES[index % CARD_THEMES.length],
        layout: CARD_LAYOUTS[index % CARD_LAYOUTS.length]
      }))
      cards.value = importedCards
      connections.value = buildLinearConnections(importedCards)
    }

    projectTitle.value = String(data?.title || 'Imported Storyboard')
    projectSummary.value = String(data?.summary || '')
    objectives.value = Array.isArray(data?.learningObjectives)
      ? data.learningObjectives.map((item: any) => String(item))
      : Array.isArray(data?.objectives)
        ? data.objectives.map((item: any) => String(item))
        : []

    selectedCardId.value = cards.value[0]?.id || ''
  } catch {
    error.value = 'Could not import that project file.'
  }

  ;(e.target as HTMLInputElement).value = ''
}

function safeName(name: string) {
  return name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'storyboard'
}

function exportSBF() {
  const project = {
    version: '3.0',
    title: projectTitle.value,
    summary: projectSummary.value,
    learningObjectives: objectives.value,
    created: new Date().toISOString(),
    cards: cards.value,
    connections: connections.value
  }

  saveAs(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), `${safeName(projectTitle.value)}.sbf`)
  showExportMenu.value = false
}

async function exportPPTX() {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'
  pptx.author = 'EnterTrainer StoryForge'
  pptx.title = projectTitle.value

  const cover = pptx.addSlide()
  cover.addText(projectTitle.value, { x: 0.45, y: 0.45, w: 12.5, fontSize: 30, bold: true })
  cover.addText(projectSummary.value || 'Adaptive storyboard generated in StoryForge.', { x: 0.45, y: 1.3, w: 12.2, h: 1.2, fontSize: 13, color: '666666' })
  if (objectives.value.length) {
    cover.addText(`Objectives:\n${objectives.value.map(item => `• ${item}`).join('\n')}`, { x: 0.5, y: 2.2, w: 12.0, h: 2.4, fontSize: 12 })
  }

  const flow = pptx.addSlide()
  flow.addText('Branching Map', { x: 0.45, y: 0.45, w: 12.0, fontSize: 24, bold: true })
  const mapText = connections.value.map((link) => {
    const from = cards.value.find(card => card.id === link.fromId)
    const to = cards.value.find(card => card.id === link.toId)
    return `• ${from?.title || link.fromId}  --${link.label}-->  ${to?.title || link.toId}`
  }).join('\n') || '• No explicit branches defined.'
  flow.addText(mapText, { x: 0.55, y: 1.2, w: 12.0, h: 5.8, fontSize: 12 })

  cards.value.forEach((card, index) => {
    const slide = pptx.addSlide()
    slide.addText(`${String(index + 1).padStart(2, '0')} • ${card.type}: ${card.title}`, { x: 0.45, y: 0.3, w: 12.5, fontSize: 22, bold: true })
    slide.addText(`Theme: ${card.theme}   Layout: ${card.layout}   Status: ${card.status}   Duration: ${card.duration}s`, { x: 0.55, y: 0.9, w: 12.0, fontSize: 10, color: '555555' })
    slide.addText(`On-screen text\n${htmlToText(card.onscreenHtml) || '—'}`, { x: 0.55, y: 1.4, w: 6.0, h: 2.8, fontSize: 11 })
    slide.addText(`Narration\n${htmlToText(card.narrationHtml) || '—'}`, { x: 6.85, y: 1.4, w: 5.8, h: 2.8, fontSize: 11 })
    slide.addText(`Interactions / Notes\n${htmlToText(card.notesHtml) || '—'}`, { x: 0.55, y: 4.35, w: 12.0, h: 1.7, fontSize: 10 })

    const outgoing = connections.value.filter(link => link.fromId === card.id)
    const branchText = outgoing.length
      ? outgoing.map(link => {
        const target = cards.value.find(entry => entry.id === link.toId)
        return `• ${link.label}: ${target?.title || 'Unknown target'}`
      }).join('\n')
      : '• No outgoing branch.'
    slide.addText(`Branches\n${branchText}`, { x: 0.55, y: 6.2, w: 12.0, h: 1.0, fontSize: 10, color: '444444' })
  })

  await pptx.writeFile({ fileName: `${safeName(projectTitle.value)}.pptx` })
  showExportMenu.value = false
}

function exportPDF() {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  doc.setFontSize(19)
  doc.text(projectTitle.value, 44, 52)
  doc.setFontSize(11)
  doc.text(doc.splitTextToSize(projectSummary.value || 'Adaptive storyboard export', 500), 44, 74)

  let y = 120
  cards.value.forEach((card, index) => {
    if (y > 740) {
      doc.addPage()
      y = 52
    }

    doc.setFontSize(13)
    doc.text(`${index + 1}. ${card.type} • ${card.title}`, 44, y)
    doc.setFontSize(10)
    doc.text(`Theme ${card.theme} | Layout ${card.layout} | ${card.duration}s | ${card.status}`, 44, y + 14)
    doc.text(doc.splitTextToSize(`On-screen: ${htmlToText(card.onscreenHtml) || '—'}`, 500), 44, y + 30)
    doc.text(doc.splitTextToSize(`Narration: ${htmlToText(card.narrationHtml) || '—'}`, 500), 44, y + 52)
    doc.text(doc.splitTextToSize(`Notes: ${htmlToText(card.notesHtml) || '—'}`, 500), 44, y + 74)

    const outgoing = connections.value.filter(link => link.fromId === card.id)
    const branchLine = outgoing.length
      ? outgoing.map(link => {
        const target = cards.value.find(entry => entry.id === link.toId)
        return `${link.label} → ${target?.title || 'Unknown'}`
      }).join(' | ')
      : 'No outgoing branch'
    doc.text(doc.splitTextToSize(`Branches: ${branchLine}`, 500), 44, y + 96)
    y += 138
  })

  doc.addPage()
  doc.setFontSize(16)
  doc.text('Branch Map', 44, 52)
  doc.setFontSize(10)
  const map = connections.value.map(link => {
    const from = cards.value.find(card => card.id === link.fromId)
    const to = cards.value.find(card => card.id === link.toId)
    return `• ${from?.title || link.fromId} --${link.label}--> ${to?.title || link.toId}`
  }).join('\n') || '• No branches defined.'
  doc.text(doc.splitTextToSize(map, 500), 44, 78)

  doc.save(`${safeName(projectTitle.value)}.pdf`)
  showExportMenu.value = false
}

function newProject() {
  projectTitle.value = 'Adaptive Learning Storyboard'
  projectSummary.value = ''
  objectives.value = []
  cards.value = []
  connections.value = []
  rawSource.value = ''
  aiSuggestions.value = []
  aiError.value = ''
  error.value = ''
  seedProject()
}

const outgoingConnections = computed(() => {
  if (!selectedCard.value) return []
  return connections.value.filter(link => link.fromId === selectedCard.value?.id)
})
</script>

<template>
  <UiToolShell
    wide
    eyebrow="Web App"
    title="StoryForge"
    deck="Canvas-first branching storyboard builder. Add typed cards, connect learning paths, polish with optional Groq co-pilot, and export branch-aware outputs."
  >
    <section class="sf-control-grid">
      <div class="glass-panel sf-input" :class="{ 'sf-input--loading': pending }">
        <div v-if="pending" class="sf-loading">
          <div class="sf-spinner" />
          <p class="sf-loading-title">Designing your card graph...</p>
          <p class="sf-muted">Groq is producing structured cards and branch links while preserving your source facts.</p>
        </div>

        <form v-else @submit.prevent="generateWithGroq">
          <div class="sf-row">
            <label class="glass-chip sf-file">Upload source files<input type="file" multiple accept=".pdf,.txt,.md,.csv,.json,.doc,.docx,text/*,application/pdf" @change="importSource"></label>
            <label class="glass-chip sf-file">Import .sbf / json<input type="file" accept=".sbf,.json" @change="importProject"></label>
          </div>

          <p v-if="uploadNote" class="glass-note">{{ uploadNote }}</p>

          <label class="glass-label" for="sf-raw">Raw source material</label>
          <textarea id="sf-raw" v-model="rawSource" class="glass-field sf-raw" placeholder="Paste raw SME notes, scripts, brief docs, transcripts, or messy outlines." />

          <div class="sf-controls">
            <div>
              <label class="glass-label">Audience</label>
              <input v-model="audience" class="glass-field" placeholder="e.g. new supervisors">
            </div>
            <div>
              <label class="glass-label">Format</label>
              <select v-model="modality" class="glass-field glass-select">
                <option>eLearning storyboard</option>
                <option>Scenario-based module</option>
                <option>Facilitator-led workshop</option>
                <option>Microlearning sequence</option>
              </select>
            </div>
            <div>
              <label class="glass-label">Cards</label>
              <input v-model.number="cardCount" class="glass-field" min="4" max="24" type="number">
            </div>
          </div>

          <label class="glass-label">Tone / design direction</label>
          <input v-model="tone" class="glass-field" placeholder="clear, practical, learner-centered">

          <div class="sf-row sf-ai-row">
            <label class="sf-ai-toggle"><input v-model="enableAi" type="checkbox"> Enable AI co-pilot (optional)</label>
            <button class="glass-btn sf-generate" :disabled="!canGenerate">Generate card graph with Groq</button>
          </div>
        </form>
      </div>

      <aside class="glass-panel sf-meta">
        <input v-model="projectTitle" class="sf-title" placeholder="Untitled Storyboard">
        <p class="sf-muted">{{ cards.length }} cards • {{ connections.length }} links • Est. {{ totalDuration }} min</p>
        <p v-if="projectSummary" class="sf-summary">{{ projectSummary }}</p>

        <div v-if="objectives.length">
          <span class="glass-label">Learning objectives</span>
          <ul>
            <li v-for="objective in objectives" :key="objective">{{ objective }}</li>
          </ul>
        </div>

        <div>
          <span class="glass-label">Quick add cards</span>
          <div class="sf-chip-row">
            <button v-for="type in CARD_TYPES" :key="type" class="glass-chip" type="button" @click="addCard(type)">+ {{ type }}</button>
          </div>
        </div>

        <div class="sf-actions">
          <button class="glass-btn glass-btn--ghost" type="button" @click="newProject">New</button>
          <div class="sf-export">
            <button class="glass-btn" type="button" @click="showExportMenu = !showExportMenu">Export ↓</button>
            <div v-if="showExportMenu" class="glass-panel sf-menu">
              <button type="button" @click="exportSBF">Project .sbf</button>
              <button type="button" @click="exportPPTX">Branch-aware PPTX</button>
              <button type="button" @click="exportPDF">Branch-aware PDF</button>
            </div>
          </div>
        </div>
      </aside>
    </section>

    <p v-if="error" class="glass-note glass-note--error sf-error">{{ error }}</p>

    <section class="sf-workspace-wrap">
      <div class="glass-panel sf-canvas-panel">
        <div class="sf-canvas-hint">
          <span class="glass-label">Workspace canvas</span>
          <p>Drag cards, start connection mode, and click a target card to branch.</p>
        </div>

        <div class="sf-canvas-scroll">
          <div
            ref="surfaceRef"
            class="sf-surface"
            :style="{ width: `${surfaceSize.width}px`, height: `${surfaceSize.height}px` }"
            @pointerdown="onSurfacePointerDown"
          >
            <svg class="sf-links" :viewBox="`0 0 ${surfaceSize.width} ${surfaceSize.height}`" preserveAspectRatio="none">
              <defs>
                <marker id="sf-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
                </marker>
              </defs>

              <g v-for="path in connectionPaths" :key="path.id" class="sf-link-group">
                <path :d="path.d" class="sf-link" marker-end="url(#sf-arrow)" />
                <rect :x="path.lx - 60" :y="path.ly - 14" width="120" height="22" rx="11" class="sf-link-label-bg" />
                <text :x="path.lx" :y="path.ly + 1" class="sf-link-label">{{ path.label }}</text>
              </g>

              <path v-if="draftPath" :d="draftPath" class="sf-link sf-link--draft" marker-end="url(#sf-arrow)" />
            </svg>

            <article
              v-for="card in cards"
              :key="card.id"
              class="glass-panel sf-node"
              :class="[
                `sf-node--${card.theme.toLowerCase()}`,
                `sf-node--${card.layout.toLowerCase()}`,
                { 'sf-node--active': selectedCardId === card.id }
              ]"
              :style="{ left: `${card.x}px`, top: `${card.y}px` }"
              @click.stop="selectCard(card.id)"
            >
              <header class="sf-node-top" @pointerdown.stop.prevent="beginDrag(card.id, $event)">
                <span>{{ card.type }}</span>
                <span>{{ card.duration }}s</span>
              </header>

              <h3>{{ card.title || 'Untitled Card' }}</h3>
              <p>{{ htmlToText(card.onscreenHtml) || 'No on-screen text yet.' }}</p>

              <div class="sf-node-meta">
                <span class="glass-chip">{{ card.status }}</span>
                <button class="glass-chip sf-connect-btn" type="button" @pointerdown.stop.prevent="startConnect(card.id, $event)" @click.stop>Connect</button>
              </div>
            </article>

            <div v-if="connectionDraft" class="glass-panel sf-connect-overlay">
              <span class="glass-label">Connection label</span>
              <select v-model="connectionDraft.label" class="glass-field glass-select">
                <option v-for="label in CONNECTION_LABELS" :key="label">{{ label }}</option>
              </select>
              <p class="sf-muted">Click a target card to complete the branch.</p>
              <button class="glass-chip" type="button" @click="cancelConnect">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <aside v-if="selectedCard" class="glass-panel sf-editor">
        <div class="sf-editor-head">
          <strong>Edit card</strong>
          <div class="sf-row">
            <button class="glass-chip" type="button" @click="duplicateSelectedCard">Duplicate</button>
            <button class="glass-chip sf-delete" type="button" @click="deleteSelectedCard">Delete</button>
          </div>
        </div>

        <label class="glass-label">Card title</label>
        <input v-model="selectedCard.title" class="glass-field">

        <div class="sf-controls sf-controls--editor">
          <div>
            <label class="glass-label">Card type</label>
            <select v-model="selectedCard.type" class="glass-field glass-select">
              <option v-for="type in CARD_TYPES" :key="type">{{ type }}</option>
            </select>
          </div>
          <div>
            <label class="glass-label">Status</label>
            <select v-model="selectedCard.status" class="glass-field glass-select">
              <option v-for="status in CARD_STATUSES" :key="status">{{ status }}</option>
            </select>
          </div>
          <div>
            <label class="glass-label">Duration (sec)</label>
            <input v-model.number="selectedCard.duration" class="glass-field" type="number" min="20" max="360">
          </div>
        </div>

        <div class="sf-row sf-theme-tools">
          <div>
            <span class="glass-label">Theme</span>
            <div class="sf-chip-row">
              <button v-for="theme in CARD_THEMES" :key="theme" class="glass-chip" :class="{ 'sf-chip--active': selectedCard.theme === theme }" type="button" @click="applyTheme(theme)">{{ theme }}</button>
            </div>
          </div>
          <div>
            <span class="glass-label">Layout</span>
            <div class="sf-chip-row">
              <button v-for="layout in CARD_LAYOUTS" :key="layout" class="glass-chip" :class="{ 'sf-chip--active': selectedCard.layout === layout }" type="button" @click="applyLayout(layout)">{{ layout }}</button>
            </div>
          </div>
        </div>

        <div class="sf-editor-toolbar">
          <button class="glass-chip" type="button" @click="execEditorCommand('bold')">Bold</button>
          <button class="glass-chip" type="button" @click="execEditorCommand('italic')">Italic</button>
          <button class="glass-chip" type="button" @click="execEditorCommand('insertUnorderedList')">Bullets</button>
          <button class="glass-chip" type="button" @click="execEditorCommand('insertOrderedList')">Numbered</button>
          <button class="glass-chip" type="button" @click="execEditorCommand('removeFormat')">Clear</button>
        </div>

        <label class="glass-label">On-screen text (WYSIWYG)</label>
        <div
          class="glass-field sf-wysiwyg"
          contenteditable="true"
          :key="`${selectedCard.id}-onscreen`"
          v-html="selectedCard.onscreenHtml"
          @focus="activeEditorField = 'onscreenHtml'"
          @input="updateCardField('onscreenHtml', $event)"
          @paste="pastePlain"
        />

        <label class="glass-label">Narration (WYSIWYG)</label>
        <div
          class="glass-field sf-wysiwyg"
          contenteditable="true"
          :key="`${selectedCard.id}-narration`"
          v-html="selectedCard.narrationHtml"
          @focus="activeEditorField = 'narrationHtml'"
          @input="updateCardField('narrationHtml', $event)"
          @paste="pastePlain"
        />

        <label class="glass-label">Interactions / notes (WYSIWYG)</label>
        <div
          class="glass-field sf-wysiwyg"
          contenteditable="true"
          :key="`${selectedCard.id}-notes`"
          v-html="selectedCard.notesHtml"
          @focus="activeEditorField = 'notesHtml'"
          @input="updateCardField('notesHtml', $event)"
          @paste="pastePlain"
        />

        <div class="sf-ai-panel" v-if="enableAi">
          <div class="sf-row">
            <span class="glass-label">AI toolbar (optional)</span>
            <span class="sf-muted" v-if="aiPending">Working...</span>
          </div>

          <div class="sf-chip-row">
            <button class="glass-chip" type="button" :disabled="aiPending" @click="assistCard('onscreenHtml', 'Rewrite for concise on-screen text with high scannability.')">Polish on-screen text</button>
            <button class="glass-chip" type="button" :disabled="aiPending" @click="assistCard('narrationHtml', 'Rewrite narration to be natural, crisp, and instructionally clear.')">Rewrite narration</button>
            <button class="glass-chip" type="button" :disabled="aiPending" @click="assistCard('notesHtml', 'Add richer interaction cues and feedback logic.')">Enhance interactions</button>
          </div>

          <p v-if="aiError" class="glass-note glass-note--error">{{ aiError }}</p>
          <div v-if="aiSuggestions.length">
            <span class="glass-label">Suggested additions</span>
            <div class="sf-chip-row">
              <button v-for="(suggestion, idx) in aiSuggestions" :key="idx" class="glass-chip" type="button" @click="applySuggestion(suggestion)">{{ suggestion }}</button>
            </div>
          </div>
        </div>

        <div>
          <span class="glass-label">Outgoing branches</span>
          <div v-if="outgoingConnections.length" class="sf-branch-list">
            <div v-for="link in outgoingConnections" :key="link.id" class="sf-branch-row">
              <input v-model="link.label" class="glass-field" maxlength="40">
              <select v-model="link.toId" class="glass-field glass-select">
                <option v-for="card in cards" :key="card.id" :value="card.id">{{ card.title || card.type }}</option>
              </select>
              <button class="glass-chip" type="button" @click="deleteConnection(link.id)">Remove</button>
            </div>
          </div>
          <p v-else class="sf-muted">No outgoing branch links from this card.</p>
        </div>
      </aside>
    </section>
  </UiToolShell>
</template>

<style scoped>
.sf-control-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320rem, 0.75fr);
  gap: 18rem;
  margin-bottom: 18rem;
}
.sf-input,
.sf-meta,
.sf-editor {
  display: flex;
  flex-direction: column;
  gap: 14rem;
}
.sf-row,
.sf-actions,
.sf-editor-head,
.sf-node-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rem;
  flex-wrap: wrap;
}
.sf-file {
  position: relative;
  overflow: hidden;
}
.sf-file input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.sf-raw {
  min-height: 200rem;
  resize: vertical;
}
.sf-controls {
  display: grid;
  grid-template-columns: 1fr 1fr 120rem;
  gap: 12rem;
}
.sf-controls--editor {
  grid-template-columns: 1fr 1fr 120rem;
}
.sf-ai-row {
  margin-top: 10rem;
}
.sf-ai-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8rem;
  font-size: 13rem;
  opacity: 0.8;
}
.sf-generate {
  margin-left: auto;
}
.sf-title {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--color-text);
  font: 700 30rem/1.1 var(--main-font);
  letter-spacing: -0.04em;
  outline: none;
}
.sf-muted,
.sf-summary,
.sf-meta li {
  color: var(--color-text);
  opacity: 0.7;
  font-size: 13rem;
  line-height: 1.5;
}
.sf-meta ul {
  padding-left: 18rem;
  display: grid;
  gap: 6rem;
}
.sf-chip-row {
  display: flex;
  gap: 8rem;
  flex-wrap: wrap;
}
.sf-export {
  position: relative;
}
.sf-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8rem);
  min-width: 210rem;
  padding: 8rem;
  z-index: 8;
}
.sf-menu button {
  display: block;
  width: 100%;
  padding: 10rem 12rem;
  border-radius: 10rem;
  text-align: left;
  font-size: 13rem;
}
.sf-workspace-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400rem;
  gap: 18rem;
  align-items: start;
}
.sf-canvas-panel {
  padding: 14rem;
  gap: 12rem;
  display: flex;
  flex-direction: column;
}
.sf-canvas-hint p {
  font-size: 13rem;
  line-height: 1.45;
  opacity: 0.7;
}
.sf-canvas-scroll {
  overflow: auto;
  border-radius: 16rem;
  border: 1rem solid color-mix(in srgb, var(--color-glass-border) 80%, transparent);
  background:
    radial-gradient(circle at 10% -20%, color-mix(in srgb, var(--color-accent) 22%, transparent), transparent 52%),
    radial-gradient(circle at 90% 120%, color-mix(in srgb, var(--color-accent) 14%, transparent), transparent 50%),
    linear-gradient(180deg, color-mix(in srgb, var(--color-glass-bg) 88%, transparent), transparent 75%);
}
.sf-surface {
  position: relative;
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--color-glass-border) 50%, transparent) 1rem, transparent 1rem),
    linear-gradient(to bottom, color-mix(in srgb, var(--color-glass-border) 50%, transparent) 1rem, transparent 1rem);
  background-size: 32rem 32rem;
}
.sf-links {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  color: color-mix(in srgb, var(--color-text) 72%, transparent);
}
.sf-link {
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  opacity: 0.9;
}
.sf-link--draft {
  stroke-dasharray: 8 6;
  opacity: 0.8;
}
.sf-link-label-bg {
  fill: color-mix(in srgb, var(--color-bg) 82%, transparent);
  stroke: color-mix(in srgb, var(--color-glass-border-hover) 75%, transparent);
  stroke-width: 1;
}
.sf-link-label {
  fill: var(--color-text);
  font-size: 11rem;
  font-weight: 600;
  dominant-baseline: middle;
  text-anchor: middle;
}
.sf-node {
  position: absolute;
  width: 292rem;
  min-height: 228rem;
  padding: 14rem;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 10rem;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.sf-node:hover {
  transform: translateY(-2rem);
}
.sf-node--active {
  border-color: var(--color-glass-border-hover);
  box-shadow: 0 0 0 2rem color-mix(in srgb, var(--color-text) 22%, transparent), 0 28rem 68rem -42rem rgba(0, 0, 0, 0.7);
}
.sf-node-top {
  display: flex;
  justify-content: space-between;
  font-size: 11rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.6;
  cursor: grab;
}
.sf-node h3 {
  font-size: 20rem;
  line-height: 1.12;
}
.sf-node p {
  font-size: 13rem;
  line-height: 1.5;
  opacity: 0.75;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-line;
}
.sf-connect-btn {
  color: color-mix(in srgb, var(--color-text) 88%, transparent);
}
.sf-node--glass {
  background: color-mix(in srgb, var(--color-glass-bg) 92%, transparent);
}
.sf-node--slate {
  background: color-mix(in srgb, #1f314f 38%, var(--color-glass-bg));
}
.sf-node--aurora {
  background: linear-gradient(145deg, color-mix(in srgb, #28586f 34%, var(--color-glass-bg)), color-mix(in srgb, #2f466b 26%, var(--color-glass-bg)));
}
.sf-node--sunrise {
  background: linear-gradient(145deg, color-mix(in srgb, #7d4d35 30%, var(--color-glass-bg)), color-mix(in srgb, #4e516f 24%, var(--color-glass-bg)));
}
.sf-node--split p {
  columns: 2;
  column-gap: 14rem;
  -webkit-line-clamp: unset;
  max-height: 96rem;
}
.sf-node--focus h3 {
  font-size: 22rem;
}
.sf-connect-overlay {
  position: absolute;
  right: 16rem;
  bottom: 16rem;
  width: 280rem;
  padding: 12rem;
  z-index: 5;
  display: grid;
  gap: 8rem;
}
.sf-editor {
  position: sticky;
  top: 24rem;
}
.sf-delete {
  color: #ff8d8d;
}
.sf-theme-tools {
  align-items: flex-start;
}
.sf-chip--active {
  border-color: var(--color-glass-border-hover);
}
.sf-editor-toolbar {
  display: flex;
  gap: 8rem;
  flex-wrap: wrap;
}
.sf-wysiwyg {
  min-height: 96rem;
  line-height: 1.45;
  outline: none;
  overflow-y: auto;
}
.sf-ai-panel {
  display: grid;
  gap: 10rem;
  padding: 10rem;
  border-radius: 12rem;
  border: 1rem solid color-mix(in srgb, var(--color-glass-border) 75%, transparent);
  background: color-mix(in srgb, var(--color-glass-bg) 80%, transparent);
}
.sf-branch-list {
  display: grid;
  gap: 8rem;
}
.sf-branch-row {
  display: grid;
  grid-template-columns: minmax(90rem, 120rem) minmax(0, 1fr) auto;
  gap: 8rem;
}
.sf-error {
  margin: 0 0 18rem;
}
.sf-loading {
  min-height: 340rem;
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
  gap: 14rem;
}
.sf-loading-title {
  font-size: 22rem;
  font-weight: 700;
}
.sf-spinner {
  width: 42rem;
  height: 42rem;
  border-radius: 999px;
  border: 3rem solid var(--color-spinner-track);
  border-top-color: var(--color-text);
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 1160px) {
  .sf-workspace-wrap {
    grid-template-columns: 1fr;
  }
  .sf-editor {
    position: static;
  }
}
@media (max-width: 900px) {
  .sf-control-grid {
    grid-template-columns: 1fr;
  }
  .sf-controls,
  .sf-controls--editor {
    grid-template-columns: 1fr;
  }
  .sf-node {
    width: 248rem;
    min-height: 212rem;
  }
  .sf-branch-row {
    grid-template-columns: 1fr;
  }
}
</style>
