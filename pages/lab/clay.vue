<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Claymorphic — Theme Lab', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&display=swap' }] })
const COLORS = ['#ffd28a', '#a0e7c8', '#b8c4ff', '#ffb3c8']
</script>

<template>
  <div class="cl">
    <NuxtLink to="/lab" class="cl__lab">◂ lab</NuxtLink>
    <div class="cl__blobs" aria-hidden="true"><span class="s1" /><span class="s2" /><span class="s3" /></div>
    <main class="cl__main">
      <div class="cl__badge">👋 hi, I'm</div>
      <h1 class="cl__name">Naveen Jose</h1>
      <p class="cl__sub">an instructional designer who designs, builds &amp; dares new tech</p>
      <nav class="cl__nav">
        <NuxtLink v-for="(it, i) in LAB_NAV" :key="it.href" :to="it.href" class="cl__btn" :style="{ '--c': COLORS[i % COLORS.length] }">{{ it.label }}</NuxtLink>
      </nav>
    </main>
  </div>
</template>

<style scoped>
.cl { position: fixed; inset: 0; overflow: hidden; display: grid; place-items: center; background: #f4efe6; font-family: 'Baloo 2', system-ui, sans-serif; color: #4a3f35; }
.cl__lab { position: fixed; top: 16rem; left: 20rem; z-index: 20; color: #4a3f35; text-decoration: none; font-size: 13rem; font-weight: 600; opacity: 0.6; }
.cl__blobs span { position: absolute; border-radius: 42% 58% 60% 40% / 45% 45% 55% 55%; filter: none; }
.s1 { width: 260rem; height: 260rem; background: #ffd28a; top: 8%; left: 8%; box-shadow: 18rem 18rem 40rem rgba(180,140,60,0.4), inset 8rem 8rem 20rem rgba(255,255,255,0.6), inset -8rem -8rem 20rem rgba(180,140,60,0.35); animation: cl-f 8s ease-in-out infinite; }
.s2 { width: 200rem; height: 200rem; background: #a0e7c8; bottom: 10%; right: 10%; box-shadow: 18rem 18rem 40rem rgba(60,150,110,0.35), inset 8rem 8rem 20rem rgba(255,255,255,0.6), inset -8rem -8rem 20rem rgba(60,150,110,0.3); animation: cl-f 10s ease-in-out infinite reverse; }
.s3 { width: 150rem; height: 150rem; background: #b8c4ff; top: 16%; right: 18%; box-shadow: 14rem 14rem 30rem rgba(90,100,200,0.3), inset 6rem 6rem 16rem rgba(255,255,255,0.6), inset -6rem -6rem 16rem rgba(90,100,200,0.3); animation: cl-f 7s ease-in-out infinite; }
@keyframes cl-f { 0%,100% { transform: translateY(0) rotate(0deg) } 50% { transform: translateY(-24rem) rotate(8deg) } }
.cl__main { position: relative; z-index: 2; text-align: center; padding: 0 24rem; }
.cl__badge { display: inline-block; background: #fff; padding: 8rem 18rem; border-radius: 999rem; font-weight: 600; font-size: 15rem; box-shadow: 6rem 6rem 16rem rgba(150,120,80,0.25), inset -4rem -4rem 10rem rgba(150,120,80,0.12), inset 4rem 4rem 10rem rgba(255,255,255,0.9); }
.cl__name { font-weight: 800; font-size: clamp(52rem, 10vw, 128rem); line-height: 1; margin: 20rem 0 0; color: #3a3128; text-shadow: 4rem 4rem 0 rgba(255,255,255,0.7); }
.cl__sub { font-size: 17rem; font-weight: 500; opacity: 0.7; margin: 12rem auto 34rem; max-width: 30ch; }
.cl__nav { display: flex; flex-wrap: wrap; gap: 16rem; justify-content: center; }
.cl__btn { font-weight: 700; font-size: 16rem; color: #3a3128; text-decoration: none; padding: 16rem 28rem; border-radius: 24rem; background: var(--c); box-shadow: 10rem 10rem 22rem rgba(150,120,80,0.3), inset 6rem 6rem 14rem rgba(255,255,255,0.55), inset -6rem -6rem 14rem rgba(0,0,0,0.08); transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s; }
.cl__btn:hover { transform: translateY(-6rem) scale(1.05); box-shadow: 14rem 18rem 30rem rgba(150,120,80,0.35), inset 6rem 6rem 14rem rgba(255,255,255,0.6), inset -6rem -6rem 14rem rgba(0,0,0,0.1); }
.cl__btn:active { transform: translateY(-2rem) scale(0.98); }
.cl__btn:focus-visible { outline: 3px solid #3a3128; outline-offset: 3px; }
</style>
