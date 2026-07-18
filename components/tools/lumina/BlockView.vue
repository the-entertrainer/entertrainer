<script setup lang="ts">
import type { LuminaBlock } from '~/types/lumina'
import { LUMINA_KINDS } from '~/utils/luminaBlocks'
import { parseVideoEmbed } from '~/utils/luminaAudit'

// One block on the editing canvas: a faithful, paper-styled preview of
// what the exported player will render, wrapped in selection chrome.
// Empty blocks show a dashed placeholder naming what's missing, so the
// canvas itself teaches what the gatekeeper will later insist on.
const props = defineProps<{
  block: LuminaBlock
  selected?: boolean
  first?: boolean
  last?: boolean
}>()
const emit = defineEmits<{ select: []; edit: []; delete: []; duplicate: []; move: [dir: -1 | 1] }>()

const meta = computed(() => LUMINA_KINDS[props.block.kind])
const paragraphs = computed(() => props.block.body.trim().split(/\n{2,}/).filter(Boolean))
const listItems = computed(() => props.block.items.filter(i => i.trim()))
const orderItems = computed(() => props.block.items.filter(i => i.trim()))
const filledPairs = computed(() => props.block.pairs.filter(p => p.title.trim() || p.body.trim()))
const fullPairs = computed(() => props.block.pairs.filter(p => p.title.trim() && p.body.trim()))
const videoEmbed = computed(() => parseVideoEmbed(props.block.src))
const filledOptions = computed(() => props.block.options.map((o, i) => ({ text: o, i })).filter(o => o.text.trim()))
const buckets = computed(() => props.block.options.filter(o => o.trim()))
const gridRows = computed(() => props.block.grid.filter(r => r.some(c => c.trim())))

const isEmpty = computed(() => {
  const b = props.block
  switch (b.kind) {
    case 'hero': return !b.title.trim()
    case 'text': case 'quote': return !b.body.trim()
    case 'list': return !listItems.value.length
    case 'ordering': return orderItems.value.length < 2
    case 'callout': return !b.title.trim() && !b.body.trim()
    case 'stat': return !b.title.trim()
    case 'table': return gridRows.value.length < 1
    case 'divider': return false
    case 'image': case 'imagetext': return !b.src.trim()
    case 'video': return !videoEmbed.value
    case 'audio': return !b.src.trim()
    case 'steps': case 'cardgrid': case 'accordion': case 'tabs': case 'flashcards': case 'reveal': return !filledPairs.value.length
    case 'matching': case 'memory': return fullPairs.value.length < 1
    case 'sortgame': return !filledPairs.value.length || buckets.value.length < 2
    case 'reflection': case 'quiz': case 'multiquiz': case 'truefalse': case 'fillblank': case 'poll': case 'scenario': case 'cta': return !b.title.trim()
    default: return false
  }
})
</script>

<template>
  <div
    class="lblk" :class="{ 'lblk--selected': selected }"
    role="button" tabindex="0"
    :aria-label="`${meta.label} block`"
    @click.stop="emit('select')"
    @keydown.enter.self="emit('edit')"
  >
    <!-- Kind tag + hover/selection toolbar -->
    <span class="lblk__tag" :style="{ '--kind': meta.color }">{{ meta.label }}</span>
    <div class="lblk__tools" @click.stop>
      <button title="Move up" :disabled="first" @click="emit('move', -1)"><ToolsLuminaIcon name="arrow-up" :size="13" /></button>
      <button title="Move down" :disabled="last" @click="emit('move', 1)"><ToolsLuminaIcon name="arrow-down" :size="13" /></button>
      <button title="Edit" @click="emit('edit')"><ToolsLuminaIcon name="edit" :size="13" /></button>
      <button title="Duplicate" @click="emit('duplicate')"><ToolsLuminaIcon name="duplicate" :size="13" /></button>
      <button class="lblk__tool-del" title="Delete" @click="emit('delete')"><ToolsLuminaIcon name="trash" :size="13" /></button>
    </div>

    <!-- Empty state: name what's missing -->
    <div v-if="isEmpty" class="lblk__empty">
      <span class="lblk__empty-dot" :style="{ background: meta.color }" />
      {{ meta.label }}: {{ meta.hint.toLowerCase() }}
    </div>

    <!-- hero -->
    <div v-else-if="block.kind === 'hero'" class="lb-hero" :class="{ 'lb-hero--accent': block.variant !== 'plain' }">
      <h2>{{ block.title }}</h2>
      <p v-if="block.body.trim()">{{ block.body.trim().split('\n')[0] }}</p>
    </div>

    <!-- text -->
    <div v-else-if="block.kind === 'text'" class="lb-text">
      <p v-for="(p, i) in paragraphs" :key="i">{{ p }}</p>
    </div>

    <!-- list -->
    <ul v-else-if="block.kind === 'list'" class="lb-list" :class="`lb-list--${block.variant || 'bullet'}`">
      <li v-for="(item, i) in listItems" :key="i">
        <span class="lb-list__marker">
          <template v-if="block.variant === 'number'">{{ i + 1 }}</template>
          <ToolsLuminaIcon v-else-if="block.variant === 'check'" name="check" :size="11" />
        </span>
        {{ item }}
      </li>
    </ul>

    <!-- quote -->
    <figure v-else-if="block.kind === 'quote'" class="lb-quote">
      <blockquote>{{ block.body.trim() }}</blockquote>
      <figcaption v-if="block.caption.trim()">{{ block.caption.trim() }}</figcaption>
    </figure>

    <!-- callout -->
    <aside v-else-if="block.kind === 'callout'" class="lb-callout" :class="`lb-callout--${block.variant || 'note'}`">
      <strong v-if="block.title.trim()">{{ block.title.trim() }}</strong>
      <p v-for="(p, i) in paragraphs" :key="i">{{ p }}</p>
    </aside>

    <!-- divider -->
    <div v-else-if="block.kind === 'divider'" class="lb-divider" :class="`lb-divider--${block.variant || 'line'}`">
      <template v-if="block.variant === 'dots'"><i /><i /><i /></template>
    </div>

    <!-- image -->
    <figure v-else-if="block.kind === 'image'" class="lb-img">
      <img :src="block.src" :alt="block.alt">
      <figcaption v-if="block.caption.trim()">{{ block.caption.trim() }}</figcaption>
      <span v-if="!block.alt.trim()" class="lb-img__alt-flag" title="Missing alt text">
        <ToolsLuminaIcon name="alert" :size="11" /> alt
      </span>
    </figure>

    <!-- video -->
    <figure v-else-if="block.kind === 'video'" class="lb-video">
      <div class="lb-video__frame">
        <span class="lb-video__play" aria-hidden="true" />
        <span class="lb-video__host">{{ videoEmbed?.kind === 'file' ? 'Video file' : videoEmbed?.kind === 'vimeo' ? 'Vimeo' : 'YouTube' }}</span>
      </div>
      <figcaption v-if="block.caption.trim()">{{ block.caption.trim() }}</figcaption>
    </figure>

    <!-- accordion -->
    <div v-else-if="block.kind === 'accordion'" class="lb-acc">
      <div v-for="p in filledPairs" :key="p.id" class="lb-acc__item">
        <span>{{ p.title.trim() || 'Untitled panel' }}</span>
        <ToolsLuminaIcon name="chevron-down" :size="13" />
      </div>
    </div>

    <!-- tabs -->
    <div v-else-if="block.kind === 'tabs'" class="lb-tabs">
      <div class="lb-tabs__bar">
        <span v-for="(p, i) in filledPairs" :key="p.id" :class="{ on: i === 0 }">{{ p.title.trim() || `Tab ${i + 1}` }}</span>
      </div>
      <p class="lb-tabs__pane">{{ filledPairs[0]?.body.trim().split('\n')[0] || '…' }}</p>
    </div>

    <!-- flashcards -->
    <div v-else-if="block.kind === 'flashcards'" class="lb-cards">
      <div v-for="p in filledPairs" :key="p.id" class="lb-cards__card">{{ p.title.trim() || '…' }}</div>
    </div>

    <!-- quiz -->
    <div v-else-if="block.kind === 'quiz'" class="lb-quiz">
      <span class="lb-quiz__tag">Knowledge check</span>
      <h3>{{ block.title.trim() }}</h3>
      <div v-for="o in filledOptions" :key="o.i" class="lb-quiz__opt" :class="{ 'lb-quiz__opt--good': o.i === block.correctIndex }">
        <i /><span>{{ o.text }}</span>
        <ToolsLuminaIcon v-if="o.i === block.correctIndex" name="check" :size="12" class="lb-quiz__check" />
      </div>
    </div>

    <!-- stat -->
    <div v-else-if="block.kind === 'stat'" class="lb-stat" :class="{ 'lb-stat--accent': block.variant !== 'plain' }">
      <span class="lb-stat__num">{{ block.title.trim() }}</span>
      <span v-if="block.body.trim()" class="lb-stat__label">{{ block.body.trim() }}</span>
      <span v-if="block.caption.trim()" class="lb-stat__note">{{ block.caption.trim() }}</span>
    </div>

    <!-- steps -->
    <ol v-else-if="block.kind === 'steps'" class="lb-steps">
      <li v-for="(p, i) in filledPairs" :key="p.id">
        <span class="lb-steps__num">{{ i + 1 }}</span>
        <div><strong>{{ p.title.trim() || `Step ${i + 1}` }}</strong><p v-if="p.body.trim()">{{ p.body.trim() }}</p></div>
      </li>
    </ol>

    <!-- cardgrid -->
    <div v-else-if="block.kind === 'cardgrid'" class="lb-cgrid">
      <div v-for="p in filledPairs" :key="p.id" class="lb-cgrid__card">
        <strong>{{ p.title.trim() }}</strong><p v-if="p.body.trim()">{{ p.body.trim() }}</p>
      </div>
    </div>

    <!-- table -->
    <div v-else-if="block.kind === 'table'" class="lb-tablewrap">
      <table class="lb-table">
        <thead><tr><th v-for="(c, ci) in gridRows[0]" :key="ci">{{ c.trim() }}</th></tr></thead>
        <tbody>
          <tr v-for="(row, ri) in gridRows.slice(1)" :key="ri">
            <td v-for="(_, ci) in gridRows[0]" :key="ci">{{ (row[ci] || '').trim() }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- imagetext -->
    <div v-else-if="block.kind === 'imagetext'" class="lb-imgtext" :class="`lb-imgtext--${block.variant || 'left'}`">
      <img :src="block.src" :alt="block.alt">
      <div class="lb-imgtext__body">
        <p v-for="(p, i) in paragraphs" :key="i">{{ p }}</p>
        <p v-if="!paragraphs.length" class="lb-imgtext__ph">Text sits here, beside the picture.</p>
      </div>
    </div>

    <!-- audio -->
    <div v-else-if="block.kind === 'audio'" class="lb-audio">
      <span class="lb-audio__play" aria-hidden="true" />
      <div>
        <strong>{{ block.caption.trim() || 'Audio clip' }}</strong>
        <span v-if="block.body.trim()" class="lb-audio__tx">Transcript included</span>
      </div>
    </div>

    <!-- reveal -->
    <div v-else-if="block.kind === 'reveal'" class="lb-reveal">
      <h3 v-if="block.title.trim()">{{ block.title.trim() }}</h3>
      <div v-for="p in filledPairs" :key="p.id" class="lb-reveal__item">
        <span>{{ p.title.trim() || 'Reveal' }}</span>
        <span class="lb-reveal__hint">Tap to reveal</span>
      </div>
    </div>

    <!-- reflection -->
    <div v-else-if="block.kind === 'reflection'" class="lb-reflect">
      <span class="lb-tag">Your turn</span>
      <h3>{{ block.title.trim() }}</h3>
      <p v-if="block.body.trim()">{{ block.body.trim() }}</p>
      <div class="lb-reflect__box">Learners write here…</div>
    </div>

    <!-- multiquiz / truefalse -->
    <div v-else-if="block.kind === 'multiquiz' || block.kind === 'truefalse'" class="lb-quiz">
      <span class="lb-quiz__tag">{{ block.kind === 'truefalse' ? 'True or false' : 'Select all that apply' }}</span>
      <h3>{{ block.title.trim() }}</h3>
      <div
        v-for="o in filledOptions" :key="o.i" class="lb-quiz__opt"
        :class="{ 'lb-quiz__opt--good': block.kind === 'truefalse' ? o.i === block.correctIndex : block.correctSet.includes(o.i) }"
      >
        <i :class="{ 'lb-box': block.kind === 'multiquiz' }" /><span>{{ o.text }}</span>
        <ToolsLuminaIcon
          v-if="block.kind === 'truefalse' ? o.i === block.correctIndex : block.correctSet.includes(o.i)"
          name="check" :size="12" class="lb-quiz__check"
        />
      </div>
    </div>

    <!-- fillblank -->
    <div v-else-if="block.kind === 'fillblank'" class="lb-quiz">
      <span class="lb-quiz__tag">Fill the blank</span>
      <h3 v-if="block.title.trim()">{{ block.title.trim() }}</h3>
      <p class="lb-fib">
        <template v-for="(part, i) in block.body.split('___')" :key="i">{{ part }}<span v-if="i < block.body.split('___').length - 1" class="lb-fib__gap" /></template>
      </p>
    </div>

    <!-- poll -->
    <div v-else-if="block.kind === 'poll'" class="lb-quiz">
      <span class="lb-quiz__tag">Poll</span>
      <h3>{{ block.title.trim() }}</h3>
      <div v-for="o in filledOptions" :key="o.i" class="lb-poll__opt">{{ o.text }}</div>
    </div>

    <!-- scenario -->
    <div v-else-if="block.kind === 'scenario'" class="lb-quiz">
      <span class="lb-quiz__tag">Scenario</span>
      <h3>{{ block.title.trim() }}</h3>
      <div
        v-for="o in filledOptions" :key="o.i" class="lb-scenario__choice"
        :class="{ 'lb-scenario__choice--best': o.i === block.correctIndex }"
      >
        {{ o.text }}
        <ToolsLuminaIcon v-if="o.i === block.correctIndex" name="check" :size="12" />
      </div>
    </div>

    <!-- ordering -->
    <div v-else-if="block.kind === 'ordering'" class="lb-order">
      <span class="lb-quiz__tag">Put in order</span>
      <h3 v-if="block.title.trim()">{{ block.title.trim() }}</h3>
      <div v-for="(item, i) in orderItems" :key="i" class="lb-order__item">
        <span class="lb-order__grip" aria-hidden="true" />{{ item }}
      </div>
    </div>

    <!-- matching -->
    <div v-else-if="block.kind === 'matching'" class="lb-match">
      <span class="lb-quiz__tag">Matching</span>
      <h3 v-if="block.title.trim()">{{ block.title.trim() }}</h3>
      <div class="lb-match__rows">
        <div v-for="p in fullPairs" :key="p.id" class="lb-match__row">
          <span>{{ p.title.trim() }}</span>
          <span class="lb-match__link" aria-hidden="true" />
          <span>{{ p.body.trim() }}</span>
        </div>
      </div>
    </div>

    <!-- sortgame -->
    <div v-else-if="block.kind === 'sortgame'" class="lb-sort">
      <span class="lb-quiz__tag">Sort it</span>
      <h3 v-if="block.title.trim()">{{ block.title.trim() }}</h3>
      <div class="lb-sort__buckets">
        <span v-for="(b, bi) in buckets" :key="bi" class="lb-sort__bucket">{{ b }}</span>
      </div>
      <div v-for="p in filledPairs.filter(p => p.title.trim())" :key="p.id" class="lb-sort__card">
        <span>{{ p.title.trim() }}</span>
        <span class="lb-sort__into">→ {{ buckets[Math.min(buckets.length - 1, p.bucket || 0)] || '—' }}</span>
      </div>
    </div>

    <!-- memory -->
    <div v-else-if="block.kind === 'memory'" class="lb-memory">
      <span class="lb-quiz__tag">Memory match</span>
      <h3 v-if="block.title.trim()">{{ block.title.trim() }}</h3>
      <div class="lb-memory__grid">
        <span v-for="n in Math.min(8, fullPairs.length * 2)" :key="n" class="lb-memory__card">?</span>
      </div>
      <p class="lb-memory__note">{{ fullPairs.length }} pair{{ fullPairs.length === 1 ? '' : 's' }} to find</p>
    </div>

    <!-- cta -->
    <div v-else-if="block.kind === 'cta'" class="lb-cta">
      <span class="lb-cta__btn" :class="{ 'lb-cta__btn--outline': block.variant === 'outline' }">{{ block.title.trim() }}</span>
      <p v-if="block.body.trim()">{{ block.body.trim() }}</p>
    </div>
  </div>
</template>

<style scoped>
/* The block wrapper carries the editor chrome. The inner previews use the
   course's own "paper" palette (set on the canvas by the page) so what you
   see is what exports. --lum-accent comes from the course theme. */
.lblk {
  position: relative;
  padding: 10rem 14rem;
  border-radius: 12rem;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}
@media (hover: hover) {
  .lblk:hover { border-color: color-mix(in srgb, var(--lum-accent) 35%, transparent); }
  .lblk:hover .lblk__tools, .lblk:hover .lblk__tag { opacity: 1; }
}
.lblk--selected { border-color: var(--lum-accent); background: color-mix(in srgb, var(--lum-accent) 5%, transparent); }
.lblk--selected .lblk__tools, .lblk--selected .lblk__tag { opacity: 1; }

.lblk__tag {
  position: absolute;
  top: -9rem;
  left: 12rem;
  z-index: 2;
  font-size: 9.5rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 2rem 8rem;
  border-radius: 999px;
  color: #fff;
  background: var(--kind, #999);
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;
}
.lblk__tools {
  position: absolute;
  top: -14rem;
  right: 10rem;
  z-index: 3;
  display: flex;
  gap: 2rem;
  padding: 3rem;
  border-radius: 10rem;
  background: var(--color-bg);
  border: 1px solid var(--color-glass-border);
  box-shadow: 0 10rem 24rem -12rem rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.15s ease;
}
.lblk__tools button {
  width: 26rem;
  height: 26rem;
  display: grid;
  place-items: center;
  border-radius: 7rem;
  color: var(--color-text);
}
@media (hover: hover) { .lblk__tools button:not(:disabled):hover { background: color-mix(in srgb, var(--color-text) 10%, transparent); } }
.lblk__tools button:disabled { opacity: 0.25; cursor: default; }
.lblk__tool-del { color: #e05555 !important; }
/* Touch devices can't hover: the toolbar shows for the selected block */
@media (hover: none) {
  .lblk__tools { display: none; }
}

.lblk__empty {
  display: flex;
  align-items: center;
  gap: 9rem;
  padding: 16rem 14rem;
  border: 1.5px dashed color-mix(in srgb, var(--lum-ink) 25%, transparent);
  border-radius: 10rem;
  font-size: 13rem;
  color: color-mix(in srgb, var(--lum-ink) 55%, transparent);
}
.lblk__empty-dot { width: 8rem; height: 8rem; border-radius: 3rem; flex-shrink: 0; }

/* ── Paper previews (course-styled, not site-styled) ── */
.lb-hero h2 { font-size: 24rem; letter-spacing: -0.02em; line-height: 1.2; color: var(--lum-ink); }
.lb-hero--accent h2 { color: var(--lum-accent); }
.lb-hero p { margin-top: 6rem; font-size: 14.5rem; color: color-mix(in srgb, var(--lum-ink) 60%, transparent); line-height: 1.45; }
.lb-text p { font-size: 14.5rem; line-height: 1.6; color: var(--lum-ink); }
.lb-text p + p { margin-top: 10rem; }
.lb-list { list-style: none; display: flex; flex-direction: column; gap: 7rem; }
.lb-list li { display: flex; align-items: baseline; gap: 10rem; font-size: 14.5rem; line-height: 1.5; color: var(--lum-ink); }
.lb-list__marker {
  flex-shrink: 0;
  width: 18rem;
  height: 18rem;
  display: grid;
  place-items: center;
  align-self: flex-start;
  margin-top: 2rem;
  border-radius: 6rem;
  font-size: 11rem;
  font-weight: 700;
  color: var(--lum-accent);
  background: color-mix(in srgb, var(--lum-accent) 14%, transparent);
}
.lb-list--bullet .lb-list__marker { width: 6rem; height: 6rem; border-radius: 999px; background: var(--lum-accent); margin-top: 8rem; }
.lb-quote { border-left: 3px solid var(--lum-accent); padding: 4rem 0 4rem 16rem; }
.lb-quote blockquote { font-size: 17rem; line-height: 1.45; font-weight: 500; color: var(--lum-ink); }
.lb-quote figcaption { margin-top: 8rem; font-size: 12rem; font-weight: 600; color: color-mix(in srgb, var(--lum-ink) 55%, transparent); }
.lb-callout {
  border-radius: 12rem;
  padding: 14rem 16rem;
  background: var(--lum-panel);
  border: 1px solid color-mix(in srgb, var(--lum-ink) 12%, transparent);
  border-left: 4px solid #5B8DEF;
}
.lb-callout--tip { border-left-color: #34C3A2; }
.lb-callout--warning { border-left-color: #F08C4A; background: rgba(240, 140, 74, 0.07); }
.lb-callout strong { display: block; font-size: 13.5rem; color: var(--lum-ink); margin-bottom: 4rem; }
.lb-callout p { font-size: 13.5rem; line-height: 1.5; color: color-mix(in srgb, var(--lum-ink) 65%, transparent); }
.lb-callout p + p { margin-top: 8rem; }
.lb-divider--line { border-top: 1px solid color-mix(in srgb, var(--lum-ink) 14%, transparent); margin: 8rem 0; }
.lb-divider--space { height: 26rem; }
.lb-divider--dots { display: flex; justify-content: center; gap: 8rem; padding: 8rem 0; }
.lb-divider--dots i { width: 5rem; height: 5rem; border-radius: 999px; background: var(--lum-accent); opacity: 0.5; }
.lb-img { position: relative; }
.lb-img img { width: 100%; border-radius: 12rem; display: block; }
.lb-img figcaption, .lb-video figcaption { margin-top: 8rem; font-size: 12rem; color: color-mix(in srgb, var(--lum-ink) 55%, transparent); text-align: center; }
.lb-img__alt-flag {
  position: absolute;
  top: 8rem;
  right: 8rem;
  display: inline-flex;
  align-items: center;
  gap: 4rem;
  padding: 3rem 8rem;
  border-radius: 999px;
  font-size: 10rem;
  font-weight: 700;
  background: #d64550;
  color: #fff;
}
.lb-video__frame {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 12rem;
  background:
    radial-gradient(80% 90% at 30% 20%, color-mix(in srgb, var(--lum-accent) 30%, #1a1613), #1a1613);
  display: grid;
  place-items: center;
}
.lb-video__play {
  width: 44rem;
  height: 44rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  position: relative;
}
.lb-video__play::after {
  content: "";
  position: absolute;
  left: 17rem;
  top: 13rem;
  border-left: 14rem solid #1a1613;
  border-top: 9rem solid transparent;
  border-bottom: 9rem solid transparent;
}
.lb-video__host {
  position: absolute;
  bottom: 10rem;
  right: 12rem;
  font-size: 10.5rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
}
.lb-acc__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rem;
  padding: 12rem 14rem;
  border: 1px solid color-mix(in srgb, var(--lum-ink) 12%, transparent);
  background: var(--lum-panel);
  border-radius: 10rem;
  margin: 6rem 0;
  font-size: 13.5rem;
  font-weight: 600;
  color: var(--lum-ink);
}
.lb-tabs__bar {
  display: flex;
  gap: 4rem;
  border-bottom: 1px solid color-mix(in srgb, var(--lum-ink) 14%, transparent);
  overflow: hidden;
}
.lb-tabs__bar span {
  padding: 8rem 12rem;
  font-size: 12.5rem;
  font-weight: 600;
  color: color-mix(in srgb, var(--lum-ink) 50%, transparent);
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}
.lb-tabs__bar span.on { color: var(--lum-accent); border-bottom-color: var(--lum-accent); }
.lb-tabs__pane { padding: 10rem 2rem 0; font-size: 13rem; color: color-mix(in srgb, var(--lum-ink) 60%, transparent); line-height: 1.5; }
.lb-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(120rem, 1fr)); gap: 8rem; }
.lb-cards__card {
  aspect-ratio: 5 / 3.4;
  display: grid;
  place-items: center;
  padding: 10rem;
  text-align: center;
  border-radius: 12rem;
  background: var(--lum-panel);
  border: 1px solid color-mix(in srgb, var(--lum-ink) 12%, transparent);
  box-shadow: 0 8rem 18rem -12rem rgba(0, 0, 0, 0.3);
  font-size: 12.5rem;
  font-weight: 600;
  color: var(--lum-ink);
  line-height: 1.35;
}
.lb-quiz {
  border: 1px solid color-mix(in srgb, var(--lum-ink) 12%, transparent);
  border-radius: 14rem;
  background: var(--lum-panel);
  padding: 16rem;
}
.lb-quiz__tag {
  font-size: 9.5rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--lum-accent);
}
.lb-quiz h3 { margin: 8rem 0 12rem; font-size: 15.5rem; line-height: 1.35; color: var(--lum-ink); }
.lb-quiz__opt {
  display: flex;
  align-items: center;
  gap: 10rem;
  padding: 9rem 11rem;
  border: 1.5px solid color-mix(in srgb, var(--lum-ink) 12%, transparent);
  border-radius: 10rem;
  margin: 6rem 0;
  font-size: 13rem;
  color: var(--lum-ink);
}
.lb-quiz__opt i { width: 14rem; height: 14rem; border-radius: 999px; border: 2px solid color-mix(in srgb, var(--lum-ink) 25%, transparent); flex-shrink: 0; }
.lb-quiz__opt--good { border-color: #2f9e6e; background: rgba(47, 158, 110, 0.07); }
.lb-quiz__opt--good i { border-color: #2f9e6e; }
.lb-quiz__opt span { flex: 1; min-width: 0; }
.lb-quiz__check { color: #2f9e6e; }
.lb-cta { text-align: center; padding: 6rem 0; }
.lb-cta__btn {
  display: inline-block;
  padding: 10rem 24rem;
  border-radius: 999px;
  background: var(--lum-accent);
  color: #fff;
  font-size: 13.5rem;
  font-weight: 700;
}
.lb-cta__btn--outline { background: none; border: 2px solid var(--lum-accent); color: var(--lum-accent); }
.lb-cta p { margin-top: 8rem; font-size: 12rem; color: color-mix(in srgb, var(--lum-ink) 55%, transparent); }

/* ── New block previews ── */
.lb-tag, .lb-quiz__tag {
  font-size: 9.5rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--lum-accent);
}
.lb-stat { text-align: center; padding: 8rem 0; }
.lb-stat__num { display: block; font-size: 40rem; font-weight: 800; line-height: 1; letter-spacing: -0.03em; color: var(--lum-ink); }
.lb-stat--accent .lb-stat__num { color: var(--lum-accent); }
.lb-stat__label { display: block; margin-top: 7rem; font-size: 14rem; font-weight: 600; color: var(--lum-ink); }
.lb-stat__note { display: block; margin-top: 4rem; font-size: 12rem; color: color-mix(in srgb, var(--lum-ink) 55%, transparent); }
.lb-steps { list-style: none; display: flex; flex-direction: column; gap: 12rem; }
.lb-steps li { display: flex; gap: 12rem; }
.lb-steps__num { flex-shrink: 0; width: 26rem; height: 26rem; border-radius: 999px; display: grid; place-items: center; font-weight: 800; font-size: 12rem; background: var(--lum-accent); color: #fff; }
.lb-steps strong { font-size: 14rem; color: var(--lum-ink); }
.lb-steps p { margin-top: 2rem; font-size: 12.5rem; color: color-mix(in srgb, var(--lum-ink) 60%, transparent); }
.lb-cgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120rem, 1fr)); gap: 8rem; }
.lb-cgrid__card { padding: 12rem; border-radius: 10rem; background: var(--lum-panel); border: 1px solid color-mix(in srgb, var(--lum-ink) 12%, transparent); }
.lb-cgrid__card strong { font-size: 13rem; color: var(--lum-ink); }
.lb-cgrid__card p { margin-top: 4rem; font-size: 12rem; color: color-mix(in srgb, var(--lum-ink) 60%, transparent); line-height: 1.4; }
.lb-tablewrap { overflow-x: auto; border: 1px solid color-mix(in srgb, var(--lum-ink) 12%, transparent); border-radius: 10rem; }
.lb-table { border-collapse: collapse; width: 100%; font-size: 12.5rem; color: var(--lum-ink); }
.lb-table th, .lb-table td { padding: 8rem 12rem; text-align: left; border-bottom: 1px solid color-mix(in srgb, var(--lum-ink) 10%, transparent); white-space: nowrap; }
.lb-table th { background: color-mix(in srgb, var(--lum-accent) 10%, transparent); font-weight: 700; }
.lb-table tbody tr:last-child td { border-bottom: 0; }
.lb-imgtext { display: grid; grid-template-columns: 1fr 1fr; gap: 12rem; align-items: center; }
.lb-imgtext--right img { order: 2; }
.lb-imgtext img { width: 100%; border-radius: 10rem; }
.lb-imgtext__body p { font-size: 13rem; line-height: 1.5; color: var(--lum-ink); }
.lb-imgtext__body p + p { margin-top: 6rem; }
.lb-imgtext__ph { color: color-mix(in srgb, var(--lum-ink) 45%, transparent) !important; font-style: italic; }
.lb-audio { display: flex; align-items: center; gap: 12rem; padding: 12rem 14rem; border-radius: 12rem; background: var(--lum-panel); border: 1px solid color-mix(in srgb, var(--lum-ink) 12%, transparent); }
.lb-audio__play { width: 34rem; height: 34rem; border-radius: 999px; background: var(--lum-accent); position: relative; flex-shrink: 0; }
.lb-audio__play::after { content: ""; position: absolute; left: 13rem; top: 10rem; border-left: 11rem solid #fff; border-top: 7rem solid transparent; border-bottom: 7rem solid transparent; }
.lb-audio strong { display: block; font-size: 13.5rem; color: var(--lum-ink); }
.lb-audio__tx { font-size: 11.5rem; color: color-mix(in srgb, var(--lum-ink) 55%, transparent); }
.lb-reveal h3, .lb-reflect h3, .lb-order h3, .lb-match h3, .lb-sort h3, .lb-memory h3, .lb-quiz h3 { color: var(--lum-ink); }
.lb-reveal h3 { font-size: 15rem; margin-bottom: 8rem; }
.lb-reveal__item { display: flex; align-items: center; justify-content: space-between; gap: 10rem; padding: 12rem 14rem; border: 1.5px solid color-mix(in srgb, var(--lum-ink) 12%, transparent); border-radius: 10rem; margin: 6rem 0; font-size: 13.5rem; font-weight: 600; color: var(--lum-ink); background: var(--lum-panel); }
.lb-reveal__hint { font-size: 10rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--lum-accent); }
.lb-reflect { padding: 14rem; border-radius: 12rem; background: var(--lum-panel); border: 1px solid color-mix(in srgb, var(--lum-ink) 12%, transparent); }
.lb-reflect h3 { font-size: 15rem; margin: 6rem 0; }
.lb-reflect p { font-size: 12.5rem; color: color-mix(in srgb, var(--lum-ink) 60%, transparent); margin-bottom: 8rem; }
.lb-reflect__box { padding: 12rem; border: 1.5px dashed color-mix(in srgb, var(--lum-ink) 20%, transparent); border-radius: 8rem; font-size: 12.5rem; color: color-mix(in srgb, var(--lum-ink) 45%, transparent); }
.lb-quiz__opt i.lb-box { border-radius: 5rem; }
.lb-fib { font-size: 14rem; line-height: 2; color: var(--lum-ink); }
.lb-fib__gap { display: inline-block; width: 70rem; height: 0; border-bottom: 2.5px solid var(--lum-accent); vertical-align: middle; margin: 0 4rem; }
.lb-poll__opt { padding: 10rem 12rem; border: 1.5px solid color-mix(in srgb, var(--lum-ink) 12%, transparent); border-radius: 10rem; margin: 6rem 0; font-size: 13rem; color: var(--lum-ink); }
.lb-scenario__choice { display: flex; align-items: center; justify-content: space-between; gap: 8rem; padding: 11rem 13rem; border: 1.5px solid color-mix(in srgb, var(--lum-ink) 12%, transparent); border-radius: 10rem; margin: 6rem 0; font-size: 13rem; color: var(--lum-ink); }
.lb-scenario__choice--best { border-color: #2f9e6e; background: rgba(47, 158, 110, 0.07); color: #2f9e6e; }
.lb-order__item { display: flex; align-items: center; gap: 10rem; padding: 10rem 12rem; border: 1.5px solid color-mix(in srgb, var(--lum-ink) 12%, transparent); border-radius: 10rem; margin: 6rem 0; font-size: 13.5rem; color: var(--lum-ink); background: var(--lum-panel); }
.lb-order__grip, .lb-sort__into { flex-shrink: 0; }
.lb-order__grip { width: 14rem; height: 14rem; background-image: radial-gradient(currentColor 1.2px, transparent 1.2px); background-size: 5rem 5rem; color: color-mix(in srgb, var(--lum-ink) 30%, transparent); }
.lb-match__rows { display: flex; flex-direction: column; gap: 8rem; margin-top: 8rem; }
.lb-match__row { display: grid; grid-template-columns: 1fr 24rem 1fr; align-items: center; gap: 6rem; font-size: 12.5rem; color: var(--lum-ink); }
.lb-match__row span:first-child, .lb-match__row span:last-child { padding: 9rem 11rem; border: 1.5px solid color-mix(in srgb, var(--lum-ink) 12%, transparent); border-radius: 9rem; background: var(--lum-panel); }
.lb-match__link { height: 2px; background: color-mix(in srgb, var(--lum-accent) 45%, transparent); }
.lb-sort__buckets { display: flex; flex-wrap: wrap; gap: 6rem; margin: 8rem 0; }
.lb-sort__bucket { padding: 5rem 12rem; border-radius: 999px; background: var(--lum-accent); color: #fff; font-size: 11.5rem; font-weight: 700; }
.lb-sort__card { display: flex; align-items: center; justify-content: space-between; gap: 8rem; padding: 9rem 12rem; border: 1.5px solid color-mix(in srgb, var(--lum-ink) 12%, transparent); border-radius: 9rem; margin: 5rem 0; font-size: 12.5rem; color: var(--lum-ink); }
.lb-sort__into { font-size: 11rem; font-weight: 600; color: var(--lum-accent); }
.lb-memory { text-align: left; }
.lb-memory__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6rem; margin: 8rem 0; }
.lb-memory__card { aspect-ratio: 3 / 4; display: grid; place-items: center; border-radius: 8rem; background: linear-gradient(140deg, var(--lum-accent), color-mix(in srgb, var(--lum-accent) 55%, #000)); color: #fff; font-weight: 800; font-size: 16rem; }
.lb-memory__note { font-size: 11.5rem; color: color-mix(in srgb, var(--lum-ink) 55%, transparent); }
</style>
