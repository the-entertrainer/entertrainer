<script setup lang="ts">
/**
 * The band decides the page. Because the geometry has a recto and a verso, so
 * does the page: the work is set on the front panel, and the index — the same
 * information the card's back carries — sits on a darker panel folded in
 * beside it, along a real diagonal crease.
 */
import concept from '~/experience/lab/concepts/fold'
import { LAB_ITEMS, LAB_SECTIONS, LAB_CONCEPTS } from '~/utils/labConcepts'
import type { NavItem } from '~/types/nav'

const meta = LAB_CONCEPTS[3]
definePageMeta({ layout: false })
useSeoMeta({ title: `04 — ${meta.name} · Lab`, robots: 'noindex' })

const open = ref<string | null>(null)
const section = computed(() => (open.value ? LAB_SECTIONS[open.value] : null))
const idx = computed(() =>
  open.value ? String(LAB_ITEMS.findIndex((i) => i.id === open.value) + 1).padStart(2, '0') : '00'
)
function onSelect(item: NavItem) { open.value = item.id }
</script>

<template>
  <LabFrame n="04" :name="meta.name" hint="scroll the band — cards turn through the twist" tone="dark">
    <LabSpatialStage :concept="concept" :items="LAB_ITEMS" @select="onSelect">
      <p class="fd-hint">One surface · scroll to travel it</p>
    </LabSpatialStage>

    <Transition name="unfold">
      <article v-if="section" class="fd" :key="section.id">
        <button class="fd__close" type="button" @click="open = null">Fold away</button>

        <div class="fd__sheet">
          <!-- Recto: the work. -->
          <section class="fd__recto">
            <p class="fd__eyebrow">Recto · {{ section.eyebrow }}</p>
            <h1 class="fd__h1">{{ section.label }}</h1>
            <p class="fd__lead">{{ section.lead }}</p>
            <p class="fd__body">{{ section.body }}</p>
          </section>

          <!-- Verso: the index, exactly as the card back prints it. -->
          <aside class="fd__verso">
            <p class="fd__vlabel">Verso</p>
            <p class="fd__vnum">{{ idx }}</p>
            <dl class="fd__rows">
              <div v-for="(r, i) in section.rows" :key="i" class="fd__row">
                <dt>{{ r[0] }}</dt>
                <dd>{{ r[1] }}</dd>
              </div>
            </dl>
            <p class="fd__vfoot">Entertrainer<br>Naveen Jose</p>
          </aside>
        </div>
      </article>
    </Transition>
  </LabFrame>
</template>

<style scoped>
.fd-hint {
  position: absolute; bottom: calc(28rem + var(--safe-bottom)); left: 50%; transform: translateX(-50%);
  margin: 0; font-family: var(--mono-font); font-size: 11rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: #f0eeea; opacity: 0.45;
}

.fd {
  position: absolute; inset: 0; z-index: 30; overflow-y: auto;
  background: #121215;
  color: #14130f;
}
.fd__close {
  position: fixed; top: calc(62rem + var(--safe-top)); right: clamp(16rem, 4vw, 40rem); z-index: 5;
  border: 1px solid rgba(240,238,234,0.4); background: transparent; color: #f0eeea;
  font-family: var(--mono-font); font-size: 11rem; letter-spacing: 0.14em; text-transform: uppercase;
  padding: 9rem 13rem; cursor: pointer;
}
.fd__close:hover { background: #f0eeea; color: #14130f; }

/* Two panels, one sheet: the crease is the grid. */
.fd__sheet {
  display: grid; grid-template-columns: 1.55fr 1fr;
  min-height: 100%;
  max-width: 1180rem; margin: 0 auto;
}

.fd__recto {
  background: #f0eeea;
  padding: calc(96rem + var(--safe-top)) clamp(24rem, 4.5vw, 60rem) 80rem;
  /* The crease: a hard diagonal of shade where the sheet turns. */
  background-image: linear-gradient(108deg, transparent 0 92%, rgba(20,19,15,0.10) 92% 100%);
}
.fd__eyebrow {
  margin: 0; font-family: var(--mono-font); font-size: 11rem;
  letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.55;
}
.fd__h1 {
  margin: 16rem 0 0; font-family: var(--main-font); font-weight: 700;
  font-size: clamp(38rem, 6.4vw, 78rem); line-height: 0.98; letter-spacing: -0.03em; text-wrap: balance;
}
.fd__lead { margin: 28rem 0 0; font-family: var(--display-font); font-size: clamp(20rem, 2.6vw, 27rem); line-height: 1.35; max-width: 34ch; }
.fd__body { margin: 24rem 0 0; font-size: 15rem; line-height: 1.72; max-width: 56ch; opacity: 0.78; }

.fd__verso {
  background: #191813; color: #f2f0ec;
  padding: calc(96rem + var(--safe-top)) clamp(22rem, 3.2vw, 40rem) 80rem;
  /* The reverse of the same crease — the shade falls the other way. */
  background-image: linear-gradient(108deg, rgba(255,255,255,0.055) 0 8%, transparent 8% 100%);
}
.fd__vlabel {
  margin: 0; font-family: var(--mono-font); font-size: 11rem;
  letter-spacing: 0.22em; text-transform: uppercase; opacity: 0.55;
}
.fd__vnum {
  margin: 4rem 0 30rem; font-family: var(--display-font); font-size: 76rem; line-height: 1;
  opacity: 0.25; font-variant-numeric: tabular-nums;
}
.fd__rows { margin: 0; border-top: 1px solid rgba(242,240,236,0.22); }
.fd__row { padding: 14rem 0; border-bottom: 1px solid rgba(242,240,236,0.14); }
.fd__rows dt {
  margin: 0 0 5rem; font-family: var(--mono-font); font-size: 10rem;
  letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.55;
}
.fd__rows dd { margin: 0; font-size: 14rem; line-height: 1.5; }
.fd__vfoot {
  margin: 40rem 0 0; font-family: var(--mono-font); font-size: 10.5rem;
  letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.45; line-height: 1.7;
}

/* It unfolds — hinged on the crease, not cross-faded. */
.unfold-enter-active { animation: fd-open 0.62s cubic-bezier(.22,.9,.24,1); transform-origin: left center; }
.unfold-leave-active { animation: fd-open 0.34s reverse; transform-origin: left center; }
@keyframes fd-open {
  from { opacity: 0; transform: perspective(1600px) rotateY(-58deg); }
  to   { opacity: 1; transform: none; }
}

@media (max-width: 860px) {
  .fd__sheet { grid-template-columns: 1fr; }
  .fd__recto { background-image: none; padding-bottom: 50rem; }
  .fd__verso { background-image: linear-gradient(190deg, rgba(255,255,255,0.055) 0 4%, transparent 4% 100%); padding-top: 46rem; }
}
@media (prefers-reduced-motion: reduce) {
  .unfold-enter-active, .unfold-leave-active { animation: none; }
}
</style>
