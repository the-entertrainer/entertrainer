<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'G09 — Verdant', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;600&display=swap' }] })
const K = 'Naveen Jose'
const H = `Growth<br><em>you can measure.</em>`
const S = 'Completion rates, behaviour change, and the evidence.'
</script>

<template>
  <LabGlass backdrop="mesh" :colors="['#0B2418','#37B36B','#0A1410']"
            tint="#DDF7E6" :refraction="1.1" :aberration="0.009"
            :specular="1.35" :edge="22" :vignette="0.36" ink="#E7F8EE">
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
.back{position:fixed;top:1.125rem;left:1.25rem;z-index:40;color:currentColor;opacity:.55;text-decoration:none;font-family:'Inter',sans-serif;font-size:0.75rem}
.wrap{position:absolute;inset:0;display:grid;padding:4.5rem clamp(1.25rem,5vw,4.5rem) 5.125rem;font-family:'Inter',sans-serif}
.hero{max-width:60ch}
.kick{margin:0 0 0.75rem;font-size:0.75rem;letter-spacing:.24em;text-transform:uppercase;opacity:.6}
.title{font-family:'Instrument Serif',serif}
.title em{font-style:italic;opacity:.82}
.sub{margin:1rem 0 0;font-size:0.875rem;line-height:1.55;opacity:.68;max-width:46ch}
.n{font-size:0.75rem;letter-spacing:.16em;opacity:.6}
.l{font-family:'Instrument Serif',serif}
.d{font-size:0.75rem;line-height:1.45;opacity:.62}
*:focus-visible{outline:2px solid currentColor;outline-offset:4px}
.wrap{align-content:center;justify-items:center}
.plate{display:grid;justify-items:center;text-align:center;gap:0.875rem;padding:clamp(2.125rem,5vw,4rem);border-radius:2rem;width:min(55rem,100%)}
.title{font-size:clamp(2.5rem,7.4vw,6rem);line-height:0.94;letter-spacing:-0.03em;margin:0}
.inline{display:flex;flex-wrap:wrap;gap:0.5rem;justify-content:center;margin-top:0.625rem}
.chip{padding:0.6875rem 1.25rem;border-radius:62.4375rem;border:1px solid currentColor;text-decoration:none;color:inherit;font-size:0.8125rem;opacity:.8;transition:opacity 240ms,transform 240ms}
.chip:hover{opacity:1;transform:translateY(-0.1875rem)}
@media(prefers-reduced-motion:reduce){*{transition:none !important}}
</style>
