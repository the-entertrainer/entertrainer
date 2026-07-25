<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Liquid Vortex — Glass Lab', robots: 'noindex' })
</script>

<template>
  <LabGlassStage layout="vortex" theme="dusk" :count="10" v-slot="{ active, index }">
    <NuxtLink to="/lab" class="v-lab">◂ lab</NuxtLink>
    <div class="v-tunnel" aria-hidden="true" />
    <div class="v-core">
      <Transition name="vf" mode="out-in">
        <div :key="active.href">
          <h1 class="v-title">{{ active.label }}</h1>
          <p class="v-desc">{{ active.desc }}</p>
        </div>
      </Transition>
    </div>
    <div class="v-meter" aria-hidden="true">
      <span class="v-fill" :style="{ width: (((index % 4) + 1) / 4 * 100) + '%' }" />
    </div>
  </LabGlassStage>
</template>

<style scoped>
.v-lab { position: fixed; top: 20rem; left: 24rem; z-index: 10; color: #E9E4DA; text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; opacity: 0.5; }
/* Vignette that deepens the throat of the tunnel. */
.v-tunnel { position: fixed; inset: 0; z-index: 4; pointer-events: none; background: radial-gradient(circle at 50% 50%, rgba(10,9,14,0.62) 0%, transparent 42%, transparent 62%, rgba(10,9,14,0.5) 100%); }
/* Sits low, not dead centre: the middle of frame is the tunnel throat where
   cards are densest, and copy placed there is unreadable. */
.v-core { position: fixed; left: 0; right: 0; bottom: calc(64rem + env(safe-area-inset-bottom)); z-index: 10; text-align: center; pointer-events: none; padding: 0 24rem; }
.v-title { font-family: 'Fraunces', serif; font-weight: 400; font-size: clamp(32rem, 5.6vw, 66rem); margin: 0; color: #F8F4EC; letter-spacing: -0.025em; text-shadow: 0 4rem 44rem rgba(0,0,0,0.75); }
.v-desc { font-family: 'DM Sans', sans-serif; font-size: 13rem; margin: 12rem auto 0; max-width: 32ch; color: #F8F4EC; opacity: 0.55; line-height: 1.55; text-shadow: 0 2rem 20rem rgba(0,0,0,0.6); }
.v-meter { position: fixed; left: 50%; translate: -50% 0; bottom: calc(38rem + env(safe-area-inset-bottom)); z-index: 10; width: min(220rem, 50vw); height: 2rem; background: rgba(233,228,218,0.18); pointer-events: none; }
.v-fill { display: block; height: 100%; background: #E9E4DA; transition: width 0.45s cubic-bezier(.19,1,.22,1); }
.vf-enter-active, .vf-leave-active { transition: opacity 0.3s ease, transform 0.5s cubic-bezier(.19,1,.22,1); }
.vf-enter-from { opacity: 0; transform: scale(0.88); }
.vf-leave-to { opacity: 0; transform: scale(1.12); }
</style>
