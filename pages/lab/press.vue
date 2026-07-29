<script setup lang="ts">
/**
 * The press bed decides the page. A sheet turns and what's underneath is a
 * broadsheet: condensed masthead, hairline rules, a real column measure,
 * folio numbers, and not one drop of colour anywhere.
 */
import concept from '~/experience/lab/concepts/press'
import { LAB_ITEMS, LAB_SECTIONS, LAB_CONCEPTS } from '~/utils/labConcepts'
import type { NavItem } from '~/types/nav'

const meta = LAB_CONCEPTS[1]
definePageMeta({ layout: false })
useSeoMeta({ title: `02 — ${meta.name} · Lab`, robots: 'noindex' })

const open = ref<string | null>(null)
const section = computed(() => (open.value ? LAB_SECTIONS[open.value] : null))
const folio = computed(() =>
  open.value ? String(LAB_ITEMS.findIndex((i) => i.id === open.value) + 1).padStart(2, '0') : '00'
)
function onSelect(item: NavItem) { open.value = item.id }
</script>

<template>
  <LabFrame n="02" :name="meta.name" hint="flick up to turn the sheet" tone="light">
    <LabSpatialStage :concept="concept" :items="LAB_ITEMS" @select="onSelect">
      <p class="pr-hint">Flick up to turn · click the top sheet to read</p>
    </LabSpatialStage>

    <Transition name="turn">
      <article v-if="section" class="pr" :key="section.id">
        <button class="pr__close" type="button" @click="open = null">Close ✕</button>

        <div class="pr__inner">
          <header class="pr__masthead">
            <span>Entertrainer</span>
            <span>Naveen Jose</span>
            <span>Folio {{ folio }}</span>
          </header>

          <p class="pr__kicker">{{ section.eyebrow }}</p>
          <h1 class="pr__h1">{{ section.label }}</h1>
          <hr class="pr__rule">

          <div class="pr__cols">
            <p class="pr__lead">{{ section.lead }}</p>
            <p class="pr__body">{{ section.body }}</p>
          </div>

          <hr class="pr__rule pr__rule--thin">

          <dl class="pr__table">
            <div v-for="(r, i) in section.rows" :key="i" class="pr__tr">
              <dt>{{ r[0] }}</dt>
              <dd>{{ r[1] }}</dd>
            </div>
          </dl>

          <footer class="pr__foot">
            <span>Set in one ink</span>
            <span>—</span>
            <span>Entertrainer, {{ new Date().getFullYear() }}</span>
          </footer>
        </div>
      </article>
    </Transition>
  </LabFrame>
</template>

<style scoped>
.pr-hint {
  position: absolute; bottom: calc(28rem + var(--safe-bottom)); left: 50%; transform: translateX(-50%);
  margin: 0; font-family: var(--mono-font); font-size: 11rem; letter-spacing: 0.16em;
  text-transform: uppercase; color: #14130f; opacity: 0.45;
}

.pr {
  position: absolute; inset: 0; z-index: 30; overflow-y: auto;
  background: #eceadf;
  color: #0e0d0c;
  /* One ink, one paper — the page inherits the plate's own discipline. */
  filter: grayscale(1);
}
.pr__close {
  position: fixed; top: calc(62rem + var(--safe-top)); right: clamp(16rem, 4vw, 40rem); z-index: 5;
  border: 1px solid #0e0d0c; background: #eceadf; color: #0e0d0c;
  font-family: var(--mono-font); font-size: 11rem; letter-spacing: 0.14em; text-transform: uppercase;
  padding: 9rem 13rem; cursor: pointer;
}
.pr__close:hover { background: #0e0d0c; color: #eceadf; }

.pr__inner { max-width: 940rem; margin: 0 auto; padding: calc(84rem + var(--safe-top)) clamp(20rem, 5vw, 48rem) 80rem; }

.pr__masthead {
  display: flex; justify-content: space-between; gap: 14rem;
  padding-bottom: 10rem; border-bottom: 2px solid #0e0d0c;
  font-family: var(--mono-font); font-size: 10.5rem; letter-spacing: 0.18em; text-transform: uppercase;
}

.pr__kicker {
  margin: 22rem 0 0; font-family: var(--mono-font);
  font-size: 11rem; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.65;
}
.pr__h1 {
  margin: 8rem 0 0; font-family: var(--main-font); font-weight: 700;
  font-size: clamp(44rem, 11vw, 132rem); line-height: 0.86; letter-spacing: -0.035em;
  text-transform: uppercase; text-wrap: balance;
}
.pr__rule { margin: 26rem 0; border: 0; border-top: 2px solid #0e0d0c; }
.pr__rule--thin { border-top-width: 1px; margin: 34rem 0 24rem; }

/* A real measure: two columns, and the lead set larger to open the piece. */
.pr__cols { columns: 2; column-gap: 44rem; }
.pr__lead {
  margin: 0 0 16rem; font-size: 21rem; line-height: 1.32; font-weight: 500;
  break-inside: avoid; text-wrap: pretty;
}
.pr__lead::first-letter { font-size: 2.4em; line-height: 0.8; float: left; padding: 6rem 8rem 0 0; font-weight: 700; }
.pr__body { margin: 0; font-size: 14.5rem; line-height: 1.62; text-align: justify; hyphens: auto; }

.pr__table { margin: 0; }
.pr__tr {
  display: grid; grid-template-columns: minmax(150rem, 26%) 1fr; gap: 18rem;
  padding: 11rem 0; border-bottom: 1px solid rgba(14,13,12,0.28);
}
.pr__tr:first-child { border-top: 1px solid rgba(14,13,12,0.28); }
.pr__table dt {
  margin: 0; font-family: var(--mono-font); font-size: 10.5rem;
  letter-spacing: 0.16em; text-transform: uppercase; padding-top: 3rem;
}
.pr__table dd { margin: 0; font-size: 14.5rem; line-height: 1.5; }

.pr__foot {
  display: flex; gap: 12rem; margin-top: 40rem; padding-top: 12rem;
  border-top: 2px solid #0e0d0c;
  font-family: var(--mono-font); font-size: 10.5rem; letter-spacing: 0.16em; text-transform: uppercase;
}

/* The page arrives the way the sheet does: hinged from the top edge. */
.turn-enter-active { animation: pr-turn 0.55s cubic-bezier(.2,.85,.25,1); transform-origin: top center; }
.turn-leave-active { animation: pr-turn 0.32s reverse; transform-origin: top center; }
@keyframes pr-turn {
  from { opacity: 0; transform: perspective(1400px) rotateX(-42deg) translateY(-8%); }
  to   { opacity: 1; transform: none; }
}

@media (max-width: 760px) { .pr__cols { columns: 1; } }
@media (max-width: 576px) {
  .pr__tr { grid-template-columns: 1fr; gap: 4rem; }
  .pr__masthead span:nth-child(2) { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .turn-enter-active, .turn-leave-active { animation: none; }
}
</style>
