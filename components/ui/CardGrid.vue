<script setup lang="ts">
import type { NavItem } from '~/types/nav'

/**
 * A section landing page: masthead plus the deck of what's inside.
 * Used by /tools and /my-work so those routes are real, crawlable
 * destinations rather than redirects back into the spiral.
 *
 * These entries spent a release inside a drag deck — one card readable, the
 * rest receding previews you had to swipe to reach. It carried the home
 * stage's interaction, which was the brief, but it was the wrong container
 * for the content: this page holds two projects and four tools, and a deck
 * showed you one of them. Carousel research is blunt about the cost — roughly
 * 1% of visitors interact with the first slide and under 0.5% with any slide
 * after it — so on a page whose entire job is "here is everything I have
 * made", hiding three quarters of it behind a gesture is indefensible.
 *
 * A grid shows all of them at once, which is what the page is for. The drag
 * deck remains in the codebase for the home stage, where it belongs: there
 * the stack IS the composition, not a lid on a list.
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
    <UiPageOptics />

    <div class="cg-inner" ref="inner">
      <div class="cg-lede">
        <UiPageHead :eyebrow="eyebrow" :title="title" :deck="deck" :meta="count" />
      </div>

      <div class="cg-deck">
      <ul v-if="items.length" class="cg-grid">
        <li v-for="(item, index) in items" :key="item.href" class="u-reveal">
          <NuxtLink :to="item.href" class="gd-card lg lg--raised lg--interactive">
            <span class="gd-card__art" v-if="item.img">
              <UiCard3D :src="item.img" :alt="`Preview of ${item.label}`" ratio="16/9" :strength="10" radius="0" />
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
        </li>
      </ul>
      <p v-else class="cg-empty">{{ empty || 'More is on the way. Check back soon.' }}</p>
      </div>

      <!-- Deliberately its own block rather than a slot inside the masthead.
           On a phone the masthead ran to 460px of an 844px screen before the
           card even started, on a page whose entire content is the card. The
           supporting paragraph is the least urgent thing here, so on narrow
           screens it moves below the deck and the content leads. On desktop it
           returns to the left column under the title, where there is room. -->
      <p v-if="intro" class="cg-intro">{{ intro }}</p>

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
/* The shared page frame — same gutter and page box as every other content
   route, so the left edge does not move when you navigate. The masthead's
   short-viewport compression now lives in UiPageHead, where it applies to
   landing pages and detail pages alike; keeping it here made /my-work's title
   86px while its own child pages stayed at 112px, so a section was smaller
   than the things inside it. */
.cg-inner {
  max-width: var(--shell-max);
  margin: 0 auto;
  padding: calc(var(--page-top) + 20rem) var(--shell-gutter) calc(90rem + var(--safe-bottom));
}
@media (max-width: 640px) {
  .cg-inner { padding-top: var(--page-top); padding-bottom: calc(60rem + var(--safe-bottom)); }
}

/* ── Two columns, because the page had two spare halves ───────────────────
   Stacked, this page spent its top 486px on a masthead whose text measure is
   408px wide inside a 1180px frame — so 770px of width sat empty beside the
   type while the deck, the only thing anyone came for, got whatever height was
   left and rendered at 19% of the viewport.

   Side by side, the masthead keeps its own measure and the deck gets both the
   remaining width AND a top edge near the top of the page, which is what makes
   `fill` worth anything. Below 900px it stacks, because two columns of 400px
   is worse than one of 800. */
/* Mobile order: masthead, card, supporting copy. */
.cg-intro {
  font-size: var(--text-body); line-height: 1.65;
  max-width: var(--measure-body); opacity: 0.55;
  margin: clamp(26rem, 4vh, 40rem) 0 0;
}

@media (min-width: 901px) {
  .cg-inner {
    display: grid;
    grid-template-columns: minmax(0, 0.76fr) minmax(0, 1.24fr);
    grid-template-areas: "lede deck" "intro deck";
    grid-template-rows: auto 1fr;
    gap: clamp(28rem, 4vw, 68rem);
    column-gap: clamp(28rem, 4vw, 68rem);
    row-gap: 0;
    align-items: start;
  }
  .cg-lede  { grid-area: lede; }
  .cg-intro { grid-area: intro; margin-top: clamp(20rem, 2.5vw, 32rem); }
  .cg-deck  { grid-area: deck; min-width: 0; }
  /* The masthead no longer needs to clear the deck below it — the deck is
     beside it now. */
  .cg-lede :deep(.ph) { margin-bottom: 0; }
}

/* Two up wherever the column can hold it, one up when it cannot. With two
   projects that is a single row; with four tools it is two. Either way you
   see all of them without touching anything. */
.cg-grid {
  list-style: none; margin: 0; padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260rem, 1fr));
  gap: clamp(14rem, 1.6vw, 22rem);
}
.cg-grid > li { min-width: 0; display: flex; }

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
  /* Surface, rim, specular and cast all come from .lg now — this used to be a
     hand-rolled copy of the same stack with its own numbers. */
}
/* The card is inside a 3D deck that owns transform, so hover cannot move it —
   it brightens its rim instead. The arrow is what carries the motion. */
@media (hover: hover) {
  .gd-card:hover .gd-card__go { opacity: 1; }
  .gd-card:hover .gd-card__go svg { transform: translate(2rem, -2rem); }
}
/* Out of the deck, nothing else is writing this card's transform, so it can
   lift on hover like every other raised surface on the site. */
@media (hover: hover) {
  .gd-card.lg--interactive:hover { transform: translateY(var(--lift)); }
}
.gd-card__art { display: block; overflow: hidden; }
.gd-card__art :deep(.c3__plate) { border-radius: 0; box-shadow: none; }

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
