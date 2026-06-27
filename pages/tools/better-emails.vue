<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

type Phase = 'compose' | 'loading' | 'results'

const phase   = ref<Phase>('compose')
const draft   = ref('')
const tone    = ref<'casual' | 'semi-formal' | 'formal'>('semi-formal')
const error   = ref('')

const subject       = ref('')
const body          = ref('')
const copiedSubject = ref(false)
const copiedBody    = ref(false)

const canSubmit = computed(() => draft.value.trim().length > 0)

const TONE_OPTIONS = [
  { value: 'casual',     label: 'Casual'      },
  { value: 'semi-formal', label: 'Semi-Formal' },
  { value: 'formal',     label: 'Formal'       },
] as const

const TRAFFIC_ERROR = "Wow! Seems like there is a lot of traffic here today! Please grab a cup of coffee meanwhile and try again in a moment."

async function optimize() {
  if (!canSubmit.value || phase.value === 'loading') return
  phase.value = 'loading'
  error.value = ''

  try {
    const data = await $fetch<{ subject: string; body: string }>('/api/better-emails', {
      method: 'POST',
      body: { draft: draft.value.trim(), tone: tone.value }
    })
    subject.value = data.subject
    body.value    = data.body
    phase.value   = 'results'
  } catch (e: any) {
    phase.value = 'compose'
    if (e?.response?.status === 429 || e?.data?.statusCode === 429) {
      error.value = TRAFFIC_ERROR
    } else {
      error.value = e?.data?.message ?? 'Something went wrong. Please try again.'
    }
  }
}

async function copySubject() {
  try {
    await navigator.clipboard.writeText(subject.value)
    copiedSubject.value = true
    setTimeout(() => { copiedSubject.value = false }, 1600)
  } catch {}
}

async function copyBody() {
  try {
    await navigator.clipboard.writeText(body.value)
    copiedBody.value = true
    setTimeout(() => { copiedBody.value = false }, 1600)
  } catch {}
}

function reset() {
  phase.value   = 'compose'
  error.value   = ''
  subject.value = ''
  body.value    = ''
}
</script>

<template>
  <div class="detail-page be-page">
    <h1 class="detail-title">Better Emails</h1>
    <p class="detail-desc">Paste your messy draft. Get a polished email back.</p>

    <div class="be-hero-wrap">
      <img src="/better-emails.png" alt="Better Emails" class="be-hero" />
    </div>

    <div class="be-body">

      <!-- Compose / form -->
      <Transition name="fade" mode="out-in">
        <form v-if="phase !== 'results'" key="form" class="be-form" @submit.prevent="optimize">

          <label class="be-label" for="be-draft">Your draft</label>
          <textarea
            id="be-draft"
            v-model="draft"
            class="be-textarea"
            placeholder="Paste your rough email here — bullet points, fragments, all caps rants — anything goes."
            rows="8"
            :disabled="phase === 'loading'"
          />

          <div class="be-controls">
            <div class="be-tone-wrap">
              <label class="be-label" for="be-tone">Tone</label>
              <select
                id="be-tone"
                v-model="tone"
                class="be-select"
                :disabled="phase === 'loading'"
              >
                <option
                  v-for="opt in TONE_OPTIONS"
                  :key="opt.value"
                  :value="opt.value"
                >{{ opt.label }}</option>
              </select>
            </div>

            <button
              type="submit"
              class="be-submit"
              :disabled="!canSubmit || phase === 'loading'"
            >
              <span v-if="phase === 'loading'" class="be-spinner" />
              <span>{{ phase === 'loading' ? 'Optimizing…' : 'Optimize Email' }}</span>
            </button>
          </div>

          <!-- Error -->
          <Transition name="fade">
            <p v-if="error" class="be-error">{{ error }}</p>
          </Transition>

        </form>

        <!-- Results -->
        <div v-else key="results" class="be-results">

          <div class="be-card">
            <div class="be-card-header">
              <span class="be-card-label">Subject Line</span>
              <button class="be-copy" :class="{ copied: copiedSubject }" @click="copySubject">
                {{ copiedSubject ? 'Copied! ✓' : 'Copy' }}
              </button>
            </div>
            <p class="be-card-text be-subject">{{ subject }}</p>
          </div>

          <div class="be-card">
            <div class="be-card-header">
              <span class="be-card-label">Email Body</span>
              <button class="be-copy" :class="{ copied: copiedBody }" @click="copyBody">
                {{ copiedBody ? 'Copied! ✓' : 'Copy' }}
              </button>
            </div>
            <pre class="be-card-text be-body-text">{{ body }}</pre>
          </div>

          <button class="be-back" @click="reset">← Try another draft</button>

        </div>
      </Transition>

    </div>
  </div>
</template>

<style scoped>
.be-page {
  min-height: 100dvh;
  background: var(--color-bg);
  color: var(--color-text);
  padding: var(--page-top) var(--grid-margin) calc(100rem + var(--safe-bottom));
}

/* ── Hero image ── */
.be-hero-wrap {
  margin-bottom: 48rem;
  border-radius: 16rem;
  overflow: hidden;
  max-width: 720rem;
}
.be-hero {
  display: block;
  width: 100%;
  height: auto;
}

.be-body {
  border-top: 1px solid var(--color-divider);
  padding-top: 48rem;
  max-width: 640rem;
}

/* ── Form ── */
.be-form {
  display: flex;
  flex-direction: column;
  gap: 12rem;
}

.be-label {
  display: block;
  font-size: var(--text-label);
  font-weight: 600;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  opacity: 0.45;
  padding-bottom: 2rem;
}

.be-textarea {
  width: 100%;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 12rem;
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--text-sm);
  line-height: 1.6;
  padding: 14rem 16rem;
  resize: vertical;
  transition: border-color 0.15s ease, background 0.15s ease;
  margin-bottom: 8rem;
}
.be-textarea::placeholder { opacity: 0.35; }
.be-textarea:focus {
  outline: none;
  border-color: var(--color-glass-border-hover);
  background: var(--color-glass-bg-hover);
}
.be-textarea:disabled { opacity: 0.5; cursor: not-allowed; }

.be-controls {
  display: flex;
  align-items: flex-end;
  gap: 16rem;
  flex-wrap: wrap;
}

.be-tone-wrap {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.be-select {
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 10rem;
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--text-sm);
  font-weight: 500;
  padding: 10rem 36rem 10rem 14rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12rem center;
  cursor: pointer;
  transition: border-color 0.15s ease;
}
.be-select:focus {
  outline: none;
  border-color: var(--color-glass-border-hover);
}
.be-select:disabled { opacity: 0.5; cursor: not-allowed; }

.be-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10rem;
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
  white-space: nowrap;
}
.be-submit:disabled { opacity: 0.4; cursor: not-allowed; }
.be-submit:not(:disabled):active { transform: scale(var(--btn-press)); }

.be-spinner {
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
.be-error {
  font-size: var(--text-sm);
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-text) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-text) 22%, transparent);
  border-radius: 10rem;
  padding: 12rem 16rem;
  margin: 0;
  line-height: 1.55;
}

/* ── Results ── */
.be-results {
  display: flex;
  flex-direction: column;
  gap: 16rem;
}

.be-card {
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 14rem;
  padding: 20rem;
  display: flex;
  flex-direction: column;
  gap: 12rem;
}

.be-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rem;
}

.be-card-label {
  font-size: var(--text-label);
  font-weight: 600;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  opacity: 0.4;
}

.be-copy {
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
  transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease;
  white-space: nowrap;
}
.be-copy:hover { opacity: 1; background: var(--color-glass-bg-hover); }
.be-copy.copied { opacity: 1; color: var(--color-text); }

.be-card-text {
  font-size: var(--text-sm);
  line-height: 1.65;
  color: var(--color-text);
  margin: 0;
}

.be-subject {
  font-weight: 600;
  font-size: var(--text-body);
}

.be-body-text {
  font-family: inherit;
  white-space: pre-wrap;
  word-break: break-word;
}

.be-back {
  align-self: flex-start;
  background: transparent;
  border: none;
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--text-sm);
  font-weight: 500;
  opacity: 0.45;
  cursor: pointer;
  padding: 4rem 0;
  transition: opacity 0.15s ease;
  margin-top: 8rem;
}
.be-back:hover { opacity: 0.8; }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.22s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
