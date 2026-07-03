<script setup lang="ts">
import type { CardKind } from '~/types/story'
import { CARD_KINDS, CARD_KIND_ORDER } from '~/utils/storyCards'
import { modelOf } from '~/utils/idModels'

// Desktop: a slim dock on the left edge. Mobile: rendered inside a bottom
// sheet as a two-column grid. When an ID model is active, its stages appear
// first — one tap adds a card already assigned to that stage, in that
// stage's natural card kind.
const props = defineProps<{ sheet?: boolean; modelId?: string; stageSeconds?: Record<string, number> }>()
const emit = defineEmits<{ add: [kind: CardKind, stage?: string] }>()

const model = computed(() => modelOf(props.modelId))

function fmtTime(total: number) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return m ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
}
</script>

<template>
  <div class="palette" :class="{ 'palette--sheet': sheet }">
    <template v-if="model.stages.length">
      <p class="palette__label">{{ model.label }}</p>
      <button
        v-for="s in model.stages" :key="s.id"
        class="palette__item palette__item--stage"
        :style="{ '--kind-color': s.color }"
        :title="s.prompt"
        @click="emit('add', s.kind, s.id)"
      >
        <span class="palette__dot" />
        <span class="palette__text">
          <span class="palette__name">{{ s.label }}</span>
          <span v-if="sheet" class="palette__hint">{{ s.prompt }}</span>
        </span>
        <span v-if="stageSeconds?.[s.id]" class="palette__time">{{ fmtTime(stageSeconds[s.id]) }}</span>
        <span class="palette__plus">+</span>
      </button>
      <div class="palette__rule" />
    </template>

    <p class="palette__label">Cards</p>
    <button
      v-for="kind in CARD_KIND_ORDER" :key="kind"
      class="palette__item"
      :style="{ '--kind-color': CARD_KINDS[kind].color }"
      :title="CARD_KINDS[kind].hint"
      @click="emit('add', kind)"
    >
      <span class="palette__glyph">{{ CARD_KINDS[kind].glyph }}</span>
      <span class="palette__text">
        <span class="palette__name">{{ CARD_KINDS[kind].label }}</span>
        <span v-if="sheet" class="palette__hint">{{ CARD_KINDS[kind].hint }}</span>
      </span>
      <span class="palette__plus">+</span>
    </button>
  </div>
</template>

<style scoped>
.palette {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}
.palette__label {
  font-size: 10rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.45;
  padding: 2rem 10rem 6rem;
  color: var(--color-text);
}
.palette__rule { height: 1px; background: var(--color-divider); margin: 8rem 6rem; }
.palette__item {
  display: flex;
  align-items: center;
  gap: 10rem;
  padding: 8rem 10rem;
  border-radius: 12rem;
  text-align: left;
  transition: background 0.15s ease;
}
@media (hover: hover) {
  .palette__item:hover { background: color-mix(in srgb, var(--kind-color) 14%, transparent); }
  .palette__item:hover .palette__plus { opacity: 0.9; }
}
.palette__item:active { background: color-mix(in srgb, var(--kind-color) 22%, transparent); }
.palette__glyph {
  width: 26rem; height: 26rem;
  display: grid; place-items: center;
  border-radius: 8rem;
  font-size: 12rem;
  font-weight: 700;
  color: var(--color-bg);
  background: var(--kind-color);
  flex-shrink: 0;
}
.palette__dot {
  width: 10rem; height: 10rem;
  margin: 0 8rem;
  border-radius: 999px;
  background: var(--kind-color);
  flex-shrink: 0;
}
.palette__text { display: flex; flex-direction: column; gap: 2rem; min-width: 0; }
.palette__name { font-size: 12.5rem; font-weight: 600; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 168rem; }
.palette__hint { font-size: 11rem; opacity: 0.55; color: var(--color-text); line-height: 1.35; white-space: normal; }
.palette__plus { margin-left: auto; font-size: 14rem; font-weight: 600; opacity: 0; color: var(--color-text); transition: opacity 0.15s ease; }
.palette__time {
  margin-left: auto;
  font-size: 10.5rem;
  font-weight: 700;
  opacity: 0.55;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}
.palette__time + .palette__plus { margin-left: 6rem; }

/* Bottom-sheet variant */
.palette--sheet {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8rem;
}
.palette--sheet .palette__label, .palette--sheet .palette__rule { grid-column: 1 / -1; }
.palette--sheet .palette__item {
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 45%, transparent);
  padding: 12rem;
  align-items: flex-start;
}
.palette--sheet .palette__name { white-space: normal; max-width: none; }
.palette--sheet .palette__plus { display: none; }
</style>
