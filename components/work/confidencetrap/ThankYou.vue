<script setup lang="ts">
import RevealChart from './RevealChart.vue'

const store = useConfidenceTrapStore()

const data = computed(() => store.gauntletConfidenceAccuracy)
const seconds = computed(() => store.elapsedSeconds())
const timeLabel = computed(() => {
  const s = seconds.value
  const m = Math.floor(s / 60)
  const r = s % 60
  return m > 0 ? `${m} minute${m === 1 ? '' : 's'} and ${r} second${r === 1 ? '' : 's'}` : `${r} second${r === 1 ? '' : 's'}`
})

const gapLabel = computed(() => {
  if (!data.value) return ''
  const gap = data.value.confidence - data.value.accuracy
  if (Math.abs(gap) < 3) return 'Your stated confidence tracked your actual accuracy closely.'
  if (gap > 0) return `You were ${Math.round(gap)} points more confident than you were correct.`
  return `You were ${Math.round(Math.abs(gap))} points less confident than you were correct.`
})
</script>

<template>
  <section class="ct-thanks">
    <p class="ct-thanks__kicker">Result</p>
    <h2 class="ct-thanks__heading">Here is what you actually did</h2>

    <RevealChart v-if="data" :confidence="data.confidence" :accuracy="data.accuracy" />

    <div v-if="data" class="ct-thanks__summary">
      <p class="ct-thanks__line">
        Across the Confidence Gauntlet, you averaged {{ Math.round(data.confidence) }}% stated confidence
        and were correct {{ Math.round(data.accuracy) }}% of the time. {{ gapLabel }}
      </p>
      <p v-if="store.averageLessonConfidence != null" class="ct-thanks__line">
        In the Lesson, you rated your own understanding at an average of
        {{ store.averageLessonConfidence.toFixed(1) }} out of 5 across five sections.
      </p>
      <p class="ct-thanks__line">
        Time actually spent in this module: {{ timeLabel }}.
      </p>
    </div>

    <p class="ct-thanks__note">
      This module does not tell you whether your gap is good or bad. Calibration is a skill,
      not a personality trait, and one short exercise is one data point.
    </p>
  </section>
</template>

<style scoped>
.ct-thanks { max-width: 640rem; padding: 70rem 0 80rem; margin: 0 auto; }
.ct-thanks__kicker {
  font-family: var(--ct-sans);
  font-size: 13rem;
  color: var(--ct-secondary);
  margin-bottom: 14rem;
  text-align: center;
}
.ct-thanks__heading {
  font-family: var(--ct-serif);
  font-size: clamp(26rem, 4vw, 34rem);
  font-weight: 600;
  color: var(--ct-graphite);
  margin-bottom: 40rem;
  text-align: center;
}
.ct-thanks__summary { margin-top: 40rem; }
.ct-thanks__line {
  font-family: var(--ct-sans);
  font-size: 16rem;
  line-height: 1.7;
  color: var(--ct-graphite);
  margin-bottom: 14rem;
}
.ct-thanks__note {
  margin-top: 30rem;
  padding-top: 24rem;
  border-top: 1px solid var(--ct-border);
  font-family: var(--ct-sans);
  font-size: 14.5rem;
  line-height: 1.65;
  color: var(--ct-secondary);
}
</style>
