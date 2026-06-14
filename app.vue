<script setup lang="ts">
// Global chrome that persists across route changes: Logo, Menu, SoundButton.
// Page transitions are driven manually via :transition on NuxtPage.
const route = useRoute()

const transition = computed(() => {
  // Project pages use the "project" slide-up transition; everything else fades.
  if (route.path.startsWith('/projects/')) {
    return { name: 'project', mode: 'out-in' as const }
  }
  return { name: 'fade', mode: 'out-in' as const }
})
</script>

<template>
  <div id="app-root">
    <NuxtPage :transition="transition" />

    <!-- Global UI — persists between routes -->
    <UiLogo />
    <UiMenu />
    <UiSoundButton />
  </div>
</template>

<style>
#app-root {
  min-height: 100dvh;
  background: var(--color-black);
}
</style>
