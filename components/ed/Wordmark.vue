<script setup lang="ts">
/**
 * The Entertrainer mark.
 *
 * Direction: block signal. A ticket with two punch notches, carrying an E
 * whose middle bar is a play triangle — entertainment and instruction in one
 * glyph, which is the whole name. Drawn here as original vector geometry, not
 * traced from anything, and it is the only mark on the site.
 *
 * The emblem is SVG; the wordmark is live text so it inherits the display face
 * and stays selectable, searchable and translatable. A wordmark baked into a
 * path is a wordmark no screen reader can read.
 */
withDefaults(defineProps<{
  /** `full` is the masthead lockup, `mark` is the emblem alone. */
  variant?: 'full' | 'mark'
  /** Emblem height in px. The wordmark scales from it. */
  size?: number
}>(), { variant: 'full', size: 34 })
</script>

<template>
  <span class="wm" :class="`wm--${variant}`" :style="{ '--wm-size': size + 'rem' }">
    <svg class="wm__mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <!-- The ticket. The notches are cut from the body rather than drawn on
           top, so the outline reads as one continuous stamped edge. -->
      <path
        d="M8 6h48a4 4 0 0 1 4 4v12a10 10 0 0 0 0 20v12a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V42a10 10 0 0 0 0-20V10a4 4 0 0 1 4-4Z"
        fill="var(--wm-fill, var(--sun))" stroke="var(--wm-ink, var(--ink))" stroke-width="4" stroke-linejoin="round" />
      <!-- The E: top bar, play-triangle middle, bottom bar. -->
      <path d="M17 20h22" stroke="var(--wm-ink, var(--ink))" stroke-width="6" stroke-linecap="round" />
      <path d="M17 44h22" stroke="var(--wm-ink, var(--ink))" stroke-width="6" stroke-linecap="round" />
      <path d="M18 26.5 32 32l-14 5.5z" fill="var(--wm-ink, var(--ink))" stroke="var(--wm-ink, var(--ink))"
            stroke-width="3" stroke-linejoin="round" />
    </svg>
    <span v-if="variant === 'full'" class="wm__word">Entertrainer</span>
  </span>
</template>

<style scoped>
.wm { display: inline-flex; align-items: center; gap: 10rem; }
.wm__mark { width: var(--wm-size); height: var(--wm-size); flex: none; display: block; }
.wm__word {
  font-family: var(--font-display);
  font-size: calc(var(--wm-size) * 0.92);
  letter-spacing: 0.02em;
  line-height: 1;
  color: var(--ink);
  /* Bangers sits high in its box; nudge it onto the emblem's optical centre. */
  transform: translateY(0.06em);
}
</style>
