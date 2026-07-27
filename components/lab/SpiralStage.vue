<script setup lang="ts">
import type { NavItem } from '~/types/nav'

/**
 * Mounts one era's Experience class (Camera → Controls → World → NavPlane →
 * Backdrop → PostProcessing) onto a canvas. Every /lab/s0N page passes in a
 * different, historically-accurate copy of the engine from
 * experience/spiral-lab/s0N/ — same mount lifecycle, different art direction.
 */
const props = withDefaults(defineProps<{
  experienceClass: new (canvas: HTMLCanvasElement) => any
  items: NavItem[]
  dark?: boolean
}>(), { dark: true })

const FOG_DARK = 0x0D0C0A
const FOG_LIGHT = 0xF5EFE8

const canvasRef = ref<HTMLCanvasElement | null>(null)
const supported = ref(true)
const ready = ref(false)
let experience: any = null

function webglSupported(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch { return false }
}

onMounted(async () => {
  await nextTick()
  if (!canvasRef.value || !webglSupported()) { supported.value = false; return }
  try {
    experience = new props.experienceClass(canvasRef.value)
  } catch (err) {
    console.warn('[SpiralStage] failed to init', err)
    supported.value = false
    return
  }
  experience.world.setNavItems(props.items, props.dark)
  experience.setFogColor(props.dark ? FOG_DARK : FOG_LIGHT)
  experience.postProcessing.setColorGrade(props.dark)
  experience.setBackdrop(props.dark)
  requestAnimationFrame(() => requestAnimationFrame(() => {
    experience?.world.reveal()
    ready.value = true
  }))
})

onBeforeUnmount(() => {
  experience?.destroy()
  experience = null
})
</script>

<template>
  <div class="ss">
    <canvas ref="canvasRef" class="ss__canvas" :class="{ 'ss__canvas--ready': ready }" />
    <p v-if="!supported" class="ss__fallback">
      This variation needs WebGL, which isn't available in this browser/device.
    </p>
    <div class="ss__ui"><slot /></div>
  </div>
</template>

<style scoped>
.ss { position: fixed; inset: 0; overflow: hidden; background: #0D0C0A; }
.ss__canvas {
  position: absolute; inset: 0; width: 100%; height: 100%; display: block;
  touch-action: none;
  opacity: 0;
  transition: opacity 0.6s ease;
}
.ss__canvas--ready { opacity: 1; }
.ss__fallback {
  position: absolute; inset: 0; display: grid; place-items: center;
  max-width: 40ch; margin: 0 auto; padding: 40px; text-align: center;
  color: #F5EFE8; font-family: ui-monospace, monospace; font-size: 13px;
}
.ss__ui { position: absolute; inset: 0; pointer-events: none; }
.ss__ui > :deep(*) { pointer-events: auto; }
</style>
