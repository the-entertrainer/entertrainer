<script setup lang="ts">
import { eMark } from '~/utils/sacredGeometry'

/**
 * The Entertrainer mark: a yellow seal with the compass-built "e".
 * Geometry lives in utils/sacredGeometry.ts (eMark). Paths only — no bound
 * cx/cy/r — so Vue never tries to set read-only SVG DOM props.
 */
withDefaults(defineProps<{
  /** Drawn size in px. This site's rem is a pixel. */
  size?: number
  /** Loading state: the e redraws itself, slowly, on the seal. */
  loading?: boolean
}>(), { size: 34, loading: false })

const M = eMark(50, 50, 50)
</script>

<template>
  <svg
    class="mark"
    :class="{ 'mark--loading': loading }"
    :width.attr="size"
    :height.attr="size"
    viewBox="0 0 100 100"
    aria-hidden="true"
    focusable="false"
  >
    <circle class="mark__seal" cx="50" cy="50" r="50" />
    <path
      class="mark__e"
      :d="M.e"
      :stroke-width="size < 24 ? M.stroke * 1.15 : M.stroke"
      pathLength="1"
    />
  </svg>
</template>

<style scoped>
.mark { display: block; flex: none; }
.mark__seal { fill: var(--accent, #FFD43B); }
.mark__e {
  fill: none;
  stroke: var(--accent-ink, #161618);
  stroke-linejoin: miter;
  stroke-linecap: butt;
}
.mark--loading .mark__e {
  stroke-dasharray: 1;
  animation: mark-draw 1.6s cubic-bezier(.65, 0, .35, 1) infinite alternate;
}
@keyframes mark-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) { .mark--loading .mark__e { animation: none; } }
</style>

<style>
html[data-reduce-motion="on"] .mark--loading .mark__e { animation: none; }
</style>
