<script setup lang="ts">
/**
 * The close.
 *
 * Three devices from the original, all cheap and all load-bearing:
 *   - 880px of silence above it, and nothing in that silence. An empty screen
 *     before the ask is the most confident move a portfolio can make;
 *   - a per-character wordmark where every letter carries its own move and
 *     toggle delay, so the line ripples continuously rather than animating as
 *     a block;
 *   - a star drifting on a 10s sine.
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
    <a :href="`mailto:${content.email}`" class="wc__go" aria-label="Email Naveen">
      <span>Go</span>
    </a>

    <p class="wc__mark w-shout" aria-label="Let's build">
      <span v-for="(c, i) in MARK" :key="i" class="wc__c"
            :class="{ 'wc__c--sp': c === ' ' }"
            :style="{ '--move-delay': (i * -160) + 'ms', '--toggle-delay': (i * -90) + 'ms' }"
            aria-hidden="true">{{ c === ' ' ? '&nbsp;' : c }}</span>
    </p>

    <svg class="wc__star" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 0c4 27 19 42 46 46-27 4-42 19-46 50-4-31-19-46-50-50 31-4 46-19 50-46z" fill="currentColor" />
    </svg>

    <p class="w-prose wc__lead">
      Got a course that isn't landing, a tool that doesn't exist yet, or an idea
      you can't quite explain? Those are my three favourite emails.
    </p>

    <a :href="`mailto:${content.email}`" class="wc__mail">{{ content.email }}</a>
  </section>
</template>

<style scoped>
.wc {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 3;
  /* The breath. Everything above has stopped; nothing has started yet. */
  padding: var(--w-gap-breath) var(--w-edge) var(--w-gap-section);
  text-align: center;
}

.wc__go {
  display: grid;
  place-items: center;
  width: 132rem;
  height: 132rem;
  margin-bottom: 60rem;
  border: 1px solid var(--w-ink);
  border-radius: 50%;
  font-family: var(--w-mono);
  font-size: var(--w-chrome-l);
  font-weight: 700;
  letter-spacing: var(--w-track-chrome);
  text-transform: uppercase;
  color: var(--w-ink);
  transition: background 0.4s var(--w-ease), color 0.4s var(--w-ease), scale 0.5s var(--w-ease-cubic);
}
.wc__go:hover { background: var(--w-red); border-color: var(--w-red); color: var(--w-paper); scale: 1.06; }

.wc__mark {
  display: flex;
  justify-content: center;
  margin: 0;
  font-size: min(11vw, 168px);
  color: var(--w-ink);
}
/* Two infinite cycles per character on independent negative delays — the
   offsets are what make the line ripple instead of pulse. */
.wc__c {
  display: block;
  animation:
    wc-up-down 2s infinite var(--move-delay),
    wc-toggle 2s linear infinite var(--toggle-delay);
}
.wc__c--sp { width: 0.28em; animation: none; }
@keyframes wc-up-down {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-0.1em); }
}
@keyframes wc-toggle {
  0%, 49.9% { color: var(--w-ink); }
  50%, 100% { color: var(--w-red); }
}

.wc__star {
  width: 54rem;
  height: 54rem;
  margin-top: 30rem;
  color: var(--w-red);
  animation: wc-float 10s var(--w-ease-sine) infinite;
}
@keyframes wc-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-18rem) rotate(180deg); }
}

.wc__lead { max-width: 32ch; margin: 40rem 0 0; font-size: var(--w-lead); color: var(--w-ink); }

.wc__mail {
  margin-top: 40rem;
  padding: 16rem 26rem;
  border: 1px solid var(--w-ink);
  font-family: var(--w-mono);
  font-size: var(--w-chrome-l);
  letter-spacing: var(--w-track-chrome);
  color: var(--w-ink);
  transition: background 0.4s var(--w-ease), color 0.4s var(--w-ease);
}
.wc__mail:hover { background: var(--w-ink); color: var(--w-paper); }

@media only screen and (max-width: 576px) {
  .wc__go { width: 96rem; height: 96rem; }
  .wc__mail { font-size: var(--w-chrome); word-break: break-all; }
}

@media (prefers-reduced-motion: reduce) {
  .wc__c, .wc__star { animation: none; }
  .wc__go:hover { scale: 1; }
}
</style>
