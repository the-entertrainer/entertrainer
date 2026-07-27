<script setup lang="ts">
/**
 * The shout.
 *
 * Two words, set enormous, with every letter spread edge to edge — the type
 * *is* the layout. Sizing is derived from the character count rather than a
 * fixed clamp, because the whole effect depends on the line reaching both
 * margins: a headline that stops short of the edge reads as text on a page,
 * and one that touches both reads as a poster.
 *
 * The letters are deliberately undersized against their slot (the 0.70 factor)
 * so `space-between` has residual room to distribute. That gap is the look.
 */
const LINE_A = 'INSTRUCTIONAL'.split('')
const LINE_B = 'DESIGNER'.split('')

const root = ref<HTMLElement | null>(null)
useScrollProgress(root)
</script>

<template>
  <section ref="root" class="wx">
    <div class="wx__type">
      <h1 class="wx__h1">
        <span class="sr-only">Entertrainer — instructional design by Naveen Jose</span>

        <span class="wx__line w-shout" :style="{ '--chars': LINE_A.length }" aria-hidden="true">
          <span v-for="(c, i) in LINE_A" :key="'a' + i" class="wx__c" :style="{ '--i': i }">{{ c }}</span>
        </span>

        <span class="wx__line w-shout" :style="{ '--chars': LINE_B.length + 1 }" aria-hidden="true">
          <span v-for="(c, i) in LINE_B" :key="'b' + i" class="wx__c" :style="{ '--i': i }">{{ c }}</span>
          <svg class="wx__star" viewBox="0 0 100 100" :style="{ '--i': LINE_B.length }">
            <path d="M50 0c4 27 19 42 46 46-27 4-42 19-46 50-4-31-19-46-50-50 31-4 46-19 50-46z" fill="currentColor" />
          </svg>
        </span>
      </h1>

      <p class="wx__sub w-prose">
        But fun. I build training people actually finish — and the tools that make it.
      </p>
    </div>

    <!-- The scroll cue lives outside the type block so it pins to the section
         floor rather than trailing the headline. -->
    <div class="wx__cue w-mono" aria-hidden="true">
      <span>Scroll</span><i />
    </div>
  </section>
</template>

<style scoped>
.wx {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  min-height: calc(100svh - 76rem);
  padding: clamp(40px, 9vh, 110px) var(--w-edge) 18rem;
  overflow: hidden;
}

.wx__h1 { margin: 0; }
.sr-only {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}

.wx__line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  width: 100%;
  color: var(--w-ink);
  /* The line fills the measure, then gets capped so it cannot run away on an
     ultrawide display. */
  font-size: min(calc((100vw - 2 * var(--w-edge)) / var(--chars) / 0.70), 268px);
}

/* Each letter rises on its own delay. The stagger is what makes a headline
   this large feel like it *arrived* rather than simply being present. */
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
  width: 0.5em;
  height: 0.5em;
  align-self: center;
  color: var(--w-accent);
  animation: wx-in 1s var(--w-ease) both, wx-spin 14s linear infinite;
  animation-delay: calc(var(--i) * 42ms), 0s;
}
@keyframes wx-spin { to { transform: rotate(360deg); } }

.wx__sub {
  max-width: 30ch;
  margin: clamp(26px, 4vh, 54px) 0 0;
  font-size: var(--w-lead);
  color: var(--w-ink-55);
  animation: wx-in 1s var(--w-ease) both;
  animation-delay: 620ms;
}

.wx__cue {
  display: flex;
  align-items: center;
  gap: 10rem;
  color: var(--w-ink-35);
}
.wx__cue i {
  display: block;
  width: 54rem;
  height: 1px;
  background: currentColor;
  transform-origin: left;
  animation: wx-cue 2.4s var(--w-ease-out) infinite;
}
@keyframes wx-cue {
  0%, 100% { transform: scaleX(0.3); opacity: 0.4; }
  50% { transform: scaleX(1); opacity: 1; }
}

@media (max-width: 720px) {
  .wx { min-height: calc(100svh - 54rem); }
  .wx__sub { max-width: 24ch; }
}

@media (prefers-reduced-motion: reduce) {
  .wx__c, .wx__sub { animation: none; }
  .wx__star { animation: none; }
  .wx__cue i { animation: none; transform: scaleX(1); }
}
</style>
