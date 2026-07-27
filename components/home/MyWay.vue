<script setup lang="ts">
/**
 * The manifesto beat — the reference's two-layer "catcher".
 *
 * Four words, each in its own overflow-hidden line, each riding the section's
 * `--p` at a slightly different rate so the phrase assembles itself as you
 * arrive and comes apart as you leave. Behind each word sits a skewed, faded
 * duplicate travelling on a different coefficient: that ghost is what turns a
 * plain reveal into something that reads as distortion, and it costs one extra
 * span per line.
 *
 * The `--pc` written by useScrollProgress is already centred to -1 → 1, which
 * is exactly the shape this wants: 0 at the moment the section sits mid-screen,
 * signed either side of it.
 */
const WORDS = ['DESIGNING', 'LEARNING', 'THAT', 'STICKS']

const root = ref<HTMLElement | null>(null)
useScrollProgress(root)
</script>

<template>
  <section ref="root" class="wm">
    <h2 class="wm__h">
      <span class="sr-only">Designing learning that sticks</span>
      <span v-for="(w, i) in WORDS" :key="w" class="wm__line" :style="{ '--i': i }" aria-hidden="true">
        <span class="wm__ghost w-shout">{{ w }}</span>
        <span class="wm__word w-shout">{{ w }}</span>
      </span>
    </h2>

    <p class="w-mono wm__note">
      From the hotel floor to the workbench — still noticing what makes it land.
    </p>
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
  padding: var(--w-gap-breath) var(--w-edge);
  overflow: hidden;
}

.wm__h { margin: 0; display: flex; flex-direction: column; align-items: center; }
.sr-only {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}

/* The window. Each line clips its own word, so the travel reads as the word
   rising out of nothing rather than sliding across the page. */
.wm__line {
  position: relative;
  display: block;
  overflow: hidden;
  line-height: 0.86;
  /* A hair of vertical padding so the descender-free caps don't get shaved by
     the clip at large sizes. */
  padding-block: 0.04em;
}

.wm__word, .wm__ghost {
  display: block;
  font-size: var(--w-catcher);
  white-space: nowrap;
}

.wm__word {
  color: var(--w-ink);
  /* --i staggers the lines; the 0.34 factor keeps the travel inside the clip
     window so a word is never caught mid-air at rest. */
  translate: 0 calc(var(--pc, 0) * (0.34 + var(--i) * 0.11) * 1em);
  will-change: translate;
}

.wm__ghost {
  position: absolute;
  inset: 0;
  color: var(--w-accent);
  opacity: 0.42;
  transform: skewY(-3deg);
  translate: 0 calc(var(--pc, 0) * (0.52 + var(--i) * 0.14) * 1em);
  will-change: translate;
}

.wm__note {
  margin: clamp(40px, 7vh, 90px) 0 0;
  color: var(--w-ink-35);
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .wm__word, .wm__ghost { translate: none; }
  .wm__ghost { display: none; }
}
</style>
