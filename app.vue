<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'
import { useExperienceStore } from '~/stores/experience'

const route           = useRoute()
const themeStore      = useThemeStore()
const experienceStore = useExperienceStore()

const transition = computed(() =>
  route.path === '/' ? false : { name: 'fade', mode: 'out-in' as const }
)

const showViewSwitch = computed(() =>
  route.path === '/' && experienceStore.hasEntered
)

onMounted(() => {
  themeStore.init()
})
</script>

<template>
  <div id="app-root">
    <NuxtPage :transition="transition" />
    <UiMenu />
    <Transition name="fade">
      <UiViewSwitch v-if="showViewSwitch" class="global-view-switch" />
    </Transition>
  </div>
</template>

<style>
#app-root { min-height: 100dvh; background: var(--color-bg); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.35s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }

.global-view-switch {
  position: fixed;
  top: calc(22rem + var(--safe-top));
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  display: flex;
  align-items: center;
  height: 44rem;
}
</style>
