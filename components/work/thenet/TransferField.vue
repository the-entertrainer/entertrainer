<script setup lang="ts">
import { mulberry32 } from '~/utils/thenet/noise'

// Scene 4 — THE TRANSFER. Same lattice logic, stripped to the abstraction: six
// identical neutral spheres, and a "field" (overlapping translucent shapes)
// that can be brought on and off. Off, the spheres are plainly the same. On,
// each sits in a different local surround and reads as a different grey — even
// though the disc colour never changed. One toggle, three lines, no score.

const SPHERE = '#8f8b86' // the one neutral grey every sphere is drawn from
const canvasRef = ref<HTMLCanvasElement | null>(null)
const fieldOn = ref(true)

const spots: { x: number; y: number }[] = [
  { x: 0.16, y: 0.34 }, { x: 0.5, y: 0.24 }, { x: 0.84, y: 0.34 },
  { x: 0.22, y: 0.72 }, { x: 0.54, y: 0.74 }, { x: 0.82, y: 0.7 }
]

function drawSphere(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r)
  g.addColorStop(0, '#c4c0bb')
  g.addColorStop(0.5, SPHERE)
  g.addColorStop(1, '#4c4945')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  const el = canvasRef.value
  if (!el) return
  const ctx = el.getContext('2d')!
  const w = el.width
  const h = el.height
  ctx.clearRect(0, 0, w, h)

  // background field of overlapping translucent shapes (deterministic).
  if (fieldOn.value) {
    const rand = mulberry32(23)
    const hues = [18, 200, 42, 320, 150, 8]
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < 9; i++) {
      const hue = hues[i % hues.length]
      const cx = rand() * w
      const cy = rand() * h
      const r = (0.28 + rand() * 0.3) * w
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      g.addColorStop(0, `hsla(${hue}, 65%, 55%, 0.5)`)
      g.addColorStop(1, `hsla(${hue}, 65%, 55%, 0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalCompositeOperation = 'source-over'
  }

  const r = Math.min(w, h) * 0.11
  for (const s of spots) drawSphere(ctx, s.x * w, s.y * h, r)
}

watch(fieldOn, draw)
onMounted(draw)
</script>

<template>
  <div class="transfer">
    <div class="transfer__stage">
      <canvas ref="canvasRef" class="transfer__canvas" width="900" height="560" />
      <button
        class="transfer__toggle"
        type="button"
        :aria-pressed="fieldOn"
        @click="fieldOn = !fieldOn"
      >
        {{ fieldOn ? 'Remove the field' : 'Bring the field back' }}
      </button>
    </div>

    <div class="transfer__lines">
      <p>The same idea sounds average in one meeting and sharp in another.</p>
      <p>The same person is invisible on one team and unstoppable on the next.</p>
      <p>Before you judge the thread, look at the rug.</p>
    </div>
  </div>
</template>

<style scoped>
.transfer {
  display: flex;
  flex-direction: column;
  gap: clamp(36px, 8vh, 72px);
  align-items: center;
  width: 100%;
}
.transfer__stage {
  position: relative;
  width: 100%;
  max-width: 780px;
}
.transfer__canvas {
  width: 100%;
  aspect-ratio: 900 / 560;
  display: block;
  border-radius: 4px;
}
.transfer__toggle {
  position: absolute;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  padding: 9px 18px;
  border: 1px solid rgba(241, 236, 230, 0.28);
  border-radius: 4px;
  background: rgba(20, 17, 15, 0.6);
  color: #d8d3cd;
  font-size: 13px;
  letter-spacing: 0.03em;
  cursor: pointer;
  backdrop-filter: blur(4px);
}
.transfer__toggle:active { transform: translateX(-50%) scale(0.96); }

.transfer__lines {
  display: flex;
  flex-direction: column;
  gap: clamp(20px, 5vh, 40px);
  max-width: 560px;
  text-align: center;
}
.transfer__lines p {
  margin: 0;
  color: #8a8480;
  font-size: clamp(16px, 2.4vw, 21px);
  font-weight: 300;
  line-height: 1.5;
}
</style>
