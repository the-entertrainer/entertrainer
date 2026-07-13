<script setup lang="ts">
import { GAUNTLET_QUESTIONS } from '~/utils/confidenceTrap/content'
import ConfidenceSlider from './ConfidenceSlider.vue'

const store = useConfidenceTrapStore()
const emit = defineEmits<{ back: []; continue: [] }>()

const index = ref(0)
const phase = ref<'confidence' | 'answer' | 'feedback'>('confidence')
const confidence = ref(50)
const chosenIndex = ref<number | null>(null)

const question = computed(() => GAUNTLET_QUESTIONS[index.value])
const done = computed(() => index.value >= GAUNTLET_QUESTIONS.length)
const lastResponse = computed(() => store.gauntletResponses.find(r => r.questionId === question.value?.id))

function lockConfidence() {
  phase.value = 'answer'
}

function chooseAnswer(i: number) {
  if (phase.value !== 'answer') return
  chosenIndex.value = i
  const correct = i === question.value.correctIndex
  store.logGauntletResponse({
    questionId: question.value.id,
    confidence: confidence.value,
    chosenIndex: i,
    correct
  })
  phase.value = 'feedback'
}

function next() {
  index.value += 1
  phase.value = 'confidence'
  confidence.value = 50
  chosenIndex.value = null
}
</script>

<template>
  <section class="ct-handson">
    <button type="button" class="ct-back" @click="emit('back')">Back to menu</button>
    <p class="ct-handson__kicker">Hands On</p>
    <h2 class="ct-handson__heading">The Confidence Gauntlet</h2>
    <p class="ct-handson__intro">
      Five questions about medieval English taxation, a subject most people have never
      studied. For each one, set how confident you are before you answer.
    </p>

    <div v-if="!done" class="ct-handson__card">
      <p class="ct-handson__progress">Question {{ index + 1 }} of {{ GAUNTLET_QUESTIONS.length }}</p>
      <p class="ct-handson__prompt">{{ question.prompt }}</p>

      <template v-if="phase === 'confidence'">
        <ConfidenceSlider v-model="confidence" label="How confident are you that you'll answer this correctly?" />
        <button type="button" class="ct-btn ct-btn--primary ct-handson__lock" @click="lockConfidence">
          Lock in confidence
        </button>
      </template>

      <template v-else>
        <p class="ct-handson__locked">Confidence locked in at {{ confidence }}%.</p>
        <div class="ct-handson__options">
          <button
            v-for="(opt, i) in question.options"
            :key="i"
            type="button"
            class="ct-handson__option"
            :class="{
              'ct-handson__option--chosen': phase === 'feedback' && chosenIndex === i,
              'ct-handson__option--correct': phase === 'feedback' && i === question.correctIndex,
              'ct-handson__option--incorrect': phase === 'feedback' && chosenIndex === i && i !== question.correctIndex
            }"
            :disabled="phase === 'feedback'"
            @click="chooseAnswer(i)"
          >
            {{ opt }}
          </button>
        </div>

        <div v-if="phase === 'feedback' && lastResponse" class="ct-handson__feedback">
          <div class="ct-handson__stat">
            <span class="ct-handson__stat-label">Your confidence</span>
            <span class="ct-handson__stat-value">{{ lastResponse.confidence }}%</span>
          </div>
          <div class="ct-handson__stat">
            <span class="ct-handson__stat-label">Result</span>
            <span class="ct-handson__stat-value">{{ lastResponse.correct ? 'Correct' : 'Incorrect' }}</span>
          </div>
          <button type="button" class="ct-btn ct-btn--primary" @click="next">
            {{ index + 1 < GAUNTLET_QUESTIONS.length ? 'Next question' : 'See gauntlet summary' }}
          </button>
        </div>
      </template>
    </div>

    <div v-else class="ct-handson__card">
      <p class="ct-handson__prompt">Gauntlet complete.</p>
      <p class="ct-handson__summary" v-if="store.gauntletConfidenceAccuracy">
        Average stated confidence: {{ Math.round(store.gauntletConfidenceAccuracy.confidence) }}%.
        Actual accuracy: {{ Math.round(store.gauntletConfidenceAccuracy.accuracy) }}%.
      </p>
      <button type="button" class="ct-btn ct-btn--primary" @click="emit('continue')">Continue to Assessment</button>
    </div>
  </section>
</template>

<style scoped>
.ct-handson { max-width: 640rem; padding: 60rem 0; }
.ct-handson__kicker {
  font-family: var(--ct-sans);
  font-size: 13rem;
  color: var(--ct-secondary);
  margin: 24rem 0 14rem;
}
.ct-handson__heading {
  font-family: var(--ct-serif);
  font-size: clamp(26rem, 4vw, 34rem);
  font-weight: 600;
  color: var(--ct-graphite);
  margin-bottom: 16rem;
}
.ct-handson__intro {
  font-family: var(--ct-sans);
  font-size: 16rem;
  line-height: 1.65;
  color: var(--ct-secondary);
  margin-bottom: 36rem;
  max-width: 56ch;
}
.ct-handson__card {
  background: var(--ct-sand);
  border: 1px solid var(--ct-border);
  border-radius: 4rem;
  padding: 32rem;
}
.ct-handson__progress {
  font-family: var(--ct-sans);
  font-size: 13rem;
  color: var(--ct-secondary-on-card);
  margin-bottom: 14rem;
}
.ct-handson__prompt {
  font-family: var(--ct-serif);
  font-size: 21rem;
  font-weight: 600;
  color: var(--ct-graphite);
  margin-bottom: 26rem;
  line-height: 1.4;
}
.ct-handson__lock { margin-top: 26rem; }
.ct-handson__locked {
  font-family: var(--ct-sans);
  font-size: 14rem;
  color: var(--ct-secondary-on-card);
  margin-bottom: 20rem;
}
.ct-handson__options {
  display: flex;
  flex-direction: column;
  gap: 10rem;
}
.ct-handson__option {
  text-align: left;
  padding: 14rem 18rem;
  background: var(--ct-bone);
  border: 1px solid var(--ct-border);
  border-radius: 4rem;
  font-family: var(--ct-sans);
  font-size: 15rem;
  color: var(--ct-graphite);
  transition: border-color 0.15s ease;
}
@media (hover: hover) {
  .ct-handson__option:not(:disabled):hover { border-color: var(--ct-secondary); }
}
.ct-handson__option:disabled { cursor: default; }
.ct-handson__option--chosen { border-color: var(--ct-graphite); }
.ct-handson__option--correct {
  border-color: var(--ct-correct);
  background: color-mix(in srgb, var(--ct-correct) 10%, var(--ct-bone));
}
.ct-handson__option--incorrect {
  border-color: var(--ct-incorrect);
  background: color-mix(in srgb, var(--ct-incorrect) 8%, var(--ct-bone));
}
.ct-handson__feedback {
  margin-top: 26rem;
  padding-top: 22rem;
  border-top: 1px solid var(--ct-border);
  display: flex;
  align-items: center;
  gap: 28rem;
  flex-wrap: wrap;
}
.ct-handson__stat { display: flex; flex-direction: column; gap: 4rem; }
.ct-handson__stat-label {
  font-family: var(--ct-sans);
  font-size: 12rem;
  color: var(--ct-secondary-on-card);
}
.ct-handson__stat-value {
  font-family: var(--ct-serif);
  font-size: 19rem;
  font-weight: 600;
  color: var(--ct-graphite);
}
.ct-handson__summary {
  font-family: var(--ct-sans);
  font-size: 15rem;
  color: var(--ct-secondary-on-card);
  margin-bottom: 24rem;
}
</style>
