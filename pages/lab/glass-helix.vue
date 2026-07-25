<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Liquid Helix — Glass Lab', robots: 'noindex' })
const R = ref(0)
</script>

<template>
  <LabGlassStage layout="helix" theme="paper" :count="8" v-slot="{ active, go }">
    <NuxtLink to="/lab" class="c-lab">◂ lab</NuxtLink>
    <header class="c-head">
      <p class="c-eyebrow">Naveen Jose — Instructional Designer</p>
    </header>
    <footer class="c-foot">
      <Transition name="cf" mode="out-in">
        <div :key="active.href" class="c-cap">
          <h1 class="c-title">{{ active.label }}</h1>
          <p class="c-desc">{{ active.desc }}</p>
        </div>
      </Transition>
      <div class="c-ctl">
        <button class="c-btn" @click="go(-1)" aria-label="previous">↑</button>
        <span class="c-hint">drag · scroll · tap a card</span>
        <button class="c-btn" @click="go(1)" aria-label="next">↓</button>
      </div>
    </footer>
  </LabGlassStage>
</template>

<style scoped>
.c-lab { position: fixed; top: 18rem; left: 22rem; z-index: 10; color: #3a332c; text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; opacity: 0.55; }
.c-head { position: fixed; top: 20rem; left: 50%; translate: -50% 0; z-index: 10; pointer-events: none; }
.c-eyebrow { margin: 0; font-family: 'DM Sans', sans-serif; font-size: 11rem; letter-spacing: 0.2em; text-transform: uppercase; color: #3a332c; opacity: 0.45; }
.c-foot { position: fixed; left: 0; right: 0; bottom: calc(34rem + env(safe-area-inset-bottom)); z-index: 10; text-align: center; pointer-events: none; padding: 0 24rem; }
.c-title { font-family: 'Fraunces', Georgia, serif; font-weight: 400; font-size: clamp(34rem, 5.5vw, 62rem); line-height: 1; margin: 0; color: #241f1a; letter-spacing: -0.02em; }
.c-desc { font-family: 'DM Sans', sans-serif; font-size: 14rem; line-height: 1.5; margin: 10rem auto 0; max-width: 40ch; color: #241f1a; opacity: 0.6; }
.c-ctl { display: flex; align-items: center; justify-content: center; gap: 18rem; margin-top: 20rem; pointer-events: auto; }
.c-btn { width: 38rem; height: 38rem; border-radius: 50%; border: 1px solid rgba(36,31,26,0.16); background: rgba(255,255,255,0.5); backdrop-filter: blur(10px); color: #241f1a; font-size: 15rem; cursor: pointer; transition: background 0.2s, transform 0.2s; }
.c-btn:hover { background: rgba(255,255,255,0.85); transform: translateY(-2rem); }
.c-btn:focus-visible { outline: 2px solid #241f1a; outline-offset: 2px; }
.c-hint { font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.14em; text-transform: uppercase; color: #241f1a; opacity: 0.35; white-space: nowrap; }
.cf-enter-active, .cf-leave-active { transition: opacity 0.3s ease, transform 0.45s cubic-bezier(.19,1,.22,1); }
.cf-enter-from { opacity: 0; transform: translateY(12rem); }
.cf-leave-to { opacity: 0; transform: translateY(-8rem); }
@media (max-width: 620px) { .c-hint { display: none; } }
</style>
