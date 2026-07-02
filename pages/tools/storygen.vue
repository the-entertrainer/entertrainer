<script setup lang="ts">
import { saveAs } from 'file-saver'
import type { CardKind, Connection, StoryCard, StoryGenProject } from '~/types/story'
import { createCard, CARD_KINDS } from '~/utils/storyCards'
import { cardNumbers, lastInSequence } from '~/utils/storyGraph'
import { nextAutoPosition, tidyPositions } from '~/utils/storyLayout'
import { exportStoryDocx } from '~/utils/storyExportDocx'
import { exportDiagramPng } from '~/utils/storyExportDiagram'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

const STORAGE_KEY = 'storygen-project'

const projectTitle = ref('Untitled Storyboard')
const cards = ref<StoryCard[]>([])
const connections = ref<Connection[]>([])
const selectedCardId = ref<string | null>(null)

const showPaletteSheet = ref(false)
const showMenu = ref<'file' | 'export' | 'mobile' | null>(null)
const savedFlash = ref(false)

const canvasRef = ref<{
  zoomIn: () => void; zoomOut: () => void; fitView: () => void
  centerOn: (id: string) => void; zoomPercent: number; gestureActive: boolean
} | null>(null)

// Insets keep fitView/centerOn framing content clear of the floating chrome
// (dock on desktop, action bar on mobile).
const isDesktop = ref(true)
let mq: MediaQueryList | null = null
const onMq = (e: MediaQueryListEvent | MediaQueryList) => { isDesktop.value = e.matches }
const canvasInsets = computed(() => isDesktop.value
  ? { top: 76, right: 24, bottom: 70, left: 208 }
  : { top: 72, right: 12, bottom: 88, left: 12 })

const numberMap = computed(() => cardNumbers(cards.value, connections.value))
const selectedCard = computed(() => cards.value.find(c => c.id === selectedCardId.value) ?? null)
const selectedCardNumber = computed(() => (selectedCardId.value && numberMap.value.get(selectedCardId.value)) || 0)
const totalMinutes = computed(() => Math.max(1, Math.round(cards.value.reduce((s, c) => s + (c.duration || 0), 0) / 60)))

function id(prefix: string) { return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}` }
function safeName(name: string) { return name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'storyboard' }

// ── Card operations ─────────────────────────────────────────────
function addCard(kind: CardKind) {
  const prevLast = lastInSequence(cards.value, connections.value)
  const card = createCard(kind, nextAutoPosition(cards.value, connections.value))
  cards.value.push(card)
  if (prevLast) connections.value.push({ id: id('k'), from: prevLast.id, to: card.id })
  selectedCardId.value = card.id
  showPaletteSheet.value = false
  nextTick(() => canvasRef.value?.centerOn(card.id))
}

function deleteCard(cardId: string) {
  cards.value = cards.value.filter(c => c.id !== cardId)
  connections.value = connections.value.filter(c => c.from !== cardId && c.to !== cardId)
  if (selectedCardId.value === cardId) selectedCardId.value = null
}

function duplicateSelected() {
  const src = selectedCard.value
  if (!src) return
  const copy: StoryCard = { ...JSON.parse(JSON.stringify(src)), id: id('c'), x: src.x + 36, y: src.y + 36 }
  cards.value.push(copy)
  selectedCardId.value = copy.id
}

function tidy() {
  tidyPositions(cards.value, connections.value)
  nextTick(() => canvasRef.value?.fitView())
}

// ── Persistence + history ───────────────────────────────────────
const histStack = ref<string[]>([])
const histIndex = ref(-1)
let restoring = false
let saveTimer: ReturnType<typeof setTimeout> | null = null

const canUndo = computed(() => histIndex.value > 0)
const canRedo = computed(() => histIndex.value < histStack.value.length - 1)

function serialize() {
  return JSON.stringify({ title: projectTitle.value, cards: cards.value, connections: connections.value })
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

function persist() {
  const project: StoryGenProject = {
    version: '4.0',
    title: projectTitle.value,
    updated: new Date().toISOString(),
    cards: cards.value,
    connections: connections.value
  }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(project)) } catch {}
  savedFlash.value = true
  setTimeout(() => { savedFlash.value = false }, 1400)
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

watch([projectTitle, cards, connections], () => {
  if (restoring) return
  scheduleCommit()
}, { deep: true })

// Accepts the current v4 shape or migrates a v3 StoryForge project
// (scenes + separate mcqs) so nobody's saved work is stranded.
function normalizeProject(data: any): { title: string; cards: StoryCard[]; connections: Connection[] } {
  const blank = (kind: CardKind, x: number, y: number) => createCard(kind, { x, y })
  if (Array.isArray(data?.cards)) {
    const sane: StoryCard[] = data.cards.map((c: any, i: number) => {
      const kind: CardKind = CARD_KINDS[c.kind as CardKind] ? c.kind : 'text-image'
      const base = blank(kind, Number(c.x ?? 60 + i * 300), Number(c.y ?? 160))
      const options = Array.isArray(c.options) ? c.options.slice(0, 4).map(String) : base.options
      while (options.length < 4) options.push('')
      return { ...base, ...c, kind, options, id: String(c.id || base.id) }
    })
    const ids = new Set(sane.map(c => c.id))
    const conns = (Array.isArray(data.connections) ? data.connections : [])
      .filter((c: any) => ids.has(c.from) && ids.has(c.to))
      .map((c: any) => ({ id: String(c.id || id('k')), from: String(c.from), to: String(c.to) }))
    return { title: String(data.title || 'Untitled Storyboard'), cards: sane, connections: conns }
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
    const ids = new Set(migrated.map(c => c.id))
    const conns = (Array.isArray(data.connections) ? data.connections : [])
      .filter((c: any) => ids.has(c.from) && ids.has(c.to))
      .map((c: any) => ({ id: String(c.id || id('k')), from: String(c.from), to: String(c.to) }))
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
    return { title: String(data.title || 'Imported Storyboard'), cards: migrated, connections: conns }
  }
  return { title: 'Untitled Storyboard', cards: [], connections: [] }
}

function applyProject(data: any) {
  const normal = normalizeProject(data)
  projectTitle.value = normal.title
  cards.value = normal.cards
  connections.value = normal.connections
  selectedCardId.value = null
  nextTick(() => canvasRef.value?.fitView())
}

function newProject() {
  projectTitle.value = 'Untitled Storyboard'
  connections.value = []
  cards.value = [createCard('title', { x: 60, y: 160 })]
  selectedCardId.value = null
  showMenu.value = null
  nextTick(() => canvasRef.value?.fitView())
}

async function importProject(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  showMenu.value = null
  if (!file) return
  try { applyProject(JSON.parse(await file.text())) } catch {}
  ;(e.target as HTMLInputElement).value = ''
}

// ── Exports ─────────────────────────────────────────────────────
async function exportDocx() {
  showMenu.value = null
  await exportStoryDocx(
    { title: projectTitle.value, cards: cards.value, connections: connections.value },
    `${safeName(projectTitle.value)}.docx`
  )
}
function exportDiagram() {
  showMenu.value = null
  exportDiagramPng({ title: projectTitle.value, cards: cards.value, connections: connections.value }, `${safeName(projectTitle.value)}-flow.png`)
}
function exportSbf() {
  showMenu.value = null
  const project: StoryGenProject = {
    version: '4.0', title: projectTitle.value, updated: new Date().toISOString(),
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
    showMenu.value = null
    showPaletteSheet.value = false
    selectedCardId.value = null
  }
}

onMounted(() => {
  mq = window.matchMedia('(min-width: 900px)')
  onMq(mq)
  mq.addEventListener('change', onMq)
  window.addEventListener('keydown', onKeydown)
  let loaded = false
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      applyProject(JSON.parse(raw))
      loaded = cards.value.length > 0
    }
  } catch {}
  if (!loaded) newProject()
  nextTick(commitHistory)
})
onUnmounted(() => {
  mq?.removeEventListener('change', onMq)
  window.removeEventListener('keydown', onKeydown)
  if (saveTimer) { clearTimeout(saveTimer); commitHistory(); persist() }
})
</script>

<template>
  <div class="sg-app">
    <UiGlassBackdrop />

    <!-- Canvas fills the whole workspace; every control floats above it -->
    <ToolsStoryNodeCanvas
      ref="canvasRef"
      v-model:cards="cards"
      v-model:connections="connections"
      v-model:selected-card-id="selectedCardId"
      class="sg-canvas"
      :insets="canvasInsets"
      @delete-card="deleteCard"
    />

    <!-- Top bar -->
    <header class="sg-topbar glass-panel">
      <span class="sg-wordmark">Story<em>Gen</em></span>
      <input v-model="projectTitle" class="sg-title" placeholder="Untitled Storyboard" aria-label="Project title">
      <span class="sg-saved" :class="{ 'sg-saved--on': savedFlash }">● Saved</span>

      <div class="sg-topbar__group">
        <button class="sg-tool" :disabled="!canUndo" title="Undo (⌘Z)" @click="undo">↶</button>
        <button class="sg-tool" :disabled="!canRedo" title="Redo (⇧⌘Z)" @click="redo">↷</button>
      </div>

      <div class="sg-topbar__group sg-desktop-only">
        <button class="sg-tool sg-tool--wide" @click="newProject">New</button>
        <label class="sg-tool sg-tool--wide sg-file-btn">Open<input type="file" accept=".sbf,.json" @change="importProject"></label>
        <div class="sg-menu-wrap">
          <button class="glass-btn sg-export-btn" @click="showMenu = showMenu === 'export' ? null : 'export'">Export ▾</button>
          <div v-if="showMenu === 'export'" class="glass-panel sg-menu">
            <button @click="exportDocx">Word (.docx) — Storyboard + MCQ tables</button>
            <button @click="exportDiagram">Flow diagram (.png)</button>
            <button @click="exportSbf">Project file (.sbf)</button>
          </div>
        </div>
      </div>

      <div class="sg-menu-wrap sg-mobile-only">
        <button class="sg-tool" aria-label="Menu" @click="showMenu = showMenu === 'mobile' ? null : 'mobile'">⋯</button>
        <div v-if="showMenu === 'mobile'" class="glass-panel sg-menu">
          <button @click="newProject">New storyboard</button>
          <label class="sg-menu-file">Open project (.sbf)<input type="file" accept=".sbf,.json" @change="importProject"></label>
          <button @click="exportDocx">Export Word (.docx)</button>
          <button @click="exportDiagram">Export diagram (.png)</button>
          <button @click="exportSbf">Save project (.sbf)</button>
        </div>
      </div>
    </header>

    <!-- Left dock: card palette (desktop) -->
    <aside class="sg-dock glass-panel sg-desktop-only">
      <ToolsStoryCardPalette @add="addCard" />
    </aside>

    <!-- Bottom-left: zoom + layout controls (desktop; mobile pinches) -->
    <div class="sg-zoombar glass-panel sg-desktop-only">
      <button class="sg-tool" aria-label="Zoom out" @click="canvasRef?.zoomOut()">−</button>
      <span class="sg-zoom-pct">{{ canvasRef?.zoomPercent ?? 100 }}%</span>
      <button class="sg-tool" aria-label="Zoom in" @click="canvasRef?.zoomIn()">+</button>
      <span class="sg-zoombar__sep" />
      <button class="sg-tool sg-tool--wide" @click="canvasRef?.fitView()">Fit</button>
      <button class="sg-tool sg-tool--wide" title="Auto-arrange the flow" @click="tidy">Tidy</button>
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

    <!-- Mobile palette sheet -->
    <Transition name="sheet">
      <div v-if="showPaletteSheet" class="sg-sheet-overlay" @click.self="showPaletteSheet = false">
        <div class="sg-sheet glass-panel">
          <div class="sg-sheet__head">
            <strong>Add a card</strong>
            <button class="sg-tool" aria-label="Close" @click="showPaletteSheet = false">✕</button>
          </div>
          <ToolsStoryCardPalette sheet @add="addCard" />
        </div>
      </div>
    </Transition>

    <!-- Inspector: floating window (desktop) / bottom sheet (mobile) -->
    <ToolsStoryInspectorPanel
      :card="selectedCard"
      :card-number="selectedCardNumber"
      @delete="selectedCardId && deleteCard(selectedCardId)"
      @duplicate="duplicateSelected"
      @close="selectedCardId = null"
    />

    <!-- Click-away layer for open dropdowns -->
    <div v-if="showMenu" class="sg-clickaway" @click="showMenu = null" />
  </div>
</template>

<style scoped>
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
  font-size: 15rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  white-space: nowrap;
}
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
.sg-tool--wide { font-size: 12rem; padding: 0 12rem; }
.sg-file-btn { position: relative; overflow: hidden; cursor: pointer; }
.sg-file-btn input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

.sg-export-btn { padding: 8rem 16rem; font-size: 12.5rem; }

.sg-menu-wrap { position: relative; }
.sg-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8rem);
  min-width: 250rem;
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

/* ── Zoom bar + status ── */
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
  gap: 10rem;
  padding: 10rem 12rem;
  border-radius: 16rem;
  z-index: 18;
}
.sg-add-btn { padding: 10rem 18rem; font-size: 13rem; }
.sg-bottombar__meta { font-size: 11.5rem; font-weight: 600; opacity: 0.6; white-space: nowrap; }

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
  .sg-wordmark { display: none; }
  .sg-title { font-size: 13rem; }
  .sg-bottombar { display: flex; }
  .sg-menu { position: fixed; left: 12rem; right: 12rem; top: calc(64rem + var(--safe-top)); min-width: 0; }
}
</style>
