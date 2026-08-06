<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'
import { useGlassStore } from '~/stores/glass'
import { startGlassRenderer, type GlassRenderer } from '~/utils/glassShader'

// Fixed, fullscreen backdrop shared by any standalone page (About) and the
// web-app tools.
//
// Two moods:
//  - default: the living fluted-glass gradient (the site's signature),
//    driven by the same glassStore params as the loader and spiral.
//  - calm (`calm` prop): a clean, near-solid page — white in light mode,
//    near-black in dark — with only a whisper of brand colour in the
//    corners. No WebGL, no motion. Used across the tools so the working
//    surfaces stay quiet and the content leads.
const props = defineProps<{ calm?: boolean }>()

const themeStore = useThemeStore()
const glassStore = useGlassStore()

const canvasEl = ref<HTMLCanvasElement | null>(null)
let renderer: GlassRenderer | null = null

const reduceMotion = import.meta.client &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function publishPalette() {
  // Even in calm mode the chrome expects an accent-fog tint for focus rings
  // and subtle washes. Publish the current palette's primary either way.
  const cols = glassStore.params.colors
  const rgb = (c: number[]) => `${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)}`
  const root = document.documentElement.style
  root.setProperty('--accent-fog', rgb(cols[0]))
  root.setProperty('--grad-1', rgb(cols[0]))
  root.setProperty('--grad-2', rgb(cols[2]))
  root.setProperty('--grad-3', rgb(cols[4]))
}

function boot() {
  if (props.calm) { publishPalette(); return }
  if (!canvasEl.value) return
  renderer?.stop()
  renderer = startGlassRenderer(canvasEl.value, themeStore.isDark, glassStore.params, { reducedMotion: reduceMotion })
  publishPalette()
}

onMounted(async () => {
  await nextTick()
  boot()
})

// Theme flip recolours the gradient (dark = glow on black, light = ink on white).
// Dip the canvas opacity across the reboot so the recolour eases rather than
// snapping — matches the global theme crossfade.
let themeDipTimer = 0
watch(() => themeStore.isDark, () => {
  if (props.calm) return
  const cv = canvasEl.value
  if (!cv || reduceMotion) { boot(); return }
  cv.style.opacity = '0'
  clearTimeout(themeDipTimer)
  themeDipTimer = window.setTimeout(() => {
    boot()
    requestAnimationFrame(() => { if (cv) cv.style.opacity = '1' })
  }, 300)
})

onUnmounted(() => clearTimeout(themeDipTimer))
onUnmounted(() => renderer?.stop())
</script>

<template>
  <div class="glass-backdrop" :class="{ 'glass-backdrop--calm': calm }" aria-hidden="true">
    <template v-if="!calm">
      <canvas ref="canvasEl" class="glass-backdrop__canvas" />
      <!-- Accent-tinted edge fog — mirrors the spiral's finishing haze -->
      <div class="glass-backdrop__fog" />
    </template>
    <template v-else>
      <div class="glass-backdrop__wash" />
      <div class="glass-backdrop__grain" />
    </template>
  </div>
</template>

<style scoped>
.glass-backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.glass-backdrop--calm { background: var(--color-bg); }
.glass-backdrop__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  transition: opacity 0.4s ease;
}
.glass-backdrop__fog {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom, rgba(var(--accent-fog, 120,120,140), 0.16) 0%, transparent 18%),
    linear-gradient(to top,    rgba(var(--accent-fog, 120,120,140), 0.16) 0%, transparent 18%);
}

/* Calm ground — warm paper rather than clean glass.
   The old wash was two radial gradients at 6–7% in light theme, which is to say
   invisible: every content page rendered as flat cream and the "calm backdrop"
   was doing no work at all. The site's own card artwork is torn paper, ink and
   handwriting, so the page under it should behave like stock, not like a screen:
   a warm base, light falling from one corner, and a real grain.

   Three cheap layers, all static — no animation, so this is reduced-motion safe
   by construction and costs nothing after first paint. */
.glass-backdrop__wash {
  position: absolute;
  inset: 0;
  background:
    /* the light source */
    radial-gradient(120% 90% at 88% -12%, color-mix(in srgb, var(--paper-light-source) 78%, transparent), transparent 58%),
    /* warmth pooling into the opposite corner */
    radial-gradient(100% 80% at -8% 108%, color-mix(in srgb, var(--color-accent-deep) 9%, transparent), transparent 62%),
    /* the stock itself, very slightly warmer than --color-bg so edges have depth */
    linear-gradient(168deg, color-mix(in srgb, var(--paper-warm) 12%, var(--color-bg)), var(--color-bg) 62%);
}
:root[data-theme="dark"] .glass-backdrop__wash {
  background:
    radial-gradient(120% 90% at 88% -12%, color-mix(in srgb, var(--color-accent-deep) 34%, transparent), transparent 58%),
    radial-gradient(100% 80% at -8% 108%, color-mix(in srgb, var(--paper-dark-pool) 22%, transparent), transparent 62%),
    linear-gradient(168deg, color-mix(in srgb, var(--paper-dark-stock) 70%, var(--color-bg)), var(--color-bg) 60%);
}

/* Grain. A single inline feTurbulence tile, scaled up and left to repeat — the
   technique the /lab riso prototype proved out. `mix-blend-mode` lets it darken
   the paper on light and lift it on dark from one asset, and because it is a
   data URI there is no request and nothing to cache-bust. */
.glass-backdrop__grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.42;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  background-size: 140px 140px;
}
:root[data-theme="dark"] .glass-backdrop__grain {
  opacity: 0.26;
  mix-blend-mode: screen;
}
</style>
