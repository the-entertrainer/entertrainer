import { computed } from 'vue'
import type { Block, BlockType, Lesson } from '~/types/lesson'
import {
  COURSE_STUDIO_STORAGE_KEY,
  blankLesson,
  blockLabel,
  cloneBlock,
  cloneLesson,
  createBlock,
  fileSlug,
  newId,
  parseLessonDocument,
  sampleLesson,
  serializeLessonDocument,
  toDocument,
} from '~/utils/elearn/document'

const HISTORY_LIMIT = 50

let bootError = ''
let editing = false
let beforeEdit: Lesson | null = null
let saveTimer = 0

function readStoredLesson(): Lesson | null {
  if (!import.meta.client) return null
  const raw = localStorage.getItem(COURSE_STUDIO_STORAGE_KEY)
  if (!raw) return null
  try {
    return parseLessonDocument(JSON.parse(raw)).lesson
  } catch {
    bootError = 'The saved lesson could not be read. Showing the sample lesson.'
    return null
  }
}

function starterLesson(): Lesson {
  return readStoredLesson() ?? sampleLesson()
}

export function takeBootError(): string {
  const message = bootError
  bootError = ''
  return message
}

export function useCourseStudio() {
  const lesson = useState<Lesson>('cs-lesson', starterLesson)
  const selectedId = useState<string | null>('cs-selected', () => lesson.value.blocks[0]?.id ?? null)
  const past = useState<Lesson[]>('cs-past', () => [])
  const future = useState<Lesson[]>('cs-future', () => [])
  const saveState = useState<'idle' | 'saving' | 'saved' | 'error'>('cs-save', () => 'idle')
  const mode = useState<'edit' | 'preview'>('cs-mode', () => 'edit')
  const device = useState<'desktop' | 'tablet' | 'mobile'>('cs-device', () => 'desktop')
  const menuOpen = useState('cs-menu', () => false)
  const insertAt = useState('cs-insert', () => 0)
  const importError = useState('cs-import-error', () => '')
  const bootMessage = useState('cs-boot', () => bootError)
  const announcement = useState('cs-announce', () => '')
  const fieldEdit = useState('cs-field-edit', () => false)
  const draggingId = useState<string | null>('cs-dragging', () => null)
  const dropIndex = useState('cs-drop', () => -1)

  const selected = computed(() => lesson.value.blocks.find(block => block.id === selectedId.value) ?? null)
  const canUndo = computed(() => past.value.length > 0 || fieldEdit.value)
  const canRedo = computed(() => future.value.length > 0)
  const selectedIndex = computed(() => lesson.value.blocks.findIndex(block => block.id === selectedId.value))
  const canMoveUp = computed(() => selectedIndex.value > 0)
  const canMoveDown = computed(() => selectedIndex.value >= 0 && selectedIndex.value < lesson.value.blocks.length - 1)
  const saveLabel = computed(() => {
    if (saveState.value === 'saving') return 'Saving…'
    if (saveState.value === 'saved') return 'Saved'
    if (saveState.value === 'error') return 'Could not save in this browser'
    return 'Autosave on'
  })

  function announce(message: string) {
    announcement.value = ''
    if (import.meta.client) {
      window.setTimeout(() => {
        announcement.value = message
      }, 30)
    } else {
      announcement.value = message
    }
  }

  function pushPast(snapshot: Lesson) {
    past.value.push(snapshot)
    if (past.value.length > HISTORY_LIMIT) {
      past.value.splice(0, past.value.length - HISTORY_LIMIT)
    }
    future.value = []
  }

  function flushSave() {
    if (!import.meta.client) return
    window.clearTimeout(saveTimer)
    try {
      localStorage.setItem(COURSE_STUDIO_STORAGE_KEY, serializeLessonDocument(toDocument(lesson.value)))
      saveState.value = 'saved'
    } catch {
      saveState.value = 'error'
    }
  }

  function scheduleSave() {
    if (!import.meta.client) return
    saveState.value = 'saving'
    window.clearTimeout(saveTimer)
    saveTimer = window.setTimeout(flushSave, 300)
  }

  function beginEdit() {
    if (editing) return
    editing = true
    fieldEdit.value = true
    beforeEdit = cloneLesson(lesson.value)
  }

  function endEdit() {
    if (!editing) return
    editing = false
    fieldEdit.value = false
    const snapshot = beforeEdit
    beforeEdit = null
    if (!snapshot) return
    if (JSON.stringify(snapshot) !== JSON.stringify(lesson.value)) {
      pushPast(snapshot)
      flushSave()
    }
  }

  function mutate(fn: () => void) {
    endEdit()
    const snapshot = cloneLesson(lesson.value)
    fn()
    if (JSON.stringify(snapshot) !== JSON.stringify(lesson.value)) {
      pushPast(snapshot)
      flushSave()
    }
  }

  function keepSelection() {
    if (selectedId.value && lesson.value.blocks.some(block => block.id === selectedId.value)) return
    selectedId.value = lesson.value.blocks[0]?.id ?? null
  }

  function undo() {
    endEdit()
    const prev = past.value.pop()
    if (!prev) {
      announce('Nothing to undo')
      return
    }
    future.value.push(cloneLesson(lesson.value))
    lesson.value = prev
    keepSelection()
    flushSave()
    announce('Undid last change')
  }

  function redo() {
    endEdit()
    const next = future.value.pop()
    if (!next) {
      announce('Nothing to redo')
      return
    }
    past.value.push(cloneLesson(lesson.value))
    if (past.value.length > HISTORY_LIMIT) past.value.splice(0, past.value.length - HISTORY_LIMIT)
    lesson.value = next
    keepSelection()
    flushSave()
    announce('Redid last change')
  }

  function replaceLesson(next: Lesson, select: string | null) {
    endEdit()
    const snapshot = cloneLesson(lesson.value)
    const incoming = cloneLesson(next)
    if (JSON.stringify(snapshot) !== JSON.stringify(incoming)) pushPast(snapshot)
    lesson.value = incoming
    selectedId.value = select
    keepSelection()
    flushSave()
  }

  function newLesson() {
    const next = blankLesson()
    replaceLesson(next, next.blocks[0]?.id ?? null)
    announce('Started a new lesson')
  }

  function openSample() {
    const next = sampleLesson()
    replaceLesson(next, next.blocks[0]?.id ?? null)
    announce('Opened the sample lesson')
  }

  function openMenu(at: number) {
    insertAt.value = Math.max(0, Math.min(at, lesson.value.blocks.length))
    menuOpen.value = true
  }

  function closeMenu() {
    menuOpen.value = false
  }

  function addBlock(type: BlockType) {
    const block = createBlock(type)
    const at = insertAt.value
    mutate(() => {
      const index = Math.max(0, Math.min(at, lesson.value.blocks.length))
      lesson.value.blocks.splice(index, 0, block)
    })
    selectedId.value = block.id
    menuOpen.value = false
    announce(`Added ${blockLabel(type)}`)
    return block.id
  }

  function duplicateBlock(id = selectedId.value) {
    if (!id) return
    const index = lesson.value.blocks.findIndex(block => block.id === id)
    if (index < 0) return
    const copy = cloneBlock(lesson.value.blocks[index] as Block)
    mutate(() => {
      const current = lesson.value.blocks.findIndex(block => block.id === id)
      if (current < 0) return
      lesson.value.blocks.splice(current + 1, 0, copy)
    })
    selectedId.value = copy.id
    announce(`Duplicated ${blockLabel(copy.type)}`)
  }

  function deleteBlock(id = selectedId.value) {
    if (!id) return
    const index = lesson.value.blocks.findIndex(block => block.id === id)
    if (index < 0) return
    const label = blockLabel(lesson.value.blocks[index].type)
    mutate(() => {
      const current = lesson.value.blocks.findIndex(block => block.id === id)
      if (current >= 0) lesson.value.blocks.splice(current, 1)
    })
    const next = lesson.value.blocks[index] ?? lesson.value.blocks[index - 1]
    selectedId.value = next?.id ?? null
    announce(`Deleted ${label}`)
  }

  function reorder(id: string, finalIndex: number) {
    const from = lesson.value.blocks.findIndex(block => block.id === id)
    if (from < 0) return
    const moving = lesson.value.blocks[from]
    const rest = lesson.value.blocks.filter(block => block.id !== id)
    const index = Math.max(0, Math.min(finalIndex, rest.length))
    const next = rest.slice()
    next.splice(index, 0, moving)
    if (next.every((block, i) => block.id === lesson.value.blocks[i]?.id)) return
    mutate(() => {
      lesson.value.blocks.splice(0, lesson.value.blocks.length, ...next)
    })
    selectedId.value = id
    announce(`Moved ${blockLabel(moving.type)} to position ${index + 1} of ${next.length}`)
  }

  function moveBy(id: string, delta: -1 | 1) {
    const from = lesson.value.blocks.findIndex(block => block.id === id)
    if (from < 0) return
    const to = from + delta
    if (to < 0) {
      announce('Already at the top')
      return
    }
    if (to >= lesson.value.blocks.length) {
      announce('Already at the bottom')
      return
    }
    reorder(id, to)
  }

  function onDragStart(id: string, event: DragEvent) {
    draggingId.value = id
    dropIndex.value = -1
    event.dataTransfer?.setData('text/plain', id)
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(index: number, event: DragEvent) {
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
    dropIndex.value = index
  }

  function onDrop(index: number, event: DragEvent) {
    event.preventDefault()
    const id = event.dataTransfer?.getData('text/plain') || draggingId.value
    draggingId.value = null
    dropIndex.value = -1
    if (id) reorder(id, index)
  }

  function onDragEnd() {
    draggingId.value = null
    dropIndex.value = -1
  }

  function addStep(blockId: string) {
    mutate(() => {
      const block = findBlock(blockId)
      if (!block || block.type !== 'process') return
      block.steps.push({ label: '', detail: '' })
    })
    announce('Added a step')
  }

  function removeStep(blockId: string, index: number) {
    mutate(() => {
      const block = findBlock(blockId)
      if (!block || block.type !== 'process') return
      block.steps.splice(index, 1)
    })
    announce('Removed a step')
  }

  function addOption(blockId: string) {
    mutate(() => {
      const block = findBlock(blockId)
      if (!block || block.type !== 'knowledgeCheck') return
      const option = { id: newId('opt'), text: '' }
      block.options.push(option)
      if (!block.correctId) block.correctId = option.id
    })
    announce('Added an option')
  }

  function removeOption(blockId: string, index: number) {
    mutate(() => {
      const block = findBlock(blockId)
      if (!block || block.type !== 'knowledgeCheck') return
      const removed = block.options[index]
      block.options.splice(index, 1)
      if (removed && removed.id === block.correctId) block.correctId = block.options[0]?.id ?? ''
    })
    announce('Removed an option')
  }

  function addCard(blockId: string) {
    mutate(() => {
      const block = findBlock(blockId)
      if (!block || block.type !== 'flashcards') return
      block.cards.push({ id: newId('card'), front: '', back: '' })
    })
    announce('Added a card')
  }

  function removeCard(blockId: string, index: number) {
    mutate(() => {
      const block = findBlock(blockId)
      if (!block || block.type !== 'flashcards') return
      block.cards.splice(index, 1)
    })
    announce('Removed a card')
  }

  function addAccordionItem(blockId: string) {
    mutate(() => {
      const block = findBlock(blockId)
      if (!block || block.type !== 'accordion') return
      block.items.push({ title: '', content: '' })
    })
    announce('Added an item')
  }

  function removeAccordionItem(blockId: string, index: number) {
    mutate(() => {
      const block = findBlock(blockId)
      if (!block || block.type !== 'accordion') return
      block.items.splice(index, 1)
    })
    announce('Removed an item')
  }

  function addSource(blockId: string) {
    mutate(() => {
      const block = findBlock(blockId)
      if (!block || block.type !== 'sources') return
      const next = block.items.reduce((max, item) => Math.max(max, item.id), 0) + 1
      block.items.push({ id: next, title: '', source: '', href: '' })
    })
    announce('Added a source')
  }

  function removeSource(blockId: string, index: number) {
    mutate(() => {
      const block = findBlock(blockId)
      if (!block || block.type !== 'sources') return
      block.items.splice(index, 1)
    })
    announce('Removed a source')
  }

  function findBlock(id: string): Block | undefined {
    return lesson.value.blocks.find(block => block.id === id)
  }

  function setMinutes(value: string) {
    const parsed = Number(value)
    lesson.value.minutes = Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0
  }

  async function importFile(file: File) {
    let parsed: unknown
    try {
      parsed = JSON.parse(await file.text())
    } catch {
      importError.value = 'That file is not valid JSON.'
      return
    }
    try {
      const document = parseLessonDocument(parsed)
      importError.value = ''
      replaceLesson(document.lesson, document.lesson.blocks[0]?.id ?? null)
      mode.value = 'edit'
      announce('Imported lesson')
    } catch (error) {
      importError.value = error instanceof Error ? error.message : 'That file is not a lesson this editor can read.'
    }
  }

  function exportJson() {
    if (!import.meta.client) return
    endEdit()
    const lessonDocument = toDocument(lesson.value)
    const blob = new Blob([serializeLessonDocument(lessonDocument, true)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = window.document.createElement('a')
    link.href = url
    link.download = `${fileSlug(lesson.value.slug)}.json`
    window.document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1500)
    announce('Exported lesson JSON')
  }

  function togglePreview() {
    mode.value = mode.value === 'preview' ? 'edit' : 'preview'
  }

  return {
    lesson,
    selectedId,
    selected,
    selectedIndex,
    past,
    future,
    saveState,
    saveLabel,
    mode,
    device,
    menuOpen,
    insertAt,
    importError,
    bootMessage,
    announcement,
    fieldEdit,
    draggingId,
    dropIndex,
    canUndo,
    canRedo,
    canMoveUp,
    canMoveDown,
    announce,
    scheduleSave,
    flushSave,
    beginEdit,
    endEdit,
    undo,
    redo,
    newLesson,
    openSample,
    openMenu,
    closeMenu,
    addBlock,
    duplicateBlock,
    deleteBlock,
    reorder,
    moveBy,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    addStep,
    removeStep,
    addOption,
    removeOption,
    addCard,
    removeCard,
    addAccordionItem,
    removeAccordionItem,
    addSource,
    removeSource,
    setMinutes,
    importFile,
    exportJson,
    togglePreview,
  }
}
