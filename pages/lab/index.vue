<script setup lang="ts">
import { CONCEPTS } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Homepage concepts — Lab', robots: 'noindex' })
const R = useReveal()
</script>

<template>
  <div class="lab">
    <div class="lab__inner">
      <header class="lab__head">
        <p class="lab__eyebrow" v-motion :initial="R.rise(0).initial" :visible-once="R.rise(0).visibleOnce">Hidden · Lab</p>
        <h1 class="lab__title" v-motion :initial="R.rise(70).initial" :visible-once="R.rise(70).visibleOnce">Fifteen homepages,<br>one sheet of glass</h1>
        <p class="lab__deck" v-motion :initial="R.rise(150).initial" :visible-once="R.rise(150).visibleOnce">
          Every one renders real Liquid Glass — a rounded-rect distance field, surface normals taken from
          its gradient, edge-weighted refraction, chromatic dispersion, Fresnel and specular — over a
          procedural backdrop the glass actually bends. Same optics throughout; fifteen different
          art directions on top.
        </p>
      </header>

      <ol class="lab__grid">
        <li v-for="(c, i) in CONCEPTS" :key="c.slug" v-motion
            :initial="R.riseIn(i, 40).initial" :visible-once="R.riseIn(i, 40).visibleOnce">
          <NuxtLink :to="`/lab/${c.slug}`" class="lab__card">
            <span class="lab__n">{{ c.n }}</span>
            <span class="lab__body">
              <strong class="lab__name">{{ c.name }}</strong>
              <span class="lab__law">{{ c.note }}</span>
                          </span>
            <span class="lab__arrow" aria-hidden="true">→</span>
          </NuxtLink>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.lab { position: fixed; inset: 0; overflow-y: auto; background: var(--color-bg); color: var(--color-text); --serif: 'Fraunces', Georgia, serif; }
.lab__inner { max-width: 900rem; margin: 0 auto; padding: calc(80rem + var(--safe-top)) clamp(20rem, 5vw, 40rem) 90rem; }
.lab__eyebrow { font-family: var(--mono-font); font-weight: 500; font-size: 12rem; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.55; }
.lab__title { font-family: var(--serif); font-optical-sizing: auto; font-weight: 400; font-size: clamp(34rem, 6vw, 62rem); line-height: 1.02; letter-spacing: -0.02em; margin: 14rem 0 0; }
.lab__deck { margin: 20rem 0 40rem; max-width: 62ch; font-size: 15rem; line-height: 1.65; opacity: 0.7; }
.lab__deck em { font-style: italic; }

.lab__grid { list-style: none; margin: 0; padding: 0; display: grid; gap: 10rem; }
.lab__card { display: grid; grid-template-columns: 34rem 1fr 22rem; align-items: start; gap: 16rem; padding: 20rem 22rem; border: 1px solid var(--color-glass-border); border-radius: 16rem; background: var(--color-glass-bg); color: var(--color-text); text-decoration: none; transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease; }
@media (hover: hover) { .lab__card:hover { transform: translateY(-3rem); border-color: var(--color-glass-border-hover); background: var(--color-glass-bg-hover); } .lab__card:hover .lab__arrow { transform: translateX(4rem); } }
.lab__card:focus-visible { outline: 2px solid var(--color-text); outline-offset: 3px; }
.lab__n { font-family: var(--serif); font-size: 22rem; opacity: 0.38; font-variant-numeric: tabular-nums; padding-top: 2rem; }
.lab__body { display: grid; gap: 6rem; min-width: 0; }
.lab__name { font-size: 19rem; font-weight: 700; letter-spacing: -0.01em; }
.lab__law { font-size: 12.5rem; line-height: 1.5; opacity: 0.62; }
.lab__pitch { font-size: 13.5rem; line-height: 1.45; font-style: italic; opacity: 0.9; }
.lab__tech { font-size: 12rem; line-height: 1.5; opacity: 0.45; }
.lab__arrow { font-size: 18rem; opacity: 0.35; transition: transform 0.2s ease; padding-top: 4rem; }
@media (prefers-reduced-motion: reduce) { .lab__card, .lab__arrow { transition: none; } }
</style>
