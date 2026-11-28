<script setup lang="ts">
/**
 * Entertrainer identity (brand relaunch, Nov 2026).
 * The mark is the sun with a hand-drawn lowercase e: one sacred-yellow disc,
 * one ink stroke. The word is live lowercase Fraunces. The e is a path so a
 * parent `text-transform: uppercase` can never force a capital E.
 */
withDefaults(defineProps<{
  /** `full` combines the mark and the word; `mark` is used in tight spaces. */
  variant?: 'full' | 'mark'
  /** Cap-height target in pixels. */
  size?: number
}>(), { variant: 'full', size: 34 })
</script>

<template>
  <span class="wm" :class="`wm--${variant}`" :style="{ '--wm-size': size + 'rem' }">
    <svg class="wm__mark" viewBox="0 0 48 48" aria-hidden="true">
      <circle class="wm__sun" cx="24" cy="24" r="23" />
      <path class="wm__e" d="M14.5 24.6 H33.4 c0 -5.7 -4.1 -10.3 -9.3 -10.3 s-9.7 4.6 -9.7 10.3 4.4 10.3 9.7 10.3 c3.3 0 6 -1.4 7.8 -3.8" />
    </svg>
    <span v-if="variant === 'full'" class="wm__word">entertrainer</span>
    <span v-else class="sr-only">Entertrainer</span>
  </span>
</template>

<style scoped>
.wm {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--wm-size) * .24);
  line-height: 1;
  color: var(--ink);
  text-transform: none;
}
.wm__mark {
  display: block;
  width: calc(var(--wm-size) * .96);
  height: calc(var(--wm-size) * .96);
  flex: none;
  overflow: visible;
  animation: wm-mark-arrive 520ms var(--ease-spring) both;
  text-transform: none;
}
.wm__sun { fill: var(--br-sun, #FFD43B); }
.wm__e { fill: none; stroke: #12110F; stroke-width: 4.2; stroke-linecap: round; stroke-linejoin: round; }
.wm__word {
  font-family: var(--font-display);
  font-size: calc(var(--wm-size) * 1.06);
  font-weight: 400;
  font-variation-settings: "opsz" 144, "SOFT" 30, "WONK" 1;
  letter-spacing: -.045em;
  text-transform: lowercase;
  animation: wm-word-arrive 520ms var(--ease-out) 180ms both;
}
.wm--mark { gap: 0; }
@keyframes wm-mark-arrive { from { opacity:0; transform:scale(.82) rotate(-8deg); } to { opacity:1; transform:none; } }
@keyframes wm-word-arrive { from { opacity: 0; transform: translateX(-3rem); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .wm__mark, .wm__word { animation: none; } }
:global(html[data-reduce-motion="on"]) .wm__mark,
:global(html[data-reduce-motion="on"]) .wm__word { animation: none; }
</style>
