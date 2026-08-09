<script setup lang="ts">
import { useContentStore } from '~/stores/content'

useSeoMeta({
  title: 'My Work — instructional design projects by Naveen Jose · Entertrainer',
  description: 'Selected instructional design and L&D work by Naveen Jose: interactive learning experiences built for real teams.',
  ogTitle: 'My Work — Naveen Jose',
  ogDescription: 'Selected instructional design and e-learning projects.',
  ogUrl: 'https://entertrainer.in/my-work'
})

const contentStore = useContentStore()
</script>

<template>
  <WandaSurface :crumbs="[{ label: 'Index', href: '/' }, { label: 'Work', active: true }]">
    <WandaHeroTitle
      title="Work"
      standfirst="The two I can show you end to end — what they were for, who they were for, and how they were built."
    />
    <WandaGenerativeGrid :items="contentStore.myWorkNav" />
    <div class="w-endcta">
      <NuxtLink to="/tools">→ The tools behind them</NuxtLink>
    </div>
  </WandaSurface>
</template>
