<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Liquid Tower — Glass Lab', robots: 'noindex' })
</script>

<template>
  <LabGlassStage layout="column" theme="dusk" :count="8" v-slot="{ active, index }">
    <NuxtLink to="/lab" class="t-lab">◂ lab</NuxtLink>
    <div class="t-rail" aria-hidden="true">
      <span v-for="i in 4" :key="i" class="t-tick" :class="{ on: (index % 4) === i - 1 }" />
    </div>
    <aside class="t-side">
      <Transition name="tf" mode="out-in">
        <div :key="active.href">
          <p class="t-idx">{{ String((index % 4) + 1).padStart(2, '0') }}</p>
          <h1 class="t-title">{{ active.label }}</h1>
          <p class="t-desc">{{ active.desc }}</p>
        </div>
      </Transition>
    </aside>
    <p class="t-hint">scroll to descend</p>
  </LabGlassStage>
</template>

<style scoped>
.t-lab { position: fixed; top: 20rem; left: 24rem; z-index: 10; color: #E9E4DA; text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; opacity: 0.5; }
.t-rail { position: fixed; left: clamp(22rem, 3vw, 40rem); top: 50%; translate: 0 -50%; z-index: 10; display: flex; flex-direction: column; gap: 10rem; pointer-events: none; }
.t-tick { width: 18rem; height: 2rem; background: #E9E4DA; opacity: 0.2; transition: opacity 0.3s, width 0.3s; }
.t-tick.on { opacity: 0.9; width: 34rem; }
.t-side { position: fixed; right: clamp(24rem, 5vw, 74rem); top: 50%; translate: 0 -50%; z-index: 10; text-align: right; max-width: 34ch; pointer-events: none; }
.t-idx { font-family: 'DM Sans', sans-serif; font-size: 11rem; letter-spacing: 0.2em; margin: 0 0 8rem; color: #E9E4DA; opacity: 0.35; font-variant-numeric: tabular-nums; }
.t-title { font-family: 'Fraunces', serif; font-weight: 400; font-size: clamp(28rem, 4.2vw, 50rem); margin: 0; color: #F7F2E9; letter-spacing: -0.02em; line-height: 1.05; }
.t-desc { font-family: 'DM Sans', sans-serif; font-size: 13rem; line-height: 1.55; margin: 10rem 0 0; color: #F7F2E9; opacity: 0.5; }
.t-hint { position: fixed; left: 0; right: 0; bottom: calc(30rem + env(safe-area-inset-bottom)); z-index: 10; margin: 0; text-align: center; font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.18em; text-transform: uppercase; color: #E9E4DA; opacity: 0.28; }
.tf-enter-active, .tf-leave-active { transition: opacity 0.3s ease, transform 0.5s cubic-bezier(.19,1,.22,1); }
.tf-enter-from { opacity: 0; transform: translateY(20rem); }
.tf-leave-to { opacity: 0; transform: translateY(-14rem); }
@media (max-width: 760px) { .t-side { right: 24rem; left: 24rem; text-align: center; top: auto; bottom: calc(64rem + env(safe-area-inset-bottom)); translate: 0 0; max-width: none; } .t-rail { display: none; } .t-hint { display: none; } }
</style>
