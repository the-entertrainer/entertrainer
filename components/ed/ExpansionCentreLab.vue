<script setup lang="ts">
/**
 * Two photos: Stretch space (~5%), then tap anyone so yesterday/today stack.
 * That person looks like the centre; everyone else flees along soft rays.
 */

import { computed, onMounted, onBeforeUnmount, ref, shallowRef } from 'vue'

type Dot = { id: number; x: number; y: number; r: number }

const DOT_COUNT = 42
const TARGET_SCALE = 1.05
const FIELD_PAD = 0.1
const HIT_PAD = 22

const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapRef = ref<HTMLElement | null>(null)
const refId = ref<number | null>(null)
const reducedMotion = ref(false)
/** 1 = yesterday/today stacked; TARGET_SCALE = space already stretched. */
const displayScale = ref(1)
const stretched = ref(false)
let stretchRaf = 0

const dots = shallowRef<Dot[]>([])
const viewW = ref(640)
const viewH = ref(400)
const dpr = ref(1)

const dragTx = ref(0)
const dragTy = ref(0)
const dragging = ref(false)
const dragStart = ref<{ x: number; y: number; tx: number; ty: number } | null>(null)
let resizeObs: ResizeObserver | null = null
let snapRaf = 0

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
  while (out.length < DOT_COUNT && attempts < DOT_COUNT * 50) {
    attempts++
    const x = padX + rnd() * (w - 2 * padX)
    const y = padY + rnd() * (h - 2 * padY)
    const r = 3.2 + rnd() * 4.2
    if (out.some((d) => (d.x - x) ** 2 + (d.y - y) ** 2 < (d.r + r + 14) ** 2)) continue
    out.push({ id: out.length, x, y, r })
  }
  dots.value = out
}

function cssVars() {
  const el = wrapRef.value
  if (!el) {
    return {
      paper: '#FFFBF2',
      ink: '#161618',
      muted: '#737379',
      line: '#DCDCE0',
      accent: '#FFD43B',
      accentInk: '#161618',
      soft: '#9A9AA0'
    }
  }
  const s = getComputedStyle(el)
  return {
    paper: s.getPropertyValue('--paper').trim() || '#FFFBF2',
    ink: s.getPropertyValue('--ink').trim() || '#161618',
    muted: s.getPropertyValue('--ink-soft').trim() || s.getPropertyValue('--muted').trim() || '#737379',
    line: s.getPropertyValue('--line').trim() || '#DCDCE0',
    accent: s.getPropertyValue('--accent').trim() || '#FFD43B',
    accentInk: s.getPropertyValue('--accent-ink').trim() || '#161618',
    soft: s.getPropertyValue('--ink-soft').trim() || '#9A9AA0'
  }
}

function fieldCentre() {
  return { cx: viewW.value / 2, cy: viewH.value / 2 }
}

function pastOf(d: Dot) {
  return { x: d.x, y: d.y }
}

function presentOf(d: Dot) {
  const { cx, cy } = fieldCentre()
  const s = displayScale.value
  return {
    x: cx + (d.x - cx) * s + dragTx.value,
    y: cy + (d.y - cy) * s + dragTy.value
  }
}

/** Translation that stacks today onto yesterday for this person. */
function requiredT(d: Dot) {
  const { cx, cy } = fieldCentre()
  const s = displayScale.value
  return {
    tx: (d.x - cx) * (1 - s),
    ty: (d.y - cy) * (1 - s)
  }
}

function setReference(id: number | null, animate = true) {
  if (id == null) {
    refId.value = null
    dragTx.value = 0
    dragTy.value = 0
    draw()
    return
  }
  const d = dots.value.find((x) => x.id === id)
  if (!d) return
  const target = requiredT(d)
  refId.value = id

  if (!animate || reducedMotion.value) {
    dragTx.value = target.tx
    dragTy.value = target.ty
    draw()
    return
  }

  const fromTx = dragTx.value
  const fromTy = dragTy.value
  const t0 = performance.now()
  const dur = 420
  if (snapRaf) cancelAnimationFrame(snapRaf)
  const step = (now: number) => {
    const t = Math.min(1, (now - t0) / dur)
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    dragTx.value = fromTx + (target.tx - fromTx) * ease
    dragTy.value = fromTy + (target.ty - fromTy) * ease
    draw()
    if (t < 1) snapRaf = requestAnimationFrame(step)
    else snapRaf = 0
  }
  snapRaf = requestAnimationFrame(step)
}

function clearReference() {
  setReference(null, false)
}

function playStretch() {
  if (stretchRaf) cancelAnimationFrame(stretchRaf)
  setReference(null, false)
  const from = displayScale.value
  const to = TARGET_SCALE
  if (reducedMotion.value || Math.abs(from - to) < 0.001) {
    displayScale.value = to
    stretched.value = true
    draw()
    return
  }
  const t0 = performance.now()
  const dur = 1100
  const step = (now: number) => {
    const u = Math.min(1, (now - t0) / dur)
    const ease = 1 - Math.pow(1 - u, 3)
    displayScale.value = from + (to - from) * ease
    draw()
    if (u < 1) stretchRaf = requestAnimationFrame(step)
    else {
      stretchRaf = 0
      displayScale.value = to
      stretched.value = true
      draw()
    }
  }
  stretchRaf = requestAnimationFrame(step)
}

function resetAll() {
  if (stretchRaf) cancelAnimationFrame(stretchRaf)
  stretchRaf = 0
  displayScale.value = 1
  stretched.value = false
  setReference(null, false)
  draw()
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

  ctx.fillStyle = c.paper
  ctx.fillRect(0, 0, w, h)

  const active = refId.value != null ? dots.value.find((d) => d.id === refId.value) : null
  const centre = active ? pastOf(active) : fieldCentre()

  // Soft recession rays when someone is held still
  if (active) {
    ctx.save()
    ctx.strokeStyle = c.line
    ctx.lineWidth = 1
    ctx.setLineDash([3, 6])
    ctx.globalAlpha = 0.5
    for (const d of dots.value) {
      if (d.id === active.id) continue
      const pr = presentOf(d)
      ctx.beginPath()
      ctx.moveTo(centre.x, centre.y)
      ctx.lineTo(pr.x, pr.y)
      ctx.stroke()
    }
    ctx.restore()
  }

  // Yesterday — faint ghosts
  for (const d of dots.value) {
    const p = pastOf(d)
    ctx.beginPath()
    ctx.arc(p.x, p.y, d.r * 0.95, 0, Math.PI * 2)
    ctx.fillStyle = c.muted
    ctx.globalAlpha = 0.34
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Today — bold
  for (const d of dots.value) {
    const p = presentOf(d)
    ctx.beginPath()
    ctx.arc(p.x, p.y, d.r, 0, Math.PI * 2)
    ctx.fillStyle = c.ink
    ctx.fill()
  }

  // Held person: yellow fill + soft ring at the stacked point
  if (active) {
    const past = pastOf(active)
    const present = presentOf(active)
    const aligned = Math.hypot(present.x - past.x, present.y - past.y) < 2.5
    const ringR = Math.max(active.r + 10, 16)

    ctx.save()
    ctx.lineWidth = 2.5
    ctx.setLineDash([])
    ctx.globalAlpha = 1

    if (aligned) {
      ctx.beginPath()
      ctx.arc(past.x, past.y, ringR, 0, Math.PI * 2)
      ctx.fillStyle = c.accent
      ctx.fill()
      ctx.beginPath()
      ctx.arc(past.x, past.y, active.r * 0.85, 0, Math.PI * 2)
      ctx.fillStyle = c.accentInk
      ctx.fill()
      ctx.beginPath()
      ctx.arc(past.x, past.y, ringR, 0, Math.PI * 2)
      ctx.strokeStyle = c.ink
      ctx.lineWidth = 1.75
      ctx.stroke()
    } else {
      // Still sliding — show both ends gently
      ctx.beginPath()
      ctx.arc(past.x, past.y, ringR * 0.85, 0, Math.PI * 2)
      ctx.strokeStyle = c.soft
      ctx.globalAlpha = 0.7
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(present.x, present.y, ringR * 0.85, 0, Math.PI * 2)
      ctx.strokeStyle = c.ink
      ctx.globalAlpha = 1
      ctx.stroke()
    }
    ctx.restore()
  }
}

function resize() {
  const el = wrapRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const nextW = Math.max(280, Math.floor(rect.width))
  const nextH = Math.max(280, Math.floor(Math.min(440, nextW * 0.64)))
  const sizeChanged = nextW !== viewW.value || nextH !== viewH.value
  viewW.value = nextW
  viewH.value = nextH
  dpr.value = Math.min(window.devicePixelRatio || 1, 2.5)
  if (sizeChanged || dots.value.length === 0) {
    const keepRef = refId.value
    seedDots(nextW, nextH)
    if (keepRef != null && dots.value.some((d) => d.id === keepRef)) {
      setReference(keepRef, false)
    } else {
      refId.value = null
      dragTx.value = 0
      dragTy.value = 0
    }
  }
  draw()
}

function clientToLocal(e: PointerEvent) {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const r = canvas.getBoundingClientRect()
  return {
    x: ((e.clientX - r.left) / r.width) * viewW.value,
    y: ((e.clientY - r.top) / r.height) * viewH.value
  }
}

function nearestDotAt(x: number, y: number) {
  let best: { id: number; dist: number } | null = null
  for (const d of dots.value) {
    for (const p of [pastOf(d), presentOf(d)]) {
      const dist = Math.hypot(p.x - x, p.y - y)
      if (dist < Math.max(HIT_PAD, d.r + 14) && (!best || dist < best.dist)) {
        best = { id: d.id, dist }
      }
    }
  }
  return best?.id ?? null
}

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  const pt = clientToLocal(e)
  const hit = nearestDotAt(pt.x, pt.y)
  if (hit != null) {
    setReference(hit, true)
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    return
  }
  // Light drag of the today layer
  dragging.value = true
  dragStart.value = { x: pt.x, y: pt.y, tx: dragTx.value, ty: dragTy.value }
  ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value || !dragStart.value) return
  const pt = clientToLocal(e)
  const dx = pt.x - dragStart.value.x
  const dy = pt.y - dragStart.value.y
  dragTx.value = dragStart.value.tx + dx
  dragTy.value = dragStart.value.ty + dy
  if (refId.value != null) {
    const d = dots.value.find((x) => x.id === refId.value)
    if (d) {
      const need = requiredT(d)
      if (Math.hypot(dragTx.value - need.tx, dragTy.value - need.ty) > 12) {
        refId.value = null
      }
    }
  }
  // Soft snap while dragging
  let best: { id: number; dist: number; tx: number; ty: number } | null = null
  for (const d of dots.value) {
    const past = pastOf(d)
    const present = presentOf(d)
    const dist = Math.hypot(present.x - past.x, present.y - past.y)
    if (dist < 16) {
      const t = requiredT(d)
      if (!best || dist < best.dist) best = { id: d.id, dist, tx: t.tx, ty: t.ty }
    }
  }
  if (best) {
    dragTx.value = best.tx
    dragTy.value = best.ty
    refId.value = best.id
  }
  draw()
}

function onPointerUp(e: PointerEvent) {
  if (dragging.value) {
    dragging.value = false
    dragStart.value = null
    draw()
  }
  ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
}

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resize()
  resizeObs = new ResizeObserver(() => resize())
  if (wrapRef.value) resizeObs.observe(wrapRef.value)
  window.addEventListener('themechange' as keyof WindowEventMap, draw as EventListener)
})

onBeforeUnmount(() => {
  if (snapRaf) cancelAnimationFrame(snapRaf)
  if (stretchRaf) cancelAnimationFrame(stretchRaf)
  resizeObs?.disconnect()
  window.removeEventListener('themechange' as keyof WindowEventMap, draw as EventListener)
})

const statusLabel = computed(() => {
  if (refId.value != null) return 'Held still. Everyone else drifts away from them.'
  if (!stretched.value) return 'Yesterday and today start stacked. Stretch space once.'
  return 'Space got bigger between them. Nobody walked.'
})

const hint = computed(() => {
  if (refId.value != null) return 'Tap someone else — same for them. That is everyone.'
  if (!stretched.value) return 'Then tap anyone to hold them still.'
  return 'Tap anyone — stack their yesterday on their today.'
})
</script>

<template>
  <section
    ref="wrapRef"
    class="ecl"
    aria-label="Two-photo expansion trick"
  >
    <div class="ecl__labels" aria-hidden="true">
      <span class="ecl__tag ecl__tag--past">Yesterday</span>
      <span class="ecl__tag ecl__tag--today">Today</span>
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

    <div class="ecl__foot">
      <p class="ecl__caption">{{ statusLabel }}</p>
      <p class="ecl__hint">{{ hint }}</p>
      <div class="ecl__actions">
        <button
          v-if="!stretched"
          type="button"
          class="ecl__stretch"
          @click="playStretch"
        >
          Stretch
        </button>
        <button
          v-else
          type="button"
          class="ecl__reset"
          @click="resetAll"
        >
          Reset
        </button>
      </div>
    </div>

    <div class="ecl__sr">
      <button
        v-for="d in dots"
        :key="'sr-' + d.id"
        type="button"
        class="ecl__sr-btn"
        :aria-label="`Hold person ${d.id + 1} still${refId === d.id ? ', current centre' : ''}`"
        :aria-pressed="refId === d.id"
        @click="setReference(d.id, true)"
      >
        Person {{ d.id + 1 }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.ecl {
  position: relative;
  margin: 48rem 0 58rem;
  padding: 18rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  background: var(--paper-2);
}
.ecl__labels {
  display: flex;
  flex-wrap: wrap;
  gap: 8rem;
  margin-bottom: 12rem;
}
.ecl__tag {
  display: inline-flex;
  align-items: center;
  min-height: 28rem;
  padding: 0 12rem;
  border-radius: var(--radius-full);
  font: 700 11rem/1 var(--font-mono);
  letter-spacing: .07em;
  text-transform: uppercase;
}
.ecl__tag--past {
  background: transparent;
  color: var(--ink-soft);
  border: var(--stroke) dashed var(--line);
}
.ecl__tag--today {
  background: var(--ink);
  color: var(--paper);
  border: var(--stroke) solid var(--ink);
}
.ecl__stage {
  border: var(--stroke) solid var(--ink);
  border-radius: calc(var(--radius-m) - 4rem);
  overflow: hidden;
  background: var(--paper);
  touch-action: none;
  cursor: pointer;
}
.ecl__canvas {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
}
.ecl__foot {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4rem 16rem;
  align-items: start;
  margin-top: 14rem;
}
.ecl__caption {
  margin: 0;
  grid-column: 1;
  font: 500 clamp(18rem, 2vw, 24rem)/1.2 var(--font-display);
  letter-spacing: -.03em;
}
.ecl__hint {
  margin: 0;
  grid-column: 1;
  color: var(--ink-soft);
  font: 400 13rem/1.4 var(--font-mono);
}
.ecl__reset {
  grid-column: 2;
  grid-row: 1 / span 2;
  align-self: center;
  appearance: none;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-full);
  background: var(--accent);
  color: var(--accent-ink);
  font: 700 11rem/1 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
  min-height: 40rem;
  padding: 0 16rem;
  cursor: pointer;
}
.ecl__reset:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}
.ecl__sr {
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
.ecl__sr-btn:focus {
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
  .ecl__foot { grid-template-columns: 1fr; }
  .ecl__reset { grid-column: 1; grid-row: auto; justify-self: start; margin-top: 8rem; }
}
</style>
