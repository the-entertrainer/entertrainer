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
}>(), { accent: 'var(--yellow)' })
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
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-m);
  padding: 1.25rem 1.375rem;
  
  /* A hair off square, the way something pinned to a board actually hangs.
     One degree — enough to notice, not enough to look broken. */
  rotate: -0.7deg;
}
/* The pin. Drawn, not an emoji: an emoji is a font-dependent lottery. */
.note::before {
  content: '';
  position: absolute; top: -0.6875rem; left: 1.5rem;
  width: 1.25rem; height: 1.25rem; border-radius: 50%;
  background: var(--accent);
  border: var(--stroke) solid var(--line);
}
.note__label { margin: 0 0 0.5rem; color: var(--muted); }
.note__body { font-size: 1.0625rem; line-height: 1.5; }
.note__body :deep(p) { margin: 0 0 0.625rem; }
.note__body :deep(p:last-child) { margin-bottom: 0; }

@media (prefers-reduced-motion: reduce) { .note { rotate: none; } }
</style>
