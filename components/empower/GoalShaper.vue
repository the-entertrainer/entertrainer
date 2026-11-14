<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEmpowerVisit } from '~/composables/empower/visit'
import { copyText, saveBlob, saveText } from '~/utils/empower/download'
import { idbAll, idbDelete, idbPut, kvGet, kvSet } from '~/utils/empower/db'
import { goalAsText, shapeGoal, type GoalInput, type GoalMode, type GoalPlan } from '~/utils/empower/goalShaper'
import { uid } from '~/utils/empower/id'

useEmpowerVisit('goal-shaper')

const route = useRoute()
const steps = ['Goal', 'Mode', 'Refine', 'Plan'] as const
const step = ref(0)
const notice = ref('')
const input = ref<GoalInput>({
  goal: '',
  mode: route.query.mode === 'learning' ? 'learning' : 'personal',
  deadline: '',
  measure: '',
  audience: '',
  condition: '',
  degree: '',
})
const plan = ref<GoalPlan | null>(null)
const library = ref<{ id: string; title: string; input: GoalInput; plan: GoalPlan }[]>([])
let dirty = false
let armed = false

const statusText = computed(() => {
  if (plan.value && step.value === 3) return plan.value.smart
  if (step.value === 0) return 'What are you trying to make true?'
  return `Step ${step.value + 1} of 4: ${steps[step.value]}.`
})

watch(input, value => {
  dirty = true
  if (armed) void kvSet('draft:goal-shaper', value)
}, { deep: true })

async function loadLibrary() {
  const rows = await idbAll<{ id: string; title: string; input: GoalInput; plan: GoalPlan }>('goals')
  library.value = rows.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
}

onMounted(async () => {
  const draft = await kvGet<GoalInput>('draft:goal-shaper')
  if (draft?.goal && !dirty) {
    input.value = { ...input.value, ...draft }
    if (route.query.mode === 'learning') input.value.mode = 'learning'
  }
  armed = true
  await loadLibrary()
})

function next() {
  if (step.value === 0 && !input.value.goal.trim()) return
  if (step.value === 2) plan.value = shapeGoal(input.value)
  step.value = Math.min(3, step.value + 1)
}

function back() {
  step.value = Math.max(0, step.value - 1)
}

async function copyPlan() {
  if (!plan.value) return
  notice.value = await copyText(goalAsText(plan.value)) ? 'Copied the plan.' : 'Copy failed. Select the plan text instead.'
}

async function downloadTxt() {
  if (!plan.value) return
  await saveText('goal.txt', goalAsText(plan.value))
  notice.value = 'Downloaded goal.txt.'
}

async function downloadPng() {
  if (!plan.value) return
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 800
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#161618'
  ctx.font = '600 42px Georgia, serif'
  const lines = wrap(ctx, plan.value.smart, 1040)
  lines.forEach((line, index) => ctx.fillText(line, 80, 120 + index * 56))
  ctx.font = '400 28px Georgia, serif'
  plan.value.steps.slice(0, 6).forEach((item, index) => {
    const row = wrap(ctx, `${index + 1}. ${item}`, 1040)
    row.forEach((line, lineIndex) => ctx.fillText(line, 80, 360 + index * 56 + lineIndex * 34))
  })
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return
  await saveBlob('goal.png', blob, 'image/png')
  notice.value = 'Downloaded goal.png.'
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > max && line) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  return lines.slice(0, 4)
}

async function saveGoal() {
  if (!plan.value) return
  const id = uid('goal')
  await idbPut('goals', { id, title: input.value.goal, input: { ...input.value }, plan: plan.value })
  await loadLibrary()
  notice.value = 'Saved on this device.'
}

async function openSaved(row: { input: GoalInput; plan: GoalPlan }) {
  input.value = { ...row.input }
  plan.value = row.plan
  step.value = 3
}

async function removeSaved(id: string) {
  await idbDelete('goals', id)
  await loadLibrary()
}

function setMode(mode: GoalMode) {
  input.value.mode = mode
}
</script>

<template>
  <EmpowerShell title="Goal Shaper" deck="What are you trying to make true?" :status-text="statusText">
    <ol class="em-steps" aria-label="Steps">
      <li v-for="(label, index) in steps" :key="label" :aria-current="step === index ? 'step' : undefined">{{ label }}</li>
    </ol>
    <h2 id="goal-step-title" class="em-h2" tabindex="-1">{{ steps[step] }}</h2>

    <div v-if="step === 0" class="em-stack">
      <p v-if="input.mode === 'learning'" class="em-note">Learning mode uses Bloom’s verbs — still plain language.</p>
      <div class="em-field">
        <label for="goal-text">Goal</label>
        <textarea id="goal-text" v-model="input.goal" class="em-textarea" placeholder="What are you trying to make true?" />
      </div>
      <button type="button" class="em-btn em-btn--primary" :disabled="!input.goal.trim()" @click="next">Next</button>
    </div>

    <div v-else-if="step === 1" class="em-stack">
      <fieldset class="em-choice">
        <legend class="em-label">Mode</legend>
        <label><input type="radio" name="goal-mode" value="personal" :checked="input.mode === 'personal'" @change="setMode('personal')"> Personal</label>
        <label><input type="radio" name="goal-mode" value="work" :checked="input.mode === 'work'" @change="setMode('work')"> Work</label>
        <label><input type="radio" name="goal-mode" value="learning" :checked="input.mode === 'learning'" @change="setMode('learning')"> Learning</label>
      </fieldset>
      <p v-if="input.mode === 'learning'" class="em-note">Learning mode uses Bloom’s verbs — still plain language.</p>
      <div class="em-row-actions">
        <button type="button" class="em-btn" @click="back">Back</button>
        <button type="button" class="em-btn em-btn--primary" @click="next">Next</button>
      </div>
    </div>

    <div v-else-if="step === 2" class="em-stack">
      <div class="em-field">
        <label for="goal-deadline">Deadline (optional)</label>
        <input id="goal-deadline" v-model="input.deadline" class="em-input" type="date">
      </div>
      <div class="em-field">
        <label for="goal-measure">How you will measure it (optional)</label>
        <input id="goal-measure" v-model="input.measure" class="em-input" type="text" autocomplete="off">
      </div>
      <template v-if="input.mode === 'learning'">
        <p class="em-note">Learning mode uses Bloom’s verbs — still plain language.</p>
        <div class="em-field">
          <label for="goal-audience">Audience</label>
          <input id="goal-audience" v-model="input.audience" class="em-input" type="text" autocomplete="off">
        </div>
        <div class="em-field">
          <label for="goal-condition">Condition</label>
          <input id="goal-condition" v-model="input.condition" class="em-input" type="text" autocomplete="off">
        </div>
        <div class="em-field">
          <label for="goal-degree">Degree</label>
          <input id="goal-degree" v-model="input.degree" class="em-input" type="text" autocomplete="off">
        </div>
      </template>
      <div class="em-row-actions">
        <button type="button" class="em-btn" @click="back">Back</button>
        <button type="button" class="em-btn em-btn--primary" @click="next">See the plan</button>
      </div>
    </div>

    <div v-else-if="plan" class="em-stack">
      <div class="em-plan">
        <p>{{ plan.smart }}</p>
        <p v-if="plan.bloomLevel"><strong>Bloom level:</strong> {{ plan.bloomLevel }}</p>
        <ol>
          <li v-for="(item, index) in plan.steps" :key="index">{{ item }}</li>
        </ol>
      </div>
      <div class="em-row-actions">
        <button type="button" class="em-btn" @click="back">Back</button>
        <button type="button" class="em-btn em-btn--primary" @click="copyPlan">Copy</button>
        <button type="button" class="em-btn" @click="downloadTxt">Download .txt</button>
        <button type="button" class="em-btn" @click="downloadPng">Download PNG</button>
        <button type="button" class="em-btn" @click="saveGoal">Save on this device</button>
      </div>
    </div>

    <p v-if="notice" class="em-status" role="status">{{ notice }}</p>

    <section v-if="library.length" class="em-stack" aria-labelledby="goal-library">
      <h2 id="goal-library" class="em-h2">Saved goals</h2>
      <ul class="em-issues">
        <li v-for="row in library" :key="row.id">
          <span>{{ row.title }}</span>
          <span class="em-row-actions">
            <button type="button" class="em-btn" @click="openSaved(row)">Open</button>
            <button type="button" class="em-btn" @click="removeSaved(row.id)">Delete</button>
          </span>
        </li>
      </ul>
    </section>
  </EmpowerShell>
</template>
