<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Risograph — Theme Lab', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Space+Mono&display=swap' }] })
</script>

<template>
  <div class="rs">
    <div class="rs__halftone" aria-hidden="true" />
    <div class="rs__grain" aria-hidden="true" />
    <NuxtLink to="/lab" class="rs__lab">◂ lab</NuxtLink>
    <main class="rs__main">
      <p class="rs__kick">PRINTED IN TWO INKS · NO. 01 · GURUGRAM</p>
      <h1 class="rs__name" data-text="NAVEEN JOSE">NAVEEN JOSE</h1>
      <p class="rs__sub">Instructional designer. I design learning, build the tools, and dare new tech.</p>
      <nav class="rs__nav">
        <NuxtLink v-for="(it, i) in LAB_NAV" :key="it.href" :to="it.href" class="rs__chip">{{ String(i+1).padStart(2,'0') }} · {{ it.label }}</NuxtLink>
      </nav>
    </main>
  </div>
</template>

<style scoped>
.rs { position: fixed; inset: 0; overflow: hidden; background: #f3ead4; color: #16233f; font-family: 'Space Mono', monospace; display: grid; place-items: center; --pink: #ff3d9a; --blue: #253ad6; }
.rs__halftone { position: absolute; inset: 0; pointer-events: none; opacity: 0.28; mix-blend-mode: multiply;
  background-image: radial-gradient(var(--pink) 22%, transparent 23%), radial-gradient(var(--blue) 22%, transparent 23%);
  background-size: 12px 12px; background-position: 0 0, 6px 6px; }
.rs__grain { position: absolute; inset: 0; pointer-events: none; opacity: 0.5; mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
.rs__lab { position: fixed; top: 16rem; right: 20rem; z-index: 20; color: var(--blue); text-decoration: none; font-size: 12rem; }
.rs__main { position: relative; z-index: 3; text-align: center; padding: 0 24rem; max-width: 900rem; }
.rs__kick { color: var(--pink); font-size: 12rem; letter-spacing: 0.16em; margin-bottom: 18rem; }
.rs__name { position: relative; font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: clamp(52rem, 13vw, 180rem); line-height: 0.9; letter-spacing: -0.03em; margin: 0; color: var(--blue); }
.rs__name::before { content: attr(data-text); position: absolute; left: 6rem; top: 5rem; color: var(--pink); mix-blend-mode: multiply; z-index: -1; transition: transform 0.2s ease; }
.rs__name:hover::before { transform: translate(-10rem, -6rem); }
.rs__sub { font-size: 14rem; line-height: 1.6; margin: 22rem auto 30rem; max-width: 44ch; }
.rs__nav { display: flex; flex-wrap: wrap; gap: 12rem; justify-content: center; }
.rs__chip { font-size: 13rem; font-weight: 700; color: #f3ead4; text-decoration: none; padding: 11rem 18rem; background: var(--blue); transition: background 0.15s, transform 0.15s; box-shadow: 4rem 4rem 0 var(--pink); }
.rs__chip:hover { background: var(--pink); box-shadow: 4rem 4rem 0 var(--blue); transform: translate(-2rem,-2rem); }
.rs__chip:focus-visible { outline: 2px solid var(--blue); outline-offset: 3px; }
</style>
