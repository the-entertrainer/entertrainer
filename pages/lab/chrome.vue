<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Y2K Chrome — Theme Lab', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800;900&family=Space+Mono&display=swap' }] })
</script>

<template>
  <div class="cr">
    <NuxtLink to="/lab" class="cr__lab">◂ lab</NuxtLink>
    <div class="cr__stars" aria-hidden="true"><span v-for="i in 18" :key="i" :style="{ left: (i*5.5%100)+'%', top: ((i*37)%100)+'%', animationDelay: (i*0.2)+'s' }">✦</span></div>

    <main class="cr__main">
      <p class="cr__kick">✦ welcome 2 the world of ✦</p>
      <h1 class="cr__name" data-text="NAVEEN JOSE">NAVEEN JOSE</h1>
      <p class="cr__sub">instructional designer &nbsp;·&nbsp; designs · builds · dares new tech</p>
      <nav class="cr__nav">
        <NuxtLink v-for="it in LAB_NAV" :key="it.href" :to="it.href" class="cr__btn">{{ it.label }}</NuxtLink>
      </nav>
    </main>
  </div>
</template>

<style scoped>
.cr { position: fixed; inset: 0; overflow: hidden; display: grid; place-items: center; font-family: 'Space Mono', monospace; color: #fff;
  background: linear-gradient(-45deg, #2b0a4a, #0a1e5c, #7a0f6b, #0a4a5c); background-size: 400% 400%; animation: cr-bg 14s ease infinite; }
@keyframes cr-bg { 0%,100% { background-position: 0% 50% } 50% { background-position: 100% 50% } }
.cr__lab { position: fixed; top: 16rem; left: 18rem; z-index: 20; color: #18ffe8; text-decoration: none; font-size: 13rem; text-shadow: 0 0 8px #18ffe8; }
.cr__stars { position: absolute; inset: 0; pointer-events: none; }
.cr__stars span { position: absolute; color: #fff; font-size: 16rem; opacity: 0.8; animation: cr-tw 2.5s ease-in-out infinite; text-shadow: 0 0 10px #fff; }
@keyframes cr-tw { 0%,100% { opacity: 0.2; transform: scale(0.7) } 50% { opacity: 1; transform: scale(1.2) } }
.cr__main { position: relative; z-index: 2; text-align: center; padding: 0 24rem; }
.cr__kick { color: #ff9cf0; font-size: 14rem; letter-spacing: 0.1em; text-shadow: 0 0 12px #ff2fd0; margin-bottom: 18rem; }
.cr__name { position: relative; font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: clamp(46rem, 10vw, 132rem); letter-spacing: 0.02em; margin: 0; line-height: 1;
  background: linear-gradient(180deg, #ffffff 0%, #cfe6ff 34%, #8aa0c8 50%, #eef6ff 58%, #9fb4d6 74%, #ffffff 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 3px 0 #3a2a6a) drop-shadow(0 6px 18px rgba(0,0,0,0.5)); }
.cr__name::after { content: attr(data-text); position: absolute; inset: 0; background: linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.9) 50%, transparent 60%); -webkit-background-clip: text; background-clip: text; color: transparent; animation: cr-shine 3.5s linear infinite; }
@keyframes cr-shine { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
.cr__sub { margin: 20rem 0 32rem; font-size: 13rem; letter-spacing: 0.08em; color: #b9e6ff; text-shadow: 0 0 10px rgba(24,255,232,0.5); text-transform: uppercase; }
.cr__nav { display: flex; flex-wrap: wrap; gap: 12rem; justify-content: center; }
.cr__btn { font-family: 'Orbitron', sans-serif; font-weight: 600; font-size: 13rem; text-transform: uppercase; letter-spacing: 0.05em; color: #fff; text-decoration: none; padding: 12rem 20rem; border-radius: 999rem;
  background: linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05)); border: 1px solid rgba(255,255,255,0.4); box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 6px 20px rgba(0,0,0,0.4); transition: transform 0.2s, box-shadow 0.2s; }
.cr__btn:hover { transform: translateY(-3rem) scale(1.04); box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 0 26px #18ffe8; }
.cr__btn:focus-visible { outline: 2px solid #18ffe8; outline-offset: 3px; }
</style>
