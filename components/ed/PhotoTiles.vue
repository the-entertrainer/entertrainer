<script setup lang="ts">
export type PhotoTileItem = {
  src: string
  alt: string
  /** Kept for callers; grids use natural image height (no contain letterbox). */
  fit?: 'contain' | 'cover'
  objectPosition?: string
  /** @deprecated Mosaic spans unused — tiles hug native image aspect. */
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
      :class="{ 'is-expanded': expanded === i }"
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
      >
      <span class="sr-only">{{ photo.alt }}</span>
    </button>
  </div>
</template>

<style scoped>
/*
 * Uniform columns, natural image heights.
 * Each tile hugs the bitmap — no fixed cell height, no object-fit contain/cover
 * letterboxing, no cream fill inside the frame.
 */
.photo-tiles {
  --tile-gap: 10rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--tile-gap);
  align-items: start;
  justify-items: stretch;
  width: min(100%, 720rem);
  margin: clamp(36rem, 6vw, 64rem) 0;
  isolation: isolate;
  background: transparent;
}

.photo-tiles--solo {
  grid-template-columns: minmax(0, 1fr);
  width: min(100%, 480rem);
}

.photo-tiles--pair {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.photo-tiles__tile {
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: auto;
  min-width: 0;
  min-height: 0;
  margin: 0;
  padding: 0;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  overflow: hidden;
  background: transparent;
  cursor: zoom-in;
  appearance: none;
  -webkit-appearance: none;
  color: inherit;
  font: inherit;
  text-align: left;
  line-height: 0;
  transform-origin: center center;
  transition:
    transform 280ms var(--ease-spring, cubic-bezier(.2, .9, .2, 1)),
    box-shadow 220ms var(--ease-out, ease),
    border-color 180ms var(--ease-out, ease),
    filter 220ms var(--ease-out, ease);
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
  height: auto;
  max-width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  /* Natural aspect — never contain/cover into a fixed box */
  object-fit: unset;
  object-position: unset;
  pointer-events: none;
  user-select: none;
  background: transparent;
  vertical-align: top;
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

@media (min-width: 701px) {
  .photo-tiles:not(.photo-tiles--solo):not(.photo-tiles--pair) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .photo-tiles {
    width: 100%;
    --tile-gap: 8rem;
  }

  .photo-tiles--pair {
    grid-template-columns: minmax(0, 1fr);
  }

  .photo-tiles--solo {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .photo-tiles__tile {
    transition: none;
  }
  .photo-tiles__tile:hover,
  .photo-tiles__tile.is-expanded {
    transform: none;
  }
}
</style>
