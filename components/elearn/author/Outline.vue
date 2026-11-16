<script setup lang="ts">
import { ref } from 'vue'
import { blockSummary } from '~/utils/elearn/document'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ picked: []; close: [] }>()

const {
  lesson,
  selectedId,
  draggingId,
  dropIndex,
  deleteBlock,
  moveBy,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
} = useCourseStudio()

const listRef = ref<HTMLElement | null>(null)

function pick(id: string) {
  selectedId.value = id
  listRef.value?.focus()
  emit('picked')
}

function onListKey(event: KeyboardEvent) {
  const ids = lesson.value.blocks.map(block => block.id)
  if (!ids.length) return
  const index = selectedId.value ? ids.indexOf(selectedId.value) : -1
  if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
    event.preventDefault()
    moveBy(selectedId.value ?? ids[0], event.key === 'ArrowUp' ? -1 : 1)
    return
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedId.value = ids[Math.min(ids.length - 1, index + 1)] ?? ids[0]
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedId.value = ids[Math.max(0, index <= 0 ? 0 : index - 1)] ?? ids[0]
  } else if (event.key === 'Home') {
    event.preventDefault()
    selectedId.value = ids[0]
  } else if (event.key === 'End') {
    event.preventDefault()
    selectedId.value = ids[ids.length - 1]
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    if (selectedId.value) deleteBlock(selectedId.value)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    const id = selectedId.value
    if (!id) return
    document.getElementById(`block-card-${id}`)?.querySelector<HTMLElement>('input, textarea, select')?.focus()
  }
}
</script>

<template>
  <aside id="cs-outline" class="cs-outline" :class="{ 'is-open': open }">
    <div class="cs-pane-head">
      <h2>Outline</h2>
      <button type="button" class="cs-drawer-close" @click="emit('close')">Close</button>
    </div>
    <p id="block-list-help" class="cs-help">Arrow keys move through the list. Alt and the arrow keys reorder. Delete removes the selected block.</p>
    <button type="button" class="cs-lesson-btn" :aria-pressed="selectedId === null" @click="selectedId = null">Lesson details</button>
    <div
      ref="listRef"
      class="cs-list"
      role="listbox"
      tabindex="0"
      aria-label="Lesson blocks"
      aria-describedby="block-list-help"
      aria-orientation="vertical"
      :aria-activedescendant="selectedId ? `block-option-${selectedId}` : undefined"
      @keydown="onListKey"
    >
      <div
        v-for="(block, index) in lesson.blocks"
        :id="`block-option-${block.id}`"
        :key="block.id"
        class="cs-option"
        role="option"
        :aria-selected="selectedId === block.id"
        :aria-posinset="index + 1"
        :aria-setsize="lesson.blocks.length"
        draggable="true"
        :class="{ 'is-drop': dropIndex === index, 'is-dragging': draggingId === block.id }"
        @click="pick(block.id)"
        @dragstart="onDragStart(block.id, $event)"
        @dragover="onDragOver(index, $event)"
        @drop="onDrop(index, $event)"
        @dragend="onDragEnd"
      >
        {{ blockSummary(block) }}
      </div>
    </div>
  </aside>
</template>
