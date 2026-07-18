<script setup lang="ts">
import type { LuminaAuditIssue, LuminaBlock, LuminaBlockKind, LuminaCourse } from '~/types/lumina'
import {
  courseReadingMinutes, createBlock, createCourse, createLesson,
  LUMINA_ACCENTS, LUMINA_CANVAS_ORDER, LUMINA_CANVASES, LUMINA_CORNERS,
  LUMINA_FONT_ORDER, LUMINA_FONTS, LUMINA_MOTIONS, LUMINA_SCALES,
  luminaId, normalizeCourse
} from '~/utils/luminaBlocks'
import { auditCourse } from '~/utils/luminaAudit'
import { exportLuminaHtml, exportLuminaProject, exportLuminaScorm } from '~/utils/luminaExport'
import { renderPlayerHtml } from '~/utils/luminaPlayer'
import { courseFromStoryboard } from '~/utils/luminaFromStory'
import {
  listLuminaProjects, newLuminaProjectId, readLuminaProject,
  removeLuminaProject, writeLuminaProject, type LuminaProjectMeta
} from '~/composables/useLuminaProjects'
import { listProjects as listStoryProjects, readProject as readStoryProject, type ProjectMeta } from '~/composables/useStoryProjects'
import { aiSuggestInteractions, applyLuminaSuggestions, type LuminaSuggestion } from '~/utils/luminaAiSuggest'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })
useSeoMeta({
  title: 'Lumina Course Builder · Entertrainer',
  description: 'Build block-based courses that read well on any screen. Edit on your phone or laptop, run the quality check, and export one HTML file or a SCORM 1.2 package. Free, and everything stays on your device.',
  ogTitle: 'Lumina Course Builder',
  ogDescription: 'Build a course out of blocks, right from your phone. Export HTML or SCORM.',
  ogUrl: 'https://entertrainer.in/tools/lumina'
})

// The app has three faces: a brief branded splash, the course shelf
// (home), and the block editor — same rhythm as StoryGen.
const view = ref<'splash' | 'home' | 'editor'>('splash')
const projects = ref<LuminaProjectMeta[]>([])
const activeProjectId = ref<string | null>(null)

const course = ref<LuminaCourse>(createCourse())
const activeLessonIndex = ref(0)
const selectedBlockId = ref<string | null>(null)
const inspectorOpen = ref(false)

const showPaletteSheet = ref(false)
const showMenu = ref<'export' | 'mobile' | null>(null)
const lessonsOpen = ref(false)
const themeOpen = ref(false)
const storygenOpen = ref(false)
const savedFlash = ref(false)

// ── Optional AI: interactivity suggestions (bring-your-own Groq key,
// shared with StoryGen). Everything is off unless the user opted in. ──
const { aiReady } = useAiSettings()
const aiSetupOpen = ref(false)
const aiSuggestOpen = ref(false)
const aiState = ref<'loading' | 'ready' | 'empty' | 'error'>('loading')
const aiSuggestions = ref<LuminaSuggestion[]>([])
const aiError = ref('')
// After a StoryGen import, a dismissible banner invites the interactivity
// pass. It only appears the once, for freshly bridged courses.
const aiOffer = ref(false)

const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(message: string) {
  toast.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 3600)
}

const isDesktop = ref(true)
let mq: MediaQueryList | null = null
const onMq = (e: MediaQueryListEvent | MediaQueryList) => { isDesktop.value = e.matches }

const activeLesson = computed(() => course.value.lessons[activeLessonIndex.value] ?? course.value.lessons[0])
const selectedBlock = computed<LuminaBlock | null>(() =>
  activeLesson.value?.blocks.find(b => b.id === selectedBlockId.value) ?? null
)
const totalBlocks = computed(() => course.value.lessons.reduce((s, l) => s + l.blocks.length, 0))
const readingMinutes = computed(() => courseReadingMinutes(course.value))

// The course theme, expressed as CSS variables. Set on the page root so
// the canvas, the block previews and the preview frame all read the same
// palette the export will use.
const themeVars = computed(() => {
  const t = course.value.theme
  const canvas = LUMINA_CANVASES[t.canvas]
  return {
    '--lum-accent': t.accent,
    '--lum-paper': canvas.paper,
    '--lum-panel': canvas.panel,
    '--lum-ink': canvas.ink,
    '--lum-head-font': LUMINA_FONTS[t.headingFont].stack,
    '--lum-body-font': LUMINA_FONTS[t.bodyFont].stack
  }
})
const storyShelf = ref<ProjectMeta[]>([])

watch(selectedBlockId, (id) => {
  if (!id) { inspectorOpen.value = false; return }
  if (isDesktop.value) inspectorOpen.value = true
})
watch(activeLessonIndex, () => { selectedBlockId.value = null })

function safeTitle() { return course.value.title || 'Untitled Course' }

// ── Block operations ────────────────────────────────────────────
function scrollToBlock(id: string) {
  nextTick(() => document.getElementById(`lblk-${id}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }))
}

function addBlock(kind: LuminaBlockKind) {
  const lesson = activeLesson.value
  if (!lesson) return
  const block = createBlock(kind)
  // New blocks land right below the selection — where the eye already is.
  const at = selectedBlockId.value ? lesson.blocks.findIndex(b => b.id === selectedBlockId.value) + 1 : lesson.blocks.length
  lesson.blocks.splice(at || lesson.blocks.length, 0, block)
  selectedBlockId.value = block.id
  showPaletteSheet.value = false
  if (isDesktop.value) inspectorOpen.value = true
  scrollToBlock(block.id)
}

function deleteBlock(blockId: string) {
  const lesson = activeLesson.value
  if (!lesson) return
  lesson.blocks = lesson.blocks.filter(b => b.id !== blockId)
  if (selectedBlockId.value === blockId) selectedBlockId.value = null
}

function duplicateBlock(blockId: string) {
  const lesson = activeLesson.value
  const src = lesson?.blocks.find(b => b.id === blockId)
  if (!lesson || !src) return
  const copy: LuminaBlock = JSON.parse(JSON.stringify(src))
  copy.id = luminaId('b')
  copy.pairs = copy.pairs.map(p => ({ ...p, id: luminaId('p') }))
  lesson.blocks.splice(lesson.blocks.findIndex(b => b.id === blockId) + 1, 0, copy)
  selectedBlockId.value = copy.id
  scrollToBlock(copy.id)
}

function moveBlock(blockId: string, dir: -1 | 1) {
  const lesson = activeLesson.value
  if (!lesson) return
  const i = lesson.blocks.findIndex(b => b.id === blockId)
  const j = i + dir
  if (i < 0 || j < 0 || j >= lesson.blocks.length) return
  ;[lesson.blocks[i], lesson.blocks[j]] = [lesson.blocks[j], lesson.blocks[i]]
  scrollToBlock(blockId)
}

function editBlock(blockId: string) {
  selectedBlockId.value = blockId
  inspectorOpen.value = true
}

// ── Lesson operations ───────────────────────────────────────────
function addLesson() {
  course.value.lessons.push(createLesson(`Lesson ${course.value.lessons.length + 1}`))
  activeLessonIndex.value = course.value.lessons.length - 1
}
function duplicateLesson(index: number) {
  const src = course.value.lessons[index]
  if (!src) return
  const copy = JSON.parse(JSON.stringify(src)) as typeof src
  copy.id = luminaId('l')
  copy.title = src.title ? `${src.title} copy` : 'Untitled copy'
  copy.blocks = copy.blocks.map(b => ({ ...b, id: luminaId('b'), pairs: b.pairs.map(p => ({ ...p, id: luminaId('p') })) }))
  course.value.lessons.splice(index + 1, 0, copy)
  activeLessonIndex.value = index + 1
}
function deleteLesson(index: number) {
  if (course.value.lessons.length <= 1) return
  course.value.lessons.splice(index, 1)
  activeLessonIndex.value = Math.min(activeLessonIndex.value, course.value.lessons.length - 1)
}
function moveLesson(index: number, dir: -1 | 1) {
  const j = index + dir
  const lessons = course.value.lessons
  if (j < 0 || j >= lessons.length) return
  ;[lessons[index], lessons[j]] = [lessons[j], lessons[index]]
  if (activeLessonIndex.value === index) activeLessonIndex.value = j
  else if (activeLessonIndex.value === j) activeLessonIndex.value = index
}

// ── Persistence + history (same pattern StoryGen proved out) ────
const histStack = ref<string[]>([])
const histIndex = ref(-1)
let restoring = false
let saveTimer: ReturnType<typeof setTimeout> | null = null

const canUndo = computed(() => histIndex.value > 0)
const canRedo = computed(() => histIndex.value < histStack.value.length - 1)

function serialize() { return JSON.stringify(course.value) }
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
    course.value = JSON.parse(s)
    activeLessonIndex.value = Math.min(activeLessonIndex.value, course.value.lessons.length - 1)
    if (selectedBlockId.value && !activeLesson.value?.blocks.some(b => b.id === selectedBlockId.value)) {
      selectedBlockId.value = null
    }
  } finally {
    nextTick(() => { restoring = false })
  }
  persist()
}
function undo() { if (canUndo.value) { histIndex.value--; applySnapshot(histStack.value[histIndex.value]) } }
function redo() { if (canRedo.value) { histIndex.value++; applySnapshot(histStack.value[histIndex.value]) } }
function resetHistory() {
  histStack.value = []
  histIndex.value = -1
  nextTick(commitHistory)
}

function persist() {
  if (!activeProjectId.value) return
  course.value.updated = new Date().toISOString()
  writeLuminaProject(activeProjectId.value, course.value)
  savedFlash.value = true
  setTimeout(() => { savedFlash.value = false }, 1400)
}
function scheduleCommit(delay = 350) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => { commitHistory(); persist() }, delay)
}
function flushSave() {
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null }
  if (activeProjectId.value) { commitHistory(); persist() }
}
watch(course, () => { if (!restoring) scheduleCommit() }, { deep: true })

// ── Shelf (home) ────────────────────────────────────────────────
function refreshShelves() {
  projects.value = listLuminaProjects()
  storyShelf.value = listStoryProjects()
}

function newCourse() {
  showMenu.value = null
  flushSave()
  const fresh = createCourse()
  // A starter skeleton so the canvas teaches the shape of a lesson.
  const hero = createBlock('hero')
  hero.title = 'Name the promise of this course'
  const text = createBlock('text')
  fresh.lessons[0].blocks = [hero, text]
  course.value = fresh
  activeProjectId.value = newLuminaProjectId()
  activeLessonIndex.value = 0
  selectedBlockId.value = hero.id
  resetHistory()
  persist()
  view.value = 'editor'
}

function openProject(projectId: string) {
  const data = readLuminaProject(projectId)
  if (!data) return
  flushSave()
  course.value = normalizeCourse(data)
  activeProjectId.value = projectId
  activeLessonIndex.value = 0
  selectedBlockId.value = null
  resetHistory()
  view.value = 'editor'
}

function deleteProjectEntry(projectId: string) {
  removeLuminaProject(projectId)
  refreshShelves()
  if (activeProjectId.value === projectId) activeProjectId.value = null
}

function goHome() {
  flushSave()
  selectedBlockId.value = null
  inspectorOpen.value = false
  showMenu.value = null
  refreshShelves()
  view.value = 'home'
}

function relTime(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return days === 1 ? 'yesterday' : `${days} days ago`
}

// ── Import: .lumina and .sbf files ──────────────────────────────
async function importFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  showMenu.value = null
  if (!file) return
  try {
    const data = JSON.parse(await file.text())
    flushSave()
    if (Array.isArray(data?.lessons)) {
      course.value = normalizeCourse(data)
    } else if (Array.isArray(data?.cards)) {
      // A StoryGen storyboard file — run it through the bridge.
      const bridged = courseFromStoryboard(data)
      course.value = bridged.course
      offerInteractivity()
      showToast(`Storyboard converted. ${bridged.cardCount} screens became ${bridged.blockCount} blocks.`)
    } else {
      showToast('That file is neither a Lumina course nor a StoryGen storyboard.')
      return
    }
    activeProjectId.value = newLuminaProjectId()
    activeLessonIndex.value = 0
    selectedBlockId.value = null
    resetHistory()
    persist()
    view.value = 'editor'
  } catch {
    showToast('Could not read that file.')
  } finally {
    ;(e.target as HTMLInputElement).value = ''
  }
}

// ── Import: straight from the StoryGen shelf on this device ─────
function importFromStorygen(projectId: string) {
  const data = readStoryProject(projectId)
  storygenOpen.value = false
  if (!data) return
  flushSave()
  const bridged = courseFromStoryboard(data)
  course.value = bridged.course
  activeProjectId.value = newLuminaProjectId()
  activeLessonIndex.value = 0
  selectedBlockId.value = null
  resetHistory()
  persist()
  view.value = 'editor'
  offerInteractivity()
  showToast(`Storyboard converted. ${bridged.cardCount} screens became ${bridged.blockCount} blocks, with narration resolved into on-screen text.`)
}

// ── AI interactivity pass ───────────────────────────────────────
// The banner shows after any StoryGen import: a converted storyboard reads
// like slides, and the model can spot where a check, a scenario or a set
// of flashcards would earn its place. Nothing runs until the author asks.
function offerInteractivity() {
  aiOffer.value = true
}

async function runSuggest() {
  showMenu.value = null
  aiOffer.value = false
  if (!aiReady.value) { aiSetupOpen.value = true; return }
  flushSave()
  aiState.value = 'loading'
  aiSuggestions.value = []
  aiError.value = ''
  aiSuggestOpen.value = true
  try {
    const { settings } = useAiSettings()
    const suggestions = await aiSuggestInteractions(settings.value.key, course.value)
    aiSuggestions.value = suggestions
    aiState.value = suggestions.length ? 'ready' : 'empty'
  } catch (e: any) {
    aiError.value = e?.message || 'The suggestion could not be generated.'
    aiState.value = 'error'
  }
}

function onSuggestApply(picks: LuminaSuggestion[]) {
  aiSuggestOpen.value = false
  if (!picks.length) return
  course.value = applyLuminaSuggestions(course.value, picks)
  selectedBlockId.value = null
  nextTick(() => { commitHistory(); persist() })
  showToast(`Added ${picks.length} interactive block${picks.length === 1 ? '' : 's'}. Each one is yours to edit.`)
}

// ── Preview (the real exported player, in an iframe) ────────────
const previewOpen = ref(false)
const previewDevice = ref<'phone' | 'tablet' | 'desktop'>('phone')
const previewHtml = ref('')
function openPreview() {
  showMenu.value = null
  previewHtml.value = renderPlayerHtml(course.value)
  previewDevice.value = isDesktop.value ? previewDevice.value : 'phone'
  previewOpen.value = true
}

// ── Gatekeeper + exports ────────────────────────────────────────
// Every export runs the course check first. Errors block the door;
// warnings show but can be waved through. "check" runs it standalone.
type GatedAction = 'html' | 'scorm' | 'check'
const auditIssues = ref<LuminaAuditIssue[] | null>(null)
const pendingAction = ref<GatedAction>('check')

const actionLabels: Record<GatedAction, string> = {
  html: 'Export HTML anyway',
  scorm: 'Export SCORM anyway',
  check: 'Looks good'
}

async function runExport(action: GatedAction) {
  if (action === 'html') { exportLuminaHtml(course.value); showToast('Exported. One HTML file that plays anywhere.') }
  else if (action === 'scorm') { await exportLuminaScorm(course.value); showToast('SCORM package exported. Upload the zip to your LMS.') }
}

async function gate(action: GatedAction) {
  showMenu.value = null
  flushSave()
  const issues = auditCourse(course.value)
  if (action !== 'check' && !issues.length) {
    await runExport(action)
    return
  }
  pendingAction.value = action
  auditIssues.value = issues
}

async function onAuditProceed() {
  const action = pendingAction.value
  auditIssues.value = null
  await runExport(action)
}

function onAuditJump(issue: LuminaAuditIssue) {
  auditIssues.value = null
  const li = course.value.lessons.findIndex(l => l.id === issue.lessonId)
  if (li >= 0) activeLessonIndex.value = li
  if (issue.blockId) {
    selectedBlockId.value = issue.blockId
    inspectorOpen.value = true
    scrollToBlock(issue.blockId)
  } else if (!issue.lessonId) {
    // Course-level issue (e.g. missing title) — the topbar field is the fix.
    nextTick(() => (document.getElementById('lum-title') as HTMLInputElement | null)?.focus())
  }
}

function saveProjectFile() {
  showMenu.value = null
  flushSave()
  exportLuminaProject(course.value)
}

// ── Keyboard shortcuts ──────────────────────────────────────────
function isEditingText(e: KeyboardEvent) {
  const t = e.target as HTMLElement
  return !!t.closest('input, textarea, select, [contenteditable="true"]')
}
function onKeydown(e: KeyboardEvent) {
  if (view.value !== 'editor') return
  const mod = e.metaKey || e.ctrlKey
  if (mod && e.key.toLowerCase() === 'z') {
    if (isEditingText(e)) return
    e.preventDefault()
    e.shiftKey ? redo() : undo()
  } else if (mod && e.key.toLowerCase() === 'y') {
    if (isEditingText(e)) return
    e.preventDefault(); redo()
  } else if (mod && e.key.toLowerCase() === 'd' && selectedBlockId.value) {
    e.preventDefault(); duplicateBlock(selectedBlockId.value)
  } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockId.value && !isEditingText(e)) {
    e.preventDefault(); deleteBlock(selectedBlockId.value)
  } else if (e.key === 'Escape') {
    if (previewOpen.value) { previewOpen.value = false; return }
    if (aiSuggestOpen.value) { aiSuggestOpen.value = false; return }
    if (aiSetupOpen.value) { aiSetupOpen.value = false; return }
    if (auditIssues.value) { auditIssues.value = null; return }
    if (showMenu.value || showPaletteSheet.value || lessonsOpen.value || themeOpen.value || storygenOpen.value) {
      showMenu.value = null; showPaletteSheet.value = false; lessonsOpen.value = false; themeOpen.value = false; storygenOpen.value = false
      return
    }
    if (inspectorOpen.value) { inspectorOpen.value = false; return }
    selectedBlockId.value = null
  }
}

let splashTimer: ReturnType<typeof setTimeout> | null = null
onMounted(() => {
  mq = window.matchMedia('(min-width: 900px)')
  onMq(mq)
  mq.addEventListener('change', onMq)
  window.addEventListener('keydown', onKeydown)
  refreshShelves()
  // Arriving from StoryGen's "Build in Lumina": open the freshly bridged
  // course directly, skipping splash and shelf.
  const openId = useRoute().query.open
  if (typeof openId === 'string' && readLuminaProject(openId)) {
    openProject(openId)
    offerInteractivity()
    showToast('Storyboard converted into a block course. Narration is now on-screen text, so give each lesson a read.')
    return
  }
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
  <div class="lum-root" :style="themeVars">
    <UiGlassBackdrop />

    <!-- Splash -->
    <Transition name="splash">
      <div v-if="view === 'splash'" class="lum-splash" @click="view = 'home'">
        <div class="lum-splash__orb lum-splash__orb--a" />
        <div class="lum-splash__orb lum-splash__orb--b" />
        <ToolsLuminaBrandMark :size="116" animated class="lum-splash__mark" />
        <p class="lum-splash__name">Lumina</p>
        <p class="lum-splash__tag">Block-course builder for instructional designers</p>
        <span class="lum-splash__loader" aria-hidden="true"><i /><i /><i /></span>
      </div>
    </Transition>

    <!-- Home: the course shelf -->
    <div v-if="view === 'home'" class="lum-home" data-lenis-prevent>
      <div class="lum-home__inner">
        <header class="lum-home__head">
          <ToolsLuminaBrandMark :size="46" />
          <div>
            <h1>Lumina</h1>
            <p>Build a course out of blocks, right from your phone. Export it as one HTML file or a SCORM package.</p>
          </div>
        </header>

        <div class="lum-home__actions">
          <button class="glass-btn lum-home__new" @click="newCourse"><ToolsLuminaIcon name="plus" :size="13" /> New course</button>
          <button v-if="storyShelf.length" class="lum-tool lum-tool--wide lum-home__bridge" @click="storygenOpen = true">
            <ToolsLuminaIcon name="layers" :size="13" /> From StoryGen
          </button>
          <label class="lum-tool lum-tool--wide lum-file-btn lum-home__open">Open .lumina / .sbf<input type="file" accept=".lumina,.sbf,.json" @change="importFile"></label>
        </div>

        <p v-if="projects.length" class="glass-label lum-home__label">Recent courses</p>
        <div class="lum-home__grid">
          <article
            v-for="(p, i) in projects" :key="p.id"
            class="glass-panel lum-proj" role="button" tabindex="0"
            :style="{ '--proj-i': Math.min(i, 8), '--proj-accent': p.accent }"
            @click="openProject(p.id)"
            @keydown.enter="openProject(p.id)"
          >
            <div class="lum-proj__swatch">
              <span v-for="n in 3" :key="n" class="lum-proj__bar" />
            </div>
            <div class="lum-proj__meta">
              <strong>{{ p.title || 'Untitled Course' }}</strong>
              <span>{{ p.lessons }} lesson{{ p.lessons === 1 ? '' : 's' }} · {{ p.blocks }} block{{ p.blocks === 1 ? '' : 's' }}</span>
              <span class="lum-proj__date">{{ relTime(p.updated) }}</span>
            </div>
            <button class="lum-proj__del" title="Delete course" @click.stop="deleteProjectEntry(p.id)"><ToolsLuminaIcon name="trash" :size="12" /></button>
          </article>
        </div>
        <p v-if="!projects.length" class="lum-home__empty">
          Nothing here yet. Courses are saved on this device. Start one fresh, or turn a StoryGen storyboard into a course in one tap.
        </p>
      </div>
    </div>

    <!-- Editor -->
    <div v-if="view === 'editor'" class="lum-app">

      <!-- Top bar -->
      <header class="lum-topbar glass-panel">
        <button class="lum-wordmark" title="Home" @click="goHome">
          <ToolsLuminaBrandMark :size="20" />
          <span class="lum-wordmark__text">Lumina</span>
        </button>
        <input id="lum-title" v-model="course.title" class="lum-title" placeholder="Untitled Course" aria-label="Course title">
        <span class="lum-saved" :class="{ 'lum-saved--on': savedFlash }">● Saved</span>

        <div class="lum-topbar__group">
          <button class="lum-tool" :disabled="!canUndo" title="Undo (⌘Z)" @click="undo"><ToolsLuminaIcon name="undo" :size="14" /></button>
          <button class="lum-tool" :disabled="!canRedo" title="Redo (⇧⌘Z)" @click="redo"><ToolsLuminaIcon name="redo" :size="14" /></button>
        </div>

        <div class="lum-topbar__group lum-desktop-only">
          <button class="lum-tool lum-tool--wide lum-tool--ai" title="Suggest interactive blocks with AI" @click="runSuggest"><ToolsLuminaIcon name="sparkle" :size="13" /> Interactive</button>
          <button class="lum-tool lum-tool--wide" title="Colors, fonts, motion" @click="themeOpen = true"><ToolsLuminaIcon name="palette" :size="13" /> Design</button>
          <button class="lum-tool lum-tool--wide" title="Run the course check" @click="gate('check')"><ToolsLuminaIcon name="shield" :size="13" /> Check</button>
          <button class="lum-tool lum-tool--wide" title="Preview the real player" @click="openPreview"><ToolsLuminaIcon name="eye" :size="13" /> Preview</button>
          <label class="lum-tool lum-tool--wide lum-file-btn">Open<input type="file" accept=".lumina,.sbf,.json" @change="importFile"></label>
          <div class="lum-menu-wrap">
            <button class="glass-btn lum-export-btn" @click="showMenu = showMenu === 'export' ? null : 'export'">Export <ToolsLuminaIcon name="chevron-down" :size="11" /></button>
            <div v-if="showMenu === 'export'" class="glass-panel lum-menu">
              <button @click="gate('html')"><ToolsLuminaIcon name="download" :size="12" /> Standalone HTML (single file)</button>
              <button @click="gate('scorm')"><ToolsLuminaIcon name="download" :size="12" /> SCORM 1.2 package (.zip)</button>
              <button @click="saveProjectFile">Project file (.lumina)</button>
            </div>
          </div>
        </div>

        <div class="lum-menu-wrap lum-mobile-only">
          <button class="lum-tool" aria-label="Menu" @click="showMenu = showMenu === 'mobile' ? null : 'mobile'"><ToolsLuminaIcon name="more-horizontal" :size="16" /></button>
          <div v-if="showMenu === 'mobile'" class="glass-panel lum-menu">
            <button @click="goHome">Home (all courses)</button>
            <button @click="runSuggest">Suggest interactive blocks (AI)</button>
            <button @click="showMenu = null; themeOpen = true">Design: colors, fonts, motion</button>
            <button @click="gate('check')">Run course check</button>
            <button @click="openPreview">Preview player</button>
            <button @click="newCourse">New course</button>
            <label class="lum-menu-file">Open (.lumina / .sbf)<input type="file" accept=".lumina,.sbf,.json" @change="importFile"></label>
            <button @click="gate('html')">Export HTML</button>
            <button @click="gate('scorm')">Export SCORM (.zip)</button>
            <button @click="saveProjectFile">Save project (.lumina)</button>
          </div>
        </div>
      </header>

      <!-- Lesson strip -->
      <nav class="lum-lessons glass-panel" aria-label="Lessons" data-lenis-prevent>
        <button
          v-for="(lesson, i) in course.lessons" :key="lesson.id"
          class="lum-lessons__chip" :class="{ on: i === activeLessonIndex }"
          @click="activeLessonIndex = i"
        >
          <span class="lum-lessons__num">{{ i + 1 }}</span>
          {{ lesson.title || 'Untitled' }}
        </button>
        <button class="lum-lessons__manage" title="Manage lessons" @click="lessonsOpen = true"><ToolsLuminaIcon name="layers" :size="13" /></button>
      </nav>

      <!-- After a StoryGen import: invite the AI interactivity pass -->
      <Transition name="lum-offer">
        <div v-if="aiOffer" class="lum-offer glass-panel">
          <span class="lum-offer__spark"><ToolsLuminaIcon name="sparkle" :size="15" /></span>
          <p class="lum-offer__text">
            <strong>Make it an interactive course?</strong>
            AI can suggest knowledge checks, flashcards and scenarios where they fit.
          </p>
          <div class="lum-offer__actions">
            <button class="glass-btn lum-offer__go" @click="runSuggest"><ToolsLuminaIcon name="sparkle" :size="12" /> Suggest blocks</button>
            <button class="lum-tool" @click="aiOffer = false">Not now</button>
          </div>
        </div>
      </Transition>

      <!-- Canvas: the course page, as it will export -->
      <div class="lum-canvas" data-lenis-prevent @click="selectedBlockId = null">
        <div class="lum-paper" :class="{ 'lum-paper--sharp': course.theme.corners === 'sharp' }" @click.stop>
          <div class="lum-paper__head">
            <span class="lum-paper__kicker">Lesson {{ activeLessonIndex + 1 }} of {{ course.lessons.length }}</span>
            <input
              v-model="activeLesson.title" class="lum-paper__title"
              placeholder="Name this lesson" aria-label="Lesson title"
            >
          </div>

          <TransitionGroup name="lum-block" tag="div" class="lum-paper__blocks">
            <ToolsLuminaBlockView
              v-for="(block, i) in activeLesson.blocks" :id="`lblk-${block.id}`" :key="block.id"
              :block="block"
              :selected="block.id === selectedBlockId"
              :first="i === 0"
              :last="i === activeLesson.blocks.length - 1"
              @select="selectedBlockId = block.id"
              @edit="editBlock(block.id)"
              @delete="deleteBlock(block.id)"
              @duplicate="duplicateBlock(block.id)"
              @move="(dir) => moveBlock(block.id, dir)"
            />
          </TransitionGroup>

          <div v-if="!activeLesson.blocks.length" class="lum-paper__blank">
            This lesson is empty. Add your first block. A heading is a good start.
          </div>

          <button class="lum-paper__add" @click="isDesktop ? undefined : (showPaletteSheet = true)">
            <template v-if="isDesktop">Pick a block from the left to add it here</template>
            <template v-else><ToolsLuminaIcon name="plus" :size="13" /> Add a block</template>
          </button>
        </div>
      </div>

      <!-- Left dock: block palette (desktop) -->
      <aside class="lum-dock glass-panel lum-desktop-only" data-lenis-prevent>
        <ToolsLuminaBlockPalette @add="addBlock" />
      </aside>

      <!-- Mobile bottom action bar -->
      <div class="lum-bottombar glass-panel lum-mobile-only">
        <button class="glass-btn lum-add-btn" @click="showPaletteSheet = true">+ Add block</button>
        <button class="lum-tool lum-tool--wide" @click="lessonsOpen = true">Lessons</button>
        <button class="lum-tool lum-tool--wide" @click="openPreview"><ToolsLuminaIcon name="eye" :size="13" /></button>
        <span class="lum-bottombar__meta">{{ totalBlocks }} blocks · {{ readingMinutes }} min</span>
      </div>

      <!-- Mobile: slim selected-block bar -->
      <Transition name="blockbar">
        <div v-if="selectedBlock && !isDesktop && !inspectorOpen" class="lum-blockbar glass-panel">
          <button class="lum-tool" title="Move up" @click="moveBlock(selectedBlock.id, -1)"><ToolsLuminaIcon name="arrow-up" :size="14" /></button>
          <button class="lum-tool" title="Move down" @click="moveBlock(selectedBlock.id, 1)"><ToolsLuminaIcon name="arrow-down" :size="14" /></button>
          <button class="glass-btn lum-blockbar__edit" @click="inspectorOpen = true"><ToolsLuminaIcon name="edit" :size="12" /> Edit</button>
          <button class="lum-tool" title="Duplicate" @click="duplicateBlock(selectedBlock.id)"><ToolsLuminaIcon name="duplicate" :size="14" /></button>
          <button class="lum-tool lum-blockbar__delete" title="Delete" @click="deleteBlock(selectedBlock.id)"><ToolsLuminaIcon name="trash" :size="14" /></button>
        </div>
      </Transition>

      <!-- Mobile palette sheet -->
      <Transition name="sheet">
        <div v-if="showPaletteSheet" class="lum-sheet-overlay" @click.self="showPaletteSheet = false">
          <div class="lum-sheet glass-panel" data-lenis-prevent>
            <div class="lum-sheet__head">
              <strong>Add a block</strong>
              <button class="lum-tool" aria-label="Close" @click="showPaletteSheet = false"><ToolsLuminaIcon name="close" :size="14" /></button>
            </div>
            <ToolsLuminaBlockPalette sheet @add="addBlock" />
          </div>
        </div>
      </Transition>

      <!-- Lessons manager sheet -->
      <Transition name="sheet">
        <div v-if="lessonsOpen" class="lum-sheet-overlay" @click.self="lessonsOpen = false">
          <div class="lum-sheet glass-panel" data-lenis-prevent>
            <div class="lum-sheet__head">
              <strong>Lessons</strong>
              <button class="lum-tool" aria-label="Close" @click="lessonsOpen = false"><ToolsLuminaIcon name="close" :size="14" /></button>
            </div>
            <div class="lum-lessonrows">
              <div v-for="(lesson, i) in course.lessons" :key="lesson.id" class="lum-lessonrow" :class="{ on: i === activeLessonIndex }">
                <button class="lum-lessonrow__num" :title="`Open lesson ${i + 1}`" @click="activeLessonIndex = i; lessonsOpen = false">{{ i + 1 }}</button>
                <input v-model="lesson.title" class="glass-field lum-lessonrow__name" placeholder="Lesson title">
                <button class="lum-tool" title="Move up" :disabled="i === 0" @click="moveLesson(i, -1)"><ToolsLuminaIcon name="arrow-up" :size="13" /></button>
                <button class="lum-tool" title="Move down" :disabled="i === course.lessons.length - 1" @click="moveLesson(i, 1)"><ToolsLuminaIcon name="arrow-down" :size="13" /></button>
                <button class="lum-tool" title="Duplicate lesson" @click="duplicateLesson(i)"><ToolsLuminaIcon name="duplicate" :size="13" /></button>
                <button class="lum-tool lum-lessonrow__del" title="Delete lesson" :disabled="course.lessons.length <= 1" @click="deleteLesson(i)"><ToolsLuminaIcon name="trash" :size="13" /></button>
              </div>
            </div>
            <button class="glass-btn glass-btn--ghost lum-lessonadd" @click="addLesson"><ToolsLuminaIcon name="plus" :size="13" /> Add lesson</button>
          </div>
        </div>
      </Transition>

      <!-- Design sheet: every visual decision the course carries -->
      <Transition name="sheet">
        <div v-if="themeOpen" class="lum-sheet-overlay" @click.self="themeOpen = false">
          <div class="lum-sheet glass-panel lum-sheet--narrow" data-lenis-prevent>
            <div class="lum-sheet__head">
              <strong>Design</strong>
              <button class="lum-tool" aria-label="Close" @click="themeOpen = false"><ToolsLuminaIcon name="close" :size="14" /></button>
            </div>

            <p class="glass-label">Accent color</p>
            <div class="lum-swatches">
              <button
                v-for="c in LUMINA_ACCENTS" :key="c"
                class="lum-swatch" :class="{ on: course.theme.accent.toLowerCase() === c.toLowerCase() }"
                :style="{ background: c }" :aria-label="`Accent ${c}`"
                @click="course.theme.accent = c"
              ><ToolsLuminaIcon v-if="course.theme.accent.toLowerCase() === c.toLowerCase()" name="check" :size="13" /></button>
              <label class="lum-swatch lum-swatch--custom" :style="{ background: course.theme.accent }" title="Pick any color">
                <input type="color" :value="course.theme.accent" aria-label="Custom accent color" @input="course.theme.accent = ($event.target as HTMLInputElement).value">
                <ToolsLuminaIcon name="edit" :size="12" />
              </label>
            </div>

            <p class="glass-label">Page palette</p>
            <div class="lum-canvases">
              <button
                v-for="id in LUMINA_CANVAS_ORDER" :key="id"
                class="lum-canvas-tile" :class="{ on: course.theme.canvas === id }"
                :style="{ background: LUMINA_CANVASES[id].paper, color: LUMINA_CANVASES[id].ink }"
                @click="course.theme.canvas = id"
              >
                <span class="lum-canvas-tile__bar" :style="{ background: LUMINA_CANVASES[id].ink }" />
                <span class="lum-canvas-tile__bar lum-canvas-tile__bar--soft" :style="{ background: LUMINA_CANVASES[id].ink }" />
                {{ LUMINA_CANVASES[id].label }}
              </button>
            </div>

            <div class="lum-design-row">
              <div>
                <label class="glass-label" for="lum-font-head">Heading font</label>
                <select id="lum-font-head" v-model="course.theme.headingFont" class="glass-field glass-select">
                  <option v-for="f in LUMINA_FONT_ORDER" :key="f" :value="f">{{ LUMINA_FONTS[f].label }}</option>
                </select>
              </div>
              <div>
                <label class="glass-label" for="lum-font-body">Body font</label>
                <select id="lum-font-body" v-model="course.theme.bodyFont" class="glass-field glass-select">
                  <option v-for="f in LUMINA_FONT_ORDER" :key="f" :value="f">{{ LUMINA_FONTS[f].label }}</option>
                </select>
              </div>
            </div>

            <p class="glass-label">Text size</p>
            <div class="lum-seg">
              <button
                v-for="(s, id) in LUMINA_SCALES" :key="id"
                :class="{ on: course.theme.scale === id }" @click="course.theme.scale = id"
              >{{ s.label }}</button>
            </div>

            <p class="glass-label">Corners</p>
            <div class="lum-seg">
              <button
                v-for="(c, id) in LUMINA_CORNERS" :key="id"
                :class="{ on: course.theme.corners === id }" @click="course.theme.corners = id"
              >{{ c.label }}</button>
            </div>

            <p class="glass-label">Motion</p>
            <div class="lum-seg">
              <button
                v-for="(m, id) in LUMINA_MOTIONS" :key="id"
                :class="{ on: course.theme.motion === id }" :title="m.hint"
                @click="course.theme.motion = id"
              >{{ m.label }}</button>
            </div>
            <p class="lum-design-hint">{{ LUMINA_MOTIONS[course.theme.motion].hint }}. Learners who prefer reduced motion always get the still version.</p>

            <p class="glass-label">Course description, shown on the cover</p>
            <textarea v-model="course.description" class="glass-field" rows="3" placeholder="One or two sentences on what this course delivers." />
          </div>
        </div>
      </Transition>

      <!-- StoryGen import picker -->
      <Transition name="sheet">
        <div v-if="storygenOpen" class="lum-sheet-overlay" @click.self="storygenOpen = false">
          <div class="lum-sheet glass-panel" data-lenis-prevent>
            <div class="lum-sheet__head">
              <strong>Convert a StoryGen storyboard</strong>
              <button class="lum-tool" aria-label="Close" @click="storygenOpen = false"><ToolsLuminaIcon name="close" :size="14" /></button>
            </div>
            <p class="lum-bridge-note">Each screen becomes course blocks; narration is resolved into on-screen text, the way a Rise-style course reads. The storyboard itself stays untouched.</p>
            <button
              v-for="p in storyShelf" :key="p.id"
              class="lum-storyrow" @click="importFromStorygen(p.id)"
            >
              <strong>{{ p.title || 'Untitled Storyboard' }}</strong>
              <span>{{ p.screens }} screens · {{ relTime(p.updated) }}</span>
            </button>
          </div>
        </div>
      </Transition>

      <!-- Inspector -->
      <ToolsLuminaInspectorPanel
        :block="inspectorOpen ? selectedBlock : null"
        @delete="selectedBlockId && deleteBlock(selectedBlockId)"
        @duplicate="selectedBlockId && duplicateBlock(selectedBlockId)"
        @close="inspectorOpen = false"
      />

      <div v-if="showMenu" class="lum-clickaway" @click="showMenu = null" />
    </div><!-- /editor -->

    <!-- StoryGen picker is also reachable from home -->
    <Transition name="sheet">
      <div v-if="storygenOpen && view === 'home'" class="lum-sheet-overlay" @click.self="storygenOpen = false">
        <div class="lum-sheet glass-panel" data-lenis-prevent>
          <div class="lum-sheet__head">
            <strong>Convert a StoryGen storyboard</strong>
            <button class="lum-tool" aria-label="Close" @click="storygenOpen = false"><ToolsLuminaIcon name="close" :size="14" /></button>
          </div>
          <p class="lum-bridge-note">Each screen becomes course blocks; narration is resolved into on-screen text, the way a Rise-style course reads. The storyboard itself stays untouched.</p>
          <button
            v-for="p in storyShelf" :key="p.id"
            class="lum-storyrow" @click="importFromStorygen(p.id)"
          >
            <strong>{{ p.title || 'Untitled Storyboard' }}</strong>
            <span>{{ p.screens }} screens · {{ relTime(p.updated) }}</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Preview: the genuine exported player in a device frame -->
    <Transition name="sheet">
      <div v-if="previewOpen" class="lum-preview">
        <div class="lum-preview__bar glass-panel">
          <strong>Preview</strong><span class="lum-preview__note lum-desktop-only">exactly the file learners will get</span>
          <div class="lum-seg lum-preview__devices lum-desktop-only">
            <button :class="{ on: previewDevice === 'phone' }" @click="previewDevice = 'phone'">Phone</button>
            <button :class="{ on: previewDevice === 'tablet' }" @click="previewDevice = 'tablet'">Tablet</button>
            <button :class="{ on: previewDevice === 'desktop' }" @click="previewDevice = 'desktop'">Full</button>
          </div>
          <button class="lum-tool" aria-label="Close preview" @click="previewOpen = false"><ToolsLuminaIcon name="close" :size="14" /></button>
        </div>
        <div class="lum-preview__stage" :class="`lum-preview__stage--${previewDevice}`">
          <iframe class="lum-preview__frame" :srcdoc="previewHtml" title="Course preview" sandbox="allow-scripts allow-popups" />
        </div>
      </div>
    </Transition>

    <!-- The gatekeeper's report -->
    <ToolsLuminaAuditSheet
      v-if="auditIssues"
      :issues="auditIssues"
      :export-label="actionLabels[pendingAction]"
      @close="auditIssues = null"
      @jump="onAuditJump"
      @proceed="onAuditProceed"
    />

    <!-- AI interactivity suggestions (review before applying) -->
    <ToolsLuminaAiSuggestSheet
      v-if="aiSuggestOpen"
      :state="aiState"
      :suggestions="aiSuggestions"
      :error-message="aiError"
      :course="course"
      @close="aiSuggestOpen = false"
      @apply="onSuggestApply"
      @retry="runSuggest"
    />

    <!-- Bring-your-own-key AI setup (shared with StoryGen) -->
    <ToolsStoryAiSetupSheet v-if="aiSetupOpen" @close="aiSetupOpen = false" />

    <Transition name="toast">
      <div v-if="toast" class="lum-toast glass-panel">{{ toast }}</div>
    </Transition>
  </div>
</template>

<style scoped>
/* ── Splash ── */
.lum-splash {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rem;
  cursor: pointer;
  overflow: hidden;
  background:
    radial-gradient(60% 50% at 50% 38%, color-mix(in srgb, #F08C4A 10%, transparent), transparent),
    var(--color-bg);
}
.lum-splash__orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(60rem);
  opacity: 0.35;
  pointer-events: none;
}
.lum-splash__orb--a {
  width: 340rem; height: 340rem;
  left: 8%; top: 12%;
  background: radial-gradient(circle, #F6C444, transparent 70%);
  animation: lum-orb-a 9s ease-in-out infinite;
}
.lum-splash__orb--b {
  width: 300rem; height: 300rem;
  right: 10%; bottom: 14%;
  background: radial-gradient(circle, #E15B8F, transparent 70%);
  animation: lum-orb-b 11s ease-in-out infinite;
}
@keyframes lum-orb-a {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(30rem, 20rem) scale(1.12); }
}
@keyframes lum-orb-b {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(-24rem, -18rem) scale(1.08); }
}
.lum-splash__mark {
  border-radius: 26rem;
  box-shadow: 0 34rem 80rem -30rem rgba(0, 0, 0, 0.55);
  animation: lum-splash-mark 0.9s var(--ease-spring) both;
}
@keyframes lum-splash-mark {
  from { opacity: 0; transform: scale(0.7) rotate(-6deg); }
  to   { opacity: 1; transform: none; }
}
.lum-splash__name {
  font-size: 34rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  background: linear-gradient(100deg, var(--color-text) 40%, #F6C444 52%, #E15B8F 64%, var(--color-text) 76%);
  background-size: 260% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: lum-splash-text 0.7s 0.25s var(--ease-spring) both, lum-shimmer 3.2s 1.1s ease-in-out infinite;
}
.lum-splash__tag {
  font-size: 13.5rem;
  opacity: 0.55;
  animation: lum-splash-text 0.7s 0.4s var(--ease-spring) both;
}
@keyframes lum-splash-text {
  from { opacity: 0; transform: translateY(12rem); }
  to   { opacity: 1; transform: none; }
}
@keyframes lum-shimmer {
  0%, 100% { background-position: 0% 0; }
  50%      { background-position: 100% 0; }
}
.lum-splash__loader {
  display: flex;
  gap: 6rem;
  height: 8rem;
  animation: lum-splash-text 0.6s 0.55s var(--ease-spring) both;
}
.lum-splash__loader i {
  width: 6rem; height: 6rem;
  border-radius: 999px;
  background: var(--color-text);
  opacity: 0.3;
  animation: lum-dot 1.1s ease-in-out infinite;
}
.lum-splash__loader i:nth-child(2) { animation-delay: 0.15s; }
.lum-splash__loader i:nth-child(3) { animation-delay: 0.3s; }
@keyframes lum-dot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
  30%           { transform: translateY(-6rem); opacity: 0.9; }
}
.splash-leave-active { transition: opacity 0.35s ease, transform 0.35s ease; }
.splash-leave-to { opacity: 0; transform: scale(1.04); }
@media (prefers-reduced-motion: reduce) {
  .lum-splash__orb { animation: none; }
  .lum-splash__name { animation: lum-splash-text 0.7s 0.25s var(--ease-spring) both; background: none; color: var(--color-text); }
  .lum-splash__loader i { animation: none; opacity: 0.6; }
}

/* ── Toast ── */
.lum-toast {
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
.lum-home {
  position: fixed;
  inset: 0;
  overflow-y: auto;
  z-index: 1;
  padding: calc(96rem + var(--safe-top)) 24rem calc(48rem + var(--safe-bottom));
}
.lum-home__inner { max-width: 980rem; margin: 0 auto; }
.lum-home__head {
  display: flex;
  align-items: center;
  gap: 18rem;
  margin-bottom: 26rem;
  animation: lum-rise 0.6s var(--ease-spring) both;
}
.lum-home__head svg { border-radius: 12rem; box-shadow: 0 18rem 40rem -18rem rgba(240, 140, 74, 0.5); }
.lum-home__head h1 { font-size: 30rem; font-weight: 800; letter-spacing: -0.04em; }
.lum-home__head p { font-size: 14rem; opacity: 0.6; margin-top: 4rem; line-height: 1.4; }
.lum-home__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10rem;
  margin-bottom: 30rem;
  animation: lum-rise 0.6s 0.08s var(--ease-spring) both;
}
.lum-home__new {
  border-color: color-mix(in srgb, #F08C4A 40%, var(--color-glass-border));
  box-shadow: 0 10rem 26rem -14rem color-mix(in srgb, #F08C4A 55%, transparent);
}
.lum-home__open, .lum-home__bridge { height: 40rem; }
.lum-home__label { margin-bottom: 10rem; animation: lum-rise 0.6s 0.14s var(--ease-spring) both; }
.lum-home__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280rem, 1fr));
  gap: 14rem;
}
@keyframes lum-rise {
  from { opacity: 0; transform: translateY(14rem); }
  to   { opacity: 1; transform: none; }
}
.lum-proj {
  position: relative;
  padding: 12rem;
  display: flex;
  flex-direction: column;
  gap: 11rem;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  animation: glass-rise 0.55s var(--ease-spring) both;
  animation-delay: calc(var(--proj-i, 0) * 0.05s);
}
@media (hover: hover) {
  .lum-proj:hover {
    transform: translateY(-4rem);
    border-color: color-mix(in srgb, var(--proj-accent, #F08C4A) 45%, var(--color-glass-border-hover));
    box-shadow: 0 22rem 48rem -22rem color-mix(in srgb, var(--proj-accent, #F08C4A) 35%, transparent);
  }
  .lum-proj:hover .lum-proj__del { opacity: 0.7; }
}
.lum-proj__swatch {
  height: 108rem;
  border-radius: 14rem;
  padding: 16rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10rem;
  background:
    radial-gradient(120% 140% at 15% 0%, color-mix(in srgb, var(--proj-accent, #F08C4A) 22%, transparent), transparent 60%),
    color-mix(in srgb, var(--color-text) 5%, transparent);
  border: 1px solid var(--color-divider);
}
.lum-proj__bar {
  display: block;
  height: 12rem;
  border-radius: 6rem;
  background: color-mix(in srgb, var(--proj-accent, #F08C4A) 55%, transparent);
}
.lum-proj__bar:nth-child(2) { width: 78%; opacity: 0.65; }
.lum-proj__bar:nth-child(3) { width: 56%; opacity: 0.4; }
.lum-proj__meta { display: flex; flex-direction: column; gap: 3rem; padding: 0 4rem 2rem; }
.lum-proj__meta strong { font-size: 15rem; letter-spacing: -0.02em; }
.lum-proj__meta span { font-size: 12rem; opacity: 0.6; }
.lum-proj__date { font-size: 11rem !important; opacity: 0.45 !important; }
.lum-proj__del {
  position: absolute;
  top: 10rem; right: 10rem;
  width: 24rem; height: 24rem;
  display: grid; place-items: center;
  border-radius: 999px;
  color: #ff8d8d;
  background: color-mix(in srgb, var(--color-bg) 60%, transparent);
  border: 1px solid var(--color-glass-border);
  opacity: 0;
  transition: opacity 0.15s ease;
}
@media (hover: none) { .lum-proj__del { opacity: 0.55; } }
.lum-home__empty { font-size: 14rem; opacity: 0.55; line-height: 1.5; max-width: 480rem; animation: lum-rise 0.6s 0.14s var(--ease-spring) both; }
@media (prefers-reduced-motion: reduce) {
  .lum-home__head, .lum-home__actions, .lum-home__label, .lum-proj, .lum-home__empty { animation: none; }
}
@media (max-width: 640px) {
  .lum-home { padding: calc(84rem + var(--safe-top)) 14rem calc(40rem + var(--safe-bottom)); }
  .lum-home__grid { grid-template-columns: 1fr; }
  .lum-home__head h1 { font-size: 25rem; }
}

/* ── Editor shell ── */
.lum-app {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 1;
}
.lum-desktop-only { display: flex; }
.lum-mobile-only { display: none; }

/* ── Top bar ── */
.lum-topbar {
  position: absolute;
  top: calc(12rem + var(--safe-top));
  left: 78rem;
  right: 78rem;
  display: flex;
  align-items: center;
  gap: 10rem;
  padding: 9rem 14rem;
  border-radius: 16rem;
  /* Above the floating inspector (z 25) so the export dropdown is never
     buried when a block is being edited. */
  z-index: 26;
}
.lum-wordmark {
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
@media (hover: hover) { .lum-wordmark:hover { background: color-mix(in srgb, var(--color-bg) 55%, transparent); } }
.lum-wordmark svg { border-radius: 5rem; display: block; }
.lum-title {
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
.lum-title:focus { background: color-mix(in srgb, var(--color-bg) 55%, transparent); }
.lum-saved {
  font-size: 10.5rem;
  font-weight: 600;
  opacity: 0;
  color: #3fbf6f;
  transition: opacity 0.3s ease;
  white-space: nowrap;
}
.lum-saved--on { opacity: 0.9; }
.lum-topbar__group { display: flex; align-items: center; gap: 6rem; }

.lum-tool {
  min-width: 30rem;
  height: 30rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5rem;
  padding: 0 8rem;
  border-radius: 9rem;
  font-size: 13rem;
  font-weight: 600;
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-bg) 45%, transparent);
  border: 1px solid var(--color-glass-border);
  transition: background 0.15s ease, opacity 0.15s ease;
}
@media (hover: hover) { .lum-tool:not(:disabled):hover { background: color-mix(in srgb, var(--color-bg) 65%, transparent); } }
.lum-tool:disabled { opacity: 0.3; cursor: default; }
.lum-tool--wide { font-size: 12rem; padding: 0 12rem; white-space: nowrap; }
.lum-tool--ai {
  border-color: color-mix(in srgb, #A78BFA 55%, transparent);
  background: color-mix(in srgb, #A78BFA 14%, transparent);
}
@media (hover: hover) { .lum-tool--ai:hover { background: color-mix(in srgb, #A78BFA 22%, transparent); } }
.lum-file-btn { position: relative; overflow: hidden; cursor: pointer; }
.lum-file-btn input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.lum-export-btn { padding: 8rem 16rem; font-size: 12.5rem; }

.lum-menu-wrap { position: relative; }
.lum-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8rem);
  min-width: 268rem;
  padding: 8rem;
  z-index: 26;
  display: flex;
  flex-direction: column;
}
.lum-menu button, .lum-menu-file {
  display: flex;
  align-items: center;
  gap: 8rem;
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
  .lum-menu button:hover, .lum-menu-file:hover { background: color-mix(in srgb, var(--color-bg) 60%, transparent); }
}
.lum-menu-file { overflow: hidden; }
.lum-menu-file input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.lum-clickaway { position: fixed; inset: 0; z-index: 19; }

/* ── AI interactivity offer banner ── */
.lum-offer {
  position: absolute;
  top: calc(108rem + var(--safe-top));
  left: 50%;
  transform: translateX(-50%);
  z-index: 16;
  width: min(560rem, calc(100vw - 220rem));
  display: flex;
  align-items: center;
  gap: 13rem;
  padding: 12rem 14rem;
  border-radius: 16rem;
  border-color: color-mix(in srgb, #A78BFA 40%, var(--color-glass-border));
}
.lum-offer__spark {
  width: 30rem; height: 30rem;
  display: grid; place-items: center;
  border-radius: 9rem;
  flex-shrink: 0;
  color: #fff;
  background: linear-gradient(135deg, #A78BFA, #E15B8F);
}
.lum-offer__text { font-size: 12.5rem; line-height: 1.45; margin-right: auto; }
.lum-offer__text strong { display: block; font-size: 13.5rem; letter-spacing: -0.01em; margin-bottom: 2rem; }
.lum-offer__actions { display: flex; align-items: center; gap: 7rem; flex-shrink: 0; }
.lum-offer__go { padding: 8rem 14rem; font-size: 12.5rem; }
.lum-offer-enter-active, .lum-offer-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.lum-offer-enter-from, .lum-offer-leave-to { opacity: 0; transform: translateX(-50%) translateY(-10rem); }

/* ── Lesson strip ── */
.lum-lessons {
  position: absolute;
  top: calc(64rem + var(--safe-top));
  left: 50%;
  transform: translateX(-50%);
  max-width: min(720rem, calc(100vw - 220rem));
  display: flex;
  align-items: center;
  gap: 6rem;
  padding: 6rem;
  border-radius: 999px;
  z-index: 15;
  overflow-x: auto;
  scrollbar-width: none;
}
.lum-lessons::-webkit-scrollbar { display: none; }
.lum-lessons__chip {
  display: inline-flex;
  align-items: center;
  gap: 7rem;
  padding: 6rem 12rem 6rem 6rem;
  border-radius: 999px;
  font-size: 12rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  opacity: 0.65;
  transition: background 0.15s ease, opacity 0.15s ease;
}
.lum-lessons__chip.on {
  opacity: 1;
  background: color-mix(in srgb, var(--color-text) 10%, transparent);
}
.lum-lessons__num {
  width: 20rem; height: 20rem;
  display: grid; place-items: center;
  border-radius: 999px;
  font-size: 10.5rem;
  font-weight: 700;
  background: color-mix(in srgb, var(--color-text) 12%, transparent);
}
.lum-lessons__chip.on .lum-lessons__num { background: var(--color-text); color: var(--color-bg); }
.lum-lessons__manage {
  width: 30rem; height: 30rem;
  display: grid; place-items: center;
  border-radius: 999px;
  color: var(--color-text);
  border: 1px solid var(--color-glass-border);
  flex-shrink: 0;
}

/* ── Canvas + paper ── */
.lum-canvas {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  padding: calc(116rem + var(--safe-top)) 24rem calc(60rem + var(--safe-bottom)) 220rem;
}
.lum-paper {
  max-width: 720rem;
  margin: 0 auto;
  background: var(--lum-paper);
  color: var(--lum-ink);
  font-family: var(--lum-body-font, var(--main-font));
  border-radius: 22rem;
  padding: clamp(24rem, 4vw, 48rem) clamp(18rem, 4vw, 56rem) 40rem;
  box-shadow: 0 40rem 110rem -50rem rgba(0, 0, 0, 0.55);
}
.lum-paper--sharp { border-radius: 8rem; }
.lum-paper :deep(.lb-hero h2),
.lum-paper :deep(.lb-quiz h3) {
  font-family: var(--lum-head-font, var(--main-font));
}
.lum-paper__head { margin-bottom: 20rem; }
.lum-paper__kicker {
  font-size: 11rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--lum-accent);
}
.lum-paper__title {
  width: 100%;
  border: 0;
  background: transparent;
  outline: none;
  margin-top: 6rem;
  font-weight: 700;
  font-size: 30rem;
  line-height: 1.15;
  font-family: var(--lum-head-font, var(--main-font));
  letter-spacing: -0.02em;
  color: var(--lum-ink);
  padding: 4rem 0;
}
.lum-paper__title::placeholder { color: color-mix(in srgb, var(--lum-ink) 30%, transparent); }
.lum-paper__blocks { display: flex; flex-direction: column; gap: 8rem; }
.lum-block-move { transition: transform 0.25s ease; }
.lum-block-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.lum-block-enter-from { opacity: 0; transform: translateY(10rem); }
.lum-block-leave-active { display: none; }
.lum-paper__blank {
  padding: 26rem 18rem;
  border: 1.5px dashed color-mix(in srgb, var(--lum-ink) 22%, transparent);
  border-radius: 14rem;
  font-size: 13.5rem;
  color: color-mix(in srgb, var(--lum-ink) 55%, transparent);
  text-align: center;
  line-height: 1.5;
}
.lum-paper__add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rem;
  width: 100%;
  margin-top: 14rem;
  padding: 13rem;
  border-radius: 12rem;
  border: 1.5px dashed color-mix(in srgb, var(--lum-ink) 25%, transparent);
  font-size: 12.5rem;
  font-weight: 600;
  color: color-mix(in srgb, var(--lum-ink) 50%, transparent);
  transition: border-color 0.15s ease, color 0.15s ease;
}
@media (hover: hover) { .lum-paper__add:hover { border-color: var(--lum-accent); color: var(--lum-accent); } }

/* ── Left dock ── */
.lum-dock {
  position: absolute;
  left: 14rem;
  top: calc(74rem + var(--safe-top));
  padding: 12rem 8rem;
  border-radius: 18rem;
  z-index: 15;
  max-height: calc(100dvh - 74rem - 30rem - var(--safe-top) - var(--safe-bottom));
  overflow-y: auto;
}

/* ── Mobile bars + sheets ── */
.lum-bottombar {
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
.lum-add-btn { padding: 10rem 16rem; font-size: 13rem; }
.lum-bottombar__meta { font-size: 11rem; font-weight: 600; opacity: 0.6; white-space: nowrap; margin-left: auto; }

.lum-blockbar {
  position: absolute;
  left: 10rem;
  right: 10rem;
  bottom: calc(66rem + var(--safe-bottom));
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9rem;
  padding: 9rem 12rem;
  border-radius: 14rem;
  z-index: 19;
}
.lum-blockbar__edit { padding: 8rem 14rem; font-size: 12rem; }
.lum-blockbar__delete { color: #ff8d8d; }
.blockbar-enter-active, .blockbar-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.blockbar-enter-from, .blockbar-leave-to { opacity: 0; transform: translateY(10rem); }

.lum-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 28;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.lum-sheet {
  width: 100%;
  border-radius: 22rem 22rem 0 0;
  padding: 16rem 16rem calc(20rem + var(--safe-bottom));
  max-height: 78dvh;
  overflow-y: auto;
}
.lum-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rem;
  font-size: 15rem;
}
@media (min-width: 900px) {
  .lum-sheet-overlay { align-items: center; padding: 20rem; }
  .lum-sheet { width: min(560rem, 100%); border-radius: 22rem; }
  .lum-sheet--narrow { width: min(440rem, 100%); }
}
.sheet-enter-active, .sheet-leave-active { transition: opacity 0.22s ease; }
.sheet-enter-active .lum-sheet, .sheet-leave-active .lum-sheet { transition: transform 0.26s var(--ease-expo-out); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .lum-sheet, .sheet-leave-to .lum-sheet { transform: translateY(60%); }
@media (min-width: 900px) {
  .sheet-enter-from .lum-sheet, .sheet-leave-to .lum-sheet { transform: translateY(16rem); }
}

/* Lessons manager */
.lum-lessonrows { display: flex; flex-direction: column; gap: 8rem; margin-bottom: 12rem; }
.lum-lessonrow { display: flex; align-items: center; gap: 6rem; }
.lum-lessonrow__num {
  width: 30rem; height: 30rem;
  display: grid; place-items: center;
  border-radius: 999px;
  font-size: 12rem;
  font-weight: 700;
  color: var(--color-text);
  border: 1px solid var(--color-glass-border);
  flex-shrink: 0;
}
.lum-lessonrow.on .lum-lessonrow__num { background: var(--color-text); color: var(--color-bg); }
.lum-lessonrow__name { padding: 9rem 12rem; }
.lum-lessonrow__del { color: #ff8d8d; }
.lum-lessonadd { width: 100%; }

/* Design sheet */
.lum-swatches { display: flex; flex-wrap: wrap; gap: 8rem; margin-bottom: 14rem; }
.lum-swatch {
  width: 34rem; height: 34rem;
  border-radius: 12rem;
  display: grid; place-items: center;
  color: #fff;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.lum-swatch.on { border-color: var(--color-text); }
@media (hover: hover) { .lum-swatch:hover { transform: scale(1.08); } }
.lum-swatch--custom { position: relative; overflow: hidden; border-style: dashed; border-color: var(--color-glass-border-hover); }
.lum-swatch--custom input {
  position: absolute;
  inset: -8rem;
  width: 200%;
  height: 200%;
  opacity: 0;
  cursor: pointer;
}
.lum-swatch--custom svg { pointer-events: none; filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6)); }

.lum-canvases {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8rem;
  margin-bottom: 14rem;
}
.lum-canvas-tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4rem;
  padding: 10rem 11rem 8rem;
  border-radius: 12rem;
  border: 2px solid var(--color-glass-border);
  font-size: 11.5rem;
  font-weight: 700;
  transition: transform 0.15s ease, border-color 0.15s ease;
}
.lum-canvas-tile.on { border-color: var(--color-text); }
@media (hover: hover) { .lum-canvas-tile:hover { transform: translateY(-2rem); } }
.lum-canvas-tile__bar { width: 70%; height: 5rem; border-radius: 3rem; opacity: 0.8; }
.lum-canvas-tile__bar--soft { width: 45%; opacity: 0.35; margin-bottom: 3rem; }

.lum-design-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10rem; margin-bottom: 14rem; }
.lum-design-row .glass-field { padding: 10rem 12rem; }
.lum-design-hint { font-size: 11.5rem; line-height: 1.5; opacity: 0.55; margin: -6rem 0 14rem; }
.lum-seg {
  display: flex;
  gap: 4rem;
  padding: 4rem;
  border-radius: 11rem;
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 40%, transparent);
  margin-bottom: 14rem;
}
.lum-seg button {
  flex: 1;
  padding: 8rem 6rem;
  border-radius: 8rem;
  font-size: 12.5rem;
  font-weight: 600;
  color: var(--color-text);
  opacity: 0.65;
  white-space: nowrap;
  transition: background 0.15s ease, opacity 0.15s ease;
}
.lum-seg button.on { opacity: 1; background: color-mix(in srgb, var(--color-text) 12%, transparent); }

/* StoryGen bridge sheet */
.lum-bridge-note { font-size: 12.5rem; line-height: 1.55; opacity: 0.65; margin-bottom: 12rem; }
.lum-storyrow {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  width: 100%;
  text-align: left;
  padding: 12rem 13rem;
  border-radius: 12rem;
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 40%, transparent);
  color: var(--color-text);
  margin-bottom: 8rem;
  transition: border-color 0.15s ease, background 0.15s ease;
}
@media (hover: hover) {
  .lum-storyrow:hover { background: color-mix(in srgb, var(--color-bg) 60%, transparent); border-color: var(--color-glass-border-hover); }
}
.lum-storyrow strong { font-size: 14rem; letter-spacing: -0.01em; }
.lum-storyrow span { font-size: 11.5rem; opacity: 0.55; }

/* ── Preview ── */
.lum-preview {
  position: fixed;
  inset: 0;
  z-index: 31;
  display: flex;
  flex-direction: column;
  background: color-mix(in srgb, var(--color-bg) 88%, transparent);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.lum-preview__bar {
  display: flex;
  align-items: center;
  gap: 12rem;
  /* Clears the site's round corner buttons, like the topbar does */
  margin: calc(12rem + var(--safe-top)) 78rem 10rem;
  padding: 10rem 14rem;
  border-radius: 14rem;
  font-size: 13rem;
}
.lum-preview__bar strong { font-size: 13rem; letter-spacing: -0.01em; flex-shrink: 0; }
.lum-preview__note { margin-right: auto; font-size: 11.5rem; opacity: 0.55; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lum-preview__devices { margin-bottom: 0; }
.lum-preview__stage {
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: center;
  padding: 0 14rem calc(14rem + var(--safe-bottom));
}
.lum-preview__frame {
  width: 100%;
  height: 100%;
  border: 1px solid var(--color-glass-border);
  border-radius: 18rem;
  background: var(--lum-paper, #faf7f2);
}
.lum-preview__stage--phone .lum-preview__frame { max-width: 400rem; }
.lum-preview__stage--tablet .lum-preview__frame { max-width: 768rem; }

/* ── Mobile layout ── */
@media (max-width: 899px) {
  .lum-desktop-only { display: none !important; }
  .lum-mobile-only { display: flex; }
  .lum-topbar { left: 72rem; right: 72rem; padding: 8rem 10rem; gap: 7rem; }
  .lum-wordmark__text { display: none; }
  .lum-wordmark { padding: 4rem; }
  .lum-title { font-size: 16px; min-width: 72rem; } /* ≥16px so iOS Safari doesn't zoom on focus */
  /* The phone topbar is ~246px wide — the saved flash costs more than it says */
  .lum-saved { display: none; }
  .lum-bottombar { display: flex; }
  .lum-menu { position: fixed; left: 12rem; right: 12rem; top: calc(64rem + var(--safe-top)); min-width: 0; }
  .lum-lessons {
    left: 10rem;
    right: 10rem;
    transform: none;
    max-width: none;
  }
  .lum-offer {
    left: 10rem;
    right: 10rem;
    width: auto;
    transform: none;
    flex-wrap: wrap;
  }
  .lum-offer__text { margin-right: 0; flex: 1 1 100%; }
  .lum-offer-enter-from, .lum-offer-leave-to { transform: translateY(-10rem); }
  .lum-canvas { padding: calc(118rem + var(--safe-top)) 10rem calc(150rem + var(--safe-bottom)); }
  .lum-paper { border-radius: 18rem; }
  .lum-paper__title { font-size: 24rem; }
  .lum-preview__stage--phone .lum-preview__frame,
  .lum-preview__stage--tablet .lum-preview__frame { max-width: none; }
  .lum-preview__bar { margin-left: 72rem; margin-right: 72rem; }
  .lum-preview__bar strong { margin-right: auto; }
}
</style>
