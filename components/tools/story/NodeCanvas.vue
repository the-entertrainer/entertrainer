<script setup lang="ts">
import type { Connection, StoryCard } from '~/types/story'
import { CARD_KINDS, cardPreview } from '~/utils/storyCards'
import { stageOf } from '~/utils/idModels'
import { cardNumbers } from '~/utils/storyGraph'
import { NODE_H, NODE_W } from '~/utils/storyLayout'

const cards = defineModel<StoryCard[]>('cards', { required: true })
const connections = defineModel<Connection[]>('connections', { required: true })
const selectedCardId = defineModel<string | null>('selectedCardId', { default: null })

// Floating chrome (dock, toolbars) overlays the canvas; fitView/centerOn
// frame content inside the visible window between them. `modelId` colors
// each card's stage chip with its instructional-design stage.
const props = defineProps<{
  insets?: { top?: number; right?: number; bottom?: number; left?: number }
  modelId?: string
}>()
const inset = computed(() => ({
  top: props.insets?.top ?? 0,
  right: props.insets?.right ?? 0,
  bottom: props.insets?.bottom ?? 0,
  left: props.insets?.left ?? 0
}))

const emit = defineEmits<{ 'delete-card': [id: string]; 'edit-card': [id: string]; 'moved': [] }>()

const MIN_ZOOM = 0.3
const MAX_ZOOM = 1.8
const SNAP_PX = 36

const containerRef = ref<HTMLElement | null>(null)
const pan = reactive({ x: 80, y: 80 })
const zoom = ref(1)

type DragState =
  | { type: 'node'; id: string; startPointer: { x: number; y: number }; startNode: { x: number; y: number }; moved: boolean }
  | { type: 'pan'; startPointer: { x: number; y: number }; startPan: { x: number; y: number } }
  | null

const dragState = ref<DragState>(null)
const connecting = ref<{ from: string; pointer: { x: number; y: number }; snapTarget: string | null; origin?: Connection } | null>(null)
const selectedConnectionId = ref<string | null>(null)

const activePointers = new Map<number, { x: number; y: number }>()
let pinchStartDist = 0
let pinchStartZoom = 1
let pinchStartMid = { x: 0, y: 0 }
let pinchStartPan = { x: 0, y: 0 }

const cardById = computed(() => new Map(cards.value.map(c => [c.id, c])))
const numberById = computed(() => cardNumbers(cards.value, connections.value))
const incomingIds = computed(() => new Set(connections.value.map(c => c.to)))

function meta(card: StoryCard) { return CARD_KINDS[card.kind] ?? CARD_KINDS['text-image'] }
function stageChip(card: StoryCard) { return stageOf(props.modelId, card.stage) }
function pad(n: number | undefined) { return String(n ?? 0).padStart(2, '0') }
function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)) }
function dist(a: { x: number; y: number }, b: { x: number; y: number }) { return Math.hypot(a.x - b.x, a.y - b.y) }
function midOf(a: { x: number; y: number }, b: { x: number; y: number }) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }

function outPort(c: StoryCard) { return { x: c.x + NODE_W, y: c.y + NODE_H / 2 } }
function inPort(c: StoryCard) { return { x: c.x, y: c.y + NODE_H / 2 } }

function screenToWorld(clientX: number, clientY: number) {
  const rect = containerRef.value?.getBoundingClientRect()
  const left = rect?.left ?? 0
  const top = rect?.top ?? 0
  return { x: (clientX - left - pan.x) / zoom.value, y: (clientY - top - pan.y) / zoom.value }
}

function bezierControlOffset(x1: number, x2: number) { return Math.max(Math.abs(x2 - x1) * 0.55, 70) }
function bezierPath(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  const dx = bezierControlOffset(p1.x, p2.x)
  return `M${p1.x},${p1.y} C${p1.x + dx},${p1.y} ${p2.x - dx},${p2.y} ${p2.x},${p2.y}`
}
function bezierPointAt(p0: { x: number; y: number }, p3: { x: number; y: number }, t: number) {
  const dx = bezierControlOffset(p0.x, p3.x)
  const p1 = { x: p0.x + dx, y: p0.y }
  const p2 = { x: p3.x - dx, y: p3.y }
  const mt = 1 - t
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y
  }
}

const edges = computed(() => connections.value.map(c => {
  const from = cardById.value.get(c.from)
  const to = cardById.value.get(c.to)
  if (!from || !to) return null
  const p1 = outPort(from)
  const p2 = inPort(to)
  return {
    id: c.id,
    d: bezierPath(p1, p2),
    mid: bezierPointAt(p1, p2, 0.5),
    handle: bezierPointAt(p1, p2, 0.82),
    color: meta(from).color
  }
}).filter((e): e is NonNullable<typeof e> => !!e))

const connectingPath = computed(() => {
  if (!connecting.value) return null
  const from = cardById.value.get(connecting.value.from)
  if (!from) return null
  const p1 = outPort(from)
  const target = connecting.value.snapTarget ? cardById.value.get(connecting.value.snapTarget) : null
  const p2 = target ? inPort(target) : connecting.value.pointer
  return bezierPath(p1, p2)
})

const worldStyle = computed(() => ({
  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom.value})`
}))

function nodeStyle(c: StoryCard) {
  return {
    left: `${c.x}px`, top: `${c.y}px`, width: `${NODE_W}px`, minHeight: `${NODE_H}px`,
    '--kind-color': meta(c).color
  }
}
function counterScaleStyle(p: { x: number; y: number }) {
  return { left: `${p.x}px`, top: `${p.y}px`, transform: `translate(-50%, -50%) scale(${1 / zoom.value})` }
}

// ── Node dragging ──────────────────────────────────────────────
function onNodePointerDown(e: PointerEvent, card: StoryCard) {
  const target = e.target as HTMLElement
  if (target.closest('.port, .node-card__delete, .node-card__edit')) return
  e.stopPropagation()
  selectedCardId.value = card.id
  selectedConnectionId.value = null
  dragState.value = { type: 'node', id: card.id, startPointer: { x: e.clientX, y: e.clientY }, startNode: { x: card.x, y: card.y }, moved: false }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onNodePointerMove(e: PointerEvent) {
  if (dragState.value?.type !== 'node') return
  const dx = (e.clientX - dragState.value.startPointer.x) / zoom.value
  const dy = (e.clientY - dragState.value.startPointer.y) / zoom.value
  const card = cardById.value.get(dragState.value.id)
  if (card) {
    card.x = dragState.value.startNode.x + dx
    card.y = dragState.value.startNode.y + dy
    dragState.value.moved = true
  }
}
function onNodePointerUp() {
  if (dragState.value?.type === 'node') {
    if (dragState.value.moved) emit('moved')
    dragState.value = null
  }
}

// ── Connection dragging (create / reconnect) ───────────────────
function nearestInputTarget(world: { x: number; y: number }, excludeId: string) {
  const thresholdWorld = SNAP_PX / zoom.value
  let best: { id: string; d: number } | null = null
  for (const c of cards.value) {
    if (c.id === excludeId) continue
    const p = inPort(c)
    const d = dist(p, world)
    if (d < thresholdWorld && (!best || d < best.d)) best = { id: c.id, d }
  }
  return best?.id ?? null
}

function onOutputPointerDown(e: PointerEvent, card: StoryCard) {
  e.stopPropagation()
  connecting.value = { from: card.id, pointer: screenToWorld(e.clientX, e.clientY), snapTarget: null }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onConnectPointerMove(e: PointerEvent) {
  if (!connecting.value) return
  const world = screenToWorld(e.clientX, e.clientY)
  connecting.value.pointer = world
  connecting.value.snapTarget = nearestInputTarget(world, connecting.value.from)
}
function onConnectPointerUp() {
  if (!connecting.value) return
  const { from, snapTarget, origin } = connecting.value
  connecting.value = null
  if (snapTarget && snapTarget !== from) {
    addConnection(from, snapTarget)
  } else if (origin) {
    // A detached curve released over nothing springs back where it was —
    // deleting is always an explicit act (the Disconnect chip).
    connections.value.push(origin)
  }
}
function addConnection(from: string, to: string) {
  const exists = connections.value.some(c => c.from === from && c.to === to)
  if (exists) return
  connections.value.push({ id: `k${Date.now()}-${Math.random().toString(16).slice(2)}`, from, to })
}

function onReconnectStart(e: PointerEvent, edgeId: string) {
  e.stopPropagation()
  const conn = connections.value.find(c => c.id === edgeId)
  if (!conn) return
  connections.value = connections.value.filter(c => c.id !== edgeId)
  connecting.value = { from: conn.from, pointer: screenToWorld(e.clientX, e.clientY), snapTarget: null, origin: conn }
  window.addEventListener('pointermove', onConnectPointerMove)
  window.addEventListener('pointerup', onWindowReconnectUp, { once: true })
}
function onWindowReconnectUp() {
  window.removeEventListener('pointermove', onConnectPointerMove)
  onConnectPointerUp()
}

function onEdgeTap(e: PointerEvent, edgeId: string) {
  e.stopPropagation()
  selectedConnectionId.value = selectedConnectionId.value === edgeId ? null : edgeId
  selectedCardId.value = null
}
function deleteSelectedConnection() {
  if (!selectedConnectionId.value) return
  connections.value = connections.value.filter(c => c.id !== selectedConnectionId.value)
  selectedConnectionId.value = null
}

const selectedEdge = computed(() => edges.value.find(e => e.id === selectedConnectionId.value) ?? null)

// ── Canvas pan / pinch-zoom ─────────────────────────────────────
function onContainerPointerDown(e: PointerEvent) {
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  containerRef.value?.setPointerCapture(e.pointerId)
  if (activePointers.size === 2) {
    const pts = [...activePointers.values()]
    pinchStartDist = dist(pts[0], pts[1])
    pinchStartZoom = zoom.value
    pinchStartMid = midOf(pts[0], pts[1])
    pinchStartPan = { x: pan.x, y: pan.y }
    dragState.value = null
    connecting.value = null
    return
  }
  if (e.target === containerRef.value || (e.target as HTMLElement).classList.contains('node-canvas__world')) {
    selectedCardId.value = null
    selectedConnectionId.value = null
  }
  if (dragState.value) return
  dragState.value = { type: 'pan', startPointer: { x: e.clientX, y: e.clientY }, startPan: { x: pan.x, y: pan.y } }
}
function onContainerPointerMove(e: PointerEvent) {
  if (activePointers.has(e.pointerId)) activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (activePointers.size === 2 && pinchStartDist > 0) {
    const pts = [...activePointers.values()]
    const d = dist(pts[0], pts[1])
    zoom.value = clamp(pinchStartZoom * (d / pinchStartDist), MIN_ZOOM, MAX_ZOOM)
    const m = midOf(pts[0], pts[1])
    pan.x = pinchStartPan.x + (m.x - pinchStartMid.x)
    pan.y = pinchStartPan.y + (m.y - pinchStartMid.y)
    return
  }
  if (dragState.value?.type === 'pan') {
    pan.x = dragState.value.startPan.x + (e.clientX - dragState.value.startPointer.x)
    pan.y = dragState.value.startPan.y + (e.clientY - dragState.value.startPointer.y)
  }
}
function onContainerPointerUp(e: PointerEvent) {
  activePointers.delete(e.pointerId)
  if (activePointers.size < 2) pinchStartDist = 0
  if (dragState.value?.type === 'pan') dragState.value = null
}

function onWheel(e: WheelEvent) {
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  const cx = e.clientX - rect.left
  const cy = e.clientY - rect.top
  const worldBefore = { x: (cx - pan.x) / zoom.value, y: (cy - pan.y) / zoom.value }
  const delta = -e.deltaY * 0.0016
  zoom.value = clamp(zoom.value * (1 + delta), MIN_ZOOM, MAX_ZOOM)
  pan.x = cx - worldBefore.x * zoom.value
  pan.y = cy - worldBefore.y * zoom.value
}

function zoomBy(factor: number) {
  const rect = containerRef.value?.getBoundingClientRect()
  const cx = (rect?.width ?? 0) / 2
  const cy = (rect?.height ?? 0) / 2
  const worldBefore = { x: (cx - pan.x) / zoom.value, y: (cy - pan.y) / zoom.value }
  zoom.value = clamp(zoom.value * factor, MIN_ZOOM, MAX_ZOOM)
  pan.x = cx - worldBefore.x * zoom.value
  pan.y = cy - worldBefore.y * zoom.value
}
function zoomIn() { zoomBy(1.25) }
function zoomOut() { zoomBy(0.8) }
function fitView() {
  const rect = containerRef.value?.getBoundingClientRect()
  const { top, right, bottom, left } = inset.value
  if (!rect || !cards.value.length) { pan.x = left + 80; pan.y = top + 80; zoom.value = 1; return }
  const availW = rect.width - left - right
  const availH = rect.height - top - bottom
  const minX = Math.min(...cards.value.map(c => c.x))
  const minY = Math.min(...cards.value.map(c => c.y))
  const maxX = Math.max(...cards.value.map(c => c.x + NODE_W))
  const maxY = Math.max(...cards.value.map(c => c.y + NODE_H))
  const margin = 60
  const bw = maxX - minX + margin * 2
  const bh = maxY - minY + margin * 2
  const nextZoom = clamp(Math.min(availW / bw, availH / bh, 1.1), MIN_ZOOM, MAX_ZOOM)
  zoom.value = nextZoom
  pan.x = left + (availW - bw * nextZoom) / 2 - (minX - margin) * nextZoom
  pan.y = top + (availH - bh * nextZoom) / 2 - (minY - margin) * nextZoom
}
function centerOn(cardId: string) {
  const rect = containerRef.value?.getBoundingClientRect()
  const card = cardById.value.get(cardId)
  if (!rect || !card) return
  const { top, right, bottom, left } = inset.value
  pan.x = left + (rect.width - left - right) / 2 - (card.x + NODE_W / 2) * zoom.value
  pan.y = top + (rect.height - top - bottom) / 2 - (card.y + NODE_H / 2) * zoom.value
}

function deleteNode(id: string) { emit('delete-card', id) }

const zoomPercent = computed(() => Math.round(zoom.value * 100))

// True while a drag/connect gesture is mid-flight — consumers should hold
// off snapshotting history so half-finished states never become undo steps.
const gestureActive = computed(() => !!dragState.value || !!connecting.value)

defineExpose({ zoomIn, zoomOut, fitView, centerOn, zoomPercent, gestureActive })

onMounted(() => nextTick(fitView))
</script>

<template>
  <div
    ref="containerRef"
    class="node-canvas"
    @pointerdown="onContainerPointerDown"
    @pointermove="onContainerPointerMove"
    @pointerup="onContainerPointerUp"
    @pointercancel="onContainerPointerUp"
    @wheel.prevent="onWheel"
  >
    <div class="node-canvas__world" :style="worldStyle">
      <svg class="node-canvas__svg">
        <path
          v-for="edge in edges" :key="`hit-${edge.id}`" class="edge-hit" :d="edge.d"
          @pointerdown="onEdgeTap($event, edge.id)"
        />
        <path
          v-for="edge in edges" :key="`v-${edge.id}`" class="edge-visible"
          :class="{ 'edge-visible--selected': selectedConnectionId === edge.id }" :d="edge.d"
        />
        <path v-if="connectingPath" class="edge-visible edge-visible--live" :d="connectingPath" />
      </svg>

      <div
        v-for="edge in edges" :key="`handle-${edge.id}`" class="reconnect-handle"
        :style="counterScaleStyle(edge.handle)"
        @pointerdown="onReconnectStart($event, edge.id)"
      />

      <article
        v-for="card in cards" :key="card.id"
        class="node-card"
        :class="{ 'node-card--active': card.id === selectedCardId }"
        :style="nodeStyle(card)"
        @pointerdown="onNodePointerDown($event, card)"
        @pointermove="onNodePointerMove"
        @pointerup="onNodePointerUp"
        @pointercancel="onNodePointerUp"
        @dblclick.stop="emit('edit-card', card.id)"
      >
        <span v-if="!incomingIds.has(card.id)" class="node-card__start">START</span>
        <div class="node-card__actions">
          <button class="node-card__edit" title="Edit card" @click.stop="emit('edit-card', card.id)" @pointerdown.stop>
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          </button>
          <button class="node-card__delete" title="Delete card" @click.stop="deleteNode(card.id)" @pointerdown.stop>✕</button>
        </div>
        <div class="node-card__kind">
          <span class="node-card__glyph">{{ meta(card).glyph }}</span>
          <span class="node-card__kind-label">{{ meta(card).label }}</span>
          <span class="node-card__num">№ {{ pad(numberById.get(card.id)) }}</span>
        </div>
        <h3>{{ card.title || 'Untitled' }}</h3>
        <p>{{ cardPreview(card) }}</p>
        <div class="node-card__foot">
          <span
            v-if="stageChip(card)" class="node-card__stage"
            :style="{ '--stage-color': stageChip(card)!.color }"
          >{{ stageChip(card)!.short }}</span>
          <span v-else class="node-card__status">{{ card.status || 'Draft' }}</span>
          <span class="node-card__time">{{ card.duration || 0 }}s</span>
        </div>

        <div class="port port--in" :style="{ transform: `translate(-50%, -50%) scale(${1 / zoom})` }" />
        <div
          class="port port--out" :style="{ transform: `translate(50%, -50%) scale(${1 / zoom})` }"
          @pointerdown="onOutputPointerDown($event, card)"
          @pointermove="onConnectPointerMove"
          @pointerup="onConnectPointerUp"
          @pointercancel="onConnectPointerUp"
        />
      </article>
    </div>

    <button
      v-if="selectedEdge" class="edge-delete-chip"
      :style="{ left: `${pan.x + selectedEdge.mid.x * zoom}px`, top: `${pan.y + selectedEdge.mid.y * zoom}px` }"
      @pointerdown.stop
      @click="deleteSelectedConnection"
    >✕ Disconnect</button>

    <p v-if="!cards.length" class="node-canvas__empty">Blank canvas. Add a card from the palette to begin your storyboard.</p>
  </div>
</template>

<style scoped>
.node-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: none;
  cursor: grab;
  background:
    radial-gradient(circle at 1px 1px, var(--color-glass-border) 1.4px, transparent 0) 0 0 / 28rem 28rem,
    color-mix(in srgb, var(--color-bg) 40%, transparent);
}
.node-canvas:active { cursor: grabbing; }

.node-canvas__world {
  position: absolute;
  top: 0; left: 0;
  transform-origin: 0 0;
  will-change: transform;
}
.node-canvas__svg {
  position: absolute;
  top: 0; left: 0;
  width: 1px; height: 1px;
  overflow: visible;
  pointer-events: none;
}

.edge-hit { fill: none; stroke: transparent; stroke-width: 22; pointer-events: stroke; cursor: pointer; }
.edge-visible {
  fill: none;
  stroke: color-mix(in srgb, var(--color-text) 42%, transparent);
  stroke-width: 2.5;
  stroke-linecap: round;
  transition: stroke 0.18s ease, stroke-width 0.18s ease;
}
.edge-visible--selected { stroke: #6d8cff; stroke-width: 3.5; }
.edge-visible--live { stroke: color-mix(in srgb, var(--color-text) 65%, transparent); stroke-dasharray: 7 7; }

.reconnect-handle {
  position: absolute;
  width: 22rem; height: 22rem;
  border-radius: 999px;
  cursor: grab;
  pointer-events: auto;
  background: transparent;
}

.edge-delete-chip {
  position: absolute;
  transform: translate(-50%, -50%);
  padding: 6rem 12rem;
  border-radius: 999px;
  font-size: 11rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #fff;
  background: #d24d4d;
  box-shadow: 0 8rem 22rem -8rem rgba(0,0,0,0.6);
  z-index: 5;
  white-space: nowrap;
}

.node-card {
  position: absolute;
  padding: 16rem 18rem 14rem;
  border-radius: 18rem;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.10), transparent 38%),
    color-mix(in srgb, var(--color-bg) 76%, transparent);
  backdrop-filter: blur(18px) saturate(1.3);
  -webkit-backdrop-filter: blur(18px) saturate(1.3);
  border: 1px solid var(--color-glass-border);
  border-left: 4rem solid var(--kind-color);
  box-shadow: 0 18rem 46rem -26rem rgba(0,0,0,0.65);
  cursor: grab;
  touch-action: none;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  user-select: none;
  display: flex;
  flex-direction: column;
}
.node-card:active { cursor: grabbing; }
.node-card--active {
  border-color: var(--kind-color);
  box-shadow: 0 0 0 2rem color-mix(in srgb, var(--kind-color) 55%, transparent), 0 26rem 60rem -30rem rgba(0,0,0,0.65);
}
.node-card__start {
  position: absolute;
  top: -11rem; left: 14rem;
  font-size: 10rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 3rem 9rem;
  border-radius: 999px;
  background: var(--color-text);
  color: var(--color-bg);
}
.node-card__actions {
  position: absolute;
  top: 8rem; right: 8rem;
  display: flex;
  gap: 5rem;
  z-index: 2;
}
.node-card__edit, .node-card__delete {
  width: 24rem; height: 24rem;
  display: grid; place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  border: 1px solid var(--color-glass-border);
  font-size: 10rem;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.node-card:hover .node-card__edit,
.node-card:hover .node-card__delete,
.node-card--active .node-card__edit,
.node-card--active .node-card__delete { opacity: 0.8; }
.node-card__edit:hover, .node-card__delete:hover { opacity: 1 !important; }
/* Touch devices have no hover — keep the actions discoverable */
@media (hover: none) {
  .node-card__edit, .node-card__delete { opacity: 0.7; }
}

.node-card__kind { display: flex; align-items: center; gap: 7rem; }
.node-card__glyph {
  width: 20rem; height: 20rem;
  display: grid; place-items: center;
  border-radius: 6rem;
  font-size: 10.5rem;
  font-weight: 700;
  color: var(--color-bg);
  background: var(--kind-color);
  flex-shrink: 0;
}
.node-card__kind-label {
  font-size: 10rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--kind-color);
}
.node-card__num { margin-left: auto; margin-right: 18rem; font-size: 10rem; font-weight: 600; opacity: 0.5; }

.node-card h3 { margin: 11rem 0 7rem; font-size: 16.5rem; line-height: 1.2; letter-spacing: -0.02em; }
.node-card p {
  font-size: 12rem; line-height: 1.45; opacity: 0.62; min-height: 50rem;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  white-space: pre-line;
}
.node-card__foot { margin-top: auto; padding-top: 8rem; display: flex; align-items: center; justify-content: space-between; }
.node-card__status {
  display: inline-flex;
  font-size: 10rem; font-weight: 600; padding: 3rem 9rem; border-radius: 999px;
  background: color-mix(in srgb, var(--color-bg) 50%, transparent);
  border: 1px solid var(--color-glass-border);
}
.node-card__stage {
  display: inline-flex;
  font-size: 10rem; font-weight: 700; padding: 3rem 9rem; border-radius: 999px;
  color: var(--stage-color);
  background: color-mix(in srgb, var(--stage-color) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--stage-color) 45%, transparent);
}
.node-card__time { font-size: 10.5rem; font-weight: 600; opacity: 0.5; }

.port {
  position: absolute;
  top: 50%;
  width: 16rem; height: 16rem;
  border-radius: 999px;
  background: var(--color-bg);
  border: 2.5rem solid var(--kind-color);
  transform-origin: center;
  touch-action: none;
  z-index: 2;
}
/* Generous invisible hit area — 16px dots are hostile to fingers */
.port::after {
  content: '';
  position: absolute;
  inset: -12rem;
  border-radius: 999px;
}
.port--in { left: 0; border-color: var(--color-text); }
.port--out { right: 0; cursor: crosshair; }
.port--out:hover { background: var(--kind-color); }

.node-canvas__empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 14rem;
  opacity: 0.5;
  pointer-events: none;
  text-align: center;
  padding: 0 32rem;
  line-height: 1.5;
}
</style>
