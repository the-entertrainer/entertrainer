<script setup lang="ts">
/**
 * A pinned editorial aside — the hand-written voice in the margin. Used for
 * staff-note interludes and for the one-sentence remarks that would be a
 * footnote in print.
 */
withDefaults(defineProps<{
  label?: string
  /** Which accent pins it. Defaults to the highlighter yellow. */
  accent?: string
}>(), { accent: 'var(--sun)' })
</script>

<template>
  <aside class="note" :style="{ '--accent': accent }">
    <p v-if="label" class="t-mono note__label">{{ label }}</p>
    <div class="note__body t-hand"><slot /></div>
  </aside>
</template>

<style scoped>
.note {
  position: relative;
  background: var(--paper);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  padding: 20rem 22rem;
  box-shadow: 5rem 5rem 0 var(--ink);
  /* A hair off square, the way something pinned to a board actually hangs.
     One degree — enough to notice, not enough to look broken. */
  rotate: -0.7deg;
}
/* The pin. Drawn, not an emoji: an emoji is a font-dependent lottery. */
.note::before {
  content: '';
  position: absolute; top: -11rem; left: 24rem;
  width: 20rem; height: 20rem; border-radius: 50%;
  background: var(--accent);
  border: var(--stroke) solid var(--ink);
}
.note__label { margin: 0 0 8rem; color: var(--muted); }
.note__body { font-size: 17rem; line-height: 1.5; }
.note__body :deep(p) { margin: 0 0 10rem; }
.note__body :deep(p:last-child) { margin-bottom: 0; }

@media (prefers-reduced-motion: reduce) { .note { rotate: none; } }
</style>
