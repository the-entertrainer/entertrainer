<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Terminal — Theme Lab', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap' }] })

const BOOT = [
  'entertrainer.os v4.2 — booting…',
  'user: naveen jose',
  'role: instructional designer (who codes)',
  'skills: design · build · dare new tech',
  'status: #opentowork ✓',
  '',
  'select a directory:'
]
const shown = ref<string[]>([])
const showNav = ref(false)
let reduce = false
onMounted(() => {
  reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  if (reduce) { shown.value = [...BOOT]; showNav.value = true; return }
  let i = 0
  const step = () => {
    if (i >= BOOT.length) { showNav.value = true; return }
    shown.value.push(BOOT[i]); i++
    setTimeout(step, 260)
  }
  step()
})
</script>

<template>
  <div class="tm">
    <div class="tm__scan" aria-hidden="true" />
    <NuxtLink to="/lab" class="tm__lab">◂ lab</NuxtLink>
    <div class="tm__screen">
      <pre class="tm__log"><span v-for="(l, i) in shown" :key="i" class="tm__line">{{ l ? '> ' + l : '' }}
</span></pre>
      <nav v-if="showNav" class="tm__nav">
        <NuxtLink v-for="(it, i) in LAB_NAV" :key="it.href" :to="it.href" class="tm__cmd">$ cd ./{{ it.href.replace('/','') }}<span class="tm__desc"># {{ it.label }}</span></NuxtLink>
      </nav>
      <span class="tm__caret" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
.tm { position: fixed; inset: 0; overflow: hidden; background: #050a05; color: #38ff8c; font-family: 'IBM Plex Mono', monospace; text-shadow: 0 0 6px rgba(56,255,140,0.6); }
.tm__scan { position: absolute; inset: 0; pointer-events: none; z-index: 5; background: repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.28) 2px 4px); animation: tm-flick 4s steps(60) infinite; }
@keyframes tm-flick { 0%,100% { opacity: 0.55 } 50% { opacity: 0.72 } }
.tm__lab { position: fixed; top: 14rem; right: 18rem; z-index: 10; color: #38ff8c; text-decoration: none; font-size: 12rem; }
.tm__screen { position: relative; z-index: 2; max-width: 760rem; margin: 0 auto; padding: calc(60rem + 6vh) clamp(20rem,5vw,40rem); font-size: clamp(14rem, 1.7vw, 18rem); line-height: 1.9; }
.tm__log { margin: 0; white-space: pre-wrap; }
.tm__line { display: block; }
.tm__nav { margin-top: 14rem; display: flex; flex-direction: column; gap: 8rem; }
.tm__cmd { color: #eafff0; text-decoration: none; display: flex; gap: 16rem; align-items: baseline; padding: 4rem 8rem; border: 1px solid transparent; transition: background 0.12s, border-color 0.12s; }
.tm__cmd:hover { background: rgba(56,255,140,0.12); border-color: rgba(56,255,140,0.5); }
.tm__desc { color: #38ff8c; opacity: 0.6; }
.tm__cmd:focus-visible { outline: 1px solid #38ff8c; }
.tm__caret { display: inline-block; width: 10rem; height: 18rem; background: #38ff8c; box-shadow: 0 0 8px #38ff8c; animation: tm-b 1s steps(1) infinite; margin-top: 8rem; }
@keyframes tm-b { 50% { opacity: 0 } }
</style>
