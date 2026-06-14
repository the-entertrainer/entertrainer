<script setup lang="ts">
import { useExperienceStore } from '~/stores/experience'
import Experience from '~/experience/Experience'
import type { NavItem } from '~/types/nav'

const props = defineProps<{
  items: NavItem[]
  showLoader?: boolean
  backHref?: string
  title?: string
}>()

const router         = useRouter()
const experienceStore = useExperienceStore()
const canvasRef      = ref<HTMLCanvasElement | null>(null)
const isLoaderDone   = ref(!props.showLoader)
const hasEntered     = computed(() => props.showLoader ? experienceStore.hasEntered : true)
const { $lenis }     = useNuxtApp()

let experience: Experience | null = null

function mountExperience() {
  if (!canvasRef.value) return
  experience = new Experience(canvasRef.value)
  experience.world.setNavItems(props.items)
  setTimeout(() => experience!.world.reveal(), 200)

  experience.on('planeClick', (href: string) => {
    experience!.world.hide()
    setTimeout(() => router.push(href), 150)
  })
}

onMounted(() => {
  ;($lenis as any)?.stop()

  if (props.showLoader) {
    // Simulate resource loading — drives the progress bar in UiLoader
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
  } else {
    mountExperience()
  }
})

watch(hasEntered, async (entered) => {
  if (entered && props.showLoader) {
    await nextTick()
    mountExperience()
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
  <div class="spiral-view">
    <!-- Loader (home only) -->
    <Transition name="loader-fade">
      <UiLoader v-if="showLoader && !isLoaderDone" @entered="onLoaderEntered" />
    </Transition>

    <!-- WebGL canvas -->
    <canvas
      ref="canvasRef"
      class="spiral-canvas"
      :class="{ hidden: !hasEntered }"
    />

    <!-- UI chrome (only after entered) -->
    <Transition name="fade">
      <div v-if="hasEntered" class="spiral-ui">
        <!-- Back button (sub-spiral pages) -->
        <NuxtLink v-if="backHref" :to="backHref" class="spiral-back">← back</NuxtLink>

        <!-- Page title (sub-spirals) -->
        <p v-if="title" class="spiral-title">{{ title }}</p>

        <!-- View switch -->
        <div class="spiral-switch">
          <UiViewSwitch />
        </div>

        <!-- Bottom hint -->
        <p class="spiral-hint">scroll to spin · tap to explore</p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.spiral-view {
  position: relative;
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  background: var(--color-black);
}
.spiral-canvas {
  position: fixed;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  touch-action: none;
  transition: opacity 0.5s ease;
}
.spiral-canvas.hidden {
  opacity: 0;
  pointer-events: none;
}
.spiral-ui {
  position: fixed;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}
.spiral-back {
  position: absolute;
  top: calc(24rem + var(--safe-top));
  left: calc(var(--grid-margin) + 80rem);
  font-size: 16rem;
  font-weight: 500;
  color: var(--color-white);
  opacity: 0.5;
  text-decoration: none;
  pointer-events: all;
  transition: opacity 0.2s ease;
}
.spiral-back:hover { opacity: 1; }
.spiral-title {
  position: absolute;
  bottom: calc(52rem + var(--safe-bottom));
  left: 50%;
  transform: translateX(-50%);
  font-size: 13rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-white);
  opacity: 0.3;
  white-space: nowrap;
}
.spiral-switch {
  position: absolute;
  top: calc(28rem + var(--safe-top));
  left: 50%;
  transform: translateX(-50%);
  pointer-events: all;
}
.spiral-hint {
  position: absolute;
  bottom: calc(28rem + var(--safe-bottom));
  left: 50%;
  transform: translateX(-50%);
  font-size: 13rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: var(--color-white);
  opacity: 0.2;
  white-space: nowrap;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.35s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
.loader-fade-leave-active               { transition: opacity 0.5s ease; }
.loader-fade-leave-to                   { opacity: 0; }
</style>
