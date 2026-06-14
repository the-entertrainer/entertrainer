<script setup lang="ts">
import { useContentStore } from '~/stores/content'

definePageMeta({ layout: 'default' })

const contentStore = useContentStore()
const router = useRouter()

type Section = 'home' | 'about' | 'tools' | 'downloads'

const sectionStack = ref<Section[]>(['home'])
const currentSection = computed(() => sectionStack.value[sectionStack.value.length - 1])

const sectionItems = computed(() => {
  switch (currentSection.value) {
    case 'about':     return contentStore.aboutNav
    case 'tools':     return contentStore.toolsNav
    case 'downloads': return contentStore.downloadsNav
    default:          return contentStore.homeNav
  }
})

const sectionTitles: Record<Section, string> = {
  home: '', about: 'About Me', tools: 'Tools', downloads: 'Downloads'
}

const sectionRoutes: Record<string, Section> = {
  '/about': 'about', '/tools': 'tools', '/downloads': 'downloads'
}

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
    :show-back="currentSection !== 'home'"
    @card-click="handleCardClick"
    @back="handleBack"
  />
</template>
