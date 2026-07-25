<script setup lang="ts">
import { LAB_NAV, CONCEPTS } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: '06 Peak & End', robots: 'noindex' })
const C = CONCEPTS[5]

/**
 * Peak-End Rule (Kahneman & Fredrickson): a remembered experience is dominated
 * by its most intense moment and its final moment — not its average or its
 * duration. So this homepage is scored like a piece of music: a quiet setup, an
 * engineered peak at roughly 60% of the scroll, and a deliberate, calm ending
 * that carries the call to action.
 *
 * Scroll position drives an "intensity" value that the whole page reads from,
 * and the curve is drawn on screen so the structure is explicit.
 */
const scroller = ref<HTMLElement | null>(null)
const p = ref(0)   // 0..1 through the piece

function onScroll() {
  const el = scroller.value; if (!el) return
  const max = el.scrollHeight - el.clientHeight
  p.value = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0
}
/** Intensity envelope: rises, peaks at 0.6, falls to a held ending. */
const intensity = computed(() => {
  const x = p.value
  const peak = Math.exp(-Math.pow((x - 0.6) / 0.17, 2))
  const ending = x > 0.86 ? (x - 0.86) / 0.14 * 0.55 : 0
  return Math.min(1, peak + ending * 0.9)
})
const act = computed(() => p.value < 0.36 ? 'Setup' : p.value < 0.82 ? 'Peak' : 'Ending')
</script>

<template>
  <LabShell bg="#0A0A12" ink="#EDEBFF" pop="#7C5CFF" display="'Fraunces',Georgia,serif" :law="C.law">
    <div class="pk" :style="{ '--i': intensity }">
      <div class="pk__glow" aria-hidden="true" />

      <aside class="pk__hud" aria-hidden="true">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" class="pk__curve">
          <!-- The score itself: setup, peak at 60%, held ending. -->
          <path d="M0 38 C 22 37, 38 6, 60 5 C 74 5, 78 30, 86 30 L 100 22"
                fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.45" />
          <circle :cx="p * 100" :cy="38 - intensity * 33" r="2.4" fill="currentColor" />
        </svg>
        <p class="pk__act">{{ act }}</p>
      </aside>

      <div ref="scroller" class="pk__scroll" @scroll.passive="onScroll">
        <section class="pk__act1">
          <p class="pk__kick">Naveen Jose · Instructional Design</p>
          <h1 class="pk__h1">Nobody remembers<br>the average.</h1>
          <p class="pk__lede">They remember the best moment, and how it ended. So I build both on purpose. Keep scrolling.</p>
          <span class="pk__cue" aria-hidden="true">↓</span>
        </section>

        <section class="pk__act2">
          <h2 class="pk__big">THE<br>PEAK</h2>
          <p class="pk__peaktext">One moment, engineered. In a course this is the thing people describe to a colleague three weeks later — unprompted.</p>
        </section>

        <section class="pk__act3">
          <h2 class="pk__end">And a deliberate ending.</h2>
          <nav class="pk__nav">
            <NuxtLink v-for="it in LAB_NAV" :key="it.href" :to="it.href" class="pk__link">
              <span>{{ it.label }}</span><i aria-hidden="true">→</i>
            </NuxtLink>
          </nav>
        </section>
      </div>
    </div>
  </LabShell>
</template>

<style scoped>
.pk { position: absolute; inset: 0; }
/* Brightness is bound to the intensity envelope, so the room itself swells. */
.pk__glow { position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: radial-gradient(ellipse 70% 55% at 50% 46%, rgba(124,92,255,0.55), transparent 70%);
  opacity: calc(0.12 + var(--i) * 0.85); transition: opacity 120ms linear; }

.pk__hud { position: fixed; left: 50%; translate: -50% 0; bottom: 40rem; z-index: 30; width: min(280rem, 62vw); color: var(--pop); pointer-events: none; text-align: center; }
.pk__curve { width: 100%; height: 40rem; overflow: visible; }
.pk__act { margin: 4rem 0 0; font-family: 'DM Sans', sans-serif; font-size: 10rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink-45); }

.pk__scroll { position: absolute; inset: 0; z-index: 10; overflow-y: auto; scroll-behavior: smooth; }
.pk__scroll > section { min-height: 100%; display: grid; align-content: center; justify-items: center; text-align: center; padding: 70rem clamp(20rem, 6vw, 80rem) 110rem; }

.pk__kick { margin: 0 0 16rem; font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink-45); }
.pk__h1 { margin: 0; font-size: clamp(30rem, 5.4vw, 62rem); line-height: 1.04; letter-spacing: -0.03em; font-weight: 400; }
.pk__lede { margin: 18rem 0 0; font-family: 'DM Sans', sans-serif; font-size: 14rem; line-height: 1.6; color: var(--ink-70); max-width: 42ch; }
.pk__cue { margin-top: 34rem; font-size: 18rem; color: var(--pop); animation: pk-bob 2.2s ease-in-out infinite; }
@keyframes pk-bob { 50% { translate: 0 8rem; } }

.pk__big { margin: 0; font-family: 'Archivo','DM Sans',sans-serif; font-weight: 900; font-size: clamp(64rem, 17vw, 200rem); line-height: 0.84; letter-spacing: -0.05em; color: var(--ink);
  text-shadow: 0 0 calc(var(--i) * 70rem) rgba(124,92,255,0.85); }
.pk__peaktext { margin: 26rem 0 0; font-family: 'DM Sans', sans-serif; font-size: 14rem; line-height: 1.6; color: var(--ink-70); max-width: 40ch; }

.pk__end { margin: 0 0 28rem; font-size: clamp(24rem, 3.6vw, 40rem); font-weight: 400; letter-spacing: -0.02em; }
.pk__nav { display: grid; gap: 8rem; width: min(420rem, 100%); }
.pk__link { display: flex; align-items: center; justify-content: space-between; gap: 12rem; padding: 15rem 20rem; border: 1px solid var(--ink-15); border-radius: 12rem; text-decoration: none; color: var(--ink); font-size: 17rem;
  transition: background 200ms ease, border-color 200ms ease; }
.pk__link:hover { background: var(--pop); border-color: var(--pop); color: #0A0A12; }
.pk__link i { font-style: normal; opacity: 0.6; }
.pk__link:focus-visible { outline: 2px solid var(--pop); outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .pk__cue { animation: none; }
  .pk__scroll { scroll-behavior: auto; }
  .pk__glow { transition: none; }
}
</style>
