<script setup lang="ts">
/**
 * The generative grid — wanda.net's project wall.
 *
 * Absolutely-positioned thumbnails of varying size scattered down a horizontal
 * scroller, each resting at 75% opacity with its label hidden until hover.
 * The source ships a touch-only vertical variant instead of trying to make a
 * horizontal scroller work with a thumb; we do the same.
 */
import type { NavItem } from '~/types/nav'

const props = defineProps<{ items: NavItem[] }>()

const scroller = ref<HTMLElement | null>(null)
const isTouch = ref(false)

/* Deterministic pseudo-random: the layout must survive SSR → hydration
   identically, and it should not reshuffle on every resize. A hash of the
   index is enough scatter to look generative and is stable by construction. */
function noise(i: number, salt: number) {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

const BAND = 560       /* px — the vertical field items are scattered within */
const GAP = 48         /* px between columns */

/**
 * Lay the items out left-to-right within a fixed-height band.
 *
 * Because each item owns its own horizontal slice, two items can never
 * overlap however their vertical offsets fall — which is what lets the
 * vertical position be freely random rather than snapped to lanes. Sizes are
 * derived from the item's own aspect and then constrained to the band, so a
 * portrait cover and a 16:9 screenshot both sit in the same field without one
 * of them blowing the row height out.
 */
const layout = computed(() => {
  let x = 0
  return props.items.map((item, i) => {
    const aspect = item.portrait ? 1.25 : 0.5625

    /* Two width classes, picked by the noise so the wall has rhythm rather
       than a uniform pitch. */
    let width = noise(i, 1) > 0.62 ? 620 : 430
    let height = Math.round(width * aspect)

    /* Anything taller than the band is scaled down rather than clipped. */
    if (height > BAND) {
      height = BAND
      width = Math.round(BAND / aspect)
    }

    const top = Math.round(noise(i, 2) * (BAND - height))
    const left = x
    x += width + GAP
    return { item, left, top, width, height }
  })
})

const trackWidth = computed(() => {
  const last = layout.value[layout.value.length - 1]
  return last ? last.left + last.width : 0
})
const trackHeight = BAND

/* A horizontal scroller that ignores the wheel is a dead end for anyone on a
   mouse, so map vertical wheel delta onto horizontal scroll. Trackpads send a
   real deltaX, which we leave alone. */
function onWheel(e: WheelEvent) {
  const el = scroller.value
  if (!el || isTouch.value) return
  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
  e.preventDefault()
  el.scrollLeft += e.deltaY
}

onMounted(() => {
  isTouch.value = window.matchMedia('(hover: none), (max-width: 812px)').matches
})
</script>

<template>
  <!-- Touch / narrow: a plain vertical stack. -->
  <ul v-if="isTouch" class="w-grid-stack">
    <li v-for="item in items" :key="item.id">
      <NuxtLink :to="item.href" class="w-grid-thumb">
        <div class="w-grid-thumb-media">
          <img v-if="item.image" :src="item.image" :alt="item.label" loading="lazy" decoding="async">
        </div>
        <p class="w-grid-thumb-label w-grid-thumb-label--static">
          <span v-if="item.meta" class="w-grid-thumb-meta">{{ item.meta }}</span>
          <span class="w-grid-thumb-title">{{ item.label }}</span>
        </p>
      </NuxtLink>
    </li>
  </ul>

  <!-- Pointer: the scattered horizontal wall. -->
  <div
    v-else
    ref="scroller"
    class="w-grid-scroller"
    @wheel="onWheel"
  >
    <ul class="w-grid" :style="{ width: trackWidth + 'px', height: trackHeight + 'px' }" role="list">
      <li
        v-for="l in layout"
        :key="l.item.id"
        class="w-grid-item"
        :style="{ left: l.left + 'px', top: l.top + 'px', width: l.width + 'px', height: l.height + 'px' }"
      >
        <div class="w-grid-item-container">
          <NuxtLink :to="l.item.href" class="w-grid-thumb">
            <div class="w-grid-thumb-media">
              <img v-if="l.item.image" :src="l.item.image" :alt="l.item.label" loading="lazy" decoding="async">
            </div>
            <p class="w-grid-thumb-label">
              <span v-if="l.item.meta" class="w-grid-thumb-meta">{{ l.item.meta }}</span>
              <span class="w-grid-thumb-title">{{ l.item.label }}</span>
            </p>
          </NuxtLink>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.w-grid-scroller {
  position: relative;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 var(--w-gutter-right) 60px var(--w-gutter);
  scrollbar-width: none;
}
.w-grid-scroller::-webkit-scrollbar { display: none; }

.w-grid-stack {
  list-style: none;
  margin: 0;
  padding: 0 var(--w-gutter-right) 60px var(--w-gutter);
  display: grid;
  gap: 40px;
}
.w-grid-stack .w-grid-thumb { height: auto; }
.w-grid-stack .w-grid-thumb-media { aspect-ratio: 16 / 9; }

/* On touch there is no hover to reveal the label, so it sits under the
   thumbnail permanently instead of centred over it. */
.w-grid-thumb-label--static {
  position: static;
  transform: none;
  opacity: 1;
  visibility: visible;
  align-items: flex-start;
  margin-top: 12px;
  white-space: normal;
}
</style>
