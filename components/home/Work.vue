<script setup lang="ts">
/**
 * The centrepiece: a tall section containing a pinned, viewport-height stage.
 *
 * The mechanic, lifted wholesale from the reference and implemented with the
 * repo's own `useScrollProgress`:
 *
 *   - the parent is 320lvh tall, so there is 220lvh of scroll to spend;
 *   - the stage inside is `position: sticky; height: 100lvh`, so it holds still
 *     while that scroll is spent;
 *   - one number (`--p`) is written to the parent, and every moving child
 *     derives its own motion from it with a different coefficient. That is the
 *     whole parallax — no per-frame JS style writes anywhere.
 *
 * `--p` runs across the element's *entire* journey through the viewport, so it
 * is 0.238 when the stage pins and 0.762 when it releases. `--q` remaps that
 * window back to a clean 0 → 1, which is what the filmstrip actually rides on.
 *
 * The accent floods the whole section. One section wearing the loud colour
 * edge to edge, and the rest of the page quiet, is what makes it read as a
 * chapter break rather than a highlight.
 */
import { WORK } from '~/utils/homeIndex'

const root = ref<HTMLElement | null>(null)
useScrollProgress(root)
</script>

<template>
  <section id="work" ref="root" class="ww" :style="{ '--n': WORK.length }">
    <div class="ww__stage">
      <!-- The word, set as a background band and drifting slower than the
           filmstrip in front of it. -->
      <span class="ww__ghost w-shout" aria-hidden="true">WORK</span>

      <header class="ww__head">
        <span class="w-mono">02 — Work</span>
        <span class="w-mono">Proof it wasn't all talk.</span>
      </header>

      <!-- The viewport the filmstrip runs behind. Separating it from the track
           keeps the track free to be taller than its slot without fighting the
           flex column for space. -->
      <div class="ww__view">
      <ol class="ww__track">
        <li v-for="(w, i) in WORK" :key="w.id" class="ww__item">
          <NuxtLink :to="w.href" class="ww__link">
            <figure class="ww__fig">
              <img :src="w.img" :alt="w.label" loading="lazy" decoding="async">
            </figure>
            <div class="ww__meta">
              <span class="w-mono ww__idx">#{{ w.hash }}-{{ String(i).padStart(4, '0') }}/{{ String(WORK.length).padStart(2, '0') }}</span>
              <h3 class="w-shout ww__title">{{ w.label }}</h3>
              <p class="w-prose ww__desc">{{ w.desc }}</p>
              <span class="w-mono ww__kind">{{ w.meta }}</span>
            </div>
          </NuxtLink>
        </li>
      </ol>
      </div>

      <NuxtLink to="/my-work" class="ww__all w-mono">
        All work <span aria-hidden="true">→</span>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.ww {
  position: relative;
  z-index: 2;
  height: 320lvh;
  background: var(--w-accent);
  color: var(--w-on-accent);
  /* The remap: the stage pins at --p 0.238 and releases at 0.762. */
  --q: clamp(0, calc((var(--p, 0) - 0.238) / 0.524), 1);
}
.ww::before, .ww::after {
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--w-on-accent);
  opacity: 0.25;
}
.ww::before { top: 0; }
.ww::after { bottom: 0; }

.ww__stage {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  height: 100lvh;
  padding: 24rem var(--w-edge);
  overflow: hidden;
}

.ww__ghost {
  position: absolute;
  left: 50%;
  bottom: -0.14em;
  translate: -50% calc(var(--q) * -14%);
  font-size: min(38vw, 460px);
  line-height: 0.8;
  color: var(--w-on-accent);
  opacity: 0.09;
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
}

.ww__head {
  display: flex;
  justify-content: space-between;
  gap: 16rem;
  flex: 0 0 auto;
  padding-bottom: 20rem;
  border-bottom: 1px solid color-mix(in srgb, var(--w-on-accent) 28%, transparent);
  color: color-mix(in srgb, var(--w-on-accent) 70%, transparent);
}

/* The filmstrip. The view is the slot; the track is n slots tall and slides up
   by exactly (n - 1) of them across the pinned window. */
.ww__view {
  position: relative;
  z-index: 2;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}
.ww__track {
  margin: 0;
  padding: 0;
  list-style: none;
  height: calc(100% * var(--n));
  translate: 0 calc(var(--q) * -100% * (var(--n) - 1) / var(--n));
  will-change: translate;
}
.ww__item { height: calc(100% / var(--n)); }

.ww__link {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  align-items: center;
  gap: clamp(20px, 4vw, 64px);
  height: 100%;
  padding: clamp(16px, 3vh, 44px) 0;
  color: inherit;
}

.ww__fig {
  margin: 0;
  height: 100%;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--w-on-accent) 28%, transparent);
}
/* `contain`, not `cover`: these are poster-format cards with type set into the
   artwork, and cropping them cuts words in half. Better to letterbox and let
   the piece read as the object it is. */
.ww__fig img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: grayscale(1) contrast(1.06);
  transition: filter 0.8s var(--w-ease), scale 1.8s var(--w-ease-out);
}
.ww__link:hover .ww__fig img { filter: grayscale(0) contrast(1); scale: 1.04; }

.ww__meta { display: flex; flex-direction: column; align-items: flex-start; gap: 12rem; min-width: 0; }
.ww__idx { color: color-mix(in srgb, var(--w-on-accent) 60%, transparent); }
.ww__title { margin: 0; font-size: var(--w-head); }
.ww__desc {
  margin: 0;
  max-width: 40ch;
  font-size: var(--w-body);
  line-height: 1.5;
  color: color-mix(in srgb, var(--w-on-accent) 78%, transparent);
}
.ww__kind {
  padding: 7rem 12rem;
  border: 1px solid color-mix(in srgb, var(--w-on-accent) 34%, transparent);
}

.ww__all {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8rem;
  margin-top: 14rem;
  padding: 12rem 18rem;
  border: 1px solid var(--w-on-accent);
  color: var(--w-on-accent);
  transition: background 0.3s var(--w-ease), color 0.3s var(--w-ease);
}
.ww__all:hover { background: var(--w-on-accent); color: var(--w-accent); }
.ww__all span { transition: transform 0.3s var(--w-ease); }
.ww__all:hover span { transform: translateX(4rem); }

/* Stacked, the figure gets whatever height is left rather than a fixed share —
   a short, full-width box would letterbox a poster down to a stamp. The border
   goes with it: framing an empty box around a contained image just draws
   attention to the space the artwork isn't using. */
@media (max-width: 860px) {
  .ww__link {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) auto;
    gap: 18rem;
  }
  .ww__fig { height: 100%; min-height: 0; border: 0; }
  .ww__desc { display: none; }
}

/* Reduced motion gets the section as a plain, scrollable list: no pin, no
   filmstrip, nothing driven by scroll position at all. */
@media (prefers-reduced-motion: reduce) {
  .ww { height: auto; }
  .ww__stage { position: static; height: auto; }
  .ww__view { overflow: visible; }
  .ww__track { height: auto; translate: none; }
  .ww__item { height: auto; }
  .ww__link { min-height: 46vh; }
  .ww__ghost { display: none; }
}
</style>
