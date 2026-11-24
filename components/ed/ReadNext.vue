<script setup lang="ts">
import { readNext } from '~/content/editorial'

/**
 * The end of a story is the highest-intent moment on the page: someone just
 * finished something and is deciding whether this site is worth more of their
 * time. It gets three real cards, chosen from the same section first.
 */
const props = withDefaults(defineProps<{ from: string; count?: number; heading?: string }>(),
  { count: 3, heading: 'Read next' })

const items = computed(() => readNext(props.from, props.count))
</script>

<template>
  <section class="rn" aria-labelledby="rn-h">
    <div class="rn__head">
      <h2 id="rn-h" class="t-mono rn__title">{{ heading }}</h2>
      <NuxtLink to="/" class="t-mono rn__all u-underline">See all</NuxtLink>
    </div>
    <ul class="rn__grid">
      <li v-for="it in items" :key="it.id"><EdCard :item="it" variant="compact" /></li>
    </ul>
  </section>
</template>

<style scoped>
.rn {
  margin-top: clamp(48rem, 8vh, 96rem);
  padding-top: clamp(22rem, 3vw, 34rem);
  border-top: var(--stroke) solid var(--line);
}
.rn__head { display: flex; align-items: baseline; justify-content: space-between; gap: 16rem; margin-bottom: 22rem; }
.rn__title { margin: 0; color: var(--muted); }
.rn__all { color: var(--muted); font-family: var(--font-mono); font-size: var(--type-meta); letter-spacing: var(--tracking-meta); text-transform: uppercase; }
.rn__grid {
  list-style: none; margin: 0; padding: 0;
  display: grid; gap: 16rem;
  grid-template-columns: repeat(auto-fit, minmax(250rem, 1fr));
}
.rn__grid > li { display: flex; min-width: 0; }
</style>
