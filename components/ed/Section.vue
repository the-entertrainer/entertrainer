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
  /** Retained for route compatibility; displayed as a Paper Signal illustration. */
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

    <EdPaperSignal v-if="visual" :class="['sec__visual', category === 'projects' ? 'u-artifact-shift' : 'u-tool-assemble']" :variant="category === 'projects' ? 'project' : category === 'tools' ? 'tool' : 'lesson'" :label="visual.alt" />

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
.sec__visual { width: 100%; min-height: 260rem; margin: 0 0 clamp(30rem, 5vw, 56rem); border: 0; }

.sec__grid--projects { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(20rem, 3vw, 32rem); }
.sec__grid--projects .sec__item { grid-column: auto; margin-top: 0; }

.sec__grid--tools { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(20rem, 3vw, 32rem); }

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
  .sec__visual { min-height: 188rem; }
  .sec__grid--projects, .sec__grid--tools { grid-template-columns: minmax(0, 1fr); }
}
</style>
