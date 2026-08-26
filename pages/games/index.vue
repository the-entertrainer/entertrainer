<script setup lang="ts">
useSeoMeta({ title: 'Games · Entertrainer', description: 'Games from Entertrainer, starting with EKANS — a Snake tribute, inverted.', ogUrl: 'https://entertrainer.in/games' })

// The same coiled shape the game uses for its own mark, on a 4×4 grid.
const EKANS_COIL = [
  { r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 },
  { r: 1, c: 3 }, { r: 2, c: 3 }, { r: 2, c: 2 }, { r: 2, c: 1 }, { r: 3, c: 1 }
]
</script>

<template>
  <main id="main" class="games">
    <section class="games__stage" aria-labelledby="games-title">
      <div class="games__tiles" aria-hidden="true"><i v-for="n in 42" :key="n"></i></div>
      <h1 id="games-title">Games</h1>
      <span>One so far. More when they're ready.</span>
    </section>

    <ol class="games__grid">
      <li class="u-reveal">
        <NuxtLink to="/games/ekans" class="games__card">
          <span class="games__icon" aria-hidden="true">
            <i
              v-for="(cell, i) in EKANS_COIL" :key="i"
              class="games__icon-seg" :class="{ 'games__icon-seg--head': i === EKANS_COIL.length - 1 }"
              :style="{ transform: `translate(${cell.c * 100}%, ${cell.r * 100}%)` }"
            />
          </span>
          <span class="games__card-text">
            <strong class="games__card-name">EKANS</strong>
            <span class="games__card-blurb">Snake, inverted. You place the food — the snake picks its own route, and can run out of one.</span>
          </span>
          <span class="games__card-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </span>
        </NuxtLink>
      </li>
    </ol>
  </main>
</template>

<style scoped>
/* Games: deliberately open arcade placeholder with yellow tile motion and a clear future-content state. */
.games { min-height: calc(100dvh - 74rem); max-width: var(--shell-wide); margin: 0 auto; padding: clamp(24rem, 4vw, 56rem) var(--shell-gutter); }.games__stage { position: relative; display: grid; min-height: min(420rem, calc(100dvh - 320rem)); align-content: center; justify-items: start; overflow: hidden; padding: clamp(34rem, 7vw, 96rem); color: var(--ink); background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-l); }.games__tiles { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(7, 1fr); grid-template-rows: repeat(6, 1fr); opacity: .46; }.games__tiles i { border: 1rem solid color-mix(in srgb, var(--ink) 14%, transparent); }.games__tiles i:nth-child(4n) { background: color-mix(in srgb, var(--signal-cobalt) 50%, transparent); }.games__stage > *:not(.games__tiles) { position: relative; }.games__stage p { margin: 0; font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }.games__stage h1 { max-width: 800rem; margin: 18rem 0; font: 500 clamp(65rem, 12vw, 180rem)/.82 var(--font-display); letter-spacing: -.08em; }
/* Scoped to the stage on purpose: an unscoped `.games span` also caught the
   card's description and capped it at 430rem mid-card. */
.games__stage > span { max-width: 430rem; font-size: 20rem; line-height: 1.4; }

.games__grid { list-style: none; margin: clamp(20rem, 3vw, 32rem) 0 0; padding: 0; display: grid; gap: 10rem; }

/* Icon hard left, then the name and its one-line description side by side. */
.games__card {
  display: grid; grid-template-columns: auto minmax(0, 1fr) 20rem;
  align-items: center; gap: clamp(16rem, 2.5vw, 24rem);
  padding: 20rem 22rem;
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-m);
  background: var(--paper);
  transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}
@media (hover: hover) {
  .games__card:hover { background: var(--paper-2); border-color: var(--ink); transform: translateX(3rem); }
  .games__card:hover .games__card-arrow { transform: translate(2rem, -2rem); }
}

.games__icon {
  position: relative; flex-shrink: 0;
  width: 52rem; height: 52rem; padding: 9rem; box-sizing: border-box;
  border-radius: var(--radius-s);
  background: var(--accent);
  border: var(--stroke) solid var(--ink);
}
.games__icon-seg {
  position: absolute; top: 9rem; left: 9rem;
  width: calc((100% - 18rem) / 4); height: calc((100% - 18rem) / 4);
}
/* The tile is always yellow, so the snake on it is always the dark ink —
   not the theme's --ink, which inverts to near-white in dark mode. */
.games__icon-seg::after {
  content: ''; position: absolute; inset: 7%; border-radius: 26%; background: #161618;
}
.games__icon-seg--head::after { box-shadow: 0 0 0 1.5rem var(--accent); }

.games__card-text {
  display: flex; flex-wrap: wrap; align-items: baseline; gap: 4rem 12rem; min-width: 0;
}
.games__card-name { font: 600 19rem/1.2 var(--font-display); flex-shrink: 0; }
.games__card-blurb { flex: 1 1 260rem; min-width: 0; font-size: 14rem; line-height: 1.4; color: var(--muted); }
.games__card-arrow { color: var(--muted); transition: transform var(--dur-fast) var(--ease-out); }

/* Narrow: the description wraps to several lines, so the icon rides up to sit
   with the title rather than floating against the middle of a paragraph. */
@media (max-width: 640px) {
  .games__card { align-items: start; gap: 14rem; }
  .games__card-arrow { align-self: center; }
}

@media (prefers-reduced-motion: reduce) {
  .games__card, .games__card-arrow { transition: none; }
  .games__card:hover { transform: none; }
}
</style>
