<script setup lang="ts">
/**
 * Nexus. The publication homepage is now the Satya Space shell.
 * SEO lines stay. The 3D engine loads only after this page's client chunk,
 * and only when the tier is above 0.
 */
useSeoMeta({
  title: 'Entertrainer · Elevate, Empower, Engage',
  description: 'Stories for questions that keep returning, tools for work that keeps repeating, and small games for short detours.',
  ogTitle: 'Entertrainer · The Three Es',
  ogDescription: 'Elevate, Empower, Engage.',
  ogUrl: 'https://entertrainer.in/'
})

const WorldShell = defineAsyncComponent({
  loader: () => import('~/components/world/WorldShell.vue'),
  suspensible: false,
})
</script>

<template>
  <div class="world-home">
    <ClientOnly>
      <WorldShell />
      <template #fallback>
        <WorldFallbackPoster />
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
/* Same box as .stage in WorldShell, so the footer does not move when the
   client shell replaces this SSR poster. */
.world-home {
  position: relative;
  height: calc(100dvh - var(--nav-h, 55rem));
  min-height: 560px;
}
</style>
