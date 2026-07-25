<script setup lang="ts">
import { LAB_NAV, CONCEPTS } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: '11 F-Pattern', robots: 'noindex' })
const C = CONCEPTS[10]

/**
 * NN/g eye-tracking: 79% of users scan rather than read, and on text-heavy
 * pages the gaze traces an F — two horizontal sweeps at the top, then a
 * vertical run down the left edge. Everything that matters is therefore placed
 * on that path: headline on the first bar, value proposition on the second,
 * nav down the left stem. The overlay can be toggled so the structure is
 * arguable rather than asserted.
 */
const showPath = ref(true)
</script>

<template>
  <LabShell bg="#FFFFFF" ink="#141414" pop="#0057FF" display="'Archivo','DM Sans',sans-serif" :law="C.law">
    <div class="f">
      <svg v-if="showPath" class="f__overlay" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
        <!-- The F: two sweeps and a stem, drawn to scale over the real layout -->
        <path d="M6 13 L 92 13" class="f__bar" />
        <path d="M6 34 L 66 34" class="f__bar" />
        <path d="M6 13 L 6 92" class="f__stem" />
      </svg>

      <header class="f__b1">
        <h1 class="f__h1">Learning that lands.</h1>
      </header>

      <p class="f__b2">
        Naveen Jose — a certified instructional designer who also builds the thing.
        Strategy, storyboards, and the working software at the end of it.
      </p>

      <nav class="f__stemnav" aria-label="Sections">
        <NuxtLink v-for="it in LAB_NAV" :key="it.href" :to="it.href" class="f__link">
          <span class="f__n">{{ it.n }}</span>
          <span class="f__l">{{ it.label }}</span>
          <span class="f__d">{{ it.desc }}</span>
        </NuxtLink>
      </nav>

      <aside class="f__aside">
        <p><b>79%</b> of people scan. Only 16% read word by word.</p>
        <p>You have roughly <b>10 seconds</b> to land a value proposition before they leave.</p>
        <p class="f__dim">Everything above sits on the scan path. Nothing important is off it.</p>
        <button class="f__toggle" :aria-pressed="showPath" @click="showPath = !showPath">
          {{ showPath ? 'Hide' : 'Show' }} scan path
        </button>
      </aside>
    </div>
  </LabShell>
</template>

<style scoped>
.f { position: absolute; inset: 0; overflow-y: auto;
  display: grid; grid-template-columns: minmax(0, 1fr) 260rem; grid-template-rows: auto auto 1fr;
  gap: 0 40rem; padding: 60rem clamp(18rem, 4vw, 56rem) 74rem; align-content: start; }

.f__overlay { position: absolute; inset: 0; z-index: 5; pointer-events: none; width: 100%; height: 100%; }
.f__bar, .f__stem { fill: none; stroke: var(--pop); stroke-width: 0.7; opacity: 0.30; vector-effect: non-scaling-stroke; stroke-linecap: round; }

/* First horizontal sweep */
.f__b1 { grid-column: 1 / -1; padding-top: 22rem; }
.f__h1 { margin: 0; font-size: clamp(34rem, 7vw, 88rem); line-height: 0.98; letter-spacing: -0.04em; font-weight: 900; text-transform: uppercase; }
/* Second, shorter sweep */
.f__b2 { grid-column: 1 / 2; margin: 26rem 0 0; max-width: 52ch; font-family: 'DM Sans', sans-serif; font-size: clamp(14rem, 1.5vw, 18rem); line-height: 1.5; color: var(--ink-70); }

/* The vertical stem */
/* align-content: start stops the rows stretching to fill the 1fr track, which
   was pushing each description far below its own label. */
.f__stemnav { grid-column: 1 / 2; margin-top: 34rem; display: grid; gap: 2rem; align-content: start; max-width: 520rem; }
.f__link { display: grid; grid-template-columns: 34rem 1fr; grid-template-areas: 'n l' '. d'; gap: 1rem 10rem; padding: 13rem 10rem 13rem 0; border-top: 1px solid var(--ink-15); text-decoration: none; color: var(--ink); transition: padding-left 180ms cubic-bezier(.2,.8,.2,1), background 180ms ease; }
.f__link:last-child { border-bottom: 1px solid var(--ink-15); }
.f__link:hover { padding-left: 10rem; background: rgba(0,87,255,0.05); }
.f__link:focus-visible { outline: 2px solid var(--pop); outline-offset: -2px; }
.f__n { grid-area: n; font-family: 'DM Sans', sans-serif; font-size: 10.5rem; color: var(--pop); letter-spacing: 0.1em; padding-top: 4rem; }
.f__l { grid-area: l; font-size: 22rem; font-weight: 700; letter-spacing: -0.02em; }
.f__d { grid-area: d; font-family: 'DM Sans', sans-serif; font-size: 12rem; color: var(--ink-45); }

.f__aside { grid-column: 2 / 3; grid-row: 2 / 4; margin-top: 26rem; font-family: 'DM Sans', sans-serif; font-size: 12rem; line-height: 1.55; color: var(--ink-45); display: grid; gap: 12rem; align-content: start; }
.f__aside b { color: var(--pop); font-size: 15rem; }
.f__dim { opacity: 0.75; }
.f__toggle { justify-self: start; font-family: 'DM Sans', sans-serif; font-size: 11.5rem; font-weight: 600; color: var(--ink); background: transparent; border: 1px solid var(--ink-15); border-radius: 999rem; padding: 8rem 14rem; cursor: pointer; }
.f__toggle[aria-pressed='true'] { background: var(--pop); border-color: var(--pop); color: #fff; }
.f__toggle:focus-visible { outline: 2px solid var(--pop); outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) { .f__link { transition: none; } }
@media (max-width: 860px) {
  .f { grid-template-columns: 1fr; }
  .f__b2, .f__stemnav, .f__aside { grid-column: 1 / -1; }
  .f__aside { grid-row: auto; margin-top: 28rem; }
  .f__overlay { display: none; }
}
</style>
