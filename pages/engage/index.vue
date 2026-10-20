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
          <span class="engage__icon" aria-hidden="true"><EngageAppIcon app="stack" /></span>
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
          <span class="engage__icon" aria-hidden="true"><EngageAppIcon app="mind-reader" /></span>
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
          <span class="engage__icon" aria-hidden="true"><EngageAppIcon app="astroclock" /></span>
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
  .engage__card:hover .engage__icon { transform: translate(-3rem, -3rem); filter: drop-shadow(5rem 5rem 0 #2F5BD8); }
  .engage__card:hover:active .engage__icon { transform: translate(1rem, 1rem); filter: drop-shadow(0 0 0 #2F5BD8); }
}

.engage__card:focus-visible {
  outline: 3rem solid var(--focus);
  outline-offset: 3rem;
}

.engage__icon {
  position: relative;
  flex-shrink: 0;
  display: block;
  width: var(--space-55);
  height: var(--space-55);
  /* App-icon tile (EngageAppIcon): yellow squircle, ink glyph. Signature: a
     cobalt misregistration, like a second print plate, slides out under the
     squircle on hover (drop-shadow follows its shape) and the tile presses
     flat on tap like a stamp. */
  filter: drop-shadow(0 0 0 #2F5BD8);
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1), filter 220ms cubic-bezier(0.22, 1, 0.36, 1);
}
.engage__card:focus-visible .engage__icon { transform: translate(-3rem, -3rem); filter: drop-shadow(5rem 5rem 0 #2F5BD8); }
.engage__card:active .engage__icon { transform: translate(1rem, 1rem); filter: drop-shadow(0 0 0 #2F5BD8); transition-duration: 90ms; }


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
  .engage__card, .engage__card-arrow, .engage__icon { transition: none; }
  .engage__card:hover { transform: none; }
}

:global(html[data-reduce-motion="on"]) .engage__step {
  animation: none !important;
  opacity: 1 !important;
  transform: none !important;
  visibility: visible !important;
}

</style>
