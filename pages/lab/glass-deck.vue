<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Liquid Deck — Glass Lab', robots: 'noindex' })
</script>

<template>
  <LabGlassStage layout="deck" theme="dusk" :count="7" v-slot="{ active, index, go }">
    <NuxtLink to="/lab" class="d-lab">◂ lab</NuxtLink>
    <header class="d-top">
      <span class="d-mark">entertrainer</span>
      <span class="d-count">{{ String((index % 4) + 1).padStart(2, '0') }} — 04</span>
    </header>
    <footer class="d-foot">
      <Transition name="df" mode="out-in">
        <h1 :key="active.href" class="d-title">{{ active.label }}</h1>
      </Transition>
      <button class="d-cta" @click="go(1)">Next card →</button>
    </footer>
  </LabGlassStage>
</template>

<style scoped>
.d-lab { position: fixed; top: 20rem; left: 24rem; z-index: 10; color: #EDE7DD; text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; opacity: 0.5; }
.d-top { position: fixed; top: 20rem; left: 0; right: 0; z-index: 10; display: flex; justify-content: center; gap: 16rem; align-items: baseline; pointer-events: none; font-family: 'DM Sans', sans-serif; color: #EDE7DD; }
.d-mark { font-size: 11rem; letter-spacing: 0.28em; text-transform: uppercase; opacity: 0.5; }
.d-count { font-size: 11rem; letter-spacing: 0.14em; opacity: 0.3; font-variant-numeric: tabular-nums; }
.d-foot { position: fixed; left: 0; right: 0; bottom: calc(46rem + env(safe-area-inset-bottom)); z-index: 10; text-align: center; pointer-events: none; padding: 0 24rem; }
.d-title { font-family: 'Fraunces', serif; font-weight: 300; font-style: italic; font-size: clamp(38rem, 7vw, 82rem); margin: 0; color: #F6F1E8; letter-spacing: -0.03em; line-height: 1; }
.d-cta { margin-top: 22rem; pointer-events: auto; font-family: 'DM Sans', sans-serif; font-size: 12.5rem; letter-spacing: 0.06em; color: #F6F1E8; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.22); border-radius: 999rem; padding: 12rem 24rem; cursor: pointer; backdrop-filter: blur(14px); transition: background 0.22s, transform 0.22s; }
.d-cta:hover { background: rgba(255,255,255,0.16); transform: translateY(-2rem); }
.d-cta:focus-visible { outline: 2px solid #F6F1E8; outline-offset: 3px; }
.df-enter-active, .df-leave-active { transition: opacity 0.3s ease, transform 0.5s cubic-bezier(.19,1,.22,1); }
.df-enter-from { opacity: 0; transform: translateY(18rem) scale(0.96); }
.df-leave-to { opacity: 0; transform: translateY(-10rem); }
</style>
