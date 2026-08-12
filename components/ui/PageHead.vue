<script setup lang="ts">
/**
 * The masthead every interior page opens with.
 *
 * Before this existed each page hand-rolled its own eyebrow/title/deck with a
 * different clamp(), a different tracking and a different rhythm, so no two
 * routes agreed on how big a page title is. One component, one ramp, one set
 * of reveal delays — the pages now read as chapters of the same book.
 *
 * The `index` slot on the right is the mono counter ("04 PROJECTS") that gives
 * a landing page its studio voice.
 */
defineProps<{
  eyebrow?: string
  title: string
  deck?: string
  intro?: string
  /** Short right-hand metadata, e.g. "04 tools". Rendered in mono. */
  meta?: string
}>()

const R = useReveal()
const rv = { eyebrow: R.rise(0), title: R.rise(90), deck: R.rise(190), intro: R.rise(260) }

// The masthead tracks its own position, so the title drifts and settles as the
// page moves under it rather than sitting still like a printed header.
const head = ref<HTMLElement | null>(null)
useScrollProgress(head)
</script>

<template>
  <header class="ph" ref="head">
    <div class="ph__top">
      <p v-if="eyebrow" class="t-mono ph__eyebrow" v-motion
         :initial="rv.eyebrow.initial" :visible-once="rv.eyebrow.visibleOnce">{{ eyebrow }}</p>
      <p v-if="meta" class="t-mono ph__meta" v-motion
         :initial="rv.eyebrow.initial" :visible-once="rv.eyebrow.visibleOnce">{{ meta }}</p>
    </div>

    <h1 class="t-display ph__title" v-motion
        :initial="rv.title.initial" :visible-once="rv.title.visibleOnce">{{ title }}</h1>

    <p v-if="deck" class="ph__deck" v-motion
       :initial="rv.deck.initial" :visible-once="rv.deck.visibleOnce">{{ deck }}</p>
    <p v-if="intro" class="ph__intro" v-motion
       :initial="rv.intro.initial" :visible-once="rv.intro.visibleOnce">{{ intro }}</p>

    <slot />
  </header>
</template>

<style scoped>
.ph { margin-bottom: clamp(40rem, 6vw, 84rem); }
/* The eyebrow and the counter sit on one hairline-separated line — the studio
   masthead convention, and it gives the title something to hang from. */
.ph__top {
  display: flex; align-items: baseline; justify-content: space-between; gap: 20rem;
  padding-bottom: 14rem; margin-bottom: clamp(18rem, 2.5vw, 30rem);
  border-bottom: 1px solid var(--color-divider);
}
.ph__eyebrow { color: var(--color-text); opacity: 0.55; margin: 0; }
.ph__meta { color: var(--color-text); opacity: 0.35; margin: 0; white-space: nowrap; }

/* Huge, and it moves. The title slides against the scroll and loses a little
   weight as it goes, which reads as the page having depth — the heading sits on
   a plane behind the content instead of on the same sheet of paper.
   `--pc` is clamped in the calc so a title parked mid-screen barely moves and
   only the extremes travel. */
.ph__title {
  font-size: var(--text-h1);
  margin: 0;
  max-width: 14ch;
  will-change: transform;
  transform: translate3d(calc(var(--pc, 0) * -3.5vw), calc(var(--pc, 0) * -1.2vh), 0);
  font-variation-settings: "wght" calc(860 - var(--p, 0.5) * 120);
}
@media (prefers-reduced-motion: reduce) { .ph__title { transform: none; } }
.ph__deck {
  font-size: var(--text-lead); line-height: 1.4; letter-spacing: -0.01em;
  margin: clamp(16rem, 2vw, 26rem) 0 0; max-width: var(--measure-deck); opacity: 0.75;
}
.ph__intro {
  font-size: var(--text-body); line-height: 1.65;
  margin: 18rem 0 0; max-width: var(--measure-body); opacity: 0.55;
}

/* ── Short viewports ──────────────────────────────────────────────────────
   The ramp above is clamped against viewport WIDTH only, so on a wide-but-
   short laptop the masthead stayed at full size while the room beneath it
   vanished. Measured at 1440x760 on /tools: 599px of masthead on a 760px
   screen, leaving 161px for a 488px deck.

   The title's own compression lives on --text-h1 in main.css, so it reaches
   pages that style their own h1 from the token (/about, the case studies) and
   not just the ones using this component. What is left here is the masthead's
   vertical rhythm, which only this component owns. */
@media (max-height: 900px) and (min-width: 641px) {
  .ph        { margin-bottom: clamp(26rem, 4vh, 60rem); }
  .ph__top   { margin-bottom: clamp(14rem, 2vh, 30rem); }
  .ph__deck  { margin-top: clamp(12rem, 1.8vh, 26rem); }
  .ph__intro { margin-top: 12rem; }
}
</style>
