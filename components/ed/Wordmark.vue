<script setup lang="ts">
/**
 * Entertrainer identity system.
 * The compact five-bar signal is derived from the violet-to-blue vertical bands
 * in the original preloader logo. It gives the old identity a usable mark for
 * a paper-and-ink publication without importing its full-screen gradient into
 * every page. The lower-case word remains live text for accessibility. The
 * mark itself has a brief five-bar signal cycle: enough motion to be a living
 * brand sign, never a looping distraction from the surrounding navigation.
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
.wm__signal { position: relative; display: inline-flex; align-items: stretch; gap: calc(var(--wm-size) * .055); height: calc(var(--wm-size) * .9); padding: calc(var(--wm-size) * .08); overflow: hidden; background: var(--ink); border-radius: calc(var(--wm-size) * .16); }
.wm__signal::after { position: absolute; inset: 0; content: ''; background: linear-gradient(110deg, transparent 34%, rgb(255 255 255 / .24) 48%, transparent 62%); transform: translateX(-125%); animation: wm-signal-sweep 7.2s var(--ease-out) 980ms infinite; }
.wm__signal i { --wm-enter-delay: 0ms; --wm-cycle-delay: 0ms; position: relative; z-index: 1; display: block; width: calc(var(--wm-size) * .105); border-radius: calc(var(--wm-size) * .05); background: #4e28d8; transform-origin: center bottom; animation: wm-bar-enter 460ms var(--ease-spring) var(--wm-enter-delay) both, wm-bar-signal 5.8s var(--ease-in-out) calc(1160ms + var(--wm-cycle-delay)) infinite; }
.wm__signal i:nth-child(2) { --wm-enter-delay: 55ms; --wm-cycle-delay: 115ms; background: #6458e4; }.wm__signal i:nth-child(3) { --wm-enter-delay: 110ms; --wm-cycle-delay: 230ms; background: #5d79e9; }.wm__signal i:nth-child(4) { --wm-enter-delay: 165ms; --wm-cycle-delay: 345ms; background: #5299e8; }.wm__signal i:nth-child(5) { --wm-enter-delay: 220ms; --wm-cycle-delay: 460ms; background: #8bc5f2; }
.wm__word { font-family: var(--font-ui); font-size: var(--wm-size); font-weight: 720; letter-spacing: -.055em; text-transform: lowercase; animation: wm-word-arrive 520ms var(--ease-out) 180ms both; }
.wm--mark { gap: 0; }
@keyframes wm-bar-enter { from { opacity: 0; transform: translateY(4rem) scaleY(.52); } to { opacity: 1; transform: translateY(0) scaleY(1); } }
@keyframes wm-bar-signal { 0%, 67%, 100% { transform: translateY(0) scaleY(1); } 73% { transform: translateY(-1rem) scaleY(1.08); } 79% { transform: translateY(1rem) scaleY(.94); } 85% { transform: translateY(0) scaleY(1); } }
@keyframes wm-signal-sweep { 0%, 77%, 100% { transform: translateX(-125%); } 89% { transform: translateX(125%); } }
@keyframes wm-word-arrive { from { opacity: 0; transform: translateX(-3rem); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .wm__signal::after, .wm__signal i, .wm__word { animation: none; } }
</style>
