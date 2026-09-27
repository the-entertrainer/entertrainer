<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({
  title: 'Fever Dream · Entertrainer',
  description: 'A 3D kitchen defence game. Squash brown roaches, build turrets, and protect one deeply unqualified banana.',
  ogUrl: 'https://entertrainer.in/engage/fever'
})
</script>
<template>
  <iframe class="fever-game" src="/fever/index.html" title="Fever Dream — 3D kitchen defence" allow="fullscreen; autoplay" allowfullscreen />
</template>
<style scoped>
.fever-game { position: fixed; inset: 0; z-index: 20; display: block; width: 100%; height: 100dvh; border: 0; background: #191b20; }
</style>
