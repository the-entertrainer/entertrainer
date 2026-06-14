<script setup lang="ts">
const route = useRoute()
const transition = computed(() =>
  route.path === '/' ? false : { name: 'fade', mode: 'out-in' as const }
)
</script>

<template>
  <div id="app-root">
    <NuxtPage :transition="transition" />
    <UiLogo />
    <UiMenu />
    <UiSoundButton />
  </div>
</template>

<style>
#app-root { min-height: 100dvh; background: var(--color-black); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.35s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }
</style>
