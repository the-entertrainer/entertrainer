<script setup lang="ts">
// Lumina's own hand-drawn icon set — Feather/Lucide-style 24×24 rounded
// strokes authored inline, matching the StoryGen convention: no external
// assets, everything inherits currentColor. No emoji, anywhere.
export type LuminaIconName =
  | 'close' | 'trash' | 'edit' | 'duplicate' | 'undo' | 'redo' | 'check'
  | 'chevron-down' | 'more-horizontal' | 'plus' | 'arrow-up' | 'arrow-down'
  | 'eye' | 'download' | 'upload' | 'alert' | 'layers' | 'palette' | 'shield'

withDefaults(defineProps<{ name: LuminaIconName; size?: number }>(), { size: 16 })
</script>

<template>
  <svg
    :width="size" :height="size" viewBox="0 0 24 24"
    class="lm-icon" aria-hidden="true" focusable="false"
  >
    <g v-if="name === 'close'" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </g>

    <g v-else-if="name === 'trash'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 7h16" />
      <path d="M9 7V4.8A1.8 1.8 0 0 1 10.8 3h2.4A1.8 1.8 0 0 1 15 4.8V7" />
      <path d="M18.3 7 17.5 19.2A2 2 0 0 1 15.5 21h-7a2 2 0 0 1-2-1.8L5.7 7" />
      <path d="M10.2 11v6M13.8 11v6" />
    </g>

    <g v-else-if="name === 'edit'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.1 3.3a2.5 2.5 0 0 1 3.6 3.6L8.4 19.2 3 21l1.8-5.4L17.1 3.3Z" />
      <path d="M14.8 5.6l3.6 3.6" />
    </g>

    <g v-else-if="name === 'duplicate'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2.2" />
      <path d="M5.5 15H4.8A1.8 1.8 0 0 1 3 13.2V4.8A1.8 1.8 0 0 1 4.8 3h8.4A1.8 1.8 0 0 1 15 4.8v.7" />
    </g>

    <g v-else-if="name === 'undo'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8.5 15 4 10.5 8.5 6" />
      <path d="M4 10.5h10.5a5.5 5.5 0 0 1 0 11H11" />
    </g>

    <g v-else-if="name === 'redo'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15.5 15 20 10.5 15.5 6" />
      <path d="M20 10.5H9.5a5.5 5.5 0 0 0 0 11H13" />
    </g>

    <path v-else-if="name === 'check'" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M20 6.5 9.5 17 4 11.5" />

    <path v-else-if="name === 'chevron-down'" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M6 9.5 12 15.5 18 9.5" />

    <g v-else-if="name === 'more-horizontal'" fill="currentColor" stroke="none">
      <circle cx="5" cy="12" r="1.9" />
      <circle cx="12" cy="12" r="1.9" />
      <circle cx="19" cy="12" r="1.9" />
    </g>

    <path v-else-if="name === 'plus'" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M12 5v14M5 12h14" />

    <path v-else-if="name === 'arrow-up'" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" d="M12 19V5M12 5 6.5 10.5M12 5l5.5 5.5" />

    <path v-else-if="name === 'arrow-down'" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M12 19l-5.5-5.5M12 19l5.5-5.5" />

    <g v-else-if="name === 'eye'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </g>

    <g v-else-if="name === 'download'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 4v11M12 15l-4.5-4.5M12 15l4.5-4.5" />
      <path d="M4.5 16v2A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5v-2" />
    </g>

    <g v-else-if="name === 'upload'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 15V4M12 4 7.5 8.5M12 4l4.5 4.5" />
      <path d="M4.5 15v3A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5v-3" />
    </g>

    <g v-else-if="name === 'alert'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3.5 22 20.5H2L12 3.5Z" />
      <path d="M12 10v4.2" />
      <circle cx="12" cy="17.4" r="0.4" fill="currentColor" />
    </g>

    <g v-else-if="name === 'layers'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="M3 12.5 12 17.5l9-5" />
    </g>

    <g v-else-if="name === 'palette'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3a9 9 0 1 0 0 18c1.4 0 2.2-.9 2.2-2 0-.9-.5-1.3-.5-2.1 0-1.1.9-2 2-2h2.1A3.2 3.2 0 0 0 21 11.7C20.8 6.9 16.8 3 12 3Z" />
      <circle cx="8" cy="10" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="10" r="1.1" fill="currentColor" stroke="none" />
    </g>

    <g v-else-if="name === 'shield'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2.8 19.5 5.5v6c0 4.6-3.1 8-7.5 9.7C7.6 19.5 4.5 16.1 4.5 11.5v-6L12 2.8Z" />
      <path d="M8.8 11.7l2.3 2.3 4.2-4.2" />
    </g>
  </svg>
</template>

<style scoped>
.lm-icon { display: inline-block; vertical-align: middle; flex-shrink: 0; }
</style>
