<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'G08 — Dune', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400&family=Inter:wght@400;600&display=swap' }] })
const K = 'Since the hotel floor'
const H = `Layers,<br>laid down.`
const S = 'Hospitality to L&D — the long way round.'
</script>

<template>
  <LabGlass backdrop="strata" :colors="['#E8D9C2','#C08552','#5E3A22']"
            tint="#FFF6EA" :refraction="0.95" :aberration="0.005"
            :specular="1" :edge="26" :vignette="0.18" ink="#2B1A0E">
    <NuxtLink to="/lab" class="back">◂ lab</NuxtLink>
    <div class="wrap">
      <header class="hero"><p class="kick">{{K}}</p><h1 class="title" v-html="H"></h1><p class="sub">{{S}}</p></header>
      <nav class="stack">
        <NuxtLink v-for="(it, i) in LAB_NAV" :key="it.href" :to="it.href" class="row" data-glass
                  :data-lift="0.3 + i * 0.18" data-tint="0.10">
          <span class="n">{{ it.n }}</span><span class="l">{{ it.label }}</span>
          <span class="d">{{ it.desc }}</span><span class="go" aria-hidden="true">→</span>
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
.title{font-family:'Fraunces',serif}
.title em{font-style:italic;opacity:.82}
.sub{margin:1rem 0 0;font-size:0.875rem;line-height:1.55;opacity:.68;max-width:46ch}
.n{font-size:0.75rem;letter-spacing:.16em;opacity:.6}
.l{font-family:'Fraunces',serif}
.d{font-size:0.75rem;line-height:1.45;opacity:.62}
*:focus-visible{outline:2px solid currentColor;outline-offset:4px}
.wrap{align-content:center;gap:1.875rem}.title{font-size:clamp(2.625rem,8vw,6.25rem);line-height:0.92;letter-spacing:-0.03em;margin:0}
.stack{display:grid;gap:0.5rem;max-width:51.25rem}
.row{position:relative;display:grid;grid-template-columns:2.75rem 1fr auto;grid-template-areas:'n l g' '. d .';gap:0.125rem 0.875rem;align-items:center;padding:1.25rem 1.375rem;border-radius:1.125rem;text-decoration:none;color:inherit;transition:transform 340ms cubic-bezier(.2,.9,.2,1)}
.row:hover{transform:translateX(0.5rem)}.row .n{grid-area:n}.row .l{grid-area:l;font-size:1.3125rem;font-weight:600}.row .d{grid-area:d;opacity:.62}.row .go{grid-area:g}
@media(prefers-reduced-motion:reduce){*{transition:none !important}}
</style>
