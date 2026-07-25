<script setup lang="ts">
import { HOME_THEMES } from '~/utils/homeThemes'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Home 08 · Acid Lab', robots: 'noindex' })
const theme = HOME_THEMES[7]
</script>

<!-- Instrument panel: monospaced readouts, bracketed labels and a live status
     line. Playful because it is deadpan, not because it is loud. -->
<template>
  <HomeTower :theme="theme" v-slot="{ active, index, go, open, items }">
    <NuxtLink to="/lab" class="a-lab">◂ lab</NuxtLink>

    <header class="a-hud">
      <span>ENTERTRAINER/<b>NAVEEN.JOSE</b></span>
      <span class="a-live"><i /> STACK ONLINE</span>
    </header>

    <ul class="a-list">
      <li v-for="(it, i) in items" :key="it.href">
        <button class="a-item" :class="{ on: index % 4 === i }" @click="go(i - (index % 4))">
          <span class="a-item__n">{{ it.n }}</span>{{ it.label }}
        </button>
      </li>
    </ul>

    <footer class="a-foot">
      <Transition name="a" mode="out-in">
        <div :key="active.href">
          <h1 class="a-title">[ {{ active.label }} ]</h1>
          <p class="a-desc">&gt; {{ active.desc }}</p>
        </div>
      </Transition>
      <button class="a-cta" @click="open(active.href)">EXECUTE ↵</button>
    </footer>
  </HomeTower>
</template>

<style scoped>
.a-lab { position: fixed; top: 18rem; left: 22rem; z-index: 20; color: var(--ink-60); text-decoration: none; font-family: var(--display); font-size: 12rem; }
.a-hud { position: fixed; top: 16rem; left: 0; right: 0; z-index: 20; display: flex; justify-content: center; gap: 20rem; flex-wrap: wrap; font-family: var(--display); font-size: 10.5rem; letter-spacing: 0.14em; color: var(--ink-60); pointer-events: none; }
.a-hud b { color: var(--ink); font-weight: 700; }
.a-live { display: inline-flex; align-items: center; gap: 6rem; }
.a-live i { width: 7rem; height: 7rem; border-radius: 50%; background: var(--pop); animation: a-blink 1.6s steps(1) infinite; }
@keyframes a-blink { 50% { opacity: 0.25; } }
@media (prefers-reduced-motion: reduce) { .a-live i { animation: none; } }

.a-list { position: fixed; left: clamp(18rem, 3vw, 34rem); top: 50%; translate: 0 -50%; z-index: 20; list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2rem; }
.a-item { display: flex; align-items: center; gap: 8rem; background: transparent; border: 0; padding: 5rem 8rem; cursor: pointer; font-family: var(--display); font-size: 11.5rem; color: var(--ink-35); transition: color 0.2s, background 0.2s; }
.a-item__n { opacity: 0.6; }
.a-item:hover { color: var(--ink); }
.a-item.on { color: var(--on-pop); background: var(--pop); }
.a-item:focus-visible { outline: 2px solid var(--ink); outline-offset: 1px; }

.a-foot { position: fixed; left: 0; right: 0; bottom: calc(26rem + env(safe-area-inset-bottom)); z-index: 20; text-align: center; padding: 0 22rem; pointer-events: none; }
.a-title { font-family: var(--display); font-weight: 700; font-size: clamp(28rem, 5.4vw, 60rem); line-height: 1.05; letter-spacing: -0.02em; margin: 0; color: var(--ink); }
.a-desc { font-family: var(--display); font-size: 12.5rem; line-height: 1.6; margin: 12rem auto 0; max-width: 44ch; color: var(--ink-60); text-align: left; }
.a-cta { margin-top: 20rem; pointer-events: auto; font-family: var(--display); font-weight: 700; font-size: 12.5rem; letter-spacing: 0.1em; color: var(--on-pop); background: var(--pop); border: 0; padding: 13rem 26rem; cursor: pointer; transition: filter 0.2s, transform 0.2s; }
.a-cta:hover { filter: brightness(1.06); transform: translateY(-2rem); }
.a-cta:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }

.a-enter-active, .a-leave-active { transition: opacity 0.18s steps(3), transform 0.24s steps(4); }
.a-enter-from { opacity: 0; transform: translateY(10rem); }
.a-leave-to { opacity: 0; }
@media (max-width: 700px) { .a-list { display: none; } .a-desc { text-align: center; } }
</style>
