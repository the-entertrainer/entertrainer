<script setup lang="ts">
import { LAB_NAV, CONCEPTS } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: '05 The Odd One', robots: 'noindex' })
const C = CONCEPTS[4]

/**
 * Von Restorff (isolation) effect: in a homogeneous set, the item that violates
 * the pattern is disproportionately recalled. So the page builds a deliberately
 * monotonous field of tiles and lets exactly one break the rule — different
 * colour, different size, the only thing that moves. Clicking cycles which one
 * is isolated, which makes the mechanism impossible to miss.
 *
 * The isolate is also the only element allowed to animate, so peripheral motion
 * detection does the pointing rather than a label.
 */
const FIELD = 24
const odd = ref(0)
const items = computed(() => Array.from({ length: FIELD }, (_, i) => LAB_NAV[i % LAB_NAV.length]))
function cycle() { odd.value = (odd.value + 7) % FIELD }
</script>

<template>
  <LabShell bg="#141414" ink="#F2F0EC" pop="#FF4D00" display="'Archivo','DM Sans',sans-serif" :law="C.law">
    <div class="r">
      <header class="r__head">
        <h1 class="r__h1">Be the thing<br>they remember.</h1>
        <p class="r__sub">Twenty-four identical tiles. One breaks the rule — and it's the only one you'll recall tomorrow. That's the whole job.</p>
        <button class="r__cycle" @click="cycle">Isolate a different one →</button>
      </header>

      <div class="r__field" role="list">
        <NuxtLink v-for="(it, i) in items" :key="i" :to="it.href" class="r__tile"
                  :class="{ odd: i === odd }" role="listitem"
                  :aria-current="i === odd ? 'true' : undefined">
          <span class="r__n">{{ it.n }}</span>
          <span class="r__l">{{ it.label }}</span>
        </NuxtLink>
      </div>
    </div>
  </LabShell>
</template>

<style scoped>
.r { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(260rem, 380rem) 1fr; gap: clamp(24rem, 4vw, 62rem); align-items: center; padding: 62rem clamp(18rem, 4vw, 54rem) 74rem; }
.r__head { max-width: 40ch; }
.r__h1 { margin: 0; font-size: clamp(30rem, 4.4vw, 54rem); line-height: 1; letter-spacing: -0.035em; font-weight: 800; text-transform: uppercase; }
.r__sub { margin: 14rem 0 20rem; font-family: 'DM Sans', sans-serif; font-size: 13rem; line-height: 1.55; color: var(--ink-70); }
.r__cycle { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 12.5rem; color: #140A04; background: var(--pop); border: 0; border-radius: 999rem; padding: 12rem 22rem; cursor: pointer; transition: transform 180ms cubic-bezier(.2,.8,.2,1); }
.r__cycle:hover { transform: translateY(-2rem); }
.r__cycle:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }

.r__field { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6rem; align-content: center; }
.r__tile {
  aspect-ratio: 1; display: grid; place-content: center; gap: 3rem; text-align: center;
  border: 1px solid rgba(242,240,236,0.10); border-radius: 6rem; text-decoration: none;
  background: rgba(242,240,236,0.03); color: rgba(242,240,236,0.34);
  transition: background 160ms ease, color 160ms ease;
}
.r__tile:hover { background: rgba(242,240,236,0.08); color: rgba(242,240,236,0.7); }
.r__tile:focus-visible { outline: 2px solid var(--pop); outline-offset: 2px; }
.r__n { font-size: 8.5rem; letter-spacing: 0.12em; }
.r__l { font-size: 9.5rem; font-weight: 600; line-height: 1.1; }

/* The isolate: the only tile with colour, scale, and movement. */
.r__tile.odd {
  background: var(--pop); border-color: var(--pop); color: #140A04;
  scale: 1.16; z-index: 2; border-radius: 10rem;
  box-shadow: 0 12rem 34rem -12rem rgba(255,77,0,0.8);
  animation: r-pulse 2.4s ease-in-out infinite;
}
.r__tile.odd .r__n { opacity: 0.75; }
.r__tile.odd .r__l { font-size: 11rem; }
@keyframes r-pulse { 0%, 100% { scale: 1.16; } 50% { scale: 1.24; } }
@media (prefers-reduced-motion: reduce) {
  .r__tile.odd { animation: none; }
  .r__tile, .r__cycle { transition: none; }
}
@media (max-width: 820px) {
  .r { grid-template-columns: 1fr; align-content: center; gap: 26rem; }
  .r__field { grid-template-columns: repeat(6, 1fr); }
  .r__l { display: none; }
}
</style>
