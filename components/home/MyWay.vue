<script setup lang="ts">
/**
 * The manifesto beat — the original's two-layer "catcher".
 *
 * Each word sits in its own clipped window holding two copies: a normal layer
 * entering from above and a distorted layer leaving below, both riding the
 * section's `--p` at different amplitudes so they pass through the window and
 * cross. The distorted copy is skewed and set in the red, which is what turns a
 * plain reveal into something that reads as interference.
 *
 * `--pc` (progress centred to -1 → 1) is the natural driver here: zero at the
 * moment the section sits mid-screen, signed either side of it.
 */
const WORDS = ['DESIGNING', 'LEARNING', 'THAT', 'STICKS']

const root = ref<HTMLElement | null>(null)
useWodProgress(root)
</script>

<template>
  <section ref="root" class="wm">
    <span class="wm__smiley" aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" stroke-width="4" />
        <circle cx="34" cy="38" r="6" fill="currentColor" />
        <circle cx="66" cy="38" r="6" fill="currentColor" />
        <path d="M28 60c6 12 38 12 44 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
      </svg>
    </span>

    <h2 class="wm__h">
      <span class="wm__sr">Designing learning that sticks</span>
      <span v-for="(w, i) in WORDS" :key="w" class="wm__win" :style="{ '--i': i }" aria-hidden="true">
        <span class="wm__layer wm__layer--distorted w-shout">{{ w }}</span>
        <span class="wm__layer wm__layer--normal w-shout">{{ w }}</span>
      </span>
    </h2>

    <p class="wm__note">From the hotel floor to the workbench — still noticing what makes it land.</p>
  </section>
</template>

<style scoped>
.wm {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 3;
  padding: var(--w-gap-myway) var(--w-edge);
  overflow: hidden;
}

.wm__smiley {
  display: block;
  width: 90rem;
  height: 90rem;
  margin-bottom: 60rem;
  color: var(--w-red);
  animation: wm-spin 10s linear infinite;
}
.wm__smiley svg { display: block; width: 100%; height: 100%; }
@keyframes wm-spin { to { transform: rotate(360deg); } }

.wm__h { margin: 0; display: flex; flex-direction: column; align-items: center; }
.wm__sr {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}

/* The window. Each word is clipped to its own line box, so the travel reads as
   the word rising out of nothing rather than sliding across the page. */
.wm__win {
  position: relative;
  display: block;
  height: 0.86em;
  font-size: var(--w-catcher);
  line-height: 0.86;
  overflow: hidden;
}

.wm__layer { display: block; white-space: nowrap; will-change: transform; }

/* Enters from above. The `--i` stagger is what keeps the four lines from
   moving as one block. */
.wm__layer--normal {
  position: relative;
  color: var(--w-ink);
  transform: translateY(calc(var(--pc, 0) * (0.34 + var(--i) * 0.1) * 1em));
}

/* Leaves below, skewed, in the red — the interference layer. */
.wm__layer--distorted {
  position: absolute;
  inset: 0;
  color: var(--w-red);
  transform: skewY(-3deg) translateY(calc(var(--pc, 0) * (0.56 + var(--i) * 0.14) * 1em));
}

.wm__note {
  margin: 70rem 0 0;
  font-family: var(--w-mono);
  font-size: var(--w-chrome);
  letter-spacing: var(--w-track-chrome);
  text-transform: uppercase;
  color: var(--w-ink-55);
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .wm__smiley { animation: none; }
  .wm__layer--normal { transform: none; }
  .wm__layer--distorted { display: none; }
}
</style>
