<template>
  <div class="dialogue-shell app" data-dialogue-layout>
    <slot />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Dialogue',
  meta: [
    { name: 'theme-color', content: '#0D0C0A' },
    { name: 'description', content: 'Comics from your pocket.' },
  ],
  link: [
    { rel: 'manifest', href: '/dialogue/manifest.webmanifest' },
    { rel: 'apple-touch-icon', href: '/dialogue/icons/apple-touch-icon.png' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Anton&family=Bangers&family=Comic+Neue:wght@400;700&family=Inter:wght@400;600;700&family=Kosugi+Maru&family=Shippori+Mincho:wght@500;700&display=swap',
    },
  ],
})
</script>

<style>
@import '@/assets/css/dialogue.css';
</style>
