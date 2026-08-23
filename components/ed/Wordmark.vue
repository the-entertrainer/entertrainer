<script setup lang="ts">
/**
 * Entertrainer identity system.
 * The compact e-and-rings mark follows the selected warm-yellow identity system.
 * It gives the current wordmark a usable mark for a paper-and-ink publication
 * without placing a large circle treatment behind the live text. The lower-case
 * word remains live text for accessibility. The mark enters once; it never loops while a reader is
 * navigating, so the identity remains recognisable without becoming scenery.
 */
withDefaults(defineProps<{
  /** `full` combines the compact mark and clean text word; `mark` is used in tight spaces. */
  variant?: 'full' | 'mark'
  /** Cap-height target in pixels. The signal scales from the same value. */
  size?: number
}>(), { variant: 'full', size: 30 })
</script>

<template>
  <span class="wm" :class="`wm--${variant}`" :style="{ '--wm-size': size + 'rem' }">
    <svg class="wm__mark" viewBox="0 0 240 240" aria-hidden="true">
      <circle class="wm__ring" cx="120" cy="120" r="94" />
      <circle class="wm__ring" cx="120" cy="120" r="62" />
      <circle class="wm__ring" cx="120" cy="120" r="30" />
      <text class="wm__e" x="120" y="158" text-anchor="middle">e</text>
    </svg>
    <span v-if="variant === 'full'" class="wm__word">entertrainer</span>
    <span v-else class="sr-only">Entertrainer</span>
  </span>
</template>

<style scoped>
.wm { display: inline-flex; align-items: center; gap: calc(var(--wm-size) * .24); line-height: 1; color: var(--ink); }
.wm__mark { display:block; width:calc(var(--wm-size) * .96); height:calc(var(--wm-size) * .96); flex:none; overflow:visible; animation:wm-mark-arrive 520ms var(--ease-spring) both; }
.wm__ring { fill:none; stroke:var(--accent); stroke-width:18; }
.wm__e { fill:var(--ink); font-family:var(--font-ui), Arial, sans-serif; font-size:144rem; font-weight:900; letter-spacing:-.1em; }
.wm__word { font-family: var(--font-ui); font-size: var(--wm-size); font-weight: 720; letter-spacing: -.055em; text-transform: lowercase; animation: wm-word-arrive 520ms var(--ease-out) 180ms both; }
.wm--mark { gap: 0; }
@keyframes wm-mark-arrive { from { opacity:0; transform:scale(.82) rotate(-8deg); } to { opacity:1; transform:none; } }
@keyframes wm-word-arrive { from { opacity: 0; transform: translateX(-3rem); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .wm__mark, .wm__word { animation: none; } }
</style>
