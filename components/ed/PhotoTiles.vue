<script setup lang="ts">
export type PhotoTileItem = {
  src: string
  alt: string
  fit?: 'contain' | 'cover'
  objectPosition?: string
  /** Optional mosaic weight */
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

function spanClass(photo: PhotoTileItem, i: number) {
  if (expanded.value === i) return 'is-expanded'
  const span = photo.span || defaultSpan(i, count.value)
  return `photo-tiles__tile--${span}`
}

function defaultSpan(i: number, n: number): string {
  if (n <= 2) return i === 0 ? 'wide' : 'wide'
  if (n <= 3) return i === 0 ? 'hero' : 'normal'
  // Marriott-ish mosaic: lead hero, then mix
  const pattern = ['hero', 'tall', 'normal', 'wide', 'normal', 'tall', 'wide']
  return pattern[i % pattern.length] || 'normal'
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
    const el = document.getElementById(`photo-tile-${i}`)
    el?.focus()
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
      :class="spanClass(photo, i)"
      :aria-expanded="expanded === i"
      :aria-label="photo.alt"
      :style="{
        '--fit': photo.fit || 'cover',
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
.photo-tiles {
  --tile-gap: 10rem;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  grid-auto-rows: minmax(88rem, 118rem);
  gap: var(--tile-gap);
  width: min(100%, 720rem);
  margin: clamp(36rem, 6vw, 64rem) 0;
  isolation: isolate;
}

.photo-tiles--pair {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: minmax(160rem, 220rem);
}

.photo-tiles--solo {
  grid-template-columns: 1fr;
  grid-auto-rows: minmax(200rem, 280rem);
}

.photo-tiles__tile {
  position: relative;
  margin: 0;
  padding: 0;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  overflow: hidden;
  background: #F7F1E4;
  cursor: zoom-in;
  appearance: none;
  -webkit-appearance: none;
  color: inherit;
  font: inherit;
  text-align: left;
  transform-origin: center center;
  transition:
    transform 380ms var(--ease-spring, cubic-bezier(.2, .9, .2, 1)),
    box-shadow 280ms var(--ease-out, ease),
    border-color 200ms var(--ease-out, ease),
    grid-column 380ms var(--ease-spring, cubic-bezier(.2, .9, .2, 1)),
    grid-row 380ms var(--ease-spring, cubic-bezier(.2, .9, .2, 1)),
    filter 280ms var(--ease-out, ease);
  animation: photo-tile-settle 560ms var(--ease-spring, cubic-bezier(.2, .9, .2, 1)) both;
  animation-delay: calc(var(--i, 0) * 45ms);
}

.photo-tiles__tile:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 3rem;
  z-index: 4;
}

.photo-tiles__tile:hover {
  z-index: 3;
  transform: translateY(-4rem) scale(1.02);
  box-shadow: 0 14rem 28rem color-mix(in srgb, var(--ink) 18%, transparent);
  border-color: var(--accent);
}

.photo-tiles__tile.is-expanded {
  z-index: 5;
  cursor: zoom-out;
  transform: translateY(-2rem) scale(1.01);
  border-color: var(--accent);
  box-shadow:
    0 0 0 3rem var(--accent),
    0 18rem 36rem color-mix(in srgb, var(--ink) 22%, transparent);
}

.photo-tiles--has-expanded .photo-tiles__tile:not(.is-expanded) {
  filter: saturate(0.86) brightness(0.96);
}

.photo-tiles__tile img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: var(--fit, cover);
  object-position: var(--pos, center center);
  pointer-events: none;
  user-select: none;
  background: #F7F1E4;
  transition: transform 480ms var(--ease-spring, cubic-bezier(.2, .9, .2, 1));
}

.photo-tiles__tile:hover img,
.photo-tiles__tile.is-expanded img {
  transform: scale(1.04);
}

/* Mosaic spans — Windows-tile energy */
.photo-tiles__tile--normal { grid-column: span 2; grid-row: span 2; }
.photo-tiles__tile--wide { grid-column: span 3; grid-row: span 2; }
.photo-tiles__tile--tall { grid-column: span 2; grid-row: span 3; }
.photo-tiles__tile--hero { grid-column: span 4; grid-row: span 3; }

.photo-tiles--pair .photo-tiles__tile--wide,
.photo-tiles--pair .photo-tiles__tile--hero,
.photo-tiles--pair .photo-tiles__tile--tall,
.photo-tiles--pair .photo-tiles__tile--normal {
  grid-column: span 1;
  grid-row: span 1;
}

.photo-tiles__tile.is-expanded {
  grid-column: 1 / -1;
  grid-row: span 4;
  min-height: 280rem;
}

.photo-tiles--pair .photo-tiles__tile.is-expanded {
  grid-column: 1 / -1;
  grid-row: span 1;
  min-height: 260rem;
}

@keyframes photo-tile-settle {
  from {
    opacity: 0;
    transform: translateY(10rem) scale(0.96);
  }
  to {
    opacity: 1;
    transform: none;
  }
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
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: minmax(76rem, 100rem);
    --tile-gap: 8rem;
  }

  .photo-tiles__tile--normal { grid-column: span 2; grid-row: span 2; }
  .photo-tiles__tile--wide { grid-column: span 4; grid-row: span 2; }
  .photo-tiles__tile--tall { grid-column: span 2; grid-row: span 3; }
  .photo-tiles__tile--hero { grid-column: span 4; grid-row: span 3; }

  .photo-tiles--pair {
    grid-template-columns: 1fr;
    grid-auto-rows: minmax(150rem, 190rem);
  }

  .photo-tiles__tile.is-expanded {
    min-height: 220rem;
    grid-row: span 3;
  }
}

@media (prefers-reduced-motion: reduce) {
  .photo-tiles__tile,
  .photo-tiles__tile img {
    transition: none;
    animation: none;
  }
  .photo-tiles__tile:hover,
  .photo-tiles__tile.is-expanded {
    transform: none;
  }
  .photo-tiles__tile:hover img,
  .photo-tiles__tile.is-expanded img {
    transform: none;
  }
}

.photo-tiles--reduce .photo-tiles__tile,
.photo-tiles--reduce .photo-tiles__tile img {
  transition: none;
  animation: none;
}
.photo-tiles--reduce .photo-tiles__tile:hover,
.photo-tiles--reduce .photo-tiles__tile.is-expanded {
  transform: none;
}
.photo-tiles--reduce .photo-tiles__tile:hover img,
.photo-tiles--reduce .photo-tiles__tile.is-expanded img {
  transform: none;
}
</style>
