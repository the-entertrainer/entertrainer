<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Liquid Fan — Glass Lab', robots: 'noindex' })
</script>

<template>
  <LabGlassStage layout="arc" theme="paper" :count="7" v-slot="{ active, go }">
    <NuxtLink to="/lab" class="f-lab">◂ lab</NuxtLink>
    <header class="f-head">
      <h1 class="f-h1">Learning,<br><em>held in the hand.</em></h1>
      <p class="f-sub">Naveen Jose — instructional designer who codes</p>
    </header>
    <footer class="f-foot">
      <Transition name="ff" mode="out-in">
        <p :key="active.href" class="f-now"><span>{{ active.label }}</span> — {{ active.desc }}</p>
      </Transition>
      <div class="f-nav">
        <button class="f-b" @click="go(-1)" aria-label="previous">‹</button>
        <button class="f-b" @click="go(1)" aria-label="next">›</button>
      </div>
    </footer>
  </LabGlassStage>
</template>

<style scoped>
.f-lab { position: fixed; top: 20rem; right: 26rem; z-index: 10; color: #2c2620; text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; opacity: 0.5; }
.f-head { position: fixed; top: clamp(46rem, 9vh, 96rem); left: 0; right: 0; z-index: 10; text-align: center; pointer-events: none; padding: 0 24rem; }
.f-h1 { font-family: 'Fraunces', serif; font-weight: 400; font-size: clamp(30rem, 5.4vw, 62rem); line-height: 1.04; margin: 0; color: #1d1913; letter-spacing: -0.025em; }
.f-h1 em { font-style: italic; opacity: 0.55; }
.f-sub { font-family: 'DM Sans', sans-serif; font-size: 11.5rem; letter-spacing: 0.14em; text-transform: uppercase; margin: 14rem 0 0; color: #1d1913; opacity: 0.4; }
.f-foot { position: fixed; left: 0; right: 0; bottom: calc(36rem + env(safe-area-inset-bottom)); z-index: 10; display: flex; flex-direction: column; align-items: center; gap: 14rem; pointer-events: none; padding: 0 24rem; }
.f-now { font-family: 'DM Sans', sans-serif; font-size: 13rem; margin: 0; color: #1d1913; opacity: 0.6; text-align: center; max-width: 46ch; line-height: 1.5; }
.f-now span { font-weight: 700; opacity: 1; }
.f-nav { display: flex; gap: 8rem; pointer-events: auto; }
.f-b { width: 40rem; height: 40rem; border-radius: 50%; border: 1px solid rgba(29,25,19,0.15); background: rgba(255,255,255,0.6); backdrop-filter: blur(12px); color: #1d1913; font-size: 18rem; line-height: 1; cursor: pointer; transition: background 0.2s, transform 0.2s; }
.f-b:hover { background: #fff; transform: translateY(-2rem); }
.f-b:focus-visible { outline: 2px solid #1d1913; outline-offset: 2px; }
.ff-enter-active, .ff-leave-active { transition: opacity 0.28s ease; }
.ff-enter-from, .ff-leave-to { opacity: 0; }
</style>
