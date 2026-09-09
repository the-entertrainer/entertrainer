<script setup lang="ts">
export type PhotoTileItem = {
  src: string
  alt: string
  /** Prefer contain; cover only when intentionally framed. */
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
const reduceMotion = ref(false)

onMounted(() => {
  reduceMotion.value =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.getAttribute('data-reduce-motion') === 'on'
})

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
      'photo-tiles--has-expanded': expanded !== null,
      'photo-tiles--reduce': reduceMotion
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
      :style="{
        '--fit': photo.fit || 'contain',
        '--pos': photo.objectPosition || 'center center',
        '--i': String(i)
      }"
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
 * Masonry that hugs each photo: CSS columns + natural image height.
 * No fixed cell aspect → no cover-crop, no cream letterbox holes.
 */
.photo-tiles {
  --tile-gap: 10rem;
  column-count: 2;
  column-gap: var(--tile-gap);
  width: min(100%, 720rem);
  margin: clamp(36rem, 6vw, 64rem) 0;
  isolation: isolate;
}

.photo-tiles--solo {
  column-count: 1;
  width: min(100%, 480rem);
}

.photo-tiles--pair {
  column-count: 2;
}

.photo-tiles__tile {
  display: block;
  width: 100%;
  margin: 0 0 var(--tile-gap);
  padding: 0;
  break-inside: avoid;
  -webkit-column-break-inside: avoid;
  page-break-inside: avoid;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  overflow: hidden;
  /* Only a hairline of paper — frame hugs the bitmap */
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
    transform 380ms var(--ease-spring, cubic-bezier(.2, .9, .2, 1)),
    box-shadow 280ms var(--ease-out, ease),
    border-color 200ms var(--ease-out, ease),
    filter 280ms var(--ease-out, ease);
  animation: photo-tile-settle 560ms var(--ease-spring, cubic-bezier(.2, .9, .2, 1)) both;
  animation-delay: calc(var(--i, 0) * 45ms);
}

.photo-tiles__tile:last-child {
  margin-bottom: 0;
}

.photo-tiles__tile:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 3rem;
  z-index: 4;
}

.photo-tiles__tile:hover {
  z-index: 3;
  transform: translateY(-3rem);
  box-shadow: 0 12rem 24rem color-mix(in srgb, var(--ink) 16%, transparent);
  border-color: var(--accent);
}

.photo-tiles__tile.is-expanded {
  z-index: 5;
  cursor: zoom-out;
  column-span: all;
  width: 100%;
  margin-bottom: var(--tile-gap);
  border-color: var(--accent);
  box-shadow:
    0 0 0 3rem var(--accent),
    0 16rem 32rem color-mix(in srgb, var(--ink) 20%, transparent);
}

.photo-tiles--has-expanded .photo-tiles__tile:not(.is-expanded) {
  filter: saturate(0.88) brightness(0.97);
}

.photo-tiles__tile img {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  /* Natural aspect — contain only if a parent ever constrains height */
  object-fit: var(--fit, contain);
  object-position: var(--pos, center center);
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

@keyframes photo-tile-settle {
  from {
    opacity: 0;
    transform: translateY(8rem);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (min-width: 701px) {
  .photo-tiles:not(.photo-tiles--solo):not(.photo-tiles--pair) {
    column-count: 3;
  }
}

@media (max-width: 700px) {
  .photo-tiles {
    width: 100%;
    column-count: 2;
    --tile-gap: 8rem;
  }

  .photo-tiles--pair {
    column-count: 1;
  }

  .photo-tiles--solo {
    column-count: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .photo-tiles__tile {
    transition: none;
    animation: none;
  }
  .photo-tiles__tile:hover,
  .photo-tiles__tile.is-expanded {
    transform: none;
  }
}

.photo-tiles--reduce .photo-tiles__tile {
  transition: none;
  animation: none;
}
.photo-tiles--reduce .photo-tiles__tile:hover,
.photo-tiles--reduce .photo-tiles__tile.is-expanded {
  transform: none;
}
</style>
