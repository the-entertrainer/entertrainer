<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'G07 — Neon Grid', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;600&display=swap' }] })
const K = '// NAVEEN JOSE'
const H = `SIGNAL<br>OVER NOISE`
const S = 'Training that cuts through.'
</script>

<template>
  <LabGlass backdrop="rings" :colors="['#0A0714','#FF2E88','#22D3EE']"
            tint="#FFE1F0" :refraction="1.3" :aberration="0.016"
            :specular="1.8" :edge="20" :vignette="0.46" ink="#FDEFF7">
    <NuxtLink to="/lab" class="back">◂ lab</NuxtLink>
    <div class="wrap">
      <header class="hero"><p class="kick">{{K}}</p><h1 class="title" v-html="H"></h1><p class="sub">{{S}}</p></header>
      <nav class="tiles">
        <NuxtLink v-for="(it, i) in LAB_NAV" :key="it.href" :to="it.href" class="card" data-glass
                  :data-lift="0.35 + i * 0.14" data-tint="0.12">
          <span class="n">{{ it.n }}</span>
          <span class="l">{{ it.label }}</span>
          <span class="d">{{ it.desc }}</span>
        </NuxtLink></nav>
    </div>
  </LabGlass>
</template>

<style scoped>
.back{position:fixed;top:18rem;left:20rem;z-index:40;color:currentColor;opacity:.55;text-decoration:none;font-family:'Inter',sans-serif;font-size:12rem}
.wrap{position:absolute;inset:0;display:grid;padding:72rem clamp(20rem,5vw,72rem) 82rem;font-family:'Inter',sans-serif}
.hero{max-width:60ch}
.kick{margin:0 0 12rem;font-size:11rem;letter-spacing:.24em;text-transform:uppercase;opacity:.6}
.title{font-family:'Space Grotesk',sans-serif}
.title em{font-style:italic;opacity:.82}
.sub{margin:16rem 0 0;font-size:14rem;line-height:1.55;opacity:.68;max-width:46ch}
.n{font-size:10.5rem;letter-spacing:.16em;opacity:.6}
.l{font-family:'Space Grotesk',sans-serif}
.d{font-size:11.5rem;line-height:1.45;opacity:.62}
*:focus-visible{outline:2px solid currentColor;outline-offset:4px}
.wrap{align-content:center;gap:32rem}.title{font-size:clamp(40rem,8vw,108rem);line-height:0.9;letter-spacing:-0.035em;margin:0}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(190rem,1fr));gap:8rem}
.card{display:grid;align-content:end;gap:5rem;min-height:172rem;padding:18rem;border-radius:14rem;text-decoration:none;color:inherit;transition:transform 300ms cubic-bezier(.2,.9,.2,1)}
.card:hover{transform:translateY(-7rem)}.card .l{font-size:20rem;font-weight:700}
@media(prefers-reduced-motion:reduce){*{transition:none !important}}
</style>
