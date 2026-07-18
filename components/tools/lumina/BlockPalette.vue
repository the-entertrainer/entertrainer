<script setup lang="ts">
import type { LuminaBlockKind } from '~/types/lumina'
import { LUMINA_GROUPS, LUMINA_KINDS, LUMINA_KIND_ORDER } from '~/utils/luminaBlocks'

// Desktop: a slim dock on the left edge. Mobile: rendered inside a bottom
// sheet as a two-column grid. Grouped the way authors think, with a search
// box so the thirty-odd blocks stay one keystroke away.
defineProps<{ sheet?: boolean }>()
const emit = defineEmits<{ add: [kind: LuminaBlockKind] }>()

const query = ref('')
const q = computed(() => query.value.trim().toLowerCase())

function kindsOf(group: string): LuminaBlockKind[] {
  return LUMINA_KIND_ORDER.filter((k) => {
    if (LUMINA_KINDS[k].group !== group) return false
    if (!q.value) return true
    const m = LUMINA_KINDS[k]
    return m.label.toLowerCase().includes(q.value) || m.hint.toLowerCase().includes(q.value)
  })
}
const visibleGroups = computed(() => LUMINA_GROUPS.filter(g => kindsOf(g.id).length))
</script>

<template>
  <div class="lpal" :class="{ 'lpal--sheet': sheet }">
    <div class="lpal__search">
      <input v-model="query" class="lpal__search-input" type="search" placeholder="Search blocks…" aria-label="Search blocks">
    </div>

    <template v-for="g in visibleGroups" :key="g.id">
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

    <p v-if="!visibleGroups.length" class="lpal__empty">Nothing matches “{{ query }}”.</p>
  </div>
</template>

<style scoped>
.lpal { display: flex; flex-direction: column; gap: 4rem; width: 178rem; }
.lpal__search { padding: 2rem 4rem 6rem; position: sticky; top: 0; z-index: 1; }
.lpal__search-input {
  width: 100%;
  padding: 8rem 12rem;
  border-radius: 9rem;
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  color: var(--color-text);
  font: inherit;
  font-size: 12rem;
  outline: none;
  transition: border-color 0.15s ease;
}
.lpal__search-input:focus { border-color: var(--color-glass-border-hover); }
.lpal__search-input::placeholder { opacity: 0.5; }
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
  transition: background 0.15s ease, transform 0.08s ease;
}
@media (hover: hover) {
  .lpal__item:hover { background: color-mix(in srgb, var(--color-bg) 60%, transparent); }
}
.lpal__item:active { transform: scale(0.98); }
.lpal__dot { width: 9rem; height: 9rem; border-radius: 3.5rem; flex-shrink: 0; box-shadow: 0 0 0 3rem color-mix(in srgb, var(--kind-fade, transparent) 0%, transparent); }
.lpal__text { display: flex; flex-direction: column; gap: 2rem; min-width: 0; }
.lpal__text strong { font-size: 12.5rem; font-weight: 600; letter-spacing: -0.01em; }
.lpal__text small { font-size: 10.5rem; opacity: 0.55; line-height: 1.3; }
.lpal__empty { font-size: 12rem; opacity: 0.55; padding: 10rem 8rem; }

/* Bottom-sheet mode: a roomier grid with hints visible */
.lpal--sheet { width: 100%; }
.lpal--sheet .lpal__search { position: static; padding-bottom: 10rem; }
.lpal--sheet .lpal__search-input { padding: 12rem 14rem; font-size: 16px; }
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
