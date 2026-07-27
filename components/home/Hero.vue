<script setup lang="ts">
/**
 * The shout: two words set edge to edge with a star between them, over a live
 * wave field, with a binary strip above and below.
 *
 * Sizing is derived from character count rather than a fixed clamp, because the
 * effect depends entirely on the line reaching both margins. A headline that
 * stops short reads as text on a page; one that touches both reads as a poster.
 * Letters are undersized against their slot (the 0.70 factor) so
 * `space-between` has residual room to distribute — that gap is the look.
 *
 * The black slab below the fold is the original's `.s__border`: a tall block
 * pinned at the section's bottom edge that slides up as you leave, so the hero
 * hands off to the next section instead of simply ending.
 */
const LINE_A = 'INSTRUCTIONAL'.split('')
const LINE_B = 'DESIGNER'.split('')

// Both lines are sized off the *longest* one, so they set at a single size and
// the shorter line spreads its letters to reach both margins instead of
// shrinking to fit. That even spread across unequal word lengths is the effect.
const CHARS = Math.max(LINE_A.length, LINE_B.length + 1)

const root = ref<HTMLElement | null>(null)
// The slab only travels as the hero *leaves*, so progress has to start when the
// section's bottom edge reaches the fold — not when its top does, which at page
// load is already halfway up the viewport.
useWodProgress(root, { start: 'bottom bottom', end: 'bottom top' })
</script>

<template>
  <section ref="root" class="wx">
    <HomeRule :seed="3" />

    <div class="wx__stage">
      <div class="wx__waves"><HomeWaves /></div>

      <h1 class="wx__h1">
        <span class="wx__sr">Entertrainer — instructional design by Naveen Jose</span>

        <span class="wx__line w-shout" :style="{ '--chars': CHARS }" aria-hidden="true">
          <span v-for="(c, i) in LINE_A" :key="'a' + i" class="wx__c" :style="{ '--i': i }">{{ c }}</span>
        </span>

        <span class="wx__line w-shout" :style="{ '--chars': CHARS }" aria-hidden="true">
          <span v-for="(c, i) in LINE_B" :key="'b' + i" class="wx__c" :style="{ '--i': i }">{{ c }}</span>
          <svg class="wx__star" viewBox="0 0 100 100" :style="{ '--i': LINE_B.length }">
            <path d="M50 0c4 27 19 42 46 46-27 4-42 19-46 50-4-31-19-46-50-50 31-4 46-19 50-46z" fill="currentColor" />
          </svg>
        </span>
      </h1>
    </div>

    <HomeRule :seed="11" />

    <!-- Slides up out of the fold as the hero leaves. -->
    <span class="wx__slab" aria-hidden="true" />
  </section>
</template>

<style scoped>
.wx {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 4;
  min-height: calc(100svh - var(--w-head-h) - 1px);
}
.wx__sr {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}

.wx__stage {
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  flex: 1 1 auto;
  padding: 0 var(--w-edge);
}
.wx__waves { position: absolute; inset: 0; z-index: 0; pointer-events: auto; }

.wx__h1 { position: relative; z-index: 1; margin: 0; pointer-events: none; }

.wx__line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  width: 100%;
  color: var(--w-ink);
  font-size: min(calc((100vw - 2 * var(--w-edge)) / var(--chars) / 0.70), 296px);
  line-height: 0.8;
}

/* Each letter arrives on its own delay, on the house curve. */
.wx__c, .wx__star {
  display: block;
  animation: wx-in 1s var(--w-ease) both;
  animation-delay: calc(var(--i) * 42ms);
}
@keyframes wx-in {
  from { opacity: 0; transform: translateY(0.42em); }
  to { opacity: 1; transform: none; }
}

.wx__star {
  width: 0.46em;
  height: 0.46em;
  align-self: center;
  color: var(--w-red);
  animation: wx-in 1s var(--w-ease) both, wx-spin 10s linear infinite;
  animation-delay: calc(var(--i) * 42ms), 0s;
}
@keyframes wx-spin { to { transform: rotate(360deg); } }

.wx__slab {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 640rem;
  background: var(--w-ink);
  transform: translateY(calc(var(--p, 0) * -100%));
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .wx__c, .wx__star { animation: none; }
  .wx__slab { transform: none; }
}
</style>
