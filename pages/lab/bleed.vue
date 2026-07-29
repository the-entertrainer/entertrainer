<script setup lang="ts">
/**
 * The blot decides the page. Ink floods the card, and the page it opens onto
 * is that same ink dried: indigo on cream, wide margins, a drop cap, and rules
 * that bleed off the measure instead of stopping neatly.
 */
import concept from '~/experience/lab/concepts/bleed'
import { LAB_ITEMS, LAB_SECTIONS, LAB_CONCEPTS } from '~/utils/labConcepts'
import type { NavItem } from '~/types/nav'

const meta = LAB_CONCEPTS[2]
definePageMeta({ layout: false })
useSeoMeta({ title: `03 — ${meta.name} · Lab`, robots: 'noindex' })

const open = ref<string | null>(null)
const section = computed(() => (open.value ? LAB_SECTIONS[open.value] : null))
function onSelect(item: NavItem) { open.value = item.id }
</script>

<template>
  <LabFrame n="03" :name="meta.name" hint="press and hold to soak through" tone="light">
    <LabSpatialStage :concept="concept" :items="LAB_ITEMS" @select="onSelect">
      <p class="bl-hint">Press <em>and hold</em> a card — ink takes a moment</p>
    </LabSpatialStage>

    <Transition name="soak">
      <article v-if="section" class="bl" :key="section.id">
        <button class="bl__close" type="button" @click="open = null">Close</button>

        <div class="bl__inner">
          <p class="bl__eyebrow">{{ section.eyebrow }}</p>
          <h1 class="bl__h1">{{ section.label }}</h1>

          <p class="bl__lead">{{ section.lead }}</p>
          <div class="bl__bleedrule" aria-hidden="true" />
          <p class="bl__body">{{ section.body }}</p>

          <dl class="bl__rows">
            <div v-for="(r, i) in section.rows" :key="i" class="bl__row">
              <dt>{{ r[0] }}</dt>
              <dd>{{ r[1] }}</dd>
            </div>
          </dl>

          <p class="bl__colophon">Entertrainer · Naveen Jose · set in one ink on one paper</p>
        </div>
      </article>
    </Transition>
  </LabFrame>
</template>

<style scoped>
.bl-hint {
  position: absolute; bottom: calc(28rem + var(--safe-bottom)); left: 50%; transform: translateX(-50%);
  margin: 0; font-family: var(--display-font); font-size: 15rem;
  color: #0e1330; opacity: 0.6;
}
.bl-hint em { font-style: italic; }

.bl {
  position: absolute; inset: 0; z-index: 30; overflow-y: auto;
  background: #efe8d9;
  color: #0e1330;
}
.bl__close {
  position: fixed; top: calc(62rem + var(--safe-top)); right: clamp(16rem, 4vw, 40rem); z-index: 5;
  border: 0; border-bottom: 1px solid #0e1330; background: transparent;
  color: #0e1330; font-family: var(--display-font); font-size: 16rem;
  padding: 4rem 2rem; cursor: pointer;
}
.bl__close:hover { background: #0e1330; color: #efe8d9; }

/* Wide margins: ink needs room to be looked at. */
.bl__inner { max-width: 700rem; margin: 0 auto; padding: calc(110rem + var(--safe-top)) clamp(24rem, 7vw, 60rem) 100rem; }

.bl__eyebrow {
  margin: 0; font-family: var(--mono-font); font-size: 11rem;
  letter-spacing: 0.22em; text-transform: uppercase; opacity: 0.6;
}
.bl__h1 {
  margin: 18rem 0 0; font-family: var(--display-font); font-weight: 400;
  font-size: clamp(46rem, 10vw, 104rem); line-height: 0.94; letter-spacing: -0.015em;
  text-wrap: balance;
}
.bl__lead {
  margin: 34rem 0 0; font-family: var(--display-font);
  font-size: clamp(21rem, 3.2vw, 29rem); line-height: 1.34; text-wrap: pretty;
}
.bl__lead::first-letter {
  font-size: 3.1em; line-height: 0.78; float: left;
  padding: 8rem 12rem 0 0; color: #1a2a6b;
}

/* A rule that has soaked into the fibre rather than been ruled. */
.bl__bleedrule {
  height: 10rem; margin: 40rem 0 34rem;
  background:
    radial-gradient(ellipse 60% 100% at 10% 50%, #0e1330 40%, transparent 72%),
    radial-gradient(ellipse 40% 80% at 34% 50%, #0e1330 40%, transparent 70%),
    radial-gradient(ellipse 70% 90% at 62% 50%, #0e1330 40%, transparent 74%),
    radial-gradient(ellipse 30% 70% at 88% 50%, #0e1330 40%, transparent 68%);
  opacity: 0.85;
}

.bl__body { margin: 0; font-size: 16rem; line-height: 1.78; max-width: 60ch; opacity: 0.88; }

.bl__rows { margin: 52rem 0 0; }
.bl__row {
  display: grid; grid-template-columns: minmax(140rem, 30%) 1fr; gap: 20rem;
  padding: 15rem 0; border-bottom: 1px solid rgba(14,19,48,0.22);
}
.bl__row:first-child { border-top: 1px solid rgba(14,19,48,0.22); }
.bl__rows dt {
  margin: 0; font-family: var(--mono-font); font-size: 10.5rem;
  letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.65; padding-top: 4rem;
}
.bl__rows dd { margin: 0; font-family: var(--display-font); font-size: 18rem; line-height: 1.45; }

.bl__colophon {
  margin: 56rem 0 0; font-family: var(--mono-font); font-size: 10.5rem;
  letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.5;
}

/* The page doesn't fade in — it soaks in, from the middle outward. */
.soak-enter-active { animation: bl-soak 0.75s cubic-bezier(.3,.8,.3,1); }
.soak-leave-active { animation: bl-soak 0.35s reverse; }
@keyframes bl-soak {
  from { opacity: 0; clip-path: circle(6% at 50% 60%); }
  to   { opacity: 1; clip-path: circle(150% at 50% 60%); }
}

@media (max-width: 576px) { .bl__row { grid-template-columns: 1fr; gap: 5rem; } }
@media (prefers-reduced-motion: reduce) {
  .soak-enter-active, .soak-leave-active { animation: none; }
}
</style>
