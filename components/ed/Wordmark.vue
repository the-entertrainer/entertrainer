<script setup lang="ts">
import { seedOfLife } from '~/utils/sacredGeometry'

/**
 * Entertrainer identity system.
 * The mark is the Seed of Life: one still circle, six movements, the lowercase e
 * in the middle. Same construction as the preloader. The lower-case word remains
 * live text. The mark enters once and does not loop while a reader is navigating.
 *
 * The mark "e" is an SVG path (not <text>) so parent `text-transform: uppercase`
 * cannot force a capital E — a hard brand requirement.
 */
const seed = seedOfLife(120, 120, 46)
withDefaults(defineProps<{
  /** `full` combines the compact mark and clean text word; `mark` is used in tight spaces. */
  variant?: 'full' | 'mark'
  /** Cap-height target in pixels. The signal scales from the same value. */
  size?: number
}>(), { variant: 'full', size: 34 })
</script>

<template>
  <span class="wm" :class="`wm--${variant}`" :style="{ '--wm-size': size + 'rem' }">
    <svg class="wm__mark" viewBox="0 0 240 240" aria-hidden="true">
      <circle
        v-for="(c, i) in seed"
        :key="i"
        class="wm__ring"
        :class="{ 'wm__ring--center': i === 0 }"
        :cx="c.cx"
        :cy="c.cy"
        :r="c.r"
      />
      <!-- Bold grotesque lowercase e as path — immune to CSS text-transform -->
      <path
        class="wm__e"
        d="M169.3 115.82L169.3 124.18L100.64 124.18Q101.71 134.52 108.11 139.69Q114.5 144.86 125.99 144.86Q135.26 144.86 144.98 142.11Q154.7 139.36 164.95 133.78L164.95 156.42Q154.54 160.36 144.12 162.37Q133.7 164.38 123.28 164.38Q98.34 164.38 84.52 151.71Q70.7 139.03 70.7 116.14Q70.7 93.67 84.28 80.79Q97.85 67.91 121.64 67.91Q143.3 67.91 156.3 80.95Q169.3 94 169.3 115.82ZM139.11 106.05Q139.11 97.69 134.23 92.56Q129.35 87.43 121.48 87.43Q112.95 87.43 107.61 92.23Q102.28 97.03 100.97 106.05Z"
      />
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
.wm__ring { fill: none; stroke: var(--accent); stroke-width: 7; }
.wm__ring--center { stroke: var(--ink); }
.wm__e {
  fill: currentColor;
  text-transform: lowercase !important;
  font-variant: normal;
}
.wm__word {
  font-family: var(--font-ui);
  font-size: var(--wm-size);
  font-weight: 720;
  letter-spacing: -.055em;
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
