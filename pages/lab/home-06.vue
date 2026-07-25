<script setup lang="ts">
import { HOME_THEMES } from '~/utils/homeThemes'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Home 06 · Paper Riot', robots: 'noindex' })
const theme = HOME_THEMES[5]
</script>

<!-- Bauhaus: flat primary shapes anchor the corners, the caption sits in a
     hard black slab, everything is squared off. -->
<template>
  <HomeTower :theme="theme" v-slot="{ active, index, go, open }">
    <NuxtLink to="/lab" class="p-lab">◂ lab</NuxtLink>
    <div class="p-shapes" aria-hidden="true">
      <span class="p-circle" /><span class="p-tri" /><span class="p-sq" />
    </div>

    <header class="p-head">
      <span class="p-word">Entertrainer</span>
      <span class="p-bar" />
    </header>

    <footer class="p-foot">
      <Transition name="p" mode="out-in">
        <div :key="active.href" class="p-slab">
          <span class="p-n">{{ String((index % 4) + 1).padStart(2, '0') }}</span>
          <h1 class="p-title">{{ active.label }}</h1>
          <p class="p-desc">{{ active.desc }}</p>
        </div>
      </Transition>
      <div class="p-ctl">
        <button class="p-b p-b--alt" @click="go(-1)" aria-label="previous">↑</button>
        <button class="p-b p-b--alt" @click="go(1)" aria-label="next">↓</button>
        <button class="p-b p-b--pop" @click="open(active.href)">Open</button>
      </div>
    </footer>
  </HomeTower>
</template>

<style scoped>
.p-lab { position: fixed; top: 18rem; right: 24rem; z-index: 20; color: var(--ink-60); text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; }
.p-shapes { position: fixed; inset: 0; z-index: 1; pointer-events: none; }
/* Sits below the wordmark rather than behind it. */
.p-circle { position: absolute; top: 24%; left: 5%; width: clamp(56rem, 9vw, 108rem); aspect-ratio: 1; border-radius: 50%; background: var(--pop); opacity: 0.9; }
.p-tri { position: absolute; bottom: 22%; right: 7%; width: 0; height: 0; border-left: clamp(28rem,4.5vw,54rem) solid transparent; border-right: clamp(28rem,4.5vw,54rem) solid transparent; border-bottom: clamp(50rem,8vw,94rem) solid var(--alt); opacity: 0.9; }
.p-sq { position: absolute; top: 30%; right: 12%; width: clamp(34rem, 5vw, 62rem); aspect-ratio: 1; background: var(--ink); opacity: 0.85; rotate: 14deg; }

.p-head { position: fixed; top: clamp(22rem, 5vh, 46rem); left: clamp(22rem, 5vw, 56rem); z-index: 20; pointer-events: none; }
.p-word { font-family: var(--display); font-weight: 800; font-size: clamp(18rem, 2.4vw, 26rem); letter-spacing: -0.02em; color: var(--ink); }
.p-bar { display: block; width: 46rem; height: 6rem; background: var(--alt); margin-top: 8rem; }

.p-foot { position: fixed; left: clamp(18rem, 4vw, 56rem); right: clamp(18rem, 4vw, 56rem); bottom: calc(26rem + env(safe-area-inset-bottom)); z-index: 20; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 14rem; pointer-events: none; }
.p-slab { background: var(--ink); color: var(--bg); padding: 20rem 24rem; max-width: 46ch; }
.p-n { font-family: 'DM Sans', sans-serif; font-size: 11rem; letter-spacing: 0.2em; color: var(--pop); font-variant-numeric: tabular-nums; }
.p-title { font-family: var(--display); font-weight: 800; font-size: clamp(26rem, 4.4vw, 48rem); line-height: 1; letter-spacing: -0.03em; margin: 6rem 0 0; }
.p-desc { font-family: 'DM Sans', sans-serif; font-size: 13rem; line-height: 1.5; margin: 8rem 0 0; opacity: 0.72; }
.p-ctl { display: flex; gap: 6rem; pointer-events: auto; }
.p-b { height: 44rem; min-width: 44rem; border: 0; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 14rem; cursor: pointer; transition: filter 0.2s, transform 0.2s; }
.p-b:hover { filter: brightness(1.1); transform: translateY(-2rem); }
.p-b--alt { background: var(--alt); color: #fff; }
.p-b--pop { background: var(--pop); color: var(--on-pop); padding: 0 22rem; }
.p-b:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

.p-enter-active, .p-leave-active { transition: opacity 0.24s ease, transform 0.42s cubic-bezier(.19,1,.22,1); }
.p-enter-from { opacity: 0; transform: translateY(16rem); }
.p-leave-to { opacity: 0; transform: translateY(-10rem); }
@media (max-width: 640px) { .p-sq, .p-tri { display: none; } }
</style>
