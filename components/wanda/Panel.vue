<script setup lang="ts">
/**
 * One destination on the home wall. The whole panel is the link.
 *
 * Every panel sits on the same #080808 field and uses the same three type
 * roles, so the wall reads as one site. What separates them is layout — five
 * arrangements, assigned per destination — and a single accent colour each,
 * spent only on the index number, the rule and the hover state. Body copy
 * stays white in every panel; the accent never touches text you have to read.
 */
import type { Panel } from '~/types/panel'

const props = defineProps<{ panel: Panel; index: number }>()

/** 01, 02, … — the only place the wall admits to having an order. */
const number = computed(() => String(props.index + 1).padStart(2, '0'))
</script>

<template>
  <NuxtLink
    :to="panel.href"
    class="panel"
    :class="[`panel--${panel.variant}`, { 'panel--portrait': panel.portrait }]"
    :style="{ '--accent': panel.accent }"
  >
    <div class="panel-type">
      <p class="panel-meta">
        <span class="panel-number">{{ number }}</span>
        <span class="panel-kind">{{ panel.meta }}</span>
      </p>
      <h2 class="panel-title">{{ panel.label }}</h2>
      <p class="panel-desc">{{ panel.description }}</p>
      <span class="panel-cta" aria-hidden="true">→</span>
    </div>

    <div v-if="panel.image && panel.variant !== 'type'" class="panel-media">
      <img :src="panel.image" :alt="panel.label" loading="lazy" decoding="async">
    </div>

    <span class="panel-rule" aria-hidden="true" />
  </NuxtLink>
</template>

<style scoped>
.panel {
  position: relative;
  display: grid;
  align-items: center;
  gap: 48px;
  padding: 90px var(--w-gutter-right) 90px var(--w-gutter);
  color: var(--w-fg);
  isolation: isolate;
}

/* The rule is the panel's own hairline, drawn in its accent on hover. At rest
   it is the same faint white every other divider on the site uses, so the wall
   is monochrome until you point at it. */
.panel-rule {
  position: absolute;
  left: var(--w-gutter);
  right: var(--w-gutter-right);
  top: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.14);
  transform-origin: left center;
  transition: background 0.3s var(--w-ease-out);
}
.panel:hover .panel-rule { background: var(--accent); }
.panel:first-child .panel-rule { display: none; }

.panel-type { position: relative; z-index: 2; }

.panel-meta {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin: 0 0 20px;
  font-family: var(--w-mono);
  font-size: var(--w-chrome-size);
  line-height: var(--w-chrome-lh);
}
.panel-number { color: var(--accent); }
.panel-kind { opacity: var(--w-rest); }

/* A real render of wanda.net's own index (Inspiration/WANDA_SYSTEM.md §10)
   turned up no display headline anywhere on it — the whole page is small
   monospace text and video texture; the only place the source goes big is a
   single vertically-centred name on an individual project page. clamp(96px)
   here was invented, not measured, and read as a poster next to the source's
   restraint. Pulled back so the title is clearly the panel's largest element
   without dominating the description under it the way the old scale did. */
.panel-title {
  margin: 0;
  font-family: var(--w-display);
  font-size: clamp(32px, 3.6vw, 64px);
  line-height: 0.94;
  font-weight: 700;
  letter-spacing: -0.03em;
  text-transform: uppercase;
}

.panel-desc {
  margin: 24px 0 0;
  max-width: 46ch;
  font-family: var(--w-mono);
  font-size: 16px;
  line-height: 1.55;
  opacity: var(--w-rest);
  transition: opacity 0.3s var(--w-ease-out);
}
.panel:hover .panel-desc { opacity: 0.85; }

/* The arrow is the panel's click affordance. It sits still until hover, then
   steps once — no loop, no bounce. */
.panel-cta {
  display: inline-block;
  margin-top: 28px;
  font-family: var(--w-mono);
  font-size: 20px;
  color: var(--accent);
  opacity: 0;
  transform: translateX(-8px);
  transition:
    opacity 0.25s var(--w-ease-out),
    transform 0.25s var(--w-ease-out);
}
.panel:hover .panel-cta { opacity: 1; transform: translateX(0); }

.panel-media {
  position: relative;
  overflow: hidden;
  z-index: 1;
}
.panel-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.75;
  transform: scale(1.02);
  transition:
    opacity 0.4s ease-out,
    transform 0.6s var(--w-ease-out);
}
.panel:hover .panel-media img { opacity: 1; transform: scale(1); }

/* ─── Variants ──────────────────────────────────────────────────────────
   Each destination is assigned one of these, and neighbours never share.
   ---------------------------------------------------------------------- */

/* split — type left, artwork holding the right half. */
.panel--split { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.panel--split .panel-media { aspect-ratio: 16 / 10; }

/* bleed — artwork spans the panel, type sits over it. */
.panel--bleed {
  grid-template-columns: 1fr;
  padding-top: 140px;
  padding-bottom: 140px;
}
.panel--bleed .panel-media {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.panel--bleed .panel-media img { opacity: 0.28; }
.panel--bleed:hover .panel-media img { opacity: 0.42; transform: scale(1); }
/* Type over artwork needs its own ground; a scrim beats hoping the image is
   dark where the words land. */
.panel--bleed::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(90deg, #080808 18%, rgba(8, 8, 8, 0.55) 62%, rgba(8, 8, 8, 0.2));
}
.panel--bleed .panel-type { max-width: 62ch; }

/* stack — oversized title, artwork below and pushed to the outer edge. */
.panel--stack { grid-template-columns: 1fr; gap: 56px; }
.panel--stack .panel-title { font-size: clamp(40px, 5.2vw, 100px); }
.panel--stack .panel-media {
  justify-self: end;
  width: min(62%, 760px);
  aspect-ratio: 16 / 9;
}

/* edge — narrow artwork at the leading edge, type bottom-aligned beside it.
   The media is second in the DOM (it is decorative, the type should be read
   first), so the columns are assigned explicitly rather than by source order. */
.panel--edge {
  grid-template-columns: minmax(0, 340px) minmax(0, 1fr);
  align-items: end;
  gap: 64px;
}
.panel--edge .panel-media { grid-column: 1; grid-row: 1; aspect-ratio: 3 / 4; }
.panel--edge .panel-type { grid-column: 2; grid-row: 1; padding-bottom: 8px; }

/* type — no artwork. The title is the panel. */
.panel--type { grid-template-columns: 1fr; padding-top: 120px; padding-bottom: 120px; }
.panel--type .panel-title {
  font-size: clamp(44px, 6.5vw, 120px);
  -webkit-text-stroke: 1px var(--accent);
  color: transparent;
  transition: color 0.4s var(--w-ease-out);
}
.panel--type:hover .panel-title { color: var(--accent); }

@media (max-width: 1024px) {
  .panel { gap: 36px; padding-top: 64px; padding-bottom: 64px; }
  .panel--split,
  .panel--edge { grid-template-columns: 1fr; align-items: start; }
  /* Single column, so the explicit placement above has to be released or the
     type lands in an implicit second column. */
  .panel--edge .panel-media,
  .panel--edge .panel-type { grid-column: 1; grid-row: auto; }
  .panel--edge .panel-media { max-width: 300px; }
  .panel--stack .panel-media { width: 100%; }
  .panel--bleed { padding-top: 96px; padding-bottom: 96px; }
  .panel--bleed::after {
    background: linear-gradient(180deg, rgba(8, 8, 8, 0.72), rgba(8, 8, 8, 0.88));
  }
}

/* Touch has no hover, so the states that hover would reveal are simply on. */
@media (hover: none) {
  .panel-cta { opacity: 1; transform: none; }
  .panel-media img { opacity: 1; transform: none; }
  .panel--type .panel-title { color: var(--accent); }
}

@media (prefers-reduced-motion: reduce) {
  .panel-media img,
  .panel-cta,
  .panel--type .panel-title { transition-duration: 0.01ms; }
  .panel:hover .panel-media img { transform: scale(1); }
}
</style>
