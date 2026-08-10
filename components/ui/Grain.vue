<script setup lang="ts">
/**
 * Film grain over the whole site.
 *
 * Sits above everything, including the WebGL canvas, on purpose: grain that
 * only covered the 3D would draw a visible seam wherever the stage met the DOM.
 * One sheet over the lot reads as the image itself being grainy rather than as
 * an effect applied to part of it — which is the difference between film and a
 * texture overlay.
 *
 * The noise is generated once by feTurbulence and reused; it is a data URI so
 * there is no request, and `soft-light` keeps it from lifting the blacks the
 * whole art direction depends on. On a still frame grain is invisible, so the
 * sheet jumps between eight positions per second the way a projector does.
 */
const NOISE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
    '<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/>' +
    '<feColorMatrix type="saturate" values="0"/></filter>' +
    '<rect width="200" height="200" filter="url(#n)"/></svg>'
  )
</script>

<template>
  <div class="grain" aria-hidden="true" :style="{ backgroundImage: `url('${NOISE}')` }" />
</template>

<style scoped>
.grain {
  position: fixed;
  /* Oversized so the per-frame offset never exposes an edge. */
  inset: -60px;
  z-index: 9999;
  pointer-events: none;
  background-repeat: repeat;
  background-size: 200px 200px;
  opacity: 0.30;
  mix-blend-mode: soft-light;
  will-change: transform;
  animation: grain-jump 0.9s steps(1, end) infinite;
}

/* Eight discrete positions, not a smooth pan: grain that slides is a moving
   texture, grain that jumps is film. */
@keyframes grain-jump {
  0%   { transform: translate3d(0, 0, 0); }
  12%  { transform: translate3d(-14px, 7px, 0); }
  25%  { transform: translate3d(9px, -12px, 0); }
  37%  { transform: translate3d(-7px, -9px, 0); }
  50%  { transform: translate3d(13px, 11px, 0); }
  62%  { transform: translate3d(-11px, 4px, 0); }
  75%  { transform: translate3d(6px, 13px, 0); }
  87%  { transform: translate3d(-9px, -6px, 0); }
  100% { transform: translate3d(0, 0, 0); }
}

/* Still grain for anyone who asked for less motion — the texture survives, the
   flicker does not. Flicker is exactly the kind of thing that triggers people. */
@media (prefers-reduced-motion: reduce) {
  .grain { animation: none; opacity: 0.22; }
}

/* A light ground needs far less of it, and `soft-light` darkens there instead
   of lifting, so the amount has to come down or the page turns muddy. */
:global([data-theme='light']) .grain { opacity: 0.16; }
</style>
