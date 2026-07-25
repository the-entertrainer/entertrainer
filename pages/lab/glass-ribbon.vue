<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Liquid Ribbon — Glass Lab', robots: 'noindex' })
</script>

<template>
  <LabGlassStage layout="ribbon" theme="paper" :count="9" v-slot="{ active }">
    <NuxtLink to="/lab" class="b-lab">◂ lab</NuxtLink>
    <h1 class="b-ghost" aria-hidden="true">{{ active.label }}</h1>
    <footer class="b-foot">
      <p class="b-name">Naveen Jose</p>
      <Transition name="bf" mode="out-in">
        <p :key="active.href" class="b-desc">{{ active.desc }}</p>
      </Transition>
    </footer>
  </LabGlassStage>
</template>

<style scoped>
.b-lab { position: fixed; top: 20rem; left: 24rem; z-index: 10; color: #2c2620; text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; opacity: 0.5; }
/* Oversized ghost word behind the ribbon — editorial scale, near-invisible. */
.b-ghost { position: fixed; top: 50%; left: 50%; translate: -50% -50%; z-index: 1; margin: 0; font-family: 'Fraunces', serif; font-weight: 400; font-size: clamp(60rem, 16vw, 220rem); line-height: 0.9; color: #1d1913; opacity: 0.055; white-space: nowrap; pointer-events: none; letter-spacing: -0.03em; }
.b-foot { position: fixed; left: 0; right: 0; bottom: calc(38rem + env(safe-area-inset-bottom)); z-index: 10; text-align: center; pointer-events: none; padding: 0 24rem; }
.b-name { font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.3em; text-transform: uppercase; margin: 0 0 10rem; color: #1d1913; opacity: 0.38; }
.b-desc { font-family: 'Fraunces', serif; font-style: italic; font-weight: 300; font-size: clamp(16rem, 2.2vw, 24rem); line-height: 1.4; margin: 0 auto; max-width: 34ch; color: #1d1913; opacity: 0.72; }
.bf-enter-active, .bf-leave-active { transition: opacity 0.32s ease, transform 0.5s cubic-bezier(.19,1,.22,1); }
.bf-enter-from { opacity: 0; transform: translateY(14rem); }
.bf-leave-to { opacity: 0; transform: translateY(-10rem); }
</style>
