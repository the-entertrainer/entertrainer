<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useEmpowerVisit } from '~/composables/empower/visit'
import { copyText, saveText } from '~/utils/empower/download'
import { kvGet, kvSet } from '~/utils/empower/db'
import { analyzeSpeak, speakStatus, type SpeakReport } from '~/utils/empower/plainSpeak'

useEmpowerVisit('plain-speak')

const text = ref('')
const error = ref('')
const notice = ref('')
const report = ref<SpeakReport | null>(null)
const truncated = ref(false)
let dirty = false
let ready = false
let timer = 0

const statusText = computed(() => error.value || speakStatus(report.value, truncated.value))

function run(value: string) {
  truncated.value = value.length > 50_000
  error.value = ''
  report.value = analyzeSpeak(value)
}

function schedule(value: string) {
  window.clearTimeout(timer)
  timer = window.setTimeout(() => run(value), 300)
}

watch(text, value => {
  dirty = true
  if (ready) void kvSet('draft:plain-speak', value.slice(0, 50_000))
  schedule(value)
})

onMounted(async () => {
  const draft = await kvGet<string>('draft:plain-speak')
  if (typeof draft === 'string' && draft && !dirty) text.value = draft
  ready = true
  run(text.value)
})

async function onFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  error.value = ''
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  try {
    if (ext === 'txt' || file.type.startsWith('text/')) {
      text.value = await file.text()
      return
    }
    if (ext === 'docx') {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
      text.value = result.value || ''
      if (!text.value.trim()) error.value = 'That file had no readable text.'
      return
    }
    error.value = 'That file type is not supported. Use a .txt or a .docx.'
  } catch {
    error.value = 'That file could not be read.'
  }
}

async function copyPlain() {
  if (!report.value) return
  notice.value = await copyText(report.value.plain) ? 'Copied the plain rewrite.' : 'Copy failed. Select the plain rewrite and copy it yourself.'
}

async function downloadPlain() {
  if (!report.value) return
  await saveText('plain-speak.txt', report.value.plain)
  notice.value = 'Downloaded plain-speak.txt.'
}
</script>

<template>
  <EmpowerShell
    title="Plain-Speak Meter"
    deck="Paste a draft. We’ll mark the fog."
    :status-text="statusText"
    :busy="false"
    wide
  >
    <div class="ps-split">
      <div class="em-stack">
        <p v-if="!text.trim()" class="em-note">Paste anything you want clearer.</p>
        <div class="em-field">
          <label for="plain-draft">Draft</label>
          <textarea id="plain-draft" v-model="text" class="em-textarea" spellcheck="true" placeholder="Paste anything you want clearer" />
        </div>
        <div class="em-field">
          <label for="plain-file">Upload a .txt or .docx</label>
          <input id="plain-file" class="em-file" type="file" accept=".txt,.docx,text/plain" @change="onFile">
        </div>
        <p v-if="error" class="em-error">{{ error }}</p>
      </div>

      <div class="em-stack">
        <div v-if="report" class="em-score">
          <strong>Clarity {{ report.clarity ?? '—' }}</strong>
          <span>out of 100</span>
          <span v-if="report.grade != null">Grade {{ report.grade }}</span>
          <span>{{ report.words }} words</span>
        </div>
        <div v-if="report">
          <h2 class="em-h2">Marked draft</h2>
          <p class="em-read">
            <span v-for="(segment, index) in report.segments" :key="index" :class="{ 'em-mark em-mark--long': segment.long }">
              <template v-for="(part, partIndex) in segment.parts" :key="partIndex">
                <mark v-if="part.jargon" class="em-mark em-mark--jargon">{{ part.text }}</mark>
                <template v-else>{{ part.text }}</template>
              </template>
            </span>
          </p>
        </div>
        <div v-if="report?.issues.length">
          <h2 class="em-h2">Marks</h2>
          <ul class="em-issues">
            <li v-for="issue in report.issues" :key="issue.id">
              <span class="em-kicker">{{ issue.label }}</span>
              <span>{{ issue.excerpt }}</span>
            </li>
          </ul>
        </div>
        <div v-if="report" class="em-field">
          <label for="plain-out">Plain rewrite</label>
          <textarea id="plain-out" class="em-textarea" readonly :value="report.plain" />
        </div>
        <div v-if="report" class="em-row-actions">
          <button type="button" class="em-btn em-btn--primary" @click="copyPlain">Copy plain text</button>
          <button type="button" class="em-btn" @click="downloadPlain">Download .txt</button>
        </div>
        <p v-if="notice" class="em-status" role="status">{{ notice }}</p>
        <p v-if="truncated" class="em-note">Only the first 50,000 characters are scored.</p>
      </div>
    </div>
  </EmpowerShell>
</template>
