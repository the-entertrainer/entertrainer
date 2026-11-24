<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'G05 — Primary', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Archivo:wght@700;900&family=Inter:wght@400;600&display=swap' }] })
const K = 'ENTERTRAINER'
const H = `FOUR<br>WAYS IN`
const S = 'Pick a door. They all lead somewhere useful.'
</script>

<template>
  <LabGlass backdrop="grid" :colors="['#F2F1EC','#1B4FE0','#E5352B']"
            tint="#FFFFFF" :refraction="1" :aberration="0.007"
            :specular="1.2" :edge="18" :vignette="0.14" ink="#0C0C0C">
    <NuxtLink to="/lab" class="back">◂ lab</NuxtLink>
    <div class="wrap">
      <header class="hero"><p class="kick">{{K}}</p><h1 class="title" v-html="H"></h1><p class="sub">{{S}}</p></header>
      <nav class="blocks">
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
.title{font-family:'Archivo',sans-serif}
.title em{font-style:italic;opacity:.82}
.sub{margin:16rem 0 0;font-size:14rem;line-height:1.55;opacity:.68;max-width:46ch}
.n{font-size:10.5rem;letter-spacing:.16em;opacity:.6}
.l{font-family:'Archivo',sans-serif}
.d{font-size:11.5rem;line-height:1.45;opacity:.62}
*:focus-visible{outline:2px solid currentColor;outline-offset:4px}
.wrap{align-content:center;gap:34rem}.title{font-size:clamp(44rem,9vw,124rem);line-height:0.86;letter-spacing:-0.04em;margin:0}
.blocks{display:grid;grid-template-columns:repeat(auto-fit,minmax(200rem,1fr));gap:10rem}
.card{display:grid;align-content:end;gap:5rem;min-height:180rem;padding:20rem;border-radius:8rem;text-decoration:none;color:inherit;transition:transform 320ms cubic-bezier(.2,.9,.2,1)}
.card:hover{transform:translate(-4rem,-4rem)}.card .l{font-size:21rem;font-weight:900;text-transform:uppercase}
@media(prefers-reduced-motion:reduce){*{transition:none !important}}
</style>
