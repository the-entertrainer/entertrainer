<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'
import { useGlassStore } from '~/stores/glass'
import { startGlassRenderer, type GlassRenderer } from '~/utils/glassShader'

// Fixed, fullscreen living fluted-glass gradient — the site's signature
// backdrop, available to any standalone page (e.g. About) that isn't built on
// the Three.js spiral. Shares the same glassStore params so it matches the
// loader and the spiral backdrop exactly.
const themeStore = useThemeStore()
const glassStore = useGlassStore()

const canvasEl = ref<HTMLCanvasElement | null>(null)
let renderer: GlassRenderer | null = null

const reduceMotion = import.meta.client &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function boot() {
  if (!canvasEl.value) return
  renderer?.stop()
  renderer = startGlassRenderer(canvasEl.value, themeStore.isDark, glassStore.params, { reducedMotion: reduceMotion })

  // Publish the palette to CSS so chrome and text accents match the live
  // gradient exactly. --accent-fog (primary) drives the edge fog; --grad-1..3
  // are evenly-spaced stops used by scroll-emphasised headline words.
  const cols = glassStore.params.colors
  const rgb = (c: number[]) => `${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)}`
  const root = document.documentElement.style
  root.setProperty('--accent-fog', rgb(cols[0]))
  root.setProperty('--grad-1', rgb(cols[0]))
  root.setProperty('--grad-2', rgb(cols[2]))
  root.setProperty('--grad-3', rgb(cols[4]))
}

onMounted(async () => {
  await nextTick()
  boot()
})

// Theme flip recolours the gradient (dark = glow on black, light = ink on white).
watch(() => themeStore.isDark, () => boot())

onUnmounted(() => renderer?.stop())
</script>

<template>
  <div class="glass-backdrop" aria-hidden="true">
    <canvas ref="canvasEl" class="glass-backdrop__canvas" />
    <!-- Accent-tinted edge fog — mirrors the spiral's finishing haze -->
    <div class="glass-backdrop__fog" />
  </div>
</template>

<style scoped>
.glass-backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.glass-backdrop__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
.glass-backdrop__fog {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom, rgba(var(--accent-fog, 120,120,140), 0.16) 0%, transparent 18%),
    linear-gradient(to top,    rgba(var(--accent-fog, 120,120,140), 0.16) 0%, transparent 18%);
}
</style>
