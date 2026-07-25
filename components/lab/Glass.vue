<script setup lang="ts">
import { createLiquidGlass, type Backdrop, type GlassOptions } from '~/utils/liquidGlass'

/**
 * Drops a Liquid Glass canvas behind the page and turns any element carrying
 * `data-glass` into a real refracting panel: its DOM rect is measured every
 * frame and handed to the shader, so the glass tracks layout, scroll and
 * animation exactly. Content stays in the DOM — selectable, accessible,
 * responsive — while the optics happen underneath it.
 */
const props = withDefaults(defineProps<{
  backdrop?: Backdrop
  colors?: [string, string, string]
  tint?: string
  refraction?: number
  aberration?: number
  specular?: number
  edge?: number
  vignette?: number
  /** Page text colour, applied to the wrapper. */
  ink?: string
}>(), { backdrop: 'mesh', ink: '#FFFFFF' })

const canvas = ref<HTMLCanvasElement | null>(null)
const root = ref<HTMLElement | null>(null)
let engine: ReturnType<typeof createLiquidGlass> = null
let raf = 0

function sync() {
  raf = requestAnimationFrame(sync)
  const host = root.value, eng = engine
  if (!host || !eng) return
  const nodes = host.querySelectorAll<HTMLElement>('[data-glass]')
  const panels = []
  for (let i = 0; i < nodes.length && panels.length < 10; i++) {
    const el = nodes[i]
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue
    // Radius comes from the element's own CSS, so DOM and shader agree.
    const cs = getComputedStyle(el)
    const radius = parseFloat(cs.borderTopLeftRadius) || 18
    panels.push({
      x: r.left, y: r.top, w: r.width, h: r.height,
      r: Math.min(radius, Math.min(r.width, r.height) / 2),
      lift: parseFloat(el.dataset.lift ?? '0.5'),
      tintAmount: parseFloat(el.dataset.tint ?? '0')
    })
  }
  eng.setPanels(panels)
}

onMounted(() => {
  if (!canvas.value) return
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const cfg: GlassOptions = {
    canvas: canvas.value,
    backdrop: props.backdrop,
    colors: props.colors,
    tint: props.tint,
    refraction: props.refraction,
    aberration: props.aberration,
    specular: props.specular,
    edge: props.edge,
    vignette: props.vignette,
    speed: reduce ? 0 : 1
  }
  engine = createLiquidGlass(cfg)
  raf = requestAnimationFrame(sync)
})
onBeforeUnmount(() => { cancelAnimationFrame(raf); engine?.dispose(); engine = null })
</script>

<template>
  <div ref="root" class="lg" :style="{ color: ink }">
    <canvas ref="canvas" class="lg__cv" />
    <div class="lg__ui"><slot /></div>
  </div>
</template>

<style scoped>
.lg { position: fixed; inset: 0; overflow: hidden; background: #0b0b10; }
.lg__cv { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.lg__ui { position: absolute; inset: 0; }
/* Panels are drawn by the shader — the DOM element itself must stay invisible
   but keep its box, so it can be measured and can host real, selectable text. */
:slotted([data-glass]) { background: transparent !important; }
</style>
