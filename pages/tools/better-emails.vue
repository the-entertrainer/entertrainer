<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })
useSeoMeta({
  title: 'Draftly — Email Polisher · Entertrainer',
  description: 'Turn messy drafts into clear, professional emails, with a plain-language note on what changed and why.',
  ogTitle: 'Draftly — Email Polisher',
  ogDescription: 'Turn messy drafts into clear, professional emails. Your first draft does not have to become public history.',
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

const subjects      = ref<string[]>([])
const sentDraft     = ref('')
const view          = ref<'clean' | 'diff'>('clean')
const status        = ref('')
const diffParts     = computed(() => sentDraft.value && body.value ? wordDiff(sentDraft.value, body.value) : [])
const diffStats     = computed(() => {
  let add = 0, del = 0
  for (const p of diffParts.value) {
    const n = p.text.trim() ? p.text.trim().split(/\s+/).length : 0
    if (p.kind === 'add') add += n
    if (p.kind === 'del') del += n
  }
  return { add, del }
})

/* Recent results, kept only in this browser. */
interface DraftHistory { id: string; at: number; draft: string; subject: string; body: string; tone: string }
const HISTORY_KEY = 'entertrainer.draftly.history'
const history = ref<DraftHistory[]>([])
function loadHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    history.value = Array.isArray(raw) ? raw.filter(h => h && typeof h.body === 'string').slice(0, 10) : []
  } catch { history.value = [] }
}
function pushHistory() {
  const entry: DraftHistory = { id: Date.now().toString(36), at: Date.now(), draft: sentDraft.value, subject: subject.value, body: body.value, tone: tone.value }
  history.value = [entry, ...history.value].slice(0, 10)
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value)) } catch { /* private mode */ }
}
function restoreHistory(h: DraftHistory) {
  draft.value = h.draft
  originalDraft.value = h.draft
  sentDraft.value = h.draft
  subject.value = h.subject
  subjects.value = [h.subject]
  body.value = h.body
  improvements.value = []
  tone.value = (['casual', 'semi-formal', 'formal'].includes(h.tone) ? h.tone : 'semi-formal') as typeof tone.value
  view.value = 'clean'
  phase.value = 'results'
}
function clearHistory() {
  history.value = []
  try { localStorage.removeItem(HISTORY_KEY) } catch { /* ignore */ }
}
onMounted(loadHistory)

function onKey(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); void optimize() }
}
function announce(msg: string) {
  status.value = ''
  requestAnimationFrame(() => { status.value = msg })
}

const editingResult = ref(false)
const editedSubject = ref('')
const editedBody    = ref('')

const canSubmit = computed(() => draft.value.trim().length > 0)

// Paragraphs render as text with white-space: pre-line, never as HTML.
const formattedBody = computed(() => {
  if (!body.value) return []
  return body.value
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
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
    playPress('tap')

    const data = await $fetch<{ subject: string; subjects?: string[]; body: string; improvements?: string[] }>('/api/better-emails', {
      method: 'POST',
      body: payload
    })

    subject.value       = data.subject
    subjects.value      = data.subjects?.length ? data.subjects : [data.subject]
    sentDraft.value     = payload.draft
    body.value          = data.body
    improvements.value  = data.improvements || []
    editedSubject.value = data.subject
    editedBody.value    = data.body
    editingResult.value = false
    phase.value         = 'results'
    view.value          = 'clean'
    pushHistory()
    playPress('success')
    announce('Your clearer email is ready.')
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
    announce('Subject copied.')
    setTimeout(() => { copiedSubject.value = false }, 1600)
  } catch {}
}

async function copyBody() {
  try {
    await navigator.clipboard.writeText(body.value)
    copiedBody.value = true
    announce('Body copied.')
    setTimeout(() => { copiedBody.value = false }, 1600)
  } catch {}
}

async function copyFull() {
  const full = `Subject: ${subject.value}\n\n${body.value}`
  try {
    await navigator.clipboard.writeText(full)
    copiedFull.value = true
    announce('Full email copied.')
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
  <UiToolShell deck="Paste a rough email. Get a clearer one back, with a plain note on what changed.">
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
        <div v-if="phase === 'loading'" class="be-loading" role="status" aria-live="polite">
          <EdSeedMark class="be-loading-spinner" :size="36" spin />
          <p class="be-loading-title">Optimizing email.</p>
        </div>

        <!-- Normal compose form -->
        <form v-else @submit.prevent="optimize()" @keydown="onKey">

          <div class="be-examples">
            <span class="glass-label">Examples</span>
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
            placeholder="Paste your draft email."
            rows="7"
            :disabled="phase === 'loading'"
          />
        </div>

        <div class="be-field">
          <label class="glass-label" for="be-context">Context / goal (optional)</label>
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
          <fieldset class="be-tone-wrap be-tone">
            <legend class="glass-label">Tone</legend>
            <div class="be-tone__track">
              <label v-for="opt in TONE_OPTIONS" :key="opt.value" class="be-tone__opt">
                <input v-model="tone" type="radio" name="be-tone" :value="opt.value" :disabled="phase === 'loading'">
                <span>{{ opt.label }}</span>
              </label>
            </div>
          </fieldset>

          <div class="be-audience-wrap" role="group" aria-labelledby="be-audience-label">
            <span id="be-audience-label" class="glass-label">Audience</span>
            <div class="be-audience-chips">
              <button
                v-for="opt in AUDIENCE_OPTIONS"
                :key="opt.value"
                type="button"
                class="glass-chip"
                :class="{ active: audience === opt.value }"
                :aria-pressed="audience === opt.value"
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
          <span class="be-kbd t-mono" aria-hidden="true"><kbd>Ctrl</kbd> + <kbd>Enter</kbd></span>
        </div>

        <!-- Error -->
        <Transition name="fade">
          <p v-if="error" class="glass-note glass-note--error be-error" role="alert">{{ error }}</p>
        </Transition>

        </form>
      </div>

      <!-- Results -->
      <div v-else key="results" class="be-results">

        <!-- Improvements (educational value) -->
        <div v-if="improvements.length" class="glass-panel be-improvements">
          <span class="glass-label">Changes made</span>
          <ul>
            <li v-for="(imp, i) in improvements" :key="i">{{ imp }}</li>
          </ul>
        </div>

        <div class="glass-panel be-card">
          <div class="be-card-header">
            <span class="glass-label be-card-label">Subject Line</span>
            <button class="glass-chip" :class="{ copied: copiedSubject }" @click="copySubject">
              {{ copiedSubject ? 'Copied' : 'Copy' }}
            </button>
          </div>
          <p class="be-card-text be-subject">{{ subject }}</p>
          <div v-if="subjects.length > 1" class="be-subjects" role="group" aria-label="Other subject lines">
            <span class="be-subjects__label t-mono">Or try</span>
            <button
              v-for="alt in subjects.filter(x => x !== subject)" :key="alt" type="button" class="be-subjects__alt"
              @click="subject = alt; announce('Subject line swapped.')"
            >{{ alt }}</button>
          </div>
        </div>

        <div class="glass-panel be-card">
          <div class="be-card-header">
            <span class="glass-label be-card-label">Email Body</span>
            <div class="be-copy-group">
              <button class="glass-chip" :class="{ copied: copiedBody }" @click="copyBody">
                {{ copiedBody ? 'Copied' : 'Copy body' }}
              </button>
              <button class="glass-chip" :class="{ copied: copiedFull }" @click="copyFull">
                {{ copiedFull ? 'Copied' : 'Copy full email' }}
              </button>
            </div>
          </div>
          <div v-if="sentDraft" class="be-view" role="radiogroup" aria-label="Show">
            <label class="be-view__opt"><input v-model="view" type="radio" name="be-view" value="clean"><span>Clean copy</span></label>
            <label class="be-view__opt"><input v-model="view" type="radio" name="be-view" value="diff"><span>What changed</span></label>
            <span v-if="view === 'diff'" class="be-view__stats t-mono">+{{ diffStats.add }} words · −{{ diffStats.del }} words</span>
          </div>
          <div v-if="view === 'clean' || !sentDraft" class="be-body">
            <p v-for="(para, i) in formattedBody" :key="i" class="be-body-para">{{ para }}</p>
          </div>
          <div v-else class="be-body be-diff" aria-label="Changes from your draft. Removed words are struck through, added words are highlighted.">
            <template v-for="(part, i) in diffParts" :key="i"><del v-if="part.kind === 'del'">{{ part.text }}</del><ins v-else-if="part.kind === 'add'">{{ part.text }}</ins><span v-else>{{ part.text }}</span></template>
          </div>

          <!-- Inline edit + re-optimize -->
          <div v-if="!editingResult" class="be-edit-result">
            <button class="glass-btn glass-btn--ghost be-edit-btn" @click="startEditingResult">
              Edit this version &amp; re-optimize
            </button>
          </div>

          <div v-else class="glass-panel be-edit-panel">
            <label class="glass-label" for="be-edited-subject">Subject</label>
            <input
              id="be-edited-subject"
              v-model="editedSubject"
              class="glass-field"
              type="text"
              placeholder="Subject line"
            />

            <label class="glass-label" for="be-edited-body" style="margin-top: 12rem;">Body</label>
            <textarea
              id="be-edited-body"
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

    <section v-if="history.length && phase !== 'loading'" class="be-history" aria-labelledby="be-history-title">
      <div class="be-history__head">
        <h2 id="be-history-title" class="be-history__title t-mono">Recent emails <span>kept in this browser</span></h2>
        <button type="button" class="be-history__clear" @click="clearHistory">Clear</button>
      </div>
      <ol class="be-history__list">
        <li v-for="h in history" :key="h.id">
          <button type="button" class="be-history__open" @click="restoreHistory(h)">
            <span class="be-history__subj">{{ h.subject }}</span>
            <span class="be-history__when t-mono">{{ new Date(h.at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }}</span>
          </button>
        </li>
      </ol>
    </section>
    <p class="dp-sr" role="status" aria-live="polite">{{ status }}</p>
  </UiToolShell>
</template>

<style scoped>
/* ── Draftly brand lockup (page header) ── */
.draftly-lockup {
  display: inline-flex;
  align-items: center;
  gap: 14rem;
}
.draftly-lockup__mark { flex-shrink: 0; }
.draftly-wordmark {
  font-family: var(--font-display);
  font-weight: 400;
  font-variation-settings: "opsz" 144, "SOFT" 30, "WONK" 1;
  letter-spacing: -0.035em;
  line-height: 1;
  color: var(--ink);
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
  color: var(--muted);
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
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}

.be-tone { margin: 0; padding: 0; border: 0; min-width: 0; }
.be-tone legend { padding: 0; margin-bottom: 4rem; }
.be-tone__track { display: inline-flex; padding: 3rem; border: var(--stroke) solid var(--ink); border-radius: 999rem; background: var(--paper); }
.be-tone__opt { position: relative; }
.be-tone__opt input { position: absolute; inset: 0; opacity: 0; margin: 0; cursor: pointer; }
.be-tone__opt span { display: block; padding: 8rem 13rem; border-radius: 999rem; font: 600 13rem/1 var(--font-body); white-space: nowrap; transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out); }
.be-tone__opt input:checked + span { background: var(--ink); color: var(--paper); }
.be-tone__opt input:focus-visible + span { outline: 2px solid var(--focus); outline-offset: 2px; }
.be-kbd { flex-basis: 100%; text-align: right; font-size: 12rem; color: var(--muted); }
.be-kbd kbd { font: inherit; padding: 2rem 6rem; border: 1px solid var(--line-strong); border-radius: 4rem; }

.be-subjects { display: flex; flex-wrap: wrap; align-items: center; gap: 6rem 8rem; }
.be-subjects__label { font-size: 11.5rem; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
.be-subjects__alt { max-width: 100%; padding: 6rem 11rem; border: 1px dashed var(--line-strong); border-radius: var(--radius-s); background: none; color: var(--ink); font: 500 14rem/1.3 var(--font-body); text-align: left; cursor: pointer; }
.be-subjects__alt:hover { border-style: solid; border-color: var(--ink); background: var(--paper-2); }

.be-view { display: flex; flex-wrap: wrap; align-items: center; gap: 6rem 10rem; }
.be-view__opt { position: relative; }
.be-view__opt input { position: absolute; inset: 0; opacity: 0; margin: 0; cursor: pointer; }
.be-view__opt span { display: block; padding: 6rem 12rem; border: 1px solid var(--line-strong); border-radius: 999rem; font: 600 12.5rem/1 var(--font-body); }
.be-view__opt input:checked + span { background: var(--ink); color: var(--paper); border-color: var(--ink); }
.be-view__opt input:focus-visible + span { outline: 2px solid var(--focus); outline-offset: 2px; }
.be-view__stats { margin-left: auto; font-size: 12rem; color: var(--muted); }
.be-diff { white-space: pre-wrap; font: 400 16rem/1.65 var(--font-reading); }
.be-diff del { color: var(--muted); text-decoration: line-through; text-decoration-thickness: 1.5px; }
.be-diff ins { text-decoration: none; background: color-mix(in srgb, var(--accent) 55%, transparent); box-shadow: 0 1.5px 0 var(--ink); }
.be-body-para { white-space: pre-line; }

.be-history { margin-top: clamp(34rem, 5vw, 55rem); padding-top: 16rem; border-top: var(--stroke) solid var(--ink); }
.be-history__head { display: flex; justify-content: space-between; align-items: baseline; gap: 12rem; }
.be-history__title { margin: 0 0 8rem; font-size: var(--type-meta); letter-spacing: var(--tracking-meta); text-transform: uppercase; color: var(--muted); font-weight: 500; }
.be-history__title span { text-transform: none; letter-spacing: 0; margin-left: 8rem; }
.be-history__clear { border: 0; background: none; color: var(--ink); font: 600 13rem/1 var(--font-body); text-decoration: underline; cursor: pointer; }
.be-history__list { list-style: none; margin: 0; padding: 0; }
.be-history__list li { border-bottom: 1px solid var(--line); }
.be-history__open { width: 100%; display: flex; justify-content: space-between; gap: 16rem; padding: 11rem 2rem; border: 0; background: none; color: var(--ink); text-align: left; cursor: pointer; }
.be-history__open:hover .be-history__subj { text-decoration: underline; }
.be-history__subj { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 500 15rem/1.35 var(--font-reading); }
.be-history__when { flex: 0 0 auto; font-size: 11.5rem; color: var(--muted); }

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
