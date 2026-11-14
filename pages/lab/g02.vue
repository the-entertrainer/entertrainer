<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'G02 — Monolith', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600&display=swap' }] })
const K = 'NAVEEN JOSE'
const H = `LEARNING<br>THAT LANDS`
const S = 'Instructional design, built end to end.'
</script>

<template>
  <LabGlass backdrop="strata" :colors="['#0B0B0C','#F2F0EA','#141416']"
            tint="#FFFFFF" :refraction="0.85" :aberration="0.004"
            :specular="1.5" :edge="16" :vignette="0.5" ink="#F6F4EE">
    <NuxtLink to="/lab" class="back">◂ lab</NuxtLink>
    <div class="wrap">
      <header class="hero"><p class="kick">{{K}}</p><h1 class="title" v-html="H"></h1><p class="sub">{{S}}</p></header>
      <nav class="slab" data-glass data-lift="0.9" data-tint="0.06">
        <NuxtLink v-for="it in LAB_NAV" :key="it.href" :to="it.href" class="slabItem">
          <span class="n">{{ it.n }}</span><span class="l">{{ it.label }}</span>
        </NuxtLink>
      </nav>
    </div>
  </LabGlass>
</template>

<style scoped>
.back{position:fixed;top:1.125rem;left:1.25rem;z-index:40;color:currentColor;opacity:.55;text-decoration:none;font-family:'Inter',sans-serif;font-size:0.75rem}
.wrap{position:absolute;inset:0;display:grid;padding:4.5rem clamp(1.25rem,5vw,4.5rem) 5.125rem;font-family:'Inter',sans-serif}
.hero{max-width:60ch}
.kick{margin:0 0 0.75rem;font-size:0.75rem;letter-spacing:.24em;text-transform:uppercase;opacity:.6}
.title{font-family:'Anton', Impact, sans-serif}
.title em{font-style:italic;opacity:.82}
.sub{margin:1rem 0 0;font-size:0.875rem;line-height:1.55;opacity:.68;max-width:46ch}
.n{font-size:0.75rem;letter-spacing:.16em;opacity:.6}
.l{font-family:'Anton', Impact, sans-serif}
.d{font-size:0.75rem;line-height:1.45;opacity:.62}
*:focus-visible{outline:2px solid currentColor;outline-offset:4px}
.wrap{align-content:center;gap:2.5rem}.title{font-size:clamp(2.875rem,11vw,9.375rem);line-height:0.84;letter-spacing:-0.02em;margin:0}
.slab{display:grid;grid-template-columns:repeat(4,1fr);border-radius:1.375rem;overflow:hidden}
.slabItem{display:grid;gap:0.25rem;padding:1.625rem 1.25rem;text-decoration:none;color:inherit;border-right:1px solid rgba(255,255,255,0.12)}
.slabItem:last-child{border-right:0}.slabItem .l{font-size:1.1875rem;font-weight:600}
@media(max-width:700px){.slab{grid-template-columns:1fr 1fr}}
@media(prefers-reduced-motion:reduce){*{transition:none !important}}
</style>
