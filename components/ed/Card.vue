<script setup lang="ts">
import type { EditorialItem } from '~/content/editorial'

/**
 * A story card.
 *
 * Four layout variants, one object. Every non-brand preview uses a Paper
 * Signal scene selected for the item’s actual subject—not a generic category.
 *
 * The whole card is one link. A card with a title link and a separate "Open"
 * link is two tab stops and two targets for one destination.
 */
const props = withDefaults(defineProps<{
  item: EditorialItem
  variant?: 'feature' | 'standard' | 'wide' | 'tall' | 'compact'
  /** Retained for call-site compatibility; archive order is no longer printed. */
  index?: number
  /** Retained for call-site compatibility; cards no longer auto-print format chips. */
  chip?: 'both' | 'category' | 'media'
}>(), { variant: 'standard', chip: 'both' })

const hasArt = computed(() => props.variant !== 'compact')
const itemScene: Record<string, 'hero' | 'lesson' | 'project' | 'tool' | 'process' | 'evidence' | 'robot' | 'infrastructure' | 'profile' | 'route'> = {
  'ai-atlas': 'robot',
  'sewa-chronicles': 'project',
  'better-emails': 'tool',
  'easymcq': 'evidence',
  'storygen': 'project',
  'glass-lab': 'infrastructure',
  'instructional-design': 'process'
}
const signalVariant = computed(() => itemScene[props.item.id] ?? (props.item.category === 'practice' ? 'lesson' : props.item.category === 'tools' ? 'tool' : props.item.category === 'story' ? 'evidence' : 'profile'))
</script>

<template>
  <article class="card" :class="[`card--${variant}`, { 'card--noart': !hasArt }]">
    <NuxtLink :to="item.href" class="card__hit">
      <span v-if="hasArt" class="card__art"><EdPaperSignal :variant="signalVariant" label="" /></span>

      <span class="card__body">
        <component :is="variant === 'feature' ? 'h2' : 'h3'" class="card__title t-display">{{ item.title }}</component>

        <span class="card__dek">{{ item.dek }}</span>

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
  border-radius: 0;
  overflow: hidden;
  color: var(--ink);
  
  transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
  transform-origin: center;
}
/* Short travel, a degree of rotation, 160ms — the card behaves like a printed
   thing being nudged rather than a div being animated. */
@media (hover: hover) {
  .card__hit:hover { background: var(--paper-2); border-color: var(--ink); transform: translateY(-4rem) rotate(-.22deg); }
  .card__hit:hover .card__title { text-decoration-color: var(--blue); }
}
.card__hit:active { transform: translateY(0) scale(.985); transition-duration: var(--dur-tap); }
.card__hit:focus-visible { outline: 3px solid var(--blue); outline-offset: 3px; }

/* Artwork provides context; no labels or category frame sit over it. */
.card__art {
  display: block; position: relative;
  flex: none;
  aspect-ratio: 16 / 9;
  background: var(--paper-2);
  border-bottom: var(--stroke) solid var(--line);
  overflow: hidden;
}
.card__art :deep(.ps-art) { width: 100%; height: 100%; min-height: 0; }

.card__body {
  display: flex; flex-direction: column; gap: 10rem;
  padding: 16rem 18rem 18rem;
  flex: 1;
}
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

/* ── The lead ───────────────────────────────────────────────────────────── */
.card--feature .card__hit { flex-direction: row; align-items: stretch; }
.card--feature .card__hit { flex-wrap: wrap; }
.card--feature .card__art {
  flex: 1 1 52%; aspect-ratio: auto; min-height: 340rem;
  border-bottom: 0; border-right: var(--stroke) solid var(--line);
  padding: clamp(16rem, 2.4vw, 30rem);
}
.card--feature .card__body { flex: 1 1 48%; justify-content: center; gap: 14rem; padding: clamp(22rem, 3vw, 40rem); }
/* The lead remains a concise proof point; the Paper Signal preview carries the
   shared visual language without making the index depend on a raster cover. */
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

/* No artwork: type carries the item without inventing a decorative category band. */
.card--noart .card__hit { background: var(--paper-2); }
.card--noart .card__title { font-size: var(--type-h2); }

/* ── Compact: the read-next rail ────────────────────────────────────────── */
.card--compact .card__hit { box-shadow: none; border-width: var(--stroke); border-color: var(--line); }
@media (hover: hover) {
  .card--compact .card__hit:hover { transform: none; box-shadow: none; border-color: var(--ink); background: var(--paper-2); }
}
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
