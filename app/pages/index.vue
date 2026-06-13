<script setup lang="ts">
import { useContent } from '~/composables/useContent'

const site = useContent()

useSeoMeta({
  title: () => `${site.brand} — ${site.tagline}`,
  ogTitle: site.brand,
  description:
    'A spiral of ideas from Naveen — instructional design that refuses to be boring. Free Storyline examples, micro-learnings, and more.',
  ogDescription: site.tagline,
  ogType: 'website',
  ogUrl: `https://${site.domain}`,
  twitterCard: 'summary_large_image',
})

// JSON-LD for the person/brand.
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
  <div class="page">
    <div class="page__head container">
      <p class="eyebrow">{{ site.brand }} · spiral edition</p>
      <h1 class="page__title">
        <span class="gradient-text">Explore</span> the spiral.
      </h1>
      <ClientOnly>
        <ViewToggle />
      </ClientOnly>
    </div>

    <div class="container">
      <SpiralEngine />
    </div>
  </div>
</template>

<style scoped>
.page {
  padding-top: calc(var(--nav-h) + var(--sz-8));
  padding-bottom: var(--sz-16);
}

.page__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sz-4);
  text-align: center;
  margin-bottom: var(--sz-8);
}

.page__title {
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 7vw, 4.5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
}
</style>
