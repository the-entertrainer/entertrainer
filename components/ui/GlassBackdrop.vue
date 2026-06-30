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

  // Publish the primary accent so the edge fog matches the gradient. The
  // Three.js backdrop sets this on the home route; on standalone pages we do it.
  const c = glassStore.params.colors[0]
  document.documentElement.style.setProperty(
    '--accent-fog',
    `${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)}`,
  )
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
