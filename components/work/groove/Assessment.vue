<script setup lang="ts">
import { ASSESSMENT, PASS_MARK } from '~/utils/groove/content'
const store = useGrooveStore()
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
  <section class="gv-screen gv-screen--narrow gv-asmt">
    <button type="button" class="gv-back" @click="emit('back')">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
      Menu
    </button>
    <p class="gv-eyebrow">Assessment</p>
    <h2 class="gv-h2">Five questions</h2>
    <p class="gv-note gv-asmt__intro">80 percent to pass. Unlimited attempts.</p>

    <ol class="gv-asmt__list">
      <li v-for="(q, qi) in ASSESSMENT" :key="q.id" class="gv-asmt__q">
        <p class="gv-asmt__prompt"><span class="gv-asmt__qn">{{ qi + 1 }}</span>{{ q.prompt }}</p>
        <div class="gv-asmt__opts">
          <label
            v-for="(opt, oi) in q.options"
            :key="oi"
            class="gv-asmt__opt"
            :class="{ 'is-correct': submitted && oi === q.correctIndex, 'is-wrong': submitted && answers[qi] === oi && oi !== q.correctIndex }"
          >
            <input type="radio" :name="q.id" :value="oi" :disabled="submitted" v-model.number="answers[qi]" />
            <span>{{ opt }}</span>
          </label>
        </div>
        <p v-if="submitted" class="gv-asmt__fb">{{ answers[qi] === q.correctIndex ? 'Correct.' : `Incorrect. ${q.because}` }}</p>
      </li>
    </ol>

    <div v-if="!submitted" class="gv-asmt__foot">
      <button type="button" class="gv-btn gv-btn--primary" :disabled="!allAnswered" @click="submit">Submit answers</button>
      <p v-if="!allAnswered" class="gv-note">Answer all five to submit.</p>
    </div>
    <div v-else class="gv-asmt__result">
      <p class="gv-asmt__score">You scored <b>{{ Math.round(score * 100) }} percent</b>. {{ passed ? 'That passes.' : `A pass needs ${Math.round(PASS_MARK * 100)} percent.` }}</p>
      <button v-if="passed" type="button" class="gv-btn gv-btn--primary" @click="emit('continue')">See results</button>
      <button v-else type="button" class="gv-btn gv-btn--ghost" @click="retry">Try again</button>
    </div>
  </section>
</template>

<style scoped>
.gv-asmt__intro { margin-bottom: 26rem; }
.gv-asmt__list { list-style: none; margin: 0; padding: 0; }
.gv-asmt__q { padding: 24rem 0; border-top: 1px solid var(--gv-line); }
.gv-asmt__q:first-child { border-top: none; padding-top: 6rem; }
.gv-asmt__prompt { display: flex; gap: 12rem; font-size: 16rem; font-weight: 500; color: var(--gv-text); line-height: 1.45; margin-bottom: 14rem; }
.gv-asmt__qn { font-family: var(--gv-mono); font-size: 14rem; color: var(--gv-accent); flex-shrink: 0; }
.gv-asmt__opts { display: flex; flex-direction: column; gap: 8rem; padding-left: 24rem; }
.gv-asmt__opt {
  display: flex; align-items: flex-start; gap: 11rem;
  padding: 11rem 14rem; border: 1px solid var(--gv-line); border-radius: 10rem;
  font-size: 14.5rem; line-height: 1.45; color: var(--gv-text); cursor: pointer;
  transition: border-color 0.14s ease, background 0.14s ease;
}
@media (hover: hover) { .gv-asmt__opt:hover { border-color: var(--gv-line-strong); background: var(--gv-slot-hover); } }
.gv-asmt__opt input { margin-top: 3rem; accent-color: var(--gv-accent); flex-shrink: 0; }
.gv-asmt__opt.is-correct { border-color: var(--gv-hat); background: color-mix(in srgb, var(--gv-hat) 14%, transparent); }
.gv-asmt__opt.is-wrong { border-color: var(--gv-accent); background: color-mix(in srgb, var(--gv-accent) 12%, transparent); }
.gv-asmt__fb { margin: 12rem 0 0 24rem; font-size: 13.5rem; line-height: 1.55; color: var(--gv-muted); }
.gv-asmt__foot { margin-top: 26rem; display: flex; align-items: center; gap: 16rem; flex-wrap: wrap; }
.gv-asmt__result { margin-top: 26rem; }
.gv-asmt__score { font-size: 16rem; color: var(--gv-text); margin-bottom: 18rem; }
.gv-asmt__score b { font-family: var(--gv-mono); }
</style>
