<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEmpowerVisit } from '~/composables/empower/visit'
import { ACCESS_DISCLAIMER, checkDocx, checkPdf, reportToJson, reportToText, type AccessReport } from '~/utils/empower/accessCheck'
import { saveText } from '~/utils/empower/download'

useEmpowerVisit('access-check')

const report = ref<AccessReport | null>(null)
const error = ref('')
const working = ref(false)
const notice = ref('')

const statusText = computed(() => {
  if (error.value) return error.value
  if (working.value) return 'Checking the file.'
  if (!report.value) return 'A first pass before the formal audit.'
  if (!report.value.issues.length) return 'No issues in this pass. This is still not a certificate.'
  return `${report.value.issues.length} issues. ${report.value.issues.filter(issue => issue.severity === 'serious').length} serious.`
})

async function onFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (ext !== 'pdf' && ext !== 'docx') {
    error.value = 'Use a .pdf or a .docx.'
    report.value = null
    return
  }
  working.value = true
  error.value = ''
  notice.value = ''
  report.value = null
  try {
    const buffer = await file.arrayBuffer()
    report.value = ext === 'pdf' ? await checkPdf(file.name, buffer) : await checkDocx(file.name, buffer)
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    error.value = /password/i.test(message)
      ? 'That PDF is password-protected.'
      : 'That file could not be checked.'
  } finally {
    working.value = false
  }
}

async function download(kind: 'txt' | 'json') {
  if (!report.value) return
  const body = kind === 'json' ? reportToJson(report.value) : reportToText(report.value)
  await saveText(kind === 'json' ? 'access-report.json' : 'access-report.txt', body)
  notice.value = kind === 'json' ? 'Downloaded access-report.json.' : 'Downloaded access-report.txt.'
}
</script>

<template>
  <EmpowerShell
    title="Access Check"
    deck="A first pass before the formal audit."
    :status-text="statusText"
    :busy="working"
    wide
  >
    <div class="em-stack">
      <p>{{ ACCESS_DISCLAIMER }}</p>
      <div class="em-field">
        <label for="access-file">PDF or Word file</label>
        <input id="access-file" class="em-file" type="file" accept=".pdf,.docx,application/pdf" @change="onFile">
      </div>
      <p v-if="working" class="em-note">Checking the file…</p>
      <p v-if="error" class="em-error">{{ error }}</p>
      <p v-if="report && !report.issues.length" class="em-note">No issues in this pass. This is still not a certificate.</p>
      <ul v-if="report?.issues.length" class="em-issues" aria-label="Issues">
        <li v-for="(issue, index) in report.issues" :key="index">
          <span class="em-sev" :class="`em-sev--${issue.severity}`">{{ issue.severity }}</span>
          <span><strong>{{ issue.where }}.</strong> {{ issue.message }}</span>
          <span>{{ issue.hint }}</span>
        </li>
      </ul>
      <div v-if="report" class="em-row-actions">
        <button type="button" class="em-btn em-btn--primary" @click="download('txt')">Download .txt</button>
        <button type="button" class="em-btn" @click="download('json')">Download .json</button>
      </div>
      <p v-if="notice" class="em-status" role="status">{{ notice }}</p>
    </div>
  </EmpowerShell>
</template>
