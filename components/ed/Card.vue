<script setup lang="ts">
import { categoryMeta, type EditorialItem } from '~/content/editorial'

/**
 * A story card.
 *
 * Four variants, one object. The rule that shaped it: the card has to be
 * readable with the image missing, so the artwork is a band at the top rather
 * than a background the type sits on. Text over a photograph is a card that
 * becomes unreadable the moment the photograph is slow, dark, or absent.
 *
 * The whole card is one link. A card with a title link and a separate "Open"
 * link is two tab stops and two targets for one destination.
 */
const props = withDefaults(defineProps<{
  item: EditorialItem
  variant?: 'feature' | 'standard' | 'wide' | 'tall' | 'compact'
  /** Index in the field, used only for the printed running number. */
  index?: number
  /** Passed to the chip. Section indexes drop the category — see EdChip. */
  chip?: 'both' | 'category' | 'media'
}>(), { variant: 'standard', chip: 'both' })

const meta = computed(() => categoryMeta(props.item.category))
const num = computed(() => props.index === undefined ? null : String(props.index + 1).padStart(2, '0'))
const hasArt = computed(() => props.variant !== 'compact' && !!props.item.image)
</script>

<template>
  <article class="card" :class="[`card--${variant}`, { 'card--noart': !hasArt }]"
           :style="{ '--accent': meta.accent, '--on-accent': meta.onAccent }">
    <NuxtLink :to="item.href" class="card__hit">
      <!-- The index row. A running number and the entry's stamp, above the
           artwork, in the manner of a printed contents page. The number is
           position in the index — honest, and it changes if the index does —
           not an invented issue number. -->
      <span class="card__index">
        <!-- The lead has no number: it is not a position in the field, it is
             the thing pulled out of it. -->
        <span v-if="num" class="t-mono card__pill">#{{ num }}</span>
        <span v-else-if="variant === 'feature'" class="t-mono card__pill card__pill--lead">Lead</span>
        <span class="t-mono card__stamp">{{ item.stamp }}</span>
      </span>

      <span v-if="hasArt" class="card__art">
        <!-- The lead is above the fold on every viewport, so it is the one
             image on the page that must not wait for the lazy-load pass. -->
        <img :src="item.image" :alt="item.alt || ''" decoding="async"
             :loading="variant === 'feature' ? 'eager' : 'lazy'"
             :fetchpriority="variant === 'feature' ? 'high' : undefined" />
      </span>

      <span class="card__body">
        <span class="card__top">
          <EdChip :category="item.category" :media="item.media" :show="chip"
                  :tone="variant === 'feature' ? 'solid' : 'outline'" />
        </span>

        <component :is="variant === 'feature' ? 'h2' : 'h3'" class="card__title t-display">{{ item.title }}</component>

        <span class="card__dek">{{ item.dek }}</span>

        <span class="card__foot t-mono">
          <span v-if="item.minutes">{{ item.minutes }} min read</span>
          <span v-else>Open</span>
          <span class="card__go" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4"
                 stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </span>
        </span>
      </span>
    </NuxtLink>
  </article>
</template>

<style scoped>
.card { position: relative; height: 100%; }

.card__hit {
  display: flex; flex-direction: column;
  height: 100%;
  background: var(--paper);
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-m);
  overflow: hidden;
  color: var(--ink);
  
  transition:
    transform var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out);
}
/* Short travel, a degree of rotation, 160ms — the card behaves like a printed
   thing being nudged rather than a div being animated. */
@media (hover: hover) {
  .card__hit:hover {   }
  .card:nth-child(even) .card__hit:hover { rotate: 0.5deg; }
}
.card__hit:active {   transition-duration: var(--dur-tap); }
.card__hit:focus-visible { outline: 3px solid var(--blue); outline-offset: 3px; }

/* The index row: running number and stamp, above the artwork. */
.card__index {
  display: flex; align-items: center; justify-content: space-between; gap: 12rem;
  padding: 12rem 16rem;
}
.card__pill {
  padding: 4rem 11rem; border-radius: var(--radius-full);
  border: var(--stroke) solid var(--ink); color: var(--ink);
}
.card__pill--lead { background: var(--ink); color: var(--paper); }
.card__stamp { color: var(--muted); text-align: right; }

/* The work leads. Category colour is a precise wayfinding detail, not a large
   frame that makes every item in a collection look interchangeable. */
.card__art {
  display: block; position: relative;
  flex: none;
  aspect-ratio: 16 / 9;
  background: var(--paper-2);
  border-top: 4rem solid var(--accent);
  border-bottom: var(--stroke) solid var(--line);
  overflow: hidden;
  padding: clamp(10rem, 1.35vw, 16rem);
}
.card__art img {
  width: 100%; height: 100%; object-fit: contain; display: block;
  border: var(--stroke) solid var(--line-strong);
  /* Every cover is a white sheet in both themes — they are printed pages, not
     interface. The letterbox `contain` leaves on the variants whose frame is
     not exactly 16:9 (the lead, and the wide cards) therefore has to be the
     white of the sheet, not the theme's paper: with `var(--paper)` here, dark
     mode drew black bars down either side of every cover, inside the accent. */
  background: #FFFFFF;
}

.card__body {
  display: flex; flex-direction: column; gap: 10rem;
  padding: 16rem 18rem 18rem;
  flex: 1;
}
.card__top { display: flex; align-items: center; justify-content: space-between; gap: 12rem; }

.card__title {
  font-size: var(--type-card);
  line-height: 1.02;
  margin: 2rem 0 0;
  text-decoration: none;
}
.card__dek {
  font-family: var(--font-reading);
  font-size: 15.5rem; line-height: 1.55;
  color: var(--muted);
}
.card__foot {
  margin-top: auto; padding-top: 12rem;
  display: flex; align-items: center; justify-content: space-between; gap: 6rem;
  color: var(--muted);
  border-top: var(--stroke) solid var(--line);
}
.card__go { display: inline-flex; transition: transform var(--dur-fast) var(--ease-out); }
@media (hover: hover) { .card__hit:hover .card__go {  } }

/* ── The lead ───────────────────────────────────────────────────────────── */
.card--feature .card__hit { flex-direction: row; align-items: stretch; }
.card--feature .card__hit { flex-wrap: wrap; }
.card--feature .card__index { flex: 0 0 100%; }
.card--feature .card__art {
  flex: 1 1 52%; aspect-ratio: auto; min-height: 340rem;
  border-bottom: 0; border-right: var(--stroke) solid var(--line);
  padding: clamp(16rem, 2.4vw, 30rem);
}
.card--feature .card__body { flex: 1 1 48%; justify-content: center; gap: 14rem; padding: clamp(22rem, 3vw, 40rem); }
/* The lead's headline is the longest on the site, and Bangers is a caps face:
   at the full display size it set four lines of shouting with four accent
   rules under them. One size down, and no underline — the solid chip directly
   above it is already carrying the category colour. */
.card--feature .card__title {
  font-size: clamp(30rem, 3.6vw, 54rem);
  text-decoration: none;
}
.card--feature .card__dek { font-size: clamp(16rem, 1.5vw, 19rem); color: var(--ink); max-width: 44ch; }

@media (max-width: 820px) {
  .card--feature .card__hit { flex-direction: column; flex-wrap: nowrap; }
  .card--feature .card__art { aspect-ratio: 16 / 9; min-height: 0; border-right: 0; border-bottom: var(--stroke) solid var(--line); }
}

/* ── Field variants ─────────────────────────────────────────────────────── */
/* `wide` and `tall` change how many columns the card claims, not how its
   artwork is cropped — every poster stays 16:9. An earlier pass gave `tall` a
   4:5 band, which took a 1672×941 poster and threw away half of it.

   A wide card lays out horizontally rather than stacking. Stacked, eight
   columns of 16:9 artwork is 430px of picture before the headline starts, and
   the four-column card beside it ends up with 250px of empty body making up
   the difference. Side by side, the two sit at nearly the same height. */
.card--wide .card__hit { flex-direction: row; align-items: stretch; flex-wrap: wrap; }
.card--wide .card__index { flex: 0 0 100%; }
.card--wide .card__art {
  flex: 0 0 52%; aspect-ratio: auto;
  border-bottom: 0; border-right: var(--stroke) solid var(--line);
}
.card--wide .card__body { flex: 1 1 48%; }

@media (max-width: 900px) {
  .card--wide .card__hit { flex-direction: column; flex-wrap: nowrap; }
  .card--wide .card__art {
    flex: none; aspect-ratio: 16 / 9;
    border-right: 0; border-bottom: var(--stroke) solid var(--line);
  }
}

/* No artwork: the card leans on type instead of pretending it has a picture.
   The accent band is what keeps it from reading as an empty slot. */
.card--noart .card__hit { background: var(--paper-2); border-top: 4rem solid var(--accent); }
.card--noart .card__body::before {
  content: ''; display: block; height: 3rem; width: 42rem;
  background: var(--accent); border: 0; border-radius: 0;
  margin-bottom: 6rem;
}
.card--noart .card__title { font-size: var(--type-h2); }

/* ── Compact: the read-next rail ────────────────────────────────────────── */
.card--compact .card__hit { box-shadow: none; border-width: var(--stroke); border-color: var(--line); }
@media (hover: hover) {
  .card--compact .card__hit:hover { transform: none; box-shadow: none; border-color: var(--ink); background: var(--paper-2); }
}
.card--compact .card__index { display: none; }
.card--compact .card__body { padding: 16rem; gap: 8rem; }
.card--compact .card__title { font-size: 21rem; }
.card--compact .card__dek {
  font-size: 14.5rem;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .card__hit { transition-duration: 1ms; }
  .card__hit:hover, .card__hit:active { transform: none; rotate: none; }
}
</style>
