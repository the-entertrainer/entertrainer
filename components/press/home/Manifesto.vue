<script setup lang="ts">
/**
 * The one-line thesis, set at poster scale — the paper's own editorial line,
 * not a project. A flat uniform dot screen behind it (not the luminance
 * halftone PressHalftone does for photographs) reads as press texture without
 * needing an image to carry it.
 */
const R = useReveal()
</script>

<template>
  <section class="mf">
    <p class="press-label" v-motion :initial="R.rise(0).initial" :visible-once="R.rise(0).visibleOnce">The thesis</p>
    <h2 class="mf__h2" v-motion :initial="R.rise(80).initial" :visible-once="R.rise(80).visibleOnce">
      Designing learning<br>that sticks.
    </h2>
    <p class="mf__note" v-motion :initial="R.rise(160).initial" :visible-once="R.rise(160).visibleOnce">
      From the hotel floor to the workbench — still noticing what makes it land.
    </p>
  </section>
</template>

<style scoped>
.mf {
  position: relative; z-index: 1;
  padding: clamp(64px, 12vw, 140px) var(--press-edge);
  text-align: center;
  border-top: 2px solid var(--press-ink);
  border-bottom: 2px solid var(--press-ink);
  background-image: radial-gradient(var(--press-ink) 0.8px, transparent 0.8px);
  background-size: 9px 9px;
  background-position: center;
}
.mf::before {
  content: '';
  position: absolute; inset: 0;
  background: color-mix(in srgb, var(--press-paper) 88%, transparent);
}
.mf > * { position: relative; z-index: 1; }

.mf__h2 {
  margin: 16px 0 0; font-family: var(--press-sans); font-weight: 800;
  font-size: clamp(40px, 8vw, 96px); line-height: 0.98; letter-spacing: -0.03em;
  text-transform: uppercase;
}
.mf__note { margin: 22px 0 0; font-family: var(--press-mono); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--press-ink-62); }
</style>
