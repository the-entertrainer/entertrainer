<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'G06 — Abyss', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;600&display=swap' }] })
const K = 'Naveen Jose'
const H = `Depth,<br><em>on purpose.</em>`
const S = 'Instructional design that goes past the surface.'
</script>

<template>
  <LabGlass backdrop="bokeh" :colors="['#06131A','#0E5E6B','#1FA6A0']"
            tint="#CFF6F2" :refraction="1.25" :aberration="0.012"
            :specular="1.6" :edge="28" :vignette="0.42" ink="#DFF7F4">
    <NuxtLink to="/lab" class="back">◂ lab</NuxtLink>
    <div class="wrap">
      <header class="hero"><p class="kick">{{K}}</p><h1 class="title" v-html="H"></h1><p class="sub">{{S}}</p></header>
      <nav class="orbs">
        <NuxtLink v-for="(it, i) in LAB_NAV" :key="it.href" :to="it.href" class="orb" data-glass
                  :data-lift="0.5 + i * 0.12" data-tint="0.18">
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
.title{font-family:'Instrument Serif',serif}
.title em{font-style:italic;opacity:.82}
.sub{margin:16rem 0 0;font-size:14rem;line-height:1.55;opacity:.68;max-width:46ch}
.n{font-size:10.5rem;letter-spacing:.16em;opacity:.6}
.l{font-family:'Instrument Serif',serif}
.d{font-size:11.5rem;line-height:1.45;opacity:.62}
*:focus-visible{outline:2px solid currentColor;outline-offset:4px}
.wrap{align-content:center;gap:38rem}.title{font-size:clamp(44rem,9vw,120rem);line-height:0.9;letter-spacing:-0.03em;margin:0}
.orbs{display:flex;flex-wrap:wrap;gap:14rem;justify-content:flex-start}
.orb{display:grid;place-content:center;gap:4rem;text-align:center;width:154rem;height:154rem;border-radius:50%;text-decoration:none;color:inherit;transition:transform 420ms cubic-bezier(.2,.9,.2,1)}
.orb:hover{transform:translateY(-10rem) scale(1.04)}.orb .l{font-size:16rem;font-weight:600;line-height:1.15}
@media(max-width:640px){.orb{width:120rem;height:120rem}}
@media(prefers-reduced-motion:reduce){*{transition:none !important}}
</style>
