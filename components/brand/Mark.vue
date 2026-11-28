<script setup lang="ts">
/**
 * The Entertrainer family mark: one sun, one glyph.
 * Every app and game wears the same disc so they read as one family;
 * only the ink glyph inside changes. Drawn on a 48 grid, 3px strokes.
 */
const props = withDefaults(defineProps<{ id: string; size?: number; tone?: 'sun' | 'ink' | 'paper' }>(), { size: 48, tone: 'sun' })
const fill = computed(() => props.tone === 'ink' ? 'var(--br-ink)' : props.tone === 'paper' ? 'var(--br-paper)' : 'var(--br-sun)')
const stroke = computed(() => props.tone === 'ink' ? 'var(--br-sun)' : 'var(--br-ink)')
</script>

<template>
  <svg class="br-mark" :width="size" :height="size" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <circle cx="24" cy="24" r="23" :fill="fill" />
    <g :stroke="stroke" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <!-- Aim: a target with one arrow home -->
      <template v-if="id === 'aim'">
        <circle cx="24" cy="24" r="11" />
        <circle cx="24" cy="24" r="3.5" :fill="stroke" stroke="none" />
        <path d="M24 24 L35 13 M30 13 h5 v5" />
      </template>
      <!-- Plain: a tangle becoming a straight line -->
      <template v-else-if="id === 'plain'">
        <path d="M11 19 c4 -6 7 6 11 0 s5 -4 6 0" />
        <path d="M11 29 H37" />
        <path d="M33 25 l4 4 -4 4" />
      </template>
      <!-- Cue: a clock face split into session beats -->
      <template v-else-if="id === 'cue'">
        <circle cx="24" cy="24" r="12" />
        <path d="M24 16 V24 L30 28" />
        <path d="M24 9.5 v2 M38.5 24 h-2 M24 38.5 v-2 M9.5 24 h2" />
      </template>
      <!-- Ladder: Bloom's rungs -->
      <template v-else-if="id === 'ladder'">
        <path d="M17 11 V37 M31 11 V37" />
        <path d="M17 16 H31 M17 24 H31 M17 32 H31" />
      </template>
      <!-- Pairs: two cards, one turned -->
      <template v-else-if="id === 'pairs'">
        <rect x="11" y="15" width="13" height="18" rx="2.5" />
        <rect x="24" y="13" width="13" height="18" rx="2.5" transform="rotate(12 30 22)" :fill="stroke" />
      </template>
      <!-- Steps: a staircase -->
      <template v-else-if="id === 'steps'">
        <path d="M11 35 H19 V27 H27 V19 H35 V12" />
        <circle cx="35" cy="12" r="2" :fill="stroke" stroke="none" />
      </template>
      <!-- The house mark: an e for Entertrainer -->
      <template v-else>
        <path d="M14.5 24 H33 c0 -5.5 -4 -10 -9 -10 s-9.5 4.5 -9.5 10 4.3 10 9.5 10 c3.2 0 5.8 -1.4 7.5 -3.6" />
      </template>
    </g>
  </svg>
</template>

<style scoped>
.br-mark { display: block; flex: none; }
</style>
