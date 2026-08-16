<script setup lang="ts">
/**
 * Entertrainer identity system.
 * The compact five-bar signal is derived from the violet-to-blue vertical bands
 * in the original preloader logo. It gives the old identity a usable mark for
 * a paper-and-ink publication without importing its full-screen gradient into
 * every page. The lower-case word remains live text for accessibility.
 */
withDefaults(defineProps<{
  /** `full` combines the signal and word; `mark` is used in tight spaces. */
  variant?: 'full' | 'mark'
  /** Cap-height target in pixels. The signal scales from the same value. */
  size?: number
}>(), { variant: 'full', size: 30 })
</script>

<template>
  <span class="wm" :class="`wm--${variant}`" :style="{ '--wm-size': size + 'rem' }">
    <span class="wm__signal" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
    <span v-if="variant === 'full'" class="wm__word">entertrainer</span>
    <span v-else class="sr-only">Entertrainer</span>
  </span>
</template>

<style scoped>
.wm { display: inline-flex; align-items: center; gap: calc(var(--wm-size) * .22); line-height: 1; color: var(--ink); }
.wm__signal { display: inline-flex; align-items: stretch; gap: calc(var(--wm-size) * .055); height: calc(var(--wm-size) * .9); padding: calc(var(--wm-size) * .08); background: var(--ink); border-radius: calc(var(--wm-size) * .16); }
.wm__signal i { display: block; width: calc(var(--wm-size) * .105); border-radius: calc(var(--wm-size) * .05); background: #4e28d8; animation: wm-bar-enter 120ms var(--ease-out) both; }
.wm__signal i:nth-child(2) { background: #6458e4; }.wm__signal i:nth-child(3) { background: #5d79e9; }.wm__signal i:nth-child(4) { background: #5299e8; }.wm__signal i:nth-child(5) { background: #8bc5f2; }
.wm__signal i:nth-child(2) { animation-delay: 35ms; }.wm__signal i:nth-child(3) { animation-delay: 70ms; }.wm__signal i:nth-child(4) { animation-delay: 105ms; }.wm__signal i:nth-child(5) { animation-delay: 140ms; }
.wm__word { font-family: var(--font-ui); font-size: var(--wm-size); font-weight: 720; letter-spacing: -.055em; text-transform: lowercase; }
.wm--mark { gap: 0; }
@keyframes wm-bar-enter { from { opacity: 0; transform: translateY(4rem); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .wm__signal i { animation: none; } }
</style>
