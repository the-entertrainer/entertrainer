<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Editorial Noir — Theme Lab', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500&display=swap' }] })
</script>

<template>
  <div class="no">
    <NuxtLink to="/lab" class="no__lab">◂ lab</NuxtLink>
    <figure class="no__photo"><img src="/about-me.png" alt="" /></figure>
    <div class="no__copy">
      <p class="no__eyebrow">Naveen Jose — Issue Nº 01</p>
      <h1 class="no__name">The<br><em>Instructional</em><br>Designer</h1>
      <p class="no__deck">A quiet study in designing learning that people actually want to finish — and building the tools to deliver it.</p>
      <ol class="no__nav">
        <li v-for="(it, i) in LAB_NAV" :key="it.href">
          <NuxtLink :to="it.href"><span class="no__n">{{ String(i + 1).padStart(2, '0') }}</span><span class="no__ll">{{ it.label }}</span><span class="no__ar">→</span></NuxtLink>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.no { position: fixed; inset: 0; overflow: hidden; background: #f2efe9; color: #14110e; display: grid; grid-template-columns: 1fr 1fr; font-family: 'Inter', sans-serif; }
.no__lab { position: fixed; top: 16rem; right: 20rem; z-index: 20; color: #14110e; text-decoration: none; font-size: 12rem; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.6; }
.no__photo { grid-column: 1; margin: 0; height: 100%; overflow: hidden; }
.no__photo img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; filter: grayscale(1) contrast(1.05); }
.no__copy { grid-column: 2; display: flex; flex-direction: column; justify-content: center; padding: 0 clamp(24rem, 5vw, 80rem); }
.no__eyebrow { font-size: 11rem; letter-spacing: 0.24em; text-transform: uppercase; opacity: 0.55; }
.no__name { font-family: 'Playfair Display', serif; font-weight: 400; font-size: clamp(44rem, 6vw, 100rem); line-height: 0.98; letter-spacing: -0.01em; margin: 18rem 0 0; }
.no__name em { font-style: italic; }
.no__deck { font-size: 15rem; line-height: 1.6; opacity: 0.7; max-width: 34ch; margin: 24rem 0 34rem; }
.no__nav { list-style: none; margin: 0; padding: 0; border-top: 1px solid rgba(20,17,14,0.15); max-width: 420rem; }
.no__nav a { display: flex; align-items: baseline; gap: 16rem; padding: 16rem 0; text-decoration: none; color: #14110e; border-bottom: 1px solid rgba(20,17,14,0.15); transition: padding-left 0.3s ease; }
.no__nav a:hover { padding-left: 12rem; }
.no__n { font-family: 'Playfair Display', serif; font-size: 14rem; opacity: 0.5; }
.no__ll { font-family: 'Playfair Display', serif; font-style: italic; font-size: clamp(22rem, 2.4vw, 32rem); margin-right: auto; }
.no__ar { opacity: 0.5; }
.no__nav a:focus-visible { outline: 2px solid #14110e; outline-offset: 3px; }
@media (max-width: 820px) { .no { grid-template-columns: 1fr; } .no__photo { grid-column: 1; grid-row: 1; height: 40vh; } .no__copy { grid-column: 1; grid-row: 2; padding: 24rem clamp(20rem,6vw,40rem); justify-content: flex-start; } }
</style>
