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
  /**
   * Die-cut sticker treatment: a thick paper outline around the whole lockup
   * with a hard ink shadow behind it, so the mark reads as a physical object
   * laid on the page rather than as type printed into it.
   *
   * The technique is generic — it is how every printed sticker has looked for
   * fifty years — and it suits a ticket emblem better than it has any right
   * to. What stays ours is the mark itself.
   */
  sticker?: boolean
}>(), { variant: 'full', size: 34, sticker: false })
</script>

<template>
  <span class="wm" :class="[`wm--${variant}`, { 'wm--sticker': sticker }]" :style="{ '--wm-size': size + 'rem' }">
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

/* ── Sticker ────────────────────────────────────────────────────────────
   Two layers, no images. The paper-coloured stroke is painted *under* the
   fill (paint-order), which gives the letterforms a cut edge; the hard,
   un-blurred drop shadow lifts the whole lockup off the page. Browsers that
   ignore paint-order get an outline over the fill, which is slightly heavier
   and still legible — so this degrades rather than breaks. */
.wm--sticker {
  filter:
    drop-shadow(3rem 3rem 0 var(--ink))
    drop-shadow(0 0 0.5rem color-mix(in srgb, var(--ink) 25%, transparent));
}
.wm--sticker .wm__word {
  -webkit-text-stroke: calc(var(--wm-size) * 0.14) var(--paper);
  paint-order: stroke fill;
}
.wm--sticker .wm__mark {
  /* The emblem gets the same cut edge as the letters, drawn as a stroke
     widening on the outer path only. */
  stroke: var(--paper);
  stroke-width: 0;
  filter: drop-shadow(0 0 calc(var(--wm-size) * 0.1) var(--paper))
          drop-shadow(0 0 calc(var(--wm-size) * 0.07) var(--paper));
}
</style>
