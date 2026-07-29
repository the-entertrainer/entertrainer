<script setup lang="ts">
/**
 * The drum decides the page. Once you're inside a section the HUD language
 * continues: bracketed labels, a channel strip, corner ticks, mono readouts
 * over near-black — so arriving at a page feels like the signal finished
 * locking rather than like a different website loaded.
 */
import concept from '~/experience/lab/concepts/signal'
import { LAB_ITEMS, LAB_SECTIONS, LAB_CONCEPTS } from '~/utils/labConcepts'
import type { NavItem } from '~/types/nav'

const meta = LAB_CONCEPTS[0]
definePageMeta({ layout: false })
useSeoMeta({ title: `01 — ${meta.name} · Lab`, robots: 'noindex' })

const open = ref<string | null>(null)
const section = computed(() => (open.value ? LAB_SECTIONS[open.value] : null))
function onSelect(item: NavItem) { open.value = item.id }
</script>

<template>
  <LabFrame n="01" :name="meta.name" hint="scroll to tune · click to lock" tone="dark">
    <LabSpatialStage :concept="concept" :items="LAB_ITEMS" @select="onSelect">
      <p class="sig-hint">[ scroll to tune ]</p>
    </LabSpatialStage>

    <Transition name="lock">
      <article v-if="section" class="sig" :key="section.id">
        <div class="sig__scan" aria-hidden="true" />
        <button class="sig__close" type="button" @click="open = null">[ ✕ close ]</button>

        <div class="sig__inner">
          <p class="sig__ch">[ CH.{{ String(LAB_ITEMS.findIndex(i => i.id === section!.id) + 1).padStart(2, '0') }} · {{ section.eyebrow.toUpperCase() }} ]</p>
          <h1 class="sig__h1">{{ section.label }}</h1>
          <p class="sig__lead">{{ section.lead }}</p>
          <p class="sig__body">{{ section.body }}</p>

          <dl class="sig__rows">
            <div v-for="(r, i) in section.rows" :key="i" class="sig__row">
              <dt>{{ r[0] }}</dt>
              <dd>{{ r[1] }}</dd>
            </div>
          </dl>

          <p class="sig__foot">▚ SIGNAL LOCKED · ENTERTRAINER · NAVEEN JOSE</p>
        </div>
      </article>
    </Transition>
  </LabFrame>
</template>

<style scoped>
.sig-hint {
  position: absolute; bottom: calc(30rem + var(--safe-bottom)); left: 50%; transform: translateX(-50%);
  margin: 0; font-family: var(--mono-font); font-size: 11rem; letter-spacing: 0.22em;
  color: #7ff6ff; opacity: 0.5;
}

.sig {
  position: absolute; inset: 0; z-index: 30; overflow-y: auto;
  background: rgba(4, 8, 11, 0.975);
  color: #dff8fb;
  font-family: var(--mono-font);
  /* The page is a monitor, so it gets the monitor's own texture. */
  background-image: repeating-linear-gradient(to bottom, rgba(127,246,255,0.045) 0 1px, transparent 1px 3px);
}
.sig__scan {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(to bottom, transparent 0%, rgba(127,246,255,0.07) 50%, transparent 100%);
  height: 34%;
  animation: sig-roll 7s linear infinite;
}
@keyframes sig-roll { from { transform: translateY(-40%); } to { transform: translateY(330%); } }

.sig__close {
  position: fixed; top: calc(62rem + var(--safe-top)); right: clamp(16rem, 4vw, 40rem); z-index: 5;
  border: 1px solid rgba(127,246,255,0.45); background: rgba(4,8,11,0.7);
  color: #7ff6ff; font: inherit; font-size: 11rem; letter-spacing: 0.14em;
  padding: 9rem 12rem; cursor: pointer;
}
.sig__close:hover { background: #7ff6ff; color: #04080b; }

.sig__inner {
  position: relative;
  max-width: 780rem; margin: 0 auto;
  padding: calc(96rem + var(--safe-top)) clamp(20rem, 5vw, 44rem) 90rem;
}

.sig__ch { margin: 0; font-size: 11rem; letter-spacing: 0.24em; color: #7ff6ff; }
.sig__h1 {
  margin: 16rem 0 0; font-family: var(--main-font); font-weight: 700;
  font-size: clamp(38rem, 8vw, 82rem); line-height: 0.98; letter-spacing: -0.02em;
  color: #eafdff; text-transform: uppercase;
  /* Ghosting, exactly as the cards do it. */
  text-shadow: 2px 0 rgba(255,0,80,0.30), -2px 0 rgba(0,220,255,0.30);
}
.sig__lead { margin: 26rem 0 0; font-size: 17rem; line-height: 1.5; color: #b9ecf2; max-width: 54ch; }
.sig__body { margin: 20rem 0 0; font-size: 13.5rem; line-height: 1.85; color: rgba(223,248,251,0.68); max-width: 62ch; }

.sig__rows { margin: 46rem 0 0; border-top: 1px solid rgba(127,246,255,0.28); }
.sig__row {
  display: grid; grid-template-columns: minmax(120rem, 22%) 1fr; gap: 16rem;
  padding: 13rem 0; border-bottom: 1px solid rgba(127,246,255,0.16);
}
.sig__rows dt { margin: 0; font-size: 11rem; letter-spacing: 0.14em; text-transform: uppercase; color: #7ff6ff; }
.sig__rows dd { margin: 0; font-size: 13rem; line-height: 1.55; color: #dff8fb; }

.sig__foot { margin: 44rem 0 0; font-size: 10.5rem; letter-spacing: 0.2em; color: rgba(127,246,255,0.5); }

/* Arriving is a lock, not a fade. */
.lock-enter-active { animation: lock-in 0.5s cubic-bezier(.2,.9,.2,1); }
.lock-leave-active { animation: lock-in 0.3s reverse; }
@keyframes lock-in {
  0%   { opacity: 0; transform: scaleY(0.4) translateY(6%); filter: blur(3px); }
  55%  { opacity: 1; transform: scaleY(1.02); filter: blur(0); }
  100% { opacity: 1; transform: none; }
}
@media (max-width: 576px) { .sig__row { grid-template-columns: 1fr; gap: 4rem; } }
@media (prefers-reduced-motion: reduce) {
  .sig__scan { animation: none; opacity: 0.35; }
  .lock-enter-active, .lock-leave-active { animation: none; }
}
</style>
