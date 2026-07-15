<script setup lang="ts">
import { ASSESSMENT, PASS_MARK } from '~/utils/strong/content'
const store = useStrongStore()

const answers = ref<(number | null)[]>(ASSESSMENT.map(() => null))
const qIndex = ref(0)
const submittedThis = ref(false)
const finished = ref(false)

const q = computed(() => ASSESSMENT[qIndex.value])
const chosen = computed(() => answers.value[qIndex.value])
const isLast = computed(() => qIndex.value === ASSESSMENT.length - 1)
const score = computed(() => answers.value.reduce((n, a, i) => n + (a === ASSESSMENT[i].correctIndex ? 1 : 0), 0) / ASSESSMENT.length)
const passed = computed(() => score.value >= PASS_MARK)

function submitQuestion() { if (chosen.value != null) submittedThis.value = true }
function advance() {
  if (isLast.value) { finished.value = true; store.logAttempt(answers.value as number[], score.value) }
  else { qIndex.value++; submittedThis.value = false }
}
function retry() { answers.value = ASSESSMENT.map(() => null); qIndex.value = 0; submittedThis.value = false; finished.value = false }
</script>

<template>
  <section class="st-card st-quiz">
    <template v-if="!finished">
      <div class="st-quiz__head">
        <p class="st-eyebrow">Check · {{ qIndex + 1 }} of {{ ASSESSMENT.length }}</p>
        <div class="st-quiz__dots" aria-hidden="true">
          <i v-for="(_, i) in ASSESSMENT" :key="i" :class="{ 'is-done': i < qIndex, 'is-current': i === qIndex }" />
        </div>
      </div>
      <h2 class="st-h2 st-quiz__prompt">{{ q.prompt }}</h2>

      <div class="st-quiz__opts">
        <label
          v-for="(opt, oi) in q.options" :key="oi"
          class="st-quiz__opt"
          :class="{ 'is-correct': submittedThis && oi === q.correctIndex, 'is-wrong': submittedThis && chosen === oi && oi !== q.correctIndex, 'is-locked': submittedThis }"
        >
          <input type="radio" :name="q.id" :value="oi" :disabled="submittedThis" v-model.number="answers[qIndex]" />
          <span>{{ opt }}</span>
        </label>
      </div>

      <p v-if="submittedThis" class="st-quiz__fb" :class="{ 'is-right': chosen === q.correctIndex }">
        {{ chosen === q.correctIndex ? 'Correct. ' : 'Not quite. ' }}{{ chosen === q.correctIndex ? '' : q.because }}
      </p>

      <div class="st-quiz__actions">
        <button v-if="!submittedThis" type="button" class="st-btn st-btn--primary" :disabled="chosen == null" @click="submitQuestion">Submit</button>
        <button v-else type="button" class="st-btn st-btn--primary" @click="advance">{{ isLast ? 'See score' : 'Next question' }}</button>
      </div>
    </template>

    <template v-else>
      <p class="st-eyebrow">Check</p>
      <h2 class="st-h2">You scored {{ Math.round(score * 100) }} percent</h2>
      <p class="st-lead st-quiz__result">{{ passed ? 'That passes. Use the arrow to see your result.' : `A pass needs ${Math.round(PASS_MARK * 100)} percent.` }}</p>
      <button v-if="!passed" type="button" class="st-btn st-btn--ghost st-quiz__retry" @click="retry">Try again</button>
    </template>
  </section>
</template>

<style scoped>
.st-quiz__head { display: flex; align-items: center; justify-content: space-between; gap: 16rem; margin-bottom: 4rem; }
.st-quiz__dots { display: flex; gap: 6rem; }
.st-quiz__dots i { width: 8rem; height: 8rem; border-radius: 50%; background: var(--st-slot); border: 1px solid var(--st-line-strong); }
.st-quiz__dots i.is-done { background: color-mix(in srgb, var(--st-accent) 55%, var(--st-slot)); border-color: transparent; }
.st-quiz__dots i.is-current { background: var(--st-accent); border-color: transparent; }
.st-quiz__prompt { margin: 8rem 0 26rem; font-size: clamp(22rem, 3.2vw, 30rem); max-width: 26ch; }
.st-quiz__opts { display: flex; flex-direction: column; gap: 10rem; }
.st-quiz__opt {
  display: flex; align-items: flex-start; gap: 12rem; padding: 15rem 18rem;
  border: 1px solid var(--st-line); border-radius: 12rem; font-size: 15.5rem; line-height: 1.4;
  color: var(--st-text); cursor: pointer; transition: border-color 0.14s ease, background 0.14s ease;
}
@media (hover: hover) { .st-quiz__opt:not(.is-locked):hover { border-color: var(--st-line-strong); background: var(--st-slot-hover); } }
.st-quiz__opt.is-locked { cursor: default; }
.st-quiz__opt input { margin-top: 2rem; accent-color: var(--st-accent); flex-shrink: 0; }
.st-quiz__opt.is-correct { border-color: var(--st-t3); background: color-mix(in srgb, var(--st-t3) 14%, transparent); }
.st-quiz__opt.is-wrong { border-color: var(--st-t0); background: color-mix(in srgb, var(--st-t0) 12%, transparent); }
.st-quiz__fb { margin-top: 16rem; font-size: 14rem; line-height: 1.55; color: var(--st-muted-strong); }
.st-quiz__fb.is-right { color: var(--st-t3); }
.st-quiz__actions { margin-top: 24rem; }
.st-quiz__result { margin: 18rem 0 0; }
.st-quiz__retry { margin-top: 22rem; }
</style>
