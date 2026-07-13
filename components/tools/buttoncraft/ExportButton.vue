<script setup lang="ts">
import { BUTTON_STATES } from '~/types/buttoncraft'
import { STATE_LABELS } from '~/utils/buttonDefaults'
import { exportButtonZip } from '~/utils/buttonExport'
import BcIcon from './Icon.vue'

const store = useButtonCraftStore()

const open = ref(false)
const exporting = ref(false)
const error = ref('')
const scales = ref<number[]>([2])
const states = ref<string[]>([...BUTTON_STATES])

function toggleScale(value: number) {
  const i = scales.value.indexOf(value)
  if (i === -1) scales.value.push(value)
  else if (scales.value.length > 1) scales.value.splice(i, 1)
}

function toggleState(value: string) {
  const i = states.value.indexOf(value)
  if (i === -1) states.value.push(value)
  else if (states.value.length > 1) states.value.splice(i, 1)
}

async function runExport() {
  if (!store.buttonConfig || !store.currentProject) return
  error.value = ''
  exporting.value = true
  try {
    await exportButtonZip(store.buttonConfig, store.currentProject.name, states.value as any, scales.value)
    open.value = false
  } catch (e) {
    error.value = 'Export failed — try again, or export fewer states/resolutions at once.'
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="bc-export">
    <button type="button" class="glass-btn bc-export__trigger" :disabled="!store.hasProject" @click="open = true">
      <BcIcon name="download" :size="14" /> Export
    </button>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="open" class="bc-modal-backdrop" @click.self="open = false">
          <div class="glass-panel bc-modal">
            <button type="button" class="bc-modal__close" @click="open = false"><BcIcon name="close" :size="16" /></button>
            <h2 class="bc-modal__title">Export button states</h2>
            <p class="bc-modal__deck">Transparent PNGs, zipped, ready to drop into Storyline's button states.</p>

            <label class="glass-label">Resolution</label>
            <div class="bc-modal__row">
              <label v-for="s in [1, 2, 3]" :key="s" class="bc-check-chip">
                <input type="checkbox" :checked="scales.includes(s)" @change="toggleScale(s)" /> {{ s }}x
              </label>
            </div>

            <label class="glass-label">States</label>
            <div class="bc-modal__row bc-modal__row--wrap">
              <label v-for="s in BUTTON_STATES" :key="s" class="bc-check-chip">
                <input type="checkbox" :checked="states.includes(s)" @change="toggleState(s)" /> {{ STATE_LABELS[s] }}
              </label>
            </div>

            <p v-if="error" class="glass-note glass-note--error bc-modal__error">{{ error }}</p>

            <button type="button" class="glass-btn bc-modal__submit" :disabled="exporting" @click="runExport">
              {{ exporting ? 'Rendering PNGs…' : `Export ${states.length} state${states.length === 1 ? '' : 's'} × ${scales.length} size${scales.length === 1 ? '' : 's'}` }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.bc-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rem;
}
.bc-modal {
  width: 100%;
  max-width: 420rem;
  position: relative;
}
.bc-modal__close {
  position: absolute;
  top: 16rem;
  right: 16rem;
  width: 30rem;
  height: 30rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  opacity: 0.6;
}
.bc-modal__close:hover { opacity: 1; background: var(--color-glass-bg); }
.bc-modal__title { font-size: 20rem; font-weight: 700; margin-bottom: 6rem; }
.bc-modal__deck { font-size: 13rem; opacity: 0.65; margin-bottom: 18rem; line-height: 1.5; }
.bc-modal__row { display: flex; gap: 8rem; margin: 8rem 0 16rem; }
.bc-modal__row--wrap { flex-wrap: wrap; }
.bc-check-chip {
  display: inline-flex;
  align-items: center;
  gap: 6rem;
  padding: 7rem 12rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-glass-border);
  font-size: 12.5rem;
  font-weight: 600;
  cursor: pointer;
}
.bc-check-chip input { accent-color: var(--color-accent); }
.bc-modal__error { margin-bottom: 12rem; }
.bc-modal__submit { width: 100%; margin-top: 6rem; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
