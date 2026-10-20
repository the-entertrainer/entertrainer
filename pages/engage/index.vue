<script setup lang="ts">
useSeoMeta({
  title: 'Engage · Entertrainer',
  description: 'Short games and little detours — Stack, The Mind Reader, and AstroClock.',
  ogUrl: 'https://entertrainer.in/engage',
})

</script>

<template>
  <div class="engage">
    <EdStageHero
      variant="orbits"
      title="Engage"
      title-id="engage-title"
    />

    <ol class="engage__grid">
      <li class="engage__step" style="--step: 0">
        <NuxtLink to="/engage/stack" class="engage__card engage__card--stack">
          <span class="engage__icon engage__icon--stack" aria-hidden="true">
            <svg viewBox="0 0 48 48" width="34" height="34" fill="none" aria-hidden="true">
              <rect x="8" y="30" width="32" height="8" fill="currentColor"/>
              <rect x="12" y="20" width="24" height="8" fill="currentColor"/>
              <rect x="16" y="10" width="16" height="8" fill="var(--accent)" stroke="currentColor" stroke-width="2"/>
            </svg>
          </span>
          <span class="engage__card-text">
            <span class="engage__step-no">01</span><strong class="engage__card-name">Stack</strong>
            <span class="engage__card-blurb">Tap to drop. Only the overlap stays.</span>
          </span>
          <span class="engage__card-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </span>
        </NuxtLink>
      </li>
      <li class="engage__step" style="--step: 1">
        <NuxtLink to="/engage/read-my-mind" class="engage__card engage__card--mind-reader">
          <span class="engage__icon engage__icon--art" aria-hidden="true">
            <EdEditorialImage src="/engage/mind-reader.webp" alt="" />
          </span>
          <span class="engage__card-text">
            <span class="engage__step-no">02</span><strong class="engage__card-name">The Mind Reader</strong>
            <span class="engage__card-blurb">Example: 42. Add 4 + 2, subtract, and the mark is on 36.</span>
          </span>
          <span class="engage__card-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </span>
        </NuxtLink>
      </li>
      <li class="engage__step" style="--step: 2">
        <NuxtLink to="/engage/astroclock" class="engage__card engage__card--astroclock">
          <span class="engage__icon engage__icon--art" aria-hidden="true">
            <EdEditorialImage src="/engage/astroclock.webp" alt="" />
          </span>
          <span class="engage__card-text">
            <span class="engage__step-no">03</span><strong class="engage__card-name">AstroClock</strong>
            <span class="engage__card-blurb">Birth place and time. A live dial. What today is doing.</span>
          </span>
          <span class="engage__card-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </span>
        </NuxtLink>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.engage {
  min-height: calc(100dvh - var(--nav-h));
  max-width: var(--shell-max);
  margin: 0 auto;
  padding: var(--space-34) var(--shell-gutter) var(--space-89);
}

.engage__grid {
  list-style: none;
  margin: var(--space-21) 0 0;
  padding: 0;
  display: grid;
  gap: var(--space-13);
}

.engage__card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 20rem;
  align-items: center;
  gap: var(--space-21);
  padding: var(--space-21);
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-m);
  background: var(--paper);
  transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}

@media (hover: hover) {
  .engage__card:hover { background: var(--paper-2); border-color: var(--ink); transform: translateX(3rem); }
  .engage__card:hover .engage__card-arrow { transform: translate(2rem, -2rem); }
}

.engage__card:focus-visible {
  outline: 3rem solid var(--focus);
  outline-offset: 3rem;
}

.engage__icon {
  position: relative;
  flex-shrink: 0;
  width: var(--space-55);
  height: var(--space-55);
  padding: var(--space-8);
  box-sizing: border-box;
  border-radius: var(--radius-s);
  background: var(--accent);
  color: var(--accent-ink);
  border: var(--stroke) solid var(--ink);
}

.engage__icon--mind-reader {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
  padding: 7rem;
  color: #FFD43B;
  background: #161618;
}

.engage__icon--mind-reader i { display: grid; place-items: center; color: #FFD43B; }
.engage__icon--mind-reader i:nth-child(2n) { color: var(--accent); }
.engage__icon--mind-reader i:nth-child(3n) { color: var(--accent); }
.engage__icon--mind-reader svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.engage__icon--astroclock {
  display: grid;
  place-items: center;
  padding: 7rem;
  color: var(--accent-ink);
  background: var(--accent);
}
.engage__icon--astroclock svg {
  display: block;
  width: 100%;
  height: 100%;
}

/* Ink-and-cobalt cover art (Sogni MOSS Image SFT). Stack keeps its arcade tile. */
.engage__icon--art {
  width: var(--space-89, 89rem);
  height: var(--space-89, 89rem);
  padding: 0;
  overflow: hidden;
  background: #F7F1E4;
}
.engage__icon--art :deep(img) { display: block; width: 100%; height: 100%; object-fit: cover; }

.engage__icon--stack {
  display: grid;
  place-items: center;
  padding: 7rem;
  color: #FFD43B;
  background: #161618;
}
.engage__icon--stack svg { display: block; width: 100%; height: 100%; }


.engage__card-text {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4rem 12rem;
  min-width: 0;
}

.engage__card-name { font: 500 var(--type-body)/1.2 var(--font-display); flex-shrink: 0; }
.engage__card-blurb { flex: 1 1 260rem; min-width: 0; font-size: var(--type-small); line-height: 1.4; color: var(--muted); }
.engage__card-arrow { color: var(--muted); transition: transform var(--dur-fast) var(--ease-out); }

@media (max-width: 640px) {
  .engage__card { align-items: start; gap: var(--space-13); }
  .engage__card-arrow { align-self: center; }
}

/* One card settles before the next starts. 520ms move, 640ms gap. */
.engage__step {
  min-height: 0;
  animation: engage-card-step 520ms var(--ease-out) backwards;
  animation-delay: calc(var(--step) * 640ms);
}
@keyframes engage-card-step {
  0% {
    opacity: 0;
    max-height: 0;
    overflow: hidden;
    visibility: hidden;
    transform: translateY(10px);
  }
  16% { visibility: visible; }
  100% {
    opacity: 1;
    max-height: 320px;
    overflow: visible;
    visibility: visible;
    transform: none;
  }
}

.engage__step-no {
  display: inline-grid;
  place-items: center;
  min-width: 28rem;
  height: 22rem;
  padding: 0 6rem;
  border-radius: 999px;
  background: #161618;
  color: #FFD43B;
  font: 700 11rem/1 var(--font-mono);
  letter-spacing: 0.08em;
}

@media (prefers-reduced-motion: reduce) {
  .engage__step { animation: none; opacity: 1; transform: none; visibility: visible; }
  .engage__card, .engage__card-arrow { transition: none; }
  .engage__card:hover { transform: none; }
}

:global(html[data-reduce-motion="on"]) .engage__step {
  animation: none !important;
  opacity: 1 !important;
  transform: none !important;
  visibility: visible !important;
}

</style>
