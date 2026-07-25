<script setup lang="ts">
import { HOME_THEMES } from '~/utils/homeThemes'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Home 02 · Midnight Candy', robots: 'noindex' })
const theme = HOME_THEMES[1]
</script>

<!-- Neon night: a cyan ticker overhead, huge condensed caps, a pink glow bar
     that redraws itself on every change. -->
<template>
  <HomeTower :theme="theme" v-slot="{ active, index, go, open }">
    <NuxtLink to="/lab" class="n-lab">◂ lab</NuxtLink>

    <div class="n-ticker" aria-hidden="true">
      <div class="n-ticker__row">
        <span v-for="i in 8" :key="i">Instructional design · Learning that lands · Built by hand ·</span>
      </div>
    </div>

    <footer class="n-foot">
      <Transition name="n" mode="out-in">
        <div :key="active.href" class="n-cap">
          <p class="n-idx">{{ String((index % 4) + 1).padStart(2, '0') }} / 04</p>
          <h1 class="n-title">{{ active.label }}</h1>
          <span class="n-glow" />
          <p class="n-desc">{{ active.desc }}</p>
        </div>
      </Transition>
      <div class="n-row">
        <button class="n-ghost" @click="go(-1)" aria-label="previous">↑</button>
        <button class="n-cta" @click="open(active.href)">Enter</button>
        <button class="n-ghost" @click="go(1)" aria-label="next">↓</button>
      </div>
    </footer>
  </HomeTower>
</template>

<style scoped>
/* Clears the ticker, which owns the full width of the top edge. */
.n-lab { position: fixed; top: 46rem; left: 22rem; z-index: 20; color: var(--ink-60); text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; }
.n-ticker { position: fixed; top: 0; left: 0; right: 0; z-index: 20; overflow: hidden; padding: 14rem 0; pointer-events: none; }
.n-ticker__row { display: flex; gap: 22rem; white-space: nowrap; width: max-content; animation: n-slide 38s linear infinite; font-family: var(--display); font-weight: 600; font-size: 11rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--alt); }
@keyframes n-slide { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .n-ticker__row { animation: none; } }

.n-foot { position: fixed; left: 0; right: 0; bottom: calc(30rem + env(safe-area-inset-bottom)); z-index: 20; text-align: center; padding: 0 22rem; pointer-events: none; }
.n-idx { font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.22em; margin: 0 0 8rem; color: var(--alt); font-variant-numeric: tabular-nums; }
.n-title { font-family: var(--display); font-weight: 900; font-size: clamp(40rem, 9vw, 106rem); line-height: 0.9; letter-spacing: -0.035em; text-transform: uppercase; margin: 0; color: var(--ink); }
.n-glow { display: block; width: min(220rem, 52vw); height: 3rem; margin: 14rem auto 0; background: var(--pop); border-radius: 2rem; box-shadow: 0 0 18rem var(--pop), 0 0 40rem var(--pop); animation: n-draw 0.6s cubic-bezier(.19,1,.22,1); transform-origin: center; }
@keyframes n-draw { from { transform: scaleX(0); opacity: 0; } }
.n-desc { font-family: 'DM Sans', sans-serif; font-size: 13.5rem; line-height: 1.55; margin: 14rem auto 0; max-width: 38ch; color: var(--ink-60); }
.n-row { display: flex; align-items: center; justify-content: center; gap: 12rem; margin-top: 22rem; pointer-events: auto; }
.n-cta { font-family: var(--display); font-weight: 800; font-size: 13rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--on-pop); background: var(--pop); border: 0; border-radius: 999rem; padding: 14rem 34rem; cursor: pointer; box-shadow: 0 0 28rem -4rem var(--pop); transition: transform 0.2s, box-shadow 0.2s; }
.n-cta:hover { transform: translateY(-2rem); box-shadow: 0 0 40rem -2rem var(--pop); }
.n-ghost { width: 42rem; height: 42rem; border-radius: 50%; background: transparent; border: 1px solid var(--ink-35); color: var(--ink); font-size: 15rem; cursor: pointer; transition: border-color 0.2s, color 0.2s; }
.n-ghost:hover { border-color: var(--alt); color: var(--alt); }
.n-cta:focus-visible, .n-ghost:focus-visible { outline: 2px solid var(--alt); outline-offset: 3px; }

.n-enter-active, .n-leave-active { transition: opacity 0.28s ease, transform 0.5s cubic-bezier(.19,1,.22,1); }
.n-enter-from { opacity: 0; transform: translateY(22rem) scale(0.97); }
.n-leave-to { opacity: 0; transform: translateY(-14rem); }
</style>
