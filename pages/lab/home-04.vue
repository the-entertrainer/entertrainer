<script setup lang="ts">
import { HOME_THEMES } from '~/utils/homeThemes'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Home 04 · Mint Studio', robots: 'noindex' })
const theme = HOME_THEMES[3]
</script>

<!-- Swiss discipline: everything hangs off a hairline grid, the caption sits
     top-left rather than centred, and a magenta rule does the pointing. -->
<template>
  <HomeTower :theme="theme" v-slot="{ active, index, go, open }">
    <NuxtLink to="/lab" class="m-lab">◂ lab</NuxtLink>
    <div class="m-grid" aria-hidden="true"><i /><i /><i /></div>

    <header class="m-head">
      <p class="m-kicker">Entertrainer — Naveen Jose</p>
      <Transition name="m" mode="out-in">
        <h1 :key="active.href" class="m-title">{{ active.label }}</h1>
      </Transition>
      <span class="m-rule" />
    </header>

    <div class="m-num" aria-hidden="true">{{ String((index % 4) + 1).padStart(2, '0') }}</div>

    <footer class="m-foot">
      <Transition name="m" mode="out-in">
        <p :key="active.href" class="m-desc">{{ active.desc }}</p>
      </Transition>
      <div class="m-ctl">
        <button class="m-b" @click="go(-1)" aria-label="previous">↑</button>
        <button class="m-b" @click="go(1)" aria-label="next">↓</button>
        <button class="m-open" @click="open(active.href)">View section</button>
      </div>
    </footer>
  </HomeTower>
</template>

<style scoped>
.m-lab { position: fixed; top: 18rem; right: 24rem; z-index: 20; color: var(--ink-60); text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; }
.m-grid { position: fixed; inset: 0; z-index: 1; display: grid; grid-template-columns: repeat(3, 1fr); pointer-events: none; }
.m-grid i { border-right: 1px solid var(--ink-12); }
.m-grid i:last-child { border-right: 0; }

.m-head { position: fixed; top: clamp(30rem, 6vh, 60rem); left: clamp(22rem, 5vw, 62rem); z-index: 20; pointer-events: none; }
.m-kicker { font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 10rem; color: var(--ink-35); }
.m-title { font-family: var(--display); font-weight: 800; font-size: clamp(32rem, 5.6vw, 62rem); line-height: 0.98; letter-spacing: -0.035em; margin: 0; color: var(--ink); }
.m-rule { display: block; width: 62rem; height: 4rem; background: var(--pop); margin-top: 16rem; }
.m-num { position: fixed; top: clamp(28rem, 6vh, 58rem); right: clamp(22rem, 5vw, 62rem); z-index: 20; font-family: var(--display); font-weight: 800; font-size: clamp(46rem, 8vw, 96rem); line-height: 1; color: var(--ink-12); pointer-events: none; font-variant-numeric: tabular-nums; }

.m-foot { position: fixed; left: clamp(22rem, 5vw, 62rem); right: clamp(22rem, 5vw, 62rem); bottom: calc(28rem + env(safe-area-inset-bottom)); z-index: 20; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16rem; pointer-events: none; }
.m-desc { font-family: 'DM Sans', sans-serif; font-size: 14rem; line-height: 1.55; margin: 0; max-width: 34ch; color: var(--ink-60); }
.m-ctl { display: flex; gap: 8rem; pointer-events: auto; }
.m-b { width: 42rem; height: 42rem; border-radius: 0; border: 1px solid var(--ink-35); background: transparent; color: var(--ink); font-size: 15rem; cursor: pointer; transition: background 0.2s, color 0.2s; }
.m-b:hover { background: var(--ink); color: var(--bg); }
.m-open { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 13rem; color: var(--on-pop); background: var(--pop); border: 0; padding: 0 22rem; height: 42rem; cursor: pointer; transition: filter 0.2s; }
.m-open:hover { filter: brightness(1.08); }
.m-b:focus-visible, .m-open:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

.m-enter-active, .m-leave-active { transition: opacity 0.26s ease, transform 0.44s cubic-bezier(.19,1,.22,1); }
.m-enter-from { opacity: 0; transform: translateX(-18rem); }
.m-leave-to { opacity: 0; transform: translateX(12rem); }
@media (max-width: 700px) { .m-grid { display: none; } .m-num { display: none; } }
</style>
