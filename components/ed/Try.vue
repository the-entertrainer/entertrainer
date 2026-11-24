<script setup lang="ts">
/**
 * One control inside an essay. The sentence and the picture both follow the slider.
 * Cream, ink, one yellow mark — same paper as the article.
 */
const props = withDefaults(defineProps<{
  label: string
  min?: number
  max?: number
  step?: number
  modelValue: number
  readout?: string
}>(), {
  min: 0,
  max: 100,
  step: 1,
  readout: ''
})

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()
const inputId = 'essay-try'

function onInput(event: Event) {
  const next = Number((event.target as HTMLInputElement).value)
  if (Number.isFinite(next)) emit('update:modelValue', next)
}
</script>

<template>
  <aside class="try" aria-label="Try this">
    <p class="try__kicker">Try this</p>
    <div v-if="$slots.stage" class="try__stage">
      <slot name="stage" />
    </div>
    <p class="try__line"><slot /></p>
    <label class="try__label" :for="inputId">
      <span>{{ label }}</span>
      <span v-if="readout" class="try__readout">{{ readout }}</span>
    </label>
    <input
      :id="inputId"
      class="try__range"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      :aria-valuetext="readout || String(modelValue)"
      @input="onInput"
    >
  </aside>
</template>

<style scoped>
.try {
  margin: 8rem 0 36rem;
  padding: 18rem 18rem 16rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  background: var(--paper-2);
}
.try__kicker {
  margin: 0 0 12rem;
  font: 700 11rem/1.2 var(--font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.try__stage { margin: 0 0 14rem; }
.try__line {
  margin: 0 0 16rem;
  font: 500 clamp(18rem, 2vw, 22rem)/1.35 var(--font-display);
  letter-spacing: -.02em;
}
.try__label {
  display: flex;
  justify-content: space-between;
  gap: 12rem;
  margin: 0 0 8rem;
  font: 600 13rem/1.3 var(--font-ui);
}
.try__readout {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--ink);
}
.try__range {
  display: block;
  width: 100%;
  height: 28rem;
  margin: 0;
  accent-color: var(--accent-ink, #111);
  cursor: pointer;
}
.try__range:focus-visible {
  outline: 3rem solid var(--focus);
  outline-offset: 3rem;
}
</style>
