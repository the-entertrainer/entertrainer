<script setup lang="ts">
import gsap from 'gsap'
import { useExperienceStore } from '~/stores/experience'
import { useThemeStore } from '~/stores/theme'
import { useGlassStore } from '~/stores/glass'
import { startGlassRenderer } from '~/utils/glassShader'

const emit = defineEmits<{ (e: 'entered'): void }>()

const experienceStore = useExperienceStore()
const themeStore       = useThemeStore()
const glassStore       = useGlassStore()
const isReady          = computed(() => experienceStore.isReady)

const loaderEl = ref<HTMLElement | null>(null)
const textEl   = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)

const reduceMotion = import.meta.client &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

let introDone = false, pendingExit = false, exitQueued = false, exiting = false
let stopGlass: (() => void) | null = null
// Live shader params the exit animation can ramp (melt the glass on the way out).
let glassLive: { warp: number; refr: number; bright: number } | null = null

function startGlass() {
  const cv = canvasEl.value
  if (!cv) return
  const renderer = startGlassRenderer(cv, themeStore.isDark, glassStore.params)
  if (!renderer) return
  glassLive = renderer.live
  stopGlass = renderer.stop
}

onMounted(async () => {
  if (import.meta.client && (document as any).fonts?.ready) { try { await (document as any).fonts.ready } catch {} }
  await nextTick()
  startGlass()
  startIntro()
})
onUnmounted(() => stopGlass?.())

function startIntro() {
  if (!textEl.value) return
  if (reduceMotion) {
    gsap.set(textEl.value, { opacity: 1, y: 0 }); introDone = true
    if (pendingExit) queueExit(); return
  }
  gsap.fromTo(textEl.value,
    { opacity: 0, y: 18, filter: 'blur(8px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', delay: 0.25,
      onComplete: () => { introDone = true; if (pendingExit) queueExit() } })
}

watch(isReady, (ready) => { if (ready) queueExit() })

function queueExit() {
  if (exitQueued || exiting) return
  if (!introDone) { pendingExit = true; return }
  exitQueued = true
  setTimeout(runExit, 900)
}

// "Dive through the glass": the shader's warp + refraction surge so the glass
// smears and melts, while the whole surface zooms toward the viewer, blurs and
// fades — as if falling through the pane into the spiral world behind it.
function runExit() {
  if (exiting || !loaderEl.value) return
  exiting = true

  if (reduceMotion) {
    experienceStore.setHasEntered()
    gsap.to(loaderEl.value, { opacity: 0, duration: 0.4, onComplete: () => emit('entered') })
    return
  }

  const tl = gsap.timeline({ onComplete: () => emit('entered') })
  tl.add(() => experienceStore.setHasEntered(), 0.25)

  // glass melts — warp + refraction blow up
  if (glassLive) {
    tl.to(glassLive, { warp: '+=0.22', duration: 1.0, ease: 'power2.in' }, 0)
      .to(glassLive, { refr: glassLive.refr * 2.8, duration: 1.0, ease: 'power2.in' }, 0)
  }
  // zoom THROUGH the pane: scale up, blur, fade
  tl.to(canvasEl.value, { scale: 1.95, filter: 'blur(18px)', opacity: 0, duration: 1.0, ease: 'power2.in' }, 0)
  // wordmark dives forward, ahead of the glass
    .to(textEl.value, { scale: 2.7, opacity: 0, filter: 'blur(12px)', duration: 0.8, ease: 'power2.in' }, 0.04)
}
</script>

<template>
  <div ref="loaderEl" class="eloader">
    <canvas ref="canvasEl" class="eloader-glass" />
    <div class="wm" :class="{ 'wm-onlight': !themeStore.isDark }">
      <span ref="textEl" class="wm-text"><em>enter</em><b>trainer</b></span>
    </div>
  </div>
</template>

<style scoped>
.eloader {
  position: fixed;
  inset: 0;
  z-index: var(--z-loader);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
}
.eloader-glass {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.wm {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: baseline;
  font-size: clamp(40px, 11vw, 84px);
  font-weight: 400;
  letter-spacing: -0.045em;
  line-height: 1;
  color: #fff;
  white-space: nowrap;
  text-shadow: 0 4px 40px rgba(0, 0, 0, 0.45), 0 1px 3px rgba(0, 0, 0, 0.5);
}
.wm.wm-onlight {
  color: #0d0c0a;
  text-shadow: 0 2px 30px rgba(255, 255, 255, 0.6), 0 1px 2px rgba(255, 255, 255, 0.7);
}
.wm-text { display: inline-block; }
.wm-text em { font-style: italic; font-weight: 400; }
.wm-text b  { font-style: normal; font-weight: 700; }
</style>
