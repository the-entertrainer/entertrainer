<script setup lang="ts">
import { WORLD_ZONE_LINKS } from '~/content/zone-links'

/**
 * Reading Mode (design spec §6 and §9).
 *
 * A calm sheet for essays, lessons, and tools. The world shell is not mounted
 * here. "Back to world" returns to the anchor this page declared:
 * `definePageMeta({ layout: 'reading', world: { anchor } })` → `/?at=<id>`.
 * Nexus, and any id that is not in WORLD_ZONE_LINKS, returns to `/`.
 */
const route = useRoute()

const anchor = computed(() => route.meta.world?.anchor)

const returnPath = computed(() => {
  const id = anchor.value
  if (!id || id === 'nexus') return '/'
  const known = WORLD_ZONE_LINKS.some((zone) => zone.id === id)
  return known ? `/?at=${id}` : '/'
})

const measure = computed(() => {
  const path = route.path
  if (path.startsWith('/tools')) return false
  if (path.startsWith('/empower')) return false
  if (path.startsWith('/courses')) return false
  if (path.startsWith('/instructional-design')) return false
  return true
})

const showFooter = computed(() => {
  const path = route.path
  if (path.startsWith('/instructional-design')) return false
  if (path.startsWith('/courses/')) return false
  return true
})

const showReadingLayer = computed(() =>
  route.path.startsWith('/elevate/') && route.path !== '/elevate/'
)
</script>

<template>
  <div
    class="reading"
    data-reading-layout
    :data-reading-anchor="anchor || 'nexus'"
    :data-measure="measure ? '66ch' : 'shell'"
  >
    <a class="reading__skip" href="#main">Skip to content</a>

    <header class="reading__bar">
      <NuxtLink class="reading__back" :to="returnPath">Back to world</NuxtLink>
    </header>

    <main
      id="main"
      tabindex="-1"
      class="reading__main"
      :class="{ 'reading__main--measure': measure }"
    >
      <slot />
    </main>

    <EdBlogReadingLayer v-if="showReadingLayer" />
    <EdFooter v-if="showFooter" />
  </div>
</template>

<style src="~/assets/css/reading-mode.css"></style>
