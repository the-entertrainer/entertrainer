<script setup lang="ts">
/**
 * Elevate reading note. The short spine beside an essay, often "Hold this."
 * Wide: sticky card in the left gutter, beside the measure, not over the text.
 * Narrow: one quiet line. The rest stays behind that control and does not follow the scroll.
 */
withDefaults(defineProps<{
  label?: string
}>(), { label: 'Hold this.' })

const fold = ref<HTMLDetailsElement | null>(null)
let detach = () => {}

function syncOpen() {
  const details = fold.value
  if (!details || !import.meta.client) return
  details.open = window.matchMedia('(min-width: 1120px)').matches
}

onMounted(() => {
  syncOpen()
  const mq = window.matchMedia('(min-width: 1120px)')
  const onChange = () => syncOpen()
  mq.addEventListener('change', onChange)
  detach = () => mq.removeEventListener('change', onChange)
})

onBeforeUnmount(() => detach())
</script>

<template>
  <aside class="margin-note taj__margin-note ca__margin-note" aria-label="Reading note">
    <div class="margin-note__inner">
      <details ref="fold" class="margin-note__details">
        <summary class="margin-note__summary">{{ label }}</summary>
        <div class="margin-note__body">
          <slot />
        </div>
      </details>
    </div>
  </aside>
</template>

<style scoped>
.margin-note {
  position: static;
  max-width: var(--measure);
  margin: 0 0 var(--space-8);
  padding: 0;
  background: transparent;
  border: 0;
  color: var(--ink);
  font: 400 var(--type-body)/1.45 var(--font-body);
}
.margin-note__summary {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8rem;
  min-height: 44rem;
  margin: 0;
  padding: 0;
  color: var(--ink-soft);
  cursor: pointer;
  list-style: none;
  font: 500 var(--type-meta)/1.2 var(--font-mono);
  letter-spacing: .1em;
  text-transform: uppercase;
}
.margin-note__summary::-webkit-details-marker { display: none; }
.margin-note__summary::after {
  content: "+";
  margin-left: auto;
  color: var(--ink);
  font: 500 var(--type-body)/1 var(--font-mono);
  letter-spacing: 0;
  text-transform: none;
}
.margin-note__details[open] > .margin-note__summary::after { content: "\2212"; }
.margin-note__body { margin: 0 0 var(--space-13); }
.margin-note__body :deep(p) { margin: 0; }

@media (min-width: 1120px) {
  .margin-note {
    grid-column: 1;
    grid-row: 1;
    align-self: stretch;
    width: auto;
    max-width: none;
    margin: 0;
  }
  .margin-note__inner {
    position: sticky;
    top: calc(var(--nav-h, 55rem) + 16rem);
    width: min(176rem, calc(var(--shell-gutter) - 28rem));
    margin-left: auto;
    margin-right: 16rem;
    padding: var(--space-13);
    background: var(--accent);
    color: var(--accent-ink);
    border: var(--stroke) solid var(--ink);
  }
  .margin-note__summary {
    min-height: 0;
    color: inherit;
    cursor: default;
    pointer-events: none;
  }
  .margin-note__summary::after,
  .margin-note__details[open] > .margin-note__summary::after { content: none; }
  /* A closed details element hides its body. The wide spine stays readable anyway. */
  .margin-note__details > .margin-note__body { display: block !important; }
  .margin-note__body { margin: 10rem 0 0; }
}
</style>

<style>
@media (min-width: 1120px) {
  .taj__article:has(> .margin-note),
  .ca__article:has(> .margin-note) {
    display: grid !important;
    grid-template-columns: var(--shell-gutter) minmax(0, var(--measure)) minmax(0, 1fr);
    padding-left: 0 !important;
    column-gap: 0;
    align-items: stretch;
  }
  .taj__article:has(> .margin-note) > .taj__prose,
  .ca__article:has(> .margin-note) > .ca__prose {
    grid-column: 2;
    grid-row: 1;
    min-width: 0;
  }
}
</style>
