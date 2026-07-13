<script setup lang="ts">
import type { CtView } from '~/types/confidenceTrap'
import { GAUNTLET_QUESTIONS, LESSON_SECTIONS } from '~/utils/confidenceTrap/content'
import TitleScreen from '~/components/work/confidencetrap/TitleScreen.vue'
import Objectives from '~/components/work/confidencetrap/Objectives.vue'
import MainMenu from '~/components/work/confidencetrap/MainMenu.vue'
import Lesson from '~/components/work/confidencetrap/Lesson.vue'
import HandsOn from '~/components/work/confidencetrap/HandsOn.vue'
import Assessment from '~/components/work/confidencetrap/Assessment.vue'
import ThankYou from '~/components/work/confidencetrap/ThankYou.vue'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

useHead({
  title: 'The Confidence Trap: Case Study',
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Inter:wght@400;500;600&display=swap'
    }
  ]
})

const store = useConfidenceTrapStore()
const view = ref<CtView>('title')

onMounted(() => store.start())

function go(next: CtView) {
  view.value = next
  window.scrollTo({ top: 0, behavior: 'auto' })
}

const lessonStatus = computed(() => {
  const n = store.lessonRatings.length
  if (n === 0) return 'Not started'
  if (n < LESSON_SECTIONS.length) return `In progress, ${n} of ${LESSON_SECTIONS.length} sections`
  return 'Completed'
})

const handsOnStatus = computed(() => {
  const n = store.gauntletResponses.length
  if (n === 0) return 'Not started'
  if (n < GAUNTLET_QUESTIONS.length) return `In progress, ${n} of ${GAUNTLET_QUESTIONS.length} questions`
  return 'Completed'
})

const assessmentStatus = computed(() => {
  const attempts = store.assessmentAttempts.length
  if (attempts === 0) return 'Not started'
  if (store.hasPassedAssessment) return 'Passed'
  return `Attempted ${attempts} time${attempts === 1 ? '' : 's'}, not yet passed`
})

const gaugeValue = computed(() => (store.hasMeasurements ? store.confidenceScore : null))

function openPanel(panel: 'lesson' | 'hands-on' | 'assessment') {
  go(panel)
}
</script>

<template>
  <div class="ct-root">
    <div class="ct-shell">
      <TitleScreen v-if="view === 'title'" @continue="go('objectives')" />
      <Objectives v-else-if="view === 'objectives'" @continue="go('menu')" />
      <MainMenu
        v-else-if="view === 'menu'"
        :lesson-status="lessonStatus"
        :hands-on-status="handsOnStatus"
        :assessment-status="assessmentStatus"
        :gauge-value="gaugeValue"
        @open="openPanel"
      />
      <Lesson v-else-if="view === 'lesson'" @back="go('menu')" @continue="go('hands-on')" />
      <HandsOn v-else-if="view === 'hands-on'" @back="go('menu')" @continue="go('assessment')" />
      <Assessment v-else-if="view === 'assessment'" @back="go('menu')" @continue="go('thank-you')" />
      <ThankYou v-else-if="view === 'thank-you'" />
    </div>
  </div>
</template>

<style>
/* Unscoped on purpose: these tokens and primitives are consumed by every
   child screen component under components/work/confidencetrap/. Vue's
   scoped-style attribute selectors would not reach into child templates,
   so the shared design system lives here, at the module root, once. */
.ct-root {
  --ct-bone: #F5F1EA;
  --ct-sand: #E8E2D6;
  --ct-graphite: #3A3632;
  --ct-secondary: #6B6560;
  /* 4% darker than --ct-secondary — used only where secondary text sits on
     the sand card surface, where the spec'd tone measures 4.45:1 and fails
     WCAG AA's 4.5:1 threshold for normal text. See contrast audit. */
  --ct-secondary-on-card: #67615C;
  --ct-border: #D4CDBF;
  --ct-accent: #C4472E;
  --ct-correct: #5C7A5C;
  --ct-incorrect: #A85D4E;
  --ct-serif: 'Source Serif 4', Georgia, 'Times New Roman', serif;
  --ct-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  background: var(--ct-bone);
  color: var(--ct-graphite);
  min-height: 100dvh;
  font-family: var(--ct-sans);
}

.ct-shell {
  max-width: 760rem;
  margin: 0 auto;
  padding: var(--page-top) 24rem 100rem;
}

.ct-back {
  font-family: var(--ct-sans);
  font-size: 13rem;
  color: var(--ct-secondary);
  padding: 6rem 0;
}
@media (hover: hover) {
  .ct-back:hover { color: var(--ct-graphite); }
}

.ct-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 13rem 26rem;
  border-radius: 3rem;
  font-family: var(--ct-sans);
  font-size: 14.5rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: opacity 0.15s ease, transform 0.1s ease;
}
.ct-btn:active { transform: scale(0.98); }
.ct-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ct-btn--primary {
  background: var(--ct-graphite);
  color: var(--ct-bone);
}
@media (hover: hover) {
  .ct-btn--primary:not(:disabled):hover { opacity: 0.88; }
}
.ct-btn:focus-visible {
  outline: 2px solid var(--ct-graphite);
  outline-offset: 3px;
}

@media (max-width: 600px) {
  .ct-shell { padding: calc(88rem + var(--safe-top)) 18rem 70rem; }
}
</style>
