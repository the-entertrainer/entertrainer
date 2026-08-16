<script setup lang="ts">
import { byCategory, type Category } from '~/content/editorial'

/**
 * A section index: the masthead for one category, then everything filed under
 * it. Used by /my-work and /tools, so those routes are real crawlable
 * destinations rather than a filtered view of the front page.
 */
const props = defineProps<{
  category: Category
  title: string
  deck: string
  /** Supporting paragraph, set below the field where it does not delay the work. */
  intro?: string
  /** One text-free editorial image that establishes the destination before the real work. */
  visual?: { src: string; alt: string }
}>()

const items = computed(() => byCategory(props.category))
</script>

<template>
  <EdShell width="page">
    <EdStoryHero
      :category="category"
      :title="title"
      :deck="deck"
    />

    <figure v-if="visual" :class="['sec__visual', category === 'projects' ? 'u-artifact-shift' : 'u-tool-assemble']">
      <img :src="visual.src" :alt="visual.alt" loading="eager" decoding="async" />
    </figure>

    <ul :class="['sec__grid', `sec__grid--${category}`]">
      <li v-for="(it, index) in items" :key="it.id" :class="`sec__item sec__item--${index + 1}`">
        <EdCard :item="it" />
      </li>
    </ul>

    <p v-if="intro" class="sec__intro">{{ intro }}</p>

    <slot />

  </EdShell>
</template>

<style scoped>
.sec__grid {
  list-style: none; margin: 0; padding: 0;
  display: grid; gap: clamp(18rem, 2.4vw, 28rem);
  grid-template-columns: repeat(auto-fit, minmax(300rem, 1fr));
}
.sec__grid > li { display: flex; min-width: 0; }
.sec__visual { margin: 0 0 clamp(30rem, 5vw, 56rem); overflow: hidden; border: var(--stroke) solid var(--line); background: var(--paper-2); }
.sec__visual img { display: block; width: 100%; aspect-ratio: 2.35 / 1; object-fit: cover; object-position: center 58%; }

/* Route Atlas: projects are not a neutral inventory. One large workbench image
   establishes the field, then the real pieces arrive with deliberate pauses. */
.sec__grid--projects { grid-template-columns: repeat(12, minmax(0, 1fr)); gap: clamp(20rem, 3vw, 38rem); }
.sec__grid--projects .sec__item--1 { grid-column: span 8; }
.sec__grid--projects .sec__item--2 { grid-column: span 4; margin-top: clamp(48rem, 9vw, 132rem); }
.sec__grid--projects .sec__item--3 { grid-column: 3 / span 7; margin-top: clamp(-28rem, -2vw, -8rem); }
.sec__grid--projects .sec__item:nth-child(n + 4) { grid-column: span 6; }

/* Tools keep their compact, practical reading rhythm, but are attached to one
   visible route instead of a borderless repeated-card shelf. */
.sec__grid--tools { position: relative; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 0; padding-left: clamp(30rem, 5vw, 64rem); border-top: var(--stroke) solid var(--line); }
.sec__grid--tools::before { content: ''; position: absolute; left: 9rem; top: 0; bottom: 0; width: 3rem; background: linear-gradient(var(--violet), var(--blue)); transform-origin: top; animation: sec-route-grow 920ms var(--ease-expo-out) both; }
.sec__grid--tools .sec__item { position: relative; grid-column: 1 / -1; padding: clamp(24rem, 3vw, 34rem) 0; border-bottom: var(--stroke) solid var(--line); }
.sec__grid--tools .sec__item::before { content: ''; position: absolute; left: clamp(-64rem, -5vw, -30rem); top: clamp(34rem, 4vw, 48rem); width: 16rem; height: 16rem; border: 3rem solid var(--paper); border-radius: var(--radius-full); background: var(--blue); box-shadow: 0 0 0 2rem var(--ink); }
.sec__grid--tools .sec__item--2::before { background: var(--violet); }.sec__grid--tools .sec__item--3::before { background: var(--yellow); }
@keyframes sec-route-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }

/* The supporting paragraph sits after the work, not before it. On a phone the
   old layout spent 460 of 844 pixels on preamble before the first card. */
.sec__intro {
  font-family: var(--font-reading);
  font-size: var(--type-body); line-height: 1.7;
  color: var(--muted);
  max-width: var(--measure-body);
  margin: clamp(28rem, 4vw, 44rem) 0 0;
  padding-top: clamp(20rem, 3vw, 28rem);
  border-top: var(--stroke) solid var(--line);
}

@media (max-width: 680px) {
  .sec__grid { grid-template-columns: minmax(0, 1fr); }
  .sec__visual img { aspect-ratio: 16 / 9; }
  .sec__grid--projects { grid-template-columns: minmax(0, 1fr); }
  .sec__grid--projects .sec__item--1, .sec__grid--projects .sec__item--2, .sec__grid--projects .sec__item--3, .sec__grid--projects .sec__item:nth-child(n + 4) { grid-column: 1; margin-top: 0; }
  .sec__grid--tools { padding-left: 32rem; }.sec__grid--tools::before { left: 8rem; }.sec__grid--tools .sec__item::before { left: -31rem; }
}
@media (prefers-reduced-motion: reduce) { .sec__grid--tools::before { animation: none; } }
</style>
