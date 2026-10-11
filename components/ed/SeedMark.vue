<script setup lang="ts">
import { seedOfLife } from '~/utils/sacredGeometry'

/**
 * The Seed of Life, drawn with one compass opening.
 * Circle 0 is the still point (ink). Circles 1–6 are the six movements (accent).
 * Use this anywhere a mark, a loader, or an opening needs the same figure.
 */
const props = withDefaults(defineProps<{
  /** Drawn size in px. This site's rem is a pixel. */
  size?: number
  /** How many circles are visible, from the still point outward. 7 is the flower. */
  revealed?: number
  /** Slow turn, for a loading state. */
  spin?: boolean
  /** Stroke in viewBox units. Heavier when the mark is small. */
  stroke?: number
}>(), {
  size: 34,
  revealed: 7,
  spin: false,
  stroke: 1.6
})

const circles = seedOfLife(50, 50, 16)
</script>

<template>
  <svg
    class="seed"
    :class="{ 'seed--spin': spin }"
    :style="{ '--seed-stroke': stroke }"
    :width="size"
    :height="size"
    viewBox="0 0 100 100"
    aria-hidden="true"
  >
    <circle
      v-for="(c, i) in circles"
      v-show="i < revealed"
      :key="i"
      :cx="c.cx"
      :cy="c.cy"
      :r="c.r"
      :class="{ 'is-center': i === 0 }"
    />
  </svg>
</template>

<style scoped>
.seed {
  display: block;
  overflow: visible;
  flex: none;
}
.seed circle {
  fill: none;
  stroke: var(--accent);
  stroke-width: var(--seed-stroke, 1.6);
}
.seed circle.is-center { stroke: var(--ink); }
.seed--spin {
  transform-origin: 50% 50%;
  animation: seed-turn 2.8s linear infinite;
}
@keyframes seed-turn { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .seed--spin { animation: none; }
}
:global(html[data-reduce-motion="on"]) .seed--spin { animation: none; }
</style>
