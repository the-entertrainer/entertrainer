<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'G15 — Ember', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;600&display=swap' }] })
const K = 'Naveen Jose'
const H = `Make them<br><em>feel it.</em>`
const S = 'Training people remember three weeks later.'
</script>

<template>
  <LabGlass backdrop="bokeh" :colors="['#0A0505','#8C1C13','#F04E23']"
            tint="#FFD9C7" :refraction="1.35" :aberration="0.015"
            :specular="1.7" :edge="30" :vignette="0.5" ink="#FFEDE4">
    <NuxtLink to="/lab" class="back">◂ lab</NuxtLink>
    <div class="wrap">
      <div class="plate" data-glass data-lift="0.85" data-tint="0.10">
        <p class="kick">{{K}}</p><h1 class="title" v-html="H"></h1><p class="sub">{{S}}</p>
        <nav class="inline">
          <NuxtLink v-for="it in LAB_NAV" :key="it.href" :to="it.href" class="chip">{{ it.label }}</NuxtLink>
        </nav>
      </div>
    </div>
  </LabGlass>
</template>

<style scoped>
.back{position:fixed;top:18rem;left:20rem;z-index:40;color:currentColor;opacity:.55;text-decoration:none;font-family:'Inter',sans-serif;font-size:12rem}
.wrap{position:absolute;inset:0;display:grid;padding:72rem clamp(20rem,5vw,72rem) 82rem;font-family:'Inter',sans-serif}
.hero{max-width:60ch}
.kick{margin:0 0 12rem;font-size:11rem;letter-spacing:.24em;text-transform:uppercase;opacity:.6}
.title{font-family:'Instrument Serif',serif}
.title em{font-style:italic;opacity:.82}
.sub{margin:16rem 0 0;font-size:14rem;line-height:1.55;opacity:.68;max-width:46ch}
.n{font-size:10.5rem;letter-spacing:.16em;opacity:.6}
.l{font-family:'Instrument Serif',serif}
.d{font-size:11.5rem;line-height:1.45;opacity:.62}
*:focus-visible{outline:2px solid currentColor;outline-offset:4px}
.wrap{align-content:center;justify-items:center}
.plate{display:grid;justify-items:center;text-align:center;gap:14rem;padding:clamp(34rem,5vw,64rem);border-radius:32rem;width:min(880rem,100%)}
.title{font-size:clamp(40rem,7.4vw,96rem);line-height:0.94;letter-spacing:-0.03em;margin:0}
.inline{display:flex;flex-wrap:wrap;gap:8rem;justify-content:center;margin-top:10rem}
.chip{padding:11rem 20rem;border-radius:999rem;border:1px solid currentColor;text-decoration:none;color:inherit;font-size:13rem;opacity:.8;transition:opacity 240ms,transform 240ms}
.chip:hover{opacity:1;transform:translateY(-3rem)}
@media(prefers-reduced-motion:reduce){*{transition:none !important}}
</style>
