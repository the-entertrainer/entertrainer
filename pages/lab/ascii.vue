<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'ASCII Portrait — Theme Lab', robots: 'noindex' })
const art = ref('loading…')
onMounted(() => {
  const img = new Image(); img.crossOrigin = 'anonymous'; img.src = '/about-me.png'
  img.onload = () => {
    const cols = window.innerWidth < 700 ? 74 : 120
    const ar = img.height / img.width
    const rows = Math.round(cols * ar * 0.5)
    const c = document.createElement('canvas'); c.width = cols; c.height = rows
    const ctx = c.getContext('2d')!; ctx.drawImage(img, 0, 0, cols, rows)
    const d = ctx.getImageData(0, 0, cols, rows).data
    const ramp = ' .·:-=+*oØ#%@Ñ'
    let out = ''
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4
        const lum = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255
        out += ramp[Math.min(ramp.length - 1, Math.floor(lum * ramp.length))]
      }
      out += '\n'
    }
    art.value = out
  }
  img.onerror = () => (art.value = 'NAVEEN JOSE')
})
</script>

<template>
  <div class="as">
    <div class="as__scan" aria-hidden="true" />
    <NuxtLink to="/lab" class="as__lab">◂ lab</NuxtLink>
    <div class="as__grid">
      <pre class="as__art">{{ art }}</pre>
      <div class="as__copy">
        <p class="as__eyebrow">$ render naveen.jpg --ascii</p>
        <h1 class="as__name">NAVEEN<br>JOSE</h1>
        <p class="as__sub">instructional designer // designs · builds · dares new tech</p>
        <nav class="as__nav"><NuxtLink v-for="it in LAB_NAV" :key="it.href" :to="it.href" class="as__cmd">→ {{ it.label }}</NuxtLink></nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
.as { position: fixed; inset: 0; overflow: hidden; background: #030603; color: #4dff9b; font-family: 'IBM Plex Mono','Courier New',monospace; }
.as__scan { position: absolute; inset: 0; z-index: 5; pointer-events: none; background: repeating-linear-gradient(to bottom, transparent 0 2px, rgba(0,0,0,0.25) 2px 4px); }
.as__lab { position: fixed; top: 14rem; right: 18rem; z-index: 10; color: #4dff9b; text-decoration: none; font-size: 12rem; }
.as__grid { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 20rem; padding: 0 clamp(20rem,4vw,50rem); }
.as__art { margin: 0; font-size: clamp(4rem, 0.85vw, 8rem); line-height: 1; letter-spacing: 0.5px; white-space: pre; text-shadow: 0 0 6px rgba(77,255,155,0.6); overflow: hidden; }
.as__copy { z-index: 2; }
.as__eyebrow { font-size: 13rem; opacity: 0.7; }
.as__name { font-size: clamp(44rem,7vw,96rem); font-weight: 700; line-height: 0.95; margin: 14rem 0; letter-spacing: -0.02em; text-shadow: 0 0 12px rgba(77,255,155,0.5); }
.as__sub { font-size: 13rem; opacity: 0.75; margin-bottom: 26rem; }
.as__nav { display: flex; flex-direction: column; gap: 8rem; }
.as__cmd { color: #eafff2; text-decoration: none; font-size: 15rem; padding: 4rem 8rem; border: 1px solid transparent; width: fit-content; transition: background 0.12s, border-color 0.12s; }
.as__cmd:hover { background: rgba(77,255,155,0.14); border-color: rgba(77,255,155,0.5); }
.as__cmd:focus-visible { outline: 1px solid #4dff9b; }
@media (max-width: 820px) { .as__grid { grid-template-columns: 1fr; } .as__art { position: absolute; inset: 0; opacity: 0.18; font-size: 5rem; } .as__copy { padding: 0 24rem; } }
</style>
