<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })
useSeoMeta({
  title: 'EasyMCQ — Distractor Generator · Entertrainer',
  description: 'Give a question and its correct answer, and EasyMCQ writes three plausible wrong options that test real understanding. A free tool for L&D teams.',
  ogTitle: 'EasyMCQ — Distractor Generator',
  ogDescription: 'Turn correct answers into brilliant, plausible wrong options.',
  ogUrl: 'https://entertrainer.in/tools/easymcq'
})

const question  = ref('')
const answer    = ref('')
const pending   = ref(false)
const error     = ref('')
const results   = ref<string[]>([])
const copied    = ref<number | null>(null)

const canSubmit = computed(() => question.value.trim().length > 0 && answer.value.trim().length > 0)

const EXAMPLE_PROMPTS = [
  { q: 'What is the primary purpose of a needs analysis?', a: 'To identify the gap between current and desired performance before designing a solution.' },
  { q: 'What does ADDIE stand for?', a: 'Analysis, Design, Development, Implementation, Evaluation.' },
  { q: 'Why use Bloom\'s taxonomy when writing objectives?', a: 'It ensures objectives target the right cognitive level for the desired learning outcome.' }
] as const

function loadExample(ex: typeof EXAMPLE_PROMPTS[number]) {
  question.value = ex.q
  answer.value = ex.a
}

async function generate() {
  if (!canSubmit.value || pending.value) return
  pending.value = true
  error.value   = ''
  results.value = []

  try {
    const data = await $fetch<{ distractors: string[] }>('/api/distractor', {
      method: 'POST',
      body: { question: question.value.trim(), answer: answer.value.trim() }
    })
    results.value = data.distractors
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Something went wrong. Please try again.'
  } finally {
    pending.value = false
  }
}

async function copy(text: string, i: number) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = i
    setTimeout(() => { copied.value = null }, 1600)
  } catch {}
}
</script>

<template>
  <UiToolShell eyebrow="Distractor Generator" deck="Turn correct answers into brilliant wrong ones — plausible options that test real understanding.">
    <template #title>
      <span class="mcq-lockup">
        <ToolsMcqBrandMark :size="46" class="mcq-lockup__mark" />
        <span class="mcq-wordmark">EasyMCQ</span>
      </span>
    </template>

    <!-- Form / Loading -->
    <div class="glass-panel dg-form" :class="{ 'dg-form--loading': pending }">
      <!-- Loading state (rich, matches Better Emails) -->
      <div v-if="pending" class="dg-loading">
        <div class="dg-loading-spinner" />
        <p class="dg-loading-title">Crafting clever distractors...</p>
        <p class="dg-loading-subtitle">Generating plausible but incorrect options that test real understanding.</p>
        <p class="dg-loading-hint">Just a moment.</p>
      </div>

      <!-- Normal form -->
      <form v-else @submit.prevent="generate">
        <div style="margin-bottom:8rem;">
          <span class="glass-label">Need inspiration? Try an example</span>
          <div style="display:flex; flex-wrap:wrap; gap:6rem; margin-top:4rem;">
            <button
              v-for="ex in EXAMPLE_PROMPTS"
              :key="ex.q"
              type="button"
              class="glass-chip"
              style="font-size:12rem;"
              @click="loadExample(ex)"
            >
              {{ ex.q.length > 42 ? ex.q.slice(0,39)+'…' : ex.q }}
            </button>
          </div>
        </div>

        <label class="glass-label" for="dg-question">Your question</label>
        <textarea
          id="dg-question"
          v-model="question"
          class="glass-field dg-textarea"
          placeholder="e.g. What is the primary purpose of a needs analysis in instructional design?"
          rows="3"
        />

        <label class="glass-label" for="dg-answer">Correct answer</label>
        <textarea
          id="dg-answer"
          v-model="answer"
          class="glass-field dg-textarea"
          placeholder="e.g. To identify the gap between current and desired performance before designing a solution."
          rows="2"
        />

        <button
          type="submit"
          class="glass-btn dg-submit"
          :disabled="!canSubmit"
        >
          Generate distractors
        </button>
      </form>
    </div>

    <!-- Error -->
    <Transition name="fade">
      <p v-if="error" class="glass-note glass-note--error dg-error">{{ error }}</p>
    </Transition>

    <!-- Results -->
    <Transition name="slide-up">
      <div v-if="results.length" class="dg-results">
        <p class="glass-label dg-results-label">Three distractors — ready to drop in</p>
        <div
          v-for="(d, i) in results"
          :key="i"
          class="glass-panel dg-result-card"
        >
          <span class="dg-result-letter">{{ ['A', 'B', 'C'][i] }}</span>
          <span class="dg-result-text">{{ d }}</span>
          <button class="glass-chip dg-copy" @click="copy(d, i)" :aria-label="'Copy distractor ' + ['A','B','C'][i]">
            {{ copied === i ? '✓' : 'Copy' }}
          </button>
        </div>
      </div>
    </Transition>

  </UiToolShell>
</template>

<style scoped>
/* ── EasyMCQ brand lockup (page header) ── */
.mcq-lockup {
  display: inline-flex;
  align-items: center;
  gap: 14rem;
}
.mcq-lockup__mark {
  flex-shrink: 0;
  filter: drop-shadow(0 6rem 18rem rgba(91, 141, 239, 0.28));
}
.mcq-wordmark {
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  background: linear-gradient(100deg, #8B7CF6, #5B8DEF 55%, #2DD4BF);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
@media (max-width: 600px) {
  .mcq-lockup { gap: 11rem; }
  .mcq-lockup__mark { width: 38rem; height: 38rem; }
}

/* ── Form layout (surfaces from global .glass-* primitives) ── */
.dg-form {
  display: flex;
  flex-direction: column;
  gap: 12rem;
}
.dg-form--loading {
  align-items: center;
  justify-content: center;
  min-height: 180rem;
}
.dg-loading { display: block; }
.dg-textarea { resize: vertical; margin-bottom: 8rem; }
.dg-submit { align-self: flex-start; margin-top: 12rem; }

/* Rich loading state (matches Better Emails) */
.dg-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32rem 16rem;
}
.dg-loading-spinner {
  width: 32rem;
  height: 32rem;
  border: 3rem solid var(--color-glass-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16rem;
}
.dg-loading-title {
  font-size: var(--text-body);
  font-weight: 600;
  margin: 0 0 8rem;
}
.dg-loading-subtitle {
  font-size: var(--text-sm);
  opacity: 0.75;
  margin: 0 0 4rem;
}
.dg-loading-hint {
  font-size: var(--text-sm);
  opacity: 0.55;
  margin: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

.dg-error { margin: 16rem 0 0; }

/* ── Results ── */
.dg-results {
  display: flex;
  flex-direction: column;
  gap: 10rem;
  margin-top: 28rem;
}
.dg-results-label { margin: 0 0 4rem; padding-bottom: 0; opacity: 0.4; }
.dg-results .glass-panel:nth-child(2) { animation-delay: 0.05s; }
.dg-results .glass-panel:nth-child(3) { animation-delay: 0.11s; }
.dg-results .glass-panel:nth-child(4) { animation-delay: 0.17s; }

.dg-result-card {
  display: flex;
  align-items: flex-start;
  gap: 14rem;
  padding: 16rem 18rem;
}
.dg-result-letter {
  font-size: 11rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  opacity: 0.4;
  padding-top: 2rem;
  flex-shrink: 0;
  width: 12rem;
}
.dg-result-text {
  font-size: var(--text-sm);
  line-height: 1.5;
  flex: 1;
  color: var(--color-text);
}
.dg-copy { flex-shrink: 0; align-self: flex-start; }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.slide-up-enter-from { opacity: 0; transform: translateY(10rem); }
</style>
