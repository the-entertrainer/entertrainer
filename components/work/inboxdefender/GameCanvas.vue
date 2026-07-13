<script setup lang="ts">
import { DefenderEngine, RW, RH } from '~/utils/inboxdefender/engine'
import type { ResolveEvent } from '~/utils/inboxdefender/engine'
import { buildRound } from '~/utils/inboxdefender/items'
import { useInboxDefenderStore } from '~/stores/inboxDefender'
import { vibrate } from '~/utils/doombox/haptics'

// Owns the <canvas> and the arcade engine. The surrounding console drives it
// (d-pad → cannon, A → fire) via the exposed methods; desktop gets keyboard +
// mouse-aim through the engine's own listeners. Resolutions flow to the store
// (score/integrity/log) and bubble up as `feedback` for the on-screen toast.
const emit = defineEmits<{ (e: 'feedback', payload: ResolveEvent): void }>()
const store = useInboxDefenderStore()

const wrap = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
let engine: DefenderEngine | null = null
let ro: ResizeObserver | null = null

function fit() {
  if (!wrap.value || !canvas.value) return
  const r = wrap.value.getBoundingClientRect()
  const scale = Math.min(r.width / RW, r.height / RH)
  canvas.value.style.width = `${Math.floor(RW * scale)}px`
  canvas.value.style.height = `${Math.floor(RH * scale)}px`
}

onMounted(() => {
  if (!canvas.value) return
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  engine = new DefenderEngine(canvas.value, {
    items: buildRound(),
    reduced,
    onResolve: (e) => {
      store.resolve(e)
      vibrate(e.correct ? 'tap' : 'hit')
      emit('feedback', e)
    },
    onIntegrity: (v) => store.setIntegrity(v),
    onEnd: (outcome) => store.end(outcome)
  })
  engine.start()
  fit()
  ro = new ResizeObserver(fit)
  ro.observe(wrap.value!)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  engine?.stop()
  engine = null
})

defineExpose({
  setDir: (d: number) => engine?.setDir(d),
  fire: () => engine?.fire()
})
</script>

<template>
  <div ref="wrap" class="id-stage">
    <canvas ref="canvas" class="id-canvas" aria-label="Inbox Defender — shoot the phishing, spare the real mail" />
  </div>
</template>

<style scoped>
.id-stage {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #05060b;
  overflow: hidden;
}
.id-canvas {
  display: block;
  cursor: crosshair;
}
</style>
