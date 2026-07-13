<script setup lang="ts">
import { BUTTON_STATES } from '~/types/buttoncraft'
import { STATE_LABELS } from '~/utils/buttonDefaults'
import { buildButtonStyle } from '~/utils/buttonStyle'

const store = useButtonCraftStore()

const swatches = computed(() => {
  const config = store.buttonConfig
  if (!config) return {}
  const out: Record<string, string> = {}
  for (const s of BUTTON_STATES) out[s] = buildButtonStyle(config, s).style.background as string
  return out
})
</script>

<template>
  <div class="bc-tabs" role="tablist">
    <button
      v-for="s in BUTTON_STATES"
      :key="s"
      class="bc-tab"
      :class="{ 'bc-tab--active': store.selectedState === s }"
      role="tab"
      :aria-selected="store.selectedState === s"
      type="button"
      @click="store.setSelectedState(s)"
    >
      <span class="bc-tab__dot" :style="{ background: swatches[s] }" />
      {{ STATE_LABELS[s] }}
    </button>
  </div>
</template>

<style scoped>
.bc-tabs {
  display: flex;
  align-items: center;
  gap: 4rem;
  padding: 8rem;
  overflow-x: auto;
  flex-shrink: 0;
}
.bc-tab {
  display: inline-flex;
  align-items: center;
  gap: 8rem;
  padding: 9rem 16rem;
  border-radius: var(--radius-full);
  font-size: 13rem;
  font-weight: 600;
  color: var(--color-text);
  opacity: 0.6;
  white-space: nowrap;
  transition: background 0.16s ease, opacity 0.16s ease;
}
.bc-tab:hover { opacity: 0.85; background: var(--color-glass-bg); }
.bc-tab--active {
  opacity: 1;
  background: var(--color-glass-bg-hover);
  border: 1px solid var(--color-glass-border-hover);
}
.bc-tab__dot {
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15) inset;
}
</style>
