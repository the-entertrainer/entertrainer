<script setup lang="ts">
import { useContentStore } from '~/stores/content'
import { useHomeViewStore } from '~/stores/homeview'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Entertrainer — Instructional Design by Naveen Jose',
  description: 'Naveen Jose is a Certified Instructional Design Specialist who builds training people actually finish — plus four free web apps for L&D teams.',
  ogTitle: 'Entertrainer — Instructional Design by Naveen Jose',
  ogDescription: 'Instructional design, but fun. Training people actually finish, and the free tools that make it.',
  ogUrl: 'https://entertrainer.in/'
})

const contentStore  = useContentStore()
const homeViewStore  = useHomeViewStore()
const router         = useRouter()
const spiralRef      = ref<{ performExit?: () => Promise<void> } | null>(null)

// The home is the root spiral. Every card is a real destination page, so a tap
// always leaves the spiral — no in-spiral sub-sections. This keeps navigation
// dead simple: run the unified vortex exit, then SPA-navigate (never a reload).
const items = computed(() => contentStore.homeNav)

homeViewStore.setIsHome(true)

let navigating = false
async function handleCardClick(href: string) {
  if (navigating || !href) return
  navigating = true
  try {
    await spiralRef.value?.performExit?.()
  } finally {
    router.push(href)
  }
}

// The menu's "home" link (while already on '/') and its back button both flow
// through the homeview store. There are no sub-sections to pop anymore, so just
// acknowledge the signals to keep the store clean.
watch(() => homeViewStore.pendingBack, (p) => { if (p) homeViewStore.ackBack() })
watch(() => homeViewStore.pendingHome, (p) => { if (p) homeViewStore.ackHome() })

onBeforeUnmount(() => { navigating = false })
</script>

<template>
  <SpiralView
    ref="spiralRef"
    :items="items"
    :show-loader="true"
    :title="''"
    @card-click="handleCardClick"
  />
</template>
