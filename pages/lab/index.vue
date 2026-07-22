<script setup lang="ts">
import { LAB_CONCEPTS } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Home concepts — Lab', robots: 'noindex' })
const R = useReveal()
</script>

<template>
  <div class="lab">
    <div class="lab__inner">
      <header class="lab__head">
        <p class="lab__eyebrow" v-motion :initial="R.rise(0).initial" :visible-once="R.rise(0).visibleOnce">Hidden · Lab</p>
        <h1 class="lab__title" v-motion :initial="R.rise(80).initial" :visible-once="R.rise(80).visibleOnce">Ten ways to reinvent the spiral</h1>
        <p class="lab__deck" v-motion :initial="R.rise(170).initial" :visible-once="R.rise(170).visibleOnce">Each keeps a little novelty but lives in the editorial world — Fraunces, clean sans, paper. Open one, feel the interaction, pick a favourite. Unpicked ones delete cleanly (nothing else links here).</p>
      </header>

      <ol class="lab__grid">
        <li v-for="(c, i) in LAB_CONCEPTS" :key="c.slug" v-motion :initial="R.riseIn(i, 55).initial" :visible-once="R.riseIn(i, 55).visibleOnce">
          <NuxtLink :to="`/lab/${c.slug}`" class="lab__card">
            <span class="lab__n">{{ c.n }}</span>
            <span class="lab__body">
              <strong class="lab__name">{{ c.name }}</strong>
              <span class="lab__blurb">{{ c.blurb }}</span>
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
.lab__inner { max-width: 860rem; margin: 0 auto; padding: calc(90rem + var(--safe-top)) clamp(20rem, 5vw, 40rem) 90rem; }
.lab__eyebrow { font-size: 12rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.55; }
.lab__title { font-family: var(--serif); font-optical-sizing: auto; font-weight: 400; font-size: clamp(38rem, 6.5vw, 68rem); line-height: 1.0; letter-spacing: -0.015em; margin: 14rem 0 0; }
.lab__deck { margin: 20rem 0 40rem; max-width: 54ch; font-size: 16rem; line-height: 1.6; opacity: 0.7; }
.lab__grid { list-style: none; margin: 0; padding: 0; display: grid; gap: 12rem; }
.lab__card { display: flex; align-items: center; gap: 18rem; padding: 20rem 22rem; border: 1px solid var(--color-glass-border); border-radius: 16rem; background: var(--color-glass-bg); color: var(--color-text); text-decoration: none; transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease; }
@media (hover: hover) { .lab__card:hover { transform: translateY(-3rem); border-color: var(--color-glass-border-hover); background: var(--color-glass-bg-hover); } .lab__card:hover .lab__arrow { transform: translateX(4rem); } }
.lab__card:focus-visible { outline: 2px solid var(--color-text); outline-offset: 3px; }
.lab__n { font-family: var(--serif); font-size: 26rem; opacity: 0.4; font-variant-numeric: tabular-nums; flex: 0 0 auto; }
.lab__body { display: flex; flex-direction: column; gap: 4rem; margin-right: auto; min-width: 0; }
.lab__name { font-size: 18rem; font-weight: 700; letter-spacing: -0.01em; }
.lab__blurb { font-size: 13.5rem; opacity: 0.6; line-height: 1.45; }
.lab__arrow { font-size: 20rem; opacity: 0.4; transition: transform 0.2s ease; }
</style>
