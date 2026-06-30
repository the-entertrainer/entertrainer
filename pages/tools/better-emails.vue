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
  <UiToolShell eyebrow="Web App" title="Better Emails" deck="Paste your messy draft. Get a polished email back.">

    <!-- Compose / form -->
    <Transition name="fade" mode="out-in">
      <form v-if="phase !== 'results'" key="form" class="glass-panel be-form" @submit.prevent="optimize">

        <label class="glass-label" for="be-draft">Your draft</label>
        <textarea
          id="be-draft"
          v-model="draft"
          class="glass-field be-textarea"
          placeholder="Paste your rough email here — bullet points, fragments, all caps rants — anything goes."
          rows="8"
          :disabled="phase === 'loading'"
        />

        <div class="be-controls">
          <div class="be-tone-wrap">
            <label class="glass-label" for="be-tone">Tone</label>
            <select
              id="be-tone"
              v-model="tone"
              class="glass-field glass-select be-tone-select"
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
            class="glass-btn be-submit"
            :disabled="!canSubmit || phase === 'loading'"
          >
            <span v-if="phase === 'loading'" class="be-spinner" />
            <span>{{ phase === 'loading' ? 'Optimizing…' : 'Optimize Email' }}</span>
          </button>
        </div>

        <!-- Error -->
        <Transition name="fade">
          <p v-if="error" class="glass-note glass-note--error be-error">{{ error }}</p>
        </Transition>

      </form>

      <!-- Results -->
      <div v-else key="results" class="be-results">

        <div class="glass-panel be-card">
          <div class="be-card-header">
            <span class="glass-label be-card-label">Subject Line</span>
            <button class="glass-chip" :class="{ copied: copiedSubject }" @click="copySubject">
              {{ copiedSubject ? 'Copied ✓' : 'Copy' }}
            </button>
          </div>
          <p class="be-card-text be-subject">{{ subject }}</p>
        </div>

        <div class="glass-panel be-card">
          <div class="be-card-header">
            <span class="glass-label be-card-label">Email Body</span>
            <button class="glass-chip" :class="{ copied: copiedBody }" @click="copyBody">
              {{ copiedBody ? 'Copied ✓' : 'Copy' }}
            </button>
          </div>
          <pre class="be-card-text be-body-text">{{ body }}</pre>
        </div>

        <button class="glass-btn--ghost be-back" @click="reset">← Try another draft</button>

      </div>
    </Transition>

  </UiToolShell>
</template>

<style scoped>
/* ── Form layout (surfaces come from the global .glass-* primitives) ── */
.be-form {
  display: flex;
  flex-direction: column;
  gap: 12rem;
}
.be-textarea { resize: vertical; margin-bottom: 8rem; }

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
.be-tone-select { width: auto; font-weight: 500; padding-top: 11rem; padding-bottom: 11rem; }
.be-submit { padding-top: 12rem; padding-bottom: 12rem; }

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

.be-error { margin: 0; }

/* ── Results ── */
.be-results {
  display: flex;
  flex-direction: column;
  gap: 16rem;
}
.be-results .glass-panel:nth-child(2) { animation-delay: 0.07s; }

.be-card {
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
.be-card-label { padding-bottom: 0; }
.glass-chip.copied { background: color-mix(in srgb, rgb(var(--accent-fog, 150,140,255)) 26%, transparent); }

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

.be-back { align-self: flex-start; margin-top: 8rem; }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.22s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
