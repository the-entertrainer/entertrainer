<script setup lang="ts">
import type { NavItem } from '~/types/nav'
import { useGlassMicro } from '~/composables/useGlassMicro'
import { useContentStore } from '~/stores/content'

// A section landing: header plus a grid of plates that link out to the real
// pages. Used by /tools and /my-work so those routes are genuine destinations
// (crawlable, shareable) rather than redirects back into the spiral.
//
// The cards used to be text rows with a decorative gradient dot, which meant a
// comic magazine and four working web apps were presented as a list of
// sentences while their artwork sat unused in /public. The artwork is the point:
// it is hand-made, torn-paper, ink-and-handwriting work, and it says more about
// how Naveen thinks than any description does.
const props = defineProps<{
  eyebrow?: string
  title: string
  deck?: string
  intro?: string
  items: NavItem[]
}>()

const R = useReveal()
const rv = R.head()

// The cursor-tracked specular sheen. One delegated, rAF-throttled pointermove
// for the whole grid, already gated on a fine pointer and not-reduced-motion.
const rootRef = ref<HTMLElement | null>(null)
useGlassMicro(rootRef)

// Where this page hands you on to. Reads the real home nav so it can never point
// at a route that no longer exists.
const contentStore = useContentStore()
const route = useRoute()
const next = computed(() => {
  const nav = contentStore.homeNav
  const here = nav.findIndex(i => route.path.startsWith(i.href))
  return nav[(here + 1) % nav.length] ?? nav[0]
})
const nextHref = computed(() => next.value?.href ?? '/')
const nextLabel = computed(() => next.value?.label ?? 'Home')

// Column count comes from the item count rather than from `auto-fill`, which
// would leave the two-item /my-work grid as two narrow cards against a half-empty
// row and drop the fourth /tools card onto an orphan row of its own. Four items
// read better as a 2x2 block than as 3 + 1.
const columns = computed(() => {
  const n = props.items.length
  if (n <= 2 || n === 4) return 2
  return 3
})
</script>

<template>
  <div ref="rootRef" class="cg-page">
    <UiGlassBackdrop calm />

    <div class="cg-inner">
      <header class="cg-head">
        <p v-if="eyebrow" class="eyebrow cg-eyebrow" v-motion :initial="rv.eyebrow.initial" :visible-once="rv.eyebrow.visibleOnce">{{ eyebrow }}</p>
        <h1 class="display-serif cg-title" v-motion :initial="rv.title.initial" :visible-once="rv.title.visibleOnce">{{ title }}</h1>
        <p v-if="deck" class="cg-deck" v-motion :initial="rv.deck.initial" :visible-once="rv.deck.visibleOnce">{{ deck }}</p>
        <p v-if="intro" class="cg-intro" v-motion :initial="rv.intro.initial" :visible-once="rv.intro.visibleOnce">{{ intro }}</p>
      </header>

      <div class="cg-grid" :data-count="items.length" :style="{ '--cg-cols': columns }">
        <NuxtLink
          v-for="(item, i) in items" :key="item.id"
          :to="item.href" class="glass-panel u-lift cg-card"
          v-motion :initial="R.riseIn(i).initial" :visible-once="R.riseIn(i).visibleOnce"
        >
          <span
            class="cg-card__media"
            :class="{ 'cg-card__media--type': !item.image, 'cg-card__media--portrait': item.portrait }"
          >
            <img
              v-if="item.image"
              :src="item.image" :alt="''" aria-hidden="true"
              :loading="i < 2 ? 'eager' : 'lazy'" decoding="async"
            >
            <!-- No artwork for this one, so the name becomes the artwork rather
                 than leaving a grey hole. -->
            <span v-else class="cg-card__typetile" aria-hidden="true">{{ item.label }}</span>
            <span class="cg-card__arrow" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
          </span>

          <span class="cg-card__body">
            <span v-if="item.meta" class="eyebrow eyebrow--quiet cg-card__meta">{{ item.meta }}</span>
            <strong class="cg-card__label">{{ item.label }}</strong>
            <span class="cg-card__desc">{{ item.description }}</span>
          </span>
        </NuxtLink>
      </div>

      <p v-if="!items.length" class="cg-empty">Nothing here yet — I'm still building it.</p>

      <!-- The page has to end on purpose rather than just stop. -->
      <footer class="cg-foot" v-motion :initial="R.rise(120).initial" :visible-once="R.rise(120).visibleOnce">
        <UiNaveenStatus />
        <NuxtLink :to="nextHref" class="cg-foot__next u-lift">
          <span class="eyebrow eyebrow--quiet">Next</span>
          <span class="cg-foot__label">{{ nextLabel }}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </NuxtLink>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.cg-page { position: relative; z-index: 1; min-height: 100dvh; }
.cg-inner {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: var(--page-top) var(--edge) var(--page-bottom);
}

/* ── Header ──
   The old ramp descended in size but not in weight: `intro` sat at 14rem/0.55
   *below* a 16rem/0.65 deck, so the most substantive sentence on /tools was the
   least legible thing on the page. Both axes descend now. */
.cg-head { margin-bottom: clamp(30rem, 4.5vw, 52rem); }
.cg-eyebrow { margin-bottom: 12rem; }
.cg-title { font-size: var(--text-display); }
.cg-deck { font-size: var(--text-lead); color: color-mix(in srgb, var(--color-text) 78%, transparent); margin-top: 14rem; line-height: 1.5; max-width: 46ch; }
.cg-intro { font-size: clamp(15.5rem, 1vw, 19rem); color: color-mix(in srgb, var(--color-text) 62%, transparent); margin-top: 12rem; line-height: 1.62; max-width: 58ch; }

.cg-grid {
  display: grid;
  grid-template-columns: repeat(var(--cg-cols, 2), minmax(0, 1fr));
  gap: clamp(16rem, 2vw, 26rem);
}

.cg-card {
  display: flex;
  flex-direction: column;
  padding: 0;                 /* the media is flush; the body carries its own inset */
  border-radius: 18rem;
  overflow: hidden;           /* clips the media scale on hover */
  color: var(--color-text);
}

/* ── Media ── */
.cg-card__media {
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: color-mix(in srgb, var(--color-accent-deep) 22%, var(--color-bg));
}
/* A portrait source in a landscape plate showed 40% of itself — the SEWA cover
   is a 1400x1980 magazine page. Giving it its own aspect-ratio fixed the crop
   and broke the row: a square plate beside a 16/10 one stretches the grid row to
   the taller card and leaves a quarter of the shorter card empty under its text.
   A grid wants one silhouette. So the plate keeps its ratio and the cover is
   contained on it — full height, centred, the mount showing at its sides, which
   is how a cover is presented in a grid anyway. */
.cg-card__media--portrait img {
  object-fit: contain;
  padding: 10rem 0;
}
/* The plate under a contained cover reads as a mount rather than a gap. */
.cg-card__media--portrait {
  background:
    radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--color-accent-deep) 30%, transparent), transparent 70%),
    color-mix(in srgb, var(--color-accent-deep) 16%, var(--color-bg));
}
.cg-card__media img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transform: scale(1.001);    /* pre-promote, so the first hover isn't a repaint */
  transition: transform var(--dur-5) var(--ease-out-soft);
}
/* A scrim so the corner glyph reads against any artwork. */
.cg-card__media::after {
  content: "";
  position: absolute; inset: 0;
  pointer-events: none;
  background: linear-gradient(to top,
    color-mix(in srgb, var(--color-bg) 55%, transparent) 0%, transparent 40%);
}
.cg-card__media--type {
  display: grid;
  place-items: center;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--color-accent-deep) 46%, var(--color-bg)),
    var(--color-bg) 78%);
}
.cg-card__typetile {
  font-family: var(--serif-font);
  font-variation-settings: "SOFT" 32, "WONK" 1;
  font-size: clamp(34rem, 6vw, 54rem);
  letter-spacing: -0.02em;
  opacity: 0.16;
  text-align: center;
  padding: 0 24rem;
}

.cg-card__arrow {
  position: absolute;
  right: 12rem; bottom: 12rem;
  z-index: 2;
  width: 30rem; height: 30rem;
  display: grid; place-items: center;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-bg) 64%, transparent);
  border: 1px solid var(--color-glass-border);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  color: var(--color-text);
  opacity: 0.62;
  transition: opacity var(--dur-2) var(--ease-out-soft),
              transform var(--dur-3) var(--ease-out-soft);
}

/* ── Body ── */
.cg-card__body {
  display: flex;
  flex-direction: column;
  gap: 6rem;
  padding: 18rem 20rem 20rem;
}
.cg-card__meta { margin-bottom: 2rem; }
.cg-card__label { font-size: 19rem; font-weight: 600; letter-spacing: -0.02em; line-height: 1.15; }
.cg-card__desc {
  font-size: 14rem; opacity: 0.66; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.cg-empty { font-size: 15rem; opacity: 0.62; }

/* ── The close ── */
.cg-foot {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: clamp(20rem, 3vw, 40rem);
  margin-top: clamp(56rem, 9vh, 120rem);
  padding-top: clamp(28rem, 4vw, 44rem);
  border-top: 1px solid var(--color-divider);
}
.cg-foot__next {
  display: inline-flex;
  align-items: center;
  gap: 12rem;
  min-height: 44rem;
  padding: 12rem 20rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-glass-border);
  color: var(--color-text);
  white-space: nowrap;
}
.cg-foot__label { font-family: var(--serif-font); font-optical-sizing: auto; font-size: clamp(19rem, 1.6vw, 26rem); }
@media (max-width: 640px) {
  .cg-foot { grid-template-columns: 1fr; }
}

/* .u-lift carries the surface hover; these are the media-specific parts. */
@media (hover: hover) and (pointer: fine) {
  .cg-card:hover .cg-card__media img { transform: scale(1.045); }
  .cg-card:hover .cg-card__arrow { opacity: 1; transform: translate(2rem, -2rem); }
}
@media (prefers-reduced-motion: reduce) {
  .cg-card__media img { transition: none; }
  .cg-card:hover .cg-card__media img { transform: none; }
}

/* Above 1440 the grid gains a column rather than inflating the plates: four
   tools read as a row of four, not as two billboards. Below 900 everything
   collapses to two and then to one — a plate narrower than ~280rem stops
   showing the artwork and starts showing a detail of it. */
@media (min-width: 1441px) {
  .cg-grid[data-count="3"],
  .cg-grid[data-count="4"],
  .cg-grid[data-count="5"],
  .cg-grid[data-count="6"] { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .cg-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .cg-grid { grid-template-columns: 1fr; }
  .cg-card__media { aspect-ratio: 16 / 9; }
  /* On one column the plate can afford to be squarer, so a contained cover has
     more room without the row rhythm mattering — there is only one card wide. */
  .cg-card__media { aspect-ratio: 4 / 3; }
}
</style>
