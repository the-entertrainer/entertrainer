<script setup lang="ts">
/**
 * The section the reference does not have.
 *
 * A creative-dev portfolio shows client work; this one also ships products, and
 * burying four working apps inside a "Work" list would be the single worst
 * decision available. It gets the slot immediately after Work, in the quiet
 * palette, so the accent flood behind it reads as the divider between "things
 * I made for other people" and "things I made because they didn't exist".
 *
 * Form is the reference's index-row treatment: a hairline-ruled list where the
 * whole row is the target, the catalogue code sits left, and hovering floods
 * the row with the accent. No cards, no shadows, no elevation.
 */
import { APPS } from '~/utils/homeIndex'
</script>

<template>
  <section id="apps" class="wp">
    <header class="wp__head">
      <span class="w-mono wp__eyebrow">03 — Web apps</span>
      <h2 class="w-shout wp__title">Free<br>tools</h2>
      <p class="w-prose wp__lead">
        I kept needing tools that didn't exist. So they exist now — all free,
        all in the browser, no sign-up.
      </p>
    </header>

    <ol class="wp__list">
      <li v-for="(a, i) in APPS" :key="a.id">
        <NuxtLink :to="a.href" class="wp__row">
          <span class="w-mono wp__idx">#{{ a.hash }}-{{ String(i).padStart(4, '0') }}/{{ String(APPS.length).padStart(2, '0') }}</span>
          <span class="w-shout wp__name">{{ a.label }}</span>
          <span class="w-prose wp__desc">{{ a.desc }}</span>
          <span class="w-mono wp__meta">{{ a.meta }}</span>
          <span class="wp__go" aria-hidden="true">→</span>
        </NuxtLink>
      </li>
    </ol>

    <NuxtLink to="/tools" class="wp__all w-mono">
      Open the toolkit <span aria-hidden="true">→</span>
    </NuxtLink>
  </section>
</template>

<style scoped>
.wp {
  position: relative;
  z-index: 3;
  padding: var(--w-gap-section) var(--w-edge);
}

.wp__head {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: end;
  gap: clamp(20px, 4vw, 60px);
  margin-bottom: clamp(40px, 7vh, 96px);
}
.wp__eyebrow { grid-column: 1 / -1; color: var(--w-ink-35); }
.wp__title { margin: 0; font-size: var(--w-head); color: var(--w-ink); }
.wp__lead {
  margin: 0;
  max-width: 34ch;
  font-size: var(--w-lead);
  color: var(--w-ink-55);
}

.wp__list { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--w-rule); }

/* The row is the whole target. Grid rather than flex so the catalogue code,
   the name and the meta hold their columns down the list — the alignment is
   what makes it read as an index instead of a stack of links. */
.wp__row {
  display: grid;
  grid-template-columns: 148rem minmax(0, 1.05fr) minmax(0, 1.5fr) auto 28rem;
  align-items: center;
  gap: clamp(12px, 2vw, 32px);
  padding: clamp(18px, 2.6vh, 34px) 14rem;
  border-bottom: 1px solid var(--w-rule);
  color: var(--w-ink);
  transition: background 0.4s var(--w-ease), color 0.4s var(--w-ease), padding-left 0.4s var(--w-ease);
}
@media (hover: hover) {
  .wp__row:hover {
    background: var(--w-accent);
    color: var(--w-on-accent);
    padding-left: 26rem;
  }
  .wp__row:hover .wp__idx,
  .wp__row:hover .wp__desc,
  .wp__row:hover .wp__meta { color: inherit; opacity: 0.78; }
  .wp__row:hover .wp__go { transform: translateX(6rem); opacity: 1; }
}
.wp__row:focus-visible { outline: 2px solid var(--w-ink); outline-offset: -2px; }

.wp__idx { color: var(--w-ink-35); }
.wp__name { font-size: clamp(24px, 3.4vw, 46px); }
.wp__desc { font-size: var(--w-body); line-height: 1.45; color: var(--w-ink-55); }
.wp__meta { color: var(--w-ink-35); white-space: nowrap; }
.wp__go { justify-self: end; opacity: 0.4; transition: transform 0.4s var(--w-ease), opacity 0.4s var(--w-ease); }

.wp__all {
  display: inline-flex;
  align-items: center;
  gap: 8rem;
  margin-top: 44rem;
  padding: 12rem 18rem;
  border: 1px solid var(--w-rule);
  color: var(--w-ink);
  transition: background 0.3s var(--w-ease), color 0.3s var(--w-ease), border-color 0.3s var(--w-ease);
}
.wp__all:hover { background: var(--w-accent); border-color: var(--w-accent); color: var(--w-on-accent); }
.wp__all span { transition: transform 0.3s var(--w-ease); }
.wp__all:hover span { transform: translateX(4rem); }

/* The description is the first column to go — it is the only thing on the row
   the app's own page repeats verbatim. */
@media (max-width: 1080px) {
  .wp__row { grid-template-columns: 130rem minmax(0, 1fr) auto 24rem; }
  .wp__desc { display: none; }
}
@media (max-width: 700px) {
  .wp__head { grid-template-columns: 1fr; align-items: start; }
  .wp__row { grid-template-columns: 1fr auto; gap: 6rem 14rem; padding: 20rem 8rem; }
  .wp__idx { grid-column: 1 / -1; }
  .wp__meta { justify-self: end; }
  .wp__go { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .wp__row, .wp__go, .wp__all span { transition: background 0.2s linear, color 0.2s linear; }
}
</style>
