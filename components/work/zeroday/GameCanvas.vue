<script setup lang="ts">
import { ZeroDayEngine, RW, RH } from '~/utils/zeroday/engine'
import { SpriteBank } from '~/utils/zeroday/sprites'
import { generateLevel } from '~/utils/zeroday/mapgen'
import { useZeroDayStore } from '~/stores/zeroday'
import { vibrate } from '~/utils/doombox/haptics'

// Loads the CC0 art, generates a fresh procedural level, runs the engine, and
// scales the low-res canvas to fill the LCD with a crunchy pixel look. The
// console pad drives it through the exposed methods.
const store = useZeroDayStore()
const wrap = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const loading = ref(true)
let engine: ZeroDayEngine | null = null
let ro: ResizeObserver | null = null
let lastHp = 5

function fit() {
  if (!wrap.value || !canvas.value) return
  const r = wrap.value.getBoundingClientRect()
  const scale = Math.min(r.width / RW, r.height / RH)
  canvas.value.style.width = `${Math.round(RW * scale)}px`
  canvas.value.style.height = `${Math.round(RH * scale)}px`
}

onMounted(async () => {
  const bank = new SpriteBank()
  await bank.load()
  if (!canvas.value) return
  loading.value = false
  await nextTick()
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const level = generateLevel()
  engine = new ZeroDayEngine(canvas.value, bank, level, {
    reduced,
    onHp: (v) => {
      if (v < lastHp) vibrate('hit')
      lastHp = v
      store.setHp(v)
    },
    onKill: () => store.addKill(),
    onProgress: (p) => store.setProgress(p),
    onShield: (s) => store.setShield(s),
    onExtract: () => store.extract()
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
  setMove: (d: number) => engine?.setMove(d),
  setUp: (v: boolean) => engine?.setUp(v),
  setDown: (v: boolean) => engine?.setDown(v),
  setFire: (v: boolean) => engine?.setFire(v),
  jump: () => engine?.jump()
})
</script>

<template>
  <div ref="wrap" class="zd-stage">
    <canvas ref="canvas" class="zd-canvas" aria-label="ZERO DAY — run and gun" />
    <div v-if="loading" class="zd-load">LOADING…</div>
  </div>
</template>

<style scoped>
.zd-stage {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #05060b;
  overflow: hidden;
}
.zd-canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  display: block;
}
.zd-load {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #39ff88;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  letter-spacing: 0.15em;
}
</style>
