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

    <template #bottom="{ active, index, goToItem, items }">
      <div class="h-sheet">
        <!-- The cards are the interface. No title (the artwork is the title), no
             button (the card is the button), no index (the stack is the index).
             What is left is the one line the artwork cannot say — what the
             section actually contains — and a counter to say where you are. -->
        <Transition name="h" mode="out-in">
          <div :key="active.href" class="h-cap">
            <p class="h-desc">{{ active.desc }}</p>
            <p class="h-count" aria-hidden="true">
              <span class="h-count__n">{{ String((index % 4) + 1).padStart(2, '0') }}</span>
              <span class="h-count__t">/ 04</span>
            </p>
          </div>
        </Transition>

        <!-- The stack is a canvas, so this is the only navigation assistive tech
             and the keyboard can reach. It is off-screen until focused rather
             than hidden outright: tabbing lands on a real, visible link, and
             focusing one turns the tower to that card so the two never disagree
             about where you are. -->
        <nav class="h-a11y" aria-label="Sections">
          <NuxtLink v-for="(it, i) in items" :key="it.href" :to="it.href"
                    :aria-current="index % 4 === i ? 'page' : undefined"
                    @focus="goToItem(i)">{{ it.label }}</NuxtLink>
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
   Almost nothing. The stack is the interface: the artwork is the title, the
   card is the button, and the position in the stack is the index — so all three
   of those left the page. What remains is the one line the artwork cannot say
   and a counter to locate you. */
.h-sheet { display: flex; flex-direction: column; align-items: center; gap: 12rem; max-width: 720rem; margin: 0 auto; }
.h-cap { display: flex; flex-direction: column; align-items: center; gap: 10rem; }
.h-desc {
  font-family: 'DM Sans', sans-serif; font-size: clamp(13rem, 3.5vw, 16rem);
  line-height: 1.5; margin: 0; max-width: 34ch; color: var(--ink-60); text-align: center;
}
.h-count {
  display: flex; align-items: baseline; gap: 5rem; margin: 0;
  font-family: var(--display); font-weight: 700; letter-spacing: 0.1em;
  color: var(--ink-35); font-variant-numeric: tabular-nums;
}
.h-count__n { font-size: 15rem; color: var(--ink); }
.h-count__t { font-size: 10.5rem; }

/* Off-screen until focused, not hidden. Tabbing has to land on something a
   sighted keyboard user can actually see, and a canvas cannot be that. */
.h-a11y a {
  position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;
}
.h-a11y a:focus-visible {
  position: fixed; left: 50%; translate: -50% 0; bottom: calc(18rem + var(--safe-bottom));
  width: auto; height: auto; z-index: 60;
  display: inline-flex; align-items: center; min-height: 44rem; box-sizing: border-box;
  padding: 12rem 22rem; border-radius: 999rem;
  background: var(--ink); color: var(--bg);
  font-family: var(--display); font-weight: 700; font-size: 13rem;
  outline: 2px solid var(--ink); outline-offset: 3px;
}

.h-enter-active { transition: opacity var(--dur-mid) var(--ease-out), transform var(--dur-slow) var(--ease-expo-out); }
.h-leave-active { transition: opacity var(--dur-fast) var(--ease-in), transform var(--dur-fast) var(--ease-in); }
.h-enter-from { opacity: 0; transform: translateY(18rem); }
.h-leave-to { opacity: 0; transform: translateY(-12rem); }

/* Phones: trade the description and the long labels for vertical room — on a
   640px-tall screen every line of chrome is a line the cards don't get. */
@media (max-width: 560px) {
  .h-role { display: none; }
}

/* Landscape phones have height to spare in exactly the wrong direction: the
   stacked sheet took 279 of 390 pixels and left the cards a letterbox. Lay it
   out along the long axis instead — caption, action, index, one row. */
@media (orientation: landscape) and (max-height: 520px) {
  .h-sheet { flex-direction: row; align-items: center; justify-content: space-between; gap: 20rem; max-width: none; }
  .h-desc { text-align: left; min-width: 0; margin: 0; }
  .h-role { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .h-enter-active, .h-leave-active { transition: opacity var(--dur-fast) linear; }
  .h-enter-from, .h-leave-to { transform: none; }
}
</style>
