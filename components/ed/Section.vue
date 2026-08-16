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

    <figure v-if="visual" class="sec__visual u-editorial-enter">
      <img :src="visual.src" :alt="visual.alt" loading="eager" decoding="async" />
    </figure>

    <ul class="sec__grid">
      <li v-for="it in items" :key="it.id">
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
}
</style>
