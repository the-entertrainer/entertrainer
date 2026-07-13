<script setup lang="ts">
// The Main Menu's honest gauge. Reads "not yet measured" and stays an
// empty hairline arc until the learner has actually produced a score by
// finishing the Hands-On gauntlet and passing the Assessment — no
// placeholder number, no fake partial fill.
const props = defineProps<{ value: number | null }>()

// The arc below is `M 10 90 A 80 80 0 0 1 170 90` — radius 80, and since the
// chord from (10,90) to (170,90) equals the diameter (160), it is exactly a
// semicircle. Its length is therefore exactly pi * radius, computed here
// rather than measured at runtime so there is no async gap (and no CSS
// -transition flash) between first paint and the correct hidden state.
const ARC_D = 'M 10 90 A 80 80 0 0 1 170 90'
const ARC_LEN = Math.PI * 80

const dashOffset = computed(() => {
  if (props.value == null) return ARC_LEN
  const clamped = Math.max(0, Math.min(100, props.value))
  return ARC_LEN - (clamped / 100) * ARC_LEN
})
</script>

<template>
  <div class="ct-gauge">
    <svg viewBox="0 0 180 100" class="ct-gauge__svg" aria-hidden="true">
      <path :d="ARC_D" fill="none" stroke="var(--ct-border)" stroke-width="10" stroke-linecap="round" />
      <path
        :d="ARC_D"
        fill="none"
        stroke="var(--ct-accent)"
        stroke-width="10"
        stroke-linecap="round"
        :stroke-dasharray="ARC_LEN"
        :stroke-dashoffset="dashOffset"
        class="ct-gauge__fill"
      />
    </svg>
    <p class="ct-gauge__value">
      <span v-if="value == null">Not yet measured</span>
      <span v-else>{{ Math.round(value) }}<span class="ct-gauge__unit">/100</span></span>
    </p>
    <p class="ct-gauge__label">Confidence score</p>
    <p class="ct-gauge__hint">Measures calibration, not confidence itself</p>
  </div>
</template>

<style scoped>
.ct-gauge {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20rem 18rem 18rem;
}
.ct-gauge__svg { width: 100%; max-width: 200rem; height: auto; }
.ct-gauge__fill { transition: stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1); }
.ct-gauge__value {
  margin-top: 4rem;
  font-family: var(--ct-serif);
  font-size: 22rem;
  color: var(--ct-graphite);
}
.ct-gauge__unit { font-size: 13rem; color: var(--ct-secondary); }
.ct-gauge__label {
  margin-top: 2rem;
  font-family: var(--ct-sans);
  font-size: 12.5rem;
  color: var(--ct-secondary);
}
.ct-gauge__hint {
  margin-top: 4rem;
  font-family: var(--ct-sans);
  font-size: 11rem;
  color: var(--ct-secondary);
  opacity: 0.8;
}
@media (prefers-reduced-motion: reduce) {
  .ct-gauge__fill { transition: none; }
}
</style>
