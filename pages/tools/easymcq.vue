<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

const question  = ref('')
const answer    = ref('')
const pending   = ref(false)
const error     = ref('')
const results   = ref<string[]>([])
const copied    = ref<number | null>(null)

const canSubmit = computed(() => question.value.trim().length > 0 && answer.value.trim().length > 0)

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
  <UiToolShell eyebrow="Web App" title="Distractor Generator" deck="Turn correct answers into brilliant wrong ones.">

    <!-- Form -->
    <form class="glass-panel dg-form" @submit.prevent="generate">
      <label class="glass-label" for="dg-question">Your question</label>
      <textarea
        id="dg-question"
        v-model="question"
        class="glass-field dg-textarea"
        placeholder="e.g. What is the primary purpose of a needs analysis in instructional design?"
        rows="3"
        :disabled="pending"
      />

      <label class="glass-label" for="dg-answer">Correct answer</label>
      <textarea
        id="dg-answer"
        v-model="answer"
        class="glass-field dg-textarea"
        placeholder="e.g. To identify the gap between current and desired performance before designing a solution."
        rows="2"
        :disabled="pending"
      />

      <button
        type="submit"
        class="glass-btn dg-submit"
        :disabled="!canSubmit || pending"
      >
        <span v-if="pending" class="dg-spinner"></span>
        <span>{{ pending ? 'Generating…' : 'Generate distractors' }}</span>
      </button>
    </form>

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
/* ── Form layout (surfaces from global .glass-* primitives) ── */
.dg-form {
  display: flex;
  flex-direction: column;
  gap: 12rem;
}
.dg-textarea { resize: vertical; margin-bottom: 8rem; }
.dg-submit { align-self: flex-start; margin-top: 4rem; }

.dg-spinner {
  width: 14rem;
  height: 14rem;
  border: 2px solid transparent;
  border-top-color: var(--color-bg);
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
  flex-shrink: 0;
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
