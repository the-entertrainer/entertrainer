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

// Electric Cream: the bold-and-playful language applied to the site's existing
// warm-paper identity, so the homepage and the editorial pages still read as
// one place. Swap this index to preview any of the ten directions.
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

        <button class="h-cta" @click="open(active.href)">
          Open <span class="h-cta__l">{{ active.label }}</span> <span aria-hidden="true">→</span>
        </button>

        <p class="h-hint" aria-hidden="true">
          <span class="h-hint__touch">swipe to browse · tap a card</span>
          <span class="h-hint__fine">scroll or drag · click a card</span>
        </p>

        <!-- The pager is also the site's real navigation: four honest links, so
             the whole homepage is operable by keyboard and screen reader even
             though the stack itself is a canvas. Hover or focus slides the
             tower to that card, which keeps the two in sync without the links
             pretending to be buttons. -->
        <nav class="h-pager" aria-label="Sections">
          <NuxtLink v-for="(it, i) in items" :key="it.href" :to="it.href" class="h-chip"
                    :class="{ on: index % 4 === i }"
                    :aria-current="index % 4 === i ? 'page' : undefined"
                    :aria-label="it.label"
                    @mouseenter="goToItem(i)" @focus="goToItem(i)">
            <!-- The visible text abbreviates on narrow screens; the accessible
                 name is pinned to the full label so it never abbreviates with it. -->
            <span class="h-chip__n" aria-hidden="true">{{ it.n }}</span>
            <span class="h-chip__l" aria-hidden="true">
              <span class="h-chip__full">{{ it.label }}</span><span class="h-chip__short">{{ it.short }}</span>
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
.h-mark { font-family: var(--display); font-weight: 400; font-size: 17rem; letter-spacing: -0.01em; color: var(--ink); }
.h-role { font-family: var(--mono-font); font-weight: 500; font-size: 10.5rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-35); }

/* ── Bottom sheet ─────────────────────────────────────────────────────────
   Everything you can act on is here, in the lower third: the label of the
   card in front, the way into it, and the four destinations. Nothing needs a
   reach past the middle of a phone screen. */
.h-sheet { display: flex; flex-direction: column; align-items: center; gap: 14rem; max-width: 640rem; margin: 0 auto; }
.h-cap { text-align: center; }
.h-title { font-family: var(--display); font-weight: 400; font-size: clamp(30rem, 7.4vw, 66rem); line-height: 1.0; letter-spacing: -0.03em; margin: 0; color: var(--ink); }
.h-desc { font-family: 'DM Sans', sans-serif; font-size: 13.5rem; line-height: 1.5; margin: 8rem auto 0; max-width: 40ch; color: var(--ink-60); }

.h-cta {
  font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 14rem;
  display: inline-flex; align-items: center; gap: 6rem; min-height: 48rem;
  color: var(--on-pop); background: var(--pop); border: 0; border-radius: 999rem;
  padding: 12rem 26rem; cursor: pointer; box-shadow: 0 10rem 30rem -12rem var(--pop);
  transition: transform 0.22s cubic-bezier(.19,1,.22,1), box-shadow 0.22s;
}
.h-cta span { display: inline-block; transition: translate 0.22s cubic-bezier(.19,1,.22,1); }
.h-cta:hover { transform: translateY(-3rem); box-shadow: 0 16rem 36rem -12rem var(--pop); }
.h-cta:hover span:last-child { translate: 4rem 0; }
.h-cta:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }

.h-hint { font-family: var(--mono-font); font-weight: 500; font-size: 10rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-35); margin: 0; text-align: center; }
/* Name the gesture the device actually has — telling a desktop visitor to
   swipe is the sort of thing that makes an interface feel unreliable. */
.h-hint__fine { display: none; }
@media (hover: hover) and (pointer: fine) {
  .h-hint__touch { display: none; }
  .h-hint__fine { display: inline; }
}

/* ── Pager / navigation ───────────────────────────────────────────────────
   Four real links, sized past the 44px touch floor on every axis, spread the
   full width so each one is a big, unambiguous target rather than a tick mark. */
.h-pager { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6rem; width: 100%; }
.h-chip {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3rem;
  min-height: 52rem; padding: 8rem 4rem; border-radius: 14rem;
  border: 1px solid var(--ink-12); background: transparent;
  color: var(--ink-60); text-decoration: none; text-align: center;
  transition: color 0.22s, background 0.22s, border-color 0.22s;
  -webkit-tap-highlight-color: transparent;
}
.h-chip__n { font-family: var(--mono-font); font-weight: 500; font-size: 9.5rem; letter-spacing: 0.12em; opacity: 0.7; }
.h-chip__l { font-family: 'DM Sans', sans-serif; font-size: 12.5rem; font-weight: 600; line-height: 1.1; }
.h-chip__short { display: none; }
.h-chip.on { color: var(--on-pop); background: var(--pop); border-color: var(--pop); }
.h-chip:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
@media (hover: hover) { .h-chip:hover { color: var(--ink); border-color: var(--ink-35); } .h-chip.on:hover { color: var(--on-pop); } }

.h-enter-active, .h-leave-active { transition: opacity 0.3s ease, transform 0.5s cubic-bezier(.19,1,.22,1); }
.h-enter-from { opacity: 0; transform: translateY(18rem); }
.h-leave-to { opacity: 0; transform: translateY(-12rem); }

/* Phones: trade the description and the long labels for vertical room — on a
   640px-tall screen every line of chrome is a line the cards don't get. */
@media (max-width: 560px) {
  .h-role { display: none; }
  .h-desc { display: none; }
  .h-sheet { gap: 12rem; }
  .h-chip__full { display: none; }
  .h-chip__short { display: inline; }
}
@media (max-width: 380px) { .h-hint { display: none; } }

/* Landscape phones have height to spare in exactly the wrong direction: the
   stacked sheet took 279 of 390 pixels and left the cards a letterbox. Lay it
   out along the long axis instead — caption, action, pager, one row. */
@media (orientation: landscape) and (max-height: 520px) {
  .h-sheet { flex-direction: row; align-items: center; justify-content: space-between; gap: 16rem; max-width: none; }
  .h-cap { text-align: left; min-width: 0; flex: 1 1 auto; }
  .h-title { font-size: 26rem; }
  .h-desc, .h-hint { display: none; }
  .h-cta { flex: 0 0 auto; min-height: 44rem; padding: 10rem 20rem; }
  .h-pager { width: auto; flex: 0 0 auto; grid-template-columns: repeat(4, 62rem); }
  .h-chip__full { display: none; }
  .h-chip__short { display: inline; }
  .h-role { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .h-enter-active, .h-leave-active, .h-cta, .h-cta span, .h-chip { transition: none; }
  .h-cta:hover { transform: none; }
}
</style>
