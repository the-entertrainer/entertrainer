<script setup lang="ts">
import { ASSESSMENT_PASS_THRESHOLD, ASSESSMENT_QUESTIONS } from '~/utils/confidenceTrap/content'

const store = useConfidenceTrapStore()
const emit = defineEmits<{ back: []; continue: [] }>()

const answers = ref<(number | null)[]>(ASSESSMENT_QUESTIONS.map(() => null))
const submitted = ref(false)

const allAnswered = computed(() => answers.value.every(a => a !== null))

function submit() {
  if (!allAnswered.value) return
  const score = answers.value.reduce((sum, a, i) => sum + (a === ASSESSMENT_QUESTIONS[i].correctIndex ? 1 : 0), 0) / ASSESSMENT_QUESTIONS.length
  store.logAssessmentAttempt(answers.value as number[], score)
  submitted.value = true
}

function retry() {
  answers.value = ASSESSMENT_QUESTIONS.map(() => null)
  submitted.value = false
}

const attempt = computed(() => store.latestAssessmentAttempt)
</script>

<template>
  <section class="ct-assess">
    <button type="button" class="ct-back" @click="emit('back')">Back to menu</button>
    <p class="ct-assess__kicker">Assessment</p>
    <h2 class="ct-assess__heading">Five questions on the concept</h2>
    <p class="ct-assess__intro">Minimum 80% to pass. You can retry as many times as you need.</p>

    <template v-if="!submitted">
      <div v-for="(q, qi) in ASSESSMENT_QUESTIONS" :key="q.id" class="ct-assess__q">
        <p class="ct-assess__prompt">{{ qi + 1 }}. {{ q.prompt }}</p>
        <label v-for="(opt, oi) in q.options" :key="oi" class="ct-assess__option">
          <input type="radio" :name="q.id" :value="oi" v-model.number="answers[qi]" />
          <span>{{ opt }}</span>
        </label>
      </div>
      <button type="button" class="ct-btn ct-btn--primary" :disabled="!allAnswered" @click="submit">
        Submit
      </button>
    </template>

    <template v-else-if="attempt">
      <p class="ct-assess__result">
        Score: {{ Math.round(attempt.score * 100) }}%.
        {{ attempt.passed ? 'You passed.' : `A pass requires ${Math.round(ASSESSMENT_PASS_THRESHOLD * 100)}%.` }}
      </p>
      <button v-if="attempt.passed" type="button" class="ct-btn ct-btn--primary" @click="emit('continue')">
        See your results
      </button>
      <button v-else type="button" class="ct-btn ct-btn--primary" @click="retry">
        Try again
      </button>
    </template>
  </section>
</template>

<style scoped>
/* Deliberately the plainest screen in the module: no card chrome, minimal
   spacing, no encouraging or scolding language. */
.ct-assess { max-width: 600rem; padding: 60rem 0; }
.ct-assess__kicker {
  font-family: var(--ct-sans);
  font-size: 13rem;
  color: var(--ct-secondary);
  margin: 24rem 0 14rem;
}
.ct-assess__heading {
  font-family: var(--ct-serif);
  font-size: clamp(24rem, 4vw, 30rem);
  font-weight: 600;
  color: var(--ct-graphite);
  margin-bottom: 10rem;
}
.ct-assess__intro {
  font-family: var(--ct-sans);
  font-size: 15rem;
  color: var(--ct-secondary);
  margin-bottom: 34rem;
}
.ct-assess__q { margin-bottom: 30rem; }
.ct-assess__prompt {
  font-family: var(--ct-sans);
  font-weight: 600;
  font-size: 15.5rem;
  color: var(--ct-graphite);
  margin-bottom: 12rem;
  line-height: 1.5;
}
.ct-assess__option {
  display: flex;
  align-items: flex-start;
  gap: 10rem;
  font-family: var(--ct-sans);
  font-size: 15rem;
  color: var(--ct-graphite);
  padding: 8rem 0;
  cursor: pointer;
  line-height: 1.5;
}
.ct-assess__option input { margin-top: 4rem; accent-color: var(--ct-graphite); }
.ct-assess__result {
  font-family: var(--ct-sans);
  font-size: 16rem;
  color: var(--ct-graphite);
  margin-bottom: 26rem;
}
.ct-assess .ct-btn { margin-top: 6rem; }
</style>
