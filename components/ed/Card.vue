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
          <span v-if="num" class="t-mono card__num" aria-hidden="true">{{ num }}</span>
        </span>

        <component :is="variant === 'feature' ? 'h2' : 'h3'" class="card__title t-display">{{ item.title }}</component>

        <span class="card__dek">{{ item.dek }}</span>

        <span class="card__foot t-mono">
          <span>{{ item.stamp }}</span>
          <template v-if="item.minutes">
            <span aria-hidden="true">·</span>
            <span>{{ item.minutes }} min read</span>
          </template>
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
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-l);
  overflow: hidden;
  color: var(--ink);
  box-shadow: 5rem 5rem 0 var(--ink);
  transition:
    transform var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out);
}
/* Short travel, a degree of rotation, 160ms — the card behaves like a printed
   thing being nudged rather than a div being animated. */
@media (hover: hover) {
  .card__hit:hover { transform: translate(-3rem, -3rem) rotate(-0.5deg); box-shadow: 9rem 9rem 0 var(--ink); }
  .card:nth-child(even) .card__hit:hover { rotate: 0.5deg; }
}
.card__hit:active { transform: translate(1rem, 1rem); box-shadow: 3rem 3rem 0 var(--ink); transition-duration: var(--dur-tap); }
.card__hit:focus-visible { outline: 3px solid var(--cobalt); outline-offset: 3px; }

/* Every piece of artwork on this site is a 16:9 poster, so the band is 16:9
   and it stays 16:9. Letting it flex-grow to fill a tall grid row was tried
   and reverted: a narrow card next to a wide one ended up magnifying its
   poster by half again, so the same artwork appeared at two different zooms
   in one row. Extra row height goes to the body instead, where a pinned
   footer turns it into aligned metadata rather than a distorted picture. */
.card__art {
  display: block; position: relative;
  flex: none;
  aspect-ratio: 16 / 9;
  background: var(--paper-2);
  border-bottom: var(--stroke) solid var(--ink);
  overflow: hidden;
}
.card__art img { width: 100%; height: 100%; object-fit: cover; display: block; }

.card__body {
  display: flex; flex-direction: column; gap: 10rem;
  padding: 18rem 20rem 20rem;
  flex: 1;
}
.card__top { display: flex; align-items: center; justify-content: space-between; gap: 12rem; }
.card__num { color: var(--muted); }

.card__title {
  font-size: var(--type-card);
  line-height: 0.95;
  margin: 2rem 0 0;
  /* The one place a colour is allowed to carry the category on its own — and
     it is redundant with the chip directly above it, which is the point. */
  text-decoration: 4rem underline var(--accent);
  text-underline-offset: 6rem;
  text-decoration-skip-ink: none;
}
.card__dek {
  font-family: var(--font-reading);
  font-size: 15.5rem; line-height: 1.55;
  color: var(--muted);
}
.card__foot {
  margin-top: auto; padding-top: 12rem;
  display: flex; flex-wrap: wrap; align-items: center; gap: 6rem;
  color: var(--muted);
  border-top: var(--stroke-hair) solid var(--line);
}

/* ── The lead ───────────────────────────────────────────────────────────── */
.card--feature .card__hit { flex-direction: row; align-items: stretch; }
.card--feature .card__art {
  flex: 1 1 52%; aspect-ratio: auto; min-height: 340rem;
  border-bottom: 0; border-right: var(--stroke) solid var(--ink);
  padding: clamp(14rem, 2vw, 26rem);
}
/* The lead shows its poster whole. Everywhere else a crop is fine — here the
   artwork IS the argument for clicking, and cropping a poster to a portrait
   slot throws away the half that says what it is. */
.card--feature .card__art img { object-fit: contain; }
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
  .card--feature .card__hit { flex-direction: column; }
  .card--feature .card__art { aspect-ratio: 16 / 10; min-height: 0; border-right: 0; border-bottom: var(--stroke) solid var(--ink); }
}

/* ── Field variants ─────────────────────────────────────────────────────── */
/* `wide` and `tall` change how many columns the card claims, not how its
   artwork is cropped — every poster stays 16:9. An earlier pass gave `tall` a
   4:5 band, which took a 1672×941 poster and threw away half of it.

   A wide card lays out horizontally rather than stacking. Stacked, eight
   columns of 16:9 artwork is 430px of picture before the headline starts, and
   the four-column card beside it ends up with 250px of empty body making up
   the difference. Side by side, the two sit at nearly the same height. */
.card--wide .card__hit { flex-direction: row; align-items: stretch; }
.card--wide .card__art {
  flex: 0 0 52%; aspect-ratio: auto;
  border-bottom: 0; border-right: var(--stroke) solid var(--ink);
  padding: 12rem;
}
/* Same reasoning as the lead: once the band stops being 16:9 the poster has
   to be shown whole, because cropping one of these throws away the words
   printed on it. A standard card keeps `cover` and loses nothing — its band
   is 16:9 and so is every piece of artwork here. */
.card--wide .card__art img { object-fit: contain; }
.card--wide .card__body { flex: 1 1 48%; }

@media (max-width: 900px) {
  .card--wide .card__hit { flex-direction: column; }
  .card--wide .card__art {
    flex: none; aspect-ratio: 16 / 9; padding: 0;
    border-right: 0; border-bottom: var(--stroke) solid var(--ink);
  }
  .card--wide .card__art img { object-fit: cover; }
}

/* No artwork: the card leans on type instead of pretending it has a picture.
   The accent band is what keeps it from reading as an empty slot. */
.card--noart .card__hit { background: var(--paper-2); }
.card--noart .card__body::before {
  content: ''; display: block; height: 8rem; width: 64rem;
  background: var(--accent); border: var(--stroke-hair) solid var(--ink); border-radius: 4rem;
  margin-bottom: 4rem;
}
.card--noart .card__title { font-size: var(--type-h2); }

/* ── Compact: the read-next rail ────────────────────────────────────────── */
.card--compact .card__hit { box-shadow: none; border-width: var(--stroke-hair); border-color: var(--line); }
@media (hover: hover) {
  .card--compact .card__hit:hover { transform: none; box-shadow: none; border-color: var(--ink); background: var(--paper-2); }
}
.card--compact .card__body { padding: 16rem; gap: 8rem; }
.card--compact .card__title { font-size: 21rem; text-decoration-thickness: 3rem; }
.card--compact .card__dek {
  font-size: 14.5rem;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .card__hit { transition-duration: 1ms; }
  .card__hit:hover, .card__hit:active { transform: none; rotate: none; }
}
</style>
