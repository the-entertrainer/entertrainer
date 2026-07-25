<script setup lang="ts">
import { HOME_THEMES } from '~/utils/homeThemes'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Home 05 · Cobalt Bold', robots: 'noindex' })
const theme = HOME_THEMES[4]
</script>

<!-- Poster energy: the section name gets a yellow highlighter swipe that
     re-draws behind it every time the tower lands on a new card. -->
<template>
  <HomeTower :theme="theme" v-slot="{ active, index, go, open, items }">
    <NuxtLink to="/lab" class="c-lab">◂ lab</NuxtLink>
    <header class="c-top">
      <span class="c-mark">ENTERTRAINER</span>
      <nav class="c-tabs">
        <button v-for="(it, i) in items" :key="it.href" class="c-tab" :class="{ on: index % 4 === i }"
                @click="go(i - (index % 4))">{{ it.label }}</button>
      </nav>
    </header>

    <footer class="c-foot">
      <Transition name="c" mode="out-in">
        <div :key="active.href" class="c-cap">
          <h1 class="c-title"><span class="c-mark-hl">{{ active.label }}</span></h1>
          <p class="c-desc">{{ active.desc }}</p>
        </div>
      </Transition>
      <button class="c-cta" @click="open(active.href)">Go there →</button>
    </footer>
  </HomeTower>
</template>

<style scoped>
.c-lab { position: fixed; top: 18rem; left: 22rem; z-index: 20; color: var(--ink-60); text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; }
.c-top { position: fixed; top: 16rem; left: 0; right: 0; z-index: 20; display: flex; flex-direction: column; align-items: center; gap: 12rem; pointer-events: none; padding: 0 20rem; }
.c-mark { font-family: var(--display); font-weight: 900; font-size: 12rem; letter-spacing: 0.3em; color: var(--ink); opacity: 0.7; }
.c-tabs { display: flex; flex-wrap: wrap; justify-content: center; gap: 6rem; pointer-events: auto; }
.c-tab { font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 11.5rem; color: var(--ink); background: transparent; border: 1px solid transparent; border-radius: 999rem; padding: 7rem 14rem; cursor: pointer; opacity: 0.55; transition: opacity 0.2s, background 0.2s, color 0.2s; }
.c-tab:hover { opacity: 1; }
.c-tab.on { opacity: 1; background: var(--pop); color: var(--on-pop); }
.c-tab:focus-visible { outline: 2px solid var(--pop); outline-offset: 2px; }

.c-foot { position: fixed; left: 0; right: 0; bottom: calc(30rem + env(safe-area-inset-bottom)); z-index: 20; text-align: center; padding: 0 22rem; pointer-events: none; }
.c-title { margin: 0; font-family: var(--display); font-weight: 900; font-size: clamp(36rem, 8vw, 92rem); line-height: 1.02; letter-spacing: -0.035em; text-transform: uppercase; color: var(--ink); }
/* Highlighter swipe — a skewed block that wipes in behind the word. */
.c-mark-hl { position: relative; display: inline-block; padding: 0 12rem; }
.c-mark-hl::before { content: ''; position: absolute; left: 0; right: 0; top: 12%; bottom: 12%; background: var(--pop); z-index: -1; transform: skewX(-8deg) scaleX(0); transform-origin: left; animation: c-swipe 0.55s cubic-bezier(.19,1,.22,1) 0.08s forwards; }
@keyframes c-swipe { to { transform: skewX(-8deg) scaleX(1); } }
@media (prefers-reduced-motion: reduce) { .c-mark-hl::before { animation: none; transform: skewX(-8deg) scaleX(1); } }
.c-desc { font-family: 'DM Sans', sans-serif; font-size: 14rem; line-height: 1.55; margin: 16rem auto 0; max-width: 40ch; color: var(--ink); opacity: 0.75; }
.c-cta { margin-top: 22rem; pointer-events: auto; font-family: var(--display); font-weight: 800; font-size: 13rem; letter-spacing: 0.06em; color: var(--ink); background: transparent; border: 2px solid var(--pop); border-radius: 999rem; padding: 13rem 30rem; cursor: pointer; transition: background 0.22s, color 0.22s, transform 0.22s; }
.c-cta:hover { background: var(--pop); color: var(--on-pop); transform: translateY(-2rem); }
.c-cta:focus-visible { outline: 2px solid var(--alt); outline-offset: 3px; }

.c-enter-active, .c-leave-active { transition: opacity 0.28s ease, transform 0.5s cubic-bezier(.19,1,.22,1); }
.c-enter-from { opacity: 0; transform: translateY(20rem); }
.c-leave-to { opacity: 0; transform: translateY(-12rem); }
</style>
