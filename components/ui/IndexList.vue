<script setup lang="ts">
import type { NavItem } from '~/types/nav'

/**
 * The numbered editorial index — the pattern that carries almost every
 * award-winning portfolio's landing pages.
 *
 * A route's contents were previously a grid of identical small glass cards
 * marooned in an otherwise empty page: nothing led the eye, nothing showed the
 * work, and two entries looked exactly like twelve would. This replaces that
 * with full-width rows on hairlines — mono index, display title, meta, arrow —
 * and gives the work somewhere to actually appear.
 *
 * On a fine pointer the hovered row's artwork rides the cursor (rAF lerp,
 * factor 0.1) and its siblings dim, so the list behaves like a set of drawers
 * rather than a table. Touch has no hover to trade on, so each row simply
 * carries its own thumbnail. Reduced motion gets the thumbnails and no
 * follower — the page still shows every image, nothing flies.
 */
const props = defineProps<{
  items: NavItem[]
  /** Fallback line when there is nothing to list yet. */
  empty?: string
}>()

const R = useReveal()
const root = ref<HTMLElement | null>(null)
const media = ref<HTMLElement | null>(null)
const hovered = ref(-1)
const src = ref('')

// `follow` is the whole conditional: pointer must be fine AND motion allowed.
// Everything below is a no-op when it is false, so the touch and reduced-motion
// paths never pay for the follower.
const follow = ref(false)

let raf = 0
const pos = { x: 0, y: 0 }      // lerped display position
const target = { x: 0, y: 0 }   // real cursor
let scale = 0, scaleTarget = 0

function onMove(e: PointerEvent) {
  // Vertical tracks the pointer exactly. Horizontal does *not*: a plate centred
  // on the cursor sits straight on top of the title you are reading, which is
  // the one thing the row exists to show. Parking it in the empty right half of
  // the list keeps it clear of the type while the vertical travel and the
  // scale-in still make it feel attached to the hand.
  target.y = e.clientY
  const r = root.value?.getBoundingClientRect()
  const w = media.value?.offsetWidth ?? 300
  if (!r) { target.x = e.clientX; return }
  // Reserve the last ~118px for the meta + arrow columns so the plate lands in
  // the genuinely empty middle-right of the row rather than on top of them.
  const anchor = r.right - 118 - w / 2
  // A touch of horizontal parallax so it isn't rigidly pinned.
  target.x = anchor + (e.clientX - (r.left + r.width / 2)) * 0.05
}
function enter(i: number) {
  hovered.value = i
  if (!follow.value) return
  const img = props.items[i]?.img
  if (img) { src.value = img; scaleTarget = 1 }
}
function leave(i: number) {
  if (hovered.value === i) hovered.value = -1
  scaleTarget = 0
}

function tick() {
  raf = requestAnimationFrame(tick)
  if (!media.value) return
  // Same lerp constant the reference implementations use: fast enough to feel
  // attached to the hand, slow enough to read as a separate object with weight.
  pos.x += (target.x - pos.x) * 0.14
  pos.y += (target.y - pos.y) * 0.14
  scale += (scaleTarget - scale) * 0.14
  media.value.style.transform =
    `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`
  media.value.style.opacity = String(Math.min(1, scale * 1.4))
}

onMounted(() => {
  follow.value = matchMedia('(hover: hover) and (pointer: fine)').matches
    && !matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!follow.value) return
  // Seed at the centre so the first reveal grows from where the eye already is
  // rather than flying in from the top-left corner.
  const r0 = root.value?.getBoundingClientRect()
  pos.x = target.x = r0 ? r0.right - 160 : innerWidth / 2
  pos.y = target.y = innerHeight / 2
  addEventListener('pointermove', onMove, { passive: true })
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  removeEventListener('pointermove', onMove)
})

const pad = (i: number) => String(i + 1).padStart(2, '0')
</script>

<template>
  <div class="ix" ref="root" :class="{ 'ix--lifted': hovered >= 0 }">
    <ol v-if="items.length" class="ix__list">
      <li v-for="(item, i) in items" :key="item.id" class="ix__li"
          v-motion :initial="R.riseIn(i, 60).initial" :visible-once="R.riseIn(i, 60).visibleOnce">
        <NuxtLink :to="item.href" class="ix__row"
                  @pointerenter="enter(i)" @pointerleave="leave(i)"
                  @focus="enter(i)" @blur="leave(i)">
          <span class="t-mono ix__n" aria-hidden="true">{{ pad(i) }}</span>

          <!-- Touch and reduced-motion get the image in the row itself. The
               follower would otherwise leave those visitors with no artwork. -->
          <span v-if="item.img" class="ix__thumb" aria-hidden="true">
            <img class="mono-img" :src="item.img" alt="" loading="lazy" decoding="async">
          </span>

          <span class="ix__body">
            <span class="t-display ix__title">{{ item.label }}</span>
            <span class="ix__desc">{{ item.description }}</span>
          </span>

          <span v-if="item.meta" class="t-mono ix__meta" aria-hidden="true">{{ item.meta }}</span>

          <span class="ix__arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
                 stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </span>
        </NuxtLink>
      </li>
    </ol>

    <p v-else class="ix__empty">{{ empty || 'More is on the way. Check back soon.' }}</p>

    <!-- The cursor-tracked plate. Inert to pointer events so it can never
         interrupt the very hover that is driving it. -->
    <div v-if="follow" ref="media" class="ix__media" aria-hidden="true">
      <img v-if="src" class="mono-img" :src="src" alt="">
    </div>
  </div>
</template>

<style scoped>
.ix { position: relative; }
.ix__list { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--color-divider); }
.ix__li { border-bottom: 1px solid var(--color-divider); }

/* Flex, not grid: the thumbnail is removed entirely on hover devices, and with
   fixed grid tracks that shifted every remaining cell one column left — the
   meta landed mid-row instead of against the arrow. Flex just closes the gap. */
.ix__row {
  display: flex; align-items: center;
  gap: clamp(14rem, 2vw, 28rem);
  padding: clamp(20rem, 2.6vw, 34rem) 4rem;
  color: var(--color-text); text-decoration: none;
  transition: padding-left var(--dur-mid) var(--ease-out), opacity var(--dur-fast) ease;
}
.ix__row:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; border-radius: 10rem; }

.ix__n { flex: 0 0 auto; opacity: 0.4; transition: color var(--dur-fast) ease, opacity var(--dur-fast) ease; }

/* The inline thumbnail is the touch/reduced-motion path. On a fine pointer the
   follower does this job far better, so the inline one steps aside. */
.ix__thumb {
  width: 74rem; aspect-ratio: 16/9; border-radius: 8rem; overflow: hidden;
  background: var(--color-glass-bg); flex-shrink: 0;
}
.ix__thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

.ix__body { flex: 1 1 auto; display: grid; gap: 6rem; min-width: 0; }
.ix__title { font-size: var(--text-h2); line-height: 1.25; }
.ix__desc {
  font-size: var(--text-sm); line-height: 1.5; opacity: 0.55;
  max-width: 52ch;
  /* Two lines maximum: a landing index is a menu, not the article. */
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.ix__meta { flex: 0 0 auto; opacity: 0.4; white-space: nowrap; transition: opacity var(--dur-fast) ease; }

.ix__arrow {
  width: 26rem; height: 26rem; opacity: 0.35; flex-shrink: 0;
  transition: transform var(--dur-mid) var(--ease-out), opacity var(--dur-fast) ease;
}
.ix__arrow svg { width: 100%; height: 100%; }

.ix__empty { font-size: var(--text-body); opacity: 0.55; padding: 30rem 0; }

/* ── The cursor-tracked plate ─────────────────────────────────────────── */
.ix__media {
  position: fixed; top: 0; left: 0; z-index: 5;
  width: clamp(240rem, 22vw, 380rem); aspect-ratio: 16/9;
  border-radius: 14rem; overflow: hidden; pointer-events: none; opacity: 0;
  box-shadow: 0 40rem 80rem -40rem rgba(0,0,0,0.55);
  will-change: transform, opacity;
}
.ix__media img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* The inline thumbnail only stands down where the follower actually replaces
   it. Hiding it on every fine pointer left reduced-motion desktop visitors with
   no artwork at all, since the follower never starts for them. */
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .ix__thumb { display: none; }
}

@media (hover: hover) and (pointer: fine) {
  /* Siblings recede while one row is held — the list behaves like a set of
     drawers, and the eye is never asked to choose between equals. */
  .ix--lifted .ix__row { opacity: 0.38; }
  .ix--lifted .ix__row:hover,
  .ix--lifted .ix__row:focus-visible { opacity: 1; }
  .ix__row:hover { padding-left: clamp(10rem, 1.4vw, 22rem); }
  /* The plate lands where the meta sits, so the meta hands over rather than
     being written across — a swap, not a collision. */
  .ix__row:hover .ix__meta { opacity: 0; }
  .ix__row:hover .ix__n { color: var(--color-accent); opacity: 1; }
  .ix__row:hover .ix__arrow { transform: translate(4rem, -4rem); opacity: 1; }
}

@media (max-width: 720px) {
  .ix__row { gap: 12rem; padding: 16rem 2rem; }
  .ix__meta { display: none; }
  .ix__title { font-size: var(--text-h3); }
  .ix__desc { -webkit-line-clamp: 2; }
  .ix__thumb { width: 58rem; }
}
@media (prefers-reduced-motion: reduce) {
  .ix__row, .ix__arrow, .ix__n { transition: none; }
}
</style>
