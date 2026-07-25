<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Liquid River — Glass Lab', robots: 'noindex' })
</script>

<template>
  <LabGlassStage layout="coverflow" theme="paper" :count="8" v-slot="{ active, index, go }">
    <NuxtLink to="/lab" class="r-lab">◂ lab</NuxtLink>
    <div class="r-num" aria-hidden="true">{{ String((index % 4) + 1).padStart(2, '0') }}</div>
    <aside class="r-side">
      <Transition name="rf" mode="out-in">
        <div :key="active.href">
          <h1 class="r-title">{{ active.label }}</h1>
          <p class="r-desc">{{ active.desc }}</p>
        </div>
      </Transition>
      <div class="r-nav">
        <button class="r-arrow" @click="go(-1)" aria-label="previous">←</button>
        <button class="r-arrow" @click="go(1)" aria-label="next">→</button>
      </div>
    </aside>
    <p class="r-hint">drag horizontally</p>
  </LabGlassStage>
</template>

<style scoped>
.r-lab { position: fixed; top: 20rem; left: 24rem; z-index: 10; color: #2c2620; text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; opacity: 0.5; }
.r-num { position: fixed; top: 50%; left: 46rem; translate: 0 -50%; z-index: 5; font-family: 'Fraunces', serif; font-size: clamp(120rem, 22vw, 260rem); line-height: 0.8; color: #2c2620; opacity: 0.06; pointer-events: none; font-variant-numeric: tabular-nums; }
.r-side { position: fixed; left: 0; right: 0; bottom: calc(40rem + env(safe-area-inset-bottom)); z-index: 10; text-align: center; padding: 0 26rem; pointer-events: none; }
.r-title { font-family: 'Fraunces', serif; font-weight: 400; font-size: clamp(32rem, 5vw, 58rem); margin: 0; color: #1d1913; letter-spacing: -0.02em; }
.r-desc { font-family: 'DM Sans', sans-serif; font-size: 14rem; line-height: 1.5; margin: 8rem auto 0; max-width: 38ch; color: #1d1913; opacity: 0.55; }
.r-nav { display: flex; gap: 10rem; justify-content: center; margin-top: 18rem; pointer-events: auto; }
.r-arrow { width: 44rem; height: 44rem; border-radius: 50%; border: 1px solid rgba(29,25,19,0.14); background: rgba(255,255,255,0.55); backdrop-filter: blur(12px); color: #1d1913; font-size: 16rem; cursor: pointer; transition: background 0.2s, transform 0.2s; }
.r-arrow:hover { background: #fff; transform: scale(1.06); }
.r-arrow:focus-visible { outline: 2px solid #1d1913; outline-offset: 2px; }
.r-hint { position: fixed; top: 22rem; right: 26rem; z-index: 10; margin: 0; font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.16em; text-transform: uppercase; color: #1d1913; opacity: 0.3; }
.rf-enter-active, .rf-leave-active { transition: opacity 0.28s ease, transform 0.44s cubic-bezier(.19,1,.22,1); }
.rf-enter-from { opacity: 0; transform: translateX(24rem); }
.rf-leave-to { opacity: 0; transform: translateX(-18rem); }
@media (max-width: 620px) { .r-hint { display: none; } }
</style>
