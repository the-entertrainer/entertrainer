<script setup lang="ts">
/**
 * The close.
 *
 * Two devices, both taken straight from the reference:
 *
 *   - the silence before it (`--w-gap-breath` of top padding, and nothing in
 *     it). An empty screen before the ask is the most confident thing a
 *     portfolio can do, and it is free;
 *   - the per-character wordmark, where every letter carries its own
 *     `--move-delay` so the line ripples continuously rather than animating as
 *     a block.
 *
 * The address comes from the content store rather than a literal, so this page
 * and the menu can never disagree about how to reach him.
 */
import { useContentStore } from '~/stores/content'

const MARK = "LET'S BUILD".split('')
const content = useContentStore()
</script>

<template>
  <section id="contact" class="wc">
    <span class="w-mono wc__eyebrow">04 — Contact</span>

    <p class="wc__mark w-shout" aria-label="Let's build">
      <span v-for="(c, i) in MARK" :key="i" class="wc__c"
            :class="{ 'wc__c--sp': c === ' ' }"
            :style="{ '--d': (i * 90) + 'ms' }" aria-hidden="true">{{ c === ' ' ? '&nbsp;' : c }}</span>
    </p>

    <svg class="wc__star" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 0c4 27 19 42 46 46-27 4-42 19-46 50-4-31-19-46-50-50 31-4 46-19 50-46z" fill="currentColor" />
    </svg>

    <p class="w-prose wc__lead">
      Got a course that isn't landing, a tool that doesn't exist yet, or an idea
      you can't quite explain? Those are my three favourite emails.
    </p>

    <a :href="`mailto:${content.email}`" class="wc__go">
      <span class="w-mono">Say hello</span>
      <span class="wc__go-mail w-mono">{{ content.email }}</span>
    </a>
  </section>
</template>

<style scoped>
.wc {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 3;
  /* The breath. Everything above it has stopped; nothing has started yet. */
  padding: var(--w-gap-breath) var(--w-edge) var(--w-gap-section);
  text-align: center;
}

.wc__eyebrow { color: var(--w-ink-35); margin-bottom: 34rem; }

.wc__mark {
  display: flex;
  justify-content: center;
  margin: 0;
  font-size: clamp(44px, 11vw, 168px);
  color: var(--w-ink);
}
.wc__c {
  display: block;
  animation: wc-bob 2s var(--w-ease-out) infinite;
  animation-delay: var(--d);
}
.wc__c--sp { width: 0.28em; }
@keyframes wc-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-0.09em); }
}

.wc__star {
  width: clamp(28px, 4vw, 54px);
  height: clamp(28px, 4vw, 54px);
  margin-top: 26rem;
  color: var(--w-accent);
  animation: wc-float 10s cubic-bezier(.455, .03, .515, .955) infinite;
}
@keyframes wc-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-16rem) rotate(180deg); }
}

.wc__lead {
  max-width: 32ch;
  margin: 34rem 0 0;
  font-size: var(--w-lead);
  color: var(--w-ink-55);
}

.wc__go {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 10rem;
  margin-top: 46rem;
  padding: 22rem 40rem;
  border: 1px solid var(--w-ink);
  color: var(--w-ink);
  transition: background 0.4s var(--w-ease), color 0.4s var(--w-ease), transform 0.4s var(--w-ease);
}
.wc__go:hover { background: var(--w-accent); border-color: var(--w-accent); color: var(--w-on-accent); transform: translateY(-3rem); }
.wc__go:focus-visible { outline: 2px solid var(--w-ink); outline-offset: 4px; }
.wc__go-mail { font-size: 15rem; letter-spacing: 0.02em; text-transform: none; }

@media (prefers-reduced-motion: reduce) {
  .wc__c, .wc__star { animation: none; }
  .wc__go:hover { transform: none; }
}
</style>
