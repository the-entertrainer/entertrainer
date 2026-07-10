<script setup lang="ts">
import { BASE_ORANGE, NET_ORANGE, PROOF_GREY, rgbToHex } from '~/utils/thenet/palette'

// Scene 3 — THE PROOF. Two render states of the SAME peel: one laced with the
// net, one bare. The learner samples real pixels off a real canvas; the peel
// reads identical every time because it was painted from the one BASE_ORANGE
// constant. Nothing here is hardcoded to "win" — rgbToHex reads whatever the
// canvas actually holds. The gap between the measurement and what they saw a
// moment ago is the entire lesson, so we don't narrate it.

const CELL = 26 // net spacing, px in canvas space
const underRef = ref<HTMLCanvasElement | null>(null)
const bareRef = ref<HTMLCanvasElement | null>(null)

interface Reading { hex: string; rgb: [number, number, number] }
const underReading = ref<Reading | null>(null)
const bareReading = ref<Reading | null>(null)
const showChannels = ref(false)

function paintPeel(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Flat peel, straight from the constant — so any sampled peel pixel returns
  // exactly BASE_ORANGE, wherever the learner clicks.
  ctx.fillStyle = BASE_ORANGE
  ctx.fillRect(0, 0, w, h)
}

function paintNet(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Diamond lattice of hot threads laid over the peel. This is what fools the
  // eye — assimilation drags the peel toward the thread colour.
  ctx.strokeStyle = NET_ORANGE
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.globalAlpha = 0.94
  ctx.beginPath()
  for (let d = -h; d < w + h; d += CELL) {
    ctx.moveTo(d, 0)
    ctx.lineTo(d + h, h)
    ctx.moveTo(d, h)
    ctx.lineTo(d + h, 0)
  }
  ctx.stroke()
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
  const ctx = el.getContext('2d')!
  const px = ctx.getImageData(x, y, 1, 1).data
  return { hex: rgbToHex(px[0], px[1], px[2]), rgb: [px[0], px[1], px[2]] }
}

function pixelAtEvent(el: HTMLCanvasElement, e: MouseEvent): Reading {
  const rect = el.getBoundingClientRect()
  const x = Math.floor(((e.clientX - rect.left) / rect.width) * el.width)
  const y = Math.floor(((e.clientY - rect.top) / rect.height) * el.height)
  return readPixel(el, x, y)
}

// keyboard sampling reads the centre — guaranteed peel, never a thread.
function sampleUnderKey() {
  if (underRef.value) underReading.value = readPixel(underRef.value, underRef.value.width / 2 | 0, underRef.value.height / 2 | 0)
}
function sampleBareKey() {
  if (bareRef.value) bareReading.value = readPixel(bareRef.value, bareRef.value.width / 2 | 0, bareRef.value.height / 2 | 0)
}
function onUnderClick(e: MouseEvent) {
  if (underRef.value) underReading.value = pixelAtEvent(underRef.value, e)
}
function onBareClick(e: MouseEvent) {
  if (bareRef.value) bareReading.value = pixelAtEvent(bareRef.value, e)
}

onMounted(draw)

defineExpose({ grey: PROOF_GREY })
</script>

<template>
  <div class="proof" :style="{ '--grey': PROOF_GREY }">
    <p class="proof__hint">Sample either.</p>

    <div class="proof__states">
      <div class="state">
        <canvas
          ref="underRef"
          class="state__canvas"
          width="320"
          height="320"
          @click="onUnderClick"
          @keydown.enter.prevent="sampleUnderKey"
          tabindex="0"
          role="button"
          aria-label="Sample the peel seen through the net"
        />
      </div>
      <div class="state">
        <canvas
          ref="bareRef"
          class="state__canvas"
          width="320"
          height="320"
          @click="onBareClick"
          @keydown.enter.prevent="sampleBareKey"
          tabindex="0"
          role="button"
          aria-label="Sample the peel with no net"
        />
      </div>
    </div>

    <div class="proof__swatches">
      <div class="swatch">
        <div class="swatch__chip" :style="{ background: underReading?.hex || 'transparent' }">
          <span v-if="!underReading" class="swatch__empty">tap to sample</span>
        </div>
        <p class="swatch__hex">{{ underReading?.hex || '—' }}</p>
        <p v-if="showChannels && underReading" class="swatch__rgb">
          R {{ underReading.rgb[0] }} · G {{ underReading.rgb[1] }} · B {{ underReading.rgb[2] }}
        </p>
      </div>
      <div class="swatch">
        <div class="swatch__chip" :style="{ background: bareReading?.hex || 'transparent' }">
          <span v-if="!bareReading" class="swatch__empty">tap to sample</span>
        </div>
        <p class="swatch__hex">{{ bareReading?.hex || '—' }}</p>
        <p v-if="showChannels && bareReading" class="swatch__rgb">
          R {{ bareReading.rgb[0] }} · G {{ bareReading.rgb[1] }} · B {{ bareReading.rgb[2] }}
        </p>
      </div>
    </div>

    <p class="proof__line">Your eyes don't measure color. They compare it.</p>

    <!-- The module is about colour, so give a way to read it that doesn't
         depend on colour: exact channel values, for anyone who can't trust
         the swatches. -->
    <label class="proof__toggle">
      <input type="checkbox" v-model="showChannels" />
      <span>Show channel values</span>
    </label>
  </div>
</template>

<style scoped>
.proof {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}
.proof__hint {
  margin: 0;
  color: #6f6a65;
  font-size: 13px;
  letter-spacing: 0.02em;
}
.proof__states {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(14px, 4vw, 40px);
  width: 100%;
}
.state {
  display: flex;
  justify-content: center;
}
.state__canvas {
  width: 100%;
  max-width: 260px;
  aspect-ratio: 1;
  border-radius: 4px;
  cursor: crosshair;
  outline: none;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06);
}
.state__canvas:focus-visible {
  box-shadow: 0 0 0 2px rgba(241, 236, 230, 0.8);
}

.proof__swatches {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(14px, 4vw, 40px);
  width: 100%;
  padding: 20px clamp(14px, 4vw, 40px);
  background: var(--grey);
  border-radius: 4px;
}
.swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.swatch__chip {
  width: 100%;
  height: clamp(70px, 14vw, 110px);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.18);
}
.swatch__empty {
  color: rgba(20, 17, 15, 0.4);
  font-size: 12px;
  letter-spacing: 0.04em;
}
.swatch__hex {
  margin: 0;
  color: #1c1a18;
  font-size: clamp(18px, 3vw, 26px);
  font-weight: 600;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}
.swatch__rgb {
  margin: 0;
  color: rgba(28, 26, 24, 0.7);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.proof__line {
  margin: 0;
  color: #8a8480;
  font-size: clamp(15px, 2.2vw, 19px);
  font-weight: 400;
  text-align: center;
}
.proof__toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6f6a65;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
}
.proof__toggle input {
  accent-color: #e24e12;
}

@media (max-width: 520px) {
  .state__canvas { max-width: 100%; }
}
</style>
