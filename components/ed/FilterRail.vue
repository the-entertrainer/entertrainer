<script setup lang="ts">
import { CATEGORIES, type Category } from '~/content/editorial'

/**
 * The filter rail.
 *
 * Radio semantics, not a row of toggle buttons: exactly one filter is active
 * at a time, so the group is a radiogroup and arrow keys move between the
 * options the way they do in every other radio group on the web. Each chip
 * carries its count, because a filter that leads to an empty field is a filter
 * nobody should have been offered.
 */
const model = defineModel<Category | 'all'>({ default: 'all' })

const props = defineProps<{ counts: Record<string, number> }>()

const options = computed(() => [
  { id: 'all' as const, label: 'Everything', accent: 'var(--ink)', onAccent: 'var(--paper)' },
  ...CATEGORIES.filter(c => (props.counts[c.id] ?? 0) > 0)
])

const total = computed(() => Object.values(props.counts).reduce((a, b) => a + b, 0))
const countFor = (id: string) => id === 'all' ? total.value : (props.counts[id] ?? 0)

const rail = ref<HTMLElement | null>(null)
function onKeydown(e: KeyboardEvent, i: number) {
  const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']
  if (!keys.includes(e.key)) return
  e.preventDefault()
  const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1
  const next = (i + dir + options.value.length) % options.value.length
  model.value = options.value[next].id as Category | 'all'
  nextTick(() => rail.value?.querySelectorAll<HTMLButtonElement>('.fr__chip')[next]?.focus())
}
</script>

<template>
  <div class="fr" ref="rail" role="radiogroup" aria-label="Filter by section">
    <button
      v-for="(o, i) in options" :key="o.id"
      type="button" class="fr__chip"
      role="radio" :aria-checked="model === o.id"
      :tabindex="model === o.id ? 0 : -1"
      :style="{ '--accent': o.accent, '--on-accent': o.onAccent }"
      @click="model = o.id as Category | 'all'"
      @keydown="onKeydown($event, i)"
    >
      <span class="fr__dot" aria-hidden="true" />
      <span>{{ o.label }}</span>
      <span class="fr__n">{{ countFor(o.id) }}</span>
    </button>
  </div>
</template>

<style scoped>
.fr {
  display: flex; flex-wrap: wrap; gap: 8rem;
  padding: 16rem 0;
}
.fr__chip {
  display: inline-flex; align-items: center; gap: 8rem;
  min-height: 40rem; padding: 8rem 14rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-full);
  background: var(--paper); color: var(--ink);
  font-family: var(--font-mono); font-size: var(--type-meta); font-weight: 600;
  letter-spacing: var(--tracking-meta); text-transform: uppercase;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .fr__chip:hover { background: var(--paper-2); } }
.fr__dot { width: 9rem; height: 9rem; border-radius: 50%; background: var(--accent); border: 1px solid var(--ink); flex: none; }
.fr__n { color: var(--muted); font-variant-numeric: tabular-nums; }

.fr__chip[aria-checked="true"] {
  background: var(--accent); color: var(--on-accent);
  border-color: var(--ink);
}
.fr__chip[aria-checked="true"] .fr__dot { background: var(--on-accent); }
.fr__chip[aria-checked="true"] .fr__n { color: inherit; opacity: 0.7; }
</style>
