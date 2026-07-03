<script setup lang="ts">
import type { Connection, StoryCard } from '~/types/story'
import { CARD_KINDS, cardPreview } from '~/utils/storyCards'
import { stageOf } from '~/utils/idModels'
import { bezierPath, bezierPointAt } from '~/utils/storyBezier'
import { cardNumbers, isReachable } from '~/utils/storyGraph'
import { NODE_H, NODE_W, outPortPoint } from '~/utils/storyLayout'

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
const connecting = ref<{ from: string; fromPort: string; pointer: { x: number; y: number }; snapTarget: string | null; origin?: Connection } | null>(null)
const selectedConnectionId = ref<string | null>(null)

const activePointers = new Map<number, { x: number; y: number }>()
let pinchStartDist = 0
let pinchStartZoom = 1
let pinchStartMid = { x: 0, y: 0 }
let pinchStartPan = { x: 0, y: 0 }

const cardById = computed(() => new Map(cards.value.map(c => [c.id, c])))
const numberById = computed(() => cardNumbers(cards.value, connections.value))
const incomingIds = computed(() => new Set(connections.value.map(c => c.to)))
// Which output ports are occupied — key: `${cardId}#${port}` ('' = main)
const occupiedPorts = computed(() => new Set(connections.value.map(c => `${c.from}#${c.fromPort || ''}`)))

function meta(card: StoryCard) { return CARD_KINDS[card.kind] ?? CARD_KINDS['text-image'] }
function stageChip(card: StoryCard) { return stageOf(props.modelId, card.stage) }
function pad(n: number | undefined) { return String(n ?? 0).padStart(2, '0') }
function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)) }
function dist(a: { x: number; y: number }, b: { x: number; y: number }) { return Math.hypot(a.x - b.x, a.y - b.y) }
function midOf(a: { x: number; y: number }, b: { x: number; y: number }) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }

function inPort(c: StoryCard) { return { x: c.x, y: c.y + NODE_H / 2 } }

function screenToWorld(clientX: number, clientY: number) {
  const rect = containerRef.value?.getBoundingClientRect()
  const left = rect?.left ?? 0
  const top = rect?.top ?? 0
  return { x: (clientX - left - pan.x) / zoom.value, y: (clientY - top - pan.y) / zoom.value }
}

const edges = computed(() => connections.value.map(c => {
  const from = cardById.value.get(c.from)
  const to = cardById.value.get(c.to)
  if (!from || !to) return null
  const p1 = outPortPoint(from, c.fromPort)
  const p2 = inPort(to)
  const optIndex = c.fromPort?.startsWith('opt-') ? Number(c.fromPort.slice(4)) : -1
  return {
    id: c.id,
    d: bezierPath(p1, p2),
    mid: bezierPointAt(p1, p2, 0.5),
    handle: bezierPointAt(p1, p2, 0.82),
    // Branch curves carry their answer letter near the source
    letter: optIndex >= 0 ? String.fromCharCode(65 + optIndex) : null,
    letterPos: optIndex >= 0 ? bezierPointAt(p1, p2, 0.16) : null,
    color: meta(from).color
  }
}).filter((e): e is NonNullable<typeof e> => !!e))

const connectingPath = computed(() => {
  if (!connecting.value) return null
  const from = cardById.value.get(connecting.value.from)
  if (!from) return null
  const p1 = outPortPoint(from, connecting.value.fromPort)
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

function onOutputPointerDown(e: PointerEvent, card: StoryCard, fromPort = '') {
  e.stopPropagation()
  connecting.value = { from: card.id, fromPort, pointer: screenToWorld(e.clientX, e.clientY), snapTarget: null }
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
  const { from, fromPort, snapTarget, origin } = connecting.value
  connecting.value = null
  if (snapTarget && snapTarget !== from) {
    const ok = addConnection(from, snapTarget, fromPort)
    // A rejected re-plug (cycle) must not eat the original connection.
    if (!ok && origin) connections.value.push(origin)
  } else if (origin) {
    // A detached curve released over nothing springs back where it was —
    // deleting is always an explicit act (the Disconnect chip).
    connections.value.push(origin)
  }
}
const rejectedCardId = ref<string | null>(null)
let rejectTimer: ReturnType<typeof setTimeout> | null = null

// Flow rules: every output port carries exactly one curve — re-plugging an
// occupied port re-routes it — while inputs may merge several branches
// (both answers can lead to the same screen). A connection that would
// close a loop is refused with a shake on the offending card.
function addConnection(from: string, to: string, fromPort = ''): boolean {
  if (from === to) return false
  const remaining = connections.value.filter(c => !(c.from === from && (c.fromPort || '') === fromPort))
  if (isReachable(remaining, to, from)) {
    rejectedCardId.value = to
    if (rejectTimer) clearTimeout(rejectTimer)
    rejectTimer = setTimeout(() => { rejectedCardId.value = null }, 600)
    return false
  }
  connections.value = [...remaining, {
    id: `k${Date.now()}-${Math.random().toString(16).slice(2)}`,
    from, to,
    ...(fromPort ? { fromPort } : {})
  }]
  return true
}

// Reconnect uses a drag threshold: press near a curve's arrival end and
// nothing detaches until the pointer really moves — so a plain tap simply
// selects the curve (crucial on touch, where the invisible handle used to
// swallow taps). pointercancel (browser gesture takeover) restores the
// original connection instead of losing it.
let pendingReconnect: { edgeId: string; x: number; y: number } | null = null

function onReconnectStart(e: PointerEvent, edgeId: string) {
  e.stopPropagation()
  pendingReconnect = { edgeId, x: e.clientX, y: e.clientY }
  window.addEventListener('pointermove', onReconnectMove)
  window.addEventListener('pointerup', onReconnectEnd)
  window.addEventListener('pointercancel', onReconnectEnd)
}
function onReconnectMove(e: PointerEvent) {
  if (pendingReconnect) {
    if (Math.hypot(e.clientX - pendingReconnect.x, e.clientY - pendingReconnect.y) < 9) return
    const conn = connections.value.find(c => c.id === pendingReconnect!.edgeId)
    pendingReconnect = null
    if (!conn) { removeReconnectListeners(); return }
    connections.value = connections.value.filter(c => c.id !== conn.id)
    connecting.value = { from: conn.from, fromPort: conn.fromPort || '', pointer: screenToWorld(e.clientX, e.clientY), snapTarget: null, origin: conn }
  }
  onConnectPointerMove(e)
}
function onReconnectEnd(e: PointerEvent) {
  removeReconnectListeners()
  if (pendingReconnect) {
    // Never moved: treat the press as a tap on the curve → select it.
    const edgeId = pendingReconnect.edgeId
    pendingReconnect = null
    selectedConnectionId.value = selectedConnectionId.value === edgeId ? null : edgeId
    selectedCardId.value = null
    return
  }
  if (e.type === 'pointercancel' && connecting.value?.origin) {
    // The browser took the gesture — put the curve back where it was.
    const origin = connecting.value.origin
    connecting.value = null
    connections.value.push(origin)
    return
  }
  onConnectPointerUp()
}
function removeReconnectListeners() {
  window.removeEventListener('pointermove', onReconnectMove)
  window.removeEventListener('pointerup', onReconnectEnd)
  window.removeEventListener('pointercancel', onReconnectEnd)
}
onUnmounted(removeReconnectListeners)

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

// ── Minimap (desktop) ───────────────────────────────────────────
const MM_W = 172
const MM_H = 110
const viewW = ref(0)
const viewH = ref(0)
let resizeObs: ResizeObserver | null = null

const mmScene = computed(() => {
  if (cards.value.length < 2) return null
  const pad = 60
  const minX = Math.min(...cards.value.map(c => c.x)) - pad
  const minY = Math.min(...cards.value.map(c => c.y)) - pad
  const maxX = Math.max(...cards.value.map(c => c.x + NODE_W)) + pad
  const maxY = Math.max(...cards.value.map(c => c.y + NODE_H)) + pad
  const scale = Math.min(MM_W / (maxX - minX), MM_H / (maxY - minY))
  const ox = (MM_W - (maxX - minX) * scale) / 2
  const oy = (MM_H - (maxY - minY) * scale) / 2
  const nodes = cards.value.map(c => ({
    id: c.id,
    x: ox + (c.x - minX) * scale,
    y: oy + (c.y - minY) * scale,
    w: Math.max(3, NODE_W * scale),
    h: Math.max(2, NODE_H * scale),
    color: meta(c).color
  }))
  // The viewport rectangle in minimap space
  const vx = ox + (-pan.x / zoom.value - minX) * scale
  const vy = oy + (-pan.y / zoom.value - minY) * scale
  const vw = (viewW.value / zoom.value) * scale
  const vh = (viewH.value / zoom.value) * scale
  return { nodes, view: { x: vx, y: vy, w: vw, h: vh }, minX, minY, scale, ox, oy }
})

let mmDragging = false
function mmJump(e: PointerEvent) {
  const scene = mmScene.value
  if (!scene) return
  const box = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const worldX = scene.minX + (e.clientX - box.left - scene.ox) / scene.scale
  const worldY = scene.minY + (e.clientY - box.top - scene.oy) / scene.scale
  pan.x = viewW.value / 2 - worldX * zoom.value
  pan.y = viewH.value / 2 - worldY * zoom.value
}
function onMinimapDown(e: PointerEvent) {
  e.stopPropagation()
  mmDragging = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  mmJump(e)
}
function onMinimapMove(e: PointerEvent) { if (mmDragging) mmJump(e) }
function onMinimapUp() { mmDragging = false }

// True while a drag/connect gesture is mid-flight — consumers should hold
// off snapshotting history so half-finished states never become undo steps.
const gestureActive = computed(() => !!dragState.value || !!connecting.value)

defineExpose({ zoomIn, zoomOut, fitView, centerOn, zoomPercent, gestureActive })

onMounted(() => {
  nextTick(fitView)
  if (containerRef.value) {
    resizeObs = new ResizeObserver((entries) => {
      viewW.value = entries[0].contentRect.width
      viewH.value = entries[0].contentRect.height
    })
    resizeObs.observe(containerRef.value)
  }
})
onUnmounted(() => resizeObs?.disconnect())
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
          :style="{ strokeWidth: 30 / zoom }"
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

      <!-- Branch letters riding their curves near the source -->
      <span
        v-for="edge in edges.filter(e => e.letter)" :key="`letter-${edge.id}`"
        class="edge-letter" :style="counterScaleStyle(edge.letterPos!)"
      >{{ edge.letter }}</span>

      <article
        v-for="card in cards" :key="card.id"
        class="node-card"
        :class="{ 'node-card--active': card.id === selectedCardId, 'node-card--reject': card.id === rejectedCardId }"
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

        <!-- MCQ: one branch port per answer option; others: single output -->
        <template v-if="card.kind === 'mcq'">
          <!-- Counter-scale is capped: four stacked ports must never grow
               into each other at low zoom -->
          <div
            v-for="i in 4" :key="`opt-${i}`"
            class="port port--out port--opt"
            :class="{ 'port--filled': occupiedPorts.has(`${card.id}#opt-${i - 1}`) }"
            :style="{ top: `${i * 20}%`, transform: `translate(50%, -50%) scale(${Math.min(1 / zoom, 1.15)})` }"
            :title="`If ${String.fromCharCode(64 + i)}: ${card.options?.[i - 1] || '…'} — drag to the next screen`"
            @pointerdown="onOutputPointerDown($event, card, `opt-${i - 1}`)"
            @pointermove="onConnectPointerMove"
            @pointerup="onConnectPointerUp"
            @pointercancel="onConnectPointerUp"
          >{{ String.fromCharCode(64 + i) }}</div>
        </template>
        <div
          v-else
          class="port port--out" :class="{ 'port--filled': occupiedPorts.has(`${card.id}#`) }"
          :style="{ transform: `translate(50%, -50%) scale(${1 / zoom})` }"
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

    <!-- Minimap (desktop) -->
    <div
      v-if="mmScene"
      class="minimap"
      @pointerdown="onMinimapDown"
      @pointermove="onMinimapMove"
      @pointerup="onMinimapUp"
      @pointercancel="onMinimapUp"
      @wheel.stop.prevent
    >
      <span
        v-for="n in mmScene.nodes" :key="n.id" class="minimap__node"
        :style="{ left: `${n.x}px`, top: `${n.y}px`, width: `${n.w}px`, height: `${n.h}px`, background: n.color }"
      />
      <span
        class="minimap__view"
        :style="{ left: `${mmScene.view.x}px`, top: `${mmScene.view.y}px`, width: `${mmScene.view.w}px`, height: `${mmScene.view.h}px` }"
      />
    </div>
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
  width: 26rem; height: 26rem;
  border-radius: 999px;
  cursor: grab;
  pointer-events: auto;
  background: transparent;
  /* Without this the browser claims the touch for scrolling and fires
     pointercancel mid-drag — the classic vanishing-connection bug. */
  touch-action: none;
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
@media (hover: none) {
  .edge-delete-chip { padding: 11rem 18rem; font-size: 13rem; }
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
.node-card--reject {
  animation: node-reject 0.45s ease;
  box-shadow: 0 0 0 2rem color-mix(in srgb, #ff6b6b 70%, transparent), 0 26rem 60rem -30rem rgba(0,0,0,0.65);
}
@keyframes node-reject {
  0%, 100% { translate: 0 0; }
  20%, 60% { translate: -6rem 0; }
  40%, 80% { translate: 6rem 0; }
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
/* An occupied output reads as plugged-in; dragging it again re-routes */
.port--filled { background: var(--kind-color); }

/* MCQ answer branch ports: labelled A–D down the right edge */
.port--opt {
  width: 19rem; height: 19rem;
  display: grid; place-items: center;
  font-size: 9.5rem;
  font-weight: 800;
  color: var(--kind-color);
  line-height: 1;
  user-select: none;
}
.port--opt.port--filled, .port--opt:hover { color: var(--color-bg); }

.edge-letter {
  position: absolute;
  width: 20rem; height: 20rem;
  display: grid; place-items: center;
  border-radius: 999px;
  font-size: 10.5rem;
  font-weight: 800;
  color: var(--color-bg);
  background: #FB7185;
  box-shadow: 0 4rem 10rem -4rem rgba(0,0,0,0.5);
  pointer-events: none;
}

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

/* ── Minimap ── */
.minimap {
  position: absolute;
  right: 14rem;
  bottom: calc(14rem + var(--safe-bottom));
  width: 172rem;
  height: 110rem;
  border-radius: 12rem;
  overflow: hidden;
  background: color-mix(in srgb, var(--color-bg) 72%, transparent);
  border: 1px solid var(--color-glass-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  touch-action: none;
  z-index: 12;
}
.minimap__node { position: absolute; border-radius: 2rem; opacity: 0.75; }
.minimap__view {
  position: absolute;
  border: 1.5rem solid var(--color-text);
  border-radius: 4rem;
  background: color-mix(in srgb, var(--color-text) 8%, transparent);
}
@media (max-width: 899px) { .minimap { display: none; } }
</style>
