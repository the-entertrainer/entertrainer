<script setup lang="ts">
/**
 * Homogeneous expansion lab: past + present of the same seed field.
 * Pick (or drag-align) any galaxy and it becomes the apparent centre.
 */
import { computed, onMounted, onBeforeUnmount, ref, watch, shallowRef } from 'vue'

type Dot = { id: number; x: number; y: number; r: number }

const DOT_COUNT = 60
const SCALE_MIN = 1.0
const SCALE_MAX = 1.12
const DEFAULT_SCALE = 1.05
const SNAP_PX = 14
const FIELD_PAD = 0.08

const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapRef = ref<HTMLElement | null>(null)
const scale = ref(DEFAULT_SCALE)
const displayScale = ref(DEFAULT_SCALE)
const refId = ref<number | null>(null)
const playing = ref(false)
const reducedMotion = ref(false)
const showPast = ref(true)
const showPresent = ref(true)

const dots = shallowRef<Dot[]>([])
const viewW = ref(640)
const viewH = ref(420)
const dpr = ref(1)

/** Manual drag offset of the present layer (canvas coords, logical). */
const dragTx = ref(0)
const dragTy = ref(0)
const dragging = ref(false)
const dragStart = ref<{ x: number; y: number; tx: number; ty: number } | null>(null)

let animRaf = 0
let animT0 = 0
let resizeObs: ResizeObserver | null = null

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedDots(w: number, h: number) {
  const rnd = mulberry32(20260910)
  const padX = w * FIELD_PAD
  const padY = h * FIELD_PAD
  const out: Dot[] = []
  let attempts = 0
  while (out.length < DOT_COUNT && attempts < DOT_COUNT * 40) {
    attempts++
    const x = padX + rnd() * (w - 2 * padX)
    const y = padY + rnd() * (h - 2 * padY)
    const r = 1.6 + rnd() * 3.4
    if (out.some((d) => (d.x - x) ** 2 + (d.y - y) ** 2 < (d.r + r + 6) ** 2)) continue
    out.push({ id: out.length, x, y, r })
  }
  dots.value = out
}

const chipDots = computed(() => dots.value.filter((_, i) => i % 7 === 0).slice(0, 8))

const cssVars = () => {
  const el = wrapRef.value
  if (!el) {
    return {
      paper: '#FFFBF2',
      ink: '#161618',
      muted: '#737379',
      red: '#E02D18',
      blue: '#22B8D8',
      accent: '#FFD43B',
      accentInk: '#161618',
      line: '#DCDCE0'
    }
  }
  const s = getComputedStyle(el)
  return {
    paper: s.getPropertyValue('--paper').trim() || '#FFFBF2',
    ink: s.getPropertyValue('--ink').trim() || '#161618',
    muted: s.getPropertyValue('--muted').trim() || '#737379',
    red: s.getPropertyValue('--red').trim() || '#E02D18',
    blue: s.getPropertyValue('--cyan').trim() || '#22B8D8',
    accent: s.getPropertyValue('--accent').trim() || '#FFD43B',
    accentInk: s.getPropertyValue('--accent-ink').trim() || '#161618',
    line: s.getPropertyValue('--line').trim() || '#DCDCE0'
  }
}

/** Past positions are seed coords; present = scale * seed about field centre, then + drag. */
function fieldCentre() {
  return { cx: viewW.value / 2, cy: viewH.value / 2 }
}

function pastOf(d: Dot) {
  return { x: d.x, y: d.y }
}

function presentOf(d: Dot, s: number) {
  const { cx, cy } = fieldCentre()
  return {
    x: cx + (d.x - cx) * s + dragTx.value,
    y: cy + (d.y - cy) * s + dragTy.value
  }
}

/** Translation that would align past+present of dot i: T = P*(1-s) in centred coords. */
function requiredT(d: Dot, s: number) {
  const { cx, cy } = fieldCentre()
  return {
    tx: (d.x - cx) * (1 - s),
    ty: (d.y - cy) * (1 - s)
  }
}

function setReference(id: number | null) {
  playing.value = false
  if (id == null) {
    refId.value = null
    dragTx.value = 0
    dragTy.value = 0
    displayScale.value = scale.value
    draw()
    return
  }
  const d = dots.value.find((x) => x.id === id)
  if (!d) return
  const t = requiredT(d, displayScale.value)
  dragTx.value = t.tx
  dragTy.value = t.ty
  refId.value = id
  draw()
}

function clearReference() {
  setReference(null)
}

function trySnap(s: number) {
  let best: { id: number; dist: number; tx: number; ty: number } | null = null
  for (const d of dots.value) {
    const past = pastOf(d)
    const present = presentOf(d, s)
    const dist = Math.hypot(present.x - past.x, present.y - past.y)
    if (dist < SNAP_PX) {
      const t = requiredT(d, s)
      if (!best || dist < best.dist) best = { id: d.id, dist, tx: t.tx, ty: t.ty }
    }
  }
  if (best) {
    dragTx.value = best.tx
    dragTy.value = best.ty
    refId.value = best.id
    return true
  }
  return false
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = viewW.value
  const h = viewH.value
  const ratio = dpr.value
  if (canvas.width !== Math.round(w * ratio) || canvas.height !== Math.round(h * ratio)) {
    canvas.width = Math.round(w * ratio)
    canvas.height = Math.round(h * ratio)
  }
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  const c = cssVars()
  const s = displayScale.value

  ctx.fillStyle = c.paper
  ctx.fillRect(0, 0, w, h)

  const active = refId.value != null ? dots.value.find((d) => d.id === refId.value) : null
  const centre = active
    ? pastOf(active)
    : fieldCentre()

  // Recession guides when a centre is locked
  if (active && showPresent.value) {
    ctx.save()
    ctx.strokeStyle = c.line
    ctx.lineWidth = 1
    ctx.setLineDash([4, 5])
    ctx.globalAlpha = 0.55
    for (const d of dots.value) {
      if (d.id === active.id) continue
      const pr = presentOf(d, s)
      ctx.beginPath()
      ctx.moveTo(centre.x, centre.y)
      ctx.lineTo(pr.x, pr.y)
      ctx.stroke()
    }
    ctx.restore()
  }

  // Past layer (muted)
  if (showPast.value) {
    for (const d of dots.value) {
      const p = pastOf(d)
      ctx.beginPath()
      ctx.arc(p.x, p.y, d.r * 0.92, 0, Math.PI * 2)
      ctx.fillStyle = c.muted
      ctx.globalAlpha = 0.38
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  // Present layer (ink)
  if (showPresent.value) {
    for (const d of dots.value) {
      const p = presentOf(d, s)
      ctx.beginPath()
      ctx.arc(p.x, p.y, d.r, 0, Math.PI * 2)
      ctx.fillStyle = c.ink
      ctx.globalAlpha = 1
      ctx.fill()
    }
  }

  // Active galaxy rings: red = past, blue = present
  if (active) {
    const past = pastOf(active)
    const present = presentOf(active, s)
    const ringR = Math.max(active.r + 7, 11)

    ctx.save()
    ctx.lineWidth = 2.25
    ctx.globalAlpha = 1
    ctx.setLineDash([])

    ctx.beginPath()
    ctx.arc(past.x, past.y, ringR, 0, Math.PI * 2)
    ctx.strokeStyle = c.red
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(present.x, present.y, ringR + 0.5, 0, Math.PI * 2)
    ctx.strokeStyle = c.blue
    ctx.stroke()

    // Tiny accent fill at coincidence centre
    if (Math.hypot(present.x - past.x, present.y - past.y) < 2) {
      ctx.beginPath()
      ctx.arc(past.x, past.y, 2.2, 0, Math.PI * 2)
      ctx.fillStyle = c.accent
      ctx.fill()
    }
    ctx.restore()
  }
}

function resize() {
  const el = wrapRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const nextW = Math.max(280, Math.floor(rect.width))
  const nextH = Math.max(260, Math.floor(Math.min(460, nextW * 0.62)))
  const sizeChanged = nextW !== viewW.value || nextH !== viewH.value
  viewW.value = nextW
  viewH.value = nextH
  dpr.value = Math.min(window.devicePixelRatio || 1, 2.5)
  if (sizeChanged || dots.value.length === 0) {
    const keepRef = refId.value
    seedDots(nextW, nextH)
    if (keepRef != null && dots.value.some((d) => d.id === keepRef)) {
      setReference(keepRef)
    } else {
      refId.value = null
      dragTx.value = 0
      dragTy.value = 0
    }
  }
  draw()
}

function clientToLocal(e: PointerEvent | MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const r = canvas.getBoundingClientRect()
  return {
    x: ((e.clientX - r.left) / r.width) * viewW.value,
    y: ((e.clientY - r.top) / r.height) * viewH.value
  }
}

function nearestDotAt(x: number, y: number, layer: 'past' | 'present' | 'either') {
  const s = displayScale.value
  let best: { id: number; dist: number } | null = null
  for (const d of dots.value) {
    const pts =
      layer === 'past'
        ? [pastOf(d)]
        : layer === 'present'
          ? [presentOf(d, s)]
          : [pastOf(d), presentOf(d, s)]
    for (const p of pts) {
      const dist = Math.hypot(p.x - x, p.y - y)
      if (dist < Math.max(14, d.r + 10) && (!best || dist < best.dist)) {
        best = { id: d.id, dist }
      }
    }
  }
  return best?.id ?? null
}

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  const pt = clientToLocal(e)
  const hit = nearestDotAt(pt.x, pt.y, 'either')
  if (hit != null && !e.shiftKey) {
    // Click a galaxy → snap it as centre
    setReference(hit)
    return
  }
  // Drag the present layer
  playing.value = false
  dragging.value = true
  dragStart.value = { x: pt.x, y: pt.y, tx: dragTx.value, ty: dragTy.value }
  ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value || !dragStart.value) return
  const pt = clientToLocal(e)
  dragTx.value = dragStart.value.tx + (pt.x - dragStart.value.x)
  dragTy.value = dragStart.value.ty + (pt.y - dragStart.value.y)
  // If a centre was locked, unlock while dragging freely
  if (refId.value != null) {
    const d = dots.value.find((x) => x.id === refId.value)
    if (d) {
      const need = requiredT(d, displayScale.value)
      if (Math.hypot(dragTx.value - need.tx, dragTy.value - need.ty) > SNAP_PX) {
        refId.value = null
      }
    }
  }
  trySnap(displayScale.value)
  draw()
}

function onPointerUp(e: PointerEvent) {
  if (!dragging.value) return
  dragging.value = false
  dragStart.value = null
  trySnap(displayScale.value)
  draw()
  ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
}

function onKeyActivate(id: number) {
  setReference(id)
}

function togglePlay() {
  if (reducedMotion.value) {
    displayScale.value = scale.value
    if (refId.value != null) {
      const d = dots.value.find((x) => x.id === refId.value)
      if (d) {
        const t = requiredT(d, displayScale.value)
        dragTx.value = t.tx
        dragTy.value = t.ty
      }
    }
    draw()
    return
  }
  if (playing.value) {
    playing.value = false
    if (animRaf) cancelAnimationFrame(animRaf)
    animRaf = 0
    return
  }
  playing.value = true
  animT0 = performance.now()
  const from = 1
  const to = scale.value
  const duration = 1600
  const locked = refId.value
  const step = (now: number) => {
    if (!playing.value) return
    const t = Math.min(1, (now - animT0) / duration)
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    displayScale.value = from + (to - from) * ease
    if (locked != null) {
      const d = dots.value.find((x) => x.id === locked)
      if (d) {
        const need = requiredT(d, displayScale.value)
        dragTx.value = need.tx
        dragTy.value = need.ty
        refId.value = locked
      }
    }
    draw()
    if (t < 1) animRaf = requestAnimationFrame(step)
    else playing.value = false
  }
  animRaf = requestAnimationFrame(step)
}

watch(scale, (v) => {
  if (playing.value) return
  displayScale.value = v
  if (refId.value != null) {
    const d = dots.value.find((x) => x.id === refId.value)
    if (d) {
      const t = requiredT(d, v)
      dragTx.value = t.tx
      dragTy.value = t.ty
    }
  }
  draw()
})

watch([showPast, showPresent], () => draw())

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resize()
  resizeObs = new ResizeObserver(() => resize())
  if (wrapRef.value) resizeObs.observe(wrapRef.value)
  window.addEventListener('themechange' as any, draw)
})

onBeforeUnmount(() => {
  if (animRaf) cancelAnimationFrame(animRaf)
  resizeObs?.disconnect()
  window.removeEventListener('themechange' as any, draw)
})

const statusLabel = computed(() => {
  if (refId.value == null) return 'No centre chosen — every galaxy still looks ordinary.'
  return `Galaxy ${refId.value + 1} is the frame of reference. The rest recede from it.`
})

const expansionPct = computed(() => Math.round((displayScale.value - 1) * 100))
</script>

<template>
  <section
    ref="wrapRef"
    class="ecl"
    aria-label="Expanding universe lab"
  >
    <div class="ecl__toolbar">
      <label class="ecl__scale">
        <span class="ecl__scale-label">Expansion</span>
        <input
          v-model.number="scale"
          class="ecl__slider"
          type="range"
          :min="SCALE_MIN"
          :max="SCALE_MAX"
          :step="0.005"
          :aria-valuetext="`${expansionPct} percent`"
        >
        <span class="ecl__scale-val" aria-hidden="true">{{ expansionPct }}%</span>
      </label>

      <div class="ecl__toggles" role="group" aria-label="Layers">
        <button
          type="button"
          class="ecl__chip"
          :aria-pressed="showPast"
          @click="showPast = !showPast"
        >
          Past
        </button>
        <button
          type="button"
          class="ecl__chip"
          :aria-pressed="showPresent"
          @click="showPresent = !showPresent"
        >
          Present
        </button>
      </div>

      <div class="ecl__actions">
        <button type="button" class="ecl__btn" :aria-pressed="playing" @click="togglePlay">
          {{ playing ? 'Pause' : 'Play' }}
        </button>
        <button
          type="button"
          class="ecl__btn ecl__btn--ghost"
          :disabled="refId == null"
          @click="clearReference"
        >
          Clear
        </button>
      </div>
    </div>

    <div class="ecl__stage">
      <canvas
        ref="canvasRef"
        class="ecl__canvas"
        role="img"
        :aria-label="statusLabel"
        :width="Math.round(viewW * dpr)"
        :height="Math.round(viewH * dpr)"
        :style="{ width: viewW + 'px', height: viewH + 'px' }"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      />
    </div>

    <div class="ecl__picks" role="listbox" aria-label="Choose a galaxy as reference">
      <button
        v-for="d in chipDots"
        :key="d.id"
        type="button"
        role="option"
        class="ecl__pick"
        :class="{ 'is-on': refId === d.id }"
        :aria-selected="refId === d.id"
        :aria-label="`Set galaxy ${d.id + 1} as reference`"
        @click="onKeyActivate(d.id)"
      >
        {{ d.id + 1 }}
      </button>
    </div>
    <div class="ecl__sr-picks">
      <button
        v-for="d in dots"
        :key="'sr-' + d.id"
        type="button"
        class="ecl__sr-pick"
        :aria-label="`Galaxy ${d.id + 1}${refId === d.id ? ', current centre' : ''}`"
        :aria-pressed="refId === d.id"
        @click="onKeyActivate(d.id)"
      >
        Galaxy {{ d.id + 1 }}
      </button>
    </div>

    <p class="ecl__caption">{{ statusLabel }}</p>
    <p v-if="refId == null" class="ecl__hint">Drag the present layer, or pick a galaxy below.</p>
  </section>
</template>

<style scoped>
.ecl {
  position: relative;
  margin: 48rem 0 58rem;
  padding: 16rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  background: var(--paper-2);
}
.ecl__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12rem 18rem;
  margin-bottom: 12rem;
}
.ecl__scale {
  display: inline-flex;
  align-items: center;
  gap: 10rem;
  min-width: min(100%, 260rem);
  flex: 1 1 220rem;
}
.ecl__scale-label,
.ecl__scale-val {
  font: 700 11rem/1.2 var(--font-mono);
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--ink-soft);
  white-space: nowrap;
}
.ecl__scale-val { color: var(--ink); min-width: 3.2em; text-align: right; }
.ecl__slider {
  flex: 1;
  accent-color: var(--accent);
  height: 28rem;
  cursor: pointer;
}
.ecl__toggles,
.ecl__actions {
  display: inline-flex;
  gap: 8rem;
  flex-wrap: wrap;
}
.ecl__chip,
.ecl__btn,
.ecl__pick {
  appearance: none;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-full);
  background: var(--paper);
  color: var(--ink);
  font: 700 11rem/1 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
  min-height: 36rem;
  padding: 0 14rem;
  cursor: pointer;
}
.ecl__chip[aria-pressed="true"],
.ecl__pick.is-on,
.ecl__btn[aria-pressed="true"] {
  background: var(--accent);
  color: var(--accent-ink);
  border-color: var(--accent);
}
.ecl__btn--ghost:disabled {
  opacity: .4;
  cursor: not-allowed;
}
.ecl__btn:focus-visible,
.ecl__chip:focus-visible,
.ecl__pick:focus-visible,
.ecl__slider:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}
.ecl__stage {
  border: var(--stroke) solid var(--ink);
  border-radius: calc(var(--radius-m) - 4rem);
  overflow: hidden;
  background: var(--paper);
  touch-action: none;
  cursor: grab;
}
.ecl__stage:active { cursor: grabbing; }
.ecl__canvas {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
}
.ecl__picks {
  display: flex;
  flex-wrap: wrap;
  gap: 8rem;
  margin-top: 12rem;
}
.ecl__pick {
  min-width: 36rem;
  padding: 0 10rem;
}
.ecl__caption {
  margin: 14rem 0 0;
  font: 500 clamp(18rem, 2vw, 24rem)/1.2 var(--font-display);
  letter-spacing: -.03em;
}
.ecl__hint {
  margin: 6rem 0 0;
  color: var(--ink-soft);
  font: 400 13rem/1.4 var(--font-mono);
}
.ecl__sr-picks {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.ecl__sr-pick:focus {
  position: fixed;
  left: 12rem;
  bottom: 12rem;
  z-index: 40;
  width: auto;
  height: auto;
  margin: 0;
  clip: auto;
  padding: 10rem 14rem;
  background: var(--accent);
  color: var(--accent-ink);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-full);
  font: 700 12rem/1 var(--font-mono);
}
@media (max-width: 640px) {
  .ecl { padding: 12rem; margin: 36rem 0 48rem; }
  .ecl__toolbar { gap: 10rem; }
}
@media (prefers-reduced-motion: reduce) {
  .ecl__canvas { scroll-behavior: auto; }
}
</style>
