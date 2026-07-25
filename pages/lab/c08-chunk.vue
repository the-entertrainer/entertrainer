<script setup lang="ts">
import { LAB_NAV, CONCEPTS } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: '08 Four Chunks', robots: 'noindex' })
const C = CONCEPTS[7]

/**
 * Miller's Law: working memory holds roughly 7±2 items — but chunking raises
 * effective capacity, because a chunk counts as one item however much sits
 * inside it. Four chunks, one open at a time, everything else collapsed to a
 * single line. Chunking is literally the instructional designer's core move,
 * so the mechanism is the portfolio argument.
 */
const open = ref(0)
const detail: Record<string, string[]> = {
  '/about': ['Hospitality floors, then L&D', 'Certified instructional designer', 'Writes, designs and ships the build'],
  '/instructional-design': ['Start from the behaviour, not the topic', 'Practice beats presentation', 'Measure what changed at work'],
  '/my-work': ['SEWA Chronicles — a service-culture comic', 'Interactive modules, start to finish', 'Case studies with the reasoning shown'],
  '/tools': ['EasyMCQ — distractors, generated', 'Cadence — topics to a calendar', 'StoryGen — storyboards on a canvas']
}
</script>

<template>
  <LabShell bg="#101820" ink="#EAF0F4" pop="#FFB020" display="'Archivo','DM Sans',sans-serif" :law="C.law">
    <div class="k">
      <header class="k__head">
        <p class="k__kick">Naveen Jose · Instructional Design</p>
        <h1 class="k__h1">Four things,<br>taught properly.</h1>
        <p class="k__sub">Working memory holds about four to seven items. So this page never asks you to hold more than four — and each one unpacks only when you want it.</p>
      </header>

      <div class="k__stack">
        <section v-for="(it, i) in LAB_NAV" :key="it.href" class="k__chunk" :class="{ open: open === i }">
          <h2>
            <button class="k__bar" :aria-expanded="open === i" :aria-controls="`p-${i}`"
                    @click="open = open === i ? -1 : i">
              <span class="k__n">{{ it.n }}</span>
              <span class="k__label">{{ it.label }}</span>
              <span class="k__sign" aria-hidden="true">{{ open === i ? '−' : '+' }}</span>
            </button>
          </h2>
          <div :id="`p-${i}`" class="k__panel" :hidden="open !== i">
            <p class="k__desc">{{ it.desc }}</p>
            <ul class="k__pts">
              <li v-for="d in detail[it.href]" :key="d">{{ d }}</li>
            </ul>
            <NuxtLink :to="it.href" class="k__go">Open {{ it.label }} →</NuxtLink>
          </div>
        </section>
      </div>

      <p class="k__load">Items held in memory right now: <b>{{ open === -1 ? 4 : 4 }}</b> chunks
        <span v-if="open !== -1">· 1 unpacked</span>
      </p>
    </div>
  </LabShell>
</template>

<style scoped>
.k { position: absolute; inset: 0; overflow-y: auto; padding: 62rem clamp(18rem, 4vw, 56rem) 78rem; display: grid; align-content: center; gap: 24rem; }
.k__head { max-width: 52ch; }
.k__kick { margin: 0 0 12rem; font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink-45); }
.k__h1 { margin: 0; font-size: clamp(30rem, 4.8vw, 54rem); line-height: 1.02; letter-spacing: -0.035em; font-weight: 800; }
.k__sub { margin: 14rem 0 0; font-family: 'DM Sans', sans-serif; font-size: 13rem; line-height: 1.6; color: var(--ink-70); }

.k__stack { display: grid; gap: 6rem; max-width: 760rem; }
.k__chunk { border: 1px solid var(--ink-15); border-radius: 14rem; overflow: hidden; background: rgba(255,255,255,0.02); transition: border-color 200ms ease; }
.k__chunk.open { border-color: var(--pop); }
.k__chunk h2 { margin: 0; }
.k__bar { width: 100%; display: grid; grid-template-columns: 34rem 1fr 24rem; align-items: center; gap: 12rem; padding: 17rem 18rem; background: none; border: 0; color: var(--ink); cursor: pointer; text-align: left; font-family: inherit; }
.k__bar:focus-visible { outline: 2px solid var(--pop); outline-offset: -3px; }
.k__n { font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.12em; color: var(--pop); }
.k__label { font-size: 21rem; font-weight: 700; letter-spacing: -0.02em; }
.k__sign { font-size: 20rem; color: var(--pop); text-align: right; }

.k__panel { padding: 0 18rem 18rem 64rem; }
.k__panel[hidden] { display: none; }
.k__desc { margin: 0 0 12rem; font-family: 'DM Sans', sans-serif; font-size: 13rem; line-height: 1.55; color: var(--ink-70); }
.k__pts { margin: 0 0 14rem; padding: 0 0 0 16rem; display: grid; gap: 5rem; font-family: 'DM Sans', sans-serif; font-size: 12.5rem; color: var(--ink-70); }
.k__go { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 12.5rem; color: #14140A; background: var(--pop); text-decoration: none; border-radius: 999rem; padding: 10rem 18rem; display: inline-block; }
.k__go:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }

.k__load { margin: 0; font-family: 'DM Sans', sans-serif; font-size: 11rem; color: var(--ink-45); }
.k__load b { color: var(--pop); }

@media (prefers-reduced-motion: reduce) { .k__chunk { transition: none; } }
@media (max-width: 620px) { .k__panel { padding-left: 18rem; } }
</style>
