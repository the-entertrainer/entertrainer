<script setup lang="ts">
import { figureCircles, metatronLines, type GeometryFigure } from '~/utils/sacredGeometry'

/**
 * One of the film's figures, large enough to open a section.
 * Centers come from the compass module. The accent is one circle only.
 */
const props = withDefaults(defineProps<{
  figure?: GeometryFigure
}>(), { figure: 'seed' })

const circles = computed(() => figureCircles(props.figure))
const lines = computed(() =>
  props.figure === 'metatron' ? metatronLines(circles.value) : []
)
</script>

<template>
  <svg class="geom" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <g transform="translate(690 210)">
      <line
        v-for="(ln, i) in lines"
        :key="`l${i}`"
        class="geom__line"
        :x1="ln.x1"
        :y1="ln.y1"
        :x2="ln.x2"
        :y2="ln.y2"
        pathLength="100"
      />
      <circle
        v-for="(c, i) in circles"
        :key="`c${i}`"
        :cx="c.cx"
        :cy="c.cy"
        :r="c.r"
        :class="{ 'is-center': i === 0, 'is-move': i === 1 }"
        pathLength="100"
        :style="{ '--geom-delay': `${i * 70}ms` }"
      />
    </g>
  </svg>
</template>

<style scoped>
.geom {
  display: block;
  width: 100%;
  height: 100%;
}
.geom__line,
.geom circle {
  fill: none;
  stroke-linecap: round;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: geom-draw 900ms var(--ease-out) var(--geom-delay, 0ms) forwards;
}
.geom__line {
  stroke: var(--ink);
  stroke-width: 0.6;
  opacity: 0.35;
}
.geom circle {
  stroke: color-mix(in srgb, var(--ink) 55%, transparent);
  stroke-width: 1.35;
}
.geom circle.is-center { stroke: var(--ink); stroke-width: 1.8; }
.geom circle.is-move { stroke: var(--accent); stroke-width: 1.8; }
@keyframes geom-draw { to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) {
  .geom__line, .geom circle { animation: none; stroke-dashoffset: 0; }
}
:global(html[data-reduce-motion="on"]) .geom__line,
:global(html[data-reduce-motion="on"]) .geom circle {
  animation: none;
  stroke-dashoffset: 0;
}
</style>
