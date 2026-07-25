<script setup lang="ts">
import { HOME_THEMES } from '~/utils/homeThemes'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Home 07 · Dusk Violet', robots: 'noindex' })
const theme = HOME_THEMES[6]

// Split the label so each letter can rise on its own beat.
const letters = (s: string) => [...s]
</script>

<!-- Slow and elegant: the section name assembles letter by letter, italic
     serif over a violet night, with a soft lilac bloom behind the tower. -->
<template>
  <HomeTower :theme="theme" v-slot="{ active, index, go, open }">
    <NuxtLink to="/lab" class="d-lab">◂ lab</NuxtLink>
    <div class="d-bloom" aria-hidden="true" />

    <footer class="d-foot">
      <p class="d-kicker">Naveen Jose — instructional designer</p>
      <h1 class="d-title" :key="active.href">
        <span v-for="(ch, i) in letters(active.label)" :key="i" class="d-ch"
              :style="{ animationDelay: (i * 38) + 'ms' }">{{ ch === ' ' ? ' ' : ch }}</span>
      </h1>
      <Transition name="d" mode="out-in">
        <p :key="active.href" class="d-desc">{{ active.desc }}</p>
      </Transition>
      <div class="d-ctl">
        <button class="d-b" @click="go(-1)" aria-label="previous">↑</button>
        <button class="d-open" @click="open(active.href)">Read on</button>
        <button class="d-b" @click="go(1)" aria-label="next">↓</button>
      </div>
      <p class="d-count">{{ String((index % 4) + 1).padStart(2, '0') }} — 04</p>
    </footer>
  </HomeTower>
</template>

<style scoped>
.d-lab { position: fixed; top: 18rem; left: 22rem; z-index: 20; color: var(--ink-60); text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; }
.d-bloom { position: fixed; top: 34%; left: 50%; translate: -50% -50%; z-index: 1; width: min(70vw, 620rem); aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle, var(--pop) 0%, transparent 68%); opacity: 0.20; filter: blur(28px); pointer-events: none; }

.d-foot { position: fixed; left: 0; right: 0; bottom: calc(26rem + env(safe-area-inset-bottom)); z-index: 20; text-align: center; padding: 0 22rem; pointer-events: none; }
.d-kicker { font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.24em; text-transform: uppercase; margin: 0 0 10rem; color: var(--ink-35); }
.d-title { margin: 0; font-family: var(--display); font-weight: 300; font-style: italic; font-size: clamp(36rem, 6.4vw, 76rem); line-height: 1; letter-spacing: -0.025em; color: var(--ink); }
.d-ch { display: inline-block; animation: d-rise 0.6s cubic-bezier(.19,1,.22,1) both; }
@keyframes d-rise { from { opacity: 0; transform: translateY(22rem) rotate(4deg); } }
@media (prefers-reduced-motion: reduce) { .d-ch { animation: none; } }
.d-desc { font-family: 'DM Sans', sans-serif; font-size: 13.5rem; line-height: 1.6; margin: 14rem auto 0; max-width: 38ch; color: var(--ink-60); }
.d-ctl { display: flex; align-items: center; justify-content: center; gap: 10rem; margin-top: 20rem; pointer-events: auto; }
.d-b { width: 40rem; height: 40rem; border-radius: 50%; border: 1px solid var(--ink-35); background: transparent; color: var(--ink); font-size: 14rem; cursor: pointer; transition: border-color 0.22s, color 0.22s; }
.d-b:hover { border-color: var(--pop); color: var(--pop); }
.d-open { font-family: var(--display); font-style: italic; font-size: 15rem; color: var(--on-pop); background: var(--pop); border: 0; border-radius: 999rem; padding: 12rem 28rem; cursor: pointer; transition: transform 0.22s, filter 0.22s; }
.d-open:hover { transform: translateY(-2rem); filter: brightness(1.06); }
.d-b:focus-visible, .d-open:focus-visible { outline: 2px solid var(--alt); outline-offset: 3px; }
.d-count { font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.2em; margin: 16rem 0 0; color: var(--ink-35); font-variant-numeric: tabular-nums; }

.d-enter-active, .d-leave-active { transition: opacity 0.34s ease; }
.d-enter-from, .d-leave-to { opacity: 0; }
</style>
