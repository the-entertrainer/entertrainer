<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'VHS Glitch — Theme Lab', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Archivo:wght@800;900&display=swap' }] })
const now = ref('')
let iv: any
onMounted(() => {
  const upd = () => { now.value = new Date().toLocaleTimeString('en-GB') }
  upd(); iv = setInterval(upd, 1000)
})
onBeforeUnmount(() => clearInterval(iv))
</script>

<template>
  <div class="gl">
    <div class="gl__noise" aria-hidden="true" />
    <div class="gl__scan" aria-hidden="true" />
    <div class="gl__rec"><span class="gl__dot" />REC · {{ now }}</div>
    <NuxtLink to="/lab" class="gl__lab">◂ lab</NuxtLink>
    <main class="gl__ui">
      <p class="gl__eyebrow">▚ SIGNAL / NAVEEN JOSE</p>
      <h1 class="gl__title" data-txt="ENTER&#10;TRAINER">ENTER<br>TRAINER</h1>
      <p class="gl__sub">instructional designer · glitching boring learning into something worth watching</p>
      <nav class="gl__nav">
        <NuxtLink v-for="it in LAB_NAV" :key="it.href" :to="it.href" class="gl__chan" :data-txt="it.label">
          <span class="gl__chan-n">CH{{ it.n }}</span>{{ it.label }}
        </NuxtLink>
      </nav>
    </main>
    <div class="gl__tracking" aria-hidden="true" />
  </div>
</template>

<style scoped>
.gl { position: fixed; inset: 0; overflow: hidden; background: #050505; color: #e8e8e8; font-family: 'Space Mono', monospace; }
.gl__noise { position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: 0.06; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); animation: gl-noise 0.4s steps(3) infinite; }
@keyframes gl-noise { 0%{transform:translate(0,0)} 50%{transform:translate(-6rem,4rem)} 100%{transform:translate(4rem,-4rem)} }
.gl__scan { position: absolute; inset: 0; z-index: 4; pointer-events: none; background: repeating-linear-gradient(to bottom, transparent 0 3rem, rgba(0,0,0,0.28) 3rem 5rem); }
.gl__tracking { position: absolute; left: 0; right: 0; height: 60rem; z-index: 3; pointer-events: none; background: linear-gradient(rgba(255,255,255,0.06), transparent); animation: gl-track 6s linear infinite; }
@keyframes gl-track { from { top: -60rem; } to { top: 100%; } }
.gl__rec { position: fixed; top: 16rem; right: 20rem; z-index: 10; display: flex; align-items: center; gap: 8rem; font-size: 12rem; letter-spacing: 0.1em; color: #ff3b3b; }
.gl__dot { width: 9rem; height: 9rem; border-radius: 50%; background: #ff3b3b; animation: gl-blink 1s steps(1) infinite; }
@keyframes gl-blink { 50% { opacity: 0; } }
.gl__lab { position: fixed; top: 16rem; left: 20rem; z-index: 10; color: #e8e8e8; text-decoration: none; font-size: 12rem; }
.gl__ui { position: absolute; inset: 0; z-index: 5; display: flex; flex-direction: column; justify-content: center; padding: clamp(24rem, 6vw, 96rem); }
.gl__eyebrow { font-size: 12rem; letter-spacing: 0.2em; color: #00ffd5; text-shadow: 0 0 8rem rgba(0,255,213,0.6); margin: 0 0 14rem; }
.gl__title { position: relative; font-family: 'Archivo', sans-serif; font-weight: 900; font-size: clamp(56rem, 15vw, 200rem); line-height: 0.86; letter-spacing: -0.02em; margin: 0; }
.gl__title::before, .gl__title::after { content: attr(data-txt); position: absolute; inset: 0; white-space: pre-line; }
.gl__title::before { color: #ff003c; animation: gl-shift 2.6s infinite steps(2); mix-blend-mode: screen; }
.gl__title::after { color: #00e5ff; animation: gl-shift2 3.1s infinite steps(2); mix-blend-mode: screen; }
@keyframes gl-shift { 0%,90%,100%{transform:translate(0,0)} 92%{transform:translate(-6rem,2rem)} 96%{transform:translate(5rem,-2rem)} }
@keyframes gl-shift2 { 0%,88%,100%{transform:translate(0,0)} 90%{transform:translate(6rem,-3rem)} 95%{transform:translate(-5rem,3rem)} }
.gl__sub { max-width: 46ch; font-size: 14rem; opacity: 0.78; margin: 20rem 0 32rem; }
.gl__nav { display: flex; flex-wrap: wrap; gap: 10rem; }
.gl__chan { position: relative; font-weight: 700; font-size: 13rem; text-transform: uppercase; letter-spacing: 0.04em; color: #e8e8e8; text-decoration: none; padding: 11rem 18rem; border: 1px solid rgba(232,232,232,0.4); background: rgba(255,255,255,0.03); display: inline-flex; align-items: center; gap: 8rem; transition: background 0.14s, border-color 0.14s, color 0.14s; }
.gl__chan-n { color: #00ffd5; font-size: 11rem; }
.gl__chan:hover { background: #00ffd5; color: #050505; border-color: #00ffd5; }
.gl__chan:hover .gl__chan-n { color: #050505; }
.gl__chan:focus-visible { outline: 2rem solid #00ffd5; outline-offset: 2rem; }
</style>
