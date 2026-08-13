<script setup lang="ts">
/**
 * The ladder.
 *
 * Interior pages had no persistent navigation — you either used the back
 * button or opened the menu, so at any moment the site could not tell you
 * where you were or what else existed. The obvious fix is a nav bar, and every
 * site on earth has one.
 *
 * This is the site's own object instead. The home page is a vertical tower of
 * four glass slabs, one per section; this is that tower seen edge-on, parked
 * against the left margin. Same four slabs, same order, same stacking. The one
 * you are inside is pushed forward and lit, exactly as the focused card is on
 * the home stage. Walking down the rail is walking down the tower.
 *
 * That makes it navigation and orientation at once — which is the instructional
 * point. "Where am I in this, and what else is there" is the question every
 * learner asks first, and answering it structurally beats answering it with a
 * breadcrumb.
 *
 * Mechanically it is four links. No JavaScript decides what is active; the
 * route does. Labels are always in the accessible name and appear visually on
 * hover or focus, so a pointer user gets a clean rail and a keyboard user gets
 * the same information without having to guess what a slab means.
 */
const route = useRoute()

interface Rung { n: string; label: string; href: string }

/** Mirrors the home tower's order exactly — the rail is that stack, edge-on. */
const RUNGS: Rung[] = [
  { n: '01', label: 'About',               href: '/about' },
  { n: '02', label: 'Instructional design', href: '/instructional-design' },
  { n: '03', label: 'My work',             href: '/my-work' },
  { n: '04', label: 'Web apps',            href: '/tools' }
]

/** Deepest match wins, so /my-work/sewa-chronicles still lights "My work". */
const activeIndex = computed(() =>
  RUNGS.reduce((best, r, i) => route.path.startsWith(r.href) ? i : best, -1))
</script>

<template>
  <nav class="rail" aria-label="Sections">
    <ul class="rail__list">
      <li v-for="(r, i) in RUNGS" :key="r.href" class="rail__item">
        <NuxtLink
          :to="r.href"
          class="rail__rung"
          :class="{ 'is-here': i === activeIndex }"
          :aria-current="i === activeIndex ? 'page' : undefined"
        >
          <span class="rail__slab" aria-hidden="true" />
          <span class="rail__label"><em class="t-mono">{{ r.n }}</em>{{ r.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.rail {
  position: fixed;
  left: calc(18rem + var(--safe-left, 0px));
  top: 50%;
  translate: 0 -50%;
  z-index: 30;
  /* The whole rail is one perspective volume, so the slabs recede together
     rather than each tilting on its own axis. */
  perspective: 520px;
}
.rail__list {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 9rem;
  transform-style: preserve-3d;
}
.rail__item { display: flex; }

.rail__rung {
  position: relative;
  display: flex; align-items: center; gap: 12rem;
  /* A 44px target around a 4px slab: the hit area is the row, not the mark. */
  min-height: 30rem; padding: 6rem 4rem;
  text-decoration: none; color: var(--color-text);
}

/* The slab. Rotated on Y so the rail reads as the tower turned side-on rather
   than as a row of dashes — the same object, from a different seat. */
.rail__slab {
  display: block;
  width: 26rem; height: 4rem;
  border-radius: 2rem;
  background: var(--color-text);
  opacity: 0.22;
  transform: rotateY(38deg);
  transform-origin: left center;
  transition:
    width var(--dur-mid) var(--ease-spring),
    opacity var(--dur-fast) var(--ease-out),
    transform var(--dur-mid) var(--ease-spring),
    box-shadow var(--dur-mid) var(--ease-out);
}
@media (hover: hover) {
  .rail__rung:hover .rail__slab { opacity: 0.6; transform: rotateY(20deg); }
}

/* The section you are in comes forward and catches the light, which is what
   the focused card does on the home stage. */
.rail__rung.is-here .rail__slab {
  width: 40rem;
  opacity: 1;
  transform: rotateY(0deg) translateZ(18px);
  box-shadow: 0 0 18rem -4rem var(--glow-soft);
}

/* The label is always in the accessible name; it only *appears* on hover or
   focus, so the resting state is four marks and nothing else. */
.rail__label {
  display: flex; align-items: baseline; gap: 8rem;
  font-size: 12.5rem; font-weight: 600; white-space: nowrap;
  opacity: 0; translate: -6rem 0;
  transition: opacity var(--dur-fast) var(--ease-out), translate var(--dur-mid) var(--ease-spring);
  pointer-events: none;
}
.rail__label em { font-style: normal; opacity: 0.45; font-size: 10rem; letter-spacing: 0.1em; }
@media (hover: hover) {
  .rail:hover .rail__label { opacity: 0.85; translate: 0 0; }
}
.rail__rung:focus-visible .rail__label { opacity: 1; translate: 0 0; }
.rail__rung.is-here .rail__label { opacity: 0.55; translate: 0 0; }
@media (hover: hover) { .rail:hover .rail__rung.is-here .rail__label { opacity: 1; } }

.rail__rung:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: 4px;
  border-radius: 8rem;
}

/* ── Narrow screens ───────────────────────────────────────────────────────
   There is no left margin to park a rail in on a phone, and a vertical strip
   down the edge of a 390px screen fights the thumb. It lies down along the
   bottom instead, still four slabs in the same order, with the labels always
   showing because there is no hover to reveal them. */
@media (max-width: 900px) {
  .rail {
    left: 0; right: 0; top: auto;
    bottom: calc(10rem + var(--safe-bottom));
    translate: 0 0;
    perspective: none;
    display: flex; justify-content: center;
    pointer-events: none;
  }
  .rail__list {
    flex-direction: row; gap: 4rem;
    padding: 6rem;
    border-radius: 999rem;
    pointer-events: auto;
    background: color-mix(in srgb, var(--color-bg) 72%, transparent);
    backdrop-filter: blur(18px) saturate(1.3);
    -webkit-backdrop-filter: blur(18px) saturate(1.3);
    box-shadow: inset 0 0 0 1px var(--color-glass-border);
  }
  .rail__rung { flex-direction: column; gap: 4rem; padding: 7rem 10rem; min-height: 44rem; justify-content: center; }
  .rail__slab { width: 18rem; transform: none; }
  .rail__rung.is-here .rail__slab { width: 18rem; transform: none; }
  .rail__label { opacity: 0.5; translate: 0 0; font-size: 10.5rem; }
  .rail__label em { display: none; }
  .rail__rung.is-here .rail__label { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .rail__slab, .rail__label { transition-duration: 1ms; }
}
</style>
