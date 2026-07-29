<script setup lang="ts">
import Stage, { type Concept } from '~/experience/lab/Stage'
import type { NavItem } from '~/types/nav'

const props = defineProps<{ concept: Concept; items: NavItem[] }>()
const emit = defineEmits<{ select: [item: NavItem] }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const supported = ref(true)
const ready = ref(false)
let stage: Stage | null = null

function webglSupported(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch { return false }
}

onMounted(async () => {
  await nextTick()
  if (!canvasRef.value || !webglSupported()) { supported.value = false; return }
  try {
    stage = new Stage(canvasRef.value, props.concept, props.items, (item) => emit('select', item))
  } catch (err) {
    console.warn('[SpatialStage] init failed', err)
    supported.value = false
    return
  }
  requestAnimationFrame(() => { ready.value = true })
})

onBeforeUnmount(() => { stage?.destroy(); stage = null })
</script>

<template>
  <div class="sp">
    <canvas ref="canvasRef" class="sp__cv" :class="{ 'is-ready': ready }" />
    <p v-if="!supported" class="sp__fallback">
      This concept is rendered in WebGL, which isn’t available here.
    </p>
    <div class="sp__ui"><slot /></div>
  </div>
</template>

<style scoped>
.sp { position: absolute; inset: 0; overflow: hidden; }
.sp__cv {
  position: absolute; inset: 0; width: 100%; height: 100%; display: block;
  touch-action: none;
  opacity: 0; transition: opacity 0.7s ease;
}
.sp__cv.is-ready { opacity: 1; }
.sp__fallback {
  position: absolute; inset: 0; display: grid; place-items: center;
  margin: 0; padding: 40rem; text-align: center;
  font-family: var(--mono-font); font-size: 13rem; color: currentColor; opacity: 0.7;
}
.sp__ui { position: absolute; inset: 0; pointer-events: none; }
.sp__ui :deep(a), .sp__ui :deep(button) { pointer-events: auto; }
@media (prefers-reduced-motion: reduce) { .sp__cv { transition: none; } }
</style>
