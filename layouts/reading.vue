<script setup lang="ts">
import { WORLD_ZONE_LINKS } from '~/content/zone-links'
import { useThemeStore } from '~/stores/theme'

/**
 * Reading Mode (design spec §6 and §9).
 *
 * A calm sheet for essays, lessons, and tools. The world shell is not mounted
 * here. "Back to world" returns to the anchor this page declared:
 * `definePageMeta({ layout: 'reading', world: { anchor } })` → `/?at=<id>`.
 * Nexus, and any id that is not in WORLD_ZONE_LINKS, returns to `/`.
 */
const route = useRoute()
const theme = useThemeStore()
const { panelOpen, togglePanel } = useSiteSettings()

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

/** Full-screen players already have an exit bar and size themselves to the viewport. */
const isPlayer = computed(() =>
  route.path.startsWith('/instructional-design') || route.path.startsWith('/courses/')
)
const showBar = computed(() => !isPlayer.value)
const showFooter = computed(() => !isPlayer.value)

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

    <header v-if="showBar" class="reading__bar">
      <NuxtLink class="reading__back" :to="returnPath">Back to world</NuxtLink>
      <div class="reading__tools">
        <button
          type="button"
          class="reading__icon u-icon-btn"
          :aria-expanded="panelOpen"
          aria-controls="site-settings-panel"
          aria-haspopup="dialog"
          :aria-label="panelOpen ? 'Close settings' : 'Open settings'"
          @click="togglePanel()"
        >
          <EdSignalIcon name="settings" />
        </button>
        <button
          type="button"
          class="reading__icon u-icon-btn"
          :aria-label="`Switch to ${theme.theme === 'dark' ? 'light' : 'dark'} mode`"
          @click="theme.toggle()"
        >
          <EdSignalIcon :name="theme.theme === 'dark' ? 'sun' : 'moon'" />
        </button>
      </div>
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
