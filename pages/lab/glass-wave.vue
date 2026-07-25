<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Liquid Wave — Glass Lab', robots: 'noindex' })
</script>

<template>
  <LabGlassStage layout="wave" theme="paper" :count="9" v-slot="{ active, go }">
    <NuxtLink to="/lab" class="w-lab">◂ lab</NuxtLink>
    <header class="w-head">
      <p class="w-eyebrow">Naveen Jose · Instructional Design</p>
    </header>
    <footer class="w-foot">
      <div class="w-bar">
        <button class="w-b" @click="go(-1)" aria-label="previous">←</button>
        <Transition name="wf" mode="out-in">
          <span :key="active.href" class="w-label">{{ active.label }}</span>
        </Transition>
        <button class="w-b" @click="go(1)" aria-label="next">→</button>
      </div>
      <p class="w-desc">{{ active.desc }}</p>
    </footer>
  </LabGlassStage>
</template>

<style scoped>
.w-lab { position: fixed; top: 20rem; left: 24rem; z-index: 10; color: #2c2620; text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; opacity: 0.5; }
.w-head { position: fixed; top: 22rem; left: 0; right: 0; z-index: 10; text-align: center; pointer-events: none; }
.w-eyebrow { font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.24em; text-transform: uppercase; margin: 0; color: #1d1913; opacity: 0.4; }
.w-foot { position: fixed; left: 0; right: 0; bottom: calc(36rem + env(safe-area-inset-bottom)); z-index: 10; text-align: center; pointer-events: none; padding: 0 20rem; }
/* One floating glass pill holding the label between its two arrows. */
.w-bar { display: inline-flex; align-items: center; gap: 6rem; padding: 6rem; border-radius: 999rem; background: rgba(255,255,255,0.55); border: 1px solid rgba(29,25,19,0.10); backdrop-filter: blur(16px); box-shadow: 0 10rem 40rem -18rem rgba(40,30,20,0.5); pointer-events: auto; }
.w-b { width: 38rem; height: 38rem; border-radius: 50%; border: 0; background: transparent; color: #1d1913; font-size: 15rem; cursor: pointer; transition: background 0.2s; }
.w-b:hover { background: rgba(29,25,19,0.07); }
.w-b:focus-visible { outline: 2px solid #1d1913; outline-offset: -2px; }
.w-label { display: inline-block; min-width: 13ch; font-family: 'Fraunces', serif; font-size: 18rem; color: #1d1913; letter-spacing: -0.01em; }
.w-desc { font-family: 'DM Sans', sans-serif; font-size: 12.5rem; margin: 14rem auto 0; max-width: 40ch; color: #1d1913; opacity: 0.5; line-height: 1.5; }
.wf-enter-active, .wf-leave-active { transition: opacity 0.22s ease; }
.wf-enter-from, .wf-leave-to { opacity: 0; }
</style>
