<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Liquid Aurora — Theme Lab', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..600&family=Inter:wght@400;500&display=swap' }] })
</script>

<template>
  <div class="au">
    <div class="au__mesh" aria-hidden="true"><span class="b1" /><span class="b2" /><span class="b3" /><span class="b4" /></div>
    <NuxtLink to="/lab" class="au__lab">◂ lab</NuxtLink>
    <main class="au__card">
      <p class="au__eyebrow">Naveen Jose · Instructional Designer</p>
      <h1 class="au__name">Learning that<br>feels <em>human</em>.</h1>
      <p class="au__deck">I design learning, build the tools to deliver it, and keep daring to try new tech.</p>
      <nav class="au__nav">
        <NuxtLink v-for="it in LAB_NAV" :key="it.href" :to="it.href" class="au__pill">{{ it.label }} <span aria-hidden="true">→</span></NuxtLink>
      </nav>
    </main>
  </div>
</template>

<style scoped>
.au { position: fixed; inset: 0; overflow: hidden; display: grid; place-items: center; background: #eef1ff; font-family: 'Inter', sans-serif; color: #1a1a2e; }
.au__mesh { position: absolute; inset: -20%; filter: blur(60px); }
.au__mesh span { position: absolute; width: 55vw; height: 55vw; border-radius: 50%; mix-blend-mode: multiply; opacity: 0.75; }
.b1 { background: #ff9ecf; top: -5%; left: -5%; animation: au-a 16s ease-in-out infinite; }
.b2 { background: #9ad7ff; bottom: -10%; right: -5%; animation: au-b 19s ease-in-out infinite; }
.b3 { background: #c9a7ff; top: 20%; right: 10%; animation: au-a 22s ease-in-out infinite reverse; }
.b4 { background: #a7ffd8; bottom: 5%; left: 15%; animation: au-b 17s ease-in-out infinite reverse; }
@keyframes au-a { 0%,100% { transform: translate(0,0) scale(1) } 50% { transform: translate(12%,10%) scale(1.15) } }
@keyframes au-b { 0%,100% { transform: translate(0,0) scale(1.1) } 50% { transform: translate(-14%,-8%) scale(0.9) } }
.au__lab { position: fixed; top: 16rem; left: 20rem; z-index: 20; color: #1a1a2e; text-decoration: none; font-size: 12rem; opacity: 0.6; }
.au__card { position: relative; z-index: 2; text-align: center; max-width: 620rem; padding: clamp(30rem,5vw,54rem); margin: 0 20rem; border-radius: 32rem;
  background: rgba(255,255,255,0.35); backdrop-filter: blur(24px) saturate(1.4); -webkit-backdrop-filter: blur(24px) saturate(1.4); border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 40rem 100rem -40rem rgba(60,40,120,0.4); }
.au__eyebrow { font-size: 12rem; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.55; }
.au__name { font-family: 'Fraunces', serif; font-weight: 400; font-size: clamp(40rem, 6vw, 76rem); line-height: 1.0; letter-spacing: -0.015em; margin: 16rem 0 0; }
.au__name em { font-style: italic; }
.au__deck { font-size: 15.5rem; line-height: 1.6; opacity: 0.7; margin: 18rem auto 28rem; max-width: 40ch; }
.au__nav { display: flex; flex-wrap: wrap; gap: 10rem; justify-content: center; }
.au__pill { font-size: 14rem; font-weight: 500; color: #1a1a2e; text-decoration: none; padding: 11rem 20rem; border-radius: 999rem; background: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.7); transition: transform 0.2s, background 0.2s; }
.au__pill:hover { transform: translateY(-3rem); background: #fff; }
.au__pill:focus-visible { outline: 2px solid #1a1a2e; outline-offset: 3px; }
</style>
