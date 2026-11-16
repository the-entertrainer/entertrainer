<script setup lang="ts">
import { listedEngage } from '~/content/engage'
import { absoluteUrl } from '~/utils/site'

const board = ref<HTMLElement | null>(null)
useCraftReveal(board, '.engage__step')
useCardSheen(board)

useSeoMeta({
  title: 'Engage · Entertrainer',
  description: 'Stack. Tap to drop. Only the overlap stays.',
  ogUrl: absoluteUrl('/engage'),
})

const games = listedEngage()
</script>

<template>
  <div ref="board" class="engage">
    <EdStageHero
      variant="orbits"
      title="Engage"
      title-id="engage-title"
    />

    <ol v-if="games.length" class="engage__grid" :class="{ 'engage__grid--solo': games.length === 1 }">
      <li v-for="(game, index) in games" :key="game.id" class="engage__step" :style="{ '--step': index }">
        <NuxtLink :to="game.href" class="engage__card craft-card" :class="`engage__card--${game.id}`">
          <span class="engage__icon" aria-hidden="true"><EngageAppIcon :app="game.icon" /></span>
          <span class="engage__card-text">
            <span v-if="games.length > 1" class="engage__step-no">{{ String(index + 1).padStart(2, '0') }}</span>
            <strong class="engage__card-name">{{ game.title }}</strong>
            <span class="engage__card-blurb">{{ game.blurb }}</span>
          </span>
          <span class="engage__card-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </span>
        </NuxtLink>
      </li>
    </ol>
    <p v-else class="engage__empty"><EdMark :size="21" /> Nothing on the table right now.</p>
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
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-13);
}
.engage__step { flex: 1 1 18rem; max-width: 36rem; min-width: 0; }
.engage__grid:has(> :only-child) .engage__step { flex-basis: 22rem; }

.engage__card {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 1.25rem;
  align-items: center;
  gap: var(--space-21);
  padding: var(--space-21);
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-m);
  background: var(--paper);
  transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}

@media (hover: hover) {
  .engage__card:hover { background: var(--paper-2); border-color: var(--ink); transform: translateX(0.1875rem); }
  .engage__card:hover .engage__card-arrow { transform: translate(0.125rem, -0.125rem); }
  .engage__card:hover .engage__icon { transform: translate(-0.1875rem, -0.1875rem); filter: drop-shadow(0.3125rem 0.3125rem 0 var(--ink)); }
  .engage__card:hover:active .engage__icon { transform: translate(0.0625rem, 0.0625rem); filter: drop-shadow(0 0 0 var(--ink)); }
}

.engage__card:focus-visible {
  outline: 0.1875rem solid var(--focus);
  outline-offset: 0.1875rem;
}

.engage__icon {
  position: relative;
  flex-shrink: 0;
  display: block;
  width: var(--space-55);
  height: var(--space-55);
  /* App-icon tile (EngageAppIcon): yellow squircle, ink glyph. Signature: an
     ink plate, the same pair as the seal, slides out under the squircle on
     hover and the tile presses flat on tap like a stamp. */
  filter: drop-shadow(0 0 0 var(--ink));
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1), filter 220ms cubic-bezier(0.22, 1, 0.36, 1);
}
.engage__card:focus-visible .engage__icon { transform: translate(-0.1875rem, -0.1875rem); filter: drop-shadow(0.3125rem 0.3125rem 0 var(--ink)); }
.engage__card:active .engage__icon { transform: translate(0.0625rem, 0.0625rem); filter: drop-shadow(0 0 0 var(--ink)); transition-duration: 90ms; }


.engage__card-text {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.75rem;
  min-width: 0;
}

.engage__card-name { font: 500 var(--type-body)/1.2 var(--font-display); flex-shrink: 0; }
.engage__card-blurb { flex: 1 1 16.25rem; min-width: 0; font-size: var(--type-small); line-height: 1.4; color: var(--muted); }
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

.engage__grid--solo .engage__card {
  padding: var(--space-34) var(--space-21);
}
.engage__empty {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 28rem;
  margin: var(--space-34) 0 0;
  padding: 1rem 1.05rem;
  border: var(--stroke) solid var(--ink);
  color: var(--ink);
  font-size: var(--type-body);
}

.engage__step-no {
  display: inline-grid;
  place-items: center;
  min-width: 1.75rem;
  height: 1.375rem;
  padding: 0 0.375rem;
  border-radius: 999px;
  background: #161618;
  color: #FFD43B;
  font: 700 0.75rem/1 var(--font-mono);
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
