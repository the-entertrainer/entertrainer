<script setup lang="ts">
// The Lesson's low-friction self-rating prompt. Deliberately not a slider
// — the Hands-On confidence slider is the one tactile interaction in the
// module; this is a quieter, five-option radio group logged silently with
// no color or checkmark feedback in the moment.
const props = defineProps<{ modelValue: number | null; name: string; label: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()
</script>

<template>
  <fieldset class="ct-dots">
    <legend class="ct-dots__legend">{{ label }}</legend>
    <div class="ct-dots__row" role="radiogroup" :aria-label="label">
      <label v-for="n in 5" :key="n" class="ct-dots__opt">
        <input
          type="radio"
          :name="name"
          :value="n"
          :checked="modelValue === n"
          @change="emit('update:modelValue', n)"
        />
        <span class="ct-dots__dot" aria-hidden="true">{{ n }}</span>
      </label>
    </div>
    <div class="ct-dots__scale">
      <span>Not confident</span>
      <span>Very confident</span>
    </div>
  </fieldset>
</template>

<style scoped>
.ct-dots {
  border: none;
  padding: 0;
  margin: 0;
}
.ct-dots__legend {
  font-family: var(--ct-sans);
  font-size: 14rem;
  color: var(--ct-secondary);
  padding: 0 0 12rem;
}
.ct-dots__row {
  display: flex;
  gap: 10rem;
}
.ct-dots__opt {
  position: relative;
  cursor: pointer;
}
.ct-dots__opt input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
}
.ct-dots__dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38rem;
  height: 38rem;
  border-radius: 50%;
  border: 1px solid var(--ct-border);
  font-family: var(--ct-sans);
  font-size: 13rem;
  color: var(--ct-secondary);
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.ct-dots__opt input:checked + .ct-dots__dot {
  background: var(--ct-graphite);
  border-color: var(--ct-graphite);
  color: var(--ct-bone);
}
.ct-dots__opt input:focus-visible + .ct-dots__dot {
  outline: 2px solid var(--ct-graphite);
  outline-offset: 2px;
}
@media (hover: hover) {
  .ct-dots__opt:hover .ct-dots__dot { border-color: var(--ct-secondary); }
}
.ct-dots__scale {
  display: flex;
  justify-content: space-between;
  margin-top: 8rem;
  font-family: var(--ct-sans);
  font-size: 11.5rem;
  color: var(--ct-secondary);
}
</style>
