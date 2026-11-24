<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'G13 — Copper', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600&display=swap' }] })
const K = 'FORGED, NOT ASSEMBLED'
const H = `BUILT<br>BY HAND`
const S = 'Every course, every tool, end to end.'
</script>

<template>
  <LabGlass backdrop="rings" :colors="['#1A0F0A','#C87137','#F0C088']"
            tint="#FFE9D2" :refraction="1.05" :aberration="0.008"
            :specular="1.5" :edge="22" :vignette="0.4" ink="#FBEDDD">
    <NuxtLink to="/lab" class="back">◂ lab</NuxtLink>
    <div class="wrap">
      <header class="hero"><p class="kick">{{K}}</p><h1 class="title" v-html="H"></h1><p class="sub">{{S}}</p></header>
      <nav class="arc">
        <NuxtLink v-for="(it, i) in LAB_NAV" :key="it.href" :to="it.href" class="arcItem" data-glass
                  :data-lift="0.4 + i * 0.14" data-tint="0.12"
                  :style="{ transform: 'translateY(' + (i === 1 || i === 2 ? -22 : 0) + 'rem)' }">
          <span class="n">{{ it.n }}</span><span class="l">{{ it.label }}</span>
        </NuxtLink>
      </nav>
    </div>
  </LabGlass>
</template>

<style scoped>
.back{position:fixed;top:18rem;left:20rem;z-index:40;color:currentColor;opacity:.55;text-decoration:none;font-family:'Inter',sans-serif;font-size:12rem}
.wrap{position:absolute;inset:0;display:grid;padding:72rem clamp(20rem,5vw,72rem) 82rem;font-family:'Inter',sans-serif}
.hero{max-width:60ch}
.kick{margin:0 0 12rem;font-size:11rem;letter-spacing:.24em;text-transform:uppercase;opacity:.6}
.title{font-family:'Anton',sans-serif}
.title em{font-style:italic;opacity:.82}
.sub{margin:16rem 0 0;font-size:14rem;line-height:1.55;opacity:.68;max-width:46ch}
.n{font-size:10.5rem;letter-spacing:.16em;opacity:.6}
.l{font-family:'Anton',sans-serif}
.d{font-size:11.5rem;line-height:1.45;opacity:.62}
*:focus-visible{outline:2px solid currentColor;outline-offset:4px}
.wrap{align-content:center;gap:38rem}.title{font-size:clamp(44rem,9.4vw,132rem);line-height:0.85;letter-spacing:-0.02em;margin:0}
.arc{display:flex;flex-wrap:wrap;gap:12rem;justify-content:center;align-items:flex-end}
.arcItem{display:grid;gap:4rem;place-content:center;text-align:center;width:172rem;height:132rem;border-radius:20rem;text-decoration:none;color:inherit;transition:transform 400ms cubic-bezier(.2,.9,.2,1)}
.arcItem:hover{transform:translateY(-12rem)}.arcItem .l{font-size:17rem;font-weight:600}
@media(max-width:640px){.arcItem{width:44%;height:104rem;transform:none !important}}
@media(prefers-reduced-motion:reduce){*{transition:none !important}}
</style>
