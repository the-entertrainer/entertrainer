<script setup lang="ts">
import { useHomeViewStore } from '~/stores/homeview'
import { HOME_THEMES } from '~/utils/homeThemes'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Entertrainer — Instructional Design by Naveen Jose',
  description: 'The portfolio of Naveen Jose, a certified instructional designer who builds learning experiences that feel human, plus free web apps for L&D teams.',
  ogTitle: 'Entertrainer — Instructional Design by Naveen Jose',
  ogDescription: 'Learning experiences that feel human, plus free web apps for L&D teams.',
  ogUrl: 'https://entertrainer.in/'
})

// Blackout: pure monochrome, bitmap type, everything lit by bloom. The site
// tokens carry the same palette, so the stage and the editorial pages are one
// place. Swap this index to preview any of the other directions.
const theme = HOME_THEMES[0]

const homeViewStore = useHomeViewStore()
homeViewStore.setIsHome(true)

// No sub-sections on the home route any more — acknowledge the menu's signals
// so the store never latches.
watch(() => homeViewStore.pendingBack, (p) => { if (p) homeViewStore.ackBack() })
watch(() => homeViewStore.pendingHome, (p) => { if (p) homeViewStore.ackHome() })
</script>

<template>
  <HomeTower :theme="theme">
    <!-- Top chrome: identity only. Everything operable lives at the bottom,
         inside thumb reach. -->
    <template #top>
      <h1 class="h-sr">Entertrainer — instructional design by Naveen Jose</h1>
      <div class="h-brand">
        <span class="h-mark">entertrainer</span>
        <span class="h-role">Instructional design, built by hand</span>
      </div>
    </template>

    <template #bottom="{ active, index, goToItem, open, items }">
      <div class="h-sheet">
        <Transition name="h" mode="out-in">
          <div :key="active.href" class="h-cap">
            <p class="h-title">{{ active.label }}</p>
            <p class="h-desc">{{ active.desc }}</p>
          </div>
        </Transition>

        <button class="h-open" @click="open(active.href)">
          <span class="h-open__t">Open</span>
          <span class="h-open__a" aria-hidden="true">→</span>
        </button>

        <!-- The index is also the site's real navigation: four honest links, so
             the whole homepage is operable by keyboard and screen reader even
             though the stack itself is a canvas. Hover or focus slides the
             tower to that card, which keeps the two in sync without the links
             pretending to be buttons. -->
        <nav class="h-index" aria-label="Sections">
          <NuxtLink v-for="(it, i) in items" :key="it.href" :to="it.href" class="h-slot pixel-edge"
                    :class="{ on: index % 4 === i }"
                    :aria-current="index % 4 === i ? 'page' : undefined"
                    :aria-label="it.label"
                    @mouseenter="goToItem(i)" @focus="goToItem(i)">
            <span class="h-slot__rule" aria-hidden="true" />
            <span class="h-slot__txt" aria-hidden="true">
              <span class="h-slot__n">{{ it.n }}</span>
              <span class="h-slot__l"><span class="h-slot__full">{{ it.label }}</span><span class="h-slot__short">{{ it.short }}</span></span>
            </span>
          </NuxtLink>
        </nav>
      </div>
    </template>
  </HomeTower>
</template>

<style scoped>
.h-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.h-brand { display: flex; flex-direction: column; align-items: center; gap: 3rem; text-align: center; }
.h-mark { font-family: var(--display); font-weight: 700; font-size: 15rem; letter-spacing: 0.02em; color: var(--ink); }
.h-role { font-family: var(--mono-font); font-weight: 500; font-size: 10.5rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-35); }

/* ── Bottom chrome ────────────────────────────────────────────────────────
   Quiet on purpose. The stack is the piece; the chrome's job is to name what
   is in front, offer the way in, and index the rest — then get out of the way.
   The previous version fought the glass: a neon pill button with a coloured
   glow, four bordered chips that read as a form control, and an all-caps hint,
   all stacked in four bright rows under a scene built out of paper and light.
   Ink on paper, hairlines, and one 2px accent is the whole vocabulary now. */
.h-sheet { display: flex; flex-direction: column; align-items: center; gap: 18rem; max-width: 720rem; margin: 0 auto; }
.h-cap { text-align: center; }
/* A bitmap face carries far more ink per em than a serif and cannot be tracked
   tight, so the card title sits well below where the old display size was —
   "Instructional Design" set at 52px in Silkscreen simply does not fit. */
.h-title { font-family: var(--display); font-weight: 400; font-size: clamp(17rem, 2.9vw, 30rem); line-height: 1.25; letter-spacing: 0.01em; margin: 0; color: var(--ink); text-shadow: 0 0 26rem rgba(255,255,255,0.22); }
.h-desc { font-family: 'DM Sans', sans-serif; font-size: 13rem; line-height: 1.5; margin: 8rem auto 0; max-width: 42ch; color: var(--ink-60); }

/* The way in: type, not a button. A rule that grows under it on hover is the
   whole affordance — no fill, no shadow, nothing to clash with the scene. */
.h-open {
  display: inline-flex; align-items: center; gap: 10rem;
  min-height: 44rem; padding: 0 2rem;
  background: none; border: 0; cursor: pointer; position: relative;
  font-family: var(--mono-font); font-weight: 500; font-size: 11.5rem;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink);
  -webkit-tap-highlight-color: transparent;
}
.h-open::after {
  content: ''; position: absolute; left: 2rem; right: 2rem; bottom: 9rem;
  height: 1px; background: currentColor; opacity: 0.28;
  transform-origin: left; transition: opacity var(--dur-fast) var(--ease-out);
}
.h-open__a { display: inline-block; transition: translate var(--dur-fast) var(--ease-out); }
.h-open:hover::after { opacity: 0.85; }
.h-open:hover .h-open__a { translate: 5rem 0; }
.h-open:focus-visible { outline: 2px solid var(--ink); outline-offset: 4px; border-radius: 4rem; }

/* ── Index / navigation ───────────────────────────────────────────────────
   Four real links on hairline rails. Each is a full-width column so the touch
   target stays well past 44px on both axes while the ink on screen is only a
   rule and two words. */
.h-index { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10rem; width: 100%; }
.h-slot {
  display: flex; flex-direction: column; gap: 9rem;
  min-height: 46rem; padding: 8rem 10rem 9rem;
  color: var(--ink); text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  /* Chamfered like the rest of the bitmap chrome. Each slot is a lens over the
     stage, so the field keeps drifting behind the index. */
  --px-step: 6px;
  background: rgba(255,255,255,0.035);
  backdrop-filter: blur(10px) saturate(1.3) brightness(1.08);
  -webkit-backdrop-filter: blur(10px) saturate(1.3) brightness(1.08);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10);
  transition: background var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
}
.h-slot.on { background: rgba(255,255,255,0.085); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.30), 0 0 22rem -8rem rgba(255,255,255,0.6); }
/* Full-bleed to the panel's own edge. Inset by the padding it read as a stray
   floating line inside a box rather than as the panel's status bar. */
.h-slot__rule {
  display: block; height: 3px; opacity: 0.16;
  margin: -8rem -10rem 0; background: currentColor;
  transition: opacity var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
}
.h-slot__txt { display: flex; align-items: baseline; gap: 7rem; opacity: 0.42; transition: opacity var(--dur-fast) var(--ease-out); }
.h-slot__n { font-family: var(--mono-font); font-weight: 500; font-size: 9.5rem; letter-spacing: 0.1em; }
.h-slot__l { font-family: 'DM Sans', sans-serif; font-size: 12rem; font-weight: 500; line-height: 1.1; letter-spacing: -0.01em; }
.h-slot__short { display: none; }
.h-slot.on .h-slot__rule { opacity: 1; background: var(--pop); }
.h-slot.on .h-slot__txt { opacity: 1; }
.h-slot:focus-visible { outline: 2px solid var(--ink); outline-offset: 4px; border-radius: 4rem; }
@media (hover: hover) {
  .h-slot:hover { background: rgba(255,255,255,0.07); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.22); }
  .h-slot:hover .h-slot__rule { opacity: 0.5; }
  .h-slot:hover .h-slot__txt { opacity: 0.8; }
  .h-slot.on:hover .h-slot__rule { opacity: 1; }
}

.h-enter-active, .h-leave-active { transition: opacity 0.3s ease, transform 0.5s cubic-bezier(.19,1,.22,1); }
.h-enter-from { opacity: 0; transform: translateY(18rem); }
.h-leave-to { opacity: 0; transform: translateY(-12rem); }

/* Phones: trade the description and the long labels for vertical room — on a
   640px-tall screen every line of chrome is a line the cards don't get. */
@media (max-width: 560px) {
  .h-role { display: none; }
  .h-desc { display: none; }
  .h-sheet { gap: 15rem; }
  .h-index { gap: 7rem; }
  .h-slot__full { display: none; }
  .h-slot__short { display: inline; }
}

/* Landscape phones have height to spare in exactly the wrong direction: the
   stacked sheet took 279 of 390 pixels and left the cards a letterbox. Lay it
   out along the long axis instead — caption, action, index, one row. */
@media (orientation: landscape) and (max-height: 520px) {
  .h-sheet { flex-direction: row; align-items: center; justify-content: space-between; gap: 20rem; max-width: none; }
  .h-cap { text-align: left; min-width: 0; flex: 1 1 auto; }
  .h-title { font-size: 24rem; }
  .h-desc { display: none; }
  .h-open { flex: 0 0 auto; }
  .h-index { width: auto; flex: 0 0 auto; grid-template-columns: repeat(4, 66rem); }
  .h-slot__full { display: none; }
  .h-slot__short { display: inline; }
  .h-role { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .h-enter-active, .h-leave-active,
  .h-open::after, .h-open__a, .h-slot__rule, .h-slot__txt { transition: none; }
}
</style>
