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
    <!-- Floating View Toggle -->
    <div class="floating-toggle">
      <ClientOnly>
        <ViewToggle />
      </ClientOnly>
    </div>

    <!-- The spiral is now the entire experience -->
    <SpiralEngine />
  </div>
</template>

<style scoped>
.page {
  position: relative;
  min-height: 100dvh;
  padding-top: var(--nav-h);
  overflow: hidden;
}

.floating-toggle {
  position: absolute;
  top: calc(var(--nav-h) + var(--sz-4));
  right: var(--sz-4);
  z-index: 100;
}
</style>
