<script setup lang="ts">
import { sampleTrace, tracePolyline } from '~/utils/seismo/waveform'

// A single seismogram on graph paper: the noisy trace, a time grid you can
// read seconds off, and optional P / S arrival markers. Interactivity
// (hotspots, calipers) is layered on top by the parent using the exposed
// time-to-fraction mapping, so this stays a pure, reproducible renderer.
const props = withDefaults(defineProps<{
  seed: number
  windowS: number
  pArrivalS: number
  sArrivalS: number
  showP?: boolean
  showS?: boolean
  height?: number
  gridStepS?: number
}>(), { showP: false, showS: false, height: 190, gridStepS: 4 })

const VBW = 880
const VBH = 200

const samples = computed(() => sampleTrace({
  seed: props.seed,
  windowS: props.windowS,
  pArrivalS: props.pArrivalS,
  sArrivalS: props.sArrivalS
}, VBW))

const points = computed(() => tracePolyline(samples.value, VBW, VBH, 10))

const vLines = computed(() => {
  const lines: { x: number; s: number }[] = []
  for (let s = 0; s <= props.windowS + 0.001; s += props.gridStepS) {
    lines.push({ x: (s / props.windowS) * VBW, s })
  }
  return lines
})

function timeX(t: number) { return (t / props.windowS) * VBW }
</script>

<template>
  <svg :viewBox="`0 0 ${VBW} ${VBH}`" class="sg-trace" :style="{ height: height + 'rem' }" preserveAspectRatio="none" role="img"
    :aria-label="`Seismogram. P wave arrives at ${pArrivalS.toFixed(0)} seconds${showS ? `, S wave at ${sArrivalS.toFixed(0)} seconds` : ''}.`">
    <!-- graph paper -->
    <g class="sg-trace__grid">
      <line v-for="l in vLines" :key="'v' + l.s" :x1="l.x" :y1="0" :x2="l.x" :y2="VBH" />
      <line :x1="0" :y1="VBH / 2" :x2="VBW" :y2="VBH / 2" class="sg-trace__mid" />
    </g>

    <!-- arrival markers (drawn under the trace so the wiggle stays legible) -->
    <g v-if="showP">
      <line :x1="timeX(pArrivalS)" y1="6" :x2="timeX(pArrivalS)" :y2="VBH - 6" class="sg-trace__mark sg-trace__mark--p" />
    </g>
    <g v-if="showS">
      <line :x1="timeX(sArrivalS)" y1="6" :x2="timeX(sArrivalS)" :y2="VBH - 6" class="sg-trace__mark sg-trace__mark--s" />
    </g>

    <polyline :points="points" class="sg-trace__line" />
  </svg>
</template>

<style scoped>
.sg-trace {
  display: block;
  width: 100%;
  background: var(--sg-panel);
  border-radius: 8rem;
}
.sg-trace__grid line { stroke: var(--sg-grid); stroke-width: 1; }
.sg-trace__mid { stroke: var(--sg-grid); stroke-width: 1.5; }
.sg-trace__mark { stroke-width: 2; stroke-dasharray: 3 4; }
.sg-trace__mark--p { stroke: var(--sg-p); }
.sg-trace__mark--s { stroke: var(--sg-s); }
.sg-trace__line {
  fill: none;
  stroke: var(--sg-ink);
  stroke-width: 1.4;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}
</style>
