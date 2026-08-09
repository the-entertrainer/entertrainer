<script setup lang="ts">
/**
 * The index overlay — this repo's read of wanda.net's Directors panel.
 *
 * A filterable, multi-column list of monospaced names on a near-black field.
 * Hovering a name floats a thumbnail into the empty space *around* that name,
 * never on top of it. See Inspiration/WANDA_SYSTEM.md §6 for the measured
 * constants; the placement rule below is the interesting part.
 */
import gsap from 'gsap'
import type { NavItem } from '~/types/nav'

export interface IndexGroup {
  id: string
  label: string
  items: NavItem[]
}

const props = withDefaults(defineProps<{
  open: boolean
  groups: IndexGroup[]
  activeHref?: string
  /**
   * 'overlay' is the panel the plus button summons on every non-home route.
   * 'inline' is the same list living in the page itself — the home route,
   * where the index isn't a menu, it's the content.
   */
  variant?: 'overlay' | 'inline'
}>(), { variant: 'overlay' })

const emit = defineEmits<{ close: []; navigate: [href: string] }>()

const activeGroup = ref(props.groups[0]?.id ?? '')
watch(() => props.groups, g => {
  if (!g.some(x => x.id === activeGroup.value)) activeGroup.value = g[0]?.id ?? ''
})

const current = computed(() => props.groups.find(g => g.id === activeGroup.value) ?? props.groups[0])

/* Columns collapse the same way the source does: 4 → 3 → 2 → 1. */
const columns = ref(4)
/* Measured off the real breakpoints (Inspiration/WANDA_SYSTEM.md §3): the
   source jumps straight from 3 columns to 1 at 1024px — there is no 2-column
   tier anywhere in its stylesheet. */
function readColumns() {
  const w = window.innerWidth
  columns.value = w <= 1024 ? 1 : w <= 1450 ? 3 : 4
}

/* The source splits a flat list into columns with ceil(i*n/cols) rather than
   round-robin, so each column stays alphabetically contiguous — you read down
   a column, not across the row. */
function column(items: NavItem[], i: number, cols: number) {
  const n = items.length
  return items.slice(Math.ceil((i * n) / cols), Math.ceil(((i + 1) * n) / cols))
}
/* The source runs 39 names through 4 columns, so it never has to think about
   sparse lists. Ours are short, and ceil(i*n/cols) on n=2, cols=4 puts the two
   names in columns 1 and 3 with holes between them. Capping the column count at
   the list length keeps the algorithm and drops the holes. */
const grid = computed(() => {
  const items = current.value?.items ?? []
  const cols = Math.max(1, Math.min(columns.value, items.length))
  return Array.from({ length: cols }, (_, i) => column(items, i, cols))
})

/* ─── Floating thumbnail ─────────────────────────────────────────────── */

const thumbRoot = ref<HTMLElement | null>(null)
const hovered = ref<NavItem | null>(null)
const thumbEl = ref<HTMLElement | null>(null)

const HEADER = 75
const rand = (min: number, max: number) => min + Math.random() * Math.max(0, max - min)

/**
 * Place the thumbnail in the free space beside the hovered word.
 *
 * The bounds are the viewport inset by the gutters and the header. Within
 * those, we measure how much room exists on each side of the hovered item and
 * drop the thumbnail into whichever side can actually hold it — so it reads as
 * "next to the name you're pointing at" rather than landing on top of it.
 */
function place(anchor: HTMLElement, el: HTMLElement) {
  const gutter = parseInt(getComputedStyle(el).getPropertyValue('--w-gutter')) || 160
  const { width: tw, height: th } = el.getBoundingClientRect()
  const v = anchor.getBoundingClientRect()

  const left = gutter
  const right = window.innerWidth - gutter
  const top = HEADER
  const bottom = window.innerHeight - HEADER

  const roomLeft = v.left - left
  const roomRight = right - (v.left + v.width)
  const roomAbove = v.top - top
  const roomBelow = bottom - (v.top + v.height)

  const x = roomRight >= tw
    ? rand(right - roomRight, right - tw)
    : roomLeft >= tw
      ? rand(left, left + roomLeft - tw)
      : rand(left, right - tw)

  const y = roomBelow >= th
    ? rand(bottom - roomBelow, bottom - th)
    : roomAbove >= th
      ? rand(top, top + roomAbove - th)
      : rand(top, bottom - th)

  gsap.set(el, { x, y })
}

function show(item: NavItem, ev: MouseEvent) {
  if (!item.image) return
  hovered.value = item
  const anchor = ev.currentTarget as HTMLElement
  nextTick(() => {
    const el = thumbEl.value
    if (!el) return
    place(anchor, el)
    gsap.killTweensOf(el)
    gsap.set(el, { zIndex: 200 })
    gsap.to(el, { duration: 0.2, autoAlpha: 1, ease: 'sine' })
    gsap.fromTo(el, { scale: 1.05 }, { duration: 0.6, scale: 1, ease: 'expo' })
  })
}

function hide() {
  const el = thumbEl.value
  if (el) {
    gsap.killTweensOf(el)
    gsap.set(el, { zIndex: 100 })
    gsap.to(el, { duration: 0.3, autoAlpha: 0, ease: 'sine.inOut', onComplete: () => { hovered.value = null } })
  } else {
    hovered.value = null
  }
}

/* Closing the panel must not leave a thumbnail mid-fade on the next open. */
watch(() => props.open, o => { if (!o) hide() })

function onKey(e: KeyboardEvent) { if (e.key === 'Escape' && props.open) emit('close') }

onMounted(() => {
  readColumns()
  window.addEventListener('resize', readColumns)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', readColumns)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div
    class="w-index"
    :class="[`w-index--${variant}`, { 'is-open': open || variant === 'inline' }]"
    :aria-hidden="(open || variant === 'inline') ? 'false' : 'true'"
  >
    <WandaCloseBtn v-if="variant === 'overlay'" @click="emit('close')" />

    <div class="w-index-container">
      <div class="w-index-lists">
        <div v-if="groups.length > 1" class="w-index-filters">
          <button
            v-for="g in groups"
            :key="g.id"
            class="w-index-filter"
            type="button"
            :class="{ 'is-active': g.id === activeGroup }"
            @click="activeGroup = g.id"
            @mouseleave="hide"
          >
            {{ g.label }}
          </button>
        </div>

        <div class="w-index-grids">
          <div class="w-index-grid">
            <ul v-for="(col, i) in grid" :key="i">
              <li v-for="item in col" :key="item.id">
                <NuxtLink
                  :to="item.href"
                  :class="{ 'is-active': item.href === activeHref }"
                  @mouseenter="show(item, $event)"
                  @mouseleave="hide"
                  @click="emit('navigate', item.href)"
                >
                  {{ item.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div ref="thumbRoot" class="w-thumbs" aria-hidden="true">
      <div v-if="hovered" ref="thumbEl" class="w-thumb" :class="{ 'w-thumb--portrait': hovered.portrait }">
        <div class="w-thumb-media">
          <img :src="hovered.image" :alt="''" loading="lazy" decoding="async">
        </div>
      </div>
    </div>
  </div>
</template>
