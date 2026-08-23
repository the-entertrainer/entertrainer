<script setup lang="ts">
useSeoMeta({ title: 'Games · Entertrainer', description: 'Small playable ideas from Entertrainer. The first ones are on their way, doing their mysterious little loading thing.', ogUrl: 'https://entertrainer.in/games' })
</script>

<template>
  <main id="main" class="games">
    <section class="games__stage" aria-labelledby="games-title">
      <div class="games__tiles" aria-hidden="true"><i v-for="n in 42" :key="n"></i></div>
      <p>The Entertrainer arcade</p>
      <h1 id="games-title">Games are loading.</h1>
      <span>Small things to play with. Useful things are allowed to be fun. It is not illegal.</span>
    </section>
  </main>
</template>

<style scoped>
/* Games: deliberately open arcade placeholder with yellow tile motion and a clear future-content state. */
.games { min-height: calc(100dvh - 74rem); max-width: var(--shell-wide); margin: 0 auto; padding: clamp(24rem, 4vw, 56rem) var(--shell-gutter); }.games__stage { position: relative; display: grid; min-height: min(680rem, calc(100dvh - 160rem)); align-content: center; justify-items: start; overflow: hidden; padding: clamp(34rem, 7vw, 96rem); color: var(--ink); background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-l); }.games__tiles { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(7, 1fr); grid-template-rows: repeat(6, 1fr); opacity: .46; }.games__tiles i { border: 1rem solid color-mix(in srgb, var(--ink) 14%, transparent); }.games__tiles i:nth-child(4n) { background: color-mix(in srgb, var(--signal-cobalt) 50%, transparent); }.games__stage > *:not(.games__tiles) { position: relative; }.games p { margin: 0; font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }.games h1 { max-width: 800rem; margin: 18rem 0; font: 500 clamp(65rem, 12vw, 180rem)/.82 var(--font-display); letter-spacing: -.08em; }.games span { max-width: 430rem; font-size: 20rem; line-height: 1.4; }
</style>
