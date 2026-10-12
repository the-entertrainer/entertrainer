<script setup lang="ts">
/**
 * Entertrainer identity system.
 * The mark is the yellow seal with a compass-built lowercase "e" (see
 * utils/sacredGeometry.ts → eMark and components/ed/Mark.vue). It is the same
 * figure the preloader constructs. The lower-case word remains live text.
 * The mark is an SVG path, so a parent `text-transform: uppercase` can never
 * force a capital E — a hard brand requirement.
 */
withDefaults(defineProps<{
  /** `full` combines the compact mark and clean text word; `mark` is used in tight spaces. */
  variant?: 'full' | 'mark'
  /** Cap-height target in pixels. The mark scales from the same value. */
  size?: number
  /** Gentle one-time arrival. BookReader passes false. */
  animate?: boolean
}>(), { variant: 'full', size: 34, animate: true })
</script>

<template>
  <span class="wm" :class="[`wm--${variant}`, { 'wm--still': !animate }]" :style="{ '--wm-size': size + 'rem' }">
    <EdMark class="wm__mark" :size="Math.round(size * 0.86)" />
    <span v-if="variant === 'full'" class="wm__word">entertrainer</span>
    <span v-else class="sr-only">Entertrainer</span>
  </span>
</template>

<style scoped>
.wm {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--wm-size) * .236);
  line-height: 1;
  color: var(--ink);
  text-transform: none;
}
.wm__mark {
  width: calc(var(--wm-size) * .86);
  height: calc(var(--wm-size) * .86);
  animation: wm-arrive 420ms var(--ease-out) both;
}
.wm__word {
  font-family: var(--font-ui);
  font-size: var(--wm-size);
  font-weight: 720;
  letter-spacing: -.055em;
  text-transform: lowercase;
  animation: wm-arrive 420ms var(--ease-out) 120ms both;
}
.wm--mark { gap: 0; }
.wm--still .wm__mark, .wm--still .wm__word { animation: none; }
@keyframes wm-arrive { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .wm__mark, .wm__word { animation: none; } }
</style>

<style>
html[data-reduce-motion="on"] .wm__mark,
html[data-reduce-motion="on"] .wm__word { animation: none; }
</style>
