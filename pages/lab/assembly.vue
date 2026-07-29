<script setup lang="ts">
/**
 * The lattice decides the page. The formation you were looking at is still the
 * page's structure: an explicit modular grid, coordinates in the margin, and
 * content sitting on named cells rather than floating in a column. The current
 * formation is reported live in the corner, because in this concept the shape
 * of the layout *is* the navigation.
 */
import concept from '~/experience/lab/concepts/assembly'
import { LAB_ITEMS, LAB_SECTIONS, LAB_CONCEPTS } from '~/utils/labConcepts'
import type { NavItem } from '~/types/nav'

const meta = LAB_CONCEPTS[4]
definePageMeta({ layout: false })
useSeoMeta({ title: `05 — ${meta.name} · Lab`, robots: 'noindex' })

const open = ref<string | null>(null)
const section = computed(() => (open.value ? LAB_SECTIONS[open.value] : null))
const idx = computed(() =>
  open.value ? String(LAB_ITEMS.findIndex((i) => i.id === open.value) + 1).padStart(2, '0') : '00'
)
function onSelect(item: NavItem) { open.value = item.id }
</script>

<template>
  <LabFrame n="05" :name="meta.name" hint="scroll to re-form: grid · ring · helix · column" tone="dark">
    <LabSpatialStage :concept="concept" :items="LAB_ITEMS" @select="onSelect">
      <p class="as-hint">Scroll rebuilds the formation — grid · ring · helix · column</p>
    </LabSpatialStage>

    <Transition name="build">
      <article v-if="section" class="as" :key="section.id">
        <button class="as__close" type="button" @click="open = null">✕ Dismiss</button>

        <div class="as__sheet">
          <!-- The margin is instrumentation, not decoration: it names the cells. -->
          <aside class="as__margin">
            <span>ITEM {{ idx }}</span>
            <span>A1 · TITLE</span>
            <span>B1 · ABSTRACT</span>
            <span>C1 · DETAIL</span>
          </aside>

          <div class="as__grid">
            <header class="as__cell as__cell--title">
              <p class="as__eyebrow">{{ section.eyebrow }}</p>
              <h1 class="as__h1">{{ section.label }}</h1>
            </header>

            <div class="as__cell as__cell--abstract">
              <p class="as__lead">{{ section.lead }}</p>
            </div>

            <div class="as__cell as__cell--body">
              <p class="as__body">{{ section.body }}</p>
            </div>

            <dl class="as__cell as__cell--rows">
              <div v-for="(r, i) in section.rows" :key="i" class="as__row">
                <dt>{{ String(i + 1).padStart(2, '0') }} · {{ r[0] }}</dt>
                <dd>{{ r[1] }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </article>
    </Transition>
  </LabFrame>
</template>

<style scoped>
.as-hint {
  position: absolute; bottom: calc(28rem + var(--safe-bottom)); left: 50%; transform: translateX(-50%);
  margin: 0; font-family: var(--mono-font); font-size: 11rem; letter-spacing: 0.14em;
  text-transform: uppercase; color: #7fd6e6; opacity: 0.5; text-align: center;
}

.as {
  position: absolute; inset: 0; z-index: 30; overflow-y: auto;
  background: #0b0e12;
  color: #e6ecf0;
  /* The drawing sheet's own lattice, still visible under the type. */
  background-image:
    linear-gradient(rgba(47,142,166,0.10) 1px, transparent 1px),
    linear-gradient(90deg, rgba(47,142,166,0.10) 1px, transparent 1px);
  background-size: 100% 44rem, 44rem 100%;
}
.as__close {
  position: fixed; top: calc(62rem + var(--safe-top)); right: clamp(16rem, 4vw, 40rem); z-index: 5;
  border: 1px solid rgba(127,214,230,0.45); background: rgba(11,14,18,0.8); color: #7fd6e6;
  font-family: var(--mono-font); font-size: 11rem; letter-spacing: 0.14em; text-transform: uppercase;
  padding: 9rem 13rem; cursor: pointer;
}
.as__close:hover { background: #7fd6e6; color: #0b0e12; }

.as__sheet {
  display: grid; grid-template-columns: 132rem 1fr;
  max-width: 1120rem; margin: 0 auto;
  padding: calc(92rem + var(--safe-top)) clamp(20rem, 4vw, 44rem) 90rem;
  gap: 28rem;
}
.as__margin {
  display: flex; flex-direction: column; gap: 10rem;
  font-family: var(--mono-font); font-size: 10rem; letter-spacing: 0.14em; text-transform: uppercase;
  color: #7fd6e6; opacity: 0.6;
  border-right: 1px solid rgba(47,142,166,0.30);
  padding-right: 16rem;
}

/* Everything sits on declared cells — no free-floating blocks. */
.as__grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 22rem 20rem; align-content: start; }
.as__cell { position: relative; }
.as__cell::before {
  content: ''; position: absolute; left: -10rem; top: 0; width: 3rem; height: 100%;
  background: rgba(47,142,166,0.5);
}
.as__cell--title { grid-column: 1 / -1; }
.as__cell--abstract { grid-column: 1 / span 7; }
.as__cell--body { grid-column: 8 / -1; }
.as__cell--rows { grid-column: 1 / -1; margin: 14rem 0 0; }

.as__eyebrow {
  margin: 0; font-family: var(--mono-font); font-size: 11rem;
  letter-spacing: 0.2em; text-transform: uppercase; color: #7fd6e6;
}
.as__h1 {
  margin: 12rem 0 0; font-family: var(--main-font); font-weight: 700;
  font-size: clamp(36rem, 6.6vw, 76rem); line-height: 0.98; letter-spacing: -0.03em; text-wrap: balance;
}
.as__lead { margin: 0; font-size: clamp(17rem, 2.2vw, 21rem); line-height: 1.45; }
.as__body { margin: 0; font-size: 14rem; line-height: 1.75; opacity: 0.72; }

.as__row {
  display: grid; grid-template-columns: minmax(150rem, 26%) 1fr; gap: 18rem;
  padding: 13rem 0; border-bottom: 1px solid rgba(47,142,166,0.22);
}
.as__cell--rows > .as__row:first-child { border-top: 1px solid rgba(47,142,166,0.22); }
.as__cell--rows dt {
  margin: 0; font-family: var(--mono-font); font-size: 10rem;
  letter-spacing: 0.14em; text-transform: uppercase; color: #7fd6e6; padding-top: 3rem;
}
.as__cell--rows dd { margin: 0; font-size: 14rem; line-height: 1.55; }

/* It assembles: cells arrive on the lattice rather than fading up together. */
.build-enter-active { animation: as-build 0.5s cubic-bezier(.2,.9,.2,1); }
.build-leave-active { animation: as-build 0.28s reverse; }
@keyframes as-build {
  from { opacity: 0; transform: scale(0.985); clip-path: inset(0 0 100% 0); }
  to   { opacity: 1; transform: none; clip-path: inset(0 0 0 0); }
}

@media (max-width: 900px) {
  .as__cell--abstract, .as__cell--body { grid-column: 1 / -1; }
}
@media (max-width: 700px) {
  .as__sheet { grid-template-columns: 1fr; }
  .as__margin { flex-direction: row; flex-wrap: wrap; gap: 14rem; border-right: 0; border-bottom: 1px solid rgba(47,142,166,0.3); padding: 0 0 12rem; }
}
@media (max-width: 576px) { .as__row { grid-template-columns: 1fr; gap: 4rem; } }
@media (prefers-reduced-motion: reduce) {
  .build-enter-active, .build-leave-active { animation: none; }
}
</style>
