<script setup lang="ts">
definePageMeta({ layout: 'default' })

interface Step {
  phase: string
  context: string
  question: string
  options: string[]
  correct: number
  feedback: string
}

const steps: Step[] = [
  {
    phase: 'The Brief',
    context: 'A sales manager messages you: "My team isn\'t following the new CRM process. They need training ASAP."',
    question: 'What do you do first?',
    options: [
      'Start building a course immediately',
      'Ask the manager what "not following" looks like specifically',
      'Send a how-to PDF to the team'
    ],
    correct: 1,
    feedback: 'Smart move. Before designing anything, you need to understand the actual problem. This is called a Needs Analysis — and skipping it is why most training fails.'
  },
  {
    phase: 'The Discovery',
    context: 'You speak with the manager and three team members. The CRM process has 7 steps, but 2 are poorly documented and feel counterintuitive to nearly everyone.',
    question: "What's actually broken?",
    options: [
      'People lack knowledge — they need training',
      'The process itself is flawed — it needs redesign first',
      'Both — there are knowledge gaps and a process problem'
    ],
    correct: 2,
    feedback: "Exactly. ID's most underrated skill: separating what needs to be learned from what needs to be fixed. You'd recommend a process revision AND a targeted learning solution."
  },
  {
    phase: 'The Design',
    context: 'The process is fixed. Now 15 remote employees need to internalize the new 5-step workflow. They average 8 minutes a day for learning.',
    question: 'What do you design?',
    options: [
      'A 2-hour Zoom training session',
      'Five 3-minute scenario-based microlearning modules, one per step',
      'A detailed written SOP document'
    ],
    correct: 1,
    feedback: "Microlearning respects their time, scenarios build muscle memory, and tackling one step at a time prevents cognitive overload. Bloom's Apply level — not just knowing, doing."
  },
  {
    phase: 'The Measure',
    context: 'You launch the 5 modules. Completion rate: 94%. The manager asks: "Did it work?"',
    question: 'How do you actually answer that?',
    options: [
      '"Yes — everyone completed it"',
      'Check pre/post quiz scores from inside the modules',
      'Pull CRM usage data 2 weeks later and compare error rates before vs. after'
    ],
    correct: 2,
    feedback: "Kirkpatrick Level 3 — behaviour change in the real world. Completion proves people clicked through. CRM data proves they actually changed. That's the difference between training and learning."
  }
]

const currentStep = ref(0)
const selected    = ref<number | null>(null)
const revealed    = ref(false)
const done        = ref(false)
const score       = ref(0)

const step      = computed(() => steps[currentStep.value])
const isCorrect = computed(() => selected.value === step.value.correct)
const progress  = computed(() => ((currentStep.value) / steps.length) * 100)

function choose(i: number) {
  if (revealed.value) return
  selected.value = i
  revealed.value = true
  if (i === step.value.correct) score.value++
}

function next() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
    selected.value = null
    revealed.value = false
  } else {
    done.value = true
  }
}

function restart() {
  currentStep.value = 0
  selected.value    = null
  revealed.value    = false
  done.value        = false
  score.value       = 0
}

const scoreLabel = computed(() => {
  if (score.value === 4) return "You think like an ID pro."
  if (score.value === 3) return "Solid instincts. One to revisit."
  if (score.value === 2) return "Good start. ID is a craft worth digging into."
  return "Instructional Design might surprise you — keep going."
})
</script>

<template>
  <div class="id-page">
    <!-- Progress bar -->
    <div class="id-progress-track">
      <div class="id-progress-fill" :style="{ width: (done ? 100 : progress) + '%' }"></div>
    </div>

    <Transition name="fade" mode="out-in">
      <!-- Final screen -->
      <div v-if="done" key="done" class="id-card id-done">
        <p class="id-phase">Complete</p>
        <h1 class="id-done-title">You just ran an ID project.</h1>
        <p class="id-done-body">
          Needs analysis → gap diagnosis → targeted design → real measurement.<br>
          Most people call it "making training". This is what it actually is.
        </p>
        <div class="id-score">
          <span class="id-score-num">{{ score }}/{{ steps.length }}</span>
          <span class="id-score-label">{{ scoreLabel }}</span>
        </div>
        <div class="id-done-actions">
          <NuxtLink to="/" class="id-btn id-btn-primary">See My Work</NuxtLink>
          <button class="id-btn id-btn-ghost" @click="restart">Try again</button>
        </div>
      </div>

      <!-- Step screen -->
      <div v-else :key="currentStep" class="id-card">
        <div class="id-meta">
          <span class="id-phase">{{ step.phase }}</span>
          <span class="id-counter">{{ currentStep + 1 }} / {{ steps.length }}</span>
        </div>

        <p class="id-context">{{ step.context }}</p>
        <h2 class="id-question">{{ step.question }}</h2>

        <div class="id-options">
          <button
            v-for="(opt, i) in step.options"
            :key="i"
            class="id-option"
            :class="{
              'id-option--correct':   revealed && i === step.correct,
              'id-option--wrong':     revealed && i === selected && i !== step.correct,
              'id-option--selected':  revealed && i === selected,
              'id-option--dimmed':    revealed && i !== selected && i !== step.correct
            }"
            :disabled="revealed"
            @click="choose(i)"
          >
            <span class="id-option-letter">{{ ['A', 'B', 'C'][i] }}</span>
            <span class="id-option-text">{{ opt }}</span>
          </button>
        </div>

        <Transition name="slide-up">
          <div v-if="revealed" class="id-feedback" :class="isCorrect ? 'id-feedback--right' : 'id-feedback--wrong'">
            <span class="id-feedback-tag">{{ isCorrect ? 'Correct' : 'Not quite' }}</span>
            <p class="id-feedback-text">{{ step.feedback }}</p>
            <button class="id-btn id-btn-primary" @click="next">
              {{ currentStep < steps.length - 1 ? 'Next →' : 'See results' }}
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.id-page {
  position: fixed;
  inset: 0;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--page-top) 24rem calc(100rem + var(--safe-bottom));
  overflow-y: auto;
}

/* Progress */
.id-progress-track {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3rem;
  background: var(--color-text);
  opacity: 0.08;
  z-index: 10;
}
.id-progress-fill {
  height: 100%;
  background: var(--color-text);
  opacity: 1;
  transition: width 0.5s ease;
}

/* Card */
.id-card {
  width: 100%;
  max-width: 640rem;
  display: flex;
  flex-direction: column;
  gap: 24rem;
}

/* Meta row */
.id-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.id-phase {
  font-size: 11rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.45;
}
.id-counter {
  font-size: 11rem;
  font-weight: 500;
  color: var(--color-text);
  opacity: 0.3;
  letter-spacing: 0.05em;
}

/* Context + Question */
.id-context {
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--color-text);
  opacity: 0.6;
  margin: 0;
}
.id-question {
  font-size: var(--text-h2);
  font-weight: 700;
  line-height: 1.35;
  color: var(--color-text);
  margin: 0;
}

/* Options */
.id-options {
  display: flex;
  flex-direction: column;
  gap: 10rem;
}
.id-option {
  display: flex;
  align-items: flex-start;
  gap: 14rem;
  padding: 16rem 20rem;
  border-radius: 12rem;
  border: 1.5px solid var(--color-text);
  background: transparent;
  color: var(--color-text);
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, opacity 0.2s ease;
  opacity: 0.55;
}
.id-option:not(:disabled):hover {
  opacity: 1;
  background: color-mix(in srgb, var(--color-text) 6%, transparent);
}
.id-option-letter {
  font-size: 11rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  opacity: 0.5;
  flex-shrink: 0;
  padding-top: 2rem;
}
.id-option-text {
  font-size: 15rem;
  line-height: 1.5;
}

/* Option states */
.id-option--correct {
  border-color: var(--color-accent) !important;
  background: color-mix(in srgb, var(--color-accent) 16%, transparent) !important;
  opacity: 1 !important;
}
.id-option--wrong {
  border-color: color-mix(in srgb, var(--color-text) 32%, transparent) !important;
  background: color-mix(in srgb, var(--color-text) 6%, transparent) !important;
  opacity: 1 !important;
}
.id-option--dimmed {
  opacity: 0.25 !important;
}

/* Feedback */
.id-feedback {
  padding: 20rem 24rem;
  border-radius: 12rem;
  display: flex;
  flex-direction: column;
  gap: 10rem;
  border-left: 3px solid transparent;
}
.id-feedback--right {
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  border-left-color: var(--color-accent);
}
.id-feedback--wrong {
  background: color-mix(in srgb, var(--color-text) 6%, transparent);
  border-left-color: color-mix(in srgb, var(--color-text) 38%, transparent);
}
.id-feedback-tag {
  font-size: 11rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.7;
  color: var(--color-text);
}
.id-feedback-text {
  font-size: 14rem;
  line-height: 1.65;
  color: var(--color-text);
  opacity: 0.8;
  margin: 0;
}

/* Buttons */
.id-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--btn-pad-y) var(--btn-pad-x);
  border-radius: var(--radius-full);
  font-size: 14rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
  text-decoration: none;
  align-self: flex-start;
}
.id-btn:active { transform: scale(var(--btn-press)); }
.id-btn-primary {
  background: var(--color-text);
  color: var(--color-bg);
  border: none;
}
.id-btn-ghost {
  background: transparent;
  color: var(--color-text);
  border: 1.5px solid var(--color-text);
  opacity: 0.55;
}
.id-btn-ghost:hover { opacity: 1; }

/* Done screen */
.id-done { gap: 20rem; }
.id-done-title {
  font-size: var(--text-h1);
  font-weight: 800;
  line-height: 1.2;
  color: var(--color-text);
  margin: 0;
}
.id-done-body {
  font-size: 16rem;
  line-height: 1.7;
  color: var(--color-text);
  opacity: 0.65;
  margin: 0;
}
.id-score {
  display: flex;
  align-items: baseline;
  gap: 14rem;
  padding: 16rem 0;
  border-top: 1px solid var(--color-text);
  border-bottom: 1px solid var(--color-text);
  opacity: 0.9;
}
.id-score-num {
  font-size: 40rem;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1;
}
.id-score-label {
  font-size: 14rem;
  color: var(--color-text);
  opacity: 0.6;
  line-height: 1.4;
}
.id-done-actions {
  display: flex;
  gap: 12rem;
  flex-wrap: wrap;
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.slide-up-enter-from { opacity: 0; transform: translateY(12rem); }
</style>
