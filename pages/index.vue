<script setup lang="ts">
import { useContentStore } from '~/stores/content'
import { useHomeViewStore } from '~/stores/homeview'

definePageMeta({ layout: 'default' })

const contentStore   = useContentStore()
const homeViewStore  = useHomeViewStore()
const router         = useRouter()

type Section = 'home' | 'tools' | 'downloads' | 'my-work'

const sectionStack = ref<Section[]>(['home'])
const currentSection = computed(() => sectionStack.value[sectionStack.value.length - 1])

const sectionItems = computed(() => {
  switch (currentSection.value) {
    case 'tools':     return contentStore.toolsNav
    case 'downloads': return contentStore.downloadsNav
    case 'my-work':   return contentStore.myWorkNav
    default:          return contentStore.homeNav
  }
})

const sectionTitles: Record<Section, string> = {
  home: '', tools: 'Tools', downloads: 'Downloads', 'my-work': 'My Work'
}

const sectionRoutes: Record<string, Section> = {
  '/tools': 'tools', '/downloads': 'downloads', '/my-work': 'my-work'
}

watch(currentSection, (s) => homeViewStore.setIsHome(s === 'home'), { immediate: true })

watch(() => homeViewStore.pendingBack, (pending) => {
  if (pending) {
    handleBack()
    homeViewStore.ackBack()
  }
})

function handleCardClick(href: string) {
  if (href in sectionRoutes) {
    sectionStack.value = [...sectionStack.value, sectionRoutes[href]]
  } else {
    router.push(href)
  }
}

function handleBack() {
  if (sectionStack.value.length > 1) {
    sectionStack.value = sectionStack.value.slice(0, -1)
  }
}
</script>

<template>
  <SpiralView
    :items="sectionItems"
    :show-loader="true"
    :show-view-switch="currentSection === 'home'"
    :title="sectionTitles[currentSection]"
    @card-click="handleCardClick"
  />
</template>
