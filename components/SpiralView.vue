<script setup lang="ts">
import gsap from 'gsap'
import { useExperienceStore } from '~/stores/experience'
import { useHomeViewStore } from '~/stores/homeview'
import { useThemeStore } from '~/stores/theme'
import Experience from '~/experience/Experience'
import SoundEngine from '~/experience/SoundEngine'
import type { NavItem } from '~/types/nav'

const props = defineProps<{
  items: NavItem[]
  showLoader?: boolean
  title?: string
  showViewSwitch?: boolean
}>()

const emit = defineEmits<{
  cardClick: [href: string]
}>()

const experienceStore = useExperienceStore()
const homeViewStore   = useHomeViewStore()
const themeStore      = useThemeStore()
const canvasRef       = ref<HTMLCanvasElement | null>(null)
const listRef         = ref<HTMLElement | null>(null)
const isLoaderDone    = ref(!props.showLoader || experienceStore.hasEntered)
const hasEntered      = computed(() => props.showLoader ? experienceStore.hasEntered : true)
const isListMode      = computed(() => props.showViewSwitch && homeViewStore.mode === 'list')
const { $lenis }      = useNuxtApp()

const FOG_DARK  = 0x0D0C0A
const FOG_LIGHT = 0xF4F1EC

let experience: Experience | null = null
let transitioning = false

async function mountExperience() {
  await nextTick()
  // Guard against a double mount: on a return visit onMounted calls this
  // directly, and we never want the hasEntered watcher to spin up a second
  // Experience over the top of a live one.
  if (!canvasRef.value || experience) return
  experience = new Experience(canvasRef.value)
  experience.world.setNavItems(props.items, themeStore.isDark)
  experience.setFogColor(themeStore.isDark ? FOG_DARK : FOG_LIGHT)
  // Capture reference so the timeout is safe even if component unmounts before it fires
  const exp = experience
  setTimeout(() => exp.world.reveal(), 150)

  experience.on('planeClick', (href: string) => {
    emit('cardClick', href)
  })

  // Whenever the spiral is actually on screen, guarantee the global view-switch
  // is shown. The loader normally sets this at the end of its enter animation,
  // but on return visits (loader skipped) we rely on this so the toggle never
  // gets stuck invisible. setHasEntered is idempotent.
  if (!experienceStore.hasEntered) experienceStore.setHasEntered()
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
      SoundEngine.init()
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
    SoundEngine.init()
  }
})

// Accordion: when items prop changes, transition to new items in-place
watch(() => props.items, async (newItems) => {
  if (isListMode.value) { await nextTick(); animateListIn(); return }
  if (!experience || !newItems.length || transitioning) return
  transitioning = true
  await experience.world.transitionTo(newItems)
  transitioning = false
}, { deep: false })

// Sync theme (fog + card textures) when theme changes
watch(() => themeStore.isDark, (isDark) => {
  experience?.setTheme(isDark)
})

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

    <!-- List mode — emit cardClick so the parent applies accordion vs router logic -->
    <Transition name="fade">
      <div v-if="hasEntered && isListMode" ref="listRef" class="spiral-list">
        <button
          v-for="item in items"
          :key="item.id"
          class="nav-row"
          @click="emit('cardClick', item.href)"
        >
          <span class="nav-row__label">{{ item.label }}</span>
          <span class="nav-row__desc">{{ item.description }}</span>
          <span class="nav-row__arrow">→</span>
        </button>
      </div>
    </Transition>

    <!-- UI chrome -->
    <Transition name="fade">
      <div v-if="hasEntered" class="spiral-ui">
        <!-- Section title -->
        <p v-if="title" class="spiral-title">{{ title }}</p>

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
  background: var(--color-bg);
}
.spiral-canvas {
  position: fixed;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  touch-action: none;
  background: var(--color-bg);
  transition: opacity 0.5s ease;
}
.spiral-canvas.hidden {
  opacity: 0;
  pointer-events: none;
}

/* List mode — matches the E-menu panel: white pill background, black foreground */
.spiral-list {
  position: fixed;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: calc(80rem + var(--safe-top)) calc(var(--grid-margin) + 80rem) calc(60rem + var(--safe-bottom));
  overflow-y: auto;
  background: var(--color-white);
  color: var(--color-black);
}
/* Inside the white panel, keyboard focus ring uses the panel foreground */
.spiral-list :focus-visible { outline-color: var(--color-black); }
.nav-row {
  display: flex;
  align-items: center;
  gap: 24rem;
  padding: 28rem 0;
  border: none;
  border-bottom: 1px solid color-mix(in srgb, var(--color-black) 12%, transparent);
  border-radius: 0;
  background: none;
  text-align: left;
  text-decoration: none;
  color: var(--color-black);
  width: 100%;
  cursor: pointer;
  font-family: var(--main-font);
  transition: padding-left 0.3s var(--ease-spring);
}
.nav-row:first-child { border-top: 1px solid color-mix(in srgb, var(--color-black) 12%, transparent); }
.nav-row:hover { padding-left: 16rem; }
.nav-row__label {
  font-size: 40rem;
  font-weight: 600;
  letter-spacing: -0.04em;
  flex: 0 0 auto;
  min-width: 220rem;
}
.nav-row__desc {
  font-size: var(--text-sm);
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

.spiral-title {
  position: absolute;
  bottom: calc(52rem + var(--safe-bottom));
  left: 50%;
  transform: translateX(-50%);
  font-size: 13rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.3;
  white-space: nowrap;
}
.spiral-hint {
  position: absolute;
  bottom: calc(36rem + var(--safe-bottom));
  left: 50%;
  transform: translateX(-50%);
  font-size: 13rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: var(--color-text);
  opacity: 0.2;
  white-space: nowrap;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.35s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
.loader-fade-leave-active               { transition: opacity 0.5s ease; }
.loader-fade-leave-to                   { opacity: 0; }
</style>
