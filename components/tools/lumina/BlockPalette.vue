<script setup lang="ts">
import type { LuminaBlockKind } from '~/types/lumina'
import { LUMINA_KINDS, LUMINA_KIND_ORDER } from '~/utils/luminaBlocks'

// Desktop: a slim dock on the left edge. Mobile: rendered inside a bottom
// sheet as a two-column grid. Grouped the way authors think: write it,
// show it, make it interactive.
defineProps<{ sheet?: boolean }>()
const emit = defineEmits<{ add: [kind: LuminaBlockKind] }>()

const groups = [
  { id: 'content', label: 'Content' },
  { id: 'media', label: 'Media' },
  { id: 'interactive', label: 'Interactive' }
] as const

function kindsOf(group: string) {
  return LUMINA_KIND_ORDER.filter(k => LUMINA_KINDS[k].group === group)
}
</script>

<template>
  <div class="lpal" :class="{ 'lpal--sheet': sheet }">
    <template v-for="g in groups" :key="g.id">
      <p class="lpal__label">{{ g.label }}</p>
      <div class="lpal__group">
        <button
          v-for="k in kindsOf(g.id)" :key="k"
          class="lpal__item" :title="LUMINA_KINDS[k].hint"
          @click="emit('add', k)"
        >
          <span class="lpal__dot" :style="{ background: LUMINA_KINDS[k].color }" />
          <span class="lpal__text">
            <strong>{{ LUMINA_KINDS[k].label }}</strong>
            <small v-if="sheet">{{ LUMINA_KINDS[k].hint }}</small>
          </span>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.lpal { display: flex; flex-direction: column; gap: 4rem; width: 168rem; }
.lpal__label {
  font-size: 10rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.5;
  padding: 8rem 8rem 4rem;
}
.lpal__group { display: flex; flex-direction: column; gap: 2rem; }
.lpal__item {
  display: flex;
  align-items: center;
  gap: 9rem;
  padding: 8rem 8rem;
  border-radius: 10rem;
  text-align: left;
  color: var(--color-text);
  transition: background 0.15s ease;
}
@media (hover: hover) {
  .lpal__item:hover { background: color-mix(in srgb, var(--color-bg) 60%, transparent); }
}
.lpal__dot { width: 9rem; height: 9rem; border-radius: 3.5rem; flex-shrink: 0; }
.lpal__text { display: flex; flex-direction: column; gap: 2rem; min-width: 0; }
.lpal__text strong { font-size: 12.5rem; font-weight: 600; letter-spacing: -0.01em; }
.lpal__text small { font-size: 10.5rem; opacity: 0.55; line-height: 1.3; }

/* Bottom-sheet mode: a roomier grid with hints visible */
.lpal--sheet { width: 100%; }
.lpal--sheet .lpal__group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  margin-bottom: 6rem;
}
.lpal--sheet .lpal__item {
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 40%, transparent);
  padding: 11rem 11rem;
  border-radius: 12rem;
  align-items: flex-start;
}
.lpal--sheet .lpal__dot { margin-top: 4rem; }
.lpal--sheet .lpal__text strong { font-size: 13rem; }
</style>
