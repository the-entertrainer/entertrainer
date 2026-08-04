<script setup lang="ts">
import { useContentStore } from '~/stores/content'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })
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
  <UiCardGrid
    eyebrow="Web Apps"
    title="Tools I built for L&D"
    deck="Free web apps for instructional designers and training teams. No sign-up, and your work stays on your device."
    intro="I kept hitting the same slow steps in my own work, so I built the tools I wished existed. Each one does a single job well, on a phone or a laptop. They are also the clearest proof of how I think about learning design."
    :items="contentStore.toolsNav"
  />
</template>
