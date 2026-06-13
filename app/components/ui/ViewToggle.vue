<script setup lang="ts">
import { useViewMode, type ViewMode } from '~/composables/useViewMode'

const { mode, setMode, isAnimating } = useViewMode()

const options: { value: ViewMode; label: string }[] = [
  { value: 'spiral', label: 'Spiral' },
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
]
</script>

<template>
  <div class="view-toggle glass" role="group" aria-label="Choose layout">
    <button
      v-for="opt in options"
      :key="opt.value"
      class="view-toggle__btn"
      :class="{ active: mode === opt.value }"
      :aria-pressed="mode === opt.value"
      :disabled="isAnimating"
      data-hover
      @click="setMode(opt.value)"
    >
      <span class="view-toggle__icon" :data-view="opt.value" aria-hidden="true">
        <svg v-if="opt.value === 'spiral'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10" />
          <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6" />
          <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2" />
        </svg>
        <svg v-else-if="opt.value === 'grid'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <circle cx="3.5" cy="6" r="1.4" /><circle cx="3.5" cy="12" r="1.4" /><circle cx="3.5" cy="18" r="1.4" />
        </svg>
      </span>
      {{ opt.label }}
    </button>
  </div>
</template>

<style scoped>
.view-toggle {
  display: inline-flex;
  padding: 5px;
  gap: 2px;
  border-radius: var(--radius-full);
}

.view-toggle__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--sz-2);
  padding: 0.45rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  transition: color 0.25s, background 0.25s;
}
.view-toggle__btn:disabled { opacity: 0.5; cursor: default; }

.view-toggle__icon svg { width: 15px; height: 15px; }

.view-toggle__btn.active {
  color: #02030a;
  background: var(--grad-cool);
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.4);
}
</style>
