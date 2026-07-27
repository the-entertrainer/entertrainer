<script setup lang="ts">
/**
 * The centrepiece: a tall red section containing a pinned, viewport-height
 * stage that a catalogue runs through.
 *
 * The mechanic, matched to the original:
 *   - the parent is tall (60lvh of scroll per entry, plus a viewport to pin in);
 *   - the stage inside is `position: sticky; top: 0; height: 100lvh`;
 *   - ScrollTrigger writes one number, `--p`, across exactly the pinned window
 *     (`top top` → `bottom bottom`), and every moving child multiplies it by a
 *     different coefficient. The filmstrip rides it at full rate, the ghost
 *     wordmark at a fraction, so the two separate into depth.
 *
 * The red floods the whole section, edge to edge. One chapter wearing the loud
 * colour and the rest of the page staying quiet is what makes it read as a
 * break rather than a highlight.
 */
import { INDEX } from '~/utils/homeIndex'

const root = ref<HTMLElement | null>(null)
useWodProgress(root, { start: 'top top', end: 'bottom bottom' })
</script>

<template>
  <section id="work" ref="root" class="ww" :style="{ '--n': INDEX.length }">
    <div class="ww__stage">
      <span class="ww__ghost w-shout" aria-hidden="true">WORK</span>

      <header class="ww__head">
        <span>Work</span>
        <span>Proof it wasn't all talk.</span>
      </header>

      <div class="ww__view">
        <ol class="ww__track">
          <li v-for="(w, i) in INDEX" :key="w.id" class="ww__item">
            <NuxtLink :to="w.href" class="ww__link">
              <figure class="ww__fig">
                <img :src="w.img" :alt="w.label" loading="lazy" decoding="async">
              </figure>
              <div class="ww__meta">
                <span class="ww__idx">#{{ w.hash }}-{{ String(i).padStart(4, '0') }}/{{ String(INDEX.length).padStart(2, '0') }}</span>
                <h3 class="w-shout ww__title">{{ w.label }}</h3>
                <p class="w-base ww__desc">{{ w.desc }}</p>
                <span class="ww__kind">{{ w.meta }}</span>
              </div>
            </NuxtLink>
          </li>
        </ol>
      </div>

      <nav class="ww__foot">
        <NuxtLink to="/my-work">All work &rarr;</NuxtLink>
        <NuxtLink to="/tools">All tools &rarr;</NuxtLink>
      </nav>
    </div>
  </section>
</template>

<style scoped>
.ww {
  position: relative;
  z-index: 2;
  /* A viewport to pin in, plus 60lvh of travel per entry. */
  height: calc(100lvh + var(--n) * 60lvh);
  background: var(--w-red);
  color: var(--w-ink);
  font-family: var(--w-mono);
  font-size: var(--w-chrome);
  letter-spacing: var(--w-track-chrome);
  text-transform: uppercase;
}
.ww::before, .ww::after {
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--w-ink);
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

/* Drifts at a fraction of the filmstrip's rate, which is the whole depth cue. */
.ww__ghost {
  position: absolute;
  left: 50%;
  bottom: -0.14em;
  translate: -50% calc(var(--p, 0) * -16%);
  font-size: min(38vw, 460px);
  line-height: 0.8;
  color: var(--w-ink);
  opacity: 0.1;
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
  will-change: translate;
}

.ww__head {
  display: flex;
  justify-content: space-between;
  gap: 16rem;
  flex: 0 0 auto;
  padding-bottom: 18rem;
  border-bottom: 1px solid var(--w-ink);
  color: var(--w-ink);
}

/* The view is the slot; the track is n slots tall and slides up by exactly
   (n - 1) of them across the pinned window. */
.ww__view { position: relative; z-index: 2; flex: 1 1 auto; min-height: 0; overflow: hidden; }
.ww__track {
  margin: 0;
  padding: 0;
  list-style: none;
  height: calc(100% * var(--n));
  translate: 0 calc(var(--p, 0) * -100% * (var(--n) - 1) / var(--n));
  will-change: translate;
}
.ww__item { height: calc(100% / var(--n)); }

.ww__link {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  align-items: center;
  gap: clamp(20px, 4vw, 64px);
  height: 100%;
  padding: clamp(14px, 2.4vh, 36px) 0;
  color: inherit;
}

/* The frame hugs the artwork rather than the cell: `contain` inside a
   full-height box would rule a border around a lot of empty red. */
.ww__fig {
  margin: 0;
  align-self: center;
  max-height: 100%;
  overflow: hidden;
  border: 1px solid var(--w-ink);
  line-height: 0;
}
.ww__fig img {
  display: block;
  width: 100%;
  max-height: 100%;
  /* `contain`, not `cover`: these are poster-format cards with type set into
     the artwork, and cropping them cuts words in half. */
  object-fit: contain;
  filter: grayscale(1) contrast(1.05);
  transition: filter 0.8s var(--w-ease), scale 1.8s var(--w-ease-out);
}
.ww__link:hover .ww__fig img { filter: grayscale(0) contrast(1); scale: 1.03; }

.ww__meta { display: flex; flex-direction: column; align-items: flex-start; gap: 12rem; min-width: 0; }
.ww__idx { color: var(--w-ink); opacity: 0.6; }
.ww__title { margin: 0; font-size: var(--w-head); text-transform: uppercase; }
.ww__desc {
  margin: 0;
  max-width: 42ch;
  text-transform: none;
  letter-spacing: -0.025em;
  color: var(--w-ink);
}
.ww__kind { padding: 7rem 12rem; border: 1px solid var(--w-ink); }

.ww__foot { position: relative; z-index: 2; flex: 0 0 auto; display: flex; gap: 10rem; margin-top: 14rem; }
.ww__foot a {
  padding: 12rem 18rem;
  border: 1px solid var(--w-ink);
  color: var(--w-ink);
  transition: background 0.3s var(--w-ease), color 0.3s var(--w-ease);
}
.ww__foot a:hover { background: var(--w-ink); color: var(--w-red); }

@media only screen and (max-width: 860px) {
  .ww__link { grid-template-columns: 1fr; grid-template-rows: minmax(0, 1fr) auto; gap: 16rem; }
  .ww__fig { height: 100%; min-height: 0; border: 0; }
  .ww__desc { display: none; }
  .ww__title { font-size: min(13vw, 60px); }
}

/* Reduced motion gets a plain, scrollable list: no pin, no filmstrip, nothing
   driven by scroll position. */
@media (prefers-reduced-motion: reduce) {
  .ww { height: auto; }
  .ww__stage { position: static; height: auto; }
  .ww__view { overflow: visible; }
  .ww__track { height: auto; translate: none; }
  .ww__item { height: auto; }
  .ww__link { min-height: 60vh; }
  .ww__ghost { display: none; }
}
</style>
