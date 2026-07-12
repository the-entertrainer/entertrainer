<script setup lang="ts">
import { DoomEngine } from '~/utils/doombox/engine'
import { SPECIMENS } from '~/utils/doombox/emails'

// Owns the <canvas>, the engine, resolution scaling, and touch controls.
// The parent gets a `hit` event when the player shoots a threat, and drives
// pause/resume/kill through the exposed methods while the puzzle is open.
const emit = defineEmits<{ (e: 'hit', id: number): void; (e: 'shoot'): void }>()

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

// ── control surface for the parent ──
function resume() {
  engine?.resume()
}
function kill(id: number) {
  engine?.killThreat(id)
}
defineExpose({ resume, kill })

// ── touch controls ──
const stick = ref({ active: false, ox: 0, oy: 0, dx: 0, dy: 0 })
function stickStart(e: PointerEvent) {
  stick.value = { active: true, ox: e.clientX, oy: e.clientY, dx: 0, dy: 0 }
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}
function stickMove(e: PointerEvent) {
  if (!stick.value.active) return
  const dx = Math.max(-40, Math.min(40, e.clientX - stick.value.ox))
  const dy = Math.max(-40, Math.min(40, e.clientY - stick.value.oy))
  stick.value.dx = dx
  stick.value.dy = dy
  engine?.setMove(-dy / 40, dx / 40)
}
function stickEnd() {
  stick.value.active = false
  stick.value.dx = stick.value.dy = 0
  engine?.setMove(0, 0)
}

let lookId = -1
let lookX = 0
function lookStart(e: PointerEvent) {
  lookId = e.pointerId
  lookX = e.clientX
}
function lookMove(e: PointerEvent) {
  if (e.pointerId !== lookId) return
  engine?.addLook((e.clientX - lookX) * 0.006)
  lookX = e.clientX
}
function lookEnd(e: PointerEvent) {
  if (e.pointerId === lookId) lookId = -1
}
function touchFire() {
  engine?.fire()
}
</script>

<template>
  <div ref="wrap" class="db-stage">
    <canvas ref="canvas" class="db-canvas" aria-label="DOOMBOX — email server, first person" />

    <!-- touch controls: only surfaced on coarse pointers -->
    <div class="db-touch">
      <div
        class="db-stick"
        @pointerdown="stickStart"
        @pointermove="stickMove"
        @pointerup="stickEnd"
        @pointercancel="stickEnd"
      >
        <span class="db-stick__nub" :style="{ transform: `translate(${stick.dx}px, ${stick.dy}px)` }" />
        <span class="db-stick__label">MOVE</span>
      </div>
      <div
        class="db-look"
        @pointerdown="lookStart"
        @pointermove="lookMove"
        @pointerup="lookEnd"
        @pointercancel="lookEnd"
      >
        <span class="db-look__label">LOOK</span>
      </div>
      <button class="db-fire" type="button" @pointerdown.prevent="touchFire">FIRE</button>
    </div>
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

/* touch layer — hidden unless the primary pointer is coarse (a finger) */
.db-touch {
  display: none;
}
@media (pointer: coarse) {
  .db-touch {
    display: block;
  }
}
.db-stick,
.db-look {
  position: absolute;
  bottom: 22px;
  width: 108px;
  height: 108px;
  border-radius: 50%;
  border: 2px solid rgba(124, 77, 255, 0.5);
  background: rgba(124, 77, 255, 0.08);
  touch-action: none;
  user-select: none;
}
.db-stick {
  left: 20px;
}
.db-look {
  right: 20px;
  border-radius: 16px;
}
.db-stick__nub {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 44px;
  height: 44px;
  margin: -22px 0 0 -22px;
  border-radius: 50%;
  background: rgba(124, 77, 255, 0.75);
}
.db-stick__label,
.db-look__label {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 8px;
  text-align: center;
  font-size: 9px;
  letter-spacing: 0.2em;
  color: rgba(200, 190, 255, 0.7);
}
.db-fire {
  position: absolute;
  right: 150px;
  bottom: 44px;
  width: 74px;
  height: 74px;
  border-radius: 50%;
  border: 2px solid #39ff88;
  background: rgba(57, 255, 136, 0.14);
  color: #39ff88;
  font-size: 12px;
  letter-spacing: 0.15em;
  touch-action: none;
}
</style>
