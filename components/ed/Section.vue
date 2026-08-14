<script setup lang="ts">
import { byCategory, categoryMeta, type Category } from '~/content/editorial'

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
}>()

const items = computed(() => byCategory(props.category))
const meta = computed(() => categoryMeta(props.category))
const count = computed(() =>
  `${String(items.value.length).padStart(2, '0')} ${items.value.length === 1 ? 'entry' : 'entries'}`)
</script>

<template>
  <EdShell width="page">
    <EdStoryHero
      :category="category"
      :title="title"
      :deck="deck"
      :count="count"
      byline
    />

    <ul class="sec__grid">
      <li v-for="(it, i) in items" :key="it.id" :style="{ '--i': i }" class="u-reveal">
        <EdCard :item="it" :index="i" chip="media" />
      </li>
    </ul>

    <p v-if="intro" class="sec__intro">{{ intro }}</p>

    <slot />

    <EdReadNext :from="items[0]?.id ?? ''" heading="Elsewhere on the site" />
  </EdShell>
</template>

<style scoped>
.sec__grid {
  list-style: none; margin: 0; padding: 0;
  display: grid; gap: clamp(18rem, 2.4vw, 28rem);
  grid-template-columns: repeat(auto-fit, minmax(300rem, 1fr));
}
.sec__grid > li { display: flex; min-width: 0; }

/* The supporting paragraph sits after the work, not before it. On a phone the
   old layout spent 460 of 844 pixels on preamble before the first card. */
.sec__intro {
  font-family: var(--font-reading);
  font-size: var(--type-body); line-height: 1.7;
  color: var(--muted);
  max-width: var(--measure-body);
  margin: clamp(28rem, 4vw, 44rem) 0 0;
  padding-top: clamp(20rem, 3vw, 28rem);
  border-top: var(--stroke-hair) solid var(--line);
}

@media (max-width: 680px) {
  .sec__grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
