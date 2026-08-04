<script setup lang="ts">
import { useContentStore } from '~/stores/content'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })
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
  <UiCardGrid
    eyebrow="My Work"
    title="Selected projects"
    deck="Interactive learning, built for real teams. Open one to see how it was designed."
    :items="contentStore.myWorkNav"
  />
</template>
