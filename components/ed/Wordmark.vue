<script setup lang="ts">
/**
 * The Entertrainer wordmark.
 *
 * Live text, not a drawing. The previous version was a hand-drawn SVG ticket
 * with a play triangle in it, and it was the weakest thing on the site: an
 * emblem is a piece of illustration, and a piece of illustration made by
 * someone who is not an illustrator looks exactly like that. Publications with
 * no budget for a mark set their name in a good face and stop — which is what
 * this does.
 *
 * Fraunces carries it, at optical size 144 with the SOFT and WONK axes open,
 * so the terminals round and the alternates splay. That is a typographic
 * decision with two numbers behind it rather than a shape someone drew.
 *
 * Being real text also means it is selectable, searchable, translatable and
 * legible to a screen reader without an aria-label patch — which the SVG
 * version needed.
 */
withDefaults(defineProps<{
  /** `full` is the name; `mark` is the E alone, for tight chrome and icons. */
  variant?: 'full' | 'mark'
  /** Cap height target in px. Everything scales from it. */
  size?: number
}>(), { variant: 'full', size: 30 })
</script>

<template>
  <span class="wm" :class="`wm--${variant}`" :style="{ '--wm-size': size + 'rem' }">
    <span v-if="variant === 'mark'" class="wm__mark" aria-hidden="true">E</span>
    <span v-else class="wm__word">Entertrainer</span>
    <span v-if="variant === 'mark'" class="sr-only">Entertrainer</span>
  </span>
</template>

<style scoped>
.wm {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-display);
  color: var(--ink);
  line-height: 1;
}

.wm__word {
  font-size: var(--wm-size);
  font-weight: 800;
  /* opsz 144 is the display cut: higher contrast, tighter spacing, the
     drawing the face was designed to be set large in. */
  font-variation-settings: "SOFT" 30, "WONK" 1, "opsz" 144;
  letter-spacing: -0.022em;
}

.wm__mark {
  display: inline-flex; align-items: center; justify-content: center;
  width: calc(var(--wm-size) * 1.5);
  height: calc(var(--wm-size) * 1.5);
  border-radius: var(--radius-s);
  background: var(--ink);
  color: var(--paper);
  font-size: calc(var(--wm-size) * 0.94);
  font-weight: 800;
  font-variation-settings: "SOFT" 30, "WONK" 1, "opsz" 144;
  /* Fraunces' cap sits slightly high in the box at this weight. */
  padding-bottom: 0.06em;
}
</style>
