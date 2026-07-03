<script setup lang="ts">
import type { StoryCard } from '~/types/story'
import { CARD_STATUSES } from '~/types/story'
import { CARD_KINDS } from '~/utils/storyCards'
import { modelOf, stageOf } from '~/utils/idModels'

const props = defineProps<{
  card: StoryCard | null
  cardNumber: number
  modelId?: string
  // Per-option branch destinations for MCQ cards, e.g. '→ Screen 04'
  branchLabels?: (string | null)[]
  // AI assist: buttons render only when the user has a validated key; the
  // page owns the actual calls. aiBusy names the field being processed.
  aiReady?: boolean
  aiBusy?: string | null
}>()
defineEmits<{
  delete: []; duplicate: []; close: []
  'ai-rewrite': [field: 'body' | 'narration' | 'question' | 'feedback']
  'ai-options': []
}>()

const meta = computed(() => (props.card ? CARD_KINDS[props.card.kind] : null))
const model = computed(() => modelOf(props.modelId))
const stage = computed(() => (props.card ? stageOf(props.modelId, props.card.stage) : null))

// Narration → speaking-time intelligence (~150 words per minute)
const narrationWords = computed(() => props.card?.narration.trim().split(/\s+/).filter(Boolean).length ?? 0)
const suggestedSeconds = computed(() => Math.max(15, Math.ceil(narrationWords.value / 150 * 60 / 5) * 5))
const showSuggestion = computed(() => narrationWords.value >= 8 && props.card && Math.abs(props.card.duration - suggestedSeconds.value) > 7)
function applySuggestion() { if (props.card) props.card.duration = suggestedSeconds.value }

// Which of the shared content fields this kind exposes, and what they're
// called — the kind decides the vocabulary the designer sees.
const fieldPlan = computed(() => {
  const kind = props.card?.kind
  switch (kind) {
    case 'title':      return { body: 'Subtitle / tagline', visual: 'Visual direction' }
    case 'objectives': return { body: 'Objectives — one per line', visual: 'Visual direction' }
    case 'divider':    return { body: 'Section intro (optional)', visual: 'Visual direction' }
    case 'text-image': return { body: 'On-screen text', visual: 'Image / visual direction' }
    case 'video':      return { body: 'On-screen text / captions', visual: 'Video description' }
    case 'summary':    return { body: 'Key takeaways — one per line', visual: 'Visual direction' }
    case 'thankyou':   return { body: 'Closing message', visual: 'Visual direction' }
    default:           return null // mcq uses its own block
  }
})

function pad(n: number) { return String(n).padStart(2, '0') }

// ── Floating-window drag (desktop only) ────────────────────────
const panelRef = ref<HTMLElement | null>(null)
const winPos = ref<{ x: number; y: number } | null>(null)
let dragFrom: { px: number; py: number; x: number; y: number } | null = null

function onHeadPointerDown(e: PointerEvent) {
  if (!window.matchMedia('(min-width: 900px)').matches) return
  if ((e.target as HTMLElement).closest('button, input, select, textarea')) return
  const el = panelRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  winPos.value = winPos.value ?? { x: rect.left, y: rect.top }
  dragFrom = { px: e.clientX, py: e.clientY, x: winPos.value.x, y: winPos.value.y }
  window.addEventListener('pointermove', onHeadPointerMove)
  window.addEventListener('pointerup', onHeadPointerUp, { once: true })
}
function onHeadPointerMove(e: PointerEvent) {
  if (!dragFrom) return
  const el = panelRef.value
  const w = el?.offsetWidth ?? 340
  const h = el?.offsetHeight ?? 400
  winPos.value = {
    x: Math.min(Math.max(dragFrom.x + e.clientX - dragFrom.px, 8), window.innerWidth - w - 8),
    y: Math.min(Math.max(dragFrom.y + e.clientY - dragFrom.py, 8), window.innerHeight - Math.min(h, 120))
  }
}
function onHeadPointerUp() {
  dragFrom = null
  window.removeEventListener('pointermove', onHeadPointerMove)
}
onUnmounted(() => window.removeEventListener('pointermove', onHeadPointerMove))

const floatStyle = computed(() =>
  winPos.value ? { left: `${winPos.value.x}px`, top: `${winPos.value.y}px`, right: 'auto', bottom: 'auto' } : {}
)
</script>

<template>
  <Transition name="inspector">
    <aside
      v-if="card" ref="panelRef" :key="card.id"
      class="inspector glass-panel"
      data-lenis-prevent
      :style="[{ '--kind-color': meta?.color }, floatStyle]"
    >
      <div class="inspector__head" @pointerdown="onHeadPointerDown">
        <span class="inspector__glyph">{{ meta?.glyph }}</span>
        <div class="inspector__id">
          <span class="inspector__kind">{{ meta?.label }}</span>
          <span class="inspector__num">Screen {{ pad(cardNumber) }}</span>
        </div>
        <button class="inspector__icon-btn" title="Duplicate (⌘D)" @click="$emit('duplicate')">⧉</button>
        <button class="inspector__icon-btn inspector__icon-btn--danger" title="Delete card" @click="$emit('delete')">🗑</button>
        <button class="inspector__icon-btn" aria-label="Close inspector" @click="$emit('close')">✕</button>
      </div>

      <div class="inspector__body">
        <!-- The active ID model's vocabulary: which stage this screen serves.
             Only learner-journey frameworks tag screens with stages. -->
        <template v-if="model.kind === 'journey' && model.stages.length">
          <label class="glass-label" for="in-stage">{{ model.columnLabel }}</label>
          <select id="in-stage" v-model="card.stage" class="glass-field glass-select">
            <option value="">Unassigned</option>
            <option v-for="s in model.stages" :key="s.id" :value="s.id">{{ s.label }}</option>
          </select>
          <p v-if="stage" class="inspector__prompt" :style="{ '--stage-color': stage.color }">{{ stage.prompt }}</p>
        </template>

        <label class="glass-label" for="in-title">Screen title</label>
        <input id="in-title" v-model="card.title" class="glass-field">

        <!-- MCQ has its own structured block -->
        <template v-if="card.kind === 'mcq'">
          <div class="inspector__label-row">
            <label class="glass-label" for="in-question">Question</label>
            <button v-if="aiReady && card.question.trim()" class="inspector__ai" :disabled="!!aiBusy" @click="$emit('ai-rewrite', 'question')">
              {{ aiBusy === 'question' ? '…' : '✨ Rewrite' }}
            </button>
          </div>
          <textarea id="in-question" v-model="card.question" class="glass-field" rows="2" placeholder="What should the learner be able to answer?" />

          <div class="inspector__label-row">
            <label class="glass-label">Options — mark the correct one</label>
            <button v-if="aiReady" class="inspector__ai" :disabled="!!aiBusy" @click="$emit('ai-options')">
              {{ aiBusy === 'options' ? '…' : '✨ Suggest options' }}
            </button>
          </div>
          <div class="inspector__options">
            <div v-for="(_, i) in card.options" :key="i" class="inspector__option-row">
              <label class="inspector__option" :class="{ 'inspector__option--correct': card.correctIndex === i }">
                <input type="radio" name="in-correct" :checked="card.correctIndex === i" @change="card.correctIndex = i">
                <input v-model="card.options[i]" class="glass-field inspector__option-input" :placeholder="`Option ${String.fromCharCode(65 + i)}`">
              </label>
              <p v-if="branchLabels?.[i]" class="inspector__branch">{{ String.fromCharCode(65 + i) }} {{ branchLabels[i] }}</p>
            </div>
          </div>
          <p class="inspector__hint">Branch answers on the canvas: drag an option's A–D dot onto the screen it should lead to.</p>

          <div class="inspector__label-row">
            <label class="glass-label" for="in-feedback">Feedback</label>
            <button v-if="aiReady && card.feedback.trim()" class="inspector__ai" :disabled="!!aiBusy" @click="$emit('ai-rewrite', 'feedback')">
              {{ aiBusy === 'feedback' ? '…' : '✨ Rewrite' }}
            </button>
          </div>
          <textarea id="in-feedback" v-model="card.feedback" class="glass-field" rows="2" placeholder="Why the correct answer is right." />
        </template>

        <template v-else-if="fieldPlan">
          <div class="inspector__label-row">
            <label class="glass-label" for="in-body">{{ fieldPlan.body }}</label>
            <button v-if="aiReady && card.body.trim()" class="inspector__ai" :disabled="!!aiBusy" @click="$emit('ai-rewrite', 'body')">
              {{ aiBusy === 'body' ? '…' : '✨ Rewrite' }}
            </button>
          </div>
          <textarea id="in-body" v-model="card.body" class="glass-field" rows="4" :placeholder="stage?.prompt" />

          <label class="glass-label" for="in-visual">{{ fieldPlan.visual }}</label>
          <textarea id="in-visual" v-model="card.visual" class="glass-field" rows="3" />
        </template>

        <div class="inspector__label-row">
          <label class="glass-label" for="in-narration">Narration / audio script</label>
          <button v-if="aiReady && card.narration.trim()" class="inspector__ai" :disabled="!!aiBusy" @click="$emit('ai-rewrite', 'narration')">
            {{ aiBusy === 'narration' ? '…' : '✨ Rewrite' }}
          </button>
        </div>
        <textarea id="in-narration" v-model="card.narration" class="glass-field" rows="3" />
        <div v-if="narrationWords" class="inspector__timing">
          <span>≈ {{ narrationWords }} words · ~{{ suggestedSeconds }}s spoken</span>
          <button v-if="showSuggestion" class="inspector__timing-btn" @click="applySuggestion">Set {{ suggestedSeconds }}s</button>
        </div>

        <label class="glass-label" for="in-notes">Developer notes</label>
        <textarea id="in-notes" v-model="card.notes" class="glass-field" rows="2" />

        <div class="inspector__row">
          <div>
            <label class="glass-label" for="in-duration">Duration (sec)</label>
            <input id="in-duration" v-model.number="card.duration" type="number" min="0" class="glass-field">
          </div>
          <div>
            <label class="glass-label" for="in-status">Status</label>
            <select id="in-status" v-model="card.status" class="glass-field glass-select">
              <option v-for="s in CARD_STATUSES" :key="s">{{ s }}</option>
            </select>
          </div>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.inspector {
  position: fixed;
  top: 86rem;
  right: 18rem;
  width: 340rem;
  max-height: calc(100dvh - 110rem);
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  z-index: 25;
}
.inspector__head {
  display: flex;
  align-items: center;
  gap: 9rem;
  padding: 13rem 14rem;
  border-bottom: 1px solid var(--color-divider);
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
  touch-action: none;
}
.inspector__head:active { cursor: grabbing; }
.inspector__glyph {
  width: 26rem; height: 26rem;
  display: grid; place-items: center;
  border-radius: 8rem;
  font-size: 12rem;
  font-weight: 700;
  color: var(--color-bg);
  background: var(--kind-color, var(--color-text));
  flex-shrink: 0;
}
.inspector__id { display: flex; flex-direction: column; gap: 1rem; margin-right: auto; min-width: 0; }
.inspector__kind { font-size: 12.5rem; font-weight: 700; }
.inspector__num { font-size: 10rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.5; }
.inspector__icon-btn {
  width: 26rem; height: 26rem;
  display: grid; place-items: center;
  border-radius: 8rem;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  border: 1px solid var(--color-glass-border);
  font-size: 11rem;
  flex-shrink: 0;
}
.inspector__icon-btn--danger { color: #ff8d8d; }

.inspector__body {
  padding: 14rem;
  display: flex;
  flex-direction: column;
  gap: 9rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}
/* The body is a height-capped flex column: without this, flexbox compresses
   every field and label into each other instead of letting the body scroll. */
.inspector__body > * { flex-shrink: 0; }

/* Comfortable writing room — these are authoring fields, not form filler */
.inspector__body textarea.glass-field { min-height: 96rem; resize: vertical; }
.inspector__body #in-body { min-height: 128rem; }
.inspector__body #in-narration { min-height: 112rem; }
.inspector__row { display: grid; grid-template-columns: 1fr 1fr; gap: 12rem; }
.inspector__prompt {
  font-size: 12rem;
  line-height: 1.5;
  padding: 9rem 12rem;
  border-radius: 10rem;
  color: var(--color-text);
  opacity: 0.85;
  background: color-mix(in srgb, var(--stage-color) 12%, transparent);
  border-left: 3rem solid var(--stage-color);
}

.inspector__options { display: flex; flex-direction: column; gap: 7rem; }
.inspector__option-row { display: flex; flex-direction: column; gap: 3rem; }
.inspector__option { display: flex; align-items: center; gap: 8rem; }
.inspector__branch {
  font-size: 11rem;
  font-weight: 600;
  opacity: 0.65;
  padding-left: 24rem;
  color: var(--color-text);
}
.inspector__hint { font-size: 11rem; line-height: 1.5; opacity: 0.5; color: var(--color-text); }
.inspector__label-row { display: flex; align-items: baseline; justify-content: space-between; gap: 8rem; }
.inspector__ai {
  font-size: 10.5rem;
  font-weight: 700;
  color: var(--color-text);
  opacity: 0.7;
  white-space: nowrap;
  padding: 2rem 8rem;
  border-radius: 999px;
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, #A78BFA 12%, transparent);
  transition: opacity 0.15s ease;
}
.inspector__ai:hover:not(:disabled) { opacity: 1; }
.inspector__ai:disabled { opacity: 0.35; cursor: default; }
.inspector__timing {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rem;
  font-size: 11.5rem;
  opacity: 0.75;
  color: var(--color-text);
}
.inspector__timing-btn {
  padding: 4rem 11rem;
  border-radius: 999px;
  font-size: 11rem;
  font-weight: 700;
  color: var(--color-bg);
  background: var(--color-text);
  flex-shrink: 0;
}
.inspector__option input[type="radio"] { width: 15rem; height: 15rem; accent-color: var(--kind-color, var(--color-accent)); flex-shrink: 0; }
.inspector__option-input { padding: 9rem 12rem; }
.inspector__option--correct .inspector__option-input { border-color: color-mix(in srgb, #3fbf6f 60%, var(--color-glass-border)); }

.inspector-enter-active, .inspector-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.inspector-enter-from, .inspector-leave-to { opacity: 0; transform: translateY(10rem) scale(0.99); }

@media (max-width: 899px) {
  .inspector {
    top: auto;
    left: 10rem; right: 10rem;
    bottom: calc(72rem + var(--safe-bottom));
    width: auto;
    max-height: 74dvh;
    box-shadow: 0 -20rem 60rem -20rem rgba(0, 0, 0, 0.65);
  }
  /* Bigger tap-and-type targets on phones */
  .inspector__body .glass-field { padding: 13rem 14rem; }
  .inspector__body textarea.glass-field { min-height: 108rem; }
  .inspector__body #in-body { min-height: 140rem; }
  .inspector__head { cursor: default; }
  .inspector-enter-from, .inspector-leave-to { transform: translateY(24rem); opacity: 0; }
  /* iOS Safari zooms into any focused field under 16px — hold the line */
  .inspector__body .glass-field { font-size: 16px; }
}
</style>
