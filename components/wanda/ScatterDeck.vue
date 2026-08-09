<script setup lang="ts">
/**
 * The real wanda.net mobile home, not the plain text index this repo assumed
 * it was for two rebuilds running. A device-emulated render never showed it
 * (the reveal is gated behind Nuxt/Vuex state a static mirror can't
 * reconstruct — see Inspiration/WANDA_SYSTEM.md §10) but a real phone
 * recording did: on touch, `.MenuThumbnail` isn't hover-gated content that
 * happens to be invisible without a mouse — it's the whole homepage, an
 * always-visible, endlessly scrollable deck of overlapping video panels,
 * offset left/right in a cascade, each one layered over the tail of the one
 * before it. §12 has the full writeup; this component is the read of it.
 *
 * Two adaptations from the reference, both deliberate:
 *  - No autoplaying video, so a small caption rides over the tail of each
 *    card. The source can skip captions because the *motion* of dozens of
 *    reels is the content; eight static screenshots need a name attached or
 *    the deck is just decoration.
 *  - The scroll-linked drift is a genuine addition, not a measurement — nothing
 *    in the reference proves differential per-panel speed rather than plain
 *    scroll plus autoplaying video giving the illusion of it. It's here
 *    because "parallax" was the word used to ask for this, and a uniform
 *    scroll wouldn't earn it.
 */
import type { ComponentPublicInstance } from 'vue'
import type { Panel } from '~/types/panel'

const props = defineProps<{ items: Panel[] }>()

const prefersReduced = ref(false)
const root = ref<HTMLElement | null>(null)
const itemEls = ref<HTMLElement[]>([])
const revealed = ref<boolean[]>(props.items.map(() => false))

/* Alternating side, alternating drift direction, mild width variation — enough
   irregularity to read as a loose stack rather than a repeating tile. */
function seed(i: number) {
  const side: 'left' | 'right' = i % 2 === 0 ? 'left' : 'right'
  const driftSign = i % 3 === 0 ? -1 : 1
  const driftFactor = driftSign * (0.05 + (i % 4) * 0.015)
  const widthPct = 74 + (i % 3) * 4
  return { side, driftFactor, widthPct }
}
const seeds = computed(() => props.items.map((_, i) => seed(i)))

let io: IntersectionObserver | null = null
let ticking = false
let scrollHandler: (() => void) | null = null

function setItemEl(el: Element | ComponentPublicInstance | null, i: number) {
  if (el instanceof HTMLElement) itemEls.value[i] = el
}

function applyParallax() {
  ticking = false
  if (prefersReduced.value) return
  const vh = window.innerHeight
  itemEls.value.forEach((el, i) => {
    if (!el) return
    const rect = el.getBoundingClientRect()
    const centerDelta = rect.top + rect.height / 2 - vh / 2
    const offset = -centerDelta * seeds.value[i].driftFactor
    const clamped = Math.max(-48, Math.min(48, offset))
    el.style.setProperty('--drift', `${clamped.toFixed(1)}px`)
  })
}
function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(applyParallax)
}

onMounted(() => {
  prefersReduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  io = new IntersectionObserver(
    entries => {
      for (const e of entries) {
        const i = itemEls.value.indexOf(e.target as HTMLElement)
        if (i >= 0 && e.isIntersecting) {
          revealed.value[i] = true
          io?.unobserve(e.target)
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.15 }
  )
  itemEls.value.forEach(el => el && io?.observe(el))

  if (!prefersReduced.value) {
    scrollHandler = onScroll
    window.addEventListener('scroll', scrollHandler, { passive: true })
    applyParallax()
  }
})
onBeforeUnmount(() => {
  io?.disconnect()
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
})
</script>

<template>
  <ul ref="root" class="deck" role="list">
    <li
      v-for="(item, i) in items"
      :key="item.id"
      :ref="el => setItemEl(el, i)"
      class="deck-item"
      :class="[`deck-item--${seeds[i].side}`, { 'is-in': revealed[i] }]"
      :style="{ width: seeds[i].widthPct + '%', zIndex: 100 + i }"
    >
      <NuxtLink :to="item.href" class="deck-card" :style="{ '--accent': item.accent }">
        <span class="deck-caption">
          <span class="deck-number">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="deck-label">{{ item.label }}</span>
        </span>
        <span class="deck-media" :class="{ 'deck-media--portrait': item.portrait }">
          <img v-if="item.image" :src="item.image" :alt="item.label" loading="lazy" decoding="async">
        </span>
      </NuxtLink>
    </li>
  </ul>
</template>

<style scoped>
.deck {
  position: relative;
  list-style: none;
  margin: 0;
  padding: 40px 0 120px;
  display: flex;
  flex-direction: column;
}

.deck-item {
  position: relative;
  /* First card sits in flow; every card after overlaps the tail of the one
     before it — the cascade the reference is built from.
     Measured off a real recording (Inspiration/WANDA_SYSTEM.md §13): the
     overlap is shallow, roughly 15–25% of the card above's own height, not
     the 40%+ a vh-based value produced here originally — vh has no
     relationship to a card's rendered height, so it happened to look
     plausible at one viewport and wrong at every other one. A vertical
     margin given as a PERCENTAGE resolves against the CONTAINING BLOCK'S
     WIDTH per the CSS box model (a genuine quirk, not a bug) — which is
     exactly what's wanted here, since a card's own height is a fixed
     multiple of its width (16:10 or 3:4), so this one value tracks the
     cascade correctly at every breakpoint without a tiered vh/vw override
     underneath it. */
  margin-top: -9%;
  transform: translateY(var(--drift, 0px));
  opacity: 0;
  transition:
    opacity 0.6s var(--w-ease-out),
    transform 0.7s var(--w-ease-out);
}
.deck-item:first-child { margin-top: 0; }
.deck-item.is-in { opacity: 1; }
/* The entrance rise and the scroll drift both live on transform, so they have
   to compose in one declaration — is-in adds the rise-to-rest distance on top
   of whatever --drift already holds, rather than one clobbering the other. */
.deck-item:not(.is-in) { transform: translateY(calc(var(--drift, 0px) + 56px)); }

.deck-item--left { align-self: flex-start; padding-left: var(--w-gutter); }
.deck-item--right { align-self: flex-end; padding-right: var(--w-gutter-right); }

.deck-card {
  position: relative;
  display: block;
  color: var(--w-fg);
}

/* Anchored to the TOP of the card, not the bottom. Every card's negative
   margin-top pulls its own top edge up into the tail of the card before it —
   nothing ever pulls the reverse direction, so a card's top is the one region
   of it that a later card can never paint over. A bottom-anchored caption
   here (the first version of this component had one) gets silently buried
   under the next card in the stack the moment the overlap is deep enough,
   which on a small screen is most of the time. */
.deck-caption {
  position: absolute;
  left: 14px;
  top: 14px;
  z-index: 2;
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  padding: 6px 10px;
  background: rgba(8, 8, 8, 0.72);
  backdrop-filter: blur(2px);
  font-family: var(--w-mono);
  font-size: 15px;
  line-height: 1.2;
  white-space: nowrap;
}
.deck-number { color: var(--accent); }

.deck-media {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--w-bg-raised);
}
.deck-media--portrait { aspect-ratio: 3 / 4; }
.deck-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.88;
  transform: scale(1.02);
  transition:
    opacity 0.4s ease-out,
    transform 0.6s var(--w-ease-out);
}
.deck-card:hover .deck-media img,
.deck-card:focus-visible .deck-media img { opacity: 1; transform: scale(1); }

@media (max-width: 1024px) {
  .deck-item--left { padding-left: var(--w-gutter); }
  .deck-item--right { padding-right: var(--w-gutter-right); }
}
@media (max-width: 812px) {
  .deck { padding-top: calc(var(--w-header-h-mobile) + 30px); }
  /* The per-card widths from seed() (74/78/82%) carry through unchanged —
     the reference's own cards vary between roughly 63% and 75%, so flattening
     every card to one fixed width here (an earlier version forced 84%) was
     losing exactly the size variety that makes the cascade read as loose
     rather than tiled. */
  .deck-item--left { padding-left: 15px; }
  .deck-item--right { padding-right: 15px; }
  .deck-caption { font-size: 14px; }
}

@media (hover: none) {
  .deck-media img { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .deck-item {
    opacity: 1;
    transform: none !important;
    transition: none;
  }
}
</style>
