<script setup lang="ts">
import { ASSESSMENT, PASS_MARK } from '~/utils/strong/content'
const store = useStrongStore()
const emit = defineEmits<{ back: []; continue: [] }>()

const answers = ref<(number | null)[]>(ASSESSMENT.map(() => null))
const submitted = ref(false)
const allAnswered = computed(() => answers.value.every(a => a !== null))
const score = computed(() => answers.value.reduce((n, a, i) => n + (a === ASSESSMENT[i].correctIndex ? 1 : 0), 0) / ASSESSMENT.length)
const passed = computed(() => score.value >= PASS_MARK)

function submit() {
  if (!allAnswered.value) return
  store.logAttempt(answers.value as number[], score.value)
  submitted.value = true
}
function retry() { answers.value = ASSESSMENT.map(() => null); submitted.value = false }
</script>

<template>
  <section class="st-screen st-screen--narrow st-asmt">
    <button type="button" class="st-back" @click="emit('back')">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
      Menu
    </button>
    <p class="st-eyebrow">Assessment</p>
    <h2 class="st-h2">Five questions</h2>
    <p class="st-note st-asmt__intro">80 percent to pass. Unlimited attempts.</p>

    <ol class="st-asmt__list">
      <li v-for="(q, qi) in ASSESSMENT" :key="q.id" class="st-asmt__q">
        <p class="st-asmt__prompt"><span class="st-asmt__qn st-num">{{ qi + 1 }}</span>{{ q.prompt }}</p>
        <div class="st-asmt__opts">
          <label
            v-for="(opt, oi) in q.options"
            :key="oi"
            class="st-asmt__opt"
            :class="{ 'is-correct': submitted && oi === q.correctIndex, 'is-wrong': submitted && answers[qi] === oi && oi !== q.correctIndex }"
          >
            <input type="radio" :name="q.id" :value="oi" :disabled="submitted" v-model.number="answers[qi]" />
            <span>{{ opt }}</span>
          </label>
        </div>
        <p v-if="submitted" class="st-asmt__fb">{{ answers[qi] === q.correctIndex ? 'Correct.' : `Incorrect. ${q.because}` }}</p>
      </li>
    </ol>

    <div v-if="!submitted" class="st-asmt__foot">
      <button type="button" class="st-btn st-btn--primary" :disabled="!allAnswered" @click="submit">Submit answers</button>
      <p v-if="!allAnswered" class="st-note">Answer all five to submit.</p>
    </div>
    <div v-else class="st-asmt__result">
      <p class="st-asmt__score">You scored <b class="st-num">{{ Math.round(score * 100) }} percent</b>. {{ passed ? 'That passes.' : `A pass needs ${Math.round(PASS_MARK * 100)} percent.` }}</p>
      <button v-if="passed" type="button" class="st-btn st-btn--primary" @click="emit('continue')">See results</button>
      <button v-else type="button" class="st-btn st-btn--ghost" @click="retry">Try again</button>
    </div>
  </section>
</template>

<style scoped>
.st-asmt__intro { margin-bottom: 26rem; }
.st-asmt__list { list-style: none; margin: 0; padding: 0; }
.st-asmt__q { padding: 24rem 0; border-top: 1px solid var(--st-line); }
.st-asmt__q:first-child { border-top: none; padding-top: 6rem; }
.st-asmt__prompt { display: flex; gap: 12rem; font-size: 16rem; font-weight: 500; color: var(--st-text); line-height: 1.45; margin-bottom: 14rem; }
.st-asmt__qn { font-size: 14rem; color: var(--st-accent); flex-shrink: 0; }
.st-asmt__opts { display: flex; flex-direction: column; gap: 8rem; padding-left: 24rem; }
.st-asmt__opt {
  display: flex; align-items: flex-start; gap: 11rem;
  padding: 11rem 14rem; border: 1px solid var(--st-line); border-radius: 10rem;
  font-size: 14.5rem; line-height: 1.45; color: var(--st-text); cursor: pointer;
  transition: border-color 0.14s ease, background 0.14s ease;
}
@media (hover: hover) { .st-asmt__opt:hover { border-color: var(--st-line-strong); background: var(--st-slot-hover); } }
.st-asmt__opt input { margin-top: 3rem; accent-color: var(--st-accent); flex-shrink: 0; }
.st-asmt__opt.is-correct { border-color: var(--st-t3); background: color-mix(in srgb, var(--st-t3) 14%, transparent); }
.st-asmt__opt.is-wrong { border-color: var(--st-t0); background: color-mix(in srgb, var(--st-t0) 12%, transparent); }
.st-asmt__fb { margin: 12rem 0 0 24rem; font-size: 13.5rem; line-height: 1.55; color: var(--st-muted); }
.st-asmt__foot { margin-top: 26rem; display: flex; align-items: center; gap: 16rem; flex-wrap: wrap; }
.st-asmt__result { margin-top: 26rem; }
.st-asmt__score { font-size: 16rem; color: var(--st-text); margin-bottom: 18rem; }
</style>
