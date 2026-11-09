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
.back{position:fixed;top:1.125rem;left:1.25rem;z-index:40;color:currentColor;opacity:.55;text-decoration:none;font-family:'Inter',sans-serif;font-size:0.75rem}
.wrap{position:absolute;inset:0;display:grid;padding:4.5rem clamp(1.25rem,5vw,4.5rem) 5.125rem;font-family:'Inter',sans-serif}
.hero{max-width:60ch}
.kick{margin:0 0 0.75rem;font-size:0.75rem;letter-spacing:.24em;text-transform:uppercase;opacity:.6}
.title{font-family:'Archivo',sans-serif}
.title em{font-style:italic;opacity:.82}
.sub{margin:1rem 0 0;font-size:0.875rem;line-height:1.55;opacity:.68;max-width:46ch}
.n{font-size:0.75rem;letter-spacing:.16em;opacity:.6}
.l{font-family:'Archivo',sans-serif}
.d{font-size:0.75rem;line-height:1.45;opacity:.62}
*:focus-visible{outline:2px solid currentColor;outline-offset:4px}
.wrap{align-content:center;gap:2.125rem}.title{font-size:clamp(2.75rem,9vw,7.75rem);line-height:0.86;letter-spacing:-0.04em;margin:0}
.blocks{display:grid;grid-template-columns:repeat(auto-fit,minmax(12.5rem,1fr));gap:0.625rem}
.card{display:grid;align-content:end;gap:0.3125rem;min-height:11.25rem;padding:1.25rem;border-radius:0.5rem;text-decoration:none;color:inherit;transition:transform 320ms cubic-bezier(.2,.9,.2,1)}
.card:hover{transform:translate(-0.25rem,-0.25rem)}.card .l{font-size:1.3125rem;font-weight:900;text-transform:uppercase}
@media(prefers-reduced-motion:reduce){*{transition:none !important}}
</style>
