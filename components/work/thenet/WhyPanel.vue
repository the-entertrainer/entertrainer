<script setup lang="ts">
import { BASE_ORANGE, NET_ORANGE, rgbToHex } from '~/utils/thenet/palette'

// Scene 4 — THE MECHANISM. The one piece of theory the module owes the
// learner, paired with an instrument to feel it: a spacing slider that walks
// the same two colours from assimilation (the field borrows the strands'
// colour) to contrast (it pushes away). The paint never changes; the
// averaging does — and the live "measured" chip proves it.

const canvasRef = ref<HTMLCanvasElement | null>(null)
const spacing = ref(9)
const measured = ref('')

const regime = computed(() => {
  if (spacing.value <= 15) return 'assimilation'
  if (spacing.value <= 27) return 'the crossover'
  return 'contrast'
})
const regimeCopy = computed(() => {
  if (spacing.value <= 15) return 'fine weave: the field takes on the color of the strands'
  if (spacing.value <= 27) return 'the blending fades around here'
  return 'wide stripes: the two colors separate again'
})

function draw() {
  const el = canvasRef.value
  if (!el) return
  const ctx = el.getContext('2d')!
  const w = el.width
  const h = el.height
  const s = spacing.value

  ctx.fillStyle = BASE_ORANGE
  ctx.fillRect(0, 0, w, h)

  // Read the field off the actual canvas the moment it's poured — before
  // the weave goes on top. It is never repainted; only overlaid.
  const px = ctx.getImageData(Math.floor(w / 2), Math.floor(h / 2), 1, 1).data
  measured.value = rgbToHex(px[0], px[1], px[2])

  ctx.strokeStyle = NET_ORANGE
  ctx.lineWidth = Math.min(8, Math.max(1.6, s * 0.3))
  ctx.beginPath()
  for (let d = -h; d < w + h; d += s) {
    ctx.moveTo(d, 0)
    ctx.lineTo(d + h, h)
    ctx.moveTo(d, h)
    ctx.lineTo(d + h, 0)
  }
  ctx.stroke()
}

watch(spacing, draw)
onMounted(draw)
</script>

<template>
  <div class="why">
    <p class="tn-overline">04 · Why it works</p>
    <h2 class="tn-h">The Bezold effect</h2>

    <div class="why__copy">
      <p class="tn-body">
        In 1874, the meteorologist Wilhelm von Bezold noticed that changing the color of a single
        thread in a rug pattern changed how <span class="tn-em">every other color in the rug</span>
        looked.
      </p>
      <p class="tn-body">
        When thin lines of one color run through a field of another, the eye
        <span class="tn-em">blends the two together</span>. Researchers call this assimilation.
        Spread the same lines far apart and the opposite happens: contrast, where the two colors
        look more different than they are.
      </p>
    </div>

    <div class="why__lab">
      <canvas ref="canvasRef" class="why__canvas" width="760" height="240" aria-hidden="true" />
      <div class="why__controls">
        <label class="why__slider">
          <span class="why__slider-label">strand spacing</span>
          <input
            v-model.number="spacing"
            type="range"
            min="5"
            max="46"
            step="1"
            aria-label="Strand spacing — small values weave finely (assimilation), large values spread into stripes (contrast)"
          />
        </label>
        <div class="why__meta">
          <span class="why__regime" :data-regime="regime">{{ regime }}</span>
          <span class="why__chip">
            field painted <i :style="{ background: measured }" />{{ measured }}
          </span>
        </div>
      </div>
      <p class="why__caption">{{ regimeCopy }}</p>
    </div>

    <p class="tn-note">
      Move the slider. Both colors stay the same. Only the spacing changes.
    </p>
  </div>
</template>

<style scoped>
.why {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
.why__copy {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.why__lab {
  width: 100%;
  margin-top: 12px;
}
.why__canvas {
  width: 100%;
  aspect-ratio: 760 / 240;
  display: block;
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.07), 0 18px 40px -22px rgba(0, 0, 0, 0.8);
}
.why__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-top: 14px;
  flex-wrap: wrap;
}
.why__slider {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1 1 260px;
}
.why__slider-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6f6a65;
  white-space: nowrap;
}
.why__slider input {
  flex: 1;
  height: 30px;
  accent-color: #e8471a;
  touch-action: none; /* touch-drag moves the slider, not the page */
}
.why__slider input::-webkit-slider-thumb { width: 22px; height: 22px; }
.why__meta {
  display: flex;
  align-items: center;
  gap: 14px;
}
.why__regime {
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #d8d2ca;
  padding: 4px 10px;
  border: 1px solid rgba(241, 236, 230, 0.22);
  border-radius: 3px;
  min-width: 118px;
  text-align: center;
}
.why__regime[data-regime='assimilation'] { border-color: rgba(232, 71, 26, 0.55); }
.why__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8a8480;
  font-variant-numeric: tabular-nums;
}
.why__chip i {
  width: 11px;
  height: 11px;
  border-radius: 2px;
  display: inline-block;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15);
}
.why__caption {
  margin: 10px 0 0;
  font-size: 13px;
  color: #8a8480;
  text-align: center;
  min-height: 1.4em;
}
</style>
