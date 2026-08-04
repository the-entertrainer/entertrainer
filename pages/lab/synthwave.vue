<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Synthwave — Theme Lab', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Space+Mono&display=swap' }] })
</script>

<template>
  <div class="sw">
    <div class="sw__sky" aria-hidden="true">
      <div class="sw__sun" />
      <div class="sw__stars" />
    </div>
    <div class="sw__grid" aria-hidden="true" />
    <NuxtLink to="/lab" class="sw__lab">◂ lab</NuxtLink>
    <main class="sw__ui">
      <p class="sw__eyebrow">// Naveen Jose · Instructional Designer</p>
      <h1 class="sw__name">LEARNING<br><span>REIMAGINED</span></h1>
      <p class="sw__sub">Turning dry content into experiences people actually remember.</p>
      <nav class="sw__nav">
        <NuxtLink v-for="it in LAB_NAV" :key="it.href" :to="it.href" class="sw__pill">{{ it.label }}</NuxtLink>
      </nav>
    </main>
  </div>
</template>

<style scoped>
.sw { position: fixed; inset: 0; overflow: hidden; background: linear-gradient(#0b0221 0%, #2a0a4e 45%, #5b1178 62%, #0b0221 100%); color: #fff; font-family: 'Space Mono', monospace; }
.sw__sky { position: absolute; inset: 0; overflow: hidden; }
.sw__sun { position: absolute; left: 50%; top: 26%; width: min(520rem, 74vw); aspect-ratio: 1; translate: -50% -50%; border-radius: 50%; background: linear-gradient(#fff3b0, #ff477e 55%, #b5179e); box-shadow: 0 0 120rem rgba(255,71,126,0.55); }
.sw__sun::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 46%; background: repeating-linear-gradient(#0b0221 0 7rem, transparent 7rem 15rem); }
.sw__stars { position: absolute; inset: 0; background-image: radial-gradient(1.5rem 1.5rem at 20% 18%, #fff, transparent), radial-gradient(1.5rem 1.5rem at 70% 12%, #fff, transparent), radial-gradient(1rem 1rem at 85% 30%, #fff, transparent), radial-gradient(1rem 1rem at 12% 40%, #fff, transparent), radial-gradient(1.2rem 1.2rem at 40% 8%, #fff, transparent); opacity: 0.8; }
.sw__grid { position: absolute; left: -25%; right: -25%; bottom: 0; height: 52%; background-image: linear-gradient(rgba(255,45,149,0.7) 2rem, transparent 2rem), linear-gradient(90deg, rgba(0,229,255,0.55) 2rem, transparent 2rem); background-size: 100% 46rem, 46rem 100%; transform: perspective(340rem) rotateX(72deg); transform-origin: bottom; animation: sw-run 1.1s linear infinite; }
@keyframes sw-run { to { background-position-y: 46rem, 0; } }
.sw__lab { position: fixed; top: 16rem; left: 20rem; z-index: 10; color: #00e5ff; text-decoration: none; font-size: 12rem; }
.sw__ui { position: absolute; inset: 0; z-index: 5; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 24rem; }
.sw__eyebrow { color: #00e5ff; font-size: 12rem; letter-spacing: 0.2em; text-transform: uppercase; text-shadow: 0 0 10rem #00e5ff; }
.sw__name { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: clamp(40rem, 8vw, 108rem); line-height: 0.98; margin: 14rem 0 12rem; letter-spacing: 0.02em; text-shadow: 0 0 28rem rgba(255,71,126,0.8); }
.sw__name span { background: linear-gradient(#00e5ff, #ff2d95); -webkit-background-clip: text; background-clip: text; color: transparent; }
.sw__sub { max-width: 44ch; font-size: 14rem; opacity: 0.85; margin: 0 0 28rem; }
.sw__nav { display: flex; flex-wrap: wrap; gap: 12rem; justify-content: center; }
.sw__pill { font-family: 'Orbitron', sans-serif; font-weight: 700; font-size: 13rem; letter-spacing: 0.06em; text-transform: uppercase; color: #fff; text-decoration: none; padding: 12rem 22rem; border-radius: 6rem; border: 2rem solid #ff2d95; background: rgba(255,45,149,0.08); box-shadow: 0 0 18rem rgba(255,45,149,0.4), inset 0 0 12rem rgba(255,45,149,0.2); transition: transform 0.2s, box-shadow 0.2s, background 0.2s; }
.sw__pill:hover { transform: translateY(-3rem); background: rgba(0,229,255,0.14); border-color: #00e5ff; box-shadow: 0 0 26rem rgba(0,229,255,0.6); }
.sw__pill:focus-visible { outline: 2rem solid #00e5ff; outline-offset: 3rem; }
@media (max-width: 620px) { .sw__grid { height: 40%; } }
</style>
