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
  <div class="detail-page dg-page">
    <h1 class="detail-title">Distractor Generator</h1>
    <p class="detail-desc">Turn correct answers into brilliant wrong ones.</p>

    <div class="dg-body">
      <!-- Form -->
      <form class="dg-form" @submit.prevent="generate">
        <label class="dg-label" for="dg-question">Your question</label>
        <textarea
          id="dg-question"
          v-model="question"
          class="dg-textarea"
          placeholder="e.g. What is the primary purpose of a needs analysis in instructional design?"
          rows="3"
          :disabled="pending"
        />

        <label class="dg-label" for="dg-answer">Correct answer</label>
        <textarea
          id="dg-answer"
          v-model="answer"
          class="dg-textarea"
          placeholder="e.g. To identify the gap between current and desired performance before designing a solution."
          rows="2"
          :disabled="pending"
        />

        <button
          type="submit"
          class="dg-submit"
          :disabled="!canSubmit || pending"
        >
          <span v-if="pending" class="dg-spinner"></span>
          <span>{{ pending ? 'Generating…' : 'Generate distractors' }}</span>
        </button>
      </form>

      <!-- Error -->
      <Transition name="fade">
        <p v-if="error" class="dg-error">{{ error }}</p>
      </Transition>

      <!-- Results -->
      <Transition name="slide-up">
        <div v-if="results.length" class="dg-results">
          <p class="dg-results-label">Three distractors — ready to drop in</p>
          <div
            v-for="(d, i) in results"
            :key="i"
            class="dg-result-card"
          >
            <span class="dg-result-letter">{{ ['A', 'B', 'C'][i] }}</span>
            <span class="dg-result-text">{{ d }}</span>
            <button class="dg-copy" @click="copy(d, i)" :aria-label="'Copy distractor ' + ['A','B','C'][i]">
              {{ copied === i ? '✓' : 'Copy' }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.dg-page {
  min-height: 100dvh;
  background: var(--color-bg);
  color: var(--color-text);
  padding: var(--page-top) var(--grid-margin) calc(100rem + var(--safe-bottom));
}

.dg-body {
  border-top: 1px solid var(--color-white20);
  padding-top: 48rem;
  display: flex;
  flex-direction: column;
  gap: 32rem;
  max-width: 640rem;
}

/* ── Form ── */
.dg-form {
  display: flex;
  flex-direction: column;
  gap: 12rem;
}

.dg-label {
  font-size: var(--text-label);
  font-weight: 600;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  opacity: 0.45;
  padding-bottom: 2rem;
}

.dg-textarea {
  width: 100%;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 12rem;
  color: var(--color-text);
  font-family: inherit;
  font-size: 15rem;
  line-height: 1.55;
  padding: 14rem 16rem;
  resize: vertical;
  transition: border-color 0.15s ease, background 0.15s ease;
  margin-bottom: 8rem;
}
.dg-textarea::placeholder { opacity: 0.35; }
.dg-textarea:focus {
  outline: none;
  border-color: var(--color-glass-border-hover);
  background: var(--color-glass-bg-hover);
}
.dg-textarea:disabled { opacity: 0.5; cursor: not-allowed; }

.dg-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10rem;
  align-self: flex-start;
  margin-top: 4rem;
  padding: var(--btn-pad-y) var(--btn-pad-x);
  border-radius: var(--radius-full);
  background: var(--color-text);
  color: var(--color-bg);
  font-family: inherit;
  font-size: 14rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.1s ease;
}
.dg-submit:disabled { opacity: 0.4; cursor: not-allowed; }
.dg-submit:not(:disabled):active { transform: scale(var(--btn-press)); }

/* Spinner */
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

/* ── Error ── */
.dg-error {
  font-size: 14rem;
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-text) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-text) 22%, transparent);
  border-radius: 10rem;
  padding: 12rem 16rem;
  margin: 0;
}

/* ── Results ── */
.dg-results {
  display: flex;
  flex-direction: column;
  gap: 10rem;
}

.dg-results-label {
  font-size: var(--text-label);
  font-weight: 600;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  opacity: 0.4;
  margin: 0 0 4rem;
}

.dg-result-card {
  display: flex;
  align-items: flex-start;
  gap: 14rem;
  padding: 16rem 18rem;
  border-radius: 12rem;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
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
  font-size: 15rem;
  line-height: 1.5;
  flex: 1;
  color: var(--color-text);
}

.dg-copy {
  flex-shrink: 0;
  padding: 4rem 12rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-glass-border);
  background: transparent;
  color: var(--color-text);
  font-family: inherit;
  font-size: 12rem;
  font-weight: 500;
  cursor: pointer;
  opacity: 0.55;
  transition: opacity 0.15s ease, background 0.15s ease;
  white-space: nowrap;
}
.dg-copy:hover { opacity: 1; background: var(--color-glass-bg-hover); }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.slide-up-enter-from { opacity: 0; transform: translateY(10rem); }
</style>
