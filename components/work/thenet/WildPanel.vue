<script setup lang="ts">
import { BASE_ORANGE, NET_ORANGE, NET_GREEN, hexToRgb } from '~/utils/thenet/palette'

// Scene 5 — IN THE WILD. The grocery aisle is a working Bezold lab. One
// fruit, painted once from the constant, re-framed three ways: the red mesh
// the industry actually uses, the same trick reversed in green, and the bare
// truth. The learner flips the frame and watches "ripeness" come and go.

type Frame = 'red' | 'green' | 'none'
const frame = ref<Frame>('red')
const canvasRef = ref<HTMLCanvasElement | null>(null)

const FRAMES: { id: Frame; label: string; caption: string }[] = [
  { id: 'red', label: 'Red mesh', caption: 'with red mesh, the fruit looks riper' },
  { id: 'green', label: 'Green mesh', caption: 'with green mesh, the same fruit looks less ripe' },
  { id: 'none', label: 'No mesh', caption: 'without mesh, the fruit as it is' }
]
const caption = computed(() => FRAMES.find((f) => f.id === frame.value)!.caption)

function shade(hex: string, amt: number): string {
  // amt > 0 lightens toward white, < 0 darkens toward black
  const [r, g, b] = hexToRgb(hex)
  const t = amt > 0 ? 255 : 0
  const a = Math.abs(amt)
  const mix = (c: number) => Math.round(c + (t - c) * a)
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`
}

function draw() {
  const el = canvasRef.value
  if (!el) return
  const ctx = el.getContext('2d')!
  const w = el.width
  const h = el.height
  const cx = w / 2
  const cy = h / 2 + 8
  const R = Math.min(w, h) * 0.36

  ctx.clearRect(0, 0, w, h)

  // soft ground shadow
  const sh = ctx.createRadialGradient(cx, cy + R * 0.92, 4, cx, cy + R * 0.92, R * 1.05)
  sh.addColorStop(0, 'rgba(0,0,0,0.42)')
  sh.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = sh
  ctx.save()
  ctx.translate(cx, cy + R * 0.92)
  ctx.scale(1, 0.28)
  ctx.translate(-cx, -(cy + R * 0.92))
  ctx.beginPath()
  ctx.arc(cx, cy + R * 0.92, R * 1.05, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // the fruit — every stop derived from the ONE constant
  const g = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.42, R * 0.08, cx, cy, R * 1.05)
  g.addColorStop(0, shade(BASE_ORANGE, 0.24))
  g.addColorStop(0.45, BASE_ORANGE)
  g.addColorStop(1, shade(BASE_ORANGE, -0.42))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.fill()

  // the mesh, clipped to the fruit and curved by simple foreshortening
  if (frame.value !== 'none') {
    const color = frame.value === 'red' ? NET_ORANGE : NET_GREEN
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, Math.PI * 2)
    ctx.clip()
    ctx.lineCap = 'round'
    const s = 30
    const weave = (col: string, width: number, alpha: number) => {
      ctx.strokeStyle = col
      ctx.lineWidth = width
      ctx.globalAlpha = alpha
      ctx.beginPath()
      for (let d = -h; d < w + h; d += s) {
        ctx.moveTo(d, cy - R)
        ctx.lineTo(d + R * 2, cy + R)
        ctx.moveTo(d, cy + R)
        ctx.lineTo(d + R * 2, cy - R)
      }
      ctx.stroke()
    }
    weave('rgba(0,0,0,0.5)', 6.4, 0.55)
    weave(color, 4.6, 1)
    weave(shade(color, 0.3), 1.4, 0.85)
    ctx.globalAlpha = 1
    ctx.restore()
  }
}

watch(frame, draw)
onMounted(draw)
</script>

<template>
  <div class="wild">
    <p class="tn-overline">05 · At the store</p>
    <h2 class="tn-h">Why oranges come in red mesh.</h2>

    <p class="tn-body">
      Oranges are usually picked before they turn fully orange. Sellers don't repaint the fruit.
      They bag it in red mesh, and the blending you just saw makes the peel
      <span class="tn-em">look riper than it is</span>. The same bag in green would push it the
      other way. Lemons are sold in yellow nets for the same reason.
    </p>

    <div class="wild__lab">
      <canvas ref="canvasRef" class="wild__canvas" width="440" height="400" aria-hidden="true" />
      <div class="wild__side">
        <div class="wild__frames" role="radiogroup" aria-label="Choose the packaging">
          <button
            v-for="f in FRAMES"
            :key="f.id"
            class="wild__frame"
            role="radio"
            :aria-checked="frame === f.id"
            :class="{ 'wild__frame--on': frame === f.id }"
            @click="frame = f.id"
          >
            {{ f.label }}
          </button>
        </div>
        <p class="wild__caption">{{ caption }}</p>
      </div>
    </div>

    <p class="tn-note">The fruit is drawn with the same color in all three options.</p>
  </div>
</template>

<style scoped>
.wild {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
.wild .tn-body { text-align: center; }

.wild__lab {
  display: grid;
  grid-template-columns: minmax(0, 440px) minmax(200px, 1fr);
  gap: clamp(20px, 4vw, 44px);
  align-items: center;
  width: 100%;
  margin-top: 10px;
}
.wild__canvas {
  width: 100%;
  aspect-ratio: 440 / 400;
  display: block;
}
.wild__side {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.wild__frames {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wild__frame {
  padding: 11px 16px;
  text-align: left;
  font-family: inherit;
  font-size: 13.5px;
  letter-spacing: 0.03em;
  color: #b9b4ae;
  background: transparent;
  border: 1px solid rgba(241, 236, 230, 0.16);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.25s ease, color 0.25s ease, background 0.25s ease;
}
.wild__frame:hover { border-color: rgba(241, 236, 230, 0.38); color: #f1ece6; }
.wild__frame--on {
  border-color: rgba(232, 71, 26, 0.7);
  color: #f1ece6;
  background: rgba(232, 71, 26, 0.08);
}
.wild__caption {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #8a8480;
  min-height: 2.8em;
}

@media (max-width: 640px) {
  .wild__lab { grid-template-columns: 1fr; }
  .wild__frames { flex-direction: row; flex-wrap: wrap; }
  .wild__frame { flex: 1 1 auto; text-align: center; }
}
</style>
