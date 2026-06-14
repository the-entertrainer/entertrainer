<script setup lang="ts">
import { useContent } from '~/composables/useContent'

const site = useContent()

useSeoMeta({
  title: () => `${site.brand} — ${site.tagline}`,
  ogTitle: site.brand,
  description:
    'Explore Naveen\'s work in instructional design through an immersive 3D room experience. Free Storyline examples, micro-learnings, and more.',
  ogDescription: site.tagline,
  ogType: 'website',
  ogUrl: `https://${site.domain}`,
  twitterCard: 'summary_large_image',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: site.owner,
          jobTitle: 'Instructional Designer',
          url: `https://${site.domain}`,
        },
      }),
    },
  ],
})
</script>

<template>
  <WorldExperience />
</template>
