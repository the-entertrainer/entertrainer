<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Liquid Field — Glass Lab', robots: 'noindex' })
</script>

<template>
  <LabGlassStage layout="constellation" theme="dusk" :count="10" v-slot="{ active }">
    <NuxtLink to="/lab" class="n-lab">◂ lab</NuxtLink>
    <div class="n-veil" aria-hidden="true" />
    <div class="n-core">
      <p class="n-kicker">A portfolio, scattered in depth</p>
      <Transition name="nf" mode="out-in">
        <h1 :key="active.href" class="n-title">{{ active.label }}</h1>
      </Transition>
      <p class="n-hint">drag to move through the field</p>
    </div>
  </LabGlassStage>
</template>

<style scoped>
.n-lab { position: fixed; top: 20rem; left: 24rem; z-index: 10; color: #E9E4DA; text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; opacity: 0.5; }
/* Radial darkening so the far cards fall away into depth and the centre reads. */
.n-veil { position: fixed; inset: 0; z-index: 4; pointer-events: none; background: radial-gradient(ellipse at 50% 52%, transparent 24%, rgba(12,11,16,0.55) 78%); }
.n-core { position: fixed; left: 0; right: 0; bottom: calc(48rem + env(safe-area-inset-bottom)); z-index: 10; text-align: center; pointer-events: none; padding: 0 24rem; }
.n-kicker { font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.26em; text-transform: uppercase; margin: 0; color: #E9E4DA; opacity: 0.38; }
.n-title { font-family: 'Fraunces', serif; font-weight: 400; font-size: clamp(34rem, 6vw, 72rem); margin: 12rem 0 0; color: #F8F4EC; letter-spacing: -0.025em; text-shadow: 0 6rem 50rem rgba(0,0,0,0.6); }
.n-hint { font-family: 'DM Sans', sans-serif; font-size: 11rem; margin: 14rem 0 0; color: #E9E4DA; opacity: 0.3; letter-spacing: 0.08em; }
.nf-enter-active, .nf-leave-active { transition: opacity 0.32s ease, transform 0.55s cubic-bezier(.19,1,.22,1); }
.nf-enter-from { opacity: 0; transform: translateY(16rem) scale(0.97); }
.nf-leave-to { opacity: 0; transform: scale(1.04); }
</style>
