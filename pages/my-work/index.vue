<script setup lang="ts">
import { useContentStore } from '~/stores/content'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })
useSeoMeta({
  title: 'My Work — instructional design projects by Naveen Jose · Entertrainer',
  description: 'Selected instructional design and L&D work by Naveen Jose, with the thinking behind each project.',
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
    deck="Two projects, opened up. Not just what they look like, but the decisions underneath them."
    meta="02 projects"
    :items="contentStore.myWorkNav"
  />
</template>
