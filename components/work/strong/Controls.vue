<script setup lang="ts">
import type { StView } from '~/types/strong'

const props = defineProps<{
  sequence: { id: StView; label: string }[]
  index: number
  currentLabel: string
}>()
const emit = defineEmits<{ go: [view: StView] }>()

const canPrev = computed(() => props.index > 0)
const canNext = computed(() => props.index < props.sequence.length - 1)
function prev() { if (canPrev.value) emit('go', props.sequence[props.index - 1].id) }
function next() { if (canNext.value) emit('go', props.sequence[props.index + 1].id) }
</script>

<template>
  <nav class="st-controls" aria-label="Module navigation">
    <button type="button" class="st-controls__menu" @click="emit('go', 'menu')">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      <span>Menu</span>
    </button>
    <div class="st-controls__where">
      <span class="st-controls__step st-num">{{ String(index + 1).padStart(2, '0') }} / {{ String(sequence.length).padStart(2, '0') }}</span>
      <span class="st-controls__label">{{ currentLabel }}</span>
    </div>
    <div class="st-controls__nav">
      <button type="button" class="st-controls__btn" :disabled="!canPrev" aria-label="Previous section" @click="prev">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
      </button>
      <button type="button" class="st-controls__btn" :disabled="!canNext" aria-label="Next section" @click="next">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.st-controls {
  position: relative; z-index: 10; flex-shrink: 0; height: 56rem;
  display: flex; align-items: center; justify-content: space-between; gap: 12rem;
  padding: 0 18rem; padding-bottom: var(--safe-bottom);
  background: color-mix(in srgb, var(--st-panel) 82%, transparent);
  border-top: 1px solid var(--st-line);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
}
.st-controls__menu {
  display: inline-flex; align-items: center; gap: 8rem;
  padding: 8rem 13rem; border-radius: 8rem;
  font-family: var(--st-mono); font-size: 12.5rem; color: var(--st-text);
}
@media (hover: hover) { .st-controls__menu:hover { background: var(--st-slot-hover); } }
.st-controls__menu:focus-visible { outline: 2px solid var(--st-text); outline-offset: 2px; }
.st-controls__where { display: flex; flex-direction: column; align-items: center; gap: 1px; }
.st-controls__step { font-size: 11rem; color: var(--st-muted); }
.st-controls__label { font-family: var(--st-display); font-weight: 600; font-size: 13rem; color: var(--st-text); }
.st-controls__nav { display: flex; gap: 6rem; }
.st-controls__btn {
  width: 38rem; height: 38rem; display: flex; align-items: center; justify-content: center;
  border-radius: 8rem; border: 1px solid var(--st-line); color: var(--st-text);
  transition: border-color 0.14s ease, background 0.14s ease;
}
@media (hover: hover) { .st-controls__btn:not(:disabled):hover { border-color: var(--st-line-strong); background: var(--st-slot-hover); } }
.st-controls__btn:disabled { opacity: 0.3; cursor: not-allowed; }
.st-controls__btn:focus-visible { outline: 2px solid var(--st-text); outline-offset: 2px; }
@media (max-width: 560px) { .st-controls__menu span { display: none; } }
</style>
