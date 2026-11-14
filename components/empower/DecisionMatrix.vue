<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useEmpowerVisit } from '~/composables/empower/visit'
import { copyText, saveBlob } from '~/utils/empower/download'
import { kvSet } from '~/utils/empower/db'
import { uid } from '~/utils/empower/id'
import {
  anyScore,
  clampScore,
  clampWeight,
  decodeMatrix,
  emptyMatrix,
  encodeMatrix,
  evenWeights,
  formatPoints,
  matrixAsText,
  pointsFor,
  ranked,
  scoreKey,
  weightSum,
  winnerText,
  type MatrixState,
} from '~/utils/empower/matrix'

useEmpowerVisit('decision-matrix')

const state = ref<MatrixState>(emptyMatrix())
const notice = ref('')

const sum = computed(() => weightSum(state.value))
const rows = computed(() => ranked(state.value))
const verdict = computed(() => winnerText(state.value))
const showWinner = computed(() => sum.value === 100 && anyScore(state.value))

onMounted(() => {
  const saved = decodeMatrix(window.location.hash)
  if (saved) state.value = saved
})

function setName(kind: 'options' | 'criteria', id: string, value: string) {
  state.value = {
    ...state.value,
    [kind]: state.value[kind].map(item => item.id === id ? { ...item, name: value } : item),
  }
}

function setWeight(id: string, raw: string) {
  state.value = {
    ...state.value,
    criteria: state.value.criteria.map(item => item.id === id ? { ...item, weight: clampWeight(Number(raw)) } : item),
  }
}

function setScore(optionId: string, criterionId: string, raw: string) {
  state.value = {
    ...state.value,
    scores: { ...state.value.scores, [scoreKey(optionId, criterionId)]: clampScore(Number(raw)) },
  }
}

function addOption() {
  state.value = { ...state.value, options: [...state.value.options, { id: uid('opt'), name: `Option ${state.value.options.length + 1}` }] }
}

function addCriterion() {
  state.value = {
    ...state.value,
    criteria: [...state.value.criteria, { id: uid('crit'), name: `Criterion ${state.value.criteria.length + 1}`, weight: 0 }],
  }
}

function removeOption(id: string) {
  if (state.value.options.length < 3) return
  const scores = { ...state.value.scores }
  for (const key of Object.keys(scores)) if (key.startsWith(`${id}:`)) delete scores[key]
  state.value = { ...state.value, options: state.value.options.filter(item => item.id !== id), scores }
}

function removeCriterion(id: string) {
  if (state.value.criteria.length < 2) return
  const scores = { ...state.value.scores }
  for (const key of Object.keys(scores)) if (key.endsWith(`:${id}`)) delete scores[key]
  state.value = { ...state.value, criteria: state.value.criteria.filter(item => item.id !== id), scores }
}

function balance() {
  state.value = evenWeights(state.value)
}

function shareHref(): string {
  const url = new URL(window.location.href)
  url.hash = `d=${encodeMatrix(state.value)}`
  return url.toString()
}

async function copyLink() {
  const href = shareHref()
  history.replaceState(null, '', href)
  await kvSet('draft:decision-matrix', state.value)
  notice.value = await copyText(href) ? 'Copied the share link.' : href
}

async function copyResult() {
  notice.value = await copyText(matrixAsText(state.value)) ? 'Copied the result.' : 'Copy failed.'
}

async function downloadPng() {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 800
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#161618'
  ctx.font = '600 40px Georgia, serif'
  const title = verdict.value
  ctx.fillText(title.slice(0, 70), 64, 100)
  ctx.font = '400 28px Georgia, serif'
  const list = rows.value ?? state.value.options.map(option => ({ id: option.id, name: option.name, points: pointsFor(state.value, option.id) }))
  list.forEach((row, index) => {
    ctx.fillText(`${row.name}: ${formatPoints(row.points)} points`, 64, 180 + index * 48)
  })
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return
  await saveBlob('decision.png', blob, 'image/png')
  notice.value = 'Downloaded decision.png.'
}
</script>

<template>
  <EmpowerShell title="Decision Matrix" deck="Name the options. Weight what matters. See what wins." :status-text="verdict" wide>
    <div class="em-stack">
      <p v-if="sum !== 100" class="em-error">Weights add up to {{ sum }}. They need to add up to 100.</p>
      <p v-else class="em-note">Weights add up to 100.</p>
      <div class="em-row-actions">
        <button type="button" class="em-btn" @click="balance">Split the weights evenly</button>
        <button type="button" class="em-btn" @click="addOption">Add option</button>
        <button type="button" class="em-btn" @click="addCriterion">Add criterion</button>
      </div>

      <section aria-label="Criteria" class="em-stack">
        <h2 class="em-h2">Criteria</h2>
        <div v-for="(criterion, index) in state.criteria" :key="criterion.id" class="em-option">
          <div class="em-field">
            <label :for="`crit-${criterion.id}`">Criterion {{ index + 1 }}</label>
            <input :id="`crit-${criterion.id}`" class="em-input" type="text" :value="criterion.name" autocomplete="off" @input="setName('criteria', criterion.id, $event.target.value)">
          </div>
          <div class="em-field">
            <label :for="`weight-${criterion.id}`">Weight for {{ criterion.name || 'criterion ' + (index + 1) }}</label>
            <input :id="`weight-${criterion.id}`" class="em-input" type="number" min="0" max="100" :value="criterion.weight" @input="setWeight(criterion.id, $event.target.value)">
          </div>
          <button type="button" class="em-btn" :disabled="state.criteria.length < 2" @click="removeCriterion(criterion.id)">Remove {{ criterion.name || 'criterion' }}</button>
        </div>
      </section>

      <section aria-label="Options" class="em-stack">
        <h2 class="em-h2">Options</h2>
        <article v-for="(option, index) in state.options" :key="option.id" class="em-option">
          <div class="em-field">
            <label :for="`opt-${option.id}`">Name of option {{ index + 1 }}</label>
            <input :id="`opt-${option.id}`" class="em-input" type="text" :value="option.name" autocomplete="off" @input="setName('options', option.id, $event.target.value)">
          </div>
          <div v-for="criterion in state.criteria" :key="criterion.id" class="em-field">
            <label :for="`score-${option.id}-${criterion.id}`">{{ option.name || 'Option ' + (index + 1) }} on {{ criterion.name || 'criterion' }}, 0 to 10</label>
            <input
              :id="`score-${option.id}-${criterion.id}`"
              class="em-input"
              type="number"
              min="0"
              max="10"
              :value="state.scores[`${option.id}:${criterion.id}`] ?? 0"
              @input="setScore(option.id, criterion.id, $event.target.value)"
            >
          </div>
          <p>Weighted score {{ formatPoints(pointsFor(state, option.id)) }}</p>
          <button type="button" class="em-btn" :disabled="state.options.length < 3" @click="removeOption(option.id)">Remove {{ option.name || 'option' }}</button>
        </article>
      </section>

      <div class="em-winner">
        <strong>{{ showWinner ? verdict : 'Score the options to see a winner.' }}</strong>
      </div>
      <div v-if="showWinner && rows" class="em-bars" aria-hidden="true">
        <div v-for="row in rows" :key="row.id" class="em-bar">
          <span>{{ row.name }} · {{ formatPoints(row.points) }}</span>
          <i><b :style="{ width: `${Math.min(100, row.points)}%` }" /></i>
        </div>
      </div>
      <div class="em-row-actions">
        <button type="button" class="em-btn em-btn--primary" @click="copyResult">Copy result</button>
        <button type="button" class="em-btn" @click="copyLink">Copy share link</button>
        <button type="button" class="em-btn" @click="downloadPng">Download PNG</button>
      </div>
      <p v-if="notice" class="em-note">{{ notice }}</p>
    </div>
  </EmpowerShell>
</template>
