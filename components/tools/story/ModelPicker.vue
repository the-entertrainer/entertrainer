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
        <button v-if="canClose" class="mp__close" aria-label="Close" @click="emit('close')">✕</button>
      </header>

      <div class="mp__grid">
        <button
          v-for="id in MODEL_ORDER" :key="id"
          class="mp__card"
          :class="{ 'mp__card--freeform': id === 'freeform' }"
          @click="emit('pick', id)"
        >
          <span class="mp__name">{{ ID_MODELS[id].label }}</span>
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
  padding: 16rem;
}
.mp {
  width: min(720rem, 100%);
  max-height: calc(100dvh - 48rem);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18rem;
}
.mp__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12rem; }
.mp__head h2 { font-size: 22rem; letter-spacing: -0.03em; margin-bottom: 6rem; }
.mp__head p { font-size: 13.5rem; opacity: 0.65; line-height: 1.5; }
.mp__close {
  width: 28rem; height: 28rem;
  display: grid; place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  border: 1px solid var(--color-glass-border);
  font-size: 11rem;
  flex-shrink: 0;
}

.mp__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200rem, 1fr));
  gap: 10rem;
}
.mp__card {
  display: flex;
  flex-direction: column;
  gap: 7rem;
  padding: 16rem;
  border-radius: 16rem;
  text-align: left;
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 45%, transparent);
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.12s ease;
}
@media (hover: hover) {
  .mp__card:hover {
    border-color: var(--color-glass-border-hover);
    background: color-mix(in srgb, var(--color-bg) 62%, transparent);
    transform: translateY(-1rem);
  }
}
.mp__card:active { transform: scale(0.98); }
.mp__card--freeform { border-style: dashed; }
.mp__name { font-size: 15rem; font-weight: 700; letter-spacing: -0.02em; color: var(--color-text); }
.mp__tagline { font-size: 12rem; line-height: 1.45; opacity: 0.6; color: var(--color-text); min-height: 34rem; }
.mp__stages { display: flex; align-items: center; gap: 5rem; flex-wrap: wrap; }
.mp__stage-dot { width: 9rem; height: 9rem; border-radius: 999px; }
.mp__stage-free { font-size: 13rem; opacity: 0.5; color: var(--color-text); }

@media (max-width: 640px) {
  .mp-overlay { padding: 10rem; align-items: end; display: flex; }
  .mp { border-radius: 22rem 22rem 0 0; max-height: 86dvh; width: 100%; }
  .mp__grid { grid-template-columns: 1fr 1fr; }
}
</style>
