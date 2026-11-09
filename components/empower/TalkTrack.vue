<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useEmpowerVisit } from '~/composables/empower/visit'
import { saveBlob, saveText } from '~/utils/empower/download'
import {
  formatSeat,
  notesToDocx,
  notesToTxt,
  parseOutline,
  seatSeconds,
  slidesFromPptx,
  toSlideNotes,
  withSeconds,
  type SlideNote,
} from '~/utils/empower/talkTrack'

useEmpowerVisit('talk-track')

const outline = ref('')
const slides = ref<SlideNote[]>([])
const active = ref(0)
let ignoreOutline = false
const error = ref('')
const notice = ref('')
const working = ref(false)
let timer = 0

const current = computed(() => slides.value[active.value] ?? null)
const total = computed(() => formatSeat(seatSeconds(slides.value)))
const statusText = computed(() => {
  if (error.value) return error.value
  if (working.value) return 'Reading the deck.'
  if (!slides.value.length) return 'Drop a deck. Get words you’d actually say.'
  return `Total seat time ${total.value}. ${slides.value.length} slides.`
})

function applyOutline(value: string) {
  const parsed = parseOutline(value)
  slides.value = toSlideNotes(parsed)
  if (active.value >= slides.value.length) active.value = 0
}

watch(outline, value => {
  if (ignoreOutline) {
    ignoreOutline = false
    return
  }
  window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    error.value = ''
    applyOutline(value)
  }, 300)
})

async function onFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (ext !== 'pptx') {
    error.value = 'That file is not a PowerPoint file. Use a .pptx, or paste an outline.'
    return
  }
  working.value = true
  error.value = ''
  try {
    const parsed = await slidesFromPptx(await file.arrayBuffer())
    slides.value = toSlideNotes(parsed)
    if (outline.value) {
      ignoreOutline = true
      outline.value = ''
    }
    active.value = 0
    notice.value = `Read ${parsed.length} slides from ${file.name}. Nothing was uploaded.`
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'That deck could not be read.'
  } finally {
    working.value = false
  }
}

function updateNotes(value: string) {
  const slide = slides.value[active.value]
  if (!slide) return
  slide.notes = value
  slides.value = withSeconds(slides.value)
}

async function downloadTxt() {
  await saveText('talk-track.txt', notesToTxt(slides.value))
  notice.value = 'Downloaded talk-track.txt.'
}

async function downloadDocx() {
  working.value = true
  try {
    const blob = await notesToDocx(slides.value)
    await saveBlob('talk-track.docx', blob, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    notice.value = 'Downloaded talk-track.docx.'
  } catch {
    error.value = 'The notes could not be saved as a Word file.'
  } finally {
    working.value = false
  }
}
</script>

<template>
  <EmpowerShell
    title="Talk Track"
    deck="Drop a deck. Get words you’d actually say."
    :status-text="statusText"
    :busy="working"
    wide
  >
    <div class="em-stack">
      <div class="em-field">
        <label for="talk-outline">Outline</label>
        <textarea id="talk-outline" v-model="outline" class="em-textarea" spellcheck="true" placeholder="# Welcome&#10;Say hello and name the topic." />
      </div>
      <div class="em-field">
        <label for="talk-file">Or a .pptx</label>
        <input id="talk-file" class="em-file" type="file" accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation" @change="onFile">
      </div>
      <p v-if="error" class="em-error">{{ error }}</p>
      <p v-if="!slides.length" class="em-note">Paste an outline, or drop a deck. The notes stay in this browser.</p>

      <div v-if="slides.length" class="tt-split">
        <div class="tt-slides" role="list" aria-label="Slides">
          <button
            v-for="(slide, index) in slides"
            :key="slide.id"
            type="button"
            class="em-btn"
            :aria-current="index === active ? 'true' : undefined"
            @click="active = index"
          >
            <span>{{ slide.title }}</span>
            <span>{{ formatSeat(slide.seconds) }}</span>
          </button>
        </div>
        <div v-if="current" class="em-field">
          <label :for="`talk-notes-${current.id}`">Notes for {{ current.title }}</label>
          <textarea :id="`talk-notes-${current.id}`" class="em-textarea" :value="current.notes" @input="updateNotes($event.target.value)" />
        </div>
        <aside class="em-stack" aria-label="Timing">
          <p class="tt-time"><strong>Total seat time</strong><br>{{ total }}</p>
          <p class="em-note">Timed at a calm 150 words a minute. Eight seconds is the shortest a slide with words will get.</p>
          <button type="button" class="em-btn em-btn--primary" @click="downloadTxt">Download .txt</button>
          <button type="button" class="em-btn" :disabled="working" @click="downloadDocx">Download .docx</button>
        </aside>
      </div>
      <p v-if="notice" class="em-status" role="status">{{ notice }}</p>
    </div>
  </EmpowerShell>
</template>
