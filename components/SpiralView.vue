<script setup lang="ts">
import gsap from 'gsap'
import { useExperienceStore } from '~/stores/experience'
import { useHomeViewStore } from '~/stores/homeview'
import Experience from '~/experience/Experience'
import type { NavItem } from '~/types/nav'

const props = defineProps<{
  items: NavItem[]
  showLoader?: boolean
  backHref?: string
  title?: string
  showViewSwitch?: boolean
}>()

const router          = useRouter()
const experienceStore = useExperienceStore()
const homeViewStore   = useHomeViewStore()
const canvasRef       = ref<HTMLCanvasElement | null>(null)
const listRef         = ref<HTMLElement | null>(null)
const isLoaderDone    = ref(!props.showLoader)
const hasEntered      = computed(() => props.showLoader ? experienceStore.hasEntered : true)
const isListMode      = computed(() => props.showViewSwitch && homeViewStore.mode === 'list')
const { $lenis }      = useNuxtApp()

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

function destroyExperience() {
  experience?.destroy()
  experience = null
}

onMounted(() => {
  ;($lenis as any)?.stop()

  if (props.showLoader) {
    // If user already entered in this session, skip loader and mount directly
    if (experienceStore.hasEntered) {
      isLoaderDone.value = true
      mountExperience()
      return
    }

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

// When switching to list mode, destroy Three.js to free GPU resources.
// When switching back, recreate it.
watch(isListMode, async (listMode) => {
  if (listMode) {
    destroyExperience()
    await nextTick()
    animateListIn()
  } else {
    await nextTick()
    mountExperience()
  }
})

function animateListIn() {
  const rows = listRef.value?.querySelectorAll('.nav-row')
  if (!rows?.length) return
  gsap.fromTo(
    rows,
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.07, delay: 0.1 }
  )
}

onUnmounted(() => {
  destroyExperience()
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

    <!-- WebGL canvas (hidden in list mode) -->
    <canvas
      ref="canvasRef"
      class="spiral-canvas"
      :class="{ hidden: !hasEntered || isListMode }"
    />

    <!-- List mode nav -->
    <Transition name="fade">
      <div v-if="hasEntered && isListMode" ref="listRef" class="spiral-list">
        <NuxtLink
          v-for="item in items"
          :key="item.id"
          :to="item.href"
          class="nav-row"
        >
          <span class="nav-row__label">{{ item.label }}</span>
          <span class="nav-row__desc">{{ item.description }}</span>
          <span class="nav-row__arrow">→</span>
        </NuxtLink>
      </div>
    </Transition>

    <!-- UI chrome (only after entered) -->
    <Transition name="fade">
      <div v-if="hasEntered" class="spiral-ui">
        <!-- Back button (sub-spiral pages) -->
        <NuxtLink v-if="backHref" :to="backHref" class="spiral-back">← back</NuxtLink>

        <!-- Page title (sub-spirals) -->
        <p v-if="title" class="spiral-title">{{ title }}</p>

        <!-- View switch (home only) -->
        <div v-if="showViewSwitch" class="spiral-switch">
          <UiViewSwitch />
        </div>

        <!-- Bottom hint (spiral mode only) -->
        <p v-if="!isListMode" class="spiral-hint">scroll to spin · tap to explore</p>
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

/* List mode */
.spiral-list {
  position: fixed;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: calc(80rem + var(--safe-top)) calc(var(--grid-margin) + 80rem) calc(60rem + var(--safe-bottom));
  overflow-y: auto;
}
.nav-row {
  display: flex;
  align-items: center;
  gap: 24rem;
  padding: 28rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  text-decoration: none;
  color: var(--color-white);
  transition: padding-left 0.3s var(--ease-spring);
}
.nav-row:first-child {
  border-top: 1px solid rgba(255,255,255,0.1);
}
.nav-row:hover {
  padding-left: 16rem;
}
.nav-row__label {
  font-size: 40rem;
  font-weight: 600;
  letter-spacing: -0.04em;
  flex: 0 0 auto;
  min-width: 220rem;
}
.nav-row__desc {
  font-size: 14rem;
  opacity: 0.4;
  flex: 1;
}
.nav-row__arrow {
  font-size: 20rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.nav-row:hover .nav-row__arrow { opacity: 1; }

@media (max-width: 600px) {
  .spiral-list {
    padding: calc(80rem + var(--safe-top)) 24rem calc(60rem + var(--safe-bottom));
  }
  .nav-row {
    flex-wrap: wrap;
    gap: 8rem;
    padding: 22rem 0;
  }
  .nav-row__label {
    font-size: 28rem;
    min-width: unset;
    flex: 1;
  }
  .nav-row__desc { display: none; }
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
