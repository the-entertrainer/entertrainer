<script setup lang="ts">
import { HOME_THEMES } from '~/utils/homeThemes'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Home 01 · Electric Cream', robots: 'noindex' })
const theme = HOME_THEMES[0]
</script>

<template>
  <HomeTower :theme="theme" v-slot="{ active, index, go, open, items }">
    <NuxtLink to="/lab" class="v-lab">◂ lab</NuxtLink>

    <header class="v-top">
      <span class="v-mark">entertrainer</span>
      <span class="v-role">Instructional design, built by hand</span>
    </header>

    <!-- Index rail: which of the four you're on, always visible -->
    <nav class="v-rail" aria-label="Sections">
      <button v-for="(it, i) in items" :key="it.href" class="v-tick"
              :class="{ on: index % 4 === i }" @click="go(i - (index % 4))">
        <span class="v-tick__n">{{ it.n }}</span>
        <span class="v-tick__bar" />
      </button>
    </nav>

    <footer class="v-foot">
      <Transition name="v" mode="out-in">
        <div :key="active.href" class="v-cap">
          <h1 class="v-title">{{ active.label }}</h1>
          <p class="v-desc">{{ active.desc }}</p>
        </div>
      </Transition>
      <button class="v-cta" @click="open(active.href)">
        Open <span aria-hidden="true">→</span>
      </button>
    </footer>
  </HomeTower>
</template>

<style scoped>
.v-lab { position: fixed; top: 18rem; left: 22rem; z-index: 20; color: var(--ink-60); text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; }
.v-top { position: fixed; top: 18rem; left: 50%; translate: -50% 0; z-index: 20; display: flex; flex-direction: column; align-items: center; gap: 3rem; pointer-events: none; text-align: center; }
.v-mark { font-family: var(--display); font-weight: 400; font-size: 17rem; letter-spacing: -0.01em; color: var(--ink); }
.v-role { font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-35); }

.v-rail { position: fixed; right: clamp(16rem, 3vw, 34rem); top: 50%; translate: 0 -50%; z-index: 20; display: flex; flex-direction: column; gap: 12rem; }
.v-tick { display: flex; align-items: center; gap: 8rem; background: none; border: 0; padding: 2rem; cursor: pointer; color: var(--ink-35); font-family: 'DM Sans', sans-serif; font-size: 10rem; letter-spacing: 0.08em; transition: color 0.25s; }
.v-tick__bar { display: block; width: 16rem; height: 2rem; background: currentColor; transition: width 0.3s var(--ease-spring, cubic-bezier(.19,1,.22,1)); }
.v-tick.on { color: var(--ink); }
.v-tick.on .v-tick__bar { width: 34rem; background: var(--pop); }
.v-tick:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

.v-foot { position: fixed; left: 0; right: 0; bottom: calc(30rem + env(safe-area-inset-bottom)); z-index: 20; display: flex; flex-direction: column; align-items: center; gap: 18rem; padding: 0 24rem; pointer-events: none; }
.v-cap { text-align: center; }
.v-title { font-family: var(--display); font-weight: 400; font-size: clamp(38rem, 6.6vw, 78rem); line-height: 0.98; letter-spacing: -0.03em; margin: 0; color: var(--ink); }
.v-desc { font-family: 'DM Sans', sans-serif; font-size: 14rem; line-height: 1.5; margin: 10rem auto 0; max-width: 40ch; color: var(--ink-60); }
.v-cta { pointer-events: auto; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 14rem; letter-spacing: 0.01em; color: var(--on-pop); background: var(--pop); border: 0; border-radius: 999rem; padding: 14rem 28rem; cursor: pointer; box-shadow: 0 10rem 30rem -12rem var(--pop); transition: transform 0.22s cubic-bezier(.19,1,.22,1), box-shadow 0.22s; }
.v-cta span { display: inline-block; transition: translate 0.22s cubic-bezier(.19,1,.22,1); }
.v-cta:hover { transform: translateY(-3rem); box-shadow: 0 16rem 36rem -12rem var(--pop); }
.v-cta:hover span { translate: 4rem 0; }
.v-cta:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }

.v-enter-active, .v-leave-active { transition: opacity 0.3s ease, transform 0.5s cubic-bezier(.19,1,.22,1); }
.v-enter-from { opacity: 0; transform: translateY(18rem); }
.v-leave-to { opacity: 0; transform: translateY(-12rem); }

@media (max-width: 640px) {
  .v-rail { display: none; }
  .v-role { display: none; }
}
</style>
