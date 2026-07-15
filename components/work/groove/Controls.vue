<script setup lang="ts">
import type { GvView } from '~/types/groove'

const props = defineProps<{
  sequence: { id: GvView; label: string }[]
  index: number
  currentLabel: string
}>()
const emit = defineEmits<{ go: [view: GvView] }>()

const canPrev = computed(() => props.index > 0)
const canNext = computed(() => props.index < props.sequence.length - 1)
function prev() { if (canPrev.value) emit('go', props.sequence[props.index - 1].id) }
function next() { if (canNext.value) emit('go', props.sequence[props.index + 1].id) }
</script>

<template>
  <nav class="gv-controls" aria-label="Module navigation">
    <button type="button" class="gv-controls__menu" @click="emit('go', 'menu')">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      <span>Menu</span>
    </button>
    <div class="gv-controls__where">
      <span class="gv-controls__step">{{ String(index + 1).padStart(2, '0') }} / {{ String(sequence.length).padStart(2, '0') }}</span>
      <span class="gv-controls__label">{{ currentLabel }}</span>
    </div>
    <div class="gv-controls__nav">
      <button type="button" class="gv-controls__btn" :disabled="!canPrev" aria-label="Previous section" @click="prev">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
      </button>
      <button type="button" class="gv-controls__btn" :disabled="!canNext" aria-label="Next section" @click="next">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.gv-controls {
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
  background: color-mix(in srgb, var(--gv-panel) 80%, transparent);
  border-top: 1px solid var(--gv-line);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.gv-controls__menu {
  display: inline-flex; align-items: center; gap: 8rem;
  padding: 8rem 13rem; border-radius: 999rem;
  font-family: var(--gv-mono); font-size: 12.5rem; color: var(--gv-text);
}
@media (hover: hover) { .gv-controls__menu:hover { background: var(--gv-slot-hover); } }
.gv-controls__menu:focus-visible { outline: 2px solid var(--gv-text); outline-offset: 2px; }
.gv-controls__where { display: flex; flex-direction: column; align-items: center; gap: 1px; }
.gv-controls__step { font-family: var(--gv-mono); font-size: 11rem; color: var(--gv-muted); }
.gv-controls__label { font-family: var(--gv-display); font-weight: 600; font-size: 13rem; color: var(--gv-text); }
.gv-controls__nav { display: flex; gap: 6rem; }
.gv-controls__btn {
  width: 38rem; height: 38rem; display: flex; align-items: center; justify-content: center;
  border-radius: 999rem; border: 1px solid var(--gv-line); color: var(--gv-text);
  transition: border-color 0.14s ease, background 0.14s ease;
}
@media (hover: hover) { .gv-controls__btn:not(:disabled):hover { border-color: var(--gv-line-strong); background: var(--gv-slot-hover); } }
.gv-controls__btn:disabled { opacity: 0.3; cursor: not-allowed; }
.gv-controls__btn:focus-visible { outline: 2px solid var(--gv-text); outline-offset: 2px; }
@media (max-width: 560px) { .gv-controls__menu span { display: none; } }
</style>
