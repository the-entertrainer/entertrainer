<script setup lang="ts">
import type { CardKind } from '~/types/story'
import { CARD_KINDS, CARD_KIND_ORDER } from '~/utils/storyCards'

// Desktop: a slim dock on the left edge. Mobile: rendered inside a bottom
// sheet as a two-column grid. Same component, different `sheet` styling.
defineProps<{ sheet?: boolean }>()
const emit = defineEmits<{ add: [kind: CardKind] }>()
</script>

<template>
  <div class="palette" :class="{ 'palette--sheet': sheet }">
    <p v-if="!sheet" class="palette__label">Cards</p>
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
}
.palette__item {
  display: flex;
  align-items: center;
  gap: 10rem;
  padding: 9rem 10rem;
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
.palette__text { display: flex; flex-direction: column; gap: 2rem; min-width: 0; }
.palette__name { font-size: 12.5rem; font-weight: 600; color: var(--color-text); white-space: nowrap; }
.palette__hint { font-size: 11rem; opacity: 0.55; color: var(--color-text); line-height: 1.35; white-space: normal; }
.palette__plus { margin-left: auto; font-size: 14rem; font-weight: 600; opacity: 0; color: var(--color-text); transition: opacity 0.15s ease; }

/* Bottom-sheet variant */
.palette--sheet {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8rem;
}
.palette--sheet .palette__item {
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 45%, transparent);
  padding: 12rem;
  align-items: flex-start;
}
.palette--sheet .palette__plus { display: none; }
</style>
