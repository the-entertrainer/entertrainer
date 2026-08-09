<script setup lang="ts">
useSeoMeta({
  title: 'Entertrainer — Instructional Design by Naveen Jose',
  description: 'Naveen Jose is a Certified Instructional Design Specialist who builds training people actually finish — plus four free web apps for L&D teams.',
  ogTitle: 'Entertrainer — Instructional Design by Naveen Jose',
  ogDescription: 'Instructional design, but fun. Training people actually finish, and the free tools that make it.',
  ogUrl: 'https://entertrainer.in/'
})

const contentStore = useContentStore()

/* The flying, overlapping panel deck — confirmed against a real phone
   recording of wanda.net's mobile home to be the actual target, not the
   text index this repo tried in between. Every destination, in reading
   order, no categorisation. See Inspiration/WANDA_SYSTEM.md §15. */
const panels = computed(() => contentStore.panels)
</script>

<template>
  <WandaSurface :crumbs="[{ label: 'Index', active: true }]">
    <WandaScatterDeck :items="panels" />

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
