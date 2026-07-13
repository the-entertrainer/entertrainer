<script setup lang="ts">
import { DoomEngine } from '~/utils/doombox/engine'
import { SPECIMENS } from '~/utils/doombox/emails'
import { useDoomboxStore } from '~/stores/doombox'
import { vibrate } from '~/utils/doombox/haptics'

// Owns the <canvas> and the engine. Controls come from the surrounding
// console (d-pad / A button) via the exposed methods; desktop keyboard and
// pointer-lock mouse still work through the engine's own listeners. The
// parent gets `hit` when the player shoots a threat and drives pause/resume/
// kill while the puzzle is open.
const emit = defineEmits<{ (e: 'hit', id: number): void; (e: 'shoot'): void }>()
const store = useDoomboxStore()

const wrap = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
let engine: DoomEngine | null = null
let ro: ResizeObserver | null = null

const threatKinds = Object.fromEntries(SPECIMENS.map((s) => [s.id, s.kind])) as Record<number, 'spam' | 'virus'>

function fit() {
  if (!wrap.value || !canvas.value) return
  const r = wrap.value.getBoundingClientRect()
  const scale = Math.min(r.width / 480, r.height / 300)
  canvas.value.style.width = `${Math.floor(480 * scale)}px`
  canvas.value.style.height = `${Math.floor(300 * scale)}px`
}

onMounted(() => {
  if (!canvas.value) return
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  engine = new DoomEngine(canvas.value, {
    reduced,
    threatKinds,
    onShoot: () => emit('shoot'),
    onHitThreat: (id) => {
      engine?.pause()
      emit('hit', id)
    },
    onPlayerHit: (dmg) => {
      vibrate('hit')
      store.damage(dmg)
    }
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

// ── control surface for the console / parent ──
defineExpose({
  resume: () => engine?.resume(),
  kill: (id: number) => engine?.killThreat(id),
  setMove: (f: number, s: number) => engine?.setMove(f, s),
  setTurn: (t: number) => engine?.setTurn(t),
  fire: () => engine?.fire()
})
</script>

<template>
  <div ref="wrap" class="db-stage">
    <canvas ref="canvas" class="db-canvas" aria-label="DOOMBOX — email server, first person" />
  </div>
</template>

<style scoped>
.db-stage {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #05060b;
  overflow: hidden;
}
.db-canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  cursor: crosshair;
  display: block;
}
</style>
