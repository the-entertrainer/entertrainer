<script setup lang="ts">
import { saveAs } from 'file-saver'
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from 'docx'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

type CardType = 'title' | 'section' | 'video' | 'content' | 'objectives' | 'mcq' | 'summary' | 'end'

type McqOption = { text: string, correct: boolean, feedback: string }

type StoryCard = {
  id: string
  type: CardType
  number: number
  title: string
  body: string
  notes: string
  x: number
  y: number
  objectives: string[]
  options: McqOption[]
  connections: { to: string, label: string }[]
}

type CardDef = { type: CardType, label: string, hint: string, color: string, key: string }

const CARD_DEFS: CardDef[] = [
  { type: 'title', label: 'Title Screen', hint: 'Course/module opener', color: '#243F6A', key: 'T' },
  { type: 'section', label: 'Section Divider', hint: 'Module or topic break', color: '#6A3F24', key: 'S' },
  { type: 'video', label: 'Fullscreen Video', hint: 'Immersive video content', color: '#3F6A24', key: 'V' },
  { type: 'content', label: 'Text & Image Content', hint: 'Standard content slide', color: '#4A4A4A', key: 'C' },
  { type: 'objectives', label: 'Learning Objectives', hint: 'Set expectations', color: '#6A2450', key: 'O' },
  { type: 'mcq', label: 'MCQ Slide', hint: 'Knowledge check', color: '#9A6A00', key: 'Q' },
  { type: 'summary', label: 'Summary Slide', hint: 'Reinforce takeaways', color: '#245A6A', key: 'U' },
  { type: 'end', label: 'Thank You / End', hint: 'Course closer', color: '#5A2460', key: 'Y' }
]
const defByType = (type: CardType) => CARD_DEFS.find(d => d.type === type)!

const projectTitle = ref('New Storyboard Project')
const cards = ref<StoryCard[]>([])
const selectedId = ref<string | null>(null)
const nextNumber = ref(1)
const showExportMenu = ref(false)

// Canvas view state (pan / zoom)
const pan = ref({ x: 60, y: 40 })
const zoom = ref(1)
const canvasRef = ref<HTMLElement | null>(null)
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0, px: 0, py: 0 })

const draggingCard = ref<string | null>(null)
const dragOffset = ref({ x: 0, y: 0 })

const selectedCard = computed(() => cards.value.find(c => c.id === selectedId.value) ?? null)

onMounted(() => {
  if (!cards.value.length) addCard('title', 40, 40)
})

function makeCard(type: CardType, x: number, y: number): StoryCard {
  const def = defByType(type)
  return {
    id: `c${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    number: nextNumber.value++,
    title: def.label,
    body: '',
    notes: '',
    x,
    y,
    objectives: type === 'objectives' ? ['Objective one', 'Objective two', 'Objective three'] : [],
    options: type === 'mcq' ? [
      { text: 'Option A', correct: true, feedback: '' },
      { text: 'Option B', correct: false, feedback: '' }
    ] : [],
    connections: []
  }
}

function addCard(type: CardType, x?: number, y?: number) {
  const posX = x ?? (140 + (cards.value.length % 4) * 40)
  const posY = y ?? (120 + Math.floor(cards.value.length / 4) * 40)
  const card = makeCard(type, posX, posY)
  cards.value.push(card)
  selectedId.value = card.id
  return card
}

function duplicateCard() {
  const src = selectedCard.value
  if (!src) return
  const clone: StoryCard = JSON.parse(JSON.stringify(src))
  clone.id = `c${Date.now()}-${Math.random().toString(16).slice(2)}`
  clone.number = nextNumber.value++
  clone.x += 32
  clone.y += 32
  clone.connections = []
  cards.value.push(clone)
  selectedId.value = clone.id
}

function deleteCard() {
  if (!selectedCard.value) return
  const id = selectedCard.value.id
  cards.value = cards.value.filter(c => c.id !== id)
  cards.value.forEach(c => { c.connections = c.connections.filter(conn => conn.to !== id) })
  selectedId.value = null
}

function selectCard(id: string) { selectedId.value = id }

// ── Connections ──
function addConnection() {
  if (!selectedCard.value) return
  const target = cards.value.find(c => c.id !== selectedCard.value!.id)
  if (!target) return
  selectedCard.value.connections.push({ to: target.id, label: '' })
}
function removeConnection(index: number) {
  selectedCard.value?.connections.splice(index, 1)
}
function cardById(id: string) { return cards.value.find(c => c.id === id) }

const connectionLines = computed(() => {
  const lines: { x1: number, y1: number, x2: number, y2: number, label: string, key: string }[] = []
  for (const card of cards.value) {
    for (const conn of card.connections) {
      const target = cardById(conn.to)
      if (!target) continue
      lines.push({
        x1: card.x + CARD_W / 2,
        y1: card.y + CARD_H,
        x2: target.x + CARD_W / 2,
        y2: target.y,
        label: conn.label,
        key: `${card.id}-${conn.to}`
      })
    }
  }
  return lines
})

const CARD_W = 220
const CARD_H = 150

// ── Canvas pan & zoom ──
function onCanvasMouseDown(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('.sg-card')) return
  isPanning.value = true
  panStart.value = { x: e.clientX, y: e.clientY, px: pan.value.x, py: pan.value.y }
  selectedId.value = null
}
function onCanvasMouseMove(e: MouseEvent) {
  if (isPanning.value) {
    pan.value = { x: panStart.value.px + (e.clientX - panStart.value.x), y: panStart.value.py + (e.clientY - panStart.value.y) }
  } else if (draggingCard.value) {
    const card = cardById(draggingCard.value)
    if (!card) return
    const rect = canvasRef.value?.getBoundingClientRect()
    if (!rect) return
    card.x = (e.clientX - rect.left - pan.value.x) / zoom.value - dragOffset.value.x
    card.y = (e.clientY - rect.top - pan.value.y) / zoom.value - dragOffset.value.y
  }
}
function onCanvasMouseUp() { isPanning.value = false; draggingCard.value = null }

function onCardMouseDown(e: MouseEvent, card: StoryCard) {
  e.stopPropagation()
  selectCard(card.id)
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  draggingCard.value = card.id
  dragOffset.value = {
    x: (e.clientX - rect.left - pan.value.x) / zoom.value - card.x,
    y: (e.clientY - rect.top - pan.value.y) / zoom.value - card.y
  }
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const factor = e.deltaY > 0 ? 0.92 : 1.08
  zoom.value = Math.min(2.5, Math.max(0.3, zoom.value * factor))
}
function zoomIn() { zoom.value = Math.min(2.5, zoom.value * 1.15) }
function zoomOut() { zoom.value = Math.max(0.3, zoom.value * 0.87) }
function fitToScreen() { pan.value = { x: 60, y: 40 }; zoom.value = 1 }

// ── Drag from library ──
function onLibraryDragStart(e: DragEvent, type: CardType) {
  e.dataTransfer?.setData('text/card-type', type)
}
function onCanvasDrop(e: DragEvent) {
  const type = e.dataTransfer?.getData('text/card-type') as CardType
  if (!type) return
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  const x = (e.clientX - rect.left - pan.value.x) / zoom.value - CARD_W / 2
  const y = (e.clientY - rect.top - pan.value.y) / zoom.value - CARD_H / 2
  addCard(type, x, y)
}

// ── Project management ──
function newProject() {
  projectTitle.value = 'New Storyboard Project'
  cards.value = []
  selectedId.value = null
  nextNumber.value = 1
  addCard('title', 40, 40)
  fitToScreen()
}

function exportProjectJSON() {
  const project = { version: '1.0', app: 'StoryGen', title: projectTitle.value, created: new Date().toISOString(), cards: cards.value }
  saveAs(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), `${safeName(projectTitle.value)}.storygen.json`)
  showExportMenu.value = false
}

async function importProject(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const data = JSON.parse(await file.text())
    projectTitle.value = data.title || 'Imported Project'
    cards.value = data.cards || []
    nextNumber.value = Math.max(1, ...cards.value.map((c: StoryCard) => c.number)) + 1
    selectedId.value = cards.value[0]?.id ?? null
  } catch { /* ignore malformed file */ }
  ;(e.target as HTMLInputElement).value = ''
}

function safeName(name: string) { return name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'storyboard' }

// ── Word (.docx) export — the primary deliverable ──
async function exportDocx() {
  const sorted = [...cards.value].sort((a, b) => a.number - b.number)

  const children: (Paragraph | Table)[] = []

  children.push(new Paragraph({
    text: projectTitle.value,
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER
  }))
  children.push(new Paragraph({
    children: [new TextRun({ text: `Storyboard report • ${sorted.length} screens • generated with StoryGen`, italics: true })],
    alignment: AlignmentType.CENTER
  }))
  children.push(new Paragraph({ text: '' }))

  for (const card of sorted) {
    const def = defByType(card.type)
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      text: `Screen ${card.number}: ${card.title || def.label}`
    }))
    children.push(new Paragraph({
      children: [new TextRun({ text: def.label, bold: true, color: '666666' })]
    }))

    const rows: TableRow[] = []
    rows.push(labelRow('On-screen text / content', card.body || '—'))

    if (card.type === 'objectives' && card.objectives.length) {
      rows.push(labelRow('Objectives', card.objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')))
    }
    if (card.type === 'mcq' && card.options.length) {
      const optionsText = card.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o.text}${o.correct ? '  [Correct]' : ''}${o.feedback ? `  — Feedback: ${o.feedback}` : ''}`).join('\n')
      rows.push(labelRow('Answer options', optionsText))
    }

    rows.push(labelRow('Developer notes', card.notes || '—'))

    const connectionsText = card.connections.length
      ? card.connections.map(conn => `→ Screen ${cardById(conn.to)?.number ?? '?'}: ${cardById(conn.to)?.title ?? 'Unknown'}${conn.label ? ` (${conn.label})` : ''}`).join('\n')
      : 'No outgoing connections'
    rows.push(labelRow('Connections', connectionsText))

    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }))
    children.push(new Paragraph({ text: '' }))
  }

  const doc = new Document({ sections: [{ children }] })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${safeName(projectTitle.value)}.docx`)
  showExportMenu.value = false
}

function labelRow(label: string, value: string) {
  return new TableRow({
    children: [
      new TableCell({ width: { size: 28, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })] }),
      new TableCell({ width: { size: 72, type: WidthType.PERCENTAGE }, children: value.split('\n').map(line => new Paragraph({ text: line })) })
    ]
  })
}
</script>

<template>
  <UiToolShell wide eyebrow="Web App" title="StoryGen" deck="An infinite canvas for instructional designers to build, connect, and hand off e-learning storyboards — no AI required, just clarity and speed.">
    <div class="sg-toolbar glass-panel">
      <input v-model="projectTitle" class="sg-title" placeholder="Untitled Storyboard">
      <div class="sg-toolbar-actions">
        <button class="glass-chip" @click="zoomOut">−</button>
        <span class="sg-zoom">{{ Math.round(zoom * 100) }}%</span>
        <button class="glass-chip" @click="zoomIn">+</button>
        <button class="glass-chip" @click="fitToScreen">Fit to screen</button>
        <button class="glass-chip" @click="newProject">New</button>
        <label class="glass-chip sg-file">Import<input type="file" accept=".json" @change="importProject"></label>
        <div class="sg-export">
          <button class="glass-btn" @click="showExportMenu = !showExportMenu">Export ↓</button>
          <div v-if="showExportMenu" class="glass-panel sg-menu">
            <button @click="exportDocx">Word document (.docx)</button>
            <button @click="exportProjectJSON">Project JSON</button>
          </div>
        </div>
      </div>
    </div>

    <section class="sg-grid">
      <aside class="glass-panel sg-library">
        <p class="glass-label">Card library</p>
        <button
          v-for="def in CARD_DEFS"
          :key="def.type"
          class="sg-lib-item"
          draggable="true"
          :style="{ '--accent': def.color }"
          @dragstart="onLibraryDragStart($event, def.type)"
          @click="addCard(def.type)"
        >
          <span class="sg-lib-dot" />
          <span class="sg-lib-text">
            <strong>{{ def.label }}</strong>
            <small>{{ def.hint }}</small>
          </span>
        </button>
        <p class="sg-muted">Drag onto the canvas, or click to add near the center. Cards auto-number in order.</p>
      </aside>

      <div
        ref="canvasRef"
        class="glass-panel sg-canvas"
        @mousedown="onCanvasMouseDown"
        @mousemove="onCanvasMouseMove"
        @mouseup="onCanvasMouseUp"
        @mouseleave="onCanvasMouseUp"
        @wheel="onWheel"
        @dragover.prevent
        @drop="onCanvasDrop"
      >
        <div class="sg-viewport" :style="{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }">
          <svg class="sg-lines" :width="4000" :height="3000">
            <g v-for="line in connectionLines" :key="line.key">
              <line :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2" class="sg-line" marker-end="url(#sg-arrow)" />
              <text v-if="line.label" :x="(line.x1 + line.x2) / 2" :y="(line.y1 + line.y2) / 2 - 6" class="sg-line-label">{{ line.label }}</text>
            </g>
            <defs>
              <marker id="sg-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" class="sg-arrow-head" />
              </marker>
            </defs>
          </svg>

          <article
            v-for="card in cards"
            :key="card.id"
            class="sg-card"
            :class="{ 'sg-card--active': selectedId === card.id }"
            :style="{ left: `${card.x}px`, top: `${card.y}px`, width: `${CARD_W}px`, '--accent': defByType(card.type).color }"
            @mousedown="onCardMouseDown($event, card)"
          >
            <div class="sg-card-top">
              <span class="sg-card-num">{{ String(card.number).padStart(2, '0') }}</span>
              <span class="sg-card-type">{{ defByType(card.type).label }}</span>
            </div>
            <h3>{{ card.title || defByType(card.type).label }}</h3>
            <p>{{ card.body || 'No content yet — select to edit.' }}</p>
          </article>
        </div>

        <p v-if="!cards.length" class="sg-empty">Drag a card from the library to begin your storyboard.</p>
      </div>

      <aside v-if="selectedCard" class="glass-panel sg-inspector">
        <div class="sg-inspector-head">
          <strong>Screen {{ selectedCard.number }} — {{ defByType(selectedCard.type).label }}</strong>
          <div class="sg-inspector-actions">
            <button class="glass-chip" @click="duplicateCard">Duplicate</button>
            <button class="glass-chip sg-delete" @click="deleteCard">Delete</button>
          </div>
        </div>

        <label class="glass-label">Title</label>
        <input v-model="selectedCard.title" class="glass-field">

        <label class="glass-label">{{ selectedCard.type === 'objectives' ? 'Intro text' : 'On-screen text / content' }}</label>
        <textarea v-model="selectedCard.body" class="glass-field" rows="4" />

        <template v-if="selectedCard.type === 'objectives'">
          <label class="glass-label">Objectives</label>
          <div v-for="(_, i) in selectedCard.objectives" :key="i" class="sg-row">
            <input v-model="selectedCard.objectives[i]" class="glass-field">
            <button class="glass-chip" @click="selectedCard.objectives.splice(i, 1)">✕</button>
          </div>
          <button class="glass-chip" @click="selectedCard.objectives.push('New objective')">+ Add objective</button>
        </template>

        <template v-if="selectedCard.type === 'mcq'">
          <label class="glass-label">Answer options</label>
          <div v-for="(opt, i) in selectedCard.options" :key="i" class="sg-mcq-option">
            <div class="sg-row">
              <input v-model="opt.text" class="glass-field" :placeholder="`Option ${String.fromCharCode(65 + i)}`">
              <label class="sg-correct"><input v-model="opt.correct" type="checkbox"> Correct</label>
              <button class="glass-chip" @click="selectedCard.options.splice(i, 1)">✕</button>
            </div>
            <input v-model="opt.feedback" class="glass-field" placeholder="Feedback for this choice">
          </div>
          <button class="glass-chip" @click="selectedCard.options.push({ text: '', correct: false, feedback: '' })">+ Add option</button>
        </template>

        <label class="glass-label">Private developer notes</label>
        <textarea v-model="selectedCard.notes" class="glass-field" rows="3" />

        <label class="glass-label">Connections</label>
        <div v-for="(conn, i) in selectedCard.connections" :key="i" class="sg-row">
          <select v-model="conn.to" class="glass-field glass-select">
            <option v-for="c in cards.filter(c => c.id !== selectedCard!.id)" :key="c.id" :value="c.id">Screen {{ c.number }} — {{ c.title }}</option>
          </select>
          <input v-model="conn.label" class="glass-field" placeholder="Label (e.g. Correct)">
          <button class="glass-chip" @click="removeConnection(i)">✕</button>
        </div>
        <button class="glass-chip" :disabled="cards.length < 2" @click="addConnection">+ Add connection</button>
      </aside>
    </section>
  </UiToolShell>
</template>

<style scoped>
.sg-toolbar { display:flex; align-items:center; justify-content:space-between; gap:14rem; flex-wrap:wrap; padding:14rem 18rem; margin-bottom:16rem; }
.sg-title { flex:1 1 220rem; min-width:160rem; border:0; background:transparent; color:var(--color-text); font:700 22rem/1.2 var(--main-font); letter-spacing:-.03em; outline:none; }
.sg-toolbar-actions { display:flex; align-items:center; gap:8rem; flex-wrap:wrap; }
.sg-zoom { font-size:13rem; opacity:.65; min-width:44rem; text-align:center; }
.sg-file { position:relative; overflow:hidden; }
.sg-file input { position:absolute; inset:0; opacity:0; cursor:pointer; }
.sg-export { position:relative; }
.sg-menu { position:absolute; right:0; top:calc(100% + 8rem); min-width:190rem; padding:8rem; z-index:6; }
.sg-menu button { display:block; width:100%; padding:10rem 12rem; border-radius:10rem; text-align:left; font-size:13rem; }

.sg-grid { display:grid; grid-template-columns:220rem minmax(0, 1fr) 340rem; gap:16rem; align-items:start; }

.sg-library { display:flex; flex-direction:column; gap:8rem; padding:16rem; position:sticky; top:24rem; }
.sg-lib-item { display:flex; align-items:center; gap:10rem; padding:10rem 12rem; border-radius:12rem; border:1px solid var(--color-glass-border); background:color-mix(in srgb, var(--color-bg) 54%, transparent); cursor:grab; text-align:left; transition:background .15s ease, border-color .15s ease; }
.sg-lib-item:hover { background:color-mix(in srgb, var(--color-bg) 66%, transparent); border-color:var(--color-glass-border-hover); }
.sg-lib-dot { width:10rem; height:10rem; border-radius:999px; background:var(--accent); flex:0 0 auto; }
.sg-lib-text { display:flex; flex-direction:column; gap:2rem; }
.sg-lib-text strong { font-size:13rem; }
.sg-lib-text small { font-size:11rem; opacity:.6; }
.sg-muted { font-size:12rem; opacity:.55; line-height:1.5; margin-top:6rem; }

.sg-canvas { position:relative; height:640rem; overflow:hidden; cursor:grab; padding:0; }
.sg-canvas:active { cursor:grabbing; }
.sg-viewport { position:absolute; top:0; left:0; transform-origin:0 0; }
.sg-lines { position:absolute; top:0; left:0; overflow:visible; pointer-events:none; }
.sg-line { stroke:var(--color-text); stroke-opacity:.4; stroke-width:2; fill:none; }
.sg-line-label { fill:var(--color-text); opacity:.7; font-size:11px; text-anchor:middle; }
.sg-arrow-head { fill:var(--color-text); fill-opacity:.5; }
.sg-empty { position:absolute; inset:0; display:grid; place-items:center; opacity:.5; font-size:14rem; pointer-events:none; }

.sg-card { position:absolute; padding:14rem 16rem; border-radius:14rem; border:1px solid var(--color-glass-border); border-top:3px solid var(--accent); background:color-mix(in srgb, var(--color-bg) 78%, transparent); cursor:grab; user-select:none; box-shadow:0 12rem 30rem -18rem rgba(0,0,0,.5); }
.sg-card:active { cursor:grabbing; }
.sg-card--active { border-color:var(--color-glass-border-hover); box-shadow:0 0 0 2rem color-mix(in srgb, var(--accent) 55%, transparent), 0 20rem 44rem -20rem rgba(0,0,0,.55); }
.sg-card-top { display:flex; align-items:center; justify-content:space-between; font-size:10rem; text-transform:uppercase; letter-spacing:.06em; opacity:.6; margin-bottom:8rem; }
.sg-card h3 { font-size:15rem; line-height:1.2; margin-bottom:6rem; }
.sg-card p { font-size:12rem; line-height:1.4; opacity:.65; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; min-height:48rem; }

.sg-inspector { display:flex; flex-direction:column; gap:10rem; padding:18rem; position:sticky; top:24rem; max-height:640rem; overflow-y:auto; }
.sg-inspector-head { display:flex; align-items:center; justify-content:space-between; gap:10rem; margin-bottom:4rem; }
.sg-inspector-actions { display:flex; gap:6rem; }
.sg-delete { color:#ff8d8d; }
.sg-row { display:flex; align-items:center; gap:8rem; }
.sg-row .glass-field { flex:1; }
.sg-mcq-option { display:flex; flex-direction:column; gap:6rem; margin-bottom:6rem; }
.sg-correct { display:flex; align-items:center; gap:6rem; font-size:12rem; white-space:nowrap; }

@media (max-width: 1100px) {
  .sg-grid { grid-template-columns:1fr; }
  .sg-library, .sg-inspector { position:static; max-height:none; }
  .sg-canvas { height:480rem; }
}
</style>
