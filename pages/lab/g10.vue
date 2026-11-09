<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'G10 — Graphite', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap' }] })
const K = 'NAVEEN JOSE'
const H = `Quietly<br>excellent.`
const S = 'Instructional design without the theatre.'
</script>

<template>
  <LabGlass backdrop="spotlight" :colors="['#17181A','#4A4E57','#0B0C0D']"
            tint="#EDEFF2" :refraction="0.8" :aberration="0.003"
            :specular="1.7" :edge="14" :vignette="0.5" ink="#F0F2F5">
    <NuxtLink to="/lab" class="back">◂ lab</NuxtLink>
    <div class="wrap">
      <header class="hero"><p class="kick">{{K}}</p><h1 class="title" v-html="H"></h1><p class="sub">{{S}}</p></header>
      <nav class="line" data-glass data-lift="0.7" data-tint="0.04">
        <NuxtLink v-for="it in LAB_NAV" :key="it.href" :to="it.href" class="lineItem">{{ it.label }}</NuxtLink>
      </nav>
    </div>
  </LabGlass>
</template>

<style scoped>
.back{position:fixed;top:1.125rem;left:1.25rem;z-index:40;color:currentColor;opacity:.55;text-decoration:none;font-family:'Inter',sans-serif;font-size:0.75rem}
.wrap{position:absolute;inset:0;display:grid;padding:4.5rem clamp(1.25rem,5vw,4.5rem) 5.125rem;font-family:'Inter',sans-serif}
.hero{max-width:60ch}
.kick{margin:0 0 0.75rem;font-size:0.75rem;letter-spacing:.24em;text-transform:uppercase;opacity:.6}
.title{font-family:'Inter',sans-serif}
.title em{font-style:italic;opacity:.82}
.sub{margin:1rem 0 0;font-size:0.875rem;line-height:1.55;opacity:.68;max-width:46ch}
.n{font-size:0.75rem;letter-spacing:.16em;opacity:.6}
.l{font-family:'Inter',sans-serif}
.d{font-size:0.75rem;line-height:1.45;opacity:.62}
*:focus-visible{outline:2px solid currentColor;outline-offset:4px}
.wrap{align-content:center;gap:2.75rem}.title{font-size:clamp(2.5rem,7.6vw,6.375rem);line-height:0.94;letter-spacing:-0.04em;margin:0;font-weight:800}
.line{display:flex;flex-wrap:wrap;gap:0.125rem;padding:0.5rem;border-radius:62.4375rem}
.lineItem{padding:0.875rem 1.625rem;border-radius:62.4375rem;text-decoration:none;color:inherit;font-size:0.875rem;font-weight:600;transition:background 240ms}
.lineItem:hover{background:rgba(255,255,255,0.12)}
@media(prefers-reduced-motion:reduce){*{transition:none !important}}
</style>
