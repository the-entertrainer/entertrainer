<script setup lang="ts">
const props = defineProps<{
  index: number
  total: number
  furthest: number
  label: string
  section: string
  canPrev: boolean
  canNext: boolean
  gated: boolean
}>()
const emit = defineEmits<{ prev: []; next: []; jump: [i: number] }>()

const segments = computed(() => Array.from({ length: props.total }, (_, i) => i))
</script>

<template>
  <nav class="st-bar" aria-label="Course navigation">
    <button type="button" class="st-bar__nav" :disabled="!canPrev" aria-label="Previous slide" @click="emit('prev')">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
    </button>

    <div class="st-bar__center">
      <div class="st-seek" role="group" aria-label="Progress">
        <button
          v-for="i in segments" :key="i" type="button"
          class="st-seek__seg"
          :class="{ 'is-done': i <= furthest, 'is-current': i === index, 'is-locked': i > furthest }"
          :disabled="i > furthest"
          :aria-label="`Slide ${i + 1}`"
          :aria-current="i === index ? 'step' : undefined"
          @click="emit('jump', i)"
        />
      </div>
      <p class="st-bar__pos"><span class="st-bar__section">{{ section }}</span><span class="st-bar__count st-num">{{ index + 1 }} / {{ total }}</span></p>
    </div>

    <button type="button" class="st-bar__nav st-bar__nav--next" :disabled="!canNext" :aria-label="gated ? 'Finish this slide to continue' : 'Next slide'" @click="emit('next')">
      <svg v-if="gated" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
      <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7" /></svg>
    </button>
  </nav>
</template>

<style scoped>
.st-bar {
  position: relative; z-index: 10; flex-shrink: 0; min-height: 3.875rem;
  display: flex; align-items: center; gap: 1rem;
  padding: 0 1.375rem; padding-bottom: var(--safe-bottom);
  background: color-mix(in srgb, var(--st-panel) 78%, transparent);
  border-top: 1px solid var(--st-line);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
}
.st-bar__nav {
  width: 2.625rem; height: 2.625rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  border-radius: 62.4375rem; border: 1px solid var(--st-line-strong); color: var(--st-text);
  transition: border-color 0.14s ease, background 0.14s ease, opacity 0.14s ease;
}
.st-bar__nav--next { background: var(--st-accent); color: #06222A; border-color: transparent; }
@media (hover: hover) {
  .st-bar__nav:not(:disabled):hover { border-color: var(--st-text); background: var(--st-slot-hover); }
  .st-bar__nav--next:not(:disabled):hover { background: var(--st-accent); filter: brightness(1.08); }
}
.st-bar__nav:disabled { opacity: 0.35; cursor: not-allowed; }
.st-bar__nav--next:disabled { background: var(--st-slot); color: var(--st-muted); border: 1px solid var(--st-line); opacity: 0.7; }
.st-bar__nav:focus-visible { outline: 2px solid var(--st-text); outline-offset: 2px; }

.st-bar__center { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.st-seek { display: flex; gap: 0.3125rem; width: 100%; max-width: 32.5rem; }
.st-seek__seg {
  flex: 1; height: 0.3125rem; border-radius: 62.4375rem; background: var(--st-slot);
  transition: background 0.2s ease, transform 0.15s ease;
}
.st-seek__seg.is-done { background: color-mix(in srgb, var(--st-accent) 55%, var(--st-slot)); }
.st-seek__seg.is-current { background: var(--st-accent); transform: scaleY(1.8); }
.st-seek__seg.is-locked { cursor: not-allowed; }
@media (hover: hover) { .st-seek__seg.is-done:not(.is-current):hover { background: var(--st-accent); } }
.st-seek__seg:focus-visible { outline: 2px solid var(--st-text); outline-offset: 3px; }
.st-bar__pos { display: flex; align-items: baseline; gap: 0.625rem; }
.st-bar__section { font-family: var(--st-display); font-weight: 600; font-size: 0.78125rem; color: var(--st-text); }
.st-bar__count { font-size: 0.75rem; color: var(--st-muted); }

@media (max-width: 560px) { .st-bar { gap: 0.625rem; padding: 0 0.875rem; } }
</style>
