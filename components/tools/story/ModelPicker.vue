<script setup lang="ts">
import type { ModelId } from '~/utils/idModels'
import { ID_MODELS, MODEL_ORDER } from '~/utils/idModels'

// The front door of every project: pick the instructional design framework
// and the whole tool reshapes around it — starter lanes, palette, inspector
// vocabulary, and the export layout. `dismissible` allows backing out when
// there's something to go back to.
const props = defineProps<{ switching?: boolean; dismissible?: boolean }>()
const emit = defineEmits<{ pick: [id: ModelId]; close: [] }>()
const canClose = computed(() => props.switching || props.dismissible)
</script>

<template>
  <div class="mp-overlay" @click.self="canClose ? emit('close') : undefined">
    <div class="mp glass-panel" data-lenis-prevent>
      <header class="mp__head">
        <div>
          <h2>{{ switching ? 'Switch framework' : 'Start a storyboard' }}</h2>
          <p>{{ switching
            ? 'Your cards stay — stages reset to the new model.'
            : 'Pick the instructional design model this storyboard should follow.' }}</p>
        </div>
        <button v-if="canClose" class="mp__close" aria-label="Close" @click="emit('close')"><ToolsStoryIcon name="close" :size="14" /></button>
      </header>

      <div class="mp__grid">
        <button
          v-for="id in MODEL_ORDER" :key="id"
          class="mp__card"
          :class="{ 'mp__card--freeform': id === 'freeform' }"
          @click="emit('pick', id)"
        >
          <span class="mp__name">{{ ID_MODELS[id].label }}</span>
          <span class="mp__kind" :class="{ 'mp__kind--process': ID_MODELS[id].kind === 'process' }">
            {{ id === 'freeform' ? 'blank canvas' : ID_MODELS[id].kind === 'process' ? 'design process + plan' : 'lesson arc' }}
          </span>
          <span class="mp__tagline">{{ ID_MODELS[id].tagline }}</span>
          <span class="mp__stages">
            <span
              v-for="s in ID_MODELS[id].stages" :key="s.id"
              class="mp__stage-dot" :style="{ background: s.color }" :title="s.label"
            />
            <span v-if="!ID_MODELS[id].stages.length" class="mp__stage-free">∞</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mp-overlay {
  position: fixed;
  inset: 0;
  z-index: 32;
  background: rgba(0, 0, 0, 0.4);
  display: grid;
  place-items: center;
  padding: 1rem;
}
.mp {
  width: min(45rem, 100%);
  max-height: calc(100dvh - 3rem);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
}
.mp__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; }
.mp__head h2 { font-size: 1.375rem; letter-spacing: -0.03em; margin-bottom: 0.375rem; }
.mp__head p { font-size: 0.84375rem; opacity: 0.65; line-height: 1.5; }
.mp__close {
  width: 1.75rem; height: 1.75rem;
  display: grid; place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  border: 1px solid var(--color-glass-border);
  font-size: 0.75rem;
  flex-shrink: 0;
}

.mp__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12.5rem, 1fr));
  gap: 0.625rem;
}
.mp__card {
  display: flex;
  flex-direction: column;
  gap: 0.4375rem;
  padding: 1rem;
  border-radius: 1rem;
  text-align: left;
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 45%, transparent);
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.12s ease;
}
@media (hover: hover) {
  .mp__card:hover {
    border-color: var(--color-glass-border-hover);
    background: color-mix(in srgb, var(--color-bg) 62%, transparent);
    transform: translateY(-0.0625rem);
  }
}
.mp__card:active { transform: scale(0.98); }
.mp__card--freeform { border-style: dashed; }
.mp__name { font-size: 0.9375rem; font-weight: 700; letter-spacing: -0.02em; color: var(--color-text); }
.mp__kind {
  align-self: flex-start;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  color: var(--color-text);
  background: color-mix(in srgb, #34D399 16%, transparent);
}
.mp__kind--process { background: color-mix(in srgb, #A78BFA 18%, transparent); }
.mp__tagline { font-size: 0.75rem; line-height: 1.45; opacity: 0.6; color: var(--color-text); min-height: 2.125rem; }
.mp__stages { display: flex; align-items: center; gap: 0.3125rem; flex-wrap: wrap; }
.mp__stage-dot { width: 0.5625rem; height: 0.5625rem; border-radius: 999px; }
.mp__stage-free { font-size: 0.8125rem; opacity: 0.5; color: var(--color-text); }

@media (max-width: 640px) {
  .mp-overlay { padding: 0.625rem; align-items: end; display: flex; }
  .mp { border-radius: 1.375rem 1.375rem 0 0; max-height: 86dvh; width: 100%; }
  .mp__grid { grid-template-columns: 1fr 1fr; }
}
</style>
