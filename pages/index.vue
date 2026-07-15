<script setup lang="ts">
import { useContentStore } from '~/stores/content'
import { useHomeViewStore } from '~/stores/homeview'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Entertrainer — Instructional Design by Naveen Jose',
  description: 'The portfolio of Naveen Jose, a certified instructional designer who builds learning experiences that feel human, plus free web apps for L&D teams.',
  ogTitle: 'Entertrainer — Instructional Design by Naveen Jose',
  ogDescription: 'Learning experiences that feel human, plus free web apps for L&D teams.',
  ogUrl: 'https://entertrainer.in/'
})

const contentStore   = useContentStore()
const homeViewStore  = useHomeViewStore()
const router         = useRouter()
const spiralRef      = ref<any>(null)

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

// Items in sectionRoutes use in-place vortex (via items watch).
// All other home cards now also use the vortex (explicit exit before router.push).

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
      syncHistorySection()
    }
    homeViewStore.ackHome()
  }
})

let _pushingState = false

// `history.state.section` is the single source of truth for which spiral
// sub-section the '/' entry represents. Keep it in sync whenever the in-page
// stack changes so back/forward and remounts all restore the same view.
function readSection(): Section | null {
  const s = (history.state as { section?: Section } | null)?.section
  return s && s in sectionTitles && s !== 'home' ? s : null
}
function syncHistorySection() {
  const cur = currentSection.value
  history.replaceState(
    { ...history.state, section: cur === 'home' ? undefined : cur },
    '', '/'
  )
}

async function handleCardClick(href: string) {
  if (href in sectionRoutes) {
    const section = sectionRoutes[href]
    sectionStack.value = [...sectionStack.value, section]
    _pushingState = true
    // Preserve vue-router's own history keys; just tag this entry with the
    // section so returning to '/' (e.g. backing out of a tool) can restore it.
    history.pushState({ ...history.state, section }, '', '/')
    _pushingState = false
  } else {
    // External page (About, Instructional Design, etc.):
    // Run the vortex exit animation first so every navigation feels unified.
    await spiralRef.value?.performExit?.()
    router.push(href)
  }
}

function handleBack() {
  if (sectionStack.value.length > 1) {
    sectionStack.value = sectionStack.value.slice(0, -1)
    syncHistorySection()
  }
}

function onPopState() {
  if (_pushingState) return
  // Mirror whatever section the landed history entry represents — this respects
  // both back and forward through the spiral hierarchy.
  const s = readSection()
  sectionStack.value = s ? ['home', s] : ['home']
}

onMounted(() => {
  window.addEventListener('popstate', onPopState)
  // Returning to '/' from a deeper route (e.g. backing out of a tool) — restore
  // the spiral sub-section we were in so back respects the hierarchy instead of
  // snapping to the root spiral.
  const restored = readSection()
  if (restored) sectionStack.value = ['home', restored]
})

onUnmounted(() => {
  window.removeEventListener('popstate', onPopState)
})
</script>

<template>
  <SpiralView
    ref="spiralRef"
    :items="sectionItems"
    :show-loader="true"
    :show-view-switch="true"
    :title="sectionTitles[currentSection]"
    @card-click="handleCardClick"
  />
</template>
