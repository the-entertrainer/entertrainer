<script setup lang="ts">
import type { NavItem } from '~/types/nav'

/**
 * A section landing page: masthead plus the deck of what's inside.
 * Used by /tools and /my-work so those routes are real, crawlable
 * destinations rather than redirects back into the spiral.
 *
 * This used to render a numbered index — full-width rows on hairlines. Rows
 * read well, but they are still a list you scroll, and the brief was to
 * carry the home spiral's actual *interaction* everywhere, not just its
 * palette. So the entries now live in a UiSpatialDeck: the same drag,
 * momentum and spring-detent as the tower, with the front card the one
 * that's readable and everything else a receding preview you swipe through
 * to reach. The name is kept because several routes still import it.
 */
const props = defineProps<{
  eyebrow?: string
  title: string
  deck?: string
  intro?: string
  items: NavItem[]
  /** Overrides the auto "N projects" counter in the masthead. */
  meta?: string
  empty?: string
}>()

const count = computed(() =>
  props.meta ?? (props.items.length
    ? `${String(props.items.length).padStart(2, '0')} ${props.items.length === 1 ? 'entry' : 'entries'}`
    : undefined))

const pad = (i: number) => String(i + 1).padStart(2, '0')

/**
 * Scroll cue.
 *
 * This page is `position: fixed` with its own scroll container, so on a short
 * viewport there is no page scrollbar to suggest anything exists below — and
 * what's below is the deck's own nav buttons and the card's "Open". The cue
 * only appears when there is genuinely something to reach, and retires the
 * moment it has been understood.
 */
const scroller = ref<HTMLElement | null>(null)
const inner    = ref<HTMLElement | null>(null)
const canScroll = ref(false)
const scrolled  = ref(false)
const showCue = computed(() => canScroll.value && !scrolled.value)

function measure() {
  const el = scroller.value
  if (!el) return
  // Discount the page's own bottom padding. On /my-work at 1440x900 the deck
  // ends 15px above the fold and the only thing below it is 90px of trailing
  // whitespace — pointing at that would be a cue that leads nowhere.
  const slack = inner.value ? parseFloat(getComputedStyle(inner.value).paddingBottom) || 0 : 0
  canScroll.value = el.scrollHeight - el.clientHeight > slack + 24
}
function onScroll() {
  if (scroller.value && scroller.value.scrollTop > 12) scrolled.value = true
}

onMounted(() => {
  measure()
  // Artwork loading late changes the height, so re-measure rather than trusting
  // a single reading taken before the images had arrived.
  const ro = new ResizeObserver(measure)
  if (scroller.value) ro.observe(scroller.value)
  window.addEventListener('resize', measure)
  onBeforeUnmount(() => { ro.disconnect(); window.removeEventListener('resize', measure) })
})
</script>

<template>
  <div class="cg-page" ref="scroller" @scroll.passive="onScroll">
    <UiGlassBackdrop calm />

    <div class="cg-inner" ref="inner">
      <UiPageHead :eyebrow="eyebrow" :title="title" :deck="deck" :intro="intro" :meta="count" />

      <UiSpatialDeck v-if="items.length" :items="items" :aria-label="title">
        <template #default="{ item, index, active }">
          <NuxtLink :to="item.href" class="gd-card" :tabindex="active ? 0 : -1">
            <span class="gd-card__art" v-if="item.img">
              <UiCard3D :src="item.img" :alt="`Preview of ${item.label}`" ratio="fill" :strength="10" radius="0" />
            </span>
            <span class="gd-card__body">
              <span class="t-mono gd-card__n">{{ pad(index) }}</span>
              <span class="t-display gd-card__title">{{ item.label }}</span>
              <span class="gd-card__desc">{{ item.description }}</span>
              <span class="gd-card__go" aria-hidden="true">
                Open
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
              </span>
            </span>
          </NuxtLink>
        </template>
      </UiSpatialDeck>
      <p v-else class="cg-empty">{{ empty || 'More is on the way. Check back soon.' }}</p>

      <slot />
    </div>

    <Transition name="cg-cue">
      <p v-if="showCue" class="t-mono cg-cue" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </p>
    </Transition>
  </div>
</template>

<style scoped>
.cg-page { position: fixed; inset: 0; overflow-y: auto; z-index: 1; }
.cg-inner {
  max-width: 1180rem;
  margin: 0 auto;
  padding: calc(var(--page-top) + 20rem) clamp(20rem, 5vw, 60rem) calc(90rem + var(--safe-bottom));
}
@media (max-width: 640px) {
  .cg-inner { padding: calc(var(--page-top)) 18rem calc(60rem + var(--safe-bottom)); }
}

/* ── Masthead vs. deck, on a short viewport ───────────────────────────────
   The deck IS this page; the masthead is its label. But the masthead's rhythm
   is clamped against viewport WIDTH only, so on a wide-but-short laptop it
   stayed at full size while the space beneath it vanished. Measured at
   1440x760 on /tools: the masthead ran to 599px of a 760px screen, leaving
   161px for a 488px deck — both nav buttons and the card's own "Open" sat
   below the fold, on a fixed-position page with no scrollbar to hint that
   anything was down there.

   So the masthead gives ground as vertical space runs out. The title stays
   the largest thing on the page; it just stops being sized as though the
   screen were infinitely tall. Article routes are untouched — a tall title
   and a scroll is exactly right when the page IS the scroll. */
@media (max-height: 900px) and (min-width: 641px) {
  .cg-inner { padding-top: calc(var(--page-top) - 18rem); }
  .cg-inner :deep(.ph)        { margin-bottom: clamp(26rem, 4vh, 60rem); }
  .cg-inner :deep(.ph__title) { font-size: clamp(40px, 9.6vh, 112px); }
  .cg-inner :deep(.ph__top)   { margin-bottom: clamp(14rem, 2vh, 30rem); }
  .cg-inner :deep(.ph__deck)  { margin-top: clamp(12rem, 1.8vh, 26rem); }
  .cg-inner :deep(.ph__intro) { margin-top: 12rem; }
}

.cg-empty { font-size: var(--text-body); opacity: 0.55; }

/* ── Scroll cue ───────────────────────────────────────────────────────────
   Fixed to the viewport, not the scrolling content, so it stays put while the
   page moves under it. The line travels down and fades at the end rather than
   bouncing — a bounce reads as an alert, and this is only a hint. */
.cg-cue {
  position: fixed;
  /* NOT centred. The deck is centred, so dead-centre is the one place the cue
     is guaranteed to land on a card — the first draft printed "SCROLL" across
     the EasyMCQ artwork. The right margin is empty at every width the deck
     occupies, so the cue lives there instead. */
  right: clamp(16rem, 4vw, 52rem);
  bottom: calc(18rem + var(--safe-bottom));
  z-index: 3; margin: 0; pointer-events: none;
  display: flex; flex-direction: column; align-items: center; gap: 8rem;
  font-size: 10.5rem; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--color-text); opacity: 0.42;
  /* The corner it sits in can still be artwork on a narrow screen; the halo
     keeps it readable without drawing a box around it. */
  text-shadow: 0 0 12rem var(--color-bg), 0 0 4rem var(--color-bg);
}
.cg-cue i {
  display: block; width: 1px; height: 26rem;
  background: linear-gradient(to bottom, transparent, currentColor);
  transform-origin: top center;
  animation: cg-cue-fall 1.9s var(--ease-in-out) infinite;
}
@keyframes cg-cue-fall {
  0%        { transform: scaleY(0.25); opacity: 0; }
  35%       { transform: scaleY(1);    opacity: 1; }
  75%, 100% { transform: scaleY(1) translateY(14rem); opacity: 0; }
}
.cg-cue-enter-active { transition: opacity var(--dur-slow) var(--ease-out) 500ms; }
.cg-cue-leave-active { transition: opacity var(--dur-fast) var(--ease-in); }
.cg-cue-enter-from, .cg-cue-leave-to { opacity: 0; }

/* ── The card itself ──────────────────────────────────────────────────────
   Full-bleed artwork on top, the glass surface's own blur and rim underneath
   the text — one lit object, not a photo with a caption stapled beneath it. */
.gd-card {
  display: flex; flex-direction: column;
  width: 100%; height: 100%;
  border-radius: 20rem;
  overflow: hidden;
  text-decoration: none; color: var(--color-text);
  background: var(--color-glass-bg);
  backdrop-filter: blur(20px) saturate(1.3) brightness(1.08);
  -webkit-backdrop-filter: blur(20px) saturate(1.3) brightness(1.08);
  box-shadow: inset 0 1px 0 var(--glow-rim), inset 0 0 0 1px var(--color-glass-border);
  transition:
    box-shadow var(--dur-fast) var(--ease-out),
    background var(--dur-fast) var(--ease-out);
}
/* The card is inside a 3D deck that owns transform, so hover cannot move it —
   it brightens its rim instead. The arrow is what carries the motion. */
@media (hover: hover) {
  .gd-card:hover {
    background: var(--color-glass-bg-hover);
    box-shadow:
      inset 0 1px 0 var(--glow-rim),
      inset 0 0 0 1px var(--color-glass-border-hover),
      0 18rem 50rem -20rem var(--glow-soft);
  }
  .gd-card:hover .gd-card__go { opacity: 1; }
  .gd-card:hover .gd-card__go svg { transform: translate(2rem, -2rem); }
}
.gd-card__art { display: block; flex: 1 1 auto; min-height: 0; overflow: hidden; }
.gd-card__art :deep(.c3) { height: 100%; }
.gd-card__art :deep(.c3__plate) { border-radius: 0; box-shadow: none; height: 100%; }
.gd-card__art :deep(.c3__img) { height: 100%; }

/* The body needs a ground of its own, not the card's 5.5%-white glass.
   The deck overlaps cards by design — measured on /my-work, the next card
   starts 24px INTO this text block — so without a scrim the title and
   description are set over whatever artwork happens to be behind them, and on
   a bright card that is unreadable. The gradient keeps the glass look at the
   top edge (where it meets the artwork) and resolves to near-opaque ground by
   the time the type starts. */
.gd-card__body {
  position: relative;
  display: flex; flex-direction: column; gap: 5rem;
  padding: 20rem 22rem 22rem; flex-shrink: 0;
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--color-bg) 55%, transparent) 0%,
    color-mix(in srgb, var(--color-bg) 88%, transparent) 38%,
    color-mix(in srgb, var(--color-bg) 94%, transparent) 100%
  );
  backdrop-filter: blur(18px) saturate(1.2);
  -webkit-backdrop-filter: blur(18px) saturate(1.2);
}
.gd-card__n { opacity: 0.4; }
.gd-card__title { font-size: var(--text-h2); line-height: 1; }
.gd-card__desc {
  font-size: var(--text-sm); line-height: 1.5; opacity: 0.6; margin-top: 2rem;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.gd-card__go {
  display: inline-flex; align-items: center; gap: 6rem; margin-top: 10rem;
  font-family: var(--display-font); font-weight: 700; font-size: 12.5rem;
  letter-spacing: 0.02em; opacity: 0.7;
  transition: opacity var(--dur-fast) var(--ease-out);
}
/* The arrow leaves along its own diagonal — the direction it points. A
   generic translateY here would have been motion without meaning. */
.gd-card__go svg { transition: transform var(--dur-fast) var(--ease-out); }

@media (prefers-reduced-motion: reduce) {
  .gd-card,
  .gd-card__go,
  .gd-card__go svg { transition-duration: 1ms; }
  .gd-card:hover .gd-card__go svg { transform: none; }
  /* The cue still says "scroll" — it just stops moving to say it. */
  .cg-cue i { animation: none; opacity: 0.7; }
  .cg-cue-enter-active, .cg-cue-leave-active { transition-duration: 1ms; }
}
</style>
