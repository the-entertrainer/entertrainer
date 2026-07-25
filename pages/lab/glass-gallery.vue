<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Liquid Gallery — Glass Lab', robots: 'noindex' })
</script>

<template>
  <LabGlassStage layout="grid" theme="paper" :count="6" v-slot="{ active }">
    <NuxtLink to="/lab" class="l-lab">◂ lab</NuxtLink>
    <header class="l-head">
      <span class="l-tag">Selected work</span>
      <h1 class="l-h1">Entertrainer</h1>
    </header>
    <div class="l-rule" aria-hidden="true" />
    <footer class="l-foot">
      <Transition name="lf" mode="out-in">
        <p :key="active.href" class="l-cap">{{ active.label }} <span>· {{ active.desc }}</span></p>
      </Transition>
    </footer>
  </LabGlassStage>
</template>

<style scoped>
.l-lab { position: fixed; top: 20rem; right: 26rem; z-index: 10; color: #2c2620; text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; opacity: 0.5; }
.l-head { position: fixed; top: clamp(28rem, 5vh, 54rem); left: clamp(24rem, 4vw, 54rem); z-index: 10; pointer-events: none; }
.l-tag { font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.24em; text-transform: uppercase; color: #1d1913; opacity: 0.4; }
.l-h1 { font-family: 'Fraunces', serif; font-weight: 400; font-size: clamp(26rem, 3.4vw, 40rem); margin: 6rem 0 0; color: #1d1913; letter-spacing: -0.02em; }
.l-rule { position: fixed; left: clamp(24rem, 4vw, 54rem); right: clamp(24rem, 4vw, 54rem); bottom: calc(78rem + env(safe-area-inset-bottom)); z-index: 10; height: 1px; background: rgba(29,25,19,0.14); pointer-events: none; }
.l-foot { position: fixed; left: clamp(24rem, 4vw, 54rem); right: clamp(24rem, 4vw, 54rem); bottom: calc(42rem + env(safe-area-inset-bottom)); z-index: 10; pointer-events: none; }
.l-cap { font-family: 'DM Sans', sans-serif; font-size: 13rem; margin: 0; color: #1d1913; font-weight: 700; }
.l-cap span { font-weight: 400; opacity: 0.5; }
.lf-enter-active, .lf-leave-active { transition: opacity 0.25s ease, transform 0.4s cubic-bezier(.19,1,.22,1); }
.lf-enter-from { opacity: 0; transform: translateY(8rem); }
.lf-leave-to { opacity: 0; }
</style>
