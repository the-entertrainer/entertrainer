<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Liquid Desk — Glass Lab', robots: 'noindex' })
</script>

<!-- Cards laid flat on a lit surface and viewed from above: the one layout
     where real contact shadows do the heavy lifting. -->
<template>
  <LabGlassStage layout="desk" theme="paper" :count="4" :ground="-0.06" v-slot="{ active }">
    <NuxtLink to="/lab" class="k-lab">◂ lab</NuxtLink>
    <header class="k-head">
      <h1 class="k-h1">The desk</h1>
      <p class="k-sub">Everything I make, laid out flat.</p>
    </header>
    <footer class="k-foot">
      <Transition name="kf" mode="out-in">
        <p :key="active.href" class="k-cap"><strong>{{ active.label }}</strong> {{ active.desc }}</p>
      </Transition>
    </footer>
  </LabGlassStage>
</template>

<style scoped>
.k-lab { position: fixed; top: 20rem; right: 26rem; z-index: 10; color: #2c2620; text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; opacity: 0.5; }
.k-head { position: fixed; top: clamp(26rem, 5vh, 52rem); left: clamp(24rem, 4vw, 52rem); z-index: 10; pointer-events: none; }
.k-h1 { font-family: 'Fraunces', serif; font-weight: 400; font-size: clamp(28rem, 4vw, 46rem); margin: 0; color: #1d1913; letter-spacing: -0.025em; }
.k-sub { font-family: 'DM Sans', sans-serif; font-size: 12.5rem; margin: 6rem 0 0; color: #1d1913; opacity: 0.45; }
.k-foot { position: fixed; left: clamp(24rem, 4vw, 52rem); right: clamp(24rem, 4vw, 52rem); bottom: calc(36rem + env(safe-area-inset-bottom)); z-index: 10; pointer-events: none; }
.k-cap { font-family: 'DM Sans', sans-serif; font-size: 13rem; line-height: 1.5; margin: 0; color: #1d1913; opacity: 0.55; max-width: 48ch; }
.k-cap strong { opacity: 1; }
.kf-enter-active, .kf-leave-active { transition: opacity 0.26s ease, transform 0.4s cubic-bezier(.19,1,.22,1); }
.kf-enter-from { opacity: 0; transform: translateY(8rem); }
.kf-leave-to { opacity: 0; }
</style>
