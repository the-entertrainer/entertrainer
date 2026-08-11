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
    <div v-else class="glass-backdrop__wash" />
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
  transition: opacity var(--dur-mid) var(--ease-out);
}
.glass-backdrop__fog {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom, rgba(var(--accent-fog, 120,120,140), 0.16) 0%, transparent 18%),
    linear-gradient(to top,    rgba(var(--accent-fog, 120,120,140), 0.16) 0%, transparent 18%);
}

/* Calm wash. This carried a hardcoded violet (#8B7CF6) from before the site
   went monochrome — every content page was quietly showing a purple corner
   tint while the home ran strict black-and-bloom, which is exactly the kind
   of mismatch this pass exists to remove. Two soft white glows now, the same
   light the stage's cards and bloom are made of, just static and low enough
   that a reading page still leads. */
.glass-backdrop__wash {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(90% 70% at 100% -8%, color-mix(in srgb, var(--glow-rim) 55%, transparent), transparent 60%),
    radial-gradient(80% 65% at -8% 108%, color-mix(in srgb, var(--glow-soft) 55%, transparent), transparent 60%);
}
:root[data-theme="dark"] .glass-backdrop__wash {
  background:
    radial-gradient(90% 70% at 100% -8%, color-mix(in srgb, #FFFFFF 10%, transparent), transparent 60%),
    radial-gradient(80% 65% at -8% 108%, color-mix(in srgb, #FFFFFF 6%, transparent), transparent 60%);
}
</style>
