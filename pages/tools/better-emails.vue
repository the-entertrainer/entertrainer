<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })
useSeoMeta({
  title: 'Draftly — Email Polisher · Entertrainer',
  description: 'Turn messy drafts into clear, professional emails, with a plain-language explanation of what changed and why. A free tool for L&D teams.',
  ogTitle: 'Draftly — Email Polisher',
  ogDescription: 'Turn messy drafts into clear, professional emails.',
  ogUrl: 'https://entertrainer.in/tools/better-emails'
})

type Phase = 'compose' | 'loading' | 'results'

const phase   = ref<Phase>('compose')
const draft   = ref('')
const context = ref('')
const audience = ref<'colleague' | 'manager' | 'client' | 'team' | 'learner' | ''>('')
const tone    = ref<'casual' | 'semi-formal' | 'formal'>('semi-formal')
const error   = ref('')

const subject       = ref('')
const body          = ref('')
const improvements  = ref<string[]>([])
const originalDraft = ref('')
const copiedSubject = ref(false)
const copiedBody    = ref(false)
const copiedFull    = ref(false)

const editingResult = ref(false)
const editedSubject = ref('')
const editedBody    = ref('')

const canSubmit = computed(() => draft.value.trim().length > 0)

const formattedBody = computed(() => {
  if (!body.value) return []
  return body.value
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => p.replace(/\n/g, '<br>'))
})

const TONE_OPTIONS = [
  { value: 'casual',     label: 'Casual'      },
  { value: 'semi-formal', label: 'Semi-Formal' },
  { value: 'formal',     label: 'Formal'       },
] as const

const AUDIENCE_OPTIONS = [
  { value: 'colleague', label: 'Colleague' },
  { value: 'manager',   label: 'Manager / Boss' },
  { value: 'client',    label: 'Client / Stakeholder' },
  { value: 'team',      label: 'Team' },
  { value: 'learner',   label: 'Learner / Participant' },
] as const

const EXAMPLE_DRAFTS = [
  {
    label: "Vague request",
    draft: "hey can u send me the report asap thx",
    context: "I need the Q3 training completion report from the L&D team for my manager.",
    audience: "colleague",
    tone: "semi-formal"
  },
  {
    label: "Long ramble",
    draft: "I wanted to follow up on our conversation last week about the new compliance module. I think we should probably move forward with the Storyline version but I'm not sure about the timeline because there are a lot of other projects going on right now and also the SMEs are really busy. What do you think?",
    context: "Follow-up to stakeholder about choosing authoring tool and timeline for compliance training.",
    audience: "manager",
    tone: "semi-formal"
  },
  {
    label: "Too blunt",
    draft: "The elearning you sent is full of errors. Fix it and send back by tomorrow.",
    context: "Feedback to external vendor on a draft course. Need it revised professionally.",
    audience: "client",
    tone: "formal"
  },
  {
    label: "Request for feedback",
    draft: "attached is the first draft of the onboarding storyboard. let me know what u think",
    context: "Sharing initial storyboard for new hire orientation course with the instructional design team for review.",
    audience: "team",
    tone: "semi-formal"
  },
  {
    label: "Escalation",
    draft: "the vendor missed the deadline again. this is the third time. we need to do something about this",
    context: "Escalating repeated delays from an e-learning vendor to the procurement manager.",
    audience: "manager",
    tone: "formal"
  },
  {
    label: "Asking for resources",
    draft: "i need more time and budget for the leadership program redesign or we wont hit the launch date",
    context: "Requesting additional time and budget from senior leadership for redesigning the manager development program.",
    audience: "manager",
    tone: "semi-formal"
  }
] as const

const TRAFFIC_ERROR = "Wow! Seems like there is a lot of traffic here today! Please grab a cup of coffee meanwhile and try again in a moment."

async function optimize(refineInstruction = '') {
  if (!canSubmit.value || phase.value === 'loading') return

  // Save original draft the first time we leave compose
  if (!originalDraft.value && !refineInstruction) {
    originalDraft.value = draft.value.trim()
  }

  phase.value = 'loading'
  error.value = ''

  try {
    const payload: any = {
      draft: draft.value.trim(),
      tone: tone.value,
      context: context.value.trim(),
      audience: audience.value,
    }
    if (refineInstruction) payload.refineInstruction = refineInstruction

    const data = await $fetch<{ subject: string; body: string; improvements?: string[] }>('/api/better-emails', {
      method: 'POST',
      body: payload
    })

    subject.value       = data.subject
    body.value          = data.body
    improvements.value  = data.improvements || []
    editedSubject.value = data.subject
    editedBody.value    = data.body
    editingResult.value = false
    phase.value         = 'results'
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

async function copyFull() {
  const full = `Subject: ${subject.value}\n\n${body.value}`
  try {
    await navigator.clipboard.writeText(full)
    copiedFull.value = true
    setTimeout(() => { copiedFull.value = false }, 1600)
  } catch {}
}

function reset() {
  phase.value         = 'compose'
  error.value         = ''
  subject.value       = ''
  body.value          = ''
  improvements.value  = []
  context.value       = ''
  audience.value      = ''
  editedSubject.value = ''
  editedBody.value    = ''
  editingResult.value = false
  // keep originalDraft and draft so user can see what they started with
}

function useOriginal() {
  if (originalDraft.value) {
    draft.value = originalDraft.value
    phase.value = 'compose'
  }
}

function startEditingResult() {
  editedSubject.value = subject.value
  editedBody.value = body.value
  editingResult.value = true
}

function cancelEditingResult() {
  editingResult.value = false
}

function reoptimizeEditedVersion() {
  if (!editedBody.value.trim()) return
  draft.value = editedBody.value.trim()
  editingResult.value = false
  // Re-optimize using the edited version as new draft (keeps context + tone)
  optimize()
}

function applyEdits() {
  subject.value = editedSubject.value.trim()
  body.value = editedBody.value.trim()
  editingResult.value = false
}

function loadExample(ex: typeof EXAMPLE_DRAFTS[number]) {
  draft.value = ex.draft
  if (ex.context) context.value = ex.context
  if (ex.audience) audience.value = ex.audience as any
  if (ex.tone) tone.value = ex.tone as any
  // scroll to top of form if needed
  nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
}
</script>

<template>
  <UiToolShell eyebrow="Email Polisher" deck="Turn messy drafts into clear, professional emails, with a note on what changed.">
    <template #title>
      <span class="draftly-lockup">
        <ToolsEmailBrandMark :size="46" class="draftly-lockup__mark" />
        <span class="draftly-wordmark">Draftly</span>
      </span>
    </template>

    <!-- Compose / form / loading -->
    <Transition name="fade" mode="out-in">
      <div v-if="phase !== 'results'" key="form" class="glass-panel be-form">

        <!-- Loading state -->
        <div v-if="phase === 'loading'" class="be-loading">
          <div class="be-loading-spinner" />
          <p class="be-loading-title">Polishing your email...</p>
          <p class="be-loading-subtitle">Turning your thoughts into something clear, concise, and professional.</p>
          <p class="be-loading-hint">This usually takes just a few seconds.</p>
        </div>

        <!-- Normal compose form -->
        <form v-else @submit.prevent="optimize">

          <div class="be-examples">
            <span class="glass-label">Need inspiration? Try an example</span>
            <div class="be-example-chips">
              <button
                v-for="ex in EXAMPLE_DRAFTS"
                :key="ex.label"
                type="button"
                class="glass-chip be-example-chip"
                @click="loadExample(ex)"
              >
                {{ ex.label }}
              </button>
            </div>
          </div>

          <div class="be-field">
          <div class="be-field-header">
            <label class="glass-label" for="be-draft">Your draft</label>
            <span class="be-wordcount">{{ draft.trim().split(/\s+/).filter(Boolean).length }} words</span>
          </div>
          <textarea
            id="be-draft"
            v-model="draft"
            class="glass-field be-textarea"
            placeholder="Paste your rough email here. Bullet points, fragments, all-caps rants, anything goes."
            rows="7"
            :disabled="phase === 'loading'"
          />
        </div>

        <div class="be-field">
          <label class="glass-label" for="be-context">Context / Goal (optional but very helpful)</label>
          <textarea
            id="be-context"
            v-model="context"
            class="glass-field be-textarea"
            placeholder="e.g. This is to my manager. I need her to approve extra budget for the new e-learning platform by Friday."
            rows="2"
            :disabled="phase === 'loading'"
          />
        </div>

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

          <div class="be-audience-wrap">
            <label class="glass-label">Audience</label>
            <div class="be-audience-chips">
              <button
                v-for="opt in AUDIENCE_OPTIONS"
                :key="opt.value"
                type="button"
                class="glass-chip"
                :class="{ active: audience === opt.value }"
                @click="audience = audience === opt.value ? '' : opt.value"
                :disabled="phase === 'loading'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="glass-btn be-submit"
            :disabled="!canSubmit || phase === 'loading'"
          >
            <span>Optimize Email</span>
          </button>
        </div>

        <!-- Error -->
        <Transition name="fade">
          <p v-if="error" class="glass-note glass-note--error be-error">{{ error }}</p>
        </Transition>

        </form>
      </div>

      <!-- Results -->
      <div v-else key="results" class="be-results">

        <!-- Improvements (educational value) -->
        <div v-if="improvements.length" class="glass-panel be-improvements">
          <span class="glass-label">What got better</span>
          <ul>
            <li v-for="(imp, i) in improvements" :key="i">{{ imp }}</li>
          </ul>
        </div>

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
            <div class="be-copy-group">
              <button class="glass-chip" :class="{ copied: copiedBody }" @click="copyBody">
                {{ copiedBody ? 'Copied ✓' : 'Copy body' }}
              </button>
              <button class="glass-chip" :class="{ copied: copiedFull }" @click="copyFull">
                {{ copiedFull ? 'Copied ✓' : 'Copy full email' }}
              </button>
            </div>
          </div>
          <div class="be-body">
            <p v-for="(para, i) in formattedBody" :key="i" class="be-body-para" v-html="para"></p>
          </div>

          <!-- Inline edit + re-optimize -->
          <div v-if="!editingResult" class="be-edit-result">
            <button class="glass-btn glass-btn--ghost be-edit-btn" @click="startEditingResult">
              Edit this version &amp; re-optimize
            </button>
          </div>

          <div v-else class="glass-panel be-edit-panel">
            <label class="glass-label">Subject</label>
            <input
              v-model="editedSubject"
              class="glass-field"
              type="text"
              placeholder="Subject line"
            />

            <label class="glass-label" style="margin-top: 12rem;">Body</label>
            <textarea
              v-model="editedBody"
              class="glass-field"
              rows="6"
            />

            <div class="be-edit-actions">
              <button class="glass-btn glass-btn--ghost" @click="cancelEditingResult">Cancel</button>
              <button class="glass-btn glass-btn--ghost" @click="applyEdits">Apply edits</button>
              <button class="glass-btn" @click="reoptimizeEditedVersion">Re-optimize this version</button>
            </div>
          </div>
        </div>

        <!-- Quick refinements -->
        <div class="be-refine">
          <span class="glass-label be-refine-label">Quick refinements</span>
          <div class="be-refine-chips">
            <button type="button" class="glass-chip" @click="optimize('Make it noticeably shorter and tighter')">Shorter</button>
            <button type="button" class="glass-chip" @click="optimize('Make it more direct and confident')">More direct</button>
            <button type="button" class="glass-chip" @click="optimize('Add a clear, specific call to action with a deadline')">Add strong CTA</button>
            <button type="button" class="glass-chip" @click="optimize('Soften the language and make it warmer')">Warmer tone</button>
          </div>
        </div>

        <div class="be-results-actions">
          <button class="glass-btn glass-btn--ghost be-back" @click="reset">← New draft</button>
          <button v-if="originalDraft" class="glass-btn glass-btn--ghost" @click="useOriginal">Edit original draft</button>
        </div>

        <!-- Original for reference -->
        <details v-if="originalDraft" class="be-original">
          <summary>View original draft</summary>
          <pre class="be-original-text">{{ originalDraft }}</pre>
        </details>

      </div>
    </Transition>

  </UiToolShell>
</template>

<style scoped>
/* ── Draftly brand lockup (page header) ── */
.draftly-lockup {
  display: inline-flex;
  align-items: center;
  gap: 14rem;
}
.draftly-lockup__mark {
  flex-shrink: 0;
  filter: drop-shadow(0 6rem 18rem rgba(91, 141, 239, 0.28));
}
.draftly-wordmark {
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  background: linear-gradient(100deg, #8B7CF6, #5B8DEF 55%, #2DD4BF);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
@media (max-width: 600px) {
  .draftly-lockup { gap: 11rem; }
  .draftly-lockup__mark { width: 38rem; height: 38rem; }
}

/* ── Form layout ── */
.be-form {
  display: flex;
  flex-direction: column;
  gap: 14rem;
}
.be-field { display: flex; flex-direction: column; gap: 6rem; }
.be-field-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.be-wordcount {
  font-size: 11rem;
  opacity: 0.5;
  font-feature-settings: "tnum";
}
.be-textarea { resize: vertical; }

.be-controls {
  display: flex;
  align-items: flex-end;
  gap: 16rem;
  flex-wrap: wrap;
}
.be-tone-wrap, .be-audience-wrap {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}
.be-tone-select { width: auto; font-weight: 500; padding-top: 11rem; padding-bottom: 11rem; }

.be-audience-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6rem;
}
.be-audience-chips .glass-chip {
  font-size: 12rem;
  padding: 6rem 12rem;
}
.be-audience-chips .glass-chip.active {
  background: color-mix(in srgb, rgb(var(--accent-fog, 150,140,255)) 30%, transparent);
  border-color: var(--color-glass-border-hover);
}

.be-submit { padding-top: 12rem; padding-bottom: 12rem; margin-left: auto; }

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
  gap: 18rem;
}

.be-improvements {
  padding: 18rem 22rem;
}
.be-improvements ul {
  margin: 8rem 0 0;
  padding-left: 18rem;
  font-size: var(--text-sm);
  line-height: 1.55;
}
.be-improvements li { margin-bottom: 4rem; }

.be-card {
  display: flex;
  flex-direction: column;
  gap: 10rem;
}
.be-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rem;
  flex-wrap: wrap;
}
.be-card-label { padding-bottom: 0; }

.be-copy-group {
  display: flex;
  gap: 6rem;
}

.glass-chip.copied {
  background: color-mix(in srgb, rgb(var(--accent-fog, 150,140,255)) 26%, transparent);
}

.be-body {
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--color-text);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  /* RTF / email-like formatting */
  max-width: 100%;
  padding: 4rem 0;
}
.be-body-para {
  margin: 0 0 1em;
}
.be-body-para:last-child { margin-bottom: 0; }

.be-subject {
  font-weight: 600;
  font-size: var(--text-body);
}

/* Quick refinements */
.be-refine { display: flex; flex-direction: column; gap: 6rem; }
.be-refine-label { margin-bottom: 2rem; }
.be-refine-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6rem;
}
.be-refine-chips .glass-chip {
  padding: 6rem 12rem;
}

/* Actions */
.be-results-actions {
  display: flex;
  gap: 10rem;
  flex-wrap: wrap;
}
.be-results-actions .glass-btn--ghost {
  font-size: 14rem;
  padding: var(--btn-pad-y) var(--btn-pad-x);
}
.be-back { margin-top: 4rem; }

.be-original {
  margin-top: 4rem;
  font-size: var(--text-sm);
  opacity: 0.85;
}
.be-original summary {
  cursor: pointer;
  user-select: none;
  margin-bottom: 6rem;
}
.be-original-text {
  white-space: pre-wrap;
  background: color-mix(in srgb, var(--color-bg) 85%, transparent);
  padding: 10rem 14rem;
  border-radius: 8rem;
  margin: 0;
  font-size: 12rem;
  line-height: 1.5;
}

/* Edit result */
.be-edit-result {
  margin-top: 8rem;
}
.be-edit-btn {
  /* inherits full glass-btn base styles now that we include the class */
}
.be-edit-panel {
  margin-top: 12rem;
  padding: 16rem 18rem;
}
.be-edit-panel label {
  font-size: 11rem;
}
.be-edit-panel input,
.be-edit-panel textarea {
  resize: vertical;
}
.be-edit-actions {
  display: flex;
  gap: 8rem;
  margin-top: 12rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.be-edit-actions .glass-btn--ghost,
.be-edit-actions .glass-btn {
  font-size: 14rem;
  padding: var(--btn-pad-y) var(--btn-pad-x);
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.22s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Examples */
.be-examples {
  margin-bottom: 8rem;
}
.be-example-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6rem;
  margin-top: 6rem;
}
.be-example-chip {
  padding: 6rem 12rem;
  white-space: nowrap;
}

/* Improved Loading State */
.be-loading {
  padding: 32rem 24rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 180rem;
}
.be-loading-spinner {
  width: 32rem;
  height: 32rem;
  border: 3rem solid var(--color-glass-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16rem;
}
.be-loading-title {
  font-size: var(--text-body);
  font-weight: 600;
  margin: 0 0 8rem;
}
.be-loading-subtitle {
  font-size: var(--text-sm);
  opacity: 0.75;
  margin: 0 0 4rem;
}
.be-loading-hint {
  font-size: 11rem;
  opacity: 0.5;
  margin: 0;
}
</style>
