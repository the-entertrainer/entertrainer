<script setup lang="ts">
export type PhotoTileItem = {
  src: string
  alt: string
  /** How the bitmap fills its cell. Default cover (clips carefully, no letterbox gaps). */
  fit?: 'contain' | 'cover'
  /** CSS object-position — bias toward faces / focal point. */
  objectPosition?: string
  /** @deprecated Unused — uniform cover cells + last-odd full bleed. */
  span?: 'normal' | 'wide' | 'tall' | 'hero'
}

const props = withDefaults(
  defineProps<{
    photos: PhotoTileItem[]
    label?: string
    /** Eager-load the first N tiles (above-fold / first mosaic). */
    eagerCount?: number
  }>(),
  {
    label: 'Photos',
    eagerCount: 6
  }
)

const expanded = ref<number | null>(null)
const count = computed(() => props.photos.length)

/** Lone tile in the last row spans full width — no half-empty gap. */
function isLastOdd(i: number) {
  return count.value > 1 && count.value % 2 === 1 && i === count.value - 1 && expanded.value !== i
}

function toggle(i: number) {
  if (count.value <= 1) return
  expanded.value = expanded.value === i ? null : i
}

function onKey(e: KeyboardEvent, i: number) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    toggle(i)
  } else if (e.key === 'Escape' && expanded.value !== null) {
    e.preventDefault()
    expanded.value = null
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault()
    const next = (i + 1) % count.value
    expanded.value = next
    focusTile(next)
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    const prev = (i - 1 + count.value) % count.value
    expanded.value = prev
    focusTile(prev)
  }
}

function focusTile(i: number) {
  nextTick(() => {
    document.getElementById(`photo-tile-${i}`)?.focus()
  })
}

function isEager(i: number) {
  return i < props.eagerCount
}

function fitOf(photo: PhotoTileItem) {
  return photo.fit === 'contain' ? 'contain' : 'cover'
}

function positionOf(photo: PhotoTileItem) {
  return photo.objectPosition || 'center 28%'
}
</script>

<template>
  <div
    v-if="photos.length"
    class="photo-tiles"
    :class="{
      'photo-tiles--solo': photos.length === 1,
      'photo-tiles--pair': photos.length === 2,
      'photo-tiles--has-expanded': expanded !== null
    }"
    role="group"
    :aria-label="label"
  >
    <button
      v-for="(photo, i) in photos"
      :id="`photo-tile-${i}`"
      :key="photo.src"
      type="button"
      class="photo-tiles__tile"
      :class="{
        'is-expanded': expanded === i,
        'photo-tiles__tile--span': isLastOdd(i)
      }"
      :aria-expanded="expanded === i"
      :aria-label="photo.alt"
      @click="toggle(i)"
      @keydown="onKey($event, i)"
    >
      <img
        :src="photo.src"
        :alt="photo.alt"
        :loading="isEager(i) ? 'eager' : 'lazy'"
        :fetchpriority="i === 0 ? 'high' : undefined"
        decoding="async"
        draggable="false"
        :style="{
          objectFit: fitOf(photo),
          objectPosition: positionOf(photo)
        }"
      >
      <span class="sr-only">{{ photo.alt }}</span>
    </button>
  </div>
</template>

<style scoped>
/*
 * Uniform cover cells — no masonry holes, no cream letterbox.
 * Images scale + clip into equal frames; last odd tile spans the full row.
 */
.photo-tiles {
  --tile-gap: 10rem;
  --tile-ratio: 4 / 5;
  --tile-ratio-span: 16 / 10;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--tile-gap);
  align-items: stretch;
  justify-items: stretch;
  width: min(100%, 720rem);
  margin: clamp(36rem, 6vw, 64rem) 0;
  isolation: isolate;
  background: transparent;
}

.photo-tiles--solo {
  grid-template-columns: minmax(0, 1fr);
  width: min(100%, 520rem);
  --tile-ratio: 1 / 1;
}

.photo-tiles--pair {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.photo-tiles__tile {
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  overflow: hidden;
  background: var(--paper-2);
  cursor: zoom-in;
  appearance: none;
  -webkit-appearance: none;
  color: inherit;
  font: inherit;
  text-align: left;
  line-height: 0;
  aspect-ratio: var(--tile-ratio);
  transform-origin: center center;
  transition:
    transform 280ms var(--ease-spring, cubic-bezier(.2, .9, .2, 1)),
    box-shadow 220ms var(--ease-out, ease),
    border-color 180ms var(--ease-out, ease),
    filter 220ms var(--ease-out, ease);
}

.photo-tiles__tile--span {
  grid-column: 1 / -1;
  aspect-ratio: var(--tile-ratio-span);
}

.photo-tiles__tile:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 3rem;
  z-index: 4;
}

.photo-tiles__tile:hover {
  z-index: 3;
  transform: translateY(-2rem);
  box-shadow: 0 10rem 20rem color-mix(in srgb, var(--ink) 14%, transparent);
  border-color: var(--accent);
}

.photo-tiles__tile.is-expanded {
  z-index: 5;
  cursor: zoom-out;
  grid-column: 1 / -1;
  aspect-ratio: auto;
  max-height: min(78vh, 720rem);
  border-color: var(--accent);
  box-shadow:
    0 0 0 3rem var(--accent),
    0 14rem 28rem color-mix(in srgb, var(--ink) 18%, transparent);
}

.photo-tiles--has-expanded .photo-tiles__tile:not(.is-expanded) {
  filter: saturate(0.9) brightness(0.98);
}

.photo-tiles__tile img {
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  object-fit: cover;
  object-position: center 28%;
  pointer-events: none;
  user-select: none;
  background: transparent;
}

.photo-tiles__tile.is-expanded img {
  height: 100%;
  max-height: min(78vh, 720rem);
  width: 100%;
  object-fit: cover;
  object-position: center 28%;
  background: transparent;
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
  .photo-tiles {
    width: 100%;
    --tile-gap: 8rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .photo-tiles__tile { transition: none; }
  .photo-tiles__tile:hover,
  .photo-tiles__tile.is-expanded { transform: none; }
}

:global(html[data-reduce-motion="on"]) .photo-tiles__tile {
  transition: none;
}
</style>
