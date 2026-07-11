<script setup lang="ts">
import { BASE_ORANGE, NET_ORANGE, PROOF_GREY, rgbToHex } from '~/utils/thenet/palette'

// Scene 3 — THE PROOF. Two render states of the SAME peel: one laced with
// the net, one bare. The eyedropper reads real pixels off the real canvas —
// nothing is hardcoded to "win". The peel in both panels is painted from the
// one BASE_ORANGE constant, so any peel sample returns the identical hex.
// The gap between what the learner measures and what they saw a scene ago is
// the lesson; we let the numbers do the talking.

const SPACING = 26 // net cell size, canvas px

const underRef = ref<HTMLCanvasElement | null>(null)
const bareRef = ref<HTMLCanvasElement | null>(null)
const loupeRef = ref<HTMLCanvasElement | null>(null)

interface Reading { hex: string; rgb: [number, number, number] }
const underReading = ref<Reading | null>(null)
const bareReading = ref<Reading | null>(null)
const showChannels = ref(false)

const loupe = reactive({ visible: false, x: 0, y: 0, hex: '' })

const match = computed(
  () => !!underReading.value && !!bareReading.value && underReading.value.hex === bareReading.value.hex
)

function paintPeel(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Perfectly flat, straight from the constant — so a peel sample returns
  // exactly BASE_ORANGE wherever the learner clicks.
  ctx.fillStyle = BASE_ORANGE
  ctx.fillRect(0, 0, w, h)
}

function paintNet(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Diamond weave with a rounded, thread-like profile: a dark underside, the
  // strand colour, and a thin lit core. The peel between strands stays pure.
  ctx.lineCap = 'round'
  const pass = (color: string, width: number, alpha: number) => {
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.globalAlpha = alpha
    ctx.beginPath()
    for (let d = -h; d < w + h; d += SPACING) {
      ctx.moveTo(d, 0)
      ctx.lineTo(d + h, h)
      ctx.moveTo(d, h)
      ctx.lineTo(d + h, 0)
    }
    ctx.stroke()
  }
  pass('#8f2508', 4.6, 0.9) // shadowed underside
  pass(NET_ORANGE, 3.2, 1) // the strand
  pass('#ff8a54', 1.1, 0.8) // lit core
  ctx.globalAlpha = 1
}

function draw() {
  for (const [el, withNet] of [
    [underRef.value, true],
    [bareRef.value, false]
  ] as const) {
    if (!el) continue
    const ctx = el.getContext('2d')!
    paintPeel(ctx, el.width, el.height)
    if (withNet) paintNet(ctx, el.width, el.height)
  }
}

function readPixel(el: HTMLCanvasElement, x: number, y: number): Reading {
  const px = el.getContext('2d')!.getImageData(x, y, 1, 1).data
  return { hex: rgbToHex(px[0], px[1], px[2]), rgb: [px[0], px[1], px[2]] }
}

function canvasPoint(el: HTMLCanvasElement, e: MouseEvent) {
  const rect = el.getBoundingClientRect()
  return {
    x: Math.min(el.width - 1, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * el.width))),
    y: Math.min(el.height - 1, Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * el.height)))
  }
}

/** A guaranteed-peel coordinate: the centre of a diamond cell. */
function gapPoint(el: HTMLCanvasElement) {
  const s = SPACING
  return { x: s * 6 + s / 2, y: s * 6 }
}

function sampleClick(which: 'under' | 'bare', e: MouseEvent) {
  const el = which === 'under' ? underRef.value : bareRef.value
  if (!el) return
  const { x, y } = canvasPoint(el, e)
  const r = readPixel(el, x, y)
  if (which === 'under') underReading.value = r
  else bareReading.value = r
}

function sampleKey(which: 'under' | 'bare') {
  const el = which === 'under' ? underRef.value : bareRef.value
  if (!el) return
  const { x, y } = gapPoint(el)
  const r = readPixel(el, x, y)
  if (which === 'under') underReading.value = r
  else bareReading.value = r
}

// ── the loupe: an honest magnifier over the actual pixels ──
function moveLoupe(which: 'under' | 'bare', e: MouseEvent) {
  const el = which === 'under' ? underRef.value : bareRef.value
  const lc = loupeRef.value
  if (!el || !lc) return
  const { x, y } = canvasPoint(el, e)
  const zoom = 9
  const cells = 13
  const half = Math.floor(cells / 2)
  const ctx = lc.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, lc.width, lc.height)
  ctx.drawImage(el, x - half, y - half, cells, cells, 0, 0, cells * zoom, cells * zoom)
  // centre pixel outline
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(half * zoom + 0.5, half * zoom + 0.5, zoom - 1, zoom - 1)

  const wrapRect = (e.currentTarget as HTMLElement).closest('.proof')!.getBoundingClientRect()
  loupe.visible = true
  loupe.x = e.clientX - wrapRect.left
  loupe.y = e.clientY - wrapRect.top
  loupe.hex = readPixel(el, x, y).hex
}
function hideLoupe() {
  loupe.visible = false
}

onMounted(draw)
</script>

<template>
  <div class="proof">
    <p class="tn-overline">03 · Proof</p>
    <h2 class="tn-h">Measure it yourself.</h2>
    <p class="tn-body">
      The eyedropper below reads the actual pixels on your screen, live. Sample the peel in both
      panels as often as you like.
      <span class="tn-dim">If you land on a strand, you'll get the strand's color instead.</span>
    </p>

    <div class="proof__panels">
      <figure class="panel">
        <figcaption class="panel__head">
          <span class="panel__label">A — under the net</span>
          <span v-if="underReading" class="panel__chip">
            <i :style="{ background: underReading.hex }" />{{ underReading.hex }}
          </span>
        </figcaption>
        <canvas
          ref="underRef"
          class="panel__canvas"
          width="360"
          height="300"
          tabindex="0"
          role="button"
          aria-label="Sample the peel seen through the net. Enter samples between the strands."
          @click="(e) => sampleClick('under', e)"
          @keydown.enter.prevent="sampleKey('under')"
          @mousemove="(e) => moveLoupe('under', e)"
          @mouseleave="hideLoupe"
        />
      </figure>

      <figure class="panel">
        <figcaption class="panel__head">
          <span class="panel__label">B — open air</span>
          <span v-if="bareReading" class="panel__chip">
            <i :style="{ background: bareReading.hex }" />{{ bareReading.hex }}
          </span>
        </figcaption>
        <canvas
          ref="bareRef"
          class="panel__canvas"
          width="360"
          height="300"
          tabindex="0"
          role="button"
          aria-label="Sample the bare peel."
          @click="(e) => sampleClick('bare', e)"
          @keydown.enter.prevent="sampleKey('bare')"
          @mousemove="(e) => moveLoupe('bare', e)"
          @mouseleave="hideLoupe"
        />
      </figure>

      <!-- the magnifier -->
      <div
        v-show="loupe.visible"
        class="loupe"
        :style="{ left: loupe.x + 'px', top: loupe.y + 'px' }"
        aria-hidden="true"
      >
        <canvas ref="loupeRef" width="117" height="117" />
        <span class="loupe__hex">{{ loupe.hex }}</span>
      </div>
    </div>

    <!-- readings on neutral grey so nothing around them can tint the judgement -->
    <div class="proof__readings" :style="{ background: PROOF_GREY }">
      <div class="reading">
        <div class="reading__chip" :style="{ background: underReading?.hex || 'transparent' }">
          <span v-if="!underReading" class="reading__empty">sample A</span>
        </div>
        <p class="reading__hex">{{ underReading?.hex || '·' }}</p>
        <p v-if="showChannels && underReading" class="reading__rgb">
          R {{ underReading.rgb[0] }} · G {{ underReading.rgb[1] }} · B {{ underReading.rgb[2] }}
        </p>
      </div>
      <div class="reading reading--verdict">
        <p v-if="match" class="reading__match">=</p>
        <p v-else class="reading__await">sample both</p>
      </div>
      <div class="reading">
        <div class="reading__chip" :style="{ background: bareReading?.hex || 'transparent' }">
          <span v-if="!bareReading" class="reading__empty">sample B</span>
        </div>
        <p class="reading__hex">{{ bareReading?.hex || '·' }}</p>
        <p v-if="showChannels && bareReading" class="reading__rgb">
          R {{ bareReading.rgb[0] }} · G {{ bareReading.rgb[1] }} · B {{ bareReading.rgb[2] }}
        </p>
      </div>
    </div>

    <p class="proof__line">Your eyes don't measure color. They compare it.</p>

    <!-- the module is about colour, so offer a reading that doesn't depend on it -->
    <label class="tn-toggle">
      <input v-model="showChannels" type="checkbox" />
      <span>Show RGB values</span>
    </label>
  </div>
</template>

<style scoped>
.proof {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
}
.proof .tn-body { text-align: center; }

.proof__panels {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(16px, 3.5vw, 36px);
  width: 100%;
  margin-top: 10px;
}
.panel { margin: 0; }
.panel__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  min-height: 22px;
}
.panel__label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6f6a65;
}
.panel__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: #b9b4ae;
}
.panel__chip i {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  display: inline-block;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15);
}
.panel__canvas {
  width: 100%;
  aspect-ratio: 360 / 300;
  display: block;
  border-radius: 4px;
  cursor: crosshair;
  outline: none;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.07), 0 18px 40px -22px rgba(0, 0, 0, 0.8);
}
.panel__canvas:focus-visible { box-shadow: 0 0 0 2px rgba(241, 236, 230, 0.8); }

.loupe {
  position: absolute;
  transform: translate(18px, -130%);
  pointer-events: none;
  z-index: 4;
}
.loupe canvas {
  display: block;
  width: 117px;
  height: 117px;
  border-radius: 9999px;
  box-shadow: 0 0 0 1.5px rgba(241, 236, 230, 0.65), 0 10px 28px rgba(0, 0, 0, 0.6);
}
.loupe__hex {
  position: absolute;
  left: 50%;
  bottom: -22px;
  transform: translateX(-50%);
  font-size: 11px;
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
  color: #d8d2ca;
  background: rgba(20, 17, 15, 0.85);
  padding: 2px 7px;
  border-radius: 3px;
}

.proof__readings {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: clamp(12px, 3vw, 28px);
  width: 100%;
  padding: 22px clamp(18px, 4vw, 44px);
  border-radius: 4px;
  margin-top: 6px;
}
.reading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.reading__chip {
  width: 100%;
  height: clamp(56px, 9vw, 84px);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);
}
.reading__empty {
  color: rgba(20, 17, 15, 0.45);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.reading__hex {
  margin: 0;
  color: #1c1a18;
  font-size: clamp(17px, 2.4vw, 23px);
  font-weight: 600;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}
.reading__rgb {
  margin: 0;
  color: rgba(28, 26, 24, 0.72);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.reading--verdict { min-width: 64px; }
.reading__match {
  margin: 0;
  font-family: 'Fraunces', serif;
  font-size: 40px;
  color: #1c1a18;
}
.reading__await {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(28, 26, 24, 0.5);
  text-align: center;
}

.proof__line {
  margin: 8px 0 0;
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: clamp(17px, 2.2vw, 21px);
  color: #b9b4ae;
  text-align: center;
}

@media (max-width: 640px) {
  .proof__panels { grid-template-columns: 1fr; }
  .loupe { display: none; }
}
</style>
