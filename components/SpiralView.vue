<script setup lang="ts">
import gsap from 'gsap'
import { useExperienceStore } from '~/stores/experience'
import { useHomeViewStore } from '~/stores/homeview'
import Experience from '~/experience/Experience'
import type { NavItem } from '~/types/nav'

const props = defineProps<{
  items: NavItem[]
  showLoader?: boolean
  showBack?: boolean
  title?: string
  showViewSwitch?: boolean
}>()

const emit = defineEmits<{
  cardClick: [href: string]
  back: []
}>()

const experienceStore = useExperienceStore()
const homeViewStore   = useHomeViewStore()
const canvasRef       = ref<HTMLCanvasElement | null>(null)
const listRef         = ref<HTMLElement | null>(null)
const isLoaderDone    = ref(!props.showLoader)
const hasEntered      = computed(() => props.showLoader ? experienceStore.hasEntered : true)
const isListMode      = computed(() => props.showViewSwitch && homeViewStore.mode === 'list')
const { $lenis }      = useNuxtApp()

let experience: Experience | null = null
let transitioning = false

function mountExperience() {
  if (!canvasRef.value) return
  experience = new Experience(canvasRef.value)
  experience.world.setNavItems(props.items)
  setTimeout(() => experience!.world.reveal(), 200)

  experience.on('planeClick', (href: string) => {
    emit('cardClick', href)
  })
}

function destroyExperience() {
  experience?.destroy()
  experience = null
}

onMounted(() => {
  ;($lenis as any)?.stop()

  if (props.showLoader) {
    // If user already entered this session, skip loader
    if (experienceStore.hasEntered) {
      isLoaderDone.value = true
      mountExperience()
      return
    }

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

// Accordion: when items prop changes, transition to new items in-place
watch(() => props.items, async (newItems) => {
  if (!experience || !newItems.length || transitioning || isListMode.value) return
  transitioning = true
  await experience.world.transitionTo(newItems)
  transitioning = false
}, { deep: false })

// List mode toggle — destroy/recreate Three.js
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

    <!-- WebGL canvas -->
    <canvas
      ref="canvasRef"
      class="spiral-canvas"
      :class="{ hidden: !hasEntered || isListMode }"
    />

    <!-- List mode -->
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

    <!-- UI chrome -->
    <Transition name="fade">
      <div v-if="hasEntered" class="spiral-ui">
        <!-- Back button (accordion sub-sections) -->
        <button v-if="showBack" class="spiral-back" @click="emit('back')">← back</button>

        <!-- Section title -->
        <p v-if="title" class="spiral-title">{{ title }}</p>

        <!-- View switch (home only) -->
        <div v-if="showViewSwitch" class="spiral-switch">
          <UiViewSwitch />
        </div>

        <!-- Hint -->
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
.nav-row:first-child { border-top: 1px solid rgba(255,255,255,0.1); }
.nav-row:hover { padding-left: 16rem; }
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
  .nav-row { flex-wrap: wrap; gap: 8rem; padding: 22rem 0; }
  .nav-row__label { font-size: 28rem; min-width: unset; flex: 1; }
  .nav-row__desc  { display: none; }
}

.spiral-ui {
  position: fixed;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}

/* Back button — sits below the logo */
.spiral-back {
  position: absolute;
  top: calc(110rem + var(--safe-top));
  left: calc(30rem + var(--safe-left));
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: var(--main-font);
  font-size: 14rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--color-white);
  opacity: 0.5;
  pointer-events: all;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6rem;
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
  top: calc(44rem + var(--safe-top));
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
