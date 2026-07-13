<script setup lang="ts">
import gsap from 'gsap'
import { REFERENCE_CURVE, diagonalPath, smoothPath, toPx, type ChartFrame } from '~/utils/confidenceTrap/chartMath'

const props = defineProps<{ confidence: number; accuracy: number }>()

const frame: ChartFrame = { width: 420, height: 320, marginLeft: 52, marginRight: 24, marginTop: 20, marginBottom: 48 }

const curveD = smoothPath(REFERENCE_CURVE, frame)
const diagD = diagonalPath(frame)
const point = computed(() => toPx(frame, props.accuracy, props.confidence))
const origin = computed(() => toPx(frame, 0, 0))

const curvePath = ref<SVGPathElement | null>(null)
const diagPath = ref<SVGPathElement | null>(null)
const connector = ref<SVGLineElement | null>(null)
const dot = ref<SVGCircleElement | null>(null)

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || !curvePath.value || !diagPath.value || !connector.value || !dot.value) return

  const curveLen = curvePath.value.getTotalLength()
  const diagLen = diagPath.value.getTotalLength()
  gsap.set(curvePath.value, { strokeDasharray: curveLen, strokeDashoffset: curveLen })
  gsap.set(diagPath.value, { strokeDasharray: diagLen, strokeDashoffset: diagLen })
  gsap.set(dot.value, { opacity: 0, scale: 0.4, transformOrigin: 'center' })

  const start = origin.value
  const end = point.value
  const tl = gsap.timeline({ delay: 0.2 })
  tl.to(diagPath.value, { strokeDashoffset: 0, duration: 0.6, ease: 'power1.out' })
    .to(curvePath.value, { strokeDashoffset: 0, duration: 0.9, ease: 'power1.out' }, '-=0.2')
    .set(connector.value, { attr: { x2: start.x, y2: start.y } })
    .to(dot.value, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' })
    .to(connector.value, {
      duration: 1.1,
      ease: 'power2.out',
      attr: { x2: end.x, y2: end.y },
      onUpdate: () => {
        if (!dot.value || !connector.value) return
        dot.value.setAttribute('cx', connector.value.getAttribute('x2') || String(end.x))
        dot.value.setAttribute('cy', connector.value.getAttribute('y2') || String(end.y))
      }
    }, '-=0.15')
})
</script>

<template>
  <figure class="ct-chart">
    <svg :viewBox="`0 0 ${frame.width} ${frame.height}`" class="ct-chart__svg" role="img"
      :aria-label="`Chart plotting your average confidence of ${Math.round(confidence)} percent against your actual accuracy of ${Math.round(accuracy)} percent, with a reference line for perfect calibration and a reference curve for the typical reported pattern.`">
      <!-- Axes -->
      <line :x1="frame.marginLeft" :y1="frame.marginTop" :x2="frame.marginLeft" :y2="frame.height - frame.marginBottom" class="ct-chart__axis" />
      <line :x1="frame.marginLeft" :y1="frame.height - frame.marginBottom" :x2="frame.width - frame.marginRight" :y2="frame.height - frame.marginBottom" class="ct-chart__axis" />

      <text :x="(frame.width) / 2" :y="frame.height - 8" class="ct-chart__axis-label" text-anchor="middle">Accuracy</text>
      <text :x="14" :y="(frame.height) / 2" class="ct-chart__axis-label" text-anchor="middle" :transform="`rotate(-90 14 ${(frame.height) / 2})`">Confidence</text>

      <!-- Reference: perfect calibration diagonal -->
      <path ref="diagPath" :d="diagD" class="ct-chart__diagonal" />
      <!-- Reference: illustrative reported pattern -->
      <path ref="curvePath" :d="curveD" class="ct-chart__curve" />

      <!-- Learner's point, drawn in with a trailing connector -->
      <line ref="connector" :x1="origin.x" :y1="origin.y" :x2="origin.x" :y2="origin.y" class="ct-chart__connector" />
      <circle ref="dot" :cx="point.x" :cy="point.y" r="7" class="ct-chart__dot" />
    </svg>

    <figcaption class="ct-chart__legend">
      <span class="ct-chart__legend-item"><i class="ct-chart__swatch ct-chart__swatch--diag" />Perfect calibration</span>
      <span class="ct-chart__legend-item"><i class="ct-chart__swatch ct-chart__swatch--curve" />Typical reported pattern (illustrative)</span>
      <span class="ct-chart__legend-item"><i class="ct-chart__swatch ct-chart__swatch--dot" />You</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.ct-chart { width: 100%; max-width: 460rem; margin: 0 auto; }
.ct-chart__svg { width: 100%; height: auto; }
.ct-chart__axis { stroke: var(--ct-border); stroke-width: 1; }
.ct-chart__axis-label {
  font-family: var(--ct-sans);
  font-size: 11px;
  fill: var(--ct-secondary);
}
.ct-chart__diagonal {
  fill: none;
  stroke: var(--ct-border);
  stroke-width: 1.5;
  stroke-dasharray: 4 4;
}
.ct-chart__curve {
  fill: none;
  stroke: var(--ct-secondary);
  stroke-width: 2;
}
.ct-chart__connector {
  stroke: var(--ct-accent);
  stroke-width: 1.5;
  opacity: 0.5;
}
.ct-chart__dot {
  fill: var(--ct-bone);
  stroke: var(--ct-accent);
  stroke-width: 3;
}
.ct-chart__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16rem 20rem;
  justify-content: center;
  margin-top: 16rem;
}
.ct-chart__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 7rem;
  font-family: var(--ct-sans);
  font-size: 12.5rem;
  color: var(--ct-secondary);
}
.ct-chart__swatch { width: 14rem; height: 2px; display: inline-block; }
.ct-chart__swatch--diag { background: var(--ct-border); }
.ct-chart__swatch--curve { background: var(--ct-secondary); }
.ct-chart__swatch--dot { width: 8rem; height: 8rem; border-radius: 50%; background: var(--ct-bone); border: 2px solid var(--ct-accent); }
</style>
