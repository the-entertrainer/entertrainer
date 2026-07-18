<script setup lang="ts">
import type { LuminaBlock } from '~/types/lumina'
import { createPair, LUMINA_KINDS } from '~/utils/luminaBlocks'
import { parseVideoEmbed } from '~/utils/luminaAudit'

// The editing surface for one block. Desktop: a draggable floating window
// that never blocks the canvas (same mechanic as StoryGen's inspector).
// Mobile: a bottom drawer with big tap-and-type targets.
const props = defineProps<{ block: LuminaBlock | null }>()
const emit = defineEmits<{ delete: []; duplicate: []; close: [] }>()

const meta = computed(() => (props.block ? LUMINA_KINDS[props.block.kind] : null))

// Variant vocabularies per kind — segmented controls, not dropdowns.
const variantPlan = computed<{ label: string; options: { id: string; label: string }[] } | null>(() => {
  switch (props.block?.kind) {
    case 'hero': return { label: 'Style', options: [{ id: 'accent', label: 'Accent color' }, { id: 'plain', label: 'Ink' }] }
    case 'list': return { label: 'Marker', options: [{ id: 'bullet', label: 'Bullets' }, { id: 'number', label: 'Numbers' }, { id: 'check', label: 'Checks' }] }
    case 'callout': return { label: 'Tone', options: [{ id: 'note', label: 'Note' }, { id: 'tip', label: 'Tip' }, { id: 'warning', label: 'Warning' }] }
    case 'divider': return { label: 'Style', options: [{ id: 'line', label: 'Line' }, { id: 'dots', label: 'Dots' }, { id: 'space', label: 'Space' }] }
    case 'image': return { label: 'Width', options: [{ id: 'inset', label: 'Inset' }, { id: 'full', label: 'Full bleed' }] }
    case 'cta': return { label: 'Style', options: [{ id: 'accent', label: 'Filled' }, { id: 'outline', label: 'Outline' }] }
    default: return null
  }
})

const pairVocab = computed(() => {
  switch (props.block?.kind) {
    case 'accordion': return { item: 'Panel', title: 'Panel title', body: 'Panel content' }
    case 'tabs': return { item: 'Tab', title: 'Tab label', body: 'Tab content' }
    case 'flashcards': return { item: 'Card', title: 'Front', body: 'Back' }
    default: return null
  }
})

const videoState = computed(() => {
  if (!props.block || props.block.kind !== 'video' || !props.block.src.trim()) return null
  return parseVideoEmbed(props.block.src) ? 'ok' : 'bad'
})

// ── Pairs (accordion / tabs / flashcards) ───────────────────────
function addPair() { props.block?.pairs.push(createPair()) }
function removePair(i: number) { props.block?.pairs.splice(i, 1) }
function movePair(i: number, dir: -1 | 1) {
  const pairs = props.block?.pairs
  if (!pairs) return
  const j = i + dir
  if (j < 0 || j >= pairs.length) return
  ;[pairs[i], pairs[j]] = [pairs[j], pairs[i]]
}

// ── List items ──────────────────────────────────────────────────
// Edited as one textarea, one item per line — fastest on a phone keyboard.
const itemsText = computed({
  get: () => props.block?.items.join('\n') ?? '',
  set: (v: string) => { if (props.block) props.block.items = v.split('\n') }
})

// ── Image upload (camera / gallery / file) ──────────────────────
// Downscaled client-side so courses stay portable and localStorage stays
// healthy: long edge capped at 1600px, JPEG for photos, PNG preserved.
const uploadBusy = ref(false)
async function onImageFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !props.block) return
  uploadBusy.value = true
  try {
    const url = URL.createObjectURL(file)
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('unreadable'))
      img.src = url
    })
    const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(url)
    const isPng = file.type === 'image/png'
    props.block.src = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.85)
  } catch {} finally {
    uploadBusy.value = false
  }
}

// ── Floating-window drag (desktop only) ─────────────────────────
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
</script>

<template>
  <Transition name="linsp">
    <aside
      v-if="block" ref="panelRef"
      class="linsp glass-panel"
      :style="winPos ? { top: `${winPos.y}px`, left: `${winPos.x}px`, right: 'auto' } : undefined"
      data-lenis-prevent
      aria-label="Block settings"
    >
      <div class="linsp__head" @pointerdown="onHeadPointerDown">
        <span class="linsp__glyph" :style="{ background: meta?.color }" />
        <span class="linsp__kind">{{ meta?.label }}</span>
        <button class="linsp__icon-btn" title="Duplicate block" @click="emit('duplicate')"><ToolsLuminaIcon name="duplicate" :size="14" /></button>
        <button class="linsp__icon-btn linsp__icon-btn--danger" title="Delete block" @click="emit('delete')"><ToolsLuminaIcon name="trash" :size="14" /></button>
        <button class="linsp__icon-btn" aria-label="Close" @click="emit('close')"><ToolsLuminaIcon name="close" :size="14" /></button>
      </div>

      <div class="linsp__body">
        <!-- Variant segmented control -->
        <template v-if="variantPlan">
          <label class="glass-label">{{ variantPlan.label }}</label>
          <div class="linsp__seg">
            <button
              v-for="o in variantPlan.options" :key="o.id"
              :class="{ on: block.variant === o.id }"
              @click="block.variant = o.id"
            >{{ o.label }}</button>
          </div>
        </template>

        <!-- hero -->
        <template v-if="block.kind === 'hero'">
          <label class="glass-label" for="lin-title">Heading</label>
          <input id="lin-title" v-model="block.title" class="glass-field" placeholder="Say the big thing">
          <label class="glass-label" for="lin-body">Subheading (optional)</label>
          <input id="lin-body" v-model="block.body" class="glass-field" placeholder="One supporting line">
        </template>

        <!-- text -->
        <template v-else-if="block.kind === 'text'">
          <label class="glass-label" for="lin-body">Paragraphs</label>
          <textarea id="lin-body" v-model="block.body" class="glass-field linsp__tall" rows="7" placeholder="Write the content. A blank line starts a new paragraph." />
        </template>

        <!-- list -->
        <template v-else-if="block.kind === 'list'">
          <label class="glass-label" for="lin-items">Items, one per line</label>
          <textarea id="lin-items" v-model="itemsText" class="glass-field linsp__tall" rows="6" placeholder="First point&#10;Second point" />
        </template>

        <!-- quote -->
        <template v-else-if="block.kind === 'quote'">
          <label class="glass-label" for="lin-body">Quote</label>
          <textarea id="lin-body" v-model="block.body" class="glass-field" rows="4" placeholder="The words worth pulling out." />
          <label class="glass-label" for="lin-caption">Attribution (optional)</label>
          <input id="lin-caption" v-model="block.caption" class="glass-field" placeholder="Who said it">
        </template>

        <!-- callout -->
        <template v-else-if="block.kind === 'callout'">
          <label class="glass-label" for="lin-title">Title</label>
          <input id="lin-title" v-model="block.title" class="glass-field" placeholder="e.g. Remember">
          <label class="glass-label" for="lin-body">Body</label>
          <textarea id="lin-body" v-model="block.body" class="glass-field" rows="4" />
        </template>

        <!-- image -->
        <template v-else-if="block.kind === 'image'">
          <label class="linsp__upload glass-btn glass-btn--ghost">
            <ToolsLuminaIcon name="upload" :size="14" />
            {{ uploadBusy ? 'Optimizing…' : block.src ? 'Replace image' : 'Upload image' }}
            <input type="file" accept="image/*" @change="onImageFile">
          </label>
          <label class="glass-label" for="lin-src">…or paste an image URL</label>
          <input id="lin-src" v-model="block.src" class="glass-field" placeholder="https://…" inputmode="url">
          <label class="glass-label" for="lin-alt">Alt text (required)</label>
          <input id="lin-alt" v-model="block.alt" class="glass-field" placeholder="Describe the image for screen readers">
          <label class="glass-label" for="lin-caption">Caption (optional)</label>
          <input id="lin-caption" v-model="block.caption" class="glass-field">
        </template>

        <!-- video -->
        <template v-else-if="block.kind === 'video'">
          <label class="glass-label" for="lin-src">Video link</label>
          <input id="lin-src" v-model="block.src" class="glass-field" placeholder="YouTube, Vimeo or .mp4 URL" inputmode="url">
          <p v-if="videoState === 'ok'" class="linsp__ok"><ToolsLuminaIcon name="check" :size="12" /> Link recognized. It will embed cleanly.</p>
          <p v-else-if="videoState === 'bad'" class="linsp__bad"><ToolsLuminaIcon name="alert" :size="12" /> Not a playable link. Use a YouTube / Vimeo page URL or a direct .mp4.</p>
          <label class="glass-label" for="lin-caption">Caption (optional)</label>
          <input id="lin-caption" v-model="block.caption" class="glass-field">
        </template>

        <!-- accordion / tabs / flashcards -->
        <template v-else-if="pairVocab">
          <div v-for="(p, i) in block.pairs" :key="p.id" class="linsp__pair">
            <div class="linsp__pair-head">
              <span>{{ pairVocab.item }} {{ i + 1 }}</span>
              <button title="Move up" :disabled="i === 0" @click="movePair(i, -1)"><ToolsLuminaIcon name="arrow-up" :size="12" /></button>
              <button title="Move down" :disabled="i === block.pairs.length - 1" @click="movePair(i, 1)"><ToolsLuminaIcon name="arrow-down" :size="12" /></button>
              <button class="linsp__pair-del" title="Remove" :disabled="block.pairs.length <= 1" @click="removePair(i)"><ToolsLuminaIcon name="trash" :size="12" /></button>
            </div>
            <input v-model="p.title" class="glass-field" :placeholder="pairVocab.title">
            <textarea v-model="p.body" class="glass-field" rows="3" :placeholder="pairVocab.body" />
          </div>
          <button class="glass-btn glass-btn--ghost linsp__add-pair" @click="addPair"><ToolsLuminaIcon name="plus" :size="13" /> Add {{ pairVocab.item.toLowerCase() }}</button>
        </template>

        <!-- quiz -->
        <template v-else-if="block.kind === 'quiz'">
          <label class="glass-label" for="lin-q">Question</label>
          <textarea id="lin-q" v-model="block.title" class="glass-field" rows="2" placeholder="What should the learner be able to answer?" />
          <label class="glass-label">Options (mark the correct one)</label>
          <label
            v-for="(_, i) in block.options" :key="i"
            class="linsp__option" :class="{ 'linsp__option--correct': block.correctIndex === i }"
          >
            <input type="radio" name="lin-correct" :checked="block.correctIndex === i" @change="block.correctIndex = i">
            <input v-model="block.options[i]" class="glass-field linsp__option-input" :placeholder="`Option ${String.fromCharCode(65 + i)}`">
          </label>
          <label class="glass-label" for="lin-feedback">Feedback</label>
          <textarea id="lin-feedback" v-model="block.feedback" class="glass-field" rows="2" placeholder="Why the correct answer is right." />
        </template>

        <!-- cta -->
        <template v-else-if="block.kind === 'cta'">
          <label class="glass-label" for="lin-title">Button label</label>
          <input id="lin-title" v-model="block.title" class="glass-field" placeholder="e.g. Download the checklist">
          <label class="glass-label" for="lin-src">Link (leave empty for a simple milestone button)</label>
          <input id="lin-src" v-model="block.src" class="glass-field" placeholder="https://…" inputmode="url">
          <label class="glass-label" for="lin-body">Note under the button (optional)</label>
          <input id="lin-body" v-model="block.body" class="glass-field">
        </template>

        <!-- divider has only its variant control -->
        <p v-else-if="block.kind === 'divider'" class="linsp__hint">Dividers give a lesson breathing room. Pick a style above.</p>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.linsp {
  position: fixed;
  top: 86rem;
  right: 18rem;
  width: 348rem;
  max-height: calc(100dvh - 110rem);
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  z-index: 25;
}
.linsp__head {
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
.linsp__head:active { cursor: grabbing; }
.linsp__glyph { width: 13rem; height: 13rem; border-radius: 5rem; flex-shrink: 0; }
.linsp__kind { font-size: 13rem; font-weight: 700; margin-right: auto; }
.linsp__icon-btn {
  width: 26rem; height: 26rem;
  display: grid; place-items: center;
  border-radius: 8rem;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  border: 1px solid var(--color-glass-border);
  color: var(--color-text);
  flex-shrink: 0;
}
.linsp__icon-btn--danger { color: #ff8d8d; }

.linsp__body {
  padding: 14rem;
  display: flex;
  flex-direction: column;
  gap: 9rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.linsp__body > * { flex-shrink: 0; }
.linsp__body textarea.glass-field { resize: vertical; }
.linsp__tall { min-height: 140rem; }

.linsp__seg {
  display: flex;
  gap: 4rem;
  padding: 4rem;
  border-radius: 11rem;
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 40%, transparent);
}
.linsp__seg button {
  flex: 1;
  padding: 7rem 6rem;
  border-radius: 8rem;
  font-size: 12rem;
  font-weight: 600;
  color: var(--color-text);
  opacity: 0.65;
  transition: background 0.15s ease, opacity 0.15s ease;
}
.linsp__seg button.on {
  opacity: 1;
  background: color-mix(in srgb, var(--color-text) 12%, transparent);
}

.linsp__upload { position: relative; overflow: hidden; cursor: pointer; width: 100%; }
.linsp__upload input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

.linsp__ok, .linsp__bad {
  display: flex;
  align-items: center;
  gap: 6rem;
  font-size: 11.5rem;
  font-weight: 600;
  line-height: 1.4;
}
.linsp__ok { color: #3fbf6f; }
.linsp__bad { color: #ff8d8d; }

.linsp__pair {
  display: flex;
  flex-direction: column;
  gap: 6rem;
  padding: 10rem;
  border-radius: 12rem;
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 35%, transparent);
}
.linsp__pair-head {
  display: flex;
  align-items: center;
  gap: 4rem;
  font-size: 11rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.75;
}
.linsp__pair-head span { margin-right: auto; }
.linsp__pair-head button {
  width: 22rem; height: 22rem;
  display: grid; place-items: center;
  border-radius: 6rem;
  color: var(--color-text);
}
.linsp__pair-head button:disabled { opacity: 0.25; cursor: default; }
@media (hover: hover) { .linsp__pair-head button:not(:disabled):hover { background: color-mix(in srgb, var(--color-text) 10%, transparent); } }
.linsp__pair-del { color: #ff8d8d !important; }
.linsp__add-pair { width: 100%; }

.linsp__option { display: flex; align-items: center; gap: 8rem; }
.linsp__option input[type="radio"] { width: 15rem; height: 15rem; accent-color: var(--color-accent); flex-shrink: 0; }
.linsp__option-input { padding: 9rem 12rem; }
.linsp__option--correct .linsp__option-input { border-color: color-mix(in srgb, #3fbf6f 60%, var(--color-glass-border)); }

.linsp__hint { font-size: 12rem; line-height: 1.5; opacity: 0.55; }

.linsp-enter-active, .linsp-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.linsp-enter-from, .linsp-leave-to { opacity: 0; transform: translateY(10rem) scale(0.99); }

@media (max-width: 899px) {
  .linsp {
    top: auto;
    left: 10rem; right: 10rem;
    bottom: calc(72rem + var(--safe-bottom));
    width: auto;
    max-height: 74dvh;
    box-shadow: 0 -20rem 60rem -20rem rgba(0, 0, 0, 0.65);
  }
  .linsp__head { cursor: default; }
  .linsp__body .glass-field { padding: 13rem 14rem; font-size: 16px; }
  .linsp-enter-from, .linsp-leave-to { transform: translateY(24rem); opacity: 0; }
}
</style>
