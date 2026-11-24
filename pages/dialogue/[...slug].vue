<template>
  <!-- Catch-all: mount standalone PWA for any unmatched /dialogue/* deep link -->
  <div class="iframe-fallback">
    <iframe title="Dialogue" :src="src" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
const route = useRoute()
const src = computed(() => {
  const slug = Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug
  return `/dialogue/index.html#/${slug || ''}`
})
</script>

<style scoped>
.iframe-fallback, iframe { border: 0; width: 100%; height: 100dvh; display: block; }
</style>
