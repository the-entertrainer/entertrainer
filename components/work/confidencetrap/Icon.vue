<script setup lang="ts">
// A minimal hand-drawn icon set for the player chrome only — thin stroke,
// no fills, consistent with the module's restrained register. Not used
// anywhere in the lesson/exercise content itself.
export type CtIconName = 'menu' | 'chevron-left' | 'chevron-right' | 'close'

withDefaults(defineProps<{ name: CtIconName; size?: number }>(), { size: 16 })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <g v-if="name === 'menu'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </g>
    <path v-else-if="name === 'chevron-left'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M15 5 8 12l7 7" />
    <path v-else-if="name === 'chevron-right'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
    <g v-else-if="name === 'close'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
      <path d="M6 6l12 12M6 18 18 6" />
    </g>
  </svg>
</template>
