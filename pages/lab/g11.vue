<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'G11 — Citrus', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Inter:wght@400;600&display=swap' }] })
const K = 'Fresh out of the kitchen'
const H = `Zesty<br>learning.`
const S = 'Free tools, real case studies, no filler.'
</script>

<template>
  <LabGlass backdrop="waves" :colors="['#FFF8D6','#C6F135','#1B3A1F']"
            tint="#FFFFFF" :refraction="1.2" :aberration="0.011"
            :specular="1.15" :edge="24" :vignette="0.12" ink="#16240F">
    <NuxtLink to="/lab" class="back">◂ lab</NuxtLink>
    <div class="wrap">
      <header class="hero"><p class="kick">{{K}}</p><h1 class="title" v-html="H"></h1><p class="sub">{{S}}</p></header>
      <nav class="pills">
        <NuxtLink v-for="(it, i) in LAB_NAV" :key="it.href" :to="it.href" class="pill" data-glass
                  :data-lift="0.4 + i * 0.15" data-tint="0.14">
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
.title{font-family:'Bricolage Grotesque',sans-serif}
.title em{font-style:italic;opacity:.82}
.sub{margin:16rem 0 0;font-size:14rem;line-height:1.55;opacity:.68;max-width:46ch}
.n{font-size:10.5rem;letter-spacing:.16em;opacity:.6}
.l{font-family:'Bricolage Grotesque',sans-serif}
.d{font-size:11.5rem;line-height:1.45;opacity:.62}
*:focus-visible{outline:2px solid currentColor;outline-offset:4px}
.wrap{align-content:center;gap:34rem}.title{font-size:clamp(42rem,9vw,116rem);line-height:0.9;letter-spacing:-0.035em;margin:0}
.pills{display:flex;flex-wrap:wrap;gap:10rem}
.pill{display:flex;align-items:baseline;gap:10rem;padding:18rem 26rem;border-radius:999rem;text-decoration:none;color:inherit;transition:transform 380ms cubic-bezier(.2,.9,.2,1)}
.pill:hover{transform:translateY(-6rem)}.pill .l{font-size:19rem;font-weight:700}
@media(prefers-reduced-motion:reduce){*{transition:none !important}}
</style>
