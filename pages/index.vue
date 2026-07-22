<script setup lang="ts">
import { useContentStore } from '~/stores/content'
import { useHomeViewStore } from '~/stores/homeview'
import { useExperienceStore } from '~/stores/experience'

definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'Entertrainer — Instructional Design by Naveen Jose',
  description: 'The portfolio of Naveen Jose, a certified instructional designer who builds learning experiences that feel human, plus free web apps for L&D teams.',
  ogTitle: 'Entertrainer — Instructional Design by Naveen Jose',
  ogDescription: 'Learning experiences that feel human, plus free web apps for L&D teams.',
  ogUrl: 'https://entertrainer.in/'
})

const contentStore    = useContentStore()
const homeViewStore   = useHomeViewStore()
const experienceStore = useExperienceStore()
const router          = useRouter()

const items   = computed(() => contentStore.homeNav)
const entered = ref(experienceStore.hasEntered)
const showLoader = computed(() => !experienceStore.hasEntered && !entered.value)

// Keep the menu's home/back logic correct.
homeViewStore.setIsHome(true)

function onReady()   { experienceStore.setReady() }
function onEntered() { entered.value = true }
function onCard(href: string) { router.push(href) }

onMounted(() => { if (experienceStore.hasEntered) entered.value = true })
</script>

<template>
  <div class="home">
    <Transition name="loader-fade">
      <UiLoader v-if="showLoader" @entered="onEntered" />
    </Transition>
    <HomeGallery :items="items" @ready="onReady" @card-click="onCard" />
  </div>
</template>

<style scoped>
.home { position: fixed; inset: 0; background: var(--color-bg); }
.loader-fade-leave-active { transition: opacity 0.5s ease; }
.loader-fade-leave-to { opacity: 0; }
</style>
