<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { BlockType } from '~/types/lesson'
import { BLOCK_MENU } from '~/utils/elearn/document'
import { takeBootError, useCourseStudio } from '~/composables/useCourseStudio'
import LessonPlayer from '~/components/elearn/LessonPlayer.vue'
import Outline from './Outline.vue'
import Canvas from './Canvas.vue'
import SettingsPanel from './SettingsPanel.vue'
import '~/assets/css/course-studio.css'

const studio = useCourseStudio()
const {
  lesson,
  selectedId,
  mode,
  device,
  menuOpen,
  importError,
  bootMessage,
  announcement,
  saveState,
  saveLabel,
  canUndo,
  canRedo,
  canMoveUp,
  canMoveDown,
  scheduleSave,
  flushSave,
  beginEdit,
  endEdit,
  undo,
  redo,
  newLesson,
  openSample,
  closeMenu,
  addBlock,
  duplicateBlock,
  deleteBlock,
  moveBy,
  importFile,
  exportJson,
  togglePreview,
} = studio

const pendingBoot = takeBootError()
if (pendingBoot) bootMessage.value = pendingBoot

const outlineOpen = ref(false)
const settingsOpen = ref(false)
const dialogRef = ref<HTMLElement | null>(null)
const fileRef = ref<HTMLInputElement | null>(null)

watch(lesson, () => scheduleSave(), { deep: true })

watch(menuOpen, (open) => {
  nextTick(() => {
    if (open) {
      dialogRef.value?.querySelector<HTMLElement>('button')?.focus()
      return
    }
    const active = document.activeElement
    const root = document.getElementById('cs-root')
    if (!active || active === document.body || (root && !root.contains(active))) {
      document.getElementById('cs-add-block')?.focus()
    }
  })
})

watch(selectedId, (id) => {
  if (!id || mode.value === 'preview') return
  nextTick(() => {
    document.getElementById(`block-option-${id}`)?.scrollIntoView({ block: 'nearest' })
    document.getElementById(`block-card-${id}`)?.scrollIntoView({ block: 'nearest' })
  })
})

function onFocusIn(event: FocusEvent) {
  const target = event.target
  if (!(target instanceof HTMLElement)) return
  if (!target.matches('input, textarea, select')) return
  if (target.closest('[data-lesson-field]')) selectedId.value = null
  const holder = target.closest('[data-block-id]')
  const id = holder?.getAttribute('data-block-id')
  if (id) selectedId.value = id
  beginEdit()
}

function onFocusOut(event: FocusEvent) {
  const target = event.target
  if (!(target instanceof HTMLElement)) return
  if (target.matches('input, textarea, select')) endEdit()
}

function onKey(event: KeyboardEvent) {
  if (!(event.metaKey || event.ctrlKey)) return
  const key = event.key.toLowerCase()
  if (key === 'z') {
    event.preventDefault()
    if (event.shiftKey) redo()
    else undo()
  } else if (key === 'y') {
    event.preventDefault()
    redo()
  }
}

function onDialogKey(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    closeMenu()
    return
  }
  if (event.key !== 'Tab' || !dialogRef.value) return
  const items = [...dialogRef.value.querySelectorAll<HTMLElement>('button')]
  const first = items[0]
  const last = items[items.length - 1]
  if (!first || !last) return
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function openAddMenu() {
  const index = lesson.value.blocks.findIndex(block => block.id === selectedId.value)
  studio.openMenu(index < 0 ? lesson.value.blocks.length : index + 1)
}

function moveSelected(delta: -1 | 1) {
  if (selectedId.value) moveBy(selectedId.value, delta)
}

function choose(type: BlockType) {
  const id = addBlock(type)
  nextTick(() => {
    document.getElementById(`block-card-${id}`)?.querySelector<HTMLElement>('input, textarea, select')?.focus()
  })
}

function toggleOutline() {
  outlineOpen.value = !outlineOpen.value
  if (outlineOpen.value) settingsOpen.value = false
}

function toggleSettings() {
  settingsOpen.value = !settingsOpen.value
  if (settingsOpen.value) outlineOpen.value = false
}

async function onImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) await importFile(file)
}

function onPageHide() {
  flushSave()
}

onMounted(() => {
  window.addEventListener('pagehide', onPageHide)
})

onBeforeUnmount(() => {
  flushSave()
  window.removeEventListener('pagehide', onPageHide)
})
</script>

<template>
  <div id="cs-root" class="cs" @focusin="onFocusIn" @focusout="onFocusOut" @keydown="onKey">
    <p class="sr-only" aria-live="polite">{{ announcement }}</p>
    <header class="cs-bar">
      <div class="cs-brand">
        <NuxtLink to="/empower" class="cs-kicker">Empower</NuxtLink>
        <h1>Course Studio</h1>
      </div>
      <p class="cs-save" :class="{ 'is-error': saveState === 'error' }" role="status">{{ saveLabel }}</p>
      <div class="cs-groups">
        <div class="cs-group" role="group" aria-label="History">
          <button type="button" aria-keyshortcuts="Control+Z" :disabled="!canUndo" @click="undo">Undo</button>
          <button type="button" aria-keyshortcuts="Control+Y Control+Shift+Z" :disabled="!canRedo" @click="redo">Redo</button>
        </div>
        <div class="cs-group" role="group" aria-label="Blocks">
          <button id="cs-add-block" type="button" class="cs-primary" aria-haspopup="dialog" @click="openAddMenu">Add block</button>
          <button type="button" :disabled="!canMoveUp" @click="moveSelected(-1)">Move up</button>
          <button type="button" :disabled="!canMoveDown" @click="moveSelected(1)">Move down</button>
          <button type="button" :disabled="!selectedId" @click="duplicateBlock()">Duplicate</button>
          <button type="button" :disabled="!selectedId" @click="deleteBlock()">Delete block</button>
        </div>
        <div class="cs-group" role="group" aria-label="File">
          <button type="button" @click="newLesson">New lesson</button>
          <button type="button" @click="openSample">Open sample</button>
          <button type="button" @click="fileRef?.click()">Import JSON</button>
          <button type="button" class="cs-primary" @click="exportJson">Export JSON</button>
          <input ref="fileRef" tabindex="-1" aria-hidden="true" class="sr-only" type="file" accept="application/json,.json" @change="onImport">
        </div>
        <div class="cs-group" role="group" aria-label="View">
          <button type="button" class="cs-narrow" :aria-expanded="outlineOpen" aria-controls="cs-outline" @click="toggleOutline">Outline</button>
          <button type="button" class="cs-narrow" :aria-expanded="settingsOpen" aria-controls="cs-settings" @click="toggleSettings">Settings</button>
          <button type="button" :aria-pressed="mode === 'preview'" @click="togglePreview">Preview</button>
          <div v-if="mode === 'preview'" class="cs-group" role="group" aria-label="Preview width">
            <button type="button" :aria-pressed="device === 'desktop'" @click="device = 'desktop'">Desktop</button>
            <button type="button" :aria-pressed="device === 'tablet'" @click="device = 'tablet'">Tablet</button>
            <button type="button" :aria-pressed="device === 'mobile'" @click="device = 'mobile'">Mobile</button>
          </div>
        </div>
      </div>
    </header>

    <p v-if="bootMessage" class="cs-alert" role="alert">
      <span>{{ bootMessage }}</span>
      <button type="button" @click="bootMessage = ''">Dismiss</button>
    </p>
    <p v-if="importError" class="cs-alert" role="alert">
      <span>{{ importError }}</span>
      <button type="button" @click="importError = ''">Dismiss</button>
    </p>

    <div v-if="mode === 'preview'" class="cs-stage">
      <div class="cs-frame" :data-device="device">
        <LessonPlayer :lesson="lesson" embedded />
      </div>
    </div>
    <div v-else class="cs-body">
      <Outline :open="outlineOpen" @picked="outlineOpen = false" @close="outlineOpen = false" />
      <Canvas />
      <SettingsPanel :open="settingsOpen" @close="settingsOpen = false" />
    </div>

    <div v-if="menuOpen" class="cs-modal" @click.self="closeMenu">
      <div
        ref="dialogRef"
        class="cs-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-block-title"
        @keydown="onDialogKey"
      >
        <h2 id="add-block-title">Add a block</h2>
        <ul class="cs-menu">
          <li v-for="item in BLOCK_MENU" :key="item.type">
            <button type="button" :aria-describedby="`hint-${item.type}`" @click="choose(item.type)">{{ item.label }}</button>
            <p :id="`hint-${item.type}`" class="cs-hint">{{ item.hint }}</p>
          </li>
        </ul>
        <button type="button" @click="closeMenu">Cancel</button>
      </div>
    </div>
  </div>
</template>
