<script setup lang="ts">
/**
 * True halftone — not a CSS filter pretending to be one.
 *
 * A rotated dot screen where every dot's radius comes from the actual
 * luminance of the source pixel underneath it, the same technique the /lab
 * "Press" WebGL concept uses on its cards, ported to plain Canvas 2D so every
 * ordinary photograph on the site — the About portraits, the SEWA Chronicles
 * pages — gets the same material rather than a grayscale filter standing in
 * for it.
 *
 * The real <img> stays in the DOM underneath the canvas: it carries the alt
 * text (accessibility, SEO), and it's what a visitor sees if the canvas ever
 * fails to compute — a desaturated photo instead of a blank box.
 */
const props = withDefaults(defineProps<{
  src: string
  alt: string
  /** CSS aspect-ratio, e.g. "4/5". Omit to let the image's own ratio decide. */
  ratio?: string
  angle?: number
  /** Dot pitch in CSS px at 1x. */
  cell?: number
  eager?: boolean
}>(), { angle: 15, cell: 4.5 })

const wrap = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const ready = ref(false)
let ro: ResizeObserver | null = null
let raf = 0
let img: HTMLImageElement | null = null

function render() {
  const el = wrap.value, cv = canvas.value, im = img
  if (!el || !cv || !im || !im.complete || !im.naturalWidth) return

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  const w = Math.max(1, Math.round(el.clientWidth * dpr))
  const h = Math.max(1, Math.round(el.clientHeight * dpr))
  if (w < 2 || h < 2) return

  cv.width = w
  cv.height = h

  // Cover-fit crop of the source image into a w×h working canvas.
  const src = document.createElement('canvas')
  src.width = w
  src.height = h
  const sctx = src.getContext('2d', { willReadFrequently: true })!
  const ir = im.naturalWidth / im.naturalHeight
  const br = w / h
  let sw = im.naturalWidth, sh = im.naturalHeight, sx = 0, sy = 0
  if (ir > br) { sw = im.naturalHeight * br; sx = (im.naturalWidth - sw) / 2 }
  else { sh = im.naturalWidth / br; sy = (im.naturalHeight - sh) / 2 }
  sctx.drawImage(im, sx, sy, sw, sh, 0, 0, w, h)
  const data = sctx.getImageData(0, 0, w, h).data

  const ctx = cv.getContext('2d')!
  const paper = getComputedStyle(el).getPropertyValue('--press-paper') || '#ECE9E2'
  const ink = getComputedStyle(el).getPropertyValue('--press-ink') || '#0E0D0D'
  ctx.fillStyle = paper.trim() || '#ECE9E2'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = ink.trim() || '#0E0D0D'

  const cell = props.cell * dpr
  const rad = (props.angle * Math.PI) / 180
  const cosA = Math.cos(rad), sinA = Math.sin(rad)
  const cx = w / 2, cy = h / 2

  // Tight rotated-space bounding box covering the canvas — the four corners,
  // rotated into screen-space, give the exact u/v range to iterate; no wasted
  // cells outside the visible area.
  const corners = [[0, 0], [w, 0], [0, h], [w, h]]
  let uMin = Infinity, uMax = -Infinity, vMin = Infinity, vMax = -Infinity
  for (const [px, py] of corners) {
    const dx = px - cx, dy = py - cy
    const u = dx * cosA + dy * sinA
    const v = -dx * sinA + dy * cosA
    if (u < uMin) uMin = u; if (u > uMax) uMax = u
    if (v < vMin) vMin = v; if (v > vMax) vMax = v
  }

  for (let v = vMin; v <= vMax; v += cell) {
    for (let u = uMin; u <= uMax; u += cell) {
      const x = cx + u * cosA - v * sinA
      const y = cy + u * sinA + v * cosA
      if (x < 0 || x >= w || y < 0 || y >= h) continue
      const idx = (Math.floor(y) * w + Math.floor(x)) * 4
      let lum = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255
      // Same tone curve the home card's shader uses: open the shadows before
      // screening, so dark artwork reads as dots rather than a solid mass.
      // Without this the DOM halftone crushed everything below mid-grey while
      // the reference card next door did not.
      lum = Math.min(1, Math.max(0, lum * 1.02 + 0.10))
      const radius = (cell / 2) * Math.sqrt(Math.max(0, 1 - lum)) * 1.06
      if (radius < 0.3) continue
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ready.value = true
}

function schedule() {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(render)
}

onMounted(() => {
  // This Image is never attached to the DOM — it exists only to be sampled
  // onto the working canvas — so `loading="lazy"` must not be set on it: a
  // detached element has no viewport position for the browser's lazy-load
  // heuristic to measure, and at least one engine responds by deferring the
  // fetch indefinitely. Lazy-loading belongs on the real, visible <img>
  // fallback below (which does have a position), not on this one.
  img = new Image()
  img.decoding = 'async'
  img.src = props.src
  const onLoaded = () => schedule()
  if (img.complete && img.naturalWidth) schedule()
  else img.addEventListener('load', onLoaded, { once: true })

  if (wrap.value && 'ResizeObserver' in window) {
    ro = new ResizeObserver(() => schedule())
    ro.observe(wrap.value)
  }
})

onBeforeUnmount(() => { ro?.disconnect(); cancelAnimationFrame(raf) })
</script>

<template>
  <figure ref="wrap" class="ht" :style="ratio ? { aspectRatio: ratio } : {}">
    <img :src="src" :alt="alt" class="ht__img" :loading="eager ? 'eager' : 'lazy'" :decoding="eager ? 'sync' : 'async'">
    <canvas ref="canvas" class="ht__cv" :class="{ 'is-ready': ready }" aria-hidden="true" />
  </figure>
</template>

<style scoped>
.ht {
  position: relative;
  margin: 0;
  overflow: hidden;
  background: var(--press-paper-dim);
}
.ht__img {
  display: block;
  width: 100%; height: 100%;
  object-fit: cover;
  filter: grayscale(1) contrast(1.15) brightness(0.98);
}
.ht__cv {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease;
}
.ht__cv.is-ready { opacity: 1; }
@media (prefers-reduced-motion: reduce) { .ht__cv { transition: none; } }
</style>
