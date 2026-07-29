<script setup lang="ts">
import { useContentStore } from '~/stores/content'

definePageMeta({ layout: false, pageTransition: { name: 'fade', mode: 'out-in' } })
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
  <div class="press-page">
    <PressMast section="My Work" />
    <PressDeck
      eyebrow="My Work"
      title="Proof it wasn't all talk"
      deck="One case study, told properly, beats a grid of half-finished ones. Open it to see how it was designed."
      meta="01 story"
      :items="contentStore.myWorkNav"
    />
    <PressFoot />
  </div>
</template>
