<script setup lang="ts">
useSeoMeta({ title: 'Games · Entertrainer', description: 'Games from Entertrainer, including EKANS and The Mind Reader.', ogUrl: 'https://entertrainer.in/games' })

// The same coiled shape the game uses for its own mark, on a 4×4 grid.
const EKANS_COIL = [
  { r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 },
  { r: 1, c: 3 }, { r: 2, c: 3 }, { r: 2, c: 2 }, { r: 2, c: 1 }, { r: 3, c: 1 }
]

const MIND_READER_SYMBOLS = [
  '<circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="7" r="2.2" fill="currentColor"/>',
  '<path d="m12 2 8 4.7v9.6L12 21l-8-4.7V6.7L12 2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  '<path d="M4 18a11 11 0 0 1 16 0M7 14a7 7 0 0 1 10 0M10 10a3 3 0 0 1 4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2" fill="currentColor"/>',
  '<path d="m12 2 1.8 7.2L21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8L12 2Z" fill="currentColor"/>'
]
</script>

<template>
  <main id="main" class="games">
    <EdStageHero
      variant="orbits"
      title="Games"
      title-id="games-title"
      deck="Small games for quick detours."
    />

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
      <li class="u-reveal">
        <NuxtLink to="/games/read-my-mind" class="games__card games__card--mind-reader">
          <span class="games__icon games__icon--mind-reader" aria-hidden="true">
            <i v-for="(symbol, i) in MIND_READER_SYMBOLS" :key="i"><svg viewBox="0 0 24 24" aria-hidden="true" v-html="symbol"></svg></i>
          </span>
          <span class="games__card-text">
            <strong class="games__card-name">The Mind Reader</strong>
            <span class="games__card-blurb">A quick number game with a graphic twist. Keep your eyes open.</span>
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
.games {
  min-height: calc(100dvh - 74rem);
  max-width: var(--shell-wide);
  margin: 0 auto;
  padding: clamp(24rem, 4vw, 56rem) var(--shell-gutter);
}

.games__grid {
  list-style: none;
  margin: clamp(20rem, 3vw, 32rem) 0 0;
  padding: 0;
  display: grid;
  gap: 10rem;
}

.games__card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 20rem;
  align-items: center;
  gap: clamp(16rem, 2.5vw, 24rem);
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

.games__card:focus-visible {
  outline: 3rem solid var(--focus);
  outline-offset: 3rem;
}

.games__icon {
  position: relative;
  flex-shrink: 0;
  width: 52rem;
  height: 52rem;
  padding: 9rem;
  box-sizing: border-box;
  border-radius: var(--radius-s);
  background: var(--accent);
  border: var(--stroke) solid var(--ink);
}

.games__icon-seg {
  position: absolute;
  top: 9rem;
  left: 9rem;
  width: calc((100% - 18rem) / 4);
  height: calc((100% - 18rem) / 4);
}

/* The tile is always yellow, so the snake on it is always dark ink —
   not the theme's --ink, which inverts to near-white in dark mode. */
.games__icon-seg::after {
  content: '';
  position: absolute;
  inset: 7%;
  border-radius: 26%;
  background: #161618;
}

.games__icon-seg--head::after { box-shadow: 0 0 0 1.5rem var(--accent); }

.games__icon--mind-reader {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
  padding: 7rem;
  color: var(--ink);
  background: var(--accent);
}

.games__icon--mind-reader i { display: grid; place-items: center; color: var(--ink); }
.games__icon--mind-reader i:nth-child(2n) { color: var(--cobalt, #FFD43B); }
.games__icon--mind-reader i:nth-child(3n) { color: var(--paper); }
.games__icon--mind-reader svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.games__card-text {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4rem 12rem;
  min-width: 0;
}

.games__card-name { font: 600 19rem/1.2 var(--font-display); flex-shrink: 0; }
.games__card-blurb { flex: 1 1 260rem; min-width: 0; font-size: 14rem; line-height: 1.4; color: var(--muted); }
.games__card-arrow { color: var(--muted); transition: transform var(--dur-fast) var(--ease-out); }

@media (max-width: 640px) {
  .games__card { align-items: start; gap: 14rem; }
  .games__card-arrow { align-self: center; }
}

@media (prefers-reduced-motion: reduce) {
  .games__card, .games__card-arrow { transition: none; }
  .games__card:hover { transform: none; }
}
</style>
