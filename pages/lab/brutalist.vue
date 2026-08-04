<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Brutalist — Theme Lab', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Archivo:wght@800;900&family=Space+Mono:wght@400;700&display=swap' }] })
const time = ref('')
onMounted(() => { const f = () => { const d = new Date(); time.value = d.toLocaleTimeString('en-GB') }; f(); setInterval(f, 1000) })
</script>

<template>
  <div class="br">
    <NuxtLink to="/lab" class="br__lab">[ ◂ LAB ]</NuxtLink>
    <div class="br__marq"><div class="br__track"><span v-for="i in 8" :key="i">INSTRUCTIONAL DESIGNER&nbsp;&nbsp;✳&nbsp;&nbsp;DESIGNS&nbsp;&nbsp;✳&nbsp;&nbsp;BUILDS&nbsp;&nbsp;✳&nbsp;&nbsp;DARES NEW TECH&nbsp;&nbsp;✳&nbsp;&nbsp;</span></div></div>

    <header class="br__top">
      <span class="br__rec" /> <span>REC · {{ time }}</span>
      <span class="br__id">N.J / GURUGRAM / #OPENTOWORK</span>
    </header>

    <main class="br__main">
      <p class="br__kick">— A CERTIFIED INSTRUCTIONAL DESIGNER WHO CODES</p>
      <h1 class="br__name">NAVEEN<br><span class="acid">JOSE</span></h1>
    </main>

    <nav class="br__grid">
      <NuxtLink v-for="(it, i) in LAB_NAV" :key="it.href" :to="it.href" class="br__cell">
        <span class="br__n">{{ String(i + 1).padStart(2, '0') }}</span>
        <span class="br__label">{{ it.label }}</span>
        <span class="br__arrow">→</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
.br { position: fixed; inset: 0; overflow: hidden; background: #0a0a0a; color: #ededed; font-family: 'Space Mono', monospace; --acid: #ccff00; display: flex; flex-direction: column; }
.acid { color: var(--acid); }
.br__lab { position: fixed; top: 12rem; right: 16rem; z-index: 30; color: var(--acid); text-decoration: none; font-size: 12rem; }
.br__marq { border-bottom: 2px solid #ededed; overflow: hidden; padding: 8rem 0; margin-top: 40rem; }
.br__track { display: inline-flex; white-space: nowrap; animation: br-m 18s linear infinite; font-weight: 700; font-size: 13rem; letter-spacing: 0.04em; }
@keyframes br-m { to { transform: translateX(-50%) } }
.br__top { display: flex; align-items: center; gap: 12rem; padding: 14rem clamp(16rem,4vw,40rem); font-size: 11rem; letter-spacing: 0.1em; }
.br__rec { width: 9rem; height: 9rem; border-radius: 50%; background: #e2504b; animation: br-b 1.2s steps(1) infinite; }
@keyframes br-b { 50% { opacity: 0.2 } }
.br__id { margin-left: auto; opacity: 0.5; }
.br__main { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 0 clamp(16rem,4vw,40rem); }
.br__kick { font-size: 12rem; letter-spacing: 0.08em; opacity: 0.6; margin-bottom: 20rem; }
.br__name { font-family: 'Archivo', sans-serif; font-weight: 900; font-size: clamp(72rem, 20vw, 260rem); line-height: 0.82; letter-spacing: -0.04em; margin: 0; text-transform: uppercase; }
.br__grid { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 2px solid #ededed; }
.br__cell { display: flex; align-items: center; gap: 10rem; padding: 22rem clamp(14rem,2vw,24rem); color: #ededed; text-decoration: none; border-right: 2px solid #ededed; transition: background 0.15s, color 0.15s; }
.br__cell:last-child { border-right: 0; }
.br__cell:hover { background: var(--acid); color: #0a0a0a; }
.br__n { font-size: 11rem; opacity: 0.5; }
.br__label { font-family: 'Archivo', sans-serif; font-weight: 800; font-size: clamp(14rem, 1.5vw, 20rem); text-transform: uppercase; margin-right: auto; }
.br__arrow { font-size: 18rem; }
.br__cell:focus-visible { outline: 3px solid var(--acid); outline-offset: -3px; }
@media (max-width: 720px) { .br__grid { grid-template-columns: 1fr 1fr; } .br__cell:nth-child(2n) { border-right: 0; } .br__id { display: none; } }
</style>
