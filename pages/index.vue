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

/* The sample's own homepage has no masthead, no standfirst, nothing between
   the fixed header and the list itself — the index IS the page. Every
   destination this site has, in reading order, one flat group so no filter
   row renders (the site doesn't categorise itself). */
const groups = computed<IndexGroup[]>(() => [
  { id: 'all', label: 'Index', items: contentStore.indexItems }
])
</script>

<template>
  <WandaSurface :crumbs="[{ label: 'Index', active: true }]">
    <WandaIndexPanel variant="inline" :open="true" :groups="groups" />

    <footer class="colophon">
      <a :href="`mailto:${contentStore.email}`">{{ contentStore.email }}</a>
      <a
        v-for="s in contentStore.socialLinks.filter(l => l.platform !== 'email')"
        :key="s.platform"
        :href="s.url"
        target="_blank"
        rel="noopener"
      >{{ s.label }}</a>
    </footer>
  </WandaSurface>
</template>

<style scoped>
.colophon {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  margin-top: 60px;
  padding: 40px var(--w-gutter-right) 60px var(--w-gutter);
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  font-family: var(--w-mono);
  font-size: 16px;
}
.colophon a { opacity: var(--w-rest); transition: opacity 0.2s linear; }
.colophon a:hover { opacity: 1; }
</style>
