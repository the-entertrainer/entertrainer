<script setup lang="ts">
import { HOME_THEMES } from '~/utils/homeThemes'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Home 03 · Sunset Pop', robots: 'noindex' })
const theme = HOME_THEMES[2]
</script>

<!-- The caption arrives as a physical card that slides up from the base —
     presentation as an object, not a label. -->
<template>
  <HomeTower :theme="theme" v-slot="{ active, index, go, open, items }">
    <NuxtLink to="/lab" class="s-lab">◂ lab</NuxtLink>
    <header class="s-top"><span class="s-chip">Naveen Jose</span></header>

    <footer class="s-foot">
      <Transition name="s" mode="out-in">
        <article :key="active.href" class="s-card">
          <h1 class="s-title">{{ active.label }}</h1>
          <p class="s-desc">{{ active.desc }}</p>
          <button class="s-cta" @click="open(active.href)">Take a look <span aria-hidden="true">↗</span></button>
        </article>
      </Transition>
      <div class="s-dots">
        <button v-for="(it, i) in items" :key="it.href" class="s-dot" :class="{ on: index % 4 === i }"
                @click="go(i - (index % 4))" :aria-label="it.label" />
      </div>
    </footer>
  </HomeTower>
</template>

<style scoped>
.s-lab { position: fixed; top: 18rem; left: 22rem; z-index: 20; color: var(--ink-60); text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; }
.s-top { position: fixed; top: 16rem; left: 50%; translate: -50% 0; z-index: 20; pointer-events: none; }
.s-chip { display: inline-block; font-family: var(--display); font-weight: 700; font-size: 12rem; letter-spacing: 0.06em; color: var(--on-pop); background: var(--pop); padding: 7rem 16rem; border-radius: 999rem; }

.s-foot { position: fixed; left: 0; right: 0; bottom: calc(24rem + env(safe-area-inset-bottom)); z-index: 20; display: flex; flex-direction: column; align-items: center; gap: 16rem; padding: 0 18rem; pointer-events: none; }
.s-card { pointer-events: auto; width: min(460rem, 100%); background: var(--ink); color: var(--bg); border-radius: 26rem; padding: 26rem 26rem 22rem; text-align: left; box-shadow: 0 26rem 60rem -26rem rgba(0,0,0,0.6); }
.s-title { font-family: var(--display); font-weight: 800; font-size: clamp(30rem, 5vw, 46rem); line-height: 1; letter-spacing: -0.03em; margin: 0; }
.s-desc { font-family: 'DM Sans', sans-serif; font-size: 13.5rem; line-height: 1.55; margin: 10rem 0 18rem; opacity: 0.72; }
.s-cta { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 13rem; color: var(--on-pop); background: var(--pop); border: 0; border-radius: 999rem; padding: 12rem 22rem; cursor: pointer; transition: transform 0.2s; }
.s-cta span { display: inline-block; transition: translate 0.2s; }
.s-cta:hover { transform: translateY(-2rem); }
.s-cta:hover span { translate: 3rem -3rem; }
.s-cta:focus-visible { outline: 2px solid var(--bg); outline-offset: 3px; }

.s-dots { display: flex; gap: 8rem; pointer-events: auto; }
.s-dot { width: 9rem; height: 9rem; padding: 0; border-radius: 50%; border: 0; background: var(--ink-35); cursor: pointer; transition: transform 0.3s cubic-bezier(.19,1,.22,1), background 0.3s; }
.s-dot.on { background: var(--pop); transform: scale(1.5); }
.s-dot:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }

.s-enter-active, .s-leave-active { transition: opacity 0.3s ease, transform 0.55s cubic-bezier(.19,1,.22,1); }
.s-enter-from { opacity: 0; transform: translateY(40rem); }
.s-leave-to { opacity: 0; transform: translateY(-18rem); }
</style>
