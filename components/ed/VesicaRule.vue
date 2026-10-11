<script setup lang="ts">
import { firstCircle, secondCircle } from '~/utils/sacredGeometry'

/**
 * A straight line through a vesica.
 * The line is the male move. The two circles are the female move.
 * One radius apart, same as the film's second circle.
 */
const first = firstCircle(10, 12, 9)
const second = secondCircle(first, 0)
</script>

<template>
  <div class="vesica-rule" aria-hidden="true">
    <span class="vesica-rule__line" />
    <svg class="vesica-rule__mark" viewBox="0 0 32 24">
      <circle :cx="first.cx" :cy="first.cy" :r="first.r" class="is-center" />
      <circle :cx="second.cx" :cy="second.cy" :r="second.r" />
    </svg>
  </div>
</template>

<style scoped>
.vesica-rule {
  position: relative;
  height: 24rem;
  width: 100%;
}
.vesica-rule__line {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: var(--ink);
}
.vesica-rule__mark {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 36rem;
  height: 24rem;
  transform: translate(-50%, -50%);
  overflow: visible;
  background: var(--paper);
}
.vesica-rule__mark circle {
  fill: none;
  stroke: var(--accent);
  stroke-width: 1.4;
}
.vesica-rule__mark circle.is-center { stroke: var(--ink); }
</style>
