<script setup lang="ts">
/**
 * The shell every Wanda-language page sits inside: fixed header, the plus
 * button, and the index overlay it summons. Pages provide their own content
 * through the default slot and describe themselves through `crumbs`.
 */
import type { Crumb } from './Header.vue'
import type { IndexGroup } from './IndexPanel.vue'

const props = defineProps<{
  crumbs?: Crumb[]
  /** Groups shown in the index overlay. Omit to use the whole site. */
  groups?: IndexGroup[]
}>()

const route = useRoute()
const contentStore = useContentStore()

const indexOpen = ref(false)
const navHover = ref(false)

/* Pointing at the header reveals the three links. Opening the index does not:
   the panel's own `(×) Close` is positioned at right:30/top:16 — exactly where
   the plus button sits — so the header nav has to vacate that corner rather
   than stack under it. */
const navOpen = computed(() => navHover.value && !indexOpen.value)

/* One group, so the panel renders no filter row at all. The site does not
   categorise itself — the overlay shows the same flat list the home route's
   inline index does, in the same order. */
const groups = computed<IndexGroup[]>(() => props.groups ?? [
  { id: 'all', label: 'All', items: contentStore.indexItems }
])

/* A route change means the destination is reached; the panel has no reason to
   stay up. */
watch(() => route.fullPath, () => { indexOpen.value = false })

/* The index is a full-viewport overlay, so the page behind it must not scroll
   under the cursor while it is up. */
watch(indexOpen, open => {
  if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
})
onBeforeUnmount(() => { if (import.meta.client) document.body.style.overflow = '' })
</script>

<template>
  <div class="w-surface">
    <div @mouseenter="navHover = true" @mouseleave="navHover = false">
      <WandaHeader
        :crumbs="crumbs"
        :open="indexOpen"
        :nav-open="navOpen"
        @toggle="indexOpen = !indexOpen"
      />
    </div>

    <main class="w-main">
      <slot />
    </main>

    <WandaIndexPanel
      :open="indexOpen"
      :groups="groups"
      :active-href="route.path"
      @close="indexOpen = false"
      @navigate="indexOpen = false"
    />
  </div>
</template>

<style scoped>
.w-main { position: relative; z-index: 1; }
</style>
