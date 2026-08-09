<script setup lang="ts">
import type { IndexGroup } from '~/components/wanda/IndexPanel.vue'

useSeoMeta({
  title: 'Entertrainer — Instructional Design by Naveen Jose',
  description: 'Naveen Jose is a Certified Instructional Design Specialist who builds training people actually finish — plus four free web apps for L&D teams.',
  ogTitle: 'Entertrainer — Instructional Design by Naveen Jose',
  ogDescription: 'Instructional design, but fun. Training people actually finish, and the free tools that make it.',
  ogUrl: 'https://entertrainer.in/'
})

const contentStore = useContentStore()

/* Home is the index. Not a menu over the page — the page itself, the way
   wanda.net makes its roster the landing experience rather than a hero
   with a scroll prompt under it. */
const groups = computed<IndexGroup[]>(() => [
  { id: 'work', label: 'Work', items: contentStore.myWorkNav },
  { id: 'tools', label: 'Web Apps', items: contentStore.toolsNav },
  { id: 'more', label: 'More', items: contentStore.homeNav }
])
</script>

<template>
  <WandaSurface :crumbs="[{ label: 'Index', active: true }]" :groups="groups">
    <section class="home">
      <h1 class="home-title">{{ contentStore.brand }}</h1>
      <p class="home-standfirst">
        {{ contentStore.tagline }} — {{ contentStore.yearsExperience }} years building training
        people actually finish.
      </p>

      <WandaIndexPanel variant="inline" :open="true" :groups="groups" />
    </section>
  </WandaSurface>
</template>

<style scoped>
.home {
  padding: calc(var(--w-header-h) + 90px) 0 90px;
}
.home-title {
  margin: 0 var(--w-gutter-right) 0 var(--w-gutter);
  font-family: var(--w-display);
  font-size: clamp(52px, 11vw, 200px);
  line-height: 0.84;
  font-weight: 700;
  letter-spacing: -0.035em;
  text-transform: uppercase;
}
.home-standfirst {
  margin: 28px var(--w-gutter-right) 72px var(--w-gutter);
  max-width: 48ch;
  font-family: var(--w-mono);
  font-size: var(--w-chrome-size);
  line-height: 1.5;
  opacity: var(--w-rest);
}
@media (max-width: 812px) {
  .home { padding-top: calc(var(--w-header-h) + 40px); }
  .home-standfirst { margin-bottom: 48px; }
}
</style>
