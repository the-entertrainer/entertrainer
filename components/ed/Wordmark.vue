<script setup lang="ts">
/**
 * Entertrainer identity system.
   * The compact five-bar signal now follows the selected warm-yellow identity system.
   * It gives the current wordmark a usable mark for
 * a paper-and-ink publication without importing its full-screen gradient into
 * every page. The lower-case word remains live text for accessibility. The
 * mark itself has a single five-bar entrance. It never loops while a reader is
 * navigating, so the identity remains recognisable without becoming scenery.
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
.wm__signal { position: relative; display: inline-flex; align-items: stretch; gap: calc(var(--wm-size) * .055); height: calc(var(--wm-size) * .9); padding: calc(var(--wm-size) * .08); overflow: hidden; background: var(--ink); border-radius: calc(var(--wm-size) * .1); }
.wm__signal i { --wm-enter-delay: 0ms; position: relative; z-index: 1; display: block; width: calc(var(--wm-size) * .105); border-radius: calc(var(--wm-size) * .03); background: #FFF0AC; transform-origin: center bottom; animation: wm-bar-enter 460ms var(--ease-spring) var(--wm-enter-delay) both; }
.wm__signal i:nth-child(2) { --wm-enter-delay: 55ms; background: #FFE273; }.wm__signal i:nth-child(3) { --wm-enter-delay: 110ms; background: var(--accent); }.wm__signal i:nth-child(4) { --wm-enter-delay: 165ms; background: #F6C523; }.wm__signal i:nth-child(5) { --wm-enter-delay: 220ms; background: var(--accent-strong); }
.wm__word { font-family: var(--font-ui); font-size: var(--wm-size); font-weight: 720; letter-spacing: -.055em; text-transform: lowercase; animation: wm-word-arrive 520ms var(--ease-out) 180ms both; }
.wm--mark { gap: 0; }
@keyframes wm-bar-enter { from { opacity: 0; transform: translateY(4rem) scaleY(.52); } to { opacity: 1; transform: translateY(0) scaleY(1); } }
@keyframes wm-word-arrive { from { opacity: 0; transform: translateX(-3rem); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .wm__signal i, .wm__word { animation: none; } }
</style>
