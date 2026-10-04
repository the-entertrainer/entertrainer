<script setup lang="ts">
import HomePage from './index.vue'

/**
 * Direct link for the reel. Same home page, same overlay.
 * The shell opens 5 Slices because the path is /slices.
 */
useSeoMeta({
  title: '5 Slices · Entertrainer',
  description: 'A vertical reel of short stories. The newest opens first. Older stories open by date.',
  ogTitle: '5 Slices · Entertrainer',
  ogDescription: 'A vertical reel of short stories. The newest opens first. Older stories open by date.',
  ogUrl: 'https://entertrainer.in/slices',
  twitterCard: 'summary_large_image',
  twitterTitle: '5 Slices · Entertrainer',
  twitterDescription: 'A vertical reel of short stories. The newest opens first. Older stories open by date.'
})
</script>

<template>
  <HomePage />
</template>
