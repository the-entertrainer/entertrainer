<script setup lang="ts">
/**
 * The hero's wave field.
 *
 * A stack of horizontal rules, each displaced by two sine waves running at
 * different frequencies and speeds, with the amplitude falling off toward the
 * top and bottom edges so the field reads as a sheet being disturbed rather
 * than a row of independent squiggles. The pointer adds a local bulge.
 *
 * Deliberately 2D canvas rather than WebGL: it is a couple of dozen polylines,
 * the GPU buys nothing at this complexity, and it means the hero has no shader
 * to compile before the first paint — which matters when the whole section is
 * above the fold.
 */
const canvas = ref<HTMLCanvasElement | null>(null)

let raf = 0
let ro: ResizeObserver | undefined

onMounted(() => {
  const el = canvas.value
  if (!el) return
  const ctx = el.getContext('2d')
  if (!ctx) return

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  let w = 0, h = 0, dpr = 1
  // Pointer influence, eased toward the cursor so the bulge trails it.
  let px = -1e4, py = -1e4, tx = -1e4, ty = -1e4

  function size() {
    const r = el!.getBoundingClientRect()
    dpr = Math.min(devicePixelRatio || 1, 2)
    w = Math.max(1, r.width); h = Math.max(1, r.height)
    el!.width = Math.round(w * dpr); el!.height = Math.round(h * dpr)
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function ink() {
    // Read the token rather than hard-coding, so the contrast toggle moves the
    // waves with everything else.
    return getComputedStyle(document.documentElement).getPropertyValue('--w-ink').trim() || '#160000'
  }

  function draw(t: number) {
    raf = requestAnimationFrame(draw)
    ctx!.clearRect(0, 0, w, h)

    px += (tx - px) * 0.06
    py += (ty - py) * 0.06

    const lines = Math.max(10, Math.min(30, Math.round(h / 26)))
    const gap = h / (lines + 1)
    const time = reduce ? 0 : t * 0.00042
    const stroke = ink()

    for (let i = 1; i <= lines; i++) {
      const y0 = gap * i
      // Falloff: strongest through the middle of the field, flat at the edges.
      const edge = Math.sin((i / (lines + 1)) * Math.PI)
      ctx!.beginPath()
      for (let x = 0; x <= w; x += 6) {
        const n = x / w
        let dy =
          Math.sin(n * 6.2 + time + i * 0.32) * 11 * edge +
          Math.sin(n * 13.7 - time * 1.6 + i * 0.11) * 5 * edge

        // Pointer bulge — a soft radial push, so the sheet dents under the
        // cursor instead of snapping to it.
        const dx = x - px, d = Math.hypot(dx, y0 - py)
        if (d < 190) {
          const f = 1 - d / 190
          dy -= Math.sign(y0 - py || 1) * f * f * 34
        }
        const y = y0 + dy
        x === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y)
      }
      ctx!.strokeStyle = stroke
      ctx!.globalAlpha = 0.13 + edge * 0.3
      ctx!.lineWidth = 1
      ctx!.stroke()
    }
    ctx!.globalAlpha = 1
  }

  function onMove(e: PointerEvent) {
    const r = el!.getBoundingClientRect()
    tx = e.clientX - r.left; ty = e.clientY - r.top
  }
  function onLeave() { tx = -1e4; ty = -1e4 }

  size()
  ro = new ResizeObserver(size); ro.observe(el)
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerleave', onLeave)
  raf = requestAnimationFrame(draw)

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    ro?.disconnect()
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerleave', onLeave)
  })
})
</script>

<template>
  <canvas ref="canvas" class="wv" aria-hidden="true" />
</template>

<style scoped>
.wv { display: block; width: 100%; height: 100%; }
</style>
