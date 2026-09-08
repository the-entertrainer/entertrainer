<script setup lang="ts">
export type PhotoStackItem = {
  src: string
  alt: string
  /** Prefer contain so faces/scenes aren’t butchered; cover only with a careful position. */
  fit?: 'contain' | 'cover'
  objectPosition?: string
}

const props = withDefaults(
  defineProps<{
    photos: PhotoStackItem[]
    label?: string
    note?: string
    /** CSS aspect-ratio for the deck stage */
    aspect?: string
  }>(),
  {
    label: 'Photo stack',
    aspect: '4 / 3'
  }
)

const index = ref(0)
const root = ref<HTMLElement | null>(null)
const dragging = ref(false)
const dragX = ref(0)

const count = computed(() => props.photos.length)
const active = computed(() => props.photos[index.value] ?? props.photos[0])

function wrap(i: number) {
  const n = count.value
  if (n <= 0) return 0
  return ((i % n) + n) % n
}

function go(i: number) {
  if (count.value <= 1) return
  index.value = wrap(i)
}

function next() {
  go(index.value + 1)
}

function prev() {
  go(index.value - 1)
}

/** Depth in the visual stack: 0 = front, 1 = next peeking, etc. */
function depthFor(i: number) {
  return wrap(i - index.value)
}

let pointerId: number | null = null
let startX = 0
let startY = 0
let axis: 'x' | 'y' | null = null
let moved = false
const THRESHOLD = 48

function onPointerDown(e: PointerEvent) {
  if (count.value <= 1 || e.button !== 0) return
  const el = root.value
  if (!el) return
  pointerId = e.pointerId
  startX = e.clientX
  startY = e.clientY
  axis = null
  moved = false
  dragging.value = true
  dragX.value = 0
  el.setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value || e.pointerId !== pointerId) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  if (!axis) {
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
    axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
  }
  if (axis === 'y') return
  moved = true
  e.preventDefault()
  dragX.value = dx
}

function finishDrag(commit: boolean) {
  if (!dragging.value) return
  const dx = dragX.value
  const didMove = moved
  dragging.value = false
  dragX.value = 0
  pointerId = null
  axis = null
  moved = false
  if (!commit || count.value <= 1) return
  if (dx <= -THRESHOLD) next()
  else if (dx >= THRESHOLD) prev()
  else if (!didMove) next()
}

function onPointerUp(e: PointerEvent) {
  if (e.pointerId !== pointerId) return
  finishDrag(true)
}

function onPointerCancel(e: PointerEvent) {
  if (e.pointerId !== pointerId) return
  finishDrag(false)
}

function onKey(e: KeyboardEvent) {
  if (count.value <= 1) return
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    next()
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    prev()
  }
}
</script>

<template>
  <div
    v-if="photos.length"
    class="photo-stack"
    :class="{ 'photo-stack--solo': photos.length === 1, 'is-dragging': dragging }"
  >
    <div
      ref="root"
      class="photo-stack__stage"
      role="group"
      :aria-roledescription="photos.length > 1 ? 'photo stack' : undefined"
      :aria-label="label"
      :tabindex="photos.length > 1 ? 0 : -1"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
      @keydown="onKey"
    >
      <div class="photo-stack__ratio" :style="{ aspectRatio: aspect }" aria-hidden="true" />
      <figure
        v-for="(photo, i) in photos"
        :key="photo.src"
        class="photo-stack__card"
        :class="{
          'is-front': depthFor(i) === 0,
          'is-peek': depthFor(i) > 0 && depthFor(i) <= 2,
          'is-buried': depthFor(i) > 2
        }"
        :style="{
          zIndex: String(photos.length - depthFor(i)),
          '--stack-i': String(Math.min(depthFor(i), 3)),
          '--drag-x': depthFor(i) === 0 ? `${dragX}px` : '0px',
          '--drag-rot': depthFor(i) === 0 ? `${dragX / 28}deg` : '0deg',
          '--fit': photo.fit || 'contain',
          '--pos': photo.objectPosition || 'center center'
        }"
        :aria-hidden="depthFor(i) === 0 ? undefined : 'true'"
      >
        <EdEditorialImage :src="photo.src" :alt="depthFor(i) === 0 ? photo.alt : ''" />
      </figure>
    </div>

    <div v-if="photos.length > 1" class="photo-stack__meta" aria-live="polite">
      <span class="photo-stack__count">{{ index + 1 }} / {{ photos.length }}</span>
      <span class="photo-stack__hint" aria-hidden="true">Swipe or tap</span>
    </div>
    <p v-if="note" class="photo-stack__note">{{ note }}</p>
    <p v-if="active && photos.length > 1" class="sr-only">{{ active.alt }}</p>
  </div>
</template>

<style scoped>
.photo-stack {
  width: min(100%, 640rem);
  margin: clamp(36rem, 6vw, 64rem) 0;
  touch-action: pan-y;
  user-select: none;
}

.photo-stack__stage {
  position: relative;
  width: 100%;
  /* Room for the offset peek cards — no clipping, no frames */
  padding: 0 18rem 30rem 0;
  isolation: isolate;
  outline: none;
  cursor: grab;
}

.photo-stack.is-dragging .photo-stack__stage { cursor: grabbing; }
.photo-stack--solo .photo-stack__stage {
  cursor: default;
  padding: 0;
}

.photo-stack__ratio {
  width: 100%;
  pointer-events: none;
}

.photo-stack__stage:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 4rem;
  border-radius: calc(var(--radius-m) + 2rem);
}

.photo-stack__card {
  position: absolute;
  top: 0;
  left: 0;
  right: 18rem;
  bottom: 30rem;
  margin: 0;
  border-radius: var(--radius-m);
  overflow: hidden;
  background: var(--paper-2);
  transform:
    translate3d(
      calc(var(--stack-i) * 8rem + var(--drag-x, 0px)),
      calc(var(--stack-i) * 10rem),
      0
    )
    rotate(calc(var(--stack-i) * 1.8deg + var(--drag-rot, 0deg)))
    scale(calc(1 - var(--stack-i) * 0.04));
  transform-origin: 50% 85%;
  transition:
    transform 420ms var(--ease-spring, cubic-bezier(.2, .9, .2, 1)),
    opacity 280ms var(--ease-out, ease);
  pointer-events: none;
  border: 0;
  box-shadow: none;
}

.photo-stack--solo .photo-stack__card {
  right: 0;
  bottom: 0;
}

.photo-stack__card.is-front { pointer-events: auto; }
.photo-stack.is-dragging .photo-stack__card.is-front { transition: none; }

.photo-stack__card.is-peek {
  opacity: calc(1 - var(--stack-i) * 0.2);
}

.photo-stack__card.is-buried {
  opacity: 0;
  pointer-events: none;
}

.photo-stack__card :deep(.ed-editorial-image),
.photo-stack__card :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: var(--radius-m);
  background: var(--paper-2);
}

.photo-stack__card :deep(img) {
  object-fit: var(--fit, contain);
  object-position: var(--pos, center center);
}

.photo-stack__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rem;
  margin-top: 4rem;
  padding: 0 2rem;
}

.photo-stack__count {
  font: 700 11rem/1.2 var(--font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.photo-stack__hint {
  font: 600 11rem/1.2 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--ink) 32%, transparent);
}

.photo-stack__note {
  margin: 10rem 0 0;
  color: var(--ink-soft);
  font: 600 12rem/1.4 var(--font-mono);
  letter-spacing: .04em;
}

.sr-only {
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

@media (max-width: 700px) {
  .photo-stack { width: 100%; }
  .photo-stack__stage { padding: 0 14rem 24rem 0; }
  .photo-stack__card { right: 14rem; bottom: 24rem; }
}

@media (prefers-reduced-motion: reduce) {
  .photo-stack__card { transition: none; }
}
:global(html[data-reduce-motion="on"]) .photo-stack__card { transition: none; }
</style>
