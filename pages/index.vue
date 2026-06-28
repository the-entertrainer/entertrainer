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
  home: '', tools: 'Web Apps', downloads: 'Downloads', 'my-work': 'My Work'
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

// Reset to home when navigating to '/' from a sub-section (e.g. menu home link)
watch(() => homeViewStore.pendingHome, (pending) => {
  if (pending) {
    if (sectionStack.value.length > 1) {
      sectionStack.value = ['home']
    }
    homeViewStore.ackHome()
  }
})

let _pushingState = false

function handleCardClick(href: string) {
  if (href in sectionRoutes) {
    const section = sectionRoutes[href]
    sectionStack.value = [...sectionStack.value, section]
    _pushingState = true
    history.pushState({ section }, '', '/')
    _pushingState = false
  } else {
    router.push(href)
  }
}

function handleBack() {
  if (sectionStack.value.length > 1) {
    sectionStack.value = sectionStack.value.slice(0, -1)
  }
}

function onPopState() {
  if (_pushingState) return
  if (sectionStack.value.length > 1) {
    sectionStack.value = sectionStack.value.slice(0, -1)
  }
}

onMounted(() => {
  window.addEventListener('popstate', onPopState)
})

onUnmounted(() => {
  window.removeEventListener('popstate', onPopState)
})
</script>

<template>
  <SpiralView
    :items="sectionItems"
    :show-loader="true"
    :show-view-switch="true"
    :title="sectionTitles[currentSection]"
    @card-click="handleCardClick"
  />
</template>
