<script setup lang="ts">
import { ASSESSMENT, PASS_MARK } from '~/utils/seismo/content'

const store = useSeismoStore()
const emit = defineEmits<{ back: []; continue: [] }>()

const answers = ref<(number | null)[]>(ASSESSMENT.map(() => null))
const submitted = ref(false)

const allAnswered = computed(() => answers.value.every(a => a !== null))
const score = computed(() =>
  answers.value.reduce((n, a, i) => n + (a === ASSESSMENT[i].correctIndex ? 1 : 0), 0) / ASSESSMENT.length
)
const passed = computed(() => score.value >= PASS_MARK)

function submit() {
  if (!allAnswered.value) return
  store.logAttempt(answers.value as number[], score.value)
  submitted.value = true
}
function retry() {
  answers.value = ASSESSMENT.map(() => null)
  submitted.value = false
}
</script>

<template>
  <section class="sg-screen sg-screen--narrow sg-asmt">
    <button type="button" class="sg-back" @click="emit('back')">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
      Station log
    </button>
    <p class="sg-eyebrow">Assessment</p>
    <h2 class="sg-h2">Five questions</h2>
    <p class="sg-note sg-asmt__intro">80 percent to pass. Unlimited attempts.</p>

    <ol class="sg-asmt__list">
      <li v-for="(q, qi) in ASSESSMENT" :key="q.id" class="sg-asmt__q">
        <p class="sg-asmt__prompt"><span class="sg-asmt__qn">{{ qi + 1 }}</span>{{ q.prompt }}</p>
        <div class="sg-asmt__opts">
          <label
            v-for="(opt, oi) in q.options"
            :key="oi"
            class="sg-asmt__opt"
            :class="{
              'is-correct': submitted && oi === q.correctIndex,
              'is-wrong': submitted && answers[qi] === oi && oi !== q.correctIndex
            }"
          >
            <input type="radio" :name="q.id" :value="oi" :disabled="submitted" v-model.number="answers[qi]" />
            <span>{{ opt }}</span>
          </label>
        </div>
        <p v-if="submitted" class="sg-asmt__fb">
          {{ answers[qi] === q.correctIndex ? 'Correct.' : `Incorrect. ${q.because}` }}
        </p>
      </li>
    </ol>

    <div v-if="!submitted" class="sg-asmt__foot">
      <button type="button" class="sg-btn sg-btn--primary" :disabled="!allAnswered" @click="submit">Submit answers</button>
      <p v-if="!allAnswered" class="sg-note">Answer all five to submit.</p>
    </div>

    <div v-else class="sg-asmt__result">
      <p class="sg-asmt__score">
        You scored <b>{{ Math.round(score * 100) }} percent</b>.
        {{ passed ? 'That passes.' : `A pass needs ${Math.round(PASS_MARK * 100)} percent.` }}
      </p>
      <button v-if="passed" type="button" class="sg-btn sg-btn--primary" @click="emit('continue')">See results</button>
      <button v-else type="button" class="sg-btn sg-btn--ghost" @click="retry">Try again</button>
    </div>
  </section>
</template>

<style scoped>
.sg-asmt__intro { margin-bottom: 26rem; }
.sg-asmt__list { list-style: none; margin: 0; padding: 0; }
.sg-asmt__q { padding: 24rem 0; border-top: 1px solid var(--sg-line); }
.sg-asmt__q:first-child { border-top: none; padding-top: 6rem; }
.sg-asmt__prompt { display: flex; gap: 12rem; font-size: 16rem; font-weight: 500; color: var(--sg-ink); line-height: 1.45; margin-bottom: 14rem; }
.sg-asmt__qn { font-family: var(--sg-mono); font-size: 14rem; color: var(--sg-s); flex-shrink: 0; }
.sg-asmt__opts { display: flex; flex-direction: column; gap: 8rem; padding-left: 24rem; }
.sg-asmt__opt {
  display: flex; align-items: flex-start; gap: 11rem;
  padding: 11rem 14rem;
  border: 1.5px solid var(--sg-line);
  border-radius: 8rem;
  font-size: 14.5rem; line-height: 1.45; color: var(--sg-ink);
  cursor: pointer;
  transition: border-color 0.14s ease, background 0.14s ease;
}
@media (hover: hover) { .sg-asmt__opt:hover { border-color: var(--sg-muted); } }
.sg-asmt__opt input { margin-top: 3rem; accent-color: var(--sg-ink); flex-shrink: 0; }
.sg-asmt__opt.is-correct { border-color: var(--sg-p); background: color-mix(in srgb, var(--sg-p) 8%, transparent); }
.sg-asmt__opt.is-wrong { border-color: var(--sg-epi); background: color-mix(in srgb, var(--sg-epi) 7%, transparent); }
.sg-asmt__fb { margin: 12rem 0 0 24rem; font-size: 13.5rem; line-height: 1.55; color: var(--sg-muted-strong); }
.sg-asmt__foot { margin-top: 26rem; display: flex; align-items: center; gap: 16rem; flex-wrap: wrap; }
.sg-asmt__result { margin-top: 26rem; }
.sg-asmt__score { font-size: 16rem; color: var(--sg-ink); margin-bottom: 18rem; }
.sg-asmt__score b { font-family: var(--sg-mono); }
</style>
