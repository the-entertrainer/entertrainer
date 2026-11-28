<script setup lang="ts">
import { optionsOf, toAiken, toCsv, toGift, toPlain, type McqItem } from '~/utils/mcqExport'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })
useSeoMeta({
  title: 'EasyMCQ — Distractor Generator · Entertrainer',
  description: 'Give a question and its correct answer, and EasyMCQ writes three plausible wrong options that test real understanding.',
  ogTitle: 'EasyMCQ — Distractor Generator',
  ogDescription: 'Turn correct answers into plausible wrong options. The distractors do the awkward part.',
  ogUrl: 'https://entertrainer.in/tools/easymcq'
})

type Difficulty = 'easy' | 'medium' | 'hard'
interface Distractor { text: string; locked: boolean; rationale: string; editing: boolean }
interface HistoryEntry { id: string; at: number; question: string; answer: string; distractors: string[]; rationales: string[]; keyIndex: number; difficulty: Difficulty }

const LETTERS = ['A', 'B', 'C', 'D']
const HISTORY_KEY = 'entertrainer.easymcq.history'
const HISTORY_MAX = 20

const question = ref('')
const answer = ref('')
const difficulty = ref<Difficulty>('medium')
const withRationale = ref(false)
const pending = ref(false)
const error = ref('')
const items = ref<Distractor[]>([])
const keyIndex = ref(1)
const status = ref('')
const generation = ref(0)
const history = ref<HistoryEntry[]>([])
const exportOpen = ref(false)

const canSubmit = computed(() => question.value.trim().length > 0 && answer.value.trim().length > 0)
const hasResult = computed(() => items.value.length === 3)
const lockedCount = computed(() => items.value.filter(d => d.locked).length)
const allLocked = computed(() => hasResult.value && lockedCount.value === 3)

const EXAMPLE_PROMPTS = [
  { q: 'What is the primary purpose of a needs analysis?', a: 'To identify the gap between current and desired performance before designing a solution.' },
  { q: 'What does ADDIE stand for?', a: 'Analysis, Design, Development, Implementation, Evaluation.' },
  { q: 'Why use Bloom\'s taxonomy when writing objectives?', a: 'It ensures objectives target the right cognitive level for the desired learning outcome.' }
] as const

function loadExample(ex: typeof EXAMPLE_PROMPTS[number]) {
  question.value = ex.q
  answer.value = ex.a
}

const current = computed<McqItem | null>(() => hasResult.value
  ? { question: question.value.trim(), answer: answer.value.trim(), distractors: items.value.map(d => d.text), keyIndex: keyIndex.value, rationales: items.value.map(d => d.rationale) }
  : null)
const options = computed(() => current.value ? optionsOf(current.value) : [])
/** Map an option position back to its distractor index (or -1 for the key). */
function distractorAt(pos: number) {
  if (pos === keyIndex.value) return -1
  return pos < keyIndex.value ? pos : pos - 1
}

function announce(msg: string) {
  status.value = ''
  requestAnimationFrame(() => { status.value = msg })
}

async function generate(opts: { regenerate?: boolean } = {}) {
  if (!canSubmit.value || pending.value) return
  if (opts.regenerate && allLocked.value) return
  const keep = opts.regenerate ? items.value.filter(d => d.locked) : []
  pending.value = true
  error.value = ''
  playPress('tap')
  try {
    const data = await $fetch<{ distractors: string[]; rationales?: string[] }>('/api/distractor', {
      method: 'POST',
      body: {
        question: question.value.trim(),
        answer: answer.value.trim(),
        difficulty: difficulty.value,
        rationale: withRationale.value,
        ...(keep.length ? { keep: keep.map(k => k.text) } : {})
      }
    })
    const fresh = data.distractors.map((text, i) => ({ text, locked: false, rationale: data.rationales?.[i] ?? '', editing: false }))
    if (opts.regenerate && keep.length) {
      let f = 0
      items.value = items.value.map(d => d.locked ? d : (fresh[f++] ?? d))
    } else {
      items.value = fresh
      keyIndex.value = Math.floor(Math.random() * 4)
    }
    generation.value++
    saveHistory()
    playPress('success')
    if (!opts.regenerate && window.matchMedia('(max-width: 1023px)').matches) {
      nextTick(() => document.getElementById('mcq-sheet')?.scrollIntoView({ block: 'start', behavior: motionLevel() === 'off' ? 'auto' : 'smooth' }))
    }
    announce(opts.regenerate ? `${3 - keep.length} distractor${keep.length === 2 ? '' : 's'} replaced.` : 'Three distractors ready. The question is set on the right.')
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Something went wrong. Please try again.'
  } finally {
    pending.value = false
  }
}

function toggleLock(i: number) {
  const d = items.value[i]
  if (!d) return
  d.locked = !d.locked
  playPress('toggle')
  announce(`Distractor ${i + 1} ${d.locked ? 'locked' : 'unlocked'}.`)
}

function startEdit(i: number) {
  const d = items.value[i]
  if (!d) return
  d.editing = true
  nextTick(() => document.getElementById(`mcq-edit-${i}`)?.focus())
}
function finishEdit(i: number) {
  const d = items.value[i]
  if (!d) return
  d.text = d.text.trim() || '…'
  d.editing = false
  saveHistory()
}

async function copyText(text: string, msg: string) {
  try {
    await navigator.clipboard.writeText(text)
    playPress('tap')
    announce(msg)
  } catch {
    announce('Copy was blocked by the browser.')
  }
}

function download(name: string, body: string, type: string) {
  const blob = new Blob([body], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function exportAs(kind: 'csv' | 'gift' | 'aiken', scope: 'one' | 'all') {
  const list: McqItem[] = scope === 'one' && current.value
    ? [current.value]
    : history.value.map(h => ({ question: h.question, answer: h.answer, distractors: h.distractors, keyIndex: h.keyIndex, rationales: h.rationales }))
  if (!list.length) return
  const stamp = new Date().toISOString().slice(0, 10)
  if (kind === 'csv') download(`easymcq-${stamp}.csv`, toCsv(list), 'text/csv;charset=utf-8')
  if (kind === 'gift') download(`easymcq-${stamp}.gift.txt`, toGift(list), 'text/plain;charset=utf-8')
  if (kind === 'aiken') download(`easymcq-${stamp}.aiken.txt`, toAiken(list), 'text/plain;charset=utf-8')
  exportOpen.value = false
  announce(`${list.length} question${list.length === 1 ? '' : 's'} exported.`)
}

/* History: last 20 questions, kept only in this browser. */
function loadHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    history.value = Array.isArray(raw) ? raw.filter(h => h && typeof h.question === 'string' && Array.isArray(h.distractors)).slice(0, HISTORY_MAX) : []
  } catch { history.value = [] }
}
function persistHistory() {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value)) } catch { /* private mode */ }
}
let currentId = ''
function saveHistory() {
  if (!current.value) return
  if (!currentId || generation.value === 1 && !history.value.some(h => h.id === currentId)) currentId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
  const entry: HistoryEntry = {
    id: currentId, at: Date.now(), question: current.value.question, answer: current.value.answer,
    distractors: items.value.map(d => d.text), rationales: items.value.map(d => d.rationale), keyIndex: keyIndex.value, difficulty: difficulty.value
  }
  history.value = [entry, ...history.value.filter(h => h.id !== currentId)].slice(0, HISTORY_MAX)
  persistHistory()
}
function restore(h: HistoryEntry) {
  currentId = h.id
  question.value = h.question
  answer.value = h.answer
  difficulty.value = h.difficulty || 'medium'
  keyIndex.value = h.keyIndex
  items.value = h.distractors.map((text, i) => ({ text, locked: false, rationale: h.rationales?.[i] ?? '', editing: false }))
  generation.value++
  announce('Question restored from history.')
  if (window.matchMedia('(max-width: 1023px)').matches) document.getElementById('mcq-sheet')?.scrollIntoView({ block: 'start' })
}
function removeHistory(h: HistoryEntry) {
  history.value = history.value.filter(x => x.id !== h.id)
  persistHistory()
}
function clearHistory() {
  history.value = []
  persistHistory()
  announce('History cleared.')
}
function newQuestion() {
  currentId = ''
  question.value = ''
  answer.value = ''
  items.value = []
  error.value = ''
  nextTick(() => document.getElementById('dg-question')?.focus())
}

function onKey(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    void generate()
  }
}

const isMac = ref(false)
const fmtTime = (t: number) => new Date(t).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

/* The stamp: options set in one at a time when a new set lands. */
const sheet = ref<HTMLElement | null>(null)
const { run } = useMotion(sheet)
watch(generation, async () => {
  await nextTick()
  void run((m) => {
    const rows = sheet.value?.querySelectorAll('.mcq-opt')
    if (rows?.length) m.inkReveal(rows, { y: 13 * m.d, stagger: 0.08 * m.k })
    const key = sheet.value?.querySelector('.mcq-opt__stamp')
    if (key) m.stampIn(key, { delay: 0.35 * m.k })
  })
})

onMounted(() => {
  loadHistory()
  isMac.value = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
})
</script>

<template>
  <UiToolShell wide deck="Give the question and the right answer. Get three wrong options that still sound believable.">
    <template #title>
      <span class="mcq-lockup">
        <ToolsMcqBrandMark :size="46" class="mcq-lockup__mark" />
        <span class="mcq-wordmark">EasyMCQ</span>
      </span>
    </template>

    <div class="mcq">
      <!-- Left: the brief -->
      <section class="mcq-brief" aria-labelledby="mcq-brief-title">
        <h2 id="mcq-brief-title" class="mcq-pane-label">The question</h2>
        <form class="mcq-form" @submit.prevent="generate()" @keydown="onKey">
          <div class="mcq-examples">
            <span class="mcq-label" id="mcq-ex-label">Try an example</span>
            <ul class="mcq-chips" aria-labelledby="mcq-ex-label">
              <li v-for="ex in EXAMPLE_PROMPTS" :key="ex.q">
                <button type="button" class="mcq-chip" :title="ex.q" @click="loadExample(ex)">{{ ex.q }}</button>
              </li>
            </ul>
          </div>

          <label class="mcq-label" for="dg-question">Your question</label>
          <textarea
            id="dg-question" v-model="question" class="mcq-field" rows="3"
            placeholder="e.g. What is the primary purpose of a needs analysis in instructional design?"
          />

          <label class="mcq-label" for="dg-answer">Correct answer</label>
          <textarea
            id="dg-answer" v-model="answer" class="mcq-field" rows="2"
            placeholder="e.g. To identify the gap between current and desired performance before designing a solution."
          />

          <fieldset class="mcq-diff">
            <legend class="mcq-label">How hard should the wrong options be?</legend>
            <label v-for="d in (['easy', 'medium', 'hard'] as const)" :key="d" class="mcq-diff__opt">
              <input v-model="difficulty" type="radio" name="mcq-diff" :value="d">
              <span>{{ d === 'easy' ? 'Easy' : d === 'medium' ? 'Medium' : 'Hard' }}</span>
            </label>
          </fieldset>

          <label class="mcq-switch">
            <input v-model="withRationale" type="checkbox">
            <span class="mcq-switch__track" aria-hidden="true"><i /></span>
            <span>Explain why each wrong option is tempting</span>
          </label>

          <div class="mcq-submit-row">
            <button type="submit" class="mcq-btn mcq-btn--primary dp-press" :disabled="!canSubmit || pending" :aria-busy="pending">
              {{ pending ? 'Writing…' : hasResult ? 'Write a new set' : 'Generate distractors' }}
            </button>
            <span class="mcq-kbd t-mono" aria-hidden="true"><kbd>{{ isMac ? '⌘' : 'Ctrl' }}</kbd> + <kbd>Enter</kbd></span>
          </div>
        </form>
        <p v-if="error" class="mcq-error" role="alert">{{ error }} <button type="button" class="mcq-link" @click="generate()">Try again</button></p>
      </section>

      <!-- Right: the proof sheet -->
      <section id="mcq-sheet" ref="sheet" class="mcq-sheet" :class="{ 'is-pending': pending }" aria-labelledby="mcq-sheet-title" :aria-busy="pending">
        <div class="mcq-sheet__head">
          <h2 id="mcq-sheet-title" class="mcq-pane-label">The proof</h2>
          <span v-if="hasResult" class="mcq-sheet__meta t-mono">{{ difficulty }} · {{ lockedCount }} locked</span>
        </div>

        <div v-if="!hasResult && !pending" class="mcq-empty">
          <p class="mcq-empty__q">{{ question.trim() || 'Your question will be set here.' }}</p>
          <ol class="mcq-empty__opts" aria-hidden="true">
            <li v-for="n in 4" :key="n"><b>{{ LETTERS[n - 1] }}</b><span /></li>
          </ol>
          <p class="mcq-empty__note">One right answer, three believable wrong ones. Lock the ones you like and write the rest again.</p>
        </div>

        <div v-else-if="pending && !hasResult" class="mcq-empty" role="status">
          <p class="mcq-empty__q">{{ question.trim() }}</p>
          <ol class="mcq-empty__opts mcq-empty__opts--busy" aria-hidden="true">
            <li v-for="n in 4" :key="n"><b>{{ LETTERS[n - 1] }}</b><span class="dp-skeleton" /></li>
          </ol>
          <p class="mcq-empty__note">Writing three wrong answers that sound right.</p>
        </div>

        <template v-else>
          <p class="mcq-q">{{ question.trim() }}</p>
          <ol class="mcq-opts">
            <li v-for="(o, pos) in options" :key="`${generation}-${pos}`" class="mcq-opt" :class="{ 'is-key': o.correct, 'is-locked': !o.correct && items[distractorAt(pos)]?.locked }">
              <span class="mcq-opt__letter" aria-hidden="true">{{ LETTERS[pos] }}</span>
              <div class="mcq-opt__body">
                <template v-if="o.correct">
                  <p class="mcq-opt__text">{{ o.text }}</p>
                  <span class="mcq-opt__stamp">Key</span>
                  <span class="dp-sr">Option {{ LETTERS[pos] }}, the correct answer.</span>
                </template>
                <template v-else>
                  <span class="dp-sr">Option {{ LETTERS[pos] }}, distractor.</span>
                  <textarea
                    v-if="items[distractorAt(pos)]?.editing"
                    :id="`mcq-edit-${distractorAt(pos)}`"
                    v-model="items[distractorAt(pos)]!.text"
                    class="mcq-field mcq-opt__edit" rows="2"
                    :aria-label="`Edit option ${LETTERS[pos]}`"
                    @blur="finishEdit(distractorAt(pos))"
                    @keydown.enter.exact.prevent="finishEdit(distractorAt(pos))"
                    @keydown.esc.prevent="finishEdit(distractorAt(pos))"
                  />
                  <p v-else class="mcq-opt__text">{{ o.text }}</p>
                  <p v-if="items[distractorAt(pos)]?.rationale" class="mcq-opt__why"><b>Why it tempts:</b> {{ items[distractorAt(pos)]!.rationale }}</p>
                  <div class="mcq-opt__tools">
                    <button type="button" class="mcq-tool" :aria-pressed="items[distractorAt(pos)]?.locked" @click="toggleLock(distractorAt(pos))">
                      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5" /><path :d="items[distractorAt(pos)]?.locked ? 'M5 7V5a3 3 0 0 1 6 0v2' : 'M5 7V5a3 3 0 0 1 5.8-1'" fill="none" stroke="currentColor" stroke-width="1.5" /></svg>
                      {{ items[distractorAt(pos)]?.locked ? 'Locked' : 'Lock' }}<span class="dp-sr"> option {{ LETTERS[pos] }}</span>
                    </button>
                    <button type="button" class="mcq-tool" @click="startEdit(distractorAt(pos))">Edit<span class="dp-sr"> option {{ LETTERS[pos] }}</span></button>
                    <button type="button" class="mcq-tool" @click="copyText(o.text, `Option ${LETTERS[pos]} copied.`)">Copy<span class="dp-sr"> option {{ LETTERS[pos] }}</span></button>
                  </div>
                </template>
              </div>
            </li>
          </ol>

          <div class="mcq-actions">
            <button type="button" class="mcq-btn dp-press" :disabled="pending || allLocked" @click="generate({ regenerate: true })">
              {{ pending ? 'Writing…' : lockedCount ? `Rewrite ${3 - lockedCount} unlocked` : 'Rewrite all three' }}
            </button>
            <button type="button" class="mcq-btn" @click="current && copyText(toPlain(current), 'Question copied with all four options.')">Copy question</button>
            <div class="mcq-export">
              <button type="button" class="mcq-btn" :aria-expanded="exportOpen" aria-controls="mcq-export-menu" @click="exportOpen = !exportOpen">Export</button>
              <div v-if="exportOpen" id="mcq-export-menu" class="mcq-export__menu" @keydown.esc="exportOpen = false">
                <p class="mcq-label">This question</p>
                <button type="button" @click="exportAs('csv', 'one')">CSV <small>spreadsheet</small></button>
                <button type="button" @click="exportAs('gift', 'one')">GIFT <small>Moodle</small></button>
                <button type="button" @click="exportAs('aiken', 'one')">Aiken <small>Moodle, quiz tools</small></button>
                <template v-if="history.length > 1">
                  <p class="mcq-label">All {{ history.length }} in history</p>
                  <button type="button" @click="exportAs('csv', 'all')">CSV</button>
                  <button type="button" @click="exportAs('gift', 'all')">GIFT</button>
                  <button type="button" @click="exportAs('aiken', 'all')">Aiken</button>
                </template>
              </div>
            </div>
            <button type="button" class="mcq-link mcq-actions__new" @click="newQuestion">New question</button>
          </div>
        </template>
      </section>
    </div>

    <section v-if="history.length" class="mcq-history" aria-labelledby="mcq-history-title">
      <div class="mcq-history__head">
        <h2 id="mcq-history-title" class="mcq-pane-label">Recent questions <span class="t-mono">{{ history.length }} of {{ HISTORY_MAX }}, kept in this browser</span></h2>
        <button type="button" class="mcq-link" @click="clearHistory">Clear</button>
      </div>
      <ol class="mcq-history__list">
        <li v-for="h in history" :key="h.id" class="mcq-history__item">
          <button type="button" class="mcq-history__open" @click="restore(h)">
            <span class="mcq-history__q">{{ h.question }}</span>
            <span class="mcq-history__when t-mono">{{ fmtTime(h.at) }}</span>
          </button>
          <button type="button" class="mcq-history__x" :aria-label="`Remove “${h.question.slice(0, 40)}” from history`" @click="removeHistory(h)">×</button>
        </li>
      </ol>
    </section>

    <p class="dp-sr" role="status" aria-live="polite">{{ status }}</p>
  </UiToolShell>
</template>

<style scoped>
.mcq-lockup { display: inline-flex; align-items: center; gap: 14rem; }
.mcq-lockup__mark { flex-shrink: 0; }
.mcq-wordmark { font-weight: 400; letter-spacing: -0.035em; line-height: 1; font-family: var(--font-display); font-variation-settings: "opsz" 144, "SOFT" 30, "WONK" 1; color: var(--ink); }
@media (max-width: 600px) { .mcq-lockup { gap: 11rem; } .mcq-lockup__mark { width: 38rem; height: 38rem; } }

.mcq { display: grid; gap: clamp(22rem, 3vw, 40rem); align-items: start; }
@media (min-width: 1024px) { .mcq { grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr); } }

.mcq-pane-label { margin: 0 0 var(--space-13); font: 500 var(--type-meta)/1.3 var(--font-mono); letter-spacing: var(--tracking-meta); text-transform: uppercase; color: var(--muted); display: flex; flex-wrap: wrap; gap: 8rem 14rem; align-items: baseline; }
.mcq-pane-label .t-mono { text-transform: none; letter-spacing: 0; }
.mcq-label { display: block; margin: 0 0 6rem; font: 600 13rem/1.3 var(--font-body); color: var(--ink); }

.mcq-brief { min-width: 0; }
.mcq-form { display: flex; flex-direction: column; gap: 6rem; }
.mcq-examples { margin-bottom: 10rem; min-width: 0; }
.mcq-chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6rem; }
.mcq-chips li { min-width: 0; max-width: 100%; }
/* Chips never push the page wider: they truncate inside their own box. */
.mcq-chip { display: block; max-width: min(100%, 300rem); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 7rem 12rem; border: var(--stroke) solid var(--line-strong); border-radius: 999rem; background: var(--paper); color: var(--ink); font: 500 12.5rem/1.2 var(--font-body); cursor: pointer; }
.mcq-chip:hover { border-color: var(--ink); background: var(--paper-2); }

.mcq-field { width: 100%; box-sizing: border-box; margin-bottom: 10rem; padding: 12rem 14rem; border: var(--stroke) solid var(--line-strong); border-radius: var(--radius-s); background: var(--paper); color: var(--ink); font: 400 16rem/1.5 var(--font-reading); resize: vertical; }
.mcq-field:focus { border-color: var(--ink); outline: 2px solid var(--focus); outline-offset: 1px; }

.mcq-diff { margin: 4rem 0 10rem; padding: 0; border: 0; display: flex; flex-wrap: wrap; gap: 6rem; }
.mcq-diff legend { padding: 0; margin-bottom: 6rem; }
.mcq-diff__opt { position: relative; }
.mcq-diff__opt input { position: absolute; opacity: 0; inset: 0; margin: 0; cursor: pointer; }
.mcq-diff__opt span { display: inline-block; padding: 8rem 16rem; border: var(--stroke) solid var(--ink); border-radius: 999rem; font: 600 13rem/1 var(--font-body); background: var(--paper); }
.mcq-diff__opt input:checked + span { background: var(--ink); color: var(--paper); }
.mcq-diff__opt input:focus-visible + span { outline: 2px solid var(--focus); outline-offset: 2px; }

.mcq-switch { display: flex; align-items: center; gap: 10rem; margin: 2rem 0 8rem; font: 500 14rem/1.3 var(--font-body); cursor: pointer; position: relative; }
.mcq-switch input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.mcq-switch__track { flex: 0 0 auto; width: 36rem; height: 20rem; border-radius: 999rem; border: var(--stroke) solid var(--ink); background: var(--paper); position: relative; transition: background var(--dur-fast) var(--ease-out); }
.mcq-switch__track i { position: absolute; top: 2rem; left: 2rem; width: 14rem; height: 14rem; border-radius: 50%; background: var(--ink); transition: transform var(--dur-fast) var(--ease-stamp, ease-out); }
.mcq-switch input:checked + .mcq-switch__track { background: var(--accent); }
.mcq-switch input:checked + .mcq-switch__track i { transform: translateX(16rem); }
.mcq-switch input:focus-visible + .mcq-switch__track { outline: 2px solid var(--focus); outline-offset: 2px; }

.mcq-submit-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12rem 16rem; margin-top: 6rem; }
.mcq-kbd { font-size: 12rem; color: var(--muted); }
.mcq-kbd kbd { font: inherit; padding: 2rem 6rem; border: 1px solid var(--line-strong); border-radius: 4rem; }

.mcq-btn { display: inline-flex; align-items: center; gap: 8rem; padding: 11rem 16rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-s); background: var(--paper); color: var(--ink); font: 700 14rem/1.1 var(--font-body); cursor: pointer; }
.mcq-btn:hover:not(:disabled) { background: var(--paper-2); }
.mcq-btn--primary { background: var(--accent); color: var(--accent-ink, #161618); box-shadow: 3rem 3rem 0 var(--ink); }
.mcq-btn--primary:hover:not(:disabled) { background: var(--accent); transform: translate(-1rem, -1rem); box-shadow: 4rem 4rem 0 var(--ink); }
.mcq-btn:disabled { opacity: .45; cursor: not-allowed; box-shadow: none; }
.mcq-link { padding: 0; border: 0; background: none; color: var(--ink); font: 600 14rem/1.3 var(--font-body); text-decoration: underline; text-underline-offset: 3rem; cursor: pointer; }
.mcq-error { margin: 14rem 0 0; padding: 12rem 14rem; border-left: 3px solid var(--ink); background: var(--paper-2); font: 500 14rem/1.45 var(--font-body); }

/* The proof sheet: a printed exam item on its own paper. */
.mcq-sheet { position: relative; min-width: 0; padding: clamp(20rem, 2.6vw, 32rem); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper); box-shadow: 6rem 6rem 0 var(--ink); }
@media (min-width: 1024px) { .mcq-sheet { position: sticky; top: 84rem; } }
.mcq-sheet::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 6rem; border-bottom: 1px solid var(--ink); border-radius: var(--radius-m) var(--radius-m) 0 0; background: repeating-linear-gradient(90deg, var(--ink) 0 2px, transparent 2px 8px); opacity: .18; }
.mcq-sheet__head { display: flex; justify-content: space-between; align-items: baseline; gap: 12rem; }
.mcq-sheet__meta { font-size: 12rem; color: var(--muted); text-transform: capitalize; }
.mcq-sheet.is-pending .mcq-opts { opacity: .55; transition: opacity var(--dur-fast) var(--ease-out); }

.mcq-q, .mcq-empty__q { margin: 4rem 0 18rem; font: 400 clamp(22rem, 2.2vw, 30rem)/1.18 var(--font-display); font-variation-settings: "opsz" 72, "SOFT" 20; letter-spacing: -.015em; overflow-wrap: anywhere; }
.mcq-empty__q { color: var(--muted); }
.mcq-empty__opts { list-style: none; margin: 0; padding: 0; display: grid; gap: 10rem; }
.mcq-empty__opts li { display: grid; grid-template-columns: 30rem 1fr; align-items: center; gap: 12rem; }
.mcq-empty__opts b { display: grid; place-items: center; width: 28rem; height: 28rem; border: 1.5px solid var(--line-strong); border-radius: 50%; font: 600 12rem/1 var(--font-mono); color: var(--muted); }
.mcq-empty__opts span { height: 12rem; border-bottom: 1.5px dashed var(--line-strong); }
.mcq-empty__opts--busy span { height: 14rem; border: 0; border-radius: 4rem; }
.mcq-empty__note { margin: 18rem 0 0; font: 400 15rem/1.5 var(--font-reading); color: var(--muted); max-width: 46ch; }

.mcq-opts { list-style: none; margin: 0; padding: 0; display: grid; gap: 10rem; }
.mcq-opt { display: grid; grid-template-columns: 30rem minmax(0, 1fr); gap: 12rem; padding: 12rem 12rem 12rem 10rem; border: 1px solid var(--line); border-radius: var(--radius-s); background: var(--paper); }
.mcq-opt.is-key { border-color: var(--ink); background: color-mix(in srgb, var(--accent) 22%, var(--paper)); }
.mcq-opt.is-locked { border-color: var(--ink); }
.mcq-opt__letter { display: grid; place-items: center; width: 28rem; height: 28rem; border: 1.5px solid var(--ink); border-radius: 50%; font: 600 12rem/1 var(--font-mono); }
.mcq-opt.is-key .mcq-opt__letter { background: var(--ink); color: var(--paper); }
.mcq-opt__body { position: relative; min-width: 0; }
.mcq-opt__text { margin: 3rem 0 0; font: 400 16rem/1.45 var(--font-reading); overflow-wrap: anywhere; }
.mcq-opt.is-key .mcq-opt__text { padding-right: 56rem; font-weight: 600; }
.mcq-opt__stamp { position: absolute; top: -2rem; right: 0; padding: 4rem 8rem; border: 2px solid var(--ink); border-radius: 4rem; font: 700 11rem/1 var(--font-mono); letter-spacing: .12em; text-transform: uppercase; background: var(--accent); color: var(--accent-ink, #161618); transform: rotate(-4deg); }
.mcq-opt__edit { margin: 0; font-size: 15rem; }
.mcq-opt__why { margin: 6rem 0 0; font: 400 13.5rem/1.45 var(--font-body); color: var(--muted); }
.mcq-opt__why b { color: var(--ink); font-weight: 600; }
.mcq-opt__tools { display: flex; flex-wrap: wrap; gap: 6rem; margin-top: 8rem; }
.mcq-tool { display: inline-flex; align-items: center; gap: 5rem; padding: 5rem 9rem; border: 1px solid var(--line-strong); border-radius: 999rem; background: transparent; color: var(--ink); font: 600 12rem/1 var(--font-body); cursor: pointer; min-height: 28rem; }
.mcq-tool:hover { border-color: var(--ink); background: var(--paper-2); }
.mcq-tool[aria-pressed="true"] { background: var(--ink); color: var(--paper); border-color: var(--ink); }

.mcq-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10rem; margin-top: 18rem; padding-top: 16rem; border-top: 1px solid var(--line); }
.mcq-actions__new { margin-left: auto; }
.mcq-export { position: relative; }
.mcq-export__menu { position: absolute; z-index: 5; bottom: calc(100% + 8rem); left: 0; min-width: 220rem; padding: 10rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-s); background: var(--paper); box-shadow: 4rem 4rem 0 var(--ink); display: grid; gap: 2rem; }
.mcq-export__menu .mcq-label { margin: 6rem 6rem 2rem; font-size: 11rem; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; font-family: var(--font-mono); }
.mcq-export__menu button { display: flex; justify-content: space-between; gap: 12rem; padding: 8rem 8rem; border: 0; border-radius: 4rem; background: none; color: var(--ink); font: 600 14rem/1.2 var(--font-body); text-align: left; cursor: pointer; }
.mcq-export__menu button:hover, .mcq-export__menu button:focus-visible { background: var(--paper-2); }
.mcq-export__menu small { color: var(--muted); font-weight: 400; }

.mcq-history { margin-top: clamp(34rem, 5vw, 55rem); padding-top: 18rem; border-top: var(--stroke) solid var(--ink); }
.mcq-history__head { display: flex; justify-content: space-between; align-items: baseline; gap: 12rem; }
.mcq-history__list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320rem), 1fr)); gap: 0 24rem; }
.mcq-history__item { display: flex; align-items: stretch; border-bottom: 1px solid var(--line); min-width: 0; }
.mcq-history__open { flex: 1; min-width: 0; display: grid; gap: 4rem; padding: 12rem 4rem; border: 0; background: none; color: var(--ink); text-align: left; cursor: pointer; }
.mcq-history__open:hover .mcq-history__q { text-decoration: underline; }
.mcq-history__q { font: 500 15rem/1.35 var(--font-reading); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mcq-history__when { font-size: 11.5rem; color: var(--muted); }
.mcq-history__x { flex: 0 0 auto; width: 36rem; border: 0; background: none; color: var(--muted); font-size: 20rem; cursor: pointer; }
.mcq-history__x:hover { color: var(--ink); }

@media (prefers-reduced-motion: reduce) { .mcq-switch__track, .mcq-switch__track i, .mcq-btn--primary { transition: none; } }
</style>
