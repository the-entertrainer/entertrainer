<script setup lang="ts">
import { CONCEPTS } from '~/utils/labNav'

/**
 * The lab index.
 *
 * Unlisted and noindex, but not hidden: it is linked from the front page's
 * archive and from the footer, because fifteen discarded directions are more
 * honest evidence of how the work happens than the one that shipped.
 *
 * The sketches themselves are untouched by the editorial rebuild — they are
 * self-contained WebGL artifacts with their own art direction, and app.vue
 * deliberately renders every /lab route without the publication's chrome. This
 * index is the doorway, so it wears the publication's clothes.
 */
useSeoMeta({ title: 'Homepage concepts — Lab', robots: 'noindex' })
</script>

<template>
  <div class="lab">
    <EdShell width="read">
      <header class="lab__head">
        <p class="t-mono lab__eyebrow">Unlisted · Lab</p>
        <h1 class="lab__title t-display">Fifteen homepages,<br>one sheet of glass</h1>
        <p class="lab__deck">
          Every one renders real liquid glass — a rounded-rect distance field, surface normals taken from
          its gradient, edge-weighted refraction, chromatic dispersion, Fresnel and specular — over a
          procedural backdrop the glass actually bends. Same optics throughout; fifteen different
          art directions on top.
        </p>
      </header>

      <ol class="lab__grid">
        <li v-for="c in CONCEPTS" :key="c.slug" class="u-reveal">
          <NuxtLink :to="`/lab/${c.slug}`" class="lab__card">
            <span class="t-mono lab__n">{{ c.n }}</span>
            <span class="lab__body">
              <strong class="lab__name">{{ c.name }}</strong>
              <span class="lab__law">{{ c.note }}</span>
            </span>
            <span class="lab__arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
            </span>
          </NuxtLink>
        </li>
      </ol>
    </EdShell>
  </div>
</template>

<style scoped>
.lab { min-height: 100dvh; background: var(--paper); color: var(--ink); }

.lab__head { padding-bottom: clamp(22rem, 3vw, 32rem); border-bottom: var(--stroke) solid var(--ink); margin-bottom: clamp(24rem, 4vw, 40rem); }
.lab__eyebrow { margin: 0 0 14rem; color: var(--muted); }
.lab__title { font-size: var(--type-display); margin: 0; }
.lab__deck {
  margin: 18rem 0 0; max-width: var(--measure-body);
  font-family: var(--font-reading); font-size: 17rem; line-height: 1.6; color: var(--muted);
}

.lab__grid { list-style: none; margin: 0; padding: 0; display: grid; gap: 10rem; }
.lab__card {
  display: grid; grid-template-columns: 40rem minmax(0, 1fr) 20rem;
  align-items: start; gap: 16rem;
  padding: 18rem 20rem;
  border: var(--stroke-hair) solid var(--line);
  border-radius: var(--radius-m);
  background: var(--paper);
  transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}
@media (hover: hover) {
  .lab__card:hover { background: var(--paper-2); border-color: var(--ink); transform: translateX(3rem); }
  .lab__card:hover .lab__arrow { transform: translate(2rem, -2rem); }
}
.lab__n { color: var(--muted); padding-top: 4rem; }
.lab__body { display: grid; gap: 6rem; min-width: 0; }
.lab__name { font-size: 18rem; font-weight: 700; }
.lab__law { font-size: 14rem; line-height: 1.5; color: var(--muted); }
.lab__arrow { color: var(--muted); padding-top: 3rem; transition: transform var(--dur-fast) var(--ease-out); }

@media (prefers-reduced-motion: reduce) {
  .lab__card, .lab__arrow { transition: none; }
  .lab__card:hover { transform: none; }
}
</style>
