<script setup lang="ts">
import { useContentStore } from '~/stores/content'

useSeoMeta({
  title: 'Web Apps — free L&D tools by Naveen Jose · Entertrainer',
  description: 'A small set of free web apps for instructional designers and L&D teams: build storyboards and block courses, generate quiz distractors, plan training calendars, and polish emails. Built by Naveen Jose.',
  ogTitle: 'Web Apps for L&D — by Naveen Jose',
  ogDescription: 'Free tools for instructional designers: course building, storyboards, quiz distractors, training calendars and more.',
  ogUrl: 'https://entertrainer.in/tools'
})

const contentStore = useContentStore()
</script>

<template>
  <WandaSurface :crumbs="[{ label: 'Index', href: '/' }, { label: 'Web Apps', active: true }]">
    <WandaHeroTitle
      title="Web Apps"
      standfirst="Free tools for instructional designers and training teams. No sign-up, and your work stays on your device."
    />
    <WandaGenerativeGrid :items="contentStore.toolsNav" />
    <div class="w-endcta">
      <NuxtLink to="/my-work">→ See them used in real work</NuxtLink>
    </div>
  </WandaSurface>
</template>
