<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'G01 — Prism', robots: 'noindex' })
useHead({ link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;700&display=swap' }] })
</script>

<template>
  <LabGlass backdrop="mesh" :colors="['#3B1E6E', '#E0407A', '#0C0A18']"
            tint="#DCE6FF" :refraction="1.05" :aberration="0.008" :specular="1.25"
            :edge="20" :vignette="0.34" ink="#F4F1FF">
    <NuxtLink to="/lab" class="back">◂ lab</NuxtLink>

    <div class="wrap">
      <header class="hero">
        <p class="eyebrow">Naveen Jose</p>
        <h1 class="title">Learning<br><em>that lands.</em></h1>
      </header>

      <nav class="deck">
        <NuxtLink v-for="(it, i) in LAB_NAV" :key="it.href" :to="it.href"
                  class="card" data-glass :data-lift="0.4 + i * 0.15" data-tint="0.15">
          <span class="card__n">{{ it.n }}</span>
          <span class="card__l">{{ it.label }}</span>
          <span class="card__d">{{ it.desc }}</span>
          <span class="card__go" aria-hidden="true">↗</span>
        </NuxtLink>
      </nav>

      <div class="bar" data-glass data-lift="0.8" data-tint="0.05">
        <span>Instructional design · built end to end</span>
        <a href="mailto:iamnaveenjose@outlook.com" class="bar__cta">Start a project</a>
      </div>
    </div>
  </LabGlass>
</template>

<style scoped>
.back { position: fixed; top: 18rem; left: 20rem; z-index: 40; color: rgba(244,241,255,0.6); text-decoration: none; font-family: 'Inter', sans-serif; font-size: 12rem; }
.wrap { position: absolute; inset: 0; display: grid; align-content: center; gap: clamp(26rem, 4vh, 48rem); padding: 70rem clamp(20rem, 5vw, 72rem) 80rem; }

.eyebrow { margin: 0 0 10rem; font-family: 'Inter', sans-serif; font-size: 11rem; letter-spacing: 0.28em; text-transform: uppercase; opacity: 0.55; }
.title { margin: 0; font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; font-size: clamp(46rem, 9vw, 128rem); line-height: 0.88; letter-spacing: -0.03em; }
.title em { font-style: italic; opacity: 0.82; }

.deck { display: grid; grid-template-columns: repeat(auto-fit, minmax(200rem, 1fr)); gap: 12rem; }
/* The visual surface is the shader's; the element only supplies the box,
   the radius and the type that sits inside it. */
.card { position: relative; display: grid; align-content: end; gap: 5rem; min-height: 168rem;
  padding: 20rem; border-radius: 24rem; text-decoration: none; color: inherit;
  transition: transform 420ms cubic-bezier(.2,.9,.2,1); }
.card:hover { transform: translateY(-8rem); }
.card:focus-visible { outline: 2px solid rgba(255,255,255,0.85); outline-offset: 4px; }
.card__n { font-family: 'Inter', sans-serif; font-size: 10.5rem; letter-spacing: 0.18em; opacity: 0.6; }
.card__l { font-family: 'Instrument Serif', serif; font-size: 27rem; line-height: 1.05; }
.card__d { font-family: 'Inter', sans-serif; font-size: 11.5rem; line-height: 1.45; opacity: 0.66; }
.card__go { position: absolute; top: 18rem; right: 18rem; font-size: 15rem; opacity: 0.5; transition: transform 320ms cubic-bezier(.2,.9,.2,1); }
.card:hover .card__go {  opacity: 1; }

.bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14rem;
  padding: 15rem 20rem; border-radius: 999rem; font-family: 'Inter', sans-serif; font-size: 12.5rem; }
.bar span { opacity: 0.72; }
.bar__cta { color: inherit; text-decoration: none; font-weight: 700; border-bottom: 1px solid currentColor; padding-bottom: 1rem; }

@media (prefers-reduced-motion: reduce) { .card, .card__go { transition: none; } }
@media (max-width: 640px) { .deck { grid-template-columns: 1fr 1fr; } .card { min-height: 132rem; } .card__d { display: none; } }
</style>
