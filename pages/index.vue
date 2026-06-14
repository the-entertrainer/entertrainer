<script setup lang="ts">
import { useExperienceStore } from '~/stores/experience'
import { useHomeViewStore } from '~/stores/homeview'
import { useContentStore } from '~/stores/content'
import Experience from '~/experience/Experience'

const { $lenis } = useNuxtApp()

const experienceStore = useExperienceStore()
const homeViewStore = useHomeViewStore()
const contentStore = useContentStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const hasEntered = computed(() => experienceStore.hasEntered)
const mode = computed(() => homeViewStore.mode)
const isLoaderDone = ref(false)

let experience: Experience | null = null

onMounted(() => {
  // Disable Lenis on the home page — Three.js controls handle all scrolling
  ;($lenis as any)?.stop()

  // Simulate resource loading progress
  let p = 0
  const interval = setInterval(() => {
    p = Math.min(p + Math.random() * 8 + 2, 99)
    experienceStore.setProgress(p)
    if (p >= 99) {
      clearInterval(interval)
      setTimeout(() => {
        experienceStore.setProgress(100)
        experienceStore.setReady()
      }, 300)
    }
  }, 80)
})

watch(hasEntered, async (entered) => {
  if (!entered) return
  await nextTick()

  if (!canvasRef.value) return

  experience = new Experience(canvasRef.value)
  experienceStore.setExperience(experience)
  experience.world.setProjects(contentStore.projects)

  // Staggered reveal
  setTimeout(() => {
    experience!.world.revealProjects()
  }, 200)
})

watch(mode, (newMode) => {
  if (!experience) return
  if (newMode === 'list') {
    experience.world.hideProjects()
  } else {
    experience.world.revealProjects()
  }
})

onUnmounted(() => {
  experience?.destroy()
  ;($lenis as any)?.start()
})

function onLoaderEntered() {
  isLoaderDone.value = true
}
</script>

<template>
  <div class="home">
    <!-- Loader overlay -->
    <Transition name="loader-fade">
      <UiLoader v-if="!isLoaderDone" @entered="onLoaderEntered" />
    </Transition>

    <!-- Three.js canvas -->
    <canvas ref="canvasRef" class="webgl-canvas" :class="{ hidden: mode === 'list' || !hasEntered }" />

    <!-- UI overlay — only after enter -->
    <Transition name="fade">
      <div v-if="hasEntered" class="ui-overlay">
        <!-- View switch (spiral / list) — Logo & Menu are global in app.vue -->
        <div class="view-switch-wrap">
          <UiViewSwitch />
        </div>

        <!-- Project list view -->
        <Transition name="list-fade">
          <div v-if="mode === 'list'" class="list-view">
            <UiProjectList :projects="contentStore.projects" />
          </div>
        </Transition>

        <!-- Showreel thumbnail -->
        <UiShowreelThumbnail v-if="mode === 'spiral'" />

        <!-- Bottom bar -->
        <footer class="bottom-bar">
          <span class="bottom-bar__copy">© 2025</span>
          <span class="bottom-bar__count">{{ contentStore.projects.length }} projects</span>
        </footer>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.home {
  position: relative;
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  background: var(--color-black);
}
.webgl-canvas {
  position: fixed;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  transition: opacity 0.5s ease;
  touch-action: none;
}
.webgl-canvas.hidden {
  opacity: 0;
  pointer-events: none;
}
.ui-overlay {
  position: fixed;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}
.view-switch-wrap {
  position: absolute;
  top: calc(30rem + var(--safe-top));
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  pointer-events: all;
}
.list-view {
  position: absolute;
  top: 80rem;
  left: var(--grid-margin);
  right: var(--grid-margin);
  bottom: 60rem;
  overflow-y: auto;
  pointer-events: all;
  padding-top: 40rem;
}
.bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rem 30rem calc(20rem + var(--safe-bottom));
  pointer-events: none;
}
.bottom-bar__copy,
.bottom-bar__count {
  font-size: 14rem;
  color: var(--color-white);
  opacity: 0.4;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.35s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.loader-fade-leave-active { transition: opacity 0.5s ease; }
.loader-fade-leave-to { opacity: 0; }

.list-fade-enter-active, .list-fade-leave-active { transition: opacity 0.3s ease; }
.list-fade-enter-from, .list-fade-leave-to { opacity: 0; }
</style>
