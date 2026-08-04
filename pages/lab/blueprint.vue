<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Blueprint — Theme Lab', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&display=swap' }] })
</script>

<template>
  <div class="bp">
    <div class="bp__grid" aria-hidden="true" />
    <NuxtLink to="/lab" class="bp__lab">◂ lab</NuxtLink>
    <div class="bp__corner bp__corner--tl">A</div>
    <div class="bp__corner bp__corner--tr">01</div>
    <div class="bp__corner bp__corner--bl">SCALE 1:1</div>
    <div class="bp__corner bp__corner--br">REV. 07 / 2026</div>

    <main class="bp__sheet">
      <p class="bp__tag">FIG. 1 — PORTFOLIO ASSEMBLY</p>
      <h1 class="bp__title">Naveen Jose</h1>
      <div class="bp__dim">
        <span class="bp__dim-line" />
        <span class="bp__dim-txt">INSTRUCTIONAL DESIGNER · WHO CODES</span>
        <span class="bp__dim-line" />
      </div>
      <p class="bp__note">Every learning experience, drafted to spec — measured, annotated, and built to hold.</p>
      <ol class="bp__parts">
        <NuxtLink v-for="it in LAB_NAV" :key="it.href" :to="it.href" class="bp__part">
          <span class="bp__part-n">{{ it.n }}</span>
          <span class="bp__part-body">
            <span class="bp__part-label">{{ it.label }}</span>
            <span class="bp__part-desc">{{ it.desc }}</span>
          </span>
          <span class="bp__part-arrow">→</span>
        </NuxtLink>
      </ol>
    </main>
  </div>
</template>

<style scoped>
.bp { position: fixed; inset: 0; overflow-y: auto; background: #0a2a5e; color: #cfe3ff; font-family: 'IBM Plex Mono', monospace; }
.bp__grid { position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 100rem 100rem, 100rem 100rem, 20rem 20rem, 20rem 20rem; }
.bp__lab { position: fixed; top: 16rem; left: 20rem; z-index: 10; color: #cfe3ff; text-decoration: none; font-size: 12rem; }
.bp__corner { position: fixed; z-index: 5; font-size: 11rem; letter-spacing: 0.12em; opacity: 0.7; border: 1px solid rgba(207,227,255,0.5); padding: 4rem 8rem; }
.bp__corner--tl { top: 14rem; left: 74rem; }
.bp__corner--tr { top: 14rem; right: 18rem; }
.bp__corner--bl { bottom: 14rem; left: 18rem; }
.bp__corner--br { bottom: 14rem; right: 18rem; }
.bp__sheet { position: relative; z-index: 2; max-width: 820rem; margin: 0 auto; min-height: 100%; display: flex; flex-direction: column; justify-content: center; padding: clamp(64rem, 12vh, 120rem) clamp(24rem, 5vw, 60rem); }
.bp__tag { font-size: 12rem; letter-spacing: 0.18em; opacity: 0.75; }
.bp__title { font-size: clamp(48rem, 10vw, 120rem); font-weight: 600; letter-spacing: -0.01em; margin: 10rem 0 20rem; color: #fff; }
.bp__dim { display: flex; align-items: center; gap: 12rem; margin-bottom: 22rem; }
.bp__dim-line { flex: 1; height: 1px; background: repeating-linear-gradient(90deg, #6fa8ff 0 8rem, transparent 8rem 14rem); position: relative; }
.bp__dim-line::before, .bp__dim-line::after { content: ''; position: absolute; top: -4rem; width: 1px; height: 9rem; background: #6fa8ff; }
.bp__dim-line::before { left: 0; }
.bp__dim-line::after { right: 0; }
.bp__dim-txt { font-size: 11rem; letter-spacing: 0.14em; color: #6fa8ff; white-space: nowrap; }
.bp__note { max-width: 52ch; font-size: 14rem; line-height: 1.6; opacity: 0.85; margin: 0 0 34rem; }
.bp__parts { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.bp__part { display: flex; align-items: center; gap: 18rem; padding: 16rem 6rem; border-top: 1px dashed rgba(207,227,255,0.35); text-decoration: none; color: #cfe3ff; transition: background 0.16s, padding-left 0.16s; }
.bp__part:last-child { border-bottom: 1px dashed rgba(207,227,255,0.35); }
.bp__part:hover { background: rgba(111,168,255,0.12); padding-left: 16rem; }
.bp__part:focus-visible { outline: 1px solid #6fa8ff; }
.bp__part-n { font-size: 13rem; color: #6fa8ff; width: 28rem; }
.bp__part-body { display: flex; flex-direction: column; gap: 3rem; flex: 1; }
.bp__part-label { font-size: 18rem; font-weight: 600; color: #fff; }
.bp__part-desc { font-size: 12rem; opacity: 0.7; }
.bp__part-arrow { font-size: 18rem; color: #6fa8ff; }
</style>
