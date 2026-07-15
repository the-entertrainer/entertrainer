<script setup lang="ts">
import Seismogram from './Seismogram.vue'

// A two-handle caliper laid over a seismogram. The learner drags the left
// handle onto the P onset and the right onto the S onset; the span between
// them is the measured S-minus-P gap. Real measurement, real state: the span
// is emitted continuously and the parent grades what the learner actually
// set. Fully keyboard operable (each handle is a slider).
const props = withDefaults(defineProps<{
  seed: number
  windowS: number
  pArrivalS: number
  sArrivalS: number
  disabled?: boolean
}>(), { disabled: false })

const emit = defineEmits<{ span: [seconds: number] }>()

const MIN_GAP = 1
const leftT = ref(props.windowS * 0.26)
const rightT = ref(props.windowS * 0.58)
const plot = ref<HTMLElement | null>(null)
const dragging = ref<'left' | 'right' | null>(null)

const span = computed(() => Math.max(0, rightT.value - leftT.value))
watch(span, v => emit('span', v), { immediate: true })

function pctOf(t: number) { return (t / props.windowS) * 100 }

function timeFromClientX(clientX: number): number {
  if (!plot.value) return 0
  const r = plot.value.getBoundingClientRect()
  const f = Math.max(0, Math.min(1, (clientX - r.left) / r.width))
  return f * props.windowS
}

function onDown(which: 'left' | 'right', e: PointerEvent) {
  if (props.disabled) return
  dragging.value = which
  ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
}
function onMove(e: PointerEvent) {
  if (!dragging.value) return
  const t = timeFromClientX(e.clientX)
  if (dragging.value === 'left') leftT.value = Math.min(t, rightT.value - MIN_GAP)
  else rightT.value = Math.max(t, leftT.value + MIN_GAP)
}
function onUp() { dragging.value = null }

function nudge(which: 'left' | 'right', delta: number) {
  if (props.disabled) return
  if (which === 'left') leftT.value = Math.max(0, Math.min(leftT.value + delta, rightT.value - MIN_GAP))
  else rightT.value = Math.min(props.windowS, Math.max(rightT.value + delta, leftT.value + MIN_GAP))
}
function onKey(which: 'left' | 'right', e: KeyboardEvent) {
  const step = e.shiftKey ? 2 : 0.5
  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); nudge(which, -step) }
  else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); nudge(which, step) }
}
</script>

<template>
  <div class="sg-cal">
    <div ref="plot" class="sg-cal__plot" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
      <Seismogram :seed="seed" :window-s="windowS" :p-arrival-s="pArrivalS" :s-arrival-s="sArrivalS" :height="180" />

      <!-- measured span band -->
      <div class="sg-cal__band" :style="{ left: pctOf(leftT) + '%', width: pctOf(span) + '%' }" aria-hidden="true">
        <span class="sg-cal__band-val">{{ span.toFixed(1) }}s</span>
      </div>

      <!-- handles -->
      <div
        class="sg-cal__handle sg-cal__handle--p"
        :class="{ 'is-drag': dragging === 'left' }"
        :style="{ left: pctOf(leftT) + '%' }"
        role="slider"
        tabindex="0"
        :aria-valuemin="0"
        :aria-valuemax="windowS"
        :aria-valuenow="Number(leftT.toFixed(1))"
        aria-label="First arrival (P) marker, in seconds"
        @pointerdown="onDown('left', $event)"
        @keydown="onKey('left', $event)"
      ><span class="sg-cal__cap">P</span></div>

      <div
        class="sg-cal__handle sg-cal__handle--s"
        :class="{ 'is-drag': dragging === 'right' }"
        :style="{ left: pctOf(rightT) + '%' }"
        role="slider"
        tabindex="0"
        :aria-valuemin="0"
        :aria-valuemax="windowS"
        :aria-valuenow="Number(rightT.toFixed(1))"
        aria-label="Second arrival (S) marker, in seconds"
        @pointerdown="onDown('right', $event)"
        @keydown="onKey('right', $event)"
      ><span class="sg-cal__cap sg-cal__cap--s">S</span></div>
    </div>
    <div class="sg-cal__axis">
      <span v-for="s in [0, 16, 32, 48, 64]" :key="s">{{ s }}s</span>
    </div>
  </div>
</template>

<style scoped>
.sg-cal__plot { position: relative; touch-action: none; }
.sg-cal__band {
  position: absolute;
  top: 0; bottom: 0;
  background: color-mix(in srgb, var(--sg-p) 10%, transparent);
  border-left: 1px dashed var(--sg-p);
  border-right: 1px dashed var(--sg-s);
  pointer-events: none;
}
.sg-cal__band-val {
  position: absolute;
  top: 6rem; left: 50%;
  transform: translateX(-50%);
  font-family: var(--sg-mono);
  font-size: 12rem;
  font-weight: 600;
  color: var(--sg-ink);
  background: var(--sg-panel);
  border: 1px solid var(--sg-line);
  border-radius: 5rem;
  padding: 2rem 7rem;
  white-space: nowrap;
}
.sg-cal__handle {
  position: absolute;
  top: -6rem; bottom: -6rem;
  width: 26rem;
  transform: translateX(-50%);
  cursor: ew-resize;
  touch-action: none;
}
.sg-cal__handle::before {
  content: "";
  position: absolute;
  left: 50%; top: 0; bottom: 0;
  width: 2.5px;
  transform: translateX(-50%);
}
.sg-cal__handle--p::before { background: var(--sg-p); }
.sg-cal__handle--s::before { background: var(--sg-s); }
.sg-cal__cap {
  position: absolute;
  left: 50%; top: -4rem;
  transform: translateX(-50%);
  font-family: var(--sg-mono);
  font-size: 11rem;
  font-weight: 600;
  color: var(--sg-panel);
  background: var(--sg-p);
  border-radius: 4rem;
  padding: 1rem 6rem;
}
.sg-cal__cap--s { background: var(--sg-s); }
.sg-cal__handle::after {
  content: "";
  position: absolute;
  left: 50%; bottom: 0;
  width: 16rem; height: 16rem;
  transform: translate(-50%, 50%) rotate(45deg);
  background: var(--sg-panel);
  border: 2px solid var(--sg-p);
}
.sg-cal__handle--s::after { border-color: var(--sg-s); }
.sg-cal__handle.is-drag::after { transform: translate(-50%, 50%) rotate(45deg) scale(1.15); }
.sg-cal__handle:focus-visible { outline: none; }
.sg-cal__handle:focus-visible::after { box-shadow: 0 0 0 3px color-mix(in srgb, var(--sg-ink) 40%, transparent); }

.sg-cal__axis {
  display: flex;
  justify-content: space-between;
  margin-top: 12rem;
  font-family: var(--sg-mono);
  font-size: 10.5rem;
  color: var(--sg-muted);
}
</style>
