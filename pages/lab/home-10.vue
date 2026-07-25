<script setup lang="ts">
import { HOME_THEMES } from '~/utils/homeThemes'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Home 10 · Ink & Ice', robots: 'noindex' })
const theme = HOME_THEMES[9]
</script>

<!-- Stripped back: charcoal, one ice-blue cut, a hairline progress bar and a
     caption that wipes up behind a mask. The restraint is the personality. -->
<template>
  <HomeTower :theme="theme" v-slot="{ active, index, go, open }">
    <NuxtLink to="/lab" class="i-lab">◂ lab</NuxtLink>
    <header class="i-top">
      <span class="i-word">Entertrainer</span>
      <span class="i-dot" aria-hidden="true" />
      <span class="i-role">Naveen Jose</span>
    </header>

    <div class="i-progress" aria-hidden="true">
      <span class="i-fill" :style="{ transform: `scaleX(${((index % 4) + 1) / 4})` }" />
    </div>

    <footer class="i-foot">
      <div class="i-mask">
        <Transition name="i" mode="out-in">
          <h1 :key="active.href" class="i-title">{{ active.label }}</h1>
        </Transition>
      </div>
      <Transition name="i" mode="out-in">
        <p :key="active.href" class="i-desc">{{ active.desc }}</p>
      </Transition>
      <div class="i-ctl">
        <button class="i-arrow" @click="go(-1)" aria-label="previous">↑</button>
        <button class="i-open" @click="open(active.href)">
          <span>Open</span><i aria-hidden="true" />
        </button>
        <button class="i-arrow" @click="go(1)" aria-label="next">↓</button>
      </div>
    </footer>
  </HomeTower>
</template>

<style scoped>
.i-lab { position: fixed; top: 18rem; left: 22rem; z-index: 20; color: var(--ink-60); text-decoration: none; font-family: var(--display); font-size: 12rem; }
.i-top { position: fixed; top: 18rem; left: 50%; translate: -50% 0; z-index: 20; display: flex; align-items: center; gap: 10rem; pointer-events: none; font-family: var(--display); font-size: 11.5rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-60); }
.i-word { color: var(--ink); font-weight: 700; }
.i-dot { width: 4rem; height: 4rem; border-radius: 50%; background: var(--pop); }

.i-progress { position: fixed; left: 0; right: 0; top: 0; height: 2rem; z-index: 20; background: var(--ink-12); pointer-events: none; }
.i-fill { display: block; height: 100%; background: var(--pop); transform-origin: left; transition: transform 0.5s cubic-bezier(.19,1,.22,1); }

.i-foot { position: fixed; left: 0; right: 0; bottom: calc(30rem + env(safe-area-inset-bottom)); z-index: 20; text-align: center; padding: 0 22rem; pointer-events: none; }
/* Clipping wrapper so the title appears to slide out from behind an edge. */
.i-mask { overflow: hidden; padding-bottom: 4rem; }
.i-title { font-family: var(--display); font-weight: 700; font-size: clamp(34rem, 6.4vw, 74rem); line-height: 1; letter-spacing: -0.035em; margin: 0; color: var(--ink); }
.i-desc { font-family: 'DM Sans', sans-serif; font-size: 13.5rem; line-height: 1.55; margin: 12rem auto 0; max-width: 38ch; color: var(--ink-60); }
.i-ctl { display: flex; align-items: center; justify-content: center; gap: 10rem; margin-top: 22rem; pointer-events: auto; }
.i-arrow { width: 40rem; height: 40rem; border-radius: 50%; border: 1px solid var(--ink-12); background: transparent; color: var(--ink); font-size: 14rem; cursor: pointer; transition: border-color 0.22s, color 0.22s; }
.i-arrow:hover { border-color: var(--pop); color: var(--pop); }
.i-open { position: relative; display: inline-flex; align-items: center; gap: 10rem; font-family: var(--display); font-weight: 700; font-size: 13rem; letter-spacing: 0.06em; color: var(--bg); background: var(--pop); border: 0; border-radius: 999rem; padding: 13rem 26rem; cursor: pointer; overflow: hidden; transition: transform 0.22s; }
.i-open i { width: 14rem; height: 1.5rem; background: currentColor; transition: width 0.25s cubic-bezier(.19,1,.22,1); }
.i-open:hover { transform: translateY(-2rem); }
.i-open:hover i { width: 24rem; }
.i-arrow:focus-visible, .i-open:focus-visible { outline: 2px solid var(--pop); outline-offset: 3px; }

.i-enter-active, .i-leave-active { transition: opacity 0.3s ease, transform 0.5s cubic-bezier(.19,1,.22,1); }
.i-enter-from { opacity: 0; transform: translateY(100%); }
.i-leave-to { opacity: 0; transform: translateY(-60%); }
</style>
