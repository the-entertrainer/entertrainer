<script setup lang="ts">
/**
 * The lens, for pages made of text.
 *
 * The home stage is photographed — utils/lensPass.ts gives it barrel,
 * chromatic aberration, a velocity smear, a vignette and film grain. Every
 * interior page was flat DOM on a black rectangle, which is the single biggest
 * reason they read as a different site: one surface is inside a camera and the
 * other is not.
 *
 * Most of that stack cannot cross into the DOM — you cannot barrel-distort a
 * paragraph without destroying it, and per-channel offsets on live text is
 * just fringing on type. But the two optics that *frame* rather than distort
 * do cross, and they are the ones doing the work:
 *
 *  · the vignette, matched to the shader's actual falloff rather than
 *    eyeballed. The pass computes smoothstep(0.92, 0.18, r²·2) and mixes it at
 *    0.28, which starts darkening at 42% of the corner distance and reaches
 *    full strength at ~96%. Those are the stops below.
 *  · the grain, which UiGrain already draws site-wide.
 *
 * So an interior page is now the same photograph as the home screen, just of a
 * quieter subject. Purely decorative and inert: fixed, non-interactive, and
 * behind every piece of chrome.
 */
</script>

<template>
  <div class="optics" aria-hidden="true" />
</template>

<style scoped>
.optics {
  position: fixed;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  /* Matches lensPass's uVignette = 0.28 and its smoothstep window. */
  background: radial-gradient(farthest-corner circle at 50% 46%,
    transparent 42%,
    color-mix(in srgb, var(--color-bg) 28%, transparent) 96%);
}

/* A vignette DARKENS — that is what the barrel of a lens does to light. On a
   near-black page painting the background colour at the edges is exactly that.
   On a light page it would be the opposite, so light mode tints with ink
   instead, at a fraction of the strength: white paper shows an edge shadow far
   more readily than black paper shows an edge darkening. */
:root[data-theme="light"] .optics {
  background: radial-gradient(farthest-corner circle at 50% 46%,
    transparent 46%,
    color-mix(in srgb, var(--color-text) 7%, transparent) 100%);
}
</style>
