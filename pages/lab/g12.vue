<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'G12 — Dusk', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400&family=Inter:wght@400;600&display=swap' }] })
const K = 'Naveen Jose'
const H = `After hours,<br><em>still building.</em>`
const S = 'The tools I wished existed, so I made them.'
</script>

<template>
  <LabGlass backdrop="aurora" :colors="['#1A1036','#8B5CF6','#F0A6C8']"
            tint="#EDE4FF" :refraction="1.15" :aberration="0.01"
            :specular="1.45" :edge="26" :vignette="0.34" ink="#F2ECFF">
    <NuxtLink to="/lab" class="back">◂ lab</NuxtLink>
    <div class="wrap">
      <header class="hero"><p class="kick">{{K}}</p><h1 class="title" v-html="H"></h1><p class="sub">{{S}}</p></header>
      <nav class="stagger">
        <NuxtLink v-for="(it, i) in LAB_NAV" :key="it.href" :to="it.href" class="card" data-glass
                  :data-lift="0.35 + i * 0.14" data-tint="0.12" :style="{ marginTop: (i % 2 ? 30 : 0) + 'rem' }">
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
.title{font-family:'Fraunces',serif}
.title em{font-style:italic;opacity:.82}
.sub{margin:16rem 0 0;font-size:14rem;line-height:1.55;opacity:.68;max-width:46ch}
.n{font-size:10.5rem;letter-spacing:.16em;opacity:.6}
.l{font-family:'Fraunces',serif}
.d{font-size:11.5rem;line-height:1.45;opacity:.62}
*:focus-visible{outline:2px solid currentColor;outline-offset:4px}
.wrap{align-content:center;gap:34rem}.title{font-size:clamp(42rem,8.4vw,112rem);line-height:0.9;letter-spacing:-0.03em;margin:0}
.stagger{display:grid;grid-template-columns:repeat(auto-fit,minmax(180rem,1fr));gap:12rem;align-items:start}
.card{display:grid;align-content:end;gap:5rem;min-height:196rem;padding:20rem;border-radius:24rem;text-decoration:none;color:inherit;transition:transform 400ms cubic-bezier(.2,.9,.2,1)}
.card:hover{transform:translateY(-9rem)}.card .l{font-size:21rem;font-weight:600}
@media(max-width:640px){.stagger>*{margin-top:0 !important}}
@media(prefers-reduced-motion:reduce){*{transition:none !important}}
</style>
