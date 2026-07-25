<script setup lang="ts">
import { HOME_THEMES } from '~/utils/homeThemes'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Home 09 · Terracotta', robots: 'noindex' })
const theme = HOME_THEMES[8]
const sectionLabel = (n: string) => `Section ${n}`
</script>

<!-- Warm and printed: a baked-clay ground, cream serif, and a caption that
     cross-fades in place like a slide changing in a carousel projector. -->
<template>
  <HomeTower :theme="theme" v-slot="{ active, index, go, open, items }">
    <NuxtLink to="/lab" class="t-lab">◂ lab</NuxtLink>
    <header class="t-head">
      <span class="t-word">Entertrainer</span>
      <span class="t-sub">Learning experiences, made by hand</span>
    </header>

    <div class="t-strip" aria-hidden="true">
      <span v-for="(it, i) in items" :key="it.href" class="t-seg" :class="{ on: index % 4 === i }" />
    </div>

    <footer class="t-foot">
      <Transition name="t" mode="out-in">
        <div :key="active.href" class="t-cap">
          <span class="t-chip">{{ sectionLabel(active.n) }}</span>
          <h1 class="t-title">{{ active.label }}</h1>
          <p class="t-desc">{{ active.desc }}</p>
        </div>
      </Transition>
      <div class="t-ctl">
        <button class="t-b" @click="go(-1)" aria-label="previous">←</button>
        <button class="t-open" @click="open(active.href)">Open this</button>
        <button class="t-b" @click="go(1)" aria-label="next">→</button>
      </div>
    </footer>
  </HomeTower>
</template>

<style scoped>
.t-lab { position: fixed; top: 18rem; right: 24rem; z-index: 20; color: var(--ink-60); text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; }
.t-head { position: fixed; top: clamp(22rem, 5vh, 46rem); left: 50%; translate: -50% 0; z-index: 20; text-align: center; pointer-events: none; }
.t-word { font-family: var(--display); font-weight: 400; font-size: clamp(20rem, 2.6vw, 28rem); letter-spacing: -0.015em; color: var(--ink); }
.t-sub { display: block; font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.18em; text-transform: uppercase; margin-top: 5rem; color: var(--ink-35); }

.t-strip { position: fixed; left: 50%; translate: -50% 0; bottom: calc(16rem + env(safe-area-inset-bottom)); z-index: 20; display: flex; gap: 5rem; pointer-events: none; }
.t-seg { width: 34rem; height: 3rem; border-radius: 2rem; background: var(--ink-35); transition: background 0.35s, width 0.35s cubic-bezier(.19,1,.22,1); }
.t-seg.on { background: var(--pop); width: 58rem; }

.t-foot { position: fixed; left: 0; right: 0; bottom: calc(42rem + env(safe-area-inset-bottom)); z-index: 20; text-align: center; padding: 0 22rem; pointer-events: none; }
.t-chip { display: inline-block; font-family: 'DM Sans', sans-serif; font-size: 10rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--alt); background: var(--ink); padding: 5rem 12rem; border-radius: 999rem; }
.t-title { font-family: var(--display); font-weight: 400; font-size: clamp(34rem, 6.2vw, 72rem); line-height: 1; letter-spacing: -0.03em; margin: 12rem 0 0; color: var(--ink); }
.t-desc { font-family: 'DM Sans', sans-serif; font-size: 13.5rem; line-height: 1.55; margin: 10rem auto 0; max-width: 38ch; color: var(--ink-60); }
.t-ctl { display: flex; align-items: center; justify-content: center; gap: 10rem; margin-top: 20rem; pointer-events: auto; }
.t-b { width: 42rem; height: 42rem; border-radius: 50%; border: 1px solid var(--ink-35); background: transparent; color: var(--ink); font-size: 15rem; cursor: pointer; transition: background 0.22s, color 0.22s; }
.t-b:hover { background: var(--ink); color: var(--bg); }
.t-open { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 13rem; color: var(--on-pop); background: var(--pop); border: 0; border-radius: 999rem; padding: 13rem 26rem; cursor: pointer; transition: transform 0.22s; }
.t-open:hover { transform: translateY(-2rem); }
.t-b:focus-visible, .t-open:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }

.t-enter-active, .t-leave-active { transition: opacity 0.42s ease, filter 0.42s ease; }
.t-enter-from, .t-leave-to { opacity: 0; filter: blur(6px); }
</style>
