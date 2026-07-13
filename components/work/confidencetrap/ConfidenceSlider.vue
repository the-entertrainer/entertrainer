<script setup lang="ts">
import gsap from 'gsap'

// The module's one deliberately tactile, "fun" interaction — and its data
// -collection instrument. Built on a native <input type="range"> so
// keyboard support (arrows, Home/End, Page Up/Down) and screen-reader
// semantics come from the browser for free; every visual embellishment
// (fill track, floating readout, drag weight) is layered on top without
// touching the native behavior.
const props = withDefaults(defineProps<{ modelValue: number; label: string }>(), {})
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const dragging = ref(false)
const bubbleEl = ref<HTMLElement | null>(null)

const pct = computed(() => Math.round(props.modelValue))

function onInput(e: Event) {
  emit('update:modelValue', Number((e.target as HTMLInputElement).value))
}

function onPointerDown() {
  dragging.value = true
}

async function onPointerUp() {
  dragging.value = false
  // A small settle — the one place this module allows a bit of spring,
  // because this is the single "tactile" exception the motion rules grant.
  await nextTick()
  if (!bubbleEl.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  gsap.fromTo(bubbleEl.value, { scale: 1.1 }, { scale: 1, duration: 0.4, ease: 'power2.out' })
}
</script>

<template>
  <div class="ct-slider" :class="{ 'ct-slider--active': dragging }">
    <div class="ct-slider__head">
      <span class="ct-slider__label">{{ label }}</span>
      <span ref="bubbleEl" class="ct-slider__readout">{{ pct }}%</span>
    </div>
    <input
      type="range"
      class="ct-slider__input"
      min="0"
      max="100"
      step="1"
      :value="modelValue"
      :style="{ '--ct-pct': pct + '%' }"
      :aria-label="label"
      :aria-valuetext="`${pct} percent confident`"
      @input="onInput"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @keyup="onPointerUp"
    />
  </div>
</template>

<style scoped>
.ct-slider { width: 100%; }
.ct-slider__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 20rem;
  margin-bottom: 14rem;
}
.ct-slider__label {
  font-family: var(--ct-sans);
  font-size: 14rem;
  color: var(--ct-secondary);
  max-width: 34ch;
}
.ct-slider__readout {
  display: inline-block;
  font-family: var(--ct-serif);
  font-size: 34rem;
  font-weight: 600;
  color: var(--ct-accent);
  font-variant-numeric: tabular-nums;
  transform-origin: right center;
}

.ct-slider__input {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 30rem;
  background: transparent;
  margin: 0;
  cursor: pointer;
}

/* Track — filled portion in terracotta up to the current value, tracks
   the pointer exactly (no eased lag on the fill itself; only the
   decorative bits below get eased, so the drag stays 1:1 and honest). */
.ct-slider__input::-webkit-slider-runnable-track {
  height: 10rem;
  border-radius: 999rem;
  background: linear-gradient(
    to right,
    var(--ct-accent) 0%,
    var(--ct-accent) var(--ct-pct),
    var(--ct-border) var(--ct-pct),
    var(--ct-border) 100%
  );
}
.ct-slider__input::-moz-range-track {
  height: 10rem;
  border-radius: 999rem;
  background: var(--ct-border);
}
.ct-slider__input::-moz-range-progress {
  height: 10rem;
  border-radius: 999rem;
  background: var(--ct-accent);
}

.ct-slider__input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 26rem;
  height: 26rem;
  margin-top: -8rem;
  border-radius: 50%;
  background: var(--ct-bone);
  border: 3rem solid var(--ct-accent);
  box-shadow: 0 2rem 8rem rgba(58, 54, 50, 0.22);
  transition: transform 0.14s ease-out, box-shadow 0.14s ease-out;
}
.ct-slider__input::-moz-range-thumb {
  width: 26rem;
  height: 26rem;
  border-radius: 50%;
  background: var(--ct-bone);
  border: 3rem solid var(--ct-accent);
  box-shadow: 0 2rem 8rem rgba(58, 54, 50, 0.22);
  transition: transform 0.14s ease-out, box-shadow 0.14s ease-out;
}

.ct-slider--active .ct-slider__input::-webkit-slider-thumb {
  transform: scale(1.18);
  box-shadow: 0 3rem 14rem rgba(58, 54, 50, 0.3);
}
.ct-slider--active .ct-slider__input::-moz-range-thumb {
  transform: scale(1.18);
  box-shadow: 0 3rem 14rem rgba(58, 54, 50, 0.3);
}

.ct-slider__input:focus-visible {
  outline: none;
}
.ct-slider__input:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3rem var(--ct-bone), 0 0 0 5rem var(--ct-graphite);
}
.ct-slider__input:focus-visible::-moz-range-thumb {
  box-shadow: 0 0 0 3rem var(--ct-bone), 0 0 0 5rem var(--ct-graphite);
}

@media (max-width: 480px) {
  .ct-slider__head { flex-direction: column; align-items: flex-start; gap: 6rem; }
  .ct-slider__label { max-width: none; }
  .ct-slider__readout { transform-origin: left center; }
}

@media (prefers-reduced-motion: reduce) {
  .ct-slider__input::-webkit-slider-thumb,
  .ct-slider__input::-moz-range-thumb { transition: none; }
}
</style>
