<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Kinetic Swiss — Theme Lab', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Archivo:wght@600;800;900&display=swap' }] })
</script>

<template>
  <div class="sw">
    <NuxtLink to="/lab" class="sw__lab">◂ Lab</NuxtLink>
    <div class="sw__marq" aria-hidden="true"><div class="sw__track"><span v-for="i in 6" :key="i">DESIGN · BUILD · DARE · </span></div></div>

    <header class="sw__head">
      <span>Naveen Jose</span><span>Instructional Designer</span><span>Gurugram — 2026</span>
    </header>

    <main class="sw__main">
      <h1 class="sw__big">DESIGN<span class="red">.</span><br>BUILD<span class="red">.</span><br>DARE<span class="red">.</span></h1>
    </main>

    <nav class="sw__nav">
      <NuxtLink v-for="(it, i) in LAB_NAV" :key="it.href" :to="it.href" class="sw__item">
        <b>{{ String(i + 1).padStart(2, '0') }}</b> {{ it.label }}
      </NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
.sw { position: fixed; inset: 0; overflow: hidden; background: #f4f4f2; color: #111; font-family: 'Archivo', 'Helvetica Neue', Arial, sans-serif; display: flex; flex-direction: column; --red: #ff2e17; }
.red { color: var(--red); }
.sw__lab { position: fixed; top: 14rem; right: 18rem; z-index: 30; color: #111; text-decoration: none; font-size: 12rem; font-weight: 700; text-transform: uppercase; }
.sw__marq { background: var(--red); color: #fff; overflow: hidden; padding: 6rem 0; }
.sw__track { display: inline-flex; white-space: nowrap; font-weight: 900; font-size: 14rem; letter-spacing: 0.02em; text-transform: uppercase; animation: sw-m 12s linear infinite; }
@keyframes sw-m { to { transform: translateX(-50%) } }
.sw__head { display: flex; justify-content: space-between; gap: 12rem; padding: 16rem clamp(16rem,4vw,40rem); font-size: 12rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; border-bottom: 3px solid #111; }
.sw__main { flex: 1; display: flex; align-items: center; padding: 0 clamp(16rem,4vw,40rem); }
.sw__big { font-weight: 900; font-size: clamp(64rem, 17vw, 230rem); line-height: 0.84; letter-spacing: -0.045em; margin: 0; text-transform: uppercase; }
.sw__nav { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 3px solid #111; }
.sw__item { padding: 20rem clamp(14rem,2vw,22rem); color: #111; text-decoration: none; font-weight: 800; font-size: clamp(13rem,1.4vw,18rem); text-transform: uppercase; border-right: 1px solid #111; transition: background 0.15s, color 0.15s; }
.sw__item:last-child { border-right: 0; }
.sw__item b { color: var(--red); }
.sw__item:hover { background: #111; color: #f4f4f2; }
.sw__item:hover b { color: #fff; }
.sw__item:focus-visible { outline: 3px solid var(--red); outline-offset: -3px; }
@media (max-width: 720px) { .sw__nav { grid-template-columns: 1fr 1fr; } .sw__head span:nth-child(2) { display: none; } }
</style>
