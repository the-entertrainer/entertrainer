<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Liquid Orbit — Glass Lab', robots: 'noindex' })
</script>

<template>
  <LabGlassStage layout="orbit" theme="dusk" :count="8" v-slot="{ active, index }">
    <NuxtLink to="/lab" class="o-lab">◂ lab</NuxtLink>
    <div class="o-ring" aria-hidden="true" />
    <div class="o-core">
      <p class="o-eyebrow">Naveen Jose</p>
      <Transition name="of" mode="out-in">
        <h1 :key="active.href" class="o-title">{{ active.label }}</h1>
      </Transition>
      <p class="o-desc">{{ active.desc }}</p>
    </div>
    <div class="o-dots">
      <span v-for="i in 4" :key="i" class="o-dot" :class="{ on: (index % 4) === i - 1 }" />
    </div>
  </LabGlassStage>
</template>

<style scoped>
.o-lab { position: fixed; top: 20rem; left: 24rem; z-index: 10; color: #E8E4DC; text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; opacity: 0.5; }
/* A faint orbital plane the cards appear to travel along. */
.o-ring { position: fixed; top: 50%; left: 50%; translate: -50% -50%; z-index: 1; width: min(78vw, 780rem); aspect-ratio: 1; border-radius: 50%; border: 1px solid rgba(230,228,220,0.10); transform: rotateX(74deg); pointer-events: none; }
.o-core { position: fixed; top: 50%; left: 50%; translate: -50% -50%; z-index: 10; text-align: center; pointer-events: none; padding: 0 24rem; }
.o-eyebrow { margin: 0; font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.3em; text-transform: uppercase; color: #E8E4DC; opacity: 0.4; }
.o-title { font-family: 'Fraunces', serif; font-weight: 400; font-size: clamp(30rem, 4.6vw, 54rem); margin: 12rem 0 0; color: #F7F3EA; letter-spacing: -0.02em; text-shadow: 0 4rem 40rem rgba(0,0,0,0.55); }
.o-desc { font-family: 'DM Sans', sans-serif; font-size: 13rem; margin: 8rem auto 0; max-width: 30ch; color: #F7F3EA; opacity: 0.5; line-height: 1.5; }
.o-dots { position: fixed; left: 0; right: 0; bottom: calc(40rem + env(safe-area-inset-bottom)); z-index: 10; display: flex; gap: 8rem; justify-content: center; pointer-events: none; }
.o-dot { width: 6rem; height: 6rem; border-radius: 50%; background: #E8E4DC; opacity: 0.22; transition: opacity 0.3s, transform 0.3s; }
.o-dot.on { opacity: 0.95; transform: scale(1.5); }
.of-enter-active, .of-leave-active { transition: opacity 0.3s ease, transform 0.5s cubic-bezier(.19,1,.22,1); }
.of-enter-from { opacity: 0; transform: scale(0.9); }
.of-leave-to { opacity: 0; transform: scale(1.06); }
</style>
