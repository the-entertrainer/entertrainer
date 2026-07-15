<script setup lang="ts">
import type { SgView } from '~/types/seismo'

const props = defineProps<{
  sequence: { id: SgView; label: string }[]
  index: number
  currentLabel: string
}>()
const emit = defineEmits<{ go: [view: SgView] }>()

const canPrev = computed(() => props.index > 0)
const canNext = computed(() => props.index < props.sequence.length - 1)

function prev() { if (canPrev.value) emit('go', props.sequence[props.index - 1].id) }
function next() { if (canNext.value) emit('go', props.sequence[props.index + 1].id) }
</script>

<template>
  <nav class="sg-controls" aria-label="Module navigation">
    <button type="button" class="sg-controls__menu" @click="emit('go', 'menu')">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      <span>Station log</span>
    </button>

    <div class="sg-controls__where">
      <span class="sg-controls__step">{{ String(index + 1).padStart(2, '0') }} / {{ String(sequence.length).padStart(2, '0') }}</span>
      <span class="sg-controls__label">{{ currentLabel }}</span>
    </div>

    <div class="sg-controls__nav">
      <button type="button" class="sg-controls__btn" :disabled="!canPrev" aria-label="Previous section" @click="prev">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
      </button>
      <button type="button" class="sg-controls__btn" :disabled="!canNext" aria-label="Next section" @click="next">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.sg-controls {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  height: 56rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rem;
  padding: 0 18rem;
  padding-bottom: var(--safe-bottom);
  background: var(--sg-panel);
  border-top: 1px solid var(--sg-line);
}
.sg-controls__menu {
  display: inline-flex;
  align-items: center;
  gap: 8rem;
  padding: 8rem 13rem;
  border-radius: 7rem;
  font-family: var(--sg-mono);
  font-size: 12.5rem;
  color: var(--sg-ink);
  transition: background 0.14s ease;
}
@media (hover: hover) { .sg-controls__menu:hover { background: var(--sg-paper); } }
.sg-controls__menu:focus-visible { outline: 2px solid var(--sg-ink); outline-offset: 2px; }

.sg-controls__where { display: flex; flex-direction: column; align-items: center; gap: 1px; }
.sg-controls__step { font-family: var(--sg-mono); font-size: 11rem; color: var(--sg-muted-strong); letter-spacing: 0.04em; }
.sg-controls__label { font-family: var(--sg-display); font-size: 13rem; font-weight: 500; color: var(--sg-ink); }

.sg-controls__nav { display: flex; gap: 6rem; }
.sg-controls__btn {
  width: 38rem;
  height: 38rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rem;
  border: 1.5px solid var(--sg-line);
  color: var(--sg-ink);
  transition: border-color 0.14s ease, background 0.14s ease;
}
@media (hover: hover) { .sg-controls__btn:not(:disabled):hover { border-color: var(--sg-muted); background: var(--sg-paper); } }
.sg-controls__btn:disabled { opacity: 0.3; cursor: not-allowed; }
.sg-controls__btn:focus-visible { outline: 2px solid var(--sg-ink); outline-offset: 2px; }

@media (max-width: 560px) {
  .sg-controls__menu span { display: none; }
}
</style>
